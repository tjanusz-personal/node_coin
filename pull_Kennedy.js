var ebayUtils = require('./ebay_utils.js');
var dateFormat = require('dateformat');

// Ebay custom aspects for Grading Certifications
var aspectNames = [
	{ Certification:"NGC"}, {Certification:"PCGS"}, {Certification:"PCGS & CAC"}, {Certification:"NGC & CAC"},
	{ Grade: "MS 66"}
];
// Ebay itemFilters for ListingTypes I care about
var itemFilters = [	{ ListingType: ["Auction", "AuctionWithBIN"] } ];
var yearsNeeded = ["1971", "1973", "1974", "1975", "1978", "1980", "1981", "1982", "1983", "1984", "1997", "2008"];
var urlArgs = {};
var skipWords = [];
ebayUtils.buildEbayRequestObject(urlArgs, "Kennedy Half Dollar", 100, aspectNames, itemFilters);

exports.doPull = function (callback) {
	ebayUtils.doPull("Kennedy", urlArgs, yearsNeeded, 50, skipWords, callback);
}
