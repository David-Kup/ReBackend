const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');

router
    .route('/create')
    .post(contactController.create);

router
    .route('/getUnreadInfo')
    .get(contactController.getUnreadInfo);

router
    .route('/getContact')
    .get(contactController.getContact);

router
    .route('/getAllInfo')
    .get(contactController.getAllInfo);
    

router
    .route('/edit')
    .post(contactController.edit);

router
    .route('/delete')
    .post(contactController.delete);

router
    .route('/getAccount')
    .get(contactController.getAccount);

module.exports = router;