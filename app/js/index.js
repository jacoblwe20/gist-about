'use strict';

var app = {};

// basic ui stuff and attaching window
app._window = this;
app.gui = require('nw.gui');
app.request = require('request');
app.gist = new ( require('./js/gist') )( app.request );
app.menu = (require('./js/menu')).bind( app );
app.test = function ( ) { 
	app.gist.get({}, function ( err, res ) {
		if ( err ) return alert( err.message );
		alert( typeof res );
	})
}

app.menu( app.gui );