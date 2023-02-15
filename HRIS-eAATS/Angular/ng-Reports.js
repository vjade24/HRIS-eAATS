ng_HRD_App.controller("cReports_ctrlr", function ($scope, $http, $filter,$window) {
    var s = $scope
    var h = $http
    var w = $window

    s.show_initializing = true;
    function init()
    {
        h.post("../Reports/toCrystalData").then(function (d) {
            var params = ""
            var ReportName = d.data.ReportName
            var SaveName = d.data.SaveName
            var ReportType = d.data.ReportType
            var ReportPath = d.data.ReportPath
            var Sp = d.data.Sp
            var isUserLogin = d.data.isUserLogin
            if (isUserLogin == undefined) {
                location.href = "../Login/Index"
            }
            h.post("../Reports/SessionRemove")


            $("#ReportFrame").attr("src", "../Reports/CrystalViewer.aspx?Params=" + params
                + "&ReportName=" + ReportName
                + "&SaveName=" + SaveName
                + "&ReportType=" + ReportType
                + "&ReportPath=" + ReportPath
                + "&id=" + Sp
            );
            $('#ReportFrame').load(function () {
                console.log("gg");
                
            });
            s.show_initializing = false;
        });
       
    }

   

    

    init()
    
})
