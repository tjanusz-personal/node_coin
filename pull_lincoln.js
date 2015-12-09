var ebayUtils = require('./ebay_utils.js');
var dateFormat = require('dateformat');

// Ebay custom aspects for Grading Certifications
var aspectNames = [
	{ "Certification":"NGC"}, {"Certification":"PCGS"}, {"Certification":"PCGS & CAC"}, {"Certification":"NGC & CAC"},
	{ "Grade": "MS 65"}
]

var itemFilters = [
	{ "ListingType": ["Auction", "AuctionWithBIN"] }
]
var yearsNeeded = ["1909"];
var searchKeywords = "1909 lincoln cent";
var maxPrice = 200;
var urlArgs = {};
ebayUtils.addFinderParams(urlArgs);
urlArgs["parameters"]["keywords"] = searchKeywords;
urlArgs["parameters"]["paginationInput.entriesPerPage"] = 10;

ebayUtils.addCustomAspects(urlArgs, aspectNames);
ebayUtils.addItemFilters(urlArgs, itemFilters);
// console.log(urlArgs);

exports.doPull = function (callback) {
	ebayUtils.doPull("Lincoln", urlArgs, yearsNeeded, maxPrice, callback);
}
