// File containing all endpoints of API
const express = require('express');

// import controllers
const AppController = require('../controllers/AppController');
const UsersController = require('../controllers/UsersController');

// router setup
const router = (app) => {
	const paths = express.Router();
	app.use(express.json());
	app.use('/', paths);

	// GET '/status'
	paths.get('/status', AppController.getStatus);
	// GET '/stats'
	paths.get('/stats', AppController.getStats);
	// POST '/users'
	paths.post('/users', UsersController.postNew);
};


module.exports = router;