function Shortcuts ( options ) {
	var win = options.app._window;
	this.app = options.app;
	this.MouseTrap = options.MouseTrap( win, win.document );
}

Shortcuts.prototype.register = function( shortcuts ) {
	for( var key in shortcuts ) {
		this.MouseTrap.bind(key, this._getMethod( shortcuts[key] ));
	}
};

Shortcuts.prototype._getMethod = function ( methodString ) {
	var chain = methodString.split('.'),
		prevContext,
		context = this.app;

	chain.forEach(function( method ){
		if ( context[ method ] ) {
			prevContext = context;
			context = context[ method ];
		}
	});

	if ( typeof context === 'function' ) {
		return context.bind( prevContext );
	} 

	return function(){};
}

module.exports = Shortcuts;