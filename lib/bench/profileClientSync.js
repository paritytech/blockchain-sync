var _ = require("lodash"),
    mkdirp = require("mkdirp"),
    fs = require("fs"),
    Web3 = require("web3");


var REPORT_FREQUENCY = 5000;//ms


module.exports =   function(client, opt, done){
  if(!client || !client.process) throw new Error("No client process found.");
  
  var web3Master = new Web3(new Web3.providers.HttpProvider("http://localhost:8546")),
      highestBlock = web3Master.eth.blockNumber,
      usage = require("./usage")(client),
      poll = (client.rpc === false) ? require("./stdPoll") : require("./rpcPoll");

  logClient(client.process); //true for debug

  if(_.isFunction(opt)) done = opt;

  var finalReport = function(poll){
    console.log("PID:", client.process.pid);
    console.log("Associated PIDs:", client.associatedPids);
    console.log("Blocks processed:", poll.currentBlock);
    console.log("Sync took:", poll.time.toFixed(3) + "s");
    console.log("Usage (average)", JSON.stringify(usage.average(), null, 2));
  };

  
  poll = poll(highestBlock,client,function(err,poll){
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
          pid: client.process.pid,
          associatedPids: client.associatedPids,
          usage
        });
        
      });
    }
  },REPORT_FREQUENCY);
};

function logClient(ps,print){
  mkdirp.sync("./logs");
  
  var store = (data) => {
    fs.appendFile("./logs/"+ ps.pid+".txt", data);
  };
  
  ps.stdout.on("data", store);
  ps.stderr.on("data", store);

  if(print){
    ps.stdout.on("data", function(data){
      console.log("OUT:",data.toString());
    });
    ps.stderr.on("data", function(data){
      console.log("ERR:",data.toString());
    });
  }
};

