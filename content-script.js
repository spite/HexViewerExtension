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
		{ type: 'Float32Array', instance: Float32Array }
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

