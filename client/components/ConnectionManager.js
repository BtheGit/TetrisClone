class ConnectionManager {
	constructor(manager) {
		this.connection = null;
		this.peers = new Map;
		this.manager = manager;
		this.localInstance = this.manager.instances[0];
		// this.sessionId = null;

	}

	connect(address) {
		this.connection = io.connect('http://localhost:' + address, {reconnect: true})

		this.connection.on('connect', () => {
			console.log('Connected to server');

			this.initSession();
			this.localStateListeners();

			this.connection.on('message', (packet) => {
				this.receive(packet);
			});
		});
	}

	initSession() {
		const sessionId = window.location.hash.split('#')[1];
		const localState = this.localInstance.sendLocalState()
		// const sessionId = this.sessionId;
		if(sessionId) {
			console.log('Joining Session', sessionId)
			this.send({
				type: 'joinSession',
				id: sessionId,
				state: localState
			});
		} else {
			console.log('Creating session')
			this.send({
				type: 'createSession'
			})
		}
		this.initEventHandlers();

	}

	initEventHandlers() {
		//Have server broadcast initial state for new instances to overwrite defaults
		const player = this.localInstance.player;

		player.eventHandler.emit('activePieceMatrix', player.activePiece.matrix);	
		player.eventHandler.emit('nextPieceMatrix', player.nextPiece.matrix);
		player.eventHandler.emit('boardMatrix', player.board.matrix); 
		player.eventHandler.emit('score', player.score);
		player.eventHandler.emit('activePiecePos', player.activePiece.pos);					
	}

	receive(packet) {
		const data = JSON.parse(packet);

		if (data.type === 'sessionCreated') {
			window.location.hash = data.id;
			// this.sessionId = data.id;
		}
		else if (data.type === 'sessionBroadcast') {
			//adding on new remote instances to track
			this.updateManager(data.peers);
		}
		else if (data.type === 'clientUpdate') {
			this.updatePeer(data)
		}
	}

	send(data) {
		const packet = JSON.stringify(data);
		this.connection.send(packet);
	}

	localStateListeners() {
		//This could be refactored to avoid duplication. But for now I like seeing it clearly delineated
		this.localInstance.player.eventHandler.listen('score', score => {
			this.send({
				type: 'clientUpdate',
				key: 'score',
				state,
			})			
		})

		this.localInstance.player.eventHandler.listen('activePiecePos', state => {
			this.send({
				type: 'clientUpdate',
				key: 'activePiecePos',
				state,
			})
		})

		this.localInstance.player.eventHandler.listen('activePieceMatrix', state => {
			this.send({
				type: 'clientUpdate',
				key: 'activePieceMatrix',
				state,
			})
		})

		this.localInstance.player.eventHandler.listen('nextPieceMatrix', state => {
			this.send({
				type: 'clientUpdate',
				key: 'nextPieceMatrix',
				state,
			})
		})

		this.localInstance.player.eventHandler.listen('boardMatrix', state => {
			this.send({
				type: 'clientUpdate',
				key: 'boardMatrix',
				state,
			})
		})		
	}

	updateServer() {
		//Compose packet with local game state to send to server to broadcast 
		const state = this.localInstance.sendLocalState();
		const packet = {
			type: 'clientUpdate',
			state
		}

		this.send(packet);

	}

	updateManager(instances) {
		//Create a filtered list of remote peers
		const myId = instances.you;
		const remoteInstances = instances.clients.filter(client => client.id !== myId)


		//create local copies of remote instances and initialize their state
		remoteInstances.forEach(instance => {
			if(!this.peers.has(instance)) {
				//Create and initialize new local instance (needs to be given remote state or else random seed)
				const newInstance = this.manager.createPlayer();
				newInstance.run();
				newInstance.receiveRemoteState(instance.state); 
				this.peers.set(instance.id, newInstance)
			}
		})

		//Create an array of the Map entries corresponding to each remote client
		const entries = [...this.peers.entries()];
		//Remove any client from the local DOM that have disconnected from the server
		entries.forEach(([id, game]) => {
            if (!remoteInstances.some(client => client.id === id)) {
                this.manager.removePlayer(game);
                this.peers.delete(id);
            }			
		})


        // const local = this.manager.instances[0];
        // const sorted = peers.clients.map(client => this.peers.get(client.id) || local);
        // this.manager.sortPlayers(sorted);		

	}	

	updatePeer(data) {
		console.log(data)
        if (!this.peers.has(data.clientId)) {
            throw new Error('Client does not exist', data.clientId);
        }

        const game = this.peers.get(data.clientId);
        const player = game.player;

        if (data.key === 'activePieceMatrix') {
        	player.activePiece.matrix = data.state;
        }
        else if (data.key === 'activePiecePos') {
        	player.activePiece.pos = data.state;
        }
        else if (data.key === 'nextPieceMatrix') {
        	player.nextPiece.matrix = data.state;
        }
        else if (data.key === 'boardMatrix') {
        	player.board.matrix = data.state;
        }
        else if (data.key === 'score') {
        	player.updateScore(data.state);
        }

        // game.draw();
	}
}