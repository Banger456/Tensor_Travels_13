const express = require("express");
const router = express.Router();
const contestController = require("../controllers/contest.controller");

module.exports = router;
let routes = (app) => {
    router.get("/api/contest/get-contest-dates", contestController.getContestDates);
    router.post("/api/contest/set-contest-dates", contestController.setContestDates);
  
    app.use(router);
};
  
module.exports = routes;