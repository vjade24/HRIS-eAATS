ng_HRD_App.controller("cLeaveCTOBalance_ctrlr", function ($scope, $compile, $http, $filter)
{
    var s       = $scope;
    var h       = $http;
    s.year      = [];
    s.rowLen    = "10";
    s.e
    init()
    function init()
    {
        $('#modal_generating').modal({ backdrop: 'static', keyboard: false });
        h.post("../cLeaveCTOBalance/InitializeData").then(function (d)
        {
            if (d.data.message == "success")
            {
                RetrieveYear()
                s.dep_lst = d.data.dep_lst
                s.ddl_dep = d.data.dep_code

                init_table_data([]);
                s.oTable.fnClearTable();
                s.datalistgrid = d.data.data;
                if (d.data.data.length > 0)
                {
                    s.oTable.fnAddData(d.data.data);
                }
                $('#modal_generating').modal("hide");
            }
            else
            {
                swal(d.data.message, { icon: "error", });
                $('#modal_generating').modal("hide");
            }
        })
    }
    s.FilterGrid = function ()
    {
        $('#modal_generating').modal({ backdrop: 'static', keyboard: false });
        h.post("../cLeaveCTOBalance/FilterGrid", { year: s.ddl_year, dep_code: s.ddl_dep}).then(function (d)
        {
            if (d.data.message == "success")
            {
                s.oTable.fnClearTable();
                s.datalistgrid = d.data.data;
                if (d.data.data.length > 0)
                {
                    s.oTable.fnAddData(d.data.data);
                }
                $('#modal_generating').modal("hide");
            }
            else
            {
                swal(d.data.message, { icon: "error", });
                $('#modal_generating').modal("hide");
            }
        })
    }
    var init_table_data = function (par_data) {
        try {
            s.datalistgrid = par_data;
            s.oTable = $('#datalist_grid').dataTable(
                {
                    data: s.datalistgrid,
                    bSort: true,
                    bAutoWidth: false,
                    sDom: 'rt<"bottom"ip>',
                    columns: [
                        {
                            "mData": "empl_id",
                            "mRender": function (data, type, full, row) {
                                return "<span class='small text-center btn-block'>" + data + "</span>"
                            }
                        },
                        {
                            "mData": "employee_name",
                            "mRender": function (data, type, full, row) {
                                return "<span class='small text-center'>&nbsp;&nbsp;" + data + "</span>"
                            }
                        },
                        {
                            "mData": "department_short_name",
                            "mRender": function (data, type, full, row) {
                                return "<span class='small text-center'>&nbsp;&nbsp;" + data + "</span>"
                            }
                        },
                        {
                            "mData": "monthly_rate",
                            "mRender": function (data, type, full, row) {
                                return "<span class='small text-right btn-block'>" + currency(data) + "&nbsp;&nbsp;</span>"
                            }
                        },
                        {
                            "mData": "employment_type",
                            "mRender": function (data, type, full, row) {
                                return "<span class='small text-center'>&nbsp;&nbsp;" + data + "</span>"
                            }
                        },
                        {
                            "mData": "vl_bal",
                            "mRender": function (data, type, full, row) {
                                return "<span class='small text-center btn-block'>" + data + "</span>"
                            }
                        },
                        {
                            "mData": "sl_bal",
                            "mRender": function (data, type, full, row) {
                                return "<span class='small text-center btn-block'>" + data + "</span>"
                            }
                        },
                        {
                            "mData": "sp_bal",
                            "mRender": function (data, type, full, row) {
                                return "<span class='small text-center btn-block'>" + data + "</span>"
                            }
                        },
                        {
                            "mData": "cto_bal",
                            "mRender": function (data, type, full, row) {
                                return "<span class='small text-center btn-block'>" + data + "</span>"
                            }
                        },
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
    function RetrieveYear()
    {
        var currentYear = new Date().getFullYear();
        var prev_year = currentYear - 5;
        for (var i = 1; i <= 8; i++)
        {
            var data = { "year": prev_year }
            s.year.push(data)
            prev_year++;
        }
        s.ddl_year  = new Date().getFullYear().toString();
    }
    function currency(d)
    {
        var retdata = ""
        if (d == null || d == "" || d == undefined) {
            return retdata = "0.00"
        }
        else {
            retdata = d.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
            return retdata
        }
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
    s.fnExcelReport = function ()
    {
        var data = s.datalistgrid
        // Convert object array to worksheet
        const ws = XLSX.utils.json_to_sheet(data);

        // Create a new workbook
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

        // Export the workbook
        var filename = "leavebalances_" + moment().format('YYYYMMDD_hhmmss')+".xlsx";
        XLSX.writeFile(wb, filename);
    }
})