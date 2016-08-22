var memViewer = new MemoryViewer();
memViewer.options.showCharMap = false;
memViewer.options.showColorMap = false;

document.getElementById( 'mem-viewer' ).appendChild( memViewer.domElement );

window.addEventListener( 'resize', onWindowResize );

function onWindowResize() {

    memViewer.resize();

}

onWindowResize();

function setSource( src ){

	var data = [];

	switch( src.type ) {
		case 'Float32Array': data = new Float32Array( src.object ); break;
	}

	memViewer.set( data );

	//chrome.devtools.inspectedWindow.eval( 'console.log("source set!");')

}
