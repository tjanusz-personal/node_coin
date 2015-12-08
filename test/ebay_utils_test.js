var assert = require('assert');
var ebayUtils = require('../ebay_utils.js');
var chai = require('chai');
var expect = chai.expect;
var sinon = require("sinon");
var events = require("events");

describe('EbayUtils', function() {

	describe('needItem()', function() {
		it("returns 'true' when single year is in title", function() {
			expect(ebayUtils._needItem(["1909"], "lincoln 1909 cent")).to.be.true;
		});

		it("returns 'true' when year is found in title", function() {
			expect(ebayUtils._needItem(["1909", "1910", "1948"], "lincoln 1909 cent")).to.be.true;
		});

		it("returns 'false' when year is NOT found in title", function() {
			expect(ebayUtils._needItem(["1909", "1910", "1948"], "lincoln 2001 cent")).to.be.false;
		});

		it("returns 'true' when years is null", function() {
			expect(ebayUtils._needItem(null, "lincoln 2001 cent")).to.be.true;
		});

		it("returns 'false' when years is empty", function() {
			expect(ebayUtils._needItem([], "lincoln 2001 cent")).to.be.false;
		});

	});

	describe('addFinderParams()', function() {
		var urlArgs = {}, params;

		beforeEach(function() {
		   urlArgs = {};
			 ebayUtils.addFinderParams(urlArgs);
			 params = urlArgs["parameters"];
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

		it("defaults the 'parameters' property to JSON RESPONSE-DATA-FORMAT", function() {
				expect(params).to.include( {"RESPONSE-DATA-FORMAT": "JSON"});
		});

		it("defaults the 'parameters' property to 'sortOrder' ending soonest", function() {
				expect(params).to.include( {"sortOrder": "EndTimeSoonest"});
		});

	});

	describe('addItemFilters()', function() {
		var urlArgs = { };

		beforeEach(function() {
		   urlArgs = { "parameters": {} };
  		});

		it("modifies 'paramters' property to include single filter name value", function() {
			var itemFilters = [{ "ListingType": ["Auction"] }];
			ebayUtils.addItemFilters(urlArgs, itemFilters);
			var expectedObject = { 'itemFilter(0).name':'ListingType', 'itemFilter(0).value(0)':'Auction'};
			expect(urlArgs['parameters']).to.eql(expectedObject);
		});

		it("modifies 'paramters' property to include multiple filter name values", function() {
			var itemFilters = [{ "ListingType": ["Auction", "AuctionWithBIN"] }]; // ,
			ebayUtils.addItemFilters(urlArgs, itemFilters);
			var expectedObject = { 'itemFilter(0).name':'ListingType', 'itemFilter(0).value(0)':'Auction', 'itemFilter(0).value(1)':'AuctionWithBIN'};
			expect(urlArgs['parameters']).to.eql(expectedObject);
		});

	});

	describe('addCustomAspects()', function() {
		var urlArgs = { };

		beforeEach(function() {
		   urlArgs = { "parameters": {} };
  		});

		it("modifies 'paramters' property to include single aspect name value", function() {
			var aspectNames = [{ "Certification":"NGC"}];
			ebayUtils.addCustomAspects(urlArgs, aspectNames);
			var expectedObject = { 'aspectFilter(0).aspectName':'Certification', 'aspectFilter(0).aspectValueName':'NGC'};
			expect(urlArgs['parameters']).to.eql(expectedObject);
		});

		it("modifies 'parameters' property to include mutliple aspect name value", function() {
			var aspectNames = [{ "Certification":"NGC"}, {"Certification":"PCGS"} ];
			ebayUtils.addCustomAspects(urlArgs, aspectNames);
			var expectedObject = { 'aspectFilter(0).aspectName':'Certification', 'aspectFilter(0).aspectValueName':'NGC',
				'aspectFilter(1).aspectName':'Certification', 'aspectFilter(1).aspectValueName':'PCGS'
			};
			expect(urlArgs['parameters']).to.eql(expectedObject);
		});

		it("does not modify 'parameters' property when passed no arguments", function() {
			ebayUtils.addCustomAspects(urlArgs, []);
			expect(urlArgs['parameters']).to.be.empty;
		});

		it("throws 'TypeError' if missing 'parameters' property on object", function() {
			var aspectNames = [{ "Certification":"NGC"}];
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

			var jsonOuterResponse = { "errorMessage":[{"error":"this is an error"}]};
			expect(ebayUtils._responseHasError(jsonOuterResponse, "Mercury")).to.be.true;
			mock.verify();
		});

		it("should return false and NOT log message when error NOT present in response", function() {
			var mock = sinon.mock(console);
			mock.expects('log').never();

			var jsonOuterResponse = { "findItemsByKeywordsResponse":[{}]};
			expect(ebayUtils._responseHasError(jsonOuterResponse, "Mercury")).to.be.false;
			mock.verify();
		});

	});

	describe('doPull()', function() {
		it("should handle error from get request", function() {
			var clientGetMock = sinon.stub(ebayUtils.rest_client, 'get', restErrorMock({data: 'FooBar'}));
			ebayUtils.doPull("Mercury", {}, ["2015"]);
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

});
