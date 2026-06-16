const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const canvasShell = document.getElementById("canvasShell");
const dropEmpty = document.getElementById("dropEmpty");

const els = {
  fileName: document.getElementById("fileName"),
  status: document.getElementById("status"),
  openImageBtn: document.getElementById("openImageBtn"),
  openProjectBtn: document.getElementById("openProjectBtn"),
  knockoutBtn: document.getElementById("knockoutBtn"),
  knockoutBar: document.getElementById("knockoutBar"),
  knockoutTolerance: document.getElementById("knockoutTolerance"),
  knockoutTolValue: document.getElementById("knockoutTolValue"),
  knockoutDoneBtn: document.getElementById("knockoutDoneBtn"),
  canvasResizeBtn: document.getElementById("canvasResizeBtn"),
  contextBar: document.getElementById("contextBar"),
  groupTools: document.getElementById("groupTools"),
  groupBtn: document.getElementById("groupBtn"),
  ungroupBtn: document.getElementById("ungroupBtn"),
  alignGroup: document.getElementById("alignGroup"),
  alignLeft: document.getElementById("alignLeft"),
  alignCenterX: document.getElementById("alignCenterX"),
  alignRight: document.getElementById("alignRight"),
  alignTop: document.getElementById("alignTop"),
  alignCenterY: document.getElementById("alignCenterY"),
  alignBottom: document.getElementById("alignBottom"),
  distributeWrap: document.getElementById("distributeWrap"),
  distributeX: document.getElementById("distributeX"),
  distributeY: document.getElementById("distributeY"),
  resizeBar: document.getElementById("resizeBar"),
  resizeBgSelect: document.getElementById("resizeBgSelect"),
  resizeApplyBtn: document.getElementById("resizeApplyBtn"),
  resizeCancelBtn: document.getElementById("resizeCancelBtn"),
  saveProjectBtn: document.getElementById("saveProjectBtn"),
  saveImageBtn: document.getElementById("saveImageBtn"),
  labelText: document.getElementById("labelText"),
  presetGrid: document.getElementById("presetGrid"),
  formulaBtn: document.getElementById("formulaBtn"),
  formulaDialog: document.getElementById("formulaDialog"),
  formulaCloseBtn: document.getElementById("formulaCloseBtn"),
  formulaInput: document.getElementById("formulaInput"),
  formulaPreview: document.getElementById("formulaPreview"),
  formulaApplyBtn: document.getElementById("formulaApplyBtn"),
  applyStyleAllBtn: document.getElementById("applyStyleAllBtn"),
  fontFamily: document.getElementById("fontFamily"),
  fontSize: document.getElementById("fontSize"),
  fontSizeNumber: document.getElementById("fontSizeNumber"),
  labelPadding: document.getElementById("labelPadding"),
  labelPaddingValue: document.getElementById("labelPaddingValue"),
  textColor: document.getElementById("textColor"),
  labelBackground: document.getElementById("labelBackground"),
  boldText: document.getElementById("boldText"),
  italicText: document.getElementById("italicText"),
  underlineText: document.getElementById("underlineText"),
  outlineText: document.getElementById("outlineText"),
  rectShapeBtn: document.getElementById("rectShapeBtn"),
  ellipseShapeBtn: document.getElementById("ellipseShapeBtn"),
  polygonShapeBtn: document.getElementById("polygonShapeBtn"),
  fillEnabledBtn: document.getElementById("fillEnabledBtn"),
  fillColor: document.getElementById("fillColor"),
  fillPickerBtn: document.getElementById("fillPickerBtn"),
  strokeEnabledBtn: document.getElementById("strokeEnabledBtn"),
  strokeColor: document.getElementById("strokeColor"),
  strokePickerBtn: document.getElementById("strokePickerBtn"),
  shapeStrokeWidth: document.getElementById("shapeStrokeWidth"),
  shapeStrokeWidthValue: document.getElementById("shapeStrokeWidthValue"),
  deleteShapeBtn: document.getElementById("deleteShapeBtn"),
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
  leaderArrow: document.getElementById("leaderArrow"),
  leaderArrowShape: document.getElementById("leaderArrowShape"),
  leaderArrowSize: document.getElementById("leaderArrowSize"),
  leaderArrowSizeValue: document.getElementById("leaderArrowSizeValue"),
  leaderShape: document.getElementById("leaderShape"),
  leaderStyle: document.getElementById("leaderStyle"),
  leaderWidth: document.getElementById("leaderWidth"),
  leaderWidthValue: document.getElementById("leaderWidthValue"),
  leaderGap: document.getElementById("leaderGap"),
  leaderGapValue: document.getElementById("leaderGapValue"),
  leaderX: document.getElementById("leaderX"),
  leaderY: document.getElementById("leaderY"),
  magnifier: document.getElementById("magnifier"),
  magnifierCanvas: document.getElementById("magnifierCanvas"),
  magnifierSize: document.getElementById("magnifierSize"),
  magnifierMeta: document.getElementById("magnifierMeta"),
  fileDropInput: document.getElementById("fileDropInput"),
  helpBtn: document.getElementById("helpBtn"),
  helpDialog: document.getElementById("helpDialog"),
  helpCloseBtn: document.getElementById("helpCloseBtn"),
  helpTitle: document.getElementById("helpTitle"),
  helpPrevBtn: document.getElementById("helpPrevBtn"),
  helpNextBtn: document.getElementById("helpNextBtn"),
  helpPageInfo: document.getElementById("helpPageInfo"),
  toast: document.getElementById("toast"),
  updateProgress: document.getElementById("updateProgress"),
  updateProgressText: document.getElementById("updateProgressText"),
  updateProgressBar: document.getElementById("updateProgressBar"),
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
  shapes: [],
  selectedId: null,
  selectedIds: [],
  selectedShapeId: null,
  selectedShapeIds: [],
  groups: [],
  nextGroupId: 1,
  nextId: 1,
  nextShapeId: 1,
  zoom: 1,
  mode: "select",
  shapeTool: "",
  pickerTarget: "",
  polygonDraft: null,
  resizeFrame: null,
  resizePad: 0,
  resizeBg: "transparent",
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

function cloneShapes(shapes = state.shapes) {
  return JSON.parse(JSON.stringify(shapes));
}

function updateFileName() {
  if (!state.image) {
    els.fileName.textContent = "이미지를 열어 시작하세요";
    document.title = "모의고사 라벨러";
    return;
  }
  const dirtyMark = state.dirty ? "* " : "";
  els.fileName.textContent = `${dirtyMark}${state.imageName} · ${state.image.naturalWidth}×${state.image.naturalHeight}px`;
  document.title = state.dirty ? "모의고사 라벨러 *" : "모의고사 라벨러";
}

function setDirty(dirty) {
  state.dirty = Boolean(dirty);
  window.labeler.setDirtyState(state.dirty);
  updateFileName();
}

function snapshotState() {
  return {
    labels: cloneLabels(),
    shapes: cloneShapes(),
    selectedId: state.selectedId,
    selectedIds: state.selectedIds.slice(),
    selectedShapeId: state.selectedShapeId,
    selectedShapeIds: state.selectedShapeIds.slice(),
    groups: JSON.parse(JSON.stringify(state.groups)),
    nextGroupId: state.nextGroupId,
    nextId: state.nextId,
    nextShapeId: state.nextShapeId,
    imageDataUrl: state.imageDataUrl
  };
}

function applySnapshotData(snapshot) {
  state.labels = cloneLabels(snapshot.labels);
  state.shapes = cloneShapes(snapshot.shapes || []);
  state.selectedId = snapshot.selectedId;
  state.selectedIds = (snapshot.selectedIds || (snapshot.selectedId ? [snapshot.selectedId] : [])).slice();
  state.selectedShapeId = snapshot.selectedShapeId || null;
  state.selectedShapeIds = (snapshot.selectedShapeIds || (snapshot.selectedShapeId ? [snapshot.selectedShapeId] : [])).slice();
  state.groups = Array.isArray(snapshot.groups) ? JSON.parse(JSON.stringify(snapshot.groups)) : [];
  state.nextGroupId = snapshot.nextGroupId || (state.groups.reduce((m, g) => Math.max(m, g.id), 0) + 1);
  state.nextId = snapshot.nextId;
  state.nextShapeId = snapshot.nextShapeId || 1;
  state.polygonDraft = null;
  state.history.applying = false;
  setDirty(true);
  render();
}

function restoreSnapshot(snapshot) {
  state.history.applying = true;
  if (snapshot.imageDataUrl && snapshot.imageDataUrl !== state.imageDataUrl) {
    const image = new Image();
    image.onload = () => {
      state.image = image;
      state.imageDataUrl = snapshot.imageDataUrl;
      applySnapshotData(snapshot);
    };
    image.src = snapshot.imageDataUrl;
  } else {
    applySnapshotData(snapshot);
  }
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

function selectedLabels() {
  return state.labels.filter((label) => state.selectedIds.includes(label.id));
}

function clearLabelSelection() {
  state.selectedIds = [];
  state.selectedId = null;
}

function selectLabel(id, additive) {
  if (!additive) {
    state.selectedIds = [id];
    state.selectedId = id;
    return;
  }
  if (state.selectedIds.includes(id)) {
    state.selectedIds = state.selectedIds.filter((other) => other !== id);
    if (state.selectedId === id) state.selectedId = state.selectedIds[state.selectedIds.length - 1] || null;
  } else {
    state.selectedIds.push(id);
    state.selectedId = id;
  }
}

function selectedShapes() {
  return state.shapes.filter((shape) => state.selectedShapeIds.includes(shape.id));
}

function clearShapeSelection() {
  state.selectedShapeIds = [];
  state.selectedShapeId = null;
}

function clearAllSelection() {
  clearLabelSelection();
  clearShapeSelection();
}

function selectionCount() {
  return state.selectedIds.length + state.selectedShapeIds.length;
}

function selectShape(id, additive) {
  if (!additive) {
    state.selectedShapeIds = [id];
    state.selectedShapeId = id;
    return;
  }
  if (state.selectedShapeIds.includes(id)) {
    state.selectedShapeIds = state.selectedShapeIds.filter((other) => other !== id);
    if (state.selectedShapeId === id) state.selectedShapeId = state.selectedShapeIds[state.selectedShapeIds.length - 1] || null;
  } else {
    state.selectedShapeIds.push(id);
    state.selectedShapeId = id;
  }
}

function groupMemberLabelIds(groupId) {
  return state.labels.filter((l) => l.groupId === groupId).map((l) => l.id);
}

function groupMemberShapeIds(groupId) {
  return state.shapes.filter((s) => s.groupId === groupId).map((s) => s.id);
}

function selectGroup(groupId, additive) {
  const labelIds = groupMemberLabelIds(groupId);
  const shapeIds = groupMemberShapeIds(groupId);
  if (!additive) {
    state.selectedIds = labelIds.slice();
    state.selectedShapeIds = shapeIds.slice();
    state.selectedId = labelIds[labelIds.length - 1] || null;
    state.selectedShapeId = shapeIds[shapeIds.length - 1] || null;
    return;
  }
  for (const id of labelIds) if (!state.selectedIds.includes(id)) state.selectedIds.push(id);
  for (const id of shapeIds) if (!state.selectedShapeIds.includes(id)) state.selectedShapeIds.push(id);
  if (labelIds.length) state.selectedId = labelIds[labelIds.length - 1];
  if (shapeIds.length) state.selectedShapeId = shapeIds[shapeIds.length - 1];
}

function selectionHasGroup() {
  return [...selectedLabels(), ...selectedShapes()].some((obj) => obj.groupId);
}

function groupSelection() {
  if (selectionCount() < 2) return;
  pushHistory();
  const groupId = state.nextGroupId++;
  state.groups.push({ id: groupId, name: `그룹 ${groupId}` });
  for (const label of selectedLabels()) label.groupId = groupId;
  for (const shape of selectedShapes()) shape.groupId = groupId;
  setDirty(true);
  render();
}

function ungroupSelection() {
  const ids = new Set([...selectedLabels(), ...selectedShapes()].map((obj) => obj.groupId).filter((g) => g != null));
  if (!ids.size) return;
  pushHistory();
  for (const label of state.labels) if (ids.has(label.groupId)) delete label.groupId;
  for (const shape of state.shapes) if (ids.has(shape.groupId)) delete shape.groupId;
  state.groups = state.groups.filter((g) => !ids.has(g.id));
  setDirty(true);
  render();
}

function pruneEmptyGroups() {
  state.groups = state.groups.filter((g) =>
    state.labels.some((l) => l.groupId === g.id) || state.shapes.some((s) => s.groupId === g.id));
}

function startObjectDrag(point) {
  const labels = selectedLabels().map((label) => ({ id: label.id, ox: point.x - label.x, oy: point.y - label.y }));
  const shapes = selectedShapes().map((shape) => {
    const rect = normalizedShapeRect(shape);
    return { id: shape.id, ox: point.x - rect.x, oy: point.y - rect.y };
  });
  return { type: "objects", labels, shapes, changed: false };
}

function moveLabelBy(label, dx, dy) {
  if (!dx && !dy) return;
  label.x = Math.round(label.x + dx);
  label.y = Math.round(label.y + dy);
  if (label.leader) {
    label.leader.x = Math.round((label.leader.x || 0) + dx);
    label.leader.y = Math.round((label.leader.y || 0) + dy);
  }
}

function alignSelectedLabels(mode) {
  const labels = selectedLabels();
  const anchor = selectedLabel();
  if (labels.length < 2 || !anchor) return;
  const ab = labelBounds(anchor);
  pushHistory();
  for (const label of labels) {
    if (label.id === anchor.id) continue;
    const b = labelBounds(label);
    let targetX = label.x;
    let targetY = label.y;
    if (mode === "left") targetX = ab.x;
    else if (mode === "right") targetX = ab.x + ab.width - b.width;
    else if (mode === "centerX") targetX = ab.x + ab.width / 2 - b.width / 2;
    else if (mode === "top") targetY = ab.y;
    else if (mode === "bottom") targetY = ab.y + ab.height - b.height;
    else if (mode === "centerY") targetY = ab.y + ab.height / 2 - b.height / 2;
    moveLabelBy(label, Math.round(targetX) - label.x, Math.round(targetY) - label.y);
  }
  setDirty(true);
  render();
}

function distributeSelectedLabels(axis) {
  const labels = selectedLabels();
  if (labels.length < 3) {
    showToast("간격을 동일하게 하려면 3개 이상 선택하세요.");
    return;
  }
  const items = labels.map((label) => ({ label, bounds: labelBounds(label) }));
  pushHistory();
  if (axis === "x") {
    items.sort((a, b) => a.bounds.x - b.bounds.x);
    const left = items[0].bounds.x;
    const right = items[items.length - 1].bounds.x + items[items.length - 1].bounds.width;
    const totalWidth = items.reduce((sum, item) => sum + item.bounds.width, 0);
    const gap = (right - left - totalWidth) / (items.length - 1);
    let cursor = left;
    for (const item of items) {
      moveLabelBy(item.label, Math.round(cursor) - item.bounds.x, 0);
      cursor += item.bounds.width + gap;
    }
  } else {
    items.sort((a, b) => a.bounds.y - b.bounds.y);
    const top = items[0].bounds.y;
    const bottom = items[items.length - 1].bounds.y + items[items.length - 1].bounds.height;
    const totalHeight = items.reduce((sum, item) => sum + item.bounds.height, 0);
    const gap = (bottom - top - totalHeight) / (items.length - 1);
    let cursor = top;
    for (const item of items) {
      moveLabelBy(item.label, 0, Math.round(cursor) - item.bounds.y);
      cursor += item.bounds.height + gap;
    }
  }
  setDirty(true);
  render();
}

function updateContextBar() {
  if (!els.contextBar) return;
  els.contextBar.hidden = els.alignGroup.hidden && els.knockoutBar.hidden && els.resizeBar.hidden && els.groupTools.hidden;
}

function updateAlignToolbar() {
  const showAlign = state.mode === "select" && state.selectedIds.length >= 2;
  if (els.alignGroup) els.alignGroup.hidden = !showAlign;
  if (els.distributeWrap) els.distributeWrap.hidden = !(showAlign && state.selectedIds.length >= 3);
  const total = selectionCount();
  const showGroupTools = state.mode === "select" && (total >= 2 || selectionHasGroup());
  if (els.groupTools) els.groupTools.hidden = !showGroupTools;
  if (els.groupBtn) els.groupBtn.disabled = total < 2;
  if (els.ungroupBtn) els.ungroupBtn.disabled = !selectionHasGroup();
  updateContextBar();
}

let renderQueued = false;
function scheduleRender() {
  if (renderQueued) return;
  renderQueued = true;
  window.requestAnimationFrame(() => {
    renderQueued = false;
    render();
  });
}

function updateMarqueeSelection() {
  const drag = state.dragging;
  const rx = Math.min(drag.startX, drag.x);
  const ry = Math.min(drag.startY, drag.y);
  const rw = Math.abs(drag.x - drag.startX);
  const rh = Math.abs(drag.y - drag.startY);
  const hits = (rect) => rect.x < rx + rw && rect.x + rect.width > rx && rect.y < ry + rh && rect.y + rect.height > ry;
  const labelIds = drag.additive ? drag.baseLabels.slice() : [];
  const shapeIds = drag.additive ? drag.baseShapes.slice() : [];
  const touchedGroups = new Set();
  for (const label of state.labels) {
    if (hits(labelBounds(label))) {
      if (!labelIds.includes(label.id)) labelIds.push(label.id);
      if (label.groupId != null) touchedGroups.add(label.groupId);
    }
  }
  for (const shape of state.shapes) {
    if (hits(normalizedShapeRect(shape))) {
      if (!shapeIds.includes(shape.id)) shapeIds.push(shape.id);
      if (shape.groupId != null) touchedGroups.add(shape.groupId);
    }
  }
  for (const groupId of touchedGroups) {
    for (const id of groupMemberLabelIds(groupId)) if (!labelIds.includes(id)) labelIds.push(id);
    for (const id of groupMemberShapeIds(groupId)) if (!shapeIds.includes(id)) shapeIds.push(id);
  }
  state.selectedIds = labelIds;
  state.selectedShapeIds = shapeIds;
  state.selectedId = labelIds[labelIds.length - 1] || null;
  state.selectedShapeId = shapeIds[shapeIds.length - 1] || null;
}

function drawMarquee(context) {
  if (!state.dragging || state.dragging.type !== "marquee") return;
  const drag = state.dragging;
  const s = 1 / Math.max(state.zoom, 0.001);
  const rx = Math.min(drag.startX, drag.x);
  const ry = Math.min(drag.startY, drag.y);
  const rw = Math.abs(drag.x - drag.startX);
  const rh = Math.abs(drag.y - drag.startY);
  context.save();
  context.fillStyle = "rgba(31,76,143,0.08)";
  context.strokeStyle = "#1f4c8f";
  context.lineWidth = 1 * s;
  context.setLineDash([4 * s, 3 * s]);
  context.fillRect(rx, ry, rw, rh);
  context.strokeRect(rx, ry, rw, rh);
  context.restore();
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

function parseLabelRuns(text) {
  const str = String(text == null ? "" : text);
  const runs = [];
  let normal = "";
  let i = 0;
  const flushNormal = () => {
    if (normal) {
      runs.push({ text: normal, type: "normal" });
      normal = "";
    }
  };
  while (i < str.length) {
    const ch = str[i];
    if (ch === "\\" && (str[i + 1] === "_" || str[i + 1] === "^" || str[i + 1] === "\\")) {
      normal += str[i + 1];
      i += 2;
      continue;
    }
    if (ch === "_" || ch === "^") {
      const type = ch === "_" ? "sub" : "super";
      i += 1;
      let chunk = "";
      if (str[i] === "{") {
        i += 1;
        while (i < str.length && str[i] !== "}") {
          if (str[i] === "\\" && str[i + 1] === "}") {
            chunk += "}";
            i += 2;
            continue;
          }
          chunk += str[i];
          i += 1;
        }
        if (str[i] === "}") i += 1;
      } else if (i < str.length) {
        chunk = str[i];
        i += 1;
      }
      if (chunk) {
        flushNormal();
        runs.push({ text: chunk, type });
      }
      continue;
    }
    normal += ch;
    i += 1;
  }
  flushNormal();
  if (runs.length === 0) runs.push({ text: "", type: "normal" });
  return runs;
}

function layoutLabel(label, context = ctx) {
  const baseSize = label.fontSize;
  const subSize = Math.max(8, Math.round(baseSize * 0.7));
  const weight = label.bold ? "700" : "400";
  const style = label.italic ? "italic" : "normal";
  const family = label.fontFamily || "Batang, serif";
  let cursor = 0;
  const runs = parseLabelRuns(label.text).map((run) => {
    const size = run.type === "normal" ? baseSize : subSize;
    const font = `${style} ${weight} ${size}px ${family}`;
    context.save();
    context.font = font;
    const width = context.measureText(run.text).width;
    context.restore();
    const dy = run.type === "sub" ? Math.round(baseSize * 0.3) : run.type === "super" ? -Math.round(baseSize * 0.1) : 0;
    const item = { ...run, font, size, dx: cursor, width, dy };
    cursor += width;
    return item;
  });
  return { runs, totalWidth: cursor };
}

const boundsCache = new WeakMap();

function labelLayoutKey(label) {
  return [
    label.text,
    label.fontSize,
    label.fontFamily || "",
    label.bold ? 1 : 0,
    label.italic ? 1 : 0,
    Number.isFinite(label.padding) ? label.padding : 8,
    label.underline ? 1 : 0
  ].join("");
}

function labelBounds(label, context = ctx) {
  const key = labelLayoutKey(label);
  let cached = boundsCache.get(label);
  if (!cached || cached.key !== key) {
    const layout = layoutLabel(label, context);
    const padding = Number.isFinite(label.padding) ? label.padding : 8;
    const underlineExtra = label.underline ? Math.max(5, Math.round(label.fontSize * 0.18)) : 0;
    const width = Math.ceil(layout.totalWidth) + padding * 2;
    const height = Math.ceil(label.fontSize * 1.25) + padding * 2 + underlineExtra;
    cached = { key, width, height, padding, textWidth: layout.totalWidth, underlineExtra, layout };
    boundsCache.set(label, cached);
  }
  return {
    x: label.x,
    y: label.y,
    width: cached.width,
    height: cached.height,
    padding: cached.padding,
    textWidth: cached.textWidth,
    underlineExtra: cached.underlineExtra,
    layout: cached.layout
  };
}

function defaultLeader() {
  return {
    enabled: false,
    x: 0,
    y: 0,
    shape: "straight",
    style: "solid",
    width: 2,
    gap: 8,
    arrow: false,
    arrowShape: "filled",
    arrowSize: 12
  };
}

function normalizedLeader(label) {
  return { ...defaultLeader(), ...(label.leader || {}) };
}

function shapeStyleFromControls() {
  return {
    fillEnabled: isPressed(els.fillEnabledBtn),
    fillColor: els.fillColor.value,
    strokeEnabled: isPressed(els.strokeEnabledBtn),
    strokeColor: els.strokeColor.value,
    strokeWidth: Number(els.shapeStrokeWidth.value)
  };
}

function normalizedShapeRect(shape) {
  if (shape.kind === "polygon") {
    const xs = shape.points.map((point) => point.x);
    const ys = shape.points.map((point) => point.y);
    const minX = Math.min(...xs);
    const minY = Math.min(...ys);
    return { x: minX, y: minY, width: Math.max(...xs) - minX, height: Math.max(...ys) - minY };
  }
  const x = Math.min(shape.x, shape.x + shape.width);
  const y = Math.min(shape.y, shape.y + shape.height);
  return {
    x,
    y,
    width: Math.abs(shape.width),
    height: Math.abs(shape.height)
  };
}

const shapeImageCache = new Map();

function getShapeImage(dataUrl) {
  if (!dataUrl) return null;
  const cached = shapeImageCache.get(dataUrl);
  if (cached) return cached.ready ? cached.img : null;
  const entry = { img: new Image(), ready: false };
  entry.img.onload = () => {
    entry.ready = true;
    scheduleRender();
  };
  entry.img.src = dataUrl;
  shapeImageCache.set(dataUrl, entry);
  return null;
}

function drawShape(context, shape, selected = false) {
  const rect = normalizedShapeRect(shape);
  context.save();
  context.lineJoin = "round";

  if (shape.kind === "image") {
    const img = getShapeImage(shape.dataUrl);
    if (img) context.drawImage(img, rect.x, rect.y, rect.width, rect.height);
    if (selected) {
      context.strokeStyle = "#1f4c8f";
      context.lineWidth = 1;
      context.setLineDash([4, 3]);
      context.strokeRect(rect.x - 4, rect.y - 4, rect.width + 8, rect.height + 8);
      context.setLineDash([]);
    }
    context.restore();
    return;
  }

  if (shape.kind === "ellipse") {
    context.beginPath();
    context.ellipse(rect.x + rect.width / 2, rect.y + rect.height / 2, rect.width / 2, rect.height / 2, 0, 0, Math.PI * 2);
  } else if (shape.kind === "polygon") {
    context.beginPath();
    shape.points.forEach((point, index) => {
      if (index === 0) context.moveTo(point.x, point.y);
      else context.lineTo(point.x, point.y);
    });
    context.closePath();
  } else {
    context.beginPath();
    context.rect(rect.x, rect.y, rect.width, rect.height);
  }

  if (shape.fillEnabled) {
    context.fillStyle = shape.fillColor || "#ffffff";
    context.fill();
  }

  if (shape.strokeEnabled && shape.strokeWidth > 0) {
    context.strokeStyle = shape.strokeColor || "#111111";
    context.lineWidth = shape.strokeWidth;
    context.stroke();
  }

  if (selected) {
    context.strokeStyle = "#1f4c8f";
    context.lineWidth = 1;
    context.setLineDash([4, 3]);
    context.strokeRect(rect.x - 4, rect.y - 4, rect.width + 8, rect.height + 8);
    context.setLineDash([]);
  }

  context.restore();
}

function hitShape(point) {
  for (let i = state.shapes.length - 1; i >= 0; i -= 1) {
    const shape = state.shapes[i];
    const rect = normalizedShapeRect(shape);
    if (point.x >= rect.x && point.x <= rect.x + rect.width && point.y >= rect.y && point.y <= rect.y + rect.height) {
      return shape;
    }
  }
  return null;
}

function polygonCloseDistance() {
  return 12 / Math.max(state.zoom, 0.001);
}

function drawPolygonDraft(context) {
  const draft = state.polygonDraft;
  if (!draft || draft.points.length === 0) return;
  const scale = 1 / Math.max(state.zoom, 0.001);
  context.save();
  context.strokeStyle = "#1f4c8f";
  context.lineWidth = 1.5 * scale;
  context.lineJoin = "round";
  context.setLineDash([5 * scale, 3 * scale]);
  context.beginPath();
  draft.points.forEach((point, index) => {
    if (index === 0) context.moveTo(point.x, point.y);
    else context.lineTo(point.x, point.y);
  });
  if (draft.cursor) context.lineTo(draft.cursor.x, draft.cursor.y);
  context.stroke();
  context.setLineDash([]);
  draft.points.forEach((point, index) => {
    context.beginPath();
    context.arc(point.x, point.y, (index === 0 ? 6 : 4) * scale, 0, Math.PI * 2);
    context.fillStyle = index === 0 ? "#ffffff" : "#1f4c8f";
    context.strokeStyle = "#1f4c8f";
    context.lineWidth = 1.5 * scale;
    context.fill();
    context.stroke();
  });
  context.restore();
}

function commitPolygon() {
  const draft = state.polygonDraft;
  if (!draft || draft.points.length < 3) {
    if (draft && draft.points.length > 0) showToast("다각형은 점이 3개 이상이어야 완성됩니다.");
    state.polygonDraft = null;
    render();
    return;
  }
  pushHistory();
  const shape = {
    id: state.nextShapeId++,
    kind: "polygon",
    points: draft.points.map((point) => ({ x: Math.round(point.x), y: Math.round(point.y) })),
    ...shapeStyleFromControls()
  };
  state.shapes.push(shape);
  clearLabelSelection();
  selectShape(shape.id, false);
  state.polygonDraft = null;
  setShapeTool("");
  setDirty(true);
  render();
}

function rgbToHex(r, g, b) {
  return `#${[r, g, b].map((value) => value.toString(16).padStart(2, "0")).join("")}`;
}

let sampleCanvasEl = null;
let sampleCtxRef = null;
let sampleData = null;
let sampleDataUrl = "";

function getSampleImageData() {
  if (!state.image) return null;
  if (sampleData && sampleDataUrl === state.imageDataUrl && sampleCanvasEl.width === state.image.naturalWidth) {
    return sampleData;
  }
  if (!sampleCanvasEl) {
    sampleCanvasEl = document.createElement("canvas");
    sampleCtxRef = sampleCanvasEl.getContext("2d", { willReadFrequently: true });
  }
  sampleCanvasEl.width = state.image.naturalWidth;
  sampleCanvasEl.height = state.image.naturalHeight;
  sampleCtxRef.clearRect(0, 0, sampleCanvasEl.width, sampleCanvasEl.height);
  sampleCtxRef.drawImage(state.image, 0, 0);
  sampleData = sampleCtxRef.getImageData(0, 0, sampleCanvasEl.width, sampleCanvasEl.height);
  sampleDataUrl = state.imageDataUrl;
  return sampleData;
}

function sampleImageColor(point) {
  const data = getSampleImageData();
  if (!data) return "#000000";
  const w = state.image.naturalWidth;
  const h = state.image.naturalHeight;
  const x = Math.max(0, Math.min(w - 1, Math.round(point.x)));
  const y = Math.max(0, Math.min(h - 1, Math.round(point.y)));
  const i = (y * w + x) * 4;
  return rgbToHex(data.data[i], data.data[i + 1], data.data[i + 2]);
}

function hexToRgb(hex) {
  const value = String(hex).replace("#", "");
  return [parseInt(value.slice(0, 2), 16), parseInt(value.slice(2, 4), 16), parseInt(value.slice(4, 6), 16)];
}

function setImageFromDataUrl(dataUrl, done) {
  const image = new Image();
  image.onload = () => {
    state.image = image;
    state.imageDataUrl = dataUrl;
    if (done) done();
  };
  image.src = dataUrl;
}

function removeColorFromImage(targetHex, tolerance) {
  if (!state.image) return false;
  const w = state.image.naturalWidth;
  const h = state.image.naturalHeight;
  const work = document.createElement("canvas");
  work.width = w;
  work.height = h;
  const wctx = work.getContext("2d", { willReadFrequently: true });
  wctx.drawImage(state.image, 0, 0);
  const imageData = wctx.getImageData(0, 0, w, h);
  const data = imageData.data;
  const [tr, tg, tb] = hexToRgb(targetHex);
  const tol = Math.max(0, Number(tolerance) || 0);
  let removed = 0;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) continue;
    const diff = Math.max(Math.abs(data[i] - tr), Math.abs(data[i + 1] - tg), Math.abs(data[i + 2] - tb));
    if (diff <= tol) {
      data[i + 3] = 0;
      removed += 1;
    }
  }
  if (removed === 0) {
    showToast("그 색에 해당하는 픽셀이 없습니다.");
    return false;
  }
  wctx.putImageData(imageData, 0, 0);
  pushHistory();
  setImageFromDataUrl(work.toDataURL("image/png"), () => {
    setDirty(true);
    render();
    showToast(`${removed.toLocaleString()}개 픽셀을 투명하게 만들었습니다.`);
  });
  return true;
}

function applyKnockout(point) {
  const removed = removeColorFromImage(sampleImageColor(point), Number(els.knockoutTolerance.value));
  if (removed) setKnockoutMode(false);
}

function resizeCanvas(top, right, bottom, left, bg) {
  if (!state.image) return;
  top = Math.max(0, Math.round(top) || 0);
  right = Math.max(0, Math.round(right) || 0);
  bottom = Math.max(0, Math.round(bottom) || 0);
  left = Math.max(0, Math.round(left) || 0);
  if (top + right + bottom + left === 0) return;
  const w = state.image.naturalWidth + left + right;
  const h = state.image.naturalHeight + top + bottom;
  const work = document.createElement("canvas");
  work.width = w;
  work.height = h;
  const wctx = work.getContext("2d");
  if (bg === "white") {
    wctx.fillStyle = "#ffffff";
    wctx.fillRect(0, 0, w, h);
  }
  wctx.drawImage(state.image, left, top);
  pushHistory();
  for (const label of state.labels) {
    label.x += left;
    label.y += top;
    if (label.leader) {
      label.leader.x = (label.leader.x || 0) + left;
      label.leader.y = (label.leader.y || 0) + top;
    }
  }
  for (const shape of state.shapes) {
    if (shape.kind === "polygon") {
      for (const vertex of shape.points) {
        vertex.x += left;
        vertex.y += top;
      }
    } else {
      shape.x += left;
      shape.y += top;
    }
  }
  setImageFromDataUrl(work.toDataURL("image/png"), () => {
    setDirty(true);
    fitZoom();
    showToast(`캔버스를 ${w}×${h}px로 늘렸습니다.`);
  });
}

function setCanvasResizeMode(active) {
  if (active && !requireImage()) return;
  if (!active) {
    state.mode = "select";
    state.resizeFrame = null;
    els.resizeBar.hidden = true;
    els.canvasResizeBtn.classList.remove("active");
    render();
    return;
  }
  setAddMode(false);
  setShapeTool("");
  exitKnockout();
  state.mode = "canvasResize";
  clearAllSelection();
  state.resizePad = Math.max(120, Math.round(Math.max(state.image.naturalWidth, state.image.naturalHeight) * 0.5));
  state.resizeFrame = { top: 0, right: 0, bottom: 0, left: 0 };
  state.resizeBg = els.resizeBgSelect.value || "transparent";
  els.resizeBar.hidden = false;
  els.canvasResizeBtn.classList.add("active");
  showToast("가장자리의 파란 점을 드래그해 캔버스를 늘리세요.");
  const availW = Math.max(240, canvasShell.clientWidth - 72);
  const availH = Math.max(180, canvasShell.clientHeight - 72);
  const fullW = state.image.naturalWidth + state.resizePad * 2;
  const fullH = state.image.naturalHeight + state.resizePad * 2;
  state.zoom = Math.max(0.05, Math.min(1, availW / fullW, availH / fullH));
  render();
}

function resizeHandlePositions() {
  const pad = state.resizePad;
  const f = state.resizeFrame;
  const x0 = pad - f.left;
  const y0 = pad - f.top;
  const x1 = pad + state.image.naturalWidth + f.right;
  const y1 = pad + state.image.naturalHeight + f.bottom;
  const mx = (x0 + x1) / 2;
  const my = (y0 + y1) / 2;
  return [
    { key: "n", x: mx, y: y0 },
    { key: "s", x: mx, y: y1 },
    { key: "w", x: x0, y: my },
    { key: "e", x: x1, y: my },
    { key: "nw", x: x0, y: y0 },
    { key: "ne", x: x1, y: y0 },
    { key: "sw", x: x0, y: y1 },
    { key: "se", x: x1, y: y1 }
  ];
}

function hitResizeHandle(point) {
  const dist = 14 / Math.max(state.zoom, 0.001);
  for (const handle of resizeHandlePositions()) {
    if (Math.abs(point.x - handle.x) <= dist && Math.abs(point.y - handle.y) <= dist) return handle.key;
  }
  return null;
}

function updateResizeFrameFromPoint(key, point) {
  const pad = state.resizePad;
  const f = state.resizeFrame;
  const imgW = state.image.naturalWidth;
  const imgH = state.image.naturalHeight;
  if (key.includes("n")) f.top = Math.max(0, Math.min(pad, Math.round(pad - point.y)));
  if (key.includes("s")) f.bottom = Math.max(0, Math.min(pad, Math.round(point.y - (pad + imgH))));
  if (key.includes("w")) f.left = Math.max(0, Math.min(pad, Math.round(pad - point.x)));
  if (key.includes("e")) f.right = Math.max(0, Math.min(pad, Math.round(point.x - (pad + imgW))));
}

function renderResizePreview() {
  const pad = state.resizePad;
  const imgW = state.image.naturalWidth;
  const imgH = state.image.naturalHeight;
  const W = imgW + pad * 2;
  const H = imgH + pad * 2;
  canvas.width = W;
  canvas.height = H;
  canvas.style.width = `${Math.round(W * state.zoom)}px`;
  canvas.style.height = `${Math.round(H * state.zoom)}px`;
  canvas.style.display = "block";
  dropEmpty.style.display = "none";

  const f = state.resizeFrame;
  const fx = pad - f.left;
  const fy = pad - f.top;
  const fw = imgW + f.left + f.right;
  const fh = imgH + f.top + f.bottom;

  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "#d6dae2";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = state.resizeBg === "white" ? "#ffffff" : "#f3f5f9";
  ctx.fillRect(fx, fy, fw, fh);

  ctx.save();
  ctx.translate(pad, pad);
  ctx.drawImage(state.image, 0, 0);
  for (const shape of state.shapes) drawShape(ctx, shape, false);
  for (const label of state.labels) drawLeader(ctx, label, false);
  for (const label of state.labels) drawLabel(ctx, label, false);
  ctx.restore();

  const s = 1 / Math.max(state.zoom, 0.001);
  ctx.strokeStyle = "#1f4c8f";
  ctx.lineWidth = 1.5 * s;
  ctx.setLineDash([6 * s, 4 * s]);
  ctx.strokeRect(fx, fy, fw, fh);
  ctx.setLineDash([]);
  const hs = 6 * s;
  for (const handle of resizeHandlePositions()) {
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#1f4c8f";
    ctx.lineWidth = 1.5 * s;
    ctx.fillRect(handle.x - hs, handle.y - hs, hs * 2, hs * 2);
    ctx.strokeRect(handle.x - hs, handle.y - hs, hs * 2, hs * 2);
  }
  setStatus(`캔버스 ${Math.round(fw)}×${Math.round(fh)}px · 여백 좌${f.left} 우${f.right} 상${f.top} 하${f.bottom}`);
}

function applyCanvasResize() {
  const f = state.resizeFrame;
  if (!f) return;
  const { top, right, bottom, left } = f;
  state.mode = "select";
  state.resizeFrame = null;
  els.resizeBar.hidden = true;
  els.canvasResizeBtn.classList.remove("active");
  if (top + right + bottom + left === 0) {
    render();
    return;
  }
  resizeCanvas(top, right, bottom, left, state.resizeBg);
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

  if (leader.arrow) {
    let fromX = end.x;
    let fromY = end.y;
    if (leader.shape === "elbow") {
      fromX = leader.x + (end.x - leader.x) * 0.58;
      fromY = leader.y;
    }
    const angle = Math.atan2(leader.y - fromY, leader.x - fromX);
    const size = Number.isFinite(leader.arrowSize) ? leader.arrowSize : 12;
    const spread = 0.42;
    const back = angle + Math.PI;
    const p1x = leader.x + Math.cos(back - spread) * size;
    const p1y = leader.y + Math.sin(back - spread) * size;
    const p2x = leader.x + Math.cos(back + spread) * size;
    const p2y = leader.y + Math.sin(back + spread) * size;
    context.fillStyle = "#111";
    context.lineWidth = Math.max(1.4, leader.width);
    context.beginPath();
    context.moveTo(leader.x, leader.y);
    context.lineTo(p1x, p1y);
    if (leader.arrowShape === "open") {
      context.moveTo(leader.x, leader.y);
      context.lineTo(p2x, p2y);
      context.stroke();
    } else {
      context.lineTo(p2x, p2y);
      context.closePath();
      context.fill();
    }
  }

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

function drawLabel(context, label, selected = false, isAnchor = false) {
  const bounds = labelBounds(label, context);
  context.save();
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
  const outlineColor = label.color === "#ffffff" ? "#111111" : "#ffffff";
  const outlineWidth = Math.max(3, Math.round(label.fontSize * 0.13));

  for (const run of bounds.layout.runs) {
    if (!run.text) continue;
    const rx = textX + run.dx;
    const ry = textY + run.dy;
    context.font = run.font;
    if (label.outline) {
      context.strokeStyle = outlineColor;
      context.lineWidth = outlineWidth;
      context.lineJoin = "round";
      context.strokeText(run.text, rx, ry);
    }
    context.fillStyle = label.color;
    context.fillText(run.text, rx, ry);
  }

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

  if (selected || isAnchor) {
    const s = 1 / Math.max(state.zoom, 0.001);
    const pad = 4;
    context.strokeStyle = "#1f4c8f";
    if (isAnchor) {
      context.setLineDash([]);
      context.lineWidth = 2.5 * s;
      context.strokeRect(bounds.x - pad, bounds.y - pad, bounds.width + pad * 2, bounds.height + pad * 2);
      const corners = [
        [bounds.x - pad, bounds.y - pad],
        [bounds.x + bounds.width + pad, bounds.y - pad],
        [bounds.x - pad, bounds.y + bounds.height + pad],
        [bounds.x + bounds.width + pad, bounds.y + bounds.height + pad]
      ];
      context.fillStyle = "#1f4c8f";
      for (const [cx, cy] of corners) {
        context.beginPath();
        context.arc(cx, cy, 4 * s, 0, Math.PI * 2);
        context.fill();
      }
    } else {
      context.lineWidth = 1.2 * s;
      context.setLineDash([4 * s, 3 * s]);
      context.strokeRect(bounds.x - pad, bounds.y - pad, bounds.width + pad * 2, bounds.height + pad * 2);
      context.setLineDash([]);
    }
  }

  context.restore();
}

function drawTo(targetCanvas, options = {}) {
  const includeImage = options.includeImage !== false;
  const includeLabels = options.includeLabels !== false;
  const includeShapes = options.includeShapes !== false;
  const includeSelection = options.includeSelection === true;
  const targetCtx = targetCanvas.getContext("2d");
  targetCtx.clearRect(0, 0, targetCanvas.width, targetCanvas.height);

  if (includeImage && state.image) {
    targetCtx.drawImage(state.image, 0, 0);
  }

  if (includeShapes) {
    for (const shape of state.shapes) {
      drawShape(targetCtx, shape, includeSelection && state.selectedShapeIds.includes(shape.id));
    }
  }

  if (includeLabels) {
    for (const label of state.labels) {
      drawLeader(targetCtx, label, includeSelection && label.id === state.selectedId);
    }
    for (const label of state.labels) {
      const isAnchor = includeSelection && label.id === state.selectedId;
      const isSelected = includeSelection && !isAnchor && state.selectedIds.includes(label.id);
      drawLabel(targetCtx, label, isSelected, isAnchor);
    }
  }
}

function render() {
  if (!state.image) {
    canvas.style.display = "none";
    dropEmpty.style.display = "grid";
    updateLabelList();
    updateInspector();
    updateShapePanel();
    updateHistoryButtons();
    updateAlignToolbar();
    return;
  }

  if (state.mode === "canvasResize" && state.resizeFrame) {
    renderResizePreview();
    updateLabelList();
    updateInspector();
    updateShapePanel();
    updateHistoryButtons();
    updateAlignToolbar();
    return;
  }

  canvas.width = state.image.naturalWidth;
  canvas.height = state.image.naturalHeight;
  canvas.style.width = `${Math.round(canvas.width * state.zoom)}px`;
  canvas.style.height = `${Math.round(canvas.height * state.zoom)}px`;
  canvas.style.display = "block";
  dropEmpty.style.display = "none";
  drawTo(canvas, { includeSelection: true });
  drawPolygonDraft(ctx);
  drawMarquee(ctx);
  updateAlignToolbar();
  updateLabelList();
  updateInspector();
  updateShapePanel();
  updateHistoryButtons();
  setStatus(`${canvas.width}×${canvas.height}px · ${Math.round(state.zoom * 100)}% · 라벨 ${state.labels.length}개 · 도형 ${state.shapes.length}개`);
}

function fitZoom() {
  if (!state.image) return;
  const availableWidth = Math.max(240, canvasShell.clientWidth - 72);
  const availableHeight = Math.max(180, canvasShell.clientHeight - 72);
  state.zoom = Math.min(1, availableWidth / state.image.naturalWidth, availableHeight / state.image.naturalHeight);
  state.zoom = Math.max(0.12, state.zoom);
  render();
}

function setZoom(nextZoom, event = null) {
  if (!state.image) return;
  const previousZoom = state.zoom;
  const next = Math.max(0.12, Math.min(4, nextZoom));
  if (Math.abs(previousZoom - next) < 0.001) return;

  let focal = null;
  if (event) {
    const canvasRect = canvas.getBoundingClientRect();
    const shellRect = canvasShell.getBoundingClientRect();
    focal = {
      imageX: (event.clientX - canvasRect.left) / previousZoom,
      imageY: (event.clientY - canvasRect.top) / previousZoom,
      shellX: event.clientX - shellRect.left,
      shellY: event.clientY - shellRect.top
    };
  }

  state.zoom = next;
  render();

  if (focal) {
    window.requestAnimationFrame(() => {
      canvasShell.scrollLeft = Math.max(0, focal.imageX * next - focal.shellX);
      canvasShell.scrollTop = Math.max(0, focal.imageY * next - focal.shellY);
    });
  }
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
  if (active) {
    state.shapeTool = "";
    state.pickerTarget = "";
    state.polygonDraft = null;
    exitKnockout();
    exitResize();
  }
  canvasShell.classList.toggle("add-mode", active);
  canvasShell.classList.remove("shape-mode", "picker-mode");
  els.labelText.classList.toggle("active-input", active && !state.activePreset);
  for (const [preset, button] of presetButtons.entries()) {
    button.classList.toggle("active", active && preset === state.activePreset);
  }
  if (active) showToast("원하는 그림 영역을 누르고 드래그하세요!");
}

function setShapeTool(tool) {
  if (tool && !requireImage()) return;
  state.mode = tool ? "shape" : "select";
  state.shapeTool = tool;
  state.pickerTarget = "";
  state.polygonDraft = null;
  hideMagnifier();
  exitKnockout();
  exitResize();
  canvasShell.classList.toggle("shape-mode", Boolean(tool));
  canvasShell.classList.remove("add-mode", "picker-mode");
  els.labelText.classList.remove("active-input");
  for (const button of presetButtons.values()) button.classList.remove("active");
  els.rectShapeBtn.classList.toggle("active", tool === "rectangle");
  els.ellipseShapeBtn.classList.toggle("active", tool === "ellipse");
  els.polygonShapeBtn.classList.toggle("active", tool === "polygon");
  if (tool === "polygon") showToast("점을 차례로 클릭하세요. 처음 점을 다시 누르면 완성됩니다.");
  else if (tool) showToast("도형을 넣을 영역을 드래그하세요. (Shift: 정사각형·정원)");
}

function setPickerMode(target) {
  if (!requireImage()) return;
  state.mode = "picker";
  state.shapeTool = "";
  state.polygonDraft = null;
  state.pickerTarget = target;
  canvasShell.classList.add("picker-mode");
  canvasShell.classList.remove("add-mode", "shape-mode");
  els.rectShapeBtn.classList.remove("active");
  els.ellipseShapeBtn.classList.remove("active");
  exitKnockout();
  exitResize();
  showToast(`${target === "fill" ? "채우기" : "경계선"} 색으로 사용할 지점을 클릭하세요.`);
}

function exitKnockout() {
  els.knockoutBar.hidden = true;
  els.knockoutBtn.classList.remove("active");
  canvasShell.classList.remove("knockout-mode");
  updateContextBar();
}

function exitResize() {
  state.resizeFrame = null;
  if (state.mode === "canvasResize") state.mode = "select";
  els.resizeBar.hidden = true;
  els.canvasResizeBtn.classList.remove("active");
  updateContextBar();
}

function setKnockoutMode(active) {
  if (active && !requireImage()) return;
  if (!active) {
    state.mode = "select";
    exitKnockout();
    return;
  }
  state.mode = "knockout";
  state.shapeTool = "";
  state.pickerTarget = "";
  state.polygonDraft = null;
  hideMagnifier();
  exitResize();
  canvasShell.classList.remove("add-mode", "shape-mode", "picker-mode");
  els.labelText.classList.remove("active-input");
  for (const button of presetButtons.values()) button.classList.remove("active");
  els.rectShapeBtn.classList.remove("active");
  els.ellipseShapeBtn.classList.remove("active");
  els.polygonShapeBtn.classList.remove("active");
  canvasShell.classList.add("knockout-mode");
  els.knockoutBar.hidden = false;
  els.knockoutBtn.classList.add("active");
  updateContextBar();
  showToast("투명하게 만들 색을 클릭하세요.");
}

function addLabelAt(x, y, text) {
  if (!state.image) return;
  const label = makeLabel(Math.round(x), Math.round(y), text);
  state.labels.push(label);
  state.selectedIds = [label.id];
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
  const sourceSize = 80;
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
  els.magnifier.style.left = `${Math.max(8, window.innerWidth - 272)}px`;
  els.magnifier.style.top = `${Math.max(8, window.innerHeight - 252)}px`;
  els.magnifier.hidden = false;
}

function hideMagnifier() {
  els.magnifier.hidden = true;
}

function updateLabelList() {
  els.labelList.innerHTML = "";
  for (const group of state.groups) {
    const labelCount = groupMemberLabelIds(group.id).length;
    const shapeCount = groupMemberShapeIds(group.id).length;
    const count = labelCount + shapeCount;
    if (!count) continue;
    const anyLabelSel = groupMemberLabelIds(group.id).some((id) => state.selectedIds.includes(id));
    const anyShapeSel = groupMemberShapeIds(group.id).some((id) => state.selectedShapeIds.includes(id));
    const row = document.createElement("button");
    row.className = `label-row${anyLabelSel || anyShapeSel ? " selected" : ""}`;
    row.innerHTML = `<span class="label-main"><span class="leader-badge group">그룹</span><span class="label-text">${escapeHtml(group.name)}</span></span><span class="label-pos">${count}개</span>`;
    row.addEventListener("click", (event) => {
      selectGroup(group.id, event.ctrlKey || event.shiftKey || event.metaKey);
      render();
    });
    els.labelList.appendChild(row);
  }
  for (const label of state.labels) {
    if (label.groupId != null) continue;
    const row = document.createElement("button");
    const isSelected = state.selectedIds.includes(label.id);
    const isAnchor = label.id === state.selectedId;
    row.className = `label-row${isSelected ? " selected" : ""}${isAnchor ? " anchor" : ""}`;
    const leader = normalizedLeader(label);
    row.innerHTML = `<span class="label-main"><span class="leader-badge${leader.enabled ? " on" : ""}">${leader.enabled ? "지시선" : "라벨"}</span><span class="label-text">${escapeHtml(label.text)}</span></span><span class="label-pos">${Math.round(label.x)}, ${Math.round(label.y)}</span>`;
    row.addEventListener("click", (event) => {
      const additive = event.ctrlKey || event.shiftKey || event.metaKey;
      if (!additive) clearShapeSelection();
      selectLabel(label.id, additive);
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
  els.leaderArrow.disabled = disabled;
  els.leaderArrowShape.disabled = disabled;
  els.leaderArrowSize.disabled = disabled;
  els.leaderShape.disabled = disabled;
  els.leaderStyle.disabled = disabled;
  els.leaderWidth.disabled = disabled;
  els.leaderGap.disabled = disabled;
  els.leaderX.disabled = disabled;
  els.leaderY.disabled = disabled;

  if (!label) {
    els.selectedText.value = "";
    els.selectedX.value = "";
    els.selectedY.value = "";
    setPressed(els.leaderEnabled, false);
    setPressed(els.leaderArrow, false);
    els.leaderWidthValue.textContent = els.leaderWidth.value;
    els.leaderGapValue.textContent = els.leaderGap.value;
    els.leaderArrowSizeValue.textContent = els.leaderArrowSize.value;
    els.leaderX.value = "";
    els.leaderY.value = "";
    return;
  }

  const leader = normalizedLeader(label);
  els.selectedText.value = label.text;
  els.selectedX.value = Math.round(label.x);
  els.selectedY.value = Math.round(label.y);
  els.fontSizeNumber.value = label.fontSize;
  els.fontSize.value = Math.min(72, Math.max(12, label.fontSize));
  els.labelPadding.value = Number.isFinite(label.padding) ? label.padding : 8;
  els.labelPaddingValue.textContent = String(Number.isFinite(label.padding) ? label.padding : 8);
  els.textColor.value = label.color || "#111111";
  els.labelBackground.value = label.background || "none";
  els.boldText.checked = Boolean(label.bold);
  els.italicText.checked = Boolean(label.italic);
  els.underlineText.checked = Boolean(label.underline);
  els.outlineText.checked = label.outline !== false;
  setPressed(els.leaderEnabled, leader.enabled);
  setPressed(els.leaderArrow, Boolean(leader.arrow));
  els.leaderArrowShape.value = leader.arrowShape || "filled";
  els.leaderArrowSize.value = Number.isFinite(leader.arrowSize) ? leader.arrowSize : 12;
  els.leaderArrowSizeValue.textContent = String(els.leaderArrowSize.value);
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

function selectedShape() {
  return state.shapes.find((shape) => shape.id === state.selectedShapeId) || null;
}

function updateShapePanel() {
  const shape = selectedShape();
  els.deleteShapeBtn.disabled = !shape;
  els.shapeStrokeWidthValue.textContent = els.shapeStrokeWidth.value;
  if (!shape) return;
  setPressed(els.fillEnabledBtn, shape.fillEnabled);
  setPressed(els.strokeEnabledBtn, shape.strokeEnabled);
  els.fillColor.value = shape.fillColor || "#ffffff";
  els.strokeColor.value = shape.strokeColor || "#111111";
  els.shapeStrokeWidth.value = Number.isFinite(shape.strokeWidth) ? shape.strokeWidth : 2;
  els.shapeStrokeWidthValue.textContent = String(els.shapeStrokeWidth.value);
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

function svgRasterSize(svgText, fallback) {
  let w = 0;
  let h = 0;
  const head = svgText.slice(0, 1000);
  const wm = head.match(/<svg[^>]*?\bwidth\s*=\s*"([\d.]+)/i);
  const hm = head.match(/<svg[^>]*?\bheight\s*=\s*"([\d.]+)/i);
  if (wm) w = Math.round(parseFloat(wm[1]));
  if (hm) h = Math.round(parseFloat(hm[1]));
  if (!w || !h) {
    const vb = head.match(/viewBox\s*=\s*"\s*[-\d.]+[\s,]+[-\d.]+[\s,]+([\d.]+)[\s,]+([\d.]+)/i);
    if (vb) {
      if (!w) w = Math.round(parseFloat(vb[1]));
      if (!h) h = Math.round(parseFloat(vb[2]));
    }
  }
  return { w: w || fallback, h: h || fallback };
}

function svgUpscaledSize(declaredW, declaredH, target = 2000) {
  const maxDim = Math.max(declaredW || 0, declaredH || 0) || 1000;
  const up = Math.max(1, Math.min(60, target / maxDim));
  return { w: Math.max(1, Math.round((declaredW || maxDim) * up)), h: Math.max(1, Math.round((declaredH || maxDim) * up)) };
}

function rasterizeSvg(dataUrl, done) {
  let svgText = "";
  try {
    svgText = decodeURIComponent(escape(atob(dataUrl.slice(dataUrl.indexOf(",") + 1))));
  } catch (_error) {
    svgText = "";
  }
  const probe = new Image();
  probe.onload = () => {
    const size = svgRasterSize(svgText, 0);
    const target = svgUpscaledSize(size.w || probe.naturalWidth || 1000, size.h || probe.naturalHeight || 1000);
    const work = document.createElement("canvas");
    work.width = target.w;
    work.height = target.h;
    work.getContext("2d").drawImage(probe, 0, 0, target.w, target.h);
    done(work.toDataURL("image/png"));
  };
  probe.onerror = () => done(null);
  probe.src = dataUrl;
}

const SVG_NON_RENDER = new Set(["defs", "style", "title", "desc", "metadata", "symbol", "lineargradient", "radialgradient", "filter", "clippath", "mask", "pattern"]);

function svgRenderableChildren(node) {
  return Array.from(node.children).filter((el) => !SVG_NON_RENDER.has(el.tagName.toLowerCase()));
}

function svgDescendToPieces(root) {
  let node = root;
  let kids = svgRenderableChildren(node);
  while (kids.length === 1 && kids[0].tagName.toLowerCase() === "g") {
    node = kids[0];
    kids = svgRenderableChildren(node);
  }
  return kids;
}

function svgStringToImage(svgStr) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgStr)))}`;
  });
}

function loadSvgFallback(dataUrl, fileName, filePath) {
  rasterizeSvg(dataUrl, (pngUrl) => {
    if (!pngUrl) {
      showToast("SVG를 불러오지 못했습니다.");
      return;
    }
    loadImageData(pngUrl, fileName, filePath);
  });
}

async function loadSvgPieces(dataUrl, fileName, filePath) {
  try {
    await loadSvgPiecesInner(dataUrl, fileName, filePath);
  } catch (_error) {
    loadSvgFallback(dataUrl, fileName, filePath);
  }
}

async function loadSvgPiecesInner(dataUrl, fileName, filePath) {
  let svgText = "";
  try {
    svgText = decodeURIComponent(escape(atob(dataUrl.slice(dataUrl.indexOf(",") + 1))));
  } catch (_error) {
    svgText = "";
  }
  if (!svgText) {
    loadSvgFallback(dataUrl, fileName, filePath);
    return;
  }
  const declared = svgRasterSize(svgText, 1000);
  const upscaled = svgUpscaledSize(declared.w, declared.h);
  const W = upscaled.w;
  const H = upscaled.h;
  let doc = null;
  try {
    doc = new DOMParser().parseFromString(svgText, "image/svg+xml");
  } catch (_error) {
    doc = null;
  }
  const svg = doc && doc.documentElement;
  if (!svg || svg.tagName.toLowerCase() !== "svg" || svg.querySelector("parsererror")) {
    loadSvgFallback(dataUrl, fileName, filePath);
    return;
  }
  svg.setAttribute("width", String(W));
  svg.setAttribute("height", String(H));
  if (!svg.getAttribute("viewBox")) svg.setAttribute("viewBox", `0 0 ${declared.w} ${declared.h}`);
  svg.style.position = "absolute";
  svg.style.left = "-99999px";
  svg.style.top = "0px";
  svg.style.opacity = "0";
  svg.style.pointerEvents = "none";
  document.body.appendChild(svg);

  const ASK_OVER = 80;
  const HARD_MAX = 300;
  const pieces = svgDescendToPieces(svg);
  if (pieces.length < 2) {
    document.body.removeChild(svg);
    loadSvgFallback(dataUrl, fileName, filePath);
    return;
  }
  if (pieces.length > HARD_MAX) {
    document.body.removeChild(svg);
    showToast(`조각이 ${pieces.length}개로 너무 많아 한 장(고해상도)으로 불러왔습니다.`);
    loadSvgFallback(dataUrl, fileName, filePath);
    return;
  }
  if (pieces.length > ASK_OVER) {
    const proceed = window.confirm(`이 SVG는 조각 ${pieces.length}개로 나뉩니다. 조각이 많으면 불러오기가 느리고 무거울 수 있어요.\n\n[확인] 조각으로 나눠서 불러오기\n[취소] 한 장(고해상도)으로 불러오기`);
    if (!proceed) {
      document.body.removeChild(svg);
      loadSvgFallback(dataUrl, fileName, filePath);
      return;
    }
  }

  const svgRect = svg.getBoundingClientRect();
  const metas = pieces.map((p) => {
    const r = p.getBoundingClientRect();
    return { x: r.left - svgRect.left, y: r.top - svgRect.top, w: r.width, h: r.height };
  });
  const fullW = W;
  const fullH = H;
  const shapes = [];
  let nextShapeId = 1;

  for (let i = 0; i < pieces.length; i += 1) {
    const meta = metas[i];
    if (meta.w < 1 || meta.h < 1) continue;
    const clone = svg.cloneNode(true);
    clone.removeAttribute("style");
    const clonePieces = svgDescendToPieces(clone);
    clonePieces.forEach((c, j) => {
      if (j !== i) c.style.display = "none";
    });
    let img;
    try {
      img = await svgStringToImage(new XMLSerializer().serializeToString(clone));
    } catch (_error) {
      continue;
    }
    const full = document.createElement("canvas");
    full.width = fullW;
    full.height = fullH;
    full.getContext("2d").drawImage(img, 0, 0, fullW, fullH);
    const pad = 2;
    const bx = Math.max(0, meta.x - pad);
    const by = Math.max(0, meta.y - pad);
    const bw = Math.min(W - bx, meta.w + pad * 2);
    const bh = Math.min(H - by, meta.h + pad * 2);
    if (bw < 1 || bh < 1) continue;
    const piece = document.createElement("canvas");
    piece.width = Math.max(1, Math.round(bw));
    piece.height = Math.max(1, Math.round(bh));
    piece.getContext("2d").drawImage(full, bx, by, bw, bh, 0, 0, piece.width, piece.height);
    shapes.push({ id: nextShapeId++, kind: "image", x: Math.round(bx), y: Math.round(by), width: Math.round(bw), height: Math.round(bh), dataUrl: piece.toDataURL("image/png") });
  }
  document.body.removeChild(svg);

  if (!shapes.length) {
    loadSvgFallback(dataUrl, fileName, filePath);
    return;
  }
  const base = document.createElement("canvas");
  base.width = W;
  base.height = H;
  shapes.forEach((shape) => getShapeImage(shape.dataUrl));
  loadImageData(base.toDataURL("image/png"), fileName, filePath, shapes);
  showToast(`SVG를 ${shapes.length}개 조각으로 불러왔습니다. 조각을 클릭해 옮기세요.`);
}

function loadImageData(dataUrl, fileName = "mock-exam-image", filePath = "", initialShapes = null) {
  if (String(dataUrl).startsWith("data:image/svg+xml")) {
    loadSvgPieces(dataUrl, fileName, filePath);
    return;
  }
  const image = new Image();
  image.onload = () => {
    state.image = image;
    state.imageDataUrl = dataUrl;
    state.imageName = fileName || "mock-exam-image";
    state.imagePath = filePath;
    state.projectPath = "";
    state.labels = [];
    state.shapes = Array.isArray(initialShapes) ? initialShapes : [];
    state.groups = [];
    state.nextGroupId = 1;
    state.selectedId = null;
    state.selectedIds = [];
    state.selectedShapeId = null;
    state.selectedShapeIds = [];
    state.polygonDraft = null;
    state.nextId = 1;
    state.nextShapeId = state.shapes.length ? Math.max(...state.shapes.map((s) => Number(s.id) || 0)) + 1 : 1;
    setAddMode(false);
    exitKnockout();
    exitResize();
    clearHistory();
    setDirty(false);
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
    state.shapes = Array.isArray(project.shapes) ? project.shapes : [];
    state.groups = Array.isArray(project.groups) ? project.groups : [];
    state.nextGroupId = state.groups.reduce((m, g) => Math.max(m, Number(g.id) || 0), 0) + 1;
    state.selectedId = null;
    state.selectedIds = [];
    state.selectedShapeId = null;
    state.selectedShapeIds = [];
    state.polygonDraft = null;
    state.nextId = Math.max(1, ...state.labels.map((label) => Number(label.id) || 0)) + 1;
    state.nextShapeId = Math.max(1, ...state.shapes.map((shape) => Number(shape.id) || 0)) + 1;
    setAddMode(false);
    exitKnockout();
    exitResize();
    clearHistory();
    setDirty(false);
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
    labels: state.labels,
    shapes: state.shapes,
    groups: state.groups
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
    imagePath: state.imagePath,
    projectPath: state.projectPath,
    title: "이미지 저장"
  });
  if (saved) {
    setStatus(`이미지 저장 완료: ${saved}`);
    showToast("라벨 포함 이미지가 저장되었습니다.");
  }
}

async function readDroppedFile(file) {
  if (!file) return;
  const filePath = window.labeler.getPathForFile(file);
  if (filePath) {
    const opened = await window.labeler.openFilePath(filePath);
    if (!opened) return;
    if (opened.text) {
      try {
        loadProject(JSON.parse(opened.text), opened.filePath);
      } catch (_error) {
        showToast("프로젝트 파일이 손상되어 열 수 없습니다.");
      }
      return;
    }
    loadImageData(opened.dataUrl, opened.fileName, opened.filePath);
    return;
  }
  if (file.name.toLowerCase().endsWith(".melp")) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        loadProject(JSON.parse(reader.result), "");
      } catch (_error) {
        showToast("프로젝트 파일이 손상되어 열 수 없습니다.");
      }
    };
    reader.readAsText(file, "utf-8");
    return;
  }
  if (!file.type.startsWith("image/")) return;
  const reader = new FileReader();
  reader.onload = () => loadImageData(reader.result, file.name.replace(/\.[^.]+$/, ""), "");
  reader.readAsDataURL(file);
}

function deleteSelected() {
  if (!state.selectedIds.length && !state.selectedShapeIds.length) return;
  pushHistory();
  const labelIds = new Set(state.selectedIds);
  const shapeIds = new Set(state.selectedShapeIds);
  state.labels = state.labels.filter((label) => !labelIds.has(label.id));
  state.shapes = state.shapes.filter((shape) => !shapeIds.has(shape.id));
  clearAllSelection();
  pruneEmptyGroups();
  setDirty(true);
  render();
}

function deleteSelectedShape() {
  if (!state.selectedShapeIds.length) return;
  pushHistory();
  const ids = new Set(state.selectedShapeIds);
  state.shapes = state.shapes.filter((shape) => !ids.has(shape.id));
  clearShapeSelection();
  pruneEmptyGroups();
  setDirty(true);
  render();
}

function duplicateSelected() {
  const labels = selectedLabels();
  if (!labels.length) return;
  pushHistory();
  const copies = labels.map((label) => JSON.parse(JSON.stringify({ ...label, id: state.nextId++, x: label.x + 16, y: label.y + 16 })));
  state.labels.push(...copies);
  state.selectedIds = copies.map((copy) => copy.id);
  state.selectedId = copies[copies.length - 1].id;
  clearShapeSelection();
  setDirty(true);
  render();
}

function moveSelected(dx, dy) {
  const labels = selectedLabels();
  const shapes = selectedShapes();
  if (!labels.length && !shapes.length) return;
  pushHistory();
  for (const label of labels) {
    label.x = Math.round(label.x + dx);
    label.y = Math.round(label.y + dy);
  }
  for (const shape of shapes) {
    if (shape.kind === "polygon") {
      for (const vertex of shape.points) {
        vertex.x += dx;
        vertex.y += dy;
      }
    } else {
      shape.x = Math.round(shape.x + dx);
      shape.y = Math.round(shape.y + dy);
    }
  }
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

function renderFormulaPreview() {
  const previewCtx = els.formulaPreview.getContext("2d");
  const label = {
    text: els.formulaInput.value,
    x: 0,
    y: 0,
    fontSize: 30,
    padding: 6,
    fontFamily: resolveFontFamily(),
    color: "#111111",
    background: "none",
    bold: false,
    italic: false,
    underline: false,
    outline: false
  };
  const bounds = labelBounds(label, previewCtx);
  els.formulaPreview.width = Math.max(48, bounds.width);
  els.formulaPreview.height = Math.max(40, bounds.height);
  previewCtx.clearRect(0, 0, els.formulaPreview.width, els.formulaPreview.height);
  drawLabel(previewCtx, label, false);
}

function insertAtFormulaCaret(text, caretShift = 0) {
  const input = els.formulaInput;
  input.focus();
  const start = input.selectionStart != null ? input.selectionStart : input.value.length;
  const end = input.selectionEnd != null ? input.selectionEnd : input.value.length;
  input.value = input.value.slice(0, start) + text + input.value.slice(end);
  const pos = start + text.length + caretShift;
  input.setSelectionRange(pos, pos);
  renderFormulaPreview();
}

function applyFormula() {
  const text = els.formulaInput.value;
  if (!text.trim()) {
    els.formulaDialog.close();
    return;
  }
  els.labelText.value = text;
  els.formulaDialog.close();
  beginLabelPlacement(text, "", true);
}

els.formulaBtn.addEventListener("click", () => {
  els.formulaInput.value = els.labelText.value;
  els.formulaDialog.showModal();
  renderFormulaPreview();
  els.formulaInput.focus();
  els.formulaInput.select();
});

els.formulaInput.addEventListener("input", renderFormulaPreview);
els.formulaApplyBtn.addEventListener("click", applyFormula);
els.formulaCloseBtn.addEventListener("click", () => els.formulaDialog.close());
els.formulaDialog.addEventListener("click", (event) => {
  if (event.target === els.formulaDialog) els.formulaDialog.close();
});
els.formulaInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    applyFormula();
  }
});

els.formulaDialog.querySelectorAll(".key-row button").forEach((button) => {
  button.addEventListener("mousedown", (event) => event.preventDefault());
  button.addEventListener("click", () => {
    insertAtFormulaCaret(button.dataset.ins || "", Number(button.dataset.caret || 0));
  });
});

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
    projectPath: state.projectPath,
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

els.alignLeft.addEventListener("click", () => alignSelectedLabels("left"));
els.alignCenterX.addEventListener("click", () => alignSelectedLabels("centerX"));
els.alignRight.addEventListener("click", () => alignSelectedLabels("right"));
els.alignTop.addEventListener("click", () => alignSelectedLabels("top"));
els.alignCenterY.addEventListener("click", () => alignSelectedLabels("centerY"));
els.alignBottom.addEventListener("click", () => alignSelectedLabels("bottom"));
els.distributeX.addEventListener("click", () => distributeSelectedLabels("x"));
els.distributeY.addEventListener("click", () => distributeSelectedLabels("y"));
els.groupBtn.addEventListener("click", groupSelection);
els.ungroupBtn.addEventListener("click", ungroupSelection);

els.knockoutBtn.addEventListener("click", () => {
  setKnockoutMode(state.mode !== "knockout");
});

els.knockoutDoneBtn.addEventListener("click", () => setKnockoutMode(false));

els.knockoutTolerance.addEventListener("input", () => {
  els.knockoutTolValue.textContent = els.knockoutTolerance.value;
});

els.canvasResizeBtn.addEventListener("click", () => {
  setCanvasResizeMode(state.mode !== "canvasResize");
});

els.resizeApplyBtn.addEventListener("click", applyCanvasResize);
els.resizeCancelBtn.addEventListener("click", () => setCanvasResizeMode(false));

els.resizeBgSelect.addEventListener("change", () => {
  state.resizeBg = els.resizeBgSelect.value;
  if (state.mode === "canvasResize") render();
});

const helpPages = Array.from(els.helpDialog.querySelectorAll(".help-page"));
let helpPageIndex = 0;

function showHelpPage(index) {
  helpPageIndex = Math.max(0, Math.min(helpPages.length - 1, index));
  helpPages.forEach((page, i) => page.classList.toggle("active", i === helpPageIndex));
  const current = helpPages[helpPageIndex];
  els.helpTitle.textContent = current?.dataset.title || "사용법";
  els.helpPageInfo.textContent = `${helpPageIndex + 1} / ${helpPages.length}`;
  els.helpPrevBtn.disabled = helpPageIndex === 0;
  els.helpNextBtn.disabled = helpPageIndex === helpPages.length - 1;
}

els.helpBtn.addEventListener("click", () => {
  showHelpPage(0);
  els.helpDialog.showModal();
});

els.helpCloseBtn.addEventListener("click", () => {
  els.helpDialog.close();
});

els.helpPrevBtn.addEventListener("click", () => showHelpPage(helpPageIndex - 1));
els.helpNextBtn.addEventListener("click", () => showHelpPage(helpPageIndex + 1));

els.helpDialog.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") showHelpPage(helpPageIndex - 1);
  if (event.key === "ArrowRight") showHelpPage(helpPageIndex + 1);
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

function clampFontSize(value) {
  const number = Math.round(Number(value));
  if (!Number.isFinite(number)) return 28;
  return Math.max(8, Math.min(1000, number));
}

function applyFontSize(value) {
  const label = selectedLabel();
  if (!label) return;
  pushHistory();
  label.fontSize = value;
  setDirty(true);
  render();
}

els.fontSize.addEventListener("input", () => {
  const value = clampFontSize(els.fontSize.value);
  els.fontSizeNumber.value = value;
  applyFontSize(value);
});

els.fontSizeNumber.addEventListener("input", () => {
  const raw = Number(els.fontSizeNumber.value);
  if (!Number.isFinite(raw) || raw <= 0) return;
  const value = clampFontSize(raw);
  els.fontSize.value = Math.min(72, Math.max(12, value));
  applyFontSize(value);
});

els.fontSizeNumber.addEventListener("change", () => {
  els.fontSizeNumber.value = clampFontSize(els.fontSizeNumber.value);
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
    fontSize: clampFontSize(els.fontSizeNumber.value),
    padding: Number(els.labelPadding.value),
    fontFamily: resolveFontFamily(),
    color: els.textColor.value,
    background: els.labelBackground.value,
    bold: els.boldText.checked,
    italic: els.italicText.checked,
    underline: els.underlineText.checked,
    outline: els.outlineText.checked
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
  control.addEventListener("change", () => {
    const label = selectedLabel();
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
    arrow: isPressed(els.leaderArrow),
    arrowShape: els.leaderArrowShape.value,
    arrowSize: Number(els.leaderArrowSize.value),
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
  els.leaderArrowSizeValue.textContent = String(label.leader.arrowSize);
  els.leaderX.value = Math.round(label.leader.x);
  els.leaderY.value = Math.round(label.leader.y);
  setDirty(true);
  render();
}

for (const control of [els.leaderEnabled, els.leaderArrow, els.leaderArrowShape, els.leaderArrowSize, els.leaderShape, els.leaderStyle, els.leaderWidth, els.leaderGap, els.leaderX, els.leaderY]) {
  const isToggle = control === els.leaderEnabled || control === els.leaderArrow;
  const eventName = isToggle ? "click" : "input";
  control.addEventListener(eventName, () => {
    if (isToggle) setPressed(control, !isPressed(control));
    updateLeaderFromControls();
  });
}

function updateSelectedShapeFromControls() {
  els.shapeStrokeWidthValue.textContent = els.shapeStrokeWidth.value;
  const shape = selectedShape();
  if (!shape) return;
  pushHistory();
  Object.assign(shape, shapeStyleFromControls());
  setDirty(true);
  render();
}

els.rectShapeBtn.addEventListener("click", () => {
  setShapeTool(state.shapeTool === "rectangle" ? "" : "rectangle");
});

els.ellipseShapeBtn.addEventListener("click", () => {
  setShapeTool(state.shapeTool === "ellipse" ? "" : "ellipse");
});

els.polygonShapeBtn.addEventListener("click", () => {
  setShapeTool(state.shapeTool === "polygon" ? "" : "polygon");
});

for (const control of [els.fillEnabledBtn, els.strokeEnabledBtn]) {
  control.addEventListener("click", () => {
    setPressed(control, !isPressed(control));
    updateSelectedShapeFromControls();
  });
}

for (const control of [els.fillColor, els.strokeColor, els.shapeStrokeWidth]) {
  control.addEventListener("input", updateSelectedShapeFromControls);
}

els.fillPickerBtn.addEventListener("click", () => setPickerMode("fill"));
els.strokePickerBtn.addEventListener("click", () => setPickerMode("stroke"));
els.deleteShapeBtn.addEventListener("click", deleteSelectedShape);

els.zoomOutBtn.addEventListener("click", () => {
  setZoom(state.zoom / 1.2);
});

els.zoomInBtn.addEventListener("click", () => {
  setZoom(state.zoom * 1.2);
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

  if (state.mode === "knockout") {
    applyKnockout(point);
    return;
  }

  if (state.mode === "canvasResize") {
    const key = hitResizeHandle(point);
    if (key) {
      state.dragging = { type: "resize", key };
      canvas.setPointerCapture(event.pointerId);
    }
    return;
  }

  if (state.mode === "picker") {
    const color = sampleImageColor(point);
    if (state.pickerTarget === "fill") {
      els.fillColor.value = color;
    } else {
      els.strokeColor.value = color;
    }
    updateSelectedShapeFromControls();
    state.mode = "select";
    state.pickerTarget = "";
    canvasShell.classList.remove("picker-mode");
    showToast(`${color} 색을 적용했습니다.`);
    render();
    return;
  }

  if (state.mode === "shape" && state.shapeTool === "polygon") {
    if (!state.polygonDraft) state.polygonDraft = { points: [], cursor: null };
    const draft = state.polygonDraft;
    const hitDist = polygonCloseDistance();
    if (draft.points.length >= 3) {
      const first = draft.points[0];
      if (Math.hypot(point.x - first.x, point.y - first.y) <= hitDist) {
        commitPolygon();
        return;
      }
    }
    const existingIndex = draft.points.findIndex((vertex) => Math.hypot(point.x - vertex.x, point.y - vertex.y) <= hitDist);
    if (existingIndex >= 0) {
      draft.points.splice(existingIndex, 1);
      if (draft.points.length === 0) state.polygonDraft = null;
      render();
      showMagnifier(event, point);
      return;
    }
    draft.points.push({ x: Math.round(point.x), y: Math.round(point.y) });
    draft.cursor = { x: point.x, y: point.y };
    render();
    showMagnifier(event, point);
    return;
  }

  if (state.mode === "shape" && state.shapeTool) {
    pushHistory();
    const shape = {
      id: state.nextShapeId++,
      kind: state.shapeTool,
      x: Math.round(point.x),
      y: Math.round(point.y),
      width: 1,
      height: 1,
      ...shapeStyleFromControls()
    };
    state.shapes.push(shape);
    clearLabelSelection();
    selectShape(shape.id, false);
    state.dragging = { type: "new-shape", id: shape.id, startX: point.x, startY: point.y, changed: true };
    canvas.setPointerCapture(event.pointerId);
    render();
    return;
  }

  if (state.mode === "add") {
    pushHistory();
    const label = makeLeaderLabel(point.x, point.y, point.x + 48, point.y - 22);
    state.labels.push(label);
    state.selectedIds = [label.id];
    state.selectedId = label.id;
    clearShapeSelection();
    const bounds = labelBounds(label);
    state.dragging = { type: "new-label", id: label.id, offsetX: bounds.width / 2, offsetY: bounds.height / 2, changed: true };
    canvas.setPointerCapture(event.pointerId);
    render();
    showMagnifier(event, point);
    return;
  }

  const additive = event.ctrlKey || event.shiftKey || event.metaKey;

  const leaderHit = hitLeader(point);
  if (leaderHit) {
    if (!state.selectedIds.includes(leaderHit.id)) selectLabel(leaderHit.id, false);
    else state.selectedId = leaderHit.id;
    clearShapeSelection();
    pushHistory();
    state.dragging = { type: "leader", id: leaderHit.id, changed: false };
    canvas.setPointerCapture(event.pointerId);
    render();
    showMagnifier(event, point);
    return;
  }

  const hit = hitLabel(point);
  if (hit) {
    if (additive) {
      if (hit.groupId != null) selectGroup(hit.groupId, true);
      else selectLabel(hit.id, true);
      render();
      return;
    }
    if (!state.selectedIds.includes(hit.id)) {
      if (hit.groupId != null) selectGroup(hit.groupId, false);
      else {
        clearShapeSelection();
        selectLabel(hit.id, false);
      }
    } else {
      state.selectedId = hit.id;
    }
    pushHistory();
    state.dragging = startObjectDrag(point);
    canvas.setPointerCapture(event.pointerId);
    render();
    return;
  }

  const shapeHit = hitShape(point);
  if (shapeHit) {
    if (additive) {
      if (shapeHit.groupId != null) selectGroup(shapeHit.groupId, true);
      else selectShape(shapeHit.id, true);
      render();
      return;
    }
    if (!state.selectedShapeIds.includes(shapeHit.id)) {
      if (shapeHit.groupId != null) selectGroup(shapeHit.groupId, false);
      else {
        clearLabelSelection();
        selectShape(shapeHit.id, false);
      }
    } else {
      state.selectedShapeId = shapeHit.id;
    }
    pushHistory();
    state.dragging = startObjectDrag(point);
    canvas.setPointerCapture(event.pointerId);
    render();
    return;
  }

  if (!additive) clearAllSelection();
  state.dragging = { type: "marquee", startX: point.x, startY: point.y, x: point.x, y: point.y, additive, baseLabels: state.selectedIds.slice(), baseShapes: state.selectedShapeIds.slice() };
  canvas.setPointerCapture(event.pointerId);
  render();
});

canvas.addEventListener("pointermove", (event) => {
  if (state.polygonDraft && state.mode === "shape" && state.shapeTool === "polygon") {
    const cursorPoint = getCanvasPoint(event);
    state.polygonDraft.cursor = { x: cursorPoint.x, y: cursorPoint.y };
    scheduleRender();
    showMagnifier(event, cursorPoint);
    return;
  }
  if (!state.dragging) return;
  const point = getCanvasPoint(event);

  if (state.dragging.type === "resize") {
    updateResizeFrameFromPoint(state.dragging.key, point);
    scheduleRender();
    return;
  }

  if (state.dragging.type === "marquee") {
    state.dragging.x = point.x;
    state.dragging.y = point.y;
    updateMarqueeSelection();
    scheduleRender();
    return;
  }

  if (state.dragging.type === "objects") {
    for (const moving of state.dragging.labels) {
      const target = state.labels.find((label) => label.id === moving.id);
      if (target) {
        target.x = Math.round(point.x - moving.ox);
        target.y = Math.round(point.y - moving.oy);
      }
    }
    for (const moving of state.dragging.shapes) {
      const shape = state.shapes.find((item) => item.id === moving.id);
      if (!shape) continue;
      const rect = normalizedShapeRect(shape);
      const dx = Math.round(point.x - moving.ox) - rect.x;
      const dy = Math.round(point.y - moving.oy) - rect.y;
      if (shape.kind === "polygon") {
        for (const vertex of shape.points) {
          vertex.x += dx;
          vertex.y += dy;
        }
      } else {
        shape.x += dx;
        shape.y += dy;
      }
    }
    state.dragging.changed = true;
    scheduleRender();
    return;
  }

  if (state.dragging.type === "new-shape") {
    const shape = state.shapes.find((item) => item.id === state.dragging.id);
    if (!shape) return;
    let nextW = Math.round(point.x - state.dragging.startX);
    let nextH = Math.round(point.y - state.dragging.startY);
    if (event.shiftKey) {
      const size = Math.max(Math.abs(nextW), Math.abs(nextH));
      nextW = size * (nextW < 0 ? -1 : 1);
      nextH = size * (nextH < 0 ? -1 : 1);
    }
    shape.x = Math.round(state.dragging.startX);
    shape.y = Math.round(state.dragging.startY);
    shape.width = nextW;
    shape.height = nextH;
    state.dragging.changed = true;
    scheduleRender();
    return;
  }

  const label = state.labels.find((item) => item.id === state.dragging.id);
  if (!label) return;

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

  scheduleRender();
});

canvas.addEventListener("pointerup", (event) => {
  if (state.dragging?.type === "new-label") setAddMode(false);
  if (state.dragging?.type === "new-shape") setShapeTool("");
  if (state.dragging?.changed) setDirty(true);
  state.dragging = null;
  hideMagnifier();
  render();
  try {
    canvas.releasePointerCapture(event.pointerId);
  } catch (_error) {
  }
});

canvas.addEventListener("pointercancel", () => {
  const wasMarquee = state.dragging?.type === "marquee";
  state.dragging = null;
  hideMagnifier();
  if (wasMarquee) render();
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

canvasShell.addEventListener("wheel", (event) => {
  if (!event.ctrlKey || !state.image) return;
  event.preventDefault();
  const direction = event.deltaY < 0 ? 1 : -1;
  const factor = direction > 0 ? 1.12 : 1 / 1.12;
  setZoom(state.zoom * factor, event);
}, { passive: false });

document.addEventListener("keydown", (event) => {
  const tag = document.activeElement?.tagName;
  const typing = tag === "INPUT" || tag === "TEXTAREA";

  if (state.mode === "knockout" && event.key === "Escape") {
    setKnockoutMode(false);
    return;
  }

  if (state.mode === "canvasResize") {
    if (event.key === "Escape") {
      setCanvasResizeMode(false);
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      applyCanvasResize();
      return;
    }
  }

  if (state.polygonDraft) {
    if (event.key === "Escape") {
      state.polygonDraft = null;
      setShapeTool("");
      render();
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      commitPolygon();
      return;
    }
    if (event.key === "Backspace" && !typing) {
      event.preventDefault();
      state.polygonDraft.points.pop();
      if (state.polygonDraft.points.length === 0) state.polygonDraft = null;
      render();
      return;
    }
  }

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

  if (event.ctrlKey && event.key.toLowerCase() === "g") {
    event.preventDefault();
    if (event.shiftKey) ungroupSelection();
    else groupSelection();
  }
});

window.addEventListener("resize", () => {
  if (state.image) render();
});

window.labeler.onOpenProjectData((payload) => {
  if (payload?.project) loadProject(payload.project, payload.filePath || "");
});

window.labeler.onUpdateProgress((payload) => {
  const percent = Math.max(0, Math.min(100, Math.round(payload?.percent || 0)));
  els.updateProgress.hidden = false;
  els.updateProgressBar.style.width = `${percent}%`;
  if (payload?.done) {
    els.updateProgressText.textContent = "다운로드 완료 — 설치 준비됨";
    window.setTimeout(() => {
      els.updateProgress.hidden = true;
    }, 4000);
    return;
  }
  els.updateProgressText.textContent = `업데이트 다운로드 중… ${percent}%`;
});

render();
populateFonts().then(() => render());
