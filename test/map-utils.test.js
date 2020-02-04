'use strict'

/* global describe, it, beforeEach  */

const assert = require('assert')
const {
  MapUtils,
} = require('../dist/map-utils')

describe('MapUtils Tests.', () => {

  it('should convert a map to an array', () => {
    
    const testMap = new Map([
      [0, 'A'],
      [1, 'B'],
      [2, 'C'],
      [4, 'D'],
    ])

    const arrayResponse = MapUtils.ToArray(testMap)

    assert.equal(arrayResponse instanceof Array, true, 'ToArray response should be an array')

    for(const [key, value] of arrayResponse){
      assert.equal(typeof key, 'number', 'Key should be a number')
      assert.equal(typeof value, 'string', 'Value should be a string')
    }

  })

  it('should filter the map by a criteria and return a new map', () => {
    
    const testData = [
      [0, 'A'],
      [1, 'B'],
      [2, 'C'],
      [4, 'D'],
    ];

    const testMap = new Map(testData)

    const filteredMap = MapUtils.Filter(testMap, ([key]) => key > 1)

    assert.equal(filteredMap instanceof Map, true, 'Filter response should be a Map')

    assert.equal(filteredMap.size, 2)

    for(const [key, value] of filteredMap){
      assert.equal(typeof key, 'number', 'Key should be a number')
      assert.equal(typeof value, 'string', 'Value should be a string')
    }

  })
})