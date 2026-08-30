
class z2ui5_cl_ui5f_scrfocus_js {
  static get() {
    let result = ``;
    result = `sap.ui.define(` + `
` + `  [` + `
` + `    "sap/ui/core/Element",` + `
` + `    "z2ui5/core/Lib",` + `
` + `    "z2ui5/core/ViewSlots",` + `
` + `    "z2ui5/core/AppState",` + `
` + `  ],` + `
` + `  (Element, Lib, ViewSlots, AppState) => {` + `
` + `    "use strict";` + `
` + `` + `
` + `    function closestUi5Element(dom) {` + `
` + `      if (Element.closestTo) return Element.closestTo(dom) ?? null;` + `
` + `      let el = dom;` + `
` + `      while (el && el.getAttribute) {` + `
` + `        if (el.hasAttribute("data-sap-ui")) {` + `
` + `          return Lib.getElementById(el.id);` + `
` + `        }` + `
` + `        el = el.parentElement;` + `
` + `      }` + `
` + `      return null;` + `
` + `    }` + `
` + `` + `
` + `    function stripViewPrefix(fullId, view) {` + `
` + `      if (!view) return fullId;` + `
` + `      const prefix = \`\${view.getId()}--\`;` + `
` + `      return fullId.startsWith(prefix) ? fullId.slice(prefix.length) : fullId;` + `
` + `    }` + `
` + `` + `
` + `    function focusTextInput(active, ui5El) {` + `
` + `      if (Lib.isTextInput(active)) return active;` + `
` + `      const focusRef = ui5El?.getFocusDomRef?.();` + `
` + `      if (Lib.isTextInput(focusRef)) return focusRef;` + `
` + `      const root = ui5El?.getDomRef?.();` + `
` + `      const inner = root?.querySelector?.("input, textarea");` + `
` + `      return Lib.isTextInput(inner) ? inner : null;` + `
` + `    }` + `
` + `` + `
` + `    function getFocusInfo() {` + `
` + `      try {` + `
` + `        const active = document.activeElement;` + `
` + `        if (!active) return undefined;` + `
` + `        const ui5El = closestUi5Element(active);` + `
` + `        if (!ui5El) return undefined;` + `
` + `        const fullId = ui5El.getId();` + `
` + `        let id = fullId;` + `
` + `        for (const slot of ViewSlots.slots) {` + `
` + `          const local = stripViewPrefix(fullId, ViewSlots.getView(slot.key));` + `
` + `          if (local !== fullId) {` + `
` + `            id = local;` + `
` + `            break;` + `
` + `          }` + `
` + `        }` + `
` + `` + `
` + `        const info = { ID: id };` + `
` + `        const caret = Lib.readCaret(focusTextInput(active, ui5El));` + `
` + `        if (caret) {` + `
` + `          info.SELECTION_START = caret.start;` + `
` + `          info.SELECTION_END = caret.end;` + `
` + `        }` + `
` + `        return info;` + `
` + `      } catch (e) {` + `
` + `        Lib.logError("getFocusInfo: focus capture failed", e);` + `
` + `        return undefined;` + `
` + `      }` + `
` + `    }` + `
` + `` + `
` + `    const _scrollCache = {` + `
` + `      target: undefined,` + `
` + `      ui5El: undefined,` + `
` + `      slotKey: undefined,` + `
` + `    };` + `
` + `` + `
` + `    function onScrollCapture(event) {` + `
` + `      const target = event.target;` + `
` + `      if (!target || target.nodeType !== 1) return;` + `
` + `` + `
` + `      if (target !== _scrollCache.target) {` + `
` + `        const ui5El = closestUi5Element(target);` + `
` + `        _scrollCache.target = target;` + `
` + `        _scrollCache.ui5El = ui5El;` + `
` + `        _scrollCache.slotKey = ui5El` + `
` + `          ? ViewSlots.containingSlotKey(ui5El)` + `
` + `          : undefined;` + `
` + `      }` + `
` + `` + `
` + `      if (_scrollCache.slotKey) {` + `
` + `        AppState.state.lastScrolled[_scrollCache.slotKey] = {` + `
` + `          control: _scrollCache.ui5El,` + `
` + `          dom: target,` + `
` + `        };` + `
` + `      }` + `
` + `    }` + `
` + `` + `
` + `    function getScrollInfo() {` + `
` + `      if (_scrollCache.target && !_scrollCache.target.isConnected) {` + `
` + `        _scrollCache.target = undefined;` + `
` + `        _scrollCache.ui5El = undefined;` + `
` + `        _scrollCache.slotKey = undefined;` + `
` + `      }` + `
` + `` + `
` + `      const store = AppState.state.lastScrolled;` + `
` + `      const out = {};` + `
` + `      for (const slot of ViewSlots.slots) {` + `
` + `        const entry = store[slot.key];` + `
` + `        if (!entry) continue;` + `
` + `` + `
` + `        if (!entry.dom.isConnected || !Lib.isAlive(entry.control)) {` + `
` + `          delete store[slot.key];` + `
` + `          continue;` + `
` + `        }` + `
` + `` + `
` + `        const id = stripViewPrefix(` + `
` + `          entry.control.getId(),` + `
` + `          ViewSlots.getView(slot.key),` + `
` + `        );` + `
` + `        out[slot.key] = {` + `
` + `          ID: id,` + `
` + `          X: entry.dom.scrollLeft || 0,` + `
` + `          Y: entry.dom.scrollTop || 0,` + `
` + `        };` + `
` + `      }` + `
` + `` + `
` + `      return Object.keys(out).length ? out : undefined;` + `
` + `    }` + `
` + `` + `
` + `    return {` + `
` + `      getFocusInfo,` + `
` + `      getScrollInfo,` + `
` + `      onScrollCapture,` + `
` + `      closestUi5Element,` + `
` + `      focusTextInput,` + `
` + `      _scrollCache,` + `
` + `    };` + `
` + `  },` + `
` + `);` + `
` + `` + `
` + ``;
    return result;
  }
}

module.exports = z2ui5_cl_ui5f_scrfocus_js;

