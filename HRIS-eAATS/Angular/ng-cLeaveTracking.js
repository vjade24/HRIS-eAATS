ng_HRD_App.controller("cLeaveTracking_ctrlr", function ($scope, $compile, $http, $filter) {
    var s       = $scope;
    var h       = $http;
    s.rowLen    = "10";
    var ddate_from_to   = new Date();
    s.txtb_date_fr      = "2021" + "-01-01";
    s.txtb_date_to      = ddate_from_to.getFullYear() + "-12-31";
    s.ddl_rep_mode      = "2";
    s.datalistgrid_dtl  = [];
    s.rowIndex          = "";
    s.rowDetails        = [];
    s.rowX              = "";
    s.ddl_dept = "";
    function init()
    {
        s.ddl_filter = 'TFU';
        $("#ddl_filter").select2().on('change', function (e) {
            s.FilterPageGrid();
        });

        $("#ddl_dept").select2().on('change', function (e) {
            s.FilterPageGrid();
        });

        $("#txtb_date_fr").on('change', function (e) {
            s.btn_print_ledger();
        });

        $("#txtb_date_to").on('change', function (e) {
            s.btn_print_ledger();
        });

        $("#ddl_rep_mode").on('change', function (e) {
            s.btn_print_ledger();
        });

        //**********************************************
        // Initialize data during page loads
        //**********************************************
        $('#modal_generating_remittance').modal({ backdrop: 'static', keyboard: false });
        h.post("../cLeaveTracking/InitializeData").then(function (d) {
            if (d.data.message == "success")
            {
                s.lv_admin_dept_list = d.data.lv_admin_dept_list;

                if (d.data.data.length > 0)
                {
                    init_table_data(d.data.data);
                }
                else {
                    init_table_data([]);
                }

                //**********************************************
                //  Show/Hide ADD, EDIT, DELETE button 
                //**********************************************
                d.data.um.allow_add     == "1" ? s.ShowAdd = true : s.ShowAdd = false;
                d.data.um.allow_delete  == "1" ? s.ShowDelete = true : s.ShowDelete = false;
                d.data.um.allow_edit    == "1" ? s.ShowEdit = true : s.ShowEdit = false;
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
                sDom: 'rt<"bottom"ip>',
                pageLength: 10,
                columns: [
                    {
                        "mData": null,
                        "mRender": function (data, type, full, row)
                        {
                            return "<center><span class='details-control' style='display:block;' ></center>";
                        }
                    },
                    {
                        "mData": "doc_ctrl_nbr",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-center   btn-block'>" + data + "</span>";
                        }
                    },
                    {
                        "mData": "transmittal_descr",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-left   btn-block'>&nbsp;&nbsp;" + data + " </span>";
                        }
                    },
                    {
                        "mData": "approved_period_from",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-left   btn-block'>&nbsp;&nbsp;" + moment(data).format('MMMM Do YYYY, h:mm:ss A') + "</span>";
                        }
                    },
                    {
                        "mData": "doc_status",
                        "mRender": function (data, type, full, row)
                        {
                            var badge_color = "badge-danger";
                            var content = '';
                            if (full["doc_status"] == "U" && full["current_status"] > 0)
                            {
                                content = "&nbsp;&nbsp;<span class='badge " + badge_color + "'>There is/are " + full["current_status"] + " Leave applications not uploaded or with remarks. </span>";
                            }
                            if (full["doc_status"] == "U" && full["current_status"] == 0) {
                                content = "&nbsp;&nbsp;<span class='badge " + badge_color + "'>All Leave Application have been uploaded. </span>";
                            }

                            if (full["doc_status"] != "U") {
                                content = "&nbsp;&nbsp;<span class='badge " + badge_color + "'>There is/are " + full["current_status"] + " Leave applications not uploaded or need to override. </span>";
                            }
                            
                            return content;
                        }
                    },
                    {
                        "mData": "doc_status",
                        "mRender": function (data, type, full, row)
                        {
                            var content = "";
                            if (full["doc_status"] == "U")
                            {
                                content = '<center><div class="btn-group">' +
                                    '<button type="button" class="btn btn-info btn-sm"    disabled="true" >UPLOAD ALL</button >'
                                    + '</div></center>';
                            }
                            else {
                                content = '<center><div class="btn-group">' +
                                    '<button type="button" class="btn btn-info btn-sm"     ng-click="uploadAll(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="UPLOAD ALL UNREMARKED LEAVE">UPLOAD ALL</button >'
                                    + '</div></center>';
                            }
                            return content;
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
    s.setNumOfRow = function (value, table) {
        try {
            $("#" + table).DataTable().page.len(value).draw();
        }
        catch (err) {
            alert(err.message)
        }
    }
    //*********************************************//
    //*** Filter Page Grid
    //********************************************// 
    s.FilterPageGrid = function () {
        $('#modal_generating_remittance').modal({ backdrop: 'static', keyboard: false });
        h.post("../cLeaveTracking/FilterPageGrid",
            {
                par_year: "",
                par_month: "",
                par_filter: $("#ddl_filter option:selected").val(),
                par_department_code: $("#ddl_dept option:selected").val()
            }).then(function (d) {
                if (d.data.message == "success") {
                    s.oTable.fnClearTable();
                    s.datalistgrid = d.data.data;
                    if (d.data.data.length > 0) {
                        s.oTable.fnAddData(d.data.data);
                    }
                    $('#modal_generating_remittance').modal("hide");
                }
            });
    }

    $('#datalist_grid tbody').on('click', 'span.details-control', function ()
    {
        var tr      = $(this).closest('tr');
        var row = $('#datalist_grid').DataTable().row(tr);
        s.rowIndex 
        if (row.child.isShown())
        {
            row.child.hide();
            tr.removeClass('shown');
            return;
        }
        h.post("../cLeaveTracking/GetUploadingDetails",
            {
                par_doc_ctrl_nbr: row.data().doc_ctrl_nbr
             }).then(function (d)
             {
                if (d.data.message == "success")
                {
                    s.datalistgrid_dtl = d.data.data;
                    row.child(format(d.data.data)).show();
                    tr.addClass('shown');
                }
            });
       
      

    });

    //NEW UPDATE BY: JORGE RUSTOM VILLANUEVA 2020-09-18
    /* Formatting function for row details - modify as you need */
    function format(d)
    {
        s.rowDetails = d;
        var content = '<div class="col-lg-12 lv-content" style="vertical-align:middle !important;">'
            + '<div class="row" style="padding:5px 10px;">'
            + '<div class="col-lg-1"><b>LEAVE #</b></div>'
            + '<div class="col-lg-1 text-center "><b>ID</b></div>'
            + '<div class="col-lg-3 "><b>EMPLOYEE NAME</b></div>'
            + '<div class="col-lg-3 "><b>LEAVE TYPE</b></div>'
            + '<div class="col-lg-2 "><b>PERIOD</b></div>'
            + '<div class="col-lg-2 text-center "><b>ACTION</b></div></div>'
            + '<hr style="margin-top:3px !important;margin-bottom:3px !important;">';

        for (var i = 0; i < d.length; i++)
        {
            content = content + '<div class="row lv-details" style="vertical-align:middle !important;">'
                                + '<div class="col-lg-1">'
                                    +'<small><b>' + d[i].leave_ctrlno + '</b></small>'
                                + '</div>'
                                + '<div class="col-lg-1 text-center">'
                                    + '<span>' + d[i].empl_id + '</pan>'
                                + '</div>'
                                + '<div class="col-lg-3">'
                                    + '<span> &nbsp;' + d[i].employee_name + '</pan>'
                                + '</div>'
                                + '<div class="col-lg-3">'
                                    + '<span> &nbsp;' + d[i].leavetype_descr + '</pan>'
                                    + (d[i].leavesubtype_descr != '' ? '<br/><span> &nbsp;' + d[i].leavesubtype_descr + '</pan>':'')
                                + '</div>'
                                + '<div class="col-lg-2">'
                                    + '<small><b>' + d[i].leaveledger_period + '</b></small>'
                                + '</div>'
                                + '<div class="col-lg-2 text-center">'
                                    +'<div class="btn-group pull-right">'
                                    + '<button type="button" class="btn btn-warning btn-sm"     ng-click="overrideClick('+i+')" data-toggle="tooltip" data-placement="top" title="Edit">Override</button >';
                                    
                                    if (d[i].check_defualt == true && $("#ddl_filter option:selected").val() == "TFU" && d[i].remarks == "")
                                    {
                                        content = content + '<button type="button" id="btn_upload' + i +'" class="btn btn-info btn-sm"     ng-click="uploadClick('+i+')" data-toggle="tooltip" data-placement="top" title="Edit">Upload </button >'
                                    }
                                    else if (d[i].check_defualt == false && $("#ddl_filter option:selected").val() == "TU" && d[i].remarks == "") //ALREADY UPLOADED AND REMARKS IS BLANK
                                    {
                                        content = content + '<button type="button" id="btn_upload' + i +'" class="btn btn-info btn-sm"     disabled="true"   data-toggle="tooltip" data-placement="top" title="Already Uploaded">Upload</button >'
                                    }
                                    else if (d[i].check_defualt == true && $("#ddl_filter option:selected").val() == "TU" && d[i].remarks == "") //ALREADY UPLOADED AND REMARKS IS BLANK
                                    {
                                        content = content + '<button type="button" id="btn_upload' + i +'" class="btn btn-info btn-sm"     ng-click="uploadClick('+i+')" data-toggle="tooltip" data-placement="top" title="You can still upload this Leave Application.">Upload </button >'
                                    }
                                    else {
                                        content = content + '<button type="button" id="btn_upload' + i +'" class="btn btn-danger btn-sm" disabled="true"   data-toggle="tooltip" data-placement="top" title="Needs Override to be uploaded">Upload</button >'
                                    }
                              
            content = content + '</div>'
                        + '</div>';

            content = content        + '</div><hr style="margin-top:3px !important;margin-bottom:3px !important;">';
        }
        content = content + '</div>';
        return $compile(content)($scope);
    }


    s.overrideClick = function (row_id)
    {
        s.rowX = s.datalistgrid_dtl[row_id];
        $('#override_remarks').val(s.rowX.remarks);
        s.rowIndex = row_id;
        $("#modal_override").modal({ keyboard: false, backdrop: "static" });
    }

    s.uploadClick = function (row_id)
    {
        s.rowX = s.datalistgrid_dtl[row_id];
        swal(
            {
                title: "Are You Sure To Upload This Application?",
                text: "We would like to confirm this action from you!",
                icon: "warning",
                buttons: [
                    'No, cancel it!',
                    'Yes, I am sure!'
                ],
                dangerMode: true,
            }
        ).then(function (isConfirm) {
            if (isConfirm) {
                h.post("../cLeaveTracking/SubmitUpload",
                    {
                        par_ledger_ctrl_no: s.rowX.ledger_ctrl_no,
                        par_doc_ctrl_nbr: s.rowX.doc_ctrl_nbr,
                        par_leave_ctrlno: s.rowX.leave_ctrlno,
                        par_empl_id: s.rowX.empl_id
                    }).then(function (d) {
                        if (d.data.message == "success")
                        {
                            if ($("#ddl_filter option:selected").val() == "TFU")
                            {

                                $("#btn_upload" + row_id).attr("disabled");
                                $("#btn_upload" + row_id).addClass("btn-info");
                            }
                            else if ($("#ddl_filter option:selected").val() == "TU") //ALREADY UPLOADED AND REMARKS IS BLANK
                            {
                                $("#btn_upload" + row_id).attr("disabled", true);
                                $("#btn_upload" + row_id).removeClass("btn-danger");
                                $("#btn_upload" + row_id).addClass("btn-info");
                            }
                            

                            swal({
                                title: 'SUCCESSFULLY UPLOADED!',
                                text: 'Leave Successfully Uploaded!',
                                icon: 'success'
                            });
                        }
                    });

            } else {
                swal("Cancelled", "Upload action cancelled!", "error");
            }
        });
    }

    s.uploadAll = function (row_index)
    {
        swal(
            {
                title: "Are You Sure To Upload This Application?",
                text: "We would like to confirm this action from you!",
                icon: "warning",
                buttons: [
                    'No, cancel it!',
                    'Yes, I am sure!'
                ],
                dangerMode: true,
            }
        ).then(function (isConfirm) {
            if (isConfirm)
            {
                h.post("../cLeaveTracking/UploadAll",
                    {
                        par_doc_ctrl_nbr: s.datalistgrid[row_index].doc_ctrl_nbr
                    }).then(function (d) {
                        if (d.data.message == "success") {
                            s.datalistgrid = s.datalistgrid.delete(row_index);
                            s.oTable.fnClearTable();
                            if (s.datalistgrid.length != 0) {
                                s.oTable.fnAddData(s.datalistgrid);
                            }
                            swal("Successfully Uploaded!", d.data.ledger_history.length + " Successfully Uploaded", "success");
                        }
                    });
            }
        });
       
    }
    s.saveOverride = function ()
    {
        swal(
            {
                title: "Are You Sure To Override?",
                text: "We would like to confirm this action from you!",
                icon: "warning",
                buttons: [
                    'No, cancel it!',
                    'Yes, I am sure!'
                ],
                dangerMode: true,
            }
        ).then(function (isConfirm)
        {
            if (isConfirm)
            {
                h.post("../cLeaveTracking/SubmitOverride",
                    {
                        par_ledger_ctrl_no: s.rowX.ledger_ctrl_no,
                        par_doc_ctrl_nbr: s.rowX.doc_ctrl_nbr,
                        par_remarks: $('#override_remarks').val(),
                        par_leave_ctrlno: s.rowX.leave_ctrlno,
                        par_empl_id: s.rowX.empl_id
                    }).then(function (d) {
                        if (d.data.message == "success")
                        {
                            s.datalistgrid_dtl[s.rowIndex].remarks = $('#override_remarks').val();
                            if ($("#ddl_filter option:selected").val() == "TFU" && $('#override_remarks').val() == "")
                            {
                               
                                $("#btn_upload" + s.rowIndex).removeAttr("disabled");
                                $("#btn_upload" + s.rowIndex).removeClass("btn-danger");
                                $("#btn_upload" + s.rowIndex).addClass("btn-info");
                            }
                            else if ($("#ddl_filter option:selected").val() == "TU" && $('#override_remarks').val() != "") //ALREADY UPLOADED AND REMARKS IS BLANK
                            {
                                $("#btn_upload" + s.rowIndex).attr("disabled", true);
                                $("#btn_upload" + s.rowIndex).removeClass("btn-info");
                                $("#btn_upload" + s.rowIndex).addClass("btn-danger");
                            }
                            else if ($("#ddl_filter option:selected").val() == "TU" && $('#override_remarks').val() == "") //ALREADY UPLOADED AND REMARKS IS BLANK
                            {  
                                $("#btn_upload" + s.rowIndex).attr('ng-click', 'uploadClick(' + s.rowIndex + ')');
                                $("#btn_upload" + s.rowIndex).removeAttr("disabled");
                                $("#btn_upload" + s.rowIndex).removeClass("btn-danger");
                                $("#btn_upload" + s.rowIndex).addClass("btn-info");

                                $compile($("#btn_upload" + s.rowIndex))($scope);
                            }
                            else
                            {
                                $("#btn_upload" + s.rowIndex).attr("disabled",true);
                                $("#btn_upload" + s.rowIndex).removeClass("btn-info");
                                $("#btn_upload" + s.rowIndex).addClass("btn-danger");
                            }

                            swal({
                                title: 'SUCCESSFULLY OVERRIDE!',
                                text: 'Remarks successfully override!',
                                icon: 'success'
                            });
                            $("#modal_override").modal("hide");
                        }
                    });
               
            } else {
                swal("Cancelled", "Override action cancelled!", "error");
            }
        });
    }

    //***********************************************************//
    //*** VJA -  2021-06-03 - Button for Print Ledger
    //***********************************************************//
    s.btn_print_ledger = function () {
        var empl_id = $("#ddl_name option:selected").val();
        var ReportName = "CrystalReport"
        var SaveName = "Crystal_Report"
        var ReportType = "inline"
        var ReportPath = ""
        var sp = ""
        var p_date_fr = $("#txtb_date_fr").val()
        var p_date_to = $("#txtb_date_to").val()
        var p_rep_mode = $("#ddl_rep_mode option:selected").val();

        s.lbl_report_header = "Print Leave Card";

        sp = "sp_leaveledger_report,p_empl_id," + empl_id + ",p_date_fr," + p_date_fr + ",p_date_to," + p_date_to + ",p_rep_mode," + p_rep_mode;

        if (p_rep_mode == "1" ||
            p_rep_mode == "2") {
            ReportPath = "~/Reports/cryLeaveLedger2/cryLeaveLedger.rpt";
        }
        else if (p_rep_mode == "3") {
            ReportPath = "~/Reports/cryCOC/cryCOC.rpt";
        }

        // *******************************************************
        // *** VJA : 2021-07-14 - Validation and Loading hide ****
        // *******************************************************
        $("#modal_generating_remittance").modal({ keyboard: false, backdrop: "static" })
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
                $("#modal_generating_remittance").modal("hide")
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
                    $("#modal_generating_remittance").modal("hide")
                }
            };
        }

        iframe.src = s.embed_link;
        $('#modal_print_preview').modal({ backdrop: 'static', keyboard: false });
        // *******************************************************
        // *******************************************************
    }

   

})