// 1 endpoint: '/users'
import RedisClient from '../utils/redis';
import DBClient from '../utils/db';

const sha1 = require('sha1');
const mongo = require('mongodb');


class UsersController {
	static async postNew(req, res) {
		// get user data from request body
		const { email, password } = req.body;
		// check if arguments were passed
		if (!email) return res.status(400).send({ error: 'Missing email' });
		if (!password) return res.status(400).send({ error: 'Missing password' });
		// check if email is already in DB
		const user = await DBClient.users.findOne({ email });
		if (user) return res.status(400).send({ error: 'Email already in use' });
		// hash password
		const hashedPassword = sha1(password);
		// create new user + save in collection 'users'
		const newUser = await DBClient.users.insertOne({ email, password: hashedPassword });
		// return user object (email and id only)
		return res.send({ id: newUser.insertedId, email });
	}

	static async getMe(req, res) {
		const user = await getUser(req, res);
		// If not found, return an error Unauthorized with a status code 401
		if (!user) return res.status(401).send({ error: 'Unauthorized' });
		// Otherwise, return the user object (email and id only)
		return res.send({ id: user._id, email: user.email });
	}
}

module.exports = UsersController;
