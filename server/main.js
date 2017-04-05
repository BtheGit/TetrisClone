const express = require('express')
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const path = require('path');
const Session = require('./components/Session');
const Client = require('./components/Client');
const port = 9000;

//Used to store all currently running players sessions/connections
const sessionsMap = new Map;

function generateRandomId(len = 8) {

	const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
	let length = len;
	let id = '';
	while(length--) {
		id += chars[Math.random() * chars.length | 0]
	}
	return id;
}

function createSession(id) {
	if(sessionsMap.has(id)){
		throw new Error('Session already exists')
	}

	console.log('Creating Session')
	const session = new Session(id);
	sessionsMap.set(id, session);	
	
	return session;
}

function createClient(socket, id = generateRandomId()) {
	return new Client(socket, id);
}

function broadcastSession(session) {
	//extract all clients into new array using spread operator
	const clients = [...session.clients]
	clients.forEach( client => {
		client.send({
			type: 'sessionBroadcast',
			peers: {
				//Receiving client will self-identify with 'you'
				you: client.id,
				//object of all client ids and current state
				clients: clients.map(client => {
					return {
						id: client.id,
						state: client.state
					}
				})
			}
		})
	})
}

//path.resolve lets me specify a parent directory
//app.use and express.static let me set the default viws directory for the server to retrieve static files to serve
app.use(express.static(path.resolve(__dirname, '../client')));

app.get('/', (req, res) => {
	res.sendFile('index.html');
});

io.on('connection', (socket) => {

	console.log('connection detected', socket.id);
	const client = createClient(socket);

	socket.on('message', (packet) => {
		const data = JSON.parse(packet);

		if(data.type === 'createSession'){

			console.log('Session created')

			const session = createSession(generateRandomId()); //could also just use socket id?
			session.join(client);

			client.send({
				type: 'sessionCreated', 
				id: session.id,
			});
		} 

		else if (data.type === 'joinSession') {

			console.log('Client joined session')

			const session = sessionsMap.get(data.id) || createSession(data.id);
			session.join(client);

			//Update clients with new player joined to session
			broadcastSession(session);
		}

		else if (data.type === 'clientUpdate') {

		}
	});

	socket.on('disconnect', () => {

		console.log('Client disconnected from session');

		const session = client.session;
		if(session) {
			session.leave(client);
			if(session.clients.size === 0) {
				sessionsMap.delete(session.id)
			}
		}

		//update clients when a player disconnects
		broadcastSession(session);
	})
});

server.listen(port);

