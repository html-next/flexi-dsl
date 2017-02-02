/* jshint node: true */
/* global require */
'use strict';

var getValidatedFlexiConfig = require('@html-next/flexi-config/lib/get-validated-flexi-config');

var AttributeConversion = require('./dsl/attribute-conversion');
var ComponentConversion = require('./dsl/component-conversion');

function assert(statement, test) {
  if (!test) {
    throw new Error(statement);
  }
}

module.exports = {
  name: 'flexi-dsl',

  included: function(app, parentAddon) {
    this._super.included.apply(this, arguments);

    // Quick fix for add-on nesting
    // https://github.com/aexmachina/ember-cli-sass/blob/v5.3.0/index.js#L73-L75
    // see: https://github.com/ember-cli/ember-cli/issues/3718
    while (typeof app.import !== 'function' && (app.app || app.parent)) {
      app = app.app || app.parent;
    }

    // if app.import and parentAddon are blank, we're probably being consumed by an in-repo-addon
    // or engine, for which the "bust through" technique above does not work.
    if (typeof app.import !== 'function' && !parentAddon) {
      if (app.registry && app.registry.app) {
        app = app.registry.app;
      }
    }

    if (!parentAddon && typeof app.import !== 'function') {
      throw new Error('flexi-dsl is being used within another addon or engine and is' +
        ' having trouble registering itself to the parent application.');
    }

    this.app = app;
    return app;
  },

  isDevelopingAddon: function() {
    return false;
  },

  _flexiConfig: null,
  flexiConfig: function() {
    if (!this._flexiConfig) {
      this._flexiConfig = getValidatedFlexiConfig(this.project.root);
    }

    return this._flexiConfig;
  },

  config: function() {
    var org = this._super.config.apply(this, arguments);

    org.flexi = this.flexiConfig();
    return org;
  },

  setupPreprocessorRegistry: function(type, registry) {
    AttributeConversion.prototype.flexiConfig = this.flexiConfig();

    registry.add('htmlbars-ast-plugin', {
      name: "flexi-attribute-conversion",
      before: "flexi-component-conversion",
      plugin: AttributeConversion,
      baseDir: function() { return __dirname; }
    });

    registry.add('htmlbars-ast-plugin', {
      name: "flexi-component-conversion",
      plugin: ComponentConversion,
      baseDir: function() { return __dirname; }
    });
  }
};
