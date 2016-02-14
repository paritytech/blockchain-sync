var child_process = require("child_process"),
    fs = require("fs"),
    path = require("path"),
    profileClientSync = require("./profileClientSync");



module.exports = function(mode, enode){
  if(! enode) throw new Error("Enode not provided (node index.js <mode> <enode>)");

  var client;

  (({
    pyethapp: function(){
      var dir = "/tmp/pyeth-new-sync";

      profileClientSync(dir, function(){
        return client = child_process.spawn("pyethapp", [
          "-b", enode,
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

      profileClientSync(dir, function(){
        return client = child_process.spawn("eth", [
          "--hermit",
          "-d", "/tmp/eth-new-sync",
          "--no-bootstrap",
          "--script", `web3.admin.net.connect(\"${enode}\")`,
          "-j"
        ]);
      }, handleExit);
    },
    geth: function(){
      var dir = "/tmp/geth-new-sync";
      profileClientSync(dir, function(){
        fs.writeFileSync(path.join(dir, "static-nodes.json"), JSON.stringify([
          enode
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
      profileClientSync(dir, function(){
        return client = child_process.spawn("parity", [
          "-j",
          enode
        ]);
      },handleExit);
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





