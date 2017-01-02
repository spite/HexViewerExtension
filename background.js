function log() {

	var args = Array.from( arguments );
	args.unshift( 'background: #E07000; color: #ffffff; text-shadow: 0 -1px #000; padding: 4px 0 4px 0; line-height: 0' );
	args.unshift( `%c HexViewer ` );

	console.log.apply( console, args );

}

var extensionId = chrome.runtime.id;
log( 'Background', extensionId );

var devtools = {};
var scripts = {}

var script = '';

fetch( chrome.extension.getURL( 'inject.js' ) ).then( res => res.text() ).then( res => script = res )

chrome.runtime.onConnect.addListener( function( port ) {

	log( 'New connection (chrome.runtime.onConnect) from', port.name, port );

	var name = port.name;

	function listener( msg, sender, reply ) {

		var tabId;

		if( msg.tabId ) tabId = msg.tabId
		else tabId = sender.sender.tab.id;

		if( name === 'devtools' ) devtools[ tabId ] = port;
		if( name === 'content-script' ) scripts[ tabId ] = port;

		log( 'port.onMessage', port.name, msg );

		if( name === 'devtools' ) {
			if( msg.method === 'ready' ) {
				port.postMessage( { method: 'script', script: script } )
			}
		}

		if( name === 'content-script' ) {
			if( msg.method === 'ready' ) {
				port.postMessage( { method: 'script', script: script } )
			} else {
				if( devtools[ tabId ] ) {
					devtools[ tabId ].postMessage( msg );
				}
			}
		}

	}

	port.onMessage.addListener( listener );

	port.onDisconnect.addListener( function() {

		port.onMessage.removeListener( listener );

		log( name, 'disconnect (chrome.runtime.onDisconnect)' );

	} );

	port.postMessage( { action: 'ack' } );

	return true;

});
