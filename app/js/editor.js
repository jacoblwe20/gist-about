function Editor ( app ) {
	this.app = app;
	this.markdown = app.markdown;
	this._highlight = app.highlighter;
	this._preview = app._window.document.querySelector('.preview_content');
	// blah blah add ace
	// sytax stuff
	// coolbeans
}

Editor.prototype.preview = function( ) {
	var app = this.app,
	 	el = this._preview,
	 	content = app._window.document.createElement('div'),
		contents = app.content.innerText;
		html = this.markdown.parse( contents );

	console.log('preview')
	this._previewContents = content;
	content.innerHTML = html;
	el.appendChild( content );
	this.app.article.classList.add('preview');
};

Editor.prototype.closePreview = function( ) {
	if ( this._previewContents ) {
		this._preview.removeChild( this._previewContents );
	}
	this.app.article.classList.remove('preview');
};

Editor.prototype.highlight = function( ) {
	console.log('something cool');
	var contents = this.app.content.innerText,
		html = this._highlight.highlight( 'markdown', contents ).value;
	console.log('ahhh', html);


	this.app.content.innerHTML = html;
};

module.exports = Editor;