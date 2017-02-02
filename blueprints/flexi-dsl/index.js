/*jshint node:true*/
module.exports = {
  normalizeEntityName: function() {},

  afterInstall: function() {
    var options = {
      args: ['@html-next/flexi-config'],
      dryRun: false,
      verbose: false,
      disableAnalytics: false
    };

    return this.taskFor('generate-from-blueprint').run(options);
  }
};
