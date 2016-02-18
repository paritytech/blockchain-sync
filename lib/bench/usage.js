var usage = require("usage"),
    async = require("async"),
    numeral = require("numeral"),
    _ = require("lodash");

module.exports = function(client){
  var self = {
    reports: [],
    profile: function(cb){
      async.auto({
        main: function(cb){
          usage.lookup(client.process.pid,cb);
        },
        fetch: client.fetchAssociatedPids,
        associated: ["fetch", function(cb, results){
          async.map(results.fetch, function(pid, cb){
            usage.lookup(pid,cb);
          }, cb);
        }]
      }, function(err, results){
        if(err) throw err;
        
        var totalUsage = merge(_.union(results.associated,[results.main]));
        self.reports.push(totalUsage);
        cb(err, format(totalUsage));
      });
    },
    average: function(){
      return format(_.reduce(self.reports, function(rep, u){
        return {
          memory: rep.memory + u.memory / self.reports.length,
          cpu: rep.cpu + u.cpu / self.reports.length
        };
      }, {
        memory: 0,
        cpu: 0
      }));
    }
  };

  function merge(usages){
    return _.reduce(usages, function(res, u){
      return u ? {
        memory: u.memory + res.memory,
        cpu: u.cpu + res.cpu
      } : res;
    }, {
      memory: 0,
      cpu: 0
    });
  }

  
  function format(usage){
    return {
      memory: formatMem(usage.memory),
      cpu: Math.round(usage.cpu) + "%"
    };
  }
  
  function formatMem(mem){ return numeral(mem).format("0.000b"); };

  return self;
};
