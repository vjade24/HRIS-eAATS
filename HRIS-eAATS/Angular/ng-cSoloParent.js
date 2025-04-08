ng_HRD_App.controller("cSoloParent_ctrlr", function (commonScript,$scope, $compile, $http, $filter) {
    var s           = $scope
    var h           = $http
    var cs          = commonScript
    s.rowLen        = "10";
    s.image_link    = cs.img_link('local')+"/storage/images/photo/thumb/";
    function init()
    {
        $("#employee_name").select2().on('change', function (e)
        {
            s.FilterPageGrid();
        });
        //$('#modal_loading').modal({ backdrop: 'static', keyboard: false });
        //h.post("../cLeaveCard/InitializeData").then(function (d)
        //{
        //    if (d.data.message == "success")
        //    {
        //        $("#modal_loading").modal("hide");
        //    }
        //    else
        //    {
        //        swal(d.data.message, { icon: "warning", });
        //    }
        //});
    }
    init()

    function formatState(state)
    {
        if (!state.id) {
            return state.text;
        }
        var baseUrl = (state.empl_photo == "" ? "../ResourcesImages/upload_profile.png" : s.image_link + state.id);
        var $state = $(
            '<a class="pull-left">' +
            '<img alt="image" class="img-circle" width="60" height="60" src="' + baseUrl + '" >' +
            '</a>' +
            '<div class="media-body p-sm ">' +
            '<small > ' + state.pos + ' </small><br />' +
            '<strong> ' + state.text + ' </strong> ' + state.dep + '' +
            '</div>'
        );
        return $state;
    };

    $(document).ready(function ()
    {
        $("#employee_name").select2({
            templateResult      : formatState,
            minimumInputLength  : 3,
            placeholder         : "Select Employee",
            allowClear          : true,
            dropdownParent      : $("#main_modal"),
            ajax:
            {
                url         : "../cASTDTRSupport/Search",
                dataType    : 'json',
                data        : (params) => {
                    return {
                        term: params.term,
                    }
                },
                processResults: (data, params) => {
                    const results = data.data.map(item => {
                        return {
                            id          : item.empl_id,
                            text        : item.empl_id + " - " + item.employee_name,
                            empl_photo  : item.empl_photo,
                            pos         : item.position_long_title == null ? "--" : item.position_long_title,
                            dep         : (item.department_short_name == null ? "" : item.department_short_name ),
                            dep_code    : (item.department_code == null ? "" : item.department_code),
                        };
                    });
                    return {
                        results: results,
                    }
                },
            },
        });
    })

    var init_table_data = function (par_data)
    {
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
                        "mData": "approver",
                        "mRender": function (data, type, full, row) {

                            return "<span class='text-center btn-block'>" + data + "</span>"
                        }
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
        catch (err)
        {
            alert(err.message)
        }
    }
    ////************************************//
    ////***       Open Add Modal        ****//
    ////************************************//
    s.btn_open_modal = function ()
    {
        clearentry();
        s.ModalTitle        = "Add New Record";
        $('#main_modal').modal({ backdrop: 'static', keyboard: false });
    }
    ////************************************// 
    ////*** Save New Record              
    ////**********************************// 
    s.btn_save_click = function ()
    {
        if (ValidateFields())
        {
            //h.post("../cLeaveAdmin/CheckExist",
            //{
            //     empl_id            : $("#ddl_name option:selected").val()
            //    ,department_code    : $("#ddl_dept option:selected").val()
            //}).then(function (d)
            //{
            //    if (d.data.message == "success")
            //    {
            //        swal("Data already exist!", { icon: "warning", });
            //    }
            //    else {
            //        var data =
            //        {
            //            empl_id             : $("#ddl_name option:selected").val()
            //            ,department_code    : $("#ddl_dept option:selected").val()
            //            ,rcrd_status        : $("#ddl_status option:selected").val()
            //            ,approver           : s.approver
            //        }
            //        h.post("../cLeaveAdmin/Save", { data: data }).then(function (d) {
            //            if (d.data.message == "success") {
            //                s.FilterPageGrid();
            //                $('#main_modal').modal("hide");
            //                swal("Your record has been saved!", { icon: "success", });
            //                btn.innerHTML = '<i class="fa fa-save"> </i> Save';
            //            }
            //            else {
            //                swal(d.data.message, { icon: "warning", });
            //            }
            //        });
            //    }
            //});
        }
    }
    
    ////************************************// 
    ////*** Open Edit Modal         
    ////**********************************// 
    //s.btn_edit_action = function (row_id)
    //{
    //    clearentry();
    //    s.isEdit            = true;
    //    btn                 = document.getElementById('edit');
    //    s.ModalTitle        = "Edit Existing Record";
    //    s.txtb_empl_name    = $("#ddl_name option:selected").html()
    //    s.txtb_empl_nbr     = s.datalistgrid[row_id].empl_id;
    //    s.ddl_dept          = s.datalistgrid[row_id].department_code;
    //    s.ddl_status        = s.datalistgrid[row_id].rcrd_status;
    //    s.approver          = s.datalistgrid[row_id].approver.toString().trim();
    //    $('#main_modal').modal("show");
    //}
    ////***********************************// 
    ////*** Update Existing Record         
    ////**********************************// 
    //s.SaveEdit = function ()
    //{
    //    if (ValidateFields())
    //    {
    //        btn = document.getElementById('edit');
    //        btn.innerHTML = '<i class = "fa fa-spinner fa-spin"></i> Saving';
    //        var data =
    //        {
    //            empl_id             : $("#ddl_name option:selected").val()
    //            ,department_code    : $("#ddl_dept option:selected").val()
    //            ,rcrd_status        : $("#ddl_status option:selected").val()
    //            ,approver           : s.approver
    //        }
                    
    //        h.post("../cLeaveAdmin/SaveEdit", { data: data }).then(function (d) {
    //            if (d.data.message == "success") {
    //                s.FilterPageGrid();
    //                btn.innerHTML = '<i class="fa fa-save"> </i> Save Edit';
    //                $('#main_modal').modal("hide");
    //                swal("Your record successfully updated!", { icon: "success", });
    //            }
    //            else {
    //                swal(d.data.message, { icon: "warning", });
    //            }
    //        }); 
    //    }
    //}
    ////************************************// 
    ////*** Delete Record              
    ////**********************************// 
    //s.btn_del_row = function (row_index) {
    //    swal({
    //        title: "Are you sure to delete this record?",
    //        text: "Once deleted, you will not be able to recover this record!",
    //        icon: "warning",
    //        buttons: true,
    //        dangerMode: true,

    //    })
    //        .then(function (willDelete) {
    //            if (willDelete) {
    //                h.post("../cLeaveAdmin/Delete", {
    //                    empl_id: s.datalistgrid[row_index].empl_id
    //                    , department_code: s.datalistgrid[row_index].department_code
    //                }).then(function (d) {
    //                    if (d.data.message == "success") {
    //                        s.FilterPageGrid();
    //                        swal("Your record has been deleted!", { icon: "success", });
    //                    }
    //                    else {
    //                        swal("Data already deleted by other user/s!", { icon: "warning", });
    //                        s.FilterPageGrid();
    //                    }
    //                })
    //            }
    //        });
    //}

    //Array.prototype.delete = function (code) {
    //    return this.filter(function (d, k) {
    //        return k != code
    //    })
    //}

    function clearentry()
    {
        s.empl_id               = ""
        s.department_short_name = ""
        s.department_code       = ""
    }
    //***********************************************************//
    //***Field validation for remittance type before opening add modal
    //***********************************************************// 
    function ValidateFields()
    {
        var return_val = true;
        ValidationResultColor("ALL", false);

        if ($('#employee_name').val() == "") {
            ValidationResultColor("employee_name", true);
            return_val = false;
        }
        if ($('#solo_parent_id_no').val() == "") {
            ValidationResultColor("solo_parent_id_no", true);
            return_val = false;
        }
        if ($('#valid_until').val() == "") {
            ValidationResultColor("valid_until", true);
            return_val = false;
        }
        return return_val;
    }

    //***********************************************************//
    //***Field validation for remittance type before opening add modal
    //***********************************************************// 
    function ValidationResultColor(par_object_id, par_v_result) {
        if (par_v_result)
        {
            $("#" + par_object_id).addClass("required");
            $("#lbl_" + par_object_id + "_req").text("Required Field");
        }
        else
        {
            $("#employee_name").removeClass("required");
            $("#lbl_employee_name_req").text("");

            $("#solo_parent_id_no").removeClass("required");
            $("#lbl_solo_parent_id_no_req").text("");

            $("#valid_until").removeClass("required");
            $("#lbl_valid_until_req").text("");
        }
    }
    s.FilterPageGrid = function ()
    {
        var data = $('#employee_name').select2('data')[0]
        $("#empl_id").val(data.id)
        $("#department_short_name").val(data.dep)
        $("#department_code").val(data.dep_code)
    }
})