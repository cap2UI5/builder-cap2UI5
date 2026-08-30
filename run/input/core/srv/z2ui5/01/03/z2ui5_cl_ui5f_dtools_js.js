
class z2ui5_cl_ui5f_dtools_js {
  static get() {
    let result = ``;
    result = `sap.ui.define(` + `
` + `  [` + `
` + `    "sap/ui/core/Control",` + `
` + `    "sap/ui/core/Fragment",` + `
` + `    "sap/ui/model/json/JSONModel",` + `
` + `    "z2ui5/core/Lib",` + `
` + `    "z2ui5/core/AppState",` + `
` + `    "z2ui5/core/ErrorView",` + `
` + `    "z2ui5/devtools/AbapSource",` + `
` + `    "z2ui5/devtools/Console",` + `
` + `    "z2ui5/devtools/Inspect",` + `
` + `    "z2ui5/devtools/LiveEdit",` + `
` + `    "z2ui5/devtools/Picker",` + `
` + `    "z2ui5/devtools/Recorder",` + `
` + `    "z2ui5/devtools/Report",` + `
` + `    "z2ui5/devtools/Tabs",` + `
` + `  ],` + `
` + `  (` + `
` + `    Control,` + `
` + `    Fragment,` + `
` + `    JSONModel,` + `
` + `    Lib,` + `
` + `    AppState,` + `
` + `    ErrorView,` + `
` + `    AbapSource,` + `
` + `    Console,` + `
` + `    Inspect,` + `
` + `    LiveEdit,` + `
` + `    Picker,` + `
` + `    Recorder,` + `
` + `    Report,` + `
` + `    Tabs,` + `
` + `  ) => {` + `
` + `    "use strict";` + `
` + `` + `
` + `    const FRAGMENT_ID = "z2ui5DeveloperTools";` + `
` + `` + `
` + `    const LAST_TAB_KEY = "z2ui5.devtools.lastTab";` + `
` + `` + `
` + `    const DEFAULT_TAB = "OVERVIEW";` + `
` + `` + `
` + `    const STATUS_MS = 6000;` + `
` + `` + `
` + `    function readLastTab() {` + `
` + `      try {` + `
` + `        return window.sessionStorage?.getItem(LAST_TAB_KEY) || "";` + `
` + `      } catch {` + `
` + `        return "";` + `
` + `      }` + `
` + `    }` + `
` + `` + `
` + `    function writeLastTab(tabKey) {` + `
` + `      try {` + `
` + `        window.sessionStorage?.setItem(LAST_TAB_KEY, tabKey);` + `
` + `      } catch {}` + `
` + `    }` + `
` + `` + `
` + `    function resolveTab(tabKey) {` + `
` + `      if (Tabs.isEnabled(Tabs.get(tabKey))) return tabKey;` + `
` + `      if (Tabs.isKnown(tabKey)) {` + `
` + `        const sibling = Tabs.firstTabOf(Tabs.groupOf(tabKey));` + `
` + `        if (sibling) return sibling;` + `
` + `      }` + `
` + `      return DEFAULT_TAB;` + `
` + `    }` + `
` + `` + `
` + `    function preloadCodeEditor() {` + `
` + `      return new Promise((resolve) => {` + `
` + `        sap.ui.require(` + `
` + `          ["sap/ui/codeeditor/library", "sap/ui/codeeditor/CodeEditor"],` + `
` + `          () => resolve(),` + `
` + `` + `
` + `          () => resolve(),` + `
` + `        );` + `
` + `      });` + `
` + `    }` + `
` + `` + `
` + `    const DeveloperTools = Control.extend("z2ui5.devtools.DeveloperTools", {` + `
` + `      renderTab(tabKey, oModel) {` + `
` + `        const key = resolveTab(tabKey);` + `
` + `        const tab = Tabs.get(key);` + `
` + `        const data = oModel.getData();` + `
` + `` + `
` + `        data.selectedTab = key;` + `
` + `        data.selectedGroup = tab.group;` + `
` + `        writeLastTab(key);` + `
` + `` + `
` + `        const slots = Tabs.enabledSlots().map((slot) => ({` + `
` + `          key: slot.key,` + `
` + `          text: slot.label,` + `
` + `        }));` + `
` + `        data.slots = slots;` + `
` + `` + `
` + `        data.selectedSlot = tab.slot || data.selectedSlot || "MAIN";` + `
` + `        data.showSlotBar = Boolean(tab.slot) && slots.length > 1;` + `
` + `` + `
` + `        let views;` + `
` + `        if (tab.group === "VIEWDATA") {` + `
` + `          views = Tabs.aspectsOfSlot(data.selectedSlot).concat(` + `
` + `            Tabs.get("PICK"),` + `
` + `          );` + `
` + `        } else {` + `
` + `          views = Tabs.enabledTabs(tab.group);` + `
` + `        }` + `
` + `        data.views = views.map((entry) => ({` + `
` + `          key: entry.key,` + `
` + `          text: entry.label,` + `
` + `        }));` + `
` + `        data.showViewBar = data.views.length > 1;` + `
` + `` + `
` + `        data.isOverview = tab.group === "OVERVIEW";` + `
` + `        data.isRoundtrips = tab.group === "ROUNDTRIPS";` + `
` + `        data.isViewData = tab.group === "VIEWDATA";` + `
` + `        data.isSearch = tab.group === "SEARCH";` + `
` + `        data.isErrorView = key === "ERROR";` + `
` + `        data.isSourceView = key === "SOURCE";` + `
` + `        data.hasRetry =` + `
` + `          key === "ERROR" &&` + `
` + `          typeof AppState.state.lastError?.onRetry === "function";` + `
` + `        data.recordPayloads = Recorder.isRecordingPayloads();` + `
` + `        data.openOnError = Console.isAlertOnError();` + `
` + `` + `
` + `        data.problemCount = this.problemCount();` + `
` + `` + `
` + `        if (tab.kind === "search") {` + `
` + `          this.displayEditor(oModel, Tabs.search(data.searchTerm), "text");` + `
` + `` + `
` + `          data.isTemplating = false;` + `
` + `          oModel.refresh();` + `
` + `          return;` + `
` + `        }` + `
` + `` + `
` + `        if (tab.kind === "source") {` + `
` + `          data.canApply = false;` + `
` + `          data.isTemplating = false;` + `
` + `          data.templatingSource = false;` + `
` + `          this.showAbapSource(oModel);` + `
` + `          return;` + `
` + `        }` + `
` + `` + `
` + `        this.displayEditor(` + `
` + `          oModel,` + `
` + `          Tabs.render(key),` + `
` + `          tab.kind,` + `
` + `          Tabs.renderTemplated(key),` + `
` + `        );` + `
` + `` + `
` + `        data.canApply = LiveEdit.canApply(key);` + `
` + `        oModel.refresh();` + `
` + `      },` + `
` + `` + `
` + `      onGroupSelect(oEvent) {` + `
` + `        const oModel = oEvent.getSource().getModel();` + `
` + `        const groupKey = oEvent.getSource().getSelectedKey();` + `
` + `        this.renderTab(Tabs.firstTabOf(groupKey) || DEFAULT_TAB, oModel);` + `
` + `      },` + `
` + `` + `
` + `      onViewSelect(oEvent) {` + `
` + `        const oSource = oEvent.getSource();` + `
` + `        this.renderTab(oSource.getSelectedKey(), oSource.getModel());` + `
` + `      },` + `
` + `` + `
` + `      onSlotSelect(oEvent) {` + `
` + `        const oSource = oEvent.getSource();` + `
` + `        const oModel = oSource.getModel();` + `
` + `        const aspect = Tabs.get(oModel.getData().selectedTab)?.aspect;` + `
` + `        this.renderTab(Tabs.tabFor(oSource.getSelectedKey(), aspect), oModel);` + `
` + `      },` + `
` + `` + `
` + `      onSearch(oEvent) {` + `
` + `        const oSource = oEvent.getSource();` + `
` + `        const oModel = oSource.getModel();` + `
` + `        oModel.getData().searchTerm = oSource.getValue();` + `
` + `        this.renderTab("SEARCH", oModel);` + `
` + `      },` + `
` + `` + `
` + `      displayEditor(oModel, content, type, xcontent = "") {` + `
` + `        const data = oModel.getData();` + `
` + `        data.editor_visible = true;` + `
` + `        data.source_visible = false;` + `
` + `` + `
` + `        data.canApply = false;` + `
` + `        data.isTemplating = Boolean(content?.includes("xmlns:template"));` + `
` + `` + `
` + `        data.templatingSource = false;` + `
` + `        data.value = content;` + `
` + `        data.previousValue = content;` + `
` + `        data.xContent = xcontent;` + `
` + `        data.type = type;` + `
` + `        oModel.refresh();` + `
` + `      },` + `
` + `` + `
` + `      onTemplatingPress(oEvent) {` + `
` + `        const oSource = oEvent.getSource();` + `
` + `        const oModel = oSource.getModel();` + `
` + `        const data = oModel.getData();` + `
` + `` + `
` + `        data.value = oSource.getPressed() ? data.xContent : data.previousValue;` + `
` + `        oModel.refresh();` + `
` + `      },` + `
` + `` + `
` + `      showAbapSource(oModel) {` + `
` + `        const contentControl = Fragment.byId(FRAGMENT_ID, "sourceHtml");` + `
` + `` + `
` + `        contentControl?.setContent(AbapSource.iframeHtml());` + `
` + `` + `
` + `        AbapSource.fetchSource();` + `
` + `` + `
` + `        if (!oModel) return;` + `
` + `        const data = oModel.getData();` + `
` + `        data.editor_visible = false;` + `
` + `        data.source_visible = true;` + `
` + `        oModel.refresh();` + `
` + `      },` + `
` + `` + `
` + `      onOpenAbapInAdt() {` + `
` + `        AbapSource.openInAdt();` + `
` + `      },` + `
` + `` + `
` + `      showStatus(oModel, text) {` + `
` + `        const data = oModel.getData();` + `
` + `        data.statusText = text;` + `
` + `        data.hasStatusText = Boolean(text);` + `
` + `        oModel.refresh();` + `
` + `        if (!text) return;` + `
` + `        clearTimeout(this._statusTimer);` + `
` + `        this._statusTimer = setTimeout(() => {` + `
` + `          if (Lib.isDestroyed(this)) return;` + `
` + `          data.statusText = "";` + `
` + `          data.hasStatusText = false;` + `
` + `          oModel.refresh();` + `
` + `        }, STATUS_MS);` + `
` + `      },` + `
` + `` + `
` + `      async onReportBug(oEvent) {` + `
` + `        const oModel = oEvent.getSource().getModel();` + `
` + `        const source = await AbapSource.fetchSource();` + `
` + `        if (Lib.isDestroyed(this)) return;` + `
` + `        this.showStatus(oModel, Report.copyMarkdown(source));` + `
` + `      },` + `
` + `` + `
` + `      async onExport() {` + `
` + `        const source = await AbapSource.fetchSource();` + `
` + `        if (Lib.isDestroyed(this)) return;` + `
` + `        Report.openDialog(AbapSource.appName(), source);` + `
` + `      },` + `
` + `` + `
` + `      onCopyTab(oEvent) {` + `
` + `        const oSource = oEvent.getSource();` + `
` + `        Lib.copyToClipboard(oSource.getModel().getData().value || "");` + `
` + `` + `
` + `        const original = oSource.getText();` + `
` + `        oSource.setText("Copied");` + `
` + `        setTimeout(() => {` + `
` + `          if (!Lib.isDestroyed(oSource)) oSource.setText(original);` + `
` + `        }, 1500);` + `
` + `      },` + `
` + `` + `
` + `      onErrorRetry() {` + `
` + `        const onRetry = AppState.state.lastError?.onRetry;` + `
` + `` + `
` + `        this.reopenErrorOnClose = false;` + `
` + `        this.close();` + `
` + `        if (typeof onRetry === "function") onRetry();` + `
` + `      },` + `
` + `      onErrorRestart() {` + `
` + `        window.location.reload();` + `
` + `      },` + `
` + `      onErrorLogout() {` + `
` + `        ErrorView.handleLogout();` + `
` + `      },` + `
` + `` + `
` + `      onToggleRecordPayloads(oEvent) {` + `
` + `        const oSource = oEvent.getSource();` + `
` + `        Recorder.setRecordingPayloads(oSource.getPressed());` + `
` + `        const oModel = oSource.getModel();` + `
` + `        this.renderTab(oModel.getData().selectedTab, oModel);` + `
` + `      },` + `
` + `` + `
` + `      onToggleOpenOnError(oEvent) {` + `
` + `        const oSource = oEvent.getSource();` + `
` + `        Console.setAlertOnError(oSource.getPressed());` + `
` + `        const oModel = oSource.getModel();` + `
` + `        oModel.getData().openOnError = Console.isAlertOnError();` + `
` + `        oModel.refresh();` + `
` + `      },` + `
` + `` + `
` + `      onPickControl() {` + `
` + `        const previousTab = this.oDialog?.getModel()?.getData()?.selectedTab;` + `
` + `        this.reopenErrorOnClose = false;` + `
` + `        this.close();` + `
` + `        Picker.start((report) => {` + `
` + `          if (Lib.isDestroyed(this)) return;` + `
` + `          this.show(report ? "PICK" : previousTab);` + `
` + `        });` + `
` + `      },` + `
` + `` + `
` + `      async onApplyXml(oEvent) {` + `
` + `        const oModel = oEvent.getSource().getModel();` + `
` + `        const data = oModel.getData();` + `
` + `        if (LiveEdit.isBusy()) {` + `
` + `          this.showStatus(oModel, "A roundtrip is running - try again.");` + `
` + `          return;` + `
` + `        }` + `
` + `        const result = await LiveEdit.apply(data.selectedTab, data.value);` + `
` + `        if (Lib.isDestroyed(this)) return;` + `
` + `        this.showStatus(oModel, result);` + `
` + `      },` + `
` + `` + `
` + `      onResetXml(oEvent) {` + `
` + `        const oModel = oEvent.getSource().getModel();` + `
` + `        const data = oModel.getData();` + `
` + `        const xml = Tabs.render(data.selectedTab);` + `
` + `        data.value = xml;` + `
` + `        data.previousValue = xml;` + `
` + `        oModel.refresh();` + `
` + `        this.showStatus(oModel, "");` + `
` + `      },` + `
` + `` + `
` + `      onShowHelp() {` + `
` + `        sap.ui.require(` + `
` + `          ["sap/m/Dialog", "sap/m/TextArea", "sap/m/Button"],` + `
` + `          (Dialog, TextArea, Button) => {` + `
` + `            const area = new TextArea({` + `
` + `              editable: false,` + `
` + `              width: "100%",` + `
` + `              rows: 25,` + `
` + `              growing: false,` + `
` + `            });` + `
` + `            area.setValue(Inspect.formatHelp());` + `
` + `            const dialog = new Dialog({` + `
` + `              title: "abap2UI5 - Developer Tools Help",` + `
` + `              stretch: true,` + `
` + `              content: [area],` + `
` + `              buttons: [` + `
` + `                new Button({` + `
` + `                  text: "Close",` + `
` + `                  type: "Emphasized",` + `
` + `                  press: () => dialog.close(),` + `
` + `                }),` + `
` + `              ],` + `
` + `              afterClose: () => dialog.destroy(),` + `
` + `            });` + `
` + `            dialog.open();` + `
` + `          },` + `
` + `        );` + `
` + `      },` + `
` + `` + `
` + `      onClose() {` + `
` + `        this.close();` + `
` + `      },` + `
` + `` + `
` + `      onEscape(oPromise) {` + `
` + `        oPromise.reject();` + `
` + `        this.close();` + `
` + `      },` + `
` + `` + `
` + `      async show(initialTab) {` + `
` + `        if (this._showPending) return;` + `
` + `        this._showPending = true;` + `
` + `        try {` + `
` + `          if (!this.oDialog) {` + `
` + `            await preloadCodeEditor();` + `
` + `            this.oDialog = await Fragment.load({` + `
` + `              name: "z2ui5.devtools.DeveloperTools",` + `
` + `              controller: this,` + `
` + `              id: FRAGMENT_ID,` + `
` + `            });` + `
` + `          }` + `
` + `` + `
` + `          if (Lib.isDestroyed(this)) {` + `
` + `            if (this.oDialog) this.oDialog.destroy();` + `
` + `            this.oDialog = null;` + `
` + `            return;` + `
` + `          }` + `
` + `` + `
` + `          const requested =` + `
` + `            typeof initialTab === "string" && initialTab` + `
` + `              ? initialTab` + `
` + `              : readLastTab();` + `
` + `` + `
` + `          const appName = AbapSource.appName();` + `
` + `          const oModel = new JSONModel({` + `
` + `            title: appName` + `
` + `              ? \`abap2UI5 - Developer Tools - \${appName}\`` + `
` + `              : "abap2UI5 - Developer Tools",` + `
` + `            selectedGroup: Tabs.DEFAULT_GROUP,` + `
` + `            selectedTab: DEFAULT_TAB,` + `
` + `            selectedSlot: "MAIN",` + `
` + `            searchTerm: "",` + `
` + `            slots: [],` + `
` + `            views: [],` + `
` + `            showSlotBar: false,` + `
` + `            showViewBar: false,` + `
` + `            isOverview: true,` + `
` + `            isRoundtrips: false,` + `
` + `            isViewData: false,` + `
` + `            isSearch: false,` + `
` + `            isErrorView: false,` + `
` + `            isSourceView: false,` + `
`;
    result = result + `            hasRetry: false,` + `
` + `            canApply: false,` + `
` + `            isTemplating: false,` + `
` + `            templatingSource: false,` + `
` + `            statusText: "",` + `
` + `            hasStatusText: false,` + `
` + `` + `
` + `            problemCount: this.problemCount(),` + `
` + `            recordPayloads: Recorder.isRecordingPayloads(),` + `
` + `            openOnError: Console.isAlertOnError(),` + `
` + `            type: "text",` + `
` + `            value: "",` + `
` + `            previousValue: "",` + `
` + `            xContent: "",` + `
` + `            source_visible: false,` + `
` + `            editor_visible: true,` + `
` + `          });` + `
` + `` + `
` + `          const oDialog = this.oDialog;` + `
` + `          oDialog.setModel(oModel);` + `
` + `          this.renderTab(requested, oModel);` + `
` + `          oDialog.open();` + `
` + `        } catch (e) {` + `
` + `          Lib.logError("DeveloperTools.show failed", e);` + `
` + `        } finally {` + `
` + `          this._showPending = false;` + `
` + `        }` + `
` + `      },` + `
` + `` + `
` + `      problemCount() {` + `
` + `        const errors = (AppState.state.errors || []).length;` + `
` + `        const total = errors + (AppState.state.lastError ? 1 : 0);` + `
` + `        return total ? String(total) : "";` + `
` + `      },` + `
` + `` + `
` + `      close() {` + `
` + `        if (!this.oDialog || !this.oDialog.isOpen()) return;` + `
` + `` + `
` + `        const reopenError = this.reopenErrorOnClose;` + `
` + `        this.reopenErrorOnClose = false;` + `
` + `` + `
` + `        this.oDialog.close();` + `
` + `        if (reopenError) ErrorView.reopenErrorDialog();` + `
` + `      },` + `
` + `` + `
` + `      exit() {` + `
` + `        this.reopenErrorOnClose = false;` + `
` + `        clearTimeout(this._statusTimer);` + `
` + `        if (this.oDialog) {` + `
` + `          this.oDialog.close();` + `
` + `          this.oDialog.destroy();` + `
` + `          this.oDialog = null;` + `
` + `        }` + `
` + `      },` + `
` + `` + `
` + `      toggle() {` + `
` + `        if (this.oDialog && this.oDialog.isOpen()) {` + `
` + `          this.close();` + `
` + `        } else {` + `
` + `          this.show();` + `
` + `        }` + `
` + `      },` + `
` + `` + `
` + `      renderer: Lib.EMPTY_RENDERER,` + `
` + `    });` + `
` + `` + `
` + `    return DeveloperTools;` + `
` + `  },` + `
` + `);` + `
` + `` + `
` + ``;
    return result;
  }
}

module.exports = z2ui5_cl_ui5f_dtools_js;

