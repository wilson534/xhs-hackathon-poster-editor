from __future__ import annotations

import argparse
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DEFAULT_PSD_PATH = ROOT / "1.psd"
DEFAULT_ASSETS_DIR = ROOT / "assets"

EDITABLE_LAYER_NAMES = {
    "@bzmxs ",
    "图层 113",
    "他决定来参加 黑客松巅峰赛",
    "上次去黑客松我妈报警了 我妈说再去这种黑客搞的活动 把 我 腿 打 断 这次我还是先不来了吧。  ",
    "high line",
}


def keep_cyan_only(image: Image.Image) -> Image.Image:
    image = image.convert("RGBA")
    pixels = image.load()
    width, height = image.size
    for x in range(width):
        for y in range(height):
            r, g, b, a = pixels[x, y]
            if a == 0:
                continue
            if g > 190 and b > 180:
                continue
            pixels[x, y] = (0, 0, 0, 0)
    return image


def main() -> None:
    parser = argparse.ArgumentParser(description="从私有 PSD 模板导出运行时素材。")
    parser.add_argument("--psd", type=Path, default=DEFAULT_PSD_PATH, help="PSD 模板路径")
    parser.add_argument("--assets-dir", type=Path, default=DEFAULT_ASSETS_DIR, help="导出目录")
    args = parser.parse_args()

    try:
        from PIL import Image
        from psd_tools import PSDImage
    except ImportError as error:
        print("缺少导出素材依赖，请先安装 pillow 和 psd-tools。")
        print(f"详细错误：{error}")
        raise SystemExit(1) from error

    psd_path = args.psd.expanduser().resolve()
    assets_dir = args.assets_dir.expanduser().resolve()

    if not psd_path.exists():
        print(f"未找到 PSD 模板：{psd_path}")
        print("开源仓库默认不包含原始 PSD；如果你有自己的模板，请通过 --psd 指定。")
        raise SystemExit(1)

    assets_dir.mkdir(exist_ok=True)
    psd = PSDImage.open(psd_path)
    final = psd[0]

    for layer in final.descendants():
        if layer.name in EDITABLE_LAYER_NAMES:
            layer.visible = False

    psd.composite(force=True).save(assets_dir / "base-template.png")

    for layer in psd.descendants():
        if layer.name == "high line":
            layer.composite().save(assets_dir / "highlight-overlay.png")
        if layer.name == "矢量智能对象":
            keep_cyan_only(layer.composite()).save(assets_dir / "avatar-overlay.png")


if __name__ == "__main__":
    main()
