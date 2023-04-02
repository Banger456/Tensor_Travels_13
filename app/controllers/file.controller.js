require('dotenv').config();
const processFile = require("../middlewares/upload");
const { format } = require("util");
const { Storage } = require("@google-cloud/storage");
const Photo = require('../models/photo.model.js')
const Category = require("../models/category.model");
// Instantiate a storage client with credentials
const storage = new Storage({ keyFilename: process.env.GCLOUD_APPLICATION_CREDENTIALS,
projectId: process.env.GCLOUD_PROJECT });
const bucket = storage.bucket(process.env.GCLOUD_BUCKET);

const upload = async (req, res, next) => {
  try {
    await processFile(req, res);

    if (!req.file) {
      return res.status(400).send({ message: "Please upload a file!" });
    } 

    // Include the userId in the file name
    const fileName = `${req.file.originalname}`;

    // Create a new blob in the bucket and upload the file data.
    const blob = bucket.file(fileName);
    const blobStream = blob.createWriteStream({
      resumable: false,
    });

    blobStream.on("error", (err) => {
      res.status(500).send({ message: err.message });
    });

    blobStream.on("finish", async (data) => {
      // Create URL for directly file access via HTTP.
      const publicUrl = format(
        `https://storage.googleapis.com/${bucket.name}/${blob.name}`
      );

      try {
        // Make the file public
        await bucket.file(fileName).makePublic();
      } catch {
        return res.status(500).send({
          message:
            `Uploaded the file successfully: ${req.file.originalname}, but public access is denied!`,
          url: publicUrl,
        });
      }

      const category = req.body.category;
      const foundCategory = await Category.findOne({_id: category});

    

      if (!foundCategory) {
        return res.status(400).send({ message: "Invalid category"});
      }
  // Save the photo schema to MongoDB
  const newPhoto = new Photo({
    user: req.user.id, 
    url: publicUrl,
    fileName: req.file.originalname,
    category: foundCategory._id,
    approved: false,
    votes: 0,
  });
  
  newPhoto.save((err) => {
    if (err) {
      res.status(500).send({ message: 'Error saving photo schema to MongoDB' });
      return;
    }

    res.status(200).send({
      message: "Uploaded the file successfully: " + req.file.originalname,
      url: publicUrl,
    });
  });
  });
    blobStream.end(req.file.buffer);
  } catch (err) {
    if (err.code == "LIMIT_FILE_SIZE") {
        return res.status(500).send({
          message: "File size cannot be larger than 2GB!",
        });
    }
    res.status(500).send({
      message: `Could not upload the file: ${req.file.originalname}. ${err}`,
    });
  }
};

const getListFiles = async (req, res) => {
    try {
      const [files] = await bucket.getFiles();
      let fileInfos = [];
  
      files.forEach((file) => {
        fileInfos.push({
          name: file.name,
          url: file.metadata.mediaLink,
        });
      });
  
      res.status(200).send(fileInfos);
    } catch (err) {
      console.log(err);
  
      res.status(500).send({
        message: "Unable to read list of files!",
      });
    }
};
  
const download = async (req, res) => {
    try {
      const [metaData] = await bucket.file(req.params.name).getMetadata();
      res.redirect(metaData.mediaLink);
      
    } catch (err) {
      res.status(500).send({
        message: "Could not download the file. " + err,
      });
    }
};

const vote = async (req, res) => {
    try {
      const photo = await Photo.findById(req.params.photoId);
      if (!photo) {
        return res.status(404).send({message: "Oops! Photo not found!"});
      }
    photo.votes += 1;
    await photo.save();

    res.status(200).send({ message: "Vote added successfully", photo });
  } catch (err) {
    res.status(500).send({ message: err });
  }
};

const getPhotos = async (req, res) => {
  try {
    const photos = await Photo.find().populate("category").exec();
    res.status(200).send(photos);
  } catch (err) {
    res.status(500).send({ message: err.message});
  }
};

const deletePhoto = (req, res) => {
  Photo.findByIdAndRemove(req.params.photoId, (err, photo) => {
    if (err) {
      res.status(500).send({ message: "Error deleting photo"});
      return;
    }

    if (!photo) {
      res.status(404).send({ message: "Photo not found" });
      return;
    }

    res.status(200).send({ message: "Photo deleted successfully!" });
  });
};

const approvePhoto = (req, res) => {
  Photo.findByIdAndUpdate(
    req.params.photoId,
    { aprrovePhoto: true },
    { new: true },
    (err, photo) => {
      if (err) {
        res.status(500).send({ message: "Error aprroving photo" });
        return;
      }

      if (!photo) {
        res.status(404).send({ message: "Photo not found" });
        return;
      }

      res.status(200).send({ message: "Photo approved successfully!" });
    }
  );
};

  module.exports = {
    upload,
    getListFiles,
    download,
    vote,
    getPhotos,
    deletePhoto,
    approvePhoto,
  };