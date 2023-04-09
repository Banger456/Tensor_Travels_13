const Contest = require("../models/contestdate.model");

exports.getContestDates = async (req, res) => {
  try {
    const contest = await Contest.findOne();
    res.status(200).json(contest);
  } catch (error) {
    res.status(500).json({ message: "Error fetching contest dates" });
  }
};

exports.setContestDates = async (req, res) => {
  const { endDate, startDate } = req.body;
  console.log("Request body:", req.body);
  if (!endDate || !startDate) {
    return res.status(400).json({ message: "Missing required parameters" });
  }
  try {
    let contest = await Contest.findOne();
    if (!contest) {
      contest = new Contest();
    }
    contest.startDate = new Date(startDate);
    contest.endDate = new Date(endDate);
    await contest.save();
    res.status(200).json({ message: "Contest dates updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating contest dates" });
  }
};
