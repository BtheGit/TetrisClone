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
		else if (data.type === 'updateState') {
			this.updatePeer(data.clientId, data.subType, data.state)
		}
	}

	send(data) {
		const packet = JSON.stringify(data);
		this.connection.send(packet);
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
				console.log(instance)
				//Create and initialize new local instance (needs to be given remote state or else random seed)
				const newInstance = this.manager.createPlayer();
				// newInstance.receiveRemoteState(instance.state); 
				newInstance.run();
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

	updatePeer(id, fragment, [key, value]) {
		console.log(id, fragment, key, value)

        if (!this.peers.has(id)) {
            throw new Error('Client does not exist', id);
        }

        const game = this.peers.get(id);
        game[fragment][key] = value;

        if (key === 'score') {
            game.player.updateScore(value);
        } else {
           game.draw();
        }		
	}
}