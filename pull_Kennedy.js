var ebayUtils = require('./ebay_utils.js');
var dateFormat = require('dateformat');
var Q = require("q");
var clone = require("clone");

// Ebay custom aspects for Grading Certifications
var aspectNames = [
	{ Certification:"NGC"}, {Certification:"PCGS"}, {Certification:"PCGS & CAC"}, {Certification:"NGC & CAC"},
	{ Grade: "MS 66"}
];
// Ebay itemFilters for ListingTypes I care about
var itemFilters = [	{ ListingType: ["Auction", "AuctionWithBIN"] } ];
var yearsNeeded = ["1971", "1973", "1974", "1975", "1978", "1980", "1981", "1982", "1983", "1984", "1997", "2008"];
var urlArgs = {};
var skipWords = ["1971-D", "1974-D"];
ebayUtils.buildEbayRequestObject(urlArgs, "Kennedy Half Dollar", 50, aspectNames, itemFilters);

exports.doPull = function () {
	var pagesToCall = [];
	for (var count = 1; count <=1; count++) {
		var urlArgs2 = clone(urlArgs);
		urlArgs2.parameters["paginationInput.pageNumber"] = count;
		pagesToCall.push(ebayUtils.doPull("Kennedy", urlArgs2, yearsNeeded, 50, skipWords));
	}
	var allPromise = Q.all(pagesToCall);
	return allPromise;
}
