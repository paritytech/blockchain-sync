var child_process = require("child_process"),
    rimraf = require("rimraf"),
    _ = require("lodash"),
    expandHomeDir = require("expand-home-dir");

module.exports = function(opt){
  var self = _.defaults(require("./global")(),{
    dataDir: expandHomeDir("~/.parity"),
    spawn: function(){
      return self.process = child_process.spawn("parity", [
        "-j",
        opt.enode
      ]);
    }
  });

  return self;
};
