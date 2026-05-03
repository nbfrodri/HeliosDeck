import { useMemo, useRef, useState, useEffect } from 'react';
import RGL from 'react-grid-layout';
import { useDeckStore } from '../store/useDeckStore.js';
import { useSettingsStore } from '../store/useSettingsStore.js';
import { getDescriptor } from '../widgets/registry.js';
import { DeckWidget } from './DeckWidget.jsx';
import { EmptyHero } from './EmptyHero.jsx';

// CJS interop: react-grid-layout attaches Responsive and WidthProvider to its
// default export, so we read them off the namespace rather than as named imports.
const Responsive = RGL.Responsive;
const WidthProvider = RGL.WidthProvider;
const ResponsiveGridLayout = WidthProvider(Responsive);

const BREAKPOINTS = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 };
const COLS = { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 };

function buildLayouts(widgets) {
  // Same layout shape for every breakpoint; RGL auto-reflows where it doesn't fit.
  // Pull min/max constraints from the widget descriptor so users can't shrink a
  // widget below the size at which its content stops being legible.
  const items = widgets.map((w) => {
    const desc = getDescriptor(w.type);
    const min = desc?.minSize ?? { w: 2, h: 2 };
    const max = desc?.maxSize ?? {};
    return {
      i: w.id,
      x: w.x,
      y: w.y,
      w: w.w,
      h: w.h,
      minW: min.w,
      minH: min.h,
      maxW: max.w,
      maxH: max.h
    };
  });
  return Object.keys(COLS).reduce((acc, bp) => {
    acc[bp] = items;
    return acc;
  }, {});
}

export function Deck() {
  const widgets = useDeckStore((s) => s.widgets);
  const moveResize = useDeckStore((s) => s.moveResize);
  const editMode = useDeckStore((s) => s.editMode);
  const gap = useSettingsStore((s) => s.gap);

  const deckRef = useRef(null);
  const [rowHeight, setRowHeight] = useState(80);

  // Track viewport-derived rowHeight so cells stay roughly square per breakpoint.
  useEffect(() => {
    const el = deckRef.current;
    if (!el) return;
    const compute = (w) => {
      // pick a row height that scales mildly with viewport width
      const rh = Math.max(60, Math.min(96, Math.round(w / 16)));
      setRowHeight(rh);
    };
    const ro = new ResizeObserver(([entry]) => compute(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const layouts = useMemo(() => buildLayouts(widgets), [widgets]);

  // Persist user-initiated changes only (drag/resize end), not auto-reflows.
  const onDragStop = (_layout, _oldItem, newItem) => {
    moveResize(newItem.i, { x: newItem.x, y: newItem.y });
  };
  const onResizeStop = (_layout, _oldItem, newItem) => {
    moveResize(newItem.i, {
      x: newItem.x,
      y: newItem.y,
      w: newItem.w,
      h: newItem.h
    });
  };

  return (
    <div className="deck" ref={deckRef}>
      {widgets.length === 0 && <EmptyHero />}
      {widgets.length > 0 && (
        <ResponsiveGridLayout
          className="rgl"
          layouts={layouts}
          breakpoints={BREAKPOINTS}
          cols={COLS}
          rowHeight={rowHeight}
          margin={[gap, gap]}
          containerPadding={[0, 0]}
          isDraggable={editMode}
          isResizable={editMode}
          draggableHandle=".widget__chrome"
          compactType="vertical"
          preventCollision={false}
          onDragStop={onDragStop}
          onResizeStop={onResizeStop}
          resizeHandles={['se']}
        >
          {widgets.map((w) => (
            <div key={w.id}>
              <DeckWidget instance={w} />
            </div>
          ))}
        </ResponsiveGridLayout>
      )}
    </div>
  );
}
