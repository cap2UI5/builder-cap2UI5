
class z2ui5_cl_ui5f_console_js {
  static get() {
    let result = ``;
    result = `sap.ui.define([], () => {` + `
` + `  "use strict";` + `
` + `` + `
` + `  const MAX_ENTRIES = 300;` + `
` + `` + `
` + `  const MAX_TEXT_CHARS = 2000;` + `
` + `` + `
` + `  const MAX_DEPTH = 4;` + `
` + `` + `
` + `  const RELOAD_KEY = "z2ui5.devtools.console";` + `
` + `  const RELOAD_MAX_ENTRIES = 40;` + `
` + `` + `
` + `  const ALERT_KEY = "z2ui5.devtools.openOnError";` + `
` + `` + `
` + `  const METHODS = ["log", "info", "warn", "error", "debug"];` + `
` + `` + `
` + `  let entries = [];` + `
` + `  let dropped = 0;` + `
` + `` + `
` + `  const originals = {};` + `
` + `  let installed = false;` + `
` + `  let ui5Listener = null;` + `
` + `  let onWindowError = null;` + `
` + `  let onRejection = null;` + `
` + `  let onPageHide = null;` + `
` + `` + `
` + `  let onErrorEntry = null;` + `
` + `` + `
` + `  let capturing = false;` + `
` + `` + `
` + `  function push(level, source, text) {` + `
` + `    if (entries.length >= MAX_ENTRIES) {` + `
` + `      entries.shift();` + `
` + `      dropped += 1;` + `
` + `    }` + `
` + `    let body = text;` + `
` + `    if (body.length > MAX_TEXT_CHARS) {` + `
` + `      body = \`\${body.slice(0, MAX_TEXT_CHARS)}... (\${body.length} chars)\`;` + `
` + `    }` + `
` + `    const entry = {` + `
` + `      ts: new Date().toISOString(),` + `
` + `      level,` + `
` + `      source,` + `
` + `      text: body,` + `
` + `    };` + `
` + `    entries.push(entry);` + `
` + `    if (level === "error" && onErrorEntry && isAlertOnError()) {` + `
` + `      try {` + `
` + `        onErrorEntry(entry);` + `
` + `      } catch {}` + `
` + `    }` + `
` + `  }` + `
` + `` + `
` + `  function setOnError(fn) {` + `
` + `    onErrorEntry = fn;` + `
` + `  }` + `
` + `` + `
` + `  function isAlertOnError() {` + `
` + `    try {` + `
` + `      return window.sessionStorage?.getItem(ALERT_KEY) === "X";` + `
` + `    } catch {` + `
` + `      return false;` + `
` + `    }` + `
` + `  }` + `
` + `` + `
` + `  function setAlertOnError(enabled) {` + `
` + `    try {` + `
` + `      if (enabled) {` + `
` + `        window.sessionStorage?.setItem(ALERT_KEY, "X");` + `
` + `      } else {` + `
` + `        window.sessionStorage?.removeItem(ALERT_KEY);` + `
` + `      }` + `
` + `    } catch {}` + `
` + `  }` + `
` + `` + `
` + `  function persist() {` + `
` + `    try {` + `
` + `      const errors = entries` + `
` + `        .filter((entry) => entry.level === "error")` + `
` + `        .slice(-RELOAD_MAX_ENTRIES)` + `
` + `        .map((entry) => ({ ...entry, previousLoad: true }));` + `
` + `      if (!errors.length) return;` + `
` + `      window.sessionStorage?.setItem(RELOAD_KEY, JSON.stringify(errors));` + `
` + `    } catch {}` + `
` + `  }` + `
` + `` + `
` + `  function restore() {` + `
` + `    let stored;` + `
` + `    try {` + `
` + `      stored = window.sessionStorage?.getItem(RELOAD_KEY);` + `
` + `      window.sessionStorage?.removeItem(RELOAD_KEY);` + `
` + `    } catch {` + `
` + `      return;` + `
` + `    }` + `
` + `    if (!stored) return;` + `
` + `    try {` + `
` + `      const parsed = JSON.parse(stored);` + `
` + `      if (Array.isArray(parsed)) entries = parsed.slice(-RELOAD_MAX_ENTRIES);` + `
` + `    } catch {` + `
` + `      entries = [];` + `
` + `    }` + `
` + `  }` + `
` + `` + `
` + `  function isErrorLike(value) {` + `
` + `    if (!value || typeof value !== "object") return false;` + `
` + `    if (Object.prototype.toString.call(value) === "[object Error]") return true;` + `
` + `    return typeof value.stack === "string" && typeof value.message === "string";` + `
` + `  }` + `
` + `` + `
` + `  function renderArg(value, depth) {` + `
` + `    if (value === undefined) return "undefined";` + `
` + `    if (value === null) return "null";` + `
` + `    const type = typeof value;` + `
` + `    if (type === "string") return value;` + `
` + `    if (type === "number" || type === "boolean" || type === "bigint") {` + `
` + `      return String(value);` + `
` + `    }` + `
` + `    if (type === "function") return \`[function \${value.name || "anonymous"}]\`;` + `
` + `    if (type === "symbol") return String(value);` + `
` + `    if (isErrorLike(value)) {` + `
` + `      return value.stack || \`\${value.name || "Error"}: \${value.message}\`;` + `
` + `    }` + `
` + `    if ((depth || 0) >= MAX_DEPTH) return "[...]";` + `
` + `    try {` + `
` + `      const seen = new WeakSet();` + `
` + `      const nodeDepth = new WeakMap();` + `
` + `      return JSON.stringify(value, function replace(key, val) {` + `
` + `        if (typeof val === "object" && val !== null) {` + `
` + `          if (seen.has(val)) return "[Circular]";` + `
` + `          const parent =` + `
` + `            typeof this === "object" && this !== null` + `
` + `              ? nodeDepth.get(this) || 0` + `
` + `              : 0;` + `
` + `          if (parent >= MAX_DEPTH) return "[...]";` + `
` + `          seen.add(val);` + `
` + `          nodeDepth.set(val, parent + 1);` + `
` + `        }` + `
` + `        if (isErrorLike(val)) return val.stack || String(val);` + `
` + `        return val;` + `
` + `      });` + `
` + `    } catch {` + `
` + `      try {` + `
` + `        return String(value);` + `
` + `      } catch {` + `
` + `        return "[unrenderable]";` + `
` + `      }` + `
` + `    }` + `
` + `  }` + `
` + `` + `
` + `  function renderArgs(args) {` + `
` + `    const parts = [];` + `
` + `    for (const arg of args) parts.push(renderArg(arg, 0));` + `
` + `    return parts.join(" ");` + `
` + `  }` + `
` + `` + `
` + `  function captureConsole(level, args) {` + `
` + `    if (capturing) return;` + `
` + `    capturing = true;` + `
` + `    try {` + `
` + `      push(level, "console", renderArgs(args));` + `
` + `    } catch {` + `
` + `    } finally {` + `
` + `      capturing = false;` + `
` + `    }` + `
` + `  }` + `
` + `` + `
` + `  const UI5_LEVELS = {` + `
` + `    1: "error",` + `
` + `    2: "error",` + `
` + `    3: "warn",` + `
` + `    4: "info",` + `
` + `    5: "debug",` + `
` + `    6: "debug",` + `
` + `  };` + `
` + `` + `
` + `  function captureUi5(logEntry) {` + `
` + `    try {` + `
` + `      const level = UI5_LEVELS[logEntry?.level] || "info";` + `
` + `      const component = logEntry?.component ? \`[\${logEntry.component}] \` : "";` + `
` + `      const details = logEntry?.details ? \` - \${logEntry.details}\` : "";` + `
` + `      push(level, "ui5", \`\${component}\${logEntry?.message || ""}\${details}\`);` + `
` + `    } catch {}` + `
` + `  }` + `
` + `` + `
` + `  function installConsole() {` + `
` + `    for (const name of METHODS) {` + `
` + `      const original = window.console?.[name];` + `
` + `      if (typeof original !== "function") continue;` + `
` + `      originals[name] = original;` + `
` + `` + `
` + `      window.console[name] = function (...args) {` + `
` + `        try {` + `
` + `          original.apply(window.console, args);` + `
` + `        } finally {` + `
` + `          captureConsole(name, args);` + `
` + `        }` + `
` + `      };` + `
` + `    }` + `
` + `  }` + `
` + `` + `
` + `  function uninstallConsole() {` + `
` + `    for (const name of Object.keys(originals)) {` + `
` + `      window.console[name] = originals[name];` + `
` + `      delete originals[name];` + `
` + `    }` + `
` + `  }` + `
` + `` + `
` + `  function installUi5Log() {` + `
` + `    const Log = sap.ui.require("sap/base/Log");` + `
` + `    if (!Log?.addLogListener) return;` + `
` + `    ui5Listener = { onLogEntry: captureUi5 };` + `
` + `    try {` + `
` + `      Log.addLogListener(ui5Listener);` + `
` + `    } catch {` + `
` + `      ui5Listener = null;` + `
` + `    }` + `
` + `  }` + `
` + `` + `
` + `  function uninstallUi5Log() {` + `
` + `    if (!ui5Listener) return;` + `
` + `    const Log = sap.ui.require("sap/base/Log");` + `
` + `    try {` + `
` + `      Log?.removeLogListener?.(ui5Listener);` + `
` + `    } catch {}` + `
` + `    ui5Listener = null;` + `
` + `  }` + `
` + `` + `
` + `  function install() {` + `
` + `    if (installed) return;` + `
` + `    installed = true;` + `
` + `    restore();` + `
` + `` + `
` + `    onWindowError = (event) => {` + `
` + `      const stack = event?.error?.stack;` + `
` + `` + `
` + `      if (stack) {` + `
` + `        push("error", "uncaught", stack);` + `
` + `        return;` + `
` + `      }` + `
` + `      const where = event?.filename` + `
` + `        ? \` (\${event.filename}:\${event.lineno || 0}:\${event.colno || 0})\`` + `
` + `        : "";` + `
` + `      push("error", "uncaught", \`\${event?.message || "unknown error"}\${where}\`);` + `
` + `    };` + `
` + `    onRejection = (event) => {` + `
` + `      const reason = event?.reason;` + `
` + `      push(` + `
` + `        "error",` + `
` + `        "rejection",` + `
` + `        reason?.stack || renderArg(reason, 0) || "unhandled rejection",` + `
` + `      );` + `
` + `    };` + `
` + `    onPageHide = persist;` + `
` + `    window.addEventListener("error", onWindowError);` + `
` + `    window.addEventListener("unhandledrejection", onRejection);` + `
` + `    window.addEventListener("pagehide", onPageHide);` + `
` + `` + `
` + `    installUi5Log();` + `
` + `    installConsole();` + `
` + `  }` + `
` + `` + `
` + `  function uninstall() {` + `
` + `    if (!installed) return;` + `
` + `    installed = false;` + `
` + `    uninstallConsole();` + `
` + `    uninstallUi5Log();` + `
` + `    if (onWindowError) window.removeEventListener("error", onWindowError);` + `
` + `    if (onRejection) {` + `
` + `      window.removeEventListener("unhandledrejection", onRejection);` + `
` + `    }` + `
` + `    if (onPageHide) window.removeEventListener("pagehide", onPageHide);` + `
` + `    onWindowError = null;` + `
` + `    onRejection = null;` + `
` + `    onPageHide = null;` + `
` + `    onErrorEntry = null;` + `
` + `    entries = [];` + `
` + `    dropped = 0;` + `
` + `  }` + `
` + `` + `
` + `  function getEntries() {` + `
` + `    return entries;` + `
` + `  }` + `
` + `` + `
` + `  function getDropped() {` + `
` + `    return dropped;` + `
` + `  }` + `
` + `` + `
` + `  return {` + `
` + `    install,` + `
` + `    uninstall,` + `
` + `    setOnError,` + `
` + `    isAlertOnError,` + `
` + `    setAlertOnError,` + `
` + `    getEntries,` + `
` + `    getDropped,` + `
` + `` + `
` + `    _internals: { renderArg, MAX_ENTRIES, MAX_TEXT_CHARS },` + `
` + `  };` + `
` + `});` + `
` + `` + `
` + ``;
    return result;
  }
}

module.exports = z2ui5_cl_ui5f_console_js;

