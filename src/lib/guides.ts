import fs from 'node:fs'
import path from 'node:path'

/**
 * 教程数据读取层。
 *
 * `data/guides.json` 由导入脚本生成（`pnpm import:guides`，脚本要你自己写，
 * 约定见 content/README.md）。页面只读这一份 JSON，不要直接读 content/guides/ 下的 md。
 *
 * 现在文件里是空数组，所以你跑起来看不到教程——正常。
 */

export type Guide = {
  /** 由文件名决定，例如 content/guides/cursor-guide.md → "cursor-guide" */
  slug: string
  /** 文章标题 */
  title: string
  /** 对应的工具 slug，必须在 data/products 里存在 */
  tool: string
  /** 一句话摘要，40–80 字 */
  summary: string
  /** 内容核对日期，YYYY-MM-DD */
  updatedAt: string
  /** 配图路径，以 public 为根，例如 "/guides/cursor/01-install.png" */
  screenshots: string[]
  /** 正文里每个事实的依据链接 */
  sourceUrls: string[]
  /** Markdown 正文（不含 frontmatter） */
  body: string
}

export type TocItem = {
  id: string
  text: string
  level: 2 | 3
}

const GUIDES_FILE = path.join(process.cwd(), 'data', 'guides.json')

let cache: Guide[] | null = null

export function listGuides(): Guide[] {
  if (cache) return cache
  const raw = fs.readFileSync(GUIDES_FILE, 'utf8')
  const parsed: unknown = JSON.parse(raw)
  if (!Array.isArray(parsed)) {
    throw new Error('data/guides.json 必须是数组，检查导入脚本的输出格式')
  }
  cache = parsed as Guide[]
  return cache
}

export function getGuide(slug: string): Guide | null {
  return listGuides().find((guide) => guide.slug === slug) ?? null
}

/** 按 data/guides.json 的顺序取上一篇 / 下一篇。 */
export function getAdjacentGuides(slug: string): {
  previous: Guide | null
  next: Guide | null
} {
  const guides = listGuides()
  const index = guides.findIndex((guide) => guide.slug === slug)

  if (index === -1) return { previous: null, next: null }

  return {
    previous: index > 0 ? guides[index - 1] : null,
    next: index < guides.length - 1 ? guides[index + 1] : null,
  }
}

/** 工具 slug → 教程 slug，供左侧目录判断哪些工具已经有教程。 */
export function guideSlugByTool(): Record<string, string> {
  const result: Record<string, string> = {}

  for (const guide of listGuides()) {
    if (!result[guide.tool]) result[guide.tool] = guide.slug
  }

  return result
}

/** 只统计正文里的中文字符，用来估算阅读时长，也方便核对 1500–3000 字。 */
export function countReadableChars(body: string): number {
  const withoutFences = body.replace(/```[\s\S]*?```/g, '')
  const withoutTables = withoutFences
    .split(/\r?\n/)
    .filter((line) => !line.trim().startsWith('|'))
    .join('\n')
  const withoutImages = withoutTables.replace(/!\[[^\]]*\]\([^)]*\)/g, '')
  const plain = withoutImages
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_`~]/g, '')
  const matches = plain.match(/[\u3400-\u9fff]/g)
  return matches ? matches.length : 0
}

export function readingMinutes(body: string): number {
  return Math.max(1, Math.ceil(countReadableChars(body) / 400))
}

function stripInlineMarkdown(text: string): string {
  return text
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/[*_~]/g, '')
    .trim()
}

function headingId(text: string): string {
  const base = text
    .toLowerCase()
    .normalize('NFKC')
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')

  return base || 'section'
}

/** 从正文提取 `##` / `###`，跳过代码块，重复标题自动加序号。 */
export function extractToc(body: string): TocItem[] {
  const items: TocItem[] = []
  const counts = new Map<string, number>()
  let inFence = false

  for (const line of body.split(/\r?\n/)) {
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence
      continue
    }
    if (inFence) continue

    const match = /^(#{2,3})\s+(.+?)\s*#*\s*$/.exec(line)
    if (!match) continue

    const text = stripInlineMarkdown(match[2])
    if (!text) continue

    const base = headingId(text)
    const seen = counts.get(base) ?? 0
    counts.set(base, seen + 1)

    items.push({
      id: seen === 0 ? base : `${base}-${seen + 1}`,
      text,
      level: match[1].length as 2 | 3,
    })
  }

  return items
}
