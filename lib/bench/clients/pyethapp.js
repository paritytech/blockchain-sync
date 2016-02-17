var child_process = require("child_process");

module.exports = function(opt){
  return {
    dataDir: "/tmp/pyeth-new-sync",
    process: child_process.spawn("pyethapp", [
      "-b", opt.enode,
      "-c", "p2p.max_peers=1",
      "-c", "p2p.min_peers=1",
      "-c", "data_dir=/tmp/pyeth-new-sync",
      "-c","jsonrpc={corsdomain: '', listen_host: 127.0.0.1, listen_port: 8545}",
      "run"
    ])
  };
};
