<!-- 开 PR 时把下面每一项都填掉，空着的直接退回。 -->

## 我做了什么

<!-- 按阶段列：页面 / 导入脚本 / 每篇教程，一句话一步 -->

## 交付物

- [ ] `/guides` 总览页（左目录 22 个工具 / 正文 / 右侧本页目录）
- [ ] `/guides/[slug]` 教程页（工具信息条、TOC 滚动高亮、上一篇下一篇、404）
- [ ] `scripts/import-guides.mjs`，`pnpm import:guides` 能跑
- [ ] 5 篇教程（`content/guides/*.md` + `public/guides/<slug>/` 配图）
- [ ] `DELIVERY.md`

## 5 篇教程

| # | 工具 | 分类 | 正文约多少字 | 配图数 | 其中自己实机截图数 |
|---|---|---|---|---|---|
| 1 |  |  |  |  |  |
| 2 |  |  |  |  |  |
| 3 |  |  |  |  |  |
| 4 |  |  |  |  |  |
| 5 |  |  |  |  |  |

覆盖的分类：<!-- 编程工具 / 图像与视频 / 办公 Agent，至少 2 类 -->

## 怎么跑

```bash
pnpm install
pnpm dev          # http://localhost:3000/guides
pnpm import:guides
```

## 自检（对应 `docs/验收清单.md`）

- [ ] `pnpm build` 通过
- [ ] `pnpm typecheck` 通过
- [ ] `pnpm import:guides` 连跑两次，`data/guides.json` 完全一致
- [ ] 1440 / 768 / 390 三个宽度没有横向滚动、没有重叠
- [ ] 没有 `any`，没有写死色值（只在 `tokens.css` 里出现）
- [ ] 没改 `data/products/`、`src/styles/tokens.css`、`src/lib/products.ts`
- [ ] 每篇截图都标了来源，隐私信息已打码

## 已知问题 / 没做完

<!-- 写清楚卡在哪、试了什么。没做完不可耻，藏着才扣分。 -->
