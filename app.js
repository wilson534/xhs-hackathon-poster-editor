const STORAGE_KEY = "xiaohongshu-poster-editor";
const DEFAULT_HIGHLIGHT_COLOR = "#7af0e9";
const defaultConfig = {
  handle: "@AI暴富锦鲤3.0",
  titleText: "他决定来参加\n黑客松巅峰赛",
  bodyText: "上次去黑客松我妈报警了\n我妈说再去这种黑客搞的活动\n把 我 腿 打 断\n这次我还是先不来了吧。",
  bodyLineCount: 4,
  highlightEnabled: true,
  highlightLineIndex: 2,
  highlightColor: DEFAULT_HIGHLIGHT_COLOR,
  highlightColorMode: "preset",
};
const DEFAULT_BODY_LINES = defaultConfig.bodyText.split("\n");
const LEGACY_TRUNCATED_DEFAULT_BODY = DEFAULT_BODY_LINES.slice(0, 3).join("");
const HIGHLIGHT_PRESET_COLORS = [
  DEFAULT_HIGHLIGHT_COLOR,
  "#ff5978",
  "#ffd35b",
  "#66bbff",
  "#8df169",
  "#ff9b61",
];

const POSTER_WIDTH = 1440;
const POSTER_HEIGHT = 2400;
const POSTER_FONT_FAMILY = '"PosterBlack", "PingFang SC", "Noto Sans SC", "Microsoft YaHei", sans-serif';
const AVATAR_IMAGE_BOX = { x: 34, y: 871, width: 1301, height: 660 };
const HANDLE_BOX = { x: 980, y: 872, width: 263, height: 44 };
const HANDLE_SAFE_BOX = { x: 950, y: 862, width: 332, height: 62 };
const HANDLE_STYLE = {
  box: HANDLE_BOX,
  fontSize: 245.83333,
  tracking: -40,
  minFactor: 0.15,
  align: "right",
  color: "#44efbc",
  shadowColor: "rgba(68, 239, 188, 0.22)",
  shadowOffsetX: 4,
  shadowOffsetY: 2,
  gapStrategy: (previousChar, nextChar, tracking) => {
    const previousAscii = isCompactAsciiChar(previousChar);
    const nextAscii = isCompactAsciiChar(nextChar);
    if (previousAscii && nextAscii) {
      return tracking * 0.55;
    }
    if (previousAscii || nextAscii) {
      return Math.max(tracking * 0.08, -2);
    }
    return Math.max(tracking * 0.02, 2);
  },
};
const TITLE_STYLE = {
  fontSize: 245.83333,
  tracking: -40,
  minFactor: 0.52,
  align: "center",
  color: "#ffffff",
  shadowColor: "rgba(0, 0, 0, 0.34)",
  shadowOffsetX: 10,
  shadowOffsetY: 10,
};
const TITLE_SLOTS = [
  { x: 92, y: 215, width: 1236, height: 285 },
  { x: 91, y: 524, width: 1247, height: 286 },
];
const BODY_STYLE = {
  fontSize: 166.05759,
  tracking: -40,
  minFactor: 0.4,
  fitMode: "per-line",
  align: "center",
  color: "#ffffff",
  shadowColor: "rgba(0, 0, 0, 0.22)",
  shadowOffsetX: 5,
  shadowOffsetY: 5,
};
const BODY_SLOTS = [
  { x: 321, y: 1657, width: 784, height: 73 },
  { x: 249, y: 1775, width: 927, height: 73 },
  { x: 498, y: 1893, width: 431, height: 72 },
  { x: 320, y: 2011, width: 742, height: 72 },
];
const BODY_SLOT_PRESETS = {
  1: [{ centerY: 1870, width: 930, height: 84 }],
  2: [
    { centerY: 1752, width: 930, height: 78 },
    { centerY: 1988, width: 930, height: 78 },
  ],
  3: [
    { centerY: 1694, width: 930, height: 78 },
    { centerY: 1870, width: 930, height: 78 },
    { centerY: 2047, width: 930, height: 78 },
  ],
};
const AVATAR_POLYGON = [
  [138, 871],
  [885, 871],
  [963, 927],
  [1243, 927],
  [1335, 1019],
  [1335, 1440],
  [1238, 1531],
  [128, 1531],
  [34, 1442],
  [34, 965],
];

const state = {
  previewAssets: null,
  highlightSpriteCache: new Map(),
  previewAvatarImage: null,
  previewAvatarName: "",
  bodyLineCount: defaultConfig.bodyLineCount,
  highlightEnabled: defaultConfig.highlightEnabled,
  highlightLineIndex: defaultConfig.highlightLineIndex,
  highlightColor: defaultConfig.highlightColor,
  highlightColorMode: defaultConfig.highlightColorMode,
  avatarTransform: {
    scale: 1,
    offsetX: 0,
    offsetY: 0,
  },
};

const elements = {
  handle: document.querySelector("#handle"),
  titleText: document.querySelector("#titleText"),
  bodyLinesEditor: document.querySelector("#bodyLinesEditor"),
  bodyLineButtons: Array.from(document.querySelectorAll("[data-body-line-count]")),
  highlightEnabled: document.querySelector("#highlightEnabled"),
  highlightControls: document.querySelector("#highlightControls"),
  highlightLineSelector: document.querySelector("#highlightLineSelector"),
  highlightPresetColors: document.querySelector("#highlightPresetColors"),
  highlightCustomColor: document.querySelector("#highlightCustomColor"),
  avatarFile: document.querySelector("#avatarFile"),
  avatarMeta: document.querySelector("#avatarMeta"),
  avatarScale: document.querySelector("#avatarScale"),
  avatarScaleValue: document.querySelector("#avatarScaleValue"),
  avatarOffsetX: document.querySelector("#avatarOffsetX"),
  avatarOffsetXValue: document.querySelector("#avatarOffsetXValue"),
  avatarOffsetY: document.querySelector("#avatarOffsetY"),
  avatarOffsetYValue: document.querySelector("#avatarOffsetYValue"),
  resetButton: document.querySelector("#resetButton"),
  exportPng: document.querySelector("#exportPng"),
  statusText: document.querySelector("#statusText"),
  previewCanvas: document.querySelector("#previewCanvas"),
};

const previewCtx = elements.previewCanvas.getContext("2d");

function setStatus(message) {
  elements.statusText.textContent = message;
}

function setAvatarMeta(message, isActive = false) {
  elements.avatarMeta.textContent = message;
  elements.avatarMeta.style.color = isActive ? "var(--accent)" : "var(--muted)";
}

function setTransformControlsEnabled(enabled) {
  elements.avatarScale.disabled = !enabled;
  elements.avatarOffsetX.disabled = !enabled;
  elements.avatarOffsetY.disabled = !enabled;
}

function syncTransformControls() {
  elements.avatarScale.value = String(state.avatarTransform.scale);
  elements.avatarOffsetX.value = String(state.avatarTransform.offsetX);
  elements.avatarOffsetY.value = String(state.avatarTransform.offsetY);

  elements.avatarScaleValue.value = `${Math.round(state.avatarTransform.scale * 100)}%`;
  elements.avatarOffsetXValue.value = `${state.avatarTransform.offsetX}`;
  elements.avatarOffsetYValue.value = `${state.avatarTransform.offsetY}`;
}

function resetAvatarTransform() {
  state.avatarTransform = {
    scale: 1,
    offsetX: 0,
    offsetY: 0,
  };
  syncTransformControls();
}

function sanitizeBodyLineCount(value) {
  const lineCount = Number(value);
  if (lineCount >= 1 && lineCount <= 4) {
    return lineCount;
  }
  return defaultConfig.bodyLineCount;
}

function sanitizeHighlightEnabled(value) {
  return typeof value === "boolean" ? value : defaultConfig.highlightEnabled;
}

function isPresetHighlightColor(color) {
  return HIGHLIGHT_PRESET_COLORS.includes(color);
}

function sanitizeHighlightColor(value) {
  const normalized = String(value || "").trim();
  if (/^#[0-9a-fA-F]{6}$/.test(normalized)) {
    return normalized.toLowerCase();
  }
  return defaultConfig.highlightColor;
}

function sanitizeHighlightColorMode(value, color) {
  if (value === "preset" || value === "custom") {
    return value;
  }
  return isPresetHighlightColor(color) ? "preset" : "custom";
}

function sanitizeHighlightLineIndex(value, lineCount) {
  if (lineCount <= 0) {
    return null;
  }
  const fallback = Math.min(defaultConfig.highlightLineIndex, lineCount - 1);
  const index = Number(value);
  if (Number.isInteger(index) && index >= 0 && index < lineCount) {
    return index;
  }
  return fallback;
}

function hasBodyContent(lines) {
  return lines.some((line) => String(line || "").trim());
}

function renderHighlightLineSelector() {
  const fragment = document.createDocumentFragment();
  elements.highlightLineSelector.style.gridTemplateColumns = `repeat(${state.bodyLineCount}, minmax(0, 1fr))`;

  for (let index = 0; index < state.bodyLineCount; index += 1) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "segment-button";
    button.dataset.highlightLineIndex = String(index);
    button.textContent = `${index + 1}`;
    const active = state.highlightLineIndex === index;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
    button.disabled = !state.highlightEnabled;
    fragment.appendChild(button);
  }

  elements.highlightLineSelector.replaceChildren(fragment);
}

function renderHighlightPresetColors() {
  const fragment = document.createDocumentFragment();
  HIGHLIGHT_PRESET_COLORS.forEach((color) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "color-chip";
    button.dataset.highlightPresetColor = color;
    button.style.setProperty("--chip-color", color);
    button.title = color;
    const active = state.highlightColor === color;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
    button.disabled = !state.highlightEnabled;
    fragment.appendChild(button);
  });
  elements.highlightPresetColors.replaceChildren(fragment);
}

function renderHighlightControls() {
  elements.highlightEnabled.checked = state.highlightEnabled;
  elements.highlightControls.classList.toggle("is-disabled", !state.highlightEnabled);
  elements.highlightCustomColor.value = state.highlightColor;
  elements.highlightCustomColor.disabled = !state.highlightEnabled;
  renderHighlightLineSelector();
  renderHighlightPresetColors();
}

function setBodyLineCount(value) {
  state.bodyLineCount = sanitizeBodyLineCount(value);
  elements.bodyLineButtons.forEach((button) => {
    const active = Number(button.dataset.bodyLineCount) === state.bodyLineCount;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  state.highlightLineIndex = sanitizeHighlightLineIndex(state.highlightLineIndex, state.bodyLineCount);
  renderHighlightControls();
}

function setHighlightEnabled(value) {
  state.highlightEnabled = sanitizeHighlightEnabled(value);
  renderHighlightControls();
}

function setHighlightColor(color, mode = null) {
  state.highlightColor = sanitizeHighlightColor(color);
  state.highlightColorMode = sanitizeHighlightColorMode(mode, state.highlightColor);
  renderHighlightControls();
}

function setHighlightLineIndex(value) {
  state.highlightLineIndex = sanitizeHighlightLineIndex(value, state.bodyLineCount);
  renderHighlightControls();
}

function getBodyLineInputs() {
  return Array.from(elements.bodyLinesEditor.querySelectorAll("[data-body-line-input]"));
}

function splitBodyText(text) {
  return String(text || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function serializeBodyLines(lines) {
  return lines.map((line) => String(line || "").trim()).filter(Boolean).join("\n");
}

function padBodyLines(lines, lineCount) {
  const normalized = lines.map((line) => String(line || "").trim());
  while (normalized.length < lineCount) {
    normalized.push("");
  }
  return normalized.slice(0, lineCount);
}

function mergeBodyLines(lines, lineCount) {
  const normalized = lines.map((line) => String(line || "").trim()).filter(Boolean);
  if (normalized.length <= lineCount) {
    return padBodyLines(normalized, lineCount);
  }
  return [
    ...normalized.slice(0, lineCount - 1),
    normalized.slice(lineCount - 1).join(""),
  ];
}

function getBodyLinePlaceholder(index, lineCount) {
  if (lineCount === 4) {
    return ["第 1 行", "第 2 行", "高亮行", "收尾行"][index] || `第 ${index + 1} 行`;
  }
  return `第 ${index + 1} 行`;
}

function renderBodyLineInputs(lines = []) {
  const normalizedLines = padBodyLines(lines, state.bodyLineCount);
  const fragment = document.createDocumentFragment();

  normalizedLines.forEach((line, index) => {
    const input = document.createElement("input");
    input.type = "text";
    input.className = "body-line-input";
    input.dataset.bodyLineInput = String(index);
    input.placeholder = getBodyLinePlaceholder(index, state.bodyLineCount);
    input.value = line;
    fragment.appendChild(input);
  });

  elements.bodyLinesEditor.replaceChildren(fragment);
}

function getCurrentBodyLines() {
  return getBodyLineInputs().map((input) => input.value.trim());
}

function readStoredConfig() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return normalizeConfig({ ...defaultConfig });
    }

    const parsed = JSON.parse(raw);
    return normalizeConfig({
      handle: typeof parsed.handle === "string" ? parsed.handle : defaultConfig.handle,
      titleText: typeof parsed.titleText === "string" ? parsed.titleText : defaultConfig.titleText,
      bodyText: typeof parsed.bodyText === "string" ? parsed.bodyText : defaultConfig.bodyText,
      bodyLines: Array.isArray(parsed.bodyLines) ? parsed.bodyLines : undefined,
      bodyLineCount: sanitizeBodyLineCount(parsed.bodyLineCount),
      highlightEnabled: parsed.highlightEnabled,
      highlightLineIndex: parsed.highlightLineIndex,
      highlightColor: parsed.highlightColor,
      highlightColorMode: parsed.highlightColorMode,
    });
  } catch (error) {
    console.error("读取本地配置失败", error);
    return normalizeConfig({ ...defaultConfig });
  }
}

function saveConfig() {
  const config = getConfig();
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (error) {
    console.error("保存本地配置失败", error);
  }
}

function syncInputs(config) {
  const normalizedConfig = normalizeConfig(config);
  elements.handle.value = normalizedConfig.handle;
  elements.titleText.value = normalizedConfig.titleText;
  setBodyLineCount(normalizedConfig.bodyLineCount);
  state.highlightEnabled = normalizedConfig.highlightEnabled;
  state.highlightLineIndex = normalizedConfig.highlightLineIndex;
  state.highlightColor = normalizedConfig.highlightColor;
  state.highlightColorMode = normalizedConfig.highlightColorMode;
  renderHighlightControls();
  renderBodyLineInputs(normalizedConfig.bodyLines);
}

function getConfig() {
  return normalizeConfig({
    handle: elements.handle.value.trim() || defaultConfig.handle,
    titleText: elements.titleText.value,
    bodyLines: getCurrentBodyLines(),
    bodyLineCount: state.bodyLineCount,
    highlightEnabled: state.highlightEnabled,
    highlightLineIndex: state.highlightLineIndex,
    highlightColor: state.highlightColor,
    highlightColorMode: state.highlightColorMode,
  });
}

function normalizeConfig(config) {
  const normalizedBodyLineCount = sanitizeBodyLineCount(config.bodyLineCount);
  const rawBodyLines = Array.isArray(config.bodyLines)
    ? config.bodyLines
    : splitBodyText(typeof config.bodyText === "string" ? config.bodyText : defaultConfig.bodyText);
  const serializedBodyText = serializeBodyLines(rawBodyLines);
  const compactBodyText = rawBodyLines
    .map((line) => String(line || "").trim())
    .filter(Boolean)
    .join("");
  const useDefaultBody =
    serializedBodyText === defaultConfig.bodyText ||
    (normalizedBodyLineCount === defaultConfig.bodyLineCount &&
      compactBodyText === LEGACY_TRUNCATED_DEFAULT_BODY);
  const bodyLineCount = useDefaultBody ? defaultConfig.bodyLineCount : normalizedBodyLineCount;
  const normalizedBodyLines = useDefaultBody
    ? [...DEFAULT_BODY_LINES]
    : mergeBodyLines(rawBodyLines, bodyLineCount);
  const hasVisibleBody = hasBodyContent(normalizedBodyLines);
  const highlightColor = sanitizeHighlightColor(config.highlightColor);
  const highlightEnabled = hasVisibleBody ? sanitizeHighlightEnabled(config.highlightEnabled) : false;
  const highlightLineIndex = hasVisibleBody
    ? sanitizeHighlightLineIndex(config.highlightLineIndex, bodyLineCount)
    : null;
  const highlightColorMode = sanitizeHighlightColorMode(config.highlightColorMode, highlightColor);

  return {
    handle: typeof config.handle === "string" ? config.handle : defaultConfig.handle,
    titleText: typeof config.titleText === "string" ? config.titleText : defaultConfig.titleText,
    bodyText: useDefaultBody ? defaultConfig.bodyText : serializeBodyLines(normalizedBodyLines),
    bodyLines: normalizedBodyLines,
    bodyLineCount,
    highlightEnabled,
    highlightLineIndex,
    highlightColor,
    highlightColorMode,
  };
}

function drawPolygon(ctx, points) {
  ctx.beginPath();
  points.forEach(([x, y], index) => {
    if (index === 0) {
      ctx.moveTo(x, y);
      return;
    }
    ctx.lineTo(x, y);
  });
  ctx.closePath();
}

function clearPolygonArea(ctx, points) {
  ctx.save();
  drawPolygon(ctx, points);
  ctx.clip();
  ctx.clearRect(0, 0, POSTER_WIDTH, POSTER_HEIGHT);
  ctx.restore();
}

function strokeAvatarFrame(ctx) {
  ctx.save();
  drawPolygon(ctx, AVATAR_POLYGON);
  ctx.lineJoin = "miter";
  ctx.lineWidth = 6;
  ctx.strokeStyle = "#f6f7fb";
  ctx.shadowColor = "rgba(255, 255, 255, 0.16)";
  ctx.shadowBlur = 10;
  ctx.stroke();
  ctx.restore();
}

function restoreBasePatch(ctx, box) {
  ctx.drawImage(
    state.previewAssets.base,
    box.x,
    box.y,
    box.width,
    box.height,
    box.x,
    box.y,
    box.width,
    box.height,
  );
}

function isCompactAsciiChar(char) {
  return /[A-Za-z0-9@._-]/.test(char);
}

function getCharacterGap(previousChar, nextChar, tracking, gapStrategy) {
  if (typeof gapStrategy === "function") {
    return gapStrategy(previousChar, nextChar, tracking);
  }
  return tracking;
}

function resolveTrackingPx(fontSize, tracking) {
  return (fontSize * tracking) / 1000;
}

function buildCenteredSlot(centerY, width, height) {
  return {
    x: Math.round((POSTER_WIDTH - width) / 2),
    y: Math.round(centerY - height / 2),
    width,
    height,
  };
}

function getBodySlots(lineCount) {
  if (lineCount === 4) {
    return BODY_SLOTS;
  }
  const preset = BODY_SLOT_PRESETS[lineCount] || BODY_SLOT_PRESETS[defaultConfig.bodyLineCount];
  return preset.map((slot) => buildCenteredSlot(slot.centerY, slot.width, slot.height));
}

function joinBodyLines(lines) {
  return lines.reduce((combined, line) => {
    const current = line.trim();
    if (!current) {
      return combined;
    }
    if (!combined) {
      return current;
    }

    const previousChar = combined.slice(-1);
    const nextChar = current.charAt(0);
    const needsSpace = /[A-Za-z0-9]/.test(previousChar) && /[A-Za-z0-9]/.test(nextChar);
    return `${combined}${needsSpace ? " " : ""}${current}`;
  }, "");
}

function wrapTextToSlots(ctx, text, family, spec, slots) {
  const source = Array.from(text.trim());
  if (source.length === 0) {
    return [];
  }

  const lines = [];
  let cursor = 0;
  const baseTracking = resolveTrackingPx(spec.fontSize, spec.tracking);

  slots.forEach((slot, slotIndex) => {
    if (cursor >= source.length) {
      return;
    }

    if (slotIndex === slots.length - 1) {
      lines.push(source.slice(cursor).join("").trim());
      cursor = source.length;
      return;
    }

    const remainingLineCount = slots.length - slotIndex - 1;
    let current = "";

    while (cursor < source.length) {
      const candidate = current + source[cursor];
      const remainingCharsAfterPick = source.length - (cursor + 1);
      const candidateMetric = measureLineLayout(ctx, candidate, family, spec.fontSize, baseTracking, spec);
      const mustReserve = remainingCharsAfterPick >= remainingLineCount;

      if (current && candidateMetric.width > slot.width && mustReserve) {
        break;
      }

      current = candidate;
      cursor += 1;

      if (source.length - cursor < remainingLineCount) {
        break;
      }
    }

    lines.push(current.trim());
  });

  return lines.filter(Boolean);
}

function reflowBodyLinesByLineCount(lines, lineCount) {
  const normalized = lines.map((line) => String(line || "").trim()).filter(Boolean);
  if (normalized.length === 0) {
    return padBodyLines([], lineCount);
  }

  const mergedText = joinBodyLines(normalized);
  if (mergedText === defaultConfig.bodyText && lineCount === defaultConfig.bodyLineCount) {
    return [...DEFAULT_BODY_LINES];
  }

  const wrappedLines = wrapTextToSlots(
    previewCtx,
    mergedText,
    POSTER_FONT_FAMILY,
    BODY_STYLE,
    getBodySlots(lineCount),
  );
  return padBodyLines(wrappedLines, lineCount);
}

function hexToRgb(color) {
  const normalized = sanitizeHighlightColor(color).slice(1);
  return {
    r: Number.parseInt(normalized.slice(0, 2), 16),
    g: Number.parseInt(normalized.slice(2, 4), 16),
    b: Number.parseInt(normalized.slice(4, 6), 16),
  };
}

function rgbaFromHex(color, alpha) {
  const { r, g, b } = hexToRgb(color);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function getTintedHighlightSprite(color) {
  const normalizedColor = sanitizeHighlightColor(color);
  if (state.highlightSpriteCache.has(normalizedColor)) {
    return state.highlightSpriteCache.get(normalizedColor);
  }

  const source = state.previewAssets.highlightTemplate;
  const canvas = document.createElement("canvas");
  canvas.width = source.width;
  canvas.height = source.height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(source, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const { r, g, b } = hexToRgb(normalizedColor);

  for (let index = 0; index < imageData.data.length; index += 4) {
    const alpha = imageData.data[index + 3];
    if (alpha === 0) {
      continue;
    }

    const red = imageData.data[index];
    const green = imageData.data[index + 1];
    const blue = imageData.data[index + 2];
    const isWhiteAccent = red > 235 && green > 235 && blue > 235;

    if (isWhiteAccent) {
      continue;
    }

    imageData.data[index] = r;
    imageData.data[index + 1] = g;
    imageData.data[index + 2] = b;
  }

  ctx.putImageData(imageData, 0, 0);
  state.highlightSpriteCache.set(normalizedColor, canvas);
  return canvas;
}

function measureTrackedText(ctx, text, tracking, gapStrategy = null) {
  const characters = Array.from(text);
  return characters.reduce((width, char, index) => {
    const charWidth = ctx.measureText(char).width;
    if (index === characters.length - 1) {
      return width + charWidth;
    }
    return width + charWidth + getCharacterGap(char, characters[index + 1], tracking, gapStrategy);
  }, 0);
}

function drawTrackedText(ctx, text, x, y, tracking, gapStrategy = null) {
  let cursor = x;
  Array.from(text).forEach((char, index, array) => {
    ctx.fillText(char, cursor, y);
    const charWidth = ctx.measureText(char).width;
    cursor += charWidth;
    if (index < array.length - 1) {
      cursor += getCharacterGap(char, array[index + 1], tracking, gapStrategy);
    }
  });
}

function measureLineLayout(ctx, text, family, fontSize, tracking, spec) {
  ctx.font = `${fontSize}px ${family}`;
  const measured = ctx.measureText(text || " ");
  const ascent = measured.actualBoundingBoxAscent || fontSize * 0.78;
  const descent = measured.actualBoundingBoxDescent || fontSize * 0.22;
  return {
    width: measureTrackedText(ctx, text, tracking, spec.gapStrategy),
    ascent,
    descent,
    height: ascent + descent,
  };
}

function buildLinePlacement(line, slot, metric, fontSize, tracking, spec) {
  let lineX = slot.x;
  if (spec.align === "center") {
    lineX = slot.x + (slot.width - metric.width) / 2;
  } else if (spec.align === "right") {
    lineX = slot.x + slot.width - metric.width;
  }

  return {
    line,
    slot,
    metric,
    fontSize,
    tracking,
    lineX,
    baselineY: slot.y + (slot.height - metric.height) / 2 + metric.ascent,
  };
}

function resolveSlotLinePlacements(ctx, lines, family, spec, slots) {
  const placements = Array.from({ length: Math.max(lines.length, slots.length) }, () => null);

  if (spec.fitMode === "per-line") {
    lines.forEach((line, index) => {
      if (!line) {
        return;
      }

      const slot = slots[index];
      if (!slot) {
        return;
      }

      const layout = resolveLineLayout(ctx, line, family, spec, slot);
      placements[index] = buildLinePlacement(line, slot, layout.metric, layout.fontSize, layout.tracking, spec);
    });
    return placements;
  }

  const layout = resolveGroupLayout(ctx, lines, family, spec, slots);
  lines.forEach((line, index) => {
    if (!line) {
      return;
    }

    const slot = slots[index];
    if (!slot) {
      return;
    }

    placements[index] = buildLinePlacement(
      line,
      slot,
      layout.metrics[index],
      layout.fontSize,
      layout.tracking,
      spec,
    );
  });
  return placements;
}

function drawResolvedPlacements(ctx, placements, family, spec) {
  placements.forEach((placement) => {
    if (!placement) {
      return;
    }

    if (spec.shadowColor) {
      drawTrackedLine(
        ctx,
        placement.line,
        placement.lineX + spec.shadowOffsetX,
        placement.baselineY + spec.shadowOffsetY,
        family,
        placement.fontSize,
        placement.tracking,
        spec.shadowColor,
        spec.gapStrategy,
      );
    }

    drawTrackedLine(
      ctx,
      placement.line,
      placement.lineX,
      placement.baselineY,
      family,
      placement.fontSize,
      placement.tracking,
      spec.color,
      spec.gapStrategy,
    );
  });
}

function drawHighlightPatch(ctx, placement, color) {
  if (!placement) {
    return;
  }

  const sprite = getTintedHighlightSprite(color);
  const desiredWidth = Math.max(placement.slot.width + 71, placement.metric.width + 136);
  const desiredHeight = placement.slot.height + 61;
  const centeredX = placement.lineX + placement.metric.width / 2 - desiredWidth / 2;
  const drawX = Math.round(Math.max(48, Math.min(centeredX, POSTER_WIDTH - desiredWidth - 48)));
  const drawY = Math.round(placement.slot.y - 40);
  ctx.save();
  ctx.shadowColor = rgbaFromHex(color, 0.26);
  ctx.shadowBlur = 18;
  ctx.drawImage(sprite, drawX, drawY, desiredWidth, desiredHeight);
  ctx.restore();
}

function resolveGroupLayout(ctx, lines, family, spec, slots) {
  let factor = 1;

  while (factor >= spec.minFactor) {
    const fontSize = spec.fontSize * factor;
    const tracking = resolveTrackingPx(fontSize, spec.tracking);
    const metrics = lines.map((line) => measureLineLayout(ctx, line, family, fontSize, tracking, spec));
    const fits = metrics.every((metric, index) => {
      const slot = slots[index];
      if (!slot) {
        return true;
      }
      return metric.width <= slot.width && metric.height <= slot.height;
    });
    if (fits) {
      return { fontSize, tracking, metrics };
    }
    factor -= 0.01;
  }

  const fontSize = spec.fontSize * spec.minFactor;
  const tracking = resolveTrackingPx(fontSize, spec.tracking);
  return {
    fontSize,
    tracking,
    metrics: lines.map((line) => measureLineLayout(ctx, line, family, fontSize, tracking, spec)),
  };
}

function resolveLineLayout(ctx, line, family, spec, slot) {
  let factor = 1;

  while (factor >= spec.minFactor) {
    const fontSize = spec.fontSize * factor;
    const tracking = resolveTrackingPx(fontSize, spec.tracking);
    const metric = measureLineLayout(ctx, line, family, fontSize, tracking, spec);
    if (metric.width <= slot.width && metric.height <= slot.height) {
      return { fontSize, tracking, metric };
    }
    factor -= 0.01;
  }

  const fontSize = spec.fontSize * spec.minFactor;
  const tracking = resolveTrackingPx(fontSize, spec.tracking);
  return {
    fontSize,
    tracking,
    metric: measureLineLayout(ctx, line, family, fontSize, tracking, spec),
  };
}

function drawTrackedLine(ctx, text, x, baselineY, family, fontSize, tracking, color, gapStrategy = null) {
  ctx.save();
  ctx.font = `${fontSize}px ${family}`;
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = color;
  drawTrackedText(ctx, text, x, baselineY, tracking, gapStrategy);
  ctx.restore();
}

function drawSlotLines(ctx, lines, family, spec, slots) {
  if (lines.length === 0) {
    return [];
  }

  const placements = resolveSlotLinePlacements(ctx, lines, family, spec, slots);
  drawResolvedPlacements(ctx, placements, family, spec);
  return placements;
}

function drawPreviewPoster() {
  if (!state.previewAssets) {
    return;
  }

  const ctx = previewCtx;
  const config = getConfig();
  const family = POSTER_FONT_FAMILY;
  const titleLines = config.titleText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 2);
  const bodyLines = config.bodyLines;
  const bodySlots = getBodySlots(config.bodyLineCount);

  ctx.clearRect(0, 0, POSTER_WIDTH, POSTER_HEIGHT);
  ctx.drawImage(state.previewAssets.base, 0, 0, POSTER_WIDTH, POSTER_HEIGHT);

  if (state.previewAvatarImage) {
    clearPolygonArea(ctx, AVATAR_POLYGON);

    ctx.save();
    drawPolygon(ctx, AVATAR_POLYGON);
    ctx.clip();

    const image = state.previewAvatarImage;
    const imageRatio = image.width / image.height;
    const containerRatio = AVATAR_IMAGE_BOX.width / AVATAR_IMAGE_BOX.height;
    let drawWidth = AVATAR_IMAGE_BOX.width;
    let drawHeight = AVATAR_IMAGE_BOX.height;

    if (imageRatio > containerRatio) {
      drawHeight = AVATAR_IMAGE_BOX.height;
      drawWidth = drawHeight * imageRatio;
    } else {
      drawWidth = AVATAR_IMAGE_BOX.width;
      drawHeight = drawWidth / imageRatio;
    }

    drawWidth *= state.avatarTransform.scale;
    drawHeight *= state.avatarTransform.scale;

    const drawX =
      AVATAR_IMAGE_BOX.x +
      (AVATAR_IMAGE_BOX.width - drawWidth) / 2 +
      state.avatarTransform.offsetX;
    const drawY =
      AVATAR_IMAGE_BOX.y +
      (AVATAR_IMAGE_BOX.height - drawHeight) / 2 +
      state.avatarTransform.offsetY;
    ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);
    ctx.restore();
    restoreBasePatch(ctx, HANDLE_SAFE_BOX);
    strokeAvatarFrame(ctx);
  }

  drawSlotLines(ctx, [config.handle], family, HANDLE_STYLE, [HANDLE_BOX]);
  const useOriginalTitle = config.titleText === defaultConfig.titleText;
  if (useOriginalTitle) {
    ctx.drawImage(state.previewAssets.titleOriginal, 91, 215);
  } else {
    drawSlotLines(ctx, titleLines, family, TITLE_STYLE, TITLE_SLOTS);
  }

  const useOriginalBodyText =
    config.bodyText === defaultConfig.bodyText && config.bodyLineCount === defaultConfig.bodyLineCount;

  if (useOriginalBodyText) {
    const defaultPlacements = resolveSlotLinePlacements(
      ctx,
      DEFAULT_BODY_LINES,
      family,
      BODY_STYLE,
      BODY_SLOTS,
    );
    if (config.highlightEnabled && config.highlightLineIndex !== null) {
      drawHighlightPatch(ctx, defaultPlacements[config.highlightLineIndex], config.highlightColor);
    }
    ctx.drawImage(state.previewAssets.bodyOriginal, 248, 1656);
    return;
  }

  const bodyPlacements = resolveSlotLinePlacements(ctx, bodyLines, family, BODY_STYLE, bodySlots);
  if (config.highlightEnabled && config.highlightLineIndex !== null) {
    drawHighlightPatch(ctx, bodyPlacements[config.highlightLineIndex], config.highlightColor);
  }
  drawResolvedPlacements(ctx, bodyPlacements, family, BODY_STYLE);
}

async function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

async function loadPreviewAssets() {
  const [base, titleOriginal, bodyOriginal, highlightTemplate] = await Promise.all([
    loadImage("./assets/base-template.png"),
    loadImage("./assets/title-original.png"),
    loadImage("./assets/body-original.png"),
    loadImage("./assets/highlight-template.png"),
  ]);
  state.highlightSpriteCache.clear();
  state.previewAssets = { base, titleOriginal, bodyOriginal, highlightTemplate };
  drawPreviewPoster();
}

async function loadAvatarFile(file) {
  const objectUrl = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = objectUrl;
    await image.decode();
    state.previewAvatarImage = image;
    state.previewAvatarName = file.name;
    resetAvatarTransform();
    setTransformControlsEnabled(true);
    drawPreviewPoster();
    setAvatarMeta(`当前图片：${file.name}`, true);
    setStatus("图片已上传，右侧海报已实时更新。可继续用左侧滑杆微调位置和大小。");
  } catch (error) {
    console.error("读取上传图片失败", error);
    setStatus("读取上传图片失败，请换一张图片重试。");
  } finally {
    URL.revokeObjectURL(objectUrl);
    elements.avatarFile.value = "";
  }
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function exportPoster() {
  elements.exportPng.disabled = true;
  setStatus("正在导出 PNG…");

  elements.previewCanvas.toBlob((blob) => {
    elements.exportPng.disabled = false;
    if (!blob) {
      setStatus("导出失败，请重试。");
      return;
    }

    downloadBlob(blob, "小红书个人海报.png");
    setStatus("PNG 已导出。");
  }, "image/png");
}

function resetEditor() {
  syncInputs({ ...defaultConfig });
  state.previewAvatarImage = null;
  state.previewAvatarName = "";
  elements.avatarFile.value = "";
  resetAvatarTransform();
  setTransformControlsEnabled(false);
  setAvatarMeta("当前未上传图片");
  saveConfig();
  drawPreviewPoster();
  setStatus("已恢复默认文案和图片状态。");
}

function bindEvents() {
  [elements.handle, elements.titleText].forEach((input) => {
    input.addEventListener("input", () => {
      saveConfig();
      drawPreviewPoster();
      setStatus("右侧海报已实时更新。");
    });
  });

  elements.bodyLinesEditor.addEventListener("input", (event) => {
    if (!(event.target instanceof HTMLInputElement)) {
      return;
    }
    const bodyLines = getCurrentBodyLines();
    if (serializeBodyLines(bodyLines) === defaultConfig.bodyText) {
      setBodyLineCount(defaultConfig.bodyLineCount);
      renderBodyLineInputs(DEFAULT_BODY_LINES);
    }
    if (!hasBodyContent(getCurrentBodyLines())) {
      setHighlightEnabled(false);
    }
    saveConfig();
    drawPreviewPoster();
    setStatus("右侧海报已实时更新。");
  });

  elements.bodyLineButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const lineCount = sanitizeBodyLineCount(button.dataset.bodyLineCount);
      setBodyLineCount(lineCount);
      const nextBodyLines = reflowBodyLinesByLineCount(getCurrentBodyLines(), lineCount);
      renderBodyLineInputs(nextBodyLines);
      saveConfig();
      drawPreviewPoster();
      setStatus(`正文已切换为 ${lineCount} 行布局。`);
    });
  });

  elements.highlightEnabled.addEventListener("change", () => {
    if (!hasBodyContent(getCurrentBodyLines()) && elements.highlightEnabled.checked) {
      setHighlightEnabled(false);
      setStatus("正文为空时无法启用高亮。");
      return;
    }
    setHighlightEnabled(elements.highlightEnabled.checked);
    saveConfig();
    drawPreviewPoster();
    setStatus(state.highlightEnabled ? "高亮已开启。" : "高亮已关闭。");
  });

  elements.highlightLineSelector.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLButtonElement)) {
      return;
    }
    if (!target.dataset.highlightLineIndex) {
      return;
    }
    setHighlightLineIndex(target.dataset.highlightLineIndex);
    saveConfig();
    drawPreviewPoster();
    setStatus(`已切换到第 ${state.highlightLineIndex + 1} 行高亮。`);
  });

  elements.highlightPresetColors.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLButtonElement)) {
      return;
    }
    if (!target.dataset.highlightPresetColor) {
      return;
    }
    setHighlightColor(target.dataset.highlightPresetColor, "preset");
    saveConfig();
    drawPreviewPoster();
    setStatus("高亮颜色已更新。");
  });

  elements.highlightCustomColor.addEventListener("input", () => {
    setHighlightColor(
      elements.highlightCustomColor.value,
      isPresetHighlightColor(elements.highlightCustomColor.value.toLowerCase()) ? "preset" : "custom",
    );
    saveConfig();
    drawPreviewPoster();
    setStatus("高亮颜色已更新。");
  });

  elements.avatarFile.addEventListener("change", async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    await loadAvatarFile(file);
  });

  [elements.avatarScale, elements.avatarOffsetX, elements.avatarOffsetY].forEach((input) => {
    input.addEventListener("input", () => {
      state.avatarTransform = {
        scale: Number(elements.avatarScale.value),
        offsetX: Number(elements.avatarOffsetX.value),
        offsetY: Number(elements.avatarOffsetY.value),
      };
      syncTransformControls();
      drawPreviewPoster();
      setStatus("图片位置已更新。");
    });
  });

  elements.resetButton.addEventListener("click", () => {
    resetEditor();
  });

  elements.exportPng.addEventListener("click", () => {
    exportPoster();
  });
}

async function init() {
  const storedConfig = readStoredConfig();
  syncInputs(storedConfig);
  resetAvatarTransform();
  setTransformControlsEnabled(false);
  bindEvents();

  try {
    await loadPreviewAssets();
  } catch (error) {
    console.error("加载模板素材失败", error);
    setStatus("加载模板素材失败，请刷新页面重试。");
  }

  if (document.fonts?.ready) {
    document.fonts.ready
      .then(() => {
        drawPreviewPoster();
      })
      .catch((error) => {
        console.error("字体加载失败", error);
      });
  }
}

init();
