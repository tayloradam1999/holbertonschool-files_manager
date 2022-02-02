// 2 endpoints: '/status' and '/stats'
import RedisClient from '../utils/redis';
import DBClient from '../utils/db';


class AppController {
	// using RedisClient method, checks if redis/db servers are running
	static getStatus(req, res) {
		const status = {
			redis: RedisClient.isAlive(),
			db: DBClient.isAlive()
		};
		return res.status(200).send(status);
	}

	// returns number of users and files in DB
	static getStats(req, res) {
		const stats = {
			users: DBClient.nbUsers(),
			files: DBClient.nbFiles()
		};
		return res.status(200).send(stats);
	}
}


module.exports = AppController;