var _ = require("lodash");

//TODO: DRY

module.exports = function(topBlock, client, cb){
  var self = {
    time: 0,
    isActive: false
  }, startTime;

  client.process.stdout.on("data", processData);

  function processData(data){
    var state = client.parse(data.toString());

    if(!self.isActive && state.syncStarted){
      console.log("Starting sync");
      self.isActive = true;
      startTime = process.hrtime();
    }
    
    if(_.isNumber(state.blockNumber)) self.currentBlock = state.blockNumber;

    if(self.isActive) self.time = elapsedSince(startTime);
    
    checkIfDone(state);
  }

  function checkIfDone(state){
    if(self.currentBlock >= topBlock && state.syncEnded){
      self.isActive = false;
      cb(null, self);
    }
  }

  return self;
};

//TODO: DRY
function elapsedSince(start){
  var endTime = process.hrtime(start);

  return (endTime[0] + endTime[1] / 1000000000);
}
