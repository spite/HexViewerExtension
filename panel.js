var memViewer = new MemoryViewer();
memViewer.options.showCharMap = false;
memViewer.options.showColorMap = false;

document.getElementById( 'mem-viewer' ).appendChild( memViewer.domElement );

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

function setSource( src ){

	var data = [];

	var instance = supportedTypes[ src.type ];
	if( instance ) {
		var array = new instance( src.object );
		data = new Uint8Array( array.buffer, 0, instance.BYTES_PER_ELEMENT * array.length );
	}

	memViewer.set( data );

	//chrome.devtools.inspectedWindow.eval( 'console.log("source set!");')

}
