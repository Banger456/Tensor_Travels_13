const util = require("util");
const Multer = require("multer");
const maxSize = 2000000000;

let processFile = Multer({
  storage: Multer.memoryStorage(),
  limits: { fileSize: maxSize },
}).single("file");

let processFileMiddleware = util.promisify(processFile);
module.exports = processFileMiddleware;