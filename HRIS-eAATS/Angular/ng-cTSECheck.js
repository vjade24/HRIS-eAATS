ng_HRD_App.controller("cTSECheck_ctrlr", function (commonScript, $scope, $compile, $http, $filter) {
    var s           = $scope
    var h           = $http
    var cs          = commonScript
    s.rowLen        = "10";
    s.image_link    = cs.img_link('local') + "/images/serve/";
    s.ModalAction   = "ADD";

    function init()
    {
        $('#modal_loading').modal({ backdrop: 'static', keyboard: false });
        h.post("../cTSECheck/InitializeData").then(function (d)
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

    function formatState(state)
    {
        if (!state.id) {
            return state.text;
        }
        var baseUrl = (state.empl_photo == "" ? "../ResourcesImages/upload_profile.png" : s.image_link + state.empl_photo_img);
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
        $("#ddl_empl_ids").select2({
            templateResult      : formatState,
            minimumInputLength  : 3,
            placeholder         : "Select Employee(s)",
            allowClear          : true,
            multiple            : true,
            dropdownParent      : $("#main_modal"),
            ajax:
            {
                url         : "../cTSECheck/Search",
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
                            dep         : (item.department_short_name == null ? "" : item.department_short_name),
                            dep_code    : (item.department_code == null ? "" : item.department_code),
                            empl_name   : item.employee_name,
                            empl_photo_img: item.empl_photo_img + "?thumbnail=1",
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
                    {
                        "mData": "employee_name",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-left btn-block'>" + data + "</span>"
                        }
                    },
                    {
                        "mData": "tse_period_from",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-center btn-block'>" + (data ? moment(data).format('LL') : "") + "</span>"
                        }
                    },
                    {
                        "mData": "tse_period_to",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-center btn-block'>" + (data ? moment(data).format('LL') : "") + "</span>"
                        }
                    },
                    {
                        "mData": "created_dttm",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-center btn-block'>" + (data ? moment(data).format('LLL') : "") + "</span>"
                        }
                    },
                    {
                        "mData": null,
                        "bSortable": false,
                        "mRender": function (data, type, full, row) {
                            return '<center><div class="btn-group">' +
                                '<button type="button" class="btn btn-danger btn-sm" ng-click="btn_del_row(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Delete"><i class="fa fa-trash"></i></button>' +
                                '</div></center>';
                        }
                    }
                ],
                "createdRow": function (row, data, index) {
                    $compile(row)($scope);
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

    //************************************//
    //***       Open Add Modal        ****//
    //************************************//
    s.btn_open_modal = function ()
    {
        clearentry();
        $('#ddl_empl_ids').val(null).trigger('change');
        s.ModalTitle  = "Add New TSE Check Record";
        s.ModalAction = "ADD";
        $('#main_modal').modal({ backdrop: 'static', keyboard: false });
    }

    //************************************//
    //*** Save New Record
    //************************************//
    s.btn_save_click = function ()
    {
        if (ValidateFields())
        {
            var selected_ids = $('#ddl_empl_ids').val();
            var data =
            {
                 empl_ids        : selected_ids
                ,tse_period_from : $('#tse_period_from').val()
                ,tse_period_to   : $('#tse_period_to').val()
            }
            h.post("../cTSECheck/Save", data).then(function (d)
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

    //************************************//
    //*** Delete Record
    //************************************//
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
                var row_data = s.datalistgrid[row_index];
                h.post("../cTSECheck/Delete", {
                    empl_id         : row_data.empl_id,
                    tse_period_from : moment(row_data.tse_period_from).format('YYYY-MM-DD'),
                    tse_period_to   : moment(row_data.tse_period_to).format('YYYY-MM-DD')
                }).then(function (d)
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

    function clearentry()
    {
        s.tse_period_from = ""
        s.tse_period_to   = ""
    }

    //***********************************************************//
    //*** Field validation
    //***********************************************************//
    function ValidateFields()
    {
        var return_val = true;
        ValidationResultColor("ALL", false);

        var selected_ids = $('#ddl_empl_ids').val();
        if (selected_ids == null || selected_ids.length == 0) {
            ValidationResultColor("ddl_empl_ids", true);
            return_val = false;
        }
        if ($('#tse_period_from').val() == "") {
            ValidationResultColor("tse_period_from", true);
            return_val = false;
        }
        if ($('#tse_period_to').val() == "") {
            ValidationResultColor("tse_period_to", true);
            return_val = false;
        }
        return return_val;
    }

    function ValidationResultColor(par_object_id, par_v_result) {
        if (par_v_result)
        {
            $("#" + par_object_id).addClass("required");
            $("#lbl_" + par_object_id + "_req").text("Required Field");
        }
        else
        {
            $("#ddl_empl_ids").removeClass("required");
            $("#lbl_ddl_empl_ids_req").text("");

            $("#tse_period_from").removeClass("required");
            $("#lbl_tse_period_from_req").text("");

            $("#tse_period_to").removeClass("required");
            $("#lbl_tse_period_to_req").text("");
        }
    }

    s.FilterPageGrid = function ()
    {
        $('#modal_loading').modal({ backdrop: 'static', keyboard: false });
        h.post("../cTSECheck/InitializeData").then(function (d)
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
})
