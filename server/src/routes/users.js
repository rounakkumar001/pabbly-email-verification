const express = require('express');
const router = express.Router();
const UsersController = require('../controllers/UsersController');

router.post('/', UsersController.create);
router.get('/', UsersController.getAll);
router.get('/:user_id', UsersController.getOne);
router.put('/:user_id', UsersController.updateOne);
router.delete('/:user_id', UsersController.deleteOne);
router.post('/set_timezone', UsersController.setTimeZone);

module.exports = router;