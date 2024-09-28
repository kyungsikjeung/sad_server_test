//const SerialPortManager = require('../serial/serial.js');
const express = require('express');
const SerialPortManager = require('../serial/serial_dev.js');

const router = express.Router();

// SerialPortManager.listPorts()
//   .then((ports) => {
//     console.log('사용 가능한 포트 목록:', ports);
//   })
//   .catch((error) => {
//     console.error('포트 목록 조회 실패:', error);
//   });

// 예제 라우트

router.post('/write', (req, res) => {
  const deviceType = Number(req.body.deviceType);
  const deviceRegister = Number(req.body.deviceRegister);
  const devicRegisterValue = Number(req.body.devicRegisterValue);
  if (isNaN(deviceType) || isNaN(deviceRegister) || isNaN(devicRegisterValue)) {
    return res.status(400).send('Invalid input');
  }
  res.status(200).send('Data processed successfully');
});

router.post('/read', (req, res) => {
  const deviceType = Number(req.body.deviceType);
  const deviceRegister = Number(req.body.deviceRegister);
  if (isNaN(deviceType) || isNaN(deviceRegister)) {
    return res.status(400).send('Invalid input');
  }
  res.send('Hello, World!');
});

module.exports = router;
