#!/usr/bin/env node

import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { parse as parseYaml } from 'yaml'
import { z } from 'zod'

const ROOT = process.cwd()
const GUIDES_DIR = path.join(ROOT, 'content', 'guides')
const PRODUCTS_DIR = path.join(ROOT, 'data', 'products')
const PUBLIC_DIR = path.join(ROOT, 'public')
const OUTPUT_FILE = path.join(ROOT, 'data', 'guides.json')

function isCalendarDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return false

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(Date.UTC(year, month - 1, day))

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  )
}

function isUrl(value) {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

function isPublicPath(value) {
  if (!value.startsWith('/') || value.includes('\\')) return false
  return !value.split('/').includes('..')
}

const frontmatterSchema = z.object({
  title: z
    .string()
    .trim()
    .min(10, '长度应为 10–40 字')
    .max(40, '长度应为 10–40 字'),
  tool: z.string().trim().min(1, '不能为空'),
  summary: z
    .string()
    .trim()
    .min(40, '长度应为 40–80 字')
    .max(80, '长度应为 40–80 字'),
  updatedAt: z
    .string()
    .trim()
    .refine(isCalendarDate, '必须是有效的 YYYY-MM-DD 日期'),
  screenshots: z
    .array(
      z
        .string()
        .trim()
        .min(1, '路径不能为空')
        .refine(isPublicPath, '必须以 / 开头，且不能跳出 public/'),
    )
    .default([]),
  sourceUrls: z
    .array(z.string().trim().refine(isUrl, '必须是有效 URL'))
    .min(3, '至少需要 3 条来源'),
})

function splitFrontmatter(source) {
  const normalized = source.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n')
  const match = /^---\n([\s\S]*?)\n---(?:\n|$)/.exec(normalized)
  if (!match) return null

  return {
    yaml: match[1],
    body: normalized.slice(match[0].length).replace(/^\n+/, ''),
  }
}

function formatIssuePath(issuePath) {
  if (issuePath.length === 0) return 'frontmatter'

  return issuePath.reduce((result, part) => {
    if (typeof part === 'number') return `${result}[${part}]`
    return result ? `${result}.${part}` : part
  }, '')
}

async function readProductSlugs() {
  const files = await fs.readdir(PRODUCTS_DIR)
  return new Set(
    files
      .filter((file) => file.endsWith('.yaml') || file.endsWith('.yml'))
      .map((file) => file.replace(/\.(yaml|yml)$/, '')),
  )
}

async function readGuideFiles() {
  try {
    const files = await fs.readdir(GUIDES_DIR)
    return files.filter((file) => file.endsWith('.md')).sort()
  } catch (error) {
    if (error && typeof error === 'object' && error.code === 'ENOENT') return []
    throw error
  }
}

async function main() {
  const errors = []
  const guides = []
  const productSlugs = await readProductSlugs()
  const files = await readGuideFiles()
  const seenSlugs = new Map()

  for (const file of files) {
    const slug = file.replace(/\.md$/, '')
    const slugKey = slug.toLowerCase()
    const previousFile = seenSlugs.get(slugKey)

    if (previousFile) {
      errors.push(`${file}:slug: 与 ${previousFile} 重复（大小写不敏感）`)
    } else {
      seenSlugs.set(slugKey, file)
    }

    let source
    try {
      source = await fs.readFile(path.join(GUIDES_DIR, file), 'utf8')
    } catch (error) {
      errors.push(`${file}:file: 读取失败：${error instanceof Error ? error.message : String(error)}`)
      continue
    }

    const parts = splitFrontmatter(source)
    if (!parts) {
      errors.push(`${file}:frontmatter: 缺少 frontmatter（文件必须以 --- 开头）`)
      continue
    }

    let raw
    try {
      raw = parseYaml(parts.yaml)
    } catch (error) {
      errors.push(`${file}:frontmatter: YAML 解析失败：${error instanceof Error ? error.message : String(error)}`)
      continue
    }

    if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) {
      errors.push(`${file}:frontmatter: 必须是键值对象`)
      continue
    }

    const missingFields = new Set(
      ['title', 'tool', 'summary', 'updatedAt', 'sourceUrls'].filter(
        (field) => !(field in raw),
      ),
    )
    for (const field of missingFields) {
      errors.push(`${file}:${field}: 字段缺失`)
    }

    const parsed = frontmatterSchema.safeParse(raw)
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const field = formatIssuePath(issue.path)
        if (!missingFields.has(field.split('.')[0])) {
          errors.push(`${file}:${field}: ${issue.message}`)
        }
      }
      continue
    }

    const data = parsed.data

    if (data.tool && !productSlugs.has(data.tool)) {
      errors.push(`${file}:tool: data/products/${data.tool}.yaml 不存在`)
    }

    for (const [index, screenshot] of data.screenshots.entries()) {
      if (!isPublicPath(screenshot)) continue

      const relativePath = screenshot.replace(/^\/+/, '')
      const absolutePath = path.resolve(PUBLIC_DIR, relativePath)
      const insidePublic =
        absolutePath === PUBLIC_DIR || absolutePath.startsWith(`${PUBLIC_DIR}${path.sep}`)

      if (!insidePublic) {
        errors.push(`${file}:screenshots[${index}]: 路径必须位于 public/ 下`)
        continue
      }

      try {
        const stat = await fs.stat(absolutePath)
        if (!stat.isFile()) throw new Error('not a file')
      } catch {
        errors.push(`${file}:screenshots[${index}]: 文件不存在：public/${relativePath}`)
      }
    }

    if (!parts.body.trim()) {
      errors.push(`${file}:body: 正文不能为空`)
    }

    guides.push({
      slug,
      title: data.title,
      tool: data.tool,
      summary: data.summary,
      updatedAt: data.updatedAt,
      screenshots: data.screenshots,
      sourceUrls: data.sourceUrls,
      body: parts.body,
    })
  }

  if (errors.length > 0) {
    console.error(errors.join('\n'))
    console.error(`导入失败：${errors.length} 个错误，未写入 data/guides.json`)
    process.exitCode = 1
    return
  }

  guides.sort((a, b) => {
    if (a.updatedAt !== b.updatedAt) return a.updatedAt < b.updatedAt ? 1 : -1
    if (a.slug === b.slug) return 0
    return a.slug < b.slug ? -1 : 1
  })

  const json = `${JSON.stringify(guides, null, 2)}\n`
  const temporaryFile = `${OUTPUT_FILE}.tmp`

  await fs.writeFile(temporaryFile, json, 'utf8')
  try {
    await fs.rename(temporaryFile, OUTPUT_FILE)
  } catch {
    await fs.writeFile(OUTPUT_FILE, json, 'utf8')
    await fs.rm(temporaryFile, { force: true })
  }

  console.log(`读取 ${files.length} 个文件，通过 ${guides.length} 个，写入 ${guides.length} 条`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
})
