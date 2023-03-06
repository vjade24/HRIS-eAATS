
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
                                return '<div style="visibility:hidden;">' + full["url_name"] +'</div>' + '<center><div class="btn-group">' +
                                    '<button type="button" class="btn btn-danger btn-xs" ng-click="btn_redirect_posting(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Re-Post Leave Application"><i class="fa fa-send"></i> Re-Post Application</button >' +
                                    '</div></center>';
                            }
                            else if (full["url_name"] == "../cCancellation")
                            {
                                return '<div style="visibility:hidden;">' + full["url_name"] + '</div>' + '<center><div class="btn-group">' +
                                        '<button type="button" class="btn btn-primary btn-xs"  ng-click="btn_preview_cancellation(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Approve Cancellation"><i class="fa fa-thumbs-up"></i> Approve Cancellation</button >' +
                                        '</div></center>';
                            }
                            else
                            {
                                return '<div style="visibility:hidden;">' + full["url_name"] + '</div>' + '<center><div class="btn-group">' +
                                    '<button type="button" class="btn btn-warning btn-xs" ng-click="btn_redirect_posting(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Post Leave Application"><i class="fa fa-send"></i> Post Application</button >' +
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
            , par_employee_name: s.datalistgrid[lst].employee_name
            , par_leavetype_code   : s.datalistgrid[lst].leavetype_code
            ,  par_view_mode       : $("#ddl_rep_mode option:selected").val()
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
 

        var lv  = 0;
        var cto = 0;

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
        
        s.row_id_pass = "";
        s.row_id_pass = row_id;
        
        var application_nbr = s.datalistgrid[row_id].leave_ctrlno
        var empl_id = s.datalistgrid[row_id].empl_id
        var ReportName = "CrystalReport"
        var SaveName = "Crystal_Report"
        var ReportType = "inline"
        var ReportPath = ""
        var sp = ""

        ReportPath = "~/Reports/cryLeavePermission/cryLeaveCancellation.rpt";
        sp = "sp_leave_application_cancel_tbl_rep,par_empl_id," + empl_id + ",par_leave_ctrlno," + application_nbr;

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


    s.btn_approve_cancellation = function ()
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
                , returned_remakrs  : $('#returned_remarks').val().toString().trim()
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

})