---
title: Cursor 上手教程：装好、登录、跑通第一个任务
tool: cursor
summary: 给第一次用 Cursor 的人：从官网下载到让它改好第一个文件，每一步写清点哪里、输入什么、看到什么，并说明现行套餐与自带 Key 的限制。
updatedAt: 2026-10-21
screenshots:
  - /guides/cursor-guide/01-download.png
  - /guides/cursor-guide/02-quickstart.png
  - /guides/cursor-guide/03-pricing.png
  - /guides/cursor-guide/04-api-keys.png
  - /guides/cursor-guide/05-cli.png
  - /guides/cursor-guide/06-agent.png
sourceUrls:
  - https://cursor.com/docs/get-started/quickstart
  - https://cursor.com/download
  - https://cursor.com/pricing
  - https://cursor.com/docs/models-and-pricing
  - https://cursor.com/docs/agent/overview
  - https://cursor.com/help/models-and-usage/api-keys
  - https://cursor.com/docs/cli/installation
  - https://cursor.com/docs/cli/reference/authentication
  - https://cursor.com/docs/account/regions
---

> **这篇覆盖什么**：看清三种形态 → 装好 → 登录 → 跑通第一个任务 → 接入自己的 API Key → 套餐与用量 → 排错。
>
> **你需要准备**：一个能注册 Cursor 的账号、一个放代码的文件夹、约 20 分钟。
>
> **状态说明**：本文依据 Cursor 官方文档、定价页与帮助中心整理，配图为官方公开页面截图。安装与首次任务流程尚未实机验证，标注「待实机确认」的地方请以你本机为准。

## 它能做什么

Cursor 从「AI 编辑器」改成了 agent-first 的工作台：桌面端负责编辑器和 Agent，终端有 CLI，浏览器里有云端 agent。官方对 Agent 的定义很直接——能独立完成复杂编码任务、执行终端命令、修改代码，侧边栏用 `Ctrl+I` 唤起。

适合：接手陌生代码库、想先让它讲清结构再动手的人；需要一次改多个文件、还要看 diff 再决定接不接受的人；想把终端里的重复操作交给 agent 的人。

不适合：只需要补全几行代码的人（有更轻的工具）；完全不想注册账号、也不想付费的人——免费档用量有限。

![官方下载页：产品分 Desktop / Terminal / Web 三种形态，右下是 Web 入口（来源：官方页面 https://cursor.com/download）](/guides/cursor-guide/01-download.png)

## 国内怎么用

**官方没有一句「中国大陆可用」或「不可用」的表述。** 能找到的官方口径只有两条：部分模型因为供应商的地区限制，在特定区域不显示，其余模型照常可用；服务受美国出口管制与制裁条款约束。

本站工具档案里它的 `accessCN` 标为 `false`，地区标签按 `accessLabel` 显示「官方未声明国内支持」，说明写的是「官方未声明中国大陆支持；部分模型受供应商地区限制可能不显示」。这是本站的判断，不是官方声明，所以你看到「某教程说国内能用」时，两边说的都不是官方结论。

实际影响有两件事：部分模型可能不出现在模型列表里；升级付费时能用的支付方式以页面实际提供的为准。**免费档可以直接开始用**，不需要先付款；「必须境外手机号」「必须境外支付」这两种说法没有找到官方依据，本文不写。注册与支付环节的真实限制属于待确认项，以你打开页面时看到的提示为准。

## 安装

三种形态，先装桌面端。

### 桌面端

1. 打开 <https://cursor.com/download>，页面会按你的系统给按钮。Windows 上是 `Download for Windows`，macOS 上是 `Download for macOS`。
2. 官方系统要求：macOS 12（Monterey）及以上、Windows 10 及以上；macOS 是 dmg，Windows 是 exe。
3. Linux 按发行版装。官方推荐 apt：

```bash
curl -fsSL https://downloads.cursor.com/keys/anysphere.asc | gpg --dearmor | sudo tee /etc/apt/keyrings/cursor.gpg > /dev/null
echo "deb [arch=amd64,arm64 signed-by=/etc/apt/keyrings/cursor.gpg] https://downloads.cursor.com/aptrepo stable main" | sudo tee /etc/apt/sources.list.d/cursor.list > /dev/null
sudo apt update
sudo apt install cursor
```

不装仓库包也可以下载 AppImage：`chmod +x Cursor-*.AppImage` 后直接运行。官方说明 apt 与 yum 包比 AppImage 多桌面图标、自动更新和 CLI 工具。

![官方快速开始：第 1 步安装并登录，折叠块里是三个平台的要求；第 2 步用 Ctrl+I 唤起 Agent（来源：官方文档 https://cursor.com/docs/get-started/quickstart）](/guides/cursor-guide/02-quickstart.png)

### 命令行

不装桌面端也能用 CLI。官方命令逐字如下：

macOS / Linux / WSL：

```bash
curl https://cursor.com/install -fsS | bash
```

Windows（PowerShell）：

```powershell
irm 'https://cursor.com/install?win32=true' | iex
```

装完用 `agent --version` 验证。

CLI 的登录凭据和模型供应商的 Key 不是一回事：CLI 用 Cursor 账号登录（浏览器授权，或给 CLI 一个 Cursor 用户 Key）；而下面「接入自己的模型」里填的是 OpenAI、Anthropic 等厂商自己的 Key。两者别混用。官方 CLI 认证说明见 <https://cursor.com/docs/cli/reference/authentication>。

![官方 CLI 安装页：一行安装命令与 `agent --version` 验证方式（来源：官方文档 https://cursor.com/docs/cli/installation）](/guides/cursor-guide/05-cli.png)

### 网页端

下载页右下角有 `Start Cursor in Web`，可以在浏览器里直接跑云端 agent。功能与桌面端不完全一样，适合临时用。

## 登录与开通

1. 打开 Cursor，按提示登录。
2. 官方条款写明可以用邮箱 + 密码注册；CLI 另支持浏览器登录和 API Key 两种方式。
3. 登录后选一个文件夹打开，就进主界面了。

免费档现在就叫 **Free**，用量标注为 Limited：能用 Agent、Chat、Tab 补全，模型是 Cursor 自家的 Grok 与 Composer。老教程里的 **Hobby** 已经是旧档名称，老用户保留、新用户不再看到这个名字。

## 跑通第一个任务

目标：让它先讲清项目结构，再改一处小地方，最后自己看 diff 决定接不接受。

### 1. 打开一个文件夹

打开 Cursor，选「打开文件夹」，选一个你熟悉的小项目。没有项目就新建一个空文件夹，放一个 `index.html` 进去。

### 2. 让它解释代码

按 `Ctrl+I` 唤起 Agent，输入：

```text
解释这个代码库：主要入口在哪、关键模块是什么、动手改之前我应该先读哪几个文件。
```

它会自己搜仓库、读文件，然后给你一段总结。这一步是用来看它「理解得对不对」的，不需要它改任何东西。

### 3. 让它改一处

接着输入：

```text
先只改一处：把这个页面的标题文字改成「我的第一个页面」，不要动其他文件。
```

它会把改动做成 diff。重点看两件事：改的是不是你指定那一处、有没有顺手动别的文件。

### 4. 验收

确认 diff 没问题再接受，然后用浏览器打开页面看结果。到这一步，注册、登录、Agent 读代码、改文件四条链路都验证过了。

### 5. 大改用 Plan Mode

改动跨多个文件时，在输入框按 `Shift+Tab` 开 Plan Mode。它会先调研、问你几个问题、给一份计划，等你批准后才动手。官方推荐的做法是：先让它给计划，再逐条确认。

![官方 Agent 文档：Agent 能独立完成编码任务、执行终端命令，用 Ctrl+I 在侧边栏唤起（来源：官方文档 https://cursor.com/docs/agent/overview）](/guides/cursor-guide/06-agent.png)

## 接入自己的模型 / API Key

可以填自己的 Key，但**只对 chat 模型生效，Tab 补全仍然走 Cursor 自带模型**，而且不同档位限制不同。

官方步骤：

1. 打开 **Cursor Settings > Models**。
2. 选供应商：OpenAI、Anthropic、Google、Azure OpenAI、AWS Bedrock。
3. 把对应厂商的 Key 粘进去，点保存。

注意两点官方写明的事实：

- **Plus 档不含自带 Key**。定价文档在 Plus 那一行列的「不支持」里明确写了 "your own API keys"。
- 官方列的是五家厂商的官方 Key，**没有找到「自定义 Base URL / 任意 OpenAI 兼容端点」的依据**。所以别把「能填 Key」理解成「能接任何兼容接口」。

![官方帮助中心「Bring your own API key」：四步入口与支持的五家厂商（来源：官方文档 https://cursor.com/help/models-and-usage/api-keys）](/guides/cursor-guide/04-api-keys.png)

## 怎么付费

现行是 The X Subscription 体系，个人档五档：**Free、Plus、Premium、Super、Ultra**，用量依次递增；Premium 起加云 Agent、Bugbot 等能力，第三方模型按 API 挂牌价从预付余额扣。旧的 Pro、Pro+ 已经归入 legacy，新用户买不到，老教程里的档位和价格对不上是正常的。

具体金额、年付折扣和当地税费以官方定价页 <https://cursor.com/pricing> 为准，**本文不写死价格**——价格和档位调整很频繁，写死容易过期。

付费档的用量是**一个按周刷新的池**，Grok 与 Cursor 共用；第三方模型（Claude、GPT 等）不在池里，Premium 及以上按 API 挂牌价另算。要不要升级，先看免费档够不够你用。

![官方定价页：Free / Plus / Premium / Super 等档位与各自用量倍数（来源：官方页面 https://cursor.com/pricing）](/guides/cursor-guide/03-pricing.png)

## 常见问题

> 下面每条都标了依据类型：**官方**＝官方文档/条款写过；**建议**＝本文作者的操作建议，未经实机验证。

**注册页打不开或一直验证。** 现象是登录域名停在安全验证页。原因可能是网络或人机校验。怎么办：换网络重试；CLI 用户可以改用浏览器登录或给 CLI 配置用户 Key。（建议）

**模型列表里少了几项。** 现象是别人教程里的模型你看不到。原因是部分模型受供应商地区限制不显示。怎么办：换一个可用模型即可，不是安装错了。（官方：地区限制说明 <https://cursor.com/docs/account/regions>）

**`Ctrl+I` 没反应。** 现象是光标在闪但没弹 Agent。原因是焦点不在编辑器，或快捷键被系统占用。怎么办：先点一下代码区域再按；macOS 上是 `Cmd+I`。（官方：快速开始写明 Ctrl+I/Cmd+I）

**它说改了，但文件没变。** 现象是 diff 一闪而过。原因是没点接受就关掉了。怎么办：重新下指令，这次在 diff 上点接受；或先用 Plan Mode 让它只出计划。（建议）

**填了自己的 Key 却不生效。** 现象是设置里保存成功，对话还在用自带模型。原因可能有两个：当前档位不含自带 Key，或你填的 Key 只对 chat 模型生效、Tab 补全本来就不走它。怎么办：先确认档位，再确认你测的是对话而不是补全。（官方：<https://cursor.com/help/models-and-usage/api-keys>）

## 延伸阅读

- 官方文档：<https://cursor.com/docs>
- 快速开始：<https://cursor.com/docs/get-started/quickstart>
- 模型与定价：<https://cursor.com/docs/models-and-pricing>
- 自带 API Key：<https://cursor.com/help/models-and-usage/api-keys>
- CLI 安装：<https://cursor.com/docs/cli/installation>
- 第三方：腾讯云开发者社区《10 分钟用 Cursor 搭建个人博客》<https://cloud.tencent.com.cn/developer/article/2530217>（2025-06 写，讲 Ctrl+K 就地改写，官网域名与套餐已过时）
- 第三方：华为云社区《快速上手 Cursor》<https://bbs.huaweicloud.com/blogs/461693>（2025-09 写，讲 Ctrl+K / Ctrl+L 分工，API Key 设置入口已过时）

版本说明：核对日期 2026-10-21。Cursor 在 2026 年改过订阅体系与产品形态，旧教程里的 Pro 档、Hobby 免费档、两个月度用量池都已过时；界面以你本机为准。
