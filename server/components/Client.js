class Client {
	constructor(socket, id) {
		this.socket = socket;
		this.id = id;
		this.session = null;

		this.state = {
			board: [],
			activePiece: [],
			activePieceX: 0,
			activePieceY: 0,
			nextPiece: [],
			score: 0,
		}
	}

	broadcast(data) {

		if(!this.session) {
			throw new Error('No session to broadcast to!')
		}

		data.client = this.id;

		[...this.session.clients]
			.filter(client => client !== this)
			.forEach(client => client.send(data))
	}

	send(data) {
		console.log('Sending message', data.type); //Interesting to note that packet.type returns undefined below
		const packet = JSON.stringify(data)
		this.socket.send(packet)
	}
}

module.exports = Client;