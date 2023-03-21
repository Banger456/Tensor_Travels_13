const express = require('express');
const multer = require('multer');
const { Storage } = require('@google-cloud/storage');
const mongoose = require('mongoose');

// Connect to MongoDB database
mongoose.connect('mongodb://localhost/photo-voting-app', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const app = express();

// Configure Multer middleware to handle file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Configure Google Cloud Storage
const storageClient = new Storage({
  projectId: 'my-project-id',
  keyFilename: '/path/to/keyfile.json'
});
const bucketName = 'my-bucket';

// Define schema for photo documents in MongoDB
const photoSchema = new mongoose.Schema({
  filename: String,
  contentType: String,
  size: Number,
  url: String,
  votes: { type: Number, default: 0 }
});
const Photo = mongoose.model('Photo', photoSchema);

// Define route for handling photo uploads
app.post('/photos', upload.single('photo'), async (req, res) => {
  try {
    const file = req.file;

    // Upload the file to Google Cloud Storage
    const bucket = storageClient.bucket(bucketName);
    const blob = bucket.file(file.originalname);
    const blobStream = blob.createWriteStream({
      metadata: {
        contentType: file.mimetype
      }
    });
    blobStream.on('error', (err) => {
      console.error(err);
      res.status(500).send('Error uploading file.');
    });
    blobStream.on('finish', async () => {
      // Save the photo details to MongoDB
      const photo = new Photo({
        filename: file.originalname,
        contentType: file.mimetype,
        size: file.size,
        url: `https://storage.googleapis.com/${bucketName}/${file.originalname}`
      });
      await photo.save();

      res.status(201).send(photo);
    });
    blobStream.end(file.buffer);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error uploading file.');
  }
});

app.listen(3000, () => {
  console.log('Server started on port 3000');
});
