var usage = require("usage"),
    numeral = require("numeral"),
    _ = require("lodash");

module.exports = function(pid){
  var self = {
    reports: [],
    profile: function(cb){
      usage.lookup(pid, function(err, usage){
        self.reports.push(usage);

        cb(err, format(usage));
      });
    },
    average: function(){
      return format(_.reduce(self.reports, function(rep, u){
        return {
          memory: rep.memory + u.memory / self.reports.length,
          cpu: rep.cpu + u.cpu / self.reports.length,
          memoryInfo: {
            rss: rep.memoryInfo.rss + u.memoryInfo.rss / self.reports.length,
            vsize: rep.memoryInfo.vsize + u.memoryInfo.vsize / self.reports.length
          }
        };
      }, {
        memory: 0,
        cpu: 0,
        memoryInfo: {
          rss: 0,
          vsize: 0
        }
      }));
    }
  };

  
  function format(usage){
    return {
      memory: formatMem(usage.memory),
      cpu: Math.round(usage.cpu) + "%",
      memoryInfo: {
        rss: formatMem(usage.memoryInfo.rss),
        vsize: formatMem(usage.memoryInfo.vsize)
      }
    };
  }
  
  function formatMem(mem){ return numeral(mem).format("0.000b"); };

  return self;
};
