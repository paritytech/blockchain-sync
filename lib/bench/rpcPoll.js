var _ = require("lodash"),
    Web3 = require("web3");


module.exports = (topBlock, opt, cb) => {
  var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545")),
      startTime;
  
  opt = _.extend({
  }, opt);

  var self = {
    time: 0,
    isActive: false
  };

  function connect(){
    if(web3.isConnected()){
      onConnect();
    } else {
      setTimeout(connect, 1000);
    }
  };

  connect();

  function onConnect(){
    self.currentBlock = web3.eth.blockNumber;

    checkIfDone();

    web3.eth.isSyncing((err, sync) =>{
      if(err) cb(err, self);

      if(sync && !startTime){
        console.log("Starting sync");

        self.isActive = true;
        
        startTime = process.hrtime();
      }

      if(startTime) self.time = elapsedSince(startTime);

      checkIfDone();
    });
  }

  function checkIfDone(){
    self.currentBlock = web3.eth.blockNumber;
    
    if(self.currentBlock >= topBlock){
      console.log(self.currentBlock, topBlock);
      self.isActive = false;
      cb(null, self);
    }
  }
  
  return self;
};

function elapsedSince(start){
  var endTime = process.hrtime(start);

  return (endTime[0] + endTime[1] / 1000000000);
}
