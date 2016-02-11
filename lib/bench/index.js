var child_process = require("child_process"),
    fs = require("fs"),
    path = require("path"),
    profileClientSync = require("./profileClientSync");



module.exports = function(mode, enode){
  if(! enode) throw new Error("Enode not provided (node index.js <mode> <enode>)");

  var client;

  (({
    geth: function(){
      var dir = "/tmp/geth-slave";
      profileClientSync(dir, function(){
        fs.writeFileSync(path.join(dir, "static-nodes.json"), JSON.stringify([
          enode
        ]));

        return client = child_process.spawn("geth", [
          "--datadir",
          "/tmp/geth-slave/",
          "--nodiscover",
          "--rpc"
        ]);
      },function(){
        client.kill();
        
        process.exit();
      });
    },
    parity: function(){
      var dir = "~/.parity";
      profileClientSync(dir, function(){
        return client = child_process.spawn("parity", [
          "-j",
          enode
        ]);
      },function(){
        client.kill();
        
        process.exit();
      });
    }
  })[mode] || function(){
    throw new Error("unknown mode:", mode);
  })();

  function handleExit(){
    console.log("EXIT", arguments);
    client.kill();
    process.exit();
  }

  process.on('exit', handleExit);
  process.on('SIGINT', handleExit);
  process.on('uncaughtException', handleExit);
};





