import { v4 as uuidv4 } from 'uuid';
import RedisClient from '../utils/redis';
import DBClient from '../utils/db';

const sha1 = require('sha1'); // cryptographic hash function

class AuthController {
  static async getConnect(request, response) {
    // use authorization header to get the token, remove 'basic' from it
    const header = request.headers.authorization;

    const ourStr = header.slice(6);

    const object = Buffer.from(ourStr, 'base64'); // store the encoded str in the buffer

    const convertedStr = object.toString('utf-8'); // decoded string

    const [email, password] = convertedStr.split(':'); // <email>:<password> will be split   \

    // If not found, return an error Unauthorized with a status code 401
    if (!email) return response.status(401).send({ error: 'Unauthorized' });

    if (!password) return response.status(401).send({ error: 'Unauthorized' });

    const hashedPassword = sha1(password); // store the SHA1 of the password

    const user = await DBClient.users.findOne({ email, password: hashedPassword });

    // If no user has been found, return an error Unauthorized with a status code 401
    if (!user) return response.status(401).send({ error: 'Unauthorized' });

    const token = uuidv4(); // used to generate random string as token

    // Create a key: auth_<token>
    const theKey = `auth_${token}`;

    // Use this key for storing in Redis the user ID for 24 hours
    await RedisClient.set(theKey, user._id.toString(), 60 * 60 * 24);

    const specialToken = { token };

    return response.status(200).send(specialToken);
  }

  static async getDisconnect(request, response) {
    const theTok = request.header('X-token').split(' ');

    const theKey = `auth_${theTok}`;

    const user = await RedisClient.get(theKey);

    // If not found, return an error Unauthorized with a status code 401
    if (!user) return response.status(401).send({ error: 'Unauthorized' });

    // Otherwise, delete the token in Redis and return nothing with a status code 204
    RedisClient.del(theKey);
    return response.status(204).send();
  }
}

module.exports = AuthController;
