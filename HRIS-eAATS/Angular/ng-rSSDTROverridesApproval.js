﻿ng_HRD_App.controller("rSSDTROverridesApproval_ctrlr", function ($scope, $compile, $http, $filter, Upload, $timeout) {
    var s = $scope
    var h = $http

    s.dept_list = [];

    s.temp_time_in_am = ''
    s.temp_time_out_am = ''
    s.temp_under_Time = ''
    s.temp_under_Time_remarks = ''
    s.temp_time_in_pm = ''
    s.temp_time_out_pm = ''
    s.temp_remarks_details = ''
    s.temp_reason_details = ''
    s.temp_time_ot_hris = ''
    s.temp_time_days_equi = ''
    s.temp_time_hours_equi = ''
    s.temp_time_ot_payable = ''
    s.temp_remarks = ''
    s.remarks_combination_overrides = ''

    var remarks_am_in               = ''
    var remarks_am_out              = ''
    var remarks_pm_in               = ''
    var remarks_pm_out              = ''
    var remarks_undertime_minute    = ''
    var remarks_undertime_remarks   = ''
    var remarks_remarks             = ''
    var remarks_reason              = ''
    var remarks_ot_remarks          = ''
    var remarks_days_remarks        = ''
    var remarks_ot_payable_remarks  = ''
    s.show_dtr_status   = false;
    s.isAllowApproveAll = false;
    s.isApprove         = false;
    s.ddl_showoption = "1";
    function init() {
        //format datepicker to month - year only
        $("#txtb_dtr_mon_year").datepicker({
            format: "MM - yyyy",
            startView: "years",
            minViewMode: "months",
            autoclose: true,
        });

        $("#txtb_dtr_mon_year").on('change', function (e) {
            s.getDepartments();
            s.ddl_dept_chane();
            s.FilterPageGrid();
        });

        $("#ddl_name").select2().on('change', function (e) {
            s.FilterPageGrid();
        });

        s.ddl_viewtype = "0";

        var ddate = new Date();
        s.txtb_dtr_mon_year = moment(ddate).format("MMMM - YYYY");
        $("#modal_generating_remittance").modal();
        //**********************************************
        // Initialize data during page loads
        //**********************************************
        h.post("../rSSDTROverridesApproval/InitializeData").then(function (d) {
            if (d.data.message == "success") {

                s.empl_names = d.data.empl_name;
                s.dept_list = d.data.dept_list;
                s.ddl_dept = "";
                //s.ddl_name      = d.data.um.user_id.replace("U", "");
                //s.txtb_empl_id  = d.data.um.user_id.replace("U", "");

                //Object.keys(d.data.dept_list).forEach(function (key) {
                //    if (d.data.dept_list[key].department_code == d.data.dept_code) {
                //        s.txtb_department = Object.values(d.data.dept_list)[key].department_name1;
                //    }
                //});

                if (d.data.dtr_val.length > 0) {
                    init_table_data(d.data.dtr_val);
                }
                else {
                    init_table_data([]);
                }

                //**********************************************
                //  Show/Hide ADD, EDIT, DELETE button 
                //**********************************************
                d.data.um.allow_add == "1" ? s.ShowAdd = true : s.ShowAdd = false;
                d.data.um.allow_delete == "1" ? s.ShowDelete = true : s.ShowDelete = false;
                d.data.um.allow_edit == "1" ? s.ShowEdit = true : s.ShowEdit = false;
                //d.data.um.allow_view    == "1" ? s.ShowView     = true : s.ShowView     = false;
                //d.data.um.allow_print == "1" ? s.ShowAdd = true : s.ShowAdd = false;

                $("#modal_generating_remittance").modal("hide");
            }
            else {
                swal(d.data.message, { icon: "warning", });
            }
        });
    }
    init()

    var init_table_data = function (par_data) {
        s.datalistgrid = par_data;
        s.oTable = $('#datalist_grid').dataTable(
            {
                data: s.datalistgrid,
                bSort: false,
                bAutoWidth: false,
                sDom: 'rt<"bottom">',
                paging: false,
                columns: [
                    {
                        "mData": null,
                        "mRender": function (data, type, full, row) {
                            //return "<span class='text-left btn-block'>" + full["dtr_day"] + " " + full["day_of_week"] + "</span>" 
                            if (full["day_of_week"] == "S") {
                                return "<span class='text-left btn-block' style='color:#ed5565;font-weight:bold;'>" + full["dtr_day"] + " " + full["day_of_week"] + "</span>";
                            }
                            else {
                                return "<span class='text-left btn-block' style='font-weight:bold;'>" + full["dtr_day"] + " " + full["day_of_week"] + "</span>";
                            }
                        }
                    },
                    {
                        "mData": "time_in_am",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-center btn-block'>" + data + "</span>"
                        }
                    },
                    {
                        "mData": "time_out_am",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-center btn-block'>" + data + "</span>"
                        }
                    },
                    {
                        "mData": "time_in_pm",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-center btn-block'>" + data + "</span>"
                        }
                    },
                    {
                        "mData": "time_out_pm",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-center btn-block'>" + data + "</span>"
                        }
                    },
                    {
                        "mData": "under_Time_remarks",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-center btn-block'>" + data + "</span>"
                        }
                    },
                    {
                        "mData": "remarks_details",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-left btn-block'>" + data + "</span>"
                        }
                    },
                    {
                        "mData": "override_status_descr",
                        "mRender": function (data, type, full, row) {
                            var return_html = ""
                            if (full["approval_status"] == "A") {
                                return_html = "<samll><span class='text-center btn-block' style='font-size:10px !important;'>" + data + "</span></small>"
                            }
                            else {
                                return_html = "<span class='text-left btn-block'>" + data + "</span>"
                            }
                            return return_html
                        }
                    },
                    {
                        "mData": null,
                        "mRender": function (data, type, full, row) {
                            var return_html = "";
                            if (full["dtr_order_no"] == "") {
                                return_html = "";
                            }
                            else if (full["transmitted_flag"] == "0")
                            {
                                return_html = '<center><div class="btn-group">' +
                                    '<button type="button" ng-show="ShowEdit" class="btn btn-primary btn-sm" ng-click="btn_edit_action(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Only Viewing of details because DTR already transmitted.">  <i class="fa fa-eye"></i> View Only</button >' +
                                    '</div></center>';
                            }
                            else if (full["transmitted_flag"] == "1" && full["dtr_day"] >= 16)
                            {
                                if (full["override_status"] == "F")
                                {
                                    return_html = '<center><div class="btn-group">' +
                                        '<button type="button" ng-show="ShowEdit" class="btn btn-primary btn-sm" ng-click="btn_edit_action(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Open the details and You cancel the override.">  <i class="fa fa-eye"></i> View Only</button >' +
                                        '</div></center>';
                                }
                                else
                                {

                                    return_html = '<center><div class="btn-group">' +
                                        '<button type="button" ng-show="ShowEdit" class="btn btn-success btn-sm" ng-click="btn_edit_action(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Open the details and approve the override.">  <i class="fa fa-thumbs-up"></i> For Approval</button >' +
                                        '</div></center>';
                                }
                            }
                            else if (full["transmitted_flag"] == "2" && full["dtr_day"] <= 15)
                            {
                                if (full["override_status"] == "F")
                                {
                                    return_html = '<center><div class="btn-group">' +
                                        '<button type="button" ng-show="ShowEdit" class="btn btn-primary btn-sm" ng-click="btn_edit_action(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Open the details and You can cancle the override.">  <i class="fa fa-eye"></i> View Only</button >' +
                                        '</div></center>';
                                }
                                else
                                {
                                    return_html = '<center><div class="btn-group">' +
                                        '<button type="button" ng-show="ShowEdit" class="btn btn-success btn-sm" ng-click="btn_edit_action(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Open the details and approve the override.">  <i class="fa fa-thumbs-up"></i> For Approval</button >' +
                                        '</div></center>';
                                }
                            }
                            else if (full["override_status"] == "F")
                            {
                                return_html = '<center><div class="btn-group">' +
                                    '<button type="button" ng-show="ShowEdit" class="btn btn-primary btn-sm" ng-click="btn_edit_action(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Open the details and You can cancle the override.">  <i class="fa fa-eye"></i> View Only</button >' +
                                    '</div></center>';
                            }
                            else if (full["transmitted_flag"] == "")
                            {
                                return_html = '<center><div class="btn-group">' +
                                    '<button type="button" ng-show="ShowEdit" class="btn btn-success btn-sm" ng-click="btn_edit_action(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Open the details and approve the override.">  <i class="fa fa-thumbs-up"></i> For Approval</button >' +
                                    '</div></center>';
                            }
                            else {
                                return_html = '<center><div class="btn-group">' +
                                    '<button type="button" ng-show="ShowEdit" class="btn btn-primary btn-sm" ng-click="btn_edit_action(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Only Viewing of details because DTR already transmitted.">  <i class="fa fa-eye"></i> View Only</button >' +
                                    '</div></center>';
                            }

                            return return_html;
                        }
                    }
                ],
                "createdRow": function (row, data, index) {
                    $compile(row)($scope);  //add this to compile the DOM
                },
            });
    }

    s.search_in_list = function (value, table) {
        try {
            $("#" + table).DataTable().search(value).draw();
        }
        catch (err) {
            alert(err.message)
        }
    }

    //*********************************************//
    //*** Filter Page Grid
    //********************************************// 
    s.FilterPageGrid = function () {
        try {
            h.post("../rSSDTROverridesApproval/FilterPageGrid", {
                p_dept_code: $("#ddl_dept option:selected").val()
                , p_empl_id: $("#ddl_name option:selected").val()
                , p_year: str_to_year(s.txtb_dtr_mon_year)
                , p_month: month_name_to_int($("#txtb_dtr_mon_year").val())
                , p_view_type: $("#ddl_viewtype option:selected").val()
                , p_showoption: $("#ddl_showoption option:selected").val()
            }).then(function (d) {
                s.datalistgrid = [];
                if (d.data.message == "success")
                {
                    s.txtb_empl_id = $("#ddl_name option:selected").val();
                    s.oTable.fnClearTable();
                    s.datalistgrid      = d.data.filteredGrid;
                    s.isAllowApproveAll = false;
                    if (d.data.filteredGrid.length > 0)
                    {
                        if (d.data.filteredGrid.length > 1)
                        {
                            s.isAllowApproveAll = s.ddl_showoption == "3" ? false: true;
                        }
                        else
                        {
                            s.isAllowApproveAll = false;
                        }

                        if (d.data.filteredGrid[0].transmitted_flag == "0")
                        {
                            s.isAllowApproveAll = false;
                            s.show_dtr_status = true;
                            s.dtr_status_descr = "ALREADY HAVE AN APPROVED DTR TRANSMITTAL FOR THE WHOLE MONTH!";
                        }
                        else if (d.data.filteredGrid[0].transmitted_flag == "1") {
                            s.show_dtr_status = true;
                            s.dtr_status_descr = "ALREADY HAVE AN APPROVED DTR TRANSMITTAL FOR THE 1st QUENCENA!";
                        }
                        else if (d.data.filteredGrid[0].transmitted_flag == "2") {
                            s.show_dtr_status = true;
                            s.dtr_status_descr = "ALREADY HAVE AN APPROVED DTR TRANSMITTAL FOR THE 2nd QUENCENA!";
                        }
                        else {
                            s.show_dtr_status = false;
                        }



                        s.show_dtr_status
                        s.oTable.fnAddData(d.data.filteredGrid);
                    }
                }
            });
        }
        catch (err) {
            swal({ icon: "warning", title: err.message });
        }
    }

    //*********************************************//
    //*** Filter Page Grid
    //********************************************// 
    s.getDepartments = function () {
        try
        {
            h.post("../rSSDTROverridesApproval/GetDepartments",
                {
                     p_year: str_to_year(s.txtb_dtr_mon_year)
                    , p_month: month_name_to_int($("#txtb_dtr_mon_year").val())
                }).then(function (d)
                {
                    if (d.data.message == "success")
                    {
                        s.dept_list = d.data.dept_list;
                    }
                });
        }
        catch (err) {
            swal({ icon: "warning", title: err.message });
        }
    }
    s.ddl_showoption_change = function ()
    {
        if (s.ddl_showoption == "1")
        {
            $("#btn_approveAll").removeClass("btn-danger");
            $("#btn_approveAll").addClass("btn-success");
            $("#btn_approveAll").html('<i class="fa fa-thumbs-up"></i> Approved All');
        }
        else if (s.ddl_showoption == "2")
        {
            $("#btn_approveAll").removeClass("btn-success");
            $("#btn_approveAll").addClass("btn-danger");
            $("#btn_approveAll").html('<i class="fa fa-share"></i> Cancel All');
        }
        else if (s.ddl_showoption == "3")
        {
            $("#btn_approveAll").removeClass("btn-danger");
            $("#btn_approveAll").addClass("btn-success");
            $("#btn_approveAll").html('<i class="fa fa-thumbs-up"></i> Approved All');
        }
        s.ddl_dept_chane();
    }
    //*********************************************//
    //*** Filter Page Grid
    //********************************************// 
    s.ddl_dept_chane = function () {
        try
        {
            h.post("../rSSDTROverridesApproval/DepartmentFilter",
                {
                    p_dept_code: $("#ddl_dept option:selected").val()
                    , p_year: str_to_year(s.txtb_dtr_mon_year)
                    , p_month: month_name_to_int($("#txtb_dtr_mon_year").val())
                    , p_showoption: $("#ddl_showoption option:selected").val()
                }).then(function (d)
                {
                    $("#ddl_name option:selected").val("");
                    if (d.data.message == "success")
                    {
                        s.empl_names = d.data.empl_name;
                        s.FilterPageGrid();
                    }
                });
        }
        catch (err) {
            swal({ icon: "warning", title: err.message });
        }
    }

    s.btn_edit_action = function (row) {

        s.isApprove = false;
        ValidationResultColor("ALL", false);
        clearentry()

        s.temp_time_in_am = s.datalistgrid[row].time_in_am;
        s.temp_time_out_am = s.datalistgrid[row].time_out_am;
        s.temp_under_Time = s.datalistgrid[row].under_Time;
        s.temp_under_Time_remarks = s.datalistgrid[row].under_Time_remarks;
        s.temp_time_in_pm = s.datalistgrid[row].time_in_pm;
        s.temp_time_out_pm = s.datalistgrid[row].time_out_pm;
        s.temp_remarks_details = s.datalistgrid[row].remarks_details;
        s.temp_reason_details = s.datalistgrid[row].reason_override;
        s.temp_time_ot_hris = s.datalistgrid[row].time_ot_hris;
        s.temp_time_days_equi = s.datalistgrid[row].time_days_equi;
        s.temp_time_hours_equi = s.datalistgrid[row].time_hours_equi;
        s.temp_time_ot_payable = s.datalistgrid[row].time_ot_payable;
        //var temp_date = s.datalistgrid[row].dtr_month + " " + s.datalistgrid[row].dtr_day + ", " + s.datalistgrid[row].dtr_year

        s.temp_remarks = s.datalistgrid[row].remarks;
        s.txtb_remarks_override = s.datalistgrid[row].remarks;
        //s.remarks_combination_overrides = s.datalistgrid[row].remarks

        var temp_date = s.datalistgrid[row].dtr_year + "-" + s.datalistgrid[row].dtr_month + "-" + s.datalistgrid[row].dtr_day;

        s.txtb_empl_name = s.datalistgrid[row].employee_name;
        s.txtb_department2 = s.datalistgrid[row].department_name1;
        s.txtb_dtr_date = temp_date;
        s.txtb_am_in = s.datalistgrid[row].time_in_am;
        s.txtb_am_out = s.datalistgrid[row].time_out_am;
        s.txtb_undertime = s.datalistgrid[row].under_Time;
        s.txtb_undertime_remarks = s.datalistgrid[row].under_Time_remarks;
        s.txtb_pm_in = s.datalistgrid[row].time_in_pm;
        s.txtb_pm_out = s.datalistgrid[row].time_out_pm;
        s.txtb_remarks = s.datalistgrid[row].remarks_details;

        s.txtb_time_ot_hours = s.datalistgrid[row].time_ot_hris;
        s.txtb_time_days_equiv = s.datalistgrid[row].time_days_equi;
        s.txtb_time_hours_equiv = s.datalistgrid[row].time_hours_equi;
        s.txtb_time_ot_payable = s.datalistgrid[row].time_ot_payable;
        s.txtb_reason_override = s.datalistgrid[row].reason_override;

        s.ts_code = s.datalistgrid[row].ts_code;
        //s.under_Time            = s.datalistgrid[row].under_Time;

        s.dtr_order_no = s.datalistgrid[row].dtr_order_no;
        if (s.datalistgrid[row].transmitted_flag == "0")
        {
            s.isEditable = false;
        }
        else if (s.datalistgrid[row].transmitted_flag == "1" && s.datalistgrid[row].dtr_day >= 16)
        {
            if (s.datalistgrid[row].override_status == "S")
            {
                s.isEditable = true;
            }
            else {
                s.isEditable = false;
                s.isApprove = true;
            }
        }
        else if (s.datalistgrid[row].transmitted_flag == "2" && s.datalistgrid[row].dtr_day <= 15)
        {
            if (s.datalistgrid[row].override_status == "S") {
                s.isEditable = true;
            }
            else {
                s.isEditable = false;
                s.isApprove = true;
            }
        }
        else if (s.datalistgrid[row].transmitted_flag == "")
        {
            if (s.datalistgrid[row].override_status == "S") {
                s.isEditable = true;
            }
            else {
                s.isEditable = false;
                s.isApprove = true;
            }
        }
        else
        {
            s.isEditable = false;
           
        }

        $('#main_modal').modal({ backdrop: 'static', keyboard: false });
    }

    //************************************// 
    //*** Save New Record  -  Save as NEW
    //**********************************// 
    s.btn_save_click = function (action_status) {
        try {
            if (ValidateFields()) {
                var data =
                {
                    dtr_order_no: s.dtr_order_no
                    , empl_id: s.txtb_empl_id
                    , dtr_date: s.txtb_dtr_date
                    , time_in_am: s.txtb_am_in
                    , time_out_am: s.txtb_am_out
                    , time_in_pm: s.txtb_pm_in
                    , time_out_pm: s.txtb_pm_out
                    , ts_code: s.ts_code
                    , under_Time: s.txtb_undertime
                    , under_Time_remarks: s.txtb_undertime_remarks
                    , remarks_details: s.txtb_remarks
                    , time_ot_hris: s.txtb_time_ot_hours
                    , time_days_equi: s.txtb_time_days_equiv
                    , time_hours_equi: s.txtb_time_hours_equiv
                    , time_ot_payable: s.txtb_time_ot_payable
                    , no_of_as: ""
                    , no_of_ob: ""
                    , no_of_lv: ""
                    , remarks_override: s.remarks_combination_overrides
                    , reason_override: s.txtb_reason_override
                    , approval_status: action_status
                    , approved_by: ""
                    , approved_dttm: ""
                }


                //ENDED BY JORGE
                h.post("../rSSDTROverridesApproval/Save", { data: data }).then(function (d) {
                    if (d.data.message == "success") {
                        s.FilterPageGrid();
                        $('#main_modal').modal("hide");
                        swal("Override Successfully Approved!", { icon: "success", title: "Successfully Approved" });
                    }
                    else {
                        swal(d.data.message, { icon: "warning", });
                    }
                });
            }

        }
        catch (err) {
            swal({ icon: "warning", title: err.message });
        }
    }

    //************************************// 
    //*** Save New Record  -  Save as NEW
    //**********************************// 
    s.btn_cancelpending = function () {
        try {
            if (ValidateFields()) {
                var data =
                {
                    dtr_order_no: s.dtr_order_no
                    , empl_id: s.txtb_empl_id
                    , dtr_date: s.txtb_dtr_date
                    , time_in_am: s.txtb_am_in
                    , time_out_am: s.txtb_am_out
                    , time_in_pm: s.txtb_pm_in
                    , time_out_pm: s.txtb_pm_out
                    , ts_code: s.ts_code
                    , under_Time: s.txtb_undertime
                    , under_Time_remarks: s.txtb_undertime_remarks
                    , remarks_details: s.txtb_remarks
                    , time_ot_hris: s.txtb_time_ot_hours
                    , time_days_equi: s.txtb_time_days_equiv
                    , time_hours_equi: s.txtb_time_hours_equiv
                    , time_ot_payable: s.txtb_time_ot_payable
                    , no_of_as: ""
                    , no_of_ob: ""
                    , no_of_lv: ""
                    , remarks_override: s.remarks_combination_overrides
                    , reason_override: s.txtb_reason_override
                    , approval_status: "C"
                    , approved_by: ""
                    , approved_dttm: ""
                }

                swal({
                    title: "ARE YOU SURE TO CANCEL PENDING THIS OVERRIDE?",
                    text: "Override will not reflect in DTR when it is not approved!",
                    icon: "warning",
                    buttons: ["NO", "YES"],
                    dangerMode: true,

                })
                    .then(function (willDelete) {
                        if (willDelete) {
                            //ENDED BY JORGE
                            h.post("../rSSDTROverridesApproval/Save", { data: data }).then(function (d) {
                                if (d.data.message == "success") {
                                    s.FilterPageGrid();
                                    $('#main_modal').modal("hide");
                                    swal("Override Successfully Cancel Pending!", { icon: "success", title: "Successfully Cancel Pending" });
                                }
                                else {
                                    swal(d.data.message, { icon: "warning", });
                                }
                            });
                        }
                    });

            }

        }
        catch (err) {
            swal({ icon: "warning", title: err.message });
        }
    }

    //************************************// 
    //*** Save New Record  -  Save as NEW
    //**********************************// 
    s.btn_cancel = function ()
    {
        try {
            if (ValidateFields()) {
                var data =
                {
                    dtr_order_no: s.dtr_order_no
                    , empl_id: s.txtb_empl_id
                    , dtr_date: s.txtb_dtr_date
                    , time_in_am: s.txtb_am_in
                    , time_out_am: s.txtb_am_out
                    , time_in_pm: s.txtb_pm_in
                    , time_out_pm: s.txtb_pm_out
                    , ts_code: s.ts_code
                    , under_Time: s.txtb_undertime
                    , under_Time_remarks: s.txtb_undertime_remarks
                    , remarks_details: s.txtb_remarks
                    , time_ot_hris: s.txtb_time_ot_hours
                    , time_days_equi: s.txtb_time_days_equiv
                    , time_hours_equi: s.txtb_time_hours_equiv
                    , time_ot_payable: s.txtb_time_ot_payable
                    , no_of_as: ""
                    , no_of_ob: ""
                    , no_of_lv: ""
                    , remarks_override: s.remarks_combination_overrides
                    , reason_override: s.txtb_reason_override
                    , approval_status: "N"
                    , approved_by: ""
                    , approved_dttm: ""
                }

                swal({
                    title: "ARE YOU SURE TO CANCEL THIS OVERRIDE?",
                    text: "Override will not reflect in DTR when it is not approved!",
                    icon: "warning",
                    buttons: ["NO", "YES"],
                    dangerMode: true,

                })
                    .then(function (willDelete) {
                        if (willDelete) {
                            //ENDED BY JORGE
                            h.post("../rSSDTROverridesApproval/Save", { data: data }).then(function (d)
                            {
                                if (d.data.message == "success") {
                                    s.FilterPageGrid();
                                    $('#main_modal').modal("hide");
                                    swal("Override Successfully Cancelled!", { icon: "success", title: "Successfully Cancelled" });
                                }
                                else {
                                    swal(d.data.message, { icon: "warning", });
                                }
                            });
                        }
                    });

            }

        }
        catch (err) {
            swal({ icon: "warning", title: err.message });
        }
    }

    //************************************// 
    //*** Save New Record  -  Save as NEW
    //**********************************// 
    s.btn_approve_all = function () {
        try {
            if (s.ddl_showoption == "1")
            {
                swal({
                    title: "ARE YOU SURE TO APPROVE ALL THIS OVERRIDES?",
                    text: "Override will not reflect in DTR when it is not approved!",
                    icon: "warning",
                    buttons: ["NO", "YES APPROVE ALL"],
                    dangerMode: true,

                })
                    .then(function (willDelete) {
                        if (willDelete) {
                            //ENDED BY JORGE
                            h.post("../rSSDTROverridesApproval/ApproveAll",
                                {
                                    p_empl_id: $("#ddl_name option:selected").val()
                                    , p_year: str_to_year(s.txtb_dtr_mon_year)
                                    , p_month: month_name_to_int($("#txtb_dtr_mon_year").val())
                                }).then(function (d) {
                                    if (d.data.message == "success") {
                                        s.FilterPageGrid();
                                        $('#main_modal').modal("hide");
                                        swal("All Overrides Successfully Approve!", { icon: "success", title: "Successfully Approved All" });
                                    }
                                    else {
                                        swal(d.data.message, { icon: "warning", });
                                    }
                                });
                        }
                    });

            }
            else if (s.ddl_showoption == "2")
            {
                swal({
                    title: "ARE YOU SURE TO CANCEL ALL THIS OVERRIDES?",
                    text: "Override will not reflect in DTR when it is Cancelled!",
                    icon: "warning",
                    buttons: ["NO", "YES CANCEL ALL"],
                    dangerMode: true,

                })
                    .then(function (willDelete) {
                        if (willDelete) {
                            //ENDED BY JORGE
                            h.post("../rSSDTROverridesApproval/CancelAll",
                                {
                                    p_empl_id: $("#ddl_name option:selected").val()
                                    , p_year: str_to_year(s.txtb_dtr_mon_year)
                                    , p_month: month_name_to_int($("#txtb_dtr_mon_year").val())
                                }).then(function (d) {
                                    if (d.data.message == "success")
                                    {
                                        s.FilterPageGrid();
                                        $('#main_modal').modal("hide");
                                        swal("All Overrides Successfully Cancelled!", { icon: "success", title: "All Successfully Cancelled" });
                                    }
                                    else {
                                        swal(d.data.message, { icon: "warning", });
                                    }
                                });
                        }
                    });
            }
            
        }
        catch (err) {
            swal({ icon: "warning", title: err.message });
        }
    }


    s.btn_print2 = function () {
        try {
            h.post("../rSSDTROverridesApproval/PreviousValuesOnPage_rSSDTROverrides").then(function (d) {
                h.post("../rSSDTRPrinting/RetriveData",
                    {
                        par_year: str_to_year(s.txtb_dtr_mon_year)
                        , par_month: month_name_to_int($("#txtb_dtr_mon_year").val())
                        , par_empl_id: $("#ddl_name option:selected").val()
                        , par_view_type: $("#ddl_viewtype option:selected").val()
                        , par_department_code: s.ddl_dept

                    }).then(function (d) {

                        if (d.data.sp_report.length == 0) {
                            swal("NO DATA FOUND", "No data found in this Year and Month Selected", { icon: "warning" });
                        }
                        else {
                            var controller = "Reports"
                            var action = "Index"
                            var ReportName = "cryDTR"
                            var SaveName = "Crystal_Report"
                            var ReportType = "inline"
                            var ReportPath = ""
                            var sp = ""

                            ReportPath = "~/Reports/cryDTR/cryDTR.rpt"
                            sp = "sp_dtr_rep,par_year," + str_to_year(s.txtb_dtr_mon_year) + ",par_month," + month_name_to_int($("#txtb_dtr_mon_year").val()) + ",par_empl_id," + $("#ddl_name option:selected").val() + ",par_view_type," + $("#ddl_viewtype option:selected").val() + ",par_department_code," + s.ddl_dept + ",par_user_id," + d.data.session_user_id


                            location.href = "../" + controller + "/" + action + "?ReportName=" + ReportName
                                + "&SaveName=" + SaveName
                                + "&ReportType=" + ReportType
                                + "&ReportPath=" + ReportPath
                                + "&Sp=" + sp

                        }
                    });
            });

        }
        catch (err) {
            swal({ icon: "warning", title: err.message });
        }
    }

    //***********************************************************//
    //***Field validation for remittance type before opening add modal
    //***********************************************************// 
    function ValidateFields() {
        var return_val = true;
        ValidationResultColor("ALL", false);

        if ($('#txtb_reason_override').val() == "") {
            ValidationResultColor("txtb_reason_override", true);
            return_val = false;
        }

        return return_val;
    }
    //***********************************************************//
    //***Field validation for remittance type before opening add modal
    //***********************************************************// 
    function ValidationResultColor(par_object_id, par_v_result) {
        if (par_v_result) {
            //Add class to the obect that need to focus as a required..
            $("#" + par_object_id).addClass("required");
            $("#lbl_" + par_object_id + "_req").text("Required Field!");
        }
        else {
            //remove of refresh the object form being required

            //$("#input_file_upload").removeClass("required");

            $("#txtb_reason_override").removeClass("required");
            $("#lbl_txtb_reason_override_req").text("");

            //$("#txtb_dtr_mon_year2").removeClass("required");
            //$("#lbl_txtb_dtr_mon_year2_req").text("");

        }
    }

    function str_to_year(str) {
        var year = str.substr(str.length - 4);

        return year;
    }

    function month_name_to_int(month_name) {
        var int_mons = "01";

        if (month_name.includes("January")) {
            int_mons = "01";
        }
        else if (month_name.includes("February")) {
            int_mons = "02";
        }
        else if (month_name.includes("March")) {
            int_mons = "03";
        }
        else if (month_name.includes("April")) {
            int_mons = "04";
        }
        else if (month_name.includes("May")) {
            int_mons = "05";
        }
        else if (month_name.includes("June")) {
            int_mons = "06";
        }
        else if (month_name.includes("July")) {
            int_mons = "07";
        }
        else if (month_name.includes("August")) {
            int_mons = "08";
        }
        else if (month_name.includes("September")) {
            int_mons = "09";
        }
        else if (month_name.includes("October")) {
            int_mons = "10";
        }
        else if (month_name.includes("November")) {
            int_mons = "11";
        }
        else if (month_name.includes("December")) {
            int_mons = "12";
        }

        return int_mons;
    }

    function clearentry() {
        s.txtb_empl_name = "";
        s.txtb_department2 = "";
        s.txtb_dtr_date = "";
        s.txtb_am_in = "";
        s.txtb_am_out = "";
        s.txtb_undertime = "";
        s.txtb_undertime_remarks = "";
        s.txtb_pm_in = "";
        s.txtb_pm_out = "";
        s.txtb_remarks = "";

        s.txtb_time_ot_hours = "";
        s.txtb_time_days_equiv = "";
        s.txtb_time_hours_equiv = "";
        s.txtb_time_ot_payable = "";

        s.ts_code = "";
        //s.under_Time            = "";        

        s.dtr_order_no = "";

        s.temp_time_in_am = ''
        s.temp_time_out_am = ''
        s.temp_under_Time = ''
        s.temp_under_Time_remarks = ''
        s.temp_time_in_pm = ''
        s.temp_time_out_pm = ''
        s.temp_remarks_details = ''
        s.temp_reason_details = ''
        s.temp_time_ot_hris = ''
        s.temp_time_days_equi = ''
        s.temp_time_hours_equi = ''
        s.temp_time_ot_payable = ''
        s.txtb_remarks_override = ''
        s.temp_remarks = ''
        remarks_am_in = ''
        remarks_am_out = ''
        remarks_pm_in = ''
        remarks_pm_out = ''
        remarks_undertime_minute = ''
        remarks_undertime_remarks = ''
        remarks_remarks = ''
        remarks_reason = ''
        remarks_ot_remarks = ''
        remarks_days_remarks = ''
        remarks_ot_payable_remarks = ''
    }

    s.UpdateAction = function (values, action) {  //ADDED BY JORGE: 2021-05-21


        //var remarks_status = ""

        //FOR EDIT TIME IN AND DELETE TIME IN -SINGLE UPDATE



        if (action == 'AM-IN') {
            if (s.temp_time_in_am.trim() != values.trim()) {

                if (values.trim() == "") {
                    if (remarks_am_in != 'DELETE AM IN: (' + s.temp_time_in_am + ')') { remarks_am_in = 'DELETE AM IN: (' + s.temp_time_in_am + '), ' }
                }
                else if (values.trim() != "" && values.trim().length >= 5) {

                    remarks_am_in = 'UPDATE AM IN: (' + s.temp_time_in_am + ') TO (' + values.trim() + '), '
                }
                if (values.trim() == s.temp_time_in_am && values.trim().length >= 5) {
                    remarks_am_in = ''
                }

            }
        }



        //FOR EDIT TIME IN AND DELETE TIME IN -SINGLE UPDATE
        if (action == 'AM-OUT') {
            if (s.temp_time_out_am.trim() != values.trim()) {

                if (values.trim() == "") {
                    if (remarks_am_out != 'DELETE AM OUT: (' + s.temp_time_out_am + ')') { remarks_am_out = 'DELETE AM OUT: (' + s.temp_time_out_am + '), ' }
                }
                else if (values.trim() != "" && values.trim().length >= 5) {

                    remarks_am_out = 'UPDATE AM OUT: (' + s.temp_time_out_am + ') TO (' + values.trim() + '), '
                }

                if (values.trim() == s.temp_time_out_am && values.trim().length >= 5) {
                    remarks_am_out = ''
                }
            }
        }


        //FOR EDIT TIME IN AND DELETE TIME IN -SINGLE UPDATE
        if (action == 'PM-IN') {

            if (s.temp_time_in_pm.trim() != values.trim()) {

                if (values.trim() == "") {

                    if (remarks_pm_in != 'DELETE PM IN: (' + s.temp_time_in_pm + ')') {
                        remarks_pm_in = 'DELETE PM IN: (' + s.temp_time_in_pm + '), '

                    }
                }
                else if (values.trim() != "" && values.trim().length >= 5) {

                    remarks_pm_in = 'UPDATE PM IN: (' + s.temp_time_in_pm + ') TO (' + values.trim() + '), '
                }

                if (values.trim() == s.temp_time_in_pm && values.trim().length >= 5) {
                    remarks_pm_in = ''
                }

            }
        }



        //FOR EDIT TIME IN AND DELETE TIME IN -SINGLE UPDATE
        if (action == 'PM-OUT') {
            if (s.temp_time_out_pm.trim() != values.trim()) {

                if (values.trim() == "") {
                    if (remarks_pm_out != 'DELETE PM OUT: (' + s.temp_time_out_pm + ')') { remarks_pm_out = 'DELETE PM OUT: (' + s.temp_time_out_pm + '), ' }
                }
                else if (values.trim() != "" && values.trim().length >= 5) {
                    remarks_pm_out = 'UPDATE PM OUT: (' + s.temp_time_out_pm + ') TO (' + values.trim() + '), '
                }
                if (values.trim() == s.temp_time_out_pm && values.trim().length >= 5) {
                    remarks_pm_out = ''
                }

            }
        }


        //FOR EDIT UNDERTIME AND DELETE TIME IN -SINGLE UPDATE
        if (action == 'UNDERTIME_MINUTE') {
            if (s.temp_under_Time != values.trim()) {

                if (values.trim() == "") {
                    if (remarks_undertime_minute != 'DELETE UNDERTIME MINUTES: (' + s.temp_under_Time + ')') { remarks_undertime_minute = 'DELETE UNDERTIME MINUTES: (' + s.temp_under_Time + '), ' }
                }
                else if (values.trim() != "") {
                    remarks_undertime_minute = 'UPDATE UNDERTIME MINUTES: (' + s.temp_under_Time + ') TO (' + values.trim() + '), '
                }


            }
        }



        //FOR EDIT UNDERTIME AND DELETE TIME IN -SINGLE UPDATE
        if (action == 'UNDERTIME_REMARKS') {
            if (s.temp_under_Time_remarks != values.trim()) {

                if (values.trim() == "") {
                    if (remarks_undertime_remarks != 'DELETE UNDERTIME REMARKS: (' + s.temp_under_Time_remarks + ')') { remarks_undertime_remarks = 'DELETE UNDERTIME REMARKS: (' + s.temp_under_Time_remarks + '), ' }
                }
                else if (values.trim() != "") {
                    remarks_undertime_remarks = 'UPDATE UNDERTIME REMARKS: (' + s.temp_under_Time_remarks + ') TO (' + values.trim() + '), '
                }


            }
        }


        //FOR EDIT UNDERTIME AND DELETE TIME IN -SINGLE UPDATE
        if (action == 'REMARKS_DETAILS') {
            if (s.temp_remarks_details != values.trim()) {

                if (values.trim() == "") {
                    if (remarks_remarks != 'DELETE REMARKS DETAILS: (' + s.temp_remarks_details + ')') { remarks_remarks = 'DELETE REMARKS DETAILS: (' + s.temp_remarks_details + '), ' }
                }
                else if (values.trim() != "") {
                    remarks_remarks = 'UPDATE REMARKS DETAILS: (' + s.temp_remarks_details + ') TO (' + values.trim() + '), '
                }


            }
        }

        //FOR EDIT UNDERTIME AND DELETE TIME IN -SINGLE UPDATE
        if (action == 'REASON_DETAILS') {
            if (s.temp_reason_details != values.trim()) {

                if (values.trim() == "") {
                    if (remarks_reason != 'DELETE OVERRIDE REASON: (' + s.temp_reason_details + ')') { remarks_reason = 'DELETE OVERRIDE REASON: (' + s.temp_reason_details + '), ' }
                }
                else if (values.trim() != "") {
                    remarks_reason = 'UPDATE OVERRIDE REASON: (' + s.temp_reason_details + ') TO (' + values.trim() + '), '
                }


            }
        }



        //FOR EDIT UNDERTIME AND DELETE TIME IN -SINGLE UPDATE
        if (action == 'OT_TIME') {
            if (s.temp_time_ot_hris != values.trim()) {

                if (values.trim() == "") {
                    if (remarks_ot_remarks != 'DELETE OVERTIME REMARKS: (' + s.temp_time_ot_hris + ')') { remarks_ot_remarks = 'DELETE OVERTIME REMARKS: (' + s.temp_time_ot_hris + '), ' }
                }
                else if (values.trim() != "") {
                    remarks_ot_remarks = 'UPDATE OVERTIME REMARKS: (' + s.temp_time_ot_hris + ') TO (' + values.trim() + '), '
                }


            }
        }




        //FOR EDIT UNDERTIME AND DELETE TIME IN -SINGLE UPDATE
        if (action == 'DAY_EQUI') {
            if (s.temp_time_days_equi != values.trim()) {

                if (values.trim() == "") {
                    if (remarks_days_remarks != 'DELETE DAYS EQUIVALENT: (' + s.temp_time_days_equi + ')') { remarks_days_remarks = 'DELETE DAYS EQUIVALENT: (' + s.temp_time_days_equi + '), ' }
                }
                else if (values.trim() != "") {
                    remarks_days_remarks = 'UPDATE DAYS EQUIVALENT: (' + s.temp_time_days_equi + ') TO (' + values.trim() + '), '
                }


            }
        }
        var remarks_hours_remarks = ''
        //FOR EDIT UNDERTIME AND DELETE TIME IN -SINGLE UPDATE

        if (action == 'HOURS_EQUI') {
            if (s.temp_time_hours_equi != values.trim()) {

                if (values.trim() == "") {
                    if (remarks_hours_remarks != 'DELETE HOURS EQUIVALENT: (' + s.temp_time_hours_equi + ')') { remarks_hours_remarks = 'DELETE HOURS EQUIVALENT: (' + s.temp_time_hours_equi + '), ' }
                }
                else if (values.trim() != "") {
                    remarks_hours_remarks = 'UPDATE HOURS EQUIVALENT: (' + s.temp_time_hours_equi + ') TO (' + values.trim() + '), '
                }


            }
        }

        //FOR EDIT UNDERTIME AND DELETE TIME IN -SINGLE UPDATE
        if (action == 'OT_PAYABLE') {
            if (s.temp_time_ot_payable != values.trim()) {

                if (values.trim() == "") {
                    if (remarks_ot_payable_remarks != 'DELETE OT PAYABLE: (' + s.temp_time_ot_payable + ')') { remarks_ot_payable_remarks = 'DELETE  OT PAYABLE: (' + s.temp_time_ot_payable + '), ' }
                }
                else if (values.trim() != "") {
                    remarks_ot_payable_remarks = 'UPDATE  OT PAYABLE: (' + s.temp_time_ot_payable + ') TO (' + values.trim() + '), '
                }


            }
        }


        s.remarks_combination_overrides = s.temp_remarks + ', ' +
            remarks_am_in
            + remarks_am_out
            + remarks_pm_in
            + remarks_pm_out
            + remarks_undertime_minute
            + remarks_undertime_remarks
            + remarks_remarks
            + remarks_reason
            + remarks_ot_remarks
            + remarks_days_remarks
            + remarks_ot_payable_remarks

        s.txtb_remarks_override = s.remarks_combination_overrides

        //END EDIT TIME IN AND DELETE TIME IN -SINGLE UPDATE

        ////FOR EDIT TIME OUT AND DELETE TIME OUT -SINGLE UPDATE
        //if (s.temp_time_out_am != s.txtb_am_out) {
        //    if (s.txtb_am_out.trim() == "") {
        //        reason_status = 'D2'
        //    }
        //    else {
        //        reason_status = 'E2'
        //    }
        //}
        ////END EDIT TIME OUT AND DELETE TIME OUT -SINGLE UPDATE
    }




})