var child_process = require("child_process"),
    mkdirp = require("mkdirp"),
    fs = require("fs"),
    path = require("path");


module.exports = function(opt){
  var dir = "/tmp/geth-new-sync";

  mkdirp.sync(dir);

  fs.writeFileSync(path.join(dir, "static-nodes.json"), JSON.stringify([
    opt.enode
  ]));

  return {
    dataDir: dir,
    process: child_process.spawn("geth", [
      "--datadir", dir,
      "--nodiscover",
      "--rpc"
    ])
  };
};
