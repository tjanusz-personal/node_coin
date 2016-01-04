var Client = require('node-rest-client').Client;
var util = require('util');
var dateFormat = require('dateformat');
var S = require('string');
var Q = require("q");

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
			urlArguments.parameters[aspectNameString]=prop;
			var aspectValueString = util.format("aspectFilter(%s).aspectValueName", count);
			urlArguments.parameters[aspectValueString]=aspect[prop];
		}
	}
}

// make immediately invoked function to add item Filter to url arguments
exports.addItemFilters = function(urlArguments, itemFilterArray) {
	for (var count = 0; count < itemFilterArray.length; count++) {
		var itemFilter = itemFilterArray[count];
		var filterNameString = util.format("itemFilter(%s).name", count);
		for (var prop in itemFilter) {
			urlArguments.parameters[filterNameString]=prop;
			var propValues = itemFilter[prop];
			for (var valueCount = 0; valueCount < propValues.length; valueCount++) {
				var filterValueString = util.format("itemFilter(%s).value(%s)", count, valueCount);
				urlArguments.parameters[filterValueString]=propValues[valueCount];
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

function filterResults(coinType, jsonOuterResponse, yearsNeeded, maxPrice, skipWords) {
	var coinMatches = [];
	var coinResults = {results: coinMatches, coinType: coinType};

	if (responseHasError(jsonOuterResponse, coinType)) {
		return;
	}
	var jsonResponse = jsonOuterResponse.findItemsByKeywordsResponse[0];
	var searchResult = jsonResponse.searchResult;
	var items = searchResult[0].item;
	if (items == null) {
		return coinResults;
	}
	for (var icount = 0; icount < items.length; icount++) {
		var item = items[icount];
		var currentPrice = item.sellingStatus[0].currentPrice[0];
		var currentPriceValue = currentPrice["__value__"];
		// See if this result is something I need
		if (!needCoin(yearsNeeded, item.title, currentPriceValue, maxPrice)) {
			continue;
		}
		// filter out any wildcards I know I don't need on matches
		if (coinShouldBeFiltered(item.title, skipWords)) {
			continue;
		}

		var dateString = dateFormat(item.listingInfo[0].endTime, "mm/dd h:MM:ss TT");
		var coinMatch = { type: coinType, title: item.title, dateString: dateString, price: currentPriceValue, viewItemURL: item.viewItemURL};
		coinMatches.push(coinMatch);
	}
 	var paginationOutput = jsonResponse.paginationOutput[0];
	coinResults["paginationOutput"] = paginationOutput;
	coinResults["coinType"] = coinType;
	return coinResults;
}

function needCoin(yearsNeeded, title, currentPriceValue, maxPrice) {
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

exports._needCoin = function(yearsNeeded, title, currentPriceValue, maxPrice) {
	return needCoin(yearsNeeded, title, currentPriceValue, maxPrice);
}

exports.addFinderParams = function(urlArgs, searchKeywords, entriesPerPage, sortOrder) {
	sortOrder = sortOrder || "EndTimeSoonest";
	urlArgs["path"] = { };
	urlArgs["parameters"] = {"OPERATION-NAME":"findItemsByKeywords", "SERVICE-VERSION":"1.0.0", "GLOBAL-ID":"EBAY-US",
		"RESPONSE-DATA-FORMAT":"JSON", "SECURITY-APPNAME":processArgs[0], "sortOrder":sortOrder, "keywords": searchKeywords,
		"paginationInput.entriesPerPage": entriesPerPage};
	urlArgs["headers"] = {};
// 	Example parameters required for typical ebay call
//	 	parameters: {"OPERATION-NAME":"findItemsByKeywords", "SERVICE-VERSION":"1.0.0", "SECURITY-APPNAME":processArgs[0],
//	 	"GLOBAL-ID":"EBAY-US", "RESPONSE-DATA-FORMAT":"JSON", keywords:searchKeywords, "paginationInput.entriesPerPage":"10",
// 		"aspectFilter(0).aspectName":"Certification", "aspectFilter(0).aspectValueName":"NGC",
// 		"itemFilter(0).name":"ListingType", "itemFilter(0).value(0)":"Auction", "itemFilter(0).value(1)":"AuctionWithBIN",
//	 	"sortOrder":"EndTimeSoonest"
//	 	},
}

exports._coinShouldBeFiltered = function(coinResult, skipWords) {
	return coinShouldBeFiltered(coinResult, skipWords);
}

function coinShouldBeFiltered(coinResult, skipWords) {
	if (skipWords == null) return false;
	for(var count = 0; count < skipWords.length; count++) {
			var itemToRemove = skipWords[count];
			var boolVal = S(coinResult.toString()).contains(itemToRemove.toString());
			if (boolVal) {
				return true;
			}
	}
	return false;
}

exports.filterResultsByItems = function(results, skipWords) {
	var filteredResults = [];

	for(var count = 0; count < results.length; count++) {
		var coinResult = results[count];
		var title = coinResult.title;
		if (coinShouldBeFiltered(title, skipWords)) {
			continue;
		}
		filteredResults.push(coinResult);
	}
	return filteredResults;
}

exports.buildEbayRequestObject = function(urlArgs, searchKeywords, pageSize, aspectNames, itemFilters, sortOrder) {
	this.addFinderParams(urlArgs, searchKeywords, pageSize, sortOrder);
	this.addCustomAspects(urlArgs, aspectNames);
	this.addItemFilters(urlArgs, itemFilters);
}

exports.collatePromisedResults = function(coinResults) {
	// super hacky way to flatten out any sub arrays for the BIN results since they're multiple page result sets
	var mergedArrays = [].concat.apply([], coinResults);
  var allData = [];
	var binData = [];
	var allResults = { auction: allData, bin: binData};

	for (var count = 0; count < mergedArrays.length; count++) {
		collateCoinResult(mergedArrays[count], allData, binData);
	}
	return allResults;
}

function collateCoinResult(coinResults, coinData, binData) {
	var results = coinResults["results"];
	var coinType = coinResults["coinType"];
	var paginationOutput = coinResults["paginationOutput"]
	console.log("COIN TYPE: %s Matches: %s, Pages: %s", coinType, results.length, paginationOutput.totalEntries);
	results.forEach(function(coinResult) {
		if (coinType.indexOf("BIN") > 0) {
			binData.push(coinResult);
		} else {
			coinData.push(coinResult);
		}
  });
}

exports._collateCoinResult = function(coinResults, coinData, binData) {
		return collateCoinResult(coinResults, coinData, binData);
}

exports.doPull = function (coinType, urlArgs, yearsNeeded, maxPrice, skipWords) {
	var deferred = Q.defer();
	var url = "http://svcs.ebay.com/services/search/FindingService/v1";
	client.get(url, urlArgs,
		function(data, response){
					var theResponseData =JSON.parse(data);
					var matchedCoins = filterResults(coinType, theResponseData, yearsNeeded, maxPrice, skipWords);
					deferred.resolve(matchedCoins);
				}).on('error', function(err) {
					deferred.reject(err);
				});
	return deferred.promise;
}
