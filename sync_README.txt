全量同步脚本使用说明（sync.ps1）

位置
- 开发目录（当前目录）：D:\Desktop\网站构建
- 发布仓库目录：D:\Desktop\建2（git）\frymif.github.io
- 同步脚本：sync.ps1

脚本做什么
- 把“开发目录”里的网站文件全量复制到“发布仓库目录”
- 默认不会删除发布仓库里已有但开发目录不存在的文件（安全）
- 自动跳过这些内容（不会覆盖/不会同步）：
  - .git、node_modules 目录
  - CNAME（避免域名配置被覆盖）
  - .gitignore（避免忽略规则被覆盖）
  - sync.ps1（避免把脚本同步到发布仓库）
  - 常见备份/临时文件：*.bak、*.bak_*、*.tmp、*.swp、*.swo、~$*

一、推荐用法（最安全）
1) 预演（不会真的复制，只显示将要发生什么）
   - 在 D:\Desktop\网站构建 里运行：
     .\sync.ps1 -WhatIf

2) 正式同步（实际复制）
   - 在 D:\Desktop\网站构建 里运行：
     .\sync.ps1

3) 提交并发布（在发布仓库目录执行）
   - cd "D:\Desktop\建2（git）\frymif.github.io"
   - git status
   - git add -A
   - git commit -m "这里写中文提交信息"
   - git push

二、镜像同步（危险：会删除发布仓库中“开发目录不存在”的文件）
仅当你明确需要“发布仓库完全与开发目录一致（包含删除多余文件）”时使用：
- 在 D:\Desktop\网站构建 里运行：
  .\sync.ps1 -Mirror -Yes

提示
- 如果你只想同步某几个文件：不建议用 -Mirror；可以直接手动复制对应文件到发布仓库目录后再 git 提交。
- 同步后脚本会自动在发布仓库目录执行一次 git status（若该目录存在 .git 且系统能运行 git）。

