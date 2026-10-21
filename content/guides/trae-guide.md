---
title: TRAE 国内版上手：下载、登录、跑通第一个项目
tool: trae
summary: 用国内手机号就能注册的 AI 开发工具，从官网下载到让它在工作区里生成第一个页面，按步骤写清楚。
updatedAt: 2026-10-21
screenshots:
  - /guides/trae-guide/01-home.png
  - /guides/trae-guide/02-download.png
  - /guides/trae-guide/03-quick-start.png
  - /guides/trae-guide/04-pricing.png
  - /guides/trae-guide/05-models.png
  - /guides/trae-guide/06-cli.png
sourceUrls:
  - https://www.trae.cn/
  - https://www.trae.cn/download
  - https://www.trae.cn/pricing
  - https://docs.trae.cn/ide_get-started-with-trae
  - https://docs.trae.cn/ide_models
  - https://docs.trae.cn/ide_what-is-trae-code
  - https://docs.trae.cn/ide_plans-and-billing
  - https://docs.trae.cn/cli_get-started-with-trae-cli-2
  - https://www.trae.ai/pricing
---

> **这篇覆盖什么**：装好（桌面端 / 网页端 / 插件 / CLI）→ 登录 → 跑通第一个页面 → 接自己的模型 → 付费与排错。
>
> **你需要准备**：一个手机号（或抖音、苹果、掘金账号）、一个空文件夹、约 20 分钟。
>
> **状态说明**：本文依据 TRAE 官网与官方文档整理，配图为官方公开页面截图。首次任务流程尚未在干净机器上完整实机验证，标注「待实机确认」的地方请以你本机界面为准。

## 它能做什么

TRAE 是字节跳动的 AI 开发工具。官方现在的说法是「为 AI 智能体设计的独立应用」，桌面端里包含 Agent 窗口和 IDE 窗口两种形态，另有网页端、移动端、编辑器插件和命令行。

适合：想试 AI 编程但不想折腾境外账号和支付的人；已经会用 VS Code、想加一个「对话改代码」入口的人；要快速搭一个能跑的前端页面。

不适合：需要重度自定义插件和调试配置的人——插件生态还在长；以及对代码上传有硬性合规要求的团队。

它和海外版最大的区别是站点、币种和档位：国内站用中文和人民币、有 Lite 档；海外站用英文和美元。两边的账号是否互通，官方没有说明，别默认能通用。

![TRAE 国内官网首页：中文站与「下载 TRAE」入口（来源：官方页面 https://www.trae.cn/）](/guides/trae-guide/01-home.png)

## 国内怎么用

国内版官网是 <https://www.trae.cn/>，文档是 <https://docs.trae.cn/>，`data/products/trae.yaml` 里 `accessCN` 是 `true`。

登录方式官方文档列了四种：手机号、抖音账号、苹果账号、稀土掘金账号。官网登录页实际显示的是 +86 手机号验证码、抖音登录、苹果登录和企业账号登录；邮箱注册没有找到官方依据。

付费方式按官方价格页写的是抖音支付、支付宝、微信支付。**实名认证没有找到官方依据**，本文不写「必须实名」；如果注册过程中出现身份验证，以页面提示为准。

海外版是 <https://www.trae.ai/>，英文界面、美元计价。国内访问的稳定性取决于你的网络，这一点官方没有给说明，本文也不替它下结论。

## 安装

四种形态，按需要选一种即可。

### 桌面端（推荐新手）

1. 打开 <https://www.trae.cn/download>，页面会按你的系统给一个主按钮，本次看到的是「TRAE Windows版」。
2. Windows 下的是安装包，双击安装；macOS 下的是 dmg，拖进「应用程序」。
3. 官方标注的系统要求：Windows 10 / 11 的 64 位（x64）；macOS 12.0 及以上，Apple Silicon 和 Intel 都支持；Linux 提供 `.deb` 与 `.rpm`。
4. 第一次打开如果 macOS 提示「无法验证开发者」，去「系统设置 → 隐私与安全性」点「仍要打开」。

![官方下载页：Windows 安装入口与「macOS 12.0+ / Windows 10、11 / .deb / .rpm」平台标注（来源：官方页面 https://www.trae.cn/download）](/guides/trae-guide/02-download.png)

### 网页端

不想装软件就用网页端：打开 <https://work.trae.cn/>，登录后直接建任务。公开页在未登录状态下会跳到登录页，本文没有截到可用界面，这一步**待实机确认**。

### 编辑器插件

官方提供 TraeCode Plugin，支持 VS Code、JetBrains 系列（GoLand、IntelliJ IDEA、PyCharm、CLion 等）和 Android Studio。在对应插件的市场里搜索 TRAE 安装即可。

### 命令行

官方有 TRAE CLI 2.0，是跑在本地终端里的编码智能体。按官方文档《快速开始》，安装命令逐字如下：

macOS / Linux（Bash）：

```bash
sh -c "$(curl -fsSL https://trae.cn/trae-cli/install_v2.sh)"
```

Windows（PowerShell）：

```powershell
irm https://trae.cn/trae-cli/install_v2.ps1 | iex
```

装完在终端里运行 `traecli` 启动。官方文档另注明：Windows 用户建议优先用 WSL2；用 Windows 原生版本时，首次启动需按界面提示完成沙箱初始化。

![TRAE CLI 2.0 官方文档：适用环境与两行安装命令（来源：官方文档 https://docs.trae.cn/cli_get-started-with-trae-cli-2）](/guides/trae-guide/06-cli.png)

核对版本：以上信息核对于 2026-10-21。TRAE 在 2026 年做过一次改版（TraeCode 与 TraeWork 融合），旧教程里的 Builder、Chat 等叫法可能已经对不上，界面以你本机为准。

## 登录与开通

1. 打开 TRAE，首次启动会停在登录页。
2. 选一种方式登录：+86 手机号收验证码，或抖音、苹果账号，或企业账号。
3. 勾选协议后进入主界面。

官方文档对登录方式的原文是「使用手机号、抖音账号、苹果账号或稀土掘金账号登录 TRAE」，和登录页实际显示的入口略有出入，以你看到的按钮为准。

![官方快速开始文档：支持的系统、安装步骤与登录方式原文（来源：官方文档 https://docs.trae.cn/ide_get-started-with-trae）](/guides/trae-guide/03-quick-start.png)

登录后先看两件事：

- **免费档**：官方价格页写的是「免费 Free」，每月 500 积分，所有功能均可免费使用，支持 2 个云端任务同时执行。
- **新用户福利**：官方另有注册赠送积分和每月登录赠送，具体数额随活动调整，以价格页为准。

![官方定价页：免费 Free 与 Lite / Pro / Pro+ / Ultra 四档付费方案（来源：官方页面 https://www.trae.cn/pricing）](/guides/trae-guide/04-pricing.png)

积分只在使用 TRAE 内置模型时消耗，调用自定义模型不消耗积分——这一点在下面的「接入自己的模型」里还会用到。

## 跑通第一个任务

目标：让它在一个空文件夹里生成一个能打开的页面。以下步骤按官方「双形态」描述写，具体按钮文案以你本机版本为准（**待实机确认**）。

### 1. 建一个空文件夹

在桌面新建 `trae-demo` 文件夹。路径建议用纯英文，后面跑命令会少一类麻烦。

### 2. 用 TRAE 打开这个文件夹

打开桌面端，选「打开文件夹」，选中 `trae-demo`。IDE 窗口的左侧会出现文件树，现在是空的。

### 3. 切到 Agent 窗口下指令

TRAE 桌面端有 Agent 窗口和 IDE 窗口两种形态，生成类任务在 Agent 窗口里发。输入：

```text
做一个单页 HTML：标题是「我的第一个页面」，下面一个输入框和一个按钮，点按钮把输入框内容显示在页面上。只生成一个 index.html。
```

### 4. 看它写了什么

它会把文件写进工作区，左侧文件树里出现 `index.html`。改动通常会以 diff 形式展示，确认后才会落盘。

### 5. 验收

双击 `index.html` 用浏览器打开，输入几个字点按钮，页面上出现你输入的内容，就算跑通。

这一步同时验证三件事：账号能登录、模型能出结果、它能改工作区文件。之后可以再让它「把按钮颜色改成红色，只改 CSS」——这类小改动最容易看出它是否真的改对了位置。

## 接入自己的模型 / API Key

内置模型够用，但如果你有自己的 API 额度，TRAE 支持接进来，而且不消耗积分。

官方路径：**设置 → 模型 → 添加模型**。两种来源：

- **预设模型服务商**：填 API 密钥，按量计费、Coding Plan、Agent Plan 三种计费方式可选。
- **自定义模型**：自己填 API 格式、请求地址、模型 ID 和鉴权信息。

API 格式支持两种：OpenAI Chat Completions 和 Anthropic Messages。选错格式的表现是请求一直失败，这时先核对网关实际用的是哪一种。

![官方模型文档：设置 > 模型 > 添加模型，以及「添加模型」窗口里的服务商列表（来源：官方文档 https://docs.trae.cn/ide_models）](/guides/trae-guide/05-models.png)

## 怎么付费

先用免费档：每月 500 积分，日常小任务够用一阵；新用户另有注册赠送，具体以价格页活动为准。

需要更多再升级。国内版付费档是 **Lite、Pro、Pro+、Ultra** 四档，档位越高积分和云端任务并发越多。具体金额、连续包月折扣和当期活动以官方价格页 <https://www.trae.cn/pricing> 为准，**本文不写死价格**——价格和活动调整频繁，写死容易过期。

注意官方对套餐与积分有效期的写法是「31 个自然日」，不是自然月；免费用户每月登录赠送的积分另有当期规则。

## 常见问题

> 依据类型：**官方**＝官方文档写过；**建议**＝操作建议，未经实机验证。

**手机号收不到验证码。** 现象是倒计时结束也没短信。原因可能是号段被限流，或短时间内发过多次。怎么办：等几分钟再试；同一网络下频繁注册也容易触发风控。（建议）

**Agent 生成到一半停了。** 现象是文件只写了一半，或提示额度不足。原因是用量到顶或网络断了。怎么办：先看额度；额度够就让它「继续完成」，不要重新开一个会话从头生成。（建议）

**提示额度不足，但我才用了几下。** 现象是积分掉得比预期快。原因是内置模型按 token 计费，长对话和读大文件都算。怎么办：把任务拆小；或接自定义模型（不消耗积分）。（官方：计费文档写明仅内置模型消耗积分）

**打开项目提示找不到 Node。** 现象是终端里报 `node: command not found`。原因是项目需要本地构建，但机器没装 Node。怎么办：装 Node 后重开 TRAE，在终端里敲 `node -v` 确认。（建议）

**设置里找不到「添加模型」。** 现象是按旧教程找菜单找不到。原因是 2026 年改版后入口在「设置 → 模型」。怎么办：在设置里搜「模型」；还找不到就问 Agent「怎么配置自定义模型」。（官方：<https://docs.trae.cn/ide_models> 写明「设置 > 模型」）

## 延伸阅读

- 国内官网：<https://www.trae.cn/>
- 下载页：<https://www.trae.cn/download>
- 快速开始：<https://docs.trae.cn/ide_get-started-with-trae>
- 模型与计费：<https://docs.trae.cn/ide_plans-and-billing>
- CLI 2.0 快速开始：<https://docs.trae.cn/cli_get-started-with-trae-cli-2>
- 国际站定价（新增 global 免费档的依据）：<https://www.trae.ai/pricing>
- 第三方：阮一峰《Trae 国内版出来了，真的好用吗？》<https://www.ruanyifeng.com/blog/2025/03/trae.html>（2025-03 写，界面与模型已过时，可看思路）
- 第三方：腾讯云开发者社区《Trae 实测：AI 助力前端开发》<https://cloud.tencent.com.cn/developer/article/2516375>（2025-04 写，同样有过时内容）

版本说明：核对日期 2026-10-21。TRAE 改版频繁，菜单名称和积分规则以你本机与官方页面为准。
