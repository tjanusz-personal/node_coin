var dateFormat = require('dateformat');
console.log("Start to read Ebay auctions for coins I need");
var Q = require("q");
var ebayUtils = require('./ebay_utils.js');

// run with debugger
// ./node_modules/node-inspector/bin/node-debug.js node_coin.js MY_KEY HERE

//var lincolnPull = require('./pull_lincoln.js');
var indianPull = require('./pull_Indian.js');
var buffaloPull = require('./pull_Buffalo.js');
var kennedyPull = require('./pull_kennedy.js');
var mercPull = require('./pull_Mercury.js');
var jeffPull = require('./pull_Jefferson.js');
var libPull = require('./pull_Liberty.js');
// BIN now calls that use multiple results
var jeffBINPull = require('./pull_JeffersonBIN.js');
var kennedyBINPull = require('./pull_kennedyBIN.js');
var xlsxWriter = require('./xlsx_writer.js');

function writeToXLSXFile(allResults) {
  var dateString = dateFormat(new Date(), "mm-dd-hMM");
  var fileName = "CoinListing-" + dateString + ".xlsx";
  console.log("### Writing out xlsx file - %s", fileName);
  xlsxWriter.writeCoinsToXlSX(allResults.auction, allResults.bin, fileName);
}

// Queue up all requests
var allPromise = Q.all([ indianPull.doPull(),  buffaloPull.doPull(), kennedyPull.doPull(),
	jeffPull.doPull(), mercPull.doPull(), libPull.doPull(), jeffBINPull.doPull(), kennedyBINPull.doPull() ]);
// var allPromise = Q.all([ kennedyPull.doPull() ]);

// Write out all responses
allPromise.then(ebayUtils.collatePromisedResults).then(writeToXLSXFile).then(null, console.log);
