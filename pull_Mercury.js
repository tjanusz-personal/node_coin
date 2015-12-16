var ebayUtils = require('./ebay_utils.js');
var dateFormat = require('dateformat');

// Ebay custom aspects for Grading Certifications
var aspectNames = [
	{ Certification:"NGC"}, {Certification:"PCGS"}, {Certification:"PCGS & CAC"}, {Certification:"NGC & CAC"},
	{ Grade: "MS 66"}
];
// Ebay itemFilters for ListingTypes I care about
var itemFilters = [	{ ListingType: ["Auction", "AuctionWithBIN"] } ];
var yearsNeeded = ["1931", "1932", "1933", "1934", "1935", "1936", "1937", "1938", "1939", "1943"];
var skipWords = ["1943-S", "1943-P"];
var urlArgs = {};
ebayUtils.buildEbayRequestObject(urlArgs, "Mercury dime", 50, aspectNames, itemFilters);

exports.doPull = function (callback) {
	ebayUtils.doPull("Mercury", urlArgs, yearsNeeded, 100, skipWords, callback);
}
