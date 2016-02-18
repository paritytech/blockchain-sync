var child_process = require("child_process"),
    _ = require("lodash");


module.exports = function(opt){
  var self =  require("lodash").defaults(require("./"+opt.client)(opt), {
    associatedPids: [],
    fetchAssociatedPids: function(cb){
      var p = child_process.exec(
        `pgrep -P ${self.process.pid}`,
        (err, stdout, stderr)=>{
          if(err){
            cb && cb(null, []);
          }else{
            var pids = _(stdout.split("\n")).compact().map(function(i){
              return parseInt(i);
            }).without(p.pid).value();

            self.associatedPids = pids;
            
            cb && cb(null, pids);
          }
        });
    },
    rmData: function(){},
    spawn: function(){ throw new Error("Client must implement spawn()");}
  });

  if(opt.rm) self.rmData();

  self.spawn();

  self.fetchAssociatedPids();
  
  return self;
};
