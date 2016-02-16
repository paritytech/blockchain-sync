var child_process = require("child_process");

module.exports = function(opt,cb){
  var self = {},
      dir = "/tmp/eth-new-sync";

  require("../profileClientSync")(function(){
    return self.process = child_process.spawn("eth", [
      "--hermit",
      "-d", "/tmp/eth-new-sync",
      "--no-bootstrap",
      "--script", `web3.admin.net.connect(\"${opt.enode}\")`,
      "-j"
    ]);
  }, function(err){ cb(err, self); });

  return self;
};
