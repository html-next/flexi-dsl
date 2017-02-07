/* jshint node:true */
/**
 * An HTMLBars AST transformation that converts
 * flexi attributes into CSS classes
 **/
var DSL = require('./dsl-defaults');
var MIN_COLUMN_COUNT = 1;
var assign = require('object-assign');
var chalk = require('chalk');
var debug = require('debug')('flexi');
var getAttribute = require("./helpers/get-attribute");
var removeAttributeFromNode = require("./helpers/remove-attribute");

/**
 * htmlbars-ast-plugin that gets registered from index.js.
 *
 * AttributeConversionSupport.transform() gets called automatically at build time,
 * converting flexi attributes on flexi elements to CSS classes.
 **/
function AttributeConversionSupport() {
  // NOTE: this.flexiConfig is added to the prototype from index.js

  this.dsl = {};
  assign(this.dsl, DSL);

  this.dsl.generateGridClass = this.flexiConfig.generateGridClass || this.dsl.generateGridClass;
  this.dsl.generateResponderClass = this.flexiConfig.generateResponderClass || this.dsl.generateResponderClass;
  this.dsl.generateAttributeClass = this.flexiConfig.generateAttributeClass || this.dsl.generateAttributeClass;
  this.dsl.generateOffsetClass = this.flexiConfig.generateOffsetClass || this.dsl.generateOffsetClass;

  this.dsl.elements = uniqueMergeArrays(this.dsl.elements, this.flexiConfig.elements || []);
  this.dsl.responders = uniqueMergeArrays(this.dsl.responders, this.flexiConfig.responders || []);
  this.dsl.attributes = uniqueMergeArrays(this.dsl.attributes, this.flexiConfig.attributes || []);
  this.dsl.breakpoints = this.flexiConfig.breakpoints;
  this.dsl.transformAll = this.flexiConfig.transformAllElementLayoutAttributes || false;
}

function uniqueMergeArrays() {
  var keys = [];

  for (var i = 0; i < arguments.length; i++) {
    for (var j = 0; j < arguments[i].length; j++) {
      if (keys.indexOf(arguments[i][j]) === -1) {
        keys.push(arguments[i][j]);
      }
    }
  }

  return keys;
}

var proto = AttributeConversionSupport.prototype;

/**
 * Walk through every node in the AST, transforming attributes to CSS
 * classes by altering the "class" AttrNode of relevant elements.
 * To see how the AST looks in Glimmer: http://astexplorer.net/
 **/
proto.transform = function AttributeConversionSupport_transform(ast) {
  var _plugin = this;
  var _dsl = _plugin.dsl;

  /**
   * // will be used in the future for custom CSS classes
   * var _seen = {
   *   elements: {},
   *   responders: {},
   *   breakpoints: {},
   *   attributes: {}
   * };
   **/

  var _walker = new _plugin.syntax.Walker();

  _walker.visit(ast, function (node) {
    if (!_plugin.isElementWeConvertAttributesFor(node)) {
      return;
    }

    debug(chalk.cyan("\tConverting attributes for node: ") + chalk.yellow(node.tag));

    // Will be used in the future for custom CSS classes
    // _seen.elements[node.tag] = true;

    // Maintain a list of all class names that will be applied to the element,
    // starting with any classes the element already has
    var classNames = [];
    var classAttr = getAttribute(node, "class");

    if (classAttr && classAttr.value.chars) {
      debug(chalk.grey("\t\tStarting with original class string: ") + chalk.white(classAttr.value.chars));

      classNames.push(classAttr.value.chars);
    }

    // Convert attributes that aren't in a breakpoint attribute
    _dsl.attributes.forEach(function(attr) {
      var className = _plugin.convertAttribute(node, attr);

      if (className) {
        classNames.push(className);
      }
    });

    // Convert breakpoint and responder values
    _dsl.breakpoints.forEach(function(breakpoint) {
      var breakpoint_attribute = getAttribute(node, breakpoint.prefix);

      if (!breakpoint_attribute) {
        // This element doesn't have an attribute for this breakpoint,
        // continue to the next breakpoint
        return;
      }

      breakpoint_attribute.value.chars.split(" ").forEach(function(value) {
        // Convert column number values
        var columns = parseInt(value, 10);
        if (!isNaN(columns)) {
          classNames.push(_plugin.convertGridColumns(breakpoint, columns));

          return;
        }

        // Convert responder values
        if (_dsl.responders.indexOf(value) !== -1) {
          classNames.push(_plugin.convertResponderValue(breakpoint, value));

          return;
        }

        // Convert offset values
        if (value.indexOf('offset-') === 0) {
          classNames.push(_plugin.convertOffsetColumns(breakpoint, value));

          return;
        }

        throw new Error("Flexi#attribute-conversion:: '" + value + "' is not a valid value for a breakpoint.");
      });

      // Clean up the element by removing our custom attribute
      removeAttributeFromNode(node, breakpoint_attribute);
    });

    debug(chalk.magenta("\t\tFinal Class: ") + chalk.white(classNames.join(" ")));

    if (!classNames.length) {
      // No attributes were found on the element
      return;
    }

    if (!classAttr) {
      node.attributes.push({
        type: "AttrNode",
        name: "class",
        value: { type: "TextNode", chars: classNames.join(" ") }
      });

      return;
    }

    // If the AttrNode for "class" contains a MustacheStatement, `{{somethingDynamic}}`,
    // it will be a ConcatStatement node. In such a case, add a TextNode with our
    // classes to the list of Nodes to be concatenated.
    if (classAttr.value.type === "ConcatStatement") {
      classAttr.value.parts.push({ type: "TextNode", chars: " " + classNames.join(" ") });
    } else {
      classAttr.value.chars = classNames.join(" ");
    }
  });

  return ast;
};

proto.isElementWeConvertAttributesFor = function AttributeConversionSupport_isElementWeConvertAttributesFor(node) {
  return node.type === "ElementNode" &&
    (this.dsl.transformAll || this.dsl.elements.indexOf(node.tag) !== -1);
}

proto.convertAttribute = function AttributeConversionSupport_convertAttribute(node, attribute) {
  var isComplex = typeof attribute !== 'string';
  var name = isComplex ? attribute.name : attribute;
  var values = isComplex ? attribute.values : [];
  var attr = getAttribute(node, name);
  var value;

  if (attr) {
    value =  attr.value.chars;

    if (!isComplex && value) {
      throw new Error("Flexi#attribute-conversion:: Attribute '" + attribute +
        "' does not expect a value, given '" + value + "'.");
    }

    if (isComplex && values.indexOf(value) === -1) {
      throw new Error("Flexi#attribute-conversion:: '" + value +
        "' is not a valid value for " + name + ".");
    }

    var className = this.dsl.generateAttributeClass(name, value);

    debug(chalk.grey("\t\tGenerated class: ") + chalk.white(className));

    // Clean up the element by removing our custom attribute
    removeAttributeFromNode(node, attr);

    return className;
  }
}

proto.convertGridColumns = function AttributeConversionSupport_convertGridColumns(breakpoint, columns) {
  if (columns >= MIN_COLUMN_COUNT && columns <= this.flexiConfig.columns) {
    var columnClassName = this.dsl.generateGridClass(breakpoint,
                                                     columns,
                                                     this.flexiConfig.columnPrefix,
                                                     this.flexiConfig.columns);

    debug(chalk.grey("\t\tGenerated column class: ") + chalk.white(columnClassName));

    return columnClassName;
  }

  throw new Error("Flexi#attribute-conversion:: '" + columns +
    "' is not a valid column value for " + breakpoint.prefix + ".");
}

proto.convertResponderValue = function AttributeConversionSupport_convertResponderValue(breakpoint, value) {
  var responderClassName = this.dsl.generateResponderClass(breakpoint, value);

  debug(chalk.grey("\t\tGenerated responsive class: ") + chalk.white(responderClassName));

  return responderClassName;
}

proto.convertOffsetColumns = function AttributeConversionSupport_convertOffsetColumns(breakpoint, value) {
  var offset = parseInt(value.substr(7), 10);

  if (!isNan(offset) && offset >= 0 && offset < this.flexiConfig.columns) {
    var offsetClassName = this.dsl.generateOffsetClass(breakpoint,
                                                       offset,
                                                       this.flexiConfig.columnPrefix,
                                                       this.flexiConfig.columns);

    debug(chalk.grey("\t\Generated offset class: ") + chalk.white(offsetClassName));

    return offsetClassName;
  }

  throw new Error("Flexi#attribute-conversion:: '" + offset +
    "' is not a valid column offset for " + breakpoint.prefix + ".");
}

module.exports = AttributeConversionSupport;
