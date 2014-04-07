module.exports = {
	'partial' : function ( name ) {
		var html = this.app.templates.render( name, this );
		return new (this.app.Handlebars).SafeString(html);
	},
  'is' : function ( item1, item2, options ) {
    var ret = '';
    if ( item1 === item2 ) {
      ret += options.fn( this );
    }
    return ret;
  }
}