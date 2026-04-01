# GitHub 开源发布建议

## 推荐仓库信息

- 仓库名：`xhs-hackathon-poster-editor`
- Homepage：`https://xhs-hackathon-poster.vercel.app`
- Description：
  - `A Xiaohongshu-style hackathon poster editor with real-time text, highlight, and image replacement.`

## 建议 Topics

- `xiaohongshu`
- `poster-editor`
- `canvas`
- `image-editor`
- `template-editor`
- `hackathon`
- `frontend`
- `vercel`
- `design-tool`

## GitHub CLI 一键设置

如果你已经创建好了 GitHub 仓库，可以直接运行：

```bash
gh repo edit \
  --description "A Xiaohongshu-style hackathon poster editor with real-time text, highlight, and image replacement." \
  --homepage "https://xhs-hackathon-poster.vercel.app" \
  --add-topic xiaohongshu \
  --add-topic poster-editor \
  --add-topic canvas \
  --add-topic image-editor \
  --add-topic template-editor \
  --add-topic hackathon \
  --add-topic frontend \
  --add-topic vercel \
  --add-topic design-tool
```

## README / Social Preview 资源

- README 与 Social Preview 统一使用：`./.github/assets/social-preview-example.png`
- 建议将这张图同时设置为 GitHub Social Preview
- 封面图更新命令：

```bash
npm run capture:cover
```

## 开源边界

当前仓库按“可运行演示版”整理：

- 公开代码、公开演示站、公开 demo 素材
- 不默认公开原始 PSD、商用字体、私有测试图
- 如果要开源更完整的模板资产，请先确认你拥有分发权

## 发布前检查

```bash
npm install
npm run verify:body-lines
npm run verify:upload
```

手动再检查这几件事：

1. README 顶部链接可访问
2. 演示站和本地页面功能一致
3. `.gitignore` 已排除私有 PSD、字体、上传图、临时脚本和 `.vercel`
4. README 与站点截图没有出现私有人物图或敏感素材

## 如果后面要继续扩展

- 想支持多模板：先把 `app.js` 里的模板常量收成独立模板配置对象
- 想支持运营同学自助使用：再补用户上传、存储和模板管理
- 想继续沉淀方法论：更新 `skills/xhs-poster-editor/`
