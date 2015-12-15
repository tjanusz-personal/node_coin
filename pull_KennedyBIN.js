var ebayUtils = require('./ebay_utils.js');
var dateFormat = require('dateformat');

// Ebay custom aspects for Grading Certifications
var aspectNames = [
	{ "Certification":"NGC"}, {"Certification":"PCGS"}, {"Certification":"PCGS & CAC"}, {"Certification":"NGC & CAC"},
	{ "Grade": "MS 66"}
];
// Ebay itemFilters for ListingTypes I care about
var itemFilters = [	{ "ListingType": ["FixedPrice"] } ];
var yearsNeeded = ["1971", "1973", "1974", "1975", "1978", "1980", "1981", "1982", "1983", "1984", "1997", "2008"];
var searchKeywords = "Kennedy Half Dollar";
var maxPrice = 100;
var urlArgs = {};
ebayUtils.addFinderParams(urlArgs);
ebayUtils.addFinderParams(urlArgs, "PricePlusShippingLowest");
urlArgs["parameters"]["keywords"] = searchKeywords;
urlArgs["parameters"]["paginationInput.entriesPerPage"] = 100;

ebayUtils.addCustomAspects(urlArgs, aspectNames);
ebayUtils.addItemFilters(urlArgs, itemFilters);
// console.log(urlArgs);

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
		ebayUtils.doPull("KennedyBIN", urlArgs, yearsNeeded, maxPrice, processPageResult);
	} else {
		// add last page data
		finalResults["paginationOutput"] = coinResults["paginationOutput"];
		globalCallback(finalResults, coinType);
	}
}

exports.doPull = function (callback) {
	// store away global callback
	globalCallback = callback;
	ebayUtils.doPull("KennedyBIN", urlArgs, yearsNeeded, maxPrice, processPageResult);
}
