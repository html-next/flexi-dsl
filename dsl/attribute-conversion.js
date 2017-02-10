/* jshint node:true */
/**
 * An HTMLBars AST transformation that converts
 * flexi attributes into CSS classes
 **/
let DSL = require('./dsl-defaults');
let MIN_COLUMN_COUNT = 1;
let assign = require('object-assign');
let chalk = require('chalk');
let debug = require('debug')('flexi');
let getAttribute = require("./helpers/get-attribute");
let removeAttributeFromNode = require("./helpers/remove-attribute");

/**
 * htmlbars-ast-plugin that gets registered from index.js.
 *
 * AttributeConversionSupport.transform() gets called automatically at build time,
 * converting flexi attributes on flexi elements to CSS classes.
 **/
class AttributeConversionSupport {
  constructor() {
    // NOTE: this.flexiConfig is added to the prototype from index.js
    this.dsl = {};
    assign(this.dsl, DSL);

    this.dsl.generateGridClass = this.flexiConfig.generateGridClass || this.dsl.generateGridClass;
    this.dsl.generateResponderClass = this.flexiConfig.generateResponderClass || this.dsl.generateResponderClass;
    this.dsl.generateAttributeClass = this.flexiConfig.generateAttributeClass || this.dsl.generateAttributeClass;
    this.dsl.generateOffsetClass = this.flexiConfig.generateOffsetClass || this.dsl.generateOffsetClass;

    this.dsl.elements = this._uniqueMergeArrays(this.dsl.elements, this.flexiConfig.elements || []);
    this.dsl.responders = this._uniqueMergeArrays(this.dsl.responders, this.flexiConfig.responders || []);
    this.dsl.attributes = this._uniqueMergeArrays(this.dsl.attributes, this.flexiConfig.attributes || []);
    this.dsl.breakpoints = this.flexiConfig.breakpoints;
    this.dsl.transformAll = this.flexiConfig.transformAllElementLayoutAttributes || false;
  }

  _uniqueMergeArrays() {
    let keys = [];

    for (let i = 0; i < arguments.length; i++) {
      for (let j = 0; j < arguments[i].length; j++) {
        if (keys.indexOf(arguments[i][j]) === -1) {
          keys.push(arguments[i][j]);
        }
      }
    }

    return keys;
  }

  /**
   * Walk through every node in the AST, transforming attributes to CSS
   * classes by altering the "class" AttrNode of relevant elements.
   * To see how the AST looks in Glimmer: http://astexplorer.net/
   **/
  transform(ast) {
    /**
     * // will be used in the future for custom CSS classes
     * let _seen = {
     *   elements: {},
     *   responders: {},
     *   breakpoints: {},
     *   attributes: {}
     * };
     **/

    let _walker = new this.syntax.Walker();

    _walker.visit(ast, (node) => {
      if (!this._isElementWeConvertAttributesFor(node)) {
        return;
      }

      debug(chalk.cyan("\tConverting attributes for node: ") + chalk.yellow(node.tag));

      // Will be used in the future for custom CSS classes
      // _seen.elements[node.tag] = true;

      // Maintain a list of all class names that will be applied to the element,
      // starting with any classes the element already has
      let classNames = [];
      let classAttr = getAttribute(node, "class");

      if (classAttr && classAttr.value.chars) {
        debug(chalk.grey("\t\tStarting with original class string: ") + chalk.white(classAttr.value.chars));

        classNames.push(classAttr.value.chars);
      }

      // Convert attributes that aren't in a breakpoint attribute
      this.dsl.attributes.forEach((attr) => {
        let className = this._convertAttribute(node, attr);

        if (className) {
          classNames.push(className);
        }
      });

      // Convert breakpoint and responder values
      this.dsl.breakpoints.forEach((breakpoint) => {
        let breakpoint_attribute = getAttribute(node, breakpoint.prefix);

        if (!breakpoint_attribute) {
          // This element doesn't have an attribute for this breakpoint,
          // continue to the next breakpoint
          return;
        }

        breakpoint_attribute.value.chars.split(" ").forEach((value) => {
          // Convert column number values
          let columns = parseInt(value, 10);
          if (!isNaN(columns)) {
            classNames.push(this._convertGridColumns(breakpoint, columns));

            return;
          }

          // Convert responder values
          if (this.dsl.responders.indexOf(value) !== -1) {
            classNames.push(this._convertResponderValue(breakpoint, value));

            return;
          }

          // Convert offset values
          if (value.indexOf('offset-') === 0) {
            classNames.push(this._convertOffsetColumns(breakpoint, value));

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

  _isElementWeConvertAttributesFor(node) {
    return node.type === "ElementNode" &&
      (this.dsl.transformAll || this.dsl.elements.indexOf(node.tag) !== -1);
  }

  _convertAttribute(node, attribute) {
    let isComplex = typeof attribute !== 'string';
    let name = isComplex ? attribute.name : attribute;
    let values = isComplex ? attribute.values : [];
    let attr = getAttribute(node, name);
    let value;

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

      let className = this.dsl.generateAttributeClass(name, value);

      debug(chalk.grey("\t\tGenerated class: ") + chalk.white(className));

      // Clean up the element by removing our custom attribute
      removeAttributeFromNode(node, attr);

      return className;
    }
  }

  _convertGridColumns(breakpoint, columns) {
    if (columns >= MIN_COLUMN_COUNT && columns <= this.flexiConfig.columns) {
      let columnClassName = this.dsl.generateGridClass(breakpoint,
                                                       columns,
                                                       this.flexiConfig.columnPrefix,
                                                       this.flexiConfig.columns);

      debug(chalk.grey("\t\tGenerated column class: ") + chalk.white(columnClassName));

      return columnClassName;
    }

    throw new Error("Flexi#attribute-conversion:: '" + columns +
      "' is not a valid column value for " + breakpoint.prefix + ".");
  }

  _convertResponderValue(breakpoint, value) {
    let responderClassName = this.dsl.generateResponderClass(breakpoint, value);

    debug(chalk.grey("\t\tGenerated responsive class: ") + chalk.white(responderClassName));

    return responderClassName;
  }

  _convertOffsetColumns(breakpoint, value) {
    let offset = parseInt(value.substr(7), 10);

    if (!isNan(offset) && offset >= 0 && offset < this.flexiConfig.columns) {
      let offsetClassName = this.dsl.generateOffsetClass(breakpoint,
                                                         offset,
                                                         this.flexiConfig.columnPrefix,
                                                         this.flexiConfig.columns);

      debug(chalk.grey("\t\Generated offset class: ") + chalk.white(offsetClassName));

      return offsetClassName;
    }

    throw new Error("Flexi#attribute-conversion:: '" + offset +
      "' is not a valid column offset for " + breakpoint.prefix + ".");
  }
}

module.exports = AttributeConversionSupport;
