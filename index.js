const express = require('express'),
  multer = require('multer'),
  util = require('util'),
  path = require('path'),
  mongoose = require('mongoose'),
  bodyParser = require('body-parser'),
  File = require('./models/file'),
  User = require('./models/user'),
  upload = multer({ dest: '/uploads' });
  app = express(),
  PORT = process.env.PORT || 3000;

app.use(bodyParser.json());


/**
 * API
 */
app.post('/api/file', upload.single('content'), async (req, res) => {
  const newFile = new File({
    _id: req.body.id,
    ownerId: req.body.ownerId,
    costCents: req.body.costCents,
    downloaders: [],
    filename: req.file.filename,
  });
  await util.promisify(newFile.save.bind(newFile))();
  res.status(204).end();
});
app.post('/api/file/:id/cost', async (req, res) => {
  const userId = req.body.user,
    file = await util.promisify(File.findById.bind(File))(req.params.id);
  res.status(200).send({
    canView: file.downloaders.includes(userId),
    cost: file.costCents,
  });
});
app.post('/api/file/:id/buy', async (req, res) => {
  const userId = req.body.user,
    file = await util.promisify(File.findById.bind(File))(req.params.id);
  // TODO: Some stuff with Coil
  file.downloaders.push(userId);
  await util.promisify(file.save.bind(file))();
  res.status(204).send();
});
app.post('/api/file/:id/download', async (req, res) => {
  const userId = req.body.user,
    file = await util.promisify(File.findById.bind(File))(req.params.id);
  if (file.downloaders.includes(userId)){
    res.status(200).send({
      path: '/uploads/' + file.filename,
    });
  } else {
    res.status(402).send();
  }
});
app.post('/api/user', async (req, res) => {
  const newUser = new User({
    _id: req.body.id,
  });
  await util.promisify(newUser.save.bind(newUser))();
  res.status(204).end();
});

/**
 * PUBLIC
 */
app.get('/player', (req, res) => {
  res.sendFile(path.join(__dirname + '/public/player.html'));
});
app.get('/upload', (req, res) => {
  res.sendFile(path.join(__dirname + '/public/upload.html'));
});

// Uploads
app.use('/uploads', express.static('/uploads'));

mongoose.connect('mongodb://db:27017/hackharvard');
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
