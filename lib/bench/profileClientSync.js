var rimraf = require("rimraf"),
    mkdirp = require("mkdirp"),
    Web3 = require("web3");


module.exports =   function(datadir, spawnClient, cb){
  var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
  
  datadir = require("expand-home-dir")(datadir);
  
  rimraf.sync(datadir);

  mkdirp(datadir, function(err){
    if(err) throw err;

    var client = spawnClient();



    client.stdout.on("data", (data) => {
      console.log(`OUT: ${data}`);
    });
    
    client.stderr.on("data", (data) => {
      console.log(`ERR: ${data}`);
    });



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

        cb();
      } 
    });
  });
};
