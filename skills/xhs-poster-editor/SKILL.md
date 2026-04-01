---
name: xhs-poster-editor
description: 用于单模板海报编辑器项目，指导如何拆解模板、建实时替换流程、处理高亮/正文/头像框，并用 Playwright 做视觉验收。
---

# XHS Poster Editor

在以下场景使用这个 skill：

- 用户要做单模板海报编辑器
- 需要把一张设计稿拆成“可编辑文案 + 图片位 + 高亮位”
- 需要把海报编辑器整理成可开源、可部署、可演示的仓库

## 工作流

1. 先判断路线
   - 若目标是浏览器内快速编辑、部署简单、面向运营自助使用，优先参数化前端模板
   - 若目标是强依赖 PSD 图层、文字效果、智能对象，先评估是否必须走 PSD / Photopea
2. 再拆模板
   - 标题、正文、账号名、头像框、高亮条分开建模
   - 能复用原图素材的地方优先复用，不要先手绘近似版
3. 只做单案例
   - 先用默认文案和一张测试图把完整路径跑通
   - 不要一开始就做多模板或批量生成
4. 自己先验收
   - 改完后必须先用 Playwright 截图验证，再交给用户

## 必做约束

- 正文不要默认整段自动排版；固定模板优先按行位渲染
- 高亮优先使用原模板素材再做着色和定位，不要直接画一个差不多的矩形
- 上传图片后要检查账号区安全区、头像框边界和遮挡关系
- 所有视觉问题先自己截图复现，再继续修改

## 开源整理

- README 里必须放在线体验地址、封面图、素材边界说明
- `.gitignore` 必须排除私有 PSD、字体、上传图、临时脚本和部署配置
- 可复用的校验脚本保留在 `scripts/`
- GitHub 发布元数据参考 `docs/open-source-release.md`

## 参考

- 模板替换方法：见 [references/template-modeling.md](./references/template-modeling.md)
- 视觉验收方法：见 [references/visual-validation.md](./references/visual-validation.md)
