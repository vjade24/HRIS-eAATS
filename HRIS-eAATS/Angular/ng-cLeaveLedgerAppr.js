ng_HRD_App.controller("cLeaveLedgerAppr_ctrlr", function ($scope, $compile, $http, $filter) {
    var s = $scope
    var h = $http

    var userid      = "";
    s.year          = [];
    s.rowLen        = "10";
    s.btn_name      = "";
    s.next_status = "";
    s.ddl_rep_mode = "1"
    s.ddl_route_nbr  = "01"
    s.ddl_dept = "";
    s.ddl_employment_type = "";
    s.ddl_rep_mode_printing = "1"
    var row_id_printing = "";


    function init() {


        //**********************************************
        // Initialize data during page loads
        //**********************************************
        $('#modal_generating_remittance').modal({ backdrop: 'static', keyboard: false });
        h.post("../cLeaveLedgerAppr/InitializeData").then(function (d) {
            if (d.data.message == "success")
            {


                s.leave_type = d.data.leaveType;
                s.leave_sub_type = d.data.leaveSubType;
                s.lv_admin_dept_list = d.data.lv_admin_dept_list
                
                if (d.data.ledgerposting_for_approval_list.length > 0) {
                    init_table_data(d.data.ledgerposting_for_approval_list);
                }
                else {
                    init_table_data([]);
                }
                init_table_data4([]);
                init_table_data5([]);
                init_table_data6([]);
                //**********************************************
                //  Show/Hide ADD, EDIT, DELETE button 
                //**********************************************
                d.data.um.allow_add     == "1" ? s.ShowAdd    = true : s.ShowAdd = false;
                d.data.um.allow_delete  == "1" ? s.ShowDelete = true : s.ShowDelete = false;
                d.data.um.allow_edit    == "1" ? s.ShowEdit   = true : s.ShowEdit = false;
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
                sDom: 'rt<"bottom"ip>',
                pageLength: 10,
                columns: [
                    {
                        "mData": "ledger_ctrl_no",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-center btn-block'>" + data + "</span>"
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
                            return "<span class='text-left   btn-block'>" + data + "</span>"
                        }
                    },
                    {
                        "mData": "leavetype_descr",
                        "mRender": function (data, type, full, row) {
                            return "<span class='btn-block'>&nbsp;" + data + "</span>"
                        }
                    },
                    {
                        "mData": "worklist_status",
                        "mRender": function (data, type, full, row) {
                            var temp = "";
                            if (full["approval_status"].toString() == "1" || full["approval_status"].toString() == "2" || full["approval_status"].toString() == "F") {
                                temp = "<b><span class='text-center btn-block approved-bg'>" + data + "</span></b>"
                            }
                            else if (full["approval_status"].toString() == "D") {
                                temp = "<b><span class='text-center btn-block disapproved-bg'>" + data + "</span></b>"
                            }
                            else if (full["approval_status"].toString() == "C" || full["approval_status"].toString() == "L") {
                                temp = "<b><span class='text-center btn-block cancel-bg'>" + data + "</span></b>"
                            }
                            else if (full["approval_status"].toString() == "N") {
                                temp = "<b><span class='text-center btn-block new-bg'>" + data + "</span></b>"
                            }
                            else if (full["approval_status"].toString() == "R") {
                                temp = "<b><span class='text-center btn-block reviewed-bg'>" + data + "</span></b>"
                            }
                            else if (full["approval_status"].toString() == "S") {
                                temp = "<b><span class='text-center btn-block submitted-bg'>" + data + "</span></b>"
                            }
                            return temp;
                        }
                    },
                    {
                        "mData": "worklist_action",
                        "bSortable": false,
                        "mRender": function (data, type, full, row) {
                            return '<center><div class="btn-group">' +
                                '<button type="button" ng-show="ShowEdit" class="btn btn-info btn-sm" ng-click="btn_edit_action(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Edit"> ' + data + '</button >' +
                                //'<button type="button" ng-show="ShowDelete" class="btn btn-danger btn-sm" ng-click="btn_del_row(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Delete"><i class="fa fa-trash"></i></button>' +
                                '</div></center>';
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
    //***********************************************************//
    //***Field validation for remittance type before opening add modal
    //***********************************************************// 
    function ValidateFields() {
        var return_val = true;
        ValidationResultColor("ALL", false);

        if ($('#txtb_remarks').val() == "")
        {
            ValidationResultColor("txtb_remarks", true);
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
            $("#lbl_" + par_object_id + "_req").text("Required Field -- (Cancel Pending or Disapprove)!");
        }
        else {
            //remove of refresh the object form being required

            $("#txtb_remarks").removeClass("required");
            $("#lbl_txtb_remarks_req").text("");

        }
    }

    function month_int_to_name(month_int) {
        var name_mons = "January";

        if (month_int == "01") {
            name_mons = "Janaury";
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

    function clearentry() {
        s.txtb_remarks = "";

        $("#txtb_remarks").removeClass("required");
        $("#lbl_txtb_remarks_req").text("");

        s.txtb_ledger_ctrl_no       = "";
        s.ddl_leave_type            = "";
        s.ddl_leave_sub_type        = "";
        s.txtb_particulars          = "";
        s.ddl_entry_type            = "";
        s.txtb_signame3_ovrd        = "";
        s.txtb_sigpos3_ovrd         = "";
        // s.txtb_empl_id              = $("#ddl_name option:selected").val();
        // s.leavetype_description     = $("#ddl_leave_type option:selected").html();
                                    
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

        s.next_status               = "";
        s.temp_approval_id          = "";

    }
    function get_page(empl_id) {
        var nakit_an = false;
        var rowx = 0;
        $('#datalist_grid tr').each(function () {
            $.each(this.cells, function (cells) {
                if (cells == 0) {
                    if ($(this).text() == empl_id) {
                        nakit_an = true;
                        return false;
                    }
                }
            });
            if (nakit_an) {
                $(this).addClass("selected");
                return false;
            }
            rowx++;
        });
        return nakit_an;
    }
    //*********************************************//
    //*** Filter Page Grid
    //********************************************// 
    s.FilterPageGrid = function ()
    {
        $('#modal_generating_remittance').modal({ backdrop: 'static', keyboard: false });
        h.post("../cLeaveLedgerAppr/FilterPageGrid", {
            par_show_history: $('#chk_show_approved').prop("checked") == true ? "Y" : "N",
            par_rep_mode: s.ddl_rep_mode
        }).then(function (d)
        {
            if (d.data.message == "success")
            {
                s.oTable.fnClearTable();
                s.datalistgrid = d.data.filteredGrid;
                if (d.data.filteredGrid.length > 0) {
                    s.oTable.fnAddData(d.data.filteredGrid);
                }

                $('#modal_generating_remittance').modal("hide")
            }
        })
    }
    //************************************// 
    //*** Open Edit Modal         
    //**********************************// 
    s.btn_edit_action = function (row_id)
    {
        clearentry();
        s.isEdit = true;
        s.ModalTitle = "Leave Posting Approval";

        s.txtb_remarks = s.datalistgrid[row_id].details_remarks
        if (s.datalistgrid[row_id].next_status == "" || s.datalistgrid[row_id].next_status == "L")
        {
            s.show_actions = false;
            s.show_cancel = true;
        }
        else
        {
            s.show_actions = true;
            s.show_cancel = true;
            btn = document.getElementById('approve');
            if (s.datalistgrid[row_id].next_status == "R")
            {
                btn.innerHTML = '<i class="fa fa-thumbs-o-up"></i> Review';
            }
            else if (s.datalistgrid[row_id].next_status == "F")
            {
                btn.innerHTML = '<i class="fa fa-thumbs-up"></i> Final Approve';
            }
            else
            {
                btn.innerHTML = '<i class="fa fa-thumbs-up"></i> ' + ' Approve';
            }
        }

        

        s.next_status       = s.datalistgrid[row_id].next_status
        s.temp_approval_id  = s.datalistgrid[row_id].approval_id

        //var application_nbr = s.datalistgrid[row_id].ledger_ctrl_no;
        //var controller = "Reports"
        //var action = "Index"
        //var ReportName = "CrystalReport"
        //var SaveName = "Crystal_Report"
        //var ReportType = "inline"
        //var ReportPath = ""
        //var sp = ""

        //ReportPath = "~/Reports/cryApplicationForLeaveRep/cryApplicationForLeaveRep.rpt";
        //sp = "sp_leave_application_rep,par_ledger_ctrl_no," + application_nbr;

        //s.embed_link = "../" + controller + "/" + action + "?ReportName=" + ReportName
        //    + "&SaveName=" + SaveName
        //    + "&ReportType=" + ReportType
        //    + "&ReportPath=" + ReportPath
        //    + "&Sp=" + sp;

        //console.log(s.embed_link);
        //$('#iframe_print_preview').attr('src', s.embed_link);

        try {
            var ledger_ctrl_no = s.datalistgrid[row_id].ledger_ctrl_no;

            var controller  = "Reports"
            var action      = "Index"
            var ReportName  = "CrystalReport"
            var SaveName    = "Crystal_Report"
            var ReportType  = "inline"
            var ReportPath  = ""
            var sp = ""
            var leave_ctrlno = s.datalistgrid[row_id].leave_ctrlno;
            var empl_id      = s.datalistgrid[row_id].empl_id;

            if (s.datalistgrid[row_id].leavetype_code == "CTO")
            {
                ReportPath = "~/Reports/cryCTO/cryCTO.rpt";
                sp = "sp_leave_application_hdr_tbl_report_cto,par_leave_ctrlno," + leave_ctrlno + ",par_empl_id," + empl_id + ",par_view_mode," + "02";
                console.log(sp)
            }
            else
            {
                //ReportPath = "~/Reports/cryApplicationForLeaveRep/cryApplicationForLeaveRep.rpt";
                //sp = "sp_leave_application_rep3,par_ledger_ctrl_no," + ledger_ctrl_no;

                ReportPath = "~/Reports/cryApplicationForLeaveRep2/cryApplicationForLeaveRep.rpt";
                sp = "sp_leave_application_report,p_ledger_ctrl_no," + ledger_ctrl_no;
            }

            s.embed_link3 = "../" + controller + "/" + action + "?ReportName=" + ReportName
                + "&SaveName=" + SaveName
                + "&ReportType=" + ReportType
                + "&ReportPath=" + ReportPath
                + "&Sp=" + sp;

            $('#iframe_print_preview').attr('src', s.embed_link3);
            
        }
        catch (err) {
            swal({ icon: "warning", title: err.message });
        }

        // **************************************************************************
        // ************** Retrieve Header and Details *******************************
        //***************************************************************************

        // add_modal_descr = "Edit Existing Record";
        // ADDEDITMODE     = "EDIT";
        s.isEdit = true;

        s.txtb_ledger_ctrl_no   = s.datalistgrid[row_id].ledger_ctrl_no;
        s.txtb_empl_name        = s.datalistgrid[row_id].employee_name;
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
            
         h.post("../cLeaveLedgerAppr/GetSumofLeaveDetails",
             {
                 par_ledger_ctrl_no  : s.datalistgrid[row_id].ledger_ctrl_no   
             ,par_leavetype_code  : s.datalistgrid[row_id].leavetype_code
         }).then(function (d)
         {
             s.txtb_no_of_days           = d.data.sum_wp_and_wop;
             s.txtb_balance_as_of_hdr    = d.data.dtl_value.leaveledger_balance_as_of
             s.txtb_restore_deduct_hdr   = d.data.dtl_value.leaveledger_restore_deduct
             s.txtb_abs_und_wp_hdr       = d.data.dtl_value.leaveledger_abs_und_wp
             s.txtb_abs_und_wop_hdr      = d.data.dtl_value.leaveledger_abs_und_wop
         })
        
        h.post("../cLeaveLedgerAppr/GetLedgerDetails",
        {
            par_ledger_ctrl_no: s.datalistgrid[row_id].ledger_ctrl_no
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
        
        s.SelectEntryType();
        s.SelectLeaveType();


        //**********************************************
        //  Set Description or Label for Number of ---
        //**********************************************
        s.lbl_nbr_days_hrs = "No. of Days:";
        if (s.ddl_leave_type == "CTO") // CTO Card Viewing
        {
            s.lbl_nbr_days_hrs = "No. of Hours:";
        }
        //**********************************************
        //**********************************************

        // **************************************************************************
        // ************** Retrieve Header and Details *******************************
        //***************************************************************************
        
        setTimeout(function () {
            $('#main_modal').modal("show");
        }, 300);
    }
    //*********************************************************************//
    //*** VJA - 2021-06-03 - Button for Cancel Pending
    //*********************************************************************//
    s.btn_cancel_pending = function ()
    {
       if (ValidateFields()) {
           s.next_status = "C";
           action();
           s.swal_title = "Application has been cancelled successfully!";
       }
    }
    //*********************************************************************//
    //*** VJA - 2021-06-03 - Button for Disapprove
    //*********************************************************************//
    s.btn_disapprove = function () {
        if (ValidateFields()) {
            s.next_status = "D";
            action();
            s.swal_title = "Application has been disapproved successfully!";
        }
    }
    //*********************************************************************//
    //*** VJA - 2021-06-03 - Button for Approve
    //*********************************************************************//
    s.btn_approve = function ()
    {
        if (s.next_status == "R") {
            s.swal_title = "Application has been reviewed successfully!";
        }
        else
        {
            s.swal_title = "Application has been approved successfully!";
        }
        action();
    }
    //*********************************************************************//
    //*** VJA - 2021-06-03 - Button for Cancel
    //*********************************************************************//
    s.btn_cancel_click = function () {
        if (ValidateFields()) {
            s.next_status = "L";
            action();
            s.swal_title = "Application has been cancelled successfully!";
        }
    }
    //*********************************************************************//
    //*** VJA - 2021-06-03 - Action for Approve, Review, Cancel or Disapprove
    //*********************************************************************//
    function action()
    {
        if (s.next_status == "C") {
            btn = document.getElementById('cancel_pending');
            btn.innerHTML = '<i class = "fa fa-spinner fa-spin"></i> Cancel Pending';
        }
        else if (s.next_status == "D") {
            btn = document.getElementById('disapprove');
            btn.innerHTML = '<i class = "fa fa-spinner fa-spin"></i> Disapprove';
        }
        else if (s.next_status == "F") {
            btn = document.getElementById('approve');
            btn.innerHTML = '<i class = "fa fa-spinner fa-spin"></i> Final Approve';
        }
        else if (s.next_status == "L") {
            btn = document.getElementById('btn_cancel');
            btn.innerHTML = '<i class = "fa fa-spinner fa-spin"></i> Cancel Leave';
        }
        else {
            btn = document.getElementById('approve');
            btn.innerHTML = '<i class = "fa fa-spinner fa-spin"></i> Review';
        }

        var data =
        {
            ledger_ctrl_no          : s.txtb_ledger_ctrl_no
            , approval_status       : s.next_status
            , details_remarks       : s.txtb_remarks
            , approval_id           : s.temp_approval_id
        }



        h.post("../cLeaveLedgerAppr/ApprReviewerAction", { data: data }).then(function (d) {
            if (d.data.message == "success") {

                if (s.next_status == "C") {
                    btn.innerHTML = '<i class="fa fa-ban"> </i> Cancel Pending';
                }
                else if (s.next_status == "D") {
                    btn.innerHTML = '<i class="fa fa-thumbs-down"> </i> Disapprove';
                }
                else if (s.next_status == "L") {
                    btn.innerHTML = '<i class="fa fa-ban"> </i> Cancel Leave';
                }
                else {
                    btn.innerHTML = '<i class="fa fa-thumbs-up"> </i> ' + ' Approve';
                }

                s.FilterPageGrid();
                $('#main_modal').modal("hide");
                swal({ icon: "success", title: s.swal_title });
            }
            else {
                swal(d.data.message, { icon: "warning", });
            }
        });
    }
    
    //***********************************************************//
    //*** VJA - 2021-06-03 - Toogle Textboxes and Modal
    //***********************************************************// 
    s.SelectEntryType = function()
    {
        if (s.ADDEDITMODE == "ADD" || s.ADDEDITMODE == "POST")
        {
            s.id_leave_dtl_show = false;
            //s.dis_entry_type    = false;
            //s.dis_leave_type    = false;
            s.show_Automated    = false;
        }
        else if (s.ADDEDITMODE == "EDIT")
        {
            s.id_leave_dtl_show = true;
            //s.dis_entry_type    = true;
            //s.dis_leave_type    = true;
            s.show_Automated    = true;
        }

        // Automated Leave
        if (s.ddl_entry_type == '1') 
        {
            s.hide_txtb_restore_deduct_hdr  = true;
            s.hide_txtb_abs_und_wp_hdr      = true;
            s.hide_txtb_balance_as_of_hdr   = true;
            s.hide_txtb_abs_und_wop_hdr     = true;
            //s.dis_txtb_no_of_days           = true;
            //s.dis_txtb_balance_as_of_hdr    = false;
            s.id_leave_dtl_show             = false;
            s.hide_txtb_no_of_days          = true;

            s.show_Automated                = false;
           // s.dis_leave_type                = true;
            
            if (s.ADDEDITMODE == "ADD")
            {
                s.id_leave_dtl_show = false;
                s.show_Automated    = false;
                s.ddl_leave_type    = "VL"
            }
            else if (s.ADDEDITMODE == "EDIT")
            {
                s.id_leave_dtl_show = true;
                s.show_Automated    = true;
                s.ddl_leave_type    = "VL"
            }
            s.show_txtb_restore_deduct = true;
        }
        // Leave adjustment 
        else if (s.ddl_entry_type == '3') 
        {
            s.hide_txtb_restore_deduct_hdr  = false;
            s.hide_txtb_abs_und_wp_hdr      = false;
            s.hide_txtb_balance_as_of_hdr   = false;
            s.hide_txtb_abs_und_wop_hdr     = false;
            //s.dis_txtb_no_of_days           = true;
            //s.dis_txtb_balance_as_of_hdr    = false;
            s.id_leave_dtl_show             = false;
            s.hide_txtb_no_of_days          = false;

            s.show_Automated                = true;
            //s.dis_leave_type                = false;
            s.show_txtb_restore_deduct  = true;
        }
        // Leave Application
        else if (s.ddl_entry_type == '2') 
        {
            s.hide_txtb_restore_deduct_hdr  = true;
            s.hide_txtb_abs_und_wp_hdr      = true;
            s.hide_txtb_balance_as_of_hdr   = false;
            s.hide_txtb_abs_und_wop_hdr     = true;
            //s.dis_txtb_no_of_days           = false;
            //s.dis_txtb_balance_as_of_hdr    = true;
            s.hide_txtb_no_of_days          = false;

            s.show_Automated                = true;
            
            if (s.ADDEDITMODE == "ADD")
            {
                s.id_leave_dtl_show = false;
                //s.dis_leave_type    = false;
            }
            else if (s.ADDEDITMODE == "EDIT")
            {
                s.id_leave_dtl_show = true;
                //s.dis_leave_type    = true;
            }
            s.show_txtb_restore_deduct = false;
        }
    }
    //**********************************************
    // Refresh Employee List in Dropdown
    //**********************************************
    s.SelectLeaveType = function ()
    {
        h.post("../cLeaveLedgerAppr/GetLeaveType", {
               par_empl_id          : s.txtb_empl_id
             , par_leavetype_code   : s.ddl_leave_type
        }).then(function (d) {

            s.leavetype_description = $("#ddl_leave_type option:selected").html() == 'Select Here' ? 'Leave Description' : $("#ddl_leave_type option:selected").html()
            s.leave_sub_type        = d.data.leave_subType_lst;

            // Leave adjustment and Automated Leave
            if (s.ddl_entry_type == '1' || s.ddl_entry_type == '3')
            {
                // s.txtb_balance_as_of_hdr = 0;
            }
            // Leave Application
            else if (s.ddl_entry_type == '2')
            {
                if (s.ADDEDITMODE == "ADD")
                {
                    s.txtb_balance_as_of_hdr = d.data.leaveledger_balance_as_of ;
                    
                }
                else if (s.ADDEDITMODE == "EDIT")
                {
                    h.post("../cLeaveLedgerAppr/GetSumofLeaveDetails",
                        {
                            par_ledger_ctrl_no  : s.txtb_ledger_ctrl_no
                            , par_leavetype_code: s.ddl_leave_type
                        }).then(function (d)
                        {
                            if (d.data.message == "success")
                            {
                                s.txtb_balance_as_of_hdr = d.data.dtl_value.leaveledger_balance_as_of;
                            } else
                            {
                                s.txtb_balance_as_of_hdr = 0;
                            }
                            
                        })
                }
                
            }
        });
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
                        //{
                        //    "mData": null,
                        //    "mRender": function (data, type, full, row) {

                        //        return '<center><div class="btn-group">' +
                        //            '<button type="button" class="btn btn-info btn-sm" ng-click="btn_edit_bal(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Edit">  <i class="fa fa-edit"></i></button >' +
                        //            '</div></center>';
                        //    }
                        //}
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


    var init_table_data5 = function (par_data) {
        try {
            s.datalistgrid5 = par_data;
            s.oTable5 = $('#datalist_grid_transmit').dataTable(
                {
                    data: s.datalistgrid5,
                    bSort: false,
                    bAutoWidth: false,
                    sDom: 'rt<"bottom"ip>',
                    columns: [
                        {
                            "mData": null,
                            "mRender": function (data, type, full, row) {
                                return "<center><span class='details-control' style='display:block;' ></center>"
                            }
                        },
                        {
                            "mData": "doc_ctrl_nbr",
                            "mRender": function (data, type, full, row) {
                                return "<span class='text-center btn-block'>" + data + "</span>"
                            }
                        },
                        {
                            "mData": "transmittal_descr",
                            "mRender": function (data, type, full, row) {
                                return "<span class='text-center'>&nbsp;&nbsp;" + data + "</span>"
                            }
                        },
                        {
                            "mData": "doc_status_descr",
                            "mRender": function (data, type, full, row)
                            {
                                var color = "";

                                if (full["doc_status"].toString() == "N")
                                {
                                    color = "primary"
                                }
                                else if (full["doc_status"].toString() == "V")
                                {
                                    color = "info"
                                }
                                    else if (full["doc_status"].toString() == "L" )
                                {
                                    color = "warning"
                                }
                                else if (full["doc_status"].toString() == "F")
                                {
                                    color = "success"
                                }
                                else if (full["doc_status"].toString() == "T")
                                {
                                    color = "danger"
                                }
                                else
                                {
                                    color = "danger"
                                }
                                
                                return "<span class='badge badge-" + color+"'>" + data + "</span>"
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

                                //var dis_rls_rcvd = true;
                                //if (full["doc_status"].toString() == "T" ||
                                //    full["doc_status"].toString() == "N") {
                                //    dis_rls_rcvd = false
                                //}

                                var dis_btn_rlsd = true;
                                if (full["doc_status"].toString() == "R" ||
                                    full["doc_status"].toString() == "T" ||
                                    full["doc_status"].toString() == "N")
                                {
                                    dis_btn_rlsd    = false;
                                    //s.show_rlsd     = false;
                                    //s.show_rcvd     = true;
                                }

                                var dis_btn_rcvd = true;
                                if (full["doc_status"].toString() == "T" ||
                                    full["doc_status"].toString() == "L")
                                {
                                    dis_btn_rcvd = false;
                                    //s.show_rlsd = true;
                                    //s.show_rcvd = false;
                                }
                                
                                return '<div class="btn-group pull-right">' +
                                    '<button id="btn_show_dtl_id' + full["doc_ctrl_nbr"] + '"    type="button" style="padding:3px 10px 3px 10px !important" class="btn btn-warning btn-sm" ng-click="btn_show_dtl(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Show Details">  <span class="badge badge-success" >' + full["transmittal_cnt"] +'</span> </button >' +
                                         '<button type="button" class="btn btn-info btn-sm"     ng-disabled="' + dis_btn+'"  ng-click="btn_edit_action_trans(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Edit">  <i class="fa fa-edit"></i></button >' +
                                         '<button type="button" class="btn btn-danger btn-sm"   ng-disabled="' + dis_btn+'"  ng-click="btn_del_row_trans(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Delete"><i class="fa fa-trash"></i></button>' +
                                         '<button type="button" class="btn btn-primary btn-sm"  ng-disabled="' + dis_btn+'"  ng-click="btn_print_row(' + row["row"] + ',\'1\')" data-toggle="tooltip" data-placement="top" title="Print"><i class="fa fa-print"></i></button>' +
                                         '<button type="button" class="btn btn-primary btn-sm"  ng-disabled="' + dis_btn_rlsd+'" ng-click="btn_release(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Release"><i class="fa fa-forward"></i></button>' +
                                         '<button type="button" class="btn btn-success btn-sm"  ng-disabled="' + dis_btn_rcvd+'" ng-click="btn_receive(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Receive"><i class="fa fa-backward"></i></button>' +
                                         '<button type="button" class="btn btn-warning btn-sm"  ng-click="btn_view_history(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="View Information and History"><i class="fa fa-history"></i></button>' +
                                        '</div>';
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

    var init_table_data6 = function (par_data) {
        try {
            s.datalistgrid6 = par_data;
            s.oTable6 = $('#datalist_grid_transmit_dtl').dataTable(
                {
                    data: s.datalistgrid6,
                    bSort: false,
                    bAutoWidth: true,
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
                                
                                return '<div id="checkbox_id_vja" style="cursor: pointer;" class="checkbox checkbox-primary text-center"><input class="checkbox_show"  style="width:20px;" id="checkbox' + row["row"] + '" ng-click="btn_check_action(' + row["row"] + ')" type="checkbox"' + checked + '><label for="checkbox' + row["row"] + '"></label></div>'
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
                                return '<span> ' + full["employee_name"] + '</span>'
                                    + '</br> <span class="badge badge-success"> &nbsp;&nbsp;' + full["leavetype_descr"] + '  '+full["leavesubtype_descr"]+'</span>'
                                    + '</br> <span> &nbsp;&nbsp; Period       : ' + full["leaveledger_period"] + '</span>'
                                    + '</br> <span> &nbsp;&nbsp; Application #: ' + full["leave_ctrlno"] + '</span>'
                                    + '</br> <span> &nbsp;&nbsp; Ledger Ctrl #: ' + full["ledger_ctrl_no"] + '</span>'
                                    + '</br> <span> &nbsp;&nbsp; Employment Type: ' + full["employment_type"] + '</span>'
                            }
                        },
                        {
                            "mData": "final_approval_date",
                            "mRender": function (data, type, full, row) {
                                return "<span class='badge badge-danger btn-block'>" + moment(data).format('YYYY-MM-DD HH:mm:ss') + "</span>"
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

    //NEW UPDATE BY: JORGE RUSTOM VILLANUEVA 2020-09-18
    /* Formatting function for row details - modify as you need */
    function format(d) {
        return '<table class="no-border" style="padding:0px !important;min-height:10px !important" > ' +
            '<tr>' +
            '<td style="width:24% !important;padding:0px 0px 0px 10px">Department/s:</td>' +
            '<td style="padding:0px">' + d.department_descr + '</td>' +
            '</tr>' +
            '<tr>' +
            '<td style="width:24% !important;padding:0px 0px 0px 10px">Employment Type:</td>' +
            '<td style="padding:0px">' + d.employment_type_desr + '</td>' +
            '</tr>' +
            '</table>';
    }

    s.RetrieveTransmittal_HDR = function ()
    {
        h.post("../cLeaveLedgerAppr/RetrieveTransmittal_HDR").then(function (d)
        {
            if (d.data.message == "success")
            {
                if (d.data.data.length > 0)
                {
                    s.oTable5.fnClearTable();
                    s.datalistgrid5 = d.data.data;
                    if (d.data.data.length > 0)
                    {
                        s.oTable5.fnAddData(d.data.data);
                    }

                    $('#datalist_grid_transmit tbody').on('click', 'span.details-control', function ()
                    {
                        var tr = $(this).closest('tr');
                        var row = $('#datalist_grid_transmit').DataTable().row(tr);

                        if (row.child.isShown()) {
                            // This row is already open - close it
                            row.child.hide();
                            tr.removeClass('shown');
                        }
                        else
                        {
                            // Open this row
                            row.child(format(row.data())).show();
                            tr.addClass('shown');
                        }

                    });
                }
                else
                {
                    // init_table_data5([]);
                }
            }
            else
            {
                swal({ icon: "warning", title: d.data.message  });
            }

            $('#modal_openCreateTransmittal').modal({ backdrop: 'static', keyboard: false });

        })

    }

    s.openModal_Add = function ()
    {
        s.show_dtl = false;
        s.dis_title = false;
        s.show_footer = true;
        s.txtb_doc_ctrl_nbr             = "";
        s.txtb_transmittal_descr        = "";
        s.txtb_approved_period_from      = "";
        s.txtb_approved_period_to        = "";
        s.txtb_created_by               = "";
        s.txtb_created_dttm             = "";
        s.ddl_route_nbr = "01"
        s.ddl_dept                  = "";
        s.ddl_employment_type       = "";
        
        s.show_dtl = false;
        s.show_save = true
        s.action   = "ADD";
        h.post("../cLeaveLedgerAppr/RetrieveNextNbr").then(function (d)
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

    s.btn_save = function ()
    {
        var data = {
                     
            doc_ctrl_nbr            : s.txtb_doc_ctrl_nbr
            ,transmittal_descr      : s.txtb_transmittal_descr
            ,approved_period_from   : $('#txtb_approved_period_from').val()
            ,approved_period_to     : $('#txtb_approved_period_to').val()
            ,doc_status             : "N"
            ,route_nbr              : s.ddl_route_nbr
            , department_code       : s.ddl_dept
            , employment_tyep       : s.ddl_employment_type
        }

        if (s.action == "ADD")
        {
            h.post("../cLeaveLedgerAppr/Save", { data: data }).then(function (d)
            {
                if (d.data.message == "success")
                {
                    $('#modal_openCreateTransmittal_dtl').modal("hide");
                    swal("Successfully Saved!","Your record has been saved!",{ icon: "success"});
                    s.RetrieveTransmittal_HDR();
                }
                else
                {
                    swal({ icon: "warning", title: d.data.message });
                }
            })
        }
        else if (s.action == "EDIT")
        {
            h.post("../cLeaveLedgerAppr/SaveEdit", { data: data }).then(function (d)
            {
                if (d.data.message == "success")
                {
                    $('#modal_openCreateTransmittal_dtl').modal("hide");
                    swal("Successfully Updated!", "Your record has been updated!", { icon: "success" });
                    s.RetrieveTransmittal_HDR();

                }
                else
                {
                    swal({ icon: "warning", title: d.data.message });
                }
            })
        }
        
    }
    //************************************// 
    //*** Delete Record              
    //**********************************// 
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
                    h.post("../cLeaveLedgerAppr/Delete", {
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

    //************************************// 
    //*** Open Edit Modal         
    //**********************************// 
    s.btn_edit_action_trans = function (row_id)
    {
        s.show_dtl = false;
        s.show_footer = true;
        s.dis_title = false;
        s.show_save = false
        s.action = "EDIT";

        s.txtb_doc_ctrl_nbr             = "";
        s.txtb_transmittal_descr        = "";
        s.txtb_approved_period_from     = "";
        s.txtb_approved_period_to       = "";
        s.txtb_created_by               = "";
        s.txtb_created_dttm             = "";
        s.ddl_route_nbr = "01"
        s.ddl_dept = "";
        s.ddl_employment_type = "";

        s.txtb_doc_ctrl_nbr         = s.datalistgrid5[row_id].doc_ctrl_nbr
        s.txtb_transmittal_descr    = s.datalistgrid5[row_id].transmittal_descr  
        s.txtb_approved_period_from = moment(s.datalistgrid5[row_id].approved_period_from).format('YYYY-MM-DD')  
        s.txtb_approved_period_to   = moment(s.datalistgrid5[row_id].approved_period_to).format('YYYY-MM-DD')  
        s.txtb_created_by           = s.datalistgrid5[row_id].created_by
        s.txtb_created_dttm         = moment(s.datalistgrid5[row_id].doc_dttm).format('YYYY-MM-DD HH:mm:ss')
        s.ddl_route_nbr             = s.datalistgrid5[row_id].route_nbr
        s.ddl_dept                  = s.datalistgrid5[row_id].department_code
        s.ddl_employment_type       = s.datalistgrid5[row_id].employment_tyep
        
        $('#modal_openCreateTransmittal_dtl').modal({ backdrop: 'static', keyboard: false }); 
    }

    s.btn_show_dtl = function (row_id)
    {
        s.show_footer = false;
        s.show_dtl = true;
        s.dis_title = true;

        s.txtb_doc_ctrl_nbr             = "";
        s.txtb_transmittal_descr        = "";
        s.txtb_approved_period_from     = "";
        s.txtb_approved_period_to       = "";
        s.txtb_created_by               = "";
        s.txtb_created_dttm             = "";
        s.ddl_route_nbr = "01"
        s.ddl_dept = "";
        s.ddl_employment_type = "";

        s.txtb_doc_ctrl_nbr         = s.datalistgrid5[row_id].doc_ctrl_nbr
        s.txtb_transmittal_descr    = s.datalistgrid5[row_id].transmittal_descr  
        s.txtb_approved_period_from = moment(s.datalistgrid5[row_id].approved_period_from).format('YYYY-MM-DD')  
        s.txtb_approved_period_to   = moment(s.datalistgrid5[row_id].approved_period_to).format('YYYY-MM-DD')  
        s.txtb_created_by           = s.datalistgrid5[row_id].created_by
        s.txtb_created_dttm         = moment(s.datalistgrid5[row_id].doc_dttm).format('YYYY-MM-DD HH:mm:ss')
        s.ddl_route_nbr             = s.datalistgrid5[row_id].route_nbr
        s.ddl_dept                  = s.datalistgrid5[row_id].department_code
        s.ddl_employment_type       = s.datalistgrid5[row_id].employment_tyep

        $('#btn_show_dtl_id' + s.datalistgrid5[row_id].doc_ctrl_nbr).addClass('disabled');
        $('#modal_generating_remittance').modal({ backdrop: 'static', keyboard: false });
        
        h.post("../cLeaveLedgerAppr/RetrieveTransmittal_DTL", {
            par_doc_ctrl_nbr            : s.datalistgrid5[row_id].doc_ctrl_nbr
            , par_approved_period_from  : moment(s.datalistgrid5[row_id].approved_period_from).format('YYYY-MM-DD')  
            , par_approved_period_to    : moment(s.datalistgrid5[row_id].approved_period_to).format('YYYY-MM-DD')  
            , par_department_code       : s.datalistgrid5[row_id].department_code
            , par_employment_type       : s.datalistgrid5[row_id].employment_tyep
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
        }
        h.post("../cLeaveLedgerAppr/Save_dtl", {
            data: data
            , par_transmitted_flag: s.datalistgrid6[row_id].transmitted_flag 
        }).then(function (d)
            {
                if (d.data.message == "success")
                {
                    // swal("Successfully Added!","Your record has been saved!",{ icon: "success"});
                    s.RetrieveTransmittal_HDR();
                }
                else
                {
                    swal({ icon: "warning", title: d.data.message });
                }
            })
    }


    s.btn_print_row = function (row_id,rep_mode)
    {
        s.row_id_printing = row_id
        rep_mode = s.ddl_rep_mode_printing

        if (parseFloat(s.datalistgrid5[row_id].transmittal_cnt) <= 0)
        {
            swal("You cannot Print this document","No data found",{ icon: "warning" });
            return;
        }

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


    s.scan_transmittal_ctrl_nbr = function (doc_ctrl_nbr)
    {
        h.post("../cLeaveLedgerAppr/RetriveTransmittalInfo", {
            par_doc_ctrl_nbr            : doc_ctrl_nbr
        }).then(function (d) {
            
            if (d.data.message == "success")
            {
                s.txtb_trans_descr      = d.data.data.transmittal_descr
                s.ddl_route_nbr_trk     = d.data.data.route_nbr
                s.lst_trans_dtl         = d.data.data_dtl
                s.lst_doc_history       = d.data.data_history
            }
            else
            {
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

        h.post("../cLeaveLedgerAppr/ReleaseReceive",
            {
                data        : data,
                data_hdr    : data_hdr
            }).then(function (d) {
            if (d.data.message == "success")
            {

                $('#itcd_doc_info').modal("hide");
                s.RetrieveTransmittal_HDR();
                swal(d.data.message_descr1,d.data.message_descr,{ icon: "success" });
                
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

        s.txtb_trans_descr          = "Released - "+ s.txtb_trans_descr
        s.scan_transmittal_ctrl_nbr(s.datalistgrid5[row_id].doc_ctrl_nbr);
        s.transmittal_ctrl_nbr      = s.datalistgrid5[row_id].doc_ctrl_nbr
        s.txtb_department_dis       = s.datalistgrid5[row_id].department_descr
        s.txtb_employment_type_dis  = s.datalistgrid5[row_id].employment_type_desr

        $('#itcd_doc_info').modal({ backdrop: 'static', keyboard: false });
    }

    s.btn_receive = function (row_id)
    {
        s.show_rcvd = true;
        s.show_rlsd = false;
        if (s.datalistgrid5[row_id].transmittal_cnt == 0) {
            swal({ icon: "warning", title: "No data found" });
            return;
        }
        
        s.transmittal_ctrl_nbr      = "";
        s.txtb_department_dis       = "";
        s.txtb_employment_type_dis  = "";

        s.txtb_trans_descr = "Received - " + s.txtb_trans_descr
        s.scan_transmittal_ctrl_nbr(s.datalistgrid5[row_id].doc_ctrl_nbr);
        s.transmittal_ctrl_nbr = s.datalistgrid5[row_id].doc_ctrl_nbr
        s.txtb_department_dis = s.datalistgrid5[row_id].department_descr
        s.txtb_employment_type_dis = s.datalistgrid5[row_id].employment_type_desr

        $('#itcd_doc_info').modal({ backdrop: 'static', keyboard: false });
    }


    s.btn_check_action_all = function ()
    {
        const otherText = document.querySelector('#checkbox_all');
        
        if (otherText.checked)
        {
            h.post("../cLeaveLedgerAppr/DeleteAll", {
                par_doc_ctrl_nbr: s.txtb_doc_ctrl_nbr
            }).then(function (d)
            {
                if (d.data.message == "success")
                {
                    for (var i = 0; i < s.datalistgrid6.length; i++)
                    {
                        $('#checkbox' + i).prop("checked", true)
                        var data =
                        {
                             doc_ctrl_nbr    : s.txtb_doc_ctrl_nbr
                            ,ledger_ctrl_no  : s.datalistgrid6[i].ledger_ctrl_no  
                            ,doc_remarks     : ''  
                        }
                        h.post("../cLeaveLedgerAppr/CheckAll", {
                            data: data
                        }).then(function (d)
                        {
                            if (d.data.message == "success")
                            {
                                s.RetrieveTransmittal_HDR();
                            }
                            else
                            {
                                swal({ icon: "warning", title: d.data.message });
                            }
                        })
                    }
                    
                }
                else
                {
                    swal({ icon: "warning", title: d.data.message });
                }
            })
        }
        else
        {
            
            swal({
                title: "Are you sure to delete this record?",
                text: "Once deleted, you will not be able to recover this record!",
                icon: "warning",
                buttons: true,
                dangerMode: true

            })
                .then(function (willDelete)
                {
                    if (willDelete)
                    {
                        h.post("../cLeaveLedgerAppr/DeleteAll", {
                            par_doc_ctrl_nbr: s.txtb_doc_ctrl_nbr
                        }).then(function (d)
                        {
                            if (d.data.message == "success")
                            {
                                for (var i = 0; i < s.datalistgrid6.length; i++)
                                {
                                    $('#checkbox' + i).prop("checked", false)
                                    swal("Successfully Unchecked All", "Record successfully removed/unchecked", { icon: "success" });
                                    s.RetrieveTransmittal_HDR();
                                }
                            }
                            else
                            {
                                swal({ icon: "warning", title: d.data.message });
                            }
                        })

                    }
                });
        }


        
    }


    s.RetrieveTransmittal_DTL = function(doc_ctrl_nbr, approved_period_from, approved_period_to, department_code, employment_type)
    {

        h.post("../cLeaveLedgerAppr/RetrieveTransmittal_DTL", {
            par_doc_ctrl_nbr            : doc_ctrl_nbr
            , par_approved_period_from  : approved_period_from
            , par_approved_period_to    : approved_period_to
            , par_department_code       : department_code
            , par_employment_type       : employment_type
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
                    }
                    $('#modal_generating_remittance').modal("hide");
                }
                else
                {
                    $('#modal_generating_remittance').modal("hide");
                }
                $('#modal_openCreateTransmittal_dtl').modal({ backdrop: 'static', keyboard: false });
                
            }
            else
            {
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

        s.scan_transmittal_ctrl_nbr(s.datalistgrid5[row_id].doc_ctrl_nbr);
        s.transmittal_ctrl_nbr = s.datalistgrid5[row_id].doc_ctrl_nbr
        s.txtb_department_dis = s.datalistgrid5[row_id].department_descr
        s.txtb_employment_type_dis = s.datalistgrid5[row_id].employment_type_desr

        $('#itcd_doc_info').modal({ backdrop: 'static', keyboard: false });

    }

})