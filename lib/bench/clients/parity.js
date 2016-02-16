var child_process = require("child_process");

module.exports = function(opt, cb){
  var dir = "~/.parity";
  var self = {};
  
  require("../profileClientSync")(function(){
    return self.process = child_process.spawn("parity", [
      "-j",
      opt.enode
    ]);
  },function(err){
    cb(err,self);
  });

  return self;
};
