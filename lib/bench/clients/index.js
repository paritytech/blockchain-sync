module.exports = function(opt){
  return require("lodash").extend({
    getPid: function(){
      return this.process.pid;
    },
    fetchAssociatedPids: function(cb){
      cb(null, []);
    },
    getAssociatedPids: function(){
      return [];
    }
  }, require("./"+opt.client)(opt));
};
