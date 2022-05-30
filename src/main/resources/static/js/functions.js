const BASE_URL = '/download/IMAGE/';

let addFormButtons = () => {
    $("#save-btn").click(function () {
        $("#f1").submit();
    });
    $("#cancel-btn").click(function () {
        window.close();
    });
}

let editFormButtons = () => {
    $("#save-btn").click(function () {
        $("#f1").submit();
    });
    $("#cancel-btn").click(function () {
        window.close();
    });
    $("#delete-btn").click(function () {
        if (confirm("정말 삭제할까요?")) window.location = "delete";
    });
}

let excelButton = (url) => {
    $("#excel-btn").click(function () {
        let params = _buildParams();
        document.location.href = url + params;
    });
}


function makeDatepicker(className) {
    $('.' + className).each(function () {
        $(this).datepicker({
            zIndexOffset: 1000,
            format: "yyyy-mm-dd",
            autoclose: true,
            clearBtn: true,
            enableOnReadonly: true,
            language: "ko"
        });
    });
}

function makeYearMonthDatepicker(className) {
    return $('.' + className).datepicker({
        format: "yyyy-mm",
        autoclose: true,
        enableOnReadonly: true,
        language: "ko",
        startView: "months",
        minViewMode: "months"
    });
}

function isNull(v) {
    return v === undefined || v === null || v === "";
}

/**
 * model attribute -> json parse
 * @param object
 * @returns {{}|any}
 */
function toParse(object) {
    // console.log("toParse orig object::{}", object);
    if (isNull(object)) return "";
    let result = JSON.parse(object.replace(/\n/gi, "\\n").replace(/\r/gi, "\\r").replace(/&quot;/g, '\"'));
    console.log("toParse object::{}", result);
    return result;
}

/**
 * 첫글자 대문자화
 * @param str
 * @returns {string}
 */
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * jquery $.post를 이용한 ajax post
 * @param url
 * @param json
 */
function ajaxPost(url, json) {
    $.post(url, json, (res) => {
        console.log("res::{}", res);
        if (res.status !== 0) {
            alert(res.error);
        }
        if (res.status === 0) {
            location.reload();
            reloadGrid();
        }
    });
}


function addCommaFormatter(cellValue, opts, rowObject) {
    if (isNull(cellValue)) return "";
    // console.log("addCommaFormatter cellValue::{}", cellValue, typeof cellValue);
    let result = parseFloat(cellValue).toLocaleString('ko-KR');
    // console.log("addCommaFormatter::{}", result);
    return result;
}

function addFloat2DigitFormatter(cellValue, opts, rowObject) {
    const opt = {
        maximumFractionDigits: 2
    }
    if (isNull(cellValue)) return "";
    // console.log("addCommaFormatter cellValue::{}", cellValue, typeof cellValue);
    let result = parseFloat(cellValue).toLocaleString('ko-KR', opt);
    // console.log("addFloat2DigitFormatter::{}", result);
    return result;
}

function initSummernote(idName) {
    $('#' + idName).summernote({
        height: 250,
        lang: "ko-KR",
        disableDragAndDrop: true,
        toolbar: [
            // ['fontname', ['fontname']],
            ['style', ['bold', 'italic', 'underline', 'strikethrough', 'clear']],
            ['font', ['strikethrough', 'superscript', 'subscript']],
            ['fontsize', ['fontsize']],
            ['color', ['color']],
            // ['table', ['table']],
            ['para', ['ul', 'ol', 'paragraph']],
            ['height', ['height']],
            ['insert',['link']],
            // ['view', ['fullscreen', 'help']]
        ],
        // fontName: '맑은 고딕',
        // fontNames: ['맑은 고딕', '궁서', '굴림체', '굴림', '돋움체', '바탕체', 'Arial', 'Arial Black'],
        // fontSizes: ['8', '9', '10', '11', '12', '14', '16', '18', '20', '22', '24', '28', '30', '36', '50', '72']
    });
/*    $(document).on('dragover', 'drop', (e) => {
        e.stopPropagation();
        e.preventDefault();
        e.dataTransfer.effectAllowed = 'none';
        e.dataTransfer.dropEffect = 'none';
    }, false);*/
}

function setAttachment(inputId, val) {
    if (isNull(val)) return;
    let $target = $('#' + inputId).parent().find('.custom-file-label');
    console.log("target::{}", $target);
    $target.text(val.originalFilename);
}

function swal_confirm(title, text,  cancelBtnText, confirmBtnText, resultFunction) {
    swal({
            html: true,
            title: title,
            text: text,
            // type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#1c84c6",
            confirmButtonText: confirmBtnText,
            cancelButtonColor: "#1c84c6",
            cancelButtonText: cancelBtnText,
            closeOnEsc: true,
        },
        function (isConfirm) {
            console.log("isconfirm::{}", isConfirm);
            if (isConfirm) {
                resultFunction();
            } else {
            }
        });
}

function setImage(className, obj) {
    if(!isNull(obj) && !isNull(obj.hash)) $('.' + className).attr('src', BASE_URL + obj.hash);
}

function changeImage(inputIdName, imgClassName) {
    let $this = $('#' + inputIdName)[0];
    if ($this.files && $this.files[0]) {
        let reader = new FileReader;
        reader.onload = function (data) {
            $("." + imgClassName).attr("src", data.target.result);
        }
        reader.readAsDataURL($this.files[0]);
    }
}

function tooltip() {
    $('[data-toggle="tooltip"]').tooltip();
}
