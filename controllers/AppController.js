// 2 endpoints: '/status' and '/stats'
import RedisClient from '../utils/redis';
import DBClient from '../utils/db';

class AppController {
  // using RedisClient method, checks if redis/db servers are running
  static getStatus(req, res) {
    const status = {
      redis: RedisClient.isAlive(),
      db: DBClient.isAlive(),
    };
    return res.status(200).send(status);
  }

  // returns number of users and files in DB
  static getStats(req, res) {
    (async () => {
      const nbUsers = await DBClient.nbUsers();
      const nbFiles = await DBClient.nbFiles();
      return res.send({
        users: nbUsers,
        files: nbFiles,
      });
    }
    )();
  }
}

module.exports = AppController;
