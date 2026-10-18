# 工具数据

`data/products/` 下 22 个 YAML，一个文件一个工具，**文件名就是 slug**（例如 `cursor.yaml` → `cursor`）。

这些文件是从起源AI 的内容库里导出的，字段的含义和站内工具页一致。要改也行，但记住：教程里的 `tool` 字段引用的是**文件名**，改了名要对得上。

## 字段

| 字段 | 类型 | 说明 |
|---|---|---|
| `name` | string | 展示名，例如 `Cursor`、`即梦AI` |
| `vendor` | string | 厂商 slug，例如 `anysphere`、`bytedance` |
| `category` | enum | `coding` / `image-video` / `agent`，决定它在左目录里归哪一组 |
| `form` | string | 形态，例如「独立 IDE + 桌面应用 + CLI」 |
| `tagline` | string | 一句话介绍，可以直接用在工具信息条里 |
| `intro` | string | 长一点的介绍 |
| `website` | string | 官网 |
| `openSource` | boolean | 是否开源 |
| `accessCN` | boolean | **官方**是否在中国大陆可用。注意：`false` 不等于「完全用不了」，见 `accessNote` |
| `accessNote` | string | 可用性说明，例如「官方国内不可用」 |
| `freeTier` | string | 免费档说明。注意有些写的是「有免费版（Hobby）」，有些写的是额度，别当成统一口径 |
| `logoUrl` | string \| null | 图标路径，指向 `public/icons/brands/`。**LibTV 是 null**，页面要给个兜底（首字母或色块），不要留破图 |

> 有四个工具共用别家的图标（千问办公和 Qoder 用 `qwen.svg`、WorkBuddy 用 `codebuddy.svg`、小云雀用 `doubao.svg`、ZCode 用 `zhipu.svg`），这是数据本身的样子，照用就行。
| `sourceUrls` | string[] | 这些字段的依据链接 |
| `verifiedAt` | string | 核对日期 |

## 分类分布

| 分类 | 数量 | 工具 |
|---|---|---|
| `coding`（编程工具） | 14 | Claude Code、Codex、Cursor、DeepSeek Harness、GitHub Copilot、Google Antigravity、Kimi Code、MiMo Code、MiniMax Code、OpenCode、Pi、Qoder、TRAE、ZCode |
| `image-video`（图像与视频） | 5 | 即梦AI、可灵AI、LibTV、Midjourney、小云雀 |
| `agent`（办公 Agent） | 3 | 豆包工作、千问办公、WorkBuddy |

## 怎么读

`src/lib/products.ts` 已经封装好了，页面里直接：

```ts
import { listProducts, groupProducts, getProduct } from '@/lib/products'

const groups = groupProducts()      // 按分好组
const one = getProduct('cursor')    // 单个，找不到返回 null
```

`accessCN === false` 的工具，教程里要如实写「官方国内不可用」，不要含糊成「国内可以用」。
