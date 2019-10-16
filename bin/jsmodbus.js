#!/usr/bin/env node

const pkg = require('../package.json')
const net = require('net')
const modbus = require('..')
const program = require('commander')

program
  .command('fc01 <host> <unitId> <range>')
  .description('Read Coils')
  .option('-p, --port <port>', 'Modbus Port (502 by default)')
  .option('-r, --repeat <time>', 'Repeat interval in milliseconds')
  .option('-b, --buffer', 'Print output as buffer')
  .option('-t, --timeout <timeout>', 'connection timeout in milliseconds (2000 by default)')
  .option('-bm, --benchmark', 'show timestamp benchmark information')
  .action(function (host, unitId, range, options) {
    const socket = new net.Socket()

    const port = options.port ? options.port : 502
    unitId = parseInt(unitId)
    const timeout = options.timeout ? parseInt(options.timeout, 10) : 2000

    const client = new modbus.client.TCP(socket, unitId, timeout)

    console.log(`Attempting to connect to ${host}:${port} at unitId ${unitId} ...`)

    socket.on('connect', function () {
      console.log('Connected')
      const rangeArray = range.split(':')
      const start = rangeArray[0]
      const end = rangeArray[1]

      const makeRequest = (requestNum) => {
        client.readCoils(start, Number(end - start))
          .then(function (resp) {
            let data = resp.response._body.valuesAsArray

            if (options.buffer) {
              data = resp.response._body.valuesAsBuffer
            }

            if (options.benchmark) {
              const benchmarkString = `transfer=${resp.metrics.transferTime} ms, cue=${resp.metrics.waitTime} ms`
              if (requestNum) {
                console.log(requestNum, data, benchmarkString)
              } else {
                console.log(data, benchmarkString)
              }
            } else {
              if (requestNum) {
                console.log(requestNum, data)
              } else {
                console.log(data)
              }
            }

            if (!options.repeat) {
              socket.end()
            }
          }).catch(function () {
            console.error(require('util').inspect(arguments, {
              depth: null
            }))
            socket.end()
          })
      }

      if (options.repeat) {
        let requestNumber = 1
        setInterval(() => {
          makeRequest(requestNumber)
          requestNumber++
        }, options.repeat)
      }

      makeRequest()
    })

    socket.on('error', (err) => {
      console.error(err)
      process.exit(1)
    })

    socket.on('end', () => process.exit(0))
    socket.connect({
      host,
      port
    })
  })

program
  .command('fc02 <host> <unitId> <range>')
  .description('Read Discrete Inputs')
  .option('-p, --port <port>', 'Modbus Port (502 by default)')
  .option('-r, --repeat <time>', 'Repeat interval in milliseconds')
  .option('-b, --buffer', 'Print output as buffer')
  .option('-t, --timeout <timeout>', 'connection timeout in milliseconds (2000 by default)')
  .option('-bm, --benchmark', 'show timestamp benchmark information')
  .action(function (host, unitId, range, options) {
    const socket = new net.Socket()

    const port = options.port ? options.port : 502
    unitId = parseInt(unitId)
    const timeout = options.timeout ? parseInt(options.timeout, 10) : 2000

    const client = new modbus.client.TCP(socket, unitId, timeout)

    console.log(`Attempting to connect to ${host}:${port} at unitId ${unitId} ...`)

    socket.on('connect', function () {
      console.log('Connected')
      const rangeArray = range.split(':')
      const start = rangeArray[0]
      const end = rangeArray[1]

      const makeRequest = (requestNum) => {
        client.readDiscreteInputs(start, Number(end - start))
          .then(function (resp) {
            let data = resp.response._body.valuesAsArray

            if (options.buffer) {
              data = resp.response._body.valuesAsBuffer
            }

            if (options.benchmark) {
              const benchmarkString = `transfer=${resp.metrics.transferTime} ms, cue=${resp.metrics.waitTime} ms`
              if (requestNum) {
                console.log(requestNum, data, benchmarkString)
              } else {
                console.log(data, benchmarkString)
              }
            } else {
              if (requestNum) {
                console.log(requestNum, data)
              } else {
                console.log(data)
              }
            }

            if (!options.repeat) {
              socket.end()
            }
          }).catch(function () {
            console.error(require('util').inspect(arguments, {
              depth: null
            }))
            socket.end()
          })
      }

      if (options.repeat) {
        let requestNumber = 1
        setInterval(() => {
          makeRequest(requestNumber)
          requestNumber++
        }, options.repeat)
      }

      makeRequest()
    })

    socket.on('error', (err) => {
      console.error(err)
      process.exit(1)
    })

    socket.on('end', () => process.exit(0))
    socket.connect({
      host,
      port
    })
  })

program
  .command('fc03 <host> <unitId> <range>')
  .description('Read Holding Registers')
  .option('-p, --port <port>', 'Modbus Port (502 by default)')
  .option('-r, --repeat <time>', 'Repeat interval in milliseconds')
  .option('-b, --buffer', 'Print output as buffer')
  .option('-t, --timeout <timeout>', 'connection timeout in milliseconds (2000 by default)')
  .option('-bm, --benchmark', 'show timestamp benchmark information')
  .action(function (host, unitId, range, options) {
    const socket = new net.Socket()

    const port = options.port ? options.port : 502
    unitId = parseInt(unitId)
    const timeout = options.timeout ? parseInt(options.timeout, 10) : 2000

    const client = new modbus.client.TCP(socket, unitId, timeout)

    console.log(`Attempting to connect to ${host}:${port} at unitId ${unitId} ...`)

    socket.on('connect', function () {
      console.log('Connected')
      const rangeArray = range.split(':')
      const start = rangeArray[0]
      const end = rangeArray[1]

      const makeRequest = (requestNum) => {
        client.readHoldingRegisters(start, Number(end - start))
          .then(function (resp) {
            let data = resp.response._body.valuesAsArray

            if (options.buffer) {
              data = resp.response._body.valuesAsBuffer
            }

            if (options.benchmark) {
              const benchmarkString = `transfer=${resp.metrics.transferTime} ms, cue=${resp.metrics.waitTime} ms`
              if (requestNum) {
                console.log(requestNum, data, benchmarkString)
              } else {
                console.log(data, benchmarkString)
              }
            } else {
              if (requestNum) {
                console.log(requestNum, data)
              } else {
                console.log(data)
              }
            }

            if (!options.repeat) {
              socket.end()
            }
          }).catch(function () {
            console.error(require('util').inspect(arguments, {
              depth: null
            }))
            socket.end()
          })
      }

      if (options.repeat) {
        let requestNumber = 1
        setInterval(() => {
          makeRequest(requestNumber)
          requestNumber++
        }, options.repeat)
      }

      makeRequest()
    })

    socket.on('error', (err) => {
      console.error(err)
      process.exit(1)
    })

    socket.on('end', () => process.exit(0))
    socket.connect({
      host,
      port
    })
  })

program
  .command('fc04 <host> <unitId> <range>')
  .description('Read Input Registers')
  .option('-p, --port <port>', 'Modbus Port (502 by default)')
  .option('-r, --repeat <time>', 'Repeat interval in milliseconds')
  .option('-b, --buffer', 'Print output as buffer')
  .option('-t, --timeout <timeout>', 'connection timeout in milliseconds (2000 by default)')
  .option('-bm, --benchmark', 'show timestamp benchmark information')
  .action(function (host, unitId, range, options) {
    const socket = new net.Socket()

    const port = options.port ? options.port : 502
    unitId = parseInt(unitId)
    const timeout = options.timeout ? parseInt(options.timeout, 10) : 2000

    const client = new modbus.client.TCP(socket, unitId, timeout)

    console.log(`Attempting to connect to ${host}:${port} at unitId ${unitId} ...`)

    socket.on('connect', function () {
      console.log('Connected')
      const rangeArray = range.split(':')
      const start = rangeArray[0]
      const end = rangeArray[1]

      const makeRequest = (requestNum) => {
        client.readInputRegisters(start, Number(end - start))
          .then(function (resp) {
            let data = resp.response._body.valuesAsArray

            if (options.buffer) {
              data = resp.response._body.valuesAsBuffer
            }

            if (options.benchmark) {
              const benchmarkString = `transfer=${resp.metrics.transferTime} ms, cue=${resp.metrics.waitTime} ms`
              if (requestNum) {
                console.log(requestNum, data, benchmarkString)
              } else {
                console.log(data, benchmarkString)
              }
            } else {
              if (requestNum) {
                console.log(requestNum, data)
              } else {
                console.log(data)
              }
            }

            if (!options.repeat) {
              socket.end()
            }
          }).catch(function () {
            console.error(require('util').inspect(arguments, {
              depth: null
            }))
            socket.end()
          })
      }

      if (options.repeat) {
        let requestNumber = 1
        setInterval(() => {
          makeRequest(requestNumber)
          requestNumber++
        }, options.repeat)
      }

      makeRequest()
    })

    socket.on('error', (err) => {
      console.error(err)
      process.exit(1)
    })

    socket.on('end', () => process.exit(0))
    socket.connect({
      host,
      port
    })
  })

program
  .version(pkg.version)
  .parse(process.argv)
