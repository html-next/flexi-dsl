/* jshint node:true */
"use strict"

module.exports = function getElementAttribute(node, path) {
  let attributes = node.attributes;

  for (let i = 0, l = attributes.length; i < l; i++) {
    if (attributes[i].name === path) {
      return attributes[i];
    }
  }

  return false;
};
