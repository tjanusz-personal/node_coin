var assert = require('assert');
var ebayUtils = require('../ebay_utils.js');
var chai = require('chai');
var expect = chai.expect;
var sinon = require("sinon");
var events = require("events");
var dateFormat = require('dateformat');

// TO run these tests
// ./node_modules/mocha/bin/mocha

describe('EbayUtils', function() {

	describe('needCoin()', function() {
		var currentPriceValue, maxPrice;

		beforeEach(function() {
			currentPriceValue = 100
			maxPrice = 200;
  	});

		it("returns 'true' when single year is in title", function() {
			expect(ebayUtils._needCoin(["1909"], "lincoln 1909 cent", currentPriceValue, maxPrice)).to.be.true;
		});

		it("returns 'true' when year is found in title", function() {
			expect(ebayUtils._needCoin(["1909", "1910", "1948"], "lincoln 1909 cent", currentPriceValue, maxPrice)).to.be.true;
		});

		it("returns 'false' when year is NOT found in title", function() {
			expect(ebayUtils._needCoin(["1909", "1910", "1948"], "lincoln 2001 cent", currentPriceValue, maxPrice)).to.be.false;
		});

		it("returns 'true' when years is null", function() {
			expect(ebayUtils._needCoin(null, "lincoln 2001 cent", currentPriceValue, maxPrice)).to.be.true;
		});

		it("returns 'false' when years is empty", function() {
			expect(ebayUtils._needCoin([], "lincoln 2001 cent", currentPriceValue, maxPrice)).to.be.false;
		});

		it("returns 'false' when current price is greater than max price", function() {
			expect(ebayUtils._needCoin(null, "lincoln 2001 cent", 300, 200)).to.be.false;
		});

	});

	describe('addFinderParams()', function() {
		var urlArgs = {}, params;

		beforeEach(function() {
		   urlArgs = {};
			 ebayUtils.addFinderParams(urlArgs, "searchKeywords", 100);
			 params = urlArgs.parameters;
  		});

		it("defaults the object properties to include required ebay defaults", function() {
				expect(urlArgs).to.include.keys("parameters", "path", "headers");
				expect(params).to.include.keys("OPERATION-NAME", "SERVICE-VERSION", "GLOBAL-ID", "RESPONSE-DATA-FORMAT", "SECURITY-APPNAME", "sortOrder");
		});

		it("defaults the 'parameters' property to ebay finder API defaults", function() {
				expect(params).to.include( { "OPERATION-NAME": "findItemsByKeywords"});
				expect(params).to.include( {"SERVICE-VERSION": "1.0.0"});
				expect(params).to.include( {"GLOBAL-ID": "EBAY-US"});
		});

		it("defaults the 'parameters' RESPONSE-DATA-FORMAT property to JSON", function() {
				expect(params).to.include( {"RESPONSE-DATA-FORMAT": "JSON"});
		});

		it("defaults the 'parameters' sortOrder property to 'EndTimeSoonest'", function() {
				expect(params).to.include( {sortOrder: "EndTimeSoonest"});
		});

		it("sets the 'parameters' keywords property correctly", function() {
			expect(params).to.include( {keywords:"searchKeywords"});
		});

		it("sets the 'parameters' paginationInput.entriesPerPage correctly", function() {
			expect(params).to.include( {"paginationInput.entriesPerPage":100});
		});

		it("defaults the 'parameters' sortOrder property to 'EndTimeSoonest'", function() {
			expect(params).to.include( {sortOrder:"EndTimeSoonest"});
		});

		it("sets the 'parameters' sortOrder property correctly if passed to function", function() {
			urlArgs = {};
			ebayUtils.addFinderParams(urlArgs, "searchKeywords", 100, "PricePlusShippingLowest");
			expect(urlArgs.parameters).to.include( {sortOrder:"PricePlusShippingLowest"});
		});
	});

	describe('addItemFilters()', function() {
		var urlArgs = { };

		beforeEach(function() {
		   urlArgs = { parameters: {} };
  		});

		it("modifies 'paramters' property to include single filter name value", function() {
			var itemFilters = [{ ListingType: ["Auction"] }];
			ebayUtils.addItemFilters(urlArgs, itemFilters);
			var expectedObject = { 'itemFilter(0).name':'ListingType', 'itemFilter(0).value(0)':'Auction'};
			expect(urlArgs.parameters).to.eql(expectedObject);
		});

		it("modifies 'paramters' property to include multiple filter name values", function() {
			var itemFilters = [{ ListingType: ["Auction", "AuctionWithBIN"] }]; // ,
			ebayUtils.addItemFilters(urlArgs, itemFilters);
			var expectedObject = { 'itemFilter(0).name':'ListingType', 'itemFilter(0).value(0)':'Auction', 'itemFilter(0).value(1)':'AuctionWithBIN'};
			expect(urlArgs.parameters).to.eql(expectedObject);
		});

	});

	describe('addCustomAspects()', function() {
		var urlArgs = { };

		beforeEach(function() {
		   urlArgs = { parameters: {} };
  		});

		it("modifies 'paramters' property to include single aspect name value", function() {
			var aspectNames = [{ Certification:"NGC"}];
			ebayUtils.addCustomAspects(urlArgs, aspectNames);
			var expectedObject = { 'aspectFilter(0).aspectName':'Certification', 'aspectFilter(0).aspectValueName':'NGC'};
			expect(urlArgs.parameters).to.eql(expectedObject);
		});

		it("modifies 'parameters' property to include mutliple aspect name value", function() {
			var aspectNames = [{ Certification:"NGC"}, {Certification:"PCGS"} ];
			ebayUtils.addCustomAspects(urlArgs, aspectNames);
			var expectedObject = { 'aspectFilter(0).aspectName':'Certification', 'aspectFilter(0).aspectValueName':'NGC',
				'aspectFilter(1).aspectName':'Certification', 'aspectFilter(1).aspectValueName':'PCGS'
			};
			expect(urlArgs.parameters).to.eql(expectedObject);
		});

		it("does not modify 'parameters' property when passed no arguments", function() {
			ebayUtils.addCustomAspects(urlArgs, []);
			expect(urlArgs.parameters).to.be.empty;
		});

		it("throws 'TypeError' if missing 'parameters' property on object", function() {
			var aspectNames = [{ Certification:"NGC"}];
			chai.expect(function() {ebayUtils.addCustomAspects({}, aspectNames)}).to.throw(TypeError);
		});

		it("throws 'TypeError' if missing aspectNames argument", function() {
			chai.expect(function() {ebayUtils.addCustomAspects(urlArgs, null)}).to.throw(TypeError);
		});

	});

	describe('responseHasError()', function() {

		it("should return true and log message when error present in response", function() {
			var mock = sinon.mock(console);
			mock.expects('log').once();

			var jsonOuterResponse = { errorMessage:[{error:"this is an error"}]};
			expect(ebayUtils._responseHasError(jsonOuterResponse, "Mercury")).to.be.true;
			mock.verify();
		});

		it("should return false and NOT log message when error NOT present in response", function() {
			var mock = sinon.mock(console);
			mock.expects('log').never();

			var jsonOuterResponse = { findItemsByKeywordsResponse:[{}]};
			expect(ebayUtils._responseHasError(jsonOuterResponse, "Mercury")).to.be.false;
			mock.verify();
		});

	});

	describe('doPull()', function() {
		it("should handle error from get request", function() {
			var clientGetMock = sinon.stub(ebayUtils.rest_client, 'get', restErrorMock({data: 'FooBar'}));
			ebayUtils.doPull("Mercury", {}, ["2015"], 200, ["1953-D"]);
			clientGetMock.restore();
		});
	});

	// Took this example from rest client issues site
	var restErrorMock = function(data) {
	    return function(url, opts, cb) {
	        var eventEmitter = new events.EventEmitter();
	        process.nextTick(function() {eventEmitter.emit('error', data)});
	        return eventEmitter;
	    };
	}

	// Took this example from rest client issues site
	var restResponseMock = function(data, statusCode) {
	    return function(url, opts, cb) {
	        cb(data, {statusCode: statusCode || 200});
	        return {
	           on: function() {
	           }
	        };
	    }
	}

	describe('filterResults()', function() {
		var currentTime = dateFormat("12/09/2015");
		var dateString = dateFormat(currentTime, "mm/dd h:MM:ss TT");
		var searchResult, responseResult, jsonResponse;
		var itemUrl = "http://testUrl";
		var skipWords = ["1953-D"];

		beforeEach(function() {
			var sellingStatus = {currentPrice:[{"__value__":50}]};
			var listingInfo = { endTime:currentTime};
			searchResult = [{title:"coin 1", viewItemURL:itemUrl, sellingStatus: [sellingStatus], listingInfo:[listingInfo] }];
			paginationOutput = {pageNumber: 1, totalPages: 2, totalEntries: 100};
			responseResult = {ack:"Success", searchResult:[ {item:searchResult}], paginationOutput:[paginationOutput]};
			jsonResponse = { findItemsByKeywordsResponse:[responseResult]};
		});

		it("returns empty array when no results are returned", function() {
			searchResult = [];
			responseResult = {ack:"Success", searchResult:[ searchResult ]};
			jsonResponse.findItemsByKeywordsResponse = [responseResult];
			var actualResults = ebayUtils._filterResults("Mercury", jsonResponse, null, 200, skipWords);
			expect(actualResults.results).to.be.empty;
		});

		it("returns array with one single matching coin item", function() {
			var actualResults = ebayUtils._filterResults("Mercury", jsonResponse, null, 200, skipWords);
			var expectedResult = { title:"coin 1", dateString:dateString, price:50, type: "Mercury", viewItemURL:itemUrl};
			expect(actualResults.results).to.not.be.empty;
			expect(actualResults.results[0]).to.eql(expectedResult);
		});

		it("skips adding coin item if not matched correctly", function() {
			jsonResponse.findItemsByKeywordsResponse[0].searchResult[0].item[0].sellingStatus[0].currentPrice[0]["__value__"] = 300;
			var actualResults = ebayUtils._filterResults("Mercury", jsonResponse, null, 200, skipWords);
			expect(actualResults.results).to.be.empty;
		});

	});

	describe("coinShouldBeFiltered()", function() {
		it("returns 'true' if coin title contains item in filter array", function() {
			expect(ebayUtils._coinShouldBeFiltered("1953 D nickel in good condition", ["1953 D", "1953-D"])).to.be.true;
		});

		it("returns 'false' if coin title does NOT contains item in filter array", function() {
			expect(ebayUtils._coinShouldBeFiltered("1958 D nickel in good condition", ["1953 D", "1953-D"])).to.be.false;
		});

		it("returns 'false' if coin title is blank", function() {
			expect(ebayUtils._coinShouldBeFiltered("", ["1953 D"])).to.be.false;
		});

		it("returns 'false' if filter array empty", function() {
			expect(ebayUtils._coinShouldBeFiltered("1958 nickel in good condition", [])).to.be.false;
		});

		it("returns 'false' if filter array undefined", function() {
			expect(ebayUtils._coinShouldBeFiltered("1958 nickel in good condition")).to.be.false;
		});
	});

	describe("filterResultsByItems()", function() {
		it("returns results array with all coins having dates in matching array removed", function() {
			var results = [ {title:"1953 D nickel"}, {title:"1958 nickel"}, {title:"1960 nickel"}];
			var actualResults = ebayUtils.filterResultsByItems(results, ["1953 D", "1960"]);
			expect(actualResults).to.eql([{title:"1958 nickel"}]);
		});

		it("returns empty array if all coins have dates matching array", function() {
			var results = [ {title:"1953 D nickel"}, {title:"1960 nickel"}];
			var actualResults = ebayUtils.filterResultsByItems(results, ["1953 D", "1960"]);
			expect(actualResults).to.be.empty;
		});

	});

});
