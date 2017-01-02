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

port.onDisconnect.addEventListener( function() {
	port = null;
	log( 'Port disconnected' );
})

window.addEventListener( 'message', function(event) {

	if( !port ) return;

	if (event.source !== window) {
		return;
	}

	var message = event.data;

	if (typeof message !== 'object' || message === null || message.source !== 'hexviewer-script' ) {
		return;
	}

	port.postMessage( message );

} );

