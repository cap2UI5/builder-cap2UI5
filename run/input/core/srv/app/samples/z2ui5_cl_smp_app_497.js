const z2ui5_if_app = require("abap2UI5/z2ui5_if_app");

class z2ui5_cl_smp_app_497 extends z2ui5_if_app {
  rows = [];
  client = null;

  async main(client) {
    this.client = client;
    if (client.check_on_init()) {
      this.model_init();
      this.set_view();
    } else if (client.check_on_navigated()) {
      this.set_view();
    }
  }

  set_view() {
    const view = z2ui5_cl_ui5_view_builder.factory()
      .ele({ n: `View`, ns: `mvc` })
      .a({ n: `displayBlock`, v: `true` })
      .a({ n: `height`, v: `100%` })
      .a({ n: `xmlns`, v: `sap.m` })
      .a({ n: `xmlns:mvc`, v: `sap.ui.core.mvc` });
    const page = view.ele(`Shell`)
      .ele(`Page`)
      .a({ n: `title`, v: `abap2UI5 - Binding - A View Built From RTTI` })
      .a({ n: `showNavButton`, b: this.client.check_app_prev_stack() })
      .a({ n: `navButtonPress`, v: this.client._event_nav_app_leave() });
    page.tag(`MessageStrip`)
      .a({ n: `text`, v: `Not one field name appears in the view code. RTTI reads the ` + `components of the internal table, and every column header and ` + `cell binding below is derived from them.` })
      .a({ n: `type`, v: `Information` })
      .a({ n: `showIcon`, b: true })
      .a({ n: `class`, v: `sapUiSmallMargin` });
    this.render_any({ parent: page, tab: this.rows });
    this.client.view_display(view.stringify());
  }

  render_any({ parent, tab } = {}) {
    let sy_tabix = 0;
    const comps = ((cl_abap_typedescr.describe_by_data(tab)).get_table_line_type()).get_components();
    const ui_table = parent.ele(`Table`)
      .a({ n: `items`, v: this.client._bind(tab) })
      .a({ n: `headerText`, v: `${tab.length} rows, ${comps.length} columns` });
    const columns = ui_table.ele(`columns`);
    sy_tabix = 0;
    for (const comp of comps) {
      sy_tabix++;
      columns.ele(`Column`).ele(`header`).tag(`Text`).a({ n: `text`, v: comp.name });
    }
    const cells = ui_table.ele(`items`).ele(`ColumnListItem`).ele(`cells`);
    sy_tabix = 0;
    for (const comp of comps) {
      sy_tabix++;
      cells.tag(`Text`).a({ n: `text`, v: `{${comp.name}}` });
    }
  }

  model_init() {
    this.rows = z2ui5_cl_util.abap_tab_assign(this.rows, [{ carrid: `LH`, connid: `0400`, fldate: `20260825`, price: `899.00`, currency: `EUR` }, { carrid: `LH`, connid: `0402`, fldate: `20260826`, price: `915.00`, currency: `EUR` }, { carrid: `AA`, connid: `0017`, fldate: `20260827`, price: `422.50`, currency: `USD` }, { carrid: `UA`, connid: `0941`, fldate: `20260828`, price: `780.00`, currency: `USD` }]);
  }
}

module.exports = z2ui5_cl_smp_app_497;

const cl_abap_typedescr = require("abap2UI5/cl_abap_typedescr");
const z2ui5_cl_ui5_view_builder = require("abap2UI5/z2ui5_cl_ui5_view_builder");
const z2ui5_cl_util = require("abap2UI5/z2ui5_cl_util");

