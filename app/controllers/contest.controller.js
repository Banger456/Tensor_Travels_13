const Contest = require("../models/contestdate.model");
const { sendEmail } = require("../helpers/email.helper");
const User = require("../models/user.model");


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
  const { winners } = req.body;
  // Loop through categoryWinners
  Object.keys(winners.categoryWinners).forEach(async (category) => {
    const winner = winners.categoryWinners[category];
    const user = await User.findById(winner.user);

    if (user) {
      const subject = `Congratulations! You won in the ${category} category`;
      const text = `Hi ${user.username},

Congratulations! You have won in the ${category} category in our photo contest. Keep up the great work!

Best regards,
Tensor Travels Team`;

      const mailOptions = {
        to: user.email,
        subject: subject,
        text: text,
      };

      await sendEmail(mailOptions);
    }
  });

  // Loop through overallTop3
  winners.overallTop3.forEach(async (winner, index) => {
    const user = await User.findById(winner.user);

    if (user) {
      const rank = index + 1;
      const subject = `Congratulations! You are in the top ${rank} overall`;
      const text = `Hi ${user.username},

Congratulations! You have achieved rank ${rank} in the overall standings of our photo contest. Keep up the great work!

Best regards,
Tensor Travels Team`;

      const mailOptions = {
        to: user.email,
        subject: subject,
        text: text,
      };

      await sendEmail(mailOptions);
    }
  });

  res.status(200).send({ message: "Winners notified successfully." });
};

