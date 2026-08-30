
class z2ui5_cl_ui5f_msgmgr_js {
  static get() {
    let result = ``;
    result = `sap.ui.define(` + `
` + `  [` + `
` + `    "sap/ui/core/Control",` + `
` + `    "sap/ui/core/message/Message",` + `
` + `    "z2ui5/core/Lib",` + `
` + `    "z2ui5/core/ViewSlots",` + `
` + `  ],` + `
` + `  (Control, Message, Lib, ViewSlots) => {` + `
` + `    "use strict";` + `
` + `` + `
` + `    const KEY_SEP = String.fromCharCode(1);` + `
` + `    const keyOf = (o) =>` + `
` + `      [o.MESSAGE ?? o.message, o.TYPE ?? o.type, o.TARGET ?? o.target].join(` + `
` + `        KEY_SEP,` + `
` + `      );` + `
` + `` + `
` + `    return Control.extend("z2ui5.cc.MessageManager", {` + `
` + `      metadata: {` + `
` + `        properties: {` + `
` + `          items: { type: "object" },` + `
` + `          checkInit: { type: "boolean", defaultValue: false },` + `
` + `        },` + `
` + `        events: {` + `
` + `          change: { allowPreventDefault: true, parameters: {} },` + `
` + `        },` + `
` + `      },` + `
` + `` + `
` + `      init() {` + `
` + `        this._added = new Map();` + `
` + `        this._ready = false;` + `
` + `        this._unhook = Lib.hookCallback(this, "onAfterRendering", "setup");` + `
` + `      },` + `
` + `      exit() {` + `
` + `        this._unhook();` + `
` + `` + `
` + `        if (this._added.size && this._messaging) {` + `
` + `          this._messaging.removeMessages([...this._added.values()]);` + `
` + `        }` + `
` + `        this._added.clear();` + `
` + `      },` + `
` + `      renderer: Lib.EMPTY_RENDERER,` + `
` + `` + `
` + `      setup() {` + `
` + `        if (this.getProperty("checkInit")) return;` + `
` + `        const messaging = Lib.getMessaging?.();` + `
` + `        if (!messaging) return;` + `
` + `        this.setProperty("checkInit", true, true);` + `
` + `        this._messaging = messaging;` + `
` + `        const view = ViewSlots.getView(` + `
` + `          ViewSlots.containingSlotKey(this) ?? "MAIN",` + `
` + `        );` + `
` + `        this._processor = view?.getModel?.() ?? null;` + `
` + `        this._ready = true;` + `
` + `` + `
` + `        this.reconcile();` + `
` + `      },` + `
` + `` + `
` + `      setItems(aItems) {` + `
` + `        this.setProperty("items", aItems, true);` + `
` + `        if (this._ready) this.reconcile();` + `
` + `        return this;` + `
` + `      },` + `
` + `` + `
` + `      reconcile() {` + `
` + `        const rows = this.getProperty("items") || [];` + `
` + `        const wanted = new Map(rows.map((r) => [keyOf(r), r]));` + `
` + `` + `
` + `        let changed = false;` + `
` + `` + `
` + `        for (const [key, oMessage] of this._added) {` + `
` + `          if (!wanted.has(key)) {` + `
` + `            this._messaging.removeMessages(oMessage);` + `
` + `            this._added.delete(key);` + `
` + `            changed = true;` + `
` + `          }` + `
` + `        }` + `
` + `` + `
` + `        for (const [key, r] of wanted) {` + `
` + `          if (this._added.has(key)) continue;` + `
` + `          changed = true;` + `
` + `          const oMessage = new Message({` + `
` + `            message: r.MESSAGE ?? "",` + `
` + `            description: r.DESCRIPTION ?? "",` + `
` + `            type: r.TYPE ?? "Error",` + `
` + `            target: r.TARGET ?? "",` + `
` + `            additionalText: r.ADDITIONALTEXT ?? "",` + `
` + `` + `
` + `            code: r.CODE ?? "",` + `
` + `            processor: this._processor,` + `
` + `          });` + `
` + `          this._messaging.addMessages(oMessage);` + `
` + `          this._added.set(key, oMessage);` + `
` + `        }` + `
` + `        if (changed) this.fireChange();` + `
` + `      },` + `
` + `    });` + `
` + `  },` + `
` + `);` + `
` + `` + `
` + ``;
    return result;
  }
}

module.exports = z2ui5_cl_ui5f_msgmgr_js;

