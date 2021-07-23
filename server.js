const express = require('express');
const app = express();
const path = require('path');

const {execCode} = require('./helpers.js');
app.use(express.json());
app.use(express.urlencoded());

app.set('view engine', 'ejs');
app.enable('trust proxy'); // Ensure req.protocol can use https if applicable

// Static folder
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function (req, res) {
  return res.status(200).render('home');
});

app.post('/', function(req, res) {
  const lang = req.body.language;
  const options = req.body.options;
  const code = req.body.code;
  execCode(lang, options, code, output => {
    return res.status(201).send(`> ${output}`);
  });
});

const PORT = process.env.PORT || 8080;
app.listen(process.env.PORT || 8080, () => {
  console.log(`App listening on port ${PORT}. Press Ctrl+C to quit.`);
});
