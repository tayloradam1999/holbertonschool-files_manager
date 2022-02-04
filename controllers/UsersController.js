// 1 endpoint: '/users'
import RedisClient from '../utils/redis';
import DBClient from '../utils/db';

const sha1 = require('sha1');

class UsersController {
  static postNew(req, res) {
    (async () => {
      // get user data from request body
      const { email, password } = req.body;
      // check if arguments were passed
      if (!email) return res.status(400).send({ error: 'Missing email' });
      if (!password) return res.status(400).send({ error: 'Missing password' });
      // check if email is already in DB
      const user = await DBClient.users.findOne({ email });
      if (user) return res.status(400).send({ error: 'Already exists' });
      // hash password
      const hashedPassword = sha1(password);
      // create new user + save in collection 'users'
      const newUser = await DBClient.users.insertOne({ email, password: hashedPassword });
      // return user object (email and id only)
      return res.send({ id: newUser.insertedId, email });
    })();
  }

  static getMe(req, res) {
    (async () => {
      const user = await RedisClient.get(req, res);
      // If not found, return an error Unauthorized with a status code 401
      if (!user) return res.status(401).send({ error: 'Unauthorized' });
      // Otherwise, return the user object (email and id only)
      return res.send({ id: user._id, email: user.email });
    })();
  }
}

module.exports = UsersController;
