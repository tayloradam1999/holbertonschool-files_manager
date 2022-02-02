const express = require('express');
const indexRouter = require('./routes/index');

const app = express();
const port = process.env.PORT || 5000;

app.listen(port, console.log(`Server running on port ${port}`));
app.use(express.json({ limit: '50mb' }));
app.use('/', indexRouter);

module.exports = app;
