const express = require('express');
const router = express.Router();
const path = require('path');
const dotenv = require('dotenv');
const SerialPortManager = require('../serial/serial.js');

dotenv.config();

router.get('/list', async (req, res) => {
  try {
    const ports = await SerialPortManager.list();
    res.status(200).json(ports);
  } catch (error) {
    res.status(500).send('Error retrieving serial ports');
  }
});

module.exports = router;
