ng_HRD_App.controller("cStepIncrement_ctrlr", function ($scope, $compile, $http, $filter) {
    var s                           = $scope;
    var h                           = $http;
    var year_span                   = [];
    var myBarChart                  = null;
    s.txtb_from                     = new Date();
    s.txtb_to = new Date();
    s.txtb_to.setFullYear(s.txtb_to.getFullYear() + 8);


    s.table_header                  = [];
    s.employee_steps_record         = [];
    s.employee_pagenated_record     = [];
    $scope.moment                   = moment;
    s.departments                   = [];
    s.compile                       = $compile;
    s.image_link                    = "http://192.168.5.218/storage/images/photo/thumb/";
    s.ddl_name = "";
    // Pagination variables
    $scope.currentPage  = 0;
    s.pageSize          = '10'; // items per page
    var vPageSize = 0;
    // Sample data
    $scope.data = [];
    s.statData = [];
    for (var i = 1; i <= 100; i++) {
        $scope.data.push('Item ' + i);
    }

   
    s.results_to_generate   = 0;
    s.viewRecord            = [];
    s.lwoplist              = [];
    s.viewRecorddtl         = [];
    s.viewStatsData         = [];
    s.months                = {};
    s.list_to_step          = [];
    s.list_generated        = [];

    s.filteredList = [];

    $.fn.modal.Constructor.prototype.enforceFocus = function () {

    }

    var init_table_data = function (par_data) {

        s.datalistgrid = par_data;
        s.oTable = $('#datalist_grid').dataTable(
            {
                data: s.list_to_step,
                sDom: '<"top"<"chartFilters">f>rt<"bottom"ip>',
                bAutoWidth: false,
                pageLength: 10,
                columns: [
                    { "mData": "empl_id", "bSortable": false, "mRender": function (data, type, full, row) { return "<span class='text-center btn-block'>" + data + "</span>" } },
                    { "mData": "employee_name", "bSortable": false, "mRender": function (data, type, full, row) { return "<span class='text-left btn-block'>" + data + "</span>" } },
                    {
                        "mData": "position_title",
                        "bSortable": false,
                        "mRender": function (data, type, full, row) {
                            return  data;
                        }
                    },
                    {
                        "mData": null,
                        "bSortable": false,
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-center btn-block'>" + moment(full["rekoning_date"]).format("YYYY-MM-DD") + " | " + (full["generated_step"].toString() == "0" ? s.getSteps(moment(s.txtb_from).format("YYYY"), full).slice(-1).replace('X','8') : full["generated_step"].toString())  +"</span>";
                        }
                    },
                    {
                        "mData": null,
                        "bSortable": false,
                        "mRender": function (data, type, full, row)
                        {
                            var disable_print = full["already_have_rep"].toString() == "" ? true:false; 
                            return '<center><div class="btn-group">' +
                                '<button type="button" ng-disabled="!' + disable_print + '" class="btn btn-success btn-sm"       ng-click="btn_generate_NOSI(\'' + full["empl_id"] + '\')" data-toggle="tooltip" data-placement="top" title="Edit">  <i class="fa fa-refresh"></i></button >' +
                                '<button type="button" ng-disabled="' + disable_print + '" class="btn btn-primary btn-sm"   ng-click="print_report_nosi(\'' + full["empl_id"] + '\',\'' + moment(full["date_generated"]).format("YYYY-MM-DD") +'\')" data-toggle="tooltip" data-placement="top" title="Print"><i class="fa fa-print"></i></button>' +
                                '</div></center>';
                        }
                    }
                ],
                "createdRow": function (row, data, index) {
                    if (data.already_have_rep === "" || data.already_have_rep == null)
                    {
                        $(row).css('background-color', '#d0e7c2'); 
                    }
                    $compile(row)($scope);  //add this to compile the DOM
                },
            });
    }

    function init()
    {
        s.pageSize = '10';
     
        $("#txtb_from").on('blur', function (e) {
            s.loadEmployee();
        });
        $("#txtb_from").on('keypress', function (e) {
            if (e.which === 13) {
                s.loadEmployee();
            }
        });

        $("#txtb_to").on('change', function (e) {
            s.loadEmployee();
        });
        $("#ddl_dept").on('change', function (e) {
            s.loadEmployee();
        });
        $("#ddl_name").on('change', function (e) {
            s.updateProfile();
        });
        h.post("../cStepIncrement/InitializeData", {
            department_code: "",
            date_from: "",
            date_to:""
        }).then(
            function (d)
            {
                s.departments = d.data.departments;
                s.loadEmployee();
                s.loadStats();
            }
        );
        init_table_data([]);
        $('#datalist_grid_filter').prepend(`&nbsp;&nbsp;&nbsp;`);
       
    }

    s.loadStats = function ()
    {
        h.post("../cStepIncrement/LoadStats", {
            date_year: $("#txtb_from").val()
        }).then(function (d)
        {
            if (d.data.step_stats)
            {
                s.statData = d.data.step_stats[0];
            }
        });
    }

    s.loadEmployee = function ()
    {
        h.post("../cStepIncrement/LoadRekonLedger", {
            department_code: $("#ddl_dept").val(),
            date_from: $("#txtb_from").val(),
            date_to: $("#txtb_to").val()
        }).then(
            function (d) {
                s.employee_steps_record = d.data.stepIncrementData;
                s.totalPages = [];
                s.pageSize  = s.pageSize == "0" ? s.employee_steps_record.length.toString() : s.pageSize;
                vPageSize   = s.pageSize == "0" ? s.employee_steps_record.length.toString() : s.pageSize;
                for (var i = 0; i < Math.ceil(s.employee_steps_record.length / parseInt(vPageSize)); i++) {
                    s.totalPages.push(i);
                }
                $scope.currentPage = 0;
                $scope.updatePagination();
                s.loadLedger();
            }
        );
    }

    // Calculate total pages
    s.totalPages = [];

    s.setPageSize = function ()
    {
        s.totalPages = [];
        vPageSize = parseInt(s.pageSize) == 0 ? s.employee_steps_record.length : parseInt(s.pageSize);
        
        for (var i = 0; i < Math.ceil(s.employee_steps_record.length / vPageSize); i++) {
            s.totalPages.push(i);
        }
        $scope.currentPage = 0;
        $scope.updatePagination();
    }
    // Pagination logic
    s.setPage = function (page) {
        if (page >= 0 && page < s.totalPages[s.totalPages.length - 1]) {
            $scope.currentPage = page;
            $scope.updatePagination();
        }
    };

    $scope.updatePagination = function () {
        var start = $scope.currentPage * parseInt(vPageSize);
        var end = (start + parseInt(vPageSize)) > s.employee_steps_record.length ? s.employee_steps_record.length : (start + parseInt(vPageSize));
        s.employee_pagenated_record = s.employee_steps_record.slice(start, end);
        
    };

    $scope.prevPage = function () {
        if ($scope.currentPage > 0) {
            $scope.currentPage--;
            $scope.updatePagination();
        }
    };

    $scope.nextPage = function () {
        if ($scope.currentPage < s.totalPages.length - 1) {
            $scope.currentPage++;
            $scope.updatePagination();
           
        }
    };

    s.getProfilePic = function (par_empl_id)
    {
        return s.image_link + "" + par_empl_id;
    }

    s.loadLedger = function ()
    {
        var content     = "";
        s.table_header  = []
        if ($("#txtb_to").val() != "" && $("#txtb_from").val() != "")
        {
            if (moment($("#txtb_from").val()).format("YYYY") == moment($("#txtb_to").val()).format("YYYY"))
            {
                s.table_header.push("01");
                s.table_header.push("02");
                s.table_header.push("03");
                s.table_header.push("04");
                s.table_header.push("05");
                s.table_header.push("06");
                s.table_header.push("07");
                s.table_header.push("08");
                s.table_header.push("09");
                s.table_header.push("10");
                s.table_header.push("11");
                s.table_header.push("12");
            }
            else
            {
                for (var x = moment($("#txtb_from").val()).format("YYYY"); x <= moment($("#txtb_to").val()).format("YYYY"); x++) {
                    s.table_header.push(parseInt(x));
                }
            }
        }
    }

    init();

    s.getHeaderVal = function (headerVal)
    {
        if (headerVal === "01") return "January"; 
        if (headerVal === "02") return "February"; 
        if (headerVal === "03") return "March"; 
        if (headerVal === "04") return "April"; 
        if (headerVal === "05") return "May"; 
        if (headerVal === "06") return "June"; 
        if (headerVal === "07") return "July"; 
        if (headerVal === "08") return "August"; 
        if (headerVal === "09") return "September"; 
        if (headerVal === "10") return "October"; 
        if (headerVal === "11") return "November"; 
        if (headerVal === "12") return "December"; 
    }

    s.getSteps = function (lst, employee)
    {
        var rekon_year = moment(employee.rekoning_date).year();

        if (moment($("#txtb_from").val()).format("YYYY") == moment($("#txtb_to").val()).format("YYYY"))
        {
            

            if ((moment($("#txtb_from").val()).year() - rekon_year) < 3) {
                return "";
            }
            else if (((moment($("#txtb_from").val()).year() - rekon_year) % 3) != 0) {
                return "";
            }
            else {
                if (((((moment($("#txtb_from").val()).year() - rekon_year) / 3) + 1) >= 8) && (parseInt(lst) == (moment(employee.rekoning_date).month() + 1)) && ((moment($("#txtb_from").val()).year() - rekon_year) % 3)== 0) {
                    return 'MAX';
                }
                else if (parseInt(lst) == (moment(employee.rekoning_date).month() + 1)) {
                    return 'Step ' + (((moment($("#txtb_from").val()).year() - rekon_year) / 3) + 1);
                    //return 'Step ' + employee.rekon_step;
                }
                else {
                    return "";
                }

            }
        }
        else
        {
            if ((lst - rekon_year) < 3) {
                return "";
            }
            else if (((lst - rekon_year) % 3) !== 0) {
                return "";
            }
            else {
                var myStep  = 0;
                myStep      = ((lst - rekon_year) / 3) + employee.rekon_step;
                if (myStep >= 8) {
                    return 'MAX';
                }
                else {
                    return 'Step ' + myStep;
                }

            }
        }
    };

    $scope.getBackgroundColor = function (lst, employee, rekoning_date)
    {
        var rekon_year = moment(rekoning_date).year();
        var myStep = 0;
        myStep = ((lst - rekon_year) / 3) + employee.rekon_step;

        if (moment($("#txtb_from").val()).format("YYYY") == moment($("#txtb_to").val()).format("YYYY"))
        {
            if ((moment($("#txtb_from").val()).year() - rekon_year) < 3)
            {
                return "none";
            }
            else if (((moment($("#txtb_from").val()).year() - rekon_year) % 3) != 0) {
                return "none";
            }
            else {
                if (((((moment($("#txtb_from").val()).year() - rekon_year) / 3) + 1) >= 8) && (parseInt(lst) == (moment(rekoning_date).month() + 1))) {
                    return '#563d7c';
                }
                else if (parseInt(lst) == (moment(rekoning_date).month()+1)) {
                    if ((((moment($("#txtb_from").val()).year() - rekon_year) / 3) + 1) == 2) {
                        return 'yellow';
                    }
                    else if ((((moment($("#txtb_from").val()).year() - rekon_year) / 3) + 1) == 3) {
                        return 'red';
                    }
                    else if ((((moment($("#txtb_from").val()).year() - rekon_year) / 3) + 1) == 4) {
                        return 'blue';
                    }
                    else if ((((moment($("#txtb_from").val()).year() - rekon_year) / 3) + 1) == 5) {
                        return 'green';
                    }
                    else if ((((moment($("#txtb_from").val()).year() - rekon_year) / 3) + 1) == 6) {
                        return 'orange';
                    }
                    else if ((((moment($("#txtb_from").val()).year() - rekon_year) / 3) + 1) == 7) {
                        return 'pink';
                    }
                }
                else {
                    return "none";
                }

            }
        }
        else {
            if ((lst - rekon_year) < 3) {
                return 'none';
            }
            else if (((lst - rekon_year) % 3) != 0) {
                return 'none';
            }
            else {
                if (myStep == 2) {
                    return 'yellow';
                }
                else if (myStep == 3) {
                    return 'red';
                }
                else if (myStep == 4) {
                    return 'blue';
                }
                else if (myStep == 5) {
                    return 'green';
                }
                else if (myStep == 6) {
                    return 'orange';
                }
                else if (myStep == 7) {
                    return 'pink';
                }
                else if (myStep == 8) {
                    return '#563d7c';
                }
                else {
                    return '#563d7c';
                }

            }
        }
       
    };

    s.btn_add_click = function (lst)
    {
        
        s.viewRecord = lst;
        s.ddl_name_error                = "";
        s.txtb_reckonning_date_error    = "";
        s.ddl_record_tag_error          = "";
        s.record_remarks_error = "";
        console.log(lst);
        h.post("../cStepIncrement/LoadStepsDetails", {
            empl_id: lst.empl_id
        }).then(
            function (d)
            {
                s.viewRecorddtl = d.data.dtl_list;
                s.lwoplist = d.data.lwop_list;
               
                $('#myAddModal').modal({ backdrop: 'static', keyboard: false });
            }
        );
        //$('#myAddModal').modal({ backdrop: 'static', keyboard: false });
    }

    s.btn_addoverride_click = function (lst)
    {    
        s.addoverride               = true;
        s.rekon_type                = "LWOP";
        s.override_rekon_date       = "";
        s.override_rekon_step       = "";
        s.override_rekon_lwopdays   = "";
        s.override_saving           = false;
    }

    s.btn_save_override = function (action,id)
    {    
        var data = {
                        id           :id,
                        empl_id		 :s.viewRecord.empl_id,
                        salary_grade :s.viewRecord.salary_grade,
                        rekoning_date:s.override_rekon_date,
                        rekon_step	 :s.override_rekon_step,
                        lwop_days	 :s.override_rekon_lwopdays,
                        rekon_type	 :s.rekon_type
                    };
        var reckon =
        {
            empl_id         : s.viewRecord.empl_id,
            rekoning_date   : s.override_rekon_date,
            rekon_step      : s.override_rekon_step,
            position_code   : s.viewRecord.position_code,
            position_title  : s.viewRecord.position_title,
            department_code : s.viewRecord.department_code,
            salary_grade    : s.viewRecord.salary_grade,
            rekon_tag       : s.rekon_type,
            remarks         : ""
        };
        s.override_saving   = true;
        var route           = s.rekon_type != "SUSPENSION" ? 'BtnSaveOverride' : 'BtnSaveRekon';
        var final_data      = s.rekon_type != "SUSPENSION" ? data : reckon;
        h.post("../cStepIncrement/" + route,
            {
                data: final_data,
                action: action
            }).then(function (d)
            {
                if (d.data.message == "success")
                {
                    var response = action == "ADD" ? "Saved!" : "Deleted!";
                    swal("Successfully " + response, { icon: "success", });
                    s.addoverride = false;
                    h.post("../cStepIncrement/LoadStepsDetails", {
                        empl_id: s.viewRecord.empl_id
                    }).then(
                        function (d) {
                            s.viewRecorddtl = d.data.dtl_list;
                            s.lwoplist      = d.data.lwop_list;
                        }
                    );

                }
                else
                {
                    swal(d.data.message, { icon: "warning", });
                }
            });
    }

    s.btn_stats_click = function () {
        $("#datalist_grid_filter .filter-badge").remove();
        h.post("../cStepIncrement/LoadStatisticsData",
        {
            filter_from: $("#txtb_from").val()
        }).then(
            function (d)
            {
                s.viewStatsData         = d.data.static_step;
                s.results_to_generate   = 0;
                var result = {};
                s.months = {};
                for (var x = 1; x <= 12; x++)
                {
                    let key = x.toString().padStart(2, '0');
                    s.months[key] = 
                            {
                                month: key,
                                month_name:"",
                                mo_step: 0
                            };
                }
               
                s.viewStatsData.forEach(function (item) {
                    if (!result[item.department_code])
                    {
                        result[item.department_code] = {
                            department_code: item.department_code,
                            dep_step_count: 0,
                            not_generated: 0,
                            generated: 0,
                            office_total_employee: 0,
                            department_short_name: '',
                        };
                    }
                    result[item.department_code].department_short_name  = item.department_short_name;
                    result[item.department_code].office_total_employee += 1;
                    result[item.department_code].dep_step_count        += item.already_have_rep == "X" ? 0:1;
                    result[item.department_code].not_generated         += item.already_have_rep == ""  ? 1:0;
                    result[item.department_code].generated             += item.already_have_rep == "X" || item.already_have_rep == "" ? 0:1;
                    s.results_to_generate += item.already_have_rep == "" ? 1 : 0;

                    var month = moment(item.rekoning_date).format("MM");
                    

                    s.months[month].mo_step   += item.already_have_rep != "X" ? 1 : 0;
                    s.months[month].month_name = moment(item.rekoning_date).format("MMMM");

                });

                s.list_to_step      = s.viewStatsData.filter(item => item.already_have_rep !== 'X');
                s.list_generated    = s.list_to_step.filter(item => item.already_have_rep !== '');
                s.months            = Object.values(s.months);
                s.months.sort(function (a, b) {
                    return a.month.localeCompare(b.month, undefined, { numeric: true });
                });
                var finalData = Object.values(result);
                finalData.sort(function (a, b) {
                    return a.department_code.localeCompare(b.department_code, undefined, { numeric: true });
                });
                $('#modalStats').modal({ backdrop: 'static', keyboard: false });

                $('#modalStats').on('shown.bs.modal', function () {
                    s.oTable.fnClearTable();
                    if (s.list_to_step.length > 0)
                    {
                        s.oTable.fnAddData(s.list_to_step);
                    }
                    $("#datalist_grid_filter #btn_action_option").remove();
                    $("#datalist_grid_filter #btn_action_option_dropdown").remove();
                    $('#datalist_grid_filter').addClass("ibox-tools");
                    
                    //$('#datalist_grid_filter').append(
                    //    `<a class="dropdown-toggle btn btn-default" data-toggle="dropdown" id="btn_action_option" href="#" aria-expanded="true">
                    //        <i class="fa fa-cog"></i>
                    //     </a>
                    //    <ul class="dropdown-menu dropdown-user " id="btn_action_option_dropdown">
                    //        <li><a><i class="fa fa-print"></i> Print</a></li>
                    //        <li><a><i class="fa fa-share-square-o"></i> Export to Excel</a></li>
                    //        <li ng-disabled="true"><a ng-disabled="true"><i class="fa fa-refresh"></i> Generate</a></li>
                    //    </ul>`
                    //);

                    $compile($("#datalist_grid"))($scope);

                    var template = `
                                        <a class="dropdown-toggle btn btn-default" data-toggle="dropdown" id="btn_action_option" href="#" aria-expanded="true">
                                            <i class="fa fa-cog"></i>
                                        </a>
                                        <ul class="dropdown-menu dropdown-user" id="btn_action_option_dropdown">
                                            <li ng-click="print_report_nosi('LIST_TO_STEP','')"><a><i class="fa fa-print"></i> Print</a></li>
                                            <li ng-class="{disabled: true}">
                                                <a ng-class="{disabled: true}">
                                                    <i class="fa fa-share-square-o"></i> Export to Excel
                                                </a>
                                            </li>
                                            <li ng-class="{disabled: true}">
                                                <a ng-class="{disabled: true}">
                                                    <i class="fa fa-refresh"></i> Generate
                                                </a>
                                            </li>
                                        </ul>
                                    `;

                    var compiled = $compile(template)($scope);
                    $('#datalist_grid_filter').append(compiled);

                    
                  

                    drawMorrisChart(finalData);
                });

               
            }
        );
    }

    s.btn_show_service_record = function (empl_id)
    {
        $("#loader").css("display", "block");
        $("#rep_view").css("display", "none");
        var ReportName  = "CrystalReport";
        var SaveName    = "Crystal_Report";
        var ReportType  = "inline";
        var ReportPath  = "";
        var sp          = "";
        sp              = "sp_servicerecord_report,par_empl_id," + empl_id.toString() + ",par_exclude_gsis,1";
        ReportPath      = "~/Reports/cryServiceRecord/cryServiceRecord.rpt";
        // *******************************************************
        // *** VJA : 2021-07-14 - Validation and Loading hide ****
        // *******************************************************
        var iframe      = document.getElementById('iframe_print_preview2');
        var iframe_page = $("#iframe_print_preview2")[0];
        iframe.style.visibility = "hidden";

        s.embed_link = "../Reports/CrystalViewer.aspx?Params=" + ""
            + "&ReportName=" + ReportName
            + "&SaveName=" + SaveName
            + "&ReportType=" + ReportType
            + "&ReportPath=" + ReportPath
            + "&id=" + sp // + "," + parameters

        if (!/*@cc_on!@*/0) { //if not IE
            iframe.onload = function ()
            {
                iframe.style.visibility = "visible";
                $("#loader").css("display", "none");
                $("#rep_view").css("display", "block");
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
                }
                
            };
        }

        iframe.src = s.embed_link;
        $('#modal_print_preview').modal({ backdrop: 'static', keyboard: false });
    }


    s.print_report = function (data)
    {
        if (data["step_type"] == "SUSPENSION")
        {
            return;
        }

        $("#loader").css("display", "block");
        $("#rep_view").css("display", "none");
        var ReportName  = "CrystalReport";
        var SaveName    = "Crystal_Report";
        var ReportType  = "inline";
        var ReportPath  = "";
        var sp          = "";
        sp = "sp_nosi_report,par_empl_id," + data.empl_id.toString() + ",par_date_generated," + moment(data.generated_date).format("YYYY-MM-DD");
        ReportPath      = "~/Reports/cryNosi/cryNosi.rpt";
        // *******************************************************
        // *** VJA : 2021-07-14 - Validation and Loading hide ****
        // *******************************************************
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
                $("#loader").css("display", "none");
                $("#rep_view").css("display", "block");
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
                }

            };
        }

        iframe.src = s.embed_link;

        if (data.rec_stats != "start")
        {
            $('#modal_print_preview').modal({ backdrop: 'static', keyboard: false });
        }
    }

    s.print_report_nosi = function (empl_id, date_generated)
    {
        $("#loader").css("display", "block");
        $("#rep_view").css("display", "none");
        var ReportName = "CrystalReport";
        var SaveName = "Crystal_Report";
        var ReportType = "inline";
        var ReportPath = "";
        var sp = "";

        if (empl_id === "LIST_TO_STEP")
        {
            sp          = "sp_NOSI_list_report,par_year," +$("#txtb_from").val() + ",par_department,";
            ReportPath  = "~/Reports/cryNosiList/cryNosiList.rpt";
        }
        else
        {
            sp          = "sp_nosi_report,par_empl_id," + empl_id + ",par_date_generated," + moment(date_generated).format("YYYY-MM-DD");
            ReportPath  = "~/Reports/cryNosi/cryNosi.rpt";
        }
       
        // *******************************************************
        // *** VJA : 2021-07-14 - Validation and Loading hide ****
        // *******************************************************
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
                $("#loader").css("display", "none");
                $("#rep_view").css("display", "block");
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
                }

            };
        }

        iframe.src = s.embed_link;
        $('#modal_print_preview').modal({ backdrop: 'static', keyboard: false });
        $('#modal_print_preview').on('hidden.bs.modal', function () {
            $('body').addClass('modal-open');
        });
    }

    function drawMorrisChart(data)
    {
        if (myBarChart !== null) {
            $('#morris-bar-chart').empty();    // IMPORTANT
            myBarChart = null;
        }
        myBarChart = new Morris.Bar({
            element     : 'morris-bar-chart',
            data        : data,
            xkey        : 'department_short_name',
            ykeys       : ['office_total_employee','dep_step_count', 'generated', 'not_generated'],
            labels      : ['Active Employees','Employee To Step', 'Report Generated', 'To Be Generate'],
            barColors   : ['#E5B807', '#3c3221', '#442B02', '#7c6711'],
            axes        : true,
            grid        : true,
            xLabelAngle : 70,
            gridTextSize: 10,
            resize      : false,
            xLabelMargin: 0
        });

        myBarChart.on('click', function (i, row)
        {
            addFilterBadge(row);
        });
    }

    function addFilterBadge(dept) {

        // Prevent duplicate
        //if ($('#datalist_grid_filter .filter-badge[data-dept="' + dept.department_short_name + '"]').length > 0)
        //    return;
        s.filterDept = "";
        if (dept == "")
        {
            s.oTable.fnClearTable();
            if (s.list_to_step.length > 0) {
                s.oTable.fnAddData(s.list_to_step);
                $compile($("#datalist_grid"))($scope);
            }
        }
        else
        {
            var data        = s.list_to_step.filter(item => item.department_code == dept.department_code);
            s.filterDept    = dept.department_code;
            s.filteredList  = data;
            if (data.length > 0)
            {
                $("#datalist_grid_filter .filter-badge").remove();

                let badge = `<span class="filter-badge badge badge-warning mr-2"
                          data-dept="${dept.department_short_name}"
                          style="cursor:pointer;margin-top:-5px; !important;">
                        ${dept.department_short_name} &times;
                    </span>`;

                $('#datalist_grid_filter').prepend(badge);
                s.oTable.fnClearTable();
                if (s.data.length > 0) {
                    s.oTable.fnAddData(data);
                }
              
                $('#datalist_grid_filter .filter-badge').on("click", function () 
                {
                    $("#datalist_grid_filter .filter-badge").remove();
                    s.oTable.fnClearTable();
                    if (s.list_to_step.length > 0) {
                        s.oTable.fnAddData(s.list_to_step);
                    }
                    $compile($("#datalist_grid"))($scope);
                });

                $compile($("#datalist_grid"))($scope);
            }
        }
      
    }

    s.btn_delete_click = function (row_index, record_id)
    {
        swal({
            title: "Are you sure to delete this record?",
            text: "Once deleted, you will not be able to recover this record!",
            icon: "warning",
            buttons: true,
            dangerMode: true,

        }).then(function (willDelete)
        {
            if (willDelete)
            {
               
                swal("Record Successfully Delete", "Your record has been successfully deleted!", { icon: "success", });
                h.post("../cStepIncrement/DeleteRecord", { record_id: record_id }).then(function (d)
                {
                    if (d.data.message == "success")
                    {
                        swal("Record Successfully Delete", "Your record has been successfully deleted!", { icon: "success", });
                        s.loadEmployee();
                    }
                    else {
                        swal(d.data.message, { icon: "warning", });
                    }
                })
            }
            else {
                swal("CANCELLED", "TEST", { icon: "success",});
            }
        });
    }

    function formatState(state) {

        if (!state.id) {
            return state.text;
        }
        var baseUrl = (state.empl_photo == "" ? "../ResourcesImages/upload_profile.png" : s.image_link + state.id);
        var $state = $(
            '<span><img alt="image" class="img-circle" width="50" height="50" src="' + baseUrl + '" class="img-flag" /> ' + state.text + '</span>'
        );
        return $state;
    }

    s.updateProfile = function ()
    {
        $('#profile_prev').attr('src', s.image_link + '/' + $("#ddl_name").val());
        s.$apply();
    }

    s.btn_save_record = function ()
    {
        if (s.validateInputs())
        {
            var par_tbl = {
                'id'            : '',
                'empl_id'       : $('#ddl_name').val(),
                'record_tag'    : $('#ddl_record_tag').val(),
                'rekoning_date' : $('#txtb_reckonning_date').val(),
                'remarks'       : $('#record_remarks').val(),
                'created_by'    : '',
                'created_dttm'  : '',
                'updated_by'    : '',
                'updated_dttm'  : ''
            };

            h.post("../cStepIncrement/SaveRecord",
            {
                tbl: par_tbl,
                t_action:"ADD"
            }).then(
                function (d)
                {
                    if (d.data.message == "success") {
                        s.loadEmployee();
                    }
                    else {
                        alert(d.data.message);
                    }
                }
            );
        }
    }

    s.btn_generate_NOSI = function (empl_id)
    {
        swal({
            title: "Are you sure to generate NOSI for this record?",
            icon: "warning",
            buttons: true,
            dangerMode: true,

        }).then(function (willDelete)
        {
            if (willDelete)
            {
                $("#modalLoader").modal({ backdrop: 'static', keyboard: false });
                var lst     = s.list_to_step.filter(item => item.empl_id == empl_id)[0];
                var years   = parseInt(moment().format("YYYY")) - parseInt(moment(lst.rekoning_date).format("YYYY"));
                var par_tbl = {
                    empl_id             :lst.empl_id,
                    date_of_effectivity :moment(lst.rekoning_date).add(years, "years").format("YYYY-MM-DD"),
                    step_increment_new: lst.rekon_step + (years / 3),
                    salary_grade: lst.salary_grade

                };
              
                h.post("../cStepIncrement/BtnGenerateNOSI",
                {
                    data: par_tbl,
                    action:"ADD"
                }).then(
                    function (d)
                    {
                        if (d.data.message == "success")
                        {
                            var currentPage = $('#datalist_grid').DataTable().page.info().page;

                            h.post("../cStepIncrement/LoadStatisticsData",
                                {
                                    filter_from: $("#txtb_from").val()
                                }).then(
                                    function (d) {
                                        s.viewStatsData = d.data.static_step;
                                        s.results_to_generate = 0;
                                        var result = {};
                                        s.months = {};
                                        for (var x = 1; x <= 12; x++) {
                                            let key = x.toString().padStart(2, '0');
                                            s.months[key] =
                                                {
                                                    month: key,
                                                    month_name: "",
                                                    mo_step: 0
                                                };
                                        }

                                        s.viewStatsData.forEach(function (item) {
                                            if (!result[item.department_code]) {
                                                result[item.department_code] = {
                                                    department_code: item.department_code,
                                                    dep_step_count: 0,
                                                    not_generated: 0,
                                                    generated: 0,
                                                    office_total_employee: 0,
                                                    department_short_name: '',
                                                };
                                            }
                                            result[item.department_code].department_short_name = item.department_short_name;
                                            result[item.department_code].office_total_employee += 1;
                                            result[item.department_code].dep_step_count += item.already_have_rep == "X" ? 0 : 1;
                                            result[item.department_code].not_generated += item.already_have_rep == "" ? 1 : 0;
                                            result[item.department_code].generated += item.already_have_rep == "X" || item.already_have_rep == "" ? 0 : 1;
                                            s.results_to_generate += item.already_have_rep == "" ? 1 : 0;

                                            var month = moment(item.rekoning_date).format("MM");


                                            s.months[month].mo_step += item.already_have_rep != "X" ? 1 : 0;
                                            s.months[month].month_name = moment(item.rekoning_date).format("MMMM");

                                        });

                                        s.list_to_step = s.viewStatsData.filter(item => item.already_have_rep !== 'X');
                                        s.list_generated = s.list_to_step.filter(item => item.already_have_rep !== '');
                                        s.months = Object.values(s.months);
                                        s.months.sort(function (a, b) {
                                            return a.month.localeCompare(b.month, undefined, { numeric: true });
                                        });
                                        var finalData = Object.values(result);
                                        finalData.sort(function (a, b) {
                                            return a.department_code.localeCompare(b.department_code, undefined, { numeric: true });
                                        });

                                        s.oTable.fnClearTable();
                                        if (s.list_to_step.length > 0)
                                        {
                                            if (s.filterDept != "") {
                                                var data = s.list_to_step.filter(item => item.department_code == s.filterDept);
                                                s.oTable.fnAddData(data);
                                                s.oTable.fnPageChange(currentPage);
                                            }
                                            else {
                                                s.oTable.fnAddData(s.list_to_step);
                                                s.oTable.fnPageChange(currentPage);
                                            }
                                        }

                                        $compile($("#datalist_grid"))($scope);
                                        drawMorrisChart(finalData);

                                        $("#modalLoader").modal("hide");
                                        $('#modalLoader').on('hidden.bs.modal', function () {
                                            $('body').addClass('modal-open');
                                        });
                                    }
                                );
                        }
                        else {
                            alert(d.data.message);
                        }
                    }
                );
            }
        });
    }

    s.validateInputs = function()
    {
        var result = true;
        s.ddl_name_error                = "";
        s.txtb_reckonning_date_error    = "";
        s.ddl_record_tag_error          = "";
        s.record_remarks_error          = "";
        if ($('#ddl_name').val() == "")
        {
            s.ddl_name_error = "Required!";
            result = false;
        }
        if ($('#txtb_reckonning_date').val() == "") {
            s.txtb_reckonning_date_error = "Required!";
            result = false;
        }
        else if (!moment($('#txtb_reckonning_date').val()).isValid())
        {
            s.txtb_reckonning_date_error = "Invalid Date!";
            result = false;
        }

        if ($('#ddl_record_tag').val() == "") {
            s.ddl_record_tag_error = "Required!";
            result = false;
        }

        if ($('#record_remarks').val() == "") {
            s.record_remarks_error = "Required!";
            result = false;
        }
        return result;
    }

    $(document).ready(function () {
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
    });
    Array.prototype.delete = function (code) {
        return this.filter(function (d, k) {
            return k != code
        })
    }
});