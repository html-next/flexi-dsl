/*jshint node:true*/
module.exports = {
  description: 'Installs flexi-config',

  afterInstall: function(options) {
    return this.addAddonToProject({ name: 'flexi-config' });
  }
};
