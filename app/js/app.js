var EventEmitter = require('events').EventEmitter,
	util = require('util');

/* 
 * App Contructor
 * =======================
 * This is the base app and help pass a global context
 * and load modules into app without repetitious patterns
 */

function App ( context, options ) {
	// this allows for a little bit of magic
	// require('./app')( ) will make a new instance and
	// have the global context 
	if ( !(this instanceof App) ) {
		return new App( this, context );
	}
	// cache context & options
	this.context = context;
	this.options = options;
	this.state = options.state || {};

	// core modules
	this._ = require('lodash');
	this.util = util;
	this.import('nw.gui');
	this.$window = app.gui.Window.get();
	this.import('fs');
	this.import('request');
	this.import('handlebars');

	// inherit the window object
	this._.forIn( this.context, function ( value, key ) {
		if ( this[key] ){
			console.warn('Overwriting App.' + key)
		}
		this[ key ] = value;
	}, this);

	// configuration of app
	this.configure();
	return this;
}

/* 
 * Inherit EventEmitter
 */

util.inherits( App, EventEmitter );

/* 
 * App Import
 * =======================
 * app.import will load a module 
 * 
 */

App.prototype.import = function( _module, args, isConstructor ) {
	console.log('hello')
	var name = _module
			// file directory
			.split('/').pop()
			// object chain
			.split('.').pop()
			//dashes
			.split('-').pop();
	if ( this[name] ){
		console.warn('Overwriting App.' + name)
	}
	if ( isConstructor && args ) {
		var Mod = this.require( _module );
		function Constructor ( ) {
			return Mod.apply( this, args );
		}
		Constructor.prototype = Mod.prototype;
		return this[ name ] = new Constructor();
	}

	if ( args ) {
		return this.require( _module ).apply( args );
	}
	this[name] = this.require( _module );
};

App.setState = function ( stateObj ) {
	this.state = stateObj;
};

App.prototype.configure = function ( ) {
	var userDataPath,
		userDataFolder;
	this.homeDir = this.process.env[
		(this.process.platform == 'win32') ? 'USERPROFILE' : 'HOME']
	this.config = this.require('./config/' + ( this.process.platform || 'linux') + '.json');
	
	userDataPath = this.homeDir + this.config.userData + '.gist-about',
	userDataFolder = this.fs.existsSync( userDataPath );
	if ( !userDataFolder ) {
		this.fs.mkdir( userDataPath );
	}
};

App.prototype.View = function ( _module ) {
	this.views = this.views || {};
	this.views.require = this.require;
	this.import.bind( this.views, _module );
}


module.exports = App;