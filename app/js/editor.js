function Editor ( app ) {
	this.app = app;
	this.markdown = app.markdown;
	this._highlight = app.highlighter;
	this._preview = app._window.document.querySelector('.preview_content');
	this.main = app.content;
	this.main.addEventListener('keydown', this.handleKeys.bind(this));
	this._history = [];
}

Editor.prototype.togglePreview = function ( ) {
	if ( this._previewOpen ) {
		return this.closePreview();
	}
	this.preview();
};

Editor.prototype.toggleHighlights = function ( ) {
	this.highlights.classList.toggle('hide');
};

Editor.prototype.preview = function( ) {
	var app = this.app,
	 	el = this._preview,
	 	content = app._window.document.createElement('div'),
		contents = app.content.innerText;
		html = this.markdown.parse(contents);
	if ( this._previewContents ) {
		this._preview.removeChild(this._previewContents);
	}
	this._previewContents = content;
	this._previewOpen = 1;
	content.innerHTML = html;
	el.appendChild( content );
	this.app.article.classList.add('preview');
};

Editor.prototype.closePreview = function( ) {
	this._previewOpen = 0;
	this.app.article.classList.remove('preview');
};

Editor.prototype.highlight = function( ) {
	// this can work but it need to create a div under
	// normal div and update automatically
	// console.log('something cool');
	this.highlights = this.highlights || 
		this.app._window.document.querySelector('.highlight-layer');
	var contents = this.app.content.innerText,
		html = this._highlight.highlight( 'markdown', contents ).value;
	this.highlights.innerHTML = html;
};

Editor.prototype.handleKeys = function ( e ) {
	var el = e.target,
		keyCode = e.keyCode || e.which,
		start,
		value = el.innerText,
		range = this.app._window.getSelection(),
		start = this.getCaretPosition( el ),
		end;

	if ( keyCode === 9 ) {
		e.preventDefault();
		el.innerText = value.substring(0, start) + '\t' + value.substring(start);
		range.collapse( el.firstChild, start + 1 );
	}

	// add in normal line-break to allow tabing to work 
	// properly

	if ( keyCode === 13 ) {
		e.preventDefault();
		el.innerText = value.substring(0, start) + '\n' + value.substring(start);
		range.collapse( el.firstChild, start + 1 );
	}

	clearTimeout( this.timer );
	this.app.state.caretPosition = start;
	this.app.storage.setItem('state', JSON.stringify(this.app.state));
	this.app._.defer( this.highlight.bind( this ) )
	this.timer = setTimeout(function(){
		if ( this._history.length > 10 ) {
			this._history.shift();
		}
		this._history.push( el.innerText );
	}.bind( this ), 1000)
};

Editor.prototype.setCaretPosition = function ( position ) {
	var el = this.app.content,
		range = this.app._window.getSelection();
	range.collapse( el.firstChild, position - 1 );
};

Editor.prototype.getCaretPosition = function ( editableDiv ) {
	var caretPos = 0, 
		containerEl = null, 
		sel, range, 
		_window = this.app._window,
		_document = _window.document;
    if (_window.getSelection) {
        sel = _window.getSelection();
        if (sel.rangeCount) {
            range = sel.getRangeAt(0);
            if (range.commonAncestorContainer.parentNode == editableDiv) {
                caretPos = range.endOffset;
            }
        }
    } else if (_document.selection && _document.selection.createRange) {
        range = _document.selection.createRange();
        if (range.parentElement() == editableDiv) {
            var tempEl = _document.createElement("span");
            editableDiv.insertBefore(tempEl, editableDiv.firstChild);
            var tempRange = range.duplicate();
            tempRange.moveToElementText(tempEl);
            tempRange.setEndPoint("EndToEnd", range);
            caretPos = tempRange.text.length;
        }
    }
    return caretPos;
};

Editor.prototype.undo = function ( ) {
	var last,
		el = this.main;
		// range = this.app._window.getSelection(),
		// caretPos = this.getCaretPosition( el ),
		// diff;
	if ( this._history.length ) {
		last = this._history.pop();
		// diff = this.main.innerText.length - last.length;
		this.main.innerText = last;
		// range.collapse( el.firstChild, caretPos + diff );
	}
};

module.exports = Editor;