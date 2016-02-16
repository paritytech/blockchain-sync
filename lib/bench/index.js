var child_process = require("child_process"),
    fs = require("fs"),
    path = require("path"),
    mkdirp = require("mkdirp"),
    profileClientSync = require("./profileClientSync");

module.exports = function(opt){
  if(! opt.enode) throw new Error("Enode not provided (node index.js <mode> <enode>)");

  var client;

  (({
    pyethapp: function(){
      var dir = "/tmp/pyeth-new-sync";

      profileClientSync(dir, function(){
        return client = child_process.spawn("pyethapp", [
          "-b", opt.enode,
          "-c", "p2p.max_peers=1",
          "-c", "p2p.min_peers=1",
          "-c", "data_dir=/tmp/pyeth-new-sync",
          "-c","jsonrpc={corsdomain: '', listen_host: 127.0.0.1, listen_port: 8545}",
          "run"
        ]);
      });
    },
    eth: function(){
      var dir = "/tmp/eth-new-sync";

      profileClientSync(function(){
        return client = child_process.spawn("eth", [
          "--hermit",
          "-d", "/tmp/eth-new-sync",
          "--no-bootstrap",
          "--script", `web3.admin.net.connect(\"${opt.enode}\")`,
          "-j"
        ]);
      }, handleExit);
    },
    geth: function(){
      var dir = "/tmp/geth-new-sync";

      mkdirp.sync(dir);
      
      profileClientSync(function(){
        fs.writeFileSync(path.join(dir, "static-nodes.json"), JSON.stringify([
          opt.enode
        ]));

        return client = child_process.spawn("geth", [
          "--datadir", dir,
          "--nodiscover",
          "--rpc"
        ]);
      },handleExit);
    },
    parity: function(){
      var dir = "~/.parity";
      profileClientSync(function(){
        return client = child_process.spawn("parity", [
          "-j",
          opt.enode
        ]);
      },handleExit);
    }
  })[opt.client] || function(){
    throw new Error("unknown mode:", opt.client);
  })();

  function handleExit(err){
    if(err) console.log(err);
    
    client.kill();
    process.exit();
  }

  process.on('exit', handleExit);
  process.on('SIGINT', handleExit);
  process.on('uncaughtException', handleExit);
};





