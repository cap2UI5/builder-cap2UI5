
class z2ui5_cl_ui5f_recorder_js {
  static get() {
    let result = ``;
    result = `sap.ui.define(["z2ui5/core/AppState", "z2ui5/core/Lib"], (AppState, Lib) => {` + `
` + `  "use strict";` + `
` + `` + `
` + `  const MAX_RECORDS = 50;` + `
` + `` + `
` + `  const PAYLOAD_BUDGET_BYTES = 2 * 1024 * 1024;` + `
` + `` + `
` + `  const PAYLOAD_FLAG_KEY = "z2ui5.devtools.recordPayloads";` + `
` + `` + `
` + `  const RELOAD_KEY = "z2ui5.devtools.history";` + `
` + `  const RELOAD_MAX_RECORDS = 30;` + `
` + `` + `
` + `  const UNPAIRED_FLUSH_MS = 5000;` + `
` + `` + `
` + `  const MAX_MESSAGE_CHARS = 500;` + `
` + `` + `
` + `  const MAX_DIFF_ENTRIES = 200;` + `
` + `  const MAX_DIFF_DEPTH = 12;` + `
` + `  const MAX_DIFF_VALUE_CHARS = 120;` + `
` + `` + `
` + `  let records = [];` + `
` + `` + `
` + `  let nextSeq = 1;` + `
` + `` + `
` + `  let unpaired = [];` + `
` + `` + `
` + `  let lastEntryStart = -1;` + `
` + `` + `
` + `  let payloadBytes = 0;` + `
` + `` + `
` + `  let observer = null;` + `
` + `  let installed = false;` + `
` + `  let afterRenderingHook = null;` + `
` + `  let onPageHide = null;` + `
` + `` + `
` + `  function backendUrl() {` + `
` + `    const url = AppState.getGlobal("url");` + `
` + `    if (!url) return "";` + `
` + `    try {` + `
` + `      return new URL(url, window.location.href).href;` + `
` + `    } catch {` + `
` + `      return "";` + `
` + `    }` + `
` + `  }` + `
` + `` + `
` + `  function now() {` + `
` + `    return typeof performance !== "undefined" && performance.now` + `
` + `      ? performance.now()` + `
` + `      : 0;` + `
` + `  }` + `
` + `` + `
` + `  function acceptEntry(entry) {` + `
` + `    if (!entry || entry.startTime <= lastEntryStart) return;` + `
` + `    lastEntryStart = entry.startTime;` + `
` + `    unpaired.push({` + `
` + `      start: entry.startTime,` + `
` + `      end: entry.responseEnd || entry.startTime,` + `
` + `` + `
` + `      bytes: entry.decodedBodySize || null,` + `
` + `    });` + `
` + `  }` + `
` + `` + `
` + `  function sweepEntries() {` + `
` + `    if (typeof performance === "undefined" || !performance.getEntriesByName) {` + `
` + `      return;` + `
` + `    }` + `
` + `    const url = backendUrl();` + `
` + `    if (!url) return;` + `
` + `    let entries;` + `
` + `    try {` + `
` + `      entries = performance.getEntriesByName(url, "resource");` + `
` + `    } catch {` + `
` + `      return;` + `
` + `    }` + `
` + `` + `
` + `    const fresh = [];` + `
` + `    for (let i = entries.length - 1; i >= 0; i -= 1) {` + `
` + `      if (entries[i].startTime <= lastEntryStart) break;` + `
` + `      fresh.push(entries[i]);` + `
` + `    }` + `
` + `    for (let i = fresh.length - 1; i >= 0; i -= 1) acceptEntry(fresh[i]);` + `
` + `  }` + `
` + `` + `
` + `  function takeNetworkFor(tRendered) {` + `
` + `    let index = -1;` + `
` + `    for (let i = unpaired.length - 1; i >= 0; i--) {` + `
` + `      if (unpaired[i].end <= tRendered) {` + `
` + `        index = i;` + `
` + `        break;` + `
` + `      }` + `
` + `    }` + `
` + `    if (index === -1) return null;` + `
` + `    const stale = unpaired.slice(0, index);` + `
` + `    const match = unpaired[index];` + `
` + `    unpaired = unpaired.slice(index + 1);` + `
` + `    for (const entry of stale) pushUnrendered(entry);` + `
` + `    return match;` + `
` + `  }` + `
` + `` + `
` + `  function flushStaleUnpaired() {` + `
` + `    if (!unpaired.length) return;` + `
` + `    const cutoff = now() - UNPAIRED_FLUSH_MS;` + `
` + `    const stale = unpaired.filter((entry) => entry.end < cutoff);` + `
` + `    if (!stale.length) return;` + `
` + `    unpaired = unpaired.filter((entry) => entry.end >= cutoff);` + `
` + `    for (const entry of stale) pushUnrendered(entry);` + `
` + `  }` + `
` + `` + `
` + `  function pushUnrendered(entry) {` + `
` + `    pushRecord({` + `
` + `      ts: new Date().toISOString(),` + `
` + `      event: "",` + `
` + `      idSent: "",` + `
` + `      idReceived: "",` + `
` + `      app: "",` + `
` + `      reqBytes: null,` + `
` + `      respBytes: entry.bytes,` + `
` + `      backendMs: Math.round(entry.end - entry.start),` + `
` + `      renderMs: null,` + `
` + `      totalMs: null,` + `
` + `      systemActions: 0,` + `
` + `      customActions: 0,` + `
` + `      messages: [],` + `
` + `      rendered: false,` + `
` + `      request: null,` + `
` + `      response: null,` + `
` + `    });` + `
` + `  }` + `
` + `` + `
` + `  function extractMessages(response) {` + `
` + `    const custom = response?.S_FRONT?.S_ACTION?.T_CUSTOM;` + `
` + `    if (!Array.isArray(custom)) return [];` + `
` + `    const out = [];` + `
` + `    for (const item of custom) {` + `
` + `      if (!Array.isArray(item) || item[0] !== "CONTROL_GLOBAL") continue;` + `
` + `      const target = item[1];` + `
` + `      if (target !== "MESSAGE_TOAST" && target !== "MESSAGE_BOX") continue;` + `
` + `      let text = typeof item[3] === "string" ? item[3] : "";` + `
` + `      if (text.length > MAX_MESSAGE_CHARS) {` + `
` + `        text = \`\${text.slice(0, MAX_MESSAGE_CHARS)}...\`;` + `
` + `      }` + `
` + `      out.push({ target, method: item[2] || "", text });` + `
` + `    }` + `
` + `    return out;` + `
` + `  }` + `
` + `` + `
` + `  function recordBytes(record) {` + `
` + `    if (!record.request && !record.response) return 0;` + `
` + `    return (record.reqBytes || 0) + (record.respBytes || 0);` + `
` + `  }` + `
` + `` + `
` + `  function enforcePayloadBudget() {` + `
` + `    for (const record of records) {` + `
` + `      if (payloadBytes <= PAYLOAD_BUDGET_BYTES) return;` + `
` + `      if (!record.request && !record.response) continue;` + `
` + `      payloadBytes -= recordBytes(record);` + `
` + `      record.request = null;` + `
` + `      record.response = null;` + `
` + `      record.payloadEvicted = true;` + `
` + `    }` + `
` + `  }` + `
` + `` + `
` + `  function pushRecord(record) {` + `
` + `    record.seq = nextSeq++;` + `
` + `    records.push(record);` + `
` + `    payloadBytes += recordBytes(record);` + `
` + `    while (records.length > MAX_RECORDS) {` + `
` + `      const dropped = records.shift();` + `
` + `      payloadBytes -= recordBytes(dropped);` + `
` + `    }` + `
` + `    enforcePayloadBudget();` + `
` + `  }` + `
` + `` + `
` + `  function isRecordingPayloads() {` + `
` + `    try {` + `
` + `      return window.sessionStorage?.getItem(PAYLOAD_FLAG_KEY) === "X";` + `
` + `    } catch {` + `
` + `      return false;` + `
` + `    }` + `
` + `  }` + `
` + `` + `
` + `  function setRecordingPayloads(enabled) {` + `
` + `    try {` + `
` + `      if (enabled) {` + `
` + `        window.sessionStorage?.setItem(PAYLOAD_FLAG_KEY, "X");` + `
` + `      } else {` + `
` + `        window.sessionStorage?.removeItem(PAYLOAD_FLAG_KEY);` + `
` + `      }` + `
` + `    } catch {}` + `
` + `    if (!enabled) dropAllPayloads();` + `
` + `  }` + `
` + `` + `
` + `  function dropAllPayloads() {` + `
` + `    for (const record of records) {` + `
` + `      record.request = null;` + `
` + `      record.response = null;` + `
` + `    }` + `
` + `    payloadBytes = 0;` + `
` + `  }` + `
` + `` + `
` + `  function measureRequest(oBody) {` + `
` + `    if (!oBody) return null;` + `
` + `    const known = AppState.state.lastRequestBytes;` + `
` + `    if (typeof known === "number") return known;` + `
` + `    try {` + `
` + `      return JSON.stringify({ value: oBody }).length;` + `
` + `    } catch {` + `
` + `      return null;` + `
` + `    }` + `
` + `  }` + `
` + `` + `
` + `  function onAfterRendering() {` + `
` + `    try {` + `
` + `      const state = AppState.state;` + `
` + `      const tRendered = now();` + `
` + `      sweepEntries();` + `
` + `      const net = takeNetworkFor(tRendered);` + `
` + `      const response = state.responseData;` + `
` + `      const sFront = response?.S_FRONT;` + `
` + `      const keepPayloads = isRecordingPayloads();` + `
` + `      const reqBytes = measureRequest(state.oBody);` + `
` + `` + `
` + `      pushRecord({` + `
` + `        ts: new Date().toISOString(),` + `
` + `        event: state.oBody?.S_FRONT?.EVENT || "",` + `
` + `        idSent: state.oBody?.S_FRONT?.ID || "",` + `
` + `        idReceived: sFront?.ID || "",` + `
` + `        app: sFront?.APP || "",` + `
` + `        reqBytes: reqBytes,` + `
` + `        respBytes: net?.bytes ?? null,` + `
` + `        backendMs: net ? Math.round(net.end - net.start) : null,` + `
` + `        renderMs: net ? Math.round(tRendered - net.end) : null,` + `
` + `        totalMs: net ? Math.round(tRendered - net.start) : null,` + `
` + `        systemActions: sFront?.S_ACTION?.T_SYSTEM?.length || 0,` + `
` + `        customActions: sFront?.S_ACTION?.T_CUSTOM?.length || 0,` + `
` + `` + `
` + `        messages: extractMessages(response),` + `
` + `        rendered: true,` + `
` + `` + `
` + `        request: keepPayloads ? state.oBody : null,` + `
` + `        response: keepPayloads ? response : null,` + `
` + `      });` + `
` + `      flushStaleUnpaired();` + `
` + `    } catch (e) {` + `
` + `      Lib.logError("DevTools Recorder: onAfterRendering failed", e);` + `
` + `    }` + `
` + `  }` + `
` + `` + `
` + `  function persist() {` + `
` + `    try {` + `
` + `      const slim = records.slice(-RELOAD_MAX_RECORDS).map((record) => {` + `
` + `        const copy = { ...record, previousLoad: true };` + `
` + `        delete copy.request;` + `
` + `        delete copy.response;` + `
` + `        return copy;` + `
` + `      });` + `
` + `      if (!slim.length) return;` + `
` + `      window.sessionStorage?.setItem(RELOAD_KEY, JSON.stringify(slim));` + `
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
` + `      if (!Array.isArray(parsed)) return;` + `
` + `      records = parsed.slice(-RELOAD_MAX_RECORDS);` + `
` + `` + `
` + `      nextSeq = (records[records.length - 1]?.seq || 0) + 1;` + `
` + `    } catch {` + `
` + `      records = [];` + `
` + `    }` + `
` + `  }` + `
` + `` + `
` + `  function install() {` + `
` + `    if (installed) return;` + `
` + `    installed = true;` + `
` + `    restore();` + `
` + `    afterRenderingHook = onAfterRendering;` + `
` + `    Lib.registerCallback("onAfterRendering", afterRenderingHook);` + `
` + `` + `
` + `    onPageHide = persist;` + `
` + `    window.addEventListener("pagehide", onPageHide);` + `
` + `` + `
` + `    if (typeof PerformanceObserver === "undefined") return;` + `
` + `    try {` + `
` + `      observer = new PerformanceObserver((list) => {` + `
` + `        const url = backendUrl();` + `
` + `        if (!url) return;` + `
` + `        for (const entry of list.getEntries()) {` + `
` + `          if (entry.name === url) acceptEntry(entry);` + `
` + `        }` + `
` + `      });` + `
` + `` + `
` + `      observer.observe({ type: "resource", buffered: true });` + `
` + `    } catch {` + `
` + `      observer = null;` + `
` + `    }` + `
` + `  }` + `
` + `` + `
` + `  function uninstall() {` + `
` + `    if (!installed) return;` + `
` + `    installed = false;` + `
` + `    Lib.unregisterCallback("onAfterRendering", afterRenderingHook);` + `
` + `    afterRenderingHook = null;` + `
` + `    if (onPageHide) {` + `
` + `      window.removeEventListener("pagehide", onPageHide);` + `
` + `      onPageHide = null;` + `
` + `    }` + `
` + `    if (observer) {` + `
` + `      try {` + `
` + `        observer.disconnect();` + `
` + `      } catch {}` + `
` + `      observer = null;` + `
` + `    }` + `
` + `    records = [];` + `
` + `    unpaired = [];` + `
` + `    payloadBytes = 0;` + `
` + `    nextSeq = 1;` + `
` + `    lastEntryStart = -1;` + `
` + `  }` + `
` + `` + `
` + `  function getRecords() {` + `
` + `    flushStaleUnpaired();` + `
` + `    return records;` + `
` + `  }` + `
` + `` + `
` + `  function pad(value, width, right) {` + `
` + `    const text = value === null || value === undefined ? "-" : String(value);` + `
` + `    if (text.length >= width) return text;` + `
` + `    const fill = " ".repeat(width - text.length);` + `
` + `    return right ? fill + text : text + fill;` + `
` + `  }` + `
` + `` + `
` + `  function formatBytes(bytes) {` + `
` + `    if (bytes === null || bytes === undefined) return "-";` + `
` + `    if (bytes < 1024) return \`\${bytes} B\`;` + `
` + `    if (bytes < 1024 * 1024) return \`\${Math.round(bytes / 1024)} KB\`;` + `
` + `    return \`\${(bytes / (1024 * 1024)).toFixed(1)} MB\`;` + `
` + `  }` + `
` + `` + `
` + `  function formatMs(ms) {` + `
` + `    return ms === null || ms === undefined ? "-" : \`\${ms} ms\`;` + `
` + `  }` + `
` + `` + `
` + `  function shortId(id) {` + `
` + `    if (!id) return "-";` + `
` + `    return id.length > 8 ? \`..\${id.slice(-6)}\` : id;` + `
` + `  }` + `
` + `` + `
` + `  function navigationLines(list) {` + `
` + `    const hops = [];` + `
` + `    let previous = null;` + `
` + `    for (const record of list) {` + `
` + `      if (!record.app || record.app === previous) continue;` + `
` + `      hops.push({` + `
` + `        seq: record.seq,` + `
` + `        from: previous,` + `
` + `        to: record.app,` + `
` + `        event: record.event,` + `
` + `        draft: record.idReceived,` + `
` + `      });` + `
` + `      previous = record.app;` + `
` + `    }` + `
` + `    if (hops.length < 2) return [];` + `
` + `    const out = ["App navigation observed this session"];` + `
` + `    for (const hop of hops) {` + `
` + `      out.push(` + `
` + `        \`  #\${String(hop.seq).padEnd(4)}\` +` + `
` + `          \`\${hop.from ? \`\${hop.from} -> \` : "start "}\${hop.to}\` +` + `
` + `          \`\${hop.event ? \`   via \${hop.event}\` : ""}\` +` + `
` + `          \`   draft \${shortId(hop.draft)}\`,` + `
` + `      );` + `
` + `    }` + `
` + `    out.push("");` + `
` + `    return out;` + `
` + `  }` + `
` + `` + `
` + `  function summaryLines(list) {` + `
` + `    const timed = list.filter((r) => r.backendMs !== null);` + `
` + `    if (!timed.length) return [];` + `
` + `    const out = ["Summary"];` + `
` + `    const backend = timed.map((r) => r.backendMs);` + `
` + `    const avg = Math.round(backend.reduce((a, b) => a + b, 0) / backend.length);` + `
` + `    const slowest = timed.reduce((a, b) => (b.backendMs > a.backendMs ? b : a));` + `
` + `    out.push(` + `
` + `      \`  Backend: avg \${avg} ms over \${timed.length} roundtrip(s),\` +` + `
` + `        \` slowest #\${slowest.seq} \${slowest.event || "(start)"}\` +` + `
` + `        \` at \${slowest.backendMs} ms\`,` + `
` + `    );` + `
` + `    const sized = list.filter((r) => r.respBytes !== null);` + `
` + `    if (sized.length) {` + `
` + `      const biggest = sized.reduce((a, b) =>` + `
`;
    result = result + `        b.respBytes > a.respBytes ? b : a,` + `
` + `      );` + `
` + `      const total = sized.reduce((sum, r) => sum + r.respBytes, 0);` + `
` + `      out.push(` + `
` + `        \`  Response: \${formatBytes(total)} total,\` +` + `
` + `          \` largest #\${biggest.seq} \${biggest.event || "(start)"}\` +` + `
` + `          \` at \${formatBytes(biggest.respBytes)}\`,` + `
` + `      );` + `
` + `    }` + `
` + `    const failed = list.filter((r) => !r.rendered).length;` + `
` + `    if (failed) {` + `
` + `      out.push(\`  \${failed} roundtrip(s) never reached the render phase.\`);` + `
` + `    }` + `
` + `    return out;` + `
` + `  }` + `
` + `` + `
` + `  function formatHistory() {` + `
` + `    const list = getRecords();` + `
` + `    const lines = [];` + `
` + `    lines.push(` + `
` + `      \`Roundtrip history - \${list.length} of max \${MAX_RECORDS} records\`,` + `
` + `    );` + `
` + `    lines.push(` + `
` + `      \`Payload recording: \${isRecordingPayloads() ? "ON" : "OFF"}\` +` + `
` + `        \` (retained \${formatBytes(payloadBytes)} of \` +` + `
` + `        \`\${formatBytes(PAYLOAD_BUDGET_BYTES)} budget)\`,` + `
` + `    );` + `
` + `    if (!isRecordingPayloads()) {` + `
` + `      lines.push(` + `
` + `        \`Switch "Record Payloads" on to keep request/response bodies and\` +` + `
` + `          \` enable the Model Diff tab.\`,` + `
` + `      );` + `
` + `    }` + `
` + `    lines.push("");` + `
` + `    if (!list.length) {` + `
` + `      lines.push("(no roundtrip recorded yet)");` + `
` + `      return lines.join("\\n");` + `
` + `    }` + `
` + `` + `
` + `    lines.push(` + `
` + `      pad("#", 5) +` + `
` + `        pad("TIME", 14) +` + `
` + `        pad("EVENT", 22) +` + `
` + `        pad("TOTAL", 10, true) +` + `
` + `        pad("BACKEND", 10, true) +` + `
` + `        pad("RENDER", 10, true) +` + `
` + `        pad("REQ", 10, true) +` + `
` + `        pad("RESP", 10, true) +` + `
` + `        "  " +` + `
` + `        pad("DRAFT", 10) +` + `
` + `        pad("ACT", 8) +` + `
` + `        "PAYLOAD",` + `
` + `    );` + `
` + `    lines.push("-".repeat(118));` + `
` + `` + `
` + `    for (const record of list) {` + `
` + `      const time = record.ts.slice(11, 23);` + `
` + `      const actions = \`\${record.systemActions}/\${record.customActions}\`;` + `
` + `      let payload = "-";` + `
` + `      if (record.request || record.response) payload = "kept";` + `
` + `      else if (record.payloadEvicted) payload = "evicted";` + `
` + `      lines.push(` + `
` + `        pad(record.previousLoad ? \`\${record.seq}*\` : record.seq, 5) +` + `
` + `          pad(time, 14) +` + `
` + `          pad(record.rendered ? record.event || "(start)" : "(no render)", 22) +` + `
` + `          pad(formatMs(record.totalMs), 10, true) +` + `
` + `          pad(formatMs(record.backendMs), 10, true) +` + `
` + `          pad(formatMs(record.renderMs), 10, true) +` + `
` + `          pad(formatBytes(record.reqBytes), 10, true) +` + `
` + `          pad(formatBytes(record.respBytes), 10, true) +` + `
` + `          "  " +` + `
` + `          pad(shortId(record.idReceived), 10) +` + `
` + `          pad(actions, 8) +` + `
` + `          payload,` + `
` + `      );` + `
` + `    }` + `
` + `` + `
` + `    lines.push("");` + `
` + `    lines.push(...navigationLines(list));` + `
` + `    lines.push(...summaryLines(list));` + `
` + `    lines.push("");` + `
` + `    lines.push(` + `
` + `      "TOTAL = request start to rendered, BACKEND = network + ABAP," +` + `
` + `        " RENDER = response end to rendered.",` + `
` + `    );` + `
` + `    lines.push(` + `
` + `      "ACT = system/custom action counts. A '(no render)' row is a" +` + `
` + `        " roundtrip that never reached the render phase",` + `
` + `    );` + `
` + `    if (list.some((record) => record.previousLoad)) {` + `
` + `      lines.push(` + `
` + `        "A '*' after the number marks a roundtrip of the PREVIOUS page" +` + `
` + `          " load, carried across the reload.",` + `
` + `      );` + `
` + `    }` + `
` + `    lines.push(` + `
` + `      "(error response, aborted request, or a parallel request whose" +` + `
` + `        " result was discarded as stale).",` + `
` + `    );` + `
` + `    return lines.join("\\n");` + `
` + `  }` + `
` + `` + `
` + `  function isPlainObject(value) {` + `
` + `    return value !== null && typeof value === "object" && !Array.isArray(value);` + `
` + `  }` + `
` + `` + `
` + `  function renderValue(value) {` + `
` + `    let text;` + `
` + `    if (value === undefined) return "(absent)";` + `
` + `    if (value === null) return "null";` + `
` + `    if (typeof value === "object") {` + `
` + `      try {` + `
` + `        text = JSON.stringify(value);` + `
` + `      } catch {` + `
` + `        text = String(value);` + `
` + `      }` + `
` + `    } else {` + `
` + `      text = String(value);` + `
` + `    }` + `
` + `    if (text.length > MAX_DIFF_VALUE_CHARS) {` + `
` + `      return \`\${text.slice(0, MAX_DIFF_VALUE_CHARS)}... (\${text.length} chars)\`;` + `
` + `    }` + `
` + `    return text;` + `
` + `  }` + `
` + `` + `
` + `  function collectDiff(before, after, path, out, depth) {` + `
` + `    if (out.length >= MAX_DIFF_ENTRIES) return;` + `
` + `    if (before === after) return;` + `
` + `    if (depth > MAX_DIFF_DEPTH) {` + `
` + `      out.push({ path, type: "changed", before: "(too deep)", after: "" });` + `
` + `      return;` + `
` + `    }` + `
` + `` + `
` + `    const bothObjects = isPlainObject(before) && isPlainObject(after);` + `
` + `    const bothArrays = Array.isArray(before) && Array.isArray(after);` + `
` + `` + `
` + `    if (bothObjects) {` + `
` + `      const keys = new Set([...Object.keys(before), ...Object.keys(after)]);` + `
` + `      for (const key of keys) {` + `
` + `        collectDiff(before[key], after[key], \`\${path}/\${key}\`, out, depth + 1);` + `
` + `      }` + `
` + `      return;` + `
` + `    }` + `
` + `` + `
` + `    if (bothArrays) {` + `
` + `      const length = Math.max(before.length, after.length);` + `
` + `      for (let i = 0; i < length; i++) {` + `
` + `        collectDiff(before[i], after[i], \`\${path}/\${i}\`, out, depth + 1);` + `
` + `      }` + `
` + `      return;` + `
` + `    }` + `
` + `` + `
` + `    if (before === undefined) {` + `
` + `      out.push({ path, type: "added", before: undefined, after });` + `
` + `      return;` + `
` + `    }` + `
` + `    if (after === undefined) {` + `
` + `      out.push({ path, type: "removed", before, after: undefined });` + `
` + `      return;` + `
` + `    }` + `
` + `    out.push({ path, type: "changed", before, after });` + `
` + `  }` + `
` + `` + `
` + `  const MAX_DIFF_LINES = 4000;` + `
` + `` + `
` + `  const DIFF_LOOKAHEAD = 25;` + `
` + `` + `
` + `  function displayedXml(response, slotKey) {` + `
` + `    const system = response?.S_FRONT?.S_ACTION?.T_SYSTEM;` + `
` + `    if (!Array.isArray(system)) return "";` + `
` + `    for (const item of system) {` + `
` + `      if (!Array.isArray(item)) continue;` + `
` + `      if (item[0] !== "VIEW_SLOTS" || item[1] !== "display") continue;` + `
` + `      if (item[2] !== slotKey) continue;` + `
` + `      if (typeof item[3] === "string") return item[3];` + `
` + `    }` + `
` + `    return "";` + `
` + `  }` + `
` + `` + `
` + `  function diffLines(beforeText, afterText) {` + `
` + `    const a = beforeText.split("\\n").slice(0, MAX_DIFF_LINES);` + `
` + `    const b = afterText.split("\\n").slice(0, MAX_DIFF_LINES);` + `
` + `    const out = [];` + `
` + `    let i = 0;` + `
` + `    let j = 0;` + `
` + `    while ((i < a.length || j < b.length) && out.length < MAX_DIFF_ENTRIES) {` + `
` + `      if (i < a.length && j < b.length && a[i] === b[j]) {` + `
` + `        i += 1;` + `
` + `        j += 1;` + `
` + `        continue;` + `
` + `      }` + `
` + `      let addedRun = -1;` + `
` + `      let removedRun = -1;` + `
` + `      for (let k = 1; k <= DIFF_LOOKAHEAD; k += 1) {` + `
` + `        if (` + `
` + `          addedRun < 0 &&` + `
` + `          i < a.length &&` + `
` + `          j + k < b.length &&` + `
` + `          a[i] === b[j + k]` + `
` + `        ) {` + `
` + `          addedRun = k;` + `
` + `        }` + `
` + `        if (` + `
` + `          removedRun < 0 &&` + `
` + `          j < b.length &&` + `
` + `          i + k < a.length &&` + `
` + `          b[j] === a[i + k]` + `
` + `        ) {` + `
` + `          removedRun = k;` + `
` + `        }` + `
` + `        if (addedRun >= 0 || removedRun >= 0) break;` + `
` + `      }` + `
` + `      if (addedRun >= 0 && (removedRun < 0 || addedRun <= removedRun)) {` + `
` + `        for (let k = 0; k < addedRun; k += 1) {` + `
` + `          out.push({ type: "+", line: b[j + k], number: j + k + 1 });` + `
` + `        }` + `
` + `        j += addedRun;` + `
` + `      } else if (removedRun >= 0) {` + `
` + `        for (let k = 0; k < removedRun; k += 1) {` + `
` + `          out.push({ type: "-", line: a[i + k], number: i + k + 1 });` + `
` + `        }` + `
` + `        i += removedRun;` + `
` + `      } else {` + `
` + `        if (i < a.length) {` + `
` + `          out.push({ type: "-", line: a[i], number: i + 1 });` + `
` + `          i += 1;` + `
` + `        }` + `
` + `        if (j < b.length) {` + `
` + `          out.push({ type: "+", line: b[j], number: j + 1 });` + `
` + `          j += 1;` + `
` + `        }` + `
` + `      }` + `
` + `    }` + `
` + `    return out;` + `
` + `  }` + `
` + `` + `
` + `  function lastTwoViews(slotKey) {` + `
` + `    const withView = records` + `
` + `      .map((record) => ({` + `
` + `        record,` + `
` + `        xml: displayedXml(record.response, slotKey),` + `
` + `      }))` + `
` + `      .filter((entry) => entry.xml);` + `
` + `    return withView.length < 2 ? null : withView.slice(-2);` + `
` + `  }` + `
` + `` + `
` + `  function formatViewDiff() {` + `
` + `    if (!isRecordingPayloads()) {` + `
` + `      return (` + `
` + `        "View diff needs payload recording.\\n\\n" +` + `
` + `        'Switch "Record Payloads" on in the dialog footer, then trigger at' +` + `
` + `        " least two roundtrips that rebuild the view - the diff compares the\\n" +` + `
` + `        "view XML of the two most recently recorded rebuilds."` + `
` + `      );` + `
` + `    }` + `
` + `` + `
` + `    const pair = lastTwoViews("MAIN");` + `
` + `    if (!pair) {` + `
` + `      return (` + `
` + `        "Not enough recorded view rebuilds yet - the diff needs two.\\n\\n" +` + `
` + `        "Only a response that actually rebuilt the MAIN view counts; a\\n" +` + `
` + `        "roundtrip that only pushed the model does not."` + `
` + `      );` + `
` + `    }` + `
` + `    const [previous, current] = pair;` + `
` + `    const out = [` + `
` + `      \`View XML diff: roundtrip #\${previous.record.seq}\` +` + `
` + `        \` (\${previous.record.event || "(start)"}) ->\` +` + `
` + `        \` #\${current.record.seq} (\${current.record.event || "(start)"})\`,` + `
` + `      "",` + `
` + `    ];` + `
` + `    const changes = diffLines(` + `
` + `      prettifyForDiff(previous.xml),` + `
` + `      prettifyForDiff(current.xml),` + `
` + `    );` + `
` + `    if (!changes.length) {` + `
` + `      out.push("(the two rebuilds produced identical view XML)");` + `
` + `      return out.join("\\n");` + `
` + `    }` + `
` + `    out.push(` + `
` + `      \`\${changes.length}\${changes.length >= MAX_DIFF_ENTRIES ? "+" : ""} changed line(s):\`,` + `
` + `    );` + `
` + `    out.push("");` + `
` + `    for (const change of changes) {` + `
` + `      out.push(` + `
` + `        \`  \${change.type} \${String(change.number).padStart(5)}  \` +` + `
` + `          \`\${change.line.trim()}\`,` + `
` + `      );` + `
` + `    }` + `
` + `    if (changes.length >= MAX_DIFF_ENTRIES) {` + `
` + `      out.push("");` + `
` + `      out.push(\`(stopped after \${MAX_DIFF_ENTRIES} changes)\`);` + `
` + `    }` + `
` + `    return out.join("\\n");` + `
` + `  }` + `
` + `` + `
` + `  function prettifyForDiff(xml) {` + `
` + `    return String(xml).replace(/></g, ">\\n<");` + `
` + `  }` + `
` + `` + `
` + `  function lastTwoResponses() {` + `
` + `    const withPayload = records.filter((record) => record.response);` + `
` + `    if (withPayload.length < 2) return null;` + `
` + `    return withPayload.slice(-2);` + `
` + `  }` + `
` + `` + `
` + `  function formatModelDiff() {` + `
` + `    if (!isRecordingPayloads()) {` + `
` + `      return (` + `
` + `        "Model diff needs payload recording.\\n\\n" +` + `
` + `        'Switch "Record Payloads" on in the dialog footer, then trigger at' +` + `
` + `        " least two roundtrips - the diff compares the MODEL of the two most\\n" +` + `
` + `        "recently recorded responses."` + `
` + `      );` + `
` + `    }` + `
` + `    const pair = lastTwoResponses();` + `
` + `    if (!pair) {` + `
` + `      return (` + `
` + `        "Not enough recorded responses yet - the diff needs two.\\n\\n" +` + `
` + `        "Trigger another roundtrip and reopen this tab."` + `
` + `      );` + `
` + `    }` + `
` + `    const [previous, current] = pair;` + `
` + `    const out = [];` + `
` + `    collectDiff(previous.response?.MODEL, current.response?.MODEL, "", out, 0);` + `
` + `` + `
` + `    const header = [` + `
` + `      \`Model diff: roundtrip #\${previous.seq} (\${previous.event || "(start)"})\` +` + `
` + `        \` -> #\${current.seq} (\${current.event || "(start)"})\`,` + `
` + `      "",` + `
` + `    ];` + `
` + `    if (!out.length) {` + `
` + `      header.push("(the two responses carry an identical MODEL)");` + `
` + `      return header.join("\\n");` + `
` + `    }` + `
` + `    header.push(` + `
` + `      \`\${out.length}\${out.length >= MAX_DIFF_ENTRIES ? "+" : ""}\` +` + `
` + `        \` differing path(s):\`,` + `
` + `    );` + `
` + `    header.push("");` + `
` + `    for (const entry of out) {` + `
` + `      const path = entry.path || "/";` + `
` + `      if (entry.type === "added") {` + `
` + `        header.push(\`+ \${path}\`);` + `
` + `        header.push(\`    \${renderValue(entry.after)}\`);` + `
` + `      } else if (entry.type === "removed") {` + `
` + `        header.push(\`- \${path}\`);` + `
` + `        header.push(\`    \${renderValue(entry.before)}\`);` + `
` + `      } else {` + `
` + `        header.push(\`~ \${path}\`);` + `
` + `        header.push(\`    before: \${renderValue(entry.before)}\`);` + `
` + `        header.push(\`    after:  \${renderValue(entry.after)}\`);` + `
` + `      }` + `
` + `    }` + `
` + `    if (out.length >= MAX_DIFF_ENTRIES) {` + `
` + `      header.push("");` + `
` + `      header.push(\`(stopped after \${MAX_DIFF_ENTRIES} differences)\`);` + `
` + `    }` + `
` + `    return header.join("\\n");` + `
` + `  }` + `
` + `` + `
` + `  function exportJson() {` + `
` + `    const payload = {` + `
` + `      exportedAt: new Date().toISOString(),` + `
` + `      payloadsRecorded: isRecordingPayloads(),` + `
` + `      records: getRecords(),` + `
` + `    };` + `
` + `    try {` + `
` + `      return JSON.stringify(payload, null, 2);` + `
` + `    } catch {` + `
` + `      const metaOnly = records.map((record) => {` + `
` + `        const copy = { ...record };` + `
` + `        delete copy.request;` + `
` + `        delete copy.response;` + `
` + `        return copy;` + `
` + `      });` + `
` + `      return JSON.stringify({ ...payload, records: metaOnly }, null, 2);` + `
` + `    }` + `
` + `  }` + `
` + `` + `
` + `  return {` + `
` + `    install,` + `
` + `    uninstall,` + `
` + `    getRecords,` + `
` + `    exportJson,` + `
` + `    isRecordingPayloads,` + `
` + `    setRecordingPayloads,` + `
` + `    formatHistory,` + `
` + `    formatModelDiff,` + `
` + `    formatViewDiff,` + `
` + `` + `
` + `    _internals: { MAX_RECORDS, PAYLOAD_BUDGET_BYTES, PAYLOAD_FLAG_KEY },` + `
` + `  };` + `
` + `});` + `
` + `` + `
` + ``;
    return result;
  }
}

module.exports = z2ui5_cl_ui5f_recorder_js;

