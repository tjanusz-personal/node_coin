var ebayUtils = require('./ebay_utils.js');
var dateFormat = require('dateformat');

// Ebay custom aspects for Grading Certifications
var aspectNames = [
	{ Certification:"NGC"}, {Certification:"PCGS"}, {Certification:"PCGS & CAC"}, {Certification:"NGC & CAC"},
	{ Grade: "MS 66"}
];
// Ebay itemFilters for ListingTypes I care about
var itemFilters = [	{ ListingType: ["FixedPrice"] } ];
var yearsNeeded = ["1939", "1952", "1953", "1954", "1955", "1958", "1961", "1964", "1963", "1976", "1978", "1982", "1983",
	"1985", "1991", "1995", "1997", "1998", "2000", "2002", "2003", "2007", "2008", "2009"];
var maxPrice = 35;

var skipWords = ["1952 S", "1952-S", "1958 D", "1958-D", "1952 D", "1952-D", "1982 D", "1982-D", "1985-P", "1978-D",
	"PROOF", "SMS", "1952S", "1939 P", "MS65", "2000-D"];

var urlArgs = {};
ebayUtils.buildEbayRequestObject(urlArgs, "Jefferson Nickels", 100, aspectNames, itemFilters, "PricePlusShippingLowest");
var globalCallback = {};
var finalResults = { results: [], paginationOutput: {} };

function processPageResult(coinResults, coinType) {
	var paginationOutput = coinResults.paginationOutput;
	var currentPageNumber = parseInt(paginationOutput.pageNumber);
	var nextPageNum = currentPageNumber + 1;
	var results = coinResults.results;

	finalResults.results = finalResults.results.concat(results);

	if (currentPageNumber	<= 5) {
		console.log("*** FOUND A PAGE: %s Matches: %s, Total Pages: %s, PageNumber: %s, NextPage: %s", coinType, results.length, paginationOutput.totalPages, currentPageNumber, nextPageNum);
		urlArgs.parameters["paginationInput.pageNumber"] = nextPageNum;
		ebayUtils.doPull("JeffersonBIN", urlArgs, yearsNeeded, maxPrice, skipWords, processPageResult);
	} else {
		// add last page data
		finalResults.paginationOutput = coinResults.paginationOutput;
		globalCallback(finalResults, coinType);
	}
}

exports.doPull = function (callback) {
	// store away global callback
	globalCallback = callback;
	ebayUtils.doPull("JeffersonBIN", urlArgs, yearsNeeded, maxPrice, skipWords, processPageResult);
}
