
module.exports = {
	// hook
	beforeRender : function ( context ) {
		// get the user
		// update context
		var user = { name : 'Jacob' },
			_ = require('lodash');
		_.forIn( user, function ( value, key ){
			context[key] = value;
		});
		// access to app on context
		context.key = this.app.options.userKey;
		return context;
	},
	// another hook
	afterRender : function ( ) {
		// creates element
		this.el.classList.add('show');
		this.userUpdateEl = this.app.document.querySelector('.user-update-key');
	},
	toggleChangeKey : function ( ) {
		// this.model is the model applied to template
		this.userUpdateEl.classList.toggle('show');
	},
	submitKey : function ( e ) {
		// access to models on app
		this.app.user.save('key', this.context.key);
	}
}
module.exports.id = "user-info"