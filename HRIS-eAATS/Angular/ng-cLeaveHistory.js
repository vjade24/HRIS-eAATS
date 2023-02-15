ng_HRD_App.controller("cLeaveHistory_ctrlr", function ($scope, $compile, $http, $filter) {
    var s = $scope
    var h = $http
    s.rowLen = "10";


    var ddate_from_to = new Date();
    // s.txtb_date_fr = ddate_from_to.getFullYear() + "-01-01";
    s.txtb_date_fr = "2021" + "-01-01";
    s.txtb_date_to = ddate_from_to.getFullYear() + "-12-31";
    s.ddl_rep_mode = "2"
    function init()
    {
        $("#ddl_name").select2().on('change', function (e) {
            s.FilterPageGrid();
        });

        $("#txtb_date_fr").on('change', function (e) {
            s.btn_print_ledger();
        });

        $("#txtb_date_to").on('change', function (e) {
            s.btn_print_ledger();
        });

        $("#ddl_rep_mode").on('change', function (e) {
            s.btn_print_ledger();
        });

        //**********************************************
        // Initialize data during page loads
        //**********************************************
        $('#modal_generating_remittance').modal({ backdrop: 'static', keyboard: false });
        h.post("../cLeaveHistory/InitializeData").then(function (d) {
            if (d.data.message == "success")
            {
                s.empl_names = d.data.empl_names
                
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
                        "mData": "leave_ctrlno",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-center   btn-block'>" + data + "</span>"
                        }
                    },
                    {
                        "mData": "leavetype_descr",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-left   btn-block'>&nbsp;&nbsp;" + full["leavetype_descr"] + " " + full["leavesubtype_descr"] + " </span>"
                        }
                    },
                    {
                        "mData": "leave_dates",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-left   btn-block'>&nbsp;&nbsp;" + data + "</span>"
                        }
                    },
                    {
                        "mData": "action_remarks",
                        "mRender": function (data, type, full, row)
                        {
                            var badge_color = "badge-danger";
                            if (full["Grouped"][parseInt(full["Grouped"].length) - 1]["action_remarks"].toString().trim() == "Carded" ||
                                full["Grouped"][parseInt(full["Grouped"].length) - 1]["action_remarks"].toString().trim() == "Final Approved (Posted)")
                            {
                                badge_color = "badge-primary";
                            }

                            return "&nbsp;&nbsp;<span class='badge " + badge_color + "'>" + full["Grouped"][parseInt(full["Grouped"].length) - 1]["action_remarks"].toString().trim() + "</span>";
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
    //*********************************************//
    //*** Filter Page Grid
    //********************************************// 
    s.FilterPageGrid = function ()
    {
        $('#modal_generating_remittance').modal({ backdrop: 'static', keyboard: false });
        h.post("../cLeaveHistory/FilterPageGrid",
        {
            par_empl_id            : $("#ddl_name option:selected").val()
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
        var table = "";
        for (var i = 0; i < d.Grouped.length; i++)
        {
            table += '<div class="row"><div class="col-lg-3">'  + (i + 1) + '. ' + d.Grouped[i].action_employee_name + '</div><div class="col-lg-3">' + moment(d.Grouped[i].action_dttm).format('MMMM Do YYYY, h:mm:ss A') + '</div><div class="col-lg-6">' + d.Grouped[i].action_remarks + '</div></div>';
        }
        return '<div style="padding:5px 10px 5px 10px !important"><div class="row"><div class="col-lg-3"><h2>Action By</h2></div><div class="col-lg-3"><h2>Action DateTime</h2></div><div class="col-lg-6"><h2>Remarks</h2></div></div>' + table + '</div>';
    }

    //***********************************************************//
    //*** VJA -  2021-06-03 - Button for Print Ledger
    //***********************************************************//
    s.btn_print_ledger = function ()
    {
        var empl_id     = $("#ddl_name option:selected").val();
        var ReportName  = "CrystalReport"
        var SaveName    = "Crystal_Report"
        var ReportType  = "inline"
        var ReportPath  = ""
        var sp          = ""
        var p_date_fr   = $("#txtb_date_fr").val()
        var p_date_to   = $("#txtb_date_to").val()
        var p_rep_mode = $("#ddl_rep_mode option:selected").val();

        s.lbl_report_header = "Print Leave Card";

        sp = "sp_leaveledger_report,p_empl_id," + empl_id + ",p_date_fr," + p_date_fr + ",p_date_to," + p_date_to + ",p_rep_mode," + p_rep_mode;

        if (p_rep_mode == "1" ||
            p_rep_mode == "2" ) {
            ReportPath = "~/Reports/cryLeaveLedger2/cryLeaveLedger.rpt";
        }
        else if (p_rep_mode == "3") {
            ReportPath = "~/Reports/cryCOC/cryCOC.rpt";
        }

        // *******************************************************
        // *** VJA : 2021-07-14 - Validation and Loading hide ****
        // *******************************************************
        $("#modal_generating_remittance").modal({ keyboard: false, backdrop: "static" })
        var iframe = document.getElementById('iframe_print_preview2');
        var iframe_page = $("#iframe_print_preview2")[0];
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
                $("#modal_generating_remittance").modal("hide")
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
            iframe.onreadystatechange = function () {
                if (iframe.readyState == "complete") {
                    iframe.style.visibility = "visible";
                    $("#modal_generating_remittance").modal("hide")
                }
            };
        }

        iframe.src = s.embed_link;
        $('#modal_print_preview').modal({ backdrop: 'static', keyboard: false });
    // *******************************************************
    // *******************************************************


           
    }
})