ng_HRD_App.controller("cMonthEarns_ctrlr", function ($scope, $compile, $http, $filter) {
    var s = $scope
    var h = $http

    s.year          = [];
    s.rowLen        = "10";
    s.ddl_dept      = "";
    s.ddl_earning_type = "VL"

    function init()
    {
        //**********************************************
        // Initialize data during page loads
        //**********************************************
        $('#modal_generating_remittance').modal({ backdrop: 'static', keyboard: false });
        h.post("../cMonthEarns/InitializeData").then(function (d) {
            if (d.data.message == "success")
            {
                var curr_year = new Date().getFullYear().toString();
                s.ddl_year = curr_year;
                s.currentMonth = new Date().getMonth() + 1
                s.ddl_month = datestring(s.currentMonth.toString())
                RetrieveYear();
                s.lv_admin_dept_list = d.data.lv_admin_dept_list
                s.ddl_dept = d.data.lv_admin_dept_list[0].department_code
                
                if (d.data.data.length > 0) {
                    init_table_data(d.data.data);
                }
                else
                {
                    init_table_data([]);
                }
                
                //**********************************************
                //  Show/Hide ADD, EDIT, DELETE button 
                //**********************************************
                d.data.um.allow_add     == "1" ? s.ShowAdd    = true : s.ShowAdd = false;
                d.data.um.allow_delete  == "1" ? s.ShowDelete = true : s.ShowDelete = false;
                d.data.um.allow_edit    == "1" ? s.ShowEdit   = true : s.ShowEdit = false;
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
                        "mData": null,
                        "mRender": function (data, type, full, row) {
                            return "<center><span class='details-control' style='display:block;' ></center>"
                        }
                    },
                    {
                        "mData": "department_short_name",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-left btn-block'>&nbsp;&nbsp;" + data + "</span>"
                        }
                    },
                    {
                        "mData": "empl_id",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-center btn-block'>&nbsp;&nbsp;" + data + "</span>"
                        }
                    },
                    {
                        "mData": "employee_name",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-left   btn-block'>" + data + "</span>"
                        }
                    },
                    {
                        "mData": "remarks_descr",
                        "mRender": function (data, type, full, row)
                        {
                            var color = (full["remarks_flag"] == "" ? "primary" : "danger");
                            return "&nbsp;&nbsp;&nbsp;<span class='badge badge-" + color +"'>" + data + "</span>"
                        }
                    },
                    {
                        "mData": "created_dttm",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-left   btn-block'>&nbsp;&nbsp;" + moment(data).format('YYYY-MM-DD HH:mm:ss') + "</span>"
                        }
                    },
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
    function RetrieveYear() {
        var currentYear = new Date().getFullYear();
        var prev_year = currentYear - 5;
        for (var i = 1; i <= 8; i++) {
            var data = { "year": prev_year }
            s.year.push(data)
            prev_year++;
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
    
    //*********************************************//
    //*** Filter Page Grid
    //********************************************// 
    s.FilterPageGrid = function ()
    {
        $('#modal_generating_remittance').modal({ backdrop: 'static', keyboard: false });
        h.post("../cMonthEarns/FilterPageGrid", {
            par_year            : s.ddl_year,
            par_month           : s.ddl_month,
            par_department_code : s.ddl_dept,
            par_earning_type    : s.ddl_earning_type
        }).then(function (d)
        {
            if (d.data.message == "success")
            {
                s.oTable.fnClearTable();
                s.datalistgrid = d.data.data;
                if (d.data.data.length > 0)
                {
                    s.oTable.fnAddData(d.data.data);
                }
                $('#modal_generating_remittance').modal("hide")
            }
        })
    }
    $('#datalist_grid tbody').on('click', 'span.details-control', function () {
        var tr = $(this).closest('tr');
        var row = $('#datalist_grid').DataTable().row(tr);
        if (row.child.isShown()) {
            row.child.hide();
            tr.removeClass('shown');
        }
        else {
            row.child(format(row.data())).show();
            tr.addClass('shown');
        }
    });
    //NEW UPDATE BY: JORGE RUSTOM VILLANUEVA 2020-09-18
    /* Formatting function for row details - modify as you need */
    function format(d)
    {
        return '<table class="no-border" style="padding:0px !important;min-height:10px !important" > ' +
            '<tr>' +
            '<td style="width:24% !important;padding:0px 0px 0px 10px">Generated by:</td>' +
            '<td style="padding:0px">' + d.created_employee_name + '</td>' +
            '</tr>' +
            '<tr>' +
            '<td style="width:24% !important;padding:0px 0px 0px 10px">Generated Date/Time:</td>' +
            '<td style="padding:0px">' + moment(d.created_dttm).format('YYYY-MM-DD HH:mm:ss') + '</td>' +
            '</tr>' +
            '</table>';
    }
    //***********************************************************//
    //*** VJA - 02/29/2020 - Convert date to String from 1 to 01 if less than 10
    //***********************************************************// 
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

    s.btn_generate = function ()
    {
        swal("ARE YOU SURE YOU WANT TO GENERATE EARN FOR DEPARTMENT " + $('#ddl_dept option:selected').text(), "FOR THE MONTH OF " + $('#ddl_month option:selected').text().toUpperCase() + ", " + $('#ddl_year option:selected').text(), {
            icon: "warning",
            closeOnClickOutside: false,
            closeOnEsc: false,
            dangerMode: true,
            buttons: {
                generate_earn: {
                    text : "Generate Earn " + $('#ddl_month option:selected').text() + ", " + $('#ddl_year option:selected').text(),
                    value: "generate_earn"
                },
                defeat: {
                    value: "defeat",
                    text: "Close",
                    className: "red-bg"
                }
            }
        }).then((value) => {
            switch (value) {
                case "generate_earn":
                    $('#modal_generating_remittance').modal({ backdrop: 'static', keyboard: false });
                    h.post("../cMonthEarns/GenerateEarn",
                        {
                             par_year            : s.ddl_year
                            ,par_month           : s.ddl_month
                            ,par_department_code : s.ddl_dept
                            ,par_empl_id         : ""
                            ,par_earning_type    : s.ddl_earning_type
                                
                        }).then(function (d) {
                            if (d.data.message == "success")
                            {
                                if (d.data.data.return_flag == "Y")
                                {
                                    swal("Successfully Generated", d.data.data.return_msg, { icon: "success" });
                                }
                                else
                                {
                                    swal("No data Inserted on Monthly earnings", d.data.data.return_msg, { icon: "warning" });
                                }
                                s.FilterPageGrid();
                            }
                            else
                            {
                                swal("There something wrong!", d.data.message, { icon: "warning" });
                                s.FilterPageGrid();
                            }
                        })
                    
                    break;

                default:
                //swal("Cancel Request!");
            }
        });
    }

})