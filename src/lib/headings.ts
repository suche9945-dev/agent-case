/**
 * 标题与锚点：目录和正文标题共用同一条 Markdown AST 处理链。
 *
 * 背景（独立验收 R2/R3）：旧实现用正则扫一遍 Markdown 抽目录，正文渲染时再按游标分配 id。
 * 正则漏掉合法的前导空格标题后，游标整体错位；同名标题去重也只检查原始 base，
 * 原文自带 `-1` 时会撞 id。现在改为：
 * - 解析：unified + remark-parse + remark-gfm（与 react-markdown 相同的解析器）；
 * - 提取：遍历 mdast 的 heading 节点，文本取渲染后可见文字；
 * - 渲染：rehypeHeadingAnchors 把同一份 anchors 写回 h2/h3 的 id；
 * - 去重：按「最终已占用 id 集合」循环找后缀，`a / a / a-1` 也能稳定得到唯一 id。
 */
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import type { PluggableList } from 'unified'

export type HeadingAnchor = {
  id: string
  text: string
  level: 2 | 3
}

/** 旧名字，保留给页面里已有的引用 */
export type Heading = HeadingAnchor

type MdNode = {
  type: string
  value?: string
  alt?: string
  depth?: number
  children?: MdNode[]
}

type HNode = {
  type: string
  tagName?: string
  value?: string
  properties?: Record<string, unknown>
  children?: HNode[]
}

const parser = unified().use(remarkParse).use(remarkGfm)

/** 把标题转成锚点：保留中英文与数字，其余折叠成连字符 */
export function slugifyHeading(text: string): string {
  const normalized = text
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
  return normalized || 'section'
}

/**
 * 按最终占用集合分配唯一 id：
 * `a` → `a`，第二个 `a` → `a-1`，原文自带 `a-1` → `a-1-1`，不会撞车。
 */
export function assignHeadingId(text: string, occupied: Set<string>): string {
  const base = slugifyHeading(text)
  if (!occupied.has(base)) {
    occupied.add(base)
    return base
  }
  let suffix = 1
  while (occupied.has(base + '-' + suffix)) suffix += 1
  const id = base + '-' + suffix
  occupied.add(id)
  return id
}

/** mdast 节点的可见文字：图片取 alt，行内代码取内容，原始 HTML 不算文字 */
function mdText(node: MdNode): string {
  if (node.type === 'text' || node.type === 'inlineCode') return node.value ?? ''
  if (node.type === 'image') return node.alt ?? ''
  if (node.type === 'break') return ' '
  if (node.type === 'html') return ''
  if (!node.children) return ''
  return node.children.map(mdText).join('')
}

/** hast 节点的可见文字，规则与 mdText 对齐，供渲染层自检 */
function hastText(node: HNode): string {
  if (node.type === 'text') return node.value ?? ''
  if (node.type === 'element' && node.tagName === 'img') {
    return typeof node.properties?.alt === 'string' ? node.properties.alt : ''
  }
  if (node.type === 'element' && node.tagName === 'br') return ' '
  if (!node.children) return ''
  return node.children.map(hastText).join('')
}

/** 从 Markdown 正文里抽 ## / ###（含引用、列表里的标题），代码围栏由解析器自然排除 */
export function extractHeadings(markdown: string): HeadingAnchor[] {
  const tree = parser.parse(markdown) as unknown as MdNode
  const occupied = new Set<string>()
  const headings: HeadingAnchor[] = []

  const walk = (node: MdNode) => {
    if (node.type === 'heading' && (node.depth === 2 || node.depth === 3)) {
      const text = mdText(node).replace(/\s+/g, ' ').trim()
      if (text) {
        headings.push({
          id: assignHeadingId(text, occupied),
          text,
          level: node.depth === 2 ? 2 : 3,
        })
      }
      return
    }
    for (const child of node.children ?? []) walk(child)
  }

  walk(tree)
  return headings
}

/**
 * rehype 插件：按顺序把 extractHeadings 的 id 写到 h2/h3 上。
 * 万一某处标题文本与目录文本不一致（解析器差异），仍用同一算法分配新 id，
 * 保证页面里的 id 永远唯一；这类不一致由集成测试兜底报错。
 */
export function rehypeHeadingAnchors(anchors: HeadingAnchor[]): PluggableList[number] {
  return () => (tree: HNode) => {
    const occupied = new Set<string>()
    let index = 0

    const walk = (node: HNode) => {
      if (node.type === 'element' && (node.tagName === 'h2' || node.tagName === 'h3')) {
        const text = hastText(node).replace(/\s+/g, ' ').trim()
        const preset = anchors[index]
        index += 1
        let id: string
        if (preset && !occupied.has(preset.id)) {
          id = preset.id
        } else {
          id = assignHeadingId(text, occupied)
        }
        occupied.add(id)
        node.properties = { ...(node.properties ?? {}), id }
        return
      }
      for (const child of node.children ?? []) walk(child)
    }

    walk(tree)
  }
}
