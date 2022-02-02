const express = require('express');
const routes = require('./routes/index');

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json()); // built-in middleware function in Express. It parses incoming requests with JSON payloads

app.listen(port, () => console.log('App listening on port 5000'));
