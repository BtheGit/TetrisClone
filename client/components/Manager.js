import Game from './Game';

export default class Manager {
	constructor(document) {
		this.document = document;
		// this.template = this.document.querySelector('#player-template')
		this.instances = [];

		const playerElements = this.document.querySelectorAll('.player');
		console.log(playerElements);
		playerElements.forEach( (elem, index) => {	
			//initiate new game 
			const player = new Game(this.createPropsBundle(elem, index));
			this.instances.push(player);
		})
		console.log(this.instances)
	}

	createPropsBundle(elem, index) {
		console.log(elem)
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

		//create a bundle 
		return {
			element: elem,
			CANVAS_WIDTH,
			CANVAS_HEIGHT,
			TILESIZE,
			BOARD_HEIGHT,
			BOARD_WIDTH,
			colorScheme: COLOR_SCHEMES[index],
		}
		
	}

	// createPlayer() {
	// 	const element = this.document.importNode(this.template.content, true)
	// 								 .children[0];
	// }
}
