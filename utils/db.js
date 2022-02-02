const { MongoClient } = require('mongodb');


const host = process.env.DB_HOST || 'localhost';
const port = process.env.DB_PORT || 27017;
const database = process.env.DB_DATABASE || 'files_manager';


const url = `mongodb://${host}:${port}`;


class DBClient {
  constructor() {
    MongoClient.connect(url, { useUnifiedTopology: true }, (err, client) => {
      if (client) {
        this.db = client.db(database);
        this.users = this.db.collection('users');
        this.files = this.db.collection('files');
      }
      if (err) {
        console.log(err);
        this.db = false;
      }
    });
  }

  isAlive() {
    if (!this.db) {
      return !!this.db;
    }
    return !!this.db;
  }

  async nbUsers() {
    const numOf = await this.users.countDocuments();
    return numOf;
  }

  async nbFiles() {
    const numOf = await this.files.countDocuments();
    return numOf;
  }
}

const dbClient = new DBClient();
module.exports = dbClient;
