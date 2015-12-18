var dateFormat = require('dateformat');
console.log("Start to read Ebay auctions for coins I need");
var Q = require("q");

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

var coinData = [];
var binData = [];

function collateCoinResult(coinResults) {
	var results = coinResults["results"];
	var coinType = coinResults["coinType"];
	var paginationOutput = coinResults["paginationOutput"]
	console.log("COIN TYPE: %s Matches: %s, Pages: %s", coinType, results.length, paginationOutput.totalEntries);
	results.forEach(function(coinResult) {
		if (coinType.indexOf("BIN") > 0) {
			binData.push(coinResult);
		} else {
			coinData.push(coinResult);
		}
  });
}

function collatePromisedResults(coinResults) {
	// super hacky way to flatten out any sub arrays for the BIN results since they're multiple page result sets
	var mergedArrays = [].concat.apply([], coinResults);
	for (var count = 0; count < mergedArrays.length; count++) {
		collateCoinResult(mergedArrays[count]);
	}
}

function writeToXLSXFile(coinData2, binData2) {
  var dateString = dateFormat(new Date(), "mm-dd-hMM");
  var fileName = "CoinListing-" + dateString + ".xlsx";
  console.log("### Writing out xlsx file - %s", fileName);
  xlsxWriter.writeCoinsToXlSX(coinData, binData, fileName);
}

// Queue up all requests
var allPromise = Q.all([ indianPull.doPull(),  buffaloPull.doPull(), kennedyPull.doPull(),
	jeffPull.doPull(), mercPull.doPull(), libPull.doPull(), jeffBINPull.doPull(), kennedyBINPull.doPull() ]);

// Write out all responses
allPromise.then(collatePromisedResults).then(writeToXLSXFile).then(null, console.log);
