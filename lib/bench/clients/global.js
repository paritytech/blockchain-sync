var rimraf = require("rimraf"),
    mkdirp = require("mkdirp");
    
module.exports = function(){
  var self =  {
    rmData: function(){
      rimraf.sync(self.dataDir);
      mkdirp.sync(self.dataDir);
    }
  };

  return self;
};
