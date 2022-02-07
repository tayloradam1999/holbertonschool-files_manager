// File containing all endpoints of API
const express = require('express');

// import controllers
const AppController = require('../controllers/AppController');
const UsersController = require('../controllers/UsersController');
const AuthController = require('../controllers/AuthController');
const FilesController = require('../controllers/FilesController');

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
  // GET '/connect'
  paths.get('/connect', AuthController.getConnect);
  // GET '/disconnect'
  paths.get('/disconnect', AuthController.getDisconnect);
  // GET '/users/me'
  paths.get('/users/me', UsersController.getMe);
  // POST '/files'
  paths.post('/files', FilesController.postUpload);
  // GET '/files/:id'
  paths.get('/files/:id', FilesController.getShow);
  // GET '/files'
  paths.get('/files', FilesController.getIndex);
  // PUT '/files/:id/publish'
  paths.put('/files/:id/publish', FilesController.putPublish);
  // PUT '/files/:id/publish
  paths.put('/files/:id/unpublish', FilesController.putUnpublish);
  // GET '/files/:id/data'
  paths.get('/files/:id/data', FilesController.getFile);
};

module.exports = router;
