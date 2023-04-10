const Contest = require("../models/contestdate.model");
const { sendEmail } = require("../helpers/email.helper");

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

exports.notifyWinners = async (req, res) => {
  const winners = req.body.winners;

  winners.forEach(async (winner) => {
    await sendEmail({
      to: winner.email,
      subject: 'Congratulations, you won the contest!',
      text: `Hello ${winner.name},\n\nCongratulations, you have won the photo contest! Your photo has been selected as one of the winners.\n\nRegards,\nTensor Travels Team.`,
    });
  });

  res.json({ message: 'Winners notified' });
};
