var child_process = require("child_process"),
    _ = require("lodash"),
    mkdirp = require("mkdirp"),
    fs = require("fs"),
    path = require("path"),
    template = require('es6-template-strings');

module.exports = function(opt){
  var self = {
    rpc: false,
    dataDir: path.join(opt.clientDir, "/ethereumj-core/database"),
    parse: function(str){
      return {
        syncStarted: !!str.match("Changing state from IDLE to HASH_RETRIEVING"),
        syncEnded: !!str.match("header sync completed"),
        blockNumber: getVal("block.number", str, "Number"),
        blockHash: getVal("block.hash", str),
        txSize: getVal("tx.size", str, "Number")
      };
    },
    spawn: function(){
      if(!opt.clientDir) throw new Error("clientDir not set - required");

      var configDir = path.join(opt.clientDir, "/ethereumj-core/config");

      mkdirp.sync(configDir);

      fs.writeFileSync(
        path.join(configDir, "ethereumj.conf"),
        template(fs.readFileSync("./templates/ethereumj.conf").toString(),{
          enode: opt.enode,
          reset: opt.rm
        }));
      
      return self.process = child_process.spawn("./gradlew",[
        "run"
      ], {
        cwd: opt.clientDir
      });
    }
  };

  function getVal(key, str, type){
    var val = (str.match(new RegExp(`${key}:\\s+([^,^\\s]+)`)) || [])[1];
    if(val){
      return (type == "Number") ? parseInt(val,10) : val;
    }
  };
  
  return self;
};
