const express = require('express');
const app = express();
const path = require('path');

const { Datastore } = require('@google-cloud/datastore');
const datastore = new Datastore();
module.exports = datastore;

const { saveCode } = require('./lib/helpers.js');
const { execCode } = require('./lib/helpers.js');

const { setupEnv } = require('./lib/setupEnv');

app.use(express.json());
app.use(express.urlencoded());

app.set('view engine', 'ejs');
app.enable('trust proxy'); // Ensure req.protocol can use https if applicable

// Static folder
app.use(express.static(path.join(__dirname, 'public')));

setupEnv(); // Install required libraries and Rust language

// Homepage
app.get('/', function (req, res) {
  return res.status(200).render('home', { shareid: '', code: '', lang: '' });
});

// Retrieve saved code
app.get('/:id', function (req, res) {
  const key = datastore.key(["Code", parseInt(req.params.id, 10)]);
  datastore.get(key).then(codeData => {
    const code = codeData[0]['code'];
    const lang = codeData[0]['lang'];

    // Render home page with saved code in editor
    return res.status(200).render('home', { shareid: 'share', code: code, lang: lang });
  });
});

app.post('/', function (req, res) {
  const lang = req.body.language;
  const options = req.body.options;
  const code = req.body.code;
  // Save code to database or execute and return
  if (req.body.share) {
    saveCode(lang, options, code, obj => {
      return res.status(201).send(`${req.protocol}://${req.get('host')}${req.baseUrl}'/'${obj.id}`);
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

module.exports = app;