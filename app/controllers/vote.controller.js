const express = require('express');
const mongoose = require('mongoose');

// Connect to MongoDB database
mongoose.connect('mongodb://localhost/photo-voting-app', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const app = express();

// Define schema for photo documents in MongoDB
const photoSchema = new mongoose.Schema({
  filename: String,
  contentType: String,
  size: Number,
  url: String,
  votes: { type: Number, default: 0 }
});
const Photo = mongoose.model('Photo', photoSchema);

// Define route for handling photo votes
app.post('/photos/:photoId/vote', async (req, res) => {
  try {
    const photoId = req.params.photoId;
    const userId = req.body.userId; // assumes user ID is passed in request body
    const vote = req.body.vote; // assumes vote (up or down) is passed in request body

    // Retrieve the photo document from MongoDB
    const photo = await Photo.findById(photoId);
    if (!photo) {
      res.status(404).send('Photo not found.');
      return;
    }

    // Check if the user has already voted on this photo
    const userHasVoted = photo.votes.some(v => v.userId === userId);
    if (userHasVoted) {
      res.status(400).send('User has already voted on this photo.');
      return;
    }

    // Update the vote count for the photo
    if (vote === 'up') {
      photo.votes.push({ userId, vote: 'up' });
      photo.votesUp += 1;
    } else if (vote === 'down') {
      photo.votes.push({ userId, vote: 'down' });
      photo.votesDown += 1;
    } else {
      res.status(400).send('Invalid vote value.');
      return;
    }

    await photo.save();

    res.status(200).send(photo);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error updating vote count.');
  }
});

app.listen(3000, () => {
  console.log('Server started on port 3000');
});
