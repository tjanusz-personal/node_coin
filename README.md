Node Coin
==================

The node_coin project is a home project I built in Node.JS to help me find coins for my coin collection. It's my attempt to be super cool and use what all the cool kids are coding in now!

This program performs Ebay searches using the Ebay REST Finding API to query active coin auctions and BIN to query and filter out the coins I already have. The results are collated nto a single spreadsheet in the current directory. 

Using this XLSX I can quickly glance to see if anything seems viable. This saves me hours combing through the various queries since I really only need a small subset of year/mint for each coin type (mercury dimes, indian cents, jefferson nickels, liberty nickels, kennedy half dollars).


Some Notes:

* **Q** - I'm using the Q library to help avoid the callback hell that I typically create using evented languages like this (insert ruby eventmachine nightmares here). I like Q so far it seems to make it easier to "queue" things up and run them.

* **node-inspector** - I integrated the node inspector for debugging since I easily ended up in callback messes all over the place when I first wrote this. This worked great for me to be honest. 

* **I use this project on both my Windows and Linux laptops** so it works cross platform. The only wonkyness is the XLSX files on Ubuntu don't always create link cells correctly.

## Getting Started

There is a single launching script with a bunch of supporting classes.

### Dependencies

* **node** - any modern version is fine
* **npm** - node package manager
* **Ebay API Key** - (https://go.developer.ebay.com/) 
* **xlsx** - Module for writing out XLSX documents
* **node-inspector** - node inspector. So we need WebKit browser installed (Chrome, or Safari - I only used chrome on Windows)
* **node-rest-client** - Module for simpler REST to Finding API
* **q** - Module for simpler promise like queuing of calls
* **mocha/sinon** - for unit testing (Jasmine like)

### Configuring the Project

* **npm** - `npm install` to get all module dependencies
* **Ebay API Key** - requires signup with Ebay Developer program but you gets tons of free API credits and I've never used them up since I only run this once a day or so.

### Running the Project

* `node node_coin.js MyEbayAPIKey`
* `./node_modules/node-inspector/bin/node-debug.js node_coin.js MyEbayAPIKey`


## Testing

- Mocha tests use both mocha and sinon
	- `./node_modules/mocha/bin/mocha`

## TODO

* Remove the hard coded coin list I have in each type and replace to read from google doc
* Test debugging on Ubuntu laptop.

## Deployment

N/A

## Getting Help

### Documentation

* None
