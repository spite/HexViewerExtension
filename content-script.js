console.log( 'content-script' );

var port = chrome.runtime.connect( { name: "content-script" } );

port.onMessage.addListener( function( msg ) {

	console.log( msg );

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

