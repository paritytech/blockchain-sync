var child_process = require("child_process"),
    mkdirp = require("mkdirp"),
    fs = require("fs"),
    path = require("path");


module.exports = function(opt, cb){
  var dir = "/tmp/geth-new-sync",
      self = {};

  mkdirp.sync(dir);
  
  require("../profileClientSync")(function(){
    fs.writeFileSync(path.join(dir, "static-nodes.json"), JSON.stringify([
      opt.enode
    ]));

    return self.process = child_process.spawn("geth", [
      "--datadir", dir,
      "--nodiscover",
      "--rpc"
    ]);
  },function(err){ cb(err,self); });

  return self;
};
