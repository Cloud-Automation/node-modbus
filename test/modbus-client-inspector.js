'use strict'

var stampit = require('stampit')

module.exports = stampit()
  .init(function () {
    this.queueSpy = function () {
      return this.reqFifo[this.reqFifo.length - 1]
    }
  })
