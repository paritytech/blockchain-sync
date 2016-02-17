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

    if(_.isNumber(state.blockNumber)){
      if(!self.isActive){
        console.log("Starting sync");
        self.isActive = true;
        startTime = process.hrtime();
      }
      
      
      self.currentBlock = state.blockNumber;
      self.time = elapsedSince(startTime);
      checkIfDone();
    }
  }

  function checkIfDone(){
    if(self.currentBlock >= topBlock){
      console.log(self.currentBlock, topBlock);
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
