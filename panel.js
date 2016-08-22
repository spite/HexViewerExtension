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
		data = new instance( src.object );
	}

	memViewer.set( data );

	//chrome.devtools.inspectedWindow.eval( 'console.log("source set!");')

}
