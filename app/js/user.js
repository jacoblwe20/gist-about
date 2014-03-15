function User ( options ) {
	this.attributes = options.user;
	this.app = options.app;
	if ( !options.skipCache ) {
		this.cache();
	}
}

User.prototype.get = function ( ) {
	return this.attributes;
};

User.prototype.store = function ( ) {
	console.log('storing');
	this.attributes.avatar_url = this.avatarCache;
	var data = JSON.stringify(this.attributes, null, '\t');
	this.app.fs.writeFile( this.app.dataDir + '/user.json', data, function( err ){
		if ( err ) console.error( err );
	});
};

User.prototype.downloadAvatar = function ( user, callback ) {
	this.folderExsist();
	var ext = user.avatar_url.split('.').pop().split(/[#\?\&]/g).shift(),
		fileName =  this.app.dataDir + '/cache/' + user.login + '.' + ext,
		stream = this.app.request( user.avatar_url )
			.pipe( this.app.fs.createWriteStream( fileName ) );
	this.avatarCache = fileName;
	stream.on('close', callback.bind( this ));
};

User.prototype.cache = function ( ) {
	this.downloadAvatar( this.attributes, function(){
		this.store( );
	});
};

User.prototype.folderExsist = function ( ) {
	var dir = this.app.dataDir + '/cache',
		exsist = this.app.fs.existsSync( dir );
	if ( exsist ) {
		return true;
	}
	this.app.fs.mkdirSync( dir );
	return true;
};

module.exports = User;