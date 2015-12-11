var ebayUtils = require('./ebay_utils.js');
var dateFormat = require('dateformat');

// Ebay custom aspects for Grading Certifications
var aspectNames = [
	{ "Certification":"NGC"}, {"Certification":"PCGS"}, {"Certification":"PCGS & CAC"}, {"Certification":"NGC & CAC"}
];
// Ebay itemFilters for ListingTypes I care about
var itemFilters = [	{ "ListingType": ["Auction", "AuctionWithBIN"] } ];
var searchKeywords = "Buffalo Nickel";
var yearsNeeded = ["1920", "1921", "1922", "1923", "1924", "1925, 1926", "1927", "1929", "1931", "1932", "1933", "1934", "1935", "1936"];
var maxPrice = 250;

var urlArgs = {};
ebayUtils.addFinderParams(urlArgs);
urlArgs["parameters"]["keywords"] = searchKeywords;
urlArgs["parameters"]["paginationInput.entriesPerPage"] = 50;

ebayUtils.addCustomAspects(urlArgs, aspectNames);
ebayUtils.addItemFilters(urlArgs, itemFilters);

exports.doPull = function (callback) {
	ebayUtils.doPull("Buffalo", urlArgs, yearsNeeded, maxPrice, callback);
}
