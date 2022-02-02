// Express server for files_manager
const express = require('express');
const app = express();
// server properties
const port = process.env.PORT || 5000;
// router for API
const router = require('./routes/index');

// put app through router to set up API - see routes/index.js
router(app);
// run app
app.listen(port, () => {
	  console.log(`Express server listening on port ${port}`);
});
