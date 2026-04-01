# 小红书海报编辑器

一个面向黑客松、活动招募和人物海报场景的单模板编辑器。  
左侧改文案、改高亮、传人物图，右侧实时生成最终海报，并可直接导出 PNG。

[在线体验](https://xhs-hackathon-poster.vercel.app) · [开源发布说明](./docs/open-source-release.md) · [内置 Skill](./skills/xhs-poster-editor/SKILL.md)

![项目预览图](./.github/assets/social-preview-example.png)

## 这个项目能做什么

- 实时替换账号名、标题、正文
- 支持 `1-4` 行正文布局切换
- 支持选择高亮行，并切换预设 / 自定义高亮颜色
- 上传人物图片后立即预览，可微调缩放、左右、上下偏移
- 直接导出成品 PNG
- 纯前端运行，可部署到 Vercel 等静态托管平台

## 在线地址

- 演示站：`https://xhs-hackathon-poster.vercel.app`

## 本地启动

这个项目当前是纯静态前端，最简单的启动方式是：

```bash
npm install
npm run dev
```

然后访问：

```bash
http://127.0.0.1:4174/
```

如果你更喜欢用 FastAPI 本地预览，也可以：

```bash
uvicorn server:app --host 127.0.0.1 --port 4174
```

## 校验脚本

项目自带了几条 Playwright 校验脚本，用来做视觉回归：

```bash
npm run verify:body-lines
npm run verify:upload
```

如果要重新生成 README 封面图：

```bash
npm run capture:cover
```

## 素材说明

这个仓库默认是“可运行演示版”开源方案：

- 仓库包含的是 demo 运行素材和截图资源
- 不默认公开原始 PSD、商用字体和私有测试图
- 如果你拥有对应素材的分发权，可以在本地自行放回这些文件

额外说明：

- 根目录下若存在 `2.ttf`，页面会优先使用它来逼近原模板字体效果
- 如果没有该字体文件，页面会自动回退到系统字体，功能不受影响，但视觉不会 1:1
- 私有 PSD 素材导出脚本见 [scripts/export_template_assets.py](./scripts/export_template_assets.py)

## 项目结构

```text
.
├── index.html / styles.css / app.js   # 前端编辑器
├── assets/                            # 运行时 demo 素材
├── scripts/                           # Playwright 校验与辅助脚本
├── docs/                              # 开源发布和自定义说明
├── skills/xhs-poster-editor/          # 给后续 agent / 维护者复用的方法论
├── server.py                          # 可选本地预览服务
└── vercel.json                        # Vercel 静态部署配置
```

## 适合谁用

- 黑客松或活动运营，希望快速批量换文案和人物图
- 设计给出单模板后，需要前端做轻量自助编辑器
- 需要一个“高保真但不做完整设计工具”的海报模板系统参考实现

## 不包含什么

- 不包含完整设计系统
- 不包含多模板管理后台
- 不包含用户登录、云存储、任务队列
- 不默认包含可公开分发的原始 PSD 和商用字体

## Skill 有什么用

仓库里附带了一个 `xhs-poster-editor` skill，用来沉淀这类项目的通用方法论，例如：

- 什么时候该走 PSD 驱动，什么时候该改成参数化模板
- 如何拆海报里的标题、正文、高亮、头像框
- 为什么必须先做单案例视觉验收
- 如何用 Playwright 做上传图片和排版回归检查

它更像给后续维护者和 agent 的“项目操作手册”，不是 README 的替代品。

## License

本仓库默认使用 [MIT License](./LICENSE)。

## 免责声明

这个项目是一个开源的海报编辑器示例，不代表与小红书官方存在合作或背书关系。  
如果你要公开分发模板素材、品牌元素、字体或人物图，请先确认你拥有相应权限。
