var dateOpts = {
	dateFormat: 'dd/mm/yy',
	/*dayNames: ['일','월','화','수','목','금','토'],
	dayNamesMin: ['일','월','화','수','목','금','토'],
	dayNamesShort: ['일','월','화','수','목','금','토'],
	monthNames: ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'],
	monthShort: ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'],*/
	showOtherMonths: true,
	defaultDate: 0
};

function windowOpen(windowURL, windowName, width, height) {
	var windowFeatures = 'height=' + height + ',width=' + width +
	',toolbar=0,scrollbars=0,status=0,resizable=1,location=0,menuBar=0';
	
	centeredY = window.screenY + (((window.outerHeight/2) - height/2));
	centeredX = window.screenX + (((window.outerWidth/2) - width/2));
	window.open(windowURL, windowName, windowFeatures+',left=' + centeredX +',top=' + 0).focus();
}

/**********************************************************/
/* jqgrid                                                 */
/**********************************************************/
function reloadGridAndRefreshStats() {
	$("#grid").trigger("reloadGrid");
	refreshStats();
}

function reloadGrid() {
	$("#grid").trigger("reloadGrid");
}

function reloadGridWithId(gridId) {
	$(gridId).trigger("reloadGrid");
}

function searchGrid(url) {
	$("#grid").setGridParam({url: url, page: 1, datatype: 'json'}).trigger("reloadGrid");
}

/**********************************************************/
/* ajax                                                   */
/**********************************************************/
/*
function afterGrid() {
	$(window).bind('resize', function() {
	    $("#grid").setGridWidth($(window).width()-6);
	    	
	}).trigger('resize');
	
	$("body").ajaxError(function(e, xhr, settings, exception) {
		alert("서버에 연결할 수 없거나 로그인 세션이 만료됐거나(Unauthorized) 서버에서 장애(Internal Server Error)가 발생했습니다. / Error Message: " + exception);
	});
}
*/

/**********************************************************/
/* EUI Framework                                          */
/**********************************************************/
$.grid = function(gridId, moduleName, width, height, options) {
	var settings = $.extend({
		url: '',
		datatype: 'local',
		height: 500,
		width: $(window).width()-10,
		pager: '#pager',
		viewrecords: true,
		rowNum:20,
		rowList:[20,50,100,200],
		shrinkToFit: false,
		sortname: 'id',
		sortorder: 'desc',
		toppager: true,
		jsonReader : { 
			repeatitems: false,
			id: 'id'
		},
		ondblClickRow: function(rowid, iRow, iCol, e) {
			windowOpen(moduleName + "/" + rowid + "/edit", moduleName + "edit", width, height);
		},
		offset: 50,
		resize: true,
		resizeHeight: true,
		wrap: '#jqGrid_wrapper'
	}, options||{});
	
	$(gridId).jqGrid(settings);
	
	if (settings.resize) {
		$(window).bind('resize', function() {
		    $(gridId).setGridWidth($(settings.wrap).width());
		    if (settings.resizeHeight) {
		    	$(gridId).setGridHeight($(window).height() - $(gridId).offset().top - settings.offset);
		    }
		}).trigger('resize');
	}
	
	$("body").ajaxError(function(e, xhr, settings, exception) {
		alert("서버에 연결할 수 없거나 로그인 세션이 만료됐거나(Unauthorized) 서버에서 장애(Internal Server Error)가 발생했습니다. / Error Message: " + exception);
	});
};

var _buildParams = function() {
	params = '';
	var delimeter = '?';
	$("#search input").add("#search select").each(function() {
		var value;
		if ($(this).prop('type') == 'checkbox') {
			value = $(this).prop("checked");
		}
		else {
			value = isNull($(this).val())? "" : $(this).val();
		}
		params += delimeter + this.id.replace(/^s_/,'') + "=" + value;
		delimeter = "&";
	});
	return params;
};

$.search_btn = function(moduleName) {
	$("#search-btn").click(function() {
		var params = _buildParams();
		var url = moduleName + "/grid" + params;
		
		$("#grid").setGridParam({url: url, page: 1, datatype: 'json'}).trigger("reloadGrid");
	});
	$("#search-btn").trigger("click");
};

$.add_btn = function(moduleName, width, height) {
	$("#add-btn").click(function() {
		windowOpen(moduleName + "/add", moduleName + "add", width, height);
	});
};

$.eui_main = function(moduleName, options) {
	var settings = $.extend({
		gridId: "#grid",
		add_btn: true,
		search_btn: true,
		grid: true,
		width: 700,	// default 
		height: 300	// default		
	}, options||{});

	if (settings.grid) $.grid(settings.gridId, moduleName, settings.width, settings.height, settings.grid_options);
	if (settings.search_btn) $.search_btn(moduleName);
	if (settings.add_btn) $.add_btn(moduleName, settings.width, settings.height);

};

$.edi_addform_buttons = function() {
	$("#save_btn").button().click(function() {
		$("#f1").submit();
	});
	
	$("#cancel_btn").button().click(function() {
		window.close();
	});
};

$.eui_editform_buttons = function() {
	$("#save-btn").button().click(function() {
		$("#f1").submit();
	});
	
	$("#cancel-btn").button().click(function() {
		window.close();
	});
	
	$("#delete-btn").button().click(function() {
		if (confirm("정말 삭제할까요?")) window.location = "delete";
	});
};

/************** code *********************/

$.refreshCodes = function(selector, data, value, all) {
	var select = $(selector);
	if(select.prop) {
	  var options = select.prop('options');
	}
	else {
	  var options = select.attr('options'); 
	}
	$('option', select).remove();

	if (all) options[options.length] = new Option("All", 0);
	$.each(data, function(idx, code) {
	    options[options.length] = new Option(code["value"], code["id"]);
	});
	
	if (value) {
		select.val(value);
	}
};

$.refreshSelect = function(selector, data, value, all, descName, idName) {
	var select = $(selector);
	if(select.prop) {
		var options = select.prop('options');
	}
	else {
		var options = select.attr('options'); 
	}
	$('option', select).remove();
	
	if (all) options[options.length] = new Option("All", 0);
	$.each(data, function(idx, code) {
		options[options.length] = new Option(code[descName], code[idName]);
	});
	
	if (value) {
		select.val(value);
	}
};

$.refreshSelectNull = function(selector, data, value, nullItem, descName, idName) {
	var select = $(selector);
	if(select.prop) {
		var options = select.prop('options');
	}
	else {
		var options = select.attr('options'); 
	}
	$('option', select).remove();
	
	if (nullItem) options[options.length] = new Option(nullItem, '');
	$.each(data, function(idx, code) {
		options[options.length] = new Option(code[descName], code[idName]);
	});
	
	if (value) {
		select.val(value);
	}
};


/************** utils *********************/
$.isNum = function(val) {
	if (val && !isNaN(Number(val))) return true;
	else return false; 
}

// ************ utils *************
function formatNum(num, dec) {
	return addCommas(addDecimalNumbers(num, dec));
}

function replaceAll(txt, replace, with_this) {
	  return txt.replace(new RegExp(replace, 'g'),with_this);
	}


function removeCommas(val) {
	return replaceAll(val, ",", "");
}


function addCommas(nStr)
{
	nStr += '';
	x = nStr.split('.');
	x1 = x[0];
	x2 = x.length > 1 ? '.' + x[1] : '';
	var rgx = /(\d+)(\d{3})/;
	while (rgx.test(x1)) {
		x1 = x1.replace(rgx, '$1' + ',' + '$2');
	}
	return x1 + x2;
}

function addDecimalNumbers(pnumber,decimals){
    if (isNaN(pnumber)) { return 0; }
    if (pnumber=='') { return 0; }
    var snum = new String(pnumber);
    var sec = snum.split('.');
    var whole = parseFloat(sec[0]);
    var result = '';
    if(sec.length > 1){
        var dec = new String(sec[1]);
        dec = String(parseFloat(sec[1])/Math.pow(10,(dec.length - decimals)));
        dec = String(whole + Math.round(parseFloat(dec))/Math.pow(10,decimals));
        var dot = dec.indexOf('.');
        if(dot == -1){
            dec += '.';
            dot = dec.indexOf('.');
        }
        while(dec.length <= dot + decimals) { dec += '0'; }
        result = dec;
    } else{
        var dot;
        var dec = new String(whole);
        dec += '.';
        dot = dec.indexOf('.');
        while(dec.length <= dot + decimals) { dec += '0'; }
        result = dec;
    }
    return result;
}

/********* stats **********/
var refreshStats = function() {
	$.getJSON("stats", null, function(data) {
		for(f in data) {
			var dec = (f == 'qty') ? 3 : 0;
			$("#" + f).text(formatNum(data[f], dec));
		}
	});
};

/********* select **********/
$.refreshSelect = function(selector, data, value, all, descName, idName) {
	var select = $(selector);
	if(select.prop) {
		var options = select.prop('options');
	}
	else {
		var options = select.attr('options'); 
	}
	$('option', select).remove();
	
	if (all) options[options.length] = new Option("All", 0);
	$.each(data, function(idx, code) {
		options[options.length] = new Option(code[descName], code[idName]);
	});
	
	if (value) {
		select.val(value);
	}
};

/*********** 상태변화 **********/
$.showErrorDialog = function(msg, title) {
	$("#error-dialog-message").text(msg);
	
	$("#error-dialog").dialog({
	    modal: true,
	    buttons: {
	      Ok: function() {
	        $( this ).dialog( "close" );
	      }
	    }
	});
};

/********** status process **************/
var process = function(msg, command) {
	if (confirm(msg)) {
		var params = {};
		params['command'] = command;
		$.post("process", params, function(data) {
			if (data.status > 0) {
				alert(data.error);
			} 
			else {
				alert("처리됐습니다.");
				location.reload();
			}
		}, "JSON");
	} 
};

var processWithPath= function(msg, path, result) {
	if (confirm(msg)) {
		$.post(path, null, function(data) {
			if (data.status > 0) {
				 alert(data.error);
			}
			else {
				result();
			}
		}, "JSON"); 
	} 
};

/************ ajax post result ***********/
$.onSuccess = function(data, success) {
	if (data.status > 0) {
		// alert(data.error);
		$.showErrorDialog(data.error);
		return;
	}
	else {
		success();
	}
};

/*********** jqgrid용 **********/
var getColumnIndexByName = function(grid, columnName) {
    var cm = grid.jqGrid('getGridParam','colModel'),i=0,l=cm.length;
    for (; i<l; i++) {
        if (cm[i].name===columnName) {
            return i; // return the index
        }
    }
    return -1;
};

/*********** 상태변화 **********/
$.changeStatus = function(msg, status, followUp) {
	if (confirm(msg)) {
		var param = {};
		param['status'] = status;
		$.post("changestatus", param, function(data) {
			$.onSuccess(data, function() {
				alert("처리됐습니다");
				document.location.reload();
			});
		}, "JSON");
	}
};

/********** jqgrid format / cell editing ***********/
$.cellStyle = function(gridId, rowId, column, style) {
	var grid = $(gridId);
	var val = grid.getCell(rowId, column);
	grid.setCell(rowId, column, val, style);
};

var CELL_STYLE_LOSS = {background: '#d02f2f', color: 'white'};
var CELL_STYLE_EDITABLE = {background: 'orange', color: 'white'};

var CELL_FMT_COMMA0 = {thousandsSeparator: ",", decimalPlaces: 0, defaultValue: ''};
var CELL_FMT_COMMA1 = {thousandsSeparator: ",", decimalPlaces: 1, defaultValue: ''};
var CELL_FMT_COMMA2 = {thousandsSeparator: ",", decimalPlaces: 2, defaultValue: ''};
var CELL_FMT_COMMA3 = {thousandsSeparator: ",", decimalPlaces: 3, defaultValue: ''};

var CELL_FMT_DATE = {newformat : 'd-m-Y', srcformat: 'd-m-Y'};

var EDITRULES_100 = {required: true, number: true, minValue: 0, maxValue: 100};
var EDITRULES_500 = {required: true, number: true, minValue: 0, maxValue: 500};

/********** Form Related **************/
var WIDTH_2_COLUMNS = 780;
var WIDTH_3_COLUMNS = 1050;


