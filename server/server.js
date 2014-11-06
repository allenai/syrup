'use strict';

var express = require('express');
var griddle = require('griddle');
var fs = require('fs');

var options = require('minimist')(process.argv.slice(2)) || {};

var base = options.base;
var serve = options.serve;
var watch = options.watch;
var port = options.port || 4000;

var app = express();
app.use(griddle(base, watch));
app.use(express.static(serve));

app.listen(port, function() {
  if(process && process.send) {
    process.send({ event: 'SERVER_STARTED', data: 'http://localhost:' + port });
  } else {
    console.log('Server listening on http://localhost:' + port);
  }
});