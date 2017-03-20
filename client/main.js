import Player from './components/Player';
import {drawMatrix} from './utilities/utilities';

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

//#### GAME STATE ####
let ctx = canvas.getContext('2d');
const defaultColorScheme = {
	pieces: ['red', 'blue', 'purple', 'pink','orange', 'indigo', 'green'],
	outline: 'black',
}

function game() {
	//going to have to decide if I want to use global eventlisteners again or component 
	//ones that are deleted when component is unmounted (perhaps by storing them in
	//global array and iterating through that deleting everything in when moving to 
	//next screen OR by having global eventlistener function that I overwrite at beginning
	//of each component lifecycle)

	let player = new Player({width: BOARD_WIDTH, height: BOARD_HEIGHT, tileSize: BLOCK, colorScheme: defaultColorScheme, ctx: ctx});

	//Used to control drop timing
	const DROP_INIT = 1000;
	const DROP_MAX = 50;

	let speedModifier = 1;

	let dropInterval = DROP_INIT; //in milliseconds
	let dropCounter = 0;
	let lastTime = 0

	function clsGameActive() {
		//This is the Sidebar color
		ctx.fillStyle = 'rgba(175,150,200, .3)';
		ctx.fillRect(0,0, canvas.width, canvas.height);	
		//Playing area black
		ctx.fillStyle = 'rgba(0,0,0, 1)';
		ctx.fillRect(0,0, BOARD_WIDTH * BLOCK + 2, BOARD_HEIGHT * BLOCK);	
		ctx.strokeStyle = 'white';
		//Border of playing area
		ctx.strokeRect(0,0, BOARD_WIDTH * BLOCK + 2, BOARD_HEIGHT * BLOCK);
		//Border and fill of preview area
		ctx.strokeRect(BLOCK * BOARD_WIDTH + 10, 10, 100, 100);
		ctx.fillStyle = 'rgba(100,100,150, .5)';
		ctx.fillRect(BLOCK * BOARD_WIDTH + 10, 10, 100, 100);
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
				player.rotatePiece(1);
			} else if (event.keyCode === 81) {
				//'q' for rotate counter-clockwise
				player.rotatePiece(-1)
			} else if (event.keyCode === 32) {
				//'Spacebar' for quick drop
				player.instantDrop();
			} else if (event.keyCode === 80) {
				//'p' for pause
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

game()


//todo make drop interval dynamic based on player progress and have score increased as
//a multiplier of that somehow
//todo, accelerate a fixed number of times with score multiplier increase as well

//todo error checking to prevent rotating into wall
//fixed but maybe want to add a way to move the piece one over instead of just blocking rotation.
//not sure what is standard in tetris games
//it's a wall kick

