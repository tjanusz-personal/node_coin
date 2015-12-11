var ebayUtils = require('./ebay_utils.js');
var dateFormat = require('dateformat');

// Ebay custom aspects for Grading Certifications
var aspectNames = [
	{ "Certification":"NGC"}, {"Certification":"PCGS"}, {"Certification":"PCGS & CAC"}, {"Certification":"NGC & CAC"}
];
// Ebay itemFilters for ListingTypes I care about
var itemFilters = [	{ "ListingType": ["Auction", "AuctionWithBIN"] } ];
var searchKeywords = "Indian Cent";
var yearsNeeded = ["1859", "1864", "1865", "1867", "1874", "1875", "1880", "1881", "1882", "1883", "1884", "1886",
	"1887", "1889", "1900", "1901", "1902", "1903", "1904", "1905", "1906"];
var maxPrice = 250;

var urlArgs = {};
ebayUtils.addFinderParams(urlArgs);
urlArgs["parameters"]["keywords"] = searchKeywords;
urlArgs["parameters"]["paginationInput.entriesPerPage"] = 50;

ebayUtils.addCustomAspects(urlArgs, aspectNames);
ebayUtils.addItemFilters(urlArgs, itemFilters);

exports.doPull = function (callback) {
	ebayUtils.doPull("Indian", urlArgs, yearsNeeded, maxPrice, callback);
}
