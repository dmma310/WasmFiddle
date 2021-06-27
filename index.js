const express = require('express');
const app = express();
const path = require('path');
app.use(express.json());
app.use(express.urlencoded());

require('dotenv').config();
app.set('view engine', 'ejs');

app.enable('trust proxy'); // Ensure req.protocol can use https if applicable

// Static folder
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 8080;
app.listen(process.env.PORT || 8080, () => {
  console.log(`App listening on port ${PORT}. Press Ctrl+C to quit.`);
});