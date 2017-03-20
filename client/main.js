import Player from './components/Player';
import Game from './components/Game';
import {drawMatrix} from './utilities/utilities';
import './index.css';

//Since tetris works in blocks, instead of changing the canvas context proportions 20:1
//(which I assume means overlaying text would require a second canvas rendering), let's
//define a block size and do all calculations with that.
const TILESIZE = 20;
const BOARD_WIDTH = 12;
const BOARD_HEIGHT = 20;

//get the canvas context
const CANVAS_WIDTH = TILESIZE * (BOARD_WIDTH + 6);
const CANVAS_HEIGHT = TILESIZE * BOARD_HEIGHT;

//Array to store active instances of Games
const players = [];

const playerElements = document.querySelectorAll('.player');

playerElements.forEach( elem => {
	
	//create individual canvases
	let canvas = elem.querySelector('.gameCanvas');
	canvas.width = CANVAS_WIDTH;
	canvas.height = CANVAS_HEIGHT;
	let ctx = canvas.getContext('2d');
	
	//create a bundle 
	const canvasProps = {
		CANVAS_WIDTH,
		CANVAS_HEIGHT,
		ctx,
		TILESIZE,
		BOARD_HEIGHT,
		BOARD_WIDTH,
		colorScheme: {
			pieces: ['red', 'blue', 'purple', 'pink','orange', 'indigo', 'green'],
			outline: 'black',
		},
	}

	//initiate new game 
	const player = new Game(canvasProps);
	players.push(player);
})


const playerKeys = [
	{
		left: 65,
		right: 68,
		down: 83,
		drop: 32,
		rotateClock: 69,
		rotateCount: 81,
	},
	{
		left: 37,
		right: 39,
		down: 40,
		drop: 16,
		rotateClock: 191,
		rotateCount: 190,
	}
]

document.addEventListener('keydown', handleKeydown);

function handleKeydown(event) {
	playerKeys.forEach( (key, index) => {
		const player = players[index].player;
		if(!player.isDead){
			if(event.keyCode === key.left) {
				//'a'
				player.movePiece(-1)
			} else if (event.keyCode === key.right) {
				//'d'
				player.movePiece(1)
			} else if (event.keyCode === key.down) {
				//'s' accelerate drop
				player.dropPiece()
			} else if (event.keyCode === key.rotateClock) {
				//'e' for rotate clockwise
				player.rotatePiece(1);
			} else if (event.keyCode === key.rotateCount) {
				//'q' for rotate counter-clockwise
				player.rotatePiece(-1)
			} else if (event.keyCode === key.drop) {
				//'Spacebar' for quick drop
				player.instantDrop();
			} else if (event.keyCode === 80) {
				//'p' for pause
			}
		}
	})
}





//todo make drop interval dynamic based on player progress and have score increased as
//a multiplier of that somehow
//todo, accelerate a fixed number of times with score multiplier increase as well

//todo error checking to prevent rotating into wall
//fixed but maybe want to add a way to move the piece one over instead of just blocking rotation.
//not sure what is standard in tetris games
//it's a wall kick

