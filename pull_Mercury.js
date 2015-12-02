var ebayUtils = require('./ebay_utils.js');

// Ebay custom aspects for Grading Certifications
var aspectNames = [
	{ "Certification":"NGC"}, {"Certification":"PCGS"}, {"Certification":"PCGS & CAC"}, {"Certification":"NGC & CAC"},
	{ "Grade": "MS 66"}
];
// Ebay itemFilters for ListingTypes I care about
var itemFilters = [	{ "ListingType": ["Auction", "AuctionWithBIN"] } ];
var yearsNeeded = ["1931", "1932", "1933", "1934", "1935", "1936", "1937", "1938", "1939", "1943"];
var searchKeywords = "Mercury dime";

var urlArgs = {};
ebayUtils.addFinderParams(urlArgs);
urlArgs["parameters"]["keywords"] = searchKeywords;
urlArgs["parameters"]["paginationInput.entriesPerPage"] = 50;

ebayUtils.addCustomAspects(urlArgs, aspectNames);
ebayUtils.addItemFilters(urlArgs, itemFilters);
// console.log(urlArgs);

exports.doPull = function () {
	ebayUtils.doPull("Mercury", urlArgs, yearsNeeded);
}

