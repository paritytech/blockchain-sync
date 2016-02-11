var Web3 = require("web3"),
    rimraf = require("rimraf"),
    child_process = require("child_process"),
    fs = require("fs"),
    path = require("path"),
    mkdirp = require("mkdirp");

var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

var enode = process.argv[3],
    mode = process.argv[2];

if(! enode) throw new Error("Enode not provided (node index.js <mode> <enode>)");

(({
  geth: function(){
    var dir = "/tmp/geth-slave";
    profileClientSync(dir, function(){
      fs.writeFileSync(path.join(dir, "static-nodes.json"), JSON.stringify([
        enode
      ]));

      return child_process.spawn("geth", [
        "--datadir",
        "/tmp/geth-slave/",
        "--nodiscover",
        "--rpc"
      ]);
    });
  },
  parity: function(){
    var dir = "~/.parity";
    profileClientSync(dir, function(){
      return child_process.spawn("parity", [
        "-j",
        enode
      ]);
    });
  }
})[mode] || function(){
  throw new Error("unknown mode:", mode);
})();



function profileClientSync(datadir, spawnClient){
  datadir = require("expand-home-dir")(datadir);
  
  console.log("rm", datadir);
  rimraf.sync(datadir);

  mkdirp(datadir, function(err){
    if(err) throw err;

    var client = spawnClient();

    function handleExit(){
      console.log("EXIT", arguments);
      client.kill();
      process.exit();
    }

    process.on('exit', handleExit);
    process.on('SIGINT', handleExit);
    process.on('uncaughtException', handleExit);


    // client.stdout.on("data", (data) => {
    //   console.log(`OUT: ${data}`);
    // });
    
    // client.stderr.on("data", (data) => {
    //   console.log(`ERR: ${data}`);
    // });



    var startTime;

    web3.eth.isSyncing(function(err, sync){
      if(err) throw err;

      console.log("syncing?", sync);

      if(sync === true){
        console.log("Syncing");
        startTime = process.hrtime();
      } 

      if(sync === false  || (sync.highestBlock && (sync.highestBlock === sync.currentBlock))){
        var endTime = process.hrtime(startTime);
        console.log("Sync took:", (endTime[0] + endTime[1] / 1000000000).toFixed(3) + "s");

        client.kill();
        
        process.exit();
      } 
    });
  });
}



