//console.log( 'content-script' );

var port = chrome.runtime.connect( { name: "content-script" } );
port.postMessage( { method: 'ready' });

window.addEventListener( 'message', function(event) {

	if (event.source !== window) {
		return;
	}

	var message = event.data;

	if (typeof message !== 'object' || message === null || message.source !== 'script' ) {
		return;
	}

	port.postMessage( message );

} );

var source = '(' + function () {

	'use strict';

	var supportedTypes = [
		{ type: 'Int8Array', instance: Int8Array },
		{ type: 'Uint8Array', instance: Uint8Array },
		{ type: 'Uint8ClampedArray', instance: Uint8ClampedArray },
		{ type: 'Int16Array', instance: Int16Array },
		{ type: 'Uint16Array', instance: Uint16Array },
		{ type: 'Int32Array', instance: Int32Array },
		{ type: 'Uint32Array', instance: Uint32Array },
		{ type: 'Float32Array', instance: Float32Array },
		{ type: 'Float64Array', instance: Float64Array }
	];

	window.console.view = function( obj ) {

		var type = null;

		supportedTypes.forEach( t => {
			if( obj instanceof t.instance ) {
				type = t.type;
			}
		} )

		if( type ) {
			var array = Array.prototype.slice.call( obj );
			window.postMessage( { source: 'script', method: 'view', type: type, object: array }, '*' );
		} else {
			console.error( 'Type not supported' )
		}

	}

} + ')();';

var script = document.createElement('script');
script.textContent = source;
(document.head||document.documentElement).appendChild(script);
script.parentNode.removeChild(script);

