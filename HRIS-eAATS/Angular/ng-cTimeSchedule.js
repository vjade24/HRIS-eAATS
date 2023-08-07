ng_HRD_App.controller("cTimeSchedule_ctrlr", function ($scope, $compile, $http, $filter) {
    var s = $scope
    var h = $http

    var userid              = "";
    var tempData            = "";
    s.rowLen                = "10";
    s.pre_timein_tt         = "AM";
    s.post_timeout_tt       = "PM";

    function init()
    {
        //format clockpicker to 12 Hour Format
        $("#txtb_am_in").clockpicker({
            format: "HH:mm",
            placement: "top",
            align: "left",
            autoclose: true,
            twelvehour: true
        });

        //format clockpicker to 12 Hour Format
        $("#txtb_am_out").clockpicker({
            format: "HH:mm",
            placement: "top",
            align: "left",
            autoclose: true,
            twelvehour: true
        });

        //format clockpicker to 12 Hour Format
        $("#txtb_pm_in").clockpicker({
            format: "HH:mm",
            placement: "top",
            align: "left",
            autoclose: true,
            twelvehour: true
        });

        //format clockpicker to 12 Hour Format
        $("#txtb_pm_out").clockpicker({
            format: "HH:mm",
            placement: "top",
            align: "left",
            autoclose: true,
            twelvehour: true
        });

        //format clockpicker to 12 Hour Format
        $("#txtb_pre_timein").clockpicker({
            format: "HH:mm",
            placement: "top",
            align: "left",
            autoclose: true,
            twelvehour: true
        });

        //format clockpicker to 12 Hour Format
        $("#txtb_post_timeout").clockpicker({
            format: "HH:mm",
            placement: "top",
            align: "left",
            autoclose: true,
            twelvehour: true
        });

        //format clockpicker to 12 Hour Format
        $("#clockpicker_icn").clockpicker({
            format: "HH:mm",
            placement: "top",
            align: "left",
            autoclose: true,
            twelvehour: true
        });

        //format clockpicker to 12 Hour Format
        $("#clockpicker_icn2").clockpicker({
            format: "HH:mm",
            placement: "top",
            align: "left",
            autoclose: true,
            twelvehour: true
        });

        //format clockpicker to 12 Hour Format
        $("#clockpicker_icn3").clockpicker({
            format: "HH:mm",
            placement: "top",
            align: "left",
            autoclose: true,
            twelvehour: true
        });

        //format clockpicker to 12 Hour Format
        $("#clockpicker_icn4").clockpicker({
            format: "HH:mm",
            placement: "top",
            align: "left",
            autoclose: true,
            twelvehour: true
        });

        $("#txtb_am_in").on('change', function (e) {
            RemovePMAM($("#txtb_am_in").val(), "txtb_am_in");
        });

        $("#txtb_am_out").on('change', function (e) {
            RemovePMAM($("#txtb_am_out").val(), "txtb_am_out");
        });

        $("#txtb_pm_in").on('change', function (e) {
            RemovePMAM($("#txtb_pm_in").val(), "txtb_pm_in");
        });

        $("#txtb_pm_out").on('change', function (e) {
            RemovePMAM($("#txtb_pm_out").val(), "txtb_pm_out");
        });

        $("#txtb_pre_timein").on('change', function (e) {
            RemovePMAM($("#txtb_pre_timein").val(), "txtb_pre_timein");
        });

        $("#txtb_post_timeout").on('change', function (e) {
            RemovePMAM($("#txtb_post_timeout").val(), "txtb_post_timeout");
        });
        
        $("#modal_generating_remittance").modal();
        
        //**********************************************
        // Initialize data during page loads
        //**********************************************
        h.post("../cTimeSchedule/initializeData").then(function (d) {
            if (d.data.message == "success") {
                userid = d.data.userid;
                //console.log(d.data.timeSchedLst);
                if (d.data.timeSchedLst.length > 0) {
                    init_table_data(d.data.timeSchedLst);
                }
                else {
                    init_table_data([]);
                }
                showdetailsInfo("datalist_grid");
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
                    { "mData": "ts_code", "mRender": function (data, type, full, row) { return "<span class='text-center btn-block'>" + data + "</span>" } },
                    { "mData": "ts_descr", "mRender": function (data, type, full, row) { return "<span class='text-left btn-block'>" + data + "</span>" } },
                    {
                        "mData": null,
                        "mRender": function (data, type, full, row) {
                            if(data.ts_am_in == "" && data.ts_am_out == "") {
                                return "<span class='text-center btn-block'>" + data.ts_am_in + data.ts_am_out + "</span>"
                            }
                            else if(data.ts_am_in == "") {
                                return "<span class='text-center btn-block'>" + data.ts_am_in + "&emsp;&emsp;&emsp;&emsp;&emsp;-&nbsp;&nbsp;&nbsp;&nbsp;<button type='button' class='btn btn-danger m-r-sm'>" + data.ts_am_out + "</button></span>"
                            }
                            else if (data.ts_am_out == "") {
                                return "<span class='text-center btn-block'><button type='button' class='btn btn-primary m-r-sm'>" + data.ts_am_in + "</button>-&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;" + data.ts_am_out + "</span>"
                            }
                            else {
                                return "<span class='text-center btn-block'><button type='button' class='btn btn-primary m-r-sm'>" + data.ts_am_in + "</button>" + "-&nbsp;&nbsp;&nbsp;<button type='button' class='btn btn-danger m-r-sm'>" + data.ts_am_out + "</button></span>"
                            } 
                        }
                    },
                    {
                        "mData": null,
                        "mRender": function (data, type, full, row) {
                            if (data.ts_pm_in == "" && data.ts_pm_out == "") {
                                return "<span class='text-center btn-block'>" + data.ts_pm_in + data.ts_pm_out + "</span>"
                            }
                            else if (data.ts_pm_in == "") {
                                return "<span class='text-center btn-block'>" + data.ts_pm_in + "&emsp;&emsp;&emsp;&emsp;&emsp;-&nbsp;&nbsp;&nbsp;&nbsp;<button type='button' class='btn btn-danger m-r-sm'>" + data.ts_pm_out + "</button></span>"
                            }
                            else if (data.ts_pm_out == "") {
                                return "<span class='text-center btn-block'><button type='button' class='btn btn-primary m-r-sm'>" + data.ts_pm_in + "</button>-&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;" + data.ts_pm_out + "</span>"
                            }
                            else {
                                return "<span class='text-center btn-block'><button type='button' class='btn btn-primary m-r-sm'>" + data.ts_pm_in + "</button>" + "-&nbsp;&nbsp;&nbsp;<button type='button' class='btn btn-danger m-r-sm'>" + data.ts_pm_out + "</button></span>"
                            } 
                        }
                    },
                    {
                        "mData": "ts_add_days",
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

    //*********************************************//
    //*** Filter Page Grid
    //********************************************// 
    s.FilterPageGrid = function (find_data) {
        h.post("../cTimeSchedule/FilterPageGrid").then(function (d) {
            if (d.data.message == "success") {
                s.oTable.fnClearTable();
                s.datalistgrid = d.data.filteredGrid;
                if (d.data.filteredGrid.length > 0) {
                    s.oTable.fnAddData(d.data.filteredGrid);
                }

                if (find_data != "") {
                    var table = $("#datalist_grid").DataTable();
                    table
                        .rows('.selected')
                        .nodes()
                        .to$()
                        .removeClass('selected');
                    for (var x = 1; x <= $('#datalist_grid').DataTable().page.info().pages; x++) {
                        if (get_page(find_data) == false) {
                            s.oTable.fnPageChange(x);
                        }
                        else {
                            break;
                        }
                    }
                }
            }
        })
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
        h.post("../cTimeSchedule/GetLasCode").then(function (d) {
            if (d.data.message == "success") {
                //s.txtb_code = d.data.ids;
                s.txtb_code = "96";
                setTimeout(function () {

                    btn.innerHTML = '<i class="fa fa-plus-circle"> </i> Add';
                    $('#main_modal').modal("show");
                }, 300);
            }
            else {
                swal(d.data.message, { icon: "warning", });
            }
        });
    }
    //************************************// 
    //*** Save New Record              
    //**********************************// 
    s.btn_save_click = function () {
        if (ValidateFields()) {
            btn = document.getElementById('addFinal');
            btn.innerHTML = '<i class = "fa fa-spinner fa-spin"></i> Save';
            var lunch_break = null;
            if (s.chckbx_lunch_break == true) {
                lunch_break = 1;
            }
            else {
                lunch_break = 0;
            }
            var data = {
                ts_code                 : s.txtb_code
                , ts_descr              : s.txtb_description
                , ts_am_in              : $("#txtb_am_in").val()
                , ts_am_out             : $("#txtb_am_out").val()
                , ts_pm_in              : convert_time_to_24hr($("#txtb_pm_in").val())
                , ts_pm_out             : convert_time_to_24hr($("#txtb_pm_out").val())
                , ts_add_days           : s.txtb_add_days
                , ts_mid_break          : lunch_break
                , ts_day_equivalent     : s.txtb_day_equiv
                , pre_time_in_hrs       : $("#pre_timein_tt option:selected").val()     == "PM" ? convert_time_to_24hr($("#txtb_pre_timein").val()) : $("#txtb_pre_timein").val()
                , post_time_out_hrs: $("#post_timeout_tt option:selected").val() == "PM" ? convert_time_to_24hr($("#txtb_post_timeout").val()) : $("#txtb_post_timeout").val()
            }
            //console.log(data)
            h.post("../cTimeSchedule/Save", { data: data }).then(function (d) {
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
    }
    //***********************************************************//
    //***Field validation for remittance type before opening add modal
    //***********************************************************// 
    function ValidateFields() {
        var return_val = true;
        ValidationResultColor("ALL", false);
        
        if ($('#txtb_description').val() == "") {
            ValidationResultColor("txtb_description", true);
            return_val = false;
        }

        if ($('#txtb_add_days').val() == "") {
            ValidationResultColor("txtb_add_days", true);
            return_val = false;
        }

        if ($('#txtb_day_equiv').val() == "") {
            ValidationResultColor("txtb_day_equiv", true);
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
            
            $("#txtb_description").removeClass("required");
            $("#lbl_txtb_description_req").text("");

            $("#txtb_add_days").removeClass("required");
            $("#lbl_txtb_add_days_req").text("");

            $("#txtb_day_equiv").removeClass("required");
            $("#lbl_txtb_day_equiv_req").text("");

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
        h.post("../cTimeSchedule/GetData", {
            ts_code : s.datalistgrid[row_id].ts_code
        }).then(function (d) {
            if (d.data.message == "success") {
                clearentry();
                $('#main_modal').modal("show");
                console.log(d.data.getData);    
                s.isEdit                = true;
                s.ModalTitle            = "Edit Existing Record";
                s.txtb_code             = d.data.getData[0].ts_code;
                s.txtb_description      = d.data.getData[0].ts_descr;
                s.txtb_am_in            = d.data.getData[0].ts_am_in;
                s.txtb_am_out           = d.data.getData[0].ts_am_out;
                s.txtb_pm_in            = d.data.getData[0].ts_pm_in == "" ? "" : convert_time_to_12hr(d.data.getData[0].ts_pm_in);
                s.txtb_pm_out           = d.data.getData[0].ts_pm_out == "" ? "" : convert_time_to_12hr(d.data.getData[0].ts_pm_out);
                s.txtb_add_days         = d.data.getData[0].ts_add_days;
                s.txtb_day_equiv        = d.data.getData[0].ts_day_equivalent;
                s.txtb_pre_timein       = d.data.getData[0].pre_time_in_hrs;
                s.txtb_post_timeout     = d.data.getData[0].post_time_out_hrs;

                if (d.data.getData.ts_mid_break == true) {
                    s.chckbx_lunch_break = true
                }
                else {
                    s.chckbx_lunch_break = false
                }
            }
        });
    }
    //***********************************// 
    //*** Update Existing Record         
    //**********************************// 
    s.SaveEdit = function () {
        if (ValidateFields()) {
            btn = document.getElementById('edit');
            btn.innerHTML = '<i class = "fa fa-spinner fa-spin"></i> Saving';
            var lunch_break = null;
            if (s.chckbx_lunch_break == true) {
                lunch_break = 1;
            }
            else {
                lunch_break = 0;
            }
            var data = {
                ts_code                 : s.txtb_code
                , ts_descr              : s.txtb_description
                , ts_am_in              : $("#txtb_am_in").val()
                , ts_am_out             : $("#txtb_am_out").val()
                , ts_pm_in              : convert_time_to_24hr($("#txtb_pm_in").val())
                , ts_pm_out             : convert_time_to_24hr($("#txtb_pm_out").val())
                , ts_add_days           : s.txtb_add_days
                , ts_mid_break          : lunch_break
                , ts_day_equivalent     : s.txtb_day_equiv
                , pre_time_in_hrs       : $("#pre_timein_tt option:selected").val()     == "PM" ? convert_time_to_24hr($("#txtb_pre_timein").val()) : $("#txtb_pre_timein").val()
                , post_time_out_hrs     : $("#post_timeout_tt option:selected").val()   == "PM" ? convert_time_to_24hr($("#txtb_post_timeout").val()) : $("#txtb_post_timeout").val()
            }
            //console.log(data)
            h.post("../cTimeSchedule/SaveEdit", { data: data }).then(function (d) {
                if (d.data.message == "success") {

                    s.oTable.fnClearTable();
                    s.oTable.fnAddData(s.datalistgrid);

                    s.FilterPageGrid(s.txtb_code);;

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
                    h.post("../cTimeSchedule/Delete", {
                        ts_code: s.datalistgrid[row_index].ts_code
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

    function RemovePMAM(val, txtb) {
        var value = "";

        if (val.length > 6) {
            value = val.substring(0, val.length - 2);
        }
        if (txtb == "txtb_am_in") {
            $("#txtb_am_in").val(value);
        }
        else if (txtb == "txtb_am_out") {
            $("#txtb_am_out").val(value);
        }
        else if (txtb == "txtb_pm_in") {
            $("#txtb_pm_in").val(value);
        }
        else if (txtb == "txtb_pm_out") {
            $("#txtb_pm_out").val(value);
        }
        else if (txtb == "txtb_pre_timein") {
            $("#txtb_pre_timein").val(value);
        }
        else if (txtb == "txtb_post_timeout") {
            $("#txtb_post_timeout").val(value);
        }
        else {
            $("#txtb_am_out").val("");
            $("#txtb_pm_out").val("");
            $("#txtb_pre_timein").val("");
            $("#txtb_post_timeout").val("");
        }
    }

    function convert_time_to_24hr(val) {
        var value = "";

        if (val != "") {
            var time = val.split(':');

            switch (time[0]) {
                case "01":
                    value = "13" + ":" + time[1];
                    break;
                case "02":
                    value = "14" + ":" + time[1];
                    break;
                case "03":
                    value = "15" + ":" + time[1];
                    break;
                case "04":
                    value = "16" + ":" + time[1];
                    break;
                case "05":
                    value = "17" + ":" + time[1];
                    break;
                case "06":
                    value = "18" + ":" + time[1];
                    break;
                case "07":
                    value = "19" + ":" + time[1];
                    break;
                case "08":
                    value = "20" + ":" + time[1];
                    break;
                case "09":
                    value = "21" + ":" + time[1];
                    break;
                case "10":
                    value = "22" + ":" + time[1];
                    break;
                case "11":
                    value = "23" + ":" + time[1];
                    break;
                case "12":
                    value = "00" + ":" + time[1];
                    break;
            }
        }
        
        return value;
    }

    function convert_time_to_12hr(val) {
        var value = "";

        if (val != "") {

            var time = val.split(':');

            switch (time[0]) {
                case "13":
                    value = "01" + ":" + time[1];
                    break;
                case "14":
                    value = "02" + ":" + time[1];
                    break;
                case "15":
                    value = "03" + ":" + time[1];
                    break;
                case "16":
                    value = "04" + ":" + time[1];
                    break;
                case "17":
                    value = "05" + ":" + time[1];
                    break;
                case "18":
                    value = "06" + ":" + time[1];
                    break;
                case "19":
                    value = "07" + ":" + time[1];
                    break;
                case "20":
                    value = "08" + ":" + time[1];
                    break;
                case "21":
                    value = "09" + ":" + time[1];
                    break;
                case "22":
                    value = "10" + ":" + time[1];
                    break;
                case "23":
                    value = "11" + ":" + time[1];
                    break;
                case "00":
                    value = "12" + ":" + time[1];
                    break;
                default:
                    value = val == "" ? "" : time[0] + ":" + time[1];
                    break;
            }
        }
        
        return value;
    }

    function clearentry() {
        s.txtb_code          = "";
        s.txtb_description   = "";
        s.txtb_am_in         = "";
        s.txtb_am_out        = "";
        s.txtb_pm_in         = "";
        s.txtb_pm_out        = "";
        s.txtb_add_days      = "";
        s.txtb_day_equiv     = "";
        s.txtb_pre_timein    = "";
        s.txtb_post_timeout  = "";
        s.chckbx_lunch_break = false;

        $("#txtb_pre_timein").val("");
        $("#txtb_post_timeout").val("");

        $("#txtb_description").removeClass("required");
        $("#lbl_txtb_description_req").text("");

        $("#txtb_add_days").removeClass("required");
        $("#lbl_txtb_add_days_req").text("");

        $("#txtb_day_equiv").removeClass("required");
        $("#lbl_txtb_day_equiv_req").text("");
    }

})