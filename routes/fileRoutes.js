const express = require('express');
const authController = require('../controller/authController');
const fileController = require('../controller/fileController');
const upload = require('../middleware/multer');

const router = express.Router();

// Protect all file management routes
router.use(authController.protect);

router
    .route('/')
    .get(fileController.getAllFiles)
    .post(upload.single('file'), fileController.uploadFile);

router
    .route('/:id')
    .get(fileController.getFile)
    .delete(fileController.deleteFile);

router.get('/:id/download', fileController.downloadFile);

module.exports = router;