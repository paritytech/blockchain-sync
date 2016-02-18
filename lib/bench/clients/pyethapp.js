var child_process = require("child_process"),
    _ = require("lodash");

module.exports = function(opt){
  var self = _.defaults(require("./global")(),{
    rpc: false,
    dataDir: "/tmp/pyeth-new-sync",
    parse: function(str){
      var parsed = str.match(/Block\(#([0-9]+)\s([^\)]+)/) || [];

      return {
        syncStarted: !!str.match("spawning new syntask"),
        blockNumber: parseInt(parsed[1],10),
        blockHash: parsed[2]
      };
    },
    spawn: function(){
      return self.process = child_process.spawn("pyethapp", [
        "-b", opt.enode,
        "-c", "p2p.max_peers=1",
        "-c", "p2p.min_peers=1",
        "-c", `data_dir=${self.dataDir}`,
        "-c","jsonrpc={corsdomain: '', listen_host: 127.0.0.1, listen_port: 8545}",
        "run"
      ]);
    }
  });

  return self;
};
