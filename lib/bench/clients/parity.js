var child_process = require("child_process");

module.exports = function(opt){
  return {
    dataDir: "~/.parity",
    process: child_process.spawn("parity", [
      "-j",
      opt.enode
    ])
  };
};
