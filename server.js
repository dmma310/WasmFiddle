const express = require('express');
const app = express();
const path = require('path');
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
  const code = req.body.code;
  const randStr = Math.random().toString(20).substr(2, 15);
  return res.status(201).send('> ' + randStr);
});

const PORT = process.env.PORT || 8080;
app.listen(process.env.PORT || 8080, () => {
  console.log(`App listening on port ${PORT}. Press Ctrl+C to quit.`);
});
