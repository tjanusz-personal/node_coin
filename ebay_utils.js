var Client = require('node-rest-client').Client;
var util = require('util');
var dateFormat = require('dateformat');
var S = require('string');

var processArgs = process.argv.slice(2);
if (processArgs == null) {
	processArgs = "";
}

client = new Client();

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

function printResponse(coinType, jsonOuterResponse, yearsNeeded) {
	if (jsonOuterResponse.errorMessage != null) {
		var errorInfo = jsonOuterResponse.errorMessage[0].error[0];
		console.log("CALL FAILED for %s! %s, message: %s", coinType, errorInfo.errorId, errorInfo.message);
		return;
	}
	var jsonResponse = jsonOuterResponse.findItemsByKeywordsResponse[0];
	var searchResult = jsonResponse.searchResult;
	var items = searchResult[0].item;
	console.log("COIN TYPE: %s ACK: %s, Items Length: %s", coinType, jsonResponse.ack, items.length);
	for (var icount = 0; icount < items.length; icount++) {
		var item = items[icount];
		if (!needItem(yearsNeeded, item.title)) {
			continue;
		}
		var dateString = dateFormat(item.listingInfo[0].endTime, "mmmm dS, yyyy, h:MM:ss TT");
		var currentPrice = item.sellingStatus[0].currentPrice[0];
		console.log("%s -- (%s) %s -- %s", dateString, currentPrice["@currencyId"], currentPrice["__value__"], item.title);
	}
}

function needItem(yearsNeeded, title) {
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

exports.doPull = function (coinType, urlArgs, yearsNeeded) {
	var url =  "http://svcs.ebay.com/services/search/FindingService/v1";
	var getRes = client.get(url, urlArgs,
        function(data, response){
			printResponse(coinType, JSON.parse(data), yearsNeeded);
	}).on('error', function(err) {
		console.log("INVOCATION ERROR! %s", err);
	});
}
