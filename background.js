var devtools = {};
var scripts = {}

var script = '';

fetch( chrome.extension.getURL( 'inject.js' ) ).then( res => res.text() ).then( res => script = res )

chrome.runtime.onConnect.addListener( function( port ) {

	console.log( 'New connection (chrome.runtime.onConnect ) from ', port.name, port );

	var name = port.name;

	function listener( msg, sender, reply ) {

		var tabId;

		if( msg.tabId ) tabId = msg.tabId
		else tabId = sender.sender.tab.id;

		if( name === 'devtools' ) devtools[ tabId ] = port;
		if( name === 'content-script' ) scripts[ tabId ] = port;

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
		console.log( msg, sender, reply );

	}

	port.onMessage.addListener( listener );

	port.onDisconnect.addListener( function() {

		port.onMessage.removeListener( listener );

		console.log( name, 'disconnect (chrome.runtime.onDisconnect)' );

	} );

	port.postMessage( { action: 'ack' } );

	return true;

});
