var child_process = require("child_process");

module.exports = function(opt){
  return {
    dataDir: "/tmp/eth-new-sync",
    process: child_process.spawn("eth", [
      "--hermit",
      "-d", "/tmp/eth-new-sync",
      "--no-bootstrap",
      "--script", `web3.admin.net.connect(\"${opt.enode}\")`,
      "-j"
    ])
  };
};
