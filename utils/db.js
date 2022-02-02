// DBClient class file
const { MongoClient } = require('mongodb');


const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 27017;
const DB_DATABASE = process.env.DB_DATABASE || 'files_manager';
const url = `mongodb://${DB_HOST}:${DB_PORT}`;


class DBClient {
    constructor() {
        MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, (err, db) => {
            if (err) {
                console.log('Unable to connect to the mongoDB server. Error:', err);
                this.client = false;
            } else {
                console.log('Connection established to', url);
                this.client = db.db(DB_DATABASE);
		this.users = this.client.collection('users');
		this.files = this.client.collection('files');
            }
        });
    }
    // func returns true when connection is successful, false otherwise
    isAlive() {
        return !!this.client;
    }
    // async func returns number of documents in collection 'users'
    async nbUsers() {
        const numUsers = await this.users('users').countDocuments({});
        return numUsers;
    }
    // async func returns number of documents in collection 'files'
    async nbFiles() {
        const numFiles = await this.users('files').countDocuments({});
        return numFiles;
    }
}
const dbClient = new DBClient();
module.exports = dbClient;
