var ebayUtils = require('./ebay_utils.js');
var dateFormat = require('dateformat');

// Ebay custom aspects for Grading Certifications
var aspectNames = [
	{ "Certification":"NGC"}, {"Certification":"PCGS"}, {"Certification":"PCGS & CAC"}, {"Certification":"NGC & CAC"}
];
// Ebay itemFilters for ListingTypes I care about
var itemFilters = [	{ "ListingType": ["Auction", "AuctionWithBIN"] } ];
var searchKeywords = "Liberty Nickel";
var yearsNeeded = ["1884", "1885", "1887", "1886", "1888", "1892", "1894", "1895", "1898"];
var maxPrice = 250;

var urlArgs = {};
ebayUtils.addFinderParams(urlArgs);
urlArgs["parameters"]["keywords"] = searchKeywords;
urlArgs["parameters"]["paginationInput.entriesPerPage"] = 50;

ebayUtils.addCustomAspects(urlArgs, aspectNames);
ebayUtils.addItemFilters(urlArgs, itemFilters);

exports.doPull = function (callback) {
	ebayUtils.doPull("Liberty", urlArgs, yearsNeeded, maxPrice, callback);
}
