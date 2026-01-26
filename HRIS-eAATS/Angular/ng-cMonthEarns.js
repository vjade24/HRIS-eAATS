ng_HRD_App.controller("cMonthEarns_ctrlr", function ($scope, $compile, $http, $filter, commonScript) {
    var s = $scope
    var h = $http
    var cs = commonScript

    s.year          = [];
    s.rowLen        = "50";
    s.ddl_dept      = "";
    s.ddl_earning_type = "VL"
    s.datalist_grid = []
    s.regenerate_selected = [];
    s.selectAll = false;
    s.image_link = cs.img_link('local') + "/storage/images/photo/thumb/";
    s.currentTimestamp = new Date().getTime(); // For cache busting on images

    // Month names mapping for display
    var monthNames = {
        '01': 'January', '02': 'February', '03': 'March', '04': 'April',
        '05': 'May', '06': 'June', '07': 'July', '08': 'August',
        '09': 'September', '10': 'October', '11': 'November', '12': 'December'
    };

    // Get month name from month number
    s.getMonthName = function (monthNum) {
        return monthNames[monthNum] || monthNum;
    };

    function init()
    {
        //**********************************************
        // Initialize data during page loads
        //**********************************************
        $('#modal_generating_remittance').modal({ backdrop: 'static', keyboard: false });
        h.post("../cMonthEarns/InitializeData").then(function (d) {
            if (d.data.message == "success")
            {
                var curr_year = new Date().getFullYear().toString();
                s.ddl_year = curr_year;
                s.currentMonth = new Date().getMonth() + 1
                s.ddl_month = datestring(s.currentMonth.toString())
                RetrieveYear();
                s.lv_admin_dept_list = d.data.lv_admin_dept_list

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
        // Sort data: non-successful records first (remarks_flag blank or EARN EXISTS = successful, shown last)
        var sortedData = par_data.slice().sort(function(a, b) {
            var aRemarks = (a.remarks_descr || '').toUpperCase();
            var bRemarks = (b.remarks_descr || '').toUpperCase();   
            var aIsLocked = (a.remarks_flag === "" || a.remarks_flag === null || aRemarks.indexOf('EARN EXISTS FOR THIS YEAR-MONTH') !== -1) ? 1 : 0;
            var bIsLocked = (b.remarks_flag === "" || b.remarks_flag === null || bRemarks.indexOf('EARN EXISTS FOR THIS YEAR-MONTH') !== -1) ? 1 : 0;
            return aIsLocked - bIsLocked; // Non-locked first
        });

        s.datalistgrid = sortedData;
        s.datalist_grid = sortedData;
        s.regenerate_selected = [];
        s.selectAll = false;

        s.oTable = $('#datalist_grid').dataTable(
            {
                data: s.datalistgrid,
                sDom: 'rt<"bottom"ip>',
                            //pageLength: s.rowLen,
                            scrollY: '400px',
                            scrollCollapse: true,
                            paging: false,
                            columns: [
                                {
                                    "mData": null,
                                    "mRender": function (data, type, full, row) {
                                        var temp = moment();
                                        var def_images = '../../ResourcesImages/upload_profile.png';
                                        return '<div class="text-center">' +
                                            '<div class="img-circle">' +
                                            '<img class="img-circle employee-photo" onerror="this.onerror=null;this.src=\'' + def_images + '\';" alt="Employee Photo" width="35" height="35" src="' + s.image_link + full["empl_id"] + '?v=' + temp + '" />' +
                                            '</div>' +
                                            '</div>'
                                    }
                                },
                                {
                                    "mData": "department_short_name",
                                    "mRender": function (data, type, full, row) {
                                        return "<span class='office-cell'>" + data + "</span>"
                                    }
                                },
                                {
                                    "mData": "empl_id",
                                    "mRender": function (data, type, full, row) {
                                        return "<span class='id-cell'>" + data + "</span>"
                                    }
                                },
                                {
                                    "mData": "employee_name",
                                    "mRender": function (data, type, full, row) {
                                        return "<span class='name-cell'>" + data + "</span>"
                                    }
                                },
                                {
                                    "mData": "remarks_descr",
                                    "mRender": function (data, type, full, row)
                                    {
                                        var remarkClass = 'warning';
                                        var remarkUpper = (data || '').toUpperCase();
                                        if (remarkUpper.indexOf('SUCCESSFULLY INSERTED TO LEDGER') !== -1) remarkClass = 'success';
                                        else if (remarkUpper.indexOf('EARN EXISTS FOR THIS YEAR-MONTH') !== -1) remarkClass = 'success';
                                        return "<span class='remark-badge " + remarkClass + "'>" + data + "</span>"
                                    }
                                },
                                {
                                    "mData": "created_dttm",
                                    "mRender": function (data, type, full, row) {
                                        return "<span class='date-cell'>" + moment(data).format('YYYY-MM-DD HH:mm') + "</span>"
                                    }
                                }
                            ],
                            "createdRow": function (row, data, index) {
                                $compile(row)($scope);  //add this to compile the DOM
                            },
                        });
                }

    // Helper function to check if a record is locked (cannot regenerate)
    s.isRecordLocked = function(record) {
        if (record.remarks_flag === "" || record.remarks_flag === null) {
            return true;
        }
        var remarkUpper = (record.remarks_descr || '').toUpperCase();
        return remarkUpper.indexOf('EARN EXISTS FOR THIS YEAR-MONTH') !== -1;
    };

    s.toggleSelectAll = function() {
        if (s.selectAll) {
            // Check all non-locked checkboxes
            for (var i = 0; i < s.datalist_grid.length; i++) {
                if (!s.isRecordLocked(s.datalist_grid[i])) {
                    s.regenerate_selected[i] = true;
                }
            }
        } else {
            // Uncheck all
            s.regenerate_selected = [];
        }
    };

    s.updateSelectAll = function() {
        var allChecked = true;
        var someChecked = false;

        for (var i = 0; i < s.datalist_grid.length; i++) {
            if (!s.isRecordLocked(s.datalist_grid[i])) {
                if (s.regenerate_selected[i]) {
                    someChecked = true;
                } else {
                    allChecked = false;
                }
            }
        }

        s.selectAll = allChecked && someChecked;
    };

    s.getSelectedItems = function () {
        var selected = [];

        for (var i = 0; i < s.datalist_grid.length; i++) {
            if (s.regenerate_selected[i] && !s.isRecordLocked(s.datalist_grid[i])) {
                selected.push(s.datalist_grid[i]);
            }
        }

        return selected;
    };

    // ============================================
    // SUMMARY DASHBOARD FUNCTIONS
    // ============================================

    // Define locked categories (cannot regenerate)
    s.lockedCategories = ['SUCCESSFULLY INSERTED TO LEDGER', 'EARN EXISTS FOR THIS YEAR-MONTH'];

    // Get count of records matching a specific remark (partial match)
    s.getRemarkCount = function (remarkKeyword) {
        if (!s.datalist_grid || s.datalist_grid.length === 0) return 0;

        var count = 0;
        var keyword = remarkKeyword.toUpperCase();

        for (var i = 0; i < s.datalist_grid.length; i++) {
            var remark = (s.datalist_grid[i].remarks_descr || '').toUpperCase();
            if (remark.indexOf(keyword) !== -1) {
                count++;
            }
        }
        return count;
    };

    // Get count for locked records (Successfully Inserted + Earn Exists)
    s.getLockedCount = function () {
        if (!s.datalist_grid || s.datalist_grid.length === 0) return 0;

        var count = 0;
        for (var i = 0; i < s.datalist_grid.length; i++) {
            var remark = (s.datalist_grid[i].remarks_descr || '').toUpperCase();
            for (var j = 0; j < s.lockedCategories.length; j++) {
                if (remark.indexOf(s.lockedCategories[j].toUpperCase()) !== -1) {
                    count++;
                    break;
                }
            }
        }
        return count;
    };

    // Get percentage of locked records
    s.getLockedPercentage = function () {
        if (!s.datalist_grid || s.datalist_grid.length === 0) return 0;
        var count = s.getLockedCount();
        var percentage = (count / s.datalist_grid.length) * 100;
        return Math.round(percentage * 10) / 10;
    };

    // Get count of "other" records (can regenerate)
    s.getOtherRemarkCount = function () {
        if (!s.datalist_grid || s.datalist_grid.length === 0) return 0;

        var otherCount = 0;

        for (var i = 0; i < s.datalist_grid.length; i++) {
            var remark = (s.datalist_grid[i].remarks_descr || '').toUpperCase();
            var isOther = true;

            for (var j = 0; j < s.lockedCategories.length; j++) {
                if (remark.indexOf(s.lockedCategories[j].toUpperCase()) !== -1) {
                    isOther = false;
                    break;
                }
            }

            if (isOther) {
                otherCount++;
            }
        }
        return otherCount;
    };

    // Get percentage of "other" records
    s.getOtherRemarkPercentage = function () {
        if (!s.datalist_grid || s.datalist_grid.length === 0) return 0;

        var count = s.getOtherRemarkCount();
        var percentage = (count / s.datalist_grid.length) * 100;
        return Math.round(percentage * 10) / 10;
    };

    // Get summary statistics object
    s.getSummaryStats = function () {
        return {
            total: s.datalist_grid ? s.datalist_grid.length : 0,
            locked: s.getLockedCount(),
            others: s.getOtherRemarkCount()
        };
    };

    // ============================================
    // SUMMARY MODAL FUNCTIONS
    // ============================================

    s.summaryModalTitle = '';
    s.summaryModalType = 'primary';
    s.filteredSummaryList = [];
    s.summarySearchText = '';


    // Open summary detail modal with filtered data
    s.openSummaryModal = function (filterKeyword, title, type) {
        s.summaryModalTitle = title;
        s.summaryModalType = type;
        s.summarySearchText = '';
        s.modalSelectedItems = {};
        s.modalSelectAll = false;

        // Filter the data based on keyword
        if (filterKeyword === 'total') {
            // Show all records
            s.filteredSummaryList = angular.copy(s.datalist_grid);
        } else if (filterKeyword === 'locked') {
            // Show locked records (Successfully Inserted + Earn Exists)
            s.filteredSummaryList = [];
            for (var i = 0; i < s.datalist_grid.length; i++) {
                var remark = (s.datalist_grid[i].remarks_descr || '').toUpperCase();
                for (var j = 0; j < s.lockedCategories.length; j++) {
                    if (remark.indexOf(s.lockedCategories[j].toUpperCase()) !== -1) {
                        s.filteredSummaryList.push(s.datalist_grid[i]);
                        break;
                    }
                }
            }
        } else if (filterKeyword === 'other') {
            // Show records that can be regenerated (not locked)
            s.filteredSummaryList = [];
            for (var i = 0; i < s.datalist_grid.length; i++) {
                var remark = (s.datalist_grid[i].remarks_descr || '').toUpperCase();
                var isOther = true;

                for (var j = 0; j < s.lockedCategories.length; j++) {
                    if (remark.indexOf(s.lockedCategories[j].toUpperCase()) !== -1) {
                        isOther = false;
                        break;
                    }
                }

                if (isOther) {
                    s.filteredSummaryList.push(s.datalist_grid[i]);
                }
            }
        } else {
            // Filter by specific keyword (string)
            s.filteredSummaryList = [];
            var keyword = filterKeyword.toUpperCase();

            for (var i = 0; i < s.datalist_grid.length; i++) {
                var remark = (s.datalist_grid[i].remarks_descr || '').toUpperCase();
                if (remark.indexOf(keyword) !== -1) {
                    s.filteredSummaryList.push(s.datalist_grid[i]);
                }
            }
        }

        // Open the modal
        $('#modal_summary_detail').modal('show');
    };

    // Modal selection functions
    s.modalSelectedItems = {};
    s.modalSelectAll = false;

    s.toggleModalSelectAll = function() {
        if (s.modalSelectAll) {
            // Select all items in filtered list
            for (var i = 0; i < s.filteredSummaryList.length; i++) {
                s.modalSelectedItems[s.filteredSummaryList[i].empl_id] = true;
            }
        } else {
            // Deselect all
            s.modalSelectedItems = {};
        }
    };

    s.updateModalSelectAll = function() {
        var allChecked = true;
        var someChecked = false;

        for (var i = 0; i < s.filteredSummaryList.length; i++) {
            if (s.modalSelectedItems[s.filteredSummaryList[i].empl_id]) {
                someChecked = true;
            } else {
                allChecked = false;
            }
        }

        s.modalSelectAll = allChecked && someChecked;
    };

    s.getModalSelectedCount = function() {
        var count = 0;
        for (var key in s.modalSelectedItems) {
            if (s.modalSelectedItems[key]) {
                count++;
            }
        }
        return count;
    };

    s.getSelectedItemsFromModal = function() {
        var selected = [];
        for (var i = 0; i < s.filteredSummaryList.length; i++) {
            if (s.modalSelectedItems[s.filteredSummaryList[i].empl_id]) {
                selected.push(s.filteredSummaryList[i]);
            }
        }
        return selected;
    };

    // Format datetime using moment.js (same as datalist_grid)
    s.formatDateTime = function(dateTime) {
        if (!dateTime) return '';
        return moment(dateTime).format('YYYY-MM-DD HH:mm');
    };

    // Get icon class based on modal type
    s.getSummaryIcon = function (type) {
        var icons = {
            'primary': 'fa-list-alt',
            'success': 'fa-lock',
            'warning': 'fa-refresh',
            'secondary': 'fa-ellipsis-h'
        };
        return icons[type] || 'fa-list-alt';
    };

    // Get initials from employee name
    s.getInitials = function (name) {
        if (!name) return '?';
        var parts = name.split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    // Get badge class based on remark
    s.getRemarkBadgeClass = function (remark) {
        if (!remark) return 'warning';
            var remarkUpper = remark.toUpperCase();

            // Success - Successfully inserted or Earn exists (locked)
            if (remarkUpper.indexOf('SUCCESSFULLY INSERTED TO LEDGER') !== -1) return 'success';
            if (remarkUpper.indexOf('EARN EXISTS FOR THIS YEAR-MONTH') !== -1) return 'success';

            // Warning - Others (can regenerate)
            return 'warning';
        };

    // Export to Excel function
    s.exportSummaryToExcel = function () {
        if (!s.filteredSummaryList || s.filteredSummaryList.length === 0) {
            swal("No Data", "There are no records to export.", "warning");
            return;
        }

        // Create CSV content
        var csvContent = "No.,Employee ID,Employee Name,Department,Remarks,Date Generated\n";

        for (var i = 0; i < s.filteredSummaryList.length; i++) {
            var item = s.filteredSummaryList[i];
            var row = [
                (i + 1),
                item.empl_id || '',
                '"' + (item.employee_name || '').replace(/"/g, '""') + '"',
                '"' + (item.department_short_name || '').replace(/"/g, '""') + '"',
                '"' + (item.remarks_descr || '').replace(/"/g, '""') + '"',
                moment(item.created_dttm).format('YYYY-MM-DD HH:mm:ss')
            ];
            csvContent += row.join(',') + "\n";
        }

        // Create download link
        var blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        var link = document.createElement("a");
        var url = URL.createObjectURL(blob);

        link.setAttribute("href", url);
        link.setAttribute("download", "Summary_" + s.summaryModalTitle.replace(/\s+/g, '_') + "_" + s.ddl_year + "_" + s.ddl_month + ".csv");
        link.style.visibility = 'hidden';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Custom filter function for modal search
    s.filterSummaryList = function (item) {
        if (!s.summarySearchText || s.summarySearchText.trim() === '') {
            return true;
        }
        var searchText = s.summarySearchText.toLowerCase();
        var employeeName = (item.employee_name || '').toLowerCase();
        var emplId = (item.empl_id || '').toString().toLowerCase();
        var department = (item.department_short_name || '').toLowerCase();

        return employeeName.indexOf(searchText) !== -1 ||
               emplId.indexOf(searchText) !== -1 ||
               department.indexOf(searchText) !== -1;
    };

    // Get filtered count for display
    s.getFilteredCount = function () {
        if (!s.filteredSummaryList) return 0;
        if (!s.summarySearchText || s.summarySearchText.trim() === '') {
            return s.filteredSummaryList.length;
        }
        return s.filteredSummaryList.filter(s.filterSummaryList).length;
    };

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
        if (par_v_result) {
            //Add class to the obect that need to focus as a required..
            $("#" + par_object_id).addClass("required");
            $("#lbl_" + par_object_id + "_req").text("Required Field -- (Cancel Pending or Disapprove)!");
        }
        else {
            //remove of refresh the object form being required

            $("#txtb_remarks").removeClass("required");
            $("#lbl_txtb_remarks_req").text("");

        }
    }

    //*********************************************//
    //*** Filter Page Grid
    //********************************************// 
    s.FilterPageGrid = function ()
    {
        $('#modal_generating_remittance').modal({ backdrop: 'static', keyboard: false });
        h.post("../cMonthEarns/FilterPageGrid", {
            par_year            : s.ddl_year,
            par_month           : s.ddl_month,
            par_department_code : s.ddl_dept,
            par_earning_type    : s.ddl_earning_type
        }).then(function (d)
        {
            if (d.data.message == "success")
            {
                s.oTable.fnClearTable();
                s.datalistgrid = d.data.data;
                s.datalist_grid = d.data.data;
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
        return '<table class="no-border" style="padding:0px !important;min-height:10px !important" > ' +
            '<tr>' +
            '<td style="width:24% !important;padding:0px 0px 0px 10px">Generated by:</td>' +
            '<td style="padding:0px">' + d.created_employee_name + '</td>' +
            '</tr>' +
            '<tr>' +
            '<td style="width:24% !important;padding:0px 0px 0px 10px">Generated Date/Time:</td>' +
            '<td style="padding:0px">' + moment(d.created_dttm).format('YYYY-MM-DD HH:mm:ss') + '</td>' +
            '</tr>' +
            '</table>';
    }
    //***********************************************************//
    //*** VJA - 02/29/2020 - Convert date to String from 1 to 01 if less than 10
    //***********************************************************// 
    function datestring(d)
    {
        var date_val = ""
        if (d < 10) {
            date_val = '0' + d
        } else {
            date_val = d
        }
        return date_val
    }

    s.btn_generate = function ()
    {
        if (s.ddl_dept === '')
        {
            swal("You cannot procceed", "Department / Office is Required", { icon: "warning" });
            return;
        }

        swal("ARE YOU SURE YOU WANT TO GENERATE EARN FOR DEPARTMENT " + $('#ddl_dept option:selected').text(), "FOR THE MONTH OF " + $('#ddl_month option:selected').text().toUpperCase() + ", " + $('#ddl_year option:selected').text(), {
            icon: "warning",
            closeOnClickOutside: false,
            closeOnEsc: false,
            dangerMode: true,
            buttons: {
                generate_earn: {
                    text : "Generate Earn " + $('#ddl_month option:selected').text() + ", " + $('#ddl_year option:selected').text(),
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
                    $('#modal_generating_remittance').modal({ backdrop: 'static', keyboard: false });
                    h.post("../cMonthEarns/GenerateEarn",
                        {
                             par_year            : s.ddl_year
                            ,par_month           : s.ddl_month
                            ,par_department_code : s.ddl_dept
                            ,par_empl_id         : ""
                            ,par_earning_type    : s.ddl_earning_type

                        }).then(function (d) {
                            if (d.data.message == "success")
                            {
                                if (d.data.data.return_flag == "Y")
                                {
                                    swal("Successfully Generated", d.data.data.return_msg, { icon: "success" });
                                }
                                else
                                {
                                    swal("No data Inserted on Monthly earnings", d.data.data.return_msg, { icon: "warning" });
                                }
                                s.FilterPageGrid();
                            }
                            else
                            {
                                swal("There something wrong!", d.data.message, { icon: "warning" });
                                s.FilterPageGrid();
                            }
                        })

                        break;

                    default:
                    //swal("Cancel Request!");
                }
            });
        }

        s.btn_regenerate = function ()
        {
            var selectedItems = s.getSelectedItemsFromModal();

            if (selectedItems.length === 0) {
                swal("No Selection", "Please select at least one employee to regenerate.", "warning");
                return;
            }

            var employeeIds = selectedItems.map(function(item) { return item.empl_id; });
            var employeeNames = selectedItems.slice(0, 3).map(function(item) { return item.employee_name; });
            var displayNames = employeeNames.join(", ") + (selectedItems.length > 3 ? " and " + (selectedItems.length - 3) + " more..." : "");

            swal({
                title: "Confirm Re-Generation",
                text: "You are about to re-generate earnings for " + selectedItems.length + " employee(s):\n\n" + displayNames,
                icon: "warning",
                closeOnClickOutside: false,
                closeOnEsc: false,
                dangerMode: true,
                buttons: {
                    regenerate: {
                        text: "Re-Generate (" + selectedItems.length + ")",
                        value: "regenerate"
                    },
                    cancel: {
                        text: "Cancel",
                        value: "cancel",
                        className: "red-bg"
                    }
                }
                }).then((value) => {
                    if (value === "regenerate") {
                        // Close the modal
                        $('#modal_summary_detail').modal('hide');

                        // Show loading
                        $('#loading_msg').text('RE-GENERATING');
                        $('#modal_generating_remittance').modal({ backdrop: 'static', keyboard: false });

                        h.post("../cMonthEarns/RegenerateEarnings", {
                            par_year: s.ddl_year,
                            par_month: s.ddl_month,
                            par_department_code: s.ddl_dept,
                            par_earning_type: s.ddl_earning_type,
                            par_employee_ids: employeeIds
                        }).then(function (d) {
                            $('#modal_generating_remittance').modal("hide");

                            if (d.data.message == "success") {
                                var report = d.data.report;
                                s.regenerateReport = report;
                                s.showRegenerateReport(report);
                            } else {
                                swal("Error", d.data.message || "An error occurred during re-generation.", "error");
                            }
                        }).catch(function(error) {
                            $('#modal_generating_remittance').modal("hide");
                            swal("Error", "An error occurred during re-generation.", "error");
                        });
                    }
                });
            }

            // ============================================
            // REGENERATE REPORT FUNCTIONS
            // ============================================
            s.regenerateReport = null;
            s.regenerateReportSearchText = '';

            s.showRegenerateReport = function(report) {
                s.regenerateReport = report;
                s.regenerateReportSearchText = '';

                // Build summary message
                var summaryMsg = "Total Processed: " + report.total_processed + "\n" +
                                "Success: " + report.success_count + "\n" +
                                "Failed: " + report.failed_count;

                if (report.failed_count > 0) {
                    // Show report modal for details if there are failures
                    $('#modal_regenerate_report').modal('show');
                } else {
                    // All successful - show success message and refresh
                    swal({
                        title: "Re-Generation Complete!",
                        text: summaryMsg,
                        icon: "success"
                    }).then(function() {
                        s.FilterPageGrid();
                    });
                }
            };

            s.getReportSuccessResults = function() {
                if (!s.regenerateReport || !s.regenerateReport.results) return [];
                return s.regenerateReport.results.filter(function(r) { return r.is_success; });
            };

            s.getReportFailedResults = function() {
                if (!s.regenerateReport || !s.regenerateReport.results) return [];
                return s.regenerateReport.results.filter(function(r) { return !r.is_success; });
            };

            s.filterReportList = function(item) {
                if (!s.regenerateReportSearchText || s.regenerateReportSearchText.trim() === '') {
                    return true;
                }
                var searchText = s.regenerateReportSearchText.toLowerCase();
                var emplId = (item.empl_id || '').toString().toLowerCase();
                var returnMsg = (item.return_msg || '').toLowerCase();

                return emplId.indexOf(searchText) !== -1 || returnMsg.indexOf(searchText) !== -1;
            };

            s.closeRegenerateReport = function() {
                $('#modal_regenerate_report').modal('hide');
                s.FilterPageGrid();
            };

            s.exportRegenerateReport = function() {
                if (!s.regenerateReport || !s.regenerateReport.results || s.regenerateReport.results.length === 0) {
                    swal("No Data", "There are no records to export.", "warning");
                    return;
                }

                // Create CSV content
                var csvContent = "No.,Employee ID,Status,Message\n";

                for (var i = 0; i < s.regenerateReport.results.length; i++) {
                    var item = s.regenerateReport.results[i];
                    var row = [
                        (i + 1),
                        item.empl_id || '',
                        item.is_success ? 'Success' : 'Failed',
                        '"' + (item.return_msg || '').replace(/"/g, '""') + '"'
                    ];
                    csvContent += row.join(',') + "\n";
                }

                // Add summary
                csvContent += "\n";
                csvContent += "Summary\n";
                csvContent += "Total Processed," + s.regenerateReport.total_processed + "\n";
                csvContent += "Success," + s.regenerateReport.success_count + "\n";
                csvContent += "Failed," + s.regenerateReport.failed_count + "\n";

                // Create download link
                var blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                var link = document.createElement("a");
                var url = URL.createObjectURL(blob);

                link.setAttribute("href", url);
                link.setAttribute("download", "Regenerate_Report_" + s.ddl_year + "_" + s.ddl_month + "_" + moment().format('YYYYMMDDHHmmss') + ".csv");
                link.style.visibility = 'hidden';

                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            };

})