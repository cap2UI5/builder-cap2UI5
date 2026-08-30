
class z2ui5_cl_ui5f_ctrlcall_js {
  static get() {
    let result = ``;
    result = `sap.ui.define(` + `
` + `  [` + `
` + `    "sap/m/MessageBox",` + `
` + `    "sap/ui/core/BusyIndicator",` + `
` + `    "sap/ui/core/Popup",` + `
` + `    "sap/ui/model/Filter",` + `
` + `    "sap/ui/model/FilterOperator",` + `
` + `    "sap/ui/model/Sorter",` + `
` + `    "z2ui5/core/Router",` + `
` + `    "z2ui5/core/Lib",` + `
` + `    "z2ui5/core/ViewSlots",` + `
` + `    "z2ui5/core/actions/Slots",` + `
` + `  ],` + `
` + `  (` + `
` + `    MessageBox,` + `
` + `    BusyIndicator,` + `
` + `    CorePopup,` + `
` + `    Filter,` + `
` + `    FilterOperator,` + `
` + `    Sorter,` + `
` + `    Router,` + `
` + `    Lib,` + `
` + `    ViewSlots,` + `
` + `    Slots,` + `
` + `  ) => {` + `
` + `    "use strict";` + `
` + `` + `
` + `    let MessageToast;` + `
` + `    sap.ui.require(["sap/m/MessageToast"], (MT) => {` + `
` + `      MessageToast = MT;` + `
` + `    });` + `
` + `` + `
` + `    function applyToastClass(sClass) {` + `
` + `      const classes = sClass.trim().split(/\\s+/).filter(Boolean);` + `
` + `      if (!classes.length) return;` + `
` + `      const apply = () => {` + `
` + `        const toasts = document.querySelectorAll(".sapMMessageToast");` + `
` + `        const toastEl = toasts[toasts.length - 1];` + `
` + `        if (toastEl) toastEl.classList.add(...classes);` + `
` + `        return Boolean(toastEl);` + `
` + `      };` + `
` + `      if (!apply()) requestAnimationFrame(apply);` + `
` + `    }` + `
` + `` + `
` + `    function showToast(sText, mOptions, oController) {` + `
` + `      const o = { ...(mOptions || {}) };` + `
` + `      const sClass = o.class;` + `
` + `      delete o.class;` + `
` + `      if (o.onClose) {` + `
` + `        const sEvent = o.onClose;` + `
` + `        o.onClose = () => oController.eB([sEvent]);` + `
` + `      }` + `
` + `      const doShow = (MT) => {` + `
` + `        if (Object.keys(o).length) MT.show(sText, o);` + `
` + `        else MT.show(sText);` + `
` + `        if (sClass) applyToastClass(sClass);` + `
` + `      };` + `
` + `      if (MessageToast) doShow(MessageToast);` + `
` + `      else sap.ui.require(["sap/m/MessageToast"], doShow);` + `
` + `    }` + `
` + `` + `
` + `    function showBox(sType, sText, mOptions, oController) {` + `
` + `      const o = { ...(mOptions || {}) };` + `
` + `      if (o.onClose) {` + `
` + `        const sEvent = o.onClose;` + `
` + `        o.onClose = (sAction) => oController.eB([sEvent], sAction);` + `
` + `      }` + `
` + `      if (o.details) o.details = Lib.sanitizeMessageDetails(o.details);` + `
` + `      if (o.dependentOn) {` + `
` + `        const oDependentOn = ViewSlots.resolveById(o.dependentOn);` + `
` + `        if (oDependentOn) o.dependentOn = oDependentOn;` + `
` + `        else delete o.dependentOn;` + `
` + `      }` + `
` + `` + `
` + `      let showFn = MessageBox[sType];` + `
` + `      if (typeof showFn !== "function") {` + `
` + `        Lib.logError(` + `
` + `          \`ControlCall: unknown message box type '\${sType}', shown via show()\`,` + `
` + `        );` + `
` + `        showFn = MessageBox.show;` + `
` + `      }` + `
` + `` + `
` + `      if (Object.keys(o).length) showFn(sText, o);` + `
` + `      else showFn(sText);` + `
` + `    }` + `
` + `` + `
` + `    const CONTROL_METHODS = {` + `
` + `      to: ["pageId", "string"],` + `
` + `      back: [],` + `
` + `` + `
` + `      backToPage: ["pageId"],` + `
` + `      toDetail: ["controlId"],` + `
` + `      toMaster: ["controlId"],` + `
` + `      backDetail: [],` + `
` + `      backMaster: [],` + `
` + `      setMode: ["string"],` + `
` + `      navigateBack: [],` + `
` + `      focus: [],` + `
` + `      scrollToIndex: ["int"],` + `
` + `      scrollTo: ["int", "int"],` + `
` + `      open: ["string"],` + `
` + `      close: [],` + `
` + `      setExpanded: ["bool"],` + `
` + `      discardProgress: ["controlId"],` + `
` + `      setNextStep: ["controlId"],` + `
` + `      goToStep: ["controlId", "bool"],` + `
` + `      openBy: ["anchor"],` + `
` + `      toggleBy: ["anchor"],` + `
` + `      setActivePage: ["controlId"],` + `
` + `      expandToLevel: ["int"],` + `
` + `      collapseAll: [],` + `
` + `      expandSelected: [],` + `
` + `      collapseSelected: [],` + `
` + `      setHiddenInPopin: ["object"],` + `
` + `      setSticky: ["object"],` + `
` + `      setSelectedSection: ["controlIdOrNull"],` + `
` + `      setSelectedItem: ["controlIdOrNull"],` + `
` + `      setP13nData: ["object"],` + `
` + `` + `
` + `      setBadgeMinValue: ["int"],` + `
` + `      setBadgeMaxValue: ["int"],` + `
` + `` + `
` + `      css: ["string", "string"],` + `
` + `      enablePostButton: ["bool"],` + `
` + `      addStyleClass: ["string"],` + `
` + `      removeStyleClass: ["string"],` + `
` + `      toggleStyleClass: ["string"],` + `
` + `      setAsyncURLHandler: ["string"],` + `
` + `    };` + `
` + `` + `
` + `    Object.setPrototypeOf(CONTROL_METHODS, null);` + `
` + `` + `
` + `    const URL_POLICIES = {` + `
` + `      ALLOW_ALL: () => true,` + `
` + `` + `
` + `      RELATIVE_ONLY: (url) => !isAbsoluteUrl(url),` + `
` + `      DENY_ALL: () => false,` + `
` + `    };` + `
` + `` + `
` + `    const CSS_PROPERTIES = [` + `
` + `      "width",` + `
` + `      "min-width",` + `
` + `      "max-width",` + `
` + `      "height",` + `
` + `      "min-height",` + `
` + `      "max-height",` + `
` + `      "color",` + `
` + `      "background-color",` + `
` + `      "font-size",` + `
` + `      "opacity",` + `
` + `    ];` + `
` + `` + `
` + `    function isAbsoluteUrl(url) {` + `
` + `      const s = String(url ?? "").trim();` + `
` + `` + `
` + `      return /^[a-z][a-z0-9+.-]*:/i.test(s) || s.startsWith("//");` + `
` + `    }` + `
` + `` + `
` + `    const CONTROL_METHOD_DENY_EXACT = [` + `
` + `      "destroy",` + `
` + `      "exit",` + `
` + `      "fireEvent",` + `
` + `      "clone",` + `
` + `      "applySettings",` + `
` + `      "setAggregation",` + `
` + `      "addAggregation",` + `
` + `      "insertAggregation",` + `
` + `      "removeAggregation",` + `
` + `      "removeAllAggregation",` + `
` + `      "destroyAggregation",` + `
` + `      "setAssociation",` + `
` + `      "addAssociation",` + `
` + `      "removeAssociation",` + `
` + `      "removeAllAssociation",` + `
` + `    ];` + `
` + `` + `
` + `    const CONTROL_METHOD_DENY_PREFIXES = [` + `
` + `      "_",` + `
` + `      "bind",` + `
` + `      "unbind",` + `
` + `      "attach",` + `
` + `      "detach",` + `
` + `      "addDependent",` + `
` + `      "placeAt",` + `
` + `      "rerender",` + `
` + `      "invalidate",` + `
` + `      "setModel",` + `
` + `      "setBinding",` + `
` + `      "setParent",` + `
` + `    ];` + `
` + `` + `
` + `    const CONTROL_METHOD_DENY = new RegExp(` + `
` + `      "^(" + CONTROL_METHOD_DENY_PREFIXES.join("|") + ")",` + `
` + `    );` + `
` + `` + `
` + `    const CONTROL_METHOD_DENY_SET = new Set(CONTROL_METHOD_DENY_EXACT);` + `
` + `` + `
` + `    function isSafeControlMethod(method) {` + `
` + `      return (` + `
` + `        typeof method === "string" &&` + `
` + `        method.length > 0 &&` + `
` + `        !CONTROL_METHOD_DENY_SET.has(method) &&` + `
` + `        !CONTROL_METHOD_DENY.test(method)` + `
` + `      );` + `
` + `    }` + `
` + `` + `
` + `    const GLOBAL_TARGETS = {` + `
` + `      MESSAGE_TOAST: {` + `
` + `        get: () => MessageToast,` + `
` + `        methods: { show: ["string"] },` + `
` + `        display: (oController, method, aArgs, mOptions) =>` + `
` + `          showToast(aArgs[0], mOptions, oController),` + `
` + `      },` + `
` + `      MESSAGE_BOX: {` + `
` + `        get: () => MessageBox,` + `
` + `` + `
` + `        methods: {` + `
` + `          show: ["string"],` + `
` + `          alert: ["string"],` + `
` + `          confirm: ["string"],` + `
` + `          information: ["string"],` + `
` + `          warning: ["string"],` + `
` + `          error: ["string"],` + `
` + `          success: ["string"],` + `
` + `        },` + `
` + `        display: (oController, method, aArgs, mOptions) =>` + `
` + `          showBox(method, aArgs[0], mOptions, oController),` + `
` + `      },` + `
` + `` + `
` + `      VIEW_SLOTS: {` + `
` + `        get: () => ViewSlots,` + `
` + `` + `
` + `        methods: {` + `
` + `          destroy: ["string"],` + `
` + `          display: ["string", "string"],` + `
` + `` + `
` + `          updateModel: [],` + `
` + `        },` + `
` + `        display: (oController, method, aArgs, mOptions, ctx) =>` + `
` + `          Slots.action(method, aArgs[0], aArgs[1], mOptions, ctx?.seq),` + `
` + `      },` + `
` + `` + `
` + `      ROUTER: {` + `
` + `        get: () => Router,` + `
` + `        methods: { sync: [] },` + `
` + `        display: (oController, method, aArgs, mOptions, ctx) => {` + `
` + `          if (ctx?.response) ctx.response._routerOptions = mOptions;` + `
` + `          else Router.sync(mOptions);` + `
` + `        },` + `
` + `      },` + `
` + `      BUSY_INDICATOR: {` + `
` + `        get: () => BusyIndicator,` + `
` + `        methods: { show: ["int"], hide: [] },` + `
` + `      },` + `
` + `` + `
` + `      ICON_POOL: {` + `
` + `        get: () => sap.ui.require("sap/ui/core/IconPool"),` + `
` + `        methods: { registerFont: ["string", "string"] },` + `
` + `        display: (oController, method, aArgs) =>` + `
` + `          registerIconFont(aArgs[0], aArgs[1]),` + `
` + `      },` + `
` + `` + `
` + `      THEMING: {` + `
` + `        get: () => sap.ui.require("sap/ui/core/Theming"),` + `
` + `        methods: { setTheme: ["string"] },` + `
` + `      },` + `
` + `` + `
` + `      POPUP: {` + `
` + `        get: () => CorePopup,` + `
` + `        methods: { setWithinArea: ["within"] },` + `
` + `      },` + `
` + `` + `
` + `      INVISIBLE_MESSAGE: {` + `
` + `        get: () => {` + `
` + `          const IM = sap.ui.require("sap/ui/core/InvisibleMessage");` + `
` + `          return IM ? IM.getInstance() : undefined;` + `
` + `        },` + `
` + `        methods: { announce: ["string", "string"] },` + `
` + `      },` + `
` + `` + `
` + `      FORMATTING: {` + `
` + `        get: () => sap.ui.require("sap/base/i18n/Formatting"),` + `
` + `        methods: {` + `
` + `          setCustomCurrencies: ["object"],` + `
` + `          addCustomCurrencies: ["object"],` + `
` + `        },` + `
` + `      },` + `
` + `    };` + `
` + `` + `
` + `    Object.setPrototypeOf(GLOBAL_TARGETS, null);` + `
` + `` + `
` + `    const AGG_ITEM = /^([^/]+)\\/([A-Za-z_][\\w]*)\\/(\\d+)$/;` + `
` + `` + `
` + `    function resolveControl(raw, view) {` + `
` + `      const byId = (id) =>` + `
` + `        (view && ViewSlots.byId(view.toUpperCase(), id)) ||` + `
` + `        ViewSlots.resolveById(id);` + `
` + `` + `
` + `      const m = AGG_ITEM.exec(String(raw ?? ""));` + `
` + `      if (!m) return byId(raw);` + `
` + `` + `
` + `      const owner = byId(m[1]);` + `
` + `      if (!owner || typeof owner.getAggregation !== "function") {` + `
` + `        Lib.logError(\`aggregation item '\${raw}': no control '\${m[1]}'\`);` + `
` + `        return null;` + `
` + `      }` + `
` + `      const items = owner.getAggregation(m[2]);` + `
` + `      if (!Array.isArray(items)) {` + `
` + `        Lib.logError(` + `
` + `          \`aggregation item '\${raw}': '\${m[2]}' is no multiple aggregation of \${m[1]}\`,` + `
` + `        );` + `
` + `        return null;` + `
` + `      }` + `
` + `      const item = items[Number(m[3])];` + `
` + `      if (!item) {` + `
` + `        Lib.logError(` + `
` + `          \`aggregation item '\${raw}': \${m[2]} has \${items.length} item(s)\`,` + `
` + `        );` + `
` + `        return null;` + `
` + `      }` + `
` + `      return item;` + `
` + `    }` + `
` + `` + `
` + `    function castArg(kind, raw, view) {` + `
` + `      switch (kind) {` + `
` + `        case "int":` + `
` + `          return Number(raw);` + `
` + `        case "bool":` + `
` + `          return raw === "true" || raw === "X" || raw === true;` + `
` + `        case "controlId":` + `
` + `          return resolveControl(raw, view);` + `
` + `        case "pageId": {` + `
` + `          const page = resolveControl(raw, view);` + `
` + `          if (page && typeof page.getId === "function") return page.getId();` + `
` + `` + `
` + `          Lib.logError(` + `
` + `            \`CONTROL_CALL: no control '\${raw}' for the page argument\`,` + `
` + `          );` + `
` + `          return raw;` + `
` + `        }` + `
` + `        case "controlIdOrNull":` + `
` + `          if (raw === "" || raw === undefined || raw === null) return null;` + `
` + `          return resolveControl(raw, view) || null;` + `
` + `        case "anchor":` + `
` + `          return resolveControl(raw, view);` + `
` + `        case "within":` + `
` + `          if (raw === "" || raw === undefined || raw === null) return null;` + `
` + `          return resolveControl(raw, view) || null;` + `
` + `        case "object":` + `
` + `          if (raw && typeof raw === "object") return raw;` + `
` + `          try {` + `
` + `            return JSON.parse(raw);` + `
` + `          } catch {` + `
` + `            Lib.logError(\`CONTROL_CALL: malformed object argument '\${raw}'\`);` + `
` + `            return {};` + `
` + `          }` + `
` + `        default:` + `
` + `          return raw;` + `
` + `      }` + `
` + `    }` + `
` + `` + `
` + `    function castArgAuto(raw) {` + `
` + `      if (raw === "X" || raw === "true") return true;` + `
` + `      if (raw === "" || raw === " " || raw === "false") return false;` + `
` + `      return raw;` + `
` + `    }` + `
` + `` + `
` + `    function setsStringProperty(control, method) {` + `
` + `      if (!control || typeof method !== "string" || !/^set[A-Z]/.test(method))` + `
` + `        return false;` + `
` + `      const prop = control.getMetadata?.()?.getAllProperties?.()[` + `
` + `        method.charAt(3).toLowerCase() + method.slice(4)` + `
` + `      ];` + `
` + `      return !!prop && prop.type === "string";` + `
` + `    }` + `
` + `` + `
` + `    const NULLABLE_KINDS = ["controlIdOrNull"];` + `
` + `` + `
` + `    function castArgs(kinds, rawArgs, view, target) {` + `
` + `      if (kinds === null) {` + `
` + `        const keepString = setsStringProperty(target?.control, target?.method);` + `
` + `        return rawArgs.map((raw, i) =>` + `
` + `          i === 0 && keepString ? raw : castArgAuto(raw),` + `
` + `        );` + `
` + `      }` + `
` + `` + `
` + `      let count = rawArgs.length;` + `
` + `      while (count < kinds.length && NULLABLE_KINDS.includes(kinds[count]))` + `
` + `        count++;` + `
` + `      return kinds` + `
` + `        .slice(0, count)` + `
` + `        .map((kind, i) => castArg(kind, rawArgs[i], view));` + `
` + `    }` + `
` + `` + `
` + `    const registeredIconFonts = new Set();` + `
` + `` + `
` + `    function registerIconFont(fontFamily, fontURI) {` + `
` + `      const IconPool = sap.ui.require("sap/ui/core/IconPool");` + `
` + `      if (!IconPool) {` + `
` + `        Lib.logError("ICON_POOL: sap/ui/core/IconPool is not loaded");` + `
`;
    result = result + `        return;` + `
` + `      }` + `
` + `      if (!fontFamily || !fontURI) {` + `
` + `        Lib.logError(` + `
` + `          "ICON_POOL: registerFont needs a fontFamily AND a fontURI",` + `
` + `        );` + `
` + `        return;` + `
` + `      }` + `
` + `      if (registeredIconFonts.has(fontFamily)) return;` + `
` + `` + `
` + `      const uri = /^(?:[a-z]+:)?\\/\\//i.test(fontURI)` + `
` + `        ? fontURI` + `
` + `        : sap.ui.require.toUrl(fontURI);` + `
` + `      IconPool.registerFont({ fontFamily, fontURI: uri });` + `
` + `      registeredIconFonts.add(fontFamily);` + `
` + `    }` + `
` + `` + `
` + `    function selectedIndicesOf(control) {` + `
` + `      if (typeof control.getSelectedIndices === "function") {` + `
` + `        return control.getSelectedIndices();` + `
` + `      }` + `
` + `      if (` + `
` + `        typeof control.getSelectedItems === "function" &&` + `
` + `        typeof control.indexOfItem === "function"` + `
` + `      ) {` + `
` + `        return control` + `
` + `          .getSelectedItems()` + `
` + `          .map((item) => control.indexOfItem(item))` + `
` + `          .filter((i) => i >= 0);` + `
` + `      }` + `
` + `      return null;` + `
` + `    }` + `
` + `` + `
` + `    function whenAnchorRendered(anchor, oController, fn) {` + `
` + `      if (anchor && typeof anchor.getDomRef === "function") {` + `
` + `        Lib.whenRendered(anchor, oController, fn);` + `
` + `      } else {` + `
` + `        fn();` + `
` + `      }` + `
` + `    }` + `
` + `` + `
` + `    function evControlCallById(oController, args) {` + `
` + `      const [, id, view, method] = args;` + `
` + `      let kinds = CONTROL_METHODS[method];` + `
` + `      if (!kinds) {` + `
` + `        if (!isSafeControlMethod(method)) {` + `
` + `          Lib.logError(\`CONTROL_BY_ID: method '\${method}' not allowed\`);` + `
` + `          return;` + `
` + `        }` + `
` + `        kinds = null;` + `
` + `      }` + `
` + `` + `
` + `      const control = view` + `
` + `        ? (ViewSlots.byId(view.toUpperCase(), id) ?? ViewSlots.resolveById(id))` + `
` + `        : ViewSlots.resolveById(id);` + `
` + `` + `
` + `      if (method === "toggleBy") {` + `
` + `        if (!control || typeof control.openBy !== "function") {` + `
` + `          Lib.logError(` + `
` + `            \`CONTROL_BY_ID: 'toggleBy' not callable on control '\${id}'\`,` + `
` + `          );` + `
` + `          return;` + `
` + `        }` + `
` + `        const anchor = castArgs(kinds, args.slice(4), view)[0];` + `
` + `` + `
` + `        whenAnchorRendered(anchor, oController, () => {` + `
` + `          if (control.isOpen?.()) control.close();` + `
` + `          else control.openBy(anchor);` + `
` + `        });` + `
` + `        return;` + `
` + `      }` + `
` + `` + `
` + `      if (method === "css") {` + `
` + `        const prop = String(args[4] ?? "").toLowerCase();` + `
` + `        if (!CSS_PROPERTIES.includes(prop)) {` + `
` + `          Lib.logError(` + `
` + `            \`CONTROL_BY_ID: css property '\${args[4]}' not allowed (allowed: \${CSS_PROPERTIES.join(", ")})\`,` + `
` + `          );` + `
` + `          return;` + `
` + `        }` + `
` + `        const el = control?.getDomRef?.();` + `
` + `        if (!el) {` + `
` + `          Lib.logError(\`CONTROL_BY_ID: 'css' - control '\${id}' has no DOM ref\`);` + `
` + `          return;` + `
` + `        }` + `
` + `        el.style.setProperty(prop, String(args[5] ?? ""));` + `
` + `        return;` + `
` + `      }` + `
` + `` + `
` + `      if (method === "expandSelected" || method === "collapseSelected") {` + `
` + `        const op = method === "expandSelected" ? "expand" : "collapse";` + `
` + `        if (!control || typeof control[op] !== "function") {` + `
` + `          Lib.logError(` + `
` + `            \`CONTROL_BY_ID: '\${method}' not callable on control '\${id}'\`,` + `
` + `          );` + `
` + `          return;` + `
` + `        }` + `
` + `        const indices = selectedIndicesOf(control);` + `
` + `        if (indices === null) {` + `
` + `          Lib.logError(` + `
` + `            \`CONTROL_BY_ID: '\${method}' - control '\${id}' exposes no selection\`,` + `
` + `          );` + `
` + `          return;` + `
` + `        }` + `
` + `` + `
` + `        if (indices.length) control[op](indices);` + `
` + `        return;` + `
` + `      }` + `
` + `` + `
` + `      if (method === "setAsyncURLHandler") {` + `
` + `        const policy = String(args[4] ?? "").toUpperCase();` + `
` + `        const isAllowed = URL_POLICIES[policy];` + `
` + `        if (!isAllowed) {` + `
` + `          Lib.logError(` + `
` + `            \`CONTROL_BY_ID: unknown URL policy '\${args[4]}' (allowed: \${Object.keys(URL_POLICIES).join(", ")})\`,` + `
` + `          );` + `
` + `          return;` + `
` + `        }` + `
` + `        if (!control || typeof control.setAsyncURLHandler !== "function") {` + `
` + `          Lib.logError(` + `
` + `            \`CONTROL_BY_ID: 'setAsyncURLHandler' not callable on control '\${id}'\`,` + `
` + `          );` + `
` + `          return;` + `
` + `        }` + `
` + `        control.setAsyncURLHandler((config) => {` + `
` + `          config?.promise?.resolve({` + `
` + `            allowed: isAllowed(config.url),` + `
` + `            id: config.id,` + `
` + `          });` + `
` + `        });` + `
` + `        return;` + `
` + `      }` + `
` + `` + `
` + `      if (method === "openBy") {` + `
` + `        if (` + `
` + `          !control ||` + `
` + `          (typeof control.openBy !== "function" &&` + `
` + `            typeof control.open !== "function")` + `
` + `        ) {` + `
` + `          Lib.logError(` + `
` + `            \`CONTROL_BY_ID: 'openBy' not callable on control '\${id}'\`,` + `
` + `          );` + `
` + `          return;` + `
` + `        }` + `
` + `        const anchor = castArgs(kinds, args.slice(4), view)[0];` + `
` + `` + `
` + `        whenAnchorRendered(anchor, oController, () => {` + `
` + `          if (typeof control.openBy === "function") control.openBy(anchor);` + `
` + `          else control.open(false, anchor, "begin top", "begin bottom", anchor);` + `
` + `        });` + `
` + `        return;` + `
` + `      }` + `
` + `      if (!control || typeof control[method] !== "function") {` + `
` + `        Lib.logError(` + `
` + `          \`CONTROL_BY_ID: '\${method}' not callable on control '\${id}'\`,` + `
` + `        );` + `
` + `        return;` + `
` + `      }` + `
` + `      control[method](` + `
` + `        ...castArgs(kinds, args.slice(4), view, { control, method }),` + `
` + `      );` + `
` + `    }` + `
` + `` + `
` + `    function evControlCall(oController, args, ctx) {` + `
` + `      const [, name, method] = args;` + `
` + `      const target = GLOBAL_TARGETS[name];` + `
` + `      const kinds = target?.methods[method];` + `
` + `      if (!kinds) {` + `
` + `        Lib.logError(\`CONTROL_GLOBAL: '\${name}.\${method}' not allowed\`);` + `
` + `        return;` + `
` + `      }` + `
` + `      const obj = target.get();` + `
` + `      if (!obj) {` + `
` + `        Lib.logError(\`CONTROL_GLOBAL: '\${name}.\${method}' not available\`);` + `
` + `        return;` + `
` + `      }` + `
` + `      let raw = args.slice(3);` + `
` + `` + `
` + `      let mOptions;` + `
` + `      if (target.display) {` + `
` + `        const last = raw[raw.length - 1];` + `
` + `        if (last && typeof last === "object") {` + `
` + `          mOptions = last;` + `
` + `          raw = raw.slice(0, -1);` + `
` + `        }` + `
` + `      }` + `
` + `` + `
` + `      if (kinds.length === 1 && kinds[0] === "string" && raw.length > 1) {` + `
` + `        raw = [formatTemplate(String(raw[0]), raw.slice(1))];` + `
` + `      }` + `
` + `` + `
` + `      if (target.display) {` + `
` + `        return target.display(oController, method, raw, mOptions || {}, ctx);` + `
` + `      }` + `
` + `      if (typeof obj[method] !== "function") {` + `
` + `        Lib.logError(\`CONTROL_GLOBAL: '\${name}.\${method}' not available\`);` + `
` + `        return;` + `
` + `      }` + `
` + `      obj[method](...castArgs(kinds, raw));` + `
` + `    }` + `
` + `` + `
` + `    function formatTemplate(tpl, values) {` + `
` + `      return tpl.replace(` + `
` + `        /\\{(\\d+)(?:\\?([^:}]*):([^}]*))?\\}/g,` + `
` + `        (m, i, tText, fText) => {` + `
` + `          const n = Number(i);` + `
` + `          if (n >= values.length) return m;` + `
` + `          const v = String(values[n]);` + `
` + `          if (tText === undefined) return v;` + `
` + `          const truthy = v !== "" && !/^(false|0|undefined|null)$/i.test(v);` + `
` + `          return truthy ? tText : fText;` + `
` + `        },` + `
` + `      );` + `
` + `    }` + `
` + `` + `
` + `    const FILTER_OPERATORS = new Set([` + `
` + `      "BT",` + `
` + `      "Contains",` + `
` + `      "EndsWith",` + `
` + `      "EQ",` + `
` + `      "GE",` + `
` + `      "GT",` + `
` + `      "LE",` + `
` + `      "LT",` + `
` + `      "NB",` + `
` + `      "NE",` + `
` + `      "NotContains",` + `
` + `      "NotEndsWith",` + `
` + `      "NotStartsWith",` + `
` + `      "StartsWith",` + `
` + `    ]);` + `
` + `` + `
` + `    const isEmpty = (v) => v == null || v === "";` + `
` + `` + `
` + `    function buildFilterGroups(binding, json) {` + `
` + `      let groups = json;` + `
` + `      if (typeof json === "string") {` + `
` + `        try {` + `
` + `          groups = JSON.parse(json);` + `
` + `        } catch {` + `
` + `          Lib.logError("BINDING_CALL: malformed filter groups JSON");` + `
` + `          return;` + `
` + `        }` + `
` + `      }` + `
` + `      if (!Array.isArray(groups)) {` + `
` + `        Lib.logError("BINDING_CALL: filter groups must be an array");` + `
` + `        return;` + `
` + `      }` + `
` + `      groups = groups.filter((g) => Array.isArray(g) && g.length);` + `
` + `      if (!groups.length) {` + `
` + `        binding.filter([]);` + `
` + `        return;` + `
` + `      }` + `
` + `      const outer = [];` + `
` + `      for (const group of groups) {` + `
` + `        const inner = [];` + `
` + `        for (const row of group) {` + `
` + `          const [path, operator, value1, value2] = Array.isArray(row)` + `
` + `            ? row` + `
` + `            : [];` + `
` + `          if (typeof path !== "string" || !FILTER_OPERATORS.has(operator)) {` + `
` + `            Lib.logError(` + `
` + `              \`BINDING_CALL: bad filter row (path '\${path}' / operator '\${operator}')\`,` + `
` + `            );` + `
` + `            return;` + `
` + `          }` + `
` + `          inner.push(` + `
` + `            new Filter(path, FilterOperator[operator], value1, value2),` + `
` + `          );` + `
` + `        }` + `
` + `        outer.push(new Filter(inner, false));` + `
` + `      }` + `
` + `      binding.filter([new Filter(outer, true)]);` + `
` + `    }` + `
` + `` + `
` + `    const BINDING_METHODS = {` + `
` + `      filter(binding, params) {` + `
` + `        const [path, operator, value1, value2] = params;` + `
` + `` + `
` + `        if (` + `
` + `          params.length === 1 &&` + `
` + `          (Array.isArray(path) ||` + `
` + `            (typeof path === "string" && path.trimStart().startsWith("[")))` + `
` + `        ) {` + `
` + `          buildFilterGroups(binding, path);` + `
` + `          return;` + `
` + `        }` + `
` + `` + `
` + `        if (isEmpty(value1) && isEmpty(value2)) {` + `
` + `          binding.filter([]);` + `
` + `          return;` + `
` + `        }` + `
` + `        if (!FILTER_OPERATORS.has(operator)) {` + `
` + `          Lib.logError(\`BINDING_CALL: operator '\${operator}' not allowed\`);` + `
` + `          return;` + `
` + `        }` + `
` + `        binding.filter([` + `
` + `          new Filter(path, FilterOperator[operator], value1, value2),` + `
` + `        ]);` + `
` + `      },` + `
` + `      sort(binding, [path, descending, group]) {` + `
` + `        binding.sort([` + `
` + `          new Sorter(path, castArg("bool", descending), castArg("bool", group)),` + `
` + `        ]);` + `
` + `      },` + `
` + `    };` + `
` + `` + `
` + `    Object.setPrototypeOf(BINDING_METHODS, null);` + `
` + `` + `
` + `    function evBindingCall(oController, args) {` + `
` + `      const [, id, aggregation, method] = args;` + `
` + `      const build = BINDING_METHODS[method];` + `
` + `      if (!build) {` + `
` + `        Lib.logError(\`BINDING_CALL: method '\${method}' not allowed\`);` + `
` + `        return;` + `
` + `      }` + `
` + `      const binding = ViewSlots.resolveById(id)?.getBinding?.(aggregation);` + `
` + `      if (!binding || typeof binding[method] !== "function") {` + `
` + `        Lib.logError(` + `
` + `          \`BINDING_CALL: no '\${aggregation}' binding with '\${method}' on control '\${id}'\`,` + `
` + `        );` + `
` + `        return;` + `
` + `      }` + `
` + `      build(binding, args.slice(4));` + `
` + `    }` + `
` + `` + `
` + `    const handlers = {` + `
` + `      CONTROL_BY_ID: evControlCallById,` + `
` + `      CONTROL_GLOBAL: evControlCall,` + `
` + `      BINDING_CALL: evBindingCall,` + `
` + `    };` + `
` + `` + `
` + `    for (const name of Object.keys(GLOBAL_TARGETS)) {` + `
` + `      handlers[name] = (oController, args, ctx) =>` + `
` + `        evControlCall(oController, ["CONTROL_GLOBAL", ...args], ctx);` + `
` + `    }` + `
` + `` + `
` + `    return { handlers };` + `
` + `  },` + `
` + `);` + `
` + `` + `
` + ``;
    return result;
  }
}

module.exports = z2ui5_cl_ui5f_ctrlcall_js;

