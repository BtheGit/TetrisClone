class ConnectionManager {
	constructor() {
		this.connection = null;
	}

	connect(address) {
		this.connection = io('http://localhost:' + address)
		this.connection.connect();
	}
}