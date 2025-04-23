ng_HRD_App.controller("cSoloParent_ctrlr", function (commonScript,$scope, $compile, $http, $filter) {
    var s           = $scope
    var h           = $http
    var cs          = commonScript
    s.rowLen = "10";
    s.image_link    = cs.img_link('local') + "/storage/images/photo/thumb/";
    s.ModalAction   = "ADD";
    s.leavelist = []
    function init()
    {
        $("#ddl_empl_id").select2().on('change', function (e)
        {
            s.EmployeeInfo();
        });

        var curr_year = new Date().getFullYear().toString();
        $('#modal_loading').modal({ backdrop: 'static', keyboard: false });
        h.post("../cSoloParent/InitializeData", { valid_year: curr_year}).then(function (d)
        {
            if (d.data.message == "success")
            {
                init_table_data([]);
                s.oTable.fnClearTable();
                s.datalistgrid = d.data.data;
                if (d.data.data.length > 0) {
                    s.oTable.fnAddData(d.data.data);
                }
                $("#modal_loading").modal("hide");
            }
            else
            {
                $("#modal_loading").modal("hide");
                swal(d.data.message, { icon: "warning", });
            }
        });
    }
    init()
    function RetrieveYear() {
        var currentYear = new Date().getFullYear();
        var prev_year = currentYear - 5;
        for (var i = 1; i <= 8; i++) {
            var data = { "year": prev_year }
            s.year.push(data)
            prev_year++;
        }
    }
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
        $("#ddl_empl_id").select2({
            templateResult      : formatState,
            minimumInputLength  : 3,
            placeholder         : "Select Employee",
            allowClear          : true,
            dropdownParent      : $("#main_modal"),
            ajax:
            {
                url         : "../cSoloParent/Search",
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
                            empl_name   : item.employee_name,
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
                        "mRender": function (data, type, full, row) {
                            var temp = moment();
                            var def_images = '../../ResourcesImages/upload_profile.png';
                            return '<div class="text-center" >' +
                                '<div class="img-circle">' +
                                '<img class="img-circle" onerror="this.onerror=null;this.src=\'' + def_images + '\';" alt="../ResourcesImages/upload_profile.png" width="30" height="30" src="' + s.image_link + full["empl_id"] + '?v=' + temp + ' " />' +
                                '</div>' +
                                '</div>'
                        }
                    },
                    {
                        "mData": "empl_id",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-center btn-block'>" + data + "</span>"
                        }
                    },
                    { "mData": "employee_name", 
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-left btn-block'>" + data + "</span>"
                        }
                    },
                    {
                        "mData": "department_short_name",
                        "mRender": function (data, type, full, row) { 
                            return "<span class='text-left btn-block'>" + data + "</span>" }
                    },
                    {
                        "mData": "solo_parent_no",
                        "mRender": function (data, type, full, row) {

                            return "<span class='text-center btn-block'>" + data + "</span>"
                        }
                    },
                    {
                        "mData": "valid_until",
                        "mRender": function (data, type, full, row) {

                            return "<span class='text-center btn-block'>" + moment(data).format('LL') + "</span>"
                        }
                    },
                    {
                        "mData": null,
                        "bSortable": false,
                        "mRender": function (data, type, full, row) {

                            return '<center><div class="btn-group">' +
                                '<button type="button" class="btn btn-info btn-sm" ng-click="btn_edit_action(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Edit">  <i class="fa fa-edit"></i></button >' +
                                '<button type="button" class="btn btn-danger btn-sm" ng-click="btn_del_row(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Delete"><i class="fa fa-trash"></i></button>' +
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
    //************************************//
    //***       Open Add Modal        ****//
    //************************************//
    s.btn_open_modal = function ()
    {
        clearentry();
        $('#ddl_empl_id').val(null).trigger('change')
        s.ModalTitle  = "Add New Record";
        s.ModalAction = "ADD";
        $('#main_modal').modal({ backdrop: 'static', keyboard: false });
    }
    //************************************// 
    //*** Save New Record              
    //**********************************// 
    s.btn_save_click = function ()
    {
        if (ValidateFields())
        {
            var data =
            {
                 empl_id                : $('#empl_id').val()
                ,employee_name          : $('#employee_name').val()
                ,department_code        : $('#department_code').val()
                ,department_short_name  : $('#department_short_name').val()
                ,solo_parent_no         : $('#solo_parent_no').val()
                ,valid_until            : $('#valid_until').val()
                , solo_parent_category  : $('#solo_parent_category').val()
                , qualification_code    : $('#qualification_code').val()
                ,id                     : s.id
            }
            h.post("../cSoloParent/Save", { data: data, action: s.ModalAction}).then(function (d)
            {
                if (d.data.message == "success")
                {
                    s.FilterPageGrid();
                    $('#main_modal').modal("hide");
                    swal("Your record has been saved!", { icon: "success", });
                }
                else {
                    swal(d.data.message, { icon: "warning", });
                }
            });
                
        }
    }
    
    ////************************************// 
    ////*** Open Edit Modal         
    ////**********************************// 
    s.btn_edit_action = function (row_id)
    {
        clearentry();
        s.ModalTitle            = "Edit Existing Record";
        s.ModalAction           = "EDIT";
        s.empl_id               = s.datalistgrid[row_id].empl_id              
        s.employee_name         = s.datalistgrid[row_id].employee_name        
        s.department_code       = s.datalistgrid[row_id].department_code      
        s.department_short_name = s.datalistgrid[row_id].department_short_name
        s.solo_parent_no        = s.datalistgrid[row_id].solo_parent_no       
        s.id                    = s.datalistgrid[row_id].id  
        s.solo_parent_category  = s.datalistgrid[row_id].solo_parent_category  
        s.qualification_code    = s.datalistgrid[row_id].qualification_code  
        s.valid_until           = new Date(parseInt(s.datalistgrid[row_id].valid_until.match(/\d+/)[0]))
        s.RetrieveLeave(s.empl_id)
        console.log(s.datalistgrid[row_id])
        $('#main_modal').modal({ backdrop: 'static', keyboard: false });
    }
    //************************************// 
    //*** Delete Record              
    //**********************************// 
    s.btn_del_row = function (row_index)
    {
        swal({
            title: "Are you sure to delete this record?",
            text: "Once deleted, you will not be able to recover this record!",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        }).then(function (willDelete)
        {
            if (willDelete)
            {
                h.post("../cSoloParent/Delete", { id: s.datalistgrid[row_index].id }).then(function (d)
                {
                    if (d.data.message == "success")
                    {
                        s.FilterPageGrid();
                        swal("Your record has been deleted!", { icon: "success", });
                    }
                    else
                    {
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

    function clearentry()
    {
        s.empl_id               = ""
        s.employee_name         = ""
        s.department_short_name = ""
        s.department_code       = ""
        s.solo_parent_no        = ""
        s.valid_until           = ""
        s.id                    = ""
        s.solo_parent_category  = ""
        s.qualification_code    = ""
        s.leavelist             = []
    }
    //***********************************************************//
    //***Field validation for remittance type before opening add modal
    //***********************************************************// 
    function ValidateFields()
    {
        var return_val = true;
        ValidationResultColor("ALL", false);

        if ($('#ddl_empl_id').val() == "" && s.ModalAction == "ADD") {
            ValidationResultColor("ddl_empl_id", true);
            return_val = false;
        }
        if ($('#solo_parent_no').val() == "") {
            ValidationResultColor("solo_parent_no", true);
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
            $("#ddl_empl_id").removeClass("required");
            $("#lbl_ddl_empl_id_req").text("");

            $("#solo_parent_no").removeClass("required");
            $("#lbl_solo_parent_no_req").text("");

            $("#valid_until").removeClass("required");
            $("#lbl_valid_until_req").text("");
        }
    }
    s.EmployeeInfo = function ()
    {
        var data = $('#ddl_empl_id').select2('data')[0]
        $("#empl_id").val(data.id)
        $("#department_short_name").val(data.dep)
        $("#employee_name").val(data.empl_name)
        $("#department_code").val(data.dep_code)
    }

    s.FilterPageGrid = function ()
    {
        $('#modal_loading').modal({ backdrop: 'static', keyboard: false });
        h.post("../cSoloParent/InitializeData").then(function (d)
        {
            if (d.data.message == "success")
            {
                s.oTable.fnClearTable();
                s.datalistgrid = d.data.data;
                if (d.data.data.length > 0)
                {
                    s.oTable.fnAddData(d.data.data);
                }
                $("#modal_loading").modal("hide");
            }
            else
            {
                $("#modal_loading").modal("hide");
                swal(d.data.message, { icon: "warning", });
            }
        });
    }

    s.RetrieveLeave = function (empl_id)
    {
        s.leavelist=[]
        h.post("../cSoloParent/RetrieveLeave",
        {
            empl_id     : empl_id
        }).then(function (d)
        {
            if (d.data.message == "success")
            {
                s.leavelist = d.data.data
                for (var i = 0; i < d.data.data.length; i++)
                {
                    s.leavelist[i].leave_dates = s.leavelist[i].leave_date_from == s.leavelist[i].leave_date_to ? moment(s.leavelist[i].leave_date_to).format('LL') : moment(s.leavelist[i].leave_date_from).format('LL') + " - " + moment(s.leavelist[i].leave_date_to).format('LL')
                }
            }
            else
            {
                swal(d.data.message, { icon: "warning", });
            }
        });
    }
})