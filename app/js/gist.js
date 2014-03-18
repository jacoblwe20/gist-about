var authKey,
	base = 'https://api.github.com',
	util = require('util'),
	EventEmitter = require('events').EventEmitter;

// need to sync ids with a database to
// allow for us to locally keep track of 
// users gist create here ~ maybe make a way to
// sync with exsisting gist

function Gist ( options ) {
	this._request = options.app.request;
	this.app = options.app;
	this.gistFolder = this.app.dataDir + '/gists';
	try {
		authKey = require( this.app.dataDir + '/auth.json').authToken
	} catch ( e ) {
		console.log('No User Auth Presented')
	}
}

util.inherits( Gist, EventEmitter );

Gist.prototype.create = function ( data, callback ) {
	var options = {
		json : data,
		url : base + '/gists',
		method : 'post'
	};
	this.emit('saving');
	this.request( options, callback );
};

Gist.prototype.update = function ( data, callback ) {
	var options = {
		json : data,
		url : base + '/gists/' + data.id,
		method : 'patch'
	};
	this.emit('saving');
	this.request( options, callback );
};

Gist.prototype.get = function ( data, callback ) {
	var options = {
		url : base + '/gists' + (( data.id ) ? ( '/' + data.id ) : ''),
		method : 'get'
	};
	this.request( options, callback );
};

Gist.prototype.getStarred = function ( data, callback ) {
	var options = {
		url : base + '/gists/starred',
		method : 'get'
	};
	this.request( options, callback );
};

Gist.prototype.request = function ( options, callback ) {

	if ( authKey ) {
		options.auth = {
			user : authKey,
			password : 'x-oauth-basic'
		}
	}

	options.headers = {
		'User-Agent' : 'Gist Desktop App'
	};
	this._request( options, function( err, res, body ) {
		var resp;
		if ( err ) return callback ( err );
		if ( typeof body === 'string' ) {
			try {
				resp = JSON.parse( body );
			} catch ( e ) {
				return callback ( e );
			}
		}
		if ( typeof body === 'object' ) {
			resp = body;
		}
		callback( null, resp );
	});
};

Gist.prototype.user = function ( callback ) {

	if ( !authKey ) return callback( new Error('No User') );

	var options = {
		url : base + '/user',
		method : 'get'
	};
	this.request( options, callback);
};

Gist.prototype.save = function ( callback, progress ) {
	var fileName = this.app.title.innerText,
		content = this.app.content.innerText,
		payload = {
			files : {}
		};
	callback = callback || function(){};
	payload.files[ fileName ] = {
		content : content
	};
	payload.description = "woot";
	payload.public = false;

	function done ( err, res ) {
		if ( err ) return callback ( err );
		this.emit('saved', res);
		this.app.currentlyEditing = res.id;
		this.store( res, callback );
	}

	done = done.bind( this );

	if ( this.app.currentlyEditing ) {
		// update
		payload.id = this.app.currentlyEditing;
		return this.update( payload, done );
	}
	this.create( payload, done );
};

Gist.prototype.destroy = function ( id, callback ) {
	var options = {
		url : base + '/gists/' + id,
		method : 'delete'
	},
	unlink = this.app.fs.unlinkSync( this.gistFolder + '/' + id + '.json');
	this.request( options, function ( err, res ) {
		callback( err, res );
		// check to see if its a really bad error not found is ok.
		this.emit('destroyed', err, res);
	}.bind(this));
};

Gist.prototype.store = function ( obj, callback ) {
	var fs = this.app.fs,
		json = JSON.stringify( obj, null, '\t' );
	if ( this.folderExsist() ){
		fs.writeFile( this.app.dataDir + '/gists/' + obj.id + '.json', json, function ( ) {
			console.log(arguments);
		});
	}
};

Gist.prototype.getLocal = function ( id ) { 
	var fs = this.app.fs;
	if ( !id ) {
		var files = fs.readdirSync( this.gistFolder ),
			payload = [];
		files.forEach(function( filename ){
			var file;
			var content = fs.readFileSync( this.gistFolder + '/' + filename ); 
			try {
				content = JSON.parse( content.toString('utf8') );
			} catch ( e ) { };
			if ( typeof content !== 'object' ) return;
			// needs to be expanded to handle multi files
			for( var key in content.files ) {
				file = content.files[ key ];
				file.id = content.id;
			}
			payload.push( file );
		}.bind( this ));
		// cache payload
		// the on and save actions mark as stale an refresh
		return payload;
	}
	var file = fs.readFileSync( this.gistFolder + '/' + id + '.json' ),
		content;
	try {
		content = JSON.parse( file.toString('utf8') );
	} catch ( e ) { };
	for( var key in content.files ) {
		file = content.files[ key ];
		file.id = content.id;
	}
	return file;
};

Gist.prototype.folderExsist = function ( ) {
	var exsist = this.app.fs.existsSync( this.gistFolder );
	if ( exsist ) {
		return true;
	}
	this.app.fs.mkdirSync( this.gistFolder );
	return true;
};

module.exports = Gist;