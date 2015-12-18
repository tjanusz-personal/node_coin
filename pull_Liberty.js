var ebayUtils = require('./ebay_utils.js');
var dateFormat = require('dateformat');

// Ebay custom aspects for Grading Certifications
var aspectNames = [
	{ Certification:"NGC"}, {Certification:"PCGS"}, {Certification:"PCGS & CAC"}, {Certification:"NGC & CAC"}
];
// Ebay itemFilters for ListingTypes I care about
var itemFilters = [	{ ListingType: ["Auction", "AuctionWithBIN"] } ];
var yearsNeeded = ["1884", "1885", "1887", "1886", "1888", "1892", "1894", "1895", "1898"];
var skipWords = ["Scratched", "Damaged", "Scratch", "Damage"];

var urlArgs = {};
ebayUtils.buildEbayRequestObject(urlArgs, "Liberty Nickel", 50, aspectNames, itemFilters);

exports.doPull = function () {
	return ebayUtils.doPull("Liberty", urlArgs, yearsNeeded, 250, skipWords);
}
