'use strict';

if( !window.__HEXVIEWER_INJECTED ) {

	console.log( 'HexViewer injected', document.location.href );

	window.__HEXVIEWER_INJECTED = true;

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

	function checkType( obj ) {

		if( typeof obj === 'string' ) return 'String';

		var type = null;

		supportedTypes.forEach( t => {
			if( obj instanceof t.instance ) {
				type = t.type;
			}
		} )

		return type;

	}

	var oldConsoleLog = window.console.log;

	window.console.log = function() {

		[].slice.call( arguments ).some( arg => {
			var type = checkType( arg )
			if( type ) {
				sendObject( arg, type );
				return true;
			}
		} )
		oldConsoleLog.apply( window, arguments );

	}

	window.console.view = function( obj ) {

		var type = checkType( obj );

		if( type ) {
			sendObject( obj, type );
		} else {
			console.error( 'Type not supported' )
		}

	}

	function sendObject( obj, type ) {

		var data = null;
		if( type === 'String' ) {
			data = obj;
		} else {
			data = Array.prototype.slice.call( obj );
		}
		var message = { source: 'script', method: 'view', type: type, data: data };
		window.postMessage( message, '*' );
		reference = message;
	}

	var reference = null;

	window.__HEXVIEWER_CHECK = function() {

		var res = reference;
		reference = null;
		return res;

	}

}
