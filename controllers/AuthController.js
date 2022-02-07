import { v4 as uuidv4 } from 'uuid';
import RedisClient from '../utils/redis';
import DBClient from '../utils/db';

const { createHash } = require('crypto');

class AuthController {
  static getConnect(request, response) {
    (async () => {
      // use authorization header to get the token, remove 'base', and split by ' '
      const unSplit = Buffer.from(request.headers.authorization.split(' ')[1], 'base64').toString('ascii');
      const [email, password] = unSplit.split(':');
      // If not found, return an error Unauthorized with a status code 401
      if (!email || !password) return response.status(401).send({ error: 'Unauthorized' });
      // utilize createHash to hash the password
      const hashedPass = createHash('sha1').update(password).digest('hex');
      // find the user in the DB
      const user = await DBClient.db.collection('users').findOne({ email, password: hashedPass });
      // If no user has been found, return an error Unauthorized with a status code 401
      if (!user) {
        response.status(401);
        return response.send({ error: 'Unauthorized' });
      }
      // generate a token
      const token = uuidv4();
      // Create a key: auth_<token>
      const theKey = `auth_${token}`;
      // Use this key for storing in Redis the user ID for 24 hours
      await RedisClient.set(theKey, user._id.toString(), 60 * 60 * 24);
      // create a response with the token
      const specialToken = { token };
      // return the response
      return response.status(200).send(specialToken);
    })();
  }

  static getDisconnect(request, response) {
    (async () => {
      // get token from header
      const theTok = request.headers['x-token'];
      // get key from token
      const theKey = `auth_${theTok}`;
      // get user from key
      const user = await RedisClient.get(theKey);
      // If not found, return an error Unauthorized with a status code 401
      if (!user) return response.status(401).send({ error: 'Unauthorized' });
      // Otherwise, delete the token in Redis and return nothing with a status code 204
      await RedisClient.del(theKey);
      response.status(204).end();
    })();
  }
}

module.exports = AuthController;
