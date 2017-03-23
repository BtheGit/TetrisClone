import {cls} from '../utilities/utilities';
import Player from './Player';

export default class Game {

	constructor(props) {
		this.props = props;
		this.player = new Player(props);

		this.paused = false;

		//Used to control drop timing
		this.DROP_INIT = 1000;
		this.DROP_MAX = 50;

		this.speedModifier = 1;

		this.dropInterval = this.DROP_INIT; //in milliseconds
		this.dropCounter = 0;
		this.lastTime = 0

		this.gameActive = this.gameActive.bind(this)

		this.gameActive();
	}

	drawGameBG() {
		let ctx = this.props.ctx;
		//This is the Sidebar color
		ctx.fillStyle = 'rgba(175,150,200, .3)';
		ctx.fillRect(0,0, this.props.CANVAS_WIDTH, this.props.CANVAS_HEIGHT);	
		//Playing area black
		ctx.fillStyle = 'rgba(0,0,0, 1)';
		ctx.fillRect(0,0, this.props.BOARD_WIDTH * this.props.TILESIZE + 2, this.props.BOARD_HEIGHT * this.props.TILESIZE);	
		ctx.strokeStyle = 'white';
		//Border of playing area
		ctx.strokeRect(0,0, this.props.BOARD_WIDTH * this.props.TILESIZE + 2, this.props.BOARD_HEIGHT * this.props.TILESIZE);
		//Border and fill of preview area
		ctx.strokeRect(this.props.TILESIZE * this.props.BOARD_WIDTH + 10, 10, 100, 100);
		ctx.fillStyle = 'rgba(100,100,150, .5)';
		ctx.fillRect(this.props.TILESIZE * this.props.BOARD_WIDTH + 10, 10, 100, 100);	
	}

	//going to have to decide if I want to use global eventlisteners again or component 
	//ones that are deleted when component is unmounted (perhaps by storing them in
	//global array and iterating through that deleting everything in when moving to 
	//next screen OR by having global eventlistener function that I overwrite at beginning
	//of each component lifecycle)

	gameActive(time = 0) {
			cls(this.props);
			this.dropInterval = this.updateDropInterval();
			//is time argument baked into requestAnimationFrame? Seems like it must be.
			const deltaTime = time - this.lastTime;
			this.lastTime = time;
			this.dropCounter += deltaTime;
		if(!this.paused) {
			if (this.dropCounter > this.dropInterval) {
				if(!this.player.isDead) {
					this.player.dropPiece();
					this.dropCounter = 0;
				}
			}
		}
		this.drawGameBG();
		this.player.board.render()
		this.player.render()
		requestAnimationFrame(this.gameActive)			
	}

	updateDropInterval() {
		// if (player.linesCleared )
		return this.DROP_INIT * this.speedModifier;
	}


}
