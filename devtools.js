chrome.devtools.panels.create( "HexViewer",
    "icon.png",
    "panel.html",
    initialize
);

var port = chrome.runtime.connect( { name: "devtools" } );
var tabId = chrome.devtools.inspectedWindow.tabId;

function post( msg ) {

	msg.tabId = tabId;
	port.postMessage( msg );

}

var panelWindow = null;

port.onMessage.addListener( function( msg ) {

	if( msg.method === 'script' ) {
		script = msg.script;

		chrome.devtools.inspectedWindow.eval( 'window.__HEXVIEWER_INJECTED', function(result, isException) {
		console.log( 'check:', result, isException );
			if( result !== true ) {
				console.log( 'Not instrumented. Possibly remote debugging' );
				var source = '(function(){' + msg.script + '})();';
				chrome.devtools.inspectedWindow.eval( source, function(result, isException) {
					console.log( 'injection:', result, isException );
				} );
				console.log( 'poll' );
				poll();
			}
		} )

		return;
	}
	//chrome.devtools.inspectedWindow.eval( 'console.log("msg");')
	if( panelWindow ) {
		//chrome.devtools.inspectedWindow.eval( 'console.log("setSource!");')
		panelWindow.setSource( msg );
	}

} );

function poll() {

	chrome.devtools.inspectedWindow.eval( 'window.__HEXVIEWER_CHECK()', function(result, isException) {
		if( result ) {
			panelWindow.setSource( result );
		}
	} );

	setTimeout( poll, 10 );

}

post( { method: 'ready' } );

function initialize( panel ) {

	panel.onShown.addListener( function ( wnd ) {

		//chrome.devtools.inspectedWindow.eval( 'console.log("onShow");')
		panelWindow = wnd;

	} );

}
