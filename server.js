const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');

const app = express();
const port = 5000;
const router = express.Router();

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));
router.use(morgan('dev'));
router.use(cors());
const SerialPortManager = require('./serial/serial_dev.js');
// 라우터 설정
/*
    .env
    │
    public/
    │
    ├── images/
    src/
    │
    ├── server.js
    ├── routes/
    │   ├── img.js
    │   ├── alarm.js
    │   └── serialPorts.js
    └── serial/
        └── serial.js
*/

/* 서비스 별 API 분리  */
const indexRouter = require('./routes/index.js');
const alarmRouter = require('./routes/alarm.js');
const serdesRouter = require('./routes/serdes.js');

const serialPortsRouter = require('./routes/serialPorts.js');
const imgRouter = require('./routes/img');

(async () => {
  // 테스트 용도
  SerialPortManager.instance = new SerialPortManager('COM3');
  await SerialPortManager.instance.openPort(); // 시리얼 포트를 여는 코드 추가

  SerialPortManager.instance.eventEmitter.on('data', (data) => {
    console.log('수신된 데이터:', data);
  });

  SerialPortManager.instance.sendData('\n');
  SerialPortManager.instance.sendData('Hello, World!');
  SerialPortManager.instance.sendData('Hello, World!');
})();

// app.use('/api', indexRouter);
app.use('/api/alarm', alarmRouter);
app.use('/api/serial', serialPortsRouter);
app.use('/api/img', imgRouter);
app.use('/api/serdes', serdesRouter);

app.get('/api/serial-ports', async (req, res) => {
  try {
    const ports = await SerialPortManager.listPorts();
    res.json({ success: true, ports });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/serial-init', async (req, res) => {
  try {
    // /api/serial-init/3 -> portName: 3
    const portName = req.query.portName;

    console.log('portName:', portName);

    if (!SerialPortManager.instance) {
      SerialPortManager.instance = new SerialPortManager(portName);
    }

    await SerialPortManager.instance.openPort(portName);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 서버 시작
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

process.stdin.resume();
