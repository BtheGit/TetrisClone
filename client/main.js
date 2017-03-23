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

const COLOR_SCHEMES = [
	{
		pieces: ['red', 'blue', 'purple', 'pink','orange', 'indigo', 'green'],
		outline: 'black',
	},
	{
		pieces: ['#A60037', '#F47992', '#FFE8B8', '#8BB195','#73725F', '#786171', '#00DDAA'],
		outline: 'black',
	},
]

//get the canvas context
const CANVAS_WIDTH = TILESIZE * (BOARD_WIDTH + 6);
const CANVAS_HEIGHT = TILESIZE * BOARD_HEIGHT;

//Array to store active instances of Games
const players = [];

//Game uses instances of divs with 'player' class to determine number of players. This could be expanded in theory
//but also requires manually creating a unique set of controls for each player
const playerElements = document.querySelectorAll('.player');

playerElements.forEach( (elem, index) => {
	
	//create individual canvases
	let canvas = elem.querySelector('.gameCanvas');
	canvas.width = CANVAS_WIDTH;
	canvas.height = CANVAS_HEIGHT;
	let ctx = canvas.getContext('2d');
	
	//create a bundle of props to deliver down the hierarchy tree {Main -> Game -> Player -> Board & -> Piece}
	const canvasProps = {
		CANVAS_WIDTH,
		CANVAS_HEIGHT,
		ctx,
		TILESIZE,
		BOARD_HEIGHT,
		BOARD_WIDTH,
		colorScheme: COLOR_SCHEMES[index]
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
		if(!player.isDead && !players[index].paused){
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
			}
		}
		
		if (event.keyCode === 80) {
			//'p' for pause
			players[index].paused = players[index].paused ? false : true;
		}
	})
}





//todo make drop interval dynamic based on player progress and have score increased as
//a multiplier of that somehow
//todo, accelerate a fixed number of times with score multiplier increase as well

//TODO: improve wall kick handling (sometimes it kicks the piece two squares over without even rotating)

//todo Add in other player preview screen to show their action
//Is there a way to prerender canvases to return snapshots of the other players score?
//That would be way easier than rendering two more canvases concurrently