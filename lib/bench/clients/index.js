module.exports = function(opt){
  return require("lodash").extend({
    getPid: function(){
      return this.process.pid;
    }
  }, require("./"+opt.client)(opt));
};
