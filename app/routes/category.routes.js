
module.exports = function (app) {
    app.post(
      "/api/categories",
      [authJwt.verifyToken, authJwt.isAdmin],
      controller.addCategory
    );
  };