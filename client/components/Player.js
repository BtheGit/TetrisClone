import Board from './Board';
import Piece from './Piece';
import {canvasText} from '../utilities/utilities';

export default class Player {
	constructor(board){
		this.ctx = board.ctx;
		this.score = 0;
		this.linesCleared = 0;
		this.isDead = false;
		this.colorScheme = board.colorScheme;
		this.board = new Board(board)
		this.activePiece = new Piece(this.board);
		this.nextPiece = new Piece(this.board);
		this.nextPiece.x = this.board.width + 2;
		this.nextPiece.y = 1;		
	}

	movePiece(direction) {
		this.activePiece.x += direction;
		if(this.checkBoardCollision()){
			this.activePiece.x -= direction;
		}
	}

	dropPiece() {		
			this.activePiece.y++;
			if(this.checkBoardCollision()) {
				this.activePiece.y--;
				this.board.mergePiece(this.activePiece)
				this.resetPiece();
				this.checkCompletedLines();
			}
	}

	checkBoardCollision() {
		for (let y = 0; y < this.activePiece.matrix.length; y++){
			for (let x = 0; x < this.activePiece.matrix[y].length; x++) {
				if(
					this.activePiece.matrix[y][x] !== 0 &&
					(
						this.board.matrix[y + this.activePiece.y] &&
						this.board.matrix[y + this.activePiece.y][x + this.activePiece.x] 
					) 	!== 0
				)	{
					return true;
				}

			}
		}
		return false;
	}

	resetPiece() {
		//find a more elegant method!		
		this.activePiece = new Piece(this.board, this.nextPiece.type)
		this.nextPiece = new Piece(this.board);
		this.nextPiece.x = this.board.width + 2;
		this.nextPiece.y = 1;

		//Kills player and ends game as soon as new piece tries to spawn on occupied board space
		if(this.checkBoardCollision()){
			this.isDead = true;
		}

	}

	checkCompletedLines() {
		//variable to track number of lines in one pass
		let completedLines = 0;
		//loop through board matrix
		for (let i = 0; i < this.board.matrix.length; i++){
			//test if all entries are not 0 (I believe some() is faster - should check)
			//return true if there aren't any elements that are zero
			if(!this.board.matrix[i].some((elem) => {return !elem})) {
				//if so add to variable 
				completedLines += 1;
				// then delete that row
				this.board.matrix.splice(i, 1);
				//add a new blank row to beginning of array
				this.board.matrix.unshift(new Array(this.board.matrix[0].length).fill(0))
				
			}
			
		}
		if(completedLines) {
			this.linesCleared += completedLines;
			this.score += (completedLines * 5) * (completedLines * 5)
		}


	}

	render() {
		this.activePiece.render();
		this.nextPiece.render();
		canvasText(this.ctx, this.score, undefined, '25px', ((this.board.width * this.board.tileSize) + 60), 200, 'white', 'center')
	}

}
