require('dotenv').config();
const { promisify } = require("util");

const jwt = require("jsonwebtoken");
const redis = require("redis");
const redisClient = redis.createClient({ 
  legacyMode: true,
  socket: {
    port: process.env.REDIS_PORT,
    host: "172.17.0.2",
  connectTimeout: 50000
}
});
/*(async () => {
  try { const redisClient = redis.createClient({ 
        legacyMode: true,
        socket: {
          port: process.env.REDIS_PORT,
          host: "172.17.0.2",
        connectTimeout: 50000
    }
  });
  await redisClient.connect();
  console.log('Redis Client Connected');
  } catch (err) {
    console.log('Redis Client Connection Error', err);
  }
})()*/

const db = require("../models");

const Role = db.role;
const User = db.user;

verifyToken = async (req, res, next) => {
  let token = req.headers["x-access-token"];

  if (!token) {
    return res.status(403).send({ message: "No token provided!" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "Unauthorized!" });
    }

    // Check if the token is blacklisted
    /*redisClient.get(token, (err, reply) => {
      if (err) {
        return res.status(500).send({ message: 'Error checking token'});
      }
      
      if (reply) {
        return res.status(401).send({ message: 'Unauthorized! Token is blacklisted'});
      }
    })*/
    req.userId = decoded.id;
    req.user = {
      id: decoded.id,
    }
    next();
  });
};

isAdmin = (req, res, next) => {
  User.findById(req.userId).exec((err, user) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }

    Role.find(
      {
        _id: { $in: user.roles }
      },
      (err, roles) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }

        for (let i = 0; i < roles.length; i++) {
          if (roles[i].name === "admin") {
            next();
            return;
          }
        }

        res.status(403).send({ message: "Require Admin Role!" });
        return;
      }
    );
  });
};

isModerator = (req, res, next) => {
  User.findById(req.userId).exec((err, user) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }

    Role.find(
      {
        _id: { $in: user.roles }
      },
      (err, roles) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }

        for (let i = 0; i < roles.length; i++) {
          if (roles[i].name === "moderator") {
            next();
            return;
          }
        }

        res.status(403).send({ message: "Require Moderator Role!" });
        return;
      }
    );
  });
};

const authJwt = {
  verifyToken,
  isAdmin,
  isModerator
};
module.exports = authJwt;