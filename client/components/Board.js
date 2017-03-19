import {drawMatrix} from '../utilities/utilities';

class Board {
	constructor(board) {
		//should start tracking x/y for multiple boards later
		this.width = board.width;
		this.height = board.height;
		this.tileSize = board.tileSize;
		this.ctx = board.ctx;
		this.matrix = this.generateEmptyBoard();
		this.colorScheme = board.colorScheme;
	}

	generateEmptyBoard() {
		const matrix = [];
		for(let i = 0; i < this.height; i++){ 
			matrix.push(new Array(this.width).fill(0))
		};
		return matrix;
	}

	mergePiece(piece) {
		for (let y = 0; y < piece.matrix.length; y++) {
			for (let x = 0; x < piece.matrix[y].length; x++) {
				if(piece.matrix[y][x] !== 0){	
					this.matrix[y + piece.y][x + piece.x] = piece.matrix[y][x];
				}
			}
		}
	}

	render() {
		drawMatrix(this.ctx, this.matrix, {x: 0, y: 0}, this.tileSize, this.colorScheme)
	}
}

export default Board;