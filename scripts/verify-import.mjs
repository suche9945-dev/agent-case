/**
 * 导入脚本的隔离测试（可复现证据，对应独立验收 R4/R9）。
 *
 * 用法（仓库根目录）：node scripts/verify-import.mjs
 * 运行前置：Node.js ≥ 20.9（与项目 engines 一致；脚本只使用 ESM 与内置模块）。
 *
 * 覆盖：
 * 1. 函数级：重复 slug、frontmatter 解析、public 路径边界（含 junction 真实路径越界）；
 * 2. 生产逻辑：多文件多错误一次列全、不写半成品、排序、幂等、空目录；
 * 3. 真实 CLI 子进程：往 content/guides 临时放坏数据，断言退出码非零、旧 JSON 逐字节不变；
 * 4. 写入失败：目标文件只读时抛出错误、旧文件保留、.tmp 清理；
 * 5. 失败注入：隔离副本里故意让一条断言失败，确认脚本自身返回非零。
 *
 * 所有临时数据在 try/finally 中清理；真实 data/guides.json 全程比对哈希。
 */
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import crypto from 'node:crypto'
import { spawnSync } from 'node:child_process'
import { pathToFileURL } from 'node:url'

const REPO = process.cwd()
const mod = await import(pathToFileURL(path.join(REPO, 'scripts/import-guides.mjs')).href)
const { main, findDuplicateSlugs, splitFrontmatter, resolvePublicFile } = mod

const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-case-import-'))
const CASES = path.join(TMP, 'guides')
const OUT = path.join(TMP, 'out.json')
const REAL_JSON = path.join(REPO, 'data/guides.json')
const REAL_MANIFEST = path.join(REPO, 'content/guides')

const results = []
const unverified = []
function check(name, condition, detail) {
  results.push(Boolean(condition))
  console.log(`${condition ? 'PASS' : 'FAIL'}  ${name}${detail ? '  → ' + detail : ''}`)
}
function noteUnverified(name, detail) {
  unverified.push(name)
  console.log(`UNVERIFIED  ${name}${detail ? '  → ' + detail : ''}`)
}

const hash = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')
const resetCases = () => {
  fs.rmSync(CASES, { recursive: true, force: true })
  fs.mkdirSync(CASES, { recursive: true })
}
const write = (name, content) => fs.writeFileSync(path.join(CASES, name), content, 'utf8')

const base = (over = {}) => {
  const fm = {
    title: '测试用的教程标题，长度符合要求',
    tool: 'cursor',
    summary:
      '这是一段用于测试的摘要，需要落在四十到八十字之间，描述清楚读者是谁、能学到什么内容。',
    updatedAt: '2026-10-20',
    sourceUrls: [
      'https://cursor.com/docs',
      'https://cursor.com/download',
      'https://cursor.com/pricing',
    ],
    ...over,
  }
  const lines = ['---']
  for (const [key, value] of Object.entries(fm)) {
    if (Array.isArray(value)) {
      lines.push(`${key}:`)
      for (const item of value) lines.push(`  - ${item}`)
    } else {
      lines.push(`${key}: ${value}`)
    }
  }
  lines.push('---', '', '## 它能做什么', '', '正文。')
  return lines.join('\n') + '\n'
}

const realBefore = hash(REAL_JSON)
const manifestBefore = fs.readdirSync(REAL_MANIFEST).sort().join(',')

try {
  resetCases()

  // ---------- 函数级：重复 slug（Windows 无法建同名不同大小写的文件） ----------
  const dupes = findDuplicateSlugs(['cursor-guide.md', 'Cursor-Guide.md', 'other.md'])
  check('函数级：大小写不同的重复 slug 能识别', dupes.length === 1 && dupes[0].file === 'Cursor-Guide.md')
  check('函数级：不同 slug 不误报', findDuplicateSlugs(['a.md', 'b.md']).length === 0)

  // ---------- 函数级：frontmatter 解析 ----------
  check('frontmatter：BOM + CRLF 能解析', Boolean(splitFrontmatter('\uFEFF---\r\ntitle: x\r\n---\r\n\r\n## 正文').head))
  check('frontmatter：缺少结束标记报错', Boolean(splitFrontmatter('---\ntitle: x\n\n## 正文').error))
  check('frontmatter：第一行不是 --- 报错', Boolean(splitFrontmatter('title: x\n---\n').error))
  check(
    'frontmatter：正文里的 --- 不会被当结束标记',
    splitFrontmatter('---\ntitle: x\n---\n\n第一段\n\n---\n\n第二段').body.includes('第二段'),
  )
  check(
    'frontmatter：结束标记必须独占一行',
    Boolean(splitFrontmatter('---\ntitle: x\n---extra\n---\n正文').error) === false,
  )

  // ---------- 函数级：public 路径边界 ----------
  check('路径：拒绝 .. 目录穿越', Boolean(resolvePublicFile('/guides/../../package.json').error))
  check('路径：拒绝 Windows 反斜杠穿越', Boolean(resolvePublicFile('/guides/..\\..\\package.json').error))
  check('路径：拒绝同前缀目录', Boolean(resolvePublicFile('/../publicity/a.png').error))
  check('路径：拒绝目录当文件', Boolean(resolvePublicFile('/icons').error))
  check('路径：接受真实存在的文件', Boolean(resolvePublicFile('/icons/brands/cursor.svg').absolute))
  check('路径：不存在的文件报错', Boolean(resolvePublicFile('/guides/none.png').error))

  // ---------- 函数级：junction 真实路径越界（R4） ----------
  const boundary = path.join(TMP, 'boundary')
  const boundaryPublic = path.join(boundary, 'public')
  const boundaryOutside = path.join(boundary, 'outside')
  fs.mkdirSync(boundaryPublic, { recursive: true })
  fs.mkdirSync(boundaryOutside, { recursive: true })
  fs.writeFileSync(path.join(boundaryPublic, 'ok.png'), 'inside')
  fs.writeFileSync(path.join(boundaryOutside, 'proof.png'), 'outside')
  const linkPath = path.join(boundaryPublic, 'link')
  let junctionMade = false
  try {
    fs.symlinkSync(boundaryOutside, linkPath, 'junction')
    junctionMade = true
  } catch (error) {
    noteUnverified('路径：junction 越界必须拒绝', '当前环境无法创建 junction：' + error.code)
  }
  if (junctionMade) {
    const escaped = resolvePublicFile('/link/proof.png', boundaryPublic)
    check('路径：junction 指向外部时拒绝', Boolean(escaped.error), escaped.error ?? '')
    check('路径：junction 越界错误信息提到边界', /越过/.test(escaped.error ?? ''), escaped.error ?? '')
  }
  const inside = resolvePublicFile('/ok.png', boundaryPublic)
  check('路径：链接测试同时接受 public 内普通文件', Boolean(inside.absolute) && !inside.error)

  // ---------- 生产逻辑：多文件多错误一次列全 ----------
  write('a-bad-tool.md', base({ tool: 'not-a-real-tool' }))
  write('b-bad-title.md', base({ title: '太短' }))
  write('c-bad-summary.md', base({ summary: '太短了' }))
  write('d-bad-date.md', base({ updatedAt: '2026-10-20T00:00:00' }))
  write('e-bad-url.md', base({ sourceUrls: ['ftp://a.com', 'not-a-url', 'https://ok.com'] }))
  write('f-bad-shot.md', base({ screenshots: ['/guides/../../package.json', '/guides/none.png'] }))
  write('g-no-frontmatter.md', '## 没有 frontmatter 的正文\n')
  write('h-bad-yaml.md', '---\ntitle: [未闭合\n---\n\n## 正文\n')
  write('i-missing-field.md', '---\ntitle: 只有标题，其它字段都没有\n---\n\n## 正文\n')
  write('j-few-sources.md', base({ sourceUrls: ['https://cursor.com/docs', 'https://cursor.com/download'] }))

  const failed = main({ contentDir: CASES, outputFile: OUT })
  check('生产逻辑：校验失败返回 ok=false', failed.ok === false, `errors=${failed.errors.length}`)
  check('生产逻辑：失败时不写输出文件', !fs.existsSync(OUT))
  check('生产逻辑：真实 data/guides.json 未被改动', hash(REAL_JSON) === realBefore)

  const text = failed.errors.join('\n')
  const expectations = [
    ['工具不存在', /tool: data\/products\/ 里没有 not-a-real-tool/],
    ['标题长度', /title: 长度 \d+ 字/],
    ['摘要长度', /summary: 长度 \d+ 字/],
    ['日期带时间', /updatedAt: 必须是 YYYY-MM-DD，收到：2026-10-20T00:00:00/],
    ['来源 URL 格式', /sourceUrls\.0: 不是合法的 http\(s\) URL/],
    ['来源数量不足', /sourceUrls: 至少给 3 条/],
    ['截图越界', /screenshots: 路径越过了 public\/ 目录边界/],
    ['截图不存在', /screenshots: public\/guides\/none\.png 不存在/],
    ['缺少 frontmatter', /g-no-frontmatter\.md:frontmatter: 第一行必须是/],
    ['YAML 解析失败', /h-bad-yaml\.md:frontmatter: YAML 解析失败/],
    ['缺少必填字段', /i-missing-field\.md:(tool|summary|updatedAt|sourceUrls)/],
  ]
  for (const [name, pattern] of expectations) check('报错内容：' + name, pattern.test(text))
  const filesWithErrors = new Set(
    failed.errors.map((line) => line.split(':')[0]).filter((file) => file.startsWith('content/')),
  )
  check('生产逻辑：错误文件都被报到', filesWithErrors.size >= 9, `${filesWithErrors.size} 个文件`)

  // 不存在的日期（真实日期校验，zod 里完成）
  resetCases()
  write('k-fake-date.md', base({ updatedAt: '2026-02-30' }))
  const fakeDate = main({ contentDir: CASES, outputFile: OUT })
  check('生产逻辑：不存在的日期被拒绝', fakeDate.ok === false && fakeDate.errors.some((e) => /不是有效日期/.test(e)))

  // ---------- 生产逻辑：排序 + 幂等 ----------
  resetCases()
  write('z-old.md', base({ updatedAt: '2026-10-01', title: '较旧的测试教程标题，长度符合要求' }))
  write('a-new.md', base({ updatedAt: '2026-10-20', title: '较新的测试教程标题，长度符合要求' }))
  write('m-same-day.md', base({ updatedAt: '2026-10-01', title: '同一天的另一篇测试教程标题，也符合' }))
  const ok1 = main({ contentDir: CASES, outputFile: OUT })
  check('生产逻辑：合法数据通过', ok1.ok === true)
  const first = fs.readFileSync(OUT, 'utf8')
  const parsed = JSON.parse(first)
  check('排序：updatedAt 倒序、同一天按 slug 升序', parsed.map((g) => g.slug).join(',') === 'a-new,m-same-day,z-old')
  check('产物：以换行结尾', first.endsWith('\n'))
  const ok2 = main({ contentDir: CASES, outputFile: OUT })
  check('幂等：连跑两次逐字节一致', ok2.ok === true && fs.readFileSync(OUT, 'utf8') === first)
  check('幂等：没有留下 .tmp 半成品', !fs.existsSync(OUT + '.tmp'))

  // ---------- 生产逻辑：空目录 ----------
  resetCases()
  const empty = main({ contentDir: CASES, outputFile: OUT })
  check('空数据：写出 [] 且不报错', empty.ok === true && JSON.parse(fs.readFileSync(OUT, 'utf8')).length === 0)

  // ---------- 真实 CLI：坏数据必须非零退出且不改旧 JSON ----------
  const cliPath = path.join(REPO, 'scripts/import-guides.mjs')
  const runCli = () => spawnSync(process.execPath, [cliPath], { cwd: REPO, encoding: 'utf8' })
  let injected = null
  const cliCases = [
    ['缺字段', '---\n' + 'title: 缺字段的临时文章标题\n' + 'tool: cursor\n' + '---\n\n## 正文\n', /frontmatter|summary|updatedAt|sourceUrls/],
    ['字段类型错误', base().replace('sourceUrls:\n  - https://cursor.com/docs\n  - https://cursor.com/download\n  - https://cursor.com/pricing', 'sourceUrls: bad'), /sourceUrls/],
    ['工具不存在', base({ tool: 'no-such-tool' }), /data\/products\/ 里没有/],
    ['日期带时间', base({ updatedAt: '2026-10-20T08:00:00' }), /YYYY-MM-DD/],
    ['日期不存在', base({ updatedAt: '2026-02-30' }), /不是有效日期/],
    ['图片不存在', base({ screenshots: ['/guides/definitely-missing.png'] }), /不存在/],
  ]
  let cliIndex = 0
  for (const [name, content, pattern] of cliCases) {
    cliIndex += 1
    const fileName = `zz-verify-cli-${process.pid}-${cliIndex}.md`
    const filePath = path.join(REAL_MANIFEST, fileName)
    const beforeHash = hash(REAL_JSON)
    injected = filePath
    fs.writeFileSync(filePath, content, 'utf8')
    try {
      const run = runCli()
      check(`CLI（${name}）：退出码非零`, run.status !== 0, `status=${run.status}`)
      check(`CLI（${name}）：错误信息命中`, pattern.test((run.stderr ?? '') + (run.stdout ?? '')))
      check(`CLI（${name}）：旧 JSON 逐字节不变`, hash(REAL_JSON) === beforeHash)
    } finally {
      fs.rmSync(filePath, { force: true })
      injected = null
    }
  }
  check('CLI：临时文件已清理', fs.readdirSync(REAL_MANIFEST).sort().join(',') === manifestBefore)

  // ---------- 写入失败：旧文件保留、无 .tmp ----------
  const failDir = path.join(TMP, 'write-fail')
  fs.mkdirSync(failDir, { recursive: true })
  const failOut = path.join(failDir, 'guides.json')
  fs.writeFileSync(failOut, 'OLD-CONTENT', 'utf8')
  fs.chmodSync(failOut, 0o444)
  resetCases()
  write('ok.md', base())
  let threw = false
  try {
    main({ contentDir: CASES, outputFile: failOut })
  } catch {
    threw = true
  }
  check('写入失败：抛出错误', threw === true)
  check('写入失败：旧输出文件保留', fs.readFileSync(failOut, 'utf8') === 'OLD-CONTENT')
  check('写入失败：没有 .tmp 残留', !fs.existsSync(failOut + '.tmp'))
  fs.chmodSync(failOut, 0o666)

  // ---------- 失败注入：脚本自身必须返回非零 ----------
  // 副本运行时会带上 VERIFY_IMPORT_NO_INJECT=1，避免无限递归地再复制自己
  if (!process.env.VERIFY_IMPORT_NO_INJECT) {
    const selfPath = path.join(REPO, 'scripts/verify-import.mjs')
    const copyPath = path.join(TMP, 'verify-import-failing.mjs')
    const source = fs.readFileSync(selfPath, 'utf8')
    const broken = source.replace(
      "check('函数级：不同 slug 不误报', findDuplicateSlugs(['a.md', 'b.md']).length === 0)",
      "check('故意失败：不同 slug 不误报', false)",
    )
    check('失败注入：成功改写副本中的一条断言', broken !== source)
    fs.writeFileSync(copyPath, broken, 'utf8')
    const selfRun = spawnSync(process.execPath, [copyPath], {
      cwd: REPO,
      encoding: 'utf8',
      env: { ...process.env, VERIFY_IMPORT_NO_INJECT: '1' },
    })
    check('失败注入：副本退出码为 1', selfRun.status === 1, `status=${selfRun.status}`)
    check('失败注入：副本输出包含 FAIL', /FAIL/.test(selfRun.stdout ?? ''))
  }
} finally {
  // 兜底：无论断言/IO 是否异常，都清掉注入文件和临时目录
  try {
    if (injected) fs.rmSync(injected, { force: true })
    for (const entry of fs.readdirSync(REAL_MANIFEST)) {
      if (entry.startsWith('zz-verify-cli-')) fs.rmSync(path.join(REAL_MANIFEST, entry), { force: true })
    }
  } catch {
    /* 清理失败时下面还有断言兜底 */
  }
  fs.rmSync(TMP, { recursive: true, force: true })
}

check('收尾：真实 data/guides.json 仍未被改动', hash(REAL_JSON) === realBefore)
check('收尾：content/guides 文件清单已恢复', fs.readdirSync(REAL_MANIFEST).sort().join(',') === manifestBefore)
check('收尾：临时目录已删除', !fs.existsSync(TMP))

if (unverified.length > 0) {
  console.log(`\n未验证 ${unverified.length} 项（环境限制，未计入失败）：${unverified.join('；')}`)
}
const failedCount = results.filter((r) => !r).length
console.log(`\n共 ${results.length} 项，通过 ${results.length - failedCount} 项，失败 ${failedCount} 项`)
if (failedCount > 0) process.exitCode = 1
