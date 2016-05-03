var util = require('util');
var dateFormat = require('dateformat');
var XLSX = require('xlsx');


function Workbook() {
	if(!(this instanceof Workbook)) return new Workbook();
	this.SheetNames = [];
	this.Sheets = {};
}

function datenum(v, date1904) {
	if(date1904) v+=1462;
	var epoch = Date.parse(v);
	return (epoch - new Date(Date.UTC(1899, 11, 30))) / (24 * 60 * 60 * 1000);
}

function startsWith(str, prefix) {
	if (!Array.isArray(str)) return false;
	return str[0].slice(0, prefix.length) == prefix;
}

function sheet_from_array_of_arrays(data, opts) {
	var ws = {};
	var range = {s: {c:10000000, r:10000000}, e: {c:0, r:0 }};
	for(var R = 0; R != data.length; ++R) {
		for(var C = 0; C != data[R].length; ++C) {
			if(range.s.r > R) range.s.r = R;
			if(range.s.c > C) range.s.c = C;
			if(range.e.r < R) range.e.r = R;
			if(range.e.c < C) range.e.c = C;
			var cell = {v: data[R][C] };
			if(cell.v == null) continue;
			var cell_ref = XLSX.utils.encode_cell({c:C,r:R});

			if(typeof cell.v === 'number') cell.t = 'n';
			else if(typeof cell.v === 'boolean') cell.t = 'b';
			else if(cell.v instanceof Date) {
				cell.t = 'n'; cell.z = XLSX.SSF._table[14];
				cell.v = datenum(cell.v);
			} else if (startsWith(cell.v, 'http' )) {
				// Hack to try and set this to 'link' type but does not seem to work
				var cellStringValue = data[R][C][0];
				cell.l = { Target: cellStringValue, tooltip: 'test toolip'};
				cell.v = cellStringValue;
			} else {
				cell.t = 's';
			}

			ws[cell_ref] = cell;
		}
	}
	if(range.s.c < 10000000) ws['!ref'] = XLSX.utils.encode_range(range);
	return ws;
}

exports.writeCoinsToXlSX = function(resultData, binResults, fileName) {
  var wb = new Workbook();
  var ws_name = "Auctions";
	var ws_name2 = "BIN";
	var headers = ["Type", "Date", "Price", "Title", "ViewItemURL"];

  var auctionData = [ headers ];
  resultData.forEach(function(item) {
    var coinValues = [item.type, item.dateString, item.price, item.title, item.viewItemURL];
    auctionData.push(coinValues);
  });

	var ws = sheet_from_array_of_arrays(auctionData);
  wb.SheetNames.push(ws_name);
  wb.Sheets[ws_name] = ws;

	// add in second tab
	var binData = [ headers ];
  binResults.forEach(function(item) {
    var coinValues = [item.type, item.dateString, item.price, item.title, item.viewItemURL];
    binData.push(coinValues);
  });
	var ws2 = sheet_from_array_of_arrays(binData);
	wb.SheetNames.push(ws_name2);
  wb.Sheets[ws_name2] = ws2;

  XLSX.writeFile(wb, fileName);
}
