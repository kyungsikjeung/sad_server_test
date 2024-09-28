// serial/serial.js

const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const EventEmitter = require('events');

class SerialPortManager {
  static instance = null; // 싱글턴 패턴을 위한 인스턴스

  constructor(portName, baudRate = 115200) {
    if (SerialPortManager.instance) {
      return SerialPortManager.instance;
    }

    this.portName = portName;
    this.baudRate = baudRate;
    this.serialPort = null;
    this.parser = null;
    this.isOpen = false;
    this.eventEmitter = new EventEmitter();

    this._init();

    SerialPortManager.instance = this;
  }

  _init() {
    this.serialPort = new SerialPort({
      path: this.portName,
      baudRate: this.baudRate,
      dataBits: 8,
      stopBits: 1,
      parity: 'none',
      rtscts: false, // Enable RTS/CTS flow control if required by your USB-to-TTL adapter
    });
    this.isOpen = true;

    this.parser = this.serialPort.pipe(new ReadlineParser({ delimiter: '\n' }));

    this.parser.on('data', (data) => {
      console.log('%cReceived data:', 'color: green;', data); // ! 확인해보기
      this.eventEmitter.emit('data', data);
    });

    this.serialPort.on('open', () => {
      console.log('포트가 성공적으로 열렸습니다.');
      this.isOpen = true;
    });

    this.serialPort.on('error', (err) => {
      console.error('시리얼 포트 에러:', err.message);
      this.isOpen = false;
    });

    this.serialPort.on('close', () => {
      console.log('포트가 닫혔습니다.');
      this.isOpen = false;
    });
  }

  openPort() {
    return new Promise((resolve, reject) => {
      if (this.isOpen) {
        resolve();
      } else {
        this.serialPort.open((err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      }
    });
  }

  closePort() {
    if (this.serialPort && this.isOpen) {
      this.serialPort.close((err) => {
        if (err) {
          console.error('포트 닫기 에러:', err.message);
        } else {
          console.log('포트가 성공적으로 닫혔습니다.');
          this.isOpen = false;
          SerialPortManager.instance = null;
        }
      });
    } else {
      console.log('포트가 이미 닫혀 있거나 열려 있지 않습니다.');
      SerialPortManager.instance = null;
    }
  }

  sendData(message) {
    if (!this.isOpen) {
      console.log('Port is not open. Cannot send message.');
      return;
    }

    const bytes = Buffer.from(message, 'ascii');
    let index = 0;
    console.log(`Sending message: ${message}`);
    const sendNextByte = () => {
      if (index < bytes.length) {
        this.serialPort.write(Buffer.from([bytes[index]]), (err) => {
          if (err) {
            return console.log('Error on write: ', err.message);
          }
          index++;
          setTimeout(sendNextByte, this.delay);
        });
      } else {
        console.log('All bytes sent successfully');
      }
    };

    sendNextByte();
  }

  static getInstance(portName, baudRate) {
    if (!SerialPortManager.instance) {
      new SerialPortManager(portName, baudRate);
    }
    return SerialPortManager.instance;
  }

  static async listPorts() {
    try {
      const ports = await SerialPort.list();
      return ports;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = SerialPortManager;
