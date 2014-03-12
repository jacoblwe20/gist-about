var authKey,
	base = 'https://api.github.com';

try {
	authKey = require('../config/auth.json').auth
} catch ( e ) { }

// need to sync ids with a database to
// allow for us to locally keep track of 
// users gist create here ~ maybe make a way to
// sync with exsisting gist

function Gist ( request ) {
	this._request = request;
}

Gist.prototype.create = function ( data, callback ) {
	var options = {
		form : data,
		url : base + '/gists',
		method : 'post'
	};
	this.request( options, callback );
};

Gist.prototype.update = function ( data, callback ) {
	var options = {
		form : data,
		url : base + '/gists/' + data.id,
		method : 'patch'
	};
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
		try {
			resp = JSON.parse( body );
		} catch ( e ) {
			return callback ( e );
		}
		callback( null, resp );
	})
};

module.exports = Gist;