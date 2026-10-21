---
title: DeepSeek Harness 上手：装好、接上模型、跑通第一个任务
tool: deepseek-harness
summary: DeepSeek 开源智能体框架的上手：桌面版与命令行两种装法，接上模型后让它读懂项目、改对第一个文件。
updatedAt: 2026-10-21
screenshots:
  - /guides/deepseek-harness-guide/01-homepage.png
  - /guides/deepseek-harness-guide/02-download.png
  - /guides/deepseek-harness-guide/03-github.png
  - /guides/deepseek-harness-guide/04-models-page.png
  - /guides/deepseek-harness-guide/05-custom-model.png
  - /guides/deepseek-harness-guide/06-desktop.webp
  - /guides/deepseek-harness-guide/07-login.png
  - /guides/deepseek-harness-guide/08-login-success.png
sourceUrls:
  - https://www.deepseek.com/harness
  - https://www.deepseek.com/download/
  - https://www.deepseek.com/harness/privacy/
  - https://github.com/deepseek-ai/deepseek-harness
  - https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/user/guide/index.zh.md
  - https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/llm/llm-deepseek-account/README.zh.md
  - https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/user/guide/providers.zh.md
  - https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/cli-help.zh.md
---

> **这篇覆盖什么**：装好（桌面版 / 命令行）→ 选一条认证路线接上模型 → 选工作区 → 跑通第一个任务 → 接第三方或自定义模型 → 付费与排错。
>
> **你需要准备**：一个 DeepSeek 账号（走官方模型时用）或一个第三方/本地模型端点（走自定义模型时用）、一个放代码的文件夹、约 25 分钟。
>
> **状态说明**：本文依据官方站点、官方 README 与官方用户文档整理；登录流程用本人实机截图，其余配图为官方页面截图与官方文档配图。首次任务流程尚未实机验证，标注「待实机确认」的地方请在你机器上走一遍。

## 它能做什么

DeepSeek Harness（命令行叫 `dsh`）是深度求索开源的智能体框架，官方在 README 里把自己描述成「everything is a plugin」：模型、工具、会话、界面都是插件，装什么插件就有什么能力。

用它干活的形态是「给一个目录 + 一句话」：它自己拆步骤、读文件、跑命令。需要审批的操作会按当前的权限策略询问你——**是否询问、询问几次取决于策略配置**，不是固定每一步都弹窗。

适合：想让 AI 直接改项目文件、把「读代码 — 改代码 — 跑测试」串成流水线、用插件拼工作流的人。

不适合：只想在编辑器里补全几行代码的人；不愿意见到权限确认的人——即使不是每步都问，涉及写文件和执行命令时仍可能被拦下。

![DeepSeek Harness 官方首页：产品定位与下载入口（来源：官方页面 https://www.deepseek.com/harness）](/guides/deepseek-harness-guide/01-homepage.png)

## 国内怎么用

官方站点与开放平台都在国内可直接访问，档案里 `accessCN` 为 `true`。软件 MIT 许可、免费下载，不需要境外手机号和支付。

钱花在模型上：你可以用 DeepSeek 自己的模型（在开放平台申请 API 密钥，按 token 计费），也可以接第三方厂商或自建网关。需要注意的是，**装好软件不等于模型已经可用**，中间差一步「配置模型」。

官方隐私政策写明：走「官方模型服务」要注册并登录 DeepSeek 账号（手机号收验证码，作为网络实名制信息）；走「自定义模型服务」则**无需注册登录**，软件只做本地交互界面。

只用本地模型也能跑：Harness 支持自定义 OpenAI 兼容端点，把地址指向本机的 Ollama、vLLM 之类的服务即可。

## 安装

两条路选一条。桌面版省心，命令行版适合服务器和远程机器。

### 桌面版

1. 打开 <https://www.deepseek.com/download/>，页面顶部就是 DeepSeek Harness 桌面端。
2. Windows 选「下载适用于 Windows」，拿到的是 `.exe`；macOS 选 dmg，官方标注要求 Apple 芯片、macOS 13 或更高版本。
3. Windows 双击安装；macOS 打开 dmg 把应用拖进「应用程序」。
4. 装完打开，是一个原生窗口，里面跑的就是完整的网页版界面。

![官方下载页：Windows 与 macOS 两个入口，以及系统要求（来源：官方页面 https://www.deepseek.com/download/）](/guides/deepseek-harness-guide/02-download.png)

### 命令行版

先装 Node.js，然后运行官方 README 里给出的命令：

```bash
npx @deepseek-ai/dsh web
```

它会在 `http://127.0.0.1:3080` 起一个本地服务，并自动打开浏览器。不想自动打开就加 `--no-open`；端口被占用就加 `--port 8080` 换一个（这两个参数见官方 CLI 帮助 `dsh web --help`）。

想跑一次性任务、不打开界面，用 headless 模式。官方 CLI 帮助里的示例假定 `dsh` 已经装好：

```bash
dsh headless "跑一遍测试"
```

用 `npx` 启动、没有全局安装 `dsh` 时，按 npx 的语法把子命令接在后面：`npx @deepseek-ai/dsh headless "跑一遍测试"`。这种写法本文没有在干净环境验证过（官方 README 只给了 `npx ... web` 这一条），**待实机确认**。想先看参数，可以在主命令后加 `--help`。

### 从源码跑（可跳过）

要改它自己才需要：克隆仓库 → `pnpm install` → `pnpm run build` → `pnpm dsh web`；`build` 先准备产物，`pnpm dsh web` 直接用产物，不重新构建。

![官方 GitHub 仓库：MIT 许可、文档目录与 25 万+ star（来源：官方仓库 https://github.com/deepseek-ai/deepseek-harness）](/guides/deepseek-harness-guide/03-github.png)

核对版本：官方 README 在 2026-10 标注的是开发者预览（developer preview），并明确写了会有破坏性变更。你装到的版本可能更新，以下步骤以你本机为准。

## 登录与开通

这里要先分清 **「打开界面」** 和 **「模型能用」** 是两件事：打开界面不需要登录；让模型能回答，需要先选一条认证路线。官方有两条不同的路线，**不是同一种凭据**：

| 路线 | 用在哪 | 要准备什么 | 官方依据 |
|---|---|---|---|
| A. DeepSeek 账号 | 桌面端用官方模型 | DeepSeek 账号（手机号注册） | 隐私政策、账号插件文档 |
| B. API Key | Web UI / 桌面端用官方模型 | 开放平台申请的 API 密钥 | Web UI 指南、模型配置文档 |
| C. 自定义提供商 | 任意形态接第三方/本地模型 | 第三方的 Key 或本地端点，**不需要 DeepSeek 账号** | 模型配置文档、隐私政策 |

官方账号插件文档明确：账号 token 与 API Key 是两条鉴权路线，账号失败不会回退到 Key。所以「必须先拿 Key 才能用」对桌面账号路线不成立；只用自定义模型的人也不需要账号。

### 路线 A：桌面端用 DeepSeek 账号

桌面端可直接用 DeepSeek 账号登录，模型目录由账号服务下发，不必再去开放平台申请 Key。

这条路线的工作方式（依据官方账号插件文档）：

- **凭据**：用的是登录后的账号 token（请求头 `x-dsh-auth-token`），不是 API Key。
- **目录**：模型列表来自账号服务（`https://api.deepseek.com/models`），地址固定，不能自己改。
- **门控**：只有当前版本能用的模型才会出现；版本不够报 `CLIENT_UPGRADE_REQUIRED`，模型不支持报 `MODEL_UNSUPPORTED`。
- **失败不回退**：没登录或账号鉴权被拒时，请求以 `ACCOUNT_SIGN_IN_REQUIRED` 失败、目录为空，**不会自动改用 API Key**。
- **401 处理**：账号 token 失效报 `ACCOUNT_TOKEN_INVALID`，重新登录即可。

操作顺序：

1. 打开桌面端，登录会打开浏览器授权页：填 +86 手机号，点「发送验证码」，填验证码后点「登录」；也可以走右侧「微信扫码登录」，或点下方「密码登录」。未注册的手机号会自动注册。
2. 登录成功后浏览器显示「登录成功」，点「打开应用」回到桌面端。
3. 进「设置 → 模型」，确认 DeepSeek 账号这一路已经可用。
4. 回到会话，在模型选择器里选一个模型。选择器为空，说明账号没登录成功，或当前版本没有可用模型。
5. 先发一句「介绍一下你自己」确认能出结果，再继续后面的任务。

![登录页：+86 手机号、验证码与「发送验证码」，右侧是微信扫码登录（二维码已打码）（来源：本人实机截图，2026-10-21）](/guides/deepseek-harness-guide/07-login.png)

![登录成功后浏览器页：提示「登录成功」，可关闭页面或点「打开应用」返回桌面端（来源：本人实机截图，2026-10-21）](/guides/deepseek-harness-guide/08-login-success.png)

账号与 API Key 是两套并行凭据，互不回退；都保留时在模型设置里显式选一路。

### 路线 B：Web UI 填 API Key

官方的 Web UI 指南写得很直白：打开「设置 → 模型」，填 API 密钥并保存，模型路由立刻可用，不需要重启服务。

1. 打开 <https://platform.deepseek.com/>，用 DeepSeek 账号登录（与 Harness 通用）。
2. 在控制台找到 API Keys，新建并复制密钥（通常只显示一次）。
3. 打开 Harness，进入「设置 → 模型」，把密钥粘贴到 DeepSeek 卡片，保存。
4. 回到会话，模型选择器里能看到 DeepSeek 的模型，选中即可。

这个密钥是只写的：保存后页面拿到的是脱敏描述，不是原文；它存在 `$DSH_HOME/.credentials.yaml` 里，设置里只保留凭据引用。所以别指望回设置页把密钥再复制出来，丢了就重新生成一个。

![官方文档配图：设置 → 模型，DeepSeek 卡片上只有 API 密钥输入框（来源：官方文档 https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/user/guide/providers.zh.md）](/guides/deepseek-harness-guide/04-models-page.png)

## 跑通第一个任务

目标：让它先读懂项目，再改一个文件，全程看到它在做什么。

### 1. 选工作区

打开 Harness，第一次进来是空的。点「选择工作区」（Choose workspace），选一个放代码的文件夹。官方文档特别说明：**没选工作区之前输入框不可用**——新手最容易卡在这里。

### 2. 先让它读，不让它写

新建会话，输入：

```text
先读一遍这个目录，用三句话说明它是做什么的，不要改任何文件。
```

它会调用读文件工具，列出目录结构和关键文件再总结。先做这步，是确认它理解的是你的项目，不是照文件名猜。

### 3. 让它改一个文件

接着输入：

```text
在 README 末尾加一行「本地运行：先看 package.json 的 scripts」，只改这一处。
```

它会请求写文件权限——是否弹确认取决于当前权限策略。弹窗里能看到要改的文件和 diff，确认后才落盘；策略允许直接写入时可能不弹窗，按你本机实际行为为准。

### 4. 验收

打开 README，看到新增的那一行，任务就跑通了。这一步同时验证三件事：模型连上了、工具能读能写、权限策略在生效。

![官方下载页展示的桌面端界面：左侧工作区与会话，右侧对话区（来源：官方页面 https://www.deepseek.com/download/）](/guides/deepseek-harness-guide/06-desktop.webp)

之后可以试一句更长的：「找出这个项目里没有测试的模块，列出来，先不要动手。」能看出规划能力，又不会改文件。

## 接入自己的模型 / API Key

除了官方 DeepSeek 模型，还有两条路。

### 用目录里的第三方厂商

设置页点「添加模型提供商」，卡片默认停在「第三方模型提供商」。列表里是提供商 id，官方文档举的例子有 `anthropic`、`openai`、`moonshotai`（Kimi）、`zai`（GLM）。填密钥、保存，端点、协议和模型列表由内置目录提供。

认证那一栏的「?」写清了优先级：输入框留空时，使用已保存的凭据，或尝试读取列出的环境变量。绿色提示表示检测到了环境变量，黄色表示没检测到。注意：这个检测只说明变量存在，不校验密钥能不能用。

### 接自定义网关 / 本地模型

把卡片切到「自定义模型 API」，填五样：

- Provider ID：小写、永久，写错只能新建一个再删旧的。
- 基础 URL：网关或本地服务的地址。
- API 协议：三选一，OpenAI Chat Completions、OpenAI Responses、Anthropic Messages，必须和网关实际使用的那一种一致。
- 凭据（API 密钥）。
- 至少一个模型 ID。

模型 ID 可以手填，也可以点「获取可用模型」让端点自己报。官方提醒这只是便利功能：有的端点不按常见格式返回，抓不到就手填，效果一样。

![官方文档配图：自定义模型 API 表单，包含 Provider ID、地址、协议与密钥（来源：官方文档 https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/user/guide/providers.zh.md）](/guides/deepseek-harness-guide/05-custom-model.png)

接本地模型（Ollama、vLLM 之类）时，先确认本机服务已经起来，再把地址指过去。改完开一个新会话验证，老会话可能带着旧模型的上下文，报错会让人误判成配置没生效。

## 怎么付费

工具本身免费：Harness 是 MIT 许可的开源项目，桌面端也免费下载。钱花在模型调用上，按你接的服务计费。

用 DeepSeek 官方模型就在开放平台按 token 付费，输入和输出单价不同，缓存命中的输入更便宜，具体单价见 <https://api-docs.deepseek.com/quick_start/pricing>。接第三方厂商则按那家的价格结算，本站不写死数字。

智能体比聊天更费 token：一次任务要读多个文件、跑多轮工具调用，账单涨得比预期快。建议先小额充值，跑几天看日均消耗，再决定要不要开自动充值。

## 常见问题

> 依据类型：**官方**＝官方文档/README 写过；**建议**＝操作建议，未经实机验证。

**输入框是灰的，打不了字。** 现象是打开就有输入框但点不进去。原因是还没选工作区。怎么办：点「选择工作区」选一个目录；空目录也可以，先选上再说。（官方：Web UI 指南写明选中工作区前输入框不可用）

**报 `MISSING_CREDENTIAL`。** 现象是发消息立刻失败。原因是这个模型没有可用凭据。怎么办：到「设置 → 模型」给对应提供商存密钥，或按提示配置环境变量。（官方：providers 排错表）

**报 `UNKNOWN_MODEL`。** 现象是模型选不上或请求被拒。原因是当前提供商没有这个模型。怎么办：选一个已配置的模型，或在自定义提供商里补上缺失的模型 ID。（官方：providers 排错表）

**「获取可用模型」返回 401。** 现象是探测失败。原因是密钥不对。怎么办：检查密钥；也有的服务不提供 `GET /models` 端点，那就手动填模型 ID。（官方：providers 排错表）

**3080 端口被占用。** 现象是命令行启动报端口冲突。原因是上一次的进程没退干净。怎么办：关掉旧进程，或用 `dsh web --port 8080` 换端口。（官方：CLI 帮助列出 `--port`）

## 延伸阅读

- 官网：<https://www.deepseek.com/harness>
- 下载页：<https://www.deepseek.com/download/>
- 源码仓库：<https://github.com/deepseek-ai/deepseek-harness>
- 网页版使用指南：<https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/user/guide/index.zh.md>
- 模型接入说明：<https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/user/guide/providers.zh.md>
- 第三方：阿里云开发者社区《从 0 到 1 玩转 DeepSeek Harness》<https://developer.aliyun.com/article/1759911>（2026-09 发布；文中「Node ≥ 22」「Docker 镜像」等说法是作者经验，官方 README 只写「先装 Node.js」，未写最低版本，请以官方为准）
- 第三方：dshbase《DeepSeek Harness 上手实测：66 分钟跑完 RAID 重组》<https://dshbase.com/zh/blog/wx-dsh-raid-test/>（2026-08 发布；非官方社区站点，记录了四种模式、token 用量与「轨迹 → Skill」的用法，数据是作者单次任务，不能当通用基准）

版本说明：核对日期 2026-10-21。项目处于开发者预览阶段，官方明确说会有破坏性变更；菜单名称和启动参数以你本机与最新文档为准。
