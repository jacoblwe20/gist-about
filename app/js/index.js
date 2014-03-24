'use strict';

var app = {},
	user;

// basic ui stuff and attaching window
app._ = require('lodash');
app._window = this;
app.gui = require('nw.gui');
app.config = require('./config/' + ( process.platform || 'linux') + '.json');
app.storage = localStorage;
app.state = JSON.parse(localStorage.getItem('state') || '{}');
app.homeDir = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
app.$window = app.gui.Window.get();
app.request = require('request');
app.util = require('util');
app.fs = require('fs');
app.markdown = require('github-flavored-markdown');
app.highlighter = require('highlight.js');
app.Handlebars = require('handlebars');
app.nav = document.querySelector('nav');
app.closeEl = document.querySelector('.icon-cross');
app.listEl = document.querySelector('.icon-list');
app.list = document.querySelector('aside');
app.message = document.querySelector('.message');
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

app.open = function ( e ) {
	var id,
		file;

	if( typeof e === 'object' ){
		id = e.dataset.id;
		file = app.gist.getLocal( id );
	} else if ( typeof e === 'string' ) {
		id = e;
		file = app.gist.getLocal( id );
	}

	if( file ) {
		app.state.id = id;
		app.storage.setItem('state', JSON.stringify(app.state));
		app.content.innerText = file.content;
		app.title.innerText = file.filename;
		app.currentlyEditing = id;
		app.list.classList.remove('show');
		app.nav.classList.remove('new');
		app.editor.closePreview();
		app.editor.highlight();
	}
};

app.new = function (  ) {
	app.title.innerText = "NEW.md";
	app.content.innerText = "## Hello World";
	app.currentlyEditing = null;
	app.state.id = null;
	app.storage.setItem('state', JSON.stringify(app.state));
	app.list.classList.remove('show');
	app.nav.classList.add('new');
	app.editor.highlight();
};

app.openMenu = function ( ) {
	app.list.classList.toggle('show');
	// install handlebars and render a template here with data
	if ( app.user ) {
		var user = app.user.get(),
			html;
		user.files = app.gist.getLocal();
		html = app.templates.render('list.hbs', user);
		app.list.innerHTML = app.templates.render('list.hbs', user);
	}
};

app.listenTo = function ( selector, _event, el, fn ){
	el.addEventListener( _event, function ( e ) {
		var target = e.target;
		// right now only supports tagName
		if ( target.tagName.toLowerCase() === selector ) {
			fn( e );
		}
	}, false);
};

app.setMessage = function ( msg ) {
	var classList = app.message.classList;
	app.message.innerText = msg;
	classList.add('show');
	clearTimeout( app._messageTimer );
	app._messageTimer = setTimeout(function(){
		classList.remove('show');
	},3000);
}

app.gist.on('saving', function(){
	app.setMessage('Saving');
}.bind(this));

app.gist.on('destroyed', function(){
	app.setMessage('Removed');
}.bind(this));

app.gist.on('saved', function(){
	app.setMessage('Saved');
}.bind(this));

app.listenTo('i', 'click', app.list, function( e ){
	e.stopPropagation();
	var el = e.target,
		_parent = el.parentNode,
		id = _parent.dataset.id;

	if ( id ) {
		if ( confirm('Are you sure you want to delete this note?') ) {
			app.gist.destroy( id, function(){
				console.log('removed', arguments );
				app.openMenu();
				if( app.currentlyEditing === id ) {
					app.new();
				}
			})
		}
	}
});

app.listenTo('li', 'click', app.list, function( e ){
	var el = e.target,
		id = el.dataset.id;

	if ( id ) {
		app.open( id );
	}
});

app.listenTo('label', 'click', app._window.document.body, function( e ){
	e.stopPropagation();
	if ( app.public ) {
		app.public = 0
		return app.setMessage('Private');
	}
	app.public = 1;
	return app.setMessage('Public');
});

// menu system
app.menu = (require('./js/menu')).bind( app );
app.menu( app.gui );
app.closeEl.addEventListener('click', function( e ){
	app._window.close();
});
app.shortcuts = new (require('./js/shortcuts'))({
	app : app,
	MouseTrap : require('./js/plugins/mousetrap')
});
app.shortcuts.register(require('./config/shortcuts.json'));

app.content.focus();
if ( app.state.id ) {
	app.open( app.state.id );
}
if ( app.state.caretPosition ) {
	app.editor.setCaretPosition( app.state.caretPosition );
}

app.listEl.addEventListener('click', app.openMenu);

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

// this needs to be conditional
var Gaze = require('gaze').Gaze; 
var gaze = new Gaze('**/*');

gaze.on('all', function(event, filepath) {
 if (location)
   location.reload();
});