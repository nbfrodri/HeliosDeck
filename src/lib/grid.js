export function cellToPx(rect, cellSize, gap) {
  return {
    left: rect.x * (cellSize + gap),
    top: rect.y * (cellSize + gap),
    width: rect.w * cellSize + (rect.w - 1) * gap,
    height: rect.h * cellSize + (rect.h - 1) * gap
  };
}

export function pxDeltaToCells(delta, cellSize, gap) {
  const step = cellSize + gap;
  return {
    dx: Math.round(delta.x / step),
    dy: Math.round(delta.y / step)
  };
}

export function pxSizeToCells(width, height, cellSize, gap) {
  const step = cellSize + gap;
  return {
    w: Math.max(1, Math.round((width + gap) / step)),
    h: Math.max(1, Math.round((height + gap) / step))
  };
}

export function rectsOverlap(a, b) {
  return !(
    a.x + a.w <= b.x ||
    b.x + b.w <= a.x ||
    a.y + a.h <= b.y ||
    b.y + b.h <= a.y
  );
}

export function isFreePosition(widgets, candidate, ignoreId = null) {
  if (candidate.x < 0 || candidate.y < 0) return false;
  return widgets.every(
    (w) => w.id === ignoreId || !rectsOverlap(w, candidate)
  );
}

export function findFreeSpot(widgets, size, columns = 12) {
  for (let y = 0; y < 100; y++) {
    for (let x = 0; x <= columns - size.w; x++) {
      const candidate = { x, y, w: size.w, h: size.h };
      if (isFreePosition(widgets, candidate)) return { x, y };
    }
  }
  return { x: 0, y: 0 };
}

export function clampSize(size, min, max) {
  return {
    w: Math.min(max?.w ?? Infinity, Math.max(min?.w ?? 1, size.w)),
    h: Math.min(max?.h ?? Infinity, Math.max(min?.h ?? 1, size.h))
  };
}
