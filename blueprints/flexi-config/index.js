/*jshint node:true*/
module.exports = {
  description: 'Installs flexi-config',

  afterInstall: function(options) {
    return this.addAddonToProject({ name: 'flexi-config' });
  }
  // locals: function(options) {
  //   // Return custom template variables here.
  //   return {
  //     foo: options.entity.options.foo
  //   };
  // }

  // afterInstall: function(options) {
  //   // Perform extra work here.
  // }
};
