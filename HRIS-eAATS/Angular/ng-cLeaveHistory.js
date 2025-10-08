ng_HRD_App.controller("cLeaveHistory_ctrlr", function (commonScript,$scope, $compile, $http, $filter) {
    var s = $scope
    var h = $http
    var cs = commonScript
    s.rowLen = "10";
    s.log_empl_id = "";


    var ddate_from_to = new Date();
    // s.txtb_date_fr = ddate_from_to.getFullYear() + "-01-01";
    s.txtb_date_fr = "2021" + "-01-01";
    s.txtb_date_to = ddate_from_to.getFullYear() + "-12-31";
    s.ddl_rep_mode = "2"
    s.image_link = cs.img_link('local')+"/storage/images/photo/thumb/";
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
                //s.empl_names = d.data.empl_names
                
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
                d.data.um.allow_edit    == "1" ? s.ShowEdit = true : s.ShowEdit = false;
                s.log_empl_id = d.data.log_empl_id
                console.log(d.data.log_empl_id)
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
                            return "<span class='text-left   btn-block'>&nbsp;&nbsp;" + full["leavetype_descr"] + " " + (full["leavesubtype_descr"] == "" ? "" : "(" + full["leavesubtype_descr"]+ ")") + " </span>"
                        }
                    },
                    {
                        "mData": "leave_dates",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-left   btn-block'>&nbsp;&nbsp;" + data + "</span>"
                        }
                    },
                    {
                        "mData": "appl_status",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-left   btn-block'>&nbsp;&nbsp;" + data + " </span>"
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
        //var tr = $(this).closest('tr');
        //var row = $('#datalist_grid').DataTable().row(tr);
        //if (row.child.isShown()) {
        //    row.child.hide();
        //    tr.removeClass('shown');
        //}
        //else {
        //    row.child(format(row.data())).show();
        //    tr.addClass('shown');
        //}
        var tr = $(this).closest('tr');
        var row = $('#datalist_grid').DataTable().row(tr);
        s.rowIndex
        if (row.child.isShown()) {
            row.child.hide();
            tr.removeClass('shown');
            return;
        }
        h.post("../cLeaveLedger/Retrieve_LeaveHistory",
        {
            leave_ctrlno: row.data().leave_ctrlno
            , empl_id: row.data().empl_id
        }).then(function (d) {
            if (d.data.message == "success")
            {
                row.child(format(d.data.data)).show();
                tr.addClass('shown');
            }
        });

    });
    //NEW UPDATE BY: JORGE RUSTOM VILLANUEVA 2020-09-18
    /* Formatting function for row details - modify as you need */
    function format(d)
    {
        s.data_history = [];
        var to_append = "";
        s.data_history = d
        for (var i = 0; i < s.data_history.length; i++)
        {
            s.data_history[i].create_dttm_descr = moment(s.data_history[i].created_dttm).format("LLLL")
            s.data_history[i].create_dttm_ago   = moment(s.data_history[i].created_dttm).fromNow()
            var temp_append = "";
            var temp = moment();
            temp_append = '<div class="feed-element">' +
                                '<div class="pull-left">' +
                                        '<div class="img-circle">' +
                                        '<img class="img-circle"  alt="image" width="30" height="30" src="' + (s.data_history[i].empl_photo_img == "" ? "../ResourcesImages/upload_profile.png" : s.image_link + s.data_history[i].created_by.replace("U", "") + '?v=' + temp) + ' " />' +
                                        '</div>' +
                                    '</div>' +
                                    '<div class="media-body ">' +
                                    '<small class="pull-right" style="padding-left:10px !important">' + s.data_history[i].create_dttm_ago + '</small>' +
                                    s.data_history[i].appl_status + ' by <strong>' + s.data_history[i].employee_name_format_2 + '</strong>' +
                                    '<small class="text-muted">on ' + s.data_history[i].create_dttm_descr + '</small>' +
                                '</div>' +
                            '</div><hr style="margin-top: 0px;margin-bottom: 0px;"/>';

            to_append = to_append + temp_append;
        }
        to_append = "<div class='col-lg-3'></div><div class='col-lg-6 m-t-sm'>" + to_append + "</div><div class='col-lg-3'></div>"
        return $compile(to_append)($scope);
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
            ReportPath = "~/Reports/cryLeaveLedger/cryLeaveLedger.rpt";
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
    function formatState(state) {

        if (!state.id) {
            return state.text;
        }
        var baseUrl = (state.empl_photo == "" ? "../ResourcesImages/upload_profile.png" : s.image_link + state.id) ;
        var $state = $(
            '<span><img alt="image" class="img-circle" width="50" height="50" src="' + baseUrl + '" class="img-flag" /> ' + state.text + '</span>'
        );
        return $state;
    };
    $(document).ready(function ()
    {
        $("#ddl_name").select2({
            templateResult: formatState,
            minimumInputLength: 3,
            placeholder: "Select Employee",
            allowClear: true,
            ajax: {
                url: "../cASTDTRSupport/Search",
                dataType: 'json',
                data: (params) => {
                    return {
                        term: params.term,
                    }
                },
                processResults: (data, params) => {
                    const results = data.data.map(item => {
                        return {
                            id: item.empl_id,
                            text: item.empl_id + " - " + item.employee_name,
                            empl_photo: item.empl_photo,
                        };
                    });
                    return {
                        results: results,
                    }
                },
            },
        });
    })   
})