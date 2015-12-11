var dateFormat = require('dateformat');
console.log("Start to read Ebay auctions for coins I need");

//var lincolnPull = require('./pull_lincoln.js');
var kennedyPull = require('./pull_kennedy.js');
var kennedyBINPull = require('./pull_kennedyBIN.js');
var mercPull = require('./pull_Mercury.js');
var jeffPull = require('./pull_Jefferson.js');
var jeffBINPull = require('./pull_JeffersonBIN.js');
var libPull = require('./pull_Liberty.js');
var indianPull = require('./pull_Indian.js');
var buffaloPull = require('./pull_Buffalo.js');
var xlsxWriter = require('./xlsx_writer.js');

var coinData = [];
var binData = [];
var runCount = 0;
var maxRuns = 8;

function printResults(results, coinType) {
	console.log("COIN TYPE: %s Matches: %s", coinType, results.length);
	results.forEach(function(coinResult) {
		if (coinType.indexOf("BIN") > 0) {
			binData.push(coinResult);
		} else {
			coinData.push(coinResult);
		}
  });

  if (++runCount == maxRuns) {
    writeToFile(coinData, binData);
  }
}

jeffPull.doPull(printResults);
jeffBINPull.doPull(printResults);
kennedyPull.doPull(printResults);
kennedyBINPull.doPull(printResults);
//lincolnPull.doPull(printResults);
mercPull.doPull(printResults);
libPull.doPull(printResults);
indianPull.doPull(printResults);
buffaloPull.doPull(printResults);

function writeToFile(results, binResults) {
  var now = new Date();
  var dateString = dateFormat(now, "mm-dd-hMM");
  var fileName = "CoinListing-" + dateString + ".xlsx";
  console.log("### Writing out xlsx file - %s", fileName);
  xlsxWriter.writeCoinsToXlSX(results, binResults, fileName);
}
