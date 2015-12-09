var Client = require('node-rest-client').Client;
var util = require('util');
var dateFormat = require('dateformat');
var S = require('string');

var processArgs = process.argv.slice(2);
if (processArgs == null) {
	processArgs = "";
}

client = new Client();
module.exports.rest_client = client;

// make immediately invoked function to add custom aspects to url arguments
exports.addCustomAspects = function(urlArguments, aspectValueArray) {
	for (var count = 0; count < aspectValueArray.length; count++) {
		var aspect = aspectValueArray[count];
		var aspectNameString = util.format("aspectFilter(%s).aspectName", count);
		for (var prop in aspect) {
			urlArguments["parameters"][aspectNameString]=prop;
			var aspectValueString = util.format("aspectFilter(%s).aspectValueName", count);
			urlArguments["parameters"][aspectValueString]=aspect[prop];
		}
	}
}

// make immediately invoked function to add item Filter to url arguments
exports.addItemFilters = function(urlArguments, itemFilterArray) {
	for (var count = 0; count < itemFilterArray.length; count++) {
		var itemFilter = itemFilterArray[count];
		var filterNameString = util.format("itemFilter(%s).name", count);
		for (var prop in itemFilter) {
			urlArguments["parameters"][filterNameString]=prop;
			var propValues = itemFilter[prop];
			for (var valueCount = 0; valueCount < propValues.length; valueCount++) {
				var filterValueString = util.format("itemFilter(%s).value(%s)", count, valueCount);
				urlArguments["parameters"][filterValueString]=propValues[valueCount];
			}
		}
	}
}

exports._filterResults = function(coinType, jsonOuterResponse, yearsNeeded, maxPrice) {
	return filterResults(coinType, jsonOuterResponse, yearsNeeded, maxPrice);
}

exports._responseHasError = function (jsonOuterResponse, coinType) {
	return responseHasError(jsonOuterResponse, coinType);
}

function responseHasError(jsonOuterResponse, coinType) {
	if (jsonOuterResponse.errorMessage != null) {
		var errorInfo = jsonOuterResponse.errorMessage[0].error[0];
		console.log("CALL FAILED for %s! %s, message: %s", coinType, errorInfo.errorId, errorInfo.message);
		return true;
	}
	return false;
}

function filterResults(coinType, jsonOuterResponse, yearsNeeded, maxPrice) {
	var coinMatches = [];
	if (responseHasError(jsonOuterResponse, coinType)) {
		return;
	}
	var jsonResponse = jsonOuterResponse.findItemsByKeywordsResponse[0];
	var searchResult = jsonResponse.searchResult;
	var items = searchResult[0].item;
	if (items == null) {
		return coinMatches;
	}
	for (var icount = 0; icount < items.length; icount++) {
		var item = items[icount];
		var currentPrice = item.sellingStatus[0].currentPrice[0];
		var currentPriceValue = currentPrice["__value__"];
		if (!needItem(yearsNeeded, item.title, currentPriceValue, maxPrice)) {
			continue;
		}
		var dateString = dateFormat(item.listingInfo[0].endTime, "mmmm dS, yyyy, h:MM:ss TT");
		var coinMatch = { type: coinType, title: item.title, dateString: dateString, price: currentPriceValue};
		coinMatches.push(coinMatch);
	}
	return coinMatches;
}

function needItem(yearsNeeded, title, currentPriceValue, maxPrice) {
	if (currentPriceValue > maxPrice) {
		return false;
	}

	if (yearsNeeded == null) {
		return true;
	}

	for (var i = 0; i < yearsNeeded.length; i++) {
		var year = yearsNeeded[i];
		var boolVal = S(title.toString()).contains(year.toString());
		if (boolVal) {
			return true;
		}
	}
	return false;
}

exports._needItem = function(yearsNeeded, title, currentPriceValue, maxPrice) {
	return needItem(yearsNeeded, title, currentPriceValue, maxPrice);
}

exports.addFinderParams = function(urlArgs) {
	urlArgs["path"] = { };
	urlArgs["parameters"] = {};
	var parmArg = urlArgs["parameters"];
	parmArg["OPERATION-NAME"]="findItemsByKeywords";
	parmArg["SERVICE-VERSION"]="1.0.0";
	parmArg["GLOBAL-ID"]="EBAY-US";
	parmArg["RESPONSE-DATA-FORMAT"]="JSON";
	parmArg["SECURITY-APPNAME"] = processArgs[0];

	parmArg["sortOrder"]="EndTimeSoonest";
	urlArgs["headers"] = {};
// 	Example parameters required for typical ebay call
//	 	parameters: {"OPERATION-NAME":"findItemsByKeywords", "SERVICE-VERSION":"1.0.0", "SECURITY-APPNAME":processArgs[0],
//	 	"GLOBAL-ID":"EBAY-US", "RESPONSE-DATA-FORMAT":"JSON", keywords:searchKeywords, "paginationInput.entriesPerPage":"10",
// 		"aspectFilter(0).aspectName":"Certification", "aspectFilter(0).aspectValueName":"NGC",
// 		"itemFilter(0).name":"ListingType", "itemFilter(0).value(0)":"Auction", "itemFilter(0).value(1)":"AuctionWithBIN",
//	 	"sortOrder":"EndTimeSoonest"
//	 	},
}

exports.doPull = function (coinType, urlArgs, yearsNeeded, maxPrice, callback) {
	var url = "http://svcs.ebay.com/services/search/FindingService/v1";
	var getRes = client.get(url, urlArgs,
        function(data, response){
					var theResponseData =JSON.parse(data);
					var matchedCoins = filterResults(coinType, theResponseData, yearsNeeded, maxPrice);
					callback(matchedCoins, coinType);
	}).on('error', function(err) {
		console.log("INVOCATION ERROR! %s", err);
	});
}
