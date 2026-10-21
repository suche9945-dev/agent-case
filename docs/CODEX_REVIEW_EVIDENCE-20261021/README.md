# Codex 独立验收证据

生成于 2026-10-21。命令日志、浏览器 DOM 测量、截图、内容图片计量及隔离反例。

- baseline.json / scope.txt：开始前的分支、HEAD、19 个已修改与 39 个未跟踪文件，全部 194 个原文件哈希。
- build/typecheck/import-guides/verify-*.log：真实命令输出。
- independent-probes.json：真实 CLI 失败退出码与旧 JSON 保留；测试故意失败时的退出码。
- markdown-fixture.json / .jpg：真实生产渲染的错位和重复 ID。
- browser-1440.json / browser-responsive.json 与 18 张页面截图：实际视口均记录 innerWidth。
- keyboard-*.json / mobile-768.json / interaction-fold.json / scroll-active-1440.json：真实键盘、折叠、移动选择、桌面滚动证据。
- cached-empty/fresh-empty/restored.json：进程缓存、重启空态和恢复检查。
- content-images.json 与 *-contact.jpg：五篇字数及 30 张原图尺寸、大小、缩略总览。
- official-status.json：读取官方来源失败后，直接 HTTP 回退的状态；200 不等于页面正文或具体事实已核实。
- boundary-result.json：隔离目录连接绕过真实文件边界的反例。

自定义脚本里的绝对路径保留为本次环境记录；复现时应调整到你自己的隔离目录，且所有临时数据必须先备份并恢复。没有包含账号、Key、私密配置、完整第三方网页正文或 node_modules。
