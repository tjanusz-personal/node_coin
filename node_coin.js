// Program to read Ebay Auctions for my coins I collect
console.log("Start to read Ebay auctions for coins I need");

var lincolnPull = require('./pull_lincoln.js');
var kennedyPull = require('./pull_kennedy.js');
var mercPull = require('./pull_Mercury.js');

kennedyPull.doPull();
lincolnPull.doPull();
mercPull.doPull();

// todo: add more types I need, catch errors and clean up
