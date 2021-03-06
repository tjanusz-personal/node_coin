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
var yearsNeeded = ["1939", "1952", "1953", "1954", "1955", "1958", "1961", "1964", "1963", "1982", "1983",
	"1985", "1991", "1995", "1997", "1998", "2000", "2002", "2003", "2007", "2009"];
var skipWords = ["1952 S", "1952-S", "1953-D", "1953-S", "1958 D", "1958-D", "1952 D", "1952-D", "1982 D", "1982-D", "1985-P", "1978-D",
	"PROOF", "SMS", "1952S", "1939 P", "MS65", "2000-D"];
var urlArgs = {};
ebayUtils.buildEbayRequestObject(urlArgs, "Jefferson Nickels", 50, aspectNames, itemFilters);

exports.doPull = function () {
	var pagesToCall = [];
	for (var count = 1; count <=3; count++) {
		var urlArgs2 = clone(urlArgs);
		urlArgs2.parameters["paginationInput.pageNumber"] = count;
		pagesToCall.push(ebayUtils.doPull("Jefferson", urlArgs2, yearsNeeded, 50, skipWords));
	}
	var allPromise = Q.all(pagesToCall);
	return allPromise;
}
