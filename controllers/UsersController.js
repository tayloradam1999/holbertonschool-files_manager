// 1 endpoint: '/users'
import RedisClient from '../utils/redis';
import DBClient from '../utils/db';

const mongo = require('mongodb');
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
      const user = await DBClient.db.collection('users').findOne({ email });
      if (user) return res.status(400).send({ error: 'Already exist' });
      // hash password
      const hashedPassword = sha1(password);
      // create new user + save in collection 'users'
      const newUser = await DBClient.db.collection('users').insertOne({ email, password: hashedPassword });
      // return user object (email and id only)
      return res.status(201).send({ id: newUser.insertedId, email });
    })();
  }

  static getMe(req, res) {
    (async () => {
      // get token from header
      const token = req.headers['x-token'];
      // get user from token
      const user = await RedisClient.get(`auth_${token}`);
      // make new ObjectId for user
      const userId = new mongo.ObjectId(user);
      // get user from DB
      const userFromDB = await DBClient.db.collection('users').findOne({ _id: userId });
      // if no user edgecase
      if (!userFromDB) return res.status(401).send({ error: 'Unauthorized' });
      // return user object
      return res.status(200).send({ id: userFromDB._id, email: userFromDB.email });
    })();
  }
}

module.exports = UsersController;
