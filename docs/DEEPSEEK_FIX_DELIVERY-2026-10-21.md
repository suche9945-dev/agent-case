# DeepSeek 修复交付报告（2026-10-21）

对应 `docs/DEEPSEEK_FIX_PROMPT-2026-10-21.md` 与 `docs/CODEX_REVIEW.md` 的 R1–R9。本文只记录本轮实际做了什么、怎么验证、还剩什么；原验收报告与证据目录保持只读，没有改写。

## 0. 结论先说

- **工程缺陷 R2–R5 已修复并复验**（标题/目录同源、ID 去重、真实路径边界、Cursor 口径一致），R9 的测试可信度补强为「真实 CLI 子进程 + 写入失败 + 失败注入 + finally 清理」，**并发导入与真实 IO 故障仍未验证**。
- **R6、R7、R8 为部分修复**：Harness 三条认证路线已拆开写；三张有问题的配图已重拍替换；教程不再写死价格、FAQ 逐条标依据类型、Harness 补齐 2 篇、可灵补齐第 2 篇第三方阅读。但**本人实机证据仍然一张都没有（R1）**，多张官方辅助图也仍然不是操作证据。
- **整体判断：工程可交付（有回归证据）；教程内容仍不能完整交付**——Harness 与即梦各补 2 张用户本人截图（Harness 登录、即梦会员页与登录弹窗），其余三篇仍没有本人证据，还差 6 张；生成/任务结果也仍未实机。不能用官网图、测试通过或「用户用过」代替。

## 1. 工作位置与保护范围

- 路径 `D:\agent项目助理\agent-case`；分支 `intern/chen`；HEAD `9b130ec8aa0b69ff5f642908f337ed9adc8bae89`（与验收基线一致）。
- 开工时 `git status --short` 共 **38 项**：19 个已修改、19 个未跟踪（独立验收记录为 19 + 39；本轮实际是 19 + 19，差异记录在此，未据旧数改写）。未跟踪项包含 30 张图（按目录计）、2 份校验脚本、3 份当日文档、4 张验收截图。
- 本轮只改工作区：**没有 commit、没有 push、没有创建 PR、没有配置 Git 身份**；没有 reset/clean/覆盖历史。
- `docs/CODEX_REVIEW.md` 与 `docs/CODEX_REVIEW_EVIDENCE-20261021/` 未做任何修改。
- 预览服务使用 3000 端口；测试结束后只停止自己启动的服务。

## 2. R1–R9 状态

| 编号 | 状态 | 做了什么 | 验证方式 / 边界 |
|---|---|---|---|
| R1 本人实机证据 | **部分修复（4/10）** | 用户提供 Harness 登录 2 张（登录页、登录成功页，二维码已打码）、即梦 2 张（会员页、登录弹窗，账号名已遮挡），均已接入教程；其余三篇文首保留「尚未实机验证」 | Harness 与即梦的入口/权益页已有本人证据；**其余三篇 0 张，还差 6 张；五篇的生成/任务结果仍未实机**；没有代注册、代登录、代付款 |
| R2 缩进标题导致目录错位 | **已修复** | `src/lib/headings.ts` 改为 unified + remark-parse + remark-gfm 解析 AST；`Markdown.tsx` 用 rehype 插件写回同一份 anchors | 单元/管道测试 41 项全过；浏览器用 `## first / "  ## indented" / ## last` 实测：正文 10 个标题、目录 10 项、id 一一对应 |
| R3 去重撞 ID | **已修复** | `assignHeadingId(text, occupied)` 按最终占用集合循环找后缀 | `a / a / a-1` → `a / a-1 / a-1-1`；浏览器实测 id 唯一 |
| R4 链接可越过 public | **已修复** | `resolvePublicFile` 增加 `realpathSync.native` 双层边界（public 根 + 目标） | 隔离目录建 junction 指向外部，生产函数返回「真实位置越过了 public/ 目录边界」；同目录普通文件仍接受 |
| R5 Cursor 口径不一致 | **已修复** | `products.ts` 增 `accessLabel`；`ProductBar` 优先用 accessLabel，未声明时加说明行；cursor.yaml 写「官方未声明国内支持」；正文删掉「必须境外手机号/支付」；`overseasPhone` 改 unspecified；补 CLI 认证来源 | 页面实测：出现「官方未声明国内支持」与说明，不再出现「官方国内不可用」；typecheck 通过 |
| R6 Harness 认证路线混淆 | **已修复** | 「登录与开通」拆成 A 桌面账号 / B API Key / C 自定义提供商三条路线；路线 A 按官方账号插件文档补全凭据（`x-dsh-auth-token`）、目录（`https://api.deepseek.com/models`）、版本门控（`CLIENT_UPGRADE_REQUIRED` / `MODEL_UNSUPPORTED`）、未登录失败（`ACCOUNT_SIGN_IN_REQUIRED`，不回退 Key）与 401 处理；审批改成「取决于权限策略」；headless 改为「官方示例假定已安装，npx 形式待实机确认」 | 来源 URL 已补 `packages/llm/llm-deepseek-account/README.zh.md`；未再写「默认每步必弹窗」，也没有用「本文不涉及桌面端」这类回避表述 |
| R7 配图与事实缺口 | **部分修复** | 重拍 3 张：TRAE「添加模型」弹窗、可灵去推广弹窗且带 720p·10s 参数、即梦 Seedance FAQ；可灵区分网页/API 参数、删除「免费额度足够两段」、改「自发放起 1 个月」；即梦区分手机号登录与额外身份认证、补跨端权益条件 | 其余 27 张仍为官方辅助图，逐图「能证明/不能证明」见 `docs/来源与截图台账-2026-10-21.md` 第 5 节；本人操作证据仍缺 |
| R8 正文/交付不一致 | **部分修复** | 四篇删除固定金额与折扣，只留官方定价页链接；FAQ 逐条标「官方/建议」；Harness 补 2 篇、可灵补第 2 篇第三方；修正第三方年份；提交方案改为按篇拆分 | 价格符号复查：教程正文已无 ¥/$ 金额；第三方阅读 Cursor 2、TRAE 2、Harness 2、即梦 2、可灵 2；仍不能证明第三方作者当时是否实机 |
| R9 校验器可信度 | **部分修复** | `verify-import.mjs` 改为真实 CLI 子进程注入 6 类坏数据、写失败（只读目标）、失败注入（隔离副本故意失败）、最外层 finally 清理；`verify-headings.mjs` 断言生产插件输出 | 66/66、41/41；并发导入和真实 IO 故障**未验证**，文中未宣称 |

## 3. 实际运行的命令与结果

环境：Windows；Node `v24.16.0`；corepack 管理的 pnpm `10.33.0`。正式导入入口是 **`corepack pnpm import:guides`**（没有用 `pnpm import` 代替）。

| 命令 | 结果 | 说明 |
|---|---|---|
| `corepack pnpm import:guides` | 退出 0 | 读取 5 / 通过 5 / 写入 5；连跑两次 `data/guides.json` SHA-256 一致 |
| `corepack pnpm typecheck` | 退出 0 | 新增 `accessLabel`、AST 解析、rehype 插件均通过 |
| `corepack pnpm build` | 退出 0 | Next 16.3.3；路由 `/`、`/_not-found`、`/guides`、`/guides/[slug]`、`/icon.svg` |
| `node scripts/verify-import.mjs` | 退出 0，**66/66** | 含 junction 越界、6 类 CLI 坏数据（退出码 1、旧 JSON 逐字节不变）、只读目标写失败、失败注入副本退出 1 |
| `node scripts/verify-headings.mjs` | 退出 0，**41/41** | 生产插件跑 remark→rehype 全链；含 R2 原始反例、引用/列表标题、`~~~` 与四个反引号围栏、五篇真实正文 |
| 浏览器验收（6 页 × 3 宽度） | **69/69** | 无横向溢出、控制台 0 报错、上下篇首尾、404、折叠、移动抽屉、右目录点击/滚动高亮、Tab 焦点；截图 18 张 |
| 标题 fixture 浏览器验证 | **9/9** | 临时文章后已删除，`data/guides.json` 恢复并哈希一致，fixture slug 已不存在 |
| 空数据测试 | 通过 | 备份 → `[]` → 重启 → 总览空态、0 个文章链接；恢复 → 重启 → 5 篇回来、原哈希一致 |

失败与重试记录：

- `verify-import.mjs` 首轮在本机默认临时目录下**没有**复现 Codex 遇到的 rename EPERM，测试全部通过；为覆盖写入失败，另用「目标文件只读」主动制造 rename 失败，断言旧文件保留且 `.tmp` 清理。
- 无头浏览器截图期间出现过一次 `cdp-accept.mjs` 路径写错（把 `.tools` 当成仓库内目录），修正路径后复跑通过；属调用错误，不是产品问题。

## 4. 五篇内容现状

字数口径：只统计正文汉字，排除代码围栏、表格行、图片行（图注在 alt 里）。

| 教程 | 汉字 | 图 | 本人图 | 官方 sourceUrls | 第三方阅读 | 价格 | 实机状态 |
|---|---|---:|---:|---:|---:|---|---|
| Cursor | 2004 | 6 | 0 | 9 | 2 | 只留定价页链接 | 未实机 |
| TRAE | 2205 | 6 | 0 | 8 | 2 | 只留定价页链接 | 未实机 |
| DeepSeek Harness | 2979 | 8 | 2 | 9 | 2 | 官方价格页链接 | 登录已实机（用户提供截图）；首次任务未实机 |
| 即梦AI | 2302 | 6 | 2 | 6 | 2 | 只留会员页链接 | 登录入口与会员页已实机（用户提供）；生成未实机 |
| 可灵AI | 2393 | 6 | 0 | 6 | 2 | 只留会员页链接 | 未实机 |

九节结构保持；字数均在 1500–3000 内。

## 5. 32 张图的逐图结论（摘要）

完整矩阵见 `docs/来源与截图台账-2026-10-21.md` 第 5 节。本轮重拍的三张：

| 文件 | 旧问题 | 现在能证明什么 | 仍不能证明 |
|---|---|---|---|
| `trae-guide/05-models.png` | 只拍到内置模型列表，图注却说自定义入口 | 官方文档「设置 > 模型 > 添加模型」步骤与「添加模型」弹窗的服务商列表 | 本人完成配置 |
| `kling-guide/05-app.png` | 推广弹窗遮住核心操作区 | 未登录也能看到提示词框、Kling 4.0、720p · 10s · 16:9 参数、生成按钮 | 登录后实际额度、生成结果 |
| `jimeng-guide/04-seedance-2-5.png` | 模型宣传页被当成 FAQ/参数证据 | 官方 Seedance 2.5 的常见问题清单（免费试用、带声音、文/图生视频、人物一致性） | 生成参数与结果 |

## 6. 五个工具档案的变更依据

| 工具 | 改了什么 | 直接依据 | 仍待确认 |
|---|---|---|---|
| Cursor | accessLabel「官方未声明国内支持」；overseasPhone → unspecified；intro 改 X 订阅体系；freeTier 改 Free/Hobby 旧档 | 地区页、定价页、Models & Pricing、ToS、CLI 认证页 | Google/GitHub 登录按钮；具体支付方式是否可用 |
| TRAE | accessNote 删「需代理」；freeTier 具体化；global 免费档补概要；verifiedAt | 国内定价页、快速开始、模型文档、国际定价页 | 账号互通、实名要求（均无官方依据） |
| DeepSeek Harness | 补下载页、隐私政策、账号插件、providers 来源；verifiedAt | 官网、README、Web UI 指南、providers、隐私政策 | 桌面端实际按钮、用户走的是哪条认证路线 |
| 即梦 | form 补 API；freeTier 改「游客模式 + 当日有效」；signup 补 Apple ID；intro 去掉未见的型号 | 用户协议、付费协议、Seedance 页、模型备案页 | API 控制台入口、实际可选时长 |
| 可灵 | form 补 API；intro 更新模型线；priceNote 删未复核的年付数字、补档位；verifiedAt | 国内站、用户协议、付费协议、开放平台、API 文档、官方指南 | 新加坡基址、网页端 30 秒是否开放 |

## 7. 仍缺的东西与用户最少操作

### 7.1 每篇至少两张本人截图（两篇已补，还差 6 张）

| 教程 | 最少操作 | 两张截图应覆盖 |
|---|---|---|
| Harness | **已完成登录两步**（用户提供 2 张截图）；建议再补一步：在测试工作区读文件并改 README 一行 | ① 登录页（已完成）；② 登录成功页（已完成）；③ 可选：本人任务输入、diff/结果与真实文件改动 |
| Cursor | 从官方入口安装/打开、登录、选小项目、读项目并改页面标题、看 diff 与浏览器结果；用免费档，不为验收付费 | ① 登录后的本机编辑器与版本；② 本人提示词、diff/已改文件与结果 |
| TRAE | 安装/打开国内桌面版、登录、打开空文件夹、切到 Agent、生成 index.html、实际点按钮 | ① 登录后本机 Agent/IDE 与版本；② 本人任务、生成文件与浏览器交互结果 |
| 即梦 | **已补入口与会员页 2 张**；建议补：生成一图 → 再用该图生成短视频 | ① 会员页（已完成）；② 登录弹窗（已完成）；③ 可选：本人提示词的出图结果；④ 可选：同图转视频结果 |
| 可灵 | 登录、确认实际免费余额与模型参数、各完成一次文生视频与图生视频 | ① 文生任务提示词、实际参数与结果；② 图生任务原图/运动描述、参数与结果 |

要求：宽 ≤1600、单张 ≤500KB；遮账号、邮箱、Key、真名、本机用户名；alt 与可见图注写「本人实机截图」+ 日期 + 工具版本。免费额度不足或访问受阻时记录「卡在哪、试过什么、实际报错」，不要先购买，也不要承诺「额度够用」。是否换工具由用户决定，不能自行少交一篇。

### 7.2 其他

- 用户用过 Harness 是已知事实，但**具体覆盖了本教程哪些步骤仍待确认**；「用过」不等于「本文流程已验证」。
- 27 张官方辅助图可以留作版式与官方说明，但不能计入本人证据；补齐后可替换不承担操作说明的图，不必机械扩到每篇 8 张。

## 8. Git 状态与后续提交建议（本轮不执行）

- 当前仍未提交，工作区保留全部成果。没有配置 Git 身份，也没有把配置身份当作开工条件。
- 建议按 `CODEX_REVIEW.md` 第 8 节拆分；与本轮修复对应的分组：
  1. **导入安全与测试**：`scripts/import-guides.mjs`、`scripts/verify-import.mjs`。
  2. **标题/Markdown/依赖与回归**：`src/lib/headings.ts`、`src/components/guides/Markdown.tsx`、`src/lib/products.ts`、`src/components/guides/ProductBar.tsx`、`guides.module.css`、`[slug]/page.tsx`、`scripts/verify-headings.mjs`、`package.json`、`pnpm-lock.yaml`。
  3. **五篇教程各自独立提交**：每篇包含源文、该篇图片、对应 `data/products/<tool>.yaml`、以及 `data/guides.json` 中**仅该篇的 hunk**（用 `git add -p`，跨篇 hunk 要拆）。
  4. **交付材料**：`DELIVERY.md`、`docs/` 三份文档与验收截图（独立验收报告/证据目录另作验收资料）。
- 不要整份 `git add data/guides.json` 或整个 `docs/`；不要 amend/rebase 既有历史。

## 9. 交付判断

- **工程**：修复后可运行、可复验；R2–R5 有修复与证据，R9 部分补强。不能宣称「独立验收通过」——独立验收需要对方复跑。
- **教程内容**：**不能完整交付**。五篇仍是「官方来源整理稿 + 官方辅助图」，缺本人实机截图与实际操作记录；这是 P1，不能用工程测试或免责声明抵扣。

## 10. 本轮改动的文件

- 代码：`src/lib/headings.ts`、`src/components/guides/Markdown.tsx`、`src/lib/products.ts`、`src/components/guides/ProductBar.tsx`、`src/components/guides/guides.module.css`、`src/app/guides/[slug]/page.tsx`（上一轮已传 anchors，本轮未再改）。
- 脚本：`scripts/import-guides.mjs`、`scripts/verify-import.mjs`、`scripts/verify-headings.mjs`。
- 内容：五篇教程；`data/products/{cursor,trae,deepseek-harness,jimeng,kling}.yaml`；`data/guides.json`（导入生成）。
- 资产：`public/guides/trae-guide/05-models.png`、`kling-guide/05-app.png`、`jimeng-guide/04-seedance-2-5.png` 三张重拍替换。
- 文档：本文件；`DELIVERY.md`、`docs/验收记录-2026-10-21.md`、`docs/来源与截图台账-2026-10-21.md`、`docs/早晨检查清单-2026-10-21.md`、`docs/截图清单-deepseek-harness.md` 更新。
- 依赖：新增 `unified@11`、`remark-parse@11`（生产解析链）；`remark-rehype@11` 为 devDependency（只给标题测试复现渲染链）。
