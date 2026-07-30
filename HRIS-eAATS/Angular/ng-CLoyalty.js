ng_HRD_App.controller("cCLoyalty_ctrlr", function ($scope, $compile, $http, $filter) {
    var s           = $scope;
    var h           = $http;
    $scope.moment   = moment;
    s.departments   = [];
    s.compile       = $compile;
    s.image_link = "http://192.168.5.218/storage/images/photo/thumb/";
    // Pagination variables
    $scope.currentPage  = 0;
    s.pageSize          = '10'; // items per page
    var vPageSize       = 0;
    // Sample data
    $scope.data             = [];
    s.statData              = [];
    s.loyalty_reckon_ledger = [];
    s.table_header          = [];
    s.txt_year              = moment().year();
    s.ddl_status            = "ALL";
    s.ddl_status_add        = "ACTIVE";
    s.currentPhoto          = "";
    s.load_status = [];
    for (var i = 1; i <= 100; i++) {
        $scope.data.push('Item ' + i);
    }

    $.fn.modal.Constructor.prototype.enforceFocus = function () {

    }

    function init()
    {
        s.pageSize = '10';
        $("#ddl_dept").on('change', function (e) {
            s.loadEmployee();
        });
        h.post("../cLoyalty/InitializeData").then(
            function (d)
            {
                s.departments = d.data.departments;
                s.loadEmployee();
            }
        );
       
    }
    init();

    s.loadEmployee = function ()
    {
        h.post("../cLoyalty/LoadRekonLedger", {
            department_code: $("#ddl_dept").val(),
            rt_year: $("#txt_year").val(),
            rec_status: $("#ddl_status").val()
        }).then(
            function (d)
            {
                s.load_status           = d.data.load_status;
                s.loyalty_reckon_ledger = d.data.loyaltyToTrack;
                s.totalPages = [];
                s.pageSize  = s.pageSize == "0" ? s.loyalty_reckon_ledger.length.toString() : s.pageSize;
                vPageSize   = s.pageSize == "0" ? s.loyalty_reckon_ledger.length.toString() : s.pageSize;
                for (var i = 0; i < Math.ceil(s.loyalty_reckon_ledger.length / parseInt(vPageSize)); i++) {
                    s.totalPages.push(i);
                }
                s.currentPage = 0;
                s.updatePagination();

                s.table_header = [];
                for (x = 0; x < 3; x++) {
                    s.table_header.push((s.txt_year + x));
                }

                s.table_header.push(10);
                s.table_header.push(15);
                s.table_header.push(20);
                s.table_header.push(25);
                s.table_header.push(30);
                s.table_header.push(35);
                s.table_header.push(40);
                s.table_header.push(45);
            }
        );
    }

    s.yearChanged = function () {

        if (!$scope.txt_year)
            return;

        if ($scope.txt_year.toString().length !== 4)
            return;

        $scope.loadEmployee();
    };


    s.getYearsOrWhen = function (lst, employee) {
        var return_val = "";
        if (lst < s.txt_year)
        {
            return_val = moment(employee.original_date).year() + lst;
        }
        else {
            return_val = lst - moment(employee.original_date).year();
            if (return_val <= 0) {
                return_val = "--";
            }
        }

        return return_val;
    };

    s.btn_add_click = function () {
        s.ModalTitle    = "ADD EMPLOYEE TO LOYALTY MONITORING";
        s.currentPhoto  = null;
        $('#ddl_name').val('').trigger('change');

        $("#lbl_req_ddl_name").html("");
        $("#lbl_req_txtb_original_date").html("");
        $("#lbl_req_txtb_number_year").html("");
        $("#lbl_req_ddl_status_add").html("");


        $("#txtb_original_date").val("");
        $("#txtb_number_year").val("");
        $("#txtb_remarks").val("");

        $('#main_modal').modal({ backdrop: 'static', keyboard: false });

    };

    s.btn_delete_click = function (del_rec)
    {
        swal({
            title: "Are you sure to delete this record?",
            text: "Once deleted, you will not be able to recover this record!",
            icon: "warning",
            buttons: true,
            dangerMode: true,

        }).then(function (willDelete) {
            if (willDelete) {
                var loyalty_rec = {
                     id             : del_rec.id
                    , empl_id       : del_rec.empl_id
                    , original_date : del_rec.original_date
                    , loyalty_year  : del_rec.loyal_years
                    , remarks       : del_rec.remarks
                }
                h.post("../cLoyalty/SaveRecord", {
                    loyalty_rec: loyalty_rec,
                    action: "DELETE"
                }).then(function (d) {
                    if (d.data.message == "success") {
                        swal("Report Successfully Deleted!", { icon: "success", });
                        s.loadEmployee();
                    }
                });
            }
        });
    };

    s.btn_save_click = function () {
        if (validated()) {
            var loyalty_rec = {
                empl_id: $('#ddl_name').val()
                , original_date: $("#txtb_original_date").val()
                , loyalty_year: $("#txtb_number_year").val()
                , remarks: $("#txtb_remarks").val()
                , rec_status: $("#ddl_status_add").val()
                , created_dttm: ""
                , created_by: ""
                , updated_dttm: ""
                , updated_by: ""
            }

            h.post("../cLoyalty/SaveRecord", {
                loyalty_rec: loyalty_rec,
                action: "ADD"
            }).then(function (d) {
                if (d.data.message == "success") {
                    swal("Employee Successfully Added for Loyalty Monitoring!", { icon: "success", });
                    $("#main_modal").modal("hide");
                    s.loadEmployee();
                }
            });
        }
    };

    s.btn_show_service_record = function (empl_id) {
        $("#loader").css("display", "block");
        $("#rep_view").css("display", "none");
        var ReportName = "CrystalReport";
        var SaveName = "Crystal_Report";
        var ReportType = "inline";
        var ReportPath = "";
        var sp = "";
        sp = "sp_servicerecord_report,par_empl_id," + empl_id.toString() + ",par_exclude_gsis,1";
        ReportPath = "~/Reports/cryServiceRecord/cryServiceRecord.rpt";
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
    }

    function validated()
    {
        var valid_entry = true;
        $("#lbl_req_ddl_name").html("");
        $("#lbl_req_txtb_original_date").html("");
        $("#lbl_req_txtb_number_year").html("");
        $("#lbl_req_ddl_status_add").html("");

        $("#ddl_name").removeClass("error-select").trigger("change.select2");
        $("#txtb_original_date").removeClass("required");
        $("#txtb_number_year").removeClass("required");
        $("#ddl_status_add").removeClass("required");

        if ($("#ddl_name").val() == "")
        {
            valid_entry = false;
            $("#ddl_name").addClass("error-select").trigger("change.select2");
            $("#lbl_req_ddl_name").html("Required!");
        }

        if ($("#txtb_original_date").val() == "") {
            valid_entry = false;
            $("#txtb_original_date").addClass("required");
            $("#lbl_req_txtb_original_date").html("Required!");
        }

        if ($("#txtb_number_year").val() == "") {
            valid_entry = false;
            $("#txtb_number_year").addClass("required");
            $("#lbl_req_txtb_number_year").html("Required!");
        }

        if ($("#ddl_status_add").val() == "") {
            valid_entry = false;
            $("#ddl_status_add").addClass("required");
            $("#lbl_req_ddl_status_add").html("Required!");
        }


        return valid_entry;
    }

    s.getBG = function (lst, employee) {

        // Default classes
        if ((lst - s.txt_year) == 0) return "bg-warning-custom";
        if ((lst - s.txt_year) == 1) return "bg-success-custom";
        if ((lst - s.txt_year) == 2) return "bg-info-custom";

        // Your existing logic
        if (lst < s.txt_year) {
            var year = moment(employee.original_date).year() + Number(lst);
            if (year == s.table_header[0]) {
                return "bg-warning-custom";
            } else if (year == s.table_header[1]) {
                return "bg-success-custom";
            } else if (year == s.table_header[2]) {
                return "bg-info-custom";
            }
        }

        return "";
    };

    // Calculate total pages
    s.totalPages = [];

    s.setPageSize = function ()
    {
        s.totalPages = [];
        vPageSize = parseInt(s.pageSize) == 0 ? s.loyalty_reckon_ledger.length : parseInt(s.pageSize);
        
        for (var i = 0; i < Math.ceil(s.loyalty_reckon_ledger.length / vPageSize); i++) {
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
        var end = (start + parseInt(vPageSize)) > s.loyalty_reckon_ledger.length ? s.loyalty_reckon_ledger.length : (start + parseInt(vPageSize));
        s.employee_pagenated_record = s.loyalty_reckon_ledger.slice(start, end);
        
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


    function formatState(state) {

        if (!state.id) {
            return state.text;
        }
        var baseUrl = (state.empl_photo == "" ? "../ResourcesImages/upload_profile.png" : "https://img-repo.davaodeoro.gov.ph/api/images/serve/" + state.empl_photo_img);
        //var $state = $(
        //    '<span><img alt="image" class="img-circle" width="50" height="50" src="' + baseUrl + '" class="img-flag" /> ' + state.text + '</span>'
        //);
        var $state = $(
            '<a class="pull-left">' +
            '<img alt="image" class="img-circle" width="60" height="60" src="' + baseUrl + '" >' +
            '</a>' +
            '<div class="media-body p-sm ">' +
            '<small > ' + state.pos + ' </small><br />' +
            '<strong> ' + state.text + ' </strong> ' + state.dep + '' +
            '</div>'
        );
        return $state;
    };
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
                    const results = data.data
                        .filter(item => item.employment_type !== "JO")
                        .map(item => {
                        return {
                            id          : item.empl_id,
                            text        : item.empl_id + " - " + item.employee_name,
                            empl_photo  : item.empl_photo,
                            pos         : item.position_long_title == null ? "--" : item.position_long_title,
                            dep         : (item.department_short_name == null ? "" : " (" + item.department_short_name + ")"),
                            empl_photo_img      : item.empl_photo_img + "?thumbnail=1",
                            empl_ployment_type  : item.employment_type,
                        };
                    });
                    return {
                        results: results,
                    }
                },
            },
        });
    })


    $('#ddl_name').on('select2:select', function (e) {

        var data = e.params.data;
        s.$apply(function () {
            s.currentPhoto = data.empl_photo_img;
        });


    });

});