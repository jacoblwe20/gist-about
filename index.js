var spawn = require('child_process').spawn;
	nodewebkit = spawn('node_modules/.bin/nodewebkit', ['app']),
  grunt = spawn('grunt');

nodewebkit.on('end', function(){
	throw "Node Webkit Exitted";	
});

// let node webkit be vocal
nodewebkit.stdout.pipe( process.stdout );
nodewebkit.stderr.pipe( process.stdout );
grunt.stdout.pipe( process.stdout );
grunt.stderr.pipe( process.stdout );
