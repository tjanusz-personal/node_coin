var ebayUtils = require('./ebay_utils.js');

// Ebay custom aspects for Grading Certifications
var aspectNames = [
	{ "Certification":"NGC"}, {"Certification":"PCGS"}, {"Certification":"PCGS & CAC"}, {"Certification":"NGC & CAC"},
	{ "Grade": "MS 66"}
];
// Ebay itemFilters for ListingTypes I care about
var itemFilters = [	{ "ListingType": ["Auction", "AuctionWithBIN"] } ];
var yearsNeeded = ["1971", "1973", "1974", "1975", "1978", "1980", "1981", "1982", "1983", "1984", "1997", "2008"];
var searchKeywords = "Kennedy Half Dollar";

var urlArgs = {};
ebayUtils.addFinderParams(urlArgs);
urlArgs["parameters"]["keywords"] = searchKeywords;
urlArgs["parameters"]["paginationInput.entriesPerPage"] = 100;

ebayUtils.addCustomAspects(urlArgs, aspectNames);
ebayUtils.addItemFilters(urlArgs, itemFilters);
// console.log(urlArgs);

exports.doPull = function () {
	ebayUtils.doPull("Kennedy", urlArgs, yearsNeeded);
}

