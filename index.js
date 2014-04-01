var spawn = require('child_process').spawn;
	nodewebkit = spawn('node_modules/.bin/nodewebkit', ['app']),
	myth = spawn('node_modules/.bin/myth', 
		['-watch', 'app/css/myth/main.css', 'app/css/main.css']);

nodewebkit.on('end', function(){
	throw "Node Webkit Exitted";	
});

myth.on('end', function(){
	throw "Myth Exitted";	
});

// let node webkit be vocal
nodewebkit.stdout.pipe( process.stdout );
nodewebkit.stderr.pipe( process.stdout );
