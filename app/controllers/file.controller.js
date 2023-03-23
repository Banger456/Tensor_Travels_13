require('dotenv').config();
const processFile = require("../middlewares/upload");
const { format } = require("util");
const { Storage } = require("@google-cloud/storage");
const Photo = require('../models/photo.model.js')
// Instantiate a storage client with credentials
const storage = new Storage({ keyfilename: process.env.GCLOUD_APPLICATION_CREDENTIAL,
projectId: process.env.GCLOUD_PROJECT });
const bucket = storage.bucket(process.env.GCLOUD_BUCKET);

const upload = async (req, res) => {
  try {
    await processFile(req, res);

    if (!req.file) {
      return res.status(400).send({ message: "Please upload a file!" });
    } 

    //const userId = req.user.id;
    //console.log(req.body, userId);    
    
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
  // Save the photo schema to MongoDB
  const newPhoto = new Photo({
    user: req.body.userId, 
    category: req.body.category, 
    url: publicUrl,
    fileName: req.file.originalname,
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
  module.exports = {
    upload,
    getListFiles,
    download,
  };