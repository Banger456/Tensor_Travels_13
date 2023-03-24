const dotenv = require('dotenv');
const express = require("express");
const cors = require("cors");
const path = require('path');
const fileRoutes = require('./app/routes/file.routes');
const redis = require("redis");
require("./routes/category.routes")(app);

const redisClient = redis.createClient();
const app = express();

redisClient.on("connect", () => {
  console.log("Connected to Redis server");
});

redisClient.on("error", (err) => {
  console.log("Redis error: " + err);
});
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
        name: "moderator"
      }).save(err => {
        if (err) {
          console.log("error", err);
        }

        console.log("added 'moderator' to roles collection");
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
  redisClient.get(`user:${userId}:photo:${photoId}`, (err, vote) => {
    if (err) {
      return callback(err);
    }
    callback(null, vote !== null);
  });
};


const saveUserVote = (userId, photoId, callback) => {
  redisClient.set(`user:${userId}:photo:${photoId}`, 1, (err) => {
    if (err) {
      return callback(err);
    }
    callback(null);
  });
};

app.post("/api/vote", (req, res) => {
  const userId = req.user.id;
  const photoId = req.body.photoId;

  checkUserVote(userId, photoId, (err, hasVoted) => {
    if (err) {
      return res.status(500).send({ message: "Error checking user vote" });
    }

    if (hasVoted) {
      return res.status(400).send({ message: "User has already voted" });
    }

    Photo.findByIdAndUpdate(
      photoId,
      { $inc: { vote: 1 } },
      { new: true },
      (err, updatedPhoto) => {
        if (err) {
          return res.status(500).send({ message: "Error updating photo votes" });
        }
      }
    )

   
    saveUserVote(userId, photoId, (err) => {
      if (err) {
        return res.status(500).send({ message: "Error saving user vote" });
      }

      res.status(200).send({ message: "Vote saved successfully" });
    });
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});