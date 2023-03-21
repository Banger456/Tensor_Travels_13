const express = require("express");
const cors = require("cors");
const path = __dirname + '/app/views/';
const fileRoutes = require('../routes/file.routes.js');


const app = express();

app.use(express.static(path));

var corsOption = {
    origin: "http://localhost:8081"
};

app.use(cors(corsOption));

const initRoutes = require("./app/routes");

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
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
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