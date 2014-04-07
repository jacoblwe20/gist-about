var spawn = require('child_process').spawn,
  cmds = [
    ['node_modules/.bin/nodewebkit', ['app']],
    ['grunt']
  ];

function startProcess ( args, index ) {
  var cmd = spawn.apply( null, args );
  cmd.stdout.pipe( process.stdout );
  cmd.stderr.pipe( process.stdout );
  cmd.on('close', function(){
    process.exit();
  });
}

cmds.forEach( startProcess )
