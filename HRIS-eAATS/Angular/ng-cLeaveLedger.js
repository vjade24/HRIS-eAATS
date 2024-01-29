ng_HRD_App.controller("cLeaveLedger_ctrlr", function ($scope, $compile, $http, $filter) {
    var s = $scope
    var h = $http

    s.dis_when_s = false;
    s.year = [];
    s.user_id = "";
    s.redirect_data = [];
    s.cLV_Ledger_employee_name = [];
    s.temp_leave_ctrlno = "";
    s.ddl_rep_mode = "2"
    s.ddl_report_lv_card = "OLD";

    s.txtb_lates_und_min = 0 + ' min' ;
    s.time_sked_hdr_title = "";
    $('.collapse').collapse()
    s.image_link = "http://192.168.5.218/storage/images/photo/thumb/";
    function init()
    {
        if (window.location.host == "hris.dvodeoro.ph")
        {
            s.image_link = "http://122.53.120.18:8050/storage/images/photo/thumb/"
        }
        RetrieveYear();
        
        $("#ddl_name").select2().on('change', function (e) {
            s.FilterPageGrid($("#ddl_name option:selected").val());
        });

        $("#ddl_dept").select2().on('change', function (e) {
            s.GetEmployeeList();
        });

        $("#ddl_empl_type").select2().on('change', function (e) {
            s.GetEmployeeList();
        });

        $("#ddl_rep_mode").on('change', function (e) {
            s.FilterPageGrid($("#ddl_name option:selected").val());
        });

        $("#txtb_dtr_mon_year").datepicker({
            format: "MM - yyyy",
            startView: "years",
            minViewMode: "months",
            autoclose: true,
        });

        $("#txtb_dtr_mon_year_earn").datepicker({
            format: "MM - yyyy",
            startView: "years",
            minViewMode: "months",
            autoclose: true,
        });

        $("#txtb_dtr_mon_year").on('change', function (e)
        {
            if ($("#ddl_name option:selected").val() == "" || $("#ddl_name option:selected").val().startsWith("?"))
            {
                s.GetEmployeeList();
            }
            s.FilterPageGrid($("#ddl_name option:selected").val().startsWith("?") ? $("#ddl_name option:selected").val().replace('?', '').replace('string:', '').trim().replace(' ?', '') : $("#ddl_name option:selected").val());
        });

        var ddate_from_to = new Date();
        // s.txtb_date_fr = ddate_from_to.getFullYear() + "-01-01";
        s.txtb_date_fr = "2021" + "-01-01";
        s.txtb_date_to = ddate_from_to.getFullYear() + "-12-31";

        $("#txtb_date_fr").on('change', function (e) {
            s.FilterPageGrid($("#ddl_name option:selected").val());
        });

        $("#txtb_date_to").on('change', function (e) {
            s.FilterPageGrid($("#ddl_name option:selected").val());
        });

        $("#txtb_dtr_mon_year_earn").on('change', function (e)
        {
            s.SelectMonYearEarn();
        });

        var ddate = new Date();
        s.txtb_dtr_mon_year = moment(ddate).format("MMMM - YYYY");
        //s.txtb_dtr_mon_year_earn = moment(ddate).format("MMMM - YYYY");

        $('#modal_initializing').modal({ backdrop: 'static', keyboard: false });
        //**********************************************
        // Initialize data during page loads
        //**********************************************
        h.post("../cLeaveLedger/InitializeData").then(function (d)
        {
            if (d.data.message == "success") {
                s.user_id               = d.data.log_user_id;
                s.lv_admin_dept_list    = d.data.lv_admin_dept_list;
                s.lv_empl_lst_wout_jo   = [];
                s.leave_type            = d.data.leave_type_lst;
                s.leave_sub_type        = d.data.leave_subType_lst;
                s.leave_sub_type_dtl    = d.data.leave_subType_lst;
                init_table_data([]);
                init_table_data2([]);
                init_table_data3([]);
                init_table_data4([]);
                
                if (d.data.redirect_data != null)
                {
                    s.ddl_dept = d.data.redirect_data[3];
                    s.GetEmployeeList();
                    s.redirect_data = d.data.redirect_data;
                    s.ddl_rep_mode = d.data.redirect_data[7];
                    $('#click_tab2').click()
                    s.TimeSked_HDR(d.data.redirect_data[1], str_to_year($("#txtb_dtr_mon_year").val()));
                   // s.TimeSked_DTL("","","","");
                    s.txtb_info_empl_id = d.data.redirect_data[1]
                }
                if (d.data.cLV_Ledger_employee_name != null)
                {
                    s.cLV_Ledger_employee_name  = d.data.cLV_Ledger_employee_name;
                    s.txtb_info_empl_name       = d.data.cLV_Ledger_employee_name;
                }

                $("#info_vl_balance").text("0.000");
                $("#info_sl_balance").text("0.000");
                $("#info_sp_balance").text("0.000");
                $("#info_fl_balance").text("0.000");

                s.oTable.fnClearTable();
                s.datalistgrid = d.data.lv_ledger_report;
                if (d.data.lv_ledger_report.length > 0) {
                    s.oTable.fnAddData(d.data.lv_ledger_report);
                    $("#txtb_info_day_of_service").val(d.data.lv_ledger_report[0].day_of_service);
                }

                s.oTable2.fnClearTable();
                s.datalistgrid2 = d.data.lv_unposted;
                if (d.data.lv_unposted.length > 0) {
                    s.oTable2.fnAddData(d.data.lv_unposted);
                }

                s.oTable3.fnClearTable();
                s.datalistgrid3 = d.data.lv_posted;
                if (d.data.lv_posted.length > 0) {
                    s.oTable3.fnAddData(d.data.lv_posted);
                }

                //**********************************************
                //  Balance as of - All 
                //**********************************************
                s.lst_all_bal = d.data.data_all_bal
                for (var i = 0; i < d.data.data_all_bal.length; i++)
                {
                    if (parseFloat(d.data.data_all_bal[i].leaveledger_balance_current) <= 0)
                    {
                        d.data.data_all_bal[i].balance_color = "btn btn-danger btn-rounded pull-right";
                    }
                    else
                    {
                        d.data.data_all_bal[i].balance_color = "btn btn-primary btn-rounded pull-right";
                    }
                }

                //**********************************************
                //**********************************************

                $("#modal_initializing").modal("hide");
            }
            else
            {
                swal(d.data.message, { icon: "warning", });
                $("#modal_initializing").modal("hide");
            }
            
        });
    }
    init()

    var init_table_data = function (par_data) {
        try {
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
                            "width": "10%",
                            "targets": 0,
                            "mData": "leaveledger_period",
                            "mRender": function (data, type, full, row)
                            {
                                var status_descr_color = "";
                                var status_descr_text = "";
                                if (full["approval_status"] == "F")
                                {
                                    status_descr_color = "text-success";
                                    status_descr_text = "POSTED";
                                }
                                else
                                {
                                    status_descr_color = "text-danger";
                                    status_descr_text = "NOT POSTED";
                                }

                                if (full["approval_status"] == "C" || full["approval_status"] == "D")
                                {
                                    var status_descr = "";
                                    

                                    if (full["approval_status"] == "C")
                                    {
                                        status_descr = "Cancel Pending";
                                    }
                                    else
                                    {
                                        status_descr = "Disapproved";
                                    }


                                    return "<span class='text-center btn-block text-danger'><span class='label label-danger'> " + status_descr +"</span> " + data + "</span>";
                                }
                                else
                                { 
                                    return " <span class='text-left btn-block' data-toggle='tooltip' data-placement='' title='" + status_descr_text +"'><i  class='" + status_descr_color + " fa fa-circle pull-left'></i>" + data + "</span>";
                                }
                            }
                        },
                        {
                            "width": "10%",
                            "targets": 1,
                            "mData": "leavetype_str",
                            "mRender": function (data, type, full, row)
                            {
                                if (full["approval_status"] == "C" || full["approval_status"] == "D")
                                {
                                    return "<span class='text-center btn-block text-danger' >" + data + "</span>";
                                }
                                else
                                {
                                    return "<span class='text-center btn-block' >" + data + "</span>";
                                }

                                //if (full["leavetype_str"] == "Solo Parent Leave" ||
                                //    full["leavetype_code"] == "PS")
                                //{
                                //    return "<small><span class='text-center btn-block' >" + data +"</span></small>";
                                //}
                                //else
                                //{
                                //    return "<span class='text-center btn-block' >" + data + "</span>";
                                //}

                            }
                        },
                        {
                            "width": "8%",
                            "targets": 2,
                            "mData": "vl_earned",
                            "mRender": function (data, type, full, row)
                            {
                                if (full["vl_earned"] == "0.000")
                                {
                                    data = "";
                                }

                                if (full["approval_status"] == "C" || full["approval_status"] == "D")
                                {
                                    return "<span class='text-center btn-block text-danger' >" + data + "</span>";
                                }
                                else
                                {
                                    return "<span class='text-center btn-block' >" + data + "</span>";
                                }

                            }
                        },
                        {
                            "width": "8%",
                            "targets": 3,
                            "mData": "vl_wp",
                            "mRender": function (data, type, full, row)
                            {
                                if (full["vl_wp"] == "0.000") {
                                    data = "";
                                }
                                if (full["approval_status"] == "C" || full["approval_status"] == "D")
                                {
                                    return "<span class='text-center btn-block text-danger' >" + data + "</span>";
                                }
                                else
                                {
                                    return "<span class='text-center btn-block' >" + data + "</span>";
                                }
                            }
                        },
                        {
                            "width": "8%",
                            "targets": 4,
                            "mData": "vl_bal",
                            "mRender": function (data, type, full, row)
                            {
                                if (full["vl_bal"] == "0.000") {
                                    data = "";
                                }
                                if (full["approval_status"] == "C" || full["approval_status"] == "D")
                                {
                                    return "<span class='text-center btn-block text-danger' >" + data + "</span>";
                                }
                                else
                                {
                                    return "<span class='text-center btn-block' >" + data + "</span>";
                                }
                            }
                        },
                        {
                            "width": "8%",
                            "targets": 5,
                            "mData": "vl_wop",
                            "mRender": function (data, type, full, row)
                            {
                                if (full["vl_wop"] == "0.000") {
                                    data = "";
                                }
                                if (full["approval_status"] == "C" || full["approval_status"] == "D")
                                {
                                    return "<span class='text-center btn-block text-danger' >" + data + "</span>";
                                }
                                else
                                {
                                    return "<span class='text-center btn-block' >" + data + "</span>";
                                }
                            }
                        },
                        {
                            "width": "8%",
                            "targets": 6,
                            "mData": "sl_earned",
                            "mRender": function (data, type, full, row)
                            {
                                if (full["sl_earned"] == "0.000") {
                                    data = "";
                                }
                                if (full["approval_status"] == "C" || full["approval_status"] == "D")
                                {
                                    return "<span class='text-center btn-block text-danger' >" + data + "</span>";
                                }
                                else
                                {
                                    return "<span class='text-center btn-block' >" + data + "</span>";
                                }
                            }
                        },
                        {
                            "width": "8%",
                            "targets": 7,
                            "mData": "sl_wp",
                            "mRender": function (data, type, full, row)
                            {
                                if (full["sl_wp"] == "0.000") {
                                    data = "";
                                }
                                if (full["approval_status"] == "C" || full["approval_status"] == "D")
                                {
                                    return "<span class='text-center btn-block text-danger' >" + data + "</span>";
                                }
                                else
                                {
                                    return "<span class='text-center btn-block' >" + data + "</span>";
                                }
                            }
                        },
                        {
                            "width": "8%",
                            "targets": 8,
                            "mData": "sl_bal",
                            "mRender": function (data, type, full, row)
                            {
                                if (full["sl_bal"] == "0.000") {
                                    data = "";
                                }
                                if (full["approval_status"] == "C" || full["approval_status"] == "D")
                                {
                                    return "<span class='text-center btn-block text-danger' >" + data + "</span>";
                                }
                                else
                                {
                                    return "<span class='text-center btn-block' >" + data + "</span>";
                                }
                            }
                        },
                        {
                            "width": "8%",
                            "targets": 9,
                            "mData": "sl_wop",
                            "mRender": function (data, type, full, row) {
                                if (full["sl_wop"] == "0.000") {
                                    data = "";
                                }
                                if (full["approval_status"] == "C" || full["approval_status"] == "D")
                                {
                                    return "<span class='text-center btn-block text-danger' >" + data + "</span>";
                                }
                                else
                                {
                                    return "<span class='text-center btn-block' >" + data + "</span>";
                                }
                            }
                        },
                        {
                            "width": "8%",
                            "targets": 9,
                            "mData": "appl_status",
                            "mRender": function (data, type, full, row)
                            {
                                return "<span class='badge badge-primary' >" + data + "</span>";
                                
                            }
                        },
                        {
                            "width": "16%",
                            "targets": 10,
                            "mData": null,
                            "mRender": function (data, type, full, row)
                            {
                                //var dis_print = true;
                                //if (full["leaveledger_entry_type"] == "2")
                                //{
                                //    dis_print = false;
                                //}

                                return '<center><div class="btn-group">' +
                                    '<button type="button" class="btn btn-info btn-xs"     ng-click="btn_edit(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Edit">  <i class="fa fa-edit"></i></button >' +
                                    '<button type="button" class="btn btn-danger btn-xs"   ng-click="btn_delete(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Delete"><i class="fa fa-trash"></i></button>' +
                                    '<button type="button" class="btn btn-primary btn-xs"  ng-click="btn_print_leave_app(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Print Application for Leave/CTO Form"><i class="fa fa-print"></i></button>' +
                                    // 2023-06-22 = Getanggal sa nako kay naay case na ma restore nila na walay cancellation
                                    //'<button type="button" class="btn btn-warning btn-xs"  ng-click="btn_cancel_posting(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Cancel Posted Record"><i class="fa fa-refresh"></i></button>' +
                                    '</div></center>';
                            }
                        }
                    ],
                    "createdRow": function (row, data, index) {
                        $compile(row)($scope);  //add this to compile the DOM
                    },

                });
        }
        catch (err) {
            swal({ icon: "warning", title: err.message });
        }

    }

    var init_table_data2 = function (par_data) {
        try {
            s.datalistgrid2 = par_data;
            s.oTable2 = $('#datalist_grid2').dataTable(
                {
                    data: s.datalistgrid2,
                    bSort: false,
                    bAutoWidth: false,
                    sDom: 'rt<"bottom">',
                    paging: false,
                    columns: [
                        {
                            "width": "20%",
                            "targets": 0,
                            "mData": "created_date_only",
                            "mRender": function (data, type, full, row)
                            {
                                return "<span class='text-center btn-block'>" + data + "</span>"
                            }
                        },
                        {
                            "width": "20%",
                            "targets": 1,
                            "mData": "leave_type_code",
                            "mRender": function (data, type, full, row) {
                                return "<span class='text-center btn-block'>" + data + "</span>"
                            }
                        },
                        {
                            "width": "40%",
                            "targets": 2,
                            "mData": "inclusive_dates",
                            "mRender": function (data, type, full, row) {
                                return "<span class='text-center btn-block'>" + data + "</span>"
                            }
                        },
                        {
                            "width": "20%",
                            "targets": 3,
                            "mData": null,
                            "mRender": function (data, type, full, row)
                            {
                                var disapproved = '';
                                if (full["disapproved_remakrs"].toString().trim() != "") {
                                    disapproved = '<span class="badge badge-danger">' + full["disapproved_remakrs"] + '</span>';
                                }

                                var with_justi = false
                                if (full["justification_flag"] == true)
                                {
                                    with_justi = true
                                }
                                else
                                {
                                    with_justi = false
                                }

                                return '<center><div class="btn-group">' +
                                    '<button type="button" class="btn btn-warning btn-xs" ng-click="btn_post(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Review & Post to Ledger">  Review & Post to Ledger ' + disapproved+'</button >' +
                                    '<button type="button" ng-show="' + with_justi + '" class="btn btn-primary btn-xs" ng-click=\'btn_print_ledger("justification",' + row["row"] + ')\' data-toggle="tooltip" data-placement="top" title="View Justification">  View Justification </button >' +
                                    '</div></center>';
                            }
                        }
                    ],
                    "createdRow": function (row, data, index) {
                        $compile(row)($scope);  //add this to compile the DOM
                    },

                });
        }
        catch (err) {
            swal({ icon: "warning", title: err.message });
        }

    }

    var init_table_data3 = function (par_data) {
        try {
            s.datalistgrid3 = par_data;
            s.oTable3 = $('#datalist_grid3').dataTable(
                {
                    data: s.datalistgrid3,
                    bSort: false,
                    bAutoWidth: false,
                    sDom: 'rt<"bottom">',
                    paging: false,
                    columns: [
                        {
                            "width": "20%",
                            "targets": 0,
                            "mData": "created_date_only",
                            "mRender": function (data, type, full, row) {
                                return "<span class='text-center btn-block'>" + data + "</span>"
                            }
                        },
                        {
                            "width": "20%",
                            "targets": 1,
                            "mData": "leave_type_code",
                            "mRender": function (data, type, full, row) {
                                return "<span class='text-center btn-block'>" + data + "</span>"
                            }
                        },
                        {
                            "width": "40%",
                            "targets": 2,
                            "mData": "inclusive_dates",
                            "mRender": function (data, type, full, row) {
                                return "<span class='text-center btn-block'>" + data + "</span>"
                            }
                        },
                        {
                            "width": "20%",
                            "targets": 3,
                            "mData": null,
                            "mRender": function (data, type, full, row) {

                                return '<center><div class="btn-group">' +
                                    '<button type="button" class="btn btn-primary btn-xs" ng-click="btn_print_leave_app_posted(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Print Application for Leave/CTO"><i class="fa fa-print"></i></button>' +
                                    '</div></center>';
                            }
                        }
                    ],
                    "createdRow": function (row, data, index) {
                        $compile(row)($scope);  //add this to compile the DOM
                    },

                });
        }
        catch (err) {
            swal({ icon: "warning", title: err.message });
        }
    }

    var init_table_data4 = function (par_data) {
        try {
            s.datalistgrid4 = par_data;
            s.oTable4 = $('#datalist_grid4').dataTable(
                {
                    data: s.datalistgrid4,
                    bSort: false,
                    bAutoWidth: false,
                    sDom: 'rt<"bottom">',
                    paging: false,
                    columns: [
                        {
                            "mData": "leavetype_code",
                            "mRender": function (data, type, full, row) {
                                return "<span class='text-center btn-block'>" + data + "</span>"
                            }
                        },
                        {
                            "mData": "leavesubtype_code",
                            "mRender": function (data, type, full, row) {
                                return "<span class='text-center btn-block'>" + data + "</span>"
                            }
                        },
                        {
                            "mData": "leaveledger_balance_as_of",
                            "mRender": function (data, type, full, row) {
                                return "<span class='text-center btn-block'>" + data + "</span>"
                            }
                        },
                        {
                            "mData": "leaveledger_restore_deduct",
                            "mRender": function (data, type, full, row) {
                                return "<span class='text-center btn-block'>" + data + "</span>"
                            }
                        },
                        {
                            "mData": "leaveledger_abs_und_wp",
                            "mRender": function (data, type, full, row) {
                                return "<span class='text-center btn-block'>" + data + "</span>"
                            }
                        },
                        {
                            "mData": "leaveledger_abs_und_wop",
                            "mRender": function (data, type, full, row) {
                                return "<span class='text-center btn-block'>" + data + "</span>"
                            }
                        },
                        {
                            "mData": null,
                            "mRender": function (data, type, full, row) {

                                return '<center><div class="btn-group">' +
                                    '<button type="button" class="btn btn-info btn-xs"   ng-click="btn_edit_bal(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Edit">  <i class="fa fa-edit"></i></button >' +
                                    '<button type="button" class="btn btn-danger btn-xs" ng-show="false" ng-click="btn_delete_bal(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Delete">  <i class="fa fa-trash"></i></button >' +
                                    '</div></center>';
                            }
                        }
                    ],
                    "createdRow": function (row, data, index) {
                        $compile(row)($scope);  //add this to compile the DOM
                    },

                });
        }
        catch (err) {
            swal({ icon: "warning", title: err.message });
        }
    }
    //**********************************************
    // Refresh Employee List in Dropdown
    //**********************************************
    s.GetEmployeeList = function ()
    {
        //$('#modal_initializing').modal({ backdrop: 'static', keyboard: false });

        h.post("../cLeaveLedger/GetEmployeeList", {
            par_department_code     : $("#ddl_dept option:selected").val() == "" ? s.ddl_dept : $("#ddl_dept option:selected").val()
            , par_employment_type   : $("#ddl_empl_type option:selected").val()
            , par_year              : str_to_year($("#txtb_dtr_mon_year").val())
            , par_month             : month_name_to_int($("#txtb_dtr_mon_year").val())

        }).then(function (d) {
            if (d.data.message == "success")
            {
                s.lv_empl_lst_wout_jo = d.data.lv_empl_lst_wout_jo;
                
                if (s.redirect_data != null || s.redirect_data.length > 0)
                {
                    s.ddl_name = s.redirect_data[1];
                    //s.FilterPageGrid();
                }
                if ($("#ddl_dept option:selected").val() != "" &&
                    $("#ddl_name option:selected").val() != "") {
                    //s.FilterPageGrid();
                }
                //$("#modal_initializing").modal("hide")
            }
            else
            {
                swal(d.data.message, { icon: "warning", });
               // $("#modal_initializing").modal("hide")
            }

        });
    }
    //**********************************************
    // Refresh Employee Information
    //**********************************************
    s.FilterPageGrid = function (empl_id)
    {
        $("#txtb_info_empl_id").val($("#ddl_name option:selected").val() == "" ? s.redirect_data[1] : $("#ddl_name option:selected").val());
        $("#txtb_info_empl_name").val($("#ddl_name option:selected").val() == ""  ? s.cLV_Ledger_employee_name : $("#ddl_name option:selected").html().split('-')[1]);
        $("#txtb_info_department").val($("#ddl_dept option:selected").html());
        $("#txtb_info_day_of_service").val("");

        if ($("#ddl_name option:selected").val() != "")
        {
            $('#modal_initializing').modal({ backdrop: 'static', keyboard: false });
        }
        
        h.post("../cLeaveLedger/FilterPageGrid", {
             par_empl_id         : empl_id // $("#ddl_name option:selected").val() == "" ? "" : $("#ddl_name option:selected").val()
            ,par_year            : str_to_year($("#txtb_dtr_mon_year").val())
            ,par_month           : month_name_to_int($("#txtb_dtr_mon_year").val())
            ,par_department_code : $("#ddl_dept option:selected").val() == "" ? s.ddl_dept : $("#ddl_dept option:selected").val()
            ,par_employment_type : $("#ddl_empl_type option:selected").val()
            ,p_date_fr           : $("#txtb_date_fr").val()
            ,p_date_to           : $("#txtb_date_to").val()
            ,p_rep_mode          : $("#ddl_rep_mode").val()
        }).then(function (d) {
            if (d.data.message == "success")
            {
                // ***********************************************************************************
                // ********** 2021-07-05 : VJA - Condition the Lates/Undertime ***********************
                // ***********************************************************************************
                s.txtb_lates_und_min = 0 + ' min';
                var undertime        = d.data.total_undertime[0].total_underTime;
                var undertime_hrs    = 0;
                var undertime_min    = 0;
                undertime_hrs        = parseInt(undertime / 60) 
                undertime_min        = undertime - (undertime_hrs * 60)
                
                if (undertime >= 60)
                {
                    if (undertime_min == 0)
                    {
                        s.txtb_lates_und_min = undertime_hrs + " hr/s " ;
                    }
                    else if (undertime_hrs == 0)
                    {
                        s.txtb_lates_und_min = undertime_min == null || undertime_min == 0 ? 0 + ' min' : undertime_min + ' min/s';
                    }
                    else
                    {
                        s.txtb_lates_und_min = undertime_hrs + " hr/s " + undertime_min + " min/s";
                    }
                }
                else
                {
                    s.txtb_lates_und_min = undertime_min == null || undertime_min == 0 ? 0 + ' min' : undertime_min + ' min/s';
                }
                // ***********************************************************************************
                // ***********************************************************************************

                s.oTable.fnClearTable();
                s.datalistgrid = d.data.lv_ledger_report;
                if (d.data.lv_ledger_report.length > 0) {
                    s.oTable.fnAddData(d.data.lv_ledger_report);
                    $("#txtb_info_day_of_service").val(d.data.lv_ledger_report[0].day_of_service);
                }

                s.oTable2.fnClearTable();
                s.datalistgrid2 = d.data.lv_unposted;
                if (d.data.lv_unposted.length > 0) {
                    s.oTable2.fnAddData(d.data.lv_unposted);
                }

                s.oTable3.fnClearTable();
                s.datalistgrid3 = d.data.lv_posted;
                if (d.data.lv_posted.length > 0) {
                    s.oTable3.fnAddData(d.data.lv_posted);
                }

                $("#info_vl_balance").text(d.data.leavetype_balances[0].leaveledger_balance_as_of_vl);
                $("#info_sl_balance").text(d.data.leavetype_balances[0].leaveledger_balance_as_of_sl);
                $("#info_sp_balance").text(d.data.leavetype_balances[0].leaveledger_balance_as_of_sp);
                $("#info_fl_balance").text(d.data.leavetype_balances[0].leaveledger_balance_as_of_fl);

                //**********************************************
                //  Balance as of - All 
                //**********************************************
                s.lst_all_bal = d.data.data_all_bal
                for (var i = 0; i < d.data.data_all_bal.length; i++)
                {
                    if (parseFloat(d.data.data_all_bal[i].leaveledger_balance_current) <= 0)
                    {
                        d.data.data_all_bal[i].balance_color = "btn btn-danger btn-rounded pull-right";
                    }
                    else
                    {
                        d.data.data_all_bal[i].balance_color = "btn btn-primary btn-rounded pull-right";
                    }
                }
                s.TimeSked_HDR($("#ddl_name option:selected").val() == "" ? "" : $("#ddl_name option:selected").val(), str_to_year($("#txtb_dtr_mon_year").val()));
                $('#modal_initializing').modal("hide");
                //**********************************************
                //**********************************************
                s.RefreshDTR_PrintOnly();
            }
            else
            {
                swal(d.data.message, { icon: "warning", });
                $('#modal_initializing').modal("hide");
            }

        });
    }
    //***********************************************************//
    //*** VJA -  2021-06-03 - Button for Refresh DTR
    //***********************************************************//
    s.RefreshDTR = function (print_generate)
    {
       
        try
        {
            if (ValidateFields())
            {
                $('#modal_initializing').modal({ backdrop: 'static', keyboard: false });

                var params_month = "";
                if (parseFloat(month_name_to_int($("#txtb_dtr_mon_year").val())) < 10)
                {
                    params_month = "0" + month_name_to_int($("#txtb_dtr_mon_year").val())
                }
                else
                {
                    params_month = month_name_to_int($("#txtb_dtr_mon_year").val())
                }
                
                var par_year            = str_to_year($("#txtb_dtr_mon_year").val());
                var par_mons            = params_month;
                var par_empl_id         = $("#ddl_name option:selected").val();
                var par_viewtype        = "0";
                var par_department_code = $("#ddl_dept option:selected").val();
                var par_user_id         = s.user_id;

                var employementtype = s.lv_empl_lst_wout_jo.filter(function (d) {
                    return d.empl_id == par_empl_id
                })[0].employment_type;


                var controller          = "Reports"
                var action              = "Index"
                var ReportName          = "CrystalReport"
                var SaveName            = "Crystal_Report"
                var ReportType          = "inline"
                var ReportPath          = ""
                var sp                  = ""

                h.post("../cLeaveLedger/sp_generateDTR",
                {
                     dtr_year           : par_year
                    ,dtr_month          : par_mons
                    ,empl_id            : par_empl_id
                    ,employment_type    : employementtype
                    ,department_code    : par_department_code
                    ,user_id            : par_user_id
                    ,par_print_generate : print_generate
                  
                }).then(function (d)
                {

                    if (d.data.icon == "success" )
                    {
                        ReportPath = "~/Reports/cryDTR/cryDTR.rpt";
                        sp = "sp_dtr_rep,par_year," + par_year +
                            ",par_month," + par_mons +
                            ",par_empl_id," + par_empl_id +
                            ",par_view_type," + par_viewtype +
                            ",par_department_code," + par_department_code +
                            ",par_user_id," + par_user_id;
                        
                        if (d.data.dtr_gen.length > 0 || print_generate == "")
                        {
                            // *******************************************************
                            // *** VJA : 2021-07-14 - Validation and Loading hide ****
                            // *******************************************************
                            $("#modal_initializing").modal({ keyboard: false, backdrop: "static" })
                            var iframe = document.getElementById('iframe_print_preview4');
                            var iframe_page = $("#iframe_print_preview4")[0];
                            iframe.style.visibility = "hidden";

                            s.embed_link = "../Reports/CrystalViewer.aspx?Params=" + ""
                                + "&ReportName=" + ReportName
                                + "&SaveName=" + SaveName
                                + "&ReportType=" + ReportType
                                + "&ReportPath=" + ReportPath
                                + "&id=" + sp // + "," + parameters

                            if (!/*@cc_on!@*/0) { //if not IE
                                iframe.onload = function () {
                                    iframe.style.visibility = "visible";
                                    $("#modal_initializing").modal("hide")
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
                                        $("#modal_initializing").modal("hide")
                                    }
                                };
                            }

                            iframe.src = s.embed_link;
                            // *******************************************************
                            // *******************************************************

                        }
                        else
                        {
                            $('#generate').attr("disabled", false);
                            s.contact_personnel = ""
                            s.flag_message      = ""
                            if (d.data.checkShiftFlag[0].user_submitted.trim() != "") {
                                s.contact_personnel = d.data.checkShiftFlag[0].user_submitted
                                s.flag_message = "recall the submission of "
                            }

                            if (d.data.checkShiftFlag[0].user_hr_rcvd.trim() != "") {
                                s.contact_personnel = d.data.checkShiftFlag[0].user_hr_rcvd
                                s.flag_message = "disapprove"
                            }

                            if (d.data.checkShiftFlag[0].user_payroll_rcvd.trim() != "") {
                                s.contact_personnel = d.data.checkShiftFlag[0].user_payroll_rcvd
                                s.flag_message = "disapprove"
                                
                            }
                                
                            if (d.data.checkShiftFlag[0].user_payroll_appr.trim() != ""){
                                s.contact_personnel = d.data.checkShiftFlag[0].user_payroll_appr
                                s.flag_message = "disapprove"
                                 
                            }


                            if (s.contact_personnel.trim() == "")
                            {
                                s.contact_personnel = "HRIS Team"
                                s.flag_message = "disapprove"
                            }
                            
                            swal("YOU CAN NO LONGER GENERATE THIS DTR, Print Only instead.", "This document has been transmitted already or DTR is locked \n \n" + "Please contact " + s.contact_personnel + " to " + s.flag_message + " this transmittal.", { icon: "warning" });
                            $("#modal_initializing").modal("hide")
                            $('#generate').removeAttr("disabled");
                        }

                    }
                    else
                    {
                        swal(d.data.message, { icon: d.data.icon })
                        $("#modal_initializing").modal("hide")
                    }
                    
               })


              
            }
        }
        catch (err)
        {
            $("#modal_initializing").modal("hide")
            swal({ icon: "warning", title: err.message });

        }
    }
    
    //***********************************************************//
    //*** VJA -  2021-06-03 - Button for Add Modal Page
    //***********************************************************//
    s.btn_add_modal = function ()
    {
        $('#tab_1_click').click();
        $("#history").html("");
        s.show_save_edit_btn = true;
        s.no_action_posted   = true;
        ValidationResultColor("ALL", false);
        clear_entry();
        s.add_modal_descr   = "Add New Record";
        s.ADDEDITMODE       = "ADD";
        s.isEdit            = false;   
        s.data_history = [];
        //**********************************************
        //  Set Description or Label for Number of ---
        //**********************************************
        s.lbl_nbr_days_hrs = "No. of Days:";
        if (s.ddl_leave_type == "CTO" ||
            s.ddl_rep_mode == "3") // CTO Card Viewing
        {
            s.lbl_nbr_days_hrs = "No. of Hours:";
        }
        //**********************************************
        //**********************************************
        
        if (ValidateFields())
        {
            //$('#modal_initializing').modal({ backdrop: 'static', keyboard: false });

            h.post("../cLeaveLedger/GetLedgerConrtolNumber").then(function (d) {
                if (d.data.message == "success")
                {
                    s.Populate_Particulars();
                    s.txtb_ledger_ctrl_no = d.data.new_appl_nbr
                    //$('#modal_initializing').modal("hide");

                }
                else
                {
                    swal(d.data.message, { icon: "warning", });
                }
                //s.txtb_empl_name = $("#ddl_name option:selected").html().split('-')[1];
                s.txtb_empl_name = $("#ddl_name option:selected").html().substring(6, $("#ddl_name option:selected").html().length);
                s.SelectEntryType();
                $('#main_modal').modal({ backdrop: 'static', keyboard: false });
            });
        }
    }
    //***********************************************************//
    //*** VJA -  2021-06-03 - Button for Edit Action
    //***********************************************************//
    s.btn_edit = function (row_id,btn_mode) 
    {
        $('#tab_1_click').click();

        s.show_save_edit_btn = true;
        s.no_action_posted   = true;
        s.data_history = [];
         $("#history").html("");
        if (s.datalistgrid[row_id].ledger_ctrl_no == '' || s.datalistgrid[row_id].ledger_ctrl_no == null)
        {
            swal("No Data Found","No Header and Details save on table", { icon: "warning", });
        }
        else if (s.datalistgrid[row_id].leaveledger_entry_type == 'T')
        {
            swal("You cannot Edit, Delete, Print and Cancel Posted", "Data already Disapproved or Cancelled", { icon: "warning", });
        }
        else
        {
            clear_entry();

            s.add_modal_descr = "Edit Existing Record";
            s.ADDEDITMODE     = "EDIT";
            s.isEdit          = true;

            if (s.datalistgrid[row_id].approval_status == "C" ||
                s.datalistgrid[row_id].approval_status == "D")
            {
                s.add_modal_descr = "Repost Existing Record";
                s.ADDEDITMODE     = "REPOST";
                s.isrepost        = true;
            }
            if (s.datalistgrid[row_id].approval_status == "F")
            {
                s.no_action_posted = false;
            }


            s.txtb_ledger_ctrl_no   = s.datalistgrid[row_id].ledger_ctrl_no;
            s.txtb_empl_name        = $("#ddl_name option:selected").html().substring(6, $("#ddl_name option:selected").html().length);
            s.txtb_empl_id          = s.datalistgrid[row_id].empl_id;
            s.txtb_period           = s.datalistgrid[row_id].leaveledger_period;
            s.ddl_leave_type        = s.datalistgrid[row_id].leavetype_code;
            s.ddl_leave_sub_type    = s.datalistgrid[row_id].leavesubtype_code;
            s.txtb_particulars      = s.datalistgrid[row_id].leaveledger_particulars;
            s.ddl_entry_type        = s.datalistgrid[row_id].leaveledger_entry_type;
            s.txtb_signame3_ovrd    = s.datalistgrid[row_id].sig_name3_ovrd;
            s.txtb_sigpos3_ovrd     = s.datalistgrid[row_id].sig_pos3_ovrd;
            s.txtb_ledger_date      = s.datalistgrid[row_id].leaveledger_date;
            s.txtb_date_applied     = s.datalistgrid[row_id].date_applied;
            s.txtb_details_remarks  = s.datalistgrid[row_id].details_remarks;
            s.txtb_leave_ctrlno     = s.datalistgrid[row_id].leave_ctrlno
            s.txtb_approval_id      = s.datalistgrid[row_id].approval_id

            s.txtb_lwop_date        = s.datalistgrid[row_id].lwop_date
            s.txtb_lwop_body_1      = s.datalistgrid[row_id].lwop_body_1
            s.txtb_lwop_body_2      = s.datalistgrid[row_id].lwop_body_2

            s.GetLedgerDetails();
            s.SelectEntryType();
            s.SelectLeaveType();
            s.ToogleBy_LeaveType();
            //s.Populate_ApprovalHistory();

            setTimeout(function ()
            {
                h.post("../cLeaveLedger/GetSumofLeaveDetails",
                {
                 par_ledger_ctrl_no  : s.datalistgrid[row_id].ledger_ctrl_no   
                ,par_leavetype_code  : s.datalistgrid[row_id].leavetype_code
                ,par_empl_id         : s.txtb_empl_id 
                ,par_year            : str_to_year($("#txtb_dtr_mon_year").val())
                }).then(function (d)
                {
                    s.txtb_no_of_days           = d.data.sum_wp_and_wop;
                    s.txtb_balance_as_of_hdr    = d.data.dtl_value.leaveledger_balance_as_of
                    s.txtb_restore_deduct_hdr   = d.data.dtl_value.leaveledger_restore_deduct
                    s.txtb_abs_und_wp_hdr       = d.data.dtl_value.leaveledger_abs_und_wp
                    s.txtb_abs_und_wop_hdr      = d.data.dtl_value.leaveledger_abs_und_wop

                    $('#modal_initializing').modal("hide");
                })

            },2000)

            //**********************************************
            //  Set Description or Label for Number of ---
            //**********************************************
            s.lbl_nbr_days_hrs = "No. of Days:";
            if (s.ddl_leave_type == "CTO" ||
                s.ddl_rep_mode   == "3") // CTO Card Viewing
            {
                s.lbl_nbr_days_hrs = "No. of Hours:";
            }
            //**********************************************
            //**********************************************

            var p_empl_id = s.datalistgrid[row_id].empl_id
            var p_date_fr = $("#txtb_date_fr").val()
            var p_date_to = $("#txtb_date_to").val()
            var p_report_type = "LEAVE";
            var par_rep_mode = "2";
            if (s.datalistgrid[row_id].leavetype_code == "CTO")
            {
                p_report_type = "CTO";
                par_rep_mode = "3";
            }
            var par_iframe_id = "iframe_print_preview_carding_review"
            s.RetrieveCardingReport(p_empl_id, p_date_fr, p_date_to, par_rep_mode, p_report_type, par_iframe_id)

            $('#main_modal').modal({ backdrop: 'static', keyboard: false })
            
        }
    }

    //***********************************************************//
    //*** VJA -  2021-06-03 - Button for Post Ledger
    //***********************************************************//
    s.btn_post = function (row_id) 
    {
        $("#history").html("");
        //$('#modal_initializing').modal({ backdrop: 'static', keyboard: false });
        s.ADDEDITMODE           = "POST"
        s.show_save_edit_btn = false;
        s.no_action_posted = true;
        s.add_modal_descr       = "Post Leave Application";
        clear_entry();
        s.isEdit = true;
        s.dis_leave_ctrlno = true;
        s.data_history = [];
        s.txtb_ledger_ctrl_no   = s.datalistgrid2[row_id].ledger_ctrl_no;
        s.txtb_empl_name        = s.datalistgrid2[row_id].employee_name;
        s.txtb_empl_id          = s.datalistgrid2[row_id].empl_id;
        s.txtb_period           = s.datalistgrid2[row_id].inclusive_dates;
        s.ddl_leave_type        = s.datalistgrid2[row_id].leave_type_code;
        s.ddl_leave_sub_type    = s.datalistgrid2[row_id].leave_subtype_code;
        s.txtb_particulars      = s.datalistgrid2[row_id].number_of_days + "-0-0";
        s.ddl_entry_type        = "2";
        s.txtb_signame3_ovrd    = "";
        s.txtb_sigpos3_ovrd     = "";
        s.txtb_date_applied     = s.datalistgrid2[row_id].date_applied;
        s.txtb_no_of_days       = s.datalistgrid2[row_id].number_of_days;
        s.temp_leave_ctrlno     = s.datalistgrid2[row_id].leave_ctrlno
        s.txtb_leave_ctrlno     = s.datalistgrid2[row_id].leave_ctrlno
        s.txtb_details_remarks  = s.datalistgrid2[row_id].details_remarks;
        s.txtb_approval_id      = s.datalistgrid2[row_id].approval_id

        s.txtb_lwop_date        = s.datalistgrid2[row_id].lwop_date
        s.txtb_lwop_body_1      = s.datalistgrid2[row_id].lwop_body_1
        s.txtb_lwop_body_2      = s.datalistgrid2[row_id].lwop_body_2

        s.txtb_specify          = s.datalistgrid2[row_id].leave_descr
        s.datalistgrid2[row_id].leave_class == true ? $("#x1").prop("checked", true) : $("#x0").prop("checked", true);
        if ($("#x1").prop("checked"))
        {
            $("#x0").closest('div').removeClass('checked');
            $("#x1").closest('div').removeClass('checked');
            $("#x1").closest('div').addClass('checked');
        }
        if ($("#x0").prop("checked"))
        {
            $("#x0").closest('div').removeClass('checked');
            $("#x1").closest('div').removeClass('checked');
            $("#x0").closest('div').addClass('checked');
        }
        // s.GetLedgerDetails();
        s.SelectEntryType();
        s.SelectLeaveType();
        //s.ToogleBy_LeaveType();
        //s.Populate_ApprovalHistory();
        
        //setTimeout(function ()
        //{
            h.post("../cLeaveLedger/GetSumofLeaveDetails",
            {
                par_ledger_ctrl_no   : s.datalistgrid2[row_id].ledger_ctrl_no   
                , par_leavetype_code : s.datalistgrid2[row_id].leave_type_code
                ,par_empl_id         : s.txtb_empl_id 
                ,par_year            : str_to_year($("#txtb_dtr_mon_year").val())

            }).then(function (d)
            {
                s.txtb_balance_as_of_hdr = d.data.data.leaveledger_balance_current;
            })
            //$('#modal_initializing').modal("hide");

       // }, 2000)

        //**********************************************
        //  Set Description or Label for Number of ---
        //**********************************************
        s.lbl_nbr_days_hrs = "No. of Days:";
        if (s.ddl_leave_type == "CTO" ||
            s.ddl_rep_mode == "3") // CTO Card Viewing
        {
            s.lbl_nbr_days_hrs = "No. of Hours:";
        }
        //**********************************************
        //**********************************************

        //s.openJustification()

        // **************************************************************************
        // *** Display the Radio button, checkboxes for Sick leave and Vacatio Leave
        // **************************************************************************
        if (s.datalistgrid2[row_id].leave_type_code == "SL") {
            $('#slvl_radio0').removeClass('sl-vl-radio-display-none');
            $('#slvl_radio1').removeClass('sl-vl-radio-display-none');
            $('#txtb_specify_div').removeClass('sl-vl-radio-display-none');
            $('#slvl_radio0_text').html('Out Patient');
            $('#slvl_radio1_text').html('In Hospital');
        }
        else if (s.datalistgrid2[row_id].leave_type_code == "VL") {
            $('#slvl_radio0').removeClass('sl-vl-radio-display-none');
            $('#slvl_radio1').removeClass('sl-vl-radio-display-none');
            $('#txtb_specify_div').removeClass('sl-vl-radio-display-none');
            $('#slvl_radio0_text').html('Within Philippines');
            $('#slvl_radio1_text').html('Abroad');
            console.log($('#slvl_radio1_text'))
        }
        // ************************************************************** 
        else if (s.datalistgrid2[row_id].leave_type_code == "FL" || s.datalistgrid2[row_id].leave_type_code == "SP") {
            $('#slvl_radio0').removeClass('sl-vl-radio-display-none');
            $('#slvl_radio1').removeClass('sl-vl-radio-display-none');
            $('#txtb_specify_div').removeClass('sl-vl-radio-display-none');
            $('#slvl_radio0_text').html('Within Philippines');
            $('#slvl_radio1_text').html('Abroad');
        }
        // ************************************************************** 
        else {
            $('#slvl_radio0').addClass('sl-vl-radio-display-none');
            $('#slvl_radio1').addClass('sl-vl-radio-display-none');
            $('#txtb_specify_div').addClass('sl-vl-radio-display-none');
            $('#slvl_radio0_text').html('');
            $('#slvl_radio1_text').html('');
        }
        // **************************************************************************
        // **************************************************************************

        var p_empl_id = s.datalistgrid2[row_id].empl_id
        var p_date_fr = $("#txtb_date_fr").val()
        var p_date_to = $("#txtb_date_to").val()
        var p_report_type = "LEAVE";
        var par_rep_mode = "2";
        if (s.datalistgrid2[row_id].leave_type_code == "CTO") {
            p_report_type = "CTO";
            par_rep_mode = "3";
        }
        var par_iframe_id = "iframe_print_preview_carding_review"
        s.RetrieveCardingReport(p_empl_id, p_date_fr, p_date_to, par_rep_mode, p_report_type,par_iframe_id)

        $('#main_modal').modal({ backdrop: 'static', keyboard: false })
    }

    //***********************************************************//
    //*** VJA -  2021-06-03 - Button for Print Ledger
    //***********************************************************//
    s.btn_print_ledger = function (print_mode,row_index)
    {
        if (s.ddl_rep_mode == "3") // CTO Only
        {
            print_mode = "CTO";
        }

        try
        {
            if (ValidateFields())
            {
                var empl_id     = $("#ddl_name option:selected").val();
                // var par_year    = str_to_year($("#txtb_dtr_mon_year").val());
                var controller  = "Reports"
                var action      = "Index"
                var ReportName  = "CrystalReport"
                var SaveName    = "Crystal_Report"
                var ReportType  = "inline"
                var ReportPath  = ""
                var sp          = ""
                var p_date_fr   = $("#txtb_date_fr").val()
                var p_date_to   = $("#txtb_date_to").val()
                var p_rep_mode  = s.ddl_rep_mode

                s.lbl_report_header = "Print Leave Card";

                sp = "sp_leaveledger_report,p_empl_id," + empl_id + ",p_date_fr," + p_date_fr + ",p_date_to," + p_date_to + ",p_rep_mode," + p_rep_mode;
                if (print_mode == 'OLD')
                {
                    s.show_lv_card_rep_option = true;
                    ReportPath = "~/Reports/cryLeaveLedger/cryLeaveLedger.rpt";
                }
                else if (print_mode == 'NEW')
                {
                    s.show_lv_card_rep_option = true;
                    ReportPath = "~/Reports/cryLeaveLedger2/cryLeaveLedger.rpt";
                }
                else if (print_mode == 'CTO')
                {
                    p_rep_mode = "3";
                    s.show_lv_card_rep_option = false;
                    ReportPath = "~/Reports/cryCOC/cryCOC.rpt";
                }
                else if (print_mode == 'justification')
                {
                    s.lbl_report_header         = "Print Leave Justification";
                    s.show_lv_card_rep_option = false;
                    ReportPath                  = "~/Reports/cryLeaveJustification/cryLeaveJustification.rpt";
                    sp                          = "sp_leave_application_hdr_justi_rep,par_leave_ctrlno," + s.datalistgrid2[row_index].leave_ctrlno + ",par_empl_id," + s.datalistgrid2[row_index].empl_id;
                }
                // else if (print_mode == 'LWOP') {
                //     p_rep_mode = "3";
                //     s.lbl_report_header = "Print Notice of Leave Without Pay";
                //     s.show_lv_card_rep_option = false;
                //     ReportPath = "~/Reports/cryLWOP/cryLWOP.rpt";
                //     sp = "sp_leave_application_rep3,par_ledger_ctrl_no," + s.txtb_ledger_ctrl_no;
                // }
                 
                // 
                // s.embed_link2 = "../" + controller + "/" + action + "?ReportName=" + ReportName
                //     + "&SaveName=" + SaveName
                //     + "&ReportType=" + ReportType
                //     + "&ReportPath=" + ReportPath
                //     + "&Sp=" + sp;
                // 
                // $('#iframe_print_preview2').attr('src', s.embed_link2);
                // $('#leave_ledger_print_modal').modal({ backdrop: 'static', keyboard: false });

                // *******************************************************
                // *** VJA : 2021-07-14 - Validation and Loading hide ****
                // *******************************************************
                $("#modal_initializing").modal({ keyboard: false, backdrop: "static" })
                var iframe = document.getElementById('iframe_print_preview2');
                var iframe_page = $("#iframe_print_preview2")[0];
                iframe.style.visibility = "hidden";

                s.embed_link = "../Reports/CrystalViewer.aspx?Params=" + ""
                    + "&ReportName=" + ReportName
                    + "&SaveName=" + SaveName
                    + "&ReportType=" + ReportType
                    + "&ReportPath=" + ReportPath
                    + "&id=" + sp // + "," + parameters

                if (!/*@cc_on!@*/0) { //if not IE
                    iframe.onload = function () {
                        iframe.style.visibility = "visible";
                        $("#modal_initializing").modal("hide")
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
                            $("#modal_initializing").modal("hide")
                        }
                    };
                }

                iframe.src = s.embed_link;
                $('#leave_ledger_print_modal').modal({ backdrop: 'static', keyboard: false });
            // *******************************************************
            // *******************************************************


            }
        }
        catch (err)
        {
            swal({ icon: "warning", title: err.message });
        }
    }

    s.btn_print_ledger_close = function ()
    {
        s.ddl_report_lv_card = "OLD";
    }

    //***********************************************************//
    //*** VJA -  2021-06-03 - Button for Print Leave Application
    //***********************************************************//
    s.btn_print_leave_app = function (row_id)
    {
        s.ddl_report_appl       = "02";
        s.print_ledger_ctrl_no  = "";
        s.print_ledger_ctrl_no  = s.datalistgrid[row_id].ledger_ctrl_no;
        s.show_appl_rep         = true;

        s.ledger_ctrl_no_reprint       = ""
        s.empl_id_reprint              = ""

        var date_now = new Date();
        s.ledger_ctrl_no_reprint       = s.datalistgrid[row_id].ledger_ctrl_no;
        s.empl_id_reprint              = s.datalistgrid[row_id].empl_id;
        s.reprint_reason               = ""
        $('#reprint_date_from').val(moment(date_now).format('YYYY-MM-DD')) 
        $('#reprint_date_to').val(moment(date_now).format('YYYY-MM-DD'))   
        s.reprint_status = "REQUEST"

        h.post("../cLeaveLedger/RetrieveReprint", {
            par_ledger_ctrl_no  : s.datalistgrid[row_id].ledger_ctrl_no,
            par_empl_id         : s.datalistgrid[row_id].empl_id
        }).then(function (d)
        {
            if (d.data.message == "success")
            {
                if (d.data.data != null)
                {
                    $('#reprint_date_from').val(moment(d.data.data.reprint_date_from).format('YYYY-MM-DD'))
                    $('#reprint_date_to').val(moment(d.data.data.reprint_date_to).format('YYYY-MM-DD'))
                    s.reprint_status = d.data.data.reprint_status
                    s.reprint_reason = d.data.data.reprint_reason
                }
            }
        })


        var p_date_fr = $("#txtb_date_fr").val()
        var p_date_to = $("#txtb_date_to").val()
        var par_iframe_id = "iframe_print_preview_carding"
        if (s.datalistgrid[row_id].approval_status == 'D' ||
            s.datalistgrid[row_id].approval_status == 'L' ||
            s.datalistgrid[row_id].leaveledger_entry_type == 'T' 
        )
        {
            swal("You cannot Edit, Delete, Print and Cancel Posted", "Data already Disapproved or Cancelled", { icon: "warning", });
        }
        else if (s.datalistgrid[row_id].leaveledger_entry_type != '2' && s.datalistgrid[row_id].leavetype_code != "CTO")
        {
            swal("You cannot Print", "You cannot print if the entry type are Automated and Leave Adjustment!", { icon: "warning", });
        }
        else
        {
            try
            {
                var ledger_ctrl_no      = s.datalistgrid[row_id].ledger_ctrl_no;
                var leave_ctrlno        = s.datalistgrid[row_id].leave_ctrlno;
                var empl_id             = s.datalistgrid[row_id].empl_id;

                var p_month_year        = s.datalistgrid[row_id].leaveledger_period.split("/")[1] + "-" + s.datalistgrid[row_id].leaveledger_period.split("/")[0] + "-01";
                var p_number_of_hours   = s.datalistgrid[row_id].vl_earned;
                var p_date_issued       = s.datalistgrid[row_id].leaveledger_date;
                var p_date_valid        = s.datalistgrid[row_id].leaveledger_date;
                var p_signatory_name    = "LARA ZAPHIRE KRISTY N. BERMEJO";
                var p_footer_remarks    = s.datalistgrid[row_id].details_remarks;

                var controller  = "Reports"
                var action      = "Index"
                var ReportName  = "CrystalReport"
                var SaveName    = "Crystal_Report"
                var ReportType  = "inline"
                var ReportPath  = ""
                var sp          = ""
                
                if (s.ddl_rep_mode == "3")
                {
                    s.show_appl_rep = false;
                    if (leave_ctrlno == "" || leave_ctrlno == null)
                    {
                        if (s.datalistgrid[row_id].leaveledger_entry_type == '1')
                        {
                            ReportPath = "~/Reports/cryCOC_Earn/cryCOC_Earn.rpt";
                            sp = "sp_leave_application_coc_earn_report,p_empl_id," + empl_id + ",p_month_year," + p_month_year + ",p_number_of_hours," + p_number_of_hours + ",p_date_issued," + p_date_issued + ",p_date_valid," + p_date_valid + ",p_signatory_name," + p_signatory_name + ",p_footer_remarks," + p_footer_remarks;

                            s.RetrieveCardingReport(s.datalistgrid[row_id].empl_id, p_date_fr, p_date_to, "3", "CTO", par_iframe_id)
                        }
                        else
                        {
                            swal("You cannot Print this Report", "There is no CTO Application on Self-Service", { icon: "warning" })
                            return;
                        }
                    }
                    else
                    {
                        ReportPath = "~/Reports/cryCTO/cryCTO.rpt";
                        sp = "sp_leave_application_hdr_tbl_report_cto,par_leave_ctrlno," + leave_ctrlno + ",par_empl_id," + empl_id + ",par_view_mode," + "02";

                        s.RetrieveCardingReport(s.datalistgrid[row_id].empl_id, p_date_fr, p_date_to, "3", "CTO", par_iframe_id)
                    }
                }
                else
                {
                    s.show_appl_rep = true;
                    ReportPath = "~/Reports/cryApplicationForLeaveRep2/cryApplicationForLeaveRep.rpt";
                    sp = "sp_leave_application_report,p_ledger_ctrl_no," + ledger_ctrl_no;

                    s.RetrieveCardingReport(s.datalistgrid[row_id].empl_id, p_date_fr, p_date_to, "2", "LEAVE", par_iframe_id)
                }

                // *******************************************************
                // *** VJA : 2021-07-14 - Validation and Loading hide ****
                // *******************************************************
                $("#modal_initializing").modal({ keyboard: false, backdrop: "static" })
                var iframe = document.getElementById('iframe_print_preview3');
                var iframe_page = $("#iframe_print_preview3")[0];
                iframe.style.visibility = "hidden";

                s.embed_link = "../Reports/CrystalViewer.aspx?Params=" + ""
                    + "&ReportName=" + ReportName
                    + "&SaveName=" + SaveName
                    + "&ReportType=" + ReportType
                    + "&ReportPath=" + ReportPath
                    + "&id=" + sp // + "," + parameters

                if (!/*@cc_on!@*/0) { //if not IE
                    iframe.onload = function () {
                        iframe.style.visibility = "visible";
                        $("#modal_initializing").modal("hide")
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
                            $("#modal_initializing").modal("hide")
                        }
                    };
                }

                iframe.src = s.embed_link;
                $('#leave_app_print_modal').modal({ backdrop: 'static', keyboard: false });
            // *******************************************************
            // *******************************************************


            }
            catch (err)
            {
                swal({ icon: "warning", title: err.message });
            }
        }
    }
    //***********************************************************//
    //*** VJA -  2021-06-03 - Button for Print Leave Application
    //***********************************************************//
    s.SelectReport_Appl = function ()
    {
        var ledger_ctrl_no  = s.print_ledger_ctrl_no;
        var controller      = "Reports"
        var action          = "Index"
        var ReportName      = "CrystalReport"
        var SaveName        = "Crystal_Report"
        var ReportType      = "inline"
        var ReportPath      = ""
        var sp              = ""
        
        if (s.ddl_report_appl == "01") {
            ReportPath = "~/Reports/cryApplicationForLeaveRep/cryApplicationForLeaveRep.rpt";
            sp = "sp_leave_application_rep3,par_ledger_ctrl_no," + ledger_ctrl_no;

            //s.embed_link3 = "../" + controller + "/" + action + "?ReportName=" + ReportName
            //    + "&SaveName=" + SaveName
            //    + "&ReportType=" + ReportType
            //    + "&ReportPath=" + ReportPath
            //    + "&Sp=" + sp;
            //
            //$('#iframe_print_preview3').attr('src', s.embed_link3);
        }
        else if (s.ddl_report_appl == "02")
        {
             ReportPath = "~/Reports/cryApplicationForLeaveRep2/cryApplicationForLeaveRep.rpt";
            sp = "sp_leave_application_report,p_ledger_ctrl_no," + ledger_ctrl_no;
             
             //s.embed_link3 = "../" + controller + "/" + action + "?ReportName=" + ReportName
             //    + "&SaveName=" + SaveName
             //    + "&ReportType=" + ReportType
             //    + "&ReportPath=" + ReportPath
             //    + "&Sp=" + sp;
             //
             //$('#iframe_print_preview3').attr('src', s.embed_link3);
        }
        else if (s.ddl_report_appl == "03") {
            ReportPath = "~/Reports/cryLWOP/cryLWOP.rpt";
            sp = "sp_leave_application_rep3,par_ledger_ctrl_no," + ledger_ctrl_no;
            
            //s.embed_link3 = "../" + controller + "/" + action + "?ReportName=" + ReportName
            //    + "&SaveName=" + SaveName
            //    + "&ReportType=" + ReportType
            //    + "&ReportPath=" + ReportPath
            //    + "&Sp=" + sp;
            //
            //$('#iframe_print_preview3').attr('src', s.embed_link3);
        }
        else
        {
            swal("No data Found!", {icon : "warning"})
        }

        // *******************************************************
        // *** VJA : 2021-07-14 - Validation and Loading hide ****
        // *******************************************************
        $("#modal_initializing").modal({ keyboard: false, backdrop: "static" })
        var iframe = document.getElementById('iframe_print_preview3');
        var iframe_page = $("#iframe_print_preview3")[0];
        iframe.style.visibility = "hidden";

        s.embed_link = "../Reports/CrystalViewer.aspx?Params=" + ""
            + "&ReportName=" + ReportName
            + "&SaveName=" + SaveName
            + "&ReportType=" + ReportType
            + "&ReportPath=" + ReportPath
            + "&id=" + sp // + "," + parameters

        if (!/*@cc_on!@*/0) { //if not IE
            iframe.onload = function () {
                iframe.style.visibility = "visible";
                $("#modal_initializing").modal("hide")
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
                    $("#modal_initializing").modal("hide")
                }
            };
        }

        iframe.src = s.embed_link;
        $('#leave_app_print_modal').modal({ backdrop: 'static', keyboard: false });
    // *******************************************************
    // *******************************************************
    }

    //***********************************************************//
    //*** VJA -  2021-06-03 - Button for Print Leave Application
    //***********************************************************//
    s.btn_print_leave_app_posted = function (row_id)
    {
        s.ddl_report_appl       = "02";
        s.print_ledger_ctrl_no  = "";
        s.print_ledger_ctrl_no  = s.datalistgrid3[row_id].ledger_ctrl_no;

        if (s.datalistgrid3[row_id].approval_status == 'D' ||
            s.datalistgrid3[row_id].approval_status == 'L' ||
            s.datalistgrid3[row_id].leaveledger_entry_type == 'T' 
        )
        {
            swal("You cannot Edit, Delete, Print and Cancel Posted", "Data already Disapproved or Cancelled", { icon: "warning", });
        }
        else if (s.datalistgrid3[row_id].leaveledger_entry_type != '2')
        {
            swal("You cannot Print", "You cannot print if the entry type are Automated and Leave Adjustment!", { icon: "warning", });
        }
        else
        {
            try {
                var ledger_ctrl_no  = s.datalistgrid3[row_id].ledger_ctrl_no;
                var leave_ctrlno    = s.datalistgrid3[row_id].leave_ctrlno;
                var empl_id         = s.datalistgrid3[row_id].empl_id;

                var controller  = "Reports"
                var action      = "Index"
                var ReportName  = "CrystalReport"
                var SaveName    = "Crystal_Report"
                var ReportType  = "inline"
                var ReportPath  = ""
                var sp = ""

                if (s.datalistgrid3[row_id].leave_type_code == "CTO")
                {
                    ReportPath = "~/Reports/cryCTO/cryCTO.rpt";
                    sp = "sp_leave_application_hdr_tbl_report_cto,par_leave_ctrlno," + leave_ctrlno + ",par_empl_id," + empl_id + ",par_view_mode," + "02";
                }
                else
                {
                    // ReportPath = "~/Reports/cryApplicationForLeaveRep/cryApplicationForLeaveRep.rpt";
                    // sp = "sp_leave_application_rep3,par_ledger_ctrl_no," + ledger_ctrl_no;

                    ReportPath = "~/Reports/cryApplicationForLeaveRep2/cryApplicationForLeaveRep.rpt";
                    sp = "sp_leave_application_report,p_ledger_ctrl_no," + ledger_ctrl_no;
                }
                
                // s.embed_link3 = "../" + controller + "/" + action + "?ReportName=" + ReportName
                //     + "&SaveName=" + SaveName
                //     + "&ReportType=" + ReportType
                //     + "&ReportPath=" + ReportPath
                //     + "&Sp=" + sp;
                // 
                // $('#iframe_print_preview3').attr('src', s.embed_link3);
                // 
                // $('#leave_app_print_modal').modal({ backdrop: 'static', keyboard: false });

                // *******************************************************
                // *** VJA : 2021-07-14 - Validation and Loading hide ****
                // *******************************************************
                $("#modal_initializing").modal({ keyboard: false, backdrop: "static" })
                var iframe = document.getElementById('iframe_print_preview3');
                var iframe_page = $("#iframe_print_preview3")[0];
                iframe.style.visibility = "hidden";

                s.embed_link = "../Reports/CrystalViewer.aspx?Params=" + ""
                    + "&ReportName=" + ReportName
                    + "&SaveName=" + SaveName
                    + "&ReportType=" + ReportType
                    + "&ReportPath=" + ReportPath
                    + "&id=" + sp // + "," + parameters

                if (!/*@cc_on!@*/0) { //if not IE
                    iframe.onload = function () {
                        iframe.style.visibility = "visible";
                        $("#modal_initializing").modal("hide")
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
                            $("#modal_initializing").modal("hide")
                        }
                    };
                }

                iframe.src = s.embed_link;


                var p_empl_id = s.datalistgrid3[row_id].empl_id
                var p_date_fr = $("#txtb_date_fr").val()
                var p_date_to = $("#txtb_date_to").val()
                var p_report_type = "LEAVE";
                var par_rep_mode = "2";
                if (s.datalistgrid3[row_id].leave_type_code == "CTO") {
                    p_report_type = "CTO";
                    par_rep_mode = "3";
                }
                var par_iframe_id = "iframe_print_preview_carding"
                s.RetrieveCardingReport(p_empl_id, p_date_fr, p_date_to, par_rep_mode, p_report_type, par_iframe_id)

                $('#leave_app_print_modal').modal({ backdrop: 'static', keyboard: false });
            // *******************************************************
            // *******************************************************
            }
            catch (err) {
                swal({ icon: "warning", title: err.message });
            }
        }
    }

    //***********************************************************//
    //*** VJA -  2021-06-03 - Button for Saving
    //***********************************************************//
    s.btn_save_click = function (save_mode)
    {
        // This is Data for header
        var data =
        {
            ledger_ctrl_no             : s.txtb_ledger_ctrl_no
            ,empl_id                   : s.txtb_empl_id // $("#ddl_name option:selected").val()
            ,leaveledger_date          : $("#txtb_ledger_date").val()
            ,leaveledger_period        : s.txtb_period
            ,leaveledger_particulars   : s.txtb_particulars
            ,leaveledger_entry_type    : $("#ddl_entry_type option:selected").val()
            ,details_remarks           : s.txtb_details_remarks
            ,approval_status           : "F"
            ,approval_id               : s.txtb_approval_id
            ,leave_ctrlno              : s.txtb_leave_ctrlno
            ,date_applied              : $("#txtb_date_applied").val()
            ,sig_name3_ovrd            : s.txtb_signame3_ovrd
            ,sig_pos3_ovrd             : s.txtb_sigpos3_ovrd
            ,leavetype_code            : s.ddl_leave_type
            , leavesubtype_code        : $("#ddl_leave_sub_type option:selected").val() == '' || $("#ddl_leave_sub_type option:selected").val() == '<empty string>' ? '' : $("#ddl_leave_sub_type option:selected").val() 
            , lv_nodays                : s.txtb_no_of_days
            ,lwop_date                 : s.txtb_lwop_date
            ,lwop_body_1               : s.txtb_lwop_body_1
            ,lwop_body_2               : s.txtb_lwop_body_2
        }
        // Leave Adjustment
        if ($("#ddl_entry_type option:selected").val() == "3" || s.ddl_leave_type == "CTO")
        {
            var data2 = {

                ledger_ctrl_no               : s.txtb_ledger_ctrl_no
                ,leavetype_code              : s.ddl_leave_type
                ,leavesubtype_code           : $("#ddl_leave_sub_type option:selected").val() == '' || $("#ddl_leave_sub_type option:selected").val() == '<empty string>' ? '' : $("#ddl_leave_sub_type option:selected").val() 
                ,leaveledger_balance_as_of   : s.txtb_balance_as_of_hdr
                ,leaveledger_restore_deduct  : s.txtb_restore_deduct_hdr
                ,leaveledger_abs_und_wp      : s.txtb_abs_und_wp_hdr
                ,leaveledger_abs_und_wop     : s.txtb_abs_und_wop_hdr
            }
        } else
        {
            var data2 = []
        }

        // Automated Leave
        if ($("#ddl_entry_type option:selected").val() == "1" )
        {
            var data_auto_vl = {

                 ledger_ctrl_no              : s.txtb_ledger_ctrl_no
                ,leavetype_code              : "VL" 
                ,leavesubtype_code           : ""
                ,leaveledger_balance_as_of   : s.txtb_balance_as_of_vl
                ,leaveledger_restore_deduct  : s.txtb_restore_deduct_vl
                ,leaveledger_abs_und_wp      : s.txtb_abs_und_wp_vl
                ,leaveledger_abs_und_wop     : s.txtb_abs_und_wop_vl
            }

            var data_auto_sl = {

                 ledger_ctrl_no              : s.txtb_ledger_ctrl_no
                ,leavetype_code              : "SL"
                ,leavesubtype_code           : ""
                ,leaveledger_balance_as_of   : s.txtb_balance_as_of_sl
                ,leaveledger_restore_deduct  : s.txtb_restore_deduct_sl
                ,leaveledger_abs_und_wp      : s.txtb_abs_und_wp_sl
                ,leaveledger_abs_und_wop     : s.txtb_abs_und_wop_sl
            }
            
        } 

        // Application - for Monetezation and Terminal Leave
        if ($("#ddl_entry_type option:selected").val() == "2" )
        {
            if (s.ddl_leave_type == 'MZ' || s.ddl_leave_type == 'TL')
            {
                var data_auto_mz_tl = {

                 ledger_ctrl_no              : s.txtb_ledger_ctrl_no
                ,leavetype_code              : s.ddl_leave_type 
                ,leavesubtype_code           : ""
                ,leaveledger_balance_as_of   : "0.00"
                ,leaveledger_restore_deduct  : (0 - parseFloat(s.txtb_no_of_days))
                ,leaveledger_abs_und_wp      : s.txtb_no_of_days
                ,leaveledger_abs_und_wop     : "0.00"
                }
            }
            
            var data_auto_vl = {

                 ledger_ctrl_no              : s.txtb_ledger_ctrl_no
                ,leavetype_code              : "VL" 
                ,leavesubtype_code           : ""
                ,leaveledger_balance_as_of   : s.txtb_balance_as_of_vl
                ,leaveledger_restore_deduct  : (0 - parseFloat(s.txtb_abs_und_wp_vl))
                ,leaveledger_abs_und_wp      : s.txtb_abs_und_wp_vl
                ,leaveledger_abs_und_wop     : "0.00"
            }

            var data_auto_sl = {

                 ledger_ctrl_no              : s.txtb_ledger_ctrl_no
                ,leavetype_code              : "SL"
                ,leavesubtype_code           : ""
                ,leaveledger_balance_as_of   : s.txtb_balance_as_of_sl
                ,leaveledger_restore_deduct  :  (0 - parseFloat(s.txtb_abs_und_wp_sl))
                ,leaveledger_abs_und_wp      : s.txtb_abs_und_wp_sl
                ,leaveledger_abs_und_wop     : "0.00"
            }
            
        }

        // Automated Leave
        if ($("#ddl_entry_type option:selected").val() == "4" )
        {
            var data_auto_vl = {

                 ledger_ctrl_no              : s.txtb_ledger_ctrl_no
                ,leavetype_code              : "VL" 
                ,leavesubtype_code           : ""
                ,leaveledger_balance_as_of   : s.txtb_balance_as_of_vl
                ,leaveledger_restore_deduct  : "0.00"
                ,leaveledger_abs_und_wp      : "0.00"
                ,leaveledger_abs_und_wop     : "0.00"
            }

            var data_auto_sl = {

                 ledger_ctrl_no              : s.txtb_ledger_ctrl_no
                ,leavetype_code              : "SL"
                ,leavesubtype_code           : ""
                ,leaveledger_balance_as_of   : s.txtb_balance_as_of_sl
                ,leaveledger_restore_deduct  : "0.00"
                ,leaveledger_abs_und_wp      : "0.00"
                ,leaveledger_abs_und_wop     : "0.00"
            }
            
        }
        // *******************************************************************
        // *********** SAVING FOR HEADER AND DETAILS *************************
        // *******************************************************************
        if (save_mode == "SAVE") {
            if (ValidateFields_New())
            {
                $("#modal_initializing").modal({ keyboard: false, backdrop: "static" })
                h.post("../cLeaveLedger/CheckData", {
                    data: data
                }).then(function (d) {
                    if (d.data.message != "") {
                        swal({ icon: "warning", title: d.data.message });
                        
                    }
                    else {
                        h.post("../cLeaveLedger/Save_NewLogic", {
                            data: data
                            , data2: data2
                            , data_auto_vl: data_auto_vl
                            , data_auto_sl: data_auto_sl
                            , data_auto_mz_tl: data_auto_mz_tl
                        }).then(function (d) {
                            if (d.data.message == "success") {
                                $('#main_modal').modal("hide");
                                swal("Record Successfully Saved", "Your record has been saved!", { icon: "success", });
                                
                                s.FilterPageGrid(s.txtb_empl_id);
                            }
                            else {
                                swal(d.data.message, { icon: "warning", });
                                
                            }
                        });
                    }
                });
            }
        }
        // *****************************************************************
        // *********** EDIT FOR HEADER AND DETAILS *************************
        // *****************************************************************
        else if (save_mode == "EDIT")
        {
            $("#modal_initializing").modal({ keyboard: false, backdrop: "static" })
            h.post("../cLeaveLedger/Update", {
                data: data
                , data2: data2
            }).then(function (d) {
                if (d.data.message == "success") {
                    $('#main_modal').modal("hide");
                    swal("Record Successfully Updated", "Your record has been successfully updated!", { icon: "success", });
                    
                    s.FilterPageGrid(s.txtb_empl_id);
                }
                else {
                    swal(d.data.message, { icon: "warning", });
                    
                }
            });
        }
        // *****************************************************************
        // *********** POST FOR HEADER AND DETAILS *************************
        // *****************************************************************
        else if (save_mode == "POST") {
            $('#icn_post').removeClass();
            $('#icn_post').addClass('fa fa-spinner fa-spin');
            $('#post').attr('disabled');

            data.approval_status = "S";
            data.leave_ctrlno = s.temp_leave_ctrlno;
            
            h.post("../cLeaveLedger/CheckLeaveApplicationDetails", {
                data: data
            }).then(function (d) {
                if (d.data.message_descr != "") {
                    swal($("#ddl_leave_type option:selected").text() + d.data.message_descr_1, d.data.message_descr, {
                        icon: "warning",
                        buttons: {
                            continue_anyway: {
                                text: "OK, Continue Anyway",
                                value: "continue_anyway",
                            },
                            defeat: {
                                value: "defeat",
                                text: "Close",
                                //className: "btn btn-danger"
                            },
                        },
                    }).then((value) => {
                        switch (value) {

                            case "continue_anyway":
                                h.post("../cLeaveLedger/CheckData",
                                    {
                                        data: data
                                    }).then(function (d) {
                                        if (d.data.message != "") {
                                            swal({ icon: "warning", title: d.data.message });
                                        }
                                        else
                                        {
                                            $("#modal_initializing").modal({ keyboard: false, backdrop: "static" })
                                            h.post("../cLeaveLedger/Post_Leave_App", {
                                                data: data
                                                , data2: data2
                                                , data_auto_vl: data_auto_vl
                                                , data_auto_sl: data_auto_sl
                                                , p_empl_id: s.txtb_empl_id
                                                , p_leavetype_code: s.ddl_leave_type
                                                , p_leavesubtype_code: $("#ddl_leave_sub_type option:selected").val() == '' || $("#ddl_leave_sub_type option:selected").val() == '<empty string>' ? '' : $("#ddl_leave_sub_type option:selected").val()
                                                , p_leaveledger_date: $("#txtb_ledger_date").val()
                                                , p_lv_nodays: s.txtb_no_of_days == '' ? 0 : s.txtb_no_of_days
                                                , data_auto_mz_tl: data_auto_mz_tl

                                            }).then(function (d) {
                                                if (d.data.message == "success")
                                                {
                                                    $('#main_modal').modal("hide");
                                                    swal("Record Successfully Reviewed & Posted to Ledger", "Your record has been posted!", { icon: "success", });
                                                    
                                                    s.FilterPageGrid(s.txtb_empl_id);
                                                }
                                                else
                                                {
                                                    swal(d.data.message, { icon: "warning", });
                                                    
                                                }
                                            });
                                        }
                                    });
                                break;

                            default:
                                swal("Cancel Request!", "Your Request is already Cancelled!", { icon: "warning" });
                        }
                    });

                }
                else {
                    h.post("../cLeaveLedger/CheckData",
                        {
                            data: data
                        }).then(function (d) {
                            if (d.data.message != "") {
                                swal({ icon: "warning", title: d.data.message });
                            }
                            else
                            {
                                $("#modal_initializing").modal({ keyboard: false, backdrop: "static" })
                                h.post("../cLeaveLedger/Post_Leave_App", {
                                    data: data
                                    , data2: data2
                                    , data_auto_vl: data_auto_vl
                                    , data_auto_sl: data_auto_sl
                                    , p_empl_id: s.txtb_empl_id
                                    , p_leavetype_code: s.ddl_leave_type
                                    , p_leavesubtype_code: $("#ddl_leave_sub_type option:selected").val() == '' || $("#ddl_leave_sub_type option:selected").val() == '<empty string>' ? '' : $("#ddl_leave_sub_type option:selected").val()
                                    , p_leaveledger_date: $("#txtb_ledger_date").val()
                                    , p_lv_nodays: s.txtb_no_of_days == '' ? 0 : s.txtb_no_of_days
                                    , data_auto_mz_tl: data_auto_mz_tl

                                }).then(function (d) {
                                    if (d.data.message == "success")
                                    {
                                        $('#main_modal').modal("hide");
                                        swal("Record Successfully Reviewed & Posted to Ledger", "Your record has been posted!", { icon: "success", });
                                        s.FilterPageGrid(s.txtb_empl_id);
                                    }
                                    else
                                    {
                                        swal(d.data.message, { icon: "warning", });
                                    }
                                });
                            }
                        });
                }

                $('#icn_post').removeClass();
                $('#icn_post').addClass('fa fa-paper-plane');
                $('#post').removeAttr('disabled');

            })
        }
        else if (save_mode == "REPOST")
        {
            $("#modal_initializing").modal({ keyboard: false, backdrop: "static" })
            h.post("../cLeaveLedger/RePost", {
                data: data
                , data2: data2
            }).then(function (d) {
                if (d.data.message == "success") {
                    $('#main_modal').modal("hide");
                    swal("Record Successfully Reviewed & Posted to Ledger (Re-Posted)", "Your record has been successfully re-posted!", { icon: "success", });
                    $("#modal_initializing").modal("hide")
                    s.FilterPageGrid(s.txtb_empl_id);
                }
                else {
                    swal(d.data.message, { icon: "warning", });
                    $("#modal_initializing").modal("hide")
                }
            });
        }

    }

    //************************************// 
    //*** Delete Header and Details Record              
    //**********************************// 
    s.btn_delete = function (row_id)
    {
        
        if (s.datalistgrid[row_id].approval_status == 'D' ||
            s.datalistgrid[row_id].approval_status == 'L' ||
            s.datalistgrid[row_id].leaveledger_entry_type == 'T' 
        )
        {
            swal("You cannot Edit, Delete, Print and Cancel Posted", "Data already Disapproved or Cancelled", { icon: "warning", });
        }
        else if (s.datalistgrid[row_id].approval_status == 'F' && s.datalistgrid[row_id].leaveledger_entry_type == '2')
        {
            swal("You cannot Delete this Record", "Data already final Approved", { icon: "warning", });
        }
        else
        {
            swal({
                title: "Are you sure to delete this record?",
                text: "Once deleted, you will not be able to recover this record!",
                icon: "warning",
                buttons: true,
                dangerMode: true,

            }).then(function (willDelete) {
                    if (willDelete) {
                        var data = {
                            ledger_ctrl_no  : s.datalistgrid[row_id].ledger_ctrl_no
                        };
                        h.post("../cLeaveLedger/Delete", { data: data }).then(function (d)
                        {
                            if (d.data.message == "success") {
                                s.FilterPageGrid($("#ddl_name option:selected").val());
                                swal("Record Successfully Deleted", "Your record has been deleted!", { icon: "success", });
                            }
                            else
                            {
                                swal(d.data.message, { icon: "warning", });
                                s.FilterPageGrid($("#ddl_name option:selected").val());
                            }
                        })
                    }
                });
        }
    }
    
    //************************************//
    // Select Year +-3
    //************************************// 
    function RetrieveYear() {
        var currentYear = new Date().getFullYear();
        var prev_year = currentYear - 3;
        for (var i = 1; i <= 7; i++) {
            s.year.push({ "year": prev_year })
            prev_year++;
        }
    }
    //***********************************************************//
    //***Field validation for remittance type before opening add modal
    //***********************************************************// 
    function ValidateFields() {
        var return_val = true;
        ValidationResultColor("ALL", false);

        if ($('#ddl_name').val() == "") {
            ValidationResultColor("ddl_name", true);
            return_val = false;
        }
        if ($('#ddl_dept').val() == "") {
            ValidationResultColor("ddl_dept", true);
            return_val = false;
        }

        return return_val;
    }
    //***********************************************************//
    //***Field validation for remittance type before opening add modal
    //***********************************************************// 
    function ValidationResultColor(par_object_id, par_v_result) {
        if (par_v_result) {
            // $("#select2-" + par_object_id + "-container").parent().addClass("required");
            // $("#lbl_" + par_object_id + "_req").text("Required Field!");

            $("#" + par_object_id).addClass("required");
            $("#lbl_" + par_object_id + "_req").text("Required Field");
        }
        else {
            //remove of refresh the object form being required
            $("#select2-ddl_name-container").parent().removeClass("required");
            $("#ddl_name").removeClass("required");
            $("#lbl_ddl_name_req").text("");

            $("#select2-ddl_dept-container").parent().removeClass("required");
            $("#ddl_dept").removeClass("required");
            $("#lbl_ddl_dept_req").text("");
            
            $("#txtb_period").removeClass("required");
            $("#txtb_particulars").removeClass("required");
            $("#ddl_leave_type").removeClass("required");
            $("#txtb_date_applied").removeClass("required");
            $("#txtb_ledger_date").removeClass("required");
            $("#txtb_no_of_days").removeClass("required");
            $("#txtb_restore_deduct").removeClass("required");
            $("#txtb_abs_und_wp").removeClass("required");
            $("#txtb_abs_und_wop").removeClass("required");
            $("#txtb_balance_as_of").removeClass("required");
            $("#txtb_abs_und_wp_sl").removeClass("required");
            $("#txtb_abs_und_wp_vl").removeClass("required");
            $("#txtb_remarks").removeClass("required");
            
            $("#lbl_txtb_period_req").text("");
            $("#lbl_txtb_particulars_req").text("");
            $("#lbl_ddl_leave_type_req").text("");
            $("#lbl_txtb_date_applied_req").text("");
            $("#lbl_txtb_ledger_date_req").text("");
            $("#lbl_txtb_no_of_days_req").text("");
            $("#lbl_txtb_restore_deduct_req").text("");
            $("#lbl_txtb_abs_und_wp_req").text("");
            $("#lbl_txtb_abs_und_wop_req").text("");
            $("#lbl_txtb_ledger_date_req").text("");
            $("#lbl_txtb_date_applied_req").text("");
            $("#lbl_txtb_balance_as_of_req").text("");
            $("#lbl_txtb_abs_und_wp_vl_req").text("");
            $("#lbl_txtb_abs_und_wp_sl_req").text("");
            $("#lbl_txtb_remarks_req").text("");
        }
    }
    function str_to_year(str) {
        var year = str.substr(str.length - 4);
        return year;
    }
    function month_name_to_int(month_name) {
        var int_mons = "1";

        if (month_name.includes("January")) {
            int_mons = "1";
        }
        else if (month_name.includes("February")) {
            int_mons = "2";
        }
        else if (month_name.includes("March")) {
            int_mons = "3";
        }
        else if (month_name.includes("April")) {
            int_mons = "4";
        }
        else if (month_name.includes("May")) {
            int_mons = "5";
        }
        else if (month_name.includes("June")) {
            int_mons = "6";
        }
        else if (month_name.includes("July")) {
            int_mons = "7";
        }
        else if (month_name.includes("August")) {
            int_mons = "8";
        }
        else if (month_name.includes("September")) {
            int_mons = "9";
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
    //***********************************************************//
    //***Clear Entry 
    //***********************************************************// 
    function clear_entry()
    {
        var par_month = month_name_to_int($("#txtb_dtr_mon_year").val());

        var temp_date = str_to_year($("#txtb_dtr_mon_year").val()) + '-' + (parseInt(par_month) <= 9 ? "0" + par_month : par_month) + '-01';
        var firstDay = moment(temp_date).startOf('month').format('D');
        var lastDay     = moment(temp_date).endOf('month').format('D');

        s.txtb_period = month_name_to_int($("#txtb_dtr_mon_year").val()) + '/' + firstDay + '-' + lastDay + '/' + str_to_year($("#txtb_dtr_mon_year").val()).substring(2, 4);
        s.txtb_date_applied         = moment( new Date()).format("YYYY-MM-DD");
        s.txtb_ledger_date = moment(new Date()).format("YYYY-MM-DD");
        s.txtb_ledger_ctrl_no       = "";
        s.ddl_leave_type            = "";
        s.ddl_leave_sub_type        = "";
        s.txtb_particulars          = "0-0-0";
        s.ddl_entry_type            = "3";
        s.txtb_signame3_ovrd        = "";
        s.txtb_sigpos3_ovrd         = "";
        s.txtb_empl_id              = $("#ddl_name option:selected").val();
        s.leavetype_description     = $("#ddl_leave_type option:selected").html();
                                    
        s.txtb_balance_as_of        = "0.000";
        s.txtb_restore_deduct       = "0.000";
        s.txtb_abs_und_wp           = "0.000";
        s.txtb_abs_und_wop          = "0.000";
                                    
        s.txtb_balance_as_of_hdr    = "0.000";
        s.txtb_restore_deduct_hdr   = "0.000";
        s.txtb_abs_und_wp_hdr       = "0.000";
        s.txtb_abs_und_wop_hdr      = "0.000";
                                    
        s.txtb_no_of_days           = "0.000";

        s.txtb_balance_as_of_vl     = "0.000";
        s.txtb_restore_deduct_vl    = "0.000";
        s.txtb_balance_as_of_sl     = "0.000";
        s.txtb_restore_deduct_sl    = "0.000";

        s.txtb_abs_und_wp_sl        = "0.000";
        s.txtb_abs_und_wop_sl       = "0.000";
        s.txtb_abs_und_wp_vl        = "0.000";
        s.txtb_abs_und_wop_vl       = "0.000";
        s.txtb_details_remarks      = "";
        s.temp_leave_ctrlno = ""
        s.txtb_leave_ctrlno = ""
        s.txtb_approval_id = "";

        // s.txtb_lwop_date     = "";
        // s.txtb_lwop_body_1   = "Please be informed that your leave balance for vacation leave is ___ and sick leave is ___";
        // s.txtb_lwop_body_2   = "Hence, your application for sick leave dated _____ shall be without pay";

        s.txtb_lwop_date     =  "";
        s.txtb_lwop_body_1   =  "";
        s.txtb_lwop_body_2   =  "";

        s.reviewed_comment              = "";
        s.level1_approval_comment       = "";
        s.level2_approval_comment       = "";
        s.final_approval_comment        = "";
        s.disapproval_comment           = "";
        s.cancel_pending_comment        = "";
        s.cancelled_comment             = "";
        s.user_id_creator               = "";
        s.employee_name_creator         = "";
        s.user_id_reviewer              = "";
        s.employee_name_reviewer        = "";
        s.user_id_level1_approver       = "";
        s.employee_name_level1_approver = "";
        s.user_id_level2_approver       = "";
        s.employee_name_level2_approver = "";
        s.user_id_final_approver        = "";
        s.employee_name_final_approver  = "";
        s.user_id_disapprover           = "";
        s.employee_name_disapprover     = "";
        s.user_id_cancel_pending        = "";
        s.employee_name_cancel_pending  = "";
        s.reviewed_date                 = "";
        s.level1_approval_date          = "";
        s.level2_approval_date          = "";
        s.final_approval_date           = "";
        s.disapproval_date              = "";
        s.cancel_pending_date           = "";
        s.cancelled_date = "";
        s.txtb_remarks = "";


    }
    //***********************************************************//
    //***VJA - 02/29/2020 -  Field validation everytime generation 
    //                          button is click ***//
    //***********************************************************// 
    function ValidateFields_New() {
        var return_val = true;
        ValidationResultColor("ALL", false);
        
        if ($('#ddl_leave_type').val().trim() == "" && ($('#ddl_entry_type').val().trim() == "2" || $('#ddl_entry_type').val().trim() == "3" || $('#ddl_entry_type').val().trim() == "1")) {
            ValidationResultColor("ddl_leave_type", true);
            return_val = false;
        }
        
        if ($('#txtb_date_applied').val() == "") {
            ValidationResultColor("txtb_date_applied", true);
            return_val = false;
        } else if (checkisdate($('#txtb_date_applied').val().trim()) == false) {

            ValidationResultColor("txtb_date_applied", true);
            $("#lbl_txtb_date_applied_req").text("Invalid Date Format");
            return_val = false;
        }

        if ($('#txtb_ledger_date').val() == "") {
            ValidationResultColor("txtb_ledger_date", true);
            return_val = false;
        } else if (checkisdate($('#txtb_ledger_date').val().trim()) == false) {

            ValidationResultColor("txtb_ledger_date", true);
            $("#lbl_txtb_ledger_date_req").text("Invalid Date Format");
            return_val = false;
        }

        if ($('#txtb_no_of_days').val().trim() == "") {
            ValidationResultColor("txtb_no_of_days", true);
            return_val = false;
        } else if (checkisvalidnumber($('#txtb_no_of_days').val().trim()) == false) {
            $("#txtb_no_of_days").addClass("required");
            $("#lbl_txtb_no_of_days_req").text("Invalid Number !");
            return_val = false;
        }

        if (parseFloat($('#txtb_no_of_days').val().trim()) <= 0 && s.ddl_entry_type == '2')
        {
            $("#txtb_no_of_days").addClass("required");
            $("#lbl_txtb_no_of_days_req").text("Must greater than zero(0)!");
            return_val = false;
        }

        if ($('#txtb_restore_deduct').val().trim() == "") {
            ValidationResultColor("txtb_restore_deduct", true);
            return_val = false;
        } else if (checkisvalidnumber($('#txtb_restore_deduct').val().trim()) == false) {
            $("#txtb_restore_deduct").addClass("required");
            $("#lbl_txtb_restore_deduct_req").text("Invalid Number !");
            return_val = false;
        }

        if ($('#txtb_abs_und_wp').val().trim() == "") {
            ValidationResultColor("txtb_abs_und_wp", true);
            return_val = false;
        } else if (checkisvalidnumber($('#txtb_abs_und_wp').val().trim()) == false) {
            $("#txtb_abs_und_wp").addClass("required");
            $("#lbl_txtb_abs_und_wp_req").text("Invalid Number !");
            return_val = false;
        }

        if ($('#txtb_balance_as_of').val().trim() == "") {
            ValidationResultColor("txtb_balance_as_of", true);
            return_val = false;
        } else if (checkisvalidnumber($('#txtb_balance_as_of').val().trim()) == false) {
            $("#txtb_balance_as_of").addClass("required");
            $("#lbl_txtb_balance_as_of_req").text("Invalid Number !");
            return_val = false;
        }
        
        if ($('#txtb_abs_und_wop').val().trim() == "") {
            ValidationResultColor("txtb_abs_und_wop", true);
            return_val = false;
        } else if (checkisvalidnumber($('#txtb_abs_und_wop').val().trim()) == false) {
            $("#txtb_abs_und_wop").addClass("required");
            $("#lbl_txtb_abs_und_wop_req").text("Invalid Number !");
            return_val = false;
        }

        if (s.ddl_leave_type == 'MZ' || s.ddl_leave_type == 'TL')
        {
            if (parseFloat(s.txtb_abs_und_wp_vl) > parseFloat(s.txtb_balance_as_of_vl)) {
                $("#txtb_abs_und_wp_vl").addClass("required");
                $("#lbl_txtb_abs_und_wp_vl_req").text("Should not be greater than VL Bal.!");
                return_val = false;
            }
            if (parseFloat(s.txtb_abs_und_wp_sl) > parseFloat(s.txtb_balance_as_of_sl)) {
                 $("#txtb_abs_und_wp_sl").addClass("required");
                 $("#lbl_txtb_abs_und_wp_sl_req").text("Should not be greater than SL Bal.!");
                 return_val = false;
             }
        }
        
        return return_val;
    }
    //************************************************//
    //***VJA - 02/29/2020 - Validation for Nunber****//
    //**********************************************//
    function checkisvalidnumber(i) {
        var regex_spchar = /[^a-zA-Z0-9\s]\.\,/;
        var regex_upper = /[A-Z]/;
        var regex_lower = /[a-z]/;
        var istrue = false;

        if (regex_upper.test(i) == true ||
            regex_lower.test(i) == true ||
            regex_spchar.test(i) == true) {
            istrue = false
        } else {
            istrue = true
        }
        return istrue
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
    //***********************************************************//
    //*** VJA - 2021-06-03 - Toogle Textboxes and Modal
    //***********************************************************// 
    s.SelectEntryType = function()
    {
        s.LedgerInfoCurr();
        s.LeaveType_MZ_TL();

        if (s.ADDEDITMODE == "ADD" )
        {
            s.id_leave_dtl_show = false;
            s.dis_entry_type    = false;
            s.dis_leave_type    = false;
            s.show_Automated    = false;
        }
        else if (s.ADDEDITMODE == "EDIT" )
        {
            s.id_leave_dtl_show = true;
            s.dis_entry_type    = true;
            s.dis_leave_type    = true;
            s.show_Automated    = true;
        }
        else if (s.ADDEDITMODE == "POST")
        {
            s.id_leave_dtl_show = false;
        }

        // Automated Leave
        if (s.ddl_entry_type == '1') {
            s.hide_txtb_restore_deduct_hdr = true;
            s.hide_txtb_abs_und_wp_hdr = true;
            s.hide_txtb_balance_as_of_hdr = true;
            s.hide_txtb_abs_und_wop_hdr = true;
            s.dis_txtb_no_of_days = true;
            s.dis_txtb_balance_as_of_hdr = false;
            s.id_leave_dtl_show = false;
            s.hide_txtb_no_of_days = true;
            s.show_Automated = false;

            if (s.ddl_rep_mode == '3') {
                if (s.ADDEDITMODE == "ADD") {
                    s.id_leave_dtl_show = false;
                    s.show_Automated = true;
                    s.dis_leave_type = true;
                    s.ddl_leave_type = "CTO"
                    s.hide_txtb_restore_deduct_hdr = false;
                    s.hide_txtb_balance_as_of_hdr = false;
                    s.hide_txtb_abs_und_wp_hdr = true;
                    s.hide_txtb_abs_und_wop_hdr = true;
                    s.dis_txtb_balance_as_of_hdr = true;
                }
                else if (s.ADDEDITMODE == "EDIT") {
                    s.id_leave_dtl_show = true;
                    s.show_Automated = true;
                    s.dis_leave_type = true;
                    //s.ddl_leave_type    = "CTO"
                }
                s.show_txtb_restore_deduct = true;
            }
            else {
                if (s.ADDEDITMODE == "ADD") {
                    s.id_leave_dtl_show = false;
                    s.show_Automated = false;
                    s.dis_leave_type = true;
                    s.ddl_leave_type = "VL"
                }
                else if (s.ADDEDITMODE == "EDIT") {
                    s.id_leave_dtl_show = true;
                    s.show_Automated = true;
                    s.dis_leave_type = true;
                    //s.ddl_leave_type    = "VL"
                }
                s.show_txtb_restore_deduct = true;
            }

        }
        // Leave adjustment 
        else if (s.ddl_entry_type == '3') {
            s.hide_txtb_restore_deduct_hdr = false;
            s.hide_txtb_abs_und_wp_hdr = false;
            s.hide_txtb_balance_as_of_hdr = false;
            s.hide_txtb_abs_und_wop_hdr = false;
            s.dis_txtb_no_of_days = true;
            s.dis_txtb_balance_as_of_hdr = false;
            s.id_leave_dtl_show = false;
            s.hide_txtb_no_of_days = false;

            s.show_Automated = true;
            s.dis_leave_type = false;
            s.show_txtb_restore_deduct = true;

            if (s.ddl_rep_mode == '3') {
                s.dis_leave_type = true;
                s.ddl_leave_type = "CTO"
            }
        }
        // Leave Application
        else if (s.ddl_entry_type == '2') {
            s.hide_txtb_restore_deduct_hdr = true;
            s.hide_txtb_abs_und_wp_hdr = true;
            s.hide_txtb_balance_as_of_hdr = false;
            s.hide_txtb_abs_und_wop_hdr = true;
            s.dis_txtb_no_of_days = false;
            s.dis_txtb_balance_as_of_hdr = true;
            s.hide_txtb_no_of_days = false;

            s.show_Automated = true;

            if (s.ADDEDITMODE == "ADD") {
                s.id_leave_dtl_show = false;
                s.dis_leave_type = false;
            }
            else if (s.ADDEDITMODE == "EDIT") {
                s.id_leave_dtl_show = true;
                s.dis_leave_type = true;
            }
            else if (s.ADDEDITMODE == "POST") {
                s.dis_leave_type = true;
                s.dis_entry_type = true;
            }
            s.show_txtb_restore_deduct = false;

            if (s.ddl_rep_mode == '3') {
                s.dis_leave_type = true;
                s.ddl_leave_type = "CTO"
            }
        }
        // Suspension
        else if (s.ddl_entry_type == '4')
        {
            s.hide_txtb_restore_deduct_hdr = true;
            s.hide_txtb_abs_und_wp_hdr = true;
            s.hide_txtb_balance_as_of_hdr = false;
            s.hide_txtb_abs_und_wop_hdr = true;
            s.dis_txtb_no_of_days = false;
            s.dis_txtb_balance_as_of_hdr = true;
            s.hide_txtb_no_of_days = false;

            s.show_Automated = true;
            s.show_txtb_restore_deduct = false;
        }
    }
    //***********************************************************//
    //*** VJA -  2021-06-03 - Set the number of Days
    //***********************************************************// 
    s.SetNumberofDays = function ()
    {
        var total_nbr_of_days = 0;

        // Automated Leave
        if (s.ddl_entry_type == '1') 
        {
            total_nbr_of_days = 0;
        }
        // Leave adjustment
        else if (s.ddl_entry_type == '3') 
        {
            // This Changes if for RA 292 - Dapat Dle maapil ang No of Days.
            if (s.ddl_leave_type == 'VL')
            {
                total_nbr_of_days = 0;
            }
            else
            {
                total_nbr_of_days = total_nbr_of_days + parseFloat(s.txtb_abs_und_wp_hdr.replace(",", "").replace(",", "").replace(",", ""));
                total_nbr_of_days = total_nbr_of_days + parseFloat(s.txtb_abs_und_wop_hdr.replace(",", "").replace(",", "").replace(",", ""));
            }
        }
        // Leave Application
        else if (s.ddl_entry_type == '2') 
        {
            total_nbr_of_days = 0;
        }
        s.txtb_no_of_days = total_nbr_of_days;
    }
    //**********************************************
    // Refresh Employee List in Dropdown
    //**********************************************
    s.SelectLeaveType = function ()
    {
        h.post("../cLeaveLedger/GetLeaveType",
        {
            par_leavetype_code: s.ddl_leave_type
        }).then(function (d) {

            s.leavetype_description = $("#ddl_leave_type option:selected").html() == 'Select Here' ? 'Leave Description' : $("#ddl_leave_type option:selected").html()
            s.leave_sub_type        = d.data.leave_subType_lst;
            s.ToogleBy_LeaveType();
        });
    }

    //**********************************************
    // Populate Restore Deduct
    //**********************************************
    s.RestoreDeductValue = function ()
    {
        if (s.ddl_entry_type == '2')
        {
            var restore_deduct  = 0;
            restore_deduct      = 0 - parseFloat(s.txtb_abs_und_wp.replace(",", "").replace(",", "").replace(",", ""));
            s.txtb_restore_deduct = restore_deduct;
        }
    }
    //********************************************************
    // This Portion is for Monitezation and Terminal Leave
    //********************************************************
    s.LeaveType_MZ_TL = function()
    {
        if (s.ddl_entry_type == '2' && (s.ddl_leave_type == 'MZ' || s.ddl_leave_type == 'TL'))
        {
            s.show_Automated                = false;
            s.show_txtb_restore_deduct_vl   = false;
            s.show_txtb_restore_deduct_sl   = false;
            s.show_txtb_abs_und_wop_vl      = false;
            s.show_txtb_abs_und_wop_sl      = false;
            s.dis_txtb_no_of_days           = true;
            s.hide_txtb_balance_as_of_hdr   = true;
            $('#lbl_abs_und_wp_vl').text("-- Ded. - VL:"); 
            $('#lbl_abs_und_wp_sl').text("-- Ded. - SL:"); 
        }
        else
        {
            s.show_Automated                = true;
            s.show_txtb_restore_deduct_vl   = true;
            s.show_txtb_restore_deduct_sl   = true;
            s.show_txtb_abs_und_wop_vl      = true;
            s.show_txtb_abs_und_wop_sl      = true;
            s.dis_txtb_no_of_days           = false;
            s.hide_txtb_balance_as_of_hdr   = false;
            $('#lbl_abs_und_wp_vl').text("-- Abs/Und.WP:");
            $('#lbl_abs_und_wp_sl').text("-- Abs/Und.WP:");
        }
    }
    //********************************************************************************
    // This Portion is for Monitezation and Terminal Leave Toogle and Validation
    //********************************************************************************
    s.LeaveType_MZ_TL_Toogle = function ()
    {
        if (s.ddl_leave_type == 'MZ' || s.ddl_leave_type == 'TL')
        {
            var no_of_days = 0;
            no_of_days = no_of_days + parseFloat(s.txtb_abs_und_wp_vl.replace(",", "").replace(",", "").replace(",", ""));
            no_of_days = no_of_days + parseFloat(s.txtb_abs_und_wp_sl.replace(",", "").replace(",", "").replace(",", ""));
            s.txtb_no_of_days = no_of_days.toFixed(3);
        }
    }
    //************************************// 
    //*** Post Record              
    //**********************************// 
    s.btn_cancel_posting = function (row_id)
    {
        if (s.datalistgrid[row_id].approval_status == 'D' ||
            s.datalistgrid[row_id].approval_status == 'L' ||
            s.datalistgrid[row_id].leaveledger_entry_type == 'T' 
        )
        {
            swal("You cannot Edit, Delete, Print and Cancel Posted", "Data already Disapproved or Cancelled", { icon: "warning", });
        }
        
        else if (s.datalistgrid[row_id].approval_status == 'F' && s.datalistgrid[row_id].leaveledger_entry_type == '1')
        {
            swal("You cannot restore this record", "Data already final Approved", { icon: "warning", });
        }
        else
        {
            swal("Are you sure to Cancel Posted Record and Restore Balance?","You can choose what cancellation in the following;", {
                icon: "warning",
                content: "input",
                buttons: {
                    //cancel_only: {
                    //    text : "Data Correction Only",
                    //    value: "cancel_only",
                    //},
                    cancel_with_ss: {
                        text: "Restore Leave Application Balance",
                        value: "cancel_with_ss",
                    },
                    defeat: {
                        value: "defeat",
                        text: "Close"
                    },
                },
            }).then((value) => {
                    switch (value) {

                        //case "cancel_only":
                            
                        //    h.post("../cLeaveLedger/CancelLederPosted",
                        //        {
                        //            par_ledger_ctrl_no    : s.datalistgrid[row_id].ledger_ctrl_no
                        //            ,par_leaveledger_date : s.datalistgrid[row_id].leaveledger_date
                        //            , par_execute_mode    : "cancel_only"
                        //            ,par_leave_ctrlno     : s.datalistgrid[row_id].leave_ctrlno
                        //            , par_approval_id     : s.datalistgrid[row_id].approval_id

                        //        }).then(function (d) {
                        //         if (d.data.message == "success") {
                             
                        //             if (d.data.data.result_flag == "Y") {
                        //                 swal("Your record has been cancelled!", d.data.data.result_msg, { icon: "success" });
                        //                 s.FilterPageGrid($("#ddl_name option:selected").val());
                        //             }
                        //             else {
                        //                 swal("There something wrong!", d.data.data.result_msg, { icon: "warning" });
                        //                 s.FilterPageGrid($("#ddl_name option:selected").val());
                        //             }
                             
                        //         }
                        //         else {
                        //             swal("There something wrong!", d.data.message, { icon: "warning" });
                        //             s.FilterPageGrid($("#ddl_name option:selected").val());
                        //         }
                        //     })
                        //    break;

                        case "cancel_with_ss":
                            $("#modal_initializing").modal({ keyboard: false, backdrop: "static" })
                            h.post("../cLeaveLedger/CancelLederPosted",
                                {
                                    par_ledger_ctrl_no    : s.datalistgrid[row_id].ledger_ctrl_no
                                    ,par_leaveledger_date : s.datalistgrid[row_id].leaveledger_date
                                    , par_execute_mode    : "cancel_with_ss"
                                    ,par_leave_ctrlno     : s.datalistgrid[row_id].leave_ctrlno
                                    , par_approval_id     : s.datalistgrid[row_id].approval_id
                                    , empl_id     : s.datalistgrid[row_id].empl_id
                                    
                                }).then(function (d) {
                                 if (d.data.message == "success") {
                             
                                     if (d.data.data.result_flag == "Y") {
                                         swal("Your record has been cancelled!", d.data.data.result_msg, { icon: "success" });
                                         
                                         s.FilterPageGrid($("#ddl_name option:selected").val());
                                     }
                                     else {
                                         swal("There something wrong!", d.data.data.result_msg, { icon: "warning" });
                                         
                                         s.FilterPageGrid($("#ddl_name option:selected").val());
                                     }
                             
                                 }
                                 else {
                                     swal("There something wrong!", d.data.message, { icon: "warning" });
                                     
                                     s.FilterPageGrid($("#ddl_name option:selected").val());
                                 }
                             })
                            break;

                        default:
                            //swal("Cancel Request!");
                    }
                });
        }
    }

    //**********************************************
    // Refresh Employee List in Dropdown
    //**********************************************
    s.SelectLeaveType_dtl = function () {
        h.post("../cLeaveLedger/GetLeaveType",
            {
                par_leavetype_code: s.ddl_leave_type_dtl
        }).then(function (d) {
                
            s.leave_sub_type_dtl = d.data.leave_subType_lst;
        });
    }

    //************************************// 
    //*** Add for Leave Ledger Details       
    //**********************************//
    s.btn_add_dtl_click = function ()
    {
        s.txtb_balance_as_of     = "0.000";
        s.txtb_restore_deduct    = "0.000";
        s.txtb_abs_und_wp        = "0.000";
        s.txtb_abs_und_wop       = "0.000";
        s.ddl_leave_type_dtl     = "";
        s.ddl_leave_sub_type_dtl = "";
        s.ADDEDITMODE_DTL        = "ADD"
        s.dis_ddl_leave_type_dtl = false;
        s.dis_ddl_leavesub_type_dtl = false;

        s.LeaveType_MZ_TL();
        s.ToogleBy_LeaveType();

        //**********************************************
        //  Set Description or Label for Number of ---
        //**********************************************
        s.lbl_nbr_days_hrs = "No. of Days:";
        if (s.ddl_leave_type == "CTO" ||
            s.ddl_rep_mode == "3") // CTO Card Viewing
        {
            s.lbl_nbr_days_hrs = "No. of Hours:";
        }
        //**********************************************
        //**********************************************

        $('#modal_leave_ledger_dtl').modal({ backdrop: 'static', keyboard: false })
    }
    
    //***********************************************************//
    //*** VJA -  2021-06-03 - Button for Edit Balance Details 
    //***********************************************************//
    s.btn_edit_bal = function (row_id)
    {
        s.txtb_balance_as_of     = "0.000";
        s.txtb_restore_deduct    = "0.000";
        s.txtb_abs_und_wp        = "0.000";
        s.txtb_abs_und_wop       = "0.000";
        s.ddl_leave_type_dtl     = "";
        s.ddl_leave_sub_type_dtl = "";
        s.ADDEDITMODE_DTL        = "EDIT"
        s.dis_ddl_leave_type_dtl = true;
        s.dis_ddl_leavesub_type_dtl = true;

        s.txtb_ledger_ctrl_no    = s.datalistgrid4[row_id].ledger_ctrl_no;
        s.ddl_leave_type_dtl     = s.datalistgrid4[row_id].leavetype_code;
        s.ddl_leave_sub_type_dtl = s.datalistgrid4[row_id].leavesubtype_code;
        s.txtb_balance_as_of     = s.datalistgrid4[row_id].leaveledger_balance_as_of;
        s.txtb_restore_deduct    = s.datalistgrid4[row_id].leaveledger_restore_deduct;
        s.txtb_abs_und_wp        = s.datalistgrid4[row_id].leaveledger_abs_und_wp;
        s.txtb_abs_und_wop       = s.datalistgrid4[row_id].leaveledger_abs_und_wop;
        s.SelectLeaveType_dtl();
        s.LeaveType_MZ_TL();
        
        $('#modal_leave_ledger_dtl').modal({ backdrop: 'static', keyboard: false })
    }

    //************************************// 
    //*** Save for Leave Ledger Details       
    //**********************************//
    s.btn_save_dtl_click = function ()
    {
        // This Data is for Edit on Details
        var data3 = {

            ledger_ctrl_no               : s.txtb_ledger_ctrl_no
            ,leavetype_code              : s.ddl_leave_type_dtl 
            ,leavesubtype_code           : s.ddl_leave_sub_type_dtl
            ,leaveledger_balance_as_of   : s.txtb_balance_as_of
            ,leaveledger_restore_deduct  : s.txtb_restore_deduct
            ,leaveledger_abs_und_wp      : s.txtb_abs_und_wp
            ,leaveledger_abs_und_wop     : s.txtb_abs_und_wop
        }

        if (s.ADDEDITMODE_DTL == "ADD")
        {
            h.post("../cLeaveLedger/Save_Details", {
                data: data3
            }).then(function (d) {
                if (d.data.message == "success")
                {
                    s.GetLedgerDetails();
                    s.GetSumofLeaveDetails();
                    s.FilterPageGrid($("#ddl_name option:selected").val());
                    s.SelectEntryType();
                    s.SelectLeaveType();

                    $('#modal_leave_ledger_dtl').modal("hide");
                    swal("Record Successfully Added", "Your record has been successfully added!", { icon: "success", });
                }
                else
                {
                    swal(d.data.message, { icon: "warning", });
                }
            });
        }
        else if (s.ADDEDITMODE_DTL == "EDIT")
        {
            h.post("../cLeaveLedger/UpdateBal", {
                data: data3
            }).then(function (d) {
                if (d.data.message == "success")
                {
                    s.GetLedgerDetails();
                    s.GetSumofLeaveDetails();
                    s.FilterPageGrid($("#ddl_name option:selected").val());
                    s.SelectEntryType();
                    s.SelectLeaveType();
                    s.ToogleBy_LeaveType();

                    $('#modal_leave_ledger_dtl').modal("hide");
                    swal("Record Successfully Updated", "Your record has been successfully updated!", { icon: "success", });
                }
                else
                {
                    swal(d.data.message, { icon: "warning", });
                }
            });
        }
    }
    //************************************// 
    //*** Delete Header and Details Record              
    //**********************************// 
    s.btn_delete_bal = function (row_id) {
        
        swal({
            title: "Are you sure to delete this record?",
            text: "Once deleted, you will not be able to recover this record!",
            icon: "warning",
            buttons: true,
            dangerMode: true,

        }).then(function (willDelete) {
                if (willDelete) {
                    var data =
                    {
                        ledger_ctrl_no: s.datalistgrid4[row_id].ledger_ctrl_no,
                        leavetype_code: s.datalistgrid4[row_id].leavetype_code
                    };
                    h.post("../cLeaveLedger/Delete_dtl", { data: data }).then(function (d)
                    {
                        if (d.data.message == "success")
                        {
                            s.GetLedgerDetails();
                            s.GetSumofLeaveDetails();
                            s.FilterPageGrid($("#ddl_name option:selected").val());
                            s.SelectEntryType();
                            s.SelectLeaveType();
                            s.ToogleBy_LeaveType();

                            swal("Record Successfully Delete", "Your record has been successfully deleted!", { icon: "success", });
                        }
                        else
                        {
                            swal(d.data.message, { icon: "warning", });
                        }
                    })
                }
            });
    }

    //************************************// 
    //*** Save for Leave Ledger Details       
    //**********************************//
    s.GetSumofLeaveDetails = function ()
    {
        h.post("../cLeaveLedger/GetSumofLeaveDetails",
            {
            par_ledger_ctrl_no   : s.txtb_ledger_ctrl_no
            ,par_leavetype_code  : s.ddl_leave_type
            ,par_empl_id         : s.txtb_empl_id 
            ,par_year            : str_to_year($("#txtb_dtr_mon_year").val())
        }).then(function (d)
        {
            s.txtb_no_of_days           = d.data.sum_wp_and_wop;
        })
    }
    //************************************// 
    //*** Save for Leave Ledger Details       
    //**********************************//
    s.GetLedgerDetails = function ()
    {
        h.post("../cLeaveLedger/GetLedgerDetails",
            {
                par_ledger_ctrl_no: s.txtb_ledger_ctrl_no
        }).then(function (d) {
            if (d.data.message == "success")
            {
                s.oTable4.fnClearTable();
                s.datalistgrid4 = d.data.lv_ledger_dtl_tbl_list;
                if (d.data.lv_ledger_dtl_tbl_list.length > 0)
                {
                    s.oTable4.fnAddData(d.data.lv_ledger_dtl_tbl_list);
                }
            }
            else
            {
                swal(d.data.message, { icon: "warning", });
            }
        });
    }
    //*************************************************//
    //*** Toogle Page Mode by Leave Type Code ********//
    //***********************************************//
    s.LedgerInfoCurr = function ()
    {
        s.txtb_balance_as_of_hdr = "0.000";
        s.txtb_balance_as_of_vl  = "0.000";
        s.txtb_balance_as_of_sl  = "0.000";
        s.txtb_abs_und_wp_vl     = "0.000";
        s.txtb_restore_deduct_sl = "0.000";
        s.txtb_restore_deduct_vl = "0.000";

        h.post("../cLeaveLedger/LedgerInfoCurr",
            {
                par_empl_id         : s.txtb_empl_id
                ,par_leavetype_code : s.ddl_leave_type
                ,par_year           : str_to_year($("#txtb_dtr_mon_year").val())
                ,par_month          : month_name_to_int($("#txtb_dtr_mon_year").val())

        }).then(function (d) 
        {
            if (s.ADDEDITMODE == "ADD")
            {
                
                s.txtb_balance_as_of_hdr = d.data.bal_as_of;
                s.txtb_balance_as_of_vl  = d.data.bal_as_of_vl;
                s.txtb_balance_as_of_sl  = d.data.bal_as_of_sl;
                
                s.txtb_abs_und_wp_vl = d.data.total_undertime.equiv_to_day

                if (s.ddl_entry_type == '1')
                {
                    s.txtb_restore_deduct_sl = "1.250";
                    s.txtb_restore_deduct_vl = "1.250";
                }
            }
            if (s.ADDEDITMODE == "POST" && (s.ddl_leave_type == 'MZ' || s.ddl_leave_type == 'TL'))
            {
                s.txtb_balance_as_of_hdr = d.data.bal_as_of;
                s.txtb_balance_as_of_vl  = d.data.bal_as_of_vl;
                s.txtb_balance_as_of_sl  = d.data.bal_as_of_sl;
                
                s.txtb_abs_und_wp_vl = d.data.total_undertime.equiv_to_day

                if (s.ddl_leave_type == 'TL')
                {
                    s.txtb_abs_und_wp_vl = d.data.bal_as_of_vl;
                    s.txtb_abs_und_wp_sl = d.data.bal_as_of_sl;
                    console.log(d.data)
                    s.txtb_no_of_days = parseFloat(d.data.bal_as_of_vl) + parseFloat(d.data.bal_as_of_sl) == "64.96000000000001" ? "64.96" : parseFloat(d.data.bal_as_of_vl + d.data.bal_as_of_sl).toFixed(3)
                    // JS Issues : Naay decimal pag e plus (49.5 + 15.46)
                    s.txtb_particulars = s.txtb_no_of_days + "-0-0";
                }

                if (s.ddl_entry_type == '1')
                {
                    s.txtb_restore_deduct_sl = "1.250";
                    s.txtb_restore_deduct_vl = "1.250";
                }
            }

        }); 
    }
    //*************************************************//
    //*** Toogle Page Mode by Leave Type Code ********//
    //***********************************************//
     s.ToogleBy_LeaveType = function()
     {
         s.LedgerInfoCurr();

        //*************************************************//
        //*** START Condtion for LEAVE TYPE **************//
        //***********************************************//

        s.show_btn_add_dtl       = false
        s.show_Automated         = false;
        s.show_btn_add_dtl       = false;
        s.dis_ddl_leave_type_dtl = false; 
        s.LeaveType_MZ_TL();

        switch (s.ddl_leave_type)
        {
            case "SP":
                s.show_btn_add_dtl = true;
                break;

            case "MZ":
            case "TL":
                if (s.ADDEDITMODE == "EDIT")
                {
                    s.show_Automated = true;
                }
                else if (s.ADDEDITMODE == "POST")
                {
                    s.show_Automated = false;
                }
                break;

            case "SL":
            case "VL":
                s.show_btn_add_dtl       = true;
                // s.dis_ddl_leave_type_dtl = true; 
                s.ddl_leave_type_dtl     = "SP"
                s.SelectLeaveType_dtl();

            case "FL":
            case "PL":
            case "PS":
                s.show_btn_add_dtl       = true;
                s.SelectLeaveType_dtl();
                break
            case "CTO": // CTO Only
                s.show_Automated        = true;
                s.hide_txtb_balance_as_of_hdr = false;
                s.dis_leave_type        = true;
                s.ddl_leave_type        = "CTO"

                if (s.ddl_rep_mode == '2')
                {
                    s.dis_leave_type = false;
                }
                

                break;

            default:
            // code block
        }
        //*************************************************//
        //*** END Condtion for LEAVE TYPE **************//
        //***********************************************//
    }
    
    //*************************************************//
    //***  VJA : Populate Approval ID ****************//
    //***********************************************//
    s.GetApproval_ID_Appl = function ()
    {
        // s.txtb_approval_id = "";
        // 
        // h.post("../cLeaveLedger/GetApproval_ID_Appl", {
        //     par_leave_ctrlno: s.txtb_leave_ctrlno
        // }).then(function (d)
        // {
        //     if (d.data.message == "success")
        //     {
        //         s.txtb_approval_id = d.data.approval_id
        //     }
        // }); 
    }
    
    //*************************************************//
    //***  VJA : Populate Particulars ****************//
    //***********************************************//
    s.Populate_Particulars = function ()
    {
        h.post("../cLeaveLedger/RetrieveEmployeeUnderTime", {
             par_empl_id  : $("#ddl_name option:selected").val() == "" ? "" : $("#ddl_name option:selected").val()
            , par_month   : month_name_to_int($("#txtb_dtr_mon_year").val())
            , par_year    : str_to_year($("#txtb_dtr_mon_year").val())
        }).then(function (d) {
            if (d.data.message == "success")
            {
                // Particular Format will be - Day/s - Hour/s - Min/s
                s.txtb_particulars = "0-0-0";

                var str_days = "0";
                var str_hrs  = "0";
                var str_min  = "0";

                var undertime        = d.data.total_undertime[0].total_underTime;
                var undertime_hrs    = 0;
                var undertime_min    = 0;
                undertime_hrs        = parseInt(undertime / 60) 
                undertime_min        = undertime - (undertime_hrs * 60)

                str_hrs = undertime_hrs;
                str_min = undertime_min;
                
                s.txtb_particulars = str_days + "-" + str_hrs + "-" + str_min;
            }
        });
    }

    //*************************************************//
    //***  VJA : Populate Particulars ****************//
    //***********************************************//
    //s.Populate_ApprovalHistory = function ()
    //{
    //    h.post("../cLeaveLedger/ApprovalHistory",
    //    {
    //        par_leave_ctlno: s.txtb_leave_ctrlno
    //    }).then(function (d) {
    //        if (d.data.message_descr == "success") {


    //            s.level1_approval_comment       = d.data.data.level1_approval_comment
    //            s.level2_approval_comment       = d.data.data.level2_approval_comment
    //            s.final_approval_comment        = d.data.data.final_approval_comment
    //            s.disapproval_comment           = d.data.data.disapproval_comment
    //            s.cancel_pending_comment        = d.data.data.cancel_pending_comment
    //            s.cancelled_comment             = d.data.data.cancelled_comment
    //            s.user_id_creator               = d.data.data.user_id_creator
    //            s.employee_name_creator         = d.data.data.employee_name_creator
    //            s.user_id_reviewer              = d.data.data.user_id_reviewer
    //            s.employee_name_reviewer        = d.data.data.employee_name_reviewer
    //            s.user_id_level1_approver       = d.data.data.user_id_level1_approver
    //            s.employee_name_level1_approver = d.data.data.employee_name_level1_approver
    //            s.user_id_level2_approver       = d.data.data.user_id_level2_approver
    //            s.employee_name_level2_approver = d.data.data.employee_name_level2_approver
    //            s.user_id_final_approver        = d.data.data.user_id_final_approver
    //            s.employee_name_final_approver  = d.data.data.employee_name_final_approver
    //            s.user_id_disapprover           = d.data.data.user_id_disapprover
    //            s.employee_name_disapprover     = d.data.data.employee_name_disapprover
    //            s.user_id_cancel_pending        = d.data.data.user_id_cancel_pending
    //            s.employee_name_cancel_pending = d.data.data.employee_name_cancel_pending

    //            s.reviewed_date                 = d.data.data.reviewed_date          == "1900-01-01 12:00:00 AM" ? "----" : d.data.data.reviewed_date          ;
    //            s.level1_approval_date          = d.data.data.level1_approval_date   == "1900-01-01 12:00:00 AM" ? "----" : d.data.data.level1_approval_date   ;
    //            s.level2_approval_date          = d.data.data.level2_approval_date   == "1900-01-01 12:00:00 AM" ? "----" : d.data.data.level2_approval_date   ;
    //            s.final_approval_date           = d.data.data.final_approval_date    == "1900-01-01 12:00:00 AM" ? "----" : d.data.data.final_approval_date    ;
    //            s.disapproval_date              = d.data.data.disapproval_date       == "1900-01-01 12:00:00 AM" ? "----" : d.data.data.disapproval_date       ;
    //            s.cancel_pending_date           = d.data.data.cancel_pending_date    == "1900-01-01 12:00:00 AM" ? "----" : d.data.data.cancel_pending_date    ;
    //            s.cancelled_date                = d.data.data.cancelled_date         == "1900-01-01 12:00:00 AM" ? "----" : d.data.data.cancelled_date         ;
    //            s.created_dttm                  = moment(d.data.leave_appl.created_dttm).format("YYYY-MM-DD hh:mm:ss A").trim()    == "1900-01-01 12:00:00 pm" ? "----" : moment(d.data.leave_appl.created_dttm).format("YYYY-MM-DD hh:mm:ss A")    ;


    //            // POSTING HISTORY

    //            s.level1_approval_comment_posting       = d.data.data_posting.level1_approval_comment
    //            s.level2_approval_comment_posting       = d.data.data_posting.level2_approval_comment
    //            s.final_approval_comment_posting        = d.data.data_posting.final_approval_comment
    //            s.disapproval_comment_posting           = d.data.data_posting.disapproval_comment
    //            s.cancel_pending_comment_posting        = d.data.data_posting.cancel_pending_comment
    //            s.cancelled_comment_posting             = d.data.data_posting.cancelled_comment
    //            s.user_id_creator_posting               = d.data.data_posting.user_id_creator
    //            s.employee_name_creator_posting         = d.data.data_posting.employee_name_creator
    //            s.user_id_reviewer_posting              = d.data.data_posting.user_id_reviewer
    //            s.employee_name_reviewer_posting        = d.data.data_posting.employee_name_reviewer
    //            s.user_id_level1_approver_posting       = d.data.data_posting.user_id_level1_approver
    //            s.employee_name_level1_approver_posting = d.data.data_posting.employee_name_level1_approver
    //            s.user_id_level2_approver_posting       = d.data.data_posting.user_id_level2_approver
    //            s.employee_name_level2_approver_posting = d.data.data_posting.employee_name_level2_approver
    //            s.user_id_final_approver_posting        = d.data.data_posting.user_id_final_approver
    //            s.employee_name_final_approver_posting  = d.data.data_posting.employee_name_final_approver
    //            s.user_id_disapprover_posting           = d.data.data_posting.user_id_disapprover
    //            s.employee_name_disapprover_posting     = d.data.data_posting.employee_name_disapprover
    //            s.user_id_cancel_pending_posting        = d.data.data_posting.user_id_cancel_pending
    //            s.employee_name_cancel_pending_posting  = d.data.data_posting.employee_name_cancel_pending
                
    //            s.level1_approval_date_posting          = d.data.data_posting.level1_approval_date   == "1900-01-01 12:00:00 AM" ? "----" : d.data.data_posting.level1_approval_date   ;
    //            s.level2_approval_date_posting          = d.data.data_posting.level2_approval_date   == "1900-01-01 12:00:00 AM" ? "----" : d.data.data_posting.level2_approval_date   ;
    //            s.final_approval_date_posting           = d.data.data_posting.final_approval_date    == "1900-01-01 12:00:00 AM" ? "----" : d.data.data_posting.final_approval_date    ;
    //            s.disapproval_date_posting              = d.data.data_posting.disapproval_date       == "1900-01-01 12:00:00 AM" ? "----" : d.data.data_posting.disapproval_date       ;
    //            s.cancel_pending_date_posting           = d.data.data_posting.cancel_pending_date    == "1900-01-01 12:00:00 AM" ? "----" : d.data.data_posting.cancel_pending_date    ;
    //            s.cancelled_date_posting                = d.data.data_posting.cancelled_date         == "1900-01-01 12:00:00 AM" ? "----" : d.data.data_posting.cancelled_date         ;

    //            if (d.data.lv_hdr != null)
    //            {
    //                s.created_dttm_posting = moment(d.data.lv_hdr.created_dttm).format("YYYY-MM-DD hh:mm:ss A").trim() == "1900-01-01 12:00:00 AM" ? "----" : moment(d.data.lv_hdr.created_dttm).format("YYYY-MM-DD hh:mm:ss A").trim();
    //            }

    //            s.txtb_approval_id = d.data.data_posting.approval_id
    //        }
    //        else {
    //            swal('Error in Getting Approval History', d.data.message_descr, {icon:"warning"})
    //        }
    //    });
    //}
    //*************************************************//
    //***  VJA : Populate Particulars ****************//
    //***********************************************//
    s.btn_cancel_disapprove = function (approval_status)
    {
        ValidationResultColor("ALL", false);

        var appr_status     = "";
        var swal_title      = "";
        var swal_header = "";
        var text_descr = "";

        var data =
        {
            leave_ctrlno        : s.txtb_leave_ctrlno
            , approval_status   : approval_status
            , details_remarks   : s.txtb_remarks
            , approval_id       : s.txtb_approval_id
            , empl_id           : s.txtb_empl_id
        }

        if (approval_status == "D")
        {
            appr_status = "Disapprove"
            text_descr = ", employee must apply again leave application"
        }
        else if (approval_status == "C")
        {
            appr_status = "Cancel Pending"
            text_descr = ", employee can edit the leave application"
        }


        if ($('#txtb_remarks').val().trim() == "")
        {
            ValidationResultColor("txtb_remarks", true);
            return;
        }
        else
        {
            swal("Do you want to " + appr_status + " this Application?", "Once you " + appr_status + text_descr + " \n \n " + appr_status + " Remarks: " + s.txtb_remarks, {
            icon: "warning",
                buttons: {
                    submit_appl: {
                        text: appr_status,
                        value: "submit_appl"
                    },
                    defeat: {
                        value: "defeat",
                        text: "Close"
                    },               
                },
            }).then((value) => {
                switch (value)
                {
                    case "submit_appl":
                        h.post("../cLeaveLedger/ApprReviewerAction", { data: data, ledger_ctrl_no: s.txtb_ledger_ctrl_no}).then(function (d)
                        {
                            if (d.data.message_descr == "success")
                            {
                                if (approval_status == "C")
                                {
                                    swal_title = "Application has been cancel pending successfully!";
                                }
                                else if (approval_status == "D")
                                {
                                    swal_header = "Your record Successfully Disapproved !";
                                    swal_title = "Application has been disapproved successfully!";
                                }
                                else
                                {
                                    swal_header = "Your record Successfully Cancel pending !";
                                    swal_title = "This is something wrong when Cancel or Disapprove";
                                }
                                $('#main_modal').modal("hide");
                                s.FilterPageGrid($("#ddl_name option:selected").val());
                                swal(swal_header,swal_title, { icon: "success" })
                            }
                            else
                            {
                                swal('Error in when Cancel or Disapprove', d.data.message_descr, {icon:"warning"})
                            }
                        });
                        break;
                    default:
                        
                }
            });
        }
    }

    //*************************************************//
    //***  VJA : Populate Particulars ****************//
    //***********************************************//
    s.TimeSked_HDR = function (empl_id,tse_year)
    {
        h.post("../cLeaveLedger/TimeSked_HDR",
            {
                par_empl_id    : empl_id
                ,par_tse_year  : tse_year
            }
        ).then(function (d)
        {
            if (d.data.message == "success")
            {
                s.time_sked_hdr = d.data.data;
                for (var i = 0; i < d.data.data.length; i++)
                {
                    if (d.data.data[i].approval_status == "F") {
                        d.data.data[i].color = "success";
                    }
                    else if (d.data.data[i].approval_status == "S") {
                        d.data.data[i].color = "warning";
                    }
                    else if (d.data.data[i].approval_status == "N")
                    {
                        d.data.data[i].color = "primary";
                    }
                    else if (d.data.data[i].approval_status == "D" ||
                        d.data.data[i].approval_status == "C" ||
                        d.data.data[i].approval_status == "L" ) {
                        d.data.data[i].color = "danger";
                    }
                    else
                    {
                        d.data.data[i].color = "info";
                    }
                }
            }
            else
            {
                swal(d.data.message, { icon: "warning" });
            }
        })
    }
    //*************************************************//
    //***  VJA : Populate Particulars ****************//
    //***********************************************//
    s.TimeSked_DTL = function (par_empl_id, par_month, par_year, par_effective_date)
    {
        $('#modal_initializing').modal({ backdrop: 'static', keyboard: false });
        s.time_sked_dtl = [];
        h.post("../cLeaveLedger/TimeSked_DTL",
        {
            par_empl_id: par_empl_id
            , par_month: par_month
            , par_year: par_year
            , par_effective_date: par_effective_date
        }).then(function (d)
        {
            if (d.data.message == "success")
            {
                s.time_sked_dtl = d.data.data;
                for (var i = 0; i < d.data.data.length; i++)
                {
                    if (d.data.data[i].day_type == "HOL")
                    {
                        d.data.data[i].day_type = "HOL";
                    }
                    else
                    {
                        d.data.data[i].day_type = "";
                    }
                }

                if (d.data.data.length >= 0)
                {
                    s.time_sked_hdr_title = s.month_int_to_name(par_month) + " - " + par_year;
                }
                
                $('#modal_initializing').modal("hide");
            }
            else
            {
                swal(d.data.message, { icon: "warning", });
                $('#modal_initializing').modal("hide");
            }
        })
    }
    
    s.month_int_to_name = function (month_int) {
        var name_mons = "January";

        if (month_int == "01") {
            name_mons = "January";
        }
        else if (month_int == "02") {
            name_mons = "February";
        }
        else if (month_int == "03") {
            name_mons = "March";
        }
        else if (month_int == "04") {
            name_mons = "April";
        }
        else if (month_int == "05") {
            name_mons = "May";
        }
        else if (month_int == "06") {
            name_mons = "June";
        }
        else if (month_int == "07") {
            name_mons = "July";
        }
        else if (month_int == "08") {
            name_mons = "August";
        }
        else if (month_int == "09") {
            name_mons = "September";
        }
        else if (month_int == "10") {
            name_mons = "October";
        }
        else if (month_int == "11") {
            name_mons = "November";
        }
        else if (month_int == "12") {
            name_mons = "December";
        }

        return name_mons;
    }

    s.RefreshDTR_PrintOnly = function ()
    {
        try
        {
            if (ValidateFields())
            {
                // $('#modal_initializing').modal({ backdrop: 'static', keyboard: false });

                var params_month = "";
                if (parseFloat(month_name_to_int($("#txtb_dtr_mon_year").val())) < 10)
                {
                    params_month = "0" + month_name_to_int($("#txtb_dtr_mon_year").val())
                }
                else
                {
                    params_month = month_name_to_int($("#txtb_dtr_mon_year").val())
                }
                
                var par_year            = str_to_year($("#txtb_dtr_mon_year").val());
                var par_mons            = params_month;
                var par_empl_id         = $("#ddl_name option:selected").val();
                var par_viewtype        = "0";
                var par_department_code = $("#ddl_dept option:selected").val();
                var par_user_id         = s.user_id;

                var employementtype = s.lv_empl_lst_wout_jo.filter(function (d) {
                    return d.empl_id == par_empl_id
                })[0].employment_type;


                var controller          = "Reports"
                var action              = "Index"
                var ReportName          = "CrystalReport"
                var SaveName            = "Crystal_Report"
                var ReportType          = "inline"
                var ReportPath          = ""
                var sp                  = ""


                ReportPath = "~/Reports/cryDTR/cryDTR.rpt";
                sp = "sp_dtr_rep,par_year," + par_year +
                    ",par_month," + par_mons +
                    ",par_empl_id," + par_empl_id +
                    ",par_view_type," + par_viewtype +
                    ",par_department_code," + par_department_code +
                    ",par_user_id," + par_user_id;
                        
                    // *******************************************************
                    // *** VJA : 2021-07-14 - Validation and Loading hide ****
                    // *******************************************************
                    //$("#modal_initializing").modal({ keyboard: false, backdrop: "static" })
                    var iframe = document.getElementById('iframe_print_preview4');
                    var iframe_page = $("#iframe_print_preview4")[0];
                    iframe.style.visibility = "hidden";

                    s.embed_link = "../Reports/CrystalViewer.aspx?Params=" + ""
                        + "&ReportName=" + ReportName
                        + "&SaveName=" + SaveName
                        + "&ReportType=" + ReportType
                        + "&ReportPath=" + ReportPath
                        + "&id=" + sp // + "," + parameters

                    if (!/*@cc_on!@*/0) { //if not IE
                        iframe.onload = function () {
                            iframe.style.visibility = "visible";
                            $("#modal_initializing").modal("hide")
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
                                $("#modal_initializing").modal("hide")
                            }
                        };
                    }

                    iframe.src = s.embed_link;
                    // *******************************************************
                    // *******************************************************
                        
            }
        }
        catch (err)
        {
            $("#modal_initializing").modal("hide")
            swal({ icon: "warning", title: err.message });

        }
    }


    s.RetrieveCardingReport = function (par_empl_id, par_date_from, par_date_to, par_rep_mode, print_mode,iframe_id)
    {
        // *******************************************************
        // *******************************************************
        var empl_id     = par_empl_id;
        var ReportName  = "CrystalReport"
        var SaveName    = "Crystal_Report"
        var ReportType  = "inline"
        var ReportPath  = ""
        var sp          = ""
        var p_date_fr   = par_date_from
        var p_date_to   = par_date_to
        var p_rep_mode  = par_rep_mode
        
        sp = "sp_leaveledger_report,p_empl_id," + empl_id + ",p_date_fr," + p_date_fr + ",p_date_to," + p_date_to + ",p_rep_mode," + p_rep_mode;

        if (print_mode == 'CTO')
        {
            ReportPath = "~/Reports/cryCOC/cryCOC.rpt";
        }
        else
        {
            ReportPath = "~/Reports/cryLeaveLedger/cryLeaveLedger.rpt";
        }
        // *******************************************************
        // *** VJA : 2021-07-14 - Validation and Loading hide ****
        // *******************************************************
        var iframe = document.getElementById(iframe_id);
        var iframe_page = $("#" + iframe_id)[0];
        iframe.style.visibility = "hidden";

        s.embed_link = "../Reports/CrystalViewer.aspx?Params=" + ""
            + "&ReportName=" + ReportName
            + "&SaveName=" + SaveName
            + "&ReportType=" + ReportType
            + "&ReportPath=" + ReportPath
            + "&id=" + sp // + "," + parameters

        if (!/*@cc_on!@*/0) { //if not IE
            iframe.onload = function () {
                iframe.style.visibility = "visible";
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
            iframe.onreadystatechange = function ()
            {
                if (iframe.readyState == "complete")
                {
                    iframe.style.visibility = "visible";
                }
            };
        }
        iframe.src = s.embed_link;
        // *******************************************************
        // *******************************************************

    }

    s.Retrieve_LeaveHistory = function ()
    {
        $('#view_details_history').removeClass()
        $('#view_details_history').addClass('fa fa-spinner fa-spin')
        s.data_history = [];
        h.post("../cLeaveLedger/Retrieve_LeaveHistory", { leave_ctrlno: s.txtb_leave_ctrlno, empl_id: $("#ddl_name option:selected").val()}).then(function (d)
        {
            if (d.data.message == "success")
            {
                s.data_history = d.data.data
                var to_append  = "";
                $("#history").html("");
                for (var i = 0; i < s.data_history.length; i++)
                {
                    s.data_history[i].create_dttm_descr  = moment(s.data_history[i].created_dttm).format("LLLL")
                    s.data_history[i].create_dttm_ago    = moment(s.data_history[i].created_dttm).fromNow()
                    var temp_append = "";
                    var temp = moment();
                    temp_append = '<div class="feed-element">'+
                                       '<div class="pull-left">'+
                                         '<div class="img-circle">' +
                                            '<img class="img-circle"  alt="image" width="30" height="30" src="'+ (s.data_history[i].empl_photo_img == "" ? "../ResourcesImages/upload_profile.png" : s.image_link + s.data_history[i].created_by.replace("U","") + '?v=' + temp)+' " />'+
                                        '</div>'+
                                       '</div>'+
                                        '<div class="media-body ">'+
                                            '<small class="pull-right" style="padding-left:10px !important">' + s.data_history[i].create_dttm_ago+'</small>'+
                                            s.data_history[i].appl_status+' by <strong>'+ s.data_history[i].employee_name_format_2+'</strong>'+
                                            '<small class="text-muted">on '+ s.data_history[i].create_dttm_descr+'</small>'+
                                        '</div>'+
                                    '</div>';

                    to_append = to_append + temp_append;
                }
                $("#history").append($compile(to_append)($scope));

                $('#view_details_history').removeClass()
                $('#view_details_history').addClass('fa fa-arrow-down')
                
            }
            else
            {
                $('#view_details_history').removeClass()
                $('#view_details_history').addClass('fa fa-arrow-down')
                swal({ icon: "warning", title: d.data.message });
            }
        })
    }


    s.btn_save_reprint_request = function ()
    {
         var data =
        {
             ledger_ctrl_no     : s.ledger_ctrl_no_reprint    
            ,empl_id            : s.empl_id_reprint           
            ,reprint_reason     : s.reprint_reason    
            ,reprint_date_from  : $('#reprint_date_from').val() 
            ,reprint_date_to    : $('#reprint_date_to').val()   
            ,reprint_status     : s.reprint_status  
        }
        
        if ($('#reprint_date_from').val().trim() == "" || $('#reprint_date_to').val().trim()  == "")
        {
            swal({ icon: "warning", title: "REPRINT FROM AND PERPRINT TO IS REQUIRED!"});
            return;
        }
        if ($('#reprint_reason').val().trim() == "" )
        {
            swal({ icon: "warning", title: "REPRINT REASON IS REQUIRED!"});
            return;
        }
        
        h.post("../cLeaveLedger/SaveReprint", {data:data}).then(function (d)
        {
            if (d.data.message == "success")
            {
                swal({ icon: "success", title: "Successfully Saved!" });
            }
            else
            {
                swal({ icon: "warning", title: d.data.message });
            }
        })
    }
    //*********************************************************************************************************
    // ************************ END OF CODE *******************************************************************
    //*********************************************************************************************************
});

