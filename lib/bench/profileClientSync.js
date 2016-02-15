var rimraf = require("rimraf"),
    numeral = require("numeral"),
    _ = require("lodash"),
    mkdirp = require("mkdirp"),
    usage = require("usage"),
    Web3 = require("web3");

var REPORT_FREQUENCY = 10000;//ms


module.exports =   function(datadir, spawnClient, cb){
  var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
  
  datadir = require("expand-home-dir")(datadir);
  

  //rimraf.sync(datadir);

  mkdirp(datadir, function(err){
    if(err) throw err;

    var client = spawnClient();

    logClient(client);

    var usageReports = [];

    var saveUsage = function(usage){
      console.log("save usage!");
      usageReports.push(usage);
    };

    var reportUsage = function(sync, usage, time){
      console.log("syncing:", JSON.stringify({
        sync,
        usage,
        time
      }, null, 2));
    };

    var profileClient = _.throttle(function(sync, time){
      try{
        usage.lookup(client.pid, function(err, usage){
          if(err) console.log(err);

          if(startTime) reportUsage(sync, usage, time);
          saveUsage(usage);
        });
      } catch(e){
        console.log("Usage lookup failed:", e);
      }
    }, REPORT_FREQUENCY, {trailing: false});

    var finalReport = function(time){
      var usage = _.reduce(usageReports, function(rep, u){
        return {
          memory: rep.memory + u.memory / usageReports.length,
          cpu: rep.cpu + u.cpu / usageReports.length,
          memoryInfo: {
            rss: rep.memoryInfo.rss + u.memoryInfo.rss / usageReports.length,
            vsize: rep.memoryInfo.vsize + u.memoryInfo.vsize / usageReports.length
          }
        };
      }, {
        memory: 0,
        cpu: 0,
        memoryInfo: {
          rss: 0,
          vsize: 0
        }
      });

      var formatMem = function(mem){ return numeral(mem).format("0.000b"); };

      console.log("Blocks processed:", web3.eth.blockNumber);
      console.log("Sync took:", time.toFixed(3) + "s");

      console.log("Usage (average)", JSON.stringify({
        memory: formatMem(usage.memory),
        cpu: Math.round(usage.cpu) + "%",
        memoryInfo: {
          rss: formatMem(usage.memoryInfo.rss),
          vsize: formatMem(usage.memoryInfo.vsize)
        }
      }, null, 2));
    };

    var highestBlock,
        startTime,
        totalTime = 0;
    

    web3.eth.isSyncing((err, sync) =>{
      if(err) throw err;

      if(web3.eth.blockNumber >= highestBlock){
        console.log("done");
        totalTime += elapsedSince(startTime);

        reportUsage(sync, usage, totalTime);
        finalReport(totalTime);
        cb();
      } else if((!sync || !web3.net.peerCount) && startTime){
        console.log(web3.net.peerCount, startTime);
        console.log("Sync stopped prematurely. Restarting client");

        totalTime += elapsedSince(startTime);
        
        startTime = 0;

        client.kill();
        client.on("exit", function(){
          client = spawnClient();
          logClient(client);
        });
      }
      
      if(sync && !startTime){
        console.log("Starting sync");
        startTime = process.hrtime();
      }

      
      if(startTime) profileClient(sync, elapsedSince(startTime) + totalTime);


      if(sync.highestBlock) highestBlock = sync.highestBlock;

    });
  });

  function logClient(client){
    client.stdout.on("data", (data) => {
      console.log(`OUT: ${data}`);
    });
    
    client.stderr.on("data", (data) => {
      console.log(`ERR: ${data}`);
    });
  }
};

function elapsedSince(start){
  var endTime = process.hrtime(start);

  return (endTime[0] + endTime[1] / 1000000000);
}
