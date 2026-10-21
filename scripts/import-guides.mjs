#!/usr/bin/env node
/**
 * 把 content/guides/<slug>.md 编译成 data/guides.json。
 *
 * 约定见 content/README.md 与 docs/任务书.md §4.2：
 * - slug 取文件名（去掉 .md）
 * - 用 yaml 解析 frontmatter，用 zod 校验字段
 * - 四类错误一次列全，退出码 1，且不写半成品（先写临时文件再原子替换）
 * - 成功时按 updatedAt 倒序、同一天按 slug 升序输出，可重复执行
 *
 * 字段长度按内容契约：title 10–40 字、summary 40–80 字、sourceUrls ≥3 条且必须是合法 URL；
 * 字数按「去掉空白后的字符数」计（中文一个字算一个，英文一个字母算一个）。
 */
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { parse as parseYaml } from 'yaml'
import { z } from 'zod'

const ROOT = process.cwd()
const CONTENT_DIR = path.join(ROOT, 'content', 'guides')
const PRODUCTS_DIR = path.join(ROOT, 'data', 'products')
const PUBLIC_DIR = path.join(ROOT, 'public')
const OUTPUT_FILE = path.join(ROOT, 'data', 'guides.json')

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/
const TITLE_MIN = 10
const TITLE_MAX = 40
const SUMMARY_MIN = 40
const SUMMARY_MAX = 80
const MIN_SOURCE_URLS = 3

/** 去空白后的字符数：中文一个字计 1，英文一个字母计 1 */
export function charCount(text) {
  return [...String(text).replace(/\s+/g, '')].length
}

const frontmatterSchema = z.object({
  title: z.string({ error: '缺失或类型不对，应为 string' }).trim().min(1, '不能为空'),
  tool: z.string({ error: '缺失或类型不对，应为 string' }).trim().min(1, '不能为空'),
  summary: z.string({ error: '缺失或类型不对，应为 string' }).trim().min(1, '不能为空'),
  updatedAt: z
    .string({ error: '缺失或类型不对，应为 string' })
    .superRefine((value, ctx) => {
      if (!DATE_PATTERN.test(value)) {
        ctx.addIssue({ code: 'custom', message: `必须是 YYYY-MM-DD，收到：${value}` })
      } else if (!isRealDate(value)) {
        ctx.addIssue({ code: 'custom', message: `${value} 不是有效日期（YYYY-MM-DD）` })
      }
    }),
  screenshots: z
    .array(z.string({ error: '数组元素必须是 string' }), {
      error: '缺失或类型不对，应为 string[]',
    })
    .optional(),
  sourceUrls: z
    .array(z.string({ error: '数组元素必须是 string' }), {
      error: '缺失或类型不对，应为 string[]',
    })
    .min(MIN_SOURCE_URLS, `至少给 ${MIN_SOURCE_URLS} 条`),
})

export function listMarkdownFiles(dir = CONTENT_DIR) {
  if (!fs.existsSync(dir)) return []
  return fs
    .readdirSync(dir)
    .filter((file) => file.toLowerCase().endsWith('.md'))
    .sort()
}

/**
 * 找出仅大小写不同的重复 slug。
 * 单独抽出来是为了能在 Windows（文件名不区分大小写）上做函数级测试。
 */
export function findDuplicateSlugs(files) {
  const seen = new Map()
  const duplicates = []
  for (const file of files) {
    const lower = file.replace(/\.md$/i, '').toLowerCase()
    if (seen.has(lower)) {
      duplicates.push({ file, duplicateOf: seen.get(lower) })
    } else {
      seen.set(lower, file)
    }
  }
  return duplicates
}

/**
 * 拆分 frontmatter：开始和结束都必须是独占一行的 ---。
 * 处理 BOM 与 CRLF；不闭合、正文里出现孤立的 --- 都不会被误判成结束标记。
 */
export function splitFrontmatter(raw) {
  const text = String(raw)
    .replace(/^\uFEFF/, '')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
  const lines = text.split('\n')
  if (lines[0].trimEnd() !== '---') {
    return { error: '第一行必须是独占一行的 ---（frontmatter 开始）' }
  }
  let end = -1
  for (let i = 1; i < lines.length; i += 1) {
    if (lines[i].trimEnd() === '---') {
      end = i
      break
    }
  }
  if (end === -1) {
    return { error: 'frontmatter 没有独占一行的结束标记 ---' }
  }
  return {
    head: lines.slice(1, end).join('\n'),
    body: lines.slice(end + 1).join('\n').replace(/^\n+/, ''),
  }
}

export function isRealDate(value) {
  if (!DATE_PATTERN.test(value)) return false
  const date = new Date(value + 'T00:00:00Z')
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
}

export function isHttpUrl(value) {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:'
  } catch {
    return false
  }
}

/**
 * 截图路径必须是 public/ 目录内的真实文件。
 *
 * 分两层校验（对应独立验收 R4）：
 * 1. 词法层：`..`、反斜杠穿越、同前缀目录、绝对路径都先拒掉；
 * 2. 真实路径层：对 public 根和目标文件各取 realpath，再比较边界。
 *    这样 `public/link -> 外部目录` 这种 junction / 符号链接不会因为
 *    stat 跟随链接而被误判为 public 内的文件。
 */
export function resolvePublicFile(pathname, publicDir = PUBLIC_DIR) {
  if (typeof pathname !== 'string' || pathname.length === 0) {
    return { error: '必须是非空字符串' }
  }
  if (pathname.includes('\0')) {
    return { error: '路径里不能有 NUL 字符' }
  }
  if (!pathname.startsWith('/')) {
    return { error: '必须以 / 开头（相对 public/）' }
  }
  const absolute = path.resolve(publicDir, '.' + pathname)
  const relative = path.relative(publicDir, absolute)
  if (relative === '' || relative.startsWith('..') || path.isAbsolute(relative)) {
    return { error: '路径越过了 public/ 目录边界' }
  }

  let realRoot
  try {
    realRoot = fs.realpathSync.native(publicDir)
  } catch {
    return { error: 'public 目录不可用：' + publicDir }
  }

  let realTarget
  try {
    realTarget = fs.realpathSync.native(absolute)
  } catch {
    return { error: 'public' + pathname + ' 不存在', absolute }
  }

  const realRelative = path.relative(realRoot, realTarget)
  if (realRelative === '' || realRelative.startsWith('..') || path.isAbsolute(realRelative)) {
    return { error: '路径的真实位置越过了 public/ 目录边界（可能是链接）' }
  }

  let stat
  try {
    stat = fs.statSync(realTarget)
  } catch {
    return { error: 'public' + pathname + ' 不存在', absolute }
  }
  if (!stat.isFile()) {
    return { error: 'public' + pathname + ' 不是文件', absolute }
  }
  return { absolute, realPath: realTarget }
}

export function collectProducts(dir = PRODUCTS_DIR) {
  if (!fs.existsSync(dir)) return new Set()
  return new Set(
    fs
      .readdirSync(dir)
      .filter((file) => /\.ya?ml$/.test(file))
      .map((file) => file.replace(/\.ya?ml$/, '')),
  )
}

function sortGuides(guides) {
  return guides.sort((a, b) => {
    if (a.updatedAt !== b.updatedAt) return a.updatedAt < b.updatedAt ? 1 : -1
    return a.slug < b.slug ? -1 : a.slug > b.slug ? 1 : 0
  })
}

/** 先写临时文件再重命名，避免中途失败留下半成品 */
function writeAtomic(file, content) {
  const tmp = file + '.tmp'
  try {
    fs.writeFileSync(tmp, content, 'utf8')
    fs.renameSync(tmp, file)
  } finally {
    if (fs.existsSync(tmp)) fs.rmSync(tmp, { force: true })
  }
}

export function main({ contentDir = CONTENT_DIR, outputFile = OUTPUT_FILE } = {}) {
  const files = listMarkdownFiles(contentDir)
  const products = collectProducts()
  const duplicates = findDuplicateSlugs(files)
  const duplicateFiles = new Set(duplicates.map((item) => item.file))
  const errors = []
  const guides = []

  for (const duplicate of duplicates) {
    errors.push(
      `content/guides/${duplicate.file}:slug: 与 content/guides/${duplicate.duplicateOf} 重复（文件名忽略大小写）`,
    )
  }

  for (const file of files) {
    const relative = 'content/guides/' + file
    const slug = file.replace(/\.md$/i, '')
    const raw = fs.readFileSync(path.join(contentDir, file), 'utf8')
    const split = splitFrontmatter(raw)
    if (split.error) {
      errors.push(relative + ':frontmatter: ' + split.error)
      continue
    }

    let frontmatter
    try {
      frontmatter = parseYaml(split.head)
    } catch (error) {
      errors.push(relative + ':frontmatter: YAML 解析失败：' + error.message)
      continue
    }
    if (frontmatter === null || typeof frontmatter !== 'object' || Array.isArray(frontmatter)) {
      errors.push(relative + ':frontmatter: 必须是一组 key: value')
      continue
    }

    const parsed = frontmatterSchema.safeParse(frontmatter)
    const fileErrors = []

    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        fileErrors.push(
          relative + ':' + (issue.path.join('.') || 'frontmatter') + ': ' + issue.message,
        )
      }
    }

    const data = parsed.success ? parsed.data : null
    // zod 已经报过的字段不再重复报，其余字段继续做业务校验，把错误一次列全
    const failedFields = new Set(
      parsed.success ? [] : parsed.error.issues.map((issue) => String(issue.path[0] ?? '')),
    )
    const title = data?.title ?? frontmatter.title
    const summary = data?.summary ?? frontmatter.summary
    const tool = data?.tool ?? frontmatter.tool
    const updatedAt = data?.updatedAt ?? frontmatter.updatedAt
    const sourceUrls = Array.isArray(frontmatter.sourceUrls) ? frontmatter.sourceUrls : []
    const screenshots = Array.isArray(frontmatter.screenshots)
      ? frontmatter.screenshots.filter((item) => typeof item === 'string')
      : []

    if (!failedFields.has('title') && typeof title === 'string') {
      const length = charCount(title)
      if (length < TITLE_MIN || length > TITLE_MAX) {
        fileErrors.push(
          `${relative}:title: 长度 ${length} 字，要求 ${TITLE_MIN}–${TITLE_MAX} 字（不含空白）`,
        )
      }
    }

    if (!failedFields.has('summary') && typeof summary === 'string') {
      const length = charCount(summary)
      if (length < SUMMARY_MIN || length > SUMMARY_MAX) {
        fileErrors.push(
          `${relative}:summary: 长度 ${length} 字，要求 ${SUMMARY_MIN}–${SUMMARY_MAX} 字（不含空白）`,
        )
      }
    }

    if (!failedFields.has('tool') && typeof tool === 'string' && !products.has(tool)) {
      fileErrors.push(relative + ':tool: data/products/ 里没有 ' + tool)
    }

    if (
      !failedFields.has('updatedAt') &&
      typeof updatedAt === 'string' &&
      !isRealDate(updatedAt)
    ) {
      fileErrors.push(relative + ':updatedAt: ' + updatedAt + ' 不是有效日期（YYYY-MM-DD）')
    }

    if (!failedFields.has('sourceUrls')) {
      sourceUrls.forEach((url, index) => {
        if (typeof url !== 'string' || !isHttpUrl(url)) {
          fileErrors.push(`${relative}:sourceUrls.${index}: 不是合法的 http(s) URL：${String(url)}`)
        }
      })
    }

    if (!failedFields.has('screenshots')) {
      for (const screenshot of screenshots) {
        const result = resolvePublicFile(screenshot)
        if (result.error) fileErrors.push(relative + ':screenshots: ' + result.error)
      }
    }

    if (fileErrors.length > 0 || !data) {
      errors.push(...fileErrors)
      continue
    }

    if (duplicateFiles.has(file)) continue

    guides.push({
      slug,
      title: data.title,
      tool: data.tool,
      summary: data.summary,
      updatedAt: data.updatedAt,
      screenshots,
      sourceUrls: data.sourceUrls,
      body: split.body.endsWith('\n') ? split.body : split.body + '\n',
    })
  }

  if (errors.length > 0) {
    for (const error of errors) console.error(error)
    console.error('\n导入中止：' + errors.length + ' 处错误，data/guides.json 未改动。')
    return { ok: false, errors, files: files.length, guides: guides.length }
  }

  sortGuides(guides)
  fs.mkdirSync(path.dirname(outputFile), { recursive: true })
  writeAtomic(outputFile, JSON.stringify(guides, null, 2) + '\n')
  console.log(
    '读取 ' + files.length + ' 个文件，通过 ' + guides.length + ' 个，写入 ' + guides.length + ' 条。',
  )
  return { ok: true, errors: [], files: files.length, guides: guides.length }
}

const invokedDirectly =
  process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href

if (invokedDirectly) {
  const result = main()
  if (!result.ok) process.exitCode = 1
}
