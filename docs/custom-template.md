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

当前仓库默认使用根目录的：

```text
2.ttf
```

如果你要换成自己的模板字体，直接替换这个文件，或同步修改 `styles.css` 中的 `@font-face`。
