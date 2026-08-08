const express = require('express');
const authController = require('../controller/authController');
const fileController = require('../controller/fileController');
const upload = require('../middleware/multer');

const router = express.Router();

router.use(authController.protect);

router.get('/stats', fileController.getFileStats);

router
    .route('/')
    .get(fileController.getAllFiles)
    .post(upload.single('file'), fileController.uploadFile);

router
    .route('/:id')
    .get(fileController.getFile)
    .delete(fileController.deleteFile);


module.exports = router;