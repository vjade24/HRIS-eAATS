ng_HRD_App.controller("LoginCtrlr", function ($scope, $http, $filter)
{
    var s = $scope
    var h = $http
    s.login_msg = "";
    function init()
    {
        h.post("../Login/isUserLogin").then(function (d)
        {
            if (d.data.isLogin == 1)
            {
                location.href = "../cMainPage/Index"
            }
        })
    }
    init()
    s.btn_Login_Submit = function()
    {
        $('#login_icon').removeClass();
        $('#login_icon').addClass('fa fa-refresh fa-spin');
        
            if ((s.txt_username == "" || s.txt_username == null)&& (s.txt_password =="" || s.txt_password == null))
            {
                alert("Field should not be empty");

                $('#login_icon').removeClass();
                $('#login_icon').addClass('fa fa-sign-in');
            }
            else
            {

                $('#login_icon').removeClass();
                $('#login_icon').addClass('fa fa-refresh fa-spin');

                h.post("../Login/Login_Validation", { username: s.txt_username, password: s.txt_password }).then(function (d) {
                    if (d.data.success > 0)
                    {
                            if (d.data.data.log_in_flag != "Y") {
                                $("#lbl_txtb_password_req").text(d.data.data.log_in_flag_descr);
                            }
                            else
                            {
                                if (Object.keys(d.data.data).length > 0) {
                                    location.href = "../cMainPage/Index"
                                }
                                else
                                {

                                    $("#lbl_txtb_password_req").text(d.data.data.log_in_flag_descr);
                                }
                        }
                        $('#login_icon').removeClass();
                        $('#login_icon').addClass('fa fa-sign-in');
                    }
                    else
                    {
                        $("#lbl_txtb_password_req").text("Invalid User.");
                        $('#login_icon').removeClass();
                        $('#login_icon').addClass('fa fa-sign-in');
                    }
                })

            }

    }
   
})