var _ = require("lodash"),
    mkdirp = require("mkdirp"),
    fs = require("fs"),
    Web3 = require("web3");


var REPORT_FREQUENCY = 1000;//ms


module.exports =   function(spawnClient, opt, done){
  var web3Master = new Web3(new Web3.providers.HttpProvider("http://localhost:8546")),
      highestBlock = web3Master.eth.blockNumber,
      client = spawnClient(),
      usage = require("./usage")(client.pid);

  logClient(client);

  if(_.isFunction(opt)) done = opt;

  var finalReport = function(poll){
    console.log("PID:", client.pid);
    console.log("Blocks processed:", poll.currentBlock);
    console.log("Sync took:", poll.time.toFixed(3) + "s");
    console.log("Usage (average)", JSON.stringify(usage.average(), null, 2));
  };

  var poll = require("./rpcPoll")(highestBlock,{},function(err,poll){
    console.log("done");

    finalReport(poll);

    done(err);
  });

  setInterval(function(){
    if(poll.isActive){
      usage.profile((err,usage) => {
        if(err) throw err;
        
        console.log({
          blocks: poll.currentBlock + " / " + highestBlock,
          time: poll.time,
          pid: client.pid,
          usage
        });
        
      });
    }
  },REPORT_FREQUENCY);
};

function logClient(client){
  mkdirp.sync("./logs");
  
  var store = (data) => {
    fs.appendFile("./logs/"+client.pid+".txt", data);
  };
  
  client.stdout.on("data", store);
  client.stderr.on("data", store);
};

