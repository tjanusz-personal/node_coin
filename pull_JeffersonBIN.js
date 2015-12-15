var ebayUtils = require('./ebay_utils.js');
var dateFormat = require('dateformat');

// Ebay custom aspects for Grading Certifications
var aspectNames = [
	{ "Certification":"NGC"}, {"Certification":"PCGS"}, {"Certification":"PCGS & CAC"}, {"Certification":"NGC & CAC"},
	{ "Grade": "MS 66"}
];
// Ebay itemFilters for ListingTypes I care about
var itemFilters = [	{ "ListingType": ["FixedPrice"] } ];
var yearsNeeded = ["1939", "1952", "1953", "1954", "1955", "1958", "1961", "1964", "1963", "1976", "1978", "1982", "1983",
	"1985", "1991", "1995", "1997", "1998", "2000", "2002", "2003", "2007", "2008", "2009"];
var searchKeywords = "Jefferson Nickels";

var maxPrice = 50;

var urlArgs = {};
ebayUtils.addFinderParams(urlArgs, "PricePlusShippingLowest");
urlArgs["parameters"]["keywords"] = searchKeywords;
urlArgs["parameters"]["paginationInput.entriesPerPage"] = 100;

ebayUtils.addCustomAspects(urlArgs, aspectNames);
ebayUtils.addItemFilters(urlArgs, itemFilters);
var allResults = [];
var globalCallback = {};
var finalResults = { results: [] };

function processPageResult(coinResults, coinType) {
	var paginationOutput = coinResults["paginationOutput"];
	var currentPageNumber = parseInt(paginationOutput.pageNumber);
	var nextPageNum = currentPageNumber + 1;
	var results = coinResults["results"];
	finalResults["results"] = finalResults["results"].concat(results);

	if (currentPageNumber	<= 3) {
		console.log("*** FOUND A PAGE: %s Matches: %s, PageNumber: %s, NextPage: %s", coinType, results.length, currentPageNumber, nextPageNum);
		urlArgs["parameters"]["paginationInput.pageNumber"] = nextPageNum;
		ebayUtils.doPull("JeffersonBIN", urlArgs, yearsNeeded, maxPrice, processPageResult);
	} else {
		// add last page data
		finalResults["paginationOutput"] = coinResults["paginationOutput"];
		globalCallback(finalResults, coinType);
	}
}

exports.doPull = function (callback) {
	// store away global callback
	globalCallback = callback;
	ebayUtils.doPull("JeffersonBIN", urlArgs, yearsNeeded, maxPrice, processPageResult);
}
