/** cl_abap_classdescr — native shim. */
"use strict";
const cl_abap_objectdescr = require("./cl_abap_objectdescr");

class cl_abap_classdescr extends cl_abap_objectdescr {
  /**
   * get_class_name( val ) — the absolute name of the object's class,
   * `\CLASS=Z2UI5_CL_FOO`. Callers strip the prefix (see
   * z2ui5_cl_ui5_util_context=>rtti_get_classname), so the prefix has to be
   * there: it is what the kernel returns, and the substring_after( ) that
   * follows answers empty without it.
   *
   * Unbound answers empty rather than throwing — the ABAP callers ask this
   * while rendering an error or a response header, where a half-built object
   * graph is normal, and they guard on IS NOT BOUND for exactly that reason.
   */
  static get_class_name(val) {
    if (val === null || val === undefined) return ``;
    return cl_abap_objectdescr.describe_by_object_ref(val)?.absolute_name ?? ``;
  }
}

module.exports = cl_abap_classdescr;
