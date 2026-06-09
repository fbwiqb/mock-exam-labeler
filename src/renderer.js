const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const canvasShell = document.getElementById("canvasShell");
const dropEmpty = document.getElementById("dropEmpty");

const els = {
  fileName: document.getElementById("fileName"),
  status: document.getElementById("status"),
  openImageBtn: document.getElementById("openImageBtn"),
  openProjectBtn: document.getElementById("openProjectBtn"),
  saveProjectBtn: document.getElementById("saveProjectBtn"),
  saveImageBtn: document.getElementById("saveImageBtn"),
  labelText: document.getElementById("labelText"),
  presetGrid: document.getElementById("presetGrid"),
  applyStyleAllBtn: document.getElementById("applyStyleAllBtn"),
  fontFamily: document.getElementById("fontFamily"),
  fontSize: document.getElementById("fontSize"),
  fontSizeValue: document.getElementById("fontSizeValue"),
  labelPadding: document.getElementById("labelPadding"),
  labelPaddingValue: document.getElementById("labelPaddingValue"),
  textColor: document.getElementById("textColor"),
  labelBackground: document.getElementById("labelBackground"),
  boldText: document.getElementById("boldText"),
  italicText: document.getElementById("italicText"),
  underlineText: document.getElementById("underlineText"),
  outlineText: document.getElementById("outlineText"),
  zoomOutBtn: document.getElementById("zoomOutBtn"),
  fitBtn: document.getElementById("fitBtn"),
  zoomInBtn: document.getElementById("zoomInBtn"),
  labelList: document.getElementById("labelList"),
  duplicateBtn: document.getElementById("duplicateBtn"),
  deleteBtn: document.getElementById("deleteBtn"),
  selectedText: document.getElementById("selectedText"),
  selectedX: document.getElementById("selectedX"),
  selectedY: document.getElementById("selectedY"),
  leaderEnabled: document.getElementById("leaderEnabled"),
  leaderShape: document.getElementById("leaderShape"),
  leaderStyle: document.getElementById("leaderStyle"),
  leaderWidth: document.getElementById("leaderWidth"),
  leaderWidthValue: document.getElementById("leaderWidthValue"),
  leaderGap: document.getElementById("leaderGap"),
  leaderGapValue: document.getElementById("leaderGapValue"),
  leaderX: document.getElementById("leaderX"),
  leaderY: document.getElementById("leaderY"),
  leaderClearBtn: document.getElementById("leaderClearBtn"),
  magnifier: document.getElementById("magnifier"),
  magnifierCanvas: document.getElementById("magnifierCanvas"),
  magnifierSize: document.getElementById("magnifierSize"),
  magnifierMeta: document.getElementById("magnifierMeta"),
  fileDropInput: document.getElementById("fileDropInput"),
  helpBtn: document.getElementById("helpBtn"),
  helpDialog: document.getElementById("helpDialog"),
  helpCloseBtn: document.getElementById("helpCloseBtn"),
  toast: document.getElementById("toast"),
  undoBtn: document.getElementById("undoBtn"),
  redoBtn: document.getElementById("redoBtn")
};

const presets = ["(가)", "(나)", "(다)", "(라)", "A", "B", "C", "D", "㉠", "㉡", "㉢", "㉣", "①", "②", "③", "④"];
const presetButtons = new Map();

const state = {
  image: null,
  imageDataUrl: "",
  imageName: "mock-exam-image",
  imagePath: "",
  projectPath: "",
  labels: [],
  selectedId: null,
  nextId: 1,
  zoom: 1,
  mode: "select",
  dragging: null,
  dirty: false,
  pendingText: "(가)",
  activePreset: "",
  toastTimer: null,
  history: {
    undo: [],
    redo: [],
    applying: false
  }
};

function setStatus(text) {
  els.status.textContent = text;
}

function cloneLabels(labels = state.labels) {
  return JSON.parse(JSON.stringify(labels));
}

function setDirty(dirty) {
  state.dirty = Boolean(dirty);
  window.labeler.setDirtyState(state.dirty);
}

function snapshotState() {
  return {
    labels: cloneLabels(),
    selectedId: state.selectedId,
    nextId: state.nextId
  };
}

function restoreSnapshot(snapshot) {
  state.history.applying = true;
  state.labels = cloneLabels(snapshot.labels);
  state.selectedId = snapshot.selectedId;
  state.nextId = snapshot.nextId;
  state.history.applying = false;
  setDirty(true);
  render();
}

function updateHistoryButtons() {
  els.undoBtn.disabled = state.history.undo.length === 0;
  els.redoBtn.disabled = state.history.redo.length === 0;
}

function pushHistory() {
  if (state.history.applying || !state.image) return;
  state.history.undo.push(snapshotState());
  if (state.history.undo.length > 80) state.history.undo.shift();
  state.history.redo = [];
  updateHistoryButtons();
}

function clearHistory() {
  state.history.undo = [];
  state.history.redo = [];
  updateHistoryButtons();
}

function undo() {
  if (state.history.undo.length === 0) return;
  const current = snapshotState();
  const previous = state.history.undo.pop();
  state.history.redo.push(current);
  restoreSnapshot(previous);
  updateHistoryButtons();
}

function redo() {
  if (state.history.redo.length === 0) return;
  const current = snapshotState();
  const next = state.history.redo.pop();
  state.history.undo.push(current);
  restoreSnapshot(next);
  updateHistoryButtons();
}

function setPressed(button, pressed) {
  button.classList.toggle("active", Boolean(pressed));
  button.setAttribute("aria-pressed", String(Boolean(pressed)));
}

function isPressed(button) {
  return button.classList.contains("active");
}

function showToast(text) {
  window.clearTimeout(state.toastTimer);
  els.toast.textContent = text;
  els.toast.hidden = false;
  state.toastTimer = window.setTimeout(() => {
    els.toast.hidden = true;
  }, 2400);
}

function requireImage() {
  if (state.image) return true;
  showToast("이미지를 먼저 업로드해주세요.");
  return false;
}

function beginLabelPlacement(text, preset = "", notify = true) {
  state.pendingText = text || "(가)";
  state.activePreset = preset;
  if (!state.image) {
    setAddMode(false);
    if (notify) requireImage();
    return;
  }
  setAddMode(true);
}

function selectedLabel() {
  return state.labels.find((label) => label.id === state.selectedId) || null;
}

function quoteFontFamily(font) {
  const value = String(font || "").trim();
  if (!value) return "Batang, serif";
  if (value.includes(",") || value.includes("\"") || value.includes("'")) return value;
  return `"${value}", Batang, serif`;
}

function resolveFontFamily() {
  return els.fontFamily.value || "Batang, serif";
}

function appendFontOption(value, label) {
  const option = document.createElement("option");
  option.value = value;
  option.textContent = label;
  els.fontFamily.appendChild(option);
}

async function populateFonts() {
  const fixedFonts = [
    ["Batang, serif", "바탕"],
    ["\"Malgun Gothic\", \"Segoe UI\", sans-serif", "맑은 고딕"],
    ["Gulim, sans-serif", "굴림"],
    ["Arial, sans-serif", "Arial"],
    ["Times New Roman, serif", "Times New Roman"],
    ["Cambria, serif", "Cambria"]
  ];
  const seen = new Set();
  els.fontFamily.innerHTML = "";

  for (const [value, label] of fixedFonts) {
    appendFontOption(value, label);
    seen.add(label.toLowerCase());
  }

  try {
    const fonts = await window.labeler.getSystemFonts();
    for (const font of fonts) {
      const name = String(font || "").trim();
      if (!name || seen.has(name.toLowerCase())) continue;
      appendFontOption(quoteFontFamily(name), name);
      seen.add(name.toLowerCase());
    }
  } catch (_error) {
  }
}

function labelFont(label) {
  const weight = label.bold ? "700" : "400";
  const style = label.italic ? "italic" : "normal";
  return `${style} ${weight} ${label.fontSize}px ${label.fontFamily || "Batang, serif"}`;
}

function labelBounds(label, context = ctx) {
  context.save();
  context.font = labelFont(label);
  const metrics = context.measureText(label.text || " ");
  context.restore();
  const padding = Number.isFinite(label.padding) ? label.padding : 8;
  const underlineExtra = label.underline ? Math.max(5, Math.round(label.fontSize * 0.18)) : 0;
  const width = Math.ceil(metrics.width) + padding * 2;
  const height = Math.ceil(label.fontSize * 1.25) + padding * 2 + underlineExtra;
  return { x: label.x, y: label.y, width, height, padding, textWidth: metrics.width, underlineExtra };
}

function defaultLeader() {
  return {
    enabled: false,
    x: 0,
    y: 0,
    shape: "straight",
    style: "solid",
    width: 2,
    gap: 8
  };
}

function normalizedLeader(label) {
  return { ...defaultLeader(), ...(label.leader || {}) };
}

function labelAnchorPoint(label, leader, context = ctx) {
  const bounds = labelBounds(label, context);
  const cx = bounds.x + bounds.width / 2;
  const cy = bounds.y + bounds.height / 2;
  const dx = leader.x - cx;
  const dy = leader.y - cy;
  const halfW = bounds.width / 2 + leader.gap;
  const halfH = bounds.height / 2 + leader.gap;

  if (Math.abs(dx) * halfH > Math.abs(dy) * halfW) {
    const side = dx > 0 ? 1 : -1;
    return {
      x: cx + side * halfW,
      y: cy + (dy / Math.max(Math.abs(dx), 0.001)) * halfW
    };
  }

  const side = dy > 0 ? 1 : -1;
  return {
    x: cx + (dx / Math.max(Math.abs(dy), 0.001)) * halfH,
    y: cy + side * halfH
  };
}

function applyLeaderDash(context, leader) {
  if (leader.style === "dash") {
    context.setLineDash([leader.width * 5, leader.width * 3]);
    return;
  }
  if (leader.style === "dot") {
    context.setLineDash([leader.width, leader.width * 3]);
    return;
  }
  context.setLineDash([]);
}

function drawLeader(context, label, selected = false) {
  const leader = normalizedLeader(label);
  if (!leader.enabled) return;

  const end = labelAnchorPoint(label, leader, context);
  context.save();
  context.strokeStyle = "#111";
  context.lineWidth = leader.width;
  context.lineCap = "round";
  context.lineJoin = "round";
  applyLeaderDash(context, leader);
  context.beginPath();
  context.moveTo(leader.x, leader.y);

  if (leader.shape === "elbow") {
    const midX = leader.x + (end.x - leader.x) * 0.58;
    context.lineTo(midX, leader.y);
    context.lineTo(midX, end.y);
    context.lineTo(end.x, end.y);
  } else {
    context.lineTo(end.x, end.y);
  }

  context.stroke();
  context.setLineDash([]);

  if (selected) {
    context.fillStyle = "#fff";
    context.strokeStyle = "#1f4c8f";
    context.lineWidth = 1.4;
    context.beginPath();
    context.arc(leader.x, leader.y, 5, 0, Math.PI * 2);
    context.fill();
    context.stroke();
  }

  context.restore();
}

function drawLabel(context, label, selected = false) {
  const bounds = labelBounds(label, context);
  context.save();
  context.font = labelFont(label);
  context.textBaseline = "top";
  context.lineJoin = "round";

  if (label.background !== "none") {
    context.fillStyle = label.background === "gray" ? "rgba(238,238,238,0.96)" : "rgba(255,255,255,0.96)";
    context.strokeStyle = "#111";
    context.lineWidth = 1;
    context.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
    context.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
  }

  const textX = bounds.x + bounds.padding;
  const textY = bounds.y + bounds.padding;

  if (label.outline) {
    context.strokeStyle = label.color === "#ffffff" ? "#111111" : "#ffffff";
    context.lineWidth = Math.max(3, Math.round(label.fontSize * 0.13));
    context.strokeText(label.text, textX, textY);
  }

  context.fillStyle = label.color;
  context.fillText(label.text, textX, textY);

  if (label.underline) {
    const gap = Math.max(3, Math.round(label.fontSize * 0.14));
    const underlineY = textY + Math.round(label.fontSize * 1.02) + gap;
    context.strokeStyle = label.color;
    context.lineWidth = Math.max(1.2, Math.round(label.fontSize * 0.075));
    context.beginPath();
    context.moveTo(textX - 1, underlineY);
    context.lineTo(textX + bounds.textWidth + 1, underlineY);
    context.stroke();
  }

  if (selected) {
    context.strokeStyle = "#1f4c8f";
    context.lineWidth = 1;
    context.setLineDash([4, 3]);
    context.strokeRect(bounds.x - 4, bounds.y - 4, bounds.width + 8, bounds.height + 8);
    context.setLineDash([]);
  }

  context.restore();
}

function drawTo(targetCanvas, options = {}) {
  const includeImage = options.includeImage !== false;
  const includeLabels = options.includeLabels !== false;
  const includeSelection = options.includeSelection === true;
  const targetCtx = targetCanvas.getContext("2d");
  targetCtx.clearRect(0, 0, targetCanvas.width, targetCanvas.height);

  if (includeImage && state.image) {
    targetCtx.drawImage(state.image, 0, 0);
  }

  if (includeLabels) {
    for (const label of state.labels) {
      drawLeader(targetCtx, label, includeSelection && label.id === state.selectedId);
    }
    for (const label of state.labels) {
      drawLabel(targetCtx, label, includeSelection && label.id === state.selectedId);
    }
  }
}

function render() {
  if (!state.image) {
    canvas.style.display = "none";
    dropEmpty.style.display = "grid";
    updateLabelList();
    updateInspector();
    updateHistoryButtons();
    return;
  }

  canvas.width = state.image.naturalWidth;
  canvas.height = state.image.naturalHeight;
  canvas.style.width = `${Math.round(canvas.width * state.zoom)}px`;
  canvas.style.height = `${Math.round(canvas.height * state.zoom)}px`;
  canvas.style.display = "block";
  dropEmpty.style.display = "none";
  drawTo(canvas, { includeSelection: true });
  updateLabelList();
  updateInspector();
  updateHistoryButtons();
  setStatus(`${canvas.width}×${canvas.height}px · ${Math.round(state.zoom * 100)}% · 라벨 ${state.labels.length}개`);
}

function fitZoom() {
  if (!state.image) return;
  const availableWidth = Math.max(240, canvasShell.clientWidth - 72);
  const availableHeight = Math.max(180, canvasShell.clientHeight - 72);
  state.zoom = Math.min(1, availableWidth / state.image.naturalWidth, availableHeight / state.image.naturalHeight);
  state.zoom = Math.max(0.12, state.zoom);
  render();
}

function makeLabel(x, y, text) {
  const style = labelStyleFromControls();
  return {
    id: state.nextId++,
    text: text || state.pendingText || els.labelText.value || "(가)",
    x,
    y,
    ...style,
    leader: defaultLeader()
  };
}

function makeLeaderLabel(startX, startY, endX, endY, text) {
  const label = makeLabel(Math.round(endX), Math.round(endY), text);
  label.leader = {
    ...defaultLeader(),
    ...leaderStyleFromControls(),
    enabled: true,
    x: Math.round(startX),
    y: Math.round(startY)
  };
  return label;
}

function setAddMode(active) {
  state.mode = active ? "add" : "select";
  els.labelText.classList.toggle("active-input", active && !state.activePreset);
  for (const [preset, button] of presetButtons.entries()) {
    button.classList.toggle("active", active && preset === state.activePreset);
  }
  if (active) showToast("원하는 그림 영역을 누르고 드래그하세요!");
}

function addLabelAt(x, y, text) {
  if (!state.image) return;
  const label = makeLabel(Math.round(x), Math.round(y), text);
  state.labels.push(label);
  state.selectedId = label.id;
  setAddMode(false);
  render();
}

function getCanvasPoint(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (event.clientX - rect.left) / state.zoom,
    y: (event.clientY - rect.top) / state.zoom
  };
}

function hitLabel(point) {
  for (let i = state.labels.length - 1; i >= 0; i -= 1) {
    const label = state.labels[i];
    const bounds = labelBounds(label);
    if (point.x >= bounds.x && point.x <= bounds.x + bounds.width && point.y >= bounds.y && point.y <= bounds.y + bounds.height) {
      return label;
    }
  }
  return null;
}

function hitLeader(point) {
  for (let i = state.labels.length - 1; i >= 0; i -= 1) {
    const label = state.labels[i];
    const leader = normalizedLeader(label);
    if (!leader.enabled) continue;
    const dx = point.x - leader.x;
    const dy = point.y - leader.y;
    if (Math.hypot(dx, dy) <= 12) return label;
  }
  return null;
}

function showMagnifier(event, point) {
  if (!state.image) return;
  const magnifierCtx = els.magnifierCanvas.getContext("2d", { willReadFrequently: true });
  const sourceSize = 48;
  const half = sourceSize / 2;
  const sx = Math.max(0, Math.min(canvas.width - sourceSize, Math.round(point.x - half)));
  const sy = Math.max(0, Math.min(canvas.height - sourceSize, Math.round(point.y - half)));

  magnifierCtx.imageSmoothingEnabled = false;
  magnifierCtx.clearRect(0, 0, els.magnifierCanvas.width, els.magnifierCanvas.height);
  magnifierCtx.drawImage(canvas, sx, sy, sourceSize, Math.round(sourceSize * 0.625), 0, 0, els.magnifierCanvas.width, els.magnifierCanvas.height);

  magnifierCtx.strokeStyle = "#2b8cff";
  magnifierCtx.lineWidth = 2;
  magnifierCtx.beginPath();
  magnifierCtx.moveTo(els.magnifierCanvas.width / 2, 0);
  magnifierCtx.lineTo(els.magnifierCanvas.width / 2, els.magnifierCanvas.height);
  magnifierCtx.moveTo(0, els.magnifierCanvas.height / 2);
  magnifierCtx.lineTo(els.magnifierCanvas.width, els.magnifierCanvas.height / 2);
  magnifierCtx.stroke();

  let colorText = "";
  try {
    const pixel = ctx.getImageData(Math.round(point.x), Math.round(point.y), 1, 1).data;
    colorText = ` · RGB ${pixel[0]}, ${pixel[1]}, ${pixel[2]}`;
  } catch (_error) {
    colorText = "";
  }

  els.magnifierSize.textContent = `${Math.round(point.x)} × ${Math.round(point.y)}`;
  els.magnifierMeta.textContent = `(${Math.round(point.x)}, ${Math.round(point.y)})${colorText}`;
  const left = Math.min(window.innerWidth - 280, event.clientX + 18);
  const top = Math.min(window.innerHeight - 220, event.clientY + 18);
  els.magnifier.style.left = `${Math.max(8, left)}px`;
  els.magnifier.style.top = `${Math.max(8, top)}px`;
  els.magnifier.hidden = false;
}

function hideMagnifier() {
  els.magnifier.hidden = true;
}

function updateLabelList() {
  els.labelList.innerHTML = "";
  for (const label of state.labels) {
    const row = document.createElement("button");
    row.className = `label-row${label.id === state.selectedId ? " selected" : ""}`;
    row.innerHTML = `<span>${escapeHtml(label.text)}</span><span>${Math.round(label.x)}, ${Math.round(label.y)}</span>`;
    row.addEventListener("click", () => {
      state.selectedId = label.id;
      render();
    });
    els.labelList.appendChild(row);
  }
}

function updateInspector() {
  const label = selectedLabel();
  const disabled = !label;
  els.selectedText.disabled = disabled;
  els.selectedX.disabled = disabled;
  els.selectedY.disabled = disabled;
  els.duplicateBtn.disabled = disabled;
  els.deleteBtn.disabled = disabled;
  els.applyStyleAllBtn.disabled = state.labels.length === 0;
  els.leaderEnabled.disabled = disabled;
  els.leaderShape.disabled = disabled;
  els.leaderStyle.disabled = disabled;
  els.leaderWidth.disabled = disabled;
  els.leaderGap.disabled = disabled;
  els.leaderX.disabled = disabled;
  els.leaderY.disabled = disabled;
  els.leaderClearBtn.disabled = disabled;

  if (!label) {
    els.selectedText.value = "";
    els.selectedX.value = "";
    els.selectedY.value = "";
    setPressed(els.leaderEnabled, false);
    els.leaderWidthValue.textContent = els.leaderWidth.value;
    els.leaderGapValue.textContent = els.leaderGap.value;
    els.leaderX.value = "";
    els.leaderY.value = "";
    return;
  }

  const leader = normalizedLeader(label);
  els.selectedText.value = label.text;
  els.selectedX.value = Math.round(label.x);
  els.selectedY.value = Math.round(label.y);
  els.fontSize.value = label.fontSize;
  els.fontSizeValue.textContent = String(label.fontSize);
  els.labelPadding.value = Number.isFinite(label.padding) ? label.padding : 8;
  els.labelPaddingValue.textContent = String(Number.isFinite(label.padding) ? label.padding : 8);
  els.textColor.value = label.color || "#111111";
  els.labelBackground.value = label.background || "none";
  setPressed(els.boldText, Boolean(label.bold));
  setPressed(els.italicText, Boolean(label.italic));
  setPressed(els.underlineText, Boolean(label.underline));
  setPressed(els.outlineText, label.outline !== false);
  setPressed(els.leaderEnabled, leader.enabled);
  els.leaderShape.value = leader.shape;
  els.leaderStyle.value = leader.style;
  els.leaderWidth.value = leader.width;
  els.leaderWidthValue.textContent = String(leader.width);
  els.leaderGap.value = leader.gap;
  els.leaderGapValue.textContent = String(leader.gap);
  els.leaderX.value = leader.enabled ? Math.round(leader.x) : "";
  els.leaderY.value = leader.enabled ? Math.round(leader.y) : "";
  if (label.fontFamily) {
    const option = Array.from(els.fontFamily.options).find((item) => item.value === label.fontFamily);
    if (option) els.fontFamily.value = label.fontFamily;
  }
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
  }[char]));
}

async function loadImageData(dataUrl, fileName = "mock-exam-image", filePath = "") {
  const image = new Image();
  image.onload = () => {
    state.image = image;
    state.imageDataUrl = dataUrl;
    state.imageName = fileName || "mock-exam-image";
    state.imagePath = filePath;
    state.projectPath = "";
    state.labels = [];
    state.selectedId = null;
    state.nextId = 1;
    setAddMode(false);
    clearHistory();
    setDirty(false);
    els.fileName.textContent = `${state.imageName} · ${image.naturalWidth}×${image.naturalHeight}px`;
    fitZoom();
  };
  image.src = dataUrl;
}

async function loadProject(project, filePath = "") {
  if (!project || !project.imageDataUrl) return;
  const image = new Image();
  image.onload = () => {
    state.image = image;
    state.imageDataUrl = project.imageDataUrl;
    state.imageName = project.imageName || "mock-exam-image";
    state.imagePath = project.imagePath || "";
    state.projectPath = filePath;
    state.labels = Array.isArray(project.labels) ? project.labels : [];
    state.selectedId = null;
    state.nextId = Math.max(1, ...state.labels.map((label) => Number(label.id) || 0)) + 1;
    setAddMode(false);
    clearHistory();
    setDirty(false);
    els.fileName.textContent = `${state.imageName} · ${image.naturalWidth}×${image.naturalHeight}px`;
    fitZoom();
  };
  image.src = project.imageDataUrl;
}

function projectPayload() {
  return {
    version: 1,
    imageName: state.imageName,
    imagePath: state.imagePath,
    imageDataUrl: state.imageDataUrl,
    labels: state.labels
  };
}

function exportCanvas(includeImage, includeLabels) {
  const exportCanvasEl = document.createElement("canvas");
  exportCanvasEl.width = state.image.naturalWidth;
  exportCanvasEl.height = state.image.naturalHeight;
  drawTo(exportCanvasEl, { includeImage, includeLabels, includeSelection: false });
  return exportCanvasEl.toDataURL("image/png");
}

function safeBaseName() {
  return (state.imageName || "mock-exam-image").replace(/[\\/:*?"<>|]+/g, "_");
}

async function saveImage() {
  if (!requireImage()) return;
  const base = safeBaseName();
  const saved = await window.labeler.saveDataUrl({
    dataUrl: exportCanvas(true, true),
    defaultName: `${base}_labeled.png`,
    title: "이미지 저장"
  });
  if (saved) {
    setStatus(`이미지 저장 완료: ${saved}`);
    showToast("라벨 포함 이미지가 저장되었습니다.");
  }
}

function readDroppedFile(file) {
  if (!file) return;
  if (file.name.toLowerCase().endsWith(".melp")) {
    const reader = new FileReader();
    reader.onload = () => loadProject(JSON.parse(reader.result), "");
    reader.readAsText(file, "utf-8");
    return;
  }
  if (!file.type.startsWith("image/")) return;
  const reader = new FileReader();
  reader.onload = () => loadImageData(reader.result, file.name.replace(/\.[^.]+$/, ""), "");
  reader.readAsDataURL(file);
}

function deleteSelected() {
  if (!state.selectedId) return;
  pushHistory();
  state.labels = state.labels.filter((label) => label.id !== state.selectedId);
  state.selectedId = null;
  setDirty(true);
  render();
}

function duplicateSelected() {
  const label = selectedLabel();
  if (!label) return;
  pushHistory();
  const copy = JSON.parse(JSON.stringify({ ...label, id: state.nextId++, x: label.x + 16, y: label.y + 16 }));
  state.labels.push(copy);
  state.selectedId = copy.id;
  setDirty(true);
  render();
}

function moveSelected(dx, dy) {
  const label = selectedLabel();
  if (!label) return;
  pushHistory();
  label.x = Math.round(label.x + dx);
  label.y = Math.round(label.y + dy);
  setDirty(true);
  render();
}

for (const preset of presets) {
  const button = document.createElement("button");
  button.textContent = preset;
  button.addEventListener("click", () => {
    els.labelText.value = preset;
    beginLabelPlacement(preset, preset, true);
  });
  els.presetGrid.appendChild(button);
  presetButtons.set(preset, button);
}

els.openImageBtn.addEventListener("click", async () => {
  const result = await window.labeler.openImage();
  if (result) loadImageData(result.dataUrl, result.fileName, result.filePath);
});

els.openProjectBtn.addEventListener("click", async () => {
  const result = await window.labeler.openProject();
  if (result) loadProject(result.project, result.filePath);
});

els.saveProjectBtn.addEventListener("click", async () => {
  if (!requireImage()) return;
  const saved = await window.labeler.saveProject({
    fileName: safeBaseName(),
    imagePath: state.imagePath,
    project: projectPayload()
  });
  if (saved) {
    state.projectPath = saved;
    setDirty(false);
    setStatus(`프로젝트 저장 완료: ${saved}`);
    showToast("프로젝트가 저장되었습니다.");
  }
});

els.saveImageBtn.addEventListener("click", saveImage);

els.helpBtn.addEventListener("click", () => {
  els.helpDialog.showModal();
});

els.helpCloseBtn.addEventListener("click", () => {
  els.helpDialog.close();
});

els.helpDialog.addEventListener("click", (event) => {
  if (event.target === els.helpDialog) els.helpDialog.close();
});

els.labelText.addEventListener("input", () => {
  beginLabelPlacement(els.labelText.value || "(가)", "", false);
});

els.labelText.addEventListener("focus", () => {
  beginLabelPlacement(els.labelText.value || "(가)", "", false);
});

els.fontSize.addEventListener("input", () => {
  els.fontSizeValue.textContent = els.fontSize.value;
  const label = selectedLabel();
  if (label) {
    pushHistory();
    label.fontSize = Number(els.fontSize.value);
    setDirty(true);
    render();
  }
});

els.labelPadding.addEventListener("input", () => {
  els.labelPaddingValue.textContent = els.labelPadding.value;
  const label = selectedLabel();
  if (label) {
    pushHistory();
    label.padding = Number(els.labelPadding.value);
    setDirty(true);
    render();
  }
});

function labelStyleFromControls() {
  return {
    fontSize: Number(els.fontSize.value),
    padding: Number(els.labelPadding.value),
    fontFamily: resolveFontFamily(),
    color: els.textColor.value,
    background: els.labelBackground.value,
    bold: isPressed(els.boldText),
    italic: isPressed(els.italicText),
    underline: isPressed(els.underlineText),
    outline: isPressed(els.outlineText)
  };
}

function leaderStyleFromControls() {
  return {
    shape: els.leaderShape.value,
    style: els.leaderStyle.value,
    width: Number(els.leaderWidth.value),
    gap: Number(els.leaderGap.value)
  };
}

for (const control of [els.fontFamily, els.textColor, els.labelBackground]) {
  control.addEventListener("input", () => {
    const label = selectedLabel();
    if (!label) return;
    pushHistory();
    Object.assign(label, labelStyleFromControls());
    setDirty(true);
    render();
  });
}

for (const control of [els.boldText, els.italicText, els.underlineText, els.outlineText]) {
  control.addEventListener("click", () => {
    const label = selectedLabel();
    setPressed(control, !isPressed(control));
    if (!label) return;
    pushHistory();
    Object.assign(label, labelStyleFromControls());
    setDirty(true);
    render();
  });
}

els.applyStyleAllBtn.addEventListener("click", () => {
  if (state.labels.length === 0) return;
  pushHistory();
  const labelStyle = labelStyleFromControls();
  const leaderStyle = leaderStyleFromControls();

  for (const label of state.labels) {
    Object.assign(label, labelStyle);
    const leader = normalizedLeader(label);
    label.leader = {
      ...leader,
      ...leaderStyle
    };
  }

  render();
  setDirty(true);
  setStatus(`현재 서식을 라벨 ${state.labels.length}개에 적용했습니다`);
});

function updateLeaderFromControls() {
  const label = selectedLabel();
  if (!label) return;
  pushHistory();
  const existing = normalizedLeader(label);
  const bounds = labelBounds(label);
  label.leader = {
    ...existing,
    enabled: isPressed(els.leaderEnabled),
    shape: els.leaderShape.value,
    style: els.leaderStyle.value,
    width: Number(els.leaderWidth.value),
    gap: Number(els.leaderGap.value),
    x: Number.isFinite(Number(els.leaderX.value)) && els.leaderX.value !== "" ? Number(els.leaderX.value) : existing.x,
    y: Number.isFinite(Number(els.leaderY.value)) && els.leaderY.value !== "" ? Number(els.leaderY.value) : existing.y
  };
  if (!Number.isFinite(label.leader.x) || label.leader.x === 0 && label.leader.y === 0) {
    label.leader.x = Math.round(bounds.x - 42);
    label.leader.y = Math.round(bounds.y + bounds.height / 2);
  }
  els.leaderWidthValue.textContent = String(label.leader.width);
  els.leaderGapValue.textContent = String(label.leader.gap);
  els.leaderX.value = Math.round(label.leader.x);
  els.leaderY.value = Math.round(label.leader.y);
  setDirty(true);
  render();
}

for (const control of [els.leaderEnabled, els.leaderShape, els.leaderStyle, els.leaderWidth, els.leaderGap, els.leaderX, els.leaderY]) {
  const eventName = control === els.leaderEnabled ? "click" : "input";
  control.addEventListener(eventName, () => {
    if (control === els.leaderEnabled) setPressed(control, !isPressed(control));
    updateLeaderFromControls();
  });
}

els.leaderClearBtn.addEventListener("click", () => {
  const label = selectedLabel();
  if (!label) return;
  pushHistory();
  label.leader = { ...normalizedLeader(label), enabled: false };
  state.mode = "select";
  setAddMode(false);
  setDirty(true);
  render();
});

els.zoomOutBtn.addEventListener("click", () => {
  state.zoom = Math.max(0.12, state.zoom / 1.2);
  render();
});

els.zoomInBtn.addEventListener("click", () => {
  state.zoom = Math.min(4, state.zoom * 1.2);
  render();
});

els.fitBtn.addEventListener("click", fitZoom);

els.selectedText.addEventListener("input", () => {
  const label = selectedLabel();
  if (!label) return;
  pushHistory();
  label.text = els.selectedText.value;
  setDirty(true);
  render();
});

els.selectedX.addEventListener("input", () => {
  const label = selectedLabel();
  if (!label) return;
  pushHistory();
  label.x = Number(els.selectedX.value);
  setDirty(true);
  render();
});

els.selectedY.addEventListener("input", () => {
  const label = selectedLabel();
  if (!label) return;
  pushHistory();
  label.y = Number(els.selectedY.value);
  setDirty(true);
  render();
});

els.duplicateBtn.addEventListener("click", duplicateSelected);
els.deleteBtn.addEventListener("click", deleteSelected);
els.undoBtn.addEventListener("click", undo);
els.redoBtn.addEventListener("click", redo);

canvas.addEventListener("pointerdown", (event) => {
  if (!state.image) return;
  const point = getCanvasPoint(event);

  if (state.mode === "add") {
    pushHistory();
    const label = makeLeaderLabel(point.x, point.y, point.x + 48, point.y - 22);
    state.labels.push(label);
    state.selectedId = label.id;
    const bounds = labelBounds(label);
    state.dragging = { type: "new-label", id: label.id, offsetX: bounds.width / 2, offsetY: bounds.height / 2, changed: true };
    canvas.setPointerCapture(event.pointerId);
    render();
    showMagnifier(event, point);
    return;
  }

  const leaderHit = hitLeader(point);
  if (leaderHit) {
    state.selectedId = leaderHit.id;
    pushHistory();
    state.dragging = { type: "leader", id: leaderHit.id, changed: false };
    canvas.setPointerCapture(event.pointerId);
    render();
    showMagnifier(event, point);
    return;
  }

  const hit = hitLabel(point);
  if (hit) {
    const bounds = labelBounds(hit);
    state.selectedId = hit.id;
    pushHistory();
    state.dragging = { type: "label", id: hit.id, offsetX: point.x - bounds.x, offsetY: point.y - bounds.y, changed: false };
    canvas.setPointerCapture(event.pointerId);
  } else {
    state.selectedId = null;
  }
  render();
});

canvas.addEventListener("pointermove", (event) => {
  if (!state.dragging) return;
  const label = state.labels.find((item) => item.id === state.dragging.id);
  if (!label) return;
  const point = getCanvasPoint(event);

  if (state.dragging.type === "leader") {
    label.leader = {
      ...normalizedLeader(label),
      enabled: true,
      x: Math.round(point.x),
      y: Math.round(point.y)
    };
    state.dragging.changed = true;
    showMagnifier(event, point);
  } else {
    label.x = Math.round(point.x - state.dragging.offsetX);
    label.y = Math.round(point.y - state.dragging.offsetY);
    state.dragging.changed = true;
  }

  render();
});

canvas.addEventListener("pointerup", (event) => {
  if (state.dragging?.type === "new-label") setAddMode(false);
  if (state.dragging?.changed) setDirty(true);
  state.dragging = null;
  hideMagnifier();
  try {
    canvas.releasePointerCapture(event.pointerId);
  } catch (_error) {
  }
});

canvas.addEventListener("pointercancel", () => {
  state.dragging = null;
  hideMagnifier();
});

canvas.addEventListener("pointerleave", () => {
  if (!state.dragging) hideMagnifier();
});

canvas.addEventListener("dblclick", () => {
  const label = selectedLabel();
  if (!label) return;
  const next = window.prompt("라벨 문구", label.text);
  if (next !== null) {
    pushHistory();
    label.text = next;
    setDirty(true);
    render();
  }
});

canvasShell.addEventListener("dragover", (event) => {
  event.preventDefault();
  canvasShell.classList.add("drag-over");
});

canvasShell.addEventListener("dragleave", () => {
  canvasShell.classList.remove("drag-over");
});

canvasShell.addEventListener("drop", (event) => {
  event.preventDefault();
  canvasShell.classList.remove("drag-over");
  readDroppedFile(event.dataTransfer.files[0]);
});

document.addEventListener("keydown", (event) => {
  const tag = document.activeElement?.tagName;
  const typing = tag === "INPUT" || tag === "TEXTAREA";

  if (event.ctrlKey && event.key.toLowerCase() === "z") {
    event.preventDefault();
    undo();
    return;
  }

  if (event.ctrlKey && event.key.toLowerCase() === "y") {
    event.preventDefault();
    redo();
    return;
  }

  if (event.key === "Delete" && !typing) {
    deleteSelected();
  }

  if (!typing && event.key.startsWith("Arrow")) {
    const step = event.shiftKey ? 10 : 1;
    if (event.key === "ArrowLeft") moveSelected(-step, 0);
    if (event.key === "ArrowRight") moveSelected(step, 0);
    if (event.key === "ArrowUp") moveSelected(0, -step);
    if (event.key === "ArrowDown") moveSelected(0, step);
  }

  if (event.ctrlKey && event.key.toLowerCase() === "d") {
    event.preventDefault();
    duplicateSelected();
  }
});

window.addEventListener("resize", () => {
  if (state.image) render();
});

window.labeler.onOpenProjectData((payload) => {
  if (payload?.project) loadProject(payload.project, payload.filePath || "");
});

render();
populateFonts().then(() => render());
