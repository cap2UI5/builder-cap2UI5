
class z2ui5_cl_ui5f_websock_js {
  static get() {
    let result = ``;
    result = `sap.ui.define(` + `
` + `  ["sap/ui/core/Control", "z2ui5/core/Lib", "z2ui5/core/AppState"],` + `
` + `  (Control, Lib, AppState) => {` + `
` + `    "use strict";` + `
` + `` + `
` + `    const DRAIN_RETRY_MS = 50;` + `
` + `` + `
` + `    const RECONNECT_BASE_MS = 500;` + `
` + `    const RECONNECT_MAX_MS = 30000;` + `
` + `    const MAX_CONNECT_ATTEMPTS = 5;` + `
` + `` + `
` + `    const MAX_QUEUE = 100;` + `
` + `` + `
` + `    return Control.extend("z2ui5.cc.Websocket", {` + `
` + `      metadata: {` + `
` + `        properties: {` + `
` + `          path: {` + `
` + `            type: "string",` + `
` + `            defaultValue: "",` + `
` + `          },` + `
` + `` + `
` + `          value: {` + `
` + `            type: "string",` + `
` + `            defaultValue: "",` + `
` + `          },` + `
` + `          checkActive: {` + `
` + `            type: "boolean",` + `
` + `            defaultValue: true,` + `
` + `          },` + `
` + `` + `
` + `          checkRepeat: {` + `
` + `            type: "boolean",` + `
` + `            defaultValue: true,` + `
` + `          },` + `
` + `        },` + `
` + `        events: {` + `
` + `          received: {` + `
` + `            allowPreventDefault: true,` + `
` + `            parameters: {},` + `
` + `          },` + `
` + `` + `
` + `          error: {` + `
` + `            parameters: {` + `
` + `              code: { type: "string" },` + `
` + `              message: { type: "string" },` + `
` + `            },` + `
` + `          },` + `
` + `        },` + `
` + `      },` + `
` + `      init() {` + `
` + `        this._queue = [];` + `
` + `        this._failedAttempts = 0;` + `
` + `        this._dropped = 0;` + `
` + `      },` + `
` + `` + `
` + `      onAfterRendering() {` + `
` + `        const url = this._resolveUrl();` + `
` + `        if (url !== this._url) {` + `
` + `          this._disconnect();` + `
` + `` + `
` + `          this._failedAttempts = 0;` + `
` + `        }` + `
` + `        this._url = url;` + `
` + `        if (this.getProperty("checkActive")) {` + `
` + `          this._connect();` + `
` + `        } else {` + `
` + `          this._disconnect();` + `
` + `        }` + `
` + `      },` + `
` + `      exit() {` + `
` + `        clearTimeout(this._drainId);` + `
` + `        clearTimeout(this._reconnectId);` + `
` + `        this._disconnect();` + `
` + `      },` + `
` + `      _resolveUrl() {` + `
` + `        const path = this.getProperty("path");` + `
` + `        if (!path) return "";` + `
` + `        if (/^wss?:\\/\\//i.test(path)) return path;` + `
` + `` + `
` + `        const origin = window.location.origin.replace(/^http/i, "ws");` + `
` + `        return path.charAt(0) === "/" ? origin + path : origin + "/" + path;` + `
` + `      },` + `
` + `      _connect() {` + `
` + `        if (this._ws || !this._url) return;` + `
` + `        if (this._failedAttempts >= MAX_CONNECT_ATTEMPTS) return;` + `
` + `        const url = this._url;` + `
` + `        let ws;` + `
` + `        try {` + `
` + `          ws = new WebSocket(url);` + `
` + `        } catch (err) {` + `
` + `          const message = "Cannot open " + url + ": " + (err.message || err);` + `
` + `          Lib.logError("Websocket: " + message, err);` + `
` + `          this._report({ kind: "error", code: "CONSTRUCT", message });` + `
` + `          return;` + `
` + `        }` + `
` + `        this._ws = ws;` + `
` + `        this._opened = false;` + `
` + `        ws.onopen = () => {` + `
` + `          if (this._ws === ws) {` + `
` + `            this._opened = true;` + `
` + `            this._failedAttempts = 0;` + `
` + `          }` + `
` + `        };` + `
` + `        ws.onmessage = (event) => {` + `
` + `          if (Lib.isDestroyed(this) || this._ws !== ws) return;` + `
` + `          if (typeof event.data !== "string") {` + `
` + `            Lib.logError("Websocket: ignored a non-text message");` + `
` + `            return;` + `
` + `          }` + `
` + `          if (!this.getProperty("checkRepeat")) this._disconnect();` + `
` + `          this._report({ kind: "message", value: event.data });` + `
` + `        };` + `
` + `        ws.onerror = () => {` + `
` + `          Lib.logError("Websocket: connection error on " + url);` + `
` + `        };` + `
` + `` + `
` + `        ws.onclose = (event) => {` + `
` + `          if (this._ws !== ws) return;` + `
` + `          this._ws = null;` + `
` + `          if (Lib.isDestroyed(this)) return;` + `
` + `          const cause = this._opened` + `
` + `            ? "Connection to " + url + " was closed"` + `
` + `            : "Connection to " + url + " could not be established";` + `
` + `          const message = event.reason ? cause + ": " + event.reason : cause;` + `
` + `          Lib.logError("Websocket (" + event.code + "): " + message);` + `
` + `          if (!this._opened) {` + `
` + `            this._failedAttempts += 1;` + `
` + `            if (this._failedAttempts >= MAX_CONNECT_ATTEMPTS) {` + `
` + `              Lib.logError(` + `
` + `                "Websocket: " +` + `
` + `                  MAX_CONNECT_ATTEMPTS +` + `
` + `                  " failed connection attempts to " +` + `
` + `                  url +` + `
` + `                  " - giving up until path or checkActive changes",` + `
` + `              );` + `
` + `            }` + `
` + `          }` + `
` + `          this._report({` + `
` + `            kind: "error",` + `
` + `            code: String(event.code),` + `
` + `            message: message,` + `
` + `          });` + `
` + `          this._scheduleReconnect();` + `
` + `        };` + `
` + `      },` + `
` + `` + `
` + `      _scheduleReconnect() {` + `
` + `        if (this._failedAttempts >= MAX_CONNECT_ATTEMPTS) return;` + `
` + `        const delay = Math.min(` + `
` + `          RECONNECT_MAX_MS,` + `
` + `          RECONNECT_BASE_MS * 2 ** this._failedAttempts,` + `
` + `        );` + `
` + `        clearTimeout(this._reconnectId);` + `
` + `        this._reconnectId = setTimeout(() => {` + `
` + `          if (Lib.isDestroyed(this)) return;` + `
` + `          if (!this.getProperty("checkActive")) return;` + `
` + `          this._connect();` + `
` + `        }, delay);` + `
` + `      },` + `
` + `      _disconnect() {` + `
` + `        const ws = this._ws;` + `
` + `        if (!ws) return;` + `
` + `        this._ws = null;` + `
` + `        ws.onopen = null;` + `
` + `        ws.onmessage = null;` + `
` + `        ws.onerror = null;` + `
` + `        ws.onclose = null;` + `
` + `        try {` + `
` + `          ws.close();` + `
` + `        } catch (err) {` + `
` + `          Lib.logError("Websocket: close failed", err);` + `
` + `        }` + `
` + `      },` + `
` + `` + `
` + `      _report(item) {` + `
` + `        if (this._queue.length >= MAX_QUEUE) {` + `
` + `          this._dropped += 1;` + `
` + `          Lib.logError(` + `
` + `            "Websocket: queue full (" +` + `
` + `              MAX_QUEUE +` + `
` + `              "), dropped " +` + `
` + `              this._dropped +` + `
` + `              " item(s) so far",` + `
` + `          );` + `
` + `          return;` + `
` + `        }` + `
` + `        this._queue.push(item);` + `
` + `        this._drain();` + `
` + `      },` + `
` + `` + `
` + `      _drain() {` + `
` + `        if (!this._queue.length) return;` + `
` + `        if (AppState.state.isBusy) {` + `
` + `          this._scheduleDrain();` + `
` + `          return;` + `
` + `        }` + `
` + `        const item = this._queue.shift();` + `
` + `        if (item.kind === "error") {` + `
` + `          this.fireError({` + `
` + `            code: item.code,` + `
` + `            message: item.message,` + `
` + `          });` + `
` + `        } else {` + `
` + `          this.setProperty("value", item.value, true);` + `
` + `          this.fireReceived();` + `
` + `        }` + `
` + `        if (this._queue.length) this._scheduleDrain();` + `
` + `      },` + `
` + `      _scheduleDrain() {` + `
` + `        clearTimeout(this._drainId);` + `
` + `        this._drainId = setTimeout(() => {` + `
` + `          if (Lib.isDestroyed(this)) return;` + `
` + `          this._drain();` + `
` + `        }, DRAIN_RETRY_MS);` + `
` + `      },` + `
` + `      renderer: {` + `
` + `        apiVersion: 2,` + `
` + `        render(oRm, oControl) {` + `
` + `          Lib.renderInvisibleSpan(oRm, oControl);` + `
` + `        },` + `
` + `      },` + `
` + `    });` + `
` + `  },` + `
` + `);` + `
` + `` + `
` + ``;
    return result;
  }
}

module.exports = z2ui5_cl_ui5f_websock_js;

