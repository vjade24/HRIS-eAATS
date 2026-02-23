ng_HRD_App.controller("cWellnessMonitoring_ctrl", function (commonScript, $scope, $compile, $http, $filter) {
    var s = $scope;
    var h = $http;
    var cs = commonScript;

    s.dis_when_s    = false;
    s.year          = [];
    s.user_id       = "";
    s.ddl_empl_type = "JO";

    s.for_approval_list = [];
    s.for_monitoring = [];
    $('.collapse').collapse();

    s.wellness = false;
    s.wellnesslist = [];
    s.wellnessbreakdown = [];
    s.employment_type = "";
    s.first_sem_val = 0;
    s.second_sem_val = 0;
    s.is_2ndsem_available = false;
    s.oTable_wellnessrecords = [];


    s.get_monitoring_list = function ()
    {
        h.post("../cWellnessMonitoring/GetMonitoringList", { department_code: s.ddl_dept, employment_type: s.ddl_empl_type, show_only: "Y", year: str_to_year($("#txtb_dtr_mon_year").val())}).then(function (d) {
            if (d.data.message == "success")
            {
                if (
                    str_to_year($("#txtb_dtr_mon_year").val()) < moment().year()
                    ||
                    (moment().month() + 1) >=7
                   )
                {
                    s.is_2ndsem_available = true;
                }
                s.for_monitoring = d.data.monitoring_list;
               
                s.for_monitoring.forEach(function (item) {
                    item.Wdays_1st_obj = s.parseWellnessDays(item.Wdays_1st);
                    item.Wdays_2nd_obj = s.parseWellnessDays(item.Wdays_2nd);
                });

                console.log(s.for_monitoring);
                if (d.data.monitoring_list.length > 0)
                {
                    s.oTable.fnClearTable();
                    s.oTable.fnAddData(s.for_monitoring);
                }
            }

        });
    }

    s.get_forapproval_list = function () {
        h.post("../cWellnessMonitoring/GetForApprovalList").then(function (d) {
            if (d.data.message == "success")
            {
                s.for_approval_list = d.data.for_approval_list;
            }
        });
    }

    function init() {

        RetrieveYear();

        $("#ddl_dept").select2().on('change', function (e) {
            s.ddl_dept = $("#ddl_dept").val();
            s.get_monitoring_list();
        });

        $("#ddl_empl_type").select2().on('change', function (e) {
            s.get_monitoring_list();
        });
        $("#txtb_dtr_mon_year").on('change', function (e) {
            s.get_monitoring_list();
        });

        $("#txtb_dtr_mon_year").datepicker({
            format: "MM - yyyy",
            startView: "years",
            minViewMode: "months",
            autoclose: true,
        });
        var ddate = new Date();
        s.txtb_dtr_mon_year = moment(ddate).format("MMMM - YYYY");
        //s.txtb_dtr_mon_year_earn = moment(ddate).format("MMMM - YYYY");

        $('#modal_initializing').modal({ backdrop: 'static', keyboard: false });
        s.get_forapproval_list();
        //**********************************************
        // Initialize data during page loads
        //**********************************************
        h.post("../cWellnessMonitoring/InitializeData").then(function (d) {
            if (d.data.message == "success") {
                s.lv_admin_dept_list = d.data.lv_admin_dept_list;
                if (s.lv_admin_dept_list.length > 0)
                {
                    s.ddl_dept = s.lv_admin_dept_list[0].department_code;
                    $("#ddl_dept").val(s.lv_admin_dept_list[0].department_code);

                    s.get_monitoring_list();

                }
                init_table_data([]);
                init_table_data2([]);
                init_wellness_tbl([]);

                $("#modal_initializing").modal("hide");
            }
            else {
                swal(d.data.message, { icon: "warning", });
                $("#modal_initializing").modal("hide");
            }

        });
    }
    init();

    s.parseWellnessDays = function(wdays) {

        if (!wdays || wdays === "0") return [];

        return wdays.split(',').map(function (item) {

            var parts = item.trim().split(':');

            return {
                date_breakdown: parts[0],
                val: parseFloat(parts[1])
            };
        });
    }


    var init_table_data = function (par_data) {
        try {
            s.datalistgrid = par_data;
            s.oTable = $('#datalistgrid').dataTable(
                {
                    data: s.datalistgrid,
                    bSort: false,
                    bAutoWidth: false,
                    sDom: '<"top"<"chartFilters">fl>rt<"bottom"ip>',
                    columns: [
                        {
                            "width": "5%",
                            "targets": 0,
                            "mData": "employee_name",
                            "mRender": function (data, type, full, row) {
                            
                                return `<span class='btn-block text-center'><div class="img-badge-wrapper text-center">
                                                    <img id="m{{employee_rekon.empl_id}}"
                                                        src="~/ResourcesImages/upload_profile.png"
                                                         width="50"
                                                         height="50"
                                                         class="profile-img"
                                                         onerror="this.onerror=null; this.src='../../ResourcesImages/upload_profile.png';" />

                                                    <!-- Badge -->
                                                    <span class="img-badge">
                                                        <small>sg</small> {{employee_rekon.salary_grade}}
                                                    </span>
                                                </div></span>`;

                            }
                        },
                        {
                            "width": "20%",
                            "targets": 0,
                            "mData": "employee_name",
                            "mRender": function (data, type, full, row) {
                                return "<span class='btn-block'>&nbsp;&nbsp<label>" + data + "</label></span> ";

                            }
                        },
                        {
                            "width": "22%",
                            "targets": 1,
                            "mData": "position",
                            "mRender": function (data, type, full, row) {
                               
                                return "<span class='btn-block' ><label>&nbsp;&nbsp" + data + "</label></span>";
                               
                            }
                        },
                        {
                            "width": "15%",
                            "targets": 2,
                            "mRender": function (data, type, full, row) {
                                var html_return = "";
                                var not_available = (2.5 - parseFloat(full["total_1st"])) < 1 ?  `<div class="overlay-text2">CONSUMED</div>`:'';
                                html_return = `<div class="widget-overlay-wrapper2" style="padding:5px 10px 5px 10px;"><div class="row" ><div class="col-lg-12"><div class="pull-left" style="width:70%;">AVAILABLE</div><div class="pull-right text-right text-success" style="width:30%;"><label>` + 2.5 + `</label>&nbsp;&nbsp;</div></div>` +
                                    `<div class="col-lg-12"><div class="pull-left" style="width:70%;">APPLIED</div><div class="pull-right text-right text-warning" style="width:30%;"><label>` + full["total_1st"] + `</label>&nbsp;&nbsp;</div></div>` + not_available+`</div>`;

                                return html_return;

                            }
                        },
                        {
                            "width": "15%",
                            "targets": 3,
                            "mRender": function (data, type, full, row) {
                                var sencod_sem_val = (parseFloat(2.5) - parseFloat(full["total_1st"])) + parseFloat(2.5);
                                var html_return = "";
                                var not_available = `<div class="overlay-text2" ng-show="!`+s.is_2ndsem_available+`">
                                                NOT AVAILABLE
                                            </div>`;
                                html_return = ` <div class="widget-overlay-wrapper" style="padding:5px 10px 5px 10px;"><div class="row" ><div class="col-lg-12"><div class="pull-left" style="width:70%;">AVAILABLE</div><div class="pull-right text-right text-success" style="width:30%;"><label>` + sencod_sem_val + `</label>&nbsp;&nbsp;</div></div>` +
                                    `<div class="col-lg-12" ><div class="pull-left" style="width:70%;">APPLIED</div><div class="pull-right text-right text-warning" style="width:30%;"><label>` + full["total_2nd"] + `</label>&nbsp;&nbsp;</div></div>` + not_available+`</div`;

                                return html_return;
                            }
                        }
                        //,{
                        //    "width": "8%",
                        //    "targets": 10,
                        //    "mData": null,
                        //    "mRender": function (data, type, full, row) {

                        //        var btn_print = '<button type="button" class="btn btn-primary btn-xs"  ng-click="btn_print_leave_app(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Print Application for Leave/CTO Form"><i class="fa fa-print"></i></button>'
                        //        var btn_delete = '<button type="button" class="btn btn-danger btn-xs"  disabled data-toggle="tooltip" data-placement="top" title="Delete"><i class="fa fa-trash"></i></button>'
                        //        var btn_edit = '<button type="button" class="btn btn-success btn-xs" disabled data-toggle="tooltip" data-placement="top" title="Edit">  <i class="fa fa-edit"></i></button >'
                        //        var btn_view = '<button type="button" class="btn btn-warning btn-xs" ng-click="btn_view(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="View History">  <i class="fa fa-eye"></i></button >'

                        //        if ((full["approval_status"] == 'D' || full["approval_status"] == 'L' || full["leaveledger_entry_type"] == 'T') || (full["leaveledger_entry_type"] != '2' && full["leavetype_code"] != "CTO")) {
                        //            btn_print = '<button type="button" class="btn btn-primary btn-xs" disabled><i class="fa fa-print"></i></button>'
                        //            btn_view = '<button type="button" class="btn btn-warning btn-xs" disabled><i class="fa fa-eye"></i></button>'
                        //        }


                        //        if (s.btn_disable_row) {
                        //            s.btn_disable_row = s.btn_disable_row
                        //            btn_delete = '<button type="button" class="btn btn-danger btn-xs"  ng-click="btn_delete(' + row["row"] + ')"  data-toggle="tooltip" data-placement="top" title="Delete"><i class="fa fa-trash"></i></button>'
                        //            btn_edit = '<button type="button" class="btn btn-success btn-xs" ng-click="btn_edit(' + row["row"] + ')"    data-toggle="tooltip" data-placement="top" title="Edit">  <i class="fa fa-edit"></i></button >'
                        //        }

                        //        return '<center><div class="btn-group">' +
                        //            btn_view +
                        //            btn_edit +
                        //            btn_delete +
                        //            btn_print +
                        //            '</div></center>';
                        //    }
                        //}
                    ],
                    "createdRow": function (row, data) {
                        if (data['nbr_quarter'] == "1" && s.nbr_quarter == 1) {
                            $(row).css("background-color", "#ccc");
                        }
                        else if (data['nbr_quarter'] == "2" && s.nbr_quarter == 2) {
                            $(row).css("background-color", "#ccc");
                        }
                        else if (data['nbr_quarter'] == "3" && s.nbr_quarter == 3) {
                            $(row).css("background-color", "#ccc");
                        }
                        else if (data['nbr_quarter'] == "4" && s.nbr_quarter == 4) {
                            $(row).css("background-color", "#ccc");
                        }





                        $compile(row)($scope);
                    }
                });
        }
        catch (err) {
            swal({ icon: "warning", title: err.message });
        }
    };

    var init_wellness_tbl = function (par_data) {
        try {
            s.oTable_wellnessrecords = $('#table_applied_willness').dataTable(
                {
                    data: par_data,
                    bSort: true,
                    bAutoWidth: false,
                    sDom: 'rt<"bottom">',
                    paging: false,
                    columns: [
                        {
                            "width": "30%",
                            "targets": 0,
                            "mData": "date_breakdown",
                            "mRender": function (data, type, full, row) {
                                return "<span class='text-center btn-block'><b>" + moment(data).format('YYYY-MM-DD') + "</b></span>";
                            }
                        },
                        {
                            "width": "55%",
                            "targets": 0,
                            "mData": "date_breakdown",
                            "mRender": function (data, type, full, row) {
                                return "<span class=' btn-block'><b> &nbsp;&nbsp;&nbsp;" + moment(data).format("MMMM DD, YYYY -- dddd") + "</b></span>";
                            }
                        },
                        {
                            "width": "15%",
                            "targets": 3,
                            "mData": null,
                            "mRender": function (data, type, full, row) {
                                return "<span class='text-center btn-block'><b>" + full["val"] + "</b></span>";
                            }
                        }
                    ],
                    "createdRow": function (row, data, index) {
                        $compile(row)($scope);  //add this to compile the DOM
                    },

                });
            //$('#table_applied_willness > thead').remove();
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
                    bSort: true,
                    bAutoWidth: false,
                    sDom: 'rt<"bottom">',
                    paging: false,
                    columns: [
                        {
                            "width": "15%",
                            "targets": 0,
                            "mData": "as_dtr_date",
                            "mRender": function (data, type, full, row) {
                                return "<span class='text-center btn-block'>" + data + "</span>"
                            }
                        },
                        {
                            "width": "30%",
                            "targets": 1,
                            "mData": "astype_descr",
                            "mRender": function (data, type, full, row) {
                                return "<span class='text-center btn-block'>" + data + "</span>"
                            }
                        },
                        {
                            "width": "13%",
                            "targets": 2,
                            "mData": null,
                            "mRender": function (data, type, full, row) {
                                return "<span class='text-center btn-block'>" + (full["as_am_in"] == "" ? "--:--" : full["as_am_in"]) + "|" + (full["as_am_out"] == "" ? "--:--" : full["as_am_out"]) + "</span>"
                            }
                        },
                        {
                            "width": "13%",
                            "targets": 3,
                            "mData": null,
                            "mRender": function (data, type, full, row) {
                                return "<span class='text-center btn-block'>" + (full["as_pm_in"] == "" ? "--:--" : full["as_pm_in"]) + "|" + (full["as_pm_out"] == "" ? "--:--" : full["as_pm_out"]) + "</span>"
                            }
                        },
                        {
                            "width": "15%",
                            "targets": 4,
                            "mData": "rcrd_status_descr",
                            "mRender": function (data, type, full, row) {
                                return "<span class='text-center btn-block'>" + data + "</span>"
                            }
                        },
                        {
                            "width": "14%",
                            "targets": 5,
                            "mData": null,
                            "bSortable": false,
                            "mRender": function (data, type, full, row) {
                                var temp = "";
                                temp = '<center><div class="btn-group">' +
                                    '<button type="button" ng-disabled="false" class="btn btn-success btn-sm" ng-click="btn_show_details(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="View"><i class="fa fa-edit"></i>SHOW DETAILS</button>' +
                                    '</div></center>';
                                return temp;
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

    };

    s.btn_approve_click = function ()
    {
        var row_id = $('#btn_approve').prop('ngx-data');
        var data =
        {
             application_nbr    : s.for_approval_list[row_id].application_nbr
            ,approval_id        : s.for_approval_list[row_id].approval_id
            ,approval_status    : 'F'
            ,detail_remarks    : s.txtb_remarks
        }
        

        if (s.for_approval_list[row_id].next_status == "R")
        {
            $('#btn_approve').html('<i class="fa fa-spinner fa-spin"></i> Review');
        }
        if (s.for_approval_list[row_id].next_status == "1") {
            $('#btn_approve').html('<i class="fa fa-spinner fa-spin"></i> Level 1 Approve');
        }
        if (s.for_approval_list[row_id].next_status == "2") {
            $('#btn_approve').html('<i class="fa fa-spinner fa-spin"></i> Level 2 Approve');
        }
        if (s.for_approval_list[row_id].next_status == "F")
        {
            $('#btn_approve').html('<i class="fa fa-spinner fa-spin"></i> Final Approve');
        }
        h.post("../cWellnessMonitoring/ReviewApprovedAction",
            {
                data: data
                ,data2: s.datalistgrid2
            }).then(function (d)
            {
                if (d.data.message == "success")
                {
                    s.for_approval_list[row_id].next_status = "";

                    if (data.approval_status == "R")
                    {
                        s.for_approval_list[row_id].worklist_status = "Reviewed";
                        s.for_approval_list[row_id].worklist_action = "View Details";
                        s.for_approval_list[row_id].approval_status = "R";
                    }
                    else if (data.approval_status == "1") {
                        s.for_approval_list[row_id].worklist_status = "Level 1 Approved";
                        s.for_approval_list[row_id].worklist_action = "View Details";
                        s.for_approval_list[row_id].approval_status = "1";
                    }
                    else if (data.approval_status == "2") {
                        s.for_approval_list[row_id].worklist_status = "Level 2 Approved";
                        s.for_approval_list[row_id].worklist_action = "View Details";
                        s.for_approval_list[row_id].approval_status = "2";
                    }
                    else if (data.approval_status == "F")
                    {
                        s.for_approval_list[row_id].worklist_status  = "Final Approved";
                        s.for_approval_list[row_id].worklist_action  = "View Details";
                        s.for_approval_list[row_id].approval_status  = "F";
                        s.for_approval_list[row_id].next_status      = "L";
                    }

                    s.oTable.fnClearTable();
                    if (s.for_approval_list.length > 0)
                    {
                        s.oTable.fnAddData(s.for_approval_list);
                    }

                    swal({ icon: "success", title: "Application Successfully " + s.for_approval_list[row_id].worklist_status+"!" });
                    setTimeout(function ()
                    {
                        if (s.for_approval_list[row_id].next_status == "R") {
                            $('#btn_approve').html('<i class="fa fa-thumbs-up"></i> Review');
                        }
                        if (s.for_approval_list[row_id].next_status == "1") {
                            $('#btn_approve').html('<i class="fa fa-thumbs-up"></i> Level 1 Approve');
                        }
                        if (s.for_approval_list[row_id].next_status == "2") {
                            $('#btn_approve').html('<i class="fa fa-thumbs-upn"></i> Level 2 Approve');
                        }
                        if (s.for_approval_list[row_id].next_status == "F")
                        {
                            $('#btn_approve').html('<i class="fa fa-thumbs-up"></i> Final Approve');
                        }
                        $('#main_modal').modal('hide');
                    }, 300);
                }

                localStorage["minus_as"] = parseInt(localStorage["minus_as"]) - 1
                minusOne("9403")
            });
        
        
    }
    
    s.btn_disapprove_click = function ()
    {
        var row_id = $('#btn_disapprove').prop('ngx-data');
        if (ValidateFields())
        {
            var data =
            {
                application_nbr     : s.for_approval_list[row_id].application_nbr
                , approval_id       : s.for_approval_list[row_id].approval_id
                , approval_status   : "D"
                , detail_remarks: s.txtb_remarks
            }
            $('#btn_disapprove').html('<i class="fa fa-spinner fa-spin"></i> Disapprove');
            h.post("../cWellnessMonitoring/ReviewApprovedAction",
                {
                    data: data
                }).then(function (d) {
                    if (d.data.message == "success")
                    {
                        s.for_approval_list[row_id].next_status = "";
                        s.for_approval_list[row_id].worklist_status = "Disapproved";
                        s.for_approval_list[row_id].worklist_action = "View Details";
                        s.for_approval_list[row_id].approval_status = "D";
                        

                        s.oTable.fnClearTable();
                        if (s.for_approval_list.length > 0) {
                            s.oTable.fnAddData(s.for_approval_list);
                        }

                        swal({ icon: "success", title: "Application Successfully " + s.for_approval_list[row_id].worklist_status+"!" });
                        setTimeout(function () {
                            $('#btn_disapprove').html('<i class="fa fa-thumbs-up"></i> Disapprove');
                            $('#main_modal').modal('hide');
                        }, 300);
                    }
                });

        }
    }

    s.btn_cancel_pending_click = function ()
    {
        var row_id = $('#btn_cancel_pending').prop('ngx-data');
        if (ValidateFields())
        {
            var data =
            {
                application_nbr  : s.for_approval_list[row_id].application_nbr
                , approval_id    : s.for_approval_list[row_id].approval_id
                , approval_status: "C"
                , detail_remarks: s.txtb_remarks
            }
            $('#btn_cancel_pending').html('<i class="fa fa-spinner fa-spin"></i> Cancel Pending');
            h.post("../cWellnessMonitoring/ReviewApprovedAction",
                {
                    data: data
                }).then(function (d) {
                    if (d.data.message == "success")
                    {
                        s.for_approval_list[row_id].next_status = "";
                        s.for_approval_list[row_id].worklist_status = "Cancel Pending";
                        s.for_approval_list[row_id].worklist_action = "View Details";
                        s.for_approval_list[row_id].approval_status = "C";
                        s.for_approval_list[row_id].detail_remarks  = s.txtb_remarks;


                        s.oTable.fnClearTable();
                        if (s.for_approval_list.length > 0) {
                            s.oTable.fnAddData(s.for_approval_list);
                        }

                        swal({ icon: "success", title: "Application Successfully " + s.for_approval_list[row_id].worklist_status+"!" });
                        setTimeout(function ()
                        {
                            $('#btn_cancel_pending').html('<i class="fa fa-ban"></i> Cancel Pending');
                            $('#main_modal').modal('hide');
                        }, 300);
                    }
                });
        }
    }

    s.btn_cancel_click = function () {
        var row_id = $('#btn_cancel').prop('ngx-data');
        if (ValidateFields()) {
            var data =
            {
                application_nbr : s.for_approval_list[row_id].application_nbr
                , approval_id   : s.for_approval_list[row_id].approval_id
                , approval_status: "L"
                , detail_remarks: s.txtb_remarks
            }
            $('#btn_cancel').html('<i class="fa fa-spinner fa-spin"></i> Cancel AS');
            h.post("../cWellnessMonitoring/ReviewApprovedAction",
                {
                    data: data
                }).then(function (d) {
                    if (d.data.message == "success")
                    {
                        s.for_approval_list[row_id].next_status      = "";
                        s.for_approval_list[row_id].worklist_status  = "Cancelled";
                        s.for_approval_list[row_id].worklist_action  = "View Details";
                        s.for_approval_list[row_id].approval_status = "L";
                        s.for_approval_list[row_id].detail_remarks = s.txtb_remarks;
                        s.oTable.fnClearTable();
                        if (s.for_approval_list.length > 0) {
                            s.oTable.fnAddData(s.for_approval_list);
                        }

                        swal({ icon: "success", title: "Application Successfully " + s.for_approval_list[row_id].worklist_status+"!" });
                        setTimeout(function () {
                            $('#btn_cancel').html('<i class="fa fa-ban"></i> Cancel AS');
                            $('#main_modal').modal('hide');
                        }, 300);
                    }
                });
        }
    }


    s.btn_edit_action = function (row_id)
    {
        try
        {
            s.show_footer = true;
            //ValidationResultColor("ALL", false);
            //s.btn_clear_inputs();
            s.isEdit = true
            s.ModalTitle = "AS APPLICATION DETAILS";

            $("#add1").addClass("hidden")
            if (s.ddl_dept == "03") {
                $("#add1").removeClass("hidden")
            }

            h.post("../cWellnessMonitoring/GetDetailsData",
                {
                    p_application_nbr: s.for_approval_list[row_id].application_nbr
                }).then(function (d)
                {
                    if (d.data.message == "success")
                    {
                        $('#btn_approve').prop('ngx-data', row_id);
                        $('#btn_disapprove').prop('ngx-data', row_id);
                        $('#btn_cancel_pending').prop('ngx-data', row_id);
                        $('#btn_cancel').prop('ngx-data', row_id);

                        $('#btn_approve').html('<i class="fa fa-thumbs-up"></i> Approve');
                        $('#btn_disapprove').html('<i class="fa fa-thumbs-down"></i> Disapprove');
                        $('#btn_cancel_pending').html('<i class="fa fa-ban"></i> Cancel Pending');
                        $('#btn_cancel').html('<i class="fa fa-ban"></i> Cancel AS');

                        $("#txtb_reviewer_name").val(s.for_approval_list[row_id].reviewed_by)
                        s.txtb_reviewer_name = s.for_approval_list[row_id].reviewed_by

                        if (s.for_approval_list[row_id].reviewed_date == "1900-01-01")
                            s.for_approval_list[row_id].reviewed_date = ""
                        $("#txtb_reviewed_date").val(s.for_approval_list[row_id].reviewed_date)
                        s.txtb_reviewed_date = s.for_approval_list[row_id].reviewed_date

                        $("#txtb_level_name").val(s.for_approval_list[row_id].level1_approved_by)
                        s.txtb_level_name = s.for_approval_list[row_id].level1_approved_by


                        if (s.for_approval_list[row_id].level1_approval_date == "1900-01-01")
                            s.for_approval_list[row_id].level1_approval_date = ""

                        $("#txtb_level_date").val(moment(s.for_approval_list[row_id].level1_approval_date).format("YYYY-MM-DD"));
                        s.txtb_level_date = moment(s.for_approval_list[row_id].level1_approval_date).format("YYYY-MM-DD");

                        s.edit_appr_ctrl = s.for_approval_list[row_id].application_nbr;
                        s.edit_approval_id = s.for_approval_list[row_id].approval_id;
                        s.temp_row_id       = row_id;
                        s.txtb_appl_nbr = s.for_approval_list[row_id].application_nbr;
                        s.txtb_date_applied = s.for_approval_list[row_id].date_applied;
                        s.txtb_empl_name = s.for_approval_list[row_id].owner_name;

                        s.txtb_created_by = s.for_approval_list[row_id].creator_name;
                        s.txtb_empl_id      = s.for_approval_list[row_id].empl_id_owner;
                        s.txtb_remarks      = "";

                        s.oTable2.fnClearTable();
                        s.datalistgrid2 = d.data.flpDtlLst;


                        if (d.data.flpDtlLst.length > 0)
                        {
                            s.oTable2.fnAddData(d.data.flpDtlLst);
                        }
                        s.wellness = d.data.flpDtlLst[0].astype_code == "12" ? true : false;

                        //WELLNESS CODE HERE
                        if (s.wellness)
                        {
                            s.oTable_wellnessrecords.fnClearTable();
                            s.oTable_wellnessrecords.fnAddData(d.data.breakdown);

                            s.wellnesslist = d.data.wellness_list;
                            if (s.wellnesslist.length > 0)
                            {

                                s.firstsem_used = s.wellnesslist
                                    .filter(a => {
                                        var m = moment(a.date_breakdown);
                                        return m.month() >= 0 && m.month() <= 5; // Jan(0) to June(5)
                                    })
                                    .reduce((sum, a) => sum + Number(a.val), 0);

                                s.secondsem_used = s.wellnesslist
                                    .filter(a => {
                                        var m = moment(a.date_breakdown);
                                        return m.month() > 5; // Jan(0) to June(5)
                                    })
                                    .reduce((sum, a) => sum + Number(a.val), 0);
                                s.first_sem_val = 2.5 - (isNaN(s.firstsem_used) ? 0 : s.firstsem_used);
                                s.second_sem_val = (s.first_sem_val + 2.5) - (isNaN(s.secondsem_used) ? 0 : s.secondsem_used);
                                s.first_sem_val = s.second_sem_val < 1 ? 0 : s.first_sem_val;

                            }
                            else {
                                s.first_sem_val = 2.5;
                                s.second_sem_val = 2.5 + 2.5;
                                s.txtb_wellness_value = 1;
                            }
                        }
                        s.show_btn_approve  = true;
                        s.btn_show_cancel   = false;
                        if (s.for_approval_list[row_id].next_status == "R")
                        {
                            $('#btn_approve').html('<i class="fa fa-thumbs-up"></i> Review');
                        }
                        else if (s.for_approval_list[row_id].next_status == "1") {
                            $('#btn_approve').html('<i class="fa fa-thumbs-up"></i> Level 1 Approve');
                        }
                        else if (s.for_approval_list[row_id].next_status == "2") {
                            $('#btn_approve').html('<i class="fa fa-thumbs-up"></i> Level 2 Approve');
                        }
                        else if (s.for_approval_list[row_id].next_status == "3" || s.for_approval_list[row_id].next_status == "F") {
                            $('#btn_approve').html('<i class="fa fa-thumbs-up"></i> Final Approve');
                        }
                        else if (s.for_approval_list[row_id].next_status == "L")
                        {
                            s.show_footer       = true;
                            s.show_btn_approve  = false;
                            s.btn_show_cancel   = true
                        }
                        else if (s.for_approval_list[row_id].next_status == "")
                        {
                            s.show_footer       = false;
                            s.show_btn_approve  = false;
                        }

                        if (s.for_approval_list[row_id].approval_status == "1") {
                            s.txtb_remarks = s.for_approval_list[row_id].level1_approval_comment;
                        }
                        else if (s.for_approval_list[row_id].approval_status == "2") {
                            s.txtb_remarks = s.for_approval_list[row_id].level2_approval_comment;
                        }
                        else if (s.for_approval_list[row_id].approval_status == "C") {
                            s.txtb_remarks = s.for_approval_list[row_id].cancel_pending_comment;
                        }
                        else if (s.for_approval_list[row_id].approval_status == "D") {
                            s.txtb_remarks = s.for_approval_list[row_id].disapproval_comment;
                        }
                        else if (s.for_approval_list[row_id].approval_status == "F") {
                            s.txtb_remarks = s.for_approval_list[row_id].final_approval_comment;
                        }
                        else if (s.for_approval_list[row_id].approval_status == "L") {
                            s.txtb_remarks = s.for_approval_list[row_id].cancelled_comment;
                        }
                        else if (s.for_approval_list[row_id].approval_status == "R") {
                            s.txtb_remarks = s.for_approval_list[row_id].reviewed_comment;
                        }

                        if (s.for_approval_list[row_id].worklist_action == "View Details") {
                            s.dis_remarks = true;
                        }
                        else {
                            s.dis_remarks = false;
                        }
                        
                        setTimeout(function ()
                        {
                            $('#main_modal').modal({ backdrop: 'static', keyboard: false });
                        }, 300);
                    }
                });

        } catch (e)
        {
            swal({ icon: "warning", title: e.message });
        }
    }

    function str_to_year(str) {
        var year = str.substr(str.length - 4);
        return year;
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
});