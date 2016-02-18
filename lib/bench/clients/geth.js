var child_process = require("child_process"),
    mkdirp = require("mkdirp"),
    _ = require("lodash"),
    fs = require("fs"),
    path = require("path");


module.exports = function(opt){
  var self = _.defaults(require("./global")(),{
    dataDir: "/tmp/geth-new-sync",
    spawn: function(){
      fs.writeFileSync(path.join(self.dataDir, "static-nodes.json"), JSON.stringify([
        opt.enode
      ]));
      
      return self.process = child_process.spawn("geth", [
        "--datadir", self.dataDir,
        "--nodiscover",
        "--rpc"
      ]);
    }
  });

  mkdirp.sync(self.dataDir);

  return self;
};
