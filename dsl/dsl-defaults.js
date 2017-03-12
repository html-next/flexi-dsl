/* jshint node: true */
'use strict';

const LAYOUT_PROPERTIES = [
  "fill",
  "fit",
  "horizontal",
  "nowrap",
  "vertical",
  "wrap",
  { name: 'align', values: ["start", "end", "stretch", "center", "baseline"] },
  { name: 'justify', values: ["start", "end", "center", "between", "around"] },
];

/*
  Flexi DSL
 */
module.exports = {

  generateGridClass: function(breakpointPrefix, colNumber, columnPrefix /*, totalColumns*/) {
    return (columnPrefix ? columnPrefix + "-" : "") + breakpointPrefix + "-" + colNumber;
  },

  generateResponderClass: function(breakpointPrefix, responder, value) {
    if (value) {
      return `${responder}-${value}-${breakpointPrefix}`;
    }

    return `${responder}-${breakpointPrefix}`;
  },

  generateAttributeClass: function(attribute, value) {
    if (value) {
      return `${attribute}-${value}`;
    }

    return `flexi-${attribute}`;
  },

  generateOffsetClass: function(breakpointPrefix, colNumber, columnPrefix /*, totalColumns*/) {
    return (columnPrefix ? columnPrefix + "-" : "") + "offset-" + breakpointPrefix + "-" + colNumber;
  },

  /*
    Only elements with a tag matching elements in the DSL have their attributes
    and properties converted.
   */
  elements: [ "box", "centered", "container", "fill", "grid", "grid", "hbox", "page", "screen", "vbox" ],

  /*
    Responders are values which can occur within breakpoint properties
   */
  responders: ["hidden", "visible"].concat(LAYOUT_PROPERTIES),

  /*
    Attributes are values which can occur directly on the element
   */
  attributes: LAYOUT_PROPERTIES,

  // set at build time
  breakpoints: null,

  transformAll: false
};
