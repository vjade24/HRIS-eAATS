ng_HRD_App.controller("cLeaveAdmin_ctrlr", function ($scope, $compile, $http, $filter) {
    var s = $scope
    var h = $http

    var userid = "";
    s.rowLen = "10";
    var timer1 = null;

    function init()
    {
        $("#ddl_name").select2().on('change', function (e) {
            s.FilterPageGrid();
        });

        s.ddl_status = "A";
        $("#modal_generating_remittance").modal();
        //**********************************************
        // Initialize data during page loads
        //**********************************************
        h.post("../cLeaveAdmin/InitializeData").then(function (d) {
            if (d.data.message == "success") {

                if (d.data.adminTbl_lst.length > 0) {
                    init_table_data(d.data.adminTbl_lst);
                }
                else {
                    init_table_data([]);
                }
                s.admin_user = d.data.adminUser_lst;
                s.admin_dept = d.data.adminDept_lst;

                //**********************************************
                //  Show/Hide ADD, EDIT, DELETE button 
                //**********************************************
                s.allowAdd = d.data.allowAdd
                s.allowDelete = d.data.allowDelete
                s.allowEdit = d.data.allowEdit
                s.allowView = d.data.allowView

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
                sDom: 'rt<"bottom"ip>',
                pageLength: 10,
                columns: [
                    {
                        "mData": "department_code",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-center btn-block'>" + data + "</span>"
                        }
                    },
                    { "mData": "department_name1", 
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-left btn-block'>" + data + "</span>"
                        }
                    },
                    {
                        "mData": "rcrd_status_descr",
                        "mRender": function (data, type, full, row) { 
                            return "<span class='text-center btn-block'>" + data + "</span>" }
                    },
                    {
                        "mData": null,
                        "bSortable": false,
                        "mRender": function (data, type, full, row) {

                            return '<center><div class="btn-group">' +
                                '<button type="button" ng-show="ShowEdit" class="btn btn-info btn-sm" ng-click="btn_edit_action(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Edit">  <i class="fa fa-edit"></i></button >' +
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
    s.FilterPageGrid = function () {
        try
        {
            h.post("../cLeaveAdmin/FilterPageGrid", {
                par_empl_id: $("#ddl_name option:selected").val()
            }).then(function (d) {
                if (d.data.message == "success") {

                    s.datalistgrid = d.data.filteredGrid;
                    s.oTable.fnClearTable();

                    if (d.data.filteredGrid.length > 0) {
                        s.oTable.fnAddData(d.data.filteredGrid);
                    }
                    
                    s.admin_dept = d.data.adminDept_lst;
                }
            });
        }
        catch (err) {
            swal({ icon: "warning", title: err.message });
        }
    }
    //************************************//
    //***       Open Add Modal        ****//
    //************************************//
    s.btn_open_modal = function () {
        if (ValidateFields()) {
            clearentry();
            s.isEdit = false;
            s.ModalTitle = "Add New Record";
            btn = document.getElementById('add');
            btn.innerHTML = '<i class = "fa fa-spinner fa-spin"></i> Add';

            s.ddl_dept = "01";

            s.txtb_empl_name = $("#ddl_name option:selected").html();
            s.txtb_empl_nbr = $("#ddl_name option:selected").val();
            setTimeout(function () {
                btn.innerHTML = '<i class="fa fa-plus-circle"> </i> Add';
                $('#main_modal').modal("show");
            }, 300);
        }
    }
    //************************************// 
    //*** Save New Record              
    //**********************************// 
    s.btn_save_click = function () {
        if (ValidateFields2()) {
            h.post("../cLeaveAdmin/CheckExist", {
                empl_id: $("#ddl_name option:selected").val()
                , department_code: $("#ddl_dept option:selected").val()
            }).then(function (d) {
                if (d.data.message == "success") {
                    swal("Data already exist!", { icon: "warning", });
                }
                else {
                    var data = {
                        empl_id: $("#ddl_name option:selected").val()
                        , department_code: $("#ddl_dept option:selected").val()
                        , rcrd_status: $("#ddl_status option:selected").val()
                    }
                    h.post("../cLeaveAdmin/Save", { data: data }).then(function (d) {
                        if (d.data.message == "success") {
                            s.FilterPageGrid();
                            $('#main_modal').modal("hide");
                            swal("Your record has been saved!", { icon: "success", });
                            btn.innerHTML = '<i class="fa fa-save"> </i> Save';
                        }
                        else {
                            swal(d.data.message, { icon: "warning", });
                        }
                    });
                }
            });
        }
    }
    
    //************************************// 
    //*** Open Edit Modal         
    //**********************************// 
    s.btn_edit_action = function (row_id) {
        clearentry();
        s.isEdit = true;
        s.ModalTitle = "Edit Existing Record";
        btn = document.getElementById('add');
        btn.innerHTML = '<i class = "fa fa-spinner fa-spin"></i> Add';
        //s.txtb_empl_name = s.datalistgrid[row_id].employee_name;
        s.txtb_empl_nbr = s.datalistgrid[row_id].empl_id;
        s.ddl_dept = "01";//s.datalistgrid[row_id].department_code;
        s.ddl_status = s.datalistgrid[row_id].rcrd_status;
        setTimeout(function () {
            btn.innerHTML = '<i class="fa fa-plus-circle"> </i> Add';
            $('#main_modal').modal("show");
        }, 300);
    }
    //***********************************// 
    //*** Update Existing Record         
    //**********************************// 
    s.SaveEdit = function () {
        if (ValidateFields2()) {
            btn = document.getElementById('edit');
            btn.innerHTML = '<i class = "fa fa-spinner fa-spin"></i> Saving';
            h.post("../cASType/CheckExist", {
                empl_id: $("#ddl_name option:selected").val()
                , department_code: $("#ddl_dept option:selected").val()
            }).then(function (d) {
                if (d.data.message == "success") {
                    swal("Data already exist!", { icon: "warning", });
                }
                else {
                    var data = {
                        empl_id: $("#ddl_name option:selected").val()
                        , department_code: $("#ddl_dept option:selected").val()
                        , rcrd_status: $("#ddl_status option:selected").val()
                    }
                    
                    h.post("../cLeaveAdmin/SaveEdit", { data: data }).then(function (d) {
                        if (d.data.message == "success") {
                            s.FilterPageGrid();
                            btn.innerHTML = '<i class="fa fa-save"> </i> Save Edit';
                            $('#main_modal').modal("hide");
                            swal("Your record successfully updated!", { icon: "success", });
                        }
                        else {
                            swal(d.data.message, { icon: "warning", });
                        }
                    });
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
                    h.post("../cLeaveAdmin/Delete", {
                        empl_id: s.datalistgrid[row_index].empl_id
                        , department_code: s.datalistgrid[row_index].department_code
                    }).then(function (d) {
                        if (d.data.message == "success") {
                            s.FilterPageGrid();
                            swal("Your record has been deleted!", { icon: "success", });
                        }
                        else {
                            swal("Data already deleted by other user/s!", { icon: "warning", });
                            s.FilterPageGrid();
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
        s.txtb_code = "";
        s.txtb_abbrv = "";
        s.txtb_description = "";
        s.chckbx_hazard = true;

        $("#txtb_abbrv").removeClass("required");
        $("#lbl_txtb_abbrv_req").text("");

        $("#txtb_description").removeClass("required");
        $("#lbl_txtb_description_req").text("");
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

            $("#ddl_name").removeClass("required");
            $("#lbl_ddl_name_req").text("");
        }
    }
    //***********************************************************//
    //***Field validation for remittance type before opening add modal
    //***********************************************************// 
    function ValidateFields2() {
        var return_val = true;
        ValidationResultColor2("ALL", false);

        if ($('#ddl_dept').val() == "") {
            ValidationResultColor("ddl_dept", true);
            return_val = false;
        }

        if ($('#ddl_status').val() == "") {
            ValidationResultColor("ddl_status", true);
            return_val = false;
        }

        return return_val;
    }

    //***********************************************************//
    //***Field validation for remittance type before opening add modal
    //***********************************************************// 
    function ValidationResultColor2(par_object_id, par_v_result) {
        if (par_v_result) {
            //Add class to the obect that need to focus as a required..
            $("#" + par_object_id).addClass("required");
            $("#lbl_" + par_object_id + "_req").text("Required Field");
        }
        else {
            //remove of refresh the object form being required

            $("#ddl_dept").removeClass("required");
            $("#lbl_ddl_dept_req").text("");

            $("#ddl_status").removeClass("required");
            $("#lbl_ddl_status_req").text("");
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
})