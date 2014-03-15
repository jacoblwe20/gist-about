module.exports = {
	'partial' : function ( name ) {
		var html = this.app.templates.render( name, this );
		return new (this.app.Handlebars).SafeString(html);
	}
}