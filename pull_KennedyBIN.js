var ebayUtils = require('./ebay_utils.js');
var dateFormat = require('dateformat');
var S = require('string');
var Q = require("q");
var clone = require("clone");

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
var coinType = "KennedyBIN";

exports.doPull = function () {
	var pagesToCall = [];
	// loop through and build separate page request promises
	for (var count = 1; count <=4; count++) {
		var urlArgs2 = clone(urlArgs); // need to ensure separate objects
		urlArgs2.parameters["paginationInput.pageNumber"] = count;
		pagesToCall.push(ebayUtils.doPull(coinType, urlArgs2, yearsNeeded, maxPrice, skipWords));
	}
	var allPromise = Q.all(pagesToCall);
	return allPromise;
}
