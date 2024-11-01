﻿ng_HRD_App.controller("cRepForgot2Punch_ctrlr", function (commonScript,$scope, $compile, $http, $filter) {
    var s = $scope
    var h = $http
    var cs = commonScript
    s.year = [];

    var currentYear = new Date().getFullYear();
    var currentMonth = new Date().getMonth();

    function RetrieveYear() {
        var prev_year = currentYear - 2;
        for (var i = 1; i <= 5; i++) {
            var data = { "year": prev_year }
            s.year.push(data)
            prev_year++;
            if (i == 5) {
                s.ddl_payroll_year = currentYear;
                $("#ddl_payroll_year").val(currentYear);
                s.ddl_month = cs.leadingZeroMonth(currentMonth)
                $("#ddl_month").val(cs.leadingZeroMonth(currentMonth));
            }
        }
    }

  
    function init() {
       
        RetrieveYear();
        setTimeout(function () {
            s.ddl_payroll_year = currentYear;
            $("#ddl_payroll_year").val(currentYear);
            s.ddl_month = cs.leadingZeroMonth(currentMonth)
            $("#ddl_month").val(cs.leadingZeroMonth(currentMonth));
        }, 500)


        h.post("../cRepForgot2Punch/InitializePage").then(function (d) {
            if (d.data.message == "success") {
                console.log(d.data.empl_names)
                s.empl_names = d.data.empl_names

            }
          
        })

    }

    init()
    function isValidate()
    {
        var check = true
        if ($("#txtb_date_fr").val().trim() == "") {
            check = false
        }

        if ($("#txtb_date_to").val().trim() == "") {
            check = false
        }
        

        return check

    }

    s.btn_ftp_print = function () {
        var yr = cs.getValue("ddl_payroll_year")
        var mo = cs.getValue("ddl_month")
        var fr = $("#txtb_date_fr").val()
        var to = $("#txtb_date_to").val()
        var empl_id = $("#ddl_name").val()

        if (isValidate()) {
            cs.loading("show")
            h.post("../cRepForgot2Punch/checklist", {
                year: yr,
                month: mo,
                period_from: fr,
                period_to: to,
                empl_id: empl_id
            }).then(function (d) {
                if (d.data.icon == "success") {
                    if (d.data.checklist.length > 0)
                    {
                        var controller = "Reports"
                        var action = "Index"
                        var ReportName = "cryForgotPunchList"
                        var SaveName = "Crystal_Report"
                        var ReportType = "inline"
                        var ReportPath = ""
                        var sp = ""

                        ReportPath = "~/Reports/cryForgotPunchList/cryForgotPunchList.rpt"
                        sp = "sp_forgot_punch_rep,p_rep_year," + yr + ",p_rep_month," + mo
                            + ",p_rep_date_from," + fr
                            + ",p_rep_date_to," + to
                            + ",p_empl_id," + empl_id

                        var iframe = document.getElementById('iframe_print_preview');
                        var iframe_page = $("#iframe_print_preview")[0];
                        iframe.style.visibility = "hidden";

                        s.embed_link = "../Reports/CrystalViewer.aspx?Params=" + ""
                            + "&ReportName=" + ReportName
                            + "&SaveName=" + SaveName
                            + "&ReportType=" + ReportType
                            + "&ReportPath=" + ReportPath
                            + "&id=" + sp //+ parameters
                        s.Modal_title = "PRINT PREVIEW"
                        if (!/*@cc_on!@*/0) { //if not IE
                            iframe.onload = function () {
                                iframe.style.visibility = "visible";
                                cs.loading("hide")

                            };
                        }
                        else if (iframe_page.innerHTML()) {
                            // get and check the Title (and H tags if you want)
                            var ifTitle = iframe_page.contentDocument.title;
                            if (ifTitle.indexOf("404") >= 0) {
                                swal("You cannot Preview this Report", "There something wrong!", { icon: "warning" });
                                iframe.src = "";

                                s.loading_r = false;
                                $('#print_preview_modal').modal("hide");
                            }
                            else if (ifTitle != "") {
                                swal("You cannot Preview this Report", "There something wrong!", { icon: "warning" });
                                iframe.src = "";

                                s.loading_r = false;
                                $('#print_preview_modal').modal("hide");
                            }
                        }
                        else {
                            iframe.onreadystatechange = function () {
                                if (iframe.readyState == "complete") {
                                    iframe.style.visibility = "visible";
                                    cs.loading("hide")

                                }
                            };
                        }

                        s.loading_r = false;

                        iframe.src = s.embed_link;
                        $('#print_preview_modal').modal({ backdrop: 'static', keyboard: false });
                        //location.href = "../" + controller + "/" + action + "?ReportName=" + ReportName
                        //    + "&SaveName=" + SaveName
                        //    + "&ReportType=" + ReportType
                        //    + "&ReportPath=" + ReportPath
                        //    + "&Sp=" + sp

                    }
                    else {
                        cs.loading("hide")
                        swal("No data found!","", { icon: "warning" })
                    }
                }
                else {
                    cs.loading("hide")
                    swal("Error: " + d.data.message, { icon: "error" })
                }
            })
        }

        else {
            swal("Field is required.","You have left a field empty.", { icon: "warning" })
        }
       
      
    }

   
    
});

