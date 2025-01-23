ng_HRD_App.controller("cForfeitBalance_ctrlr", function ($scope, $compile, $http, $filter) {
    var s = $scope
    var h = $http
    s.year                  = [];
    s.rowLen                = "10";
    s.ddl_dept              = "";
    s.ddl_leavetype_code    = "FL"
    s.leavetype             = [];
    var ddate_from_to       = new Date();
    s.txtb_date_fr          = "2021" + "-01-01";
    s.txtb_date_to          = ddate_from_to.getFullYear() + "-12-31";
    s.ddl_rep_mode          = "2"
    s.empl_id               = ""
    //s.data_checked          = [];

    function init()
    {
        $("#txtb_date_fr").on('change', function (e) {
            s.btn_print_ledger(s.empl_id, "card");
        });
        $("#txtb_date_to").on('change', function (e) {
            s.btn_print_ledger(s.empl_id, "card");
        });
        $("#ddl_rep_mode").on('change', function (e) {
            s.btn_print_ledger(s.empl_id,"card");
        });

        //**********************************************
        // Initialize data during page loads
        //**********************************************
        $('#modal_generating').modal({ backdrop: 'static', keyboard: false });
        h.post("../cForfeitBalance/InitializeData").then(function (d) {
            if (d.data.message == "success")
            {
                var curr_year           = (new Date().getFullYear() - 1).toString();
                s.ddl_year              = curr_year;
                RetrieveYear();
                s.lv_admin_dept_list    = d.data.lv_admin_dept_list
                s.leavetype             = d.data.leavetype

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
                $("#modal_generating").modal("hide");
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
                    //{
                    //    "mRender": function (data, type, full, row)
                    //    {
                    //        return '<center><input type="checkbox" style="transform: scale(1.5);" ng-show=' + (full["ledger_ctrl_no"] != "" ? "false" : "true") +' ng-click="checked_row('+ row["row"] +')" /></center>'
                    //    }
                    //},
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
                        "mData": "fl_used",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-center   btn-block'>" + data + "</span>"
                        }
                    },
                    {
                        "mData": "vl_bal",
                        "mRender": function (data, type, full, row)
                        {
                            return "<span class='text-center   btn-block'>" + data + "</span>"
                        }
                    },
                    {
                        "mData": "forfeited_bal",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-center   btn-block'>" + data + "</span>"
                        }
                    },
                    {
                        "mData": "remarks",
                        "mRender": function (data, type, full, row) {
                            return (data == "" ? "" : "<span class=' badge badge-success'> " + data + "</span>")
                        }
                    },
                    {
                        "mRender": function (data, type, full, row)
                        {
                            return    '<center><div class="btn-group">' 
                                        + '<button type="button"                                                                  class="btn btn-sm btn-primary" ng-click=\'btn_print_ledger("' + full["empl_id"] + '","card")\'> <i class="fa fa-print"></i></button >'
                                        //+ '<button type="button" ng-show=' + (full["ledger_ctrl_no"] != "" ? "false" : "true") +' class="btn btn-sm btn-success" ng-click=\'btn_generate("'+full["empl_id"]+'")\'> <i class="fa fa-qrcode"></i></button >'
                                    + '</div></center>';
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
        if (par_v_result)
        {
            $("#" + par_object_id).addClass("required");
            $("#lbl_" + par_object_id + "_req").text("Required Field -- (Cancel Pending or Disapprove)!");
        }
        else
        {
            $("#txtb_remarks").removeClass("required");
            $("#lbl_txtb_remarks_req").text("");
        }
    }
    
    //*********************************************//
    //*** Filter Page Grid
    //********************************************// 
    s.FilterPageGrid = function ()
    {
        //s.data_checked = [];
        $('#modal_generating').modal({ backdrop: 'static', keyboard: false });
        h.post("../cForfeitBalance/FilterPageGrid", {
            p_leave_year            : s.ddl_year,
            p_department_code       : s.ddl_dept,
            p_leavetype_code        : s.ddl_leavetype_code
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
                $('#modal_generating').modal("hide")
            }
        })
    }

    s.btn_generate = function ()
    {
        if (s.ddl_dept == "")
        {
            swal("REQUIRED FIELDS","Select Department!", { icon: "warning" })
            return;
        }
        if (s.datalistgrid.length <= 0)
        {
            swal("REQUIRED FIELDS", "No data found!", { icon: "warning" })
            return;
        }
        swal("ARE YOU SURE YOU WANT TO GENERATE FORFEITED BALANCE FOR DEPARTMENT " + $('#ddl_dept option:selected').text(), " YEAR " + $('#ddl_year option:selected').text(), {
            icon: "warning",
            closeOnClickOutside: false,
            closeOnEsc: false,
            dangerMode: true,
            buttons: {
                generate_earn: {
                    text : "Forfeit " + $('#ddl_leavetype_code option:selected').text() + " year " + $('#ddl_year option:selected').text(),
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
                    //$('#modal_generating').modal({ backdrop: 'static', keyboard: false });
                    let trimmedData = s.datalistgrid.map(item => ({
                         empl_id                : item.empl_id              
                        ,employee_name          : item.employee_name        
                        ,department_code        : item.department_code      
                        ,department_short_name  : item.department_short_name   
                        ,fl_used                : item.fl_used              
                        ,vl_used                : item.vl_used              
                        ,vl_bal                 : item.vl_bal               
                        ,cto_used               : item.cto_used             
                        ,cto_bal                : item.cto_bal              
                        ,forfeited_bal          : item.forfeited_bal     
                    }));
                    h.post("../cForfeitBalance/GeneateForfeit",
                        {
                            //data               : s.data_checked
                            data               : trimmedData
                           ,forfeited_year     : $('#ddl_year option:selected').text()
                           ,leavetype_code     : s.ddl_leavetype_code
                        }).then(function (d) {
                            if (d.data.message == "success")
                            {
                                if (d.data.return_flag == "Y")
                                {
                                    swal("Successfully Generated", d.data.return_msg, { icon: "success" });
                                    //$('#modal_generating').modal("hide")
                                }
                                else
                                {
                                    swal("No data Inserted on Monthly earnings", d.data.return_msg, { icon: "warning" });
                                    //$('#modal_generating').modal("hide")
                                }
                                s.FilterPageGrid();
                            }
                            else
                            {
                                swal("There something wrong!", d.data.message, { icon: "warning" });
                                s.FilterPageGrid();
                            }
                        })
                    //$('#modal_generating').modal("hide")
                    break;

                default:
                swal("Cancel Request!");
            }
        });
    }
    s.btn_print_ledger = function (empl_id, report_type)
    {
       
        var ReportName  = "CrystalReport"
        var SaveName    = "Crystal_Report"
        var ReportType  = "inline"
        var ReportPath  = ""
        var sp          = ""
        var p_date_fr   = $("#txtb_date_fr").val()
        var p_date_to   = $("#txtb_date_to").val()
        var p_rep_mode = $("#ddl_rep_mode option:selected").val();
        s.empl_id       = ""
        s.empl_id       = empl_id
        s.lbl_report_header = "Print Leave Card";

        if (report_type == "card")
        {
            s.show_card = true
            sp = "sp_leaveledger_report,p_empl_id," + empl_id + ",p_date_fr," + p_date_fr + ",p_date_to," + p_date_to + ",p_rep_mode," + p_rep_mode;

            if (p_rep_mode == "1" ||
                p_rep_mode == "2" ) {
                ReportPath = "~/Reports/cryLeaveLedger/cryLeaveLedger.rpt";
            }
            else if (p_rep_mode == "3") {
                ReportPath = "~/Reports/cryCOC/cryCOC.rpt";
            }
        } else
        {
            s.show_card = false
            sp = "sp_lv_ledger_forfeitbal_tbl_rep,p_leave_year," + s.ddl_year + ",p_leavetype_code," + s.ddl_leavetype_code;
            ReportPath = "~/Reports/cryForfeited/cryForfeited.rpt";
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

    //s.checked_row = function (row)
    //{
    //    if (s.datalistgrid[row].ledger_ctrl_no == "")
    //    {
    //        s.data_checked.push(s.datalistgrid[row])
    //    }
    //}
})