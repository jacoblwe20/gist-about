'use strict';


var app = {},
	user;
// basic ui stuff and attaching window
app._window = this;
app.gui = require('nw.gui');
app.config = require('./config/' + ( process.platform || 'linux') + '.json');
app.homeDir = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
app.$window = app.gui.Window.get();
app.request = require('request');
app.util = require('util');
app.fs = require('fs');
app.markdown = require('github-flavored-markdown');
app.highlighter = require('highlight.js');
app.Handlebars = require('handlebars');
app.closeEl = document.querySelector('.icon-cross');
app.listEl = document.querySelector('.icon-list');
app.list = document.querySelector('aside');
app.content = document.getElementById('editor');
app.title = document.querySelector('.document-title');
app.article = document.querySelector('article');
app.editor = new ( require('./js/editor') )( app );
app.templates = new ( require('./js/templates') )({ app : app })
app.templates.registerHelpers( require('./js/helpers') );

// configure
var userDataPath = app.homeDir + app.config.userData + '.gist-about',
	userDataFolder = app.fs.existsSync( userDataPath );
if ( !userDataFolder ) {
	app.fs.mkdir( userDataPath );
}
app.dataDir = userDataPath;
app.gist = new ( require('./js/gist') )( { app : app } );

// setup menu system
app.menu = (require('./js/menu')).bind( app );
app.menu( app.gui );
app.closeEl.addEventListener('click', function( e ){
	app._window.close();
});


app.listEl.addEventListener('click', function( e ){
	app.list.classList.toggle('show');
	// install handlebars and render a template here with data
	if ( app.user ) {
		var user = app.user.get(),
			html;
		user.files = app.gist.getLocal();
		html = app.templates.render('list.hbs', user);
		app.list.innerHTML = app.templates.render('list.hbs', user);
	}
});

try {
	user = require( app.dataDir + '/user.json');
} catch ( e ) { }

if ( user ) {
	app.user = new (require('./js/user'))( {
		app : app,
		user : user,
		skipCache : true
	});
} else {
	app.gist.user(function( err, res ) {
		if ( err ) return;
		app.user = new (require('./js/user'))( {
			app : app,
			user : res 
		});
	});
}
