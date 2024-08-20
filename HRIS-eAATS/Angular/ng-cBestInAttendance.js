ng_HRD_App.controller("cBestInAttendance_ctrlr", function ($scope, $compile, $http, $filter)
{
    var s       = $scope;
    var h       = $http;
    s.rowLen    = "10";
    
    s.image_link        = "http://192.168.5.218/storage/images/photo/thumb/";
    s.dtl               = []
    s.action_mode       = "";
    s.loading_div       = false;
    init()
    function init()
    {
        if (window.location.host == "hris.dvodeoro.ph")
        {
            s.image_link = "http://122.53.120.18:8050/storage/images/photo/thumb/"
        }
        $("#period_from").on('change', function ()
        {
            period_covered()
        });
        $("#period_to").on('change', function ()
        {
            period_covered()
        });
        $('#modal_generating').modal({ backdrop: 'static', keyboard: false });
        h.post("../cBestInAttendance/InitializeData").then(function (d)
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
    function period_covered()
    {
        s.form.period_covered = "";
        s.form.period_covered = moment(s.form.period_from).format('LL') + " - " + moment(s.form.period_to).format('LL')
    }
    s.FilterGrid = function ()
    {
        $('#modal_generating').modal({ backdrop: 'static', keyboard: false });
        h.post("../cBestInAttendance/FilterGrid", { date_from: s.date_from, date_to: s.date_to}).then(function (d)
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
                        //{
                        //    "mData": null,
                        //    "mRender": function (data, type, full, row) {
                        //        return "<center><span class='details-control' style='display:block;' ></center>"
                        //    }
                        //},
                        {
                            "mData": "transmittal_nbr",
                            "mRender": function (data, type, full, row) {
                                return "<span class='text-center btn-block'>" + full.hdr["transmittal_nbr"] + "</span>"
                            }
                        },
                        {
                            "mRender": function (data, type, full, row)
                            {
                                var def_images  = '../../ResourcesImages/upload_profile.png';
                                var img         = "";
                                var limit       = 5;
                                var div_count   = "";
                                if (full.dtl[0] != null)
                                {
                                    if (full.dtl.length>0)
                                    {
                                        var temp        = moment();
                                        for (var i = 0; i < full.dtl.length && i < limit; i++)
                                        {
                                           img += '<img class="img-circle m-r-n-sm" onerror="this.onerror=null;this.src=\'' + def_images + '\';" width="35" height="35" src="' + s.image_link + full.dtl[i]["empl_id"] + '?v=' + temp + ' " />' 
                                        }
                                        if (full.dtl.length > limit)
                                        {
                                            div_count = '<div class="rounded-box" >' + (full.dtl.length - limit) + '<sup>+</sup></div>';
                                        }
                                    }
                                }
                                return "&nbsp;&nbsp;&nbsp;&nbsp;" + img + div_count;
                            }
                        },
                        {
                            "mData": "period_from",
                            "mRender": function (data, type, full, row) {
                                return "<span class=' btn-block text-center'>" + moment(full.hdr["period_from"]).format("LL") + " - " + moment(full.hdr["period_to"]).format("LL") + "</span>"
                            }
                        },
                        {
                            "mData": "submitted_dttm",
                            "mRender": function (data, type, full, row) {
                                return "<center>" +(full.hdr["submitted_dttm"] == null ? "--" : "<span class=' btn-block'>" + moment(full.hdr["submitted_dttm"]).format("LLL") + "</span>") + "</center>"
                            }
                        },
                        {
                            "mData": "received_dttm",
                            "mRender": function (data, type, full, row) {
                                return "<center>"+(full.hdr["received_dttm"] == null ? "--" : "<span class=' btn-block'>" + moment(full.hdr["received_dttm"]).format("LLL") + "</span>")+"</center>"
                            }
                        },
                        {
                            "mData": "transmittal_nbr",
                            "mRender": function (data, type, full, row)
                            {
                                var status = "";
                                var color  = "";
                                if (full.hdr["submitted_dttm"] == null)
                                {
                                    status = "NOT TRANSMITTED";
                                    color  = "badge-danger";
                                }
                                else if (full.hdr["submitted_dttm"] != null && full.hdr["received_dttm"] != null)
                                {
                                    status = "RECEIVED";
                                    color  = "badge-success";
                                }
                                else
                                {
                                    status = "TRANSMITTED";
                                    color  = "badge-primary";
                                }
                                return "<span class='text-center btn-block'> <small class='badge " + color+" m-t-xs'>" + status + "</small></span>"
                            }
                        },
                        {
                            "mData": null,
                            "mRender": function (data, type, full, row)
                            {
                                return  '<center><div class="btn-group">' +
                                            (full.hdr["submitted_dttm"] != null ? '' : '<button type="button" class="btn btn-warning" ng-click="btn_view(' + row["row"] + ')"   data-toggle="tooltip" data-placement="top" title="View"><i class="fa fa-eye"></i>   </button >') +
                                            (full.hdr["submitted_dttm"] != null ? '' :'<button type="button" class="btn btn-danger"  ng-click="btn_action_header(\'delete\','+ row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Delete"><i class="fa fa-trash"></i> </button >') +
                                            '<button type="button" class="btn btn-primary" ng-click="btn_print(\''+full.hdr['transmittal_nbr']+'\')" data-toggle="tooltip" data-placement="top" title="Print"><i class="fa fa-print"></i> </button >' +
                                            (full.hdr["submitted_dttm"] != null ? '' :'<button type="button" class="btn btn-success" ng-click="btn_action_header(\'transmit\','+ row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Transmit"><i class="fa fa-truck"></i> </button >') +
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
    s.btn_print = function (par_transmittal_nbr)
    {
        var par_transmittal_nbr = par_transmittal_nbr
        var print_mode          = "BEST";
        var iframe_id           = "iframe_print_preview";
        s.PrintPreview(par_transmittal_nbr, print_mode, iframe_id,"","");
    }
    s.PrintPreview = function (par_transmittal_nbr, print_mode, iframe_id, par_period_from, par_period_to)
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

            if (print_mode == 'BEST')
            {
                sp          = "sp_best_in_attendance_rep,par_transmittal_nbr," + par_transmittal_nbr;
                ReportPath  = "~/Reports/cryBestAttendance/BestAttendanceTransmittal.rpt";
            }
            //else
            //{
            //    sp          = "sp_lwop_list,par_period_from," + par_period_from + ",par_period_to," + par_period_to;
            //    ReportPath = "~/Reports/cryLWOP_HR/cryLWOP_HR.rpt";
            //}
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

        

    }

    $('#datalist_grid tbody').on('click', 'span.details-control', function ()
    {
        var tr  = $(this).closest('tr');
        var row = $('#datalist_grid').DataTable().row(tr);
        s.rowIndex
        if (row.child.isShown())
        {
            row.child.hide();
            tr.removeClass('shown');
            return;
        }
        //console.log(row.data())
        //h.post("../cLeaveLedger/Retrieve_LeaveHistory",
        //    {
        //        leave_ctrlno: row.data().leave_ctrlno
        //        , empl_id: row.data().empl_id
        //    }).then(function (d) {
        //        if (d.data.message == "success") {
        //            row.child(format(d.data.data)).show();
        //            tr.addClass('shown');
        //        }
        //    });
    });

    function clearentry()
    {
        var date                 = new Date();
        s.dtl                    = [];
        s.form.id                = "";
        s.form.transmittal_nbr   = "";
        s.form.period_from       = new Date(date.getFullYear()-1, 6, 1);
        s.form.period_to         = new Date(date.getFullYear(), 6, 0);
        s.form.prepared_by       = "";
        s.form.prepared_by_desig = "";
        s.form.noted_by          = "";
        s.form.noted_by_desig    = "";
        s.form.approved_by       = "";
        s.form.approved_by_desig = "";
        s.form.submitted_by      = "";
        s.form.submitted_dttm    = "";
        s.form.received_by       = "";
        s.form.received_dttm     = "";
        s.form.created_by        = "";
        s.form.created_dttm      = "";
        s.form.updated_by        = "";
        s.form.updated_dttm      = "";
    }
    s.btn_add = function ()
    {
        s.action_mode = "add";
        clearentry()
        $('#modal_generating').modal({ backdrop: 'static', keyboard: false });
        h.post("../cBestInAttendance/AddMode").then(function (d)
        {
            if (d.data.message == "success")
            {
                s.form.transmittal_nbr   = d.data.nbr.key_value;
                s.form.prepared_by       = d.data.prepared.employee_name;
                s.form.prepared_by_desig = d.data.prepared.position_long_title;
                s.form.noted_by          = d.data.noted.employee_name;
                s.form.noted_by_desig    = d.data.noted.position_long_title;
                s.form.approved_by       = d.data.approved.employee_name;
                s.form.approved_by_desig = d.data.approved.position_long_title;
                period_covered()
                $('#main_modal').modal({ backdrop: 'static', keyboard: false });
                $('#modal_generating').modal("hide");
            }
            else
            {
                swal({ icon: "warning", title: d.data.message });
                $('#modal_generating').modal("hide");
            }
        })

    }
    s.btn_view = function (row_id)
    {
        clearentry();
        s.action_mode               = "update";
        s.dtl                       = [];
        s.dtl                       = s.datalistgrid[row_id].dtl
        s.form.id                   = s.datalistgrid[row_id].hdr.id
        s.form.transmittal_nbr      = s.datalistgrid[row_id].hdr.transmittal_nbr
        s.form.period_from          = new Date(moment(s.datalistgrid[row_id].hdr.period_from))      
        s.form.period_to            = new Date(moment(s.datalistgrid[row_id].hdr.period_to))     
        s.form.prepared_by          = s.datalistgrid[row_id].hdr.prepared_by      
        s.form.prepared_by_desig    = s.datalistgrid[row_id].hdr.prepared_by_desig
        s.form.noted_by             = s.datalistgrid[row_id].hdr.noted_by         
        s.form.noted_by_desig       = s.datalistgrid[row_id].hdr.noted_by_desig   
        s.form.approved_by          = s.datalistgrid[row_id].hdr.approved_by      
        s.form.approved_by_desig    = s.datalistgrid[row_id].hdr.approved_by_desig
        s.form.submitted_by         = s.datalistgrid[row_id].hdr.submitted_by     
        s.form.submitted_dttm       = new Date(moment(s.datalistgrid[row_id].hdr.submitted_dttm))   
        s.form.received_by          = s.datalistgrid[row_id].hdr.received_by      
        s.form.received_dttm        = new Date(moment(s.datalistgrid[row_id].hdr.received_dttm))   
        s.form.created_by           = s.datalistgrid[row_id].hdr.created_by       
        s.form.created_dttm         = new Date(moment(s.datalistgrid[row_id].hdr.created_dttm))    
        s.form.updated_by           = s.datalistgrid[row_id].hdr.updated_by       
        s.form.updated_dttm         = new Date(moment(s.datalistgrid[row_id].hdr.updated_dttm))     
        period_covered()
        $('#main_modal').modal({ backdrop: 'static', keyboard: false });
    }
    s.btn_generate = function (form)
    {
        s.loading_div = true;
        $('#modal_generating').modal({ backdrop: 'static', keyboard: false });
        if (s.form.period_from == "" && s.form.period_to == "")
        {
            swal({ icon: "warning", title: "Please Input Period covered!" });
            $('#modal_generating').modal("hide");
            s.loading_div = false;
        }
        else
        {
            h.post("../cBestInAttendance/Generate", {data:form}).then(function (d)
            {
                if (d.data.message == "success")
                {
                    swal({ icon: "success", title: "Successfully Generated!"});
                    s.loading_div = false;
                    s.action_mode = "update";
                    s.dtl         = d.data.dtl
                    h.post("../cBestInAttendance/FilterGrid").then(function (d) {
                        if (d.data.message == "success") {
                            s.oTable.fnClearTable();
                            s.datalistgrid = d.data.data;
                            if (d.data.data.length > 0) {
                                s.oTable.fnAddData(d.data.data);
                            }
                            $('#modal_generating').modal("hide");
                        }
                        else {
                            swal(d.data.message, { icon: "error", });
                            $('#modal_generating').modal("hide");
                        }
                    })
                }
                else
                {
                    swal({ icon: "error", title: d.data.message });
                    $('#modal_generating').modal("hide");
                    s.loading_div = false;
                }
            })
        }
    } 
    s.btn_action_header = function (action, data)
    {
        if (action == "delete" || action == "transmit" )
        {
            var data1 = {
                     id              : s.datalistgrid[data].hdr.id
                    ,transmittal_nbr : s.datalistgrid[data].hdr.transmittal_nbr
                }
            swal({
                title       : "Are you sure to "+action+" this record?",
                text        : "Once "+action+", you will not be able to recover this record!",
                icon        : "warning",
                buttons     : true,
            }).then(function (willContinue)
            {
                if (willContinue)
                {
                    $('#modal_generating').modal({ backdrop: 'static', keyboard: false });
                    h.post("../cBestInAttendance/HeaderAcion",
                    {
                        action  : action
                        ,data   : data1
                    }).then(function (d) 
                    {
                        if (d.data.message == "success")
                        {
                            swal("Your record has been " + action + "!", { icon: "success", });
                            h.post("../cBestInAttendance/FilterGrid").then(function (d) {
                                if (d.data.message == "success") {
                                    s.oTable.fnClearTable();
                                    s.datalistgrid = d.data.data;
                                    if (d.data.data.length > 0) {
                                        s.oTable.fnAddData(d.data.data);
                                    }
                                    $('#main_modal').modal("hide");
                                    $('#modal_generating').modal("hide");
                                }
                                else {
                                    swal(d.data.message, { icon: "error", });
                                    $('#main_modal').modal("hide");
                                    $('#modal_generating').modal("hide");
                                }
                            })
                        }
                        else
                        {
                            swal(d.data.message, { icon: "warning", });
                            $('#main_modal').modal("hide");
                            $('#modal_generating').modal("hide");
                        }
                    })
                }
            });
        }
        else
        {
            $('#modal_generating').modal({ backdrop: 'static', keyboard: false });
            h.post("../cBestInAttendance/HeaderAcion",
            {
                action  : action
                ,data   : s.form
            }).then(function (d) 
            {
                if (d.data.message == "success")
                {
                    s.btn_print(s.form.transmittal_nbr)
                    $('#modal_generating').modal("hide");
                }
                else
                {
                    swal(d.data.message, { icon: "warning", });
                    $('#modal_generating').modal("hide");
                }
            })
        }
    }
    s.btn_action_dtl = function (action, data,row_id)
    {
        swal({
            title       : "Are you sure to "+action+" this record?" + " \n " + data.employee_name,
            text        : "Once "+action+", you will not be able to recover this record!",
            icon        : "warning",
            buttons     : true,
        }).then(function (willContinue)
        {
            data.transmittal_nbr = s.form.transmittal_nbr
            if (willContinue)
            {
                h.post("../cBestInAttendance/DetailAction",
                {
                    action  : action
                    ,data   : data
                }).then(function (d) 
                {
                    if (d.data.message == "success")
                    {
                        if (action == "delete")
                        {
                            if (row_id != -1)
                            {
                                s.dtl.splice(row_id, 1);
                            }
                        }
                        swal("Your record has been "+action+"!", { icon: "success", });
                    }
                    else
                    {
                        swal(d.data.message, { icon: "warning", });
                    }
                })
            }
        });
    }
    s.FilterGrid = function ()
    {
        $('#modal_generating').modal({ backdrop: 'static', keyboard: false });
        h.post("../cBestInAttendance/FilterGrid").then(function (d)
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
})