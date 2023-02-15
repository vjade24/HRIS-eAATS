//**********************************************************************************
// PROJECT NAME     :   HRIS - eComval
// VERSION/RELEASE  :   HRIS Release #1
// PURPOSE          :   Code Behind for Payroll Employee Tax Generation
//**********************************************************************************
// REVISION HISTORY
//**********************************************************************************
// AUTHOR                    DATE            PURPOSE
//----------------------------------------------------------------------------------
// JORGE RUSTOM VILLANUEVA       10/18/2019      Code Creation
//**********************************************************************************
ng_HRD_App.controller("cExtractToExcel_ctrlr", function ($scope, $compile, $http, $filter, $q) {

    var s = $scope;
    var h = $http;
    s.year = [];
    s.ddl_report_type = "HISTORY";
    s.show_emptype = true;
    s.showdept     = true;
    var date_cvrd = new Date();
    s.txtb_leave_date_from  = date_cvrd.getFullYear() + "-01-01";
    s.txtb_leave_date_to    = date_cvrd.getFullYear() + "-12-31";
    s.empl_names = [];
    s.add_edit = "";
    s.ddl_option_type = "01"

    var user_id_session = $('#user_id_session').text()

    //Initialize Request to backend to get the data for employment type and remittance type
    function init()
    {
        $("#modal_generating_tax").modal({ keyboard: false, backdrop: "static" });
        var curr_year = new Date().getFullYear().toString();
        s.ddl_year = curr_year;
        s.currentMonth = new Date().getMonth() + 1
        s.ddl_month = datestring(s.currentMonth.toString())

        RetrieveYear();
        h.post("../cExtractToExcel/InitializeData").then(function (d) {
            s.dep_lst = d.data.dep_lst;
            s.ddl_department = "01";
            s.empl_names = d.data.empl_names

            if (d.data.data.length > 0) {
                init_table_data(d.data.data);
            }
            else {
                init_table_data([]);
            }


            $('#datalist_grid tbody').on('click', 'span.details-control', function () {
                var tr = $(this).closest('tr');
                var row = $('#datalist_grid').DataTable().row(tr);

                if (row.child.isShown()) {
                    // This row is already open - close it
                    row.child.hide();
                    tr.removeClass('shown');
                }
                else {
                    // Open this row
                    row.child(format(row.data())).show();
                    tr.addClass('shown');

                }

            });

            $("#modal_generating_tax").modal("hide");
        });
    }
    init();
    
    var init_table_data = function (par_data) {
        s.datalistgrid = par_data;
        s.oTable = $('#datalist_grid').dataTable(
            {
                data: s.datalistgrid,
                sDom: 'rt<"bottom"ip>',
                pageLength: 10,
                columns: [
                    {
                        "mData": null,
                        "mRender": function (data, type, full, row) {
                            return "<center><span class='details-control' style='display:block;' ></center>"
                        }
                    },

                    {
                        "mData": "empl_id",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-center btn-block'>" + data + "</span>"
                        }
                    },
                    {
                        "mData": "employee_name",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-left btn-block'>" + data + "</span>"
                        }
                    },
                    {
                        "mData": "option_type_descr",
                        "mRender": function (data, type, full, row) {
                            var type_color = "";
                            if (full["option_type"] == "01") {
                                type_color = "success"
                            }
                            if (full["option_type"] == "02") {
                                type_color = "danger"
                            }
                            return "<span class='badge badge-" + type_color + " btn-block' >" + data + "</span>"
                        }
                    },
                    {
                        "mData": null,
                        "bSortable": false,
                        "mRender": function (data, type, full, row) {

                            return '<center><div class="btn-group">' +
                                '<button type="button" class="btn btn-info btn-xs" ng-click="btn_edit_action(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Edit">  <i class="fa fa-edit"></i></button >' +
                                '<button type="button" class="btn btn-danger btn-xs" ng-click="btn_del_row(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Delete"><i class="fa fa-trash"></i></button>' +
                                '</div></center>';
                        }
                    }
                ],
                "createdRow": function (row, data, index) {
                    $compile(row)($scope);  //add this to compile the DOM
                },
            });
    }

    $.fn.modal.Constructor.prototype.enforceFocus = function () {

    }
    function RetrieveYear() {
        var currentYear = new Date().getFullYear();
        var prev_year = currentYear - 5;
        for (var i = 1; i <= 8; i++) {
            var data = { "year": prev_year }
            s.year.push(data)
            prev_year++;
        }
    }
    //**************************************************************//
    //***Occure when btn_generate_remittance is click by the user***//
    //**************************************************************// 
    s.btn_extract = function ()
    {
        if (ValidateFields())
        {
            $("#modal_generating_tax").modal({ keyboard: false, backdrop: "static" });
            h.post("../cExtractToExcel/ExtractExcel",
            {
                par_extract_type     : s.ddl_report_type,
                p_leave_date_from    : $('#txtb_leave_date_from').val(),
                p_leave_date_to      : $('#txtb_leave_date_to').val(),
                p_department_code    : s.ddl_department,
                p_empl_id            : "",
                p_lv_posting_status  : "",
                p_cancel_status      : "",
                par_extract_type_descr: $('#ddl_report_type option:selected').text(),
                par_employment_type : $('#ddl_employment_type').val() 

            }).then(function (d)
            { 
                if (d.data.message == "success")
                {
                    window.open(d.data.filePath, '', '');
                    $("#modal_generating_tax").modal("hide");
                }
                else if (d.data.message == "no-data-found")
                {
                    $("#modal_generating_tax").modal("hide");
                    swal("No Data Found!", "Generation Message", "warning");
                }
                else
                {
                    $("#modal_generating_tax").modal("hide");
                    swal(d.data.message, "Generation Message", "error");
                }
            })
        }

    }
    
    //***********************************************************//
    //***Field validation everytime generation button is click***//
    //***********************************************************// 
    function ValidateFields()
    {
        var return_val = true;
        ValidationResultColor("ALL", false);

        if ($('#txtb_leave_date_from').val() == "")
        {
            ValidationResultColor("txtb_leave_date_from", true);
            return_val = false;
        } else if (checkisdate($('#txtb_leave_date_from').val().trim()) == false) {

            ValidationResultColor("txtb_leave_date_from", true);
            $("#lbl_txtb_leave_date_from_req").text("Invalid Date Format");
            return_val = false;
        }

        if ($('#txtb_leave_date_to').val() == "")
        {
            ValidationResultColor("txtb_leave_date_to", true);
            return_val = false;
        } else if (checkisdate($('#txtb_leave_date_to').val().trim()) == false) {

            ValidationResultColor("txtb_leave_date_to", true);
            $("#lbl_txtb_leave_date_to_req").text("Invalid Date Format");
            return_val = false;
        }

        var e_date = new Date(moment($('#txtb_leave_date_to').val()).format('YYYY-MM-DD'));
        var s_date = new Date(moment($('#txtb_leave_date_from').val()).format('YYYY-MM-DD'));

        if (s_date > e_date)
        {
            $("#txtb_leave_date_from").removeClass("required");
            $("#lbl_txtb_leave_date_from_req").text("Period from is greater than Period to");
            $("#txtb_leave_date_to").removeClass("required");
            $("#lbl_txtb_leave_date_to_req").text("Period from is greater than Period to");
            return_val = false;
        }
        
        return return_val;
    }

    //***********************************************************//
    //***Field validation everytime generation button is click***//
    //***********************************************************// 
    function ValidationResultColor(par_object_id, par_v_result) {
        if (par_v_result) {
            //Add class to the obect that need to focus as a required..

            $("#" + par_object_id).addClass("required");
            $("#lbl_" + par_object_id + "_req").text("Required Field");
        }
        else
        {
            $("#txtb_leave_date_from").removeClass("required");
            $("#lbl_txtb_leave_date_from_req").text("");
            $("#txtb_leave_date_to").removeClass("required");
            $("#lbl_txtb_leave_date_to_req").text("");
        }
    }

    
    //***********************************************************//
    //*** VJA - 02/27/2020 - Reject or Check if Date
    //***********************************************************// 
    function checkisdate(d) {
        // Regex 1 - This will match yyyy-mm-dd and also yyyy-m-d:
        var regex1 = /^\d{4}\-(0?[1-9]|1[012])\-(0?[1-9]|[12][0-9]|3[01])$/;
        // Regex 2 - If you're looking for an exact match for yyyy-mm-dd then try this
        var regex2 = /^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/;
        // Regex 3 - or use this one if you need to find a date inside a string like The date is 2017-11-30
        var regex3 = /\d{4}\-(0?[1-9]|1[012])\-(0?[1-9]|[12][0-9]|3[01])*/;

        var istrue = false;
        if (regex1.test(d) == true ||
            regex2.test(d) == true ||
            regex3.test(d) == true) {
            istrue = true;
        } else {
            istrue = false;
        }
        return istrue;

    }

    s.RetrieveRepotType = function ()
    {
        s.showprint     = false;
        s.show_period   = false;
        s.show_emptype  = true;
        s.showdept      = true;
        
        if (s.ddl_report_type == "UND_TARD" ||
            s.ddl_report_type == "BEST" ||
            s.ddl_report_type == "LWOP")
        {
            s.showprint = true;
        }

        if (s.ddl_report_type == "UND_TARD" ||
            s.ddl_report_type == "LWOP")
        {
            s.show_period = true;
        }

        if (s.ddl_report_type == "LWOP")
        {
            s.show_emptype = false;
            s.showdept     = false;
        }

        // Buttton for Include/ Exclude Employees Best in Attendance
        s.show_inc_exc = false;
        if (s.ddl_report_type == "BEST")
        {
            s.show_inc_exc = true
        }

    }

    s.btn_print = function (report_type)
    {
        $("#modal_generating_tax").modal({ keyboard: false, backdrop: "static" })
        var controller = "Reports";
        var action = "Index";
        var ReportName = "";
        var SaveName = "Crystal_Report";
        var ReportType = "inline";
        var sp = "";
        var ReportPath = ""

        var p_year              = s.ddl_year.toString().trim()
        var p_month             = s.ddl_month.toString().trim()
        var p_department_code   = s.ddl_department.toString().trim();
        var p_employment_type = $('#ddl_employment_type').val().toString().trim() 
        var p_empl_id           = "";
        var p_prepared_empl_id = user_id_session;

        var p_period_from   = $('#txtb_leave_date_from').val();
        var p_period_to     = $('#txtb_leave_date_to').val();
        
        h.post("../cExtractToExcel/RetrieveReports",
            {
                ddl_option_type     : report_type
               ,p_period_from       : p_period_from
               ,p_period_to         : p_period_to
               ,p_department_code   : p_department_code
               ,p_employment_type   : p_employment_type
               ,p_empl_id			: p_empl_id

            }).then(function (d)
            {
                if (report_type == "UND_TARD")
                {
                    ReportPath = "~/Reports/cryUndTardAbs/";
                    ReportName = "cryUndTardAbs";
                    ReportPath = ReportPath + "" + ReportName + ".rpt";
                    sp = "sp_extract_und_abs_tardi,p_year," + p_year + ",p_month," + p_month + ",p_department_code," + p_department_code + ",p_employment_type," + p_employment_type + ",p_empl_id," + p_empl_id + ",p_prepared_empl_id," + p_prepared_empl_id;
                    s.employee_name_print = 'Report on Attendance, Absences, Undertime and Man-hour';
                }
                else if (report_type == "BEST")
                {
                    sp = "sp_extract_best_attendance,p_period_from," + p_period_from + ",p_period_to," + p_period_to + ",p_department_code," + p_department_code + ",p_employment_type," + p_employment_type + ",p_empl_id," + p_empl_id;

                    if (d.data.message == "no-quali")
                    {
                        sp = "sp_extract_best_attendance_no_quali,p_period_from," + p_period_from + ",p_period_to," + p_period_to + ",p_department_code," + p_department_code + ",p_employment_type," + p_employment_type + ",p_empl_id," + p_empl_id;
                    }
                    ReportPath = "~/Reports/cryBestAttendance/cryBestAttendance.rpt";
                    s.employee_name_print = 'Employees with NO UT, TARDY, CTO, VL+FL>5, SL AND LWOP';
                }
                else if (report_type == "LWOP")
                {
                    ReportPath = "~/Reports/cryLWOP_HR/";
                    ReportName = "cryLWOP_HR";
                    ReportPath = ReportPath + "" + ReportName + ".rpt";
                    sp = "sp_extract_lwop,p_year," + p_year + ",p_month," + p_month
                    s.employee_name_print = 'LEAVE WITHOUT PAY';
                }

                //console.log(sp);
        
                // *******************************************************
                // *** VJA : 2021-07-14 - Validation and Loading hide ****
                // *******************************************************
                
                var iframe = document.getElementById('iframe_print_preview');
                var iframe_page = $("#iframe_print_preview")[0];
                iframe.style.visibility = "hidden";

                s.embed_link = "../Reports/CrystalViewer.aspx?Params=" + ""
                    + "&ReportName=" + ReportName
                    + "&SaveName=" + SaveName
                    + "&ReportType=" + ReportType
                    + "&ReportPath=" + ReportPath
                    + "&id=" + sp //+ parameters

                //console.log(s.embed_link);
                if (!/*@cc_on!@*/0) { //if not IE
                    iframe.onload = function () {
                        iframe.style.visibility = "visible";
                        $("#modal_generating_tax").modal("hide")
                    };
                }
                else if (iframe_page.innerHTML()) {
                    // get and check the Title (and H tags if you want)
                    var ifTitle = iframe_page.contentDocument.title;
                    if (ifTitle.indexOf("404") >= 0) {
                        swal("You cannot Preview this Report", "There something wrong!", { icon: "warning" });
                        iframe.src = "";
                    }
                    else if (ifTitle != "") {
                        swal("You cannot Preview this Report", "There something wrong!", { icon: "warning" });
                        iframe.src = "";
                    }
                }
                else {
                    iframe.onreadystatechange = function () {
                        if (iframe.readyState == "complete") {
                            iframe.style.visibility = "visible";
                            $("#modal_generating_tax").modal("hide")
                        }
                    };
                }

                iframe.src = s.embed_link;
                $('#modal_print_preview').modal({ backdrop: 'static', keyboard: false });
                // *******************************************************
                // *******************************************************
        }) 
    }

    //***********************************************************//
    //*** VJA - 02/29/2020 - Convert date to String from 1 to 01 if less than 10
    //***********************************************************// 
    function datestring(d) {
        var date_val = ""
        if (d < 10) {
            date_val = '0' + d
        } else {
            date_val = d
        }
        return date_val
    }

    s.btn_inc_excl = function ()
    {
        $('#modal_include_exclude').modal({ backdrop: 'static', keyboard: false });
    }

    s.RetrieveIncludeExclude = function ()
    {
        h.post("../cExtractToExcel/RetrieveIncludeExclude", { ddl_option_type: s.ddl_option_type}).then(function (d)
        {
            if (d.data.message == "success")
            {
                s.datalistgrid = d.data.data;
                s.oTable.fnClearTable();
                
                if (d.data.data.length > 0) {
                    s.oTable.fnAddData(d.data.data);
                }
                

            }
            else
            {
                swal(d.data.message, "", {icon:"warning"})
            }

        })
    }
    s.btn_open_modal_add = function ()
    {
        s.show_empl = false;
        clearentry()
        s.add_edit = "ADD"
        $('#modal_include_exclude_add_edit').modal({ backdrop: 'static', keyboard: false });
    }
    s.btn_edit_action = function (row_id)
    {
        clearentry()
        s.show_empl = true;
        s.ddl_name              = s.datalistgrid[row_id].empl_id
        s.txtb_empl_id          = s.datalistgrid[row_id].empl_id        
        s.txtb_employee_name    = s.datalistgrid[row_id].employee_name  
        s.txtb_remarks_1        = s.datalistgrid[row_id].remarks_1      
        s.txtb_remarks_2        = s.datalistgrid[row_id].remarks_2     
        
        // $('#ddl_name').val(s.datalistgrid[row_id].empl_id)
        // $('#txtb_remarks_1').val(s.datalistgrid[row_id].remarks_1)
        // $('#txtb_remarks_2').val(s.datalistgrid[row_id].remarks_2)
        // $('#txtb_empl_id').val(s.datalistgrid[row_id].empl_id)
        // $('#txtb_employee_name').val(s.datalistgrid[row_id].employee_name)
        
        s.add_edit = "EDIT"
        $('#modal_include_exclude_add_edit').modal({ backdrop: 'static', keyboard: false });
    }

    s.btn_add_edit = function ()
    {
        var data = {
                    option_type : $('#ddl_option_type option:selected').val()
                  , empl_id     : $('#ddl_name option:selected').val()
                  , remarks_1   : $('#txtb_remarks_1').val()
                  , remarks_2   : $('#txtb_remarks_2').val()
                } 
        
        h.post("../cExtractToExcel/Save_Update", {
            action_mode: s.add_edit
            ,  data: data }).then(function (d) {
            if (d.data.message == "success")
            {
                s.RetrieveIncludeExclude();
                $('#modal_include_exclude_add_edit').modal('hide');
                swal(d.data.message_descr, { icon: "success" })
            }
            else
            {
                swal(d.data.message, d.data.message_descr, { icon: "warning" })
            }

        })
    }

    //************************************// 
    //*** Delete Record              
    //**********************************// 
    s.btn_del_row = function (row_index)
    {
        swal({
            title: "Are you sure to delete this record?",
            text: "Once deleted, you will not be able to recover this record!",
            icon: "warning",
            buttons: true,
            dangerMode: true,

        })
            .then(function (willDelete) {
                if (willDelete) {
                    h.post("../cExtractToExcel/Delete", {
                        empl_id: s.datalistgrid[row_index].empl_id
                    }).then(function (d) {
                        if (d.data.message == "success")
                        {
                            var temp = $('#datalist_grid').DataTable().page.info().page;
                            s.datalistgrid = s.datalistgrid.delete(row_index);
                            s.oTable.fnClearTable();
                            if (s.datalistgrid.length != 0) {
                                s.oTable.fnAddData(s.datalistgrid);
                            }
                            var table = $('#datalist_grid').DataTable();
                            table.page(temp).draw(false);
                            swal("Your record has been deleted!", { icon: "success", });
                        }
                        else {
                            swal("Data already deleted by other user/s!", { icon: "warning", });
                            s.datalistgrid = s.datalistgrid.delete(row_index);
                            s.oTable.fnClearTable();
                            if (s.datalistgrid.length != 0) {
                                s.oTable.fnAddData(s.datalistgrid);
                            }
                        }
                    })
                }
            });
    }
    function clearentry()
    {

        s.ddl_name = "";
        s.txtb_remarks_1 = "";
        s.txtb_remarks_2 = "";
        s.txtb_empl_id = "";
        s.txtb_employee_name = "";

    }
    

    //-----------------UPDATE BY JADE -------------------------------------------------------------

    //NEW UPDATE BY: JORGE RUSTOM VILLANUEVA 2020-09-18

    /* Formatting function for row details - modify as you need */

    /* Formatting function for row details - modify as you need */
    function format(d) {

        // `d` is the original data object for the row
        return '<table class="no-border" style="padding:0px !important;min-height:10px !important" id="table_show_details"> ' +
            '<tr>' +
            '<td style="width:24% !important;padding:0px 0px 0px 10px">Remarks 1:</td>' +
            '<td style="padding:0px">' + d.remarks_1 + '</td>' +
            '</tr>' +
            '<tr>' +
            '<td style="width:24% !important;padding:0px 0px 0px 10px">Remarks 2:</td>' +
            '<td style="padding:0px">' + d.remarks_2 + '</td>' +
            '</tr>' +
            '</table>';
    }
});