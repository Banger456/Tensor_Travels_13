const express = require("express");
const router = express.Router();
const controller = require("../controllers/file.controller");
const { authJwt } = require("../middlewares");
const bodyParser = require("body-parser");

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
  router.post(
    "/api/photos/upload",
    bodyParser.json(),
    [authJwt.verifyToken],
    controller.upload
  );
  router.get("/api/photos/files/:name", [authJwt.verifyToken] ,controller.download);
  router.get("/api/photos/get-photos", controller.getPhotos);
  router.get("/api/photos/get-user-photos", [authJwt.verifyToken], controller.getUserPhotos);
  router.delete("/api/photos/:photoId", [authJwt.verifyToken, authJwt.isAdmin], controller.deletePhoto);
  router.put("/api/photos/:photoId/approve", [authJwt.verifyToken, authJwt.isAdmin], controller.approvePhoto);
  router.post("/api/photos/:photoId/report", [authJwt.verifyToken], controller.reportPhoto);
  router.get("/api/photos/reported-photos", [authJwt.verifyToken, authJwt.isAdmin], controller.getReportedPhotos);
  router.put("/api/photos/:photoId/unreport", [authJwt.verifyToken, authJwt.isAdmin], controller.unreportPhoto);
  

  app.use(router);
};

module.exports = routes;