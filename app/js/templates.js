function Templates ( options ) {
	this.dir = options.dir || './templates/';
	this.app = options.app;
	this.Handlebars = options.app.Handlebars;
}

Templates.prototype._getTemplate = function ( name, callback ) {
	var template,
		fs = this.app.fs;
	if ( fs.existsSync( this.dir + name ) ) {
		return fs.readFile( this.dir + name, callback );
	}
	callback( new Error('No template ' + name + ' found.'))
};

Templates.prototype._getTemplateSync = function ( name ) {
	var template,
		fs = this.app.fs;
	if ( fs.existsSync( this.dir + name ) ) {
		return fs.readFileSync( this.dir + name );
	}
};

Templates.prototype.render = function ( name, data, callback ) {
	var template,
		results;

	template = this._getTemplateSync( name );

	if ( template ) {
		template = this.Handlebars.compile( template.toString('utf8') );
		return template( data );
	}
	return console.error( new Error('No template "' + name + '" Found'))
};

Templates.prototype.registerHelpers = function ( helpers ) {
	var _this = this;
	for( var key in helpers ) {
		this.Handlebars.registerHelper( key, function(){
			this.app = _this.app;
			return helpers[ key ].apply( this, arguments ); 
		});
	}
};
module.exports = Templates;