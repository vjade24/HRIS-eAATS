﻿ng_HRD_App.controller("cVLWithOutPay_ctrlr", function ($scope, $compile, $http, $filter) {
    var s = $scope
    var h = $http

    var userid      = "";
    var tempData    = "";
    s.rowLen        = "10";

    function init() {

        $("#modal_generating_remittance").modal();

        //**********************************************
        // Initialize data during page loads
        //**********************************************
        h.post("../cVLWithOutPay/initializeData").then(function (d) {
            if (d.data.message == "success") {
                userid = d.data.userid;
                console.log(d.data.vlWopLst);
                if (d.data.vlWopLst.length > 0) {
                    init_table_data(d.data.vlWopLst);
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
                    { "mData": "no_days_present", "mRender": function (data, type, full, row) { return "<span class='text-center btn-block'>" + data + "</span>" } },
                    { "mData": "no_days_onleave_wop", "mRender": function (data, type, full, row) { return "<span class='text-left btn-block'>" + data + "</span>" } },
                    { "mData": "leavecredit_earned", "mRender": function (data, type, full, row) { return "<span class='text-left btn-block'>" + data + "</span>" } },
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
        s.isEdit = false;
        s.disCode = false;
        s.ModalTitle = "Add New Record";
        btn = document.getElementById('add');
        btn.innerHTML = '<i class = "fa fa-spinner fa-spin"></i> Add';
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
            h.post("../cVLWithOutPay/CheckExist", {
                no_days_present: s.txtb_days_present
            }).then(function (d) {
                if (d.data.message == "success") {
                    btn = document.getElementById('addFinal');
                    btn.innerHTML = '<i class = "fa fa-spinner fa-spin"></i> Save';

                    var data = {
                        no_days_present         : s.txtb_days_present
                        , no_days_onleave_wop   : s.txtb_leave_wop
                        , leavecredit_earned    : s.txtb_leave_earned
                    }
                    console.log(data)
                    h.post("../cVLWithOutPay/Save", { data: data }).then(function (d) {
                        if (d.data.message == "success") {
                            if (d.data.message == "success") {
                                s.datalistgrid.push(data)
                                s.oTable.fnClearTable();
                                s.oTable.fnAddData(s.datalistgrid);
                                for (var x = 1; x <= $('#datalist_grid').DataTable().page.info().pages; x++) {
                                    if (get_page(s.txtb_days_present) == false) {
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
                        if (get_page(s.txtb_days_present) == false) {
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

        if ($('#txtb_days_present').val() == "") {
            ValidationResultColor("txtb_days_present", true);
            return_val = false;
        }

        if ($('#txtb_leave_wop').val() == "") {
            ValidationResultColor("txtb_leave_wop", true);
            return_val = false;
        }

        if ($('#txtb_leave_earned').val() == "") {
            ValidationResultColor("txtb_leave_earned", true);
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

            $("#txtb_days_present").removeClass("required");
            $("#lbl_txtb_days_present_req").text("");

            $("#txtb_leave_wop").removeClass("required");
            $("#lbl_txtb_leave_wop_req").text("");

            $("#txtb_leave_earned").removeClass("required");
            $("#lbl_txtb_leave_earned_req").text("");
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
        clearentry();
        $('#main_modal').modal("show");
        //console.log(d.data.getData);
        s.isEdit = true;
        s.disCode = true;
        s.ModalTitle = "Edit Existing Record";
        s.txtb_days_present = s.datalistgrid[row_id].no_days_present;
        s.txtb_leave_wop    = s.datalistgrid[row_id].no_days_onleave_wop;
        s.txtb_leave_earned = s.datalistgrid[row_id].leavecredit_earned;

        $('#edit').attr('ngx-data', row_id);
        var row_edited = $('#edit').attr("ngx-data");
        s.datalistgrid[row_edited].no_days_present      = s.txtb_days_present;
        s.datalistgrid[row_edited].no_days_onleave_wop  = s.txtb_leave_wop;
        s.datalistgrid[row_edited].leavecredit_earned   = s.txtb_leave_earned;
    }
    //***********************************// 
    //*** Update Existing Record         
    //**********************************// 
    s.SaveEdit = function () {
        if (ValidateFields()) {
            s.isEdit = true;
            btn = document.getElementById('edit');
            btn.innerHTML = '<i class = "fa fa-spinner fa-spin"></i> Saving';

            var data = {
                no_days_present         : s.txtb_days_present
                , no_days_onleave_wop   : s.txtb_leave_wop
                , leavecredit_earned    : s.txtb_leave_earned
            }
            console.log(data)
            h.post("../cVLWithOutPay/SaveEdit", { data: data }).then(function (d) {
                if (d.data.message == "success") {
                    var row_edited = $('#edit').attr("ngx-data");
                    s.datalistgrid[row_edited].no_days_present      = s.txtb_days_present;
                    s.datalistgrid[row_edited].no_days_onleave_wop  = s.txtb_leave_wop;
                    s.datalistgrid[row_edited].leavecredit_earned   = s.txtb_leave_earned;

                    s.oTable.fnClearTable();
                    s.oTable.fnAddData(s.datalistgrid);

                    for (var x = 1; x <= $('#datalist_grid').DataTable().page.info().pages; x++) {
                        if (get_page(s.txtb_days_present) == false) {
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
                    h.post("../cVLWithOutPay/Delete", {
                        no_days_present: s.datalistgrid[row_index].no_days_present
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
        s.txtb_days_present = "";
        s.txtb_leave_wop    = "";
        s.txtb_leave_earned = "";

        $("#txtb_days_present").removeClass("required");
        $("#lbl_txtb_days_present_req").text("");

        $("#txtb_leave_wop").removeClass("required");
        $("#lbl_txtb_leave_wop_req").text("");

        $("#txtb_leave_earned").removeClass("required");
        $("#lbl_txtb_leave_earned_req").text("");
    }

})