const mongoose = require("mongoose");

const ContestSchema = new mongoose.Schema({
  startDate: Date,
  endDate: Date,
});

module.exports = mongoose.model("ContestDate", ContestSchema);