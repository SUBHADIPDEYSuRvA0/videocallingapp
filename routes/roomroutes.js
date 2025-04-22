const express = require('express');
const router = express.Router();
const roomController = require('../controller/roomcontroller');

router.post('/create', roomController.createRoom);
router.post('/join', roomController.joinRoom);

router.get('/:code', (req, res) => {
  res.render('call', { code: req.params.code });
});

module.exports = router;
