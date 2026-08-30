
class z2ui5_cl_ui5f_shortcut_js {
  static get() {
    let result = ``;
    result = `sap.ui.define(` + `
` + `  ["z2ui5/core/Lib", "z2ui5/core/ViewSlots", "z2ui5/core/AppState"],` + `
` + `  (Lib, ViewSlots, AppState) => {` + `
` + `    "use strict";` + `
` + `` + `
` + `    const SHORTCUT_MODIFIERS = ["ctrl", "shift", "alt", "meta"];` + `
` + `` + `
` + `    const SHORTCUT_ALIASES = {` + `
` + `      control: "ctrl",` + `
` + `      cmd: "meta",` + `
` + `      command: "meta",` + `
` + `      option: "alt",` + `
` + `      esc: "escape",` + `
` + `      del: "delete",` + `
` + `      ins: "insert",` + `
` + `      return: "enter",` + `
` + `      space: " ",` + `
` + `    };` + `
` + `` + `
` + `    function shortcutToken(part) {` + `
` + `      const t = part.trim().toLowerCase();` + `
` + `      return SHORTCUT_ALIASES[t] ?? t;` + `
` + `    }` + `
` + `` + `
` + `    function normalizeShortcut(combo) {` + `
` + `      const parts = String(combo ?? "")` + `
` + `        .split("+")` + `
` + `        .map(shortcutToken)` + `
` + `        .filter((p) => p !== "");` + `
` + `      const mods = SHORTCUT_MODIFIERS.filter((m) => parts.includes(m));` + `
` + `      const keys = parts.filter((p) => !SHORTCUT_MODIFIERS.includes(p));` + `
` + `      if (keys.length === 0) return "";` + `
` + `      return [...mods, keys[keys.length - 1]].join("+");` + `
` + `    }` + `
` + `` + `
` + `    function shortcutFromEvent(oEvent) {` + `
` + `      const key = String(oEvent.key ?? "").toLowerCase();` + `
` + `` + `
` + `      if (key === "" || SHORTCUT_MODIFIERS.includes(shortcutToken(key)))` + `
` + `        return "";` + `
` + `      const mods = [];` + `
` + `      if (oEvent.ctrlKey) mods.push("ctrl");` + `
` + `      if (oEvent.shiftKey) mods.push("shift");` + `
` + `      if (oEvent.altKey) mods.push("alt");` + `
` + `      if (oEvent.metaKey) mods.push("meta");` + `
` + `      return [...mods, key].join("+");` + `
` + `    }` + `
` + `` + `
` + `    const SHORTCUT_SLOTS = ["POPOVER", "POPUP", "NEST2", "NEST", "MAIN"];` + `
` + `` + `
` + `    const SHORTCUT_GLOBAL = "";` + `
` + `` + `
` + `    function scopeControlOpen(id) {` + `
` + `      const c = ViewSlots.resolveById(id);` + `
` + `      if (!c) return false;` + `
` + `      if (typeof c.isOpen === "function") return !!c.isOpen();` + `
` + `      return typeof c.getVisible === "function"` + `
` + `        ? c.getVisible() !== false` + `
` + `        : true;` + `
` + `    }` + `
` + `` + `
` + `    function shortcutEntry(combo) {` + `
` + `      const scopes = AppState.state.shortcuts[combo];` + `
` + `      if (!scopes) return undefined;` + `
` + `      for (const key of Object.keys(scopes)) {` + `
` + `        if (key === SHORTCUT_GLOBAL || SHORTCUT_SLOTS.includes(key)) continue;` + `
` + `        if (scopeControlOpen(key)) return scopes[key];` + `
` + `      }` + `
` + `      for (const key of SHORTCUT_SLOTS) {` + `
` + `        if (scopes[key] && ViewSlots.getView(key)) return scopes[key];` + `
` + `      }` + `
` + `      return scopes[SHORTCUT_GLOBAL];` + `
` + `    }` + `
` + `` + `
` + `    let shortcutListener = null;` + `
` + `` + `
` + `    function installShortcutListener() {` + `
` + `      if (shortcutListener || typeof document === "undefined") return;` + `
` + `      shortcutListener = (oEvent) => {` + `
` + `        try {` + `
` + `          const entry = shortcutEntry(shortcutFromEvent(oEvent));` + `
` + `          if (!entry) return;` + `
` + `` + `
` + `          if (Lib.isDestroyed(entry.controller)) return;` + `
` + `` + `
` + `          oEvent.preventDefault();` + `
` + `          entry.controller.eB([entry.event]);` + `
` + `        } catch (e) {` + `
` + `          Lib.logError("KEYBOARD_SHORTCUT: dispatch failed", e);` + `
` + `        }` + `
` + `      };` + `
` + `      document.addEventListener("keydown", shortcutListener);` + `
` + `    }` + `
` + `` + `
` + `    function evKeyboardShortcut(oController, args) {` + `
` + `      const combo = normalizeShortcut(args[1]);` + `
` + `      if (!combo) {` + `
` + `        Lib.logError(` + `
` + `          \`KEYBOARD_SHORTCUT: '\${args[1]}' names no key to bind (modifiers only?)\`,` + `
` + `        );` + `
` + `        return;` + `
` + `      }` + `
` + `` + `
` + `      const raw = String(args[3] ?? "");` + `
` + `      const scope = SHORTCUT_SLOTS.includes(raw.toUpperCase())` + `
` + `        ? raw.toUpperCase()` + `
` + `        : raw;` + `
` + `      const shortcuts = AppState.state.shortcuts;` + `
` + `      const scopes = shortcuts[combo] ?? (shortcuts[combo] = {});` + `
` + `      if (!args[2]) {` + `
` + `        delete scopes[scope];` + `
` + `` + `
` + `        if (Object.keys(scopes).length === 0) delete shortcuts[combo];` + `
` + `        return;` + `
` + `      }` + `
` + `` + `
` + `      scopes[scope] = { event: args[2], controller: oController };` + `
` + `      installShortcutListener();` + `
` + `    }` + `
` + `` + `
` + `    function evKeyboardSetMode(oController, args) {` + `
` + `      try {` + `
` + `        const oElement = ViewSlots.resolveById(args[1]);` + `
` + `        if (!oElement) {` + `
` + `          Lib.logError(\`KEYBOARD_SET_MODE: '\${args[1]}' not found\`);` + `
` + `          return;` + `
` + `        }` + `
` + `        const dom = oElement.getDomRef();` + `
` + `        if (!dom) return;` + `
` + `        const input = dom.matches("input, textarea")` + `
` + `          ? dom` + `
` + `          : dom.querySelector("input, textarea");` + `
` + `        if (!input) return;` + `
` + `        input.setAttribute("inputmode", args[2] || "text");` + `
` + `      } catch (e) {` + `
` + `        Lib.logError(` + `
` + `          \`KEYBOARD_SET_MODE: setAttribute failed for '\${args[1]}'\`,` + `
` + `          e,` + `
` + `        );` + `
` + `      }` + `
` + `    }` + `
` + `` + `
` + `    const handlers = {` + `
` + `      KEYBOARD_SHORTCUT: evKeyboardShortcut,` + `
` + `      KEYBOARD_SET_MODE: evKeyboardSetMode,` + `
` + `    };` + `
` + `` + `
` + `    return { handlers };` + `
` + `  },` + `
` + `);` + `
` + `` + `
` + ``;
    return result;
  }
}

module.exports = z2ui5_cl_ui5f_shortcut_js;

