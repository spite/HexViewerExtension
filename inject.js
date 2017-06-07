'use strict';

if( !window.__HEXVIEWER_INJECTED ) {

	function log() {

		var args = Array.from( arguments );
		args.unshift( 'background: #E07000; color: #ffffff; text-shadow: 0 -1px #000; padding: 4px 0 4px 0; line-height: 0' );
		args.unshift( `%c HexViewer ` );

		console.log.apply( console, args );

	}

	log( 'HexViewer injected', document.location.href );

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

	/*window.console.log = function() {

		[].slice.call( arguments ).some( arg => {
			var type = checkType( arg )
			if( type ) {
				sendObject( arg, type );
				return true;
			}
		} )
		oldConsoleLog.apply( window, arguments );

	}*/

	window.console.view = function( obj ) {

		var type = checkType( obj );

		if( type ) {
			sendObject( obj, type );
		} else {
			console.error( 'Type not supported' )
		}

	}

	window.view = function( obj ) {

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
			data = obj;//Array.prototype.slice.call( obj );
		}
		var message = { source: 'hexviewer-script', method: 'view', type: type, data: data };
		//window.postMessage( message, '*' );
		var e = new CustomEvent( 'hexviewer-view', { detail: message } );
		window.dispatchEvent( e );

		reference = message;
	}

	var reference = null;

	window.__HEXVIEWER_CHECK = function() {

		var res = reference;
		reference = null;
		return res;

	}

}
