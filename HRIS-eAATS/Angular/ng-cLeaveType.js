ng_HRD_App.controller("cLeaveType_ctrlr", function ($scope, $compile, $http, $filter) {
    var s = $scope
    var h = $http

    var userid = "";
    var tempData = "";
    s.rowLen = "10";

    function init() {
        
        $("#modal_generating_remittance").modal();

        //**********************************************
        // Initialize data during page loads
        //**********************************************
        h.post("../cLeaveType/initializeData").then(function (d) {
            if (d.data.message == "success") {
                userid = d.data.userid;
                //console.log(d.data.timeSchedLst);
                if (d.data.leaveTypeLst.length > 0) {
                    init_table_data(d.data.leaveTypeLst);
                }
                else {
                    init_table_data([]);
                }
                showdetailsInfo("datalist_grid");

                //**********************************************
                //  Show/Hide ADD, EDIT, DELETE button 
                //**********************************************
                s.allowAdd = d.data.allowAdd
                s.allowDelete = d.data.allowDelete
                s.allowEdit = d.data.allowEdit
                s.allowView = d.data.allowView

                if (s.allowAdd == "1") {
                    s.ShowAdd = true
                }
                else {
                    s.ShowAdd = false
                }

                if (s.allowDelete == "1") {
                    s.ShowDelete = true
                }
                else {
                    s.ShowDelete == false
                }

                if (s.allowEdit == "1") {
                    s.ShowView = true
                }
                else {
                    s.ShowView = false
                }
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
                    { "mData": "leavetype_code", "mRender": function (data, type, full, row) { return "<span class='text-center btn-block'>" + data + "</span>" } },
                    { "mData": "leavetype_descr", "mRender": function (data, type, full, row) { return "<span class='text-left btn-block'>" + data + "</span>" } },
                    {
                        "mData": "leavetype_maxperyear",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-center btn-block'>" + data + "</span>"
                        }
                    },
                    {
                        "mData": "leavetype_monetized_flag_descr",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-center btn-block text-warning'>" + data + "</span>"
                        }
                    },
                    {
                        "mData": "leave_earn_daycover_descr",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-center btn-block text-success'>" + data + "</span>"
                        }
                    },
                    {
                        "mData": null,
                        "bSortable": false,
                        "mRender": function (data, type, full, row) {

                            return '<center><div class="btn-group">' +
                                '<button type="button" ng-show="ShowView" class="btn btn-info btn-sm" ng-click="btn_edit_action(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Edit">  <i class="fa fa-edit"></i></button >' +
                                '<button type="button" ng-show="ShowDelete" class="btn btn-danger btn-sm" ng-click="btn_del_row(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Delete"><i class="fa fa-trash"></i></button>' +
                                '</div></center>';
                        }
                    }
                ],
                "createdRow": function (row, data, index) {
                    $compile(row)($scope);  //add this to compile the DOM
                },
            });
    }
    function showdetailsInfo(table_id) {
        var info = $('#' + table_id).DataTable().page.info();
        $("div.toolbar").html("<b>Showing Page: " + (info.page + 1) + "</b> of <b>" + info.pages + " <i>pages</i></b>");
        $("div.toolbar").css("padding-top", "9px");
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
    //************************************//
    //***       Open Add Modal        ****//
    //************************************//
    s.btn_open_modal = function () {
        clearentry();
        s.isEdit        = false;
        s.disCode       = false;    
        s.ModalTitle    = "Add New Record";
        btn             = document.getElementById('add');
        btn.innerHTML   = '<i class = "fa fa-spinner fa-spin"></i> Add';
        setTimeout(function () {
            btn.innerHTML = '<i class="fa fa-plus-circle"> </i> Add';
            $('#main_modal').modal("show");
        }, 300);
    }
    //************************************// 
    //*** Save New Record              
    //**********************************// 
    s.btn_save_click = function () {
        if (ValidateFields()) {
            h.post("../cLeaveType/CheckExist", {
                leavetype_code: s.txtb_code
            }).then(function (d) {
                if (d.data.message == "success") {
                    btn                 = document.getElementById('addFinal');
                    btn.innerHTML       = '<i class = "fa fa-spinner fa-spin"></i> Save';
                    var earn_bal        = null;
                    var carry_over_bal  = null;
                    var monetized_bal   = null;

                    if (s.chckbx_earn_bal == true) {
                        earn_bal = 1;
                    }
                    else {
                        earn_bal = 0;
                    }
                    if (s.chckbx_carry_over_bal == true) {
                        carry_over_bal = 1;
                    }
                    else {
                        carry_over_bal = 0;
                    }
                    if (s.chckbx_monetized_bal == true) {
                        monetized_bal = 1;
                    }
                    else {
                        monetized_bal = 0;
                    }
                    var data = {
                        leavetype_code                      : s.txtb_code                       //
                        , leavetype_descr                   : s.txtb_description                //
                        , leavetype_maxperyear              : $("#txtb_max_years").val()        //
                        , leave_earn_balance                : earn_bal
                        , leave_earn_occurence              : $("#ddl_occurence").val()         //
                        , leave_earn_schedule               : $("#ddl_earn_schd").val()         //
                        , leave_earn_carryoverbalance_flag  : carry_over_bal
                        , leave_carryover_maxbalance        : $("#txtb_carry_over_bal").val()   //
                        , leavetype_monetized_flag          : monetized_bal
                        , leave_earn_daycover               : $("#ddl_days_cvrd").val()         //
                        , leave_earn                        : $("#txtb_leave_earn").val()       //
                    }
                    //console.log(data)
                    h.post("../cLeaveType/Save", { data: data }).then(function (d) {
                        if (d.data.message == "success") {
                            if (d.data.message == "success") {
                                if (s.chckbx_monetized_bal == "1") {
                                    data.leavetype_monetized_flag_descr = "Convertable";
                                }
                                else {
                                    data.leavetype_monetized_flag_descr = "None-Convertable";
                                }
                                if ($('#ddl_days_cvrd option:selected').val == "1") {
                                    data.leave_earn_daycover = "Calendar Days";
                                }
                                else {
                                    data.leave_earn_daycover = "Working Days";
                                }
                                s.datalistgrid.push(data)
                                s.oTable.fnClearTable();
                                s.oTable.fnAddData(s.datalistgrid);
                                for (var x = 1; x <= $('#datalist_grid').DataTable().page.info().pages; x++) {
                                    if (get_page(s.txtb_code) == false) {
                                        s.oTable.fnPageChange(x);
                                    }
                                    else {
                                        break;
                                    }
                                }
                                $('#main_modal').modal("hide");
                                swal("Your record has been saved!", { icon: "success", });
                                btn.innerHTML = '<i class="fa fa-save"> </i> Save';
                            }
                            else {
                                swal(d.data.message, { icon: "warning", });
                            }
                        }
                    })
                }
                else {
                    swal("Data already exist!", { icon: "warning", });
                    for (var x = 1; x <= $('#datalist_grid').DataTable().page.info().pages; x++) {
                        if (get_page(s.txtb_code) == false) {
                            s.oTable.fnPageChange(x);
                        }
                        else {
                            break;
                        }
                    }
                    $('#main_modal').modal("hide");
                    
                }
            });
        }
    }
    //***********************************************************//
    //***Field validation for remittance type before opening add modal
    //***********************************************************// 
    function ValidateFields() {
        var return_val = true;
        ValidationResultColor("ALL", false);

        if ($('#txtb_code').val() == "") {
            ValidationResultColor("txtb_code", true);
            return_val = false;
        }

        if ($('#txtb_description').val() == "") {
            ValidationResultColor("txtb_description", true);
            return_val = false;
        }
        
        if ($('#txtb_max_years').val() == "") {
            ValidationResultColor("txtb_max_years", true);
            return_val = false;
        }

        if ($('#ddl_days_cvrd').val() == "") {
            ValidationResultColor("ddl_days_cvrd", true);
            return_val = false;
        }

        if ($('#ddl_occurence').val() == "") {
            ValidationResultColor("ddl_occurence", true);
            return_val = false;
        }

        if ($('#txtb_leave_earn').val() == "") {
            ValidationResultColor("txtb_leave_earn", true);
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
            $("#lbl_" + par_object_id + "_req").text("Required Field");
        }
        else {
            //remove of refresh the object form being required

            $("#txtb_code").removeClass("required");
            $("#lbl_txtb_code_req").text("");

            $("#txtb_description").removeClass("required");
            $("#lbl_txtb_description_req").text("");

            $("#txtb_max_years").removeClass("required");
            $("#lbl_txtb_max_years_req").text("");

            $("#ddl_days_cvrd").removeClass("required");
            $("#lbl_ddl_days_cvrd_req").text("");

            $("#ddl_occurence").removeClass("required");
            $("#lbl_ddl_occurence_req").text("");

            $("#txtb_leave_earn").removeClass("required");
            $("#lbl_txtb_leave_earn_req").text("");
        }
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
    //************************************// 
    //*** Open Edit Modal         
    //**********************************// 
    s.btn_edit_action = function (row_id) {
        h.post("../cLeaveType/GetData", {
            leavetype_code  : s.datalistgrid[row_id].leavetype_code
        }).then(function (d) {
            if (d.data.message == "success") {
                clearentry();
                $('#main_modal').modal("show");
                //console.log(d.data.getData);
                s.isEdit                = true;
                s.disCode               = true;
                s.ModalTitle            = "Edit Existing Record";
                s.txtb_code             = d.data.getData[0].leavetype_code;
                s.txtb_description      = d.data.getData[0].leavetype_descr;
                s.txtb_max_years        = d.data.getData[0].leavetype_maxperyear;
                s.ddl_days_cvrd         = d.data.getData[0].leave_earn_daycover;
                s.ddl_occurence         = d.data.getData[0].leave_earn_occurence;
                s.ddl_earn_schd         = d.data.getData[0].leave_earn_schedule;
                s.txtb_leave_earn       = d.data.getData[0].leave_earn;
                s.txtb_carry_over_bal   = d.data.getData[0].leave_carryover_maxbalance;

                if (d.data.getData[0].leave_earn_balance == true) {
                    s.chckbx_earn_bal = true
                }
                else {
                    s.chckbx_earn_bal = false
                }

                if (d.data.getData[0].leave_earn_carryoverbalance_flag == true) {
                    s.chckbx_carry_over_bal = true
                }
                else {
                    s.chckbx_carry_over_bal = false
                }

                if (d.data.getData[0].leavetype_monetized_flag == true) {
                    s.chckbx_monetized_bal = true
                }
                else {
                    s.chckbx_monetized_bal = false
                }

                var monetized_bal = null;
                if (s.chckbx_monetized_bal == true) {
                    monetized_bal = 1;
                }
                else {
                    monetized_bal = 0;
                }
                
                $('#edit').attr('ngx-data', row_id);
                var row_edited = $('#edit').attr("ngx-data");
                s.datalistgrid[row_edited].leavetype_descr                  = s.txtb_description;
                s.datalistgrid[row_edited].leavetype_maxperyear             = $("#txtb_max_years").val();
                
            }
        });
    }
    //***********************************// 
    //*** Update Existing Record         
    //**********************************// 
    s.SaveEdit = function () {
        if (ValidateFields()) {
            s.isEdit = true;
            btn = document.getElementById('edit');
            btn.innerHTML = '<i class = "fa fa-spinner fa-spin"></i> Saving';
            var earn_bal = null;
            var carry_over_bal = null;
            var monetized_bal = null;

            if (s.chckbx_earn_bal == true) {
                earn_bal = 1;
            }
            else {
                earn_bal = 0;
            }
            if (s.chckbx_carry_over_bal == true) {
                carry_over_bal = 1;
            }
            else {
                carry_over_bal = 0;
            }
            if (s.chckbx_monetized_bal == true) {
                monetized_bal = 1;
            }
            else {
                monetized_bal = 0;
            }
            var data = {
                leavetype_code: s.txtb_code                       
                , leavetype_descr                   : s.txtb_description                
                , leavetype_maxperyear              : $("#txtb_max_years").val()        
                , leave_earn_balance                : earn_bal
                , leave_earn_occurence              : $("#ddl_occurence").val()         
                , leave_earn_schedule               : $("#ddl_earn_schd").val()         
                , leave_earn_carryoverbalance_flag  : carry_over_bal
                , leave_carryover_maxbalance        : $("#txtb_carry_over_bal").val()   
                , leavetype_monetized_flag          : monetized_bal
                , leave_earn_daycover               : $("#ddl_days_cvrd").val()         
                , leave_earn                        : $("#txtb_leave_earn").val()       
            }
            console.log(data)
            h.post("../cLeaveType/SaveEdit", { data: data }).then(function (d) {
                if (d.data.message == "success") {
                    var row_edited = $('#edit').attr("ngx-data");
                    s.datalistgrid[row_edited].leavetype_descr      = s.txtb_description;
                    s.datalistgrid[row_edited].leavetype_maxperyear = $("#txtb_max_years").val();
                    if (data.leavetype_monetized_flag == "1") {
                        s.datalistgrid[row_edited].leavetype_monetized_flag_descr = "Convertable";
                    }
                    else {
                        s.datalistgrid[row_edited].leavetype_monetized_flag_descr = "None-Convertable";
                    }
                    if (data.leave_earn_daycover == "1") {
                        s.datalistgrid[row_edited].leave_earn_daycover_descr = "Calendar Days";
                    }
                    else {
                        s.datalistgrid[row_edited].leave_earn_daycover_descr = "Working Days";
                    }

                    s.oTable.fnClearTable();  
                    s.oTable.fnAddData(s.datalistgrid);

                    for (var x = 1; x <= $('#datalist_grid').DataTable().page.info().pages; x++) {
                        if (get_page(s.txtb_code) == false) {
                            s.oTable.fnPageChange(x);
                        }
                        else {
                            break;
                        }
                    }
                    btn.innerHTML = '<i class="fa fa-save"> </i> Save Edit';
                    $('#main_modal').modal("hide");
                    swal("Your record successfully updated!", { icon: "success", });
                }
                else {
                    swal(d.data.message, { icon: "warning", });
                }
            });
        }
    }
    //************************************// 
    //*** Delete Record              
    //**********************************// 
    s.btn_del_row = function (row_index) {
        swal({
            title: "Are you sure to delete this record?",
            text: "Once deleted, you will not be able to recover this record!",
            icon: "warning",
            buttons: true,
            dangerMode: true,

        })
            .then(function (willDelete) {
                if (willDelete) {
                    h.post("../cLeaveType/Delete", {
                        leavetype_code: s.datalistgrid[row_index].leavetype_code
                    }).then(function (d) {
                        if (d.data.message == "success") {
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

    Array.prototype.delete = function (code) {
        return this.filter(function (d, k) {
            return k != code
        })
    }

    function clearentry() {
        s.txtb_code             = "";
        s.txtb_description      = "";
        s.txtb_max_years        = "";
        s.ddl_days_cvrd         = "";
        s.ddl_occurence         = "";
        s.ddl_earn_schd         = "";
        s.txtb_leave_earn       = "";
        s.txtb_carry_over_bal   = "";
        s.chckbx_earn_bal       = false;
        s.chckbx_carry_over_bal = false;
        s.chckbx_monetized_bal  = false;

        $("#txtb_code").removeClass("required");
        $("#lbl_txtb_code_req").text("");

        $("#txtb_description").removeClass("required");
        $("#lbl_txtb_description_req").text("");

        $("#txtb_max_years").removeClass("required");
        $("#lbl_txtb_max_years_req").text("");

        $("#ddl_days_cvrd").removeClass("required");
        $("#lbl_ddl_days_cvrd_req").text("");

        $("#ddl_occurence").removeClass("required");
        $("#lbl_ddl_occurence_req").text("");

        $("#txtb_leave_earn").removeClass("required");
        $("#lbl_txtb_leave_earn_req").text("");
    }

})