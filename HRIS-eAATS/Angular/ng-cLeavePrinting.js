ng_HRD_App.controller("cLeavePrinting_ctrlr", function ($scope, $compile, $http, $filter) {
    var s       = $scope;
    var h       = $http;
    s.rowLen    = "10";
    var date_now        = new Date();
    s.txtb_date_fr      = moment(date_now).format('YYYY-MM-DD');
    s.txtb_date_to      = moment(date_now).format('YYYY-MM-DD');
    s.datalistgrid_dtl  = [];
    s.rowIndex          = "";
    s.rowDetails        = [];
    s.rowX              = "";
    s.ddl_dept          = "";
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
            s.FilterPageGrid();
        });

        $("#txtb_date_to").on('change', function (e) {
            s.FilterPageGrid();
        });
        

        //**********************************************
        // Initialize data during page loads
        //**********************************************
        $('#modal_generating_remittance').modal({ backdrop: 'static', keyboard: false });
        h.post("../cLeavePrinting/InitializeData").then(function (d) {
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
                        "mData": "ledger_ctrl_no",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-center   btn-block'>" + data + "</span>";
                        }
                    },
                    {
                        "mData": "empl_id",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-center   btn-block'>" + data + " </span>";
                        }
                    },
                    {
                        "mData": "employee_name",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-left   btn-block'>&nbsp;&nbsp;" + data + " </span>";
                        }
                    },
                    {
                        "mData": "final_approval_date",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-left   btn-block'>&nbsp;&nbsp;" + moment(data).format('lll') + " </span>";
                        }
                    },
                    {
                        "mData": "leavetype_descr",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-left   btn-block'>&nbsp;&nbsp;" + data + " </span>";
                        }
                    },
                    {
                        "mData": "department_short_name",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-left   btn-block'>&nbsp;&nbsp;" + data + " </span>";
                        }
                    },
                    {
                        "mData": "leaveledger_period",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-left   btn-block'>&nbsp;&nbsp;" + data + " </span>";
                        }
                    },
                    {
                        "mRender": function (data, type, full, row)
                        {
                            var icn_color = "primary";
                            if (full["print_action"].toString() == "RE-PRINT")
                            {
                                icn_color = "warning";
                            }

                            return '<center><div class="btn-group btn-block">' +
                                    '<button type="button" class="btn btn-' + icn_color+' btn-xs btn-block"  ng-click="btn_print_leave_app(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title=' + full["print_action"] + '><i class="fa fa-print"></i> ' + full["print_action"] +'</button >'
                                    + '</div></center>';
                            
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
        h.post("../cLeavePrinting/FilterPageGrid",
            {
                evaluated_date_from : $('#txtb_date_fr').val(),
                evaluated_date_to   : $('#txtb_date_to').val(),
                par_department_code : $("#ddl_dept option:selected").val()
            }).then(function (d) {
                if (d.data.message == "success") {
                    s.oTable.fnClearTable();
                    s.datalistgrid = d.data.data;
                    if (d.data.data.length > 0)
                    {
                        s.oTable.fnAddData(d.data.data);
                    }
                    $('#modal_generating_remittance').modal("hide");
                }
            });
    }

    //***********************************************************//
    //*** VJA -  2021-06-03 - Button for Print Leave Application
    //***********************************************************//
    s.btn_print_leave_app = function (row_id)
    {
        //s.ddl_report_appl       = "02";
        //s.print_ledger_ctrl_no  = "";
        //s.print_ledger_ctrl_no  = s.datalistgrid[row_id].ledger_ctrl_no;
        //s.show_appl_rep         = true;
        
        var ddate_from_to = new Date();

        var p_date_fr = "2021" + "-01-01";
        var p_date_to = ddate_from_to.getFullYear() + "-12-31";

        //if (s.datalistgrid[row_id].approval_status == 'D' ||
        //    s.datalistgrid[row_id].approval_status == 'L' ||
        //    s.datalistgrid[row_id].leaveledger_entry_type == 'T' 
        //)
        //{
        //    swal("You cannot Edit, Delete, Print and Cancel Posted", "Data already Disapproved or Cancelled", { icon: "warning", });
        //}
        //else if (s.datalistgrid[row_id].leaveledger_entry_type != '2' && s.datalistgrid[row_id].leavetype_code != "CTO")
        //{
        //    swal("You cannot Print", "You cannot print if the entry type are Automated and Leave Adjustment!", { icon: "warning", });
        //}
        //else
        //{
            try
            {
                console.log(s.datalistgrid[row_id])
                var ledger_ctrl_no      = s.datalistgrid[row_id].ledger_ctrl_no;
                var leave_ctrlno        = s.datalistgrid[row_id].leave_ctrlno;
                var empl_id             = s.datalistgrid[row_id].empl_id;

                //var p_month_year        = s.datalistgrid[row_id].leaveledger_period.split("/")[1] + "-" + s.datalistgrid[row_id].leaveledger_period.split("/")[0] + "-01";
                //var p_number_of_hours   = s.datalistgrid[row_id].vl_earned;
                //var p_date_issued       = s.datalistgrid[row_id].leaveledger_date;
                //var p_date_valid        = s.datalistgrid[row_id].leaveledger_date;
                //var p_signatory_name    = "LARA ZAPHIRE KRISTY N. BERMEJO";

                var controller  = "Reports"
                var action      = "Index"
                var ReportName  = "CrystalReport"
                var SaveName    = "Crystal_Report"
                var ReportType  = "inline"
                var ReportPath  = ""
                var sp          = ""
                
                if (s.datalistgrid[row_id].leavetype_code == "CTO")
                {
                    //s.show_appl_rep = false;
                    //if (leave_ctrlno == "" || leave_ctrlno == null)
                    //{
                    //    if (s.datalistgrid[row_id].leaveledger_entry_type == '1')
                    //    {
                    //        ReportPath = "~/Reports/cryCOC_Earn/cryCOC_Earn.rpt";
                    //        sp = "sp_leave_application_coc_earn_report,p_empl_id," + empl_id + ",p_month_year," + p_month_year + ",p_number_of_hours," + p_number_of_hours + ",p_date_issued," + p_date_issued + ",p_date_valid," + p_date_valid + ",p_signatory_name," + p_signatory_name;

                    //        s.RetrieveCardingReport(s.datalistgrid[row_id].empl_id, p_date_fr, p_date_to, "3", "CTO")
                    //    }
                    //    else
                    //    {
                    //        swal("You cannot Print this Report", "There is no CTO Application on Self-Service", { icon: "warning" })
                    //        return;
                    //    }
                    //}
                    //else
                    //{
                        ReportPath = "~/Reports/cryCTO/cryCTO.rpt";
                        sp = "sp_leave_application_hdr_tbl_report_cto,par_leave_ctrlno," + leave_ctrlno + ",par_empl_id," + empl_id + ",par_view_mode," + "02";

                        s.RetrieveCardingReport(s.datalistgrid[row_id].empl_id, p_date_fr, p_date_to, "3", "CTO")
                    //}
                }
                else
                {
                    //s.show_appl_rep = true;
                    ReportPath = "~/Reports/cryApplicationForLeaveRep2/cryApplicationForLeaveRep.rpt";
                    sp = "sp_leave_application_report,p_ledger_ctrl_no," + ledger_ctrl_no;

                    s.RetrieveCardingReport(s.datalistgrid[row_id].empl_id, p_date_fr, p_date_to, "2", "LEAVE")
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
        //}
    }

    s.RetrieveCardingReport = function (par_empl_id, par_date_from, par_date_to, par_rep_mode, print_mode)
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
        var iframe = document.getElementById('iframe_print_preview_carding');
        var iframe_page = $("#iframe_print_preview_carding")[0];
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


    //$('#datalist_grid tbody').on('click', 'span.details-control', function ()
    //{
    //    var tr      = $(this).closest('tr');
    //    var row = $('#datalist_grid').DataTable().row(tr);
    //    s.rowIndex 
    //    if (row.child.isShown())
    //    {
    //        row.child.hide();
    //        tr.removeClass('shown');
    //        return;
    //    }
    //    h.post("../cLeavePrinting/GetUploadingDetails",
    //        {
    //            par_doc_ctrl_nbr: row.data().doc_ctrl_nbr
    //         }).then(function (d)
    //         {
    //            if (d.data.message == "success")
    //            {
    //                s.datalistgrid_dtl = d.data.data;
    //                row.child(format(d.data.data)).show();
    //                tr.addClass('shown');
    //            }
    //        });
       
      

    //});

    ////NEW UPDATE BY: JORGE RUSTOM VILLANUEVA 2020-09-18
    ///* Formatting function for row details - modify as you need */
    //function format(d)
    //{
    //    s.rowDetails = d;
    //    var content = '<div class="col-lg-12 lv-content" style="vertical-align:middle !important;">'
    //        + '<div class="row" style="padding:5px 10px;">'
    //        + '<div class="col-lg-1"><b>LEAVE #</b></div>'
    //        + '<div class="col-lg-1 text-center "><b>ID</b></div>'
    //        + '<div class="col-lg-3 "><b>EMPLOYEE NAME</b></div>'
    //        + '<div class="col-lg-3 "><b>LEAVE TYPE</b></div>'
    //        + '<div class="col-lg-2 "><b>PERIOD</b></div>'
    //        + '<div class="col-lg-2 text-center "><b>ACTION</b></div></div>'
    //        + '<hr style="margin-top:3px !important;margin-bottom:3px !important;">';

    //    for (var i = 0; i < d.length; i++)
    //    {
    //        content = content + '<div class="row lv-details" style="vertical-align:middle !important;">'
    //                            + '<div class="col-lg-1">'
    //                                +'<small><b>' + d[i].leave_ctrlno + '</b></small>'
    //                            + '</div>'
    //                            + '<div class="col-lg-1 text-center">'
    //                                + '<span>' + d[i].empl_id + '</pan>'
    //                            + '</div>'
    //                            + '<div class="col-lg-3">'
    //                                + '<span> &nbsp;' + d[i].employee_name + '</pan>'
    //                            + '</div>'
    //                            + '<div class="col-lg-3">'
    //                                + '<span> &nbsp;' + d[i].leavetype_descr + '</pan>'
    //                                + (d[i].leavesubtype_descr != '' ? '<br/><span> &nbsp;' + d[i].leavesubtype_descr + '</pan>':'')
    //                            + '</div>'
    //                            + '<div class="col-lg-2">'
    //                                + '<small><b>' + d[i].leaveledger_period + '</b></small>'
    //                            + '</div>'
    //                            + '<div class="col-lg-2 text-center">'
    //                                +'<div class="btn-group pull-right">'
    //                                + '<button type="button" class="btn btn-warning btn-sm"     ng-click="overrideClick('+i+')" data-toggle="tooltip" data-placement="top" title="Edit">Override</button >';
                                    
    //                                if (d[i].check_defualt == true && $("#ddl_filter option:selected").val() == "TFU" && d[i].remarks == "")
    //                                {
    //                                    content = content + '<button type="button" id="btn_upload' + i +'" class="btn btn-info btn-sm"     ng-click="uploadClick('+i+')" data-toggle="tooltip" data-placement="top" title="Edit">Upload </button >'
    //                                }
    //                                else if (d[i].check_defualt == false && $("#ddl_filter option:selected").val() == "TU" && d[i].remarks == "") //ALREADY UPLOADED AND REMARKS IS BLANK
    //                                {
    //                                    content = content + '<button type="button" id="btn_upload' + i +'" class="btn btn-info btn-sm"     disabled="true"   data-toggle="tooltip" data-placement="top" title="Already Uploaded">Upload</button >'
    //                                }
    //                                else if (d[i].check_defualt == true && $("#ddl_filter option:selected").val() == "TU" && d[i].remarks == "") //ALREADY UPLOADED AND REMARKS IS BLANK
    //                                {
    //                                    content = content + '<button type="button" id="btn_upload' + i +'" class="btn btn-info btn-sm"     ng-click="uploadClick('+i+')" data-toggle="tooltip" data-placement="top" title="You can still upload this Leave Application.">Upload </button >'
    //                                }
    //                                else {
    //                                    content = content + '<button type="button" id="btn_upload' + i +'" class="btn btn-danger btn-sm" disabled="true"   data-toggle="tooltip" data-placement="top" title="Needs Override to be uploaded">Upload</button >'
    //                                }
                              
    //        content = content + '</div>'
    //                    + '</div>';

    //        content = content        + '</div><hr style="margin-top:3px !important;margin-bottom:3px !important;">';
    //    }
    //    content = content + '</div>';
    //    return $compile(content)($scope);
    //}


    //s.overrideClick = function (row_id)
    //{
    //    s.rowX = s.datalistgrid_dtl[row_id];
    //    $('#override_remarks').val(s.rowX.remarks);
    //    s.rowIndex = row_id;
    //    $("#modal_override").modal({ keyboard: false, backdrop: "static" });
    //}

    //s.uploadClick = function (row_id)
    //{
    //    s.rowX = s.datalistgrid_dtl[row_id];
    //    swal(
    //        {
    //            title: "Are You Sure To Upload This Application?",
    //            text: "We would like to confirm this action from you!",
    //            icon: "warning",
    //            buttons: [
    //                'No, cancel it!',
    //                'Yes, I am sure!'
    //            ],
    //            dangerMode: true,
    //        }
    //    ).then(function (isConfirm) {
    //        if (isConfirm) {
    //            h.post("../cLeavePrinting/SubmitUpload",
    //                {
    //                    par_ledger_ctrl_no: s.rowX.ledger_ctrl_no,
    //                    par_doc_ctrl_nbr: s.rowX.doc_ctrl_nbr,
    //                    par_leave_ctrlno: s.rowX.leave_ctrlno,
    //                    par_empl_id: s.rowX.empl_id
    //                }).then(function (d) {
    //                    if (d.data.message == "success")
    //                    {
    //                        if ($("#ddl_filter option:selected").val() == "TFU")
    //                        {

    //                            $("#btn_upload" + row_id).attr("disabled");
    //                            $("#btn_upload" + row_id).addClass("btn-info");
    //                        }
    //                        else if ($("#ddl_filter option:selected").val() == "TU") //ALREADY UPLOADED AND REMARKS IS BLANK
    //                        {
    //                            $("#btn_upload" + row_id).attr("disabled", true);
    //                            $("#btn_upload" + row_id).removeClass("btn-danger");
    //                            $("#btn_upload" + row_id).addClass("btn-info");
    //                        }
                            

    //                        swal({
    //                            title: 'SUCCESSFULLY UPLOADED!',
    //                            text: 'Leave Successfully Uploaded!',
    //                            icon: 'success'
    //                        });
    //                    }
    //                });

    //        } else {
    //            swal("Cancelled", "Upload action cancelled!", "error");
    //        }
    //    });
    //}

    //s.uploadAll = function (row_index)
    //{
    //    swal(
    //        {
    //            title: "Are You Sure To Upload This Application?",
    //            text: "We would like to confirm this action from you!",
    //            icon: "warning",
    //            buttons: [
    //                'No, cancel it!',
    //                'Yes, I am sure!'
    //            ],
    //            dangerMode: true,
    //        }
    //    ).then(function (isConfirm) {
    //        if (isConfirm)
    //        {
    //            h.post("../cLeavePrinting/UploadAll",
    //                {
    //                    par_doc_ctrl_nbr: s.datalistgrid[row_index].doc_ctrl_nbr
    //                }).then(function (d) {
    //                    if (d.data.message == "success") {
    //                        s.datalistgrid = s.datalistgrid.delete(row_index);
    //                        s.oTable.fnClearTable();
    //                        if (s.datalistgrid.length != 0) {
    //                            s.oTable.fnAddData(s.datalistgrid);
    //                        }
    //                        swal("Successfully Uploaded!", d.data.ledger_history.length + " Successfully Uploaded", "success");
    //                    }
    //                });
    //        }
    //    });
       
    //}
    //s.saveOverride = function ()
    //{
    //    swal(
    //        {
    //            title: "Are You Sure To Override?",
    //            text: "We would like to confirm this action from you!",
    //            icon: "warning",
    //            buttons: [
    //                'No, cancel it!',
    //                'Yes, I am sure!'
    //            ],
    //            dangerMode: true,
    //        }
    //    ).then(function (isConfirm)
    //    {
    //        if (isConfirm)
    //        {
    //            h.post("../cLeavePrinting/SubmitOverride",
    //                {
    //                    par_ledger_ctrl_no: s.rowX.ledger_ctrl_no,
    //                    par_doc_ctrl_nbr: s.rowX.doc_ctrl_nbr,
    //                    par_remarks: $('#override_remarks').val(),
    //                    par_leave_ctrlno: s.rowX.leave_ctrlno
    //                }).then(function (d) {
    //                    if (d.data.message == "success")
    //                    {
    //                        s.datalistgrid_dtl[s.rowIndex].remarks = $('#override_remarks').val();
    //                        if ($("#ddl_filter option:selected").val() == "TFU" && $('#override_remarks').val() == "")
    //                        {
                               
    //                            $("#btn_upload" + s.rowIndex).removeAttr("disabled");
    //                            $("#btn_upload" + s.rowIndex).removeClass("btn-danger");
    //                            $("#btn_upload" + s.rowIndex).addClass("btn-info");
    //                        }
    //                        else if ($("#ddl_filter option:selected").val() == "TU" && $('#override_remarks').val() != "") //ALREADY UPLOADED AND REMARKS IS BLANK
    //                        {
    //                            $("#btn_upload" + s.rowIndex).attr("disabled", true);
    //                            $("#btn_upload" + s.rowIndex).removeClass("btn-info");
    //                            $("#btn_upload" + s.rowIndex).addClass("btn-danger");
    //                        }
    //                        else if ($("#ddl_filter option:selected").val() == "TU" && $('#override_remarks').val() == "") //ALREADY UPLOADED AND REMARKS IS BLANK
    //                        {  
    //                            $("#btn_upload" + s.rowIndex).attr('ng-click', 'uploadClick(' + s.rowIndex + ')');
    //                            $("#btn_upload" + s.rowIndex).removeAttr("disabled");
    //                            $("#btn_upload" + s.rowIndex).removeClass("btn-danger");
    //                            $("#btn_upload" + s.rowIndex).addClass("btn-info");

    //                            $compile($("#btn_upload" + s.rowIndex))($scope);
    //                        }
    //                        else
    //                        {
    //                            $("#btn_upload" + s.rowIndex).attr("disabled",true);
    //                            $("#btn_upload" + s.rowIndex).removeClass("btn-info");
    //                            $("#btn_upload" + s.rowIndex).addClass("btn-danger");
    //                        }

    //                        swal({
    //                            title: 'SUCCESSFULLY OVERRIDE!',
    //                            text: 'Remarks successfully override!',
    //                            icon: 'success'
    //                        });
    //                        $("#modal_override").modal("hide");
    //                    }
    //                });
               
    //        } else {
    //            swal("Cancelled", "Override action cancelled!", "error");
    //        }
    //    });
    //}

    ////***********************************************************//
    ////*** VJA -  2021-06-03 - Button for Print Ledger
    ////***********************************************************//
    //s.btn_print_ledger = function () {
    //    var empl_id = $("#ddl_name option:selected").val();
    //    var ReportName = "CrystalReport"
    //    var SaveName = "Crystal_Report"
    //    var ReportType = "inline"
    //    var ReportPath = ""
    //    var sp = ""
    //    var p_date_fr = $("#txtb_date_fr").val()
    //    var p_date_to = $("#txtb_date_to").val()
    //    var p_rep_mode = $("#ddl_rep_mode option:selected").val();

    //    s.lbl_report_header = "Print Leave Card";

    //    sp = "sp_leaveledger_report,p_empl_id," + empl_id + ",p_date_fr," + p_date_fr + ",p_date_to," + p_date_to + ",p_rep_mode," + p_rep_mode;

    //    if (p_rep_mode == "1" ||
    //        p_rep_mode == "2") {
    //        ReportPath = "~/Reports/cryLeaveLedger2/cryLeaveLedger.rpt";
    //    }
    //    else if (p_rep_mode == "3") {
    //        ReportPath = "~/Reports/cryCOC/cryCOC.rpt";
    //    }

    //    // *******************************************************
    //    // *** VJA : 2021-07-14 - Validation and Loading hide ****
    //    // *******************************************************
    //    $("#modal_generating_remittance").modal({ keyboard: false, backdrop: "static" })
    //    var iframe = document.getElementById('iframe_print_preview2');
    //    var iframe_page = $("#iframe_print_preview2")[0];
    //    iframe.style.visibility = "hidden";

    //    s.embed_link = "../Reports/CrystalViewer.aspx?Params=" + ""
    //        + "&ReportName=" + ReportName
    //        + "&SaveName=" + SaveName
    //        + "&ReportType=" + ReportType
    //        + "&ReportPath=" + ReportPath
    //        + "&id=" + sp // + "," + parameters

    //    if (!/*@cc_on!@*/0) { //if not IE
    //        iframe.onload = function () {
    //            iframe.style.visibility = "visible";
    //            $("#modal_generating_remittance").modal("hide")
    //        };
    //    }
    //    else if (iframe_page.innerHTML()) {
    //        // get and check the Title (and H tags if you want)
    //        var ifTitle = iframe_page.contentDocument.title;
    //        if (ifTitle.indexOf("404") >= 0) {
    //            swal("You cannot Preview this Report", "There something wrong!", { icon: "warning" });
    //            iframe.src = "";
    //        }
    //        else if (ifTitle != "") {
    //            swal("You cannot Preview this Report", "There something wrong!", { icon: "warning" });
    //            iframe.src = "";
    //        }
    //    }
    //    else {
    //        iframe.onreadystatechange = function () {
    //            if (iframe.readyState == "complete") {
    //                iframe.style.visibility = "visible";
    //                $("#modal_generating_remittance").modal("hide")
    //            }
    //        };
    //    }

    //    iframe.src = s.embed_link;
    //    $('#modal_print_preview').modal({ backdrop: 'static', keyboard: false });
    //    // *******************************************************
    //    // *******************************************************
    //}



    

})