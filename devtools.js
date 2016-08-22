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

post( { action: 'start' } );

var panelWindow = null;

port.onMessage.addListener( function( msg ) {

	//chrome.devtools.inspectedWindow.eval( 'console.log("msg");')
	if( panelWindow ) {
		//chrome.devtools.inspectedWindow.eval( 'console.log("setSource!");')
		panelWindow.setSource( msg );
	}

} );

function initialize( panel ) {

	panel.onShown.addListener( function ( wnd ) {

		//chrome.devtools.inspectedWindow.eval( 'console.log("onShow");')
		panelWindow = wnd;

	} );

}
