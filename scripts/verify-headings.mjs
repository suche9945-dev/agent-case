/**
 * 标题锚点与渲染一致性的测试（可复现证据，对应独立验收 R2/R3）。
 *
 * 用法（仓库根目录）：node scripts/verify-headings.mjs
 * 运行前置：Node.js ≥ 22.6（需要内置 TypeScript 类型擦除才能直接 import src/lib/headings.ts）。
 *   项目本身仍声明 Node ≥ 20.9：构建、类型检查、导入脚本在 20.9 上照常；只有这个测试脚本需要更新版本。
 *   低于 22.6 时会以退出码 3 明确提示，不会静默跳过。
 *
 * 测试方式：用与 react-markdown 相同的解析链（remark-parse + remark-gfm）解析 Markdown，
 * 再用 remark-rehype 转成 HAST，套上生产环境的 rehypeHeadingAnchors 插件，
 * 最后拿渲染出来的 h2/h3 与目录锚点逐项比对 —— 不是用测试复刻另一套正则。
 */
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const REPO = process.cwd()
const results = []
const check = (name, pass, detail) => {
  results.push(pass)
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? '  → ' + detail : ''}`)
}

const major = Number(process.versions.node.split('.')[0])
const minor = Number(process.versions.node.split('.')[1])
if (major < 22 || (major === 22 && minor < 6)) {
  console.error(
    `当前 Node ${process.versions.node} 不支持直接导入 .ts。` +
      '请用 Node ≥ 22.6 运行本脚本（项目构建/导入脚本本身仍支持 Node ≥ 20.9）。',
  )
  process.exit(3)
}

const headingsMod = await import(pathToFileURL(path.join(REPO, 'src/lib/headings.ts')).href)
const { extractHeadings, assignHeadingId, slugifyHeading, rehypeHeadingAnchors } = headingsMod
const { unified } = await import('unified')
const remarkParse = (await import('remark-parse')).default
const remarkGfm = (await import('remark-gfm')).default
const remarkRehype = (await import('remark-rehype')).default

/** 用生产插件跑完整渲染链，返回渲染出的标题（id + 可见文字） */
async function renderHeadings(markdown) {
  const anchors = extractHeadings(markdown)
  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeHeadingAnchors(anchors))
  const mdast = processor.parse(markdown)
  const hast = await processor.run(mdast)

  const rendered = []
  const textOf = (node) => {
    if (node.type === 'text') return node.value ?? ''
    if (node.type === 'element' && node.tagName === 'img') return node.properties?.alt ?? ''
    if (node.type === 'element' && node.tagName === 'br') return ' '
    return (node.children ?? []).map(textOf).join('')
  }
  const walk = (node) => {
    if (node.type === 'element' && (node.tagName === 'h2' || node.tagName === 'h3')) {
      rendered.push({ id: node.properties?.id ?? '', text: textOf(node).replace(/\s+/g, ' ').trim() })
      return
    }
    for (const child of node.children ?? []) walk(child)
  }
  walk(hast)
  return { anchors, rendered }
}

function assertConsistent(label, markdown, expectedIds) {
  return renderHeadings(markdown).then(({ anchors, rendered }) => {
    const ids = rendered.map((h) => h.id)
    const texts = rendered.map((h) => h.text)
    check(`${label}：渲染出的标题数与目录数一致`, rendered.length === anchors.length, `${rendered.length} vs ${anchors.length}`)
    check(`${label}：id 全部唯一`, new Set(ids).size === ids.length, ids.join(' | '))
    check(`${label}：目录 id 与渲染 id 一一对应`, ids.join(',') === anchors.map((a) => a.id).join(','), ids.join(' | '))
    check(`${label}：目录文字与渲染文字一致`, texts.join('|') === anchors.map((a) => a.text).join('|'), texts.join(' | '))
    check(`${label}：没有空 id`, ids.every((id) => id.length > 0))
    if (expectedIds) {
      check(`${label}：预期锚点`, anchors.map((a) => a.id).join(',') === expectedIds, anchors.map((a) => a.id).join(','))
    }
    return { anchors, rendered }
  })
}

// ---------- 1. 独立验收给出的反例 ----------
const reviewFixture = ['## first', '  ## indented', '## last', '## a', '## a', '## a-1'].join('\n')
const fixture = await assertConsistent('R2/R3 反例（缩进 + 重名 + 自带 -1）', reviewFixture, 'first,indented,last,a,a-1,a-1-1')
check('R2：缩进标题没有被漏掉', fixture.anchors.some((a) => a.text === 'indented'))
check('R3：三条 a 系列标题 id 互不相同', new Set(fixture.anchors.map((a) => a.id)).size === fixture.anchors.length)

// ---------- 2. 引用与列表里的标题 ----------
await assertConsistent(
  '引用与列表内的标题',
  ['> ## 引用里的标题', '', '- ## 列表里的标题', '  - ### 嵌套列表里的标题'].join('\n'),
  '引用里的标题,列表里的标题,嵌套列表里的标题',
)

// ---------- 3. 行内格式、链接、图片、行内代码 ----------
await assertConsistent(
  '行内格式',
  [
    '## 带 [链接](https://example.com) 与 **强调** 的标题',
    '## 带 `行内代码` 的标题',
    '## 看图 ![官方下载页](a.png) 再操作',
    '## 中文标题：标点、空格 与《书名号》',
  ].join('\n'),
  '带-链接-与-强调-的标题,带-行内代码-的标题,看图-官方下载页-再操作,中文标题-标点-空格-与-书名号',
)

// ---------- 4. 代码围栏里的伪标题 ----------
await assertConsistent(
  '围栏内伪标题',
  [
    '## 真标题一',
    '```js',
    '## 代码里的假标题',
    '```',
    '~~~~',
    '## 波浪线围栏里的假标题',
    '~~~~',
    '````markdown',
    '```',
    '## 四反引号围栏里的假标题',
    '```',
    '````',
    '## 真标题二',
  ].join('\n'),
  '真标题一,真标题二',
)

// ---------- 5. 规范化后同名（A B 与 a-b） ----------
await assertConsistent('规范化后同名', ['## A B', '## a-b', '## a b'].join('\n'), 'a-b,a-b-1,a-b-2')

// ---------- 6. 空标题与纯符号标题 ----------
const emptyResult = await renderHeadings(['##', '##   ', '## ！！！'].join('\n'))
check('空标题不进入目录', emptyResult.anchors.every((a) => a.text.length > 0))
check('纯符号标题回退到 section', emptyResult.anchors.some((a) => a.id === 'section'), emptyResult.anchors.map((a) => a.id).join(','))

// ---------- 7. 单元级：assignHeadingId 的占用集合 ----------
const occupied = new Set()
check('assignHeadingId：a / a / a-1 依次分配', ['a', 'a', 'a-1'].map((t) => assignHeadingId(t, occupied)).join(',') === 'a,a-1,a-1-1')
check('slugifyHeading：空串回退', slugifyHeading('！！！') === 'section')

// ---------- 8. 真实教程正文回归 ----------
const guidesDir = path.join(REPO, 'content/guides')
const guideFiles = fs.readdirSync(guidesDir).filter((f) => f.endsWith('.md'))
for (const file of guideFiles) {
  const markdown = fs.readFileSync(path.join(guidesDir, file), 'utf8').replace(/^---[\s\S]*?\n---\n/, '')
  const { anchors, rendered } = await renderHeadings(markdown)
  check(
    `${file}：目录与渲染一致`,
    rendered.length === anchors.length && rendered.map((r) => r.id).join(',') === anchors.map((a) => a.id).join(','),
    `${rendered.length} 个标题`,
  )
}

// 临时目录仅用于将来可能的编译回退，这里顺手清掉
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-case-headings-'))
fs.rmSync(tmp, { recursive: true, force: true })

const failed = results.filter((r) => !r).length
console.log(`\n共 ${results.length} 项，通过 ${results.length - failed} 项，失败 ${failed} 项`)
if (failed > 0) process.exitCode = 1
