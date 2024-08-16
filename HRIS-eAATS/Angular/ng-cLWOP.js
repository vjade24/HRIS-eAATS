ng_HRD_App.controller("cLWOP_ctrlr", function ($scope, $compile, $http, $filter)
{
    var s       = $scope;
    var h       = $http;
    s.rowLen    = "10";
    var date            = new Date();
    s.date_from         = new Date(date.getFullYear(), date.getMonth(), 1);
    s.date_to           = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    s.image_link        = "http://192.168.5.218/storage/images/photo/thumb/";
    init()
    function init()
    {
        if (window.location.host == "hris.dvodeoro.ph")
        {
            s.image_link = "http://122.53.120.18:8050/storage/images/photo/thumb/"
        }
        $("#date_from").on('change', function (e)
        {
            s.FilterGrid()
        });

        $("#date_to").on('change', function (e) {
            s.FilterGrid()
        });

        $('#modal_generating').modal({ backdrop: 'static', keyboard: false });
        h.post("../cLWOP/InitializeData").then(function (d)
        {
            if (d.data.message == "success")
            {
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
        h.post("../cLWOP/FilterGrid", { date_from: s.date_from, date_to: s.date_to}).then(function (d)
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
                                return "<span class='text-center'>&nbsp;&nbsp;" + data + "</span>"
                            }
                        },
                        {
                            "mData": "department_short_name",
                            "mRender": function (data, type, full, row) {
                                return "<span class='text-center'>&nbsp;&nbsp;" + data + "</span>"
                            }
                        },
                        {
                            "mData": "employment_type",
                            "mRender": function (data, type, full, row) {
                                return "<span class='text-center'>&nbsp;&nbsp;" + data + "</span>"
                            }
                        },
                        {
                            "mData": "leavetype_code",
                            "mRender": function (data, type, full, row) {
                                return "<span class='text-center'>&nbsp;&nbsp;" + data + "</span>"
                            }
                        },
                        {
                            "mData": "lwop_date",
                            "mRender": function (data, type, full, row) {
                                return "<span class='text-center'>&nbsp;&nbsp;" + data + "</span>"
                            }
                        },
                        {
                            "mData": null,
                            "mRender": function (data, type, full, row)
                            {
                                return  '<center><div class="btn-group">' +
                                            '<button type="button" class="btn btn-primary btn-xs" ng-click="btn_print(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Print Notice of LWOP"><i class="fa fa-print"></i> NOTICE OF LWOP</button >' +
                                        '</center>';
                            }
                        }
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
    s.btn_print = function (row_id)
    {
        var par_ledger_ctrl_no = s.datalistgrid[row_id].ledger_ctrl_no
        var print_mode         = "NOTICE";
        var iframe_id          = "iframe_print_preview";
        s.PrintPreview(par_ledger_ctrl_no, print_mode, iframe_id,"","");
    }
    s.PrintPreview = function (par_ledger_ctrl_no, print_mode, iframe_id, par_period_from, par_period_to)
    {
        if (s.datalistgrid.length > 0)
        {
            // *******************************************************
            // *******************************************************
            var ReportName  = "CrystalReport"
            var SaveName    = "Crystal_Report"
            var ReportType  = "inline"
            var ReportPath  = ""
            var sp          = ""
            var par_period_from = moment(par_period_from).format("YYYY-MM-DD")
            var par_period_to   = moment(par_period_to).format("YYYY-MM-DD")

            if (print_mode == 'NOTICE')
            {
                sp          = "sp_leave_application_rep3,par_ledger_ctrl_no," + par_ledger_ctrl_no;
                ReportPath  = "~/Reports/cryLWOP/cryLWOP.rpt";
            }
            else
            {
                sp          = "sp_lwop_list,par_period_from," + par_period_from + ",par_period_to," + par_period_to;
                ReportPath = "~/Reports/cryLWOP_HR/cryLWOP_HR.rpt";
            }
            // *******************************************************
            // *** VJA : 2021-07-14 - Validation and Loading hide ****
            // *******************************************************
            var iframe = document.getElementById(iframe_id);
            var iframe_page = $("#" + iframe_id)[0];
            iframe.style.visibility = "hidden";

            s.embed_link = "../Reports/CrystalViewer.aspx?Params=" + ""
                + "&ReportName=" + ReportName
                + "&SaveName=" + SaveName
                + "&ReportType=" + ReportType
                + "&ReportPath=" + ReportPath
                + "&id=" + sp // + "," + parameters

            if (!/*@cc_on!@*/0) { //if not IE
                iframe.onload = function () {
                    iframe.style.visibility = "visible";
                };
            }
            else if (iframe_page.innerHTML()) {
                // get and check the Title (and H tags if you want)
                var ifTitle = iframe_page.contentDocument.title;
                if (ifTitle.indexOf("404") >= 0) {
                    swal("You cannot Preview this Report", "There something wrong!", { icon: "warning" });
                    iframe.src = "";
                }
                else if (ifTitle != "") {
                    swal("You cannot Preview this Report", "There something wrong!", { icon: "warning" });
                    iframe.src = "";
                }
            }
            else {
                iframe.onreadystatechange = function ()
                {
                    if (iframe.readyState == "complete")
                    {
                        iframe.style.visibility = "visible";
                    }
                };
            }
            iframe.src = s.embed_link;
            $('#print_modal').modal({ backdrop: 'static', keyboard: false });
            // *******************************************************
            // *******************************************************

        } else
        {
            swal({ icon: "warning", title: "NO DATA FOUND!" });
        }

    }

})