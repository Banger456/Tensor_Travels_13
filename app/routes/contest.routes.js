const express = require("express");
const router = express.Router();
const contestController = require("../controllers/contest.controller");
const { authJwt } = require("../middlewares");

module.exports = router;
let routes = (app) => {
    router.get("/api/contest/get-contest-dates", contestController.getContestDates);
    router.post("/api/contest/set-contest-dates", contestController.setContestDates);
    router.post("/api/contest/notify-winners", [authJwt.verifyToken, authJwt.isAdmin], contestController.notifyWinners);
  
    app.use(router);
};
  
module.exports = routes;