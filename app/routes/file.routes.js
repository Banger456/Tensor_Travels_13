const express = require("express");
const router = express.Router();
const controller = require("../controllers/file.controller");
const { authJwt } = require("../middlewares");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x=access=token, Origin, Content-Type, Accept"
    );
    next();
  })
}

let routes = (app) => {
  router.post("/api/photos/upload", [authJwt.verifyToken] ,controller.upload);
  router.get("/api/photos/files/:name", [authJwt.verifyToken] ,controller.download);
  router.get("/api/photos/get-photos", controller.getPhotos);
  //router.put("/api/photos/vote/:photoId", [authJwt.verifyToken, controller.vote]);
  router.delete("/api/photos/:photoId", [authJwt.verifyToken, authJwt.isAdmin], controller.deletePhoto);
  router.put("/api/photos/:photoId/approve", [authJwt.verifyToken, authJwt.isAdmin], controller.approvePhoto);

  app.use(router);
};

module.exports = routes;