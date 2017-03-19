import Player from './components/Player';
import Board from './components/Board';
import Piece from './components/Piece';

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

//#### Add state for juggling game screens (off load to server?)

//#### General Canvas Utility Functions ####
// function cls() {
// 	ctx.fillStyle = 'rgba(0,0,0, 1)';
// 	ctx.fillRect(0,0, canvas.width, canvas.height);		
// }

function write(text, font ='Arial', size, startX, startY, fillStyle, textAlign = "start") {
	ctx.font = size + " " + font;
	ctx.fillStyle = fillStyle;
	ctx.textAlign = textAlign;
	ctx.fillText(text, startX, startY, 80)
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

function game() {
	//going to have to decide if I want to use global eventlisteners again or component 
	//ones that are deleted when component is unmounted (perhaps by storing them in
	//global array and iterating through that deleting everything in when moving to 
	//next screen OR by having global eventlistener function that I overwrite at beginning
	//of each component lifecycle)

	let player = new Player(defaultColorScheme);

	//Used to control drop timing
	const DROP_INIT = 1000;
	const DROP_MAX = 50;

	let speedModifier = 1;

	let dropInterval = DROP_INIT; //in milliseconds
	let dropCounter = 0;
	let lastTime = 0

	function clsGameActive() {
		ctx.fillStyle = 'rgba(0,0,0, 1)';
		ctx.fillRect(0,0, canvas.width, canvas.height);	
		ctx.strokeStyle = 'white';
		ctx.strokeRect(0,0, BOARD_WIDTH * BLOCK, BOARD_HEIGHT * BLOCK)	
	}



	document.addEventListener('keydown', handleKeydown);

	function handleKeydown(event) {
		if(!player.isDead){
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

	function gameActive(time = 0) {
		clsGameActive();
		dropInterval = updateDropInterval();
		//is time argument baked into requestAnimationFrame? Seems like it must be.
		const deltaTime = time - lastTime;
		lastTime = time;
		dropCounter += deltaTime;
		if (dropCounter > dropInterval) {
			if(!player.isDead) {
				player.dropPiece();
				dropCounter = 0;
			}
		}
		player.board.render()
		player.render()
		requestAnimationFrame(gameActive)
	}

	function updateDropInterval() {
		// if (player.linesCleared )
		return DROP_INIT * speedModifier;
	}

	gameActive();

}

initGame()


//todo make drop interval dynamic based on player progress and have score increased as
//a multiplier of that somehow

//todo error checking to prevent rotating into wall

//todo Can't create a new piece when collision, except when pressing down - stop that