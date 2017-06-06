var verbose = false;

function log() {

	var args = Array.from( arguments );
	args.unshift( 'background: #E07000; color: #ffffff; text-shadow: 0 -1px #000; padding: 4px 0 4px 0; line-height: 0' );
	args.unshift( `%c HexViewer ` );

	console.log.apply( console, args );

}

log( 'content-script' );

var port = chrome.runtime.connect( { name: "content-script" } );
port.postMessage( { method: 'ready' });

port.onMessage.addListener( function( msg ) {

	if( verbose ) log( msg );

	switch( msg.method ) {
		case 'script':

		var source = '(function(){' + msg.script + '})();';

		var script = document.createElement('script');
		script.textContent = source;
		(document.head||document.documentElement).appendChild(script);
		script.parentNode.removeChild(script);

		break;

	}

} );

port.onDisconnect.addListener( function() {
	port = null;
	log( 'Port disconnected' );
})

chrome.runtime.onConnect.addListener( function( port ) {

	log( 'New connection (chrome.runtime.onConnect) from', port.name, port );

} );

window.addEventListener( 'hexviewer-view', e => {

	let message = e.detail;
	let t = performance.now();
	log( t - message.time );
	message.data = Array.prototype.slice.call( message.data );
	message.time = t;
	port.postMessage( message );

});

window.addEventListener( 'message', function(event) {

	if( !port ) return;

	if (event.source !== window) {
		return;
	}

	var message = event.data;

	if (typeof message !== 'object' || message === null || message.source !== 'hexviewer-script' ) {
		return;
	}

	log( 'onMessage', performance.now() );

	if( message.method === 'view' ) {

		console.log( performance.now() - message.time );
		message.data = Array.prototype.slice.call( message.data );

		/*log( 'turnToString', performance.now() );
		var bytes = new Uint8Array( new Float32Array( message.data ).buffer );
		var values = new Array( bytes.length );
		for( var j = 0; j < bytes.length; j++ ) {
			values[ j ] = String.fromCharCode( bytes[ j ] );
		}
		var str = values.join('');

		message.string = str;*/
		//log( 'port.postMessage', performance.now() );
		port.postMessage( message );

	} else {
		port.postMessage( message );
	}

} );

