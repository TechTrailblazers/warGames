'use strict';

const EventEmitter = require('events');

const eventPool = new EventEmitter();

module.exports = eventPool;
