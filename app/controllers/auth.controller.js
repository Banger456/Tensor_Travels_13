
const db = require("../models");
const User = db.user;
const Role = db.role;
require('dotenv').config();

const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

exports.signup = async (req, res) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  const user = new User({
    username: req.body.username,
    email: req.body.email,
    password: hashedPassword
  });

  try {
    const savedUser = await user.save();

    if (req.body.roles) {
      const roles = await Role.find({ name: { $in: req.body.roles } });
      savedUser.roles = roles.map(role => role._id);
    } else {
      const role = await Role.findOne({ name: "user" });
      savedUser.roles = [role._id];
    }

    await savedUser.save();
    res.send({ message: "User was registered successfully!" });
  } catch (err) {
    res.status(500).send({ message: err });
  }
};

exports.signin = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username }).populate("roles", "-__v").exec();

    if (!user) {
      return res.status(404).send({ message: "User Not found." });
    }

    const passwordIsValid = await bcrypt.compare(req.body.password, user.password);

    if (!passwordIsValid) {
      return res.status(401).send({
        accessToken: null,
        message: "Invalid Password!"
      });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: 86400 // 24 hours
    });

    const authorities = user.roles.map(role => "ROLE_" + role.name.toUpperCase());

    res.status(200).send({
      id: user._id,
      username: user.username,
      email: user.email,
      roles: authorities,
      accessToken: token
    });
  } catch (err) {
    res.status(500).send({ message: err });
  }
};

exports.logout = (req, res) => {
  const token = req.headers['x-access-token'];
  const expiresIn = 86400; // Token expiration time in seconds (24 hours)

  // Store the token in Redis with the remaining time until expiration
  redisClient.set(token, 'blacklisted', 'EX', expiresIn, (err) => {
    if (err) {
      return res.status(500).send({ message: 'Error logging out' });
    }
    res.status(200).send({ message: 'Logout successful' });
  });
};