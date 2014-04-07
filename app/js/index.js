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
app.backEl = document.querySelector('.icon-arrow-left');
app.list = document.querySelector('aside');
app.message = document.querySelector('.message');
app.content = document.getElementById('editor');
app.title = document.querySelector('.document-title');
app.article = document.querySelector('article');
app.editor = new ( require('./js/editor') )( app );
app.templates = new ( require('./js/templates') )({ app : app })
app.templates.registerHelpers( require('./js/helpers') );
// configure
var userDataPath = app.homeDir + app.config.userData + '.pastila',
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

  var isRemote = app._.findWhere(app._gistCache, { id : '' + id });
	if( file ) {
		app.state.id = id;
		app.storage.setItem('state', JSON.stringify(app.state));
		app.content.innerText = file.content;
		app.title.innerText = file.filename;
		app.currentlyEditing = id;
		app.nav.classList.remove('new');
		app.editor.closePreview();
    if ( app.list.classList.contains('show') ) {
     app.openMenu( );
    }
		return app.editor.highlight();
	}

  if ( isRemote ) {
    app.setMessage('Importing Gist');
    app.gist.get({ id : id }, function ( err, res ) {
      if ( err ) return app.setMessage( err.message );
      app.gist.store( res, function ( ) {
        app.setMessage('Woot');
        app.open( id );
      });
    });
  }
	app.state.id = null;
	app.storage.setItem('state', JSON.stringify(app.state));
	app.currentlyEditing = null;
};

app.new = function (  ) {
	app.title.innerText = "NEW.md";
	app.content.innerText = "## Hello World";
	app.currentlyEditing = null;
	app.state.id = null;
	app.storage.setItem('state', JSON.stringify(app.state));
  app.nav.classList.add('new');
  app.editor.highlight();
  if ( app.list.classList.contains('show') ) {
	 app.openMenu( );
  }
};

app.getRemoteGists = function ( callback ) {
  app.gist.get( {}, function ( err, res ) {
    if ( err ) return app.setMessage( err.message );
    var files = app.gist.formatResponse( res );
    files = files.filter( function ( x ) {
      return x ? ( x.language === 'Markdown' ) : null;
    });
    callback( files );
  });
};

app.openMenu = function ( ) {
	var user,
      backEl,
      iconClass = app.listEl.classList;
	app.list.classList.toggle('show');

  // if menu is open get data
  if ( app.list.classList.contains('show') ) {
    if ( app.user ) {
		  user = app.user.get();
    }
    user = user || {};
    user.files = app.gist.getLocal();
    user.currentId = app.currentlyEditing;
    app.list.innerHTML = app.templates.render('list.hbs', user);
    iconClass.remove('icon-list');
    iconClass.add('icon-arrow-left');

    if ( !app._gistCache && app.gist.isAuthed( ) ) {
      app.list.innerHTML = app.templates.render('list.hbs', user);
      return app.getRemoteGists( function ( files ) {
        files = files.filter( function ( file ) {
          return !(app._.findWhere(user.files, { id : '' + file.id }));
        });
        user.remote = files;
        app._gistCache = files;
        app.list.innerHTML = app.templates.render('list.hbs', user);
      });
    }

    if ( app._gistCache ) {
      // restore from cache
      app._gistCache = app._gistCache.filter( function ( file ) {
        return !(app._.findWhere(user.files, { id : '' + file.id }));
      });

      user.remote = app._gistCache;
      app.list.innerHTML = app.templates.render('list.hbs', user);
    }
    return;
  }
  iconClass.add('icon-list');
  iconClass.remove('icon-arrow-left');
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
};

app.setUser = function ( user ) {
	app.user = new (require('./js/user'))( {
		app : app,
		user : user
	});
};

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

app.listenTo('a', 'click', app.list, function( e ){
	var el = e.target,
		action = el.dataset.action;

	if ( action === 'key' ) {
		app.keyChange = app._window.document.querySelector('.user-info-key');
		app.keyChange.classList.toggle('show');
	}
});

app.listenTo('button', 'click', app.list, function( e ){
	var el = e.target,
		key = app._window.document.querySelector('.key').value;

	if ( key.length ) {
		return app.gist.updateKey(key, function( err, user ) {
			if ( err ) {
				return app.setMessage( err.message );
			}
			app.list.classList.remove('show');
			app.setMessage('Updated Key');
			app.setUser( user );
		});
	}
	app.setMessage('Please Add A Key');
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
} else {
	app.new();
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
