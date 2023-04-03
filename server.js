const dotenv = require('dotenv');

const express = require("express");
const cors = require("cors");
const path = require('path');
const fileRoutes = require('./app/routes/file.routes');
const Photo = require('./app/models/photo.model');
const redis = require("redis");

let redisClient;
(async () => {
  try { redisClient = redis.createClient({ 
        legacyMode: true,
        socket: {
          port: process.env.REDIS_PORT,
          host: process.env.REDIS_HOST,
          connectTimeout: 50000
    }
  });
  await redisClient.connect();
  console.log('Redis Client Connected');
  } catch (err) {
    console.log('Redis Client Connection Error', err);
  }
})()

const categoryRoutes = require("./app/routes/category.routes");


const app = express();




dotenv.config();

app.use(express.static(path.join(__dirname, 'build')));

var corsOption = {
    origin: "http://localhost:8081"
};

app.use(cors(corsOption));

const initRoutes = require("./app/routes/file.routes");

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));
initRoutes(app);

categoryRoutes(app);

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Tensor Travels" });
});

// routes
require('./app/routes/auth.routes')(app);
require('./app/routes/user.routes')(app);

app.get('/', function (req,res) {
  res.sendFile(path + "index.html");
});

// set port, listen for requests
const Port = process.env.PORT || 8080;
app.listen(Port, () => {
  console.log(`Server is running on port ${Port}.`);
});

const db = require("./app/models");
const { authJwt } = require('./app/middlewares');
const Role = db.role;


db.mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("Successfully connect to MongoDB.");
    initial();
  })
  .catch(err => {
    console.error("Connection error", err);
    process.exit();
  });

  app.use('/api/files', fileRoutes);

function initial() {
  Role.estimatedDocumentCount((err, count) => {
    if (!err && count === 0) {
      new Role({
        name: "user"
      }).save(err => {
        if (err) {
          console.log("error", err);
        }

        console.log("added 'user' to roles collection");
      });

      new Role({
        name: "admin"
      }).save(err => {
        if (err) {
          console.log("error", err);
        }

        console.log("added 'admin' to roles collection");
      });
    }
  });
}

const checkUserVote = (userId, photoId, callback) => {
  const userVoteKey = `user:${userId}:votes`;

  redisClient.sismember(userVoteKey, photoId, (err, hasVoted) => {
    if (err) {
      return callback(err);
    }
    callback(null, hasVoted === 1);
  });
};


const saveUserVote = (userId, photoId, callback) => {
  const userVoteKey = `user:${userId}:votes`;

  redisClient.sadd(userVoteKey, photoId, (err) => {
    if (err) {
      return callback(err);
    }
    callback(null);
  });
};

const checkUserVoteLimit =(userId, categoryId, callback) => {
  const userVoteLimitKey = `user:${userId}:category:${categoryId}:votes`;

  redisClient.scard(userVoteLimitKey, (err, voteCount) => {
    if (err) {
      return callback(err);
    }
    callback(null, voteCount >= 3);
  });
};

app.post("/api/vote", [authJwt.verifyToken], (req, res) => {
  const userId = req.user.id;
  const photoId = req.body.photoId;

  checkUserVote(userId, photoId, (err, hasVoted) => {
    if (err) {
      return res.status(500).send({ message: "Error checking user vote" });
    }

    if (hasVoted) {
      return res.status(400).send({ message: "User has already voted" });
    }

    //Get the photo's category
    Photo.findById(photoId, (err, photo) => {
      if (err) {
        return res.status(500).send({ message: "Error finding photo" });
      }

      checkUserVoteLimit(userId, photo.category, (err, limitReached) => {
        if (err) {
          return res.status(500).send({ message: "Error checking user vote limit "});
        }

        if (limitReached) {
          return res.status(400).send({ message: "User has reached the voting limit for this category" });
        }

        Photo.findByIdAndUpdate(
          photoId,
          { $inc: { votes: 1 } },
          { new: true },
          (err, updatedPhoto) => {
            if (err) {
              return res.status(500).send({ message: "Error updating photo votes" });
            }
          }
        );

        saveUserVote(userId, photoId, (err) => {
          if (err) {
            return res.status(500).send({ message: "Error saving user vote" });
          }
    
          res.status(200).send({ message: "Vote saved successfully" });
        });

      });
    });
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});