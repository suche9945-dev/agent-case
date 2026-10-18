# 工具指南页面 · 实习生考察 case

起源AI 站内已经有 22 个 AI 工具的档案（编程、图像视频、办公 Agent 三类），但用户看完工具卡还是不知道**这东西到底怎么用起来**。

这个 case 要你做两件事：

1. **把工具指南页面做出来** —— 一个文档式的页面，左边是 22 个工具的目录，点进去是教程。
2. **挑 5 个工具，自己装上、跑通、写教程，再导进页面里** —— 不是抄官方文档，是你实机走一遍之后写给别人看的。

参考页面：[priceai.cc/guides](https://priceai.cc/guides)（截图在 `docs/参考/`）。**学它的结构，不要抄它的配色和文案。**

## 先看一眼我们的网站

**双击 `design-demo/index.html`**，用 Chrome 或 Edge 打开。这是完整的可交互设计 demo：首页、模型榜、工具筛选、比赛赛程、搜索、三种皮肤切换，全部能点，断网也能用。

要写页面、要看实现，用的是根目录这个 Next.js 项目，不是 demo 里的那套单文件代码。

## 你要交的四样东西

| # | 交付物 | 位置 |
|---|---|---|
| 1 | 工具指南页面（总览页 + 教程详情页） | `src/app/guides/` |
| 2 | 导入脚本，把 `content/guides/*.md` 变成页面数据 | `scripts/import-guides.mjs` |
| 3 | 5 篇教程 + 配图（至少 2 张自己实机截的） | `content/guides/` + `public/guides/` |
| 4 | 交付说明：怎么跑、做了什么取舍、为什么选这 5 个 | `DELIVERY.md` |

## 先跑起来

```bash
pnpm install
pnpm dev          # http://localhost:3000/guides
pnpm build        # 交之前必须能过
pnpm typecheck    # 交之前必须能过
```

Node 20.9 以上。`/guides` 现在是占位页，只证明 22 个工具的数据能读出来——把它换成真正的页面。

> 启动时如果看到 `Watchpack Error ... lstat 'D:\System Volume Information'`，是 Next 的文件监听扫到了 D 盘根目录，**不影响使用，忽略即可**。

## 仓库里已经有什么

| 路径 | 说明 |
|---|---|
| `data/products/*.yaml` | 22 个工具的档案，一个文件一个工具，文件名就是 slug。可以改，但教程里的 `tool` 要对得上 |
| `src/lib/products.ts` | 读工具数据的现成函数（`listProducts` / `groupProducts` / `getProduct`），已经验证过 22 个文件都能解析 |
| `src/lib/guides.ts` | 教程数据的类型和读取函数，读的是 `data/guides.json`（现在还是空数组） |
| `src/styles/tokens.css` | 设计令牌。颜色、间距、圆角只能用这里的变量 |
| `design-demo/` | **完整设计 demo**（可交互），双击 `index.html` 看 |
| `src/app/layout.tsx` | 站点外壳（顶栏 + 页脚），已经和站内一致，不要重做 |
| `public/icons/brands/` | 工具 logo（22 个工具里 21 个有图标，LibTV 没有） |
| `docs/参考/` | priceai 参考页的截图（三栏结构）+ 该学什么、别学什么 |
| `content/README.md` | 教程文件格式和导入脚本的契约，**动手前先读** |

## 往下读

- [`docs/任务书.md`](docs/任务书.md) —— 完整要求，开工前通读一遍
- [`docs/验收清单.md`](docs/验收清单.md) —— 交之前逐条自检
- [`docs/评分表.md`](docs/评分表.md) —— 我们会怎么评
- [`content/README.md`](content/README.md) —— 教程怎么写、导入脚本要满足什么
- [`data/README.md`](data/README.md) —— 工具数据有哪些字段

## 怎么交

1. 从 `main` 拉分支：`intern/<你的名字>`，**不要直接推 main**。
2. 分几次提交（骨架 → 页面 → 导入脚本 → 每篇教程一个提交），让我们看得出过程。
3. 推上去，在 PR / 交付说明里写清楚哪一步做了什么、卡在哪里、怎么解决的。

**两天内交。** 第 1 天把「页面 + 导入链路 + 第 1 篇教程」跑通，第 2 天补完剩下 4 篇和收尾。卡住超过半天就在群里问，不要硬憋。
