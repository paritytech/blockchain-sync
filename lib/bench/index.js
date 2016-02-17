module.exports = function(opt){
  if(! opt.enode) throw new Error("Enode not provided (node index.js <mode> <enode>)");

  var client = require("./clients")(opt);

  require("./profileClientSync")(client, function(err){
    if(err) console.log(err);
    
    handleExit(err,client);
  });

  function handleExit(err, client){
    if(err) console.log(err);
    if (client && client.process){
      console.log("kill client:",client.process.pid);
      client.process.kill();
    } 
    process.exit();
  }

  process.on('exit', handleExit);
  process.on('SIGINT', handleExit);
  process.on('uncaughtException', handleExit);
};





