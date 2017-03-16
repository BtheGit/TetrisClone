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

	rotate(direction) {
		let swapped = JSON.parse(JSON.stringify(this.matrix));
		for(let y = 0; y < swapped.length; y++) {
			for (let x = y; x < swapped[y].length; x++) {
				[swapped[y][x], swapped[x][y]] = [swapped[x][y], swapped[y][x]]
			}
		}
		if(direction === 1) {
			for(let i = 0; i < swapped.length; i++) {
				swapped[i].reverse();
			}
		} else if (direction === -1){
			swapped.reverse();
		}
		this.matrix = swapped;
	}

	render() {
		drawMatrix(this.matrix, {x: this.x, y: this.y}, this.colorScheme);
	}
}

class Player {
	constructor(colorScheme = defaultColorScheme){
		this.score = 0;
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
		this.activePiece.y = 0;
		this.activePiece.x = this.activePiece.initX;
		[this.nextPiece.x, this.nextPiece.y] = [this.activePiece.x, this.activePiece.y]
		this.activePiece = this.nextPiece
		this.nextPiece = new Piece(this.colorScheme);
		this.nextPiece.x = this.board.width + 2;
		this.nextPiece.y = 1;

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
		console.log(completedLines)


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
		if(event.keyCode === 65) {
			//'a'
			player.movePiece(-1)
		} else if (event.keyCode === 68) {
			//'d'
			player.movePiece(1)
		} else if (event.keyCode === 83) {
			//'s' accelerate drop
			player.dropPiece()
			dropCounter = 0;
		} else if (event.keyCode === 69) {
			//'e' for rotate clockwise
			player.activePiece.rotate(1);
		} else if (event.keyCode === 81) {
			//'q' for rotate counter-clockwise
			player.activePiece.rotate(-1)
		}
	}
	
}



initGame()
