'use strict'

class TypedArrayViewer {

	constructor ( element ) {

		console.log( 'new TypedArrayViewer');

		this.element = element;
		this.element.classList.add( 'tav-container' );

		this.viewPanel = document.createElement( 'div' );
		this.viewPanel.className = 'tav-viewer';
		this.element.appendChild( this.viewPanel );

		this.rowGutter = document.createElement( 'div' );
		this.rowGutter.className = 'tav-row-gutter'
		this.viewPanel.appendChild( this.rowGutter );

		this.cellsContainer = document.createElement( 'div' );
		this.cellsContainer.className = 'tav-cells-container'
		this.viewPanel.appendChild( this.cellsContainer );

		this.infoPanel = document.createElement( 'div' );
		this.infoPanel.className = 'tav-info';
		this.element.appendChild( this.infoPanel );

		this.array = [];

		this.cellWidth = 35;
		this.cellHeight = 16;
		this.cellContainerWidth = 0;
		this.cellContainerHeight = 0;
		this.offsetRows = 0;
		this.cellsPerRow = 0;

		this.cells = [];
		this.rowOffsets = [];

		this.currentBytesPerElement = 1;
		this.resize();

		var onScroll = this.onScroll.bind( this );

		this.viewPanel.addEventListener( 'wheel', onScroll );

	}

	onScroll ( e ) {

		this.offsetRows += e.deltaY / 10;
		if( this.offsetRows < 0 ) this.offsetRows = 0;
		if( this.offsetRows > this.rows ) this.offsetRows = this.rows;
		this.updateValues();
		e.preventDefault();
		return false;

	}

	set ( array ) {

		this.array = array;

		if( this.array.BYTES_PER_ELEMENT !== this.currentBytesPerElement ) {
			this.clear();
			this.currentBytesPerElement = this.array.BYTES_PER_ELEMENT;
		}

		var cellWidth = this.cellWidth * ( this.array.BYTES_PER_ELEMENT || 1 );
		var cellsPerRow = Math.floor( this.cellContainerWidth / cellWidth );
		var rows = Math.round( this.cellContainerHeight / this.cellHeight * cellsPerRow );

		var w = Math.max( ( this.array.length + '' ).length, ( rows + '' ).length ) * 12;

		this.rowGutter.style.width = w + 'px';
		this.cellsContainer.style.left = w + 'px';

		this.resize();

	}

	clear () {

		for( var j = 0; j < this.cells.length; j++ ) {
			this.cellsContainer.removeChild( this.cells[ j ] );
		}
		this.cells = [];

		for( var j = 0; j < this.rowOffsets.length; j++ ) {
			this.rowGutter.removeChild( this.rowOffsets[ j ] );
		}
		this.rowOffsets = [];

	}

	calcRows () {

		var cells = this.array.length;
		var cellWidth = this.cellWidth * ( this.array.BYTES_PER_ELEMENT || 1 );

		this.cellsPerRow = Math.floor( this.cellContainerWidth / cellWidth );
		this.rows = cells / this.cellsPerRow;

		var coverCells = this.cellsPerRow * Math.floor( this.cellContainerHeight / this.cellHeight );

		for( var j = this.cells.length; j < coverCells; j++ ) {
			var newCell = document.createElement( 'span' );
			newCell.style.width = cellWidth + 'px';
			newCell.style.height = this.cellHeight + 'px';
			newCell.className = 'tav-cell';
			newCell.textContent = j;
			this.cells.push( newCell );
			this.cellsContainer.appendChild( newCell );
		}

		for( var j = coverCells; j < this.cells.length; j++ ) {
			this.cellsContainer.removeChild( this.cells[ j ] );
		}
		this.cells.splice( coverCells, this.cells.length - coverCells );

		for( var j = 0; j < this.cells.length; j++ ) {
			var cell = this.cells[ j ];
			var x = ( j * cellWidth ) % ( this.cellsPerRow * cellWidth );
			var r = Math.floor( j / this.cellsPerRow );
			var y = r * this.cellHeight;
			cell.style.left = `${x}px`;
			cell.style.top = `${y}px`;
			if( r % 2 ) cell.classList.add( 'line' );
			else cell.classList.remove( 'line' );
		}

		var coverRows = Math.floor( this.cellContainerHeight / this.cellHeight );

		for( var j = this.rowOffsets.length; j < coverRows; j++ ) {
			var newCell = document.createElement( 'span' );
			newCell.className = 'tav-gutter-cell';
			newCell.textContent = j;
			this.rowOffsets.push( newCell );
			this.rowGutter.appendChild( newCell );
		}

		for( var j = coverRows; j < this.rowOffsets.length; j++ ) {
			this.rowGutter.removeChild( this.rowOffsets[ j ] );
		}
		this.rowOffsets.splice( coverRows, this.rowOffsets.length - coverRows );

		for( var j = 0; j < this.rowOffsets.length; j++ ) {
			var cell = this.rowOffsets[ j ];
			var x = 0;
			var y = j * this.cellHeight;
			cell.style.left = `${x}px`;
			cell.style.top = `${y}px`;
			if( j % 2 ) cell.classList.add( 'line' );
			else cell.classList.remove( 'line' );
		}

		this.updateValues();

	}

	toHex ( d ) {
		return  ("0"+(Number(d).toString(16))).slice(-2).toUpperCase()
	}

	updateValues () {

		var offset = Math.floor( this.offsetRows ) * this.cellsPerRow;

		for( var j = 0; j < this.cells.length; j++ ) {
			var cell = this.cells[ j ];
			if( ( j + offset ) < this.array.length ) {
				cell.textContent = ( this.array[ j + offset ] );
			} else {
				cell.textContent = '---';
			}
		}

		for( var j = 0; j < this.rowOffsets.length; j++ ) {
			var cell = this.rowOffsets[ j ];
			cell.textContent = Math.floor( j + this.offsetRows ) * this.cellsPerRow;
		}

	}

	resize () {

		this.cellContainerWidth = this.cellsContainer.clientWidth;
		this.cellContainerHeight = this.cellsContainer.clientHeight;
		this.calcRows();

	}

}
