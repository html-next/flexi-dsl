/*jshint node:true*/
module.exports = {
  normalizeEntityName: function() {},

  beforeInstall: function() {
    var options = {
      args: ['flexi-config'],
      dryRun: false,
      verbose: false,
      disableAnalytics: false
    };

    return this.taskFor('generate-from-blueprint').run(options);
  }
};
