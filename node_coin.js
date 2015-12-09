var dateFormat = require('dateformat');

// Program to read Ebay Auctions for my coins I collect
console.log("Start to read Ebay auctions for coins I need");

//var lincolnPull = require('./pull_lincoln.js');
var kennedyPull = require('./pull_kennedy.js');
var mercPull = require('./pull_Mercury.js');
var jeffPull = require('./pull_Jefferson.js');
var libPull = require('./pull_Liberty.js');
var xlsxWriter = require('./xlsx_writer.js');

var coinData = [];
var runCount = 0;
var maxRuns = 4;

function printResults(results, coinType) {
	console.log("COIN TYPE: %s Matches: %s", coinType, results.length);
	results.forEach(function(coinResult) {
//		console.log("%s -- %s -- %s -- %s", coinResult["type"], dateString, coinResult["price"], coinResult["title"]);
    coinData.push(coinResult);
  });

  if (++runCount == maxRuns) {
    console.log("### Writing out xlsx file");
    writeToFile(coinData);
  }
}


jeffPull.doPull(printResults);
kennedyPull.doPull(printResults);
//lincolnPull.doPull(printResults);
mercPull.doPull(printResults);
libPull.doPull(printResults);

function writeToFile(results) {
  xlsxWriter.writeCoinsToXlSX(results, "testFileName");
}
