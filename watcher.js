var watch = require('watch'),
    exec = require("child_process").exec;
console.log("MONITORING");

var syncInProgress = false;
setInterval(function() {
  if (syncInProgress) return;
  syncInProgress = true;
  exec('rsync -avz --exclude "node_modules" . pi@192.168.2.6:/media/pi/projects/Jeffrey/', function(err,stdout,stderr) {
    if (err)
      console.log(err,stdout,stderr);
    
    syncInProgress = false;
  });
},500);
/*
  var syncTimer = false, syncInProgress = false;

  var sync = function sync() {
    console.log("SYNC?", syncInProgress); 
    syncTimer = clearTimeout(syncTimer);

    if (syncInProgress) {
      syncTimer = setTimeout(sync,100);
      return;
    }
    syncInProgress = true;
    syncTimer = setTimeout(function() {
      console.log("SYNCING");
      exec('rsync -avz --exlclude "node_modules" . pi@192.168.2.6:/media/pi/project/Jeffrey/', function(err,stdout,stderr) {
        console.log(err,stdout,stderr);
        syncInProgress = false;
      })
    },100);
  };


  watch.createMonitor('.', function (monitor) {
    monitor.on("created",sync);
    monitor.on("changed",sync);
    monitor.on("removed",sync);
  })
  */