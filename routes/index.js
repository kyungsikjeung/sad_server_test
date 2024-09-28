const express = require('express');
const router = express.Router();
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (id < 1 || id > 16) {
    return res.status(400).send('Invalid image ID');
  }

  const imageName = process.env[`IMAGE_ALARM_${id}`];
  if (!imageName) {
    return res.status(404).send('Image not found');
  }

  const imagePath = path.join(__dirname, '../../public/images', imageName);
  res.sendFile(imagePath);
});

module.exports = router;
