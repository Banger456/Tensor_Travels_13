const express = require('express');
const router = express.Router();
const fileController = require('../controllers/file.controller');

router.post('/upload', fileController.upload);
router.get('/list', fileController.getListFiles);

module.exports = router;