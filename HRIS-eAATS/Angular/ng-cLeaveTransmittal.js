﻿ng_HRD_App.controller("cLeaveTransmittal_ctrlr", function ($scope, $compile, $http, $filter) {
    var s = $scope
    var h = $http
    
    s.year                       = [];
    s.rowLen                     = "10";
    s.rowLen_trans               = "10";
    s.btn_name                   = "";
    s.next_status                = "";
    s.ddl_rep_mode               = "1"
    s.ddl_route_nbr              = "01"
    s.ddl_dept                   = "";
    s.ddl_employment_type        = "";
    s.ddl_rep_mode_printing      = "2"
    s.ddl_rep_mode_add_edit      = "2"
    s.route_to_legis             = 'VGO'
    s.ddl_transmittal_class      = "daily"
    s.doc_status_descr           = "New"
    s.leave_transmittal_type_tbl = []

    init()
    function init()
    {
        //**********************************************
        // Initialize data during page loads
        //**********************************************
        $('#modal_generating_remittance').modal({ backdrop: 'static', keyboard: false });
        h.post("../cLeaveTransmittal/InitializeData").then(function (d) {
            if (d.data.message == "success")
            {
                var curr_year       = new Date().getFullYear().toString();
                s.ddl_year          = curr_year;
                s.currentMonth      = new Date().getMonth() + 1
                s.ddl_month         = datestring(s.currentMonth.toString())
                RetrieveYear();
                s.lv_admin_dept_list = d.data.lv_admin_dept_list
                
                init_table_data5([]);
                init_table_data6([]);
                //**********************************************
                //  Show/Hide ADD, EDIT, DELETE button 
                //**********************************************
                d.data.um.allow_add     == "1" ? s.ShowAdd    = true : s.ShowAdd = false;
                d.data.um.allow_delete  == "1" ? s.ShowDelete = true : s.ShowDelete = false;
                d.data.um.allow_edit    == "1" ? s.ShowEdit   = true : s.ShowEdit = false;
                
                s.oTable5.fnClearTable();
                s.datalistgrid5 = d.data.data;
                if (d.data.data.length > 0)
                {
                    s.oTable5.fnAddData(d.data.data);
                }
                s.leave_transmittal_type_tbl = d.data.leave_transmittal_type_tbl
                
                $("#modal_generating_remittance").modal("hide");
            }
            else
            {
                swal(d.data.message, { icon: "warning", });
            }
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
            ReportPath = "~/Reports/cryLeaveLedger2/cryLeaveLedger.rpt";
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

    var init_table_data5 = function (par_data) {
        try {
            s.datalistgrid5 = par_data;
            s.oTable5 = $('#datalist_grid_transmit').dataTable(
                {
                    data: s.datalistgrid5,
                    bSort: true,
                    bAutoWidth: false,
                    sDom: 'rt<"bottom"ip>',
                    columns: [
                        //{
                        //    "mData": null,
                        //    "mRender": function (data, type, full, row) {
                        //        return "<center><span class='details-control' style='display:block;' ></center>"
                        //    }
                        //},
                        {
                            "mData": "doc_ctrl_nbr",
                            "mRender": function (data, type, full, row) {
                                return "<span class='small text-center btn-block'>" + data + "</span>"
                            }
                        },
                        {
                            "mData": "employment_type_desr",
                            "mRender": function (data, type, full, row)
                            {
                                var route_descr = "<br>&nbsp;&nbsp;<small class='badge badge-success'>" + full["transmittal_type_descr"]+"</small>";
                                return "<span class='small text-center'>&nbsp;&nbsp;" + data + route_descr + "</span>"
                            }
                        },
                        {
                            "mData": "department_descr",
                            "mRender": function (data, type, full, row)
                            {
                                return "<span class='small'>&nbsp;&nbsp;" + data + "</span>"
                                //return "<span class='small'>&nbsp;&nbsp;" + (full["department_code"].toString().trim() == "" ? "" : data) + "</span>"
                                
                                
                            }
                        },
                        {
                            "mData": "transmittal_descr",
                            "mRender": function (data, type, full, row) {
                                return "<span class='small'>&nbsp;&nbsp;" + data + "</span>"
                            }
                        },
                        {
                            "mRender": function (data, type, full, row)
                            {
                                return "<center><span class='small text-center'>&nbsp;&nbsp;" + moment(full["approved_period_from"].toString()).format('LL') + " - " + moment(full["approved_period_to"].toString()).format('LL') + "</span></center>"
                            }
                        },
                        {
                            "mData": "doc_status_descr",
                            "mRender": function (data, type, full, row)
                            {
                                var color = "";
                                var icon_class = "";

                                if (full["doc_status"].toString() == "N")
                                {
                                    color       = "primary"
                                    icon_class  = "fa fa-minus-circle"
                                }
                                else if (full["doc_status"].toString() == "V")
                                {
                                    color       = "info"
                                    icon_class  = "fa fa-arrow-circle-o-left"
                                }
                                    else if (full["doc_status"].toString() == "L" )
                                {
                                    color      = "warning"
                                    icon_class = "fa fa-arrow-circle-o-right"
                                }
                                else if (full["doc_status"].toString() == "F" ||
                                         full["doc_status"].toString() == "T" ||
                                         full["doc_status"].toString() == "U" )
                                {
                                    color       = "success"
                                    icon_class  = "fa fa-thumbs-up"
                                }
                                else
                                {
                                    color       = "danger"
                                    icon_class  = "fa fa-minus-cirlce"
                                }
                                
                                return "<center><span class='badge badge-" + color + "'> <i class='" + icon_class+"'></i>  " + data + "</span></center>"
                            }
                        },
                        {
                            "bSortable": false,
                            "mRender": function (data, type, full, row)
                            {
                                var dis_btn     = true;
                                if (full["doc_status"].toString() == "T" ||
                                    full["doc_status"].toString() == "N")
                                {
                                    dis_btn = false
                                }
                                var dis_btn_rlsd = true;
                                if (full["doc_status"].toString() == "R" ||
                                    full["doc_status"].toString() == "T" ||
                                    full["doc_status"].toString() == "N")
                                {
                                    dis_btn_rlsd    = false;
                                }

                                var dis_btn_rcvd = true;
                                if (full["doc_status"].toString() == "T" ||
                                    full["doc_status"].toString() == "O" 
                                    )
                                {
                                    dis_btn_rcvd = false;
                                }
                                return '<div class="btn-group btn-xs" >' +
                                       '<div class="ibox-tools" style="text-align: center !important">' +
                                       '<a class="dropdown-toggle btn btn-xs" data-toggle="dropdown" href="#">' +
                                       '&nbsp;&nbsp;<span class="badge badge-danger" >' + full["transmittal_cnt"] + '</span>'+
                                       '&nbsp;&nbsp;<i class="fa fa-cogs"></i> Action' +
                                       '</a>' +
                                       '<ul class="dropdown-menu dropdown-user">' +
                                       '<li>' +
                                        '<a id="btn_show_dtl_id' + full["doc_ctrl_nbr"] + '"    class="dropdown-item" ng-click="btn_show_dtl(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Show Details">  <span class="badge badge-danger" >' + full["transmittal_cnt"] +'</span> Show Details</a >' +
                                       '</li>' +
                                        '<li ng-hide="' + dis_btn +'">' +
                                        '<a class="dropdown-item" ng-click="btn_edit_action_trans(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Edit">  <i class="fa fa-edit"></i> Edit</a >' +
                                        '</li>' +
                                        '<li ng-hide="' + dis_btn +'">' +
                                        '<a class="dropdown-item" ng-click="btn_del_row_trans(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Delete"><i class="fa fa-trash"></i> Delete</a>' +
                                        '</li>' +
                                        '<li >' +
                                        '<a class="dropdown-item" ng-click="btn_print_row(' + row["row"] + ',\'1\')" data-toggle="tooltip" data-placement="top" title="Print"><i class="fa fa-print"></i> Print</a>' +
                                        '</li>' +
                                        '<li ng-hide="' + dis_btn_rlsd + '">' +
                                        '<a class="dropdown-item"  ng-click="btn_release(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Release"><i class="fa fa-forward"></i> Release</a>' +
                                        '</li>' +
                                        '<li ng-hide="' + dis_btn_rcvd + '">' +
                                        '<a class="dropdown-item"  ng-click="btn_receive(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Receive"><i class="fa fa-backward"></i> Receive</a>' +
                                        '</li>' +
                                        '<li>' +
                                        '<a class="dropdown-item"  ng-click="btn_view_history(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="View Information and History"><i class="fa fa-history"></i> View History</a>' +
                                        '</div>' +
                                        '</div>'
                            }
                        }
                    ],
                    "createdRow": function (row, data, index)
                    {
                        $compile(row)($scope);  //add this to compile the DOM
                    },

                });
        }
        catch (err) {
            swal({ icon: "warning", title: err.message });
        }

    }

    var init_table_data6 = function (par_data) {
        try {
            s.datalistgrid6 = par_data;
            s.oTable6 = $('#datalist_grid_transmit_dtl').dataTable(
                {
                    data: s.datalistgrid6,
                    bSort: false,
                    //bAutoWidth: true,
                    sDom: 'rt<"bottom">',
                    paging: false,
                    columns: [
                        {
                            "targets": 1, "mData": "transmitted_flag", "mRender": function (data, type, full, row) {
                                var checked = ""

                                if (data == "Y") {
                                    checked = "checked"
                                }
                                else {
                                    checked = ""
                                }
                                
                                return '<div id="checkbox_id_vja" style="cursor: pointer;" class="checkbox-primary text-center"><input class="checkbox_show"  style="width:20px;" id="checkbox' + row["row"] + '" ng-click="btn_check_action(' + row["row"] + ')" type="checkbox"' + checked + '><label for="checkbox' + row["row"] + '"></label></div>'
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
                                return '<span> ' + full["employee_name"] + '(' + full["employment_type"]+ ')</span>'
                            }
                        },
                        {
                            "mRender": function (data, type, full, row)
                            {
                                return '<span class="badge badge-success"> &nbsp;&nbsp;' + full["leavetype_descr"] + '  ' + full["leavesubtype_descr"] + '</span>'
                                    + (full["leavetype_code"] == "MZ" ? '&nbsp;<small class="badge badge-danger">' + (full["mone_type"] == 'input_days' ? '' : full["mone_type"]) + ' (' + full["nbr_mone"] + 'days) </small>' : '')

                            }
                        },
                        {
                            "mData": "leaveledger_period",
                            "mRender": function (data, type, full, row) {
                                return '<span> ' + data + '</span>'
                            }
                        },
                        {
                            "mData": "leave_ctrlno",
                            "mRender": function (data, type, full, row) {
                                return '<span> ' + data + '</span>'
                            }
                        },
                        {
                            "mData": "ledger_ctrl_no",
                            "mRender": function (data, type, full, row) {
                                return '<span> ' + data + '</span>'
                            }
                        },
                        {
                            "mData": "final_approval_date",
                            "mRender": function (data, type, full, row) {
                                return "<span class='badge badge-success'>" + moment(data).format('YYYY-MM-DD HH:mm:ss') + "</span>"
                            }
                        }

                    ],
                    "createdRow": function (row, data, index) {
                        $compile(row)($scope);
                    }

                });
        }
        catch (err) {
            swal({ icon: "warning", title: err.message });
        }
    }
    
    s.RetrieveTransmittal_HDR = function (daily_monthly, doc_status_descr)
    {
        s.show_department = true;
        if (s.ddl_transmittal_class == "monthly") {
            $('#ddl_route_nbr').val('06')
            s.show_department = true;
        }
        else {
            $('#ddl_route_nbr').val('01')
            s.show_department = false;
        }

        $('#modal_generating_remittance').modal({ backdrop: 'static', keyboard: false });

        h.post("../cLeaveTransmittal/RetrieveTransmittal_HDR",
        {
             created_year    : s.ddl_year
            ,created_month   : s.ddl_month
            , daily_monthly  : daily_monthly
            , doc_status_descr: doc_status_descr

        }).then(function (d)
        {
            if (d.data.message == "success")
            {
                s.oTable5.fnClearTable();
                s.datalistgrid5 = d.data.data;
                if (d.data.data.length > 0)
                {
                    s.oTable5.fnAddData(d.data.data);
                }
            }
            else
            {
                swal({ icon: "warning", title: d.data.message  });
            }
            $('#modal_generating_remittance').modal("hide");
        })

    }

    s.openModal_Add = function ()
    {
        ValidationResultColor("ALL", false);
        s.show_dtl                      = false;
        s.dis_title                     = false;
        s.show_footer                   = true;
        s.txtb_doc_ctrl_nbr             = "";
        s.txtb_transmittal_descr        = "";
        var date_now                    = new Date();
        $('#txtb_approved_period_from').val(moment(date_now).format('YYYY-MM-DD'))
        $('#txtb_approved_period_to').val(moment(date_now).format('YYYY-MM-DD'))
        s.txtb_created_by               = "";
        s.txtb_created_dttm             = "";
        s.ddl_route_nbr                 = "01"
        s.ddl_dept                      = "";
        s.ddl_employment_type           = "";
        s.is_legis                      = false;
        s.route_to_legis                = "VGO";
        
        s.show_dtl                      = false;
        s.show_save                     = true
        s.action                        = "ADD";
        
        s.show_department               = true;
        if (s.ddl_transmittal_class == "monthly")
        {
            $('#ddl_route_nbr').val('06')
            s.show_department = true;
        }
        else
        {
            $('#ddl_route_nbr').val('01')
            s.show_department = false;
        }

        h.post("../cLeaveTransmittal/RetrieveNextNbr").then(function (d)
        {
            if (d.data.message == "success")
            {
                s.txtb_doc_ctrl_nbr = "LV-" + d.data.nxt_ctrl_nbr.key_value
                $('#modal_openCreateTransmittal_dtl').modal({ backdrop: 'static', keyboard: false });
            }
            else
            {
                swal({ icon: "warning", title: d.data.message });
            }
        })
        
    }
    
    function ValidationResultColor(par_object_id, par_v_result)
    {
        if (par_v_result)
        {
            $("#" + par_object_id).addClass("required");
            $("#lbl_" + par_object_id + "_req").text("Required Field");
        }
        else
        {
            $("#txtb_transmittal_descr").removeClass("required");
            $("#lbl_txtb_transmittal_descr_req").text("");

            $("#txtb_approved_period_from").removeClass("required");
            $("#lbl_txtb_approved_period_from_req").text("");

            $("#txtb_approved_period_to").removeClass("required");
            $("#lbl_txtb_approved_period_to_req").text("");

            $("#ddl_dept").removeClass("required");
            $("#lbl_ddl_dept_req").text("");

            $("#ddl_route_nbr").removeClass("required");
            $("#lbl_ddl_route_nbr_req").text("");
        }
    }
    
    function ValidateFields()
    {
        var return_val = true;
        ValidationResultColor("ALL", false);

        //if ($('#txtb_transmittal_descr').val() == "") {
        //    ValidationResultColor("txtb_transmittal_descr", true);
        //    return_val = false;
        //}
        if ($('#ddl_dept option:selected').val().trim() == "" && $('#ddl_transmittal_class option:selected').val().trim() == "monthly")
        {
            ValidationResultColor("ddl_dept", true);
            return_val = false;
        }
        if ($('#txtb_approved_period_from').val() == "") {
            ValidationResultColor("txtb_approved_period_from", true);
            return_val = false;
        }
        if (checkisdate($('#txtb_approved_period_from').val().trim()) == false) {
            ValidationResultColor("txtb_approved_period_from", true);
            $("#lbl_txtb_leave_date_to_req").text("Invalid Date Format");
            return_val = false;
        }
        if ($('#txtb_approved_period_to').val() == "") {
            ValidationResultColor("txtb_approved_period_to", true);
            return;
        }
        if (checkisdate($('#txtb_approved_period_to').val().trim()) == false) {
            ValidationResultColor("txtb_approved_period_to", true);
            $("#lbl_txtb_approved_period_to_req").text("Invalid Date Format");
            return_val = false;
        }
        if ($('#ddl_route_nbr option:selected').val().trim() == "") {
            ValidationResultColor("ddl_route_nbr", true);
            return_val = false;
        }
        
        return return_val;
    }

    function checkisdate(d)
    {
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

    s.btn_save = function ()
    {

        if (ValidateFields())
        {
            var data = {
                     
                 doc_ctrl_nbr          : s.txtb_doc_ctrl_nbr
                ,transmittal_descr     : s.txtb_transmittal_descr
                ,approved_period_from  : $('#txtb_approved_period_from').val()
                ,approved_period_to    : $('#txtb_approved_period_to').val()
                ,doc_status            : "N"
                ,route_nbr             : $('#ddl_route_nbr option:selected').val()
                ,department_code       : s.ddl_dept
                ,employment_tyep       : s.ddl_employment_type
                ,view_mode             : s.ddl_rep_mode_add_edit
                ,is_legis              : s.is_legis
                ,route_to_legis        : s.route_to_legis
            }

            if (s.action == "ADD")
            {
                $('#modal_generating_remittance').modal({ backdrop: 'static', keyboard: false });
                h.post("../cLeaveTransmittal/Save", { data: data }).then(function (d)
                {
                    if (d.data.message == "success")
                    {
                        $('#modal_openCreateTransmittal_dtl').modal("hide");
                        swal("Successfully Saved!", "Your record has been saved!", { icon: "success" });
                        s.RetrieveTransmittal_HDR(s.ddl_transmittal_class, s.doc_status_descr);
                        $('#modal_generating_remittance').modal('hide');
                    }
                    else
                    {
                        swal({ icon: "warning", title: d.data.message });
                        $('#modal_generating_remittance').modal('hide');
                    }
                })
            }
            else if (s.action == "EDIT")
            {
                $('#modal_generating_remittance').modal({ backdrop: 'static', keyboard: false });
                h.post("../cLeaveTransmittal/SaveEdit", { data: data }).then(function (d)
                {
                    if (d.data.message == "success")
                    {
                        $('#modal_openCreateTransmittal_dtl').modal("hide");
                        swal("Successfully Updated!", "Your record has been updated!", { icon: "success" });
                        s.RetrieveTransmittal_HDR(s.ddl_transmittal_class, s.doc_status_descr);
                        $('#modal_generating_remittance').modal('hide');
                    }
                    else
                    {
                        swal({ icon: "warning", title: d.data.message });
                        $('#modal_generating_remittance').modal('hide');
                    }
                })
            }

        }
        
    }

    s.btn_del_row_trans = function (row_index)
    {

        swal({
            title: "Are you sure to delete this record?",
            text: "Once deleted, you will not be able to recover this record!",
            icon: "warning",
            buttons: true,
            dangerMode: true

        })
            .then(function (willDelete) {
                if (willDelete) {
                    h.post("../cLeaveTransmittal/Delete", {
                        par_doc_ctrl_nbr: s.datalistgrid5[row_index].doc_ctrl_nbr
                    }).then(function (d) {
                        if (d.data.message == "success")
                        {
                            var temp = $('#datalist_grid_transmit').DataTable().page.info().page;
                            s.datalistgrid5 = s.datalistgrid5.delete(row_index);
                            s.oTable5.fnClearTable();
                            if (s.datalistgrid5.length != 0)
                            {
                                s.oTable5.fnAddData(s.datalistgrid5);
                            }
                            var table = $('#datalist_grid_transmit').DataTable();
                            table.page(temp).draw(false);
                            swal("Your record has been deleted!", { icon: "success" });
                        }
                        else
                        {
                            swal("Data already deleted by other user/s!", { icon: "warning"});
                            s.datalistgrid5 = s.datalistgrid5.delete(row_index);
                            s.oTable5.fnClearTable();
                            if (s.datalistgrid5.length != 0) {
                                s.oTable5.fnAddData(s.datalistgrid5);
                            }
                        }
                    })
                }
            });
    }

    Array.prototype.delete = function (code) {
        return this.filter(function (d, k) {
            return k != code
        })
    }
    
    s.btn_edit_action_trans = function (row_id)
    {
        ValidationResultColor("ALL", false);
        s.show_dtl = false;
        s.show_footer = true;
        s.dis_title = false;
        s.show_save = false
        s.action = "EDIT";

        s.txtb_doc_ctrl_nbr             = "";
        s.txtb_transmittal_descr        = "";
        s.txtb_approved_period_from     = "";
        s.txtb_approved_period_to = "";
        $('#txtb_approved_period_from').val("")
        $('#txtb_approved_period_to').val("")
        s.txtb_created_by               = "";
        s.txtb_created_dttm             = "";
        s.ddl_route_nbr                 = "01"
        s.ddl_dept                      = "";
        s.ddl_employment_type = "";
        s.is_legis                      = false;
        s.route_to_legis                = "VGO";

        s.txtb_doc_ctrl_nbr         = s.datalistgrid5[row_id].doc_ctrl_nbr
        s.txtb_transmittal_descr    = s.datalistgrid5[row_id].transmittal_descr  
        s.txtb_approved_period_from = moment(s.datalistgrid5[row_id].approved_period_from).format('YYYY-MM-DD')  
        s.txtb_approved_period_to = moment(s.datalistgrid5[row_id].approved_period_to).format('YYYY-MM-DD')  
        $('#txtb_approved_period_from').val(moment(s.datalistgrid5[row_id].approved_period_from).format('YYYY-MM-DD'))
        $('#txtb_approved_period_to').val(moment(s.datalistgrid5[row_id].approved_period_to).format('YYYY-MM-DD'))
        s.txtb_created_by           = s.datalistgrid5[row_id].created_by
        s.txtb_created_dttm         = moment(s.datalistgrid5[row_id].doc_dttm).format('YYYY-MM-DD HH:mm:ss')
        s.ddl_route_nbr             = s.datalistgrid5[row_id].route_nbr
        s.ddl_dept                  = s.datalistgrid5[row_id].department_code
        s.ddl_employment_type       = s.datalistgrid5[row_id].employment_tyep
        s.is_legis                  = s.datalistgrid5[row_id].is_legis;
        s.route_to_legis            = s.datalistgrid5[row_id].route_to_legis;

        s.show_department = true;
        if (s.ddl_transmittal_class == "monthly") {

            s.show_department = true;
        }
        else {

            s.show_department = false;
        }

        $('#modal_openCreateTransmittal_dtl').modal({ backdrop: 'static', keyboard: false }); 
    }

    s.btn_show_dtl = function (row_id)
    {
        ValidationResultColor("ALL", false);
        s.show_footer = false;
        s.show_dtl = true;
        s.dis_title = true;

        s.txtb_doc_ctrl_nbr             = "";
        s.txtb_transmittal_descr        = "";
        $('#txtb_approved_period_from').val('')
        $('#txtb_approved_period_to').val('')
        s.txtb_created_by               = "";
        s.txtb_created_dttm             = "";
        s.ddl_route_nbr                 = "01"
        s.ddl_dept                      = "";
        s.ddl_employment_type           = "";
        s.is_legis                      = false;
        s.route_to_legis                = "VGO";

        s.txtb_doc_ctrl_nbr         = s.datalistgrid5[row_id].doc_ctrl_nbr
        s.txtb_transmittal_descr    = s.datalistgrid5[row_id].transmittal_descr  
        $('#txtb_approved_period_from').val(moment(s.datalistgrid5[row_id].approved_period_from).format('YYYY-MM-DD'))
        $('#txtb_approved_period_to').val(moment(s.datalistgrid5[row_id].approved_period_to).format('YYYY-MM-DD'))
        s.txtb_created_by           = s.datalistgrid5[row_id].created_by
        s.txtb_created_dttm         = moment(s.datalistgrid5[row_id].doc_dttm).format('YYYY-MM-DD HH:mm:ss')
        s.ddl_route_nbr             = s.datalistgrid5[row_id].route_nbr
        s.ddl_dept                  = s.datalistgrid5[row_id].department_code
        s.ddl_employment_type       = s.datalistgrid5[row_id].employment_tyep
        s.is_legis                  = s.datalistgrid5[row_id].is_legis;
        s.route_to_legis            = s.datalistgrid5[row_id].route_to_legis;

        s.show_department = true;
        if (s.ddl_transmittal_class == "monthly") {

            s.show_department = true;
        }
        else {

            s.show_department = false;
        }

        $('#btn_show_dtl_id' + s.datalistgrid5[row_id].doc_ctrl_nbr).addClass('disabled');
        $('#modal_generating_remittance').modal({ backdrop: 'static', keyboard: false });
        
        h.post("../cLeaveTransmittal/RetrieveTransmittal_DTL", {
            par_doc_ctrl_nbr            : s.datalistgrid5[row_id].doc_ctrl_nbr
            , par_approved_period_from  : moment(s.datalistgrid5[row_id].approved_period_from).format('YYYY-MM-DD')  
            , par_approved_period_to    : moment(s.datalistgrid5[row_id].approved_period_to).format('YYYY-MM-DD')  
            , par_department_code       : s.datalistgrid5[row_id].department_code
            , par_employment_type       : s.datalistgrid5[row_id].employment_tyep
            , par_view_mode             : s.ddl_rep_mode_add_edit
            , transmittal_class         : s.ddl_transmittal_class
        }).then(function (d)
        {
            if (d.data.message == "success")
            {
                    s.oTable6.fnClearTable();
                if (d.data.data.length > 0)
                {
                    s.datalistgrid6 = d.data.data;
                    if (d.data.data.length > 0)
                    {
                        s.oTable6.fnAddData(d.data.data);
                        
                        $('#checkbox_all').prop("checked", true)
                        for (var i = 0; i < d.data.data.length; i++)
                        {
                            
                            if (d.data.data[i]["transmitted_flag"] != "Y")
                            {
                                $('#checkbox_all').prop("checked",false)
                            }
                        }
                    }

                    

                    $('#modal_generating_remittance').modal("hide");
                    $('#btn_show_dtl_id' + s.datalistgrid5[row_id].doc_ctrl_nbr).removeClass('disabled');
                }
                else
                {
                    $('#modal_generating_remittance').modal("hide");
                    $('#btn_show_dtl_id' + s.datalistgrid5[row_id].doc_ctrl_nbr).removeClass('disabled');
                }
                $('#modal_openCreateTransmittal_dtl').modal({ backdrop: 'static', keyboard: false });

                $('.checkbox_show').attr('disabled', true)
                $('#checkbox_all').prop("disabled", true)

                if (s.datalistgrid5[row_id].doc_status == "N" ||
                    s.datalistgrid5[row_id].doc_status == "T" )
                {
                    $('#checkbox_all').prop("disabled", false)
                    $('.checkbox_show').attr('disabled', false)
                }


            }
            else
            {
                swal({ icon: "warning", title: d.data.message });
            }
        })
        
    }

    s.btn_check_action = function (row_id)
    {
        var data = {
                     doc_ctrl_nbr        : s.txtb_doc_ctrl_nbr
                    ,ledger_ctrl_no      : s.datalistgrid6[row_id].ledger_ctrl_no  
                    ,doc_remarks         : ''  
                    ,route_nbr           : s.ddl_route_nbr
        }
        h.post("../cLeaveTransmittal/Save_dtl", {
            data: data
            , par_transmitted_flag: s.datalistgrid6[row_id].transmitted_flag 
            , leave_ctrlno        : s.datalistgrid6[row_id].leave_ctrlno   
            , empl_id        : s.datalistgrid6[row_id].empl_id   
        }).then(function (d)
            {
                if (d.data.message == "success")
                {
                    // swal("Successfully Added!","Your record has been saved!",{ icon: "success"});
                    s.RetrieveTransmittal_HDR(s.ddl_transmittal_class, s.doc_status_descr);
                }
                else
                {
                    swal({ icon: "warning", title: d.data.message });
                }
            })
    }
    
    s.btn_print_row = function (row_id, rep_mode) {
        s.row_id_printing = row_id
        rep_mode = s.datalistgrid5[row_id].view_mode

        s.ddl_rep_mode_printing = s.datalistgrid5[row_id].view_mode

        
        if (parseFloat(s.datalistgrid5[row_id].transmittal_cnt) <= 0) {
            swal("You cannot Print this document", "No data found", { icon: "warning" });
            return;
        }
        //if (s.datalistgrid5[row_id].doc_status == "N") {
        //    swal("You cannot Print this document", "Submit instead and Print", { icon: "warning" });
        //    return;
        //}

        var controller = "Reports";
        var action = "Index";
        var ReportName = "";
        var SaveName = "Crystal_Report";
        var ReportType = "inline";
        var sp = "";
        var ReportPath = ""
        
        ReportPath = "~/Reports/cryTransmittal_Leave/";
        ReportName = "cryTransmittal_Leave";
        ReportPath = ReportPath + "" + ReportName + ".rpt";
        sp = "sp_transmittal_leave_rep,par_doc_ctrl_nbr," + s.datalistgrid5[row_id].doc_ctrl_nbr + ",par_view_mode," + rep_mode
        s.employee_name_print = 'LEAVE TRANSMITTAL REPORT';
        
        console.log(sp);

        // *******************************************************
        // *** VJA : 2021-07-14 - Validation and Loading hide ****
        // *******************************************************
        $("#modal_generating_remittance").modal({ keyboard: false, backdrop: "static" })
        var iframe = document.getElementById('iframe_print_preview_trans');
        var iframe_page = $("#iframe_print_preview_trans")[0];
        iframe.style.visibility = "hidden";

        s.embed_link = "../Reports/CrystalViewer.aspx?Params=" + ""
            + "&ReportName=" + ReportName
            + "&SaveName=" + SaveName
            + "&ReportType=" + ReportType
            + "&ReportPath=" + ReportPath
            + "&id=" + sp //+ parameters

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
    
    s.openTrackTransmital = function ()
    {
    
        $('#itcd_doc_info').modal({ backdrop: 'static', keyboard: false });
    }
    
    s.scan_transmittal_ctrl_nbr = function (doc_ctrl_nbr, route_nbr)
    {
        $('#modal_generating_remittance').modal({ backdrop: 'static', keyboard: false });
        h.post("../cLeaveTransmittal/RetriveTransmittalInfo", {
            par_doc_ctrl_nbr            : doc_ctrl_nbr
            ,route_nbr                  : route_nbr
        }).then(function (d) {
            
            if (d.data.message == "success")
            {
                s.txtb_trans_descr      = d.data.data.transmittal_descr
                s.ddl_route_nbr_trk     = d.data.data.route_nbr
                s.lst_trans_dtl         = d.data.data_dtl
                s.lst_doc_history       = d.data.data_history
                $('#modal_generating_remittance').modal("hide");
            }
            else
            {
                $('#modal_generating_remittance').modal("hide");
                swal({ icon: "warning", title: d.data.message });
            }
        })
    }

    s.ReleaseReceive = function (action, doc_ctrl_nbr)
    {
        
        var data =
        {
            doc_ctrl_nbr      : doc_ctrl_nbr  
            ,department_code  : "03"  
            ,vlt_dept_code    : "03"  
            ,doc_remarks      : s.txtb_trans_descr  
            ,document_status  : action   
        };

        var data_hdr =
        {
            doc_ctrl_nbr  : doc_ctrl_nbr  
            ,doc_status   : action   
            ,route_nbr    : s.ddl_route_nbr_trk   
        };

        h.post("../cLeaveTransmittal/ReleaseReceive",
            {
                data        : data,
                data_hdr    : data_hdr
            }).then(function (d) {
            if (d.data.message == "success")
            {
                if (action == "V")
                {
                    // VJA - 2023-11-14 - Receive and Upload
                    swal(
                    {
                        title: "Transmittal Successfully Received!, Are You Sure To Upload This Application?",
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
                                par_doc_ctrl_nbr: doc_ctrl_nbr
                            }).then(function (d)
                            {
                                if (d.data.message == "success")
                                {
                                    $('#itcd_doc_info').modal("hide");
                                    s.RetrieveTransmittal_HDR(s.ddl_transmittal_class, s.doc_status_descr);
                                    swal(d.data.message_descr1,d.data.message_descr,{ icon: "success" });
                                }
                            });
                        }
                    });
                    // VJA - 2023-11-14 - Receive and Upload
                }
                else
                {
                    $('#itcd_doc_info').modal("hide");
                    s.RetrieveTransmittal_HDR(s.ddl_transmittal_class, s.doc_status_descr);
                    swal(d.data.message_descr1,d.data.message_descr,{ icon: "success" });
                }

            }
            else {
                swal({ icon: "warning", title: d.data.message });
            }
        })

    }
    
    s.btn_release = function (row_id)
    {
        s.show_rcvd = false;
        s.show_rlsd = true;
        if (s.datalistgrid5[row_id].transmittal_cnt == 0)
        {
            swal({ icon: "warning", title: "No data found" });
            return;
        }

        s.transmittal_ctrl_nbr      = "";
        s.txtb_department_dis       = "";
        s.txtb_employment_type_dis  = "";

        $('#modal_generating_remittance').modal({ backdrop: 'static', keyboard: false });
        h.post("../cLeaveTransmittal/RetriveTransmittalInfo", {
            par_doc_ctrl_nbr      : s.datalistgrid5[row_id].doc_ctrl_nbr
            ,route_nbr            : s.datalistgrid5[row_id].route_nbr
        }).then(function (d) {
            
            if (d.data.message == "success")
            {
                s.txtb_trans_descr          = d.data.data.transmittal_descr
                s.ddl_route_nbr_trk         = d.data.data.route_nbr
                s.lst_trans_dtl             = d.data.data_dtl
                s.lst_doc_history           = d.data.data_history
                //s.scan_transmittal_ctrl_nbr(s.datalistgrid5[row_id].doc_ctrl_nbr);

                s.txtb_trans_descr          = "Released - "+ s.txtb_trans_descr
                s.transmittal_ctrl_nbr      = s.datalistgrid5[row_id].doc_ctrl_nbr
                s.txtb_department_dis       = s.datalistgrid5[row_id].department_descr
                s.txtb_employment_type_dis  = s.datalistgrid5[row_id].employment_type_desr

                $('#itcd_doc_info').modal({ backdrop: 'static', keyboard: false });
                $('#modal_generating_remittance').modal("hide");
            }
            else
            {
                $('#modal_generating_remittance').modal("hide");
                swal({ icon: "warning", title: d.data.message });
            }
        })

        

    }

    s.btn_receive = function (row_id)
    {
        s.show_rcvd = true;
        s.show_rlsd = false;
        if (s.datalistgrid5[row_id].transmittal_cnt == 0)
        {
            swal({ icon: "warning", title: "No data found" });
            return;
        }
        s.transmittal_ctrl_nbr      = "";
        s.txtb_department_dis       = "";
        s.txtb_employment_type_dis  = "";

        $('#modal_generating_remittance').modal({ backdrop: 'static', keyboard: false });
        h.post("../cLeaveTransmittal/RetriveTransmittalInfo", {
            par_doc_ctrl_nbr            : s.datalistgrid5[row_id].doc_ctrl_nbr
            , route_nbr                 : s.datalistgrid5[row_id].route_nbr
        }).then(function (d) {
            
            if (d.data.message == "success")
            {
                s.txtb_trans_descr              = d.data.data.transmittal_descr
                s.ddl_route_nbr_trk             = d.data.data.route_nbr
                s.lst_trans_dtl                 = d.data.data_dtl
                s.lst_doc_history               = d.data.data_history
                //s.scan_transmittal_ctrl_nbr(s.datalistgrid5[row_id].doc_ctrl_nbr);

                s.txtb_trans_descr          = "Received - " + s.txtb_trans_descr
                s.transmittal_ctrl_nbr      = s.datalistgrid5[row_id].doc_ctrl_nbr
                s.txtb_department_dis       = s.datalistgrid5[row_id].department_descr
                s.txtb_employment_type_dis  = s.datalistgrid5[row_id].employment_type_desr

                $('#itcd_doc_info').modal({ backdrop: 'static', keyboard: false });
                $('#modal_generating_remittance').modal("hide");
                
                
            }
            else
            {
                $('#modal_generating_remittance').modal("hide");
                swal({ icon: "warning", title: d.data.message });
            }
        })


    }
    
    s.convertdateX = function (val)
    {
        return moment(val).format('YYYY-MM-DD HH:mm:ss');
    }

    s.btn_view_history = function (row_id)
    {
        s.show_rcvd = false;
        s.show_rlsd = false;

        if (s.datalistgrid5[row_id].transmittal_cnt == 0)
        {
            swal({ icon: "warning", title: "No data found" });
            return;
        }
        
        s.transmittal_ctrl_nbr      = "";
        s.txtb_department_dis       = "";
        s.txtb_employment_type_dis  = "";

        //s.scan_transmittal_ctrl_nbr(s.datalistgrid5[row_id].doc_ctrl_nbr);

        $('#modal_generating_remittance').modal({ backdrop: 'static', keyboard: false });
        h.post("../cLeaveTransmittal/RetriveTransmittalInfo", {
            par_doc_ctrl_nbr       : s.datalistgrid5[row_id].doc_ctrl_nbr
            , route_nbr            : s.datalistgrid5[row_id].route_nbr
        }).then(function (d) {
            
            if (d.data.message == "success")
            {
                s.txtb_trans_descr          = d.data.data.transmittal_descr
                s.ddl_route_nbr_trk         = d.data.data.route_nbr
                s.lst_trans_dtl             = d.data.data_dtl
                s.lst_doc_history           = d.data.data_history

                s.transmittal_ctrl_nbr      = s.datalistgrid5[row_id].doc_ctrl_nbr
                s.txtb_department_dis       = s.datalistgrid5[row_id].department_descr
                s.txtb_employment_type_dis  = s.datalistgrid5[row_id].employment_type_desr

                $('#itcd_doc_info').modal({ backdrop: 'static', keyboard: false });
                $('#modal_generating_remittance').modal("hide");

                
            }
            else
            {
                $('#modal_generating_remittance').modal("hide");
                swal({ icon: "warning", title: d.data.message });
            }
        })


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

    function datestring(d)
    {
        var date_val = ""
        if (d < 10) {
            date_val = '0' + d
        } else {
            date_val = d
        }
        return date_val
    }

    s.save_trk = function (e, row)
    {
        if (e.key.toString() == "Enter")
        {
            h.post("../cLeaveTransmittal/SaveDtlRemarks", { row: row }).then(function (d)
            {
                if (d.data.message == "success")
                {
                    alert("Successfully Updated Remarks")
                }
                else
                {
                    swal({ icon: "warning", title: d.data.message });
                }
            })
        }
    }
    
})