// Program to read Ebay Auctions for my coins I collect
console.log("Start to read Ebay auctions for coins I need");

//var lincolnPull = require('./pull_lincoln.js');
var kennedyPull = require('./pull_kennedy.js');
var mercPull = require('./pull_Mercury.js');
var jeffPull = require('./pull_Jefferson.js');

jeffPull.doPull();
kennedyPull.doPull();
//lincolnPull.doPull();
mercPull.doPull();
