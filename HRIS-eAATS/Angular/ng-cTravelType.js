ng_HRD_App.controller("cTravelType_ctrlr", function ($scope, $compile, $http, $filter) {
    var s = $scope
    var h = $http

    var userid      = "";
    s.rowLen        = "10";
    s.travelTypeLst = null;

    function init() {
        $("#modal_generating_remittance").modal();
        //**********************************************
        // Initialize data during page loads
        //**********************************************
        h.post("../cTravelType/initializeData").then(function (d) {
            if (d.data.message == "success") {
                userid          = d.data.userid;
                travelTypeLst   = d.data.travelTypeLst;
                console.log(d.data.travelTypeLst);
                if (d.data.travelTypeLst.length > 0) {
                    init_table_data(d.data.travelTypeLst);
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
                    { "mData": "travel_type_code", "mRender": function (data, type, full, row) { return "<span class='text-center btn-block'>" + data + "</span>" } },
                    { "mData": "travel_type_abbrv", "mRender": function (data, type, full, row) { return "<span class='text-center btn-block'>" + data + "</span>" } },
                    { "mData": "travel_type_descr", "mRender": function (data, type, full, row) { return "<span class='text-left btn-block'>" + data + "</span>" } },
                    {
                        "mData": "travel_type_hazard",
                        "mRender": function (data, type, full, row)
                        {
                            if (full["travel_type_hazard"] == "1") {
                                data = "Yes";
                                return "<span class='text-center btn-block text-success'>" + data + "</span>"
                            }
                            else if (full["travel_type_hazard"] == "0") {
                                data = "No";
                                return "<span class='text-center btn-block text-danger'>" + data + "</span>"
                            }
                            
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
        s.ModalTitle    = "Add New Record";
        btn             = document.getElementById('add');
        btn.innerHTML   = '<i class = "fa fa-spinner fa-spin"></i> Add';
        
        setTimeout(function () {
            h.post("../cTravelType/GetLasCode").then(function (d) {
                if (d.data.message == "success") {
                    var nextCode    = "";
                    var ids         = d.data.ids;
                    for (var i = 1; i < 100; i++) {
                        if (i != ids[i - 1]) {
                            nextCode = i;
                            break;
                        }
                    }
                    s.lastCode = nextCode;
                    if (s.lastCode > 0 && s.lastCode < 10) {
                        s.lastCodeStr = "0" + s.lastCode;
                    }
                    else {
                        s.lastCodeStr = s.lastCode;
                    }
                    s.txtb_code = s.lastCodeStr;
                }
                else {
                    swal(d.data.message, { icon: "warning", });
                }
            });
            btn.innerHTML = '<i class="fa fa-plus-circle"> </i> Add';
            $('#main_modal').modal("show");
        }, 300);
    }
    //************************************// 
    //*** Save New Record              
    //**********************************// 
    s.btn_save_click = function () {
        if (ValidateFields()) {
            h.post("../cTravelType/CheckExist", {
                travel_type_code: s.txtb_code
            }).then(function (d) {
                if (d.data.message == "success") {
                    btn = document.getElementById('addFinal');
                    btn.innerHTML = '<i class = "fa fa-spinner fa-spin"></i> Save';
                    var hazard = null;
                    if (s.chckbx_hazard == true) {
                        hazard = 1;
                    }
                    else {
                        hazard = 0;
                    }
                    var data = {
                        travel_type_code        : s.txtb_code
                        , travel_type_abbrv     : s.txtb_abbrv
                        , travel_type_descr     : s.txtb_description
                        , travel_type_hazard    : hazard
                    }
                    console.log(data)
                    h.post("../cTravelType/SaveTravelType", { data: data }).then(function (d) {
                        if (d.data.message == "success") {
                            if (d.data.message == "success") {
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
                    swal("Data already added by other user/s!", { icon: "warning", });
                    $('#main_modal').modal("hide");
                    h.post("../cTravelType/GetTravelTypeList").then(function (d) {
                        if (d.data.message == "success") {
                            s.datalistgrid = d.data.travelTypeLst2;
                            s.oTable.fnClearTable();
                            if (s.datalistgrid.length != 0) {
                                s.oTable.fnAddData(s.datalistgrid);
                            }
                        }
                    });
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

        if ($('#txtb_abbrv').val() == "") {
            ValidationResultColor("txtb_abbrv", true);
            return_val = false;
        }
        if ($('#txtb_description').val() == "") {
            ValidationResultColor("txtb_description", true);
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

            $("#txtb_abbrv").removeClass("required");
            $("#lbl_txtb_abbrv_req").text("");

            $("#txtb_description").removeClass("required");
            $("#lbl_txtb_description_req").text("");
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
        h.post("../cTravelType/CheckExist2", {
            travel_type_code    : s.datalistgrid[row_id].travel_type_code
        }).then(function (d) {
            if (d.data.message == "success") {
                h.post("../cTravelType/GetTravelTypeList").then(function (d) {
                    if (d.data.message == "success") {
                        s.datalistgrid = d.data.travelTypeLst2;
                        s.oTable.fnClearTable();
                        if (s.datalistgrid.length != 0) {
                            s.oTable.fnAddData(s.datalistgrid);
                        }
                        clearentry();
                        $('#main_modal').modal("show");
                        s.isEdit = true;
                        s.ModalTitle        = "Edit Existing Record";
                        s.txtb_code         = s.datalistgrid[row_id].travel_type_code;
                        s.txtb_abbrv        = s.datalistgrid[row_id].travel_type_abbrv;
                        s.txtb_description  = s.datalistgrid[row_id].travel_type_descr;

                        if (s.datalistgrid[row_id].travel_type_hazard == true) {
                            s.chckbx_hazard = true
                        }
                        else {
                            s.chckbx_hazard = false
                        }

                        $('#edit').attr('ngx-data', row_id);
                        var row_edited = $('#edit').attr("ngx-data");
                        s.datalistgrid[row_edited].travel_type_abbrv    = s.txtb_abbrv;
                        s.datalistgrid[row_edited].travel_type_descr    = s.txtb_description
                        s.datalistgrid[row_edited].travel_type_hazard   = s.chckbx_hazard
                    }
                });
                
            }
            else {
                swal("Data already deleted by other user/s!", { icon: "warning", });
                s.datalistgrid = s.datalistgrid.delete(row_id);
                s.oTable.fnClearTable();
                if (s.datalistgrid.length != 0) {
                    s.oTable.fnAddData(s.datalistgrid);
                }
            }
        });
    }
    //***********************************// 
    //*** Update Existing Record         
    //**********************************// 
    s.SaveEdit = function () {
        if (ValidateFields()) {
            btn             = document.getElementById('edit');
            btn.innerHTML   = '<i class = "fa fa-spinner fa-spin"></i> Saving';
            var hazard      = null;

            if (s.chckbx_hazard == true) {
                hazard = 1;
            }
            else {
                hazard = 0;
            }
            var data = {
                travel_type_code        : s.txtb_code
                , travel_type_abbrv     : s.txtb_abbrv
                , travel_type_descr     : s.txtb_description
                , travel_type_hazard    : hazard
            }
            console.log(data)
            h.post("../cTravelType/SaveEditTravelType", { data: data }).then(function (d) {
                if (d.data.message == "success") {
                    var row_edited                                  = $('#edit').attr("ngx-data");
                    s.datalistgrid[row_edited].travel_type_abbrv    = s.txtb_abbrv;
                    s.datalistgrid[row_edited].travel_type_descr    = s.txtb_description
                    s.datalistgrid[row_edited].travel_type_hazard   = hazard

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
                    h.post("../cTravelType/DeleteRemitCert", {
                        travel_type_code    : s.datalistgrid[row_index].travel_type_code
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

    Array.prototype.refreshTable = function (table) {
        if (this.length == 0) {
           table.fnClearTable();
        }
        else {
            table.fnClearTable();
            table.fnAddData(this);
        }
    }

    function clearentry() {
        s.txtb_code         = "";
        s.txtb_abbrv        = "";
        s.txtb_description  = "";
        s.chckbx_hazard   = false;
        
        $("#txtb_abbrv").removeClass("required");
        $("#lbl_txtb_abbrv_req").text("");

        $("#txtb_description").removeClass("required");
        $("#lbl_txtb_description_req").text("");
    }

})