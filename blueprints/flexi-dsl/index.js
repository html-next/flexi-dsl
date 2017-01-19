/*jshint node:true*/
module.exports = {
  normalizeEntityName: function() {},

  afterInstall: function(options) {
    return this.addAddonToProject({ name: 'flexi-config' });
  }
};
