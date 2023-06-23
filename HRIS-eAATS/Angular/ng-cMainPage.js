
ng_HRD_App.controller("cMainPageCtrlr", function ($scope, $http, $compile, $filter) {
    var s = $scope
    var h = $http
    s.ddl_rep_mode = "1";
    s.info_list2_chart = []
    s.info_list2_donut_chart = [];
    s.datalistgrid_chart = []
    s.row_id_pass = "";
    

    var init = function ()
    {
        $('#ibox1').children('.ibox-content').toggleClass('sk-loading');

        $("#ddl_dept").select2().on('change', function (e) {
            s.FilterPageGrid()
        });
        $("#ddl_rep_mode").select2().on('change', function (e) {
            s.FilterPageGrid()
        });

        get_ledger_info()

    }
    
    init();
    var init_table_data = function (par_data) {
        s.datalistgrid = par_data;
        s.oTable = $('#datalist_grid').dataTable(
            {
                data: s.datalistgrid,
                //bAutoWidth: false,
                //sDom: 'rt<"bottom"ip>',
                order: [[6, 'asc']],
                paging: 10,
                columns: [
                    {
                        "mData": "leave_ctrlno",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-center btn-block'>" + data + "</span>"
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
                        "mData": "leavetype_descr",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-left btn-block'>" + data + "</span>"
                        }
                    },
                    {
                        "mData": "inclusive_dates",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-left btn-block'>" + data + "</span>"
                        }
                    },
                    {
                        "mData": "created_date_only",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-center btn-block'>" + data + "</span>"
                        }
                    },
                    {
                        "mData": null,
                        "mRender": function (data, type, full, row)
                        
                        {
                            if (full["url_name"] == "")
                            {
                                return '<div style="display:none;">' + full["url_name"] +'</div>' + '<center><div class="btn-group">' +
                                    '<button type="button" class="btn btn-danger btn-xs" ng-click="btn_redirect_posting(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Review & Re-Post to Ledger"><i class="fa fa-send"></i> Review & Re-Post to Ledger</button >' +
                                    '</div></center>';
                            }
                            else if (full["url_name"] == "../cCancellation")
                            {
                                return '<div style="display:none;">' + full["url_name"] + '</div>' + '<center><div class="btn-group">' +
                                        '<button type="button" class="btn btn-primary btn-xs"  ng-click="btn_preview_cancellation(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Approve Cancellation"><i class="fa fa-thumbs-up"></i> Approve Cancellation</button >' +
                                        '</div></center>';
                            }
                            else
                            {
                                return '<div style="display:none;">' + full["url_name"] + '</div>' + '<center><div class="btn-group">' +
                                    '<button type="button" class="btn btn-warning btn-xs" ng-click="btn_redirect_posting(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Review & Post to Ledger"><i class="fa fa-send"></i> Review & Post to Ledger</button >' +
                                    '</div></center>';
                            }
                            
                        }
                    }
                ],
                "createdRow": function (row, data, index)
                {
                    $compile(row)($scope);  //add this to compile the DOM
                }
            });
    }
    
    //**************************************//
    //************GET NOTIFICATION*********//
    //**************************************// 
    function get_ledger_info()
    {
        $('#modal_initializing').modal({ backdrop: 'static', keyboard: false });
        h.post("../Menu/GetLedgerInfo",
            {
                par_view_mode           : $("#ddl_rep_mode option:selected").val(),
                par_department_code     : $("#ddl_dept option:selected").val()
            }
            ).then(function (d) {
            {
                s.unposted_leave            = d.data.info_list[0].unposted_leave;
                s.for_approval_ledger       = d.data.info_list[0].for_approval_ledger;
                s.leave_administrator       = d.data.info_list[0].leave_administrator;
                s.canceled_disapproved      = d.data.info_list[0].canceled_disapproved;
                s.lv_admin_dept_list        = d.data.lv_admin_dept_list;

                s.info_list2_chart          = d.data.info_list2_chart;
                s.info_list2_donut_chart    = d.data.info_list2_donut_chart;
                    s.datalistgrid_chart = d.data.info_list2
                //setTimeout(function ()
                //{
                    chart_leave_list();
                //}, 2000);

                if (d.data.info_list2.length > 0)
                {
                    init_table_data(d.data.info_list2);
                }
                else
                {
                    init_table_data([]);
                }

                $("#modal_initializing").modal("hide");
            }
        });
    }

    s.btn_redirect_posting = function (lst) {
        console.log(s.datalistgrid[lst]);
        h.post("../Menu/RedirectParam", {
            par_empl_id             : s.datalistgrid[lst].empl_id
            , par_department_code   : s.datalistgrid[lst].department_code
            , par_employee_name     : s.datalistgrid[lst].employee_name
            , par_leavetype_code    : s.datalistgrid[lst].leave_type_code
            //,  par_view_mode        : $("#ddl_rep_mode option:selected").val()
            ,  par_view_mode        : (s.datalistgrid[lst].leave_type_code.toString().trim() == "CTO" ? "3" : "2")
        }).then(function (d) {
            if (d.data == "success") {
                location.href = "../cLeaveLedger/Index"
            }
        });
    }

    s.search_in_list = function (value, table)
    {
        try
        {
            $("#" + table).DataTable().search($('#ddl_leave_type_dtl option:selected').text()).draw();
        }
        catch (err) {
            alert(err.message)
        }
    }

    s.FilterPageGrid = function ()
    {
        h.post("../Menu/GetLedgerInfo",
            {
                par_view_mode       : $("#ddl_rep_mode option:selected").val(),
                par_department_code : $("#ddl_dept option:selected").val()
            }
        ).then(function (d) {
            if (d.data.message == "success")
            {
                //if (d.data.info_list2.length > 0)
                //{
                //    init_table_data(d.data.info_list2);
                //}
                //else
                //{
                //    init_table_data([]);
                //}
                //init_table_data([]);
                console.log(d.data.info_list2)
                s.oTable.fnClearTable();
                s.datalistgrid = d.data.info_list2;
                if (d.data.info_list2.length > 0)
                {
                    //init_table_data(d.data.info_list2);
                    s.oTable.fnAddData(d.data.info_list2);
                }
            }
        });
    }


    function chart_leave_list()
    {
        // console.log(s.info_list2_chart)
        // console.log(s.info_list2_donut_chart)

        if (s.info_list2_chart.length > 0)
        {
            new Morris.Bar({
                // ID of the element in which to draw the chart.
                element: 'chart-leave-list',
                // Chart data records -- each entry in this array corresponds to a point on
                // the chart.
                data: s.info_list2_chart,
                // The name of the data record attribute that contains x-values.
                // xkey: 'year',
                xkey: 'department_short_name',
                // A list of names of data record attributes that contain y-values.
                // ykeys: ['value'],
                ykeys: ['Count'],
                // Labels for the ykeys -- will be displayed when you hover over the
                // chart.
                labels: ['# of Pending'],
                barColors: ['#f7a54a'],
                xLabelAngle: 25,
                gridTextSize: 8,
                resize: true,
                xLabelMargin: 5
            });

        }
 

        var lv  = 0;
        var cto = 0;

        if (s.info_list2_donut_chart.length > 0)
        {
            for (var i = 0; i < s.info_list2_donut_chart.length; i++)
            {
                if (s.info_list2_donut_chart[i]["leavetype_code"] == "CTO")
                {
                    cto = cto + 1;
                }
                else
                {
                    lv = lv + 1;
                }
            }

            new Morris.Donut({
                element: 'chart-leave-approval-list',
                data: [
                    { label: "Leave Card", value: lv },
                    { label: "CTO Card", value: cto }
                ],
                resize: true
            });
        }


        //console.log(s.datalistgrid_chart)

        //function groupByKey(array, key) {
        //    return array
        //        .reduce((hash, obj) => {
        //            if (obj[key] === undefined) return hash;
        //            return Object.assign(hash, { [obj[key]]: (hash[obj[key]] || []).concat(obj) })
        //        }, {})
        //}
        
        //var result = groupByKey(s.datalistgrid_chart, 'leave_type_code');
        //console.log(result)

        //new Morris.Donut({
        //    element: 'chart-leave-by-leavetype-list',
        //    data: [
        //        { label: "asd", value: 1 }
        //    ],
        //    resize: true
        //});

    }

    s.btn_preview_cancellation = function (row_id)
    {

        h.post("../Menu/CheckIfRunningLeaveApplication",
        {
             p_leave_ctrlno : s.datalistgrid[row_id].leave_ctrlno
            ,p_empl_id      : s.datalistgrid[row_id].empl_id
        }).then(function (d)
        {
            if (d.data.message == "success")
            {
                if (d.data.data.length > 0)
                {
                    var status_descr = "";
                    if (d.data.data[0].approval_status.toString().trim() == "R")
                    {
                        status_descr = "(Reviewed)";
                    }
                    else if (d.data.data[0].approval_status.toString().trim() == "F")
                    {
                        status_descr = "(Final Approved)";
                    }
                    else if (d.data.data[0].approval_status.toString().trim() == "S")
                    {
                        status_descr = "(Submitted)";
                    }
                    
                    swal("This employee has already processed " + status_descr + " Leave Application", "You cannot Proceed!", { icon: "warning" });
                }
                else
                {
                    s.row_id_pass       = "";
                    s.row_id_pass       = row_id;
                    s.returned_remarks  = "";
        
                    var application_nbr = s.datalistgrid[row_id].leave_ctrlno
                    var empl_id         = s.datalistgrid[row_id].empl_id
                    var ReportName      = "CrystalReport"
                    var SaveName        = "Crystal_Report"
                    var ReportType      = "inline"
                    var ReportPath      = ""
                    var sp              = ""

                    ReportPath  = "~/Reports/cryLeavePermission/cryLeaveCancellation.rpt";
                    sp          = "sp_leave_application_cancel_tbl_rep,par_empl_id," + empl_id + ",par_leave_ctrlno," + application_nbr;

                    // *******************************************************
                    // *** VJA : 2021-07-14 - Validation and Loading hide ****
                    // *******************************************************
                    s.employee_name_print = "LEAVE CANCELLATION";
                    $("#loading_data").modal({ keyboard: false, backdrop: "static" })
                    var iframe = document.getElementById('iframe_print_preview');
                    var iframe_page = $("#iframe_print_preview")[0];
                    iframe.style.visibility = "hidden";

                    s.embed_link = "../Reports/CrystalViewer.aspx?Params=" + ""
                        + "&ReportName=" + ReportName
                        + "&SaveName=" + SaveName
                        + "&ReportType=" + ReportType
                        + "&ReportPath=" + ReportPath
                        + "&id=" + sp //+ parameters

                    console.log(iframe)
                    if (!/*@cc_on!@*/0) { //if not IE
                        iframe.onload = function () {
                            iframe.style.visibility = "visible";
                            $("#loading_data").modal("hide")
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
                                $("#loading_data").modal("hide")
                            }
                        };
                    }

                    iframe.src = s.embed_link;
                    $('#modal_print_preview').modal({ backdrop: 'static', keyboard: false });
                    // *******************************************************
                    // *******************************************************

                }
                
            }
            else
            {
                swal("There Something wrong", d.data.message, { icon: "warning" });
            }

        })
    }


    s.btn_approve_cancellation = function ()
    {   
        //var store_date = {
        //                     par_empl_id            : s.datalistgrid[s.row_id_pass].empl_id
        //                    ,par_department_code    : s.datalistgrid[s.row_id_pass].department_code
        //                    ,par_employee_name      : s.datalistgrid[s.row_id_pass].employee_name
        //                    ,par_leavetype_code     : s.datalistgrid[s.row_id_pass].leave_type_code
        //                    ,par_view_mode          : $("#ddl_rep_mode option:selected").val()
        //                  }

        h.post("../Menu/CheckIfPosted",
        {
            p_leave_ctrlno     : s.datalistgrid[s.row_id_pass].leave_ctrlno
            ,p_empl_id         : s.datalistgrid[s.row_id_pass].empl_id
        }
        ).then(function (i)
        {
            if (i.data.message == "success") 
            {
                if (i.data.data.length > 0)
                {
                    $('#details_remarks').val("")
                    $('#modal_posted_leave').modal({ backdrop: 'static', keyboard: false });

                    //swal("This Employee has already Leave Ledger Posted, Do you want to Restore Leave Application Balance?",
                    //{
                    //    buttons: {
                    //        cancel: "Close!",
                    //        restore:
                    //        {
                    //            text    : "Yes, Approved Cancellation and Restore Leave Application Balance",
                    //            restore : "restore",
                    //        }
                    //    },
                    //}).then((value) => {
                    //    switch (value)
                    //    {
                    //        case "restore":
                    //            h.post("../Menu/CancelLederPosted",
                    //            {
                    //                p_leave_ctrlno     : s.datalistgrid[s.row_id_pass].leave_ctrlno
                    //                ,p_empl_id         : s.datalistgrid[s.row_id_pass].empl_id
                    //            }).then(function (d)
                    //            {
                    //                if (d.data.message == "success")
                    //                {
                    //                    s.RetrieveList();
                    //                    $('#modal_print_preview').modal("hide");
                                        
                    //                    swal("Successfully Approved and Restored Leave Application Balance","Do you want to Redirect to Leave Ledger?",
                    //                    {
                    //                        icon: "success",
                    //                        buttons:
                    //                        {
                    //                            cancel  : "No!",
                    //                            catch   :
                    //                            {
                    //                                text    : "Go, Redirect to Leave Ledger",
                    //                                value   : "catch",
                    //                            },
                    //                        },
                    //                    }).then((value) =>
                    //                    {
                    //                        switch (value)
                    //                        { 
                    //                            case "catch":
                    //                                h.post("../Menu/RedirectParam",
                    //                                    {
                    //                                         par_empl_id            : store_date.par_empl_id        
                    //                                        ,par_department_code    : store_date.par_department_code
                    //                                        ,par_employee_name      : store_date.par_employee_name  
                    //                                        ,par_leavetype_code     : store_date.par_leavetype_code 
                    //                                        ,par_view_mode          : store_date.par_view_mode      
                    //                                    }).then(function (d)
                    //                                    {
                    //                                        if (d.data == "success")
                    //                                        {
                    //                                            location.href = "../cLeaveLedger/Index"
                    //                                        }
                    //                                    });
                    //                                break;
                    //                            default:
                    //                                swal("You pressed No!");
                    //                        }
                    //                    });
                    //                }
                    //                else
                    //                {
                    //                    swal("There Something wrong", d.data.message, { icon: "warning" });
                    //                }
                                    
                    //            })

                    //            break;
                    //        default:
                    //            swal("Closed!");
                    //    }
                    //});
                }
                else
                {
                    $('#modal_initializing').modal({ backdrop: 'static', keyboard: false });
                    h.post("../Menu/ApproveCancellation",
                     {
                         p_leave_ctrlno     : s.datalistgrid[s.row_id_pass].leave_ctrlno
                         ,p_empl_id         : s.datalistgrid[s.row_id_pass].empl_id
                     }).then(function (d)
                     {
                         if (d.data.message == "success")
                         {
                             s.RetrieveList();
                             $('#modal_print_preview').modal("hide");
                             swal("Successfully Approved","", { icon: "success" });
                         }
                         else
                         {
                             swal("There Something wrong", d.data.message, { icon: "warning" });
                         }
                         $("#modal_initializing").modal("hide");
                     });
                }
            }
            else
            {
                swal("There Something wrong", i.data.message, { icon: "warning" });
            }
        });
    }


    s.RetrieveList = function ()
    {
        h.post("../Menu/GetLedgerInfo",
            {
                par_view_mode           : $("#ddl_rep_mode option:selected").val(),
                par_department_code     : $("#ddl_dept option:selected").val()
            }
        ).then(function (d) {
            if (d.data.message == "success")
            {
                s.oTable.fnClearTable();
                s.datalistgrid = d.data.info_list2;
                if (d.data.info_list2.length > 0)
                {
                    s.oTable.fnAddData(d.data.info_list2);
                }
            }
        })
    }

    s.btn_return_cancellation = function ()
    {
        $('#modal_initializing').modal({ backdrop: 'static', keyboard: false });
        if ($('#returned_remarks').val().toString().trim() != '') {
            h.post("../Menu/ReturnCancellation",
            {
                p_leave_ctrlno      : s.datalistgrid[s.row_id_pass].leave_ctrlno
                , p_empl_id         : s.datalistgrid[s.row_id_pass].empl_id
                , returned_remarks  : $('#returned_remarks').val().toString().trim()
            }).then(function (d) {
                if (d.data.message == "success") {
                    s.RetrieveList();
                    $('#modal_print_preview').modal("hide");
                    swal("Successfully Retruned", "", { icon: "success" });
                }
                else {
                    swal("There Something wrong", d.data.message, { icon: "warning" });
                }
                $("#modal_initializing").modal("hide");
            });
        } else
        {
            swal("Return Remarks is Required!", { icon: "warning" });
                $("#modal_initializing").modal("hide");
        }
    }


    s.CancelLederPosted = function ()
    {
        if (s.details_remarks == "" || $('#details_remarks').val() == "")
        { 
            swal("Details remarks is required!", {icon:"error"})
            return;
        }
        else
        {
            var store_date = {
                             par_empl_id            : s.datalistgrid[s.row_id_pass].empl_id
                            ,par_department_code    : s.datalistgrid[s.row_id_pass].department_code
                            ,par_employee_name      : s.datalistgrid[s.row_id_pass].employee_name
                            ,par_leavetype_code     : s.datalistgrid[s.row_id_pass].leave_type_code
                            //,par_view_mode          : $("#ddl_rep_mode option:selected").val()
                            ,par_view_mode          : (s.datalistgrid[s.row_id_pass].leave_type_code.toString().trim() == "CTO" ? "3" : "2")
                            }

            h.post("../Menu/CancelLederPosted",
            {
                p_leave_ctrlno       : s.datalistgrid[s.row_id_pass].leave_ctrlno
                ,p_empl_id           : s.datalistgrid[s.row_id_pass].empl_id
                , p_details_remarks  : $('#details_remarks').val()
            }).then(function (d)
            {
                if (d.data.message == "success")
                {
                    s.RetrieveList();
                    $('#modal_print_preview').modal("hide");
                    $('#modal_posted_leave').modal("hide");
                                        
                    swal("Successfully Approved and Restored Leave Application Balance","Do you want to Redirect to Leave Ledger?",
                    {
                        icon: "success",
                        buttons:
                        {
                            cancel  : "No!",
                            catch   :
                            {
                                text    : "Go, Redirect to Leave Ledger",
                                value   : "catch",
                            },
                        },
                    }).then((value) =>
                    {
                        switch (value)
                        { 
                            case "catch":
                                h.post("../Menu/RedirectParam",
                                    {
                                            par_empl_id            : store_date.par_empl_id        
                                        ,par_department_code    : store_date.par_department_code
                                        ,par_employee_name      : store_date.par_employee_name  
                                        ,par_leavetype_code     : store_date.par_leavetype_code 
                                        ,par_view_mode          : store_date.par_view_mode      
                                    }).then(function (d)
                                    {
                                        if (d.data == "success")
                                        {
                                            location.href = "../cLeaveLedger/Index"
                                        }
                                    });
                                break;
                            default:
                                swal("You pressed No!");
                        }
                    });
                }
                else
                {
                    swal("There Something wrong", d.data.message, { icon: "warning" });
                }
                                    
            })

        }
        

    }

    //$(document).ready(function () {
    //    bindDatatable();
    //});

    //function bindDatatable()
    //{
    //    $(function () {
    //        $("#TableStudents").dataTable({
    //            "bServerSide": true, //make server side processing to true
    //            "sAjaxSource": '../Menu/GetData', //url of the Ajax source,i.e. web api method
    //            "sAjaxDataProp": "aaData", // data property of the returned ajax which contains table data
    //            "bProcessing": true,
    //            "bLengthChange": false,
    //            "sPaginationType": "full_numbers",//pagination type
    //            "aoColumns": [

    //                { "mData": "employee_name" }

    //            ]
    //        });
    //    });
    //}

})