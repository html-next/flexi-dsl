/* jshint node:true */
"use strict"

module.exports = function removeElementAttribute(node, attr) {
  let index = node.attributes.indexOf(attr);

  node.attributes.splice(index, 1);
};
