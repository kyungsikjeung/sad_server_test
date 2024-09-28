/**
 * @file img.js
 * @description public 폴더 참조하여 이미지 전송.
 * @module routes/img
 *
 * This module sets up an Express router to handle GET requests for images.
 * It validates the image ID, retrieves the corresponding image name from
 * environment variables, and serves the image file from the public directory.
 *
 * Environment Variables:
 * - IMAGE_ALARM_<id>: The name of the image file corresponding to the given ID.
 *
 * Routes:
 * - GET /:id - Serves the image file corresponding to the given ID.
 *
 * @requires express
 * @requires path
 * @requires dotenv
 */
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
