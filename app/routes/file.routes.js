const express = require("express");
const router = express.Router();
const controller = require("../controllers/file.controller");

let routes = (app) => {
  router.post("/api/photos/upload", controller.upload);
  router.get("/api/photos/files", controller.getListFiles);
  router.get("/api/photos/files/:name", controller.download);
  router.post("api/photos/:id/vote", controller.vote);

  app.use(router);
};

module.exports = routes;