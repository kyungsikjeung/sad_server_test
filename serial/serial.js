/**
 * @fileoverview MCU와 시리얼 연결
 * @author Kyungsik Jeung
 * @version 1.0
 * @description MCU와 시리얼 통신 하기 위한 .. 파일
 * @contactemail datamining7830@gmail.com
 */

/**
 * SerialPortManager class to manage serial port connections.
 *
 * @class
 * @param {string} portName - The name of the port to use.
 * @param {number} [baudRate=115200] - The communication speed.
 * @param {number} [delay=50] - The delay between byte transmissions in milliseconds.
 * @param {number} [maxTries=5] - The number of reconnection attempts.
 */
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

/* 시리얼 포트 관리 클래스
 * portName: 사용할 포트 이름
 * baudRate: 통신 속도 (기본값: 115200)
 * delay: 바이트 전송 간의 지연 시간 (기본값: 50ms)
 * maxTries: 재연결 시도 횟수 (기본값: 5회)
 * currentTries: 현재 재연결 시도 횟수
 */
class SerialPortManager {
  constructor(portName, baudRate = 115200, delay = 50, maxTries = 5) {
    this.portName = portName;
    this.baudRate = baudRate;
    this.delay = delay;
    this.maxTries = maxTries;
    this.currentTries = 0;
    this.serialPort = null;
    this.parser = null;
    this.isOpen = false;
    this.init();
  }

  init() {
    this.serialPort = new SerialPort({
      path: this.portName,
      baudRate: this.baudRate,
      dataBits: 8,
      stopBits: 1,
      parity: 'none',
      autoOpen: false,
      rtscts: false,
    });

    this.parser = this.serialPort.pipe(new ReadlineParser({ delimiter: '\n' }));

    // MCU에서 준 데이터 읽기
    this.parser.on('data', (data) => {
      console.log('%cReceived data:', 'color: green;', data); // ! 확인해보기
    });

    this.serialPort.on('open', () => {
      console.log('Port opened successfully');
      this.isOpen = true;
      this.currentTries = 0; //
    });

    this.serialPort.on('error', (err) => {
      console.log('Error: ', err.message);
      this.isOpen = false;
      this.reconnect();
    });

    this.serialPort.on('close', () => {
      console.log('Port closed');
      this.isOpen = false;
      this.currentTries = 0;
      this.reconnect();
    });

    this.openPort();
  }

  openPort() {
    this.serialPort.open((err) => {
      if (err) {
        console.log('Failed to open port:', err.message);
        this.reconnect();
      }
    });
  }

  reconnect() {
    // ! 재연결 횟수 제한
    if (this.currentTries >= this.maxTries) {
      console.log(`Max retries reached (${this.maxTries}). Giving up on reconnecting.`);
      return;
    }

    console.log('Attempting to reconnect...');
    this.currentTries++;
    setTimeout(() => {
      this.openPort();
    }, 5000); // 에러 이벤트 발생 시  5초 후에 재연결 시도
  }

  sendBytes(message) {
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

  close() {
    if (this.serialPort && this.isOpen) {
      this.serialPort.close((err) => {
        if (err) {
          return console.log('Error on close: ', err.message);
        }
        console.log('Port closed successfully');
        this.isOpen = false;
      });
    } else {
      console.log('Port is not open. Cannot close.');
    }
  }
  // 포트 목록 가져오기
  static async listPorts() {
    try {
      const ports = await SerialPort.list();
      return ports;
    } catch (error) {
      console.error('Failed to list ports:', error.message);
      throw error;
    }
  }
}

module.exports = SerialPortManager;
