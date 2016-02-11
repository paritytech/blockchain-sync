var rimraf = require("rimraf"),
    numeral = require("numeral"),
    _ = require("lodash"),
    mkdirp = require("mkdirp"),
    usage = require("usage"),
    Web3 = require("web3");

var REPORT_FREQUENCY = 30000;//ms


module.exports =   function(datadir, spawnClient, cb){
  var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
  
  datadir = require("expand-home-dir")(datadir);
  
  rimraf.sync(datadir);

  mkdirp(datadir, function(err){
    if(err) throw err;

    var client = spawnClient();



    // client.stdout.on("data", (data) => {
    //   console.log(`OUT: ${data}`);
    // });
    
    // client.stderr.on("data", (data) => {
    //   console.log(`ERR: ${data}`);
    // });



    var startTime;

    var usageReports = [];

    var saveUsage = _.throttle(function(usage){
      console.log("save usage!");
      usageReports.push(usage);
    }, REPORT_FREQUENCY);

    var reportUsage = _.throttle(function(sync, usage, time){
      console.log("syncing:", JSON.stringify({
        sync,
        usage,
        time
      }, null, 2));
    }, REPORT_FREQUENCY);

    var finalReport = function(blocks){
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

      var formatMem = function(mem){ return numeral(mem).format("0b"); };


      console.log("Blocks processed:", web3.eth.blockNumber);
      console.log("Sync took:", elapsedSince(startTime).toFixed(3) + "s");

      console.log("Usage (average)", JSON.stringify({
        memory: formatMem(usage.memory),
        cpu: Math.round(usage.cpu) + "%",
        memoryInfo: {
          rss: formatMem(usage.memoryInfo.rss),
          vsize: formatMem(usage.memoryInfo.vsize)
        }
      }, null, 2));
    };
    

    web3.eth.isSyncing((err, sync) =>{
      if(err) throw err;


      if(sync === true){
        console.log("Starting sync");
        startTime = process.hrtime();
      }

      if(startTime){
        usage.lookup(client.pid, function(err, usage){
          if(err) console.log(err);

          reportUsage(sync, usage, elapsedSince(startTime));
          saveUsage(usage);
        });
      }

      if(sync === false  || (sync.highestBlock && (sync.highestBlock === sync.currentBlock))){
        finalReport();
        cb();
      } 
    });
  });
};

function elapsedSince(start){
  var endTime = process.hrtime(start);

  return (endTime[0] + endTime[1] / 1000000000);
}
