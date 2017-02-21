/*jshint node:true*/
module.exports = {
  normalizeEntityName: function() {},

  afterInstall: function(options) {
    return this.addAddonToProject({
      name: '@html-next/flexi-config',
      target: '2.0.0-beta.12',
      blueprintOptions: {
        save: options.save
      }
    });
  }
};
