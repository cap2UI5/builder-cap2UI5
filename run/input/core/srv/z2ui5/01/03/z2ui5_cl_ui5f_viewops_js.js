
class z2ui5_cl_ui5f_viewops_js {
  static get() {
    let result = ``;
    result = `sap.ui.define(` + `
` + `  [` + `
` + `    "sap/ui/model/odata/v2/ODataModel",` + `
` + `    "z2ui5/core/Lib",` + `
` + `    "z2ui5/core/ViewSlots",` + `
` + `    "z2ui5/core/AppState",` + `
` + `  ],` + `
` + `  (ODataModel, Lib, ViewSlots, AppState) => {` + `
` + `    "use strict";` + `
` + `` + `
` + `    const SMOOTH_SCROLL_MS = 300;` + `
` + `` + `
` + `    function evSetSizeLimit(oController, args) {` + `
` + `      const hasLimit = args[2] !== undefined && args[2] !== "";` + `
` + `      const viewKey = hasLimit ? args[2] : args[1];` + `
` + `      const limit = hasLimit ? Number(args[1]) : NaN;` + `
` + `` + `
` + `      const isValidLimit = Number.isFinite(limit) && limit > 0;` + `
` + `      if (isValidLimit) {` + `
` + `        AppState.state.viewSizeLimits[viewKey] = limit;` + `
` + `      } else {` + `
` + `        delete AppState.state.viewSizeLimits[viewKey];` + `
` + `      }` + `
` + `` + `
` + `      const modelKey = Lib.isRootModelSlot(viewKey) ? "MAIN" : viewKey;` + `
` + `` + `
` + `      const view = ViewSlots.getView(modelKey);` + `
` + `      const model = view` + `
` + `        ? (ViewSlots.trackedModel(view) ?? view.getModel())` + `
` + `        : undefined;` + `
` + `      if (model) {` + `
` + `        const effective = Lib.effectiveSizeLimit(` + `
` + `          AppState.state.viewSizeLimits,` + `
` + `          viewKey,` + `
` + `        );` + `
` + `` + `
` + `        model.setSizeLimit(effective ?? 100);` + `
` + `        model.refresh(true);` + `
` + `      }` + `
` + `    }` + `
` + `` + `
` + `    function evSetODataModel(oController, args) {` + `
` + `      let oModel;` + `
` + `      try {` + `
` + `        oModel = new ODataModel({` + `
` + `          serviceUrl: args[1],` + `
` + `          annotationURI: args[3] || "",` + `
` + `        });` + `
` + `        const oView = ViewSlots.getView("MAIN");` + `
` + `        if (oView) {` + `
` + `          const name = args[2] || undefined;` + `
` + `` + `
` + `          const previous = oView.getModel(name);` + `
` + `          oModel._z2ui5OwnedOData = true;` + `
` + `          oView.setModel(oModel, name);` + `
` + `          if (previous?._z2ui5OwnedOData && previous !== oModel) {` + `
` + `            previous.destroy();` + `
` + `          }` + `
` + `        } else {` + `
` + `          oModel.destroy();` + `
` + `        }` + `
` + `      } catch (e) {` + `
` + `        Lib.logError(\`SET_ODATA_MODEL: failed for '\${args[1]}'\`, e);` + `
` + `` + `
` + `        oModel?.destroy?.();` + `
` + `      }` + `
` + `    }` + `
` + `` + `
` + `    function evBindElement(oController, args) {` + `
` + `      const slot = args[1] || "MAIN";` + `
` + `      const view = ViewSlots.getView(slot);` + `
` + `      if (!view) {` + `
` + `        Lib.logError(\`BIND_ELEMENT: no view for slot '\${slot}'\`);` + `
` + `        return;` + `
` + `      }` + `
` + `      const path = String(args[3] ?? "").replace(/[{}]/g, "");` + `
` + `      if (!path) {` + `
` + `        Lib.logError("BIND_ELEMENT: empty binding path");` + `
` + `        return;` + `
` + `      }` + `
` + `      view.bindElement(\`\${path}/\${args[2]}\`);` + `
` + `    }` + `
` + `` + `
` + `    function evImageEditorPopupClose(oController) {` + `
` + `      let image;` + `
` + `      try {` + `
` + `        const editor = ViewSlots.byId("POPUP", "imageEditor");` + `
` + `        if (editor) image = editor.getImagePngDataURL();` + `
` + `      } catch (e) {` + `
` + `        Lib.logError("IMAGE_EDITOR_POPUP_CLOSE: getImagePngDataURL failed", e);` + `
` + `      }` + `
` + `      ViewSlots.destroy("POPUP");` + `
` + `      oController.eB(["SAVE"], image);` + `
` + `    }` + `
` + `` + `
` + `    function evStartTimer(oController, args) {` + `
` + `      const timerKey = args[0];` + `
` + `      const callbackEvent = args[1];` + `
` + `      const delay = Number(args[2]) || 0;` + `
` + `      const timers = AppState.state.timers;` + `
` + `      clearTimeout(timers[timerKey]);` + `
` + `      timers[timerKey] = setTimeout(() => {` + `
` + `        delete timers[timerKey];` + `
` + `` + `
` + `        if (Lib.isDestroyed(oController)) return;` + `
` + `` + `
` + `        oController.eB([callbackEvent, false, true]);` + `
` + `      }, delay);` + `
` + `    }` + `
` + `` + `
` + `    function evSetFocus(oController, args) {` + `
` + `      const oElement = ViewSlots.resolveById(args[1]);` + `
` + `      if (!oElement) return;` + `
` + `` + `
` + `      const applyFocus = () => {` + `
` + `        try {` + `
` + `          const info = oElement.getFocusInfo();` + `
` + `          if (args[2] != null && args[2] !== "") {` + `
` + `            info.selectionStart = Number(args[2]);` + `
` + `          }` + `
` + `          if (args[3] != null && args[3] !== "") {` + `
` + `            info.selectionEnd = Number(args[3]);` + `
` + `          }` + `
` + `          oElement.applyFocusInfo(info);` + `
` + `        } catch (e) {` + `
` + `          Lib.logError(\`SET_FOCUS: failed for '\${args[1]}'\`, e);` + `
` + `        }` + `
` + `      };` + `
` + `` + `
` + `      Lib.whenRendered(oElement, oController, () => {` + `
` + `        applyFocus();` + `
` + `        const dom = oElement.getDomRef();` + `
` + `        if (dom && dom.contains(document.activeElement)) return;` + `
` + `` + `
` + `        const prevActive = document.activeElement;` + `
` + `` + `
` + `        const samePlace = (el) =>` + `
` + `          el == null ||` + `
` + `          el === document.body ||` + `
` + `          el === prevActive ||` + `
` + `          Boolean(el.id && prevActive && el.id === prevActive.id);` + `
` + `        const delegate = {` + `
` + `          onAfterRendering: () => {` + `
` + `            oElement.removeEventDelegate(delegate);` + `
` + `` + `
` + `            setTimeout(() => {` + `
` + `              if (Lib.isDestroyed(oController)) return;` + `
` + `` + `
` + `              if (!samePlace(document.activeElement)) return;` + `
` + `              applyFocus();` + `
` + `            }, 0);` + `
` + `          },` + `
` + `        };` + `
` + `        oElement.addEventDelegate(delegate);` + `
` + `      });` + `
` + `    }` + `
` + `` + `
` + `    function evScrollTo(oController, args) {` + `
` + `      try {` + `
` + `        const oElement = ViewSlots.resolveById(args[1]);` + `
` + `        if (!oElement) return;` + `
` + `        const y = Number(args[2]) || 0;` + `
` + `        const x = Number(args[3]) || 0;` + `
` + `        const behavior = args[4] || "auto";` + `
` + `        const smooth = behavior === "smooth";` + `
` + `` + `
` + `        let handled = false;` + `
` + `        try {` + `
` + `          const delegate = oElement.getScrollDelegate?.();` + `
` + `          if (delegate?.scrollTo) {` + `
` + `            delegate.scrollTo(x, y, smooth ? SMOOTH_SCROLL_MS : 0);` + `
` + `            handled = true;` + `
` + `          }` + `
` + `        } catch {}` + `
` + `` + `
` + `        if (!handled) {` + `
` + `          const dom =` + `
` + `            document.getElementById(\`\${oElement.getId()}-inner\`) ||` + `
` + `            oElement.getDomRef();` + `
` + `          if (dom?.scrollTo) {` + `
` + `            dom.scrollTo({ top: y, left: x, behavior });` + `
` + `          } else if (dom) {` + `
` + `            dom.scrollTop = y;` + `
` + `            dom.scrollLeft = x;` + `
` + `          } else if (oElement.scrollTo) {` + `
` + `            oElement.scrollTo(y, smooth ? SMOOTH_SCROLL_MS : 0);` + `
` + `          }` + `
` + `        }` + `
` + `      } catch (e) {` + `
` + `        Lib.logError(\`SCROLL_TO: failed for '\${args[1]}'\`, e);` + `
` + `      }` + `
` + `    }` + `
` + `` + `
` + `    function evScrollIntoView(oController, args) {` + `
` + `      try {` + `
` + `        const oElement = ViewSlots.resolveById(args[1]);` + `
` + `        if (!oElement) return;` + `
` + `        const dom = oElement.getDomRef();` + `
` + `        if (!dom || !dom.scrollIntoView) return;` + `
` + `        dom.scrollIntoView({` + `
` + `          behavior: args[2] || "smooth",` + `
` + `          block: args[3] || "start",` + `
` + `          inline: args[4] || "nearest",` + `
` + `        });` + `
` + `      } catch (e) {` + `
` + `        Lib.logError(\`SCROLL_INTO_VIEW: failed for '\${args[1]}'\`, e);` + `
` + `      }` + `
` + `    }` + `
` + `` + `
` + `    function evZ2ui5Custom(oController, args) {` + `
` + `      try {` + `
` + `        const fn = AppState.getGlobal(args[1]);` + `
` + `        if (typeof fn === "function") {` + `
` + `          fn(args.slice(2));` + `
` + `        } else {` + `
` + `          Lib.logError(\`Z2UI5: 'z2ui5.\${args[1]}' is not a function\`);` + `
` + `        }` + `
` + `      } catch (e) {` + `
` + `        Lib.logError(\`Z2UI5: '\${args[1]}' failed\`, e);` + `
` + `      }` + `
` + `    }` + `
` + `` + `
` + `    function evWizardSetNextStep(oController, args) {` + `
` + `      try {` + `
` + `        const wiz = ViewSlots.resolveById(args[1]);` + `
` + `        const step = ViewSlots.resolveById(args[2]);` + `
` + `        const nextStep = ViewSlots.resolveById(args[3]);` + `
` + `        if (!wiz || !step) {` + `
` + `          Lib.logError(` + `
` + `            \`WIZARD_SET_NEXT_STEP: '\${args[1]}' / '\${args[2]}' not found\`,` + `
` + `          );` + `
` + `        }` + `
` + `        if (wiz && step) wiz.discardProgress(step);` + `
` + `        if (step && nextStep) step.setNextStep(nextStep);` + `
` + `      } catch (e) {` + `
` + `        Lib.logError(\`WIZARD_SET_NEXT_STEP: failed for wizard '\${args[1]}'\`, e);` + `
` + `      }` + `
` + `    }` + `
` + `` + `
` + `    const handlers = {` + `
` + `      SET_SIZE_LIMIT: evSetSizeLimit,` + `
` + `      SET_ODATA_MODEL: evSetODataModel,` + `
` + `      BIND_ELEMENT: evBindElement,` + `
` + `      IMAGE_EDITOR_POPUP_CLOSE: evImageEditorPopupClose,` + `
` + `      START_TIMER: evStartTimer,` + `
` + `      SET_FOCUS: evSetFocus,` + `
` + `      SCROLL_TO: evScrollTo,` + `
` + `      SCROLL_INTO_VIEW: evScrollIntoView,` + `
` + `      Z2UI5: evZ2ui5Custom,` + `
` + `      WIZARD_SET_NEXT_STEP: evWizardSetNextStep,` + `
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

module.exports = z2ui5_cl_ui5f_viewops_js;

