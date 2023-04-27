//**********************************************************************************
// PROJECT NAME     :   HRIS - eComval
// VERSION/RELEASE  :   HRIS Release #1
// PURPOSE          :   Code Behind for PHIC Payroll Registry
//**********************************************************************************
// REVISION HISTORY
//**********************************************************************************
// AUTHOR                    DATE            PURPOSE
//----------------------------------------------------------------------------------
// JOSEPH M. TOMBO JR       03/03/2020      Code Creation
//**********************************************************************************


ng_HRD_App.controller("cASTDTRSupport_ctrl", function (commonScript,$scope, $compile, $http, $filter) {
    var s = $scope;
    var h = $http;
    var cs = commonScript
    s.year                  = [];
    s.datalistgrid_data     = [];
    s.employment_type_lst   = "";
    s.rowLen                = "";
    s.ddl_year              = "";
    s.ddl_month             = "";
    s.ddl_group_class       = "";
    s.txtb_template_descr   = "PHIC Share";//Hard coded for now based on the descussion.
    s.template_code         = "996";       //Hard coded for now based on the descussion.
    s.grouplist = [];
    s.ddl_department  = "21"
    s.employment_type = "";
    s.rate_basis = "";
    s.payroll_year  = ""
    s.payroll_month = ""
    s.extract_selected = {}

    var biotype = [
          { bio_type:"0",bio_type_descr: "AM IN" }
        , { bio_type: "2", bio_type_descr: "AM OUT" }
        , { bio_type: "3", bio_type_descr: "PM IN" }
        , { bio_type: "1", bio_type_descr: "PM OUT" }
    ]
    function fn_biotype(data) {
        var dt = biotype.filter(function (d) {
            return d.bio_type == data
        }) 
        return dt[0].bio_type_descr
    }
    function RetrieveYear()
    {
        var currentYear = new Date().getFullYear();
        var prev_year = currentYear - 5;
        for (var i = 1; i <= 8; i++) {
            var data = { "year": prev_year }
            s.year.push(data)
            prev_year++;
        }
    }
    var init_table_data = function (par_data)
    {
        s.datalistgrid = par_data;
        s.oTable = $('#datalist_grid').dataTable(
            {

                data: s.datalistgrid,
                sDom: '',
                pageLength: 100,
                order: [[0, "asc"]],
                columns: [

                    {
                        "mData": "dtr_date",
                        "mRender": function (data, type, full, row) { return "<span class='text-center btn-block'>" + data + "</span>" }
                    },
                    {
                        "mData": "time_in_am",
                        "mRender": function (data, type, full, row) { return "<span class='text-center btn-block'>" + data + "</span>" }
                    },

                    {
                        "mData": "time_out_am",
                        "mRender": function (data, type, full, row) { return "<span class='text-center btn-block'>" + data + "</span>" }
                    },
                    {
                        "mData": "time_in_pm",
                        "mRender": function (data, type, full, row) { return "<span class='text-center btn-block'>" + data + "</span>" }
                    },
                    {
                        "mData": "time_out_pm",
                        "mRender": function (data, type, full, row) { return "<span class='text-center btn-block'>" + data + "</span>" }
                    },
                    {
                        "mData": "dtr_status_descr",
                        "mRender": function (data, type, full, row) { return "<span class='text-left btn-block' >" + data + "</span>"
                        }
                    },
                    {
                        "mData": null,
                        "bSortable": false,
                        "mRender": function (data, type, full, row) {

                            return '<center><div class="btn-group">' +
                                '<button type="button" class="btn btn-info btn-sm" ng-click="btn_edit_action(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Edit Record">  <i class="fa fa-edit"></i></button >' +
                                //'<button type="button" class="btn btn-warning btn-sm" ng-click="btn_edit_biotype(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Change Bio Type">  <i class="fa fa-arrow-right"></i></button >' +
                                //'<button type="button" class="btn btn-danger btn-sm"  ng-click="btn_delete_row(' + row["row"] + ')"  data-toggle="tooltip" data-placement="top" title="Delete"> <i class="fa fa-trash"></i></button>' +
                                '</div></center>';

                        }
                    }

                ],
                "createdRow": function (row, data, index) {
                    $compile(row)($scope);  //add this to compile the DOM
                },
            }
        );

        $("div.toolbar").html('<b>Custom tool bar! Text/images etc.</b>');
        
    }

    var init_extract_data = function (par_data) {
        s.extract_grid_data = par_data;
        s.extractdata_table = $('#extract_data_grid').dataTable(
            {

                data: s.extract_grid_data,
                sDom: '',
                pageLength: 100,
                order: [[0, "asc"]],
                columns: [

                    {
                        "mData": "bio_date",
                        "mRender": function (data, type, full, row) { return "<span class='text-center btn-block'>" + data + "</span>" }
                    },
                    {
                        "mData": "bio_time",
                        "mRender": function (data, type, full, row) { return "<span class='text-center btn-block'>" + data + "</span>" }
                    },
                     {
                         "mData": "bio_terminal",
                        "mRender": function (data, type, full, row) { return "<span class='text-center btn-block'>" + data + "</span>" }
                    },
                    {
                        "mData": "bio_etype",
                        "mRender": function (data, type, full, row) { return "<span class='text-center btn-block'>" + fn_biotype(data) + "</span>" }
                    },
                    {
                        "mData": null,
                        "bSortable": false,
                        "mRender": function (data, type, full, row) {
                            return '<center><div class="btn-group">' +
                                '<button type="button" class="btn btn-info btn-sm" ng-click="btn_change_biotype(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Edit Record">  <i class="fa fa-edit"></i></button >' +
                                //'<button type="button" class="btn btn-danger btn-sm"  ng-click="btn_delete_row(' + row["row"] + ')"  data-toggle="tooltip" data-placement="top" title="Delete"> <i class="fa fa-trash"></i></button>' +
                                '</div></center>';

                        }
                    }

                ],
                "createdRow": function (row, data, index) {
                    $compile(row)($scope);  //add this to compile the DOM
                },
            }
        );

        $("div.toolbar").html('<b>Custom tool bar! Text/images etc.</b>');

    }
    //*********************************************//
    //*** Filter Page Grid
    //********************************************// 
    s.FilterPageGrid = function ()
    {
        $('#loading_msg').html("LOADING");
        $("#modal_loading").modal();
        try
        {
            h.post("../cASTDTRSupport/FilterPageGrid", {
                p_empl_id: $("#ddl_name option:selected").val()
                ,p_year:        s.ddl_year
                , p_month:      s.ddl_month
                
            }).then(function (d)
            {
                if (d.data.message == "success")
                {
                    s.TimeSked_HDR($("#ddl_name option:selected").val());
                    moment(d.data.all_appl.application_date).format('MMMM Do YYYY, h:mm:ss a');
                    s.all_appl = d.data.all_appl;
                    s.trans_lst = d.data.trans_lst
                    s.datalistgrid_data = d.data.data;
                    s.datalistgrid_data.refreshTable1('oTable', '');
                    $("#modal_loading").modal('hide');
                }
                else
                {
                    swal(d.data.message, "", { icon: "warning" });
                }
                
            });
        }
        catch (err) {
            swal({ icon: "warning", title: err.message });
        }
    }


    function init()
    {
        $("#ddl_name").select2().on('change', function (e) {
            s.FilterPageGrid();
        });

        var curr_year   = new Date().getFullYear().toString();
        s.ddl_year      = curr_year
        s.currentMonth  = new Date().getMonth() + 1
        s.ddl_month     = datestring(s.currentMonth.toString())

        RetrieveYear();
        init_table_data([]);
        init_extract_data([])
        $('#loading_msg').html("LOADING");
        $("#modal_loading").modal();
        var trk_year = s.track_year

        $("#ddl_name").val("");
        s.ddl_name = ""

        $("#ddl_dept").val("");
        s.ddl_dept = ""

        $("#ddl_status").val("1");
        s.ddl_status = "1"

        s.ddl_viewtype = "0"
        $("#ddl_viewtype").val("0");

        s.ddl_approve_status = "N"
        $("#ddl_approve_status").val("N")

        h.post("../cASTDTRSupport/InitializePage").then(function (d)
        {
            if (d.data.message == "success") {

                s.TimeSked_HDR(d.data.p_empl_id);
                //s.empl_names        = d.data.empl_names
                s.datalistgrid_data = d.data.data;
                //s.ddl_name = d.data.p_empl_id
                s.all_appl  = d.data.all_appl;
                s.trans_lst = d.data.trans_lst;
                s.dept_list = d.data.dept_list
                s.datalistgrid_data.refreshTable1('oTable', '');
                $("#modal_loading").modal('hide');
            }
            else
            {
                swal(d.data.message, "", { icon: "warning" });
            }
        })
    }

    init()
    
    
    s.search_in_list = function (value, table) {
        $("#" + table).DataTable().search(value).draw();
    }

    s.setNumOfRow = function (value, table) {
        $("#" + table).DataTable().page.len(s.rowLen).draw();
    }


    Array.prototype.refreshTable1 = function (table, id)
    {

        if (this.length == 0) {

            s[table].fnClearTable();
        }
        else {

            s[table].fnClearTable();
            s[table].fnAddData(this);
        }

        var el_id = s[table][0].id
        $("#spinner_load").modal("hide")
    }
    //*********************************************//
    //*** VJA - 02/29/2020 - Button Edit Action
    //*********************************************// 
    s.btn_edit_action = function (lst)
    {
        ClearEntry();
        $('#btn_save').attr('ngx-data', lst);

        s.txtb_employee_name     = s.datalistgrid_data[lst].employee_name;
        s.txtb_dtr_date          = s.datalistgrid_data[lst].dtr_date
        s.txtb_empl_id           = s.datalistgrid_data[lst].empl_id
        // s.txtb_time_in_am        = s.datalistgrid_data[lst].time_in_am
        // s.txtb_time_out_am       = s.datalistgrid_data[lst].time_out_am
        // s.txtb_time_in_pm        = s.datalistgrid_data[lst].time_in_pm
        // s.txtb_time_out_pm       = s.datalistgrid_data[lst].time_out_pm
        s.txtb_time_in_ot        = s.datalistgrid_data[lst].time_in_ot
        s.txtb_time_out_ot       = s.datalistgrid_data[lst].time_out_ot
        s.txtb_dtr_status        = s.datalistgrid_data[lst].dtr_status
        s.txtb_processed_by_user = s.datalistgrid_data[lst].processed_by_user
        s.txtb_processed_dttm    = s.datalistgrid_data[lst].processed_dttm
        s.txtb_dtr_status_descr  = s.datalistgrid_data[lst].dtr_status_descr

        var time_in_am  = s.datalistgrid_data[lst].time_in_am;
        var time_out_am = s.datalistgrid_data[lst].time_out_am;
        var time_in_pm  = s.datalistgrid_data[lst].time_in_pm;
        var time_out_pm = s.datalistgrid_data[lst].time_out_pm;

        $("#txtb_time_in_am").val(moment(time_in_am, "HH:mm").format("hh:mmA").replace("Invalid date", ""));
        $("#txtb_time_out_am").val(moment(time_out_am, "HH:mm").format("hh:mmA").replace("Invalid date", ""));
        $("#txtb_time_in_pm").val(moment(time_in_pm, "HH:mm").format("hh:mmA").replace("Invalid date", ""));
        $("#txtb_time_out_pm").val(moment(time_out_pm, "HH:mm").format("hh:mmA").replace("Invalid date", ""));
        
        s.GetBioExtractDetails();

        s.ModalTitle = "Edit Record";
        $('#main_modal').modal({ keyboard: false, backdrop: "static" });
    }
    //*********************************************//
    //*** VJA - 02/29/2020 - Clear Entry
    //*********************************************// 
    function ClearEntry()
    {
        s.txtb_employee_name     = "";
        s.txtb_dtr_date          = "";
        s.txtb_empl_id           = "";
        //s.txtb_time_in_am        = "";
        //s.txtb_time_out_am       = "";
        //s.txtb_time_in_pm        = "";
        //s.txtb_time_out_pm       = "";
        s.txtb_time_in_ot        = "";
        s.txtb_time_out_ot       = "";
        s.txtb_dtr_status        = "";
        s.txtb_processed_by_user = "";
        s.txtb_processed_dttm    = "";

        $("#txtb_time_in_am").val(moment("", "HH:mm").format("hh:mm A").replace("Invalid date", ""));
        $("#txtb_time_out_am").val(moment("", "HH:mm").format("hh:mm A").replace("Invalid date", ""));
        $("#txtb_time_in_pm").val(moment("", "HH:mm").format("hh:mm A").replace("Invalid date", ""));
        $("#txtb_time_out_pm").val(moment("", "HH:mm").format("hh:mm A").replace("Invalid date", ""));

        
    }
    //***********************************************************//
    //*** VJA - 02/29/2020 - Convert date to String from 1 to 01 if less than 10
    //***********************************************************// 
    function datestring(d) {
        var date_val = ""
        if (d < 10) {
            date_val = '0' + d
        } else {
            date_val = d
        }
        return date_val
    }

    //***********************************************************//
    //*** VJA - 02/29/2020 - Occure when save button is clicked and save/edit data
    //***********************************************************// 
    s.btn_save_click = function ()
    {
        if (ValidateFields())
        {
            var dtr_status  = '';
            var st_in_am    = '?';
            var st_out_am   = '?';
            var st_in_pm    = '?';
            var st_out_pm   = '?';


            if ($('#txtb_time_in_am').val() != '')
            {
                st_in_am = '1';
            }
            
            if ($('#txtb_time_out_am').val() != '')
            {
                st_out_am = '1';
            }
            
            if ($('#txtb_time_in_pm').val() != '')
            {
                st_in_pm = '1';
            }
            
            if ($('#txtb_time_out_pm').val() != '')
            {
                st_out_pm = '1';
            }
            dtr_status = st_in_am + st_out_am + st_in_pm + st_out_pm;
            
            var data =
            {
                dtr_date             : s.txtb_dtr_date
                ,empl_id             : s.txtb_empl_id
                ,time_in_am          : moment($('#txtb_time_in_am').val().trim(),"hh:mm A").format("HH:mm").replace("Invalid date","")
                ,time_out_am         : moment($('#txtb_time_out_am').val().trim(),"hh:mm A").format("HH:mm").replace("Invalid date","")
                ,time_in_pm          : moment($('#txtb_time_in_pm').val().trim(),"hh:mm A").format("HH:mm").replace("Invalid date","")
                ,time_out_pm         : moment($('#txtb_time_out_pm').val().trim(),"hh:mm A").format("HH:mm").replace("Invalid date","")
                ,time_in_ot          : s.txtb_time_in_ot
                ,time_out_ot         : s.txtb_time_out_ot
                ,dtr_status          : dtr_status
                ,processed_by_user   : s.txtb_processed_by_user
                ,processed_dttm      : s.txtb_processed_dttm
            };


            $('#i_save').removeClass('fa-save');
            $('#i_save').addClass('fa-spinner fa-spin');
            h.post("../cASTDTRSupport/SaveUpdateFromDatabase", { data: data }).then(function (d) {
                if (d.data.message == "success")
                {
                   h.post("../cASTDTRSupport/FilterPageGrid", {
                        p_empl_id: s.txtb_empl_id
                        ,p_year : s.ddl_year
                        , p_month: s.ddl_month
                
                    }).then(function (d)
                    {
                        if (d.data.message == "success")
                        {
                            s.datalistgrid_data = d.data.data;
                            s.datalistgrid_data.refreshTable1('oTable', '');
                            swal("Your record has been saved!", "Data successfully saved", { icon: "success", });
                            $("#main_modal").modal('hide');
                        }
                        else
                        {
                            swal(d.data.message, "", { icon: "warning" });
                        }
                
                    });
                }
                else
                {
                    swal(d.data.message, "", { icon: "error", });
                }

                $('#i_save').addClass('fa-save');
                $('#i_save').removeClass('fa-spinner fa-spin');
            });
            
        }

    }
    //***********************************************************//
    //***VJA - 02/29/2020 -  Field validation everytime generation 
    //                          button is click ***//
    //***********************************************************// 
    function ValidateFields() {
        var return_val = true;
        ValidationResultColor("ALL", false);
        
        //if ($('#txtb_wtax_perc').val().trim() == "") {
        //    ValidationResultColor("txtb_wtax_perc", true);
        //    return_val = false;
        //} else if (checkisvalidnumber($('#txtb_wtax_perc').val().trim()) == false) {
        //    $("#txtb_wtax_perc").addClass("required");
        //    $("#lbl_txtb_wtax_perc_req").text("Invalid Number !");
        //    return_val = false;
        //}
        
        return return_val;
    }
    //***********************************************************//
    //***VJA - 02/29/2020 - Field validation everytime generation 
    //                      button is click ***//
    //***********************************************************// 
    function ValidationResultColor(par_object_id, par_v_result) {
        if (par_v_result) {
            //Add class to the obect that need to focus as a required..
            $("#" + par_object_id).addClass("required");
            $("#lbl_" + par_object_id + "_req").text("Required Field");
        }
        else {
            //remove of refresh the object form being required
            $("#txtb_wtax_perc").removeClass("required");
            $("#lbl_txtb_wtax_perc_req").text("");

            $("#txtb_btax_perc").removeClass("required");
            $("#lbl_txtb_btax_perc_req").text("");

            $("#txtb_wtax_2perc").removeClass("required");
            $("#lbl_txtb_wtax_2perc_req").text("");
        }
    }
    //***********************************//
    //***VJA - 2020-04-08 - Remove Function****//
    //***********************************// 
    Array.prototype.remove = function (code, prop) {
        return this.filter(function (d) {
            return d[prop] != code
        })
    }
    //*****************************************//
    //***VJA - 2020-04-08 - Remove Function****//
    //****************************************//
    s.GetBioExtractDetails = function ()
    {
        h.post("../cASTDTRSupport/GetBioExtractDetails",
            {
                par_empl_id     : s.txtb_empl_id,
                par_bio_date     : s.txtb_dtr_date

            }).then(function (d)
        {
            if (d.data.message == "success")
            {
                s.lst_extract = d.data.data;
            }
            else
            {
                swal(d.data.message, "", { icon: "warning" });
            }
        })
    }

    s.btn_collapsed = function (d2)
    {
        h.post("../cASTDTRSupport/GetApplication",
        {
            p_empl_id: $("#ddl_name").val(),
            p_transaction_code: d2.transaction_code

        }).then(function (d) {
            if (d.data.message == "success")
            {
                s.all_appl      = d.data.all_appl;
                s.all_appl_cnt  = d.data.all_appl_cnt
                
                for (var x = 0; x < d.data.all_appl_cnt.length; x++)
                {
                    var completed   = d.data.all_appl_cnt[x].length;
                    var target      = d.data.all_appl.length
                    d.data.all_appl_cnt[x][0].prog_stat_perc = completed / target * 100
                    
                    if (d.data.all_appl_cnt[x][0].rcrd_status == '1') { d.data.all_appl_cnt[x][0].prog_stat_color = 'info' }
                    if (d.data.all_appl_cnt[x][0].rcrd_status == '2') { d.data.all_appl_cnt[x][0].prog_stat_color = 'info' }
                    if (d.data.all_appl_cnt[x][0].rcrd_status == 'C') { d.data.all_appl_cnt[x][0].prog_stat_color = 'danger' }
                    if (d.data.all_appl_cnt[x][0].rcrd_status == 'D') { d.data.all_appl_cnt[x][0].prog_stat_color = 'danger' }
                    if (d.data.all_appl_cnt[x][0].rcrd_status == 'F') { d.data.all_appl_cnt[x][0].prog_stat_color = 'navy' }
                    if (d.data.all_appl_cnt[x][0].rcrd_status == 'L') { d.data.all_appl_cnt[x][0].prog_stat_color = 'danger' }
                    if (d.data.all_appl_cnt[x][0].rcrd_status == 'N') { d.data.all_appl_cnt[x][0].prog_stat_color = 'success' }
                    if (d.data.all_appl_cnt[x][0].rcrd_status == 'R') { d.data.all_appl_cnt[x][0].prog_stat_color = 'info' }
                    if (d.data.all_appl_cnt[x][0].rcrd_status == 'S') { d.data.all_appl_cnt[x][0].prog_stat_color = 'warning' }
                    
                }


                for (var i = 0; i < d.data.all_appl.length; i++)
                {
                    if (d.data.all_appl[i].rcrd_status == '1') { d.data.all_appl[i].stat_color = 'info' }
                    if (d.data.all_appl[i].rcrd_status == '2') { d.data.all_appl[i].stat_color = 'info' }
                    if (d.data.all_appl[i].rcrd_status == 'C') { d.data.all_appl[i].stat_color = 'danger'  }
                    if (d.data.all_appl[i].rcrd_status == 'D') { d.data.all_appl[i].stat_color = 'danger'  }
                    if (d.data.all_appl[i].rcrd_status == 'F') { d.data.all_appl[i].stat_color = 'navy' }
                    if (d.data.all_appl[i].rcrd_status == 'L') { d.data.all_appl[i].stat_color = 'danger'  }
                    if (d.data.all_appl[i].rcrd_status == 'N') { d.data.all_appl[i].stat_color = 'success' }
                    if (d.data.all_appl[i].rcrd_status == 'R') { d.data.all_appl[i].stat_color = 'info'    }
                    if (d.data.all_appl[i].rcrd_status == 'S') { d.data.all_appl[i].stat_color = 'warning' }

                    if (d.data.all_appl[i].rcrd_status == '1') { d.data.all_appl[i].stat_icon = 'fa fa-thumbs-up' }
                    if (d.data.all_appl[i].rcrd_status == '2') { d.data.all_appl[i].stat_icon = 'fa fa-thumbs-up' }
                    if (d.data.all_appl[i].rcrd_status == 'C') { d.data.all_appl[i].stat_icon = 'fa fa-thumbs-down'  }
                    if (d.data.all_appl[i].rcrd_status == 'D') { d.data.all_appl[i].stat_icon = 'fa fa-thumbs-down'  }
                    if (d.data.all_appl[i].rcrd_status == 'F') { d.data.all_appl[i].stat_icon = 'fa fa-thumbs-up' }
                    if (d.data.all_appl[i].rcrd_status == 'L') { d.data.all_appl[i].stat_icon = 'fa fa-thumbs-down'  }
                    if (d.data.all_appl[i].rcrd_status == 'N') { d.data.all_appl[i].stat_icon = 'fa fa-thumbs-up' }
                    if (d.data.all_appl[i].rcrd_status == 'R') { d.data.all_appl[i].stat_icon = 'fa fa-thumbs-up'    }
                    if (d.data.all_appl[i].rcrd_status == 'S') { d.data.all_appl[i].stat_icon = 'fa fa-thumbs-up' }
                    
                }
            }
            else {
                swal(d.data.message, "", { icon: "warning" });
            }
        })
        
    }

    s.appl_data = function (data)
    {
        return data.length
    }



    //***********************************************************//
    //*** VJA -  2021-06-03 - Button for Refresh DTR
    //***********************************************************//
    s.RefreshDTR = function (print_generate)
    {
        //try
        //{
            if (ValidateFields())
            {
                $('#modal_initializing').modal({ backdrop: 'static', keyboard: false });

                //var params_month = "";
                //if (parseFloat(month_name_to_int($("#txtb_dtr_mon_year").val())) < 10)
                //{
                //    params_month = "0" + month_name_to_int($("#txtb_dtr_mon_year").val())
                //}
                //else
                //{
                //    params_month = month_name_to_int($("#txtb_dtr_mon_year").val())
                //}
                
                var par_year            = s.ddl_year
                var par_mons            = s.ddl_month
                var par_empl_id         = $("#ddl_name option:selected").val();
                var par_viewtype        = "0";
                var par_department_code = $("#ddl_dept option:selected").val();
                // var par_user_id         = s.user_id;

                //var employementtype = s.lv_empl_lst_wout_jo.filter(function (d) {
                //    return d.empl_id == par_empl_id
                //})[0].employment_type;
                
                var controller          = "Reports"
                var action              = "Index"
                var ReportName          = "CrystalReport"
                var SaveName            = "Crystal_Report"
                var ReportType          = "inline"
                var ReportPath          = ""
                var sp                  = ""

                h.post("../cASTDTRSupport/sp_generateDTR", {
                    dtr_year: par_year
                    , dtr_month: par_mons
                    , empl_id: par_empl_id
                    
                }).then(function (d) {

                    if (d.data.icon == "success")
                    {
                        ReportPath = "~/Reports/cryDTR/cryDTR.rpt";
                        sp = "sp_dtr_rep,par_year," + par_year +
                            ",par_month," + par_mons +
                            ",par_empl_id," + par_empl_id +
                            ",par_view_type," + par_viewtype +
                            ",par_department_code," + d.data.department_code +
                            ",par_user_id," + d.data.session_user_id;

                        // s.embed_link4 = "../" + controller + "/" + action + "?ReportName=" + ReportName
                        //     + "&SaveName=" + SaveName
                        //     + "&ReportType=" + ReportType
                        //     + "&ReportPath=" + ReportPath
                        //     + "&Sp=" + sp;
                        // $('#iframe_print_preview4').attr('src', s.embed_link4);
                        // $("#modal_initializing").modal("hide");

                        // *******************************************************
                        // *** VJA : 2021-07-14 - Validation and Loading hide ****
                        // *******************************************************
                        $("#modal_initializing").modal({ keyboard: false, backdrop: "static" })
                        var iframe = document.getElementById('iframe_print_preview4');
                        var iframe_page = $("#iframe_print_preview4")[0];
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
                                $("#modal_initializing").modal("hide")
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
                                    $("#modal_initializing").modal("hide")
                                }
                            };
                        }

                        console.log(s.embed_link)
                        iframe.src = s.embed_link;
                    // *******************************************************
                    // *******************************************************
                    }
                    else
                    {
                       swal(d.data.message, {icon : d.data.icon})
                    }
                    
               })


              
            }
        //}
        //catch (err)
        //{
        //    swal({ icon: "warning", title: err.message });
        //}
    }
    s.btn_edit_biotype = function (row) {
        var dt = s.datalistgrid_data[row]
        h.post("../cASTDTRSupport/get_bioextract_empl_data", { empl_id: dt.empl_id, dtr_date: dt.dtr_date }).then(function (d) {
            s.extract_grid_data = d.data.empl_extract_data.refreshTable("extract_data_grid", "");
            $("#extract_data").modal("show")
        })
    }

    s.btn_change_biotype = function (row) {
        s.extract_selected = s.extract_grid_data[row]
        $("#extract_data_dropdown").modal("show")
    }
    s.btn_save_changebiotype = function () {
        var biotype = $("#ddl_bio_type").val()
        h.post("../cASTDTRSupport/change_biotype_empl_data", { bio_type: biotype, empl_data: s.extract_selected }).then(function (d) {
            
            if (d.data.icon == "success") {

                console.log(d.data.empl_extract_data)

                s.datalistgrid = d.data.empl_extract_data.refreshTable("datalist_grid", "");
                swal(d.data.message, { icon: d.data.icon })
                $("#extract_data_dropdown").modal("hide")
                $("#extract_data").modal("hide")
            }
            else {
                swal(d.data.message, { icon: d.data.icon })
                $("#extract_data_dropdown").modal("hide")
                $("#extract_data").modal("hide")
            }

         
        })
    }

    s.rerunDTRprocess = function (lst) {
        cs.loading("show")
        var extracttype = lst.extract_type
        var process_nbr = lst.process_nbr
        var bio_terminal = lst.bio_terminal
        
        h.post("../cASTDTRSupport/rerunDTRprocess", {
              extracttype: extracttype
            , process_nbr: process_nbr
            , bio_terminal: bio_terminal
        }).then(function (d) {
            swal(d.data.message, { icon: d.data.icon })
            cs.loading("hide")
        })
    }

    function validateDate(val) {
        var return_val = false


        var date_regex = /^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$/;
        if (!(date_regex.test(val))) {
            return_val = false;
        }

        else {
            return_val = true;
        }
        return return_val
    }
    

    s.btn_update_status = function () {

        var isvalidate = true;
        var check_remarks = ""
        if (validateDate($("#txtb_date_fr").val()) == false) {
            isvalidate = false
            check_remarks = "Invalid Date!"
        }

        if ($("#txtb_date_fr").val().trim() == "") {
            isvalidate = false
            check_remarks = "Required Field!"
        }

        if ($("#ddl_status").val() != "3") {
            isvalidate = true
            check_remarks = ""
        }

        if (isvalidate == true) {
            h.post("../cASTDTRSupport/UpdateStatus", {
                par_status: $("#ddl_status").val()
                , par_empl_id: $("#ddl_name").val()
                , par_year: $("#ddl_year").val()
                , par_month: $("#ddl_month").val()
                , par_approve_status: $("#ddl_approve_status").val()
                , par_view_status: $("#ddl_viewtype").val()
                , par_effect_date: $("#txtb_date_fr").val()
            }).then(function (d) {

                if (d.data.message == "success") {

                    swal("Your record has been saved!", "Data successfully Update", { icon: "success", });
                }

                else {
                    //if ($("#ddl_status").val() == "1") {
                    swal("No data available data updated", { icon: "warning" });
                    //}
                }

            })
        }

        else {
            if (check_remarks == "Required Field!") {
                swal("Please Provide Effective Date", { icon: "warning" });
            }
            else {
                swal("Invalid Date Format!", { icon: "warning" });
            }
           
        }


    }

    
    //*************************************************//
    //***  VJA : Populate Particulars ****************//
    //***********************************************//
    s.TimeSked_HDR = function (empl_id)
    {
        h.post("../cASTDTRSupport/TimeSked_HDR",
            {
                par_empl_id: empl_id
            }
        ).then(function (d)
        {
            if (d.data.message == "success")
            {
                s.time_sked_hdr = d.data.data;
                for (var i = 0; i < d.data.data.length; i++)
                {
                    if (d.data.data[i].approval_status == "F") {
                        d.data.data[i].color = "success";
                    }
                    else if (d.data.data[i].approval_status == "S") {
                        d.data.data[i].color = "warning";
                    }
                    else if (d.data.data[i].approval_status == "N")
                    {
                        d.data.data[i].color = "primary";
                    }
                    else if (d.data.data[i].approval_status == "D" ||
                        d.data.data[i].approval_status == "C" ||
                        d.data.data[i].approval_status == "L" ) {
                        d.data.data[i].color = "danger";
                    }
                    else
                    {
                        d.data.data[i].color = "info";
                    }
                }
            }
            else
            {
                swal(d.data.message, { icon: "warning" });
            }
        })
    }
    //*************************************************//
    //***  VJA : Populate Particulars ****************//
    //***********************************************//
    s.TimeSked_DTL = function (par_empl_id, par_month, par_year, par_effective_date)
    {
        $('#modal_initializing').modal({ backdrop: 'static', keyboard: false });
        s.time_sked_dtl = [];
        h.post("../cASTDTRSupport/TimeSked_DTL",
        {
            par_empl_id: par_empl_id
            , par_month: par_month
            , par_year: par_year
            , par_effective_date: par_effective_date
        }).then(function (d)
        {
            if (d.data.message == "success")
            {
                s.time_sked_dtl = d.data.data;
                for (var i = 0; i < d.data.data.length; i++)
                {
                    if (d.data.data[i].day_type == "HOL")
                    {
                        d.data.data[i].day_type = "HOL";
                    }
                    else
                    {
                        d.data.data[i].day_type = "";
                    }
                }

                if (d.data.data.length >= 0)
                {
                    s.time_sked_hdr_title = s.month_int_to_name(par_month) + " - " + par_year;
                }
                
                $('#modal_initializing').modal("hide");
            }
            else
            {
                swal(d.data.message, { icon: "warning", });
                $('#modal_initializing').modal("hide");
            }
        })
    }
    
    s.month_int_to_name = function (month_int) {
        var name_mons = "January";

        if (month_int == "01") {
            name_mons = "January";
        }
        else if (month_int == "02") {
            name_mons = "February";
        }
        else if (month_int == "03") {
            name_mons = "March";
        }
        else if (month_int == "04") {
            name_mons = "April";
        }
        else if (month_int == "05") {
            name_mons = "May";
        }
        else if (month_int == "06") {
            name_mons = "June";
        }
        else if (month_int == "07") {
            name_mons = "July";
        }
        else if (month_int == "08") {
            name_mons = "August";
        }
        else if (month_int == "09") {
            name_mons = "September";
        }
        else if (month_int == "10") {
            name_mons = "October";
        }
        else if (month_int == "11") {
            name_mons = "November";
        }
        else if (month_int == "12") {
            name_mons = "December";
        }

        return name_mons;
    }
        
    $(document).ready(function () {
        $("#ddl_name").select2({
            placeholder: "Select a state",
            minimumInputLength: 3,
            ajax: {
                url: "../cASTDTRSupport/Search",
                dataType: 'json',
                data: (params) => {
                    return {
                        term: params.term,
                    }
                },
                processResults: (data, params) =>
                {
                    const results = data.data.map(item =>
                    {
                        return {
                            id: item.empl_id,
                            text: item.empl_id + " - " + item.employee_name ,
                        };
                    });
                    return {
                        results: results,
                    }
                },
            },
        });
    })
        

    
    //*****************************************************************************************************//
    //*****************************************************************************************************//
});