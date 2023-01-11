const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');

router
    .route('/send')
    .post(messageController.send);

router
    .route('/getAllMessage')
    .get(messageController.getAllMessage);

router
    .route('/getUnreadMessage')
    .get(messageController.getUnreadMessage);

router
    .route('/getDeletedMessage')
    .get(messageController.getDeletedMessage);


router
    .route('/read')
    .post(messageController.read);

router
    .route('/delete')
    .post(messageController.delete);

router
    .route('/getMessage')
    .get(messageController.getMessage);
module.exports = router;