var ebayUtils = require('./ebay_utils.js');
var dateFormat = require('dateformat');
var Q = require("q");
var clone = require("clone");

// Ebay custom aspects for Grading Certifications
var aspectNames = [
	{ Certification:"NGC"}, {Certification:"PCGS"}, {Certification:"PCGS & CAC"}, {Certification:"NGC & CAC"}
];
// Ebay itemFilters for ListingTypes I care about
var itemFilters = [	{ ListingType: ["Auction", "AuctionWithBIN"] } ];
var yearsNeeded = ["1859", "1864", "1865", "1867", "1874", "1875", "1880", "1881", "1882", "1883", "1884", "1886","1887", "1889", "1891", "1894", "1895", "1896", "1897", "1898", "1899", "1900", "1901", "1902", "1903", "1904", "1905", "1906"];
var skipWords = ["Scratched", "Cleaning", "Cleaned", "Altered Color", "Damage"];

var urlArgs = {};
ebayUtils.buildEbayRequestObject(urlArgs, "Indian Cent", 50, aspectNames, itemFilters);

exports.doPull = function () {
	var pagesToCall = [];
	for (var count = 1; count <=3; count++) {
		var urlArgs2 = clone(urlArgs);
		urlArgs2.parameters["paginationInput.pageNumber"] = count;
		pagesToCall.push(ebayUtils.doPull("Indian", urlArgs2, yearsNeeded, 200, skipWords));
	}
	var allPromise = Q.all(pagesToCall);
	return allPromise;
}
