const express = require('express');
const router = express.Router();
const engageController = require('../controllers/EngageUsersController');

router
    .route('/getalluser')
    .get(engageController.getalluser);

router
    .route('/create')
    .post(engageController.create);

router
    .route('/edit')
    .post(engageController.edit);

router
    .route('/getUser')
    .post(engageController.getUser);

router
    .route('/delAccount')
    .post(engageController.delAccount);

module.exports = router;