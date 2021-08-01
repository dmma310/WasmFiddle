const express = require('express');
const app = express();
const path = require('path');

const { Datastore } = require('@google-cloud/datastore');
const bodyParser = require('body-parser');
const datastore = new Datastore();
module.exports = datastore;

const { saveCode } = require('./helpers.js');
const { execCode } = require('./helpers.js');

app.use(express.json());
app.use(express.urlencoded());

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
  const options = req.body.options;
  const code = req.body.code;
  if (req.body.share) {
    saveCode(lang, code, obj => {
      const link = req.protocol + "://" + req.get("host") + req.baseUrl + '/' + obj.id;
      return res.status(201).send(`${link}`);
    });
  } else {
    execCode(lang, options, code, output => {
      return res.status(201).send(`> ${output}`);
    });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}. Press Ctrl+C to quit.`);
});

