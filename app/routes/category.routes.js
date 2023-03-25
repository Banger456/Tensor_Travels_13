const { authJwt } = require("../middlewares");
const controller = require("../controllers/category.controller");


module.exports = function (app) {
    app.post(
      "/api/categories",
      [authJwt.verifyToken, authJwt.isAdmin],
      controller.addCategory
    );
    app.get("/api/get-categories", controller.getAllCategories);
  };