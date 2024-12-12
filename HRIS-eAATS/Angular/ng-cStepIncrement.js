ng_HRD_App.controller("cStepIncrement_ctrlr", function ($scope, $compile, $http, $filter) {
    var s                           = $scope;
    var h                           = $http;
    var year_span                   = [];
    s.txtb_from                     = new Date();
    s.txtb_to                       = new Date();
    s.table_header                  = [];
    s.employee_steps_record         = [];
    s.employee_pagenated_record     = [];
    $scope.moment                   = moment;
    s.departments                   = [];
    s.compile                       = $compile;
    s.image_link = "http://192.168.5.218/storage/images/photo/thumb/";
    s.ddl_name = "";
    // Sample data
    $scope.data = [];
    for (var i = 1; i <= 100; i++) {
        $scope.data.push('Item ' + i);
    }

    // Pagination variables
    $scope.currentPage = 0;
    $scope.pageSize = 10; // items per page
    
    $.fn.modal.Constructor.prototype.enforceFocus = function () {

    }
    function init()
    {
       
        $("#txtb_from").on('change', function (e) {
            s.loadEmployee();
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
            }
        );
       
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
                for (var i = 0; i < Math.ceil(s.employee_steps_record.length / s.pageSize); i++) {
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
 
    // Pagination logic
    s.setPage = function (page) {
        if (page >= 0 && page < s.totalPages[s.totalPages.length - 1]) {
            $scope.currentPage = page;
            $scope.updatePagination();
        }
    };

    $scope.updatePagination = function () {
        var start = $scope.currentPage * $scope.pageSize;
        var end = (start + $scope.pageSize) > s.employee_steps_record.length ? s.employee_steps_record.length : (start + $scope.pageSize);
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
        var content = "";
        s.table_header = []
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
          
            //s.$apply();
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

    s.getSteps = function (lst, rekoning_date)
    {
        var rekon_year = moment(rekoning_date).year();
        
        if (moment($("#txtb_from").val()).format("YYYY") == moment($("#txtb_to").val()).format("YYYY"))
        {
            

            if ((moment($("#txtb_from").val()).year() - rekon_year) < 3) {
                return "";
            }
            else if (((moment($("#txtb_from").val()).year() - rekon_year) % 3) != 0) {
                return "";
            }
            else {
                if (((((moment($("#txtb_from").val()).year() - rekon_year) / 3) + 1) >= 8) && (parseInt(lst) == (moment(rekoning_date).month() + 1)) && ((moment($("#txtb_from").val()).year() - rekon_year) % 3)== 0) {
                    return 'MAX';
                }
                else if (parseInt(lst) == (moment(rekoning_date).month() + 1)) {
                    return 'Step ' + (((moment($("#txtb_from").val()).year() - rekon_year) / 3) + 1);
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
                if ((((lst - rekon_year) / 3) + 1) >= 8) {
                    return 'MAX';
                }
                else {
                    return 'Step ' + (((lst - rekon_year) / 3) + 1);
                }

            }
        }
    };

    $scope.getBackgroundColor = function (lst, rekoning_date)
    {
        var rekon_year = moment(rekoning_date).year();
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
                if ((((lst - rekon_year) / 3) + 1) == 2) {
                    return 'yellow';
                }
                else if ((((lst - rekon_year) / 3) + 1) == 3) {
                    return 'red';
                }
                else if ((((lst - rekon_year) / 3) + 1) == 4) {
                    return 'blue';
                }
                else if ((((lst - rekon_year) / 3) + 1) == 5) {
                    return 'green';
                }
                else if ((((lst - rekon_year) / 3) + 1) == 6) {
                    return 'orange';
                }
                else if ((((lst - rekon_year) / 3) + 1) == 7) {
                    return 'pink';
                }
                else if ((((lst - rekon_year) / 3) + 1) == 8) {
                    return '#563d7c';
                }
                else {
                    return '#563d7c';
                }

            }
        }
       
    };

    s.btn_add_click = function ()
    {
        s.ddl_name_error = "";
        s.txtb_reckonning_date_error = "";
        s.ddl_record_tag_error = "";
        s.record_remarks_error = "";
        $('#myAddModal').modal({ backdrop: 'static', keyboard: false });
    }

    s.btn_view_info_click = function () {
        $('#myAddModal').modal({ backdrop: 'static', keyboard: false });
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
                swal("CANCELLED", "TEST", { icon: "success", });
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