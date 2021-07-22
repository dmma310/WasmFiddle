const express = require('express');
const app = express();
const path = require('path');

const {execCode} = require('./helpers.js');
app.use(express.json());
app.use(express.urlencoded());

const {Datastore} = require('@google-cloud/datastore');
const bodyParser = require('body-parser');
const datastore = new Datastore();

app.set('view engine', 'ejs');
app.enable('trust proxy'); // Ensure req.protocol can use https if applicable

// Static folder
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function (req, res) {
  return res.status(200).render('home');
});

app.get('/:id', function (req, res) {
  // Render home page with code in editor
  return res.status(200).render('home');
});

app.post('/', function(req, res) {
  const lang = req.body.language;
  const code = req.body.code;
  execCode(lang, code, output => {
    return res.status(201).send(`> ${output}`);
  });
});

// TODO: May not need                   Possibly remove
app.post('/:id', function(req, res) {
  // Add to database and render home with code in editor
  return res.status(200).render('home');
});



const PORT = process.env.PORT || 8080;
app.listen(process.env.PORT || 8080, () => {
  console.log(`App listening on port ${PORT}. Press Ctrl+C to quit.`);
});

