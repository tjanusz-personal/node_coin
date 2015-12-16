var ebayUtils = require('./ebay_utils.js');
var dateFormat = require('dateformat');

// Ebay custom aspects for Grading Certifications
var aspectNames = [
	{ Certification:"NGC"}, {Certification:"PCGS"}, {Certification:"PCGS & CAC"}, {Certification:"NGC & CAC"},
	{ Grade: "MS 65"}
];

var itemFilters = [	{ ListingType: ["Auction", "AuctionWithBIN"] }];
var yearsNeeded = ["1909"];
var maxPrice = 200;
var skipWords = [];
var urlArgs = {};
ebayUtils.buildEbayRequestObject(urlArgs, "1909 lincoln cent", 10, aspectNames, itemFilters);

exports.doPull = function (callback) {
	ebayUtils.doPull("Lincoln", urlArgs, yearsNeeded, 200, skipWords, callback);
}
