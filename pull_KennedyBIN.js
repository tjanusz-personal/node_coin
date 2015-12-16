var ebayUtils = require('./ebay_utils.js');
var dateFormat = require('dateformat');
var S = require('string');

// Ebay custom aspects for Grading Certifications
var aspectNames = [
	{ Certification:"NGC"}, {Certification:"PCGS"}, {Certification:"PCGS & CAC"}, {Certification:"NGC & CAC"},
	{ Grade: "MS 66"}
];
// Ebay itemFilters for ListingTypes I care about
var itemFilters = [	{ ListingType: ["FixedPrice"] } ];
var yearsNeeded = ["1971", "1973", "1974", "1975", "1978", "1980", "1981", "1982", "1983", "1984", "1997", "2008"];
var skipWords = ["1971 D", "1971-D", "1973 D", "1973-D", "2008 P", "2008-P", "1980-P", "1971 S", "1978-P"];
var maxPrice = 50;
var urlArgs = {};
ebayUtils.buildEbayRequestObject(urlArgs, "Kennedy Half Dollar", 100, aspectNames, itemFilters, "PricePlusShippingLowest");

var globalCallback = {};
var finalResults = { results: [], paginationOutput: {} };

function processPageResult(coinResults, coinType) {
	var paginationOutput = coinResults.paginationOutput;
	var currentPageNumber = parseInt(paginationOutput.pageNumber);
	var nextPageNum = currentPageNumber + 1;
	var results = coinResults.results;

	finalResults.results = finalResults.results.concat(results);

	if (currentPageNumber	<= 4) {
		console.log("*** FOUND A PAGE: %s Matches: %s, PageNumber: %s, NextPage: %s", coinType, results.length, currentPageNumber, nextPageNum);
		urlArgs.parameters["paginationInput.pageNumber"] = nextPageNum;
		ebayUtils.doPull("KennedyBIN", urlArgs, yearsNeeded, maxPrice, skipWords, processPageResult);
	} else {
		// add last page data
		finalResults.paginationOutput = coinResults.paginationOutput;
		globalCallback(finalResults, coinType);
	}
}

exports.doPull = function (callback) {
	// store away global callback
	globalCallback = callback;
	ebayUtils.doPull("KennedyBIN", urlArgs, yearsNeeded, maxPrice, skipWords, processPageResult);
}
