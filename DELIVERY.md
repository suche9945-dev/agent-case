# 交付说明

## 1. 怎么跑

```bash
pnpm install
pnpm import:guides
pnpm dev
```

访问 `http://localhost:3000/guides`。构建与类型检查：

```bash
pnpm build
pnpm typecheck
```

当前 `data/guides.json` 已导入 5 篇教程（TRAE、豆包工作、即梦AI、Qoder、WorkBuddy）；页面会显示 22 个工具目录和 5 张教程卡片，其余 17 个工具标注「教程整理中」。

## 2. 目前选定的工具和进度

计划覆盖编程工具、图像与视频、办公 Agent 三类，优先选国内可用且有免费档的工具：

| 工具 | 分类 | 状态 | 选择理由 |
| --- | --- | --- | --- |
| TRAE | 编程工具 | 已完成 | trae.cn 国内可用，有免费档，Windows 11 实机跑通 |
| Qoder | 编程工具 | 已完成 | 国内可用、可免费登录，Windows 11 桌面端实测生成计算器 |
| 即梦AI | 图像与视频 | 已完成 | 国内可用、有免费档，网页版实测生成 5 秒视频 |
| 豆包工作 | 办公 Agent | 已完成 | 国内可用、有免费档，Windows 11 桌面端实测生成表格 |
| WorkBuddy | 办公 Agent | 已完成 | 国内可用、有免费体验版，Windows 11 桌面端实测生成本地待办表 |

目前完成的是 5/5，已经覆盖编程工具、图像与视频、办公 Agent 三个分类。

## 3. 每篇的核对来源和日期

| 教程 | 工具 | 核对日期 | 主要来源 |
| --- | --- | --- | --- |
| TRAE 上手教程：在 Windows 11 跑通第一个网页 | TRAE | 2026-10-18 | https://www.trae.cn/download；https://docs.trae.cn/ide_get-started-with-trae；https://docs.trae.cn/ide_models；https://docs.trae.cn/ide_plans-and-billing |
| 豆包工作上手教程：用桌面端生成 7 天开业计划表 | 豆包工作 | 2026-10-18 | https://www.doubao.com/work；https://www.doubao.com/work/pricing；https://www.doubao.com/legal/privacy |
| 即梦AI 上手教程：用网页版生成 5 秒咖啡店短视频 | 即梦AI | 2026-10-18 | https://jimeng.jianying.com；https://jimeng.jianying.com/ai-tool/home；https://jimeng.jianying.com/tools/seedance-2-5 |
| Qoder 上手教程：用 Qoder CN 跑通一个单文件计算器 | Qoder | 2026-10-18 | https://qoder.cn；https://docs.qoder.com/product-series/quick-start；https://docs.qoder.com/qoder/model-selector |
| WorkBuddy 上手教程：把本地会议记录整理成待办表 | WorkBuddy | 2026-10-18 | https://www.workbuddy.cn/docs/workbuddy/Overview；https://www.workbuddy.cn/docs/workbuddy/FirstTask；https://www.workbuddy.cn/docs/workbuddy/Pricing |

TRAE 这篇在 Windows 11、TRAE 3.4.3 上核对。官网下载页在 2026-10-18 写新用户 4500 积分；教程里已注明活动和额度以登录后账户页为准。

## 4. 已知问题 / 没做完的部分

- 5 篇教程已经完成并导入；WorkBuddy 使用免费体验版，输出为 xlsx，表格界面来自本人实机截图。
- TRAE 的自定义模型 / API Key 只核对了官方文档入口和兼容格式，没有实际填入 Key 测试；教程里已写明这一点。
- TRAE 只实测了桌面版，CLI、VS Code 插件和 JetBrains 插件没有实测，教程没有抄写未验证的安装命令。
- 豆包工作只实测了桌面端和免费档，没有开通会员，也没有找到面向个人用户的自定义模型 / API Key 入口；教程如实写明这一点。
- 即梦AI 只实测了网页版免费额度，生成的是 5 秒视频，下载为 MP4；教程正文使用视频结果帧的 PNG 截图。提示词写 3:4 但页面参数为 16:9 的差异已在教程里写明。
- Qoder 只实测了 Qoder CN 桌面端 0.4.8 和免费档，跑通单文件计算器；自定义模型 / API Key 只核对了官方文档入口，没有实际填 Key。
- WorkBuddy 只实测了桌面端 5.8.3 和免费体验版，跑通本地会议记录整理；第三方模型配置只核对了官方文档，没有实际填 Key。
- 没有收录第三方教程，因为还没有实际逐篇读过正文；当前只使用官方页面，避免把二手步骤当成实测。
- TRAE 的 `01-下载页`、`02-快速开始文档`、`06-模型设置` 是官方页面截图；`04-输入任务`、`05-运行结果` 是本人实机截图，`03-任务与预览` 是 `04` 的局部裁图。
- 豆包工作的 `01-官方工作台` 是官方页面素材，`02`、`03`、`04`、`05`、`06` 来自本人桌面端截图或其局部裁图。TRAE 和豆包工作两篇都满足至少两张本人实机证据。
- 即梦AI 的 `01-官方首页` 是官方页面截图，`02`、`03`、`04`、`05`、`06` 来自本人网页版截图或其局部裁图；`05` 是视频结果帧截图。
- Qoder 的六张图都来自本人桌面端截图或其局部裁图；`03-输入任务` 和 `05-运行结果` 已把工作区账号名、本机路径打码。
- WorkBuddy 的六张图都来自本人桌面端截图或其局部裁图；登录页只保留输入框，没有展示真实手机号或账号。

## 5. 依赖说明

新增了 `remark-gfm`，因为 `react-markdown` 默认不渲染 GFM 表格，而教程允许使用表格。除此之外没有引入 UI 库、Tailwind 或动画库。

`next.config.ts` 里设置了 `agentRules: false`，避免 Next 16 在 `pnpm dev` 时自动往仓库的 `AGENTS.md` 追加内容。
