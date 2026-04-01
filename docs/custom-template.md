# 如何替换成你自己的模板

当前仓库是单模板前端编辑器，运行时主要依赖这几类信息：

- 底图：`assets/base-template.png`
- 默认标题 / 正文图：`assets/title-original.png`、`assets/body-original.png`
- 高亮模板：`assets/highlight-template.png`
- 头像框遮罩与边界：`app.js` 中的头像框路径和安全区常量
- 标题 / 正文 / 高亮 / 账号名槽位：`app.js` 中的模板常量

## 最小替换步骤

1. 替换 `assets/` 中的模板素材
2. 调整 `app.js` 中的：
   - 标题槽位
   - 正文槽位
   - 高亮位置
   - 头像框路径
   - 账号名安全区
3. 用 Playwright 校验默认态、上传图片态、不同正文行数

## 关于 PSD

仓库不默认包含原始 PSD。  
如果你自己有 PSD，可以使用：

```bash
python3 scripts/export_template_assets.py --psd /path/to/your-template.psd
```

脚本会尝试导出底图和部分运行时素材，但最终仍需要你手动校准槽位。

## 关于字体

如果你拥有字体授权，可以把对应字体文件放到项目根目录命名为：

```text
2.ttf
```

页面会自动优先使用它。没有字体文件也能运行，只是不会做到原模板级别的字形贴合。
