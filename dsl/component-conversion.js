/* eslint-env node */
'use strict';

/**
 * @public
 *
 * htmlbars-ast-plugin that gets registered from index.js.
 *
 * ComponentConversionSupport.transform() gets called automatically at build time,
 * converting layout elements to their corresponding layout components.
 **/
class ComponentConversionSupport {
  /**
   * @public
   *
   * An HTMLBars AST transformation that converts instances of
   * layout elements to their corresponding layout-component.
   *
   * Walk through every node in the AST, transforming layout element nodes
   * to layout components by swapping the element node with a component node.
   * To see how the AST looks in Glimmer: http://astexplorer.net/
   **/
  transform(ast) {
    // Since this is an htmlbars-ast-plugin (as defined in index.js),
    // it inherits a syntax property from tildeio/htmlbars:
    // https://github.com/tildeio/htmlbars/blob/master/packages/htmlbars-syntax/lib/parser.js#L17
    let walker = new this.syntax.Walker();

    walker.visit(ast, elementNode => {
      if (!this._isFlexiLayoutComponent(elementNode)) {
        return;
      }

      let componentTag = `flexi-${elementNode.tag}`;

      // Build a component node so we can swap it with the element node
      let componentNode =
        this.syntax.builders.block(componentTag,
                                   null,
                                   this._makeHash(elementNode.loc, elementNode.attributes),
                                   this.syntax.builders.program(elementNode.children),
                                   null,
                                   this._adjustLocation(elementNode.loc));

      // Swap the element node with our component node
      this._swapNodes(elementNode, componentNode);
    });

    return ast;
  }

  _isFlexiLayoutComponent(node) {
    return node.type === 'ElementNode'
      && (node.tag === 'container' || this._isResponsiveGrid(node));
  }

  _isResponsiveGrid(elementNode) {
    if (elementNode.tag === 'grid') {
      let attributes = elementNode.attributes;

      for (let i = 0; i < attributes.length; i++) {
        if (attributes[i].name === 'responsive') {
          return true;
        }
      }
    }

    return false;
  }

  _makeHash(attrs, loc) {
    if (!attrs || !attrs.length) {
      return null;
    }

    let declareLine = loc.start.line;

    attrs.forEach(attr => {
      attr.type = 'HashPair';
      attr.value.type = 'StringLiteral';

      if (attr.value.loc.start.line === declareLine) {
        attr.value.loc.start.column += 7;
      }

      if (attr.value.loc.end.line === declareLine) {
        attr.value.loc.end.column += 7;
      }
    });

    return { pairs: attrs };
  }

  _adjustLocation(loc) {
    loc.end.column += 7;

    return loc;
  }

  // Swap the nodes, which are just javascript objects, by replacing all
  // the element's original properties with our component node's properties.
  _swapNodes(elementNode, componentNode) {
    // Delete all the original keys on the element node
    Object.keys(elementNode).forEach(key => {
      delete elementNode[key];
    });

    // Add the keys from our component node to the element node
    Object.keys(componentNode).forEach(key => {
      elementNode[key] = componentNode[key];
    });
  }
}

module.exports = ComponentConversionSupport;
