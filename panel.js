var memViewer = new TypedArrayViewer( document.getElementById( 'mem-viewer' ) );
//memViewer.options.showCharMap = false;
//memViewer.options.showColorMap = false;

//document.getElementById( 'mem-viewer' ).appendChild( memViewer.domElement );

window.addEventListener( 'resize', onWindowResize );

function onWindowResize() {

    memViewer.resize();

}

onWindowResize();

var supportedTypes = {
	'Int8Array': Int8Array,
	'Uint8Array': Uint8Array,
	'Uint8ClampedArray': Uint8ClampedArray,
	'Int16Array': Int16Array,
	'Uint16Array': Uint16Array,
	'Int32Array': Int32Array,
	'Uint32Array': Uint32Array,
	'Float32Array': Float32Array,
	'Float64Array': Float64Array
};

function str2ab(str) {

	var buf = new ArrayBuffer(str.length*2); // 2 bytes for each char
	var bufView = new Uint16Array(buf);
	for (var i=0, strLen=str.length; i < strLen; i++) {
		bufView[i] = str.charCodeAt(i);
	}
	return buf;

}


function setSource( src ){

	var data = [];

	if( src.type === 'String' ) {
		src.data = str2ab( src.data );
		src.type = 'Uint16Array'
	}

	if( src.type === 'Array' ) {
		src.data = src.data;
		src.type = 'Float32Array'
	}

	var instance = supportedTypes[ src.type ];
	if( instance ) {
		var array = new instance( src.data );
		//console.log( array );

		/*var str = src.string;
		var ui8 = new Uint8Array( str.length )
		for( var j = 0; j < str.length; j++ ) {
			ui8[ j ] = str.charCodeAt( j );
		}
		var array = new instance( ui8.buffer );*/

		//data = new Uint8Array( array.buffer, 0, instance.BYTES_PER_ELEMENT * array.length );
		data = array;
	}

	memViewer.set( data );

	//chrome.devtools.inspectedWindow.eval( 'console.log("source set!");')

}
