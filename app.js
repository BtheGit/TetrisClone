//Since tetris works in blocks, instead of changing the canvas context proportions 20:1
//(which I assume means overlaying text would require a second canvas rendering), let's
//define a block size and do all calculations with that.
const BLOCK = 20;
const LEFT_OFFSET = 200;
const TOP_OFFSET = 50;
const BOARD_WIDTH = 12;
const BOARD_HEIGHT = 20;

//get the canvas context
const CANVAS_WIDTH = BLOCK * (BOARD_WIDTH + 6);
const CANVAS_HEIGHT = BLOCK * BOARD_HEIGHT;

let canvas = document.getElementById('gameCanvas');
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;
let ctx = canvas.getContext('2d');

//#### General Canvas Utility Functions ####
function cls() {
	ctx.fillStyle = 'rgba(0,0,0, 1)';
	ctx.fillRect(0,0, canvas.width, canvas.height);		
}

//#### GAME STATE ####
const defaultColorScheme = {
	pieces: ['red', 'blue', 'purple', 'pink','orange', 'indigo', 'green'],
	outline: 'black',
}

//#### GLOBAL GAME FUNCTIONS ####

function drawMatrix(matrix, position, colorScheme = defaultColorScheme){
	for(let y = 0; y < matrix.length; y++) {
		for (let x = 0; x < matrix[y].length; x++){
			if(matrix[y][x]){
				ctx.fillStyle = colorScheme.pieces[matrix[y][x] - 1];
				ctx.fillRect(
					(x + position.x) * BLOCK, 
					(y + position.y) * BLOCK, 
					BLOCK, 
					BLOCK
				);	
				ctx.strokeStyle = colorScheme.outline;
				ctx.strokeRect(
					(x + position.x) * BLOCK, 
					(y + position.y) * BLOCK, 
					BLOCK, 
					BLOCK
				)						
			}
		}
	}
}



//#### CLASSES ####
class Board {
	constructor(width = BOARD_WIDTH, height = BOARD_HEIGHT) {
		//should start tracking x/y for multiple boards later
		this.width = width;
		this.height = height;
		this.matrix = this.generateEmptyBoard();
		this.colorScheme = defaultColorScheme;
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
		drawMatrix(this.matrix, {x: 0, y: 0}, this.colorScheme)
	}
}

class Piece {
	constructor(colorScheme = defaultColorScheme, position = {x: Math.floor(BOARD_WIDTH /2) - 2, y:0},type = this.newRandomType()) {
		this.type = type;
		this.matrix = this.createPiece(this.type);
		this.colorScheme = colorScheme;
		this.initX = position.x;
		this.initY = position.y;
		this.x = this.initX;
		this.y = this.initY;
	}

	newRandomType() {
		return 'TLJSZOI'[Math.random() * 7 | 0] //hardcoded variable quantity
	}

	createPiece(type) {
		switch (type) {
			case 'T':
				return ([
							[0,1,0],
							[1,1,1],
							[0,0,0],
						])
			case 'L':
				return ([
							[0,2,0],
							[0,2,0],
							[0,2,2],
						])
			case 'O':
				return ([
							[3,3],
							[3,3],
						])
			case 'J':
				return ([
							[0,4,0],
							[0,4,0],
							[4,4,0],
						])
			case 'I':
				return ([
							[0,5,0,0],
							[0,5,0,0],
							[0,5,0,0],
							[0,5,0,0],
						])
			case 'S':
				return ([
							[0,6,6],
							[6,6,0],
							[0,0,0],
						])
			case 'Z':
				return ([
							[7,7,0],
							[0,7,7],
							[0,0,0],
						])
		}
	}

	render() {
		drawMatrix(this.matrix, {x: this.x, y: this.y}, this.colorScheme);
	}
}

class Player {
	constructor(colorScheme = defaultColorScheme){
		this.colorScheme = colorScheme;
		this.board = new Board(BOARD_WIDTH, BOARD_HEIGHT)
		this.activePiece = new Piece(this.colorScheme);
		this.nextPiece = new Piece(this.colorScheme);
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
		// if(this.activePiece.y < this.board.height){
			this.activePiece.y++;
			if(this.checkBoardCollision()) {
				this.activePiece.y--;
				this.mergeAndReset();
			}
		// }
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

	mergeAndReset() {
		this.board.mergePiece(this.activePiece)
		this.activePiece.y = 0;
		this.activePiece.x = this.activePiece.initX;
		[this.nextPiece.x, this.nextPiece.y] = [this.activePiece.x, this.activePiece.y]
		this.activePiece = this.nextPiece
		this.nextPiece = new Piece(this.colorScheme);
		this.nextPiece.x = this.board.width + 2;
		this.nextPiece.y = 1;

	}

	render() {
		this.activePiece.render();
		this.nextPiece.render();
	}



}

function initGame() {
	//going to have to decide if I want to use global eventlisteners again or component 
	//ones that are deleted when component is unmounted (perhaps by storing them in
	//global array and iterating through that deleting everything in when moving to 
	//next screen OR by having global eventlistener function that I overwrite at beginning
	//of each component lifecycle)
	document.addEventListener('keydown', handleKeydown);

	let player = new Player(defaultColorScheme);

	//Used to control drop timing
	let dropCounter = 0;
	let dropInterval = 1000; //in milliseconds
	let lastTime = 0

	gameActive();

	function gameActive(time = 0) {
		//is time argument baked into requestAnimationFrame? Seems like it must be.
		const deltaTime = time - lastTime;
		lastTime = time;
		dropCounter += deltaTime;
		if (dropCounter > dropInterval) {
			player.dropPiece();
			dropCounter = 0;
		}
		cls()
		player.board.render()
		player.render()
		requestAnimationFrame(gameActive)
	}

	function handleKeydown(event) {
		if(event.keyCode === 37) {
			//left key
			player.movePiece(-1)
		} else if (event.keyCode === 39) {
			//right key
			player.movePiece(1)
		} else if (event.keyCode === 40) {
			//down key 
			player.dropPiece()
			dropCounter = 0;
		}
	}
	
}



initGame()
