import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { defaultDeck, makeWidgetId } from './defaults.js';
import { getDescriptor } from '../widgets/registry.js';
import {
  isFreePosition,
  findFreeSpot,
  clampSize
} from '../lib/grid.js';

export const useDeckStore = create(
  persist(
    (set, get) => ({
      ...defaultDeck,
      editMode: false,
      pickerOpen: false,

      addWidget: (type) => {
        const desc = getDescriptor(type);
        if (!desc) return null;
        const id = makeWidgetId();
        const size = desc.defaultSize;
        const spot = findFreeSpot(get().widgets, size);
        const widget = {
          id,
          type,
          x: spot.x,
          y: spot.y,
          w: size.w,
          h: size.h,
          settings: { ...(desc.defaultSettings ?? {}) }
        };
        set((s) => ({ widgets: [...s.widgets, widget], pickerOpen: false }));
        return id;
      },

      removeWidget: (id) =>
        set((s) => ({ widgets: s.widgets.filter((w) => w.id !== id) })),

      moveWidget: (id, x, y) => {
        const widgets = get().widgets;
        const w = widgets.find((w) => w.id === id);
        if (!w) return;
        const candidate = { x, y, w: w.w, h: w.h };
        if (!isFreePosition(widgets, candidate, id)) return;
        set((s) => ({
          widgets: s.widgets.map((it) =>
            it.id === id ? { ...it, x, y } : it
          )
        }));
      },

      resizeWidget: (id, w, h) => {
        const widgets = get().widgets;
        const inst = widgets.find((it) => it.id === id);
        if (!inst) return;
        const desc = getDescriptor(inst.type);
        const clamped = clampSize({ w, h }, desc?.minSize, desc?.maxSize);
        const candidate = { x: inst.x, y: inst.y, ...clamped };
        if (!isFreePosition(widgets, candidate, id)) return;
        set((s) => ({
          widgets: s.widgets.map((it) =>
            it.id === id ? { ...it, ...clamped } : it
          )
        }));
      },

      updateSettings: (id, partial) =>
        set((s) => ({
          widgets: s.widgets.map((it) =>
            it.id === id
              ? { ...it, settings: { ...it.settings, ...partial } }
              : it
          )
        })),

      // Combined position + size update (used by react-grid-layout callbacks).
      // Accepts { x, y, w?, h? } and merges what's provided.
      moveResize: (id, patch) =>
        set((s) => ({
          widgets: s.widgets.map((it) =>
            it.id === id ? { ...it, ...patch } : it
          )
        })),

      setEditMode: (v) => set({ editMode: !!v }),
      toggleEditMode: () => set((s) => ({ editMode: !s.editMode })),
      setPickerOpen: (v) => set({ pickerOpen: !!v }),
      togglePicker: () => set((s) => ({ pickerOpen: !s.pickerOpen })),

      reset: () => set({ ...defaultDeck, editMode: false, pickerOpen: false })
    }),
    {
      name: 'helios-deck/deck',
      version: 1,
      partialize: (state) => ({ widgets: state.widgets })
    }
  )
);
