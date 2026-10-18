# AGENTS.md · 这个仓库的规矩

这是一个实习生考察 case：做工具指南页面 + 5 篇教程。你先读 `README.md`，再读 `docs/任务书.md`，那是完整要求。

## 动手前

- 通读 `docs/任务书.md` 和 `docs/验收清单.md`。
- **双击 `design-demo/index.html`**，把整站设计 demo 点一遍（首页、模型、工具、比赛、搜索、主题切换）。
- 看 `docs/参考/` 里的 priceai 截图，那是页面**结构**的参照。
- 看一眼 `content/README.md`（教程格式 + 导入脚本契约）和 `data/README.md`（工具字段）。

## 硬规则

1. `src/app/layout.tsx` 是站点外壳，尽量别重做（只加导航项）。数据、令牌、`products.ts` 想改可以改，但改完要保证 `pnpm build` 过、教程里的 `tool` 还对得上。
2. 颜色、间距、圆角优先用 `tokens.css` 的变量；组件样式写 `*.module.css`。内页是 `data-skin="paper"`（浅色），别改回深色。
3. TypeScript `strict`，不许 `any`。
4. 不引 Tailwind、UI 库、外部字体、外部图片、CDN。
5. 教程正文不许硬编码进组件，必须走 `content/guides/*.md` → `pnpm import:guides` → `data/guides.json` → 页面。
6. 教程要自己实机跑通；配图可以用自己的、官方的、别人教程里的，但**每张都要标来源**，且至少 2 张是自己截的。不许 AI 生成假界面。

## 完成标准

`pnpm build`、`pnpm typecheck`、`pnpm import:guides` 都通过，`docs/验收清单.md` 逐条能演示。

## 提交

分支 `intern/<你的名字>`，分阶段提交，不要直接推 `main`。
