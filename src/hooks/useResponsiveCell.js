import { useEffect, useState } from 'react';

/**
 * Computes a responsive grid: both the cell size AND the column count adapt
 * to the deck's available inner width. The number of columns drops when
 * cellSize would otherwise fall below `minCell`, so widgets never need
 * horizontal scroll on narrow viewports.
 *
 * `ref` should point to the deck container (its ResizeObserver `contentRect`
 * already excludes the deck's own padding). We further reserve `rightGutter`
 * inside the canvas so widgets at the rightmost column don't sit flush
 * against the canvas edge.
 *
 * Returns `{ cellSize, cols }`.
 */
export function useResponsiveCell(ref, {
  maxCols = 12,
  minCols = 2,
  minCell = 64,
  maxCell = 100,
  gap = 18,
  rightGutter = 24
} = {}) {
  const [state, setState] = useState({ cellSize: maxCell, cols: maxCols });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const compute = (innerW) => {
      const usable = Math.max(0, innerW - rightGutter);
      // Find largest cols where cellSize >= minCell.
      for (let cols = maxCols; cols >= minCols; cols--) {
        const cell = (usable - (cols - 1) * gap) / cols;
        if (cell >= minCell) {
          setState({
            cols,
            cellSize: Math.round(Math.min(maxCell, cell))
          });
          return;
        }
      }
      // Floor: minimum cols, force cell to fit.
      const fallbackCols = Math.max(1, minCols);
      const fallbackCell = Math.max(
        minCell,
        Math.floor((usable - (fallbackCols - 1) * gap) / fallbackCols)
      );
      setState({ cols: fallbackCols, cellSize: fallbackCell });
    };

    const ro = new ResizeObserver(([entry]) => {
      compute(entry.contentRect.width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref, maxCols, minCols, minCell, maxCell, gap, rightGutter]);

  return state;
}
