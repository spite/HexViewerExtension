'use strict'

function MemoryViewer() {

	this.options = {
		decRows: true,
		type: 'int',
		endianess: 'big',
		expandedMode: false,
		showCharMap: true,
		showColorMap: true
	};

	this.invalidate = false;

	this.data = [];
	this.offset = 0;

	this.cellHeight = 15;
	this.columns = 0;

	this.hexChar = ["0", "1", "2", "3", "4", "5", "6", "7","8", "9", "A", "B", "C", "D", "E", "F"];

	this.domElement = document.createElement( 'div' );
	this.domElement.className = 'base';

	this.hexPanel = document.createElement( 'div' );
	this.hexPanel.className = 'hex-panel';

	this.container = document.createElement( 'div' );
	this.container.className = 'container';

	this.charPanel = document.createElement( 'div' );
	this.charPanel.className = 'char-panel';

	this.colorPanel = document.createElement( 'canvas' );
	this.colorPanel.className = 'color-panel';
	this.colorCtx = this.colorPanel.getContext( '2d' );

	this.scroller = document.createElement( 'div' );

	this.gutter = document.createElement( 'div' );
	this.gutter.className = 'gutter';

	var canvas = document.createElement( 'canvas' );
	canvas.width = 1;
	canvas.height = 2 * this.cellHeight;
	var ctx = canvas.getContext( '2d' );
	ctx.fillStyle = '#dedede';
	ctx.fillRect( 0, 0, canvas.width, this.cellHeight );

	this.background = document.createElement( 'div' );
	this.background.className = 'background';
	this.background.style.backgroundImage = 'url(' + canvas.toDataURL() + ')';

	this.scrollBar = document.createElement( 'div' );
	this.scrollBar.className = 'scrollbar';

	this.scrollPane = document.createElement( 'div' );
	this.scrollBar.appendChild( this.scrollPane );

	this.infoPanel = document.createElement( 'div' );
	this.infoPanel.className = 'info-panel';

	this.typeDropdown = document.createElement( 'select' );
	this.infoPanel.appendChild( this.typeDropdown );
	var options = [
	{ id: 'int', name: 'Signed Int' },
	{ id: 'uint', name: 'Unsigned Int', },
	{ id: 'float', name: 'Float' }
	];
	options.forEach( function( o ) {
		var option = document.createElement( 'option' );
		option.textContent = o.name;
		option.value = o.id;
		this.typeDropdown.appendChild( option );
	}.bind( this ) );
	this.typeDropdown.addEventListener( 'change', function( e ) {
		this.options.type = this.typeDropdown.value;
		this.processSelection();
	}.bind( this ) );

	this.endianDropdown = document.createElement( 'select' );
	this.infoPanel.appendChild( this.endianDropdown );
	var options = [
	{ id: 'big', name: 'Big' },
	{ id: 'little', name: 'Little' }
	];
	options.forEach( function( o ) {
		var option = document.createElement( 'option' );
		option.textContent = o.name;
		option.value = o.id;
		this.endianDropdown.appendChild( option );
	}.bind( this ) );
	this.endianDropdown.addEventListener( 'change', function( e ) {
		this.options.endianess = this.endianDropdown.value;
		this.processSelection();
	}.bind( this ) );

	this.valueLabel = document.createElement( 'span' );
	this.valueLabel.className = 'value-label';
	this.infoPanel.appendChild( this.valueLabel );

	this.positionLabel = document.createElement( 'div' );
	this.positionLabel.className = 'position-label';

	this.hexPanel.appendChild( this.background );
	this.hexPanel.appendChild( this.scrollBar );
	this.hexPanel.appendChild( this.gutter );
	this.hexPanel.appendChild( this.container );
	this.hexPanel.appendChild( this.colorPanel );
	this.hexPanel.appendChild( this.charPanel );

	this.domElement.appendChild( this.positionLabel );
	this.domElement.appendChild( this.infoPanel );

	this.domElement.appendChild( this.hexPanel );

	this.container.addEventListener( 'mousewheel', this.updateScroll.bind( this ) );
	this.gutter.addEventListener( 'mousewheel', this.updateScroll.bind( this ) );

	this.container.addEventListener( 'DOMMouseScroll', this.updateScroll.bind( this ) );
	this.gutter.addEventListener( 'DOMMouseScroll', this.updateScroll.bind( this ) );

	this.gutter.addEventListener( 'click', function() {
		this.options.decRows = !this.options.decRows;
		this.invalidate = true;
	}.bind( this ) );

	this.container.addEventListener( 'dblclick', function( e ) {
		e.preventDefault();
	} );

	this.previewCanvas = document.createElement( 'canvas' );
	this.previewCtx = this.previewCanvas.getContext( '2d' );
	this.domElement.appendChild( this.previewCanvas );

	this.container.addEventListener( 'mousedown', function( e ) {

		var selObj = window.getSelection();
		selObj.removeAllRanges();

	} );

	this.container.addEventListener( 'mouseup', function( e ) {

		this.processSelection();

	}.bind( this ) );

    //Object.observe( this.options, this.updateContainer.bind( this ) );

	this.oldScroll = -1;
	this.frame();

}

MemoryViewer.prototype.updateScroll = function( e ) {

	this.scrollBar.scrollTop += e.deltaY || e.detail;
	this.invalidate = true;
	e.preventDefault();

}

MemoryViewer.prototype.processSelection = function() {

	var selObj = window.getSelection();
	if( selObj.rangeCount === 0 ) return;

	var range = selObj.getRangeAt( 0 );
	var startOffset = parseInt( range.startContainer.parentElement.getAttribute( 'data-offset' ) );
	var endOffset = parseInt( range.endContainer.parentElement.getAttribute( 'data-offset' ) );
	var selected = ( endOffset - startOffset + 1 );
	startOffset += this.offset;
	endOffset += this.offset;
	selObj.removeAllRanges();
	var newRange = new Range();
	newRange.setStart( range.startContainer.parentNode, 0 );
	newRange.setEnd( range.endContainer.parentNode, range.endContainer.parentNode.childNodes.length  );
	selObj.addRange( newRange );

	var value = 0;

	var tmp = new Uint8Array( endOffset - startOffset + 1 );
	var l = endOffset - startOffset + 1;

	if( this.options.type === 'float' ) {
		var mul = ( Math.floor( ( endOffset - startOffset ) / 8 ) + 1 ) * 8;
		var b = new ArrayBuffer( mul );
		var bytes = new Uint8Array(b);
		var floats = new Float64Array(b);
		for( var j = 0; j < l; j++ ) {
			if( this.options.endianess === 'little' ) {
				bytes[ mul - 1 - j ] = this.data[ endOffset - j ];
			} else {
				bytes[ mul - 1 - j ] = this.data[ startOffset + j ];
			}
		}
		value = floats;
	} else {
		var value = new BigNumber( 0 );
		for( var j = 0; j < l; j ++ ) {
			var byte = this.data[ j + startOffset ];
			if( this.options.endianess === 'big' ) {
				if( j == 0 && ( byte >> 7 ) && this.options.type === 'int' ) byte = - ( 0xff - byte + 1 );
			} else {
				if( j == ( l - 1 ) && ( byte >> 7 ) && this.options.type === 'int' ) byte = - ( 0xff - byte + 1 );
			}
			var v = new BigNumber( byte );
			var mul = new BigNumber( 0x100 );
			if( this.options.endianess === 'big' ) mul = mul.pow( l - j - 1 );
			else mul = mul.pow( j );
			v = v.multiply( mul );
			value = value.add( v );
		}
		value = value.toString();
	}

    this.valueLabel.textContent = value;//+ ' ' + this.decToHex( value ) + ' ' + this.decToBin( value );

    this.positionLabel.textContent = selected + ' bytes selected at offset ' + startOffset + ' out of ' + this.data.length + ' bytes'

}

MemoryViewer.prototype.set = function( data ) {

	this.data = Array.from( data );
	if( !this.data ) this.data = [];
	this.updateContainer();

}

MemoryViewer.prototype.resize = function() {

	this.updateContainer();

}

MemoryViewer.prototype.frame = function() {

	if( this.invalidate ) {
		this.refresh();
	}

	requestAnimationFrame( function() {
		this.frame();
	}.bind( this ) );

}

MemoryViewer.prototype.computeSizes = function() {

	var total = this.data.length;
	var previousContainerWidth = 0, previousCharWidth = 0, previousGutterWidth = 0, previousColorWidth = 0, previousDigits;

	var j = 0;

	while( 1 ) {

		var containerWidth = this.cellWidth * j;
		var charWidth = ( this.options.showCharMap ) ? j * 4 * 6 : 0;
		var digits = ( this.data.length + '' ).length;
		var gutterWidth = 20 + digits * 8;
		var colorWidth = ( this.options.showColorMap ) ? j * 4 * 4  : 0;

		var totalWidth = gutterWidth + 8 + containerWidth + colorWidth + charWidth + 20;
		if( this.options.showCharMap || this.options.showColorMap ) totalWidth += 10;
		if( this.options.showCharMap && this.options.showColorMap ) totalWidth += 8;

		if( totalWidth > this.domElement.clientWidth ) {
			return {
				containerWidth: previousContainerWidth,
				charWidth: previousCharWidth,
				gutterWidth: previousGutterWidth,
				colorWidth: previousColorWidth,
				digits: previousDigits,
				columns: j - 1
			}
		}

		previousContainerWidth = containerWidth;
		previousCharWidth = charWidth;
		previousGutterWidth = gutterWidth;
		previousColorWidth = colorWidth;
		previousDigits = digits;

		j++;

	}

}

MemoryViewer.prototype.updateContainer = function() {

	this.cellWidth = this.options.expandedMode ? 90 : 55;
	if( this.options.expandedMode ) this.domElement.classList.add( 'expanded' );

	var widths = this.computeSizes();

	this.gutter.style.width = widths.gutterWidth + 'px';
	this.container.style.left = ( widths.gutterWidth + 8 )  + 'px';
	this.container.style.width = widths.containerWidth + 'px';
	this.charPanel.style.width = widths.charWidth + 'px';
	this.colorPanel.style.width = widths.colorWidth + 'px';
	this.colorPanel.width = widths.colorWidth;
	this.colorPanel.height = this.container.clientHeight;
	this.colorPanel.style.right = ( widths.charWidth + 38 ) + 'px';
	this.columns = widths.columns;
	this.zeroes = new Array( widths.digits ).join( '0' );

	this.w = ( ~~( this.container.clientWidth / this.cellWidth ) * 4 );

	var targetCells = ~~( this.container.clientWidth / this.cellWidth ) * ( ~~( this.container.clientHeight / this.cellHeight ) + 1 );
	var targetRows = ( ~~( this.container.clientHeight / this.cellHeight ) + 1 );
	this.rows = targetRows;

	while( this.container.childNodes.length > targetCells ) {
		this.container.removeChild( this.container.lastChild );
	}

	for( var j = this.container.childNodes.length; j < targetCells; j++ ) {
		var div = document.createElement( 'div' );
		div.className = 'word';
		div.style.width = this.cellWidth + 'px';
		div.style.height = this.cellHeight + 'px';
		div.style.display = 'inline-block';
		for( var k = 0; k < 4; k++ ) {
			var span = document.createElement( 'span' );
			span.setAttribute( 'data-offset', j * 4 + k )
			span.className = 'byte';
			span.textContent = '00';
			div.appendChild( span );
		}
		this.container.appendChild( div );
	}

	for( var i = 0; i < this.container.childNodes.length; i++ ) {
		for( var j = 0; j < 4; j++ ) {
			this.container.childNodes[ i ].childNodes[ j ].textContent = '00';
		}
	}

	if( this.options.showCharMap ) {

		while( this.charPanel.childNodes.length > targetRows ) {
			this.charPanel.removeChild( this.charPanel.lastChild );
		}

		for( var j = 0; j < this.charPanel.childNodes.length; j++ ) {
			var p = this.charPanel.childNodes[ j ];
			while( p.childNodes.length > this.columns * 4 ) {
				p.removeChild( p.lastChild );
			}
		}

		for( var j = this.charPanel.childNodes.length; j < targetRows; j++ ) {
			var div = document.createElement( 'div' );
			div.className = 'line-number';
			div.style.width = '100%';
			div.style.height = this.cellHeight + 'px';
			div.style.display = 'inline-block';
			this.charPanel.appendChild( div );
		}

		for( var j = 0; j < this.charPanel.childNodes.length; j++ ) {
			var p = this.charPanel.childNodes[ j ];
			for( var k = p.childNodes.length; k < this.columns * 4; k++ ) {
				var span = document.createElement( 'span' );
                //span.setAttribute( 'data-offset', j * 4 + k )
				span.textContent = '·';
				p.appendChild( span );
			}
		}

	}

	while( this.gutter.childNodes.length > targetRows ) {
		this.gutter.removeChild( this.gutter.lastChild );
	}

	for( var j = this.gutter.childNodes.length; j < targetRows; j++ ) {
		var span = document.createElement( 'span' );
		span.className = 'line-number';
		span.style.width = '100%';
		span.style.height = this.cellHeight + 'px';
		span.style.display = 'inline-block';
		this.gutter.appendChild( span );
	}

	if( this.options.showColorMap ) {
		this.previewCanvas.width = ~~( this.container.clientWidth / this.cellWidth );
		this.previewCanvas.height = this.gutter.childNodes.length;
	}

	this.scrollPane.style.height = ( this.data.length / ( this.columns * 4 ) ) * this.cellHeight + 'px';

	this.refresh();

}

MemoryViewer.prototype.paddingLeft = function ( str, paddingValue) {
	return String(paddingValue + str).slice(-paddingValue.length);
};

MemoryViewer.prototype.byteToHex = function(b) {
	return this.hexChar[(b >> 4) & 0x0f] + this.hexChar[b & 0x0f];
}

MemoryViewer.prototype.decToHex = function( dec ) {
	return dec.toString( 16 );
}

MemoryViewer.prototype.decToBin = function( dec ) {
	return dec.toString( 2 );
}

MemoryViewer.prototype.refresh = function() {

	if( !this.data ) return;

	var row = ~~( this.scrollBar.scrollTop / this.cellHeight );
	this.offset = row * this.w;

	var ptr = this.offset;
	var max = Math.min( this.data.length / 4, this.container.childNodes.length );
	for( var i = 0; i < max; i++ ) {
		for( var j = 0; j < 4; j++ ) {
			this.container.childNodes[ i ].childNodes[ j ].textContent = this.byteToHex( this.data[ ptr + j ] );
		}
		ptr += 4;
	}

	if( this.options.showCharMap || this.options.showColorMap ) {

		var p = 0;
		var ptr = this.offset;
		var max = Math.min( this.data.length, this.rows * this.columns * 4 );
		var h = this.cellHeight;
		for( var i = 0; i < max; i += this.columns * 4 ) {
			var w = this.columns * 4;
			if( this.options.showCharMap ) {
				for( var j = 0; j < w; j++ ) {
					var v = this.data[ ptr + i + j ];
					var c = String.fromCharCode( v );
					if( v < 32 || ( v > 126 && v < 160 ) ) c = '·';
					this.charPanel.childNodes[ p ].childNodes[ j ].textContent = c;
				}
			}
			if( this.options.showColorMap ) {
				for( var j = 0; j < w; j += 4 ) {
					var cols = [
					this.data[ ptr + i + j ],
					this.data[ ptr + i + j + 1 ],
					this.data[ ptr + i + j + 2 ],
					this.data[ ptr + i + j + 3 ]
					];
					this.colorCtx.fillStyle = 'rgba(' + cols.join( ',' ) + ')';
					this.colorCtx.fillRect( j * this.colorPanel.width / w, p * h, this.colorPanel.width / this.columns, h )
				}
			}
			p++;
		}

	}

	for( var i = 0; i < this.gutter.childNodes.length; i++ ) {
		this.gutter.childNodes[ i ].textContent = this.options.decRows ? this.offset + i * this.w : this.paddingLeft( this.decToHex( this.offset + i * this.w ), this.zeroes );
	}

	//this.processSelection();

	//this.previewCanvas.putImageData( imageData, 0, 0 );
	this.invalidate = false;

}
