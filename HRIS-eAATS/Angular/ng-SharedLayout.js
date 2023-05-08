


ng_HRD_App.filter('jsonDate', ['$filter', function ($filter) {
    return function (input, format) {
        return (input) ? $filter('date')(parseInt(input.substr(6)), format) : '';
    };
}]);


ng_HRD_App.controller("SharedLayoutCtrlr", function ($scope, $http, $filter) {
    var s = $scope
    var h = $http
    s.hideThis = false
    s.controller = "Home"
    s.Action1 = "Index"
    s.Action2 = "About"
    s.Action3 = "Contact"
    var group = new Array()
    s.session_var = null;

    s.show_spinner = true;
   
    var init = function ()
    {
        s.todays_date = moment(new Date()).format('MMM D, YYYY').toString();
        CheckSession();
        get_notification();
    }
   

    init();

    
    
    function newEl(tag)
    {
        return document.createElement(tag);
    }

    function createImageFromRGBdata(rgbData, width, height)
    {
        var mCanvas = newEl('canvas');
        mCanvas.width = width;
        mCanvas.height = height;
	    
        var mContext = mCanvas.getContext('2d');
        var mImgData = mContext.createImageData(width, height);
	
        var srcIndex=0, dstIndex=0, curPixelNum=0;
        mContext.putImageData(mImgData, 0, 0);
        return mCanvas;
    }
    
    //**************************************//
    //********collapse-expand-menu**********//
    //**************************************// 
    s.collapse = function (val, id, hasUrl)
    {

        if (hasUrl == 1) return
        var menulink = 0
        var menulvl = findMenu(id)[0].menu_level
        if(menulvl == 1)
        {
            group = new Array()
            group.push(id)
        }
        else
        {
            var p = group.filter(function (d)
            {
                return d == id
            })
            if (p == null || p == "") group.push(id)
           
        }
        angular.forEach(s.MenuList, function (value) {
            var active = group.filter(function (d)
            {
                return d == value.id
            })
            if (value.id == id)
            {

                menulink = value.menu_id_link
                if (value.isOpen == 0)
                {
                    value.isOpen = 1
                    h.post("../Menu/expandedAdd", { id: id, menulevel: value.menu_level})
                }
                else {
                    value.isOpen = 0
                    h.post("../Menu/expandedRemove", { id: id })
                }
            }
            else
            {
                if (active != value.id) value.isOpen = 0
            }
        })
    }
    //***********************Functions end*************************************************************//


    //**************************************//
    //**************find-menu***************//
    //**************************************// 
    var findMenu = function (id)
    {
        return data = s.MenuList.filter(function (d)
        {
            return d.id == id
        })
    }
    //***********************Functions end*************************************************************//



    //**************************************//
    //****************log-out***************//
    //**************************************// 
     s.logout = function ()
    {
        h.post("../Login/logout").then(function (d)
        {
            if (d.data == "expire")
            {
                location.href = "../Login/Index"
            }
        })
    }
    //***********************Functions end*************************************************************//


    //**************************************//
    //************location-redirect*********//
    //**************************************// 
    s.setActive = function (lst)
    {
        h.post("../Menu/UserAccessOnPage", { list: lst }).then(function (d) {
            //console.log(lst)
            if (d.data == "success") {
                //console.log("../" + lst.id)
                location.href = "../" + lst.url_name

            }

        });
    }

    function CheckSession()
    {
        //if (localStorage.getItem("MenuList").toString() != "")
        //{
        //    var obj = eval('(' + localStorage.getItem('MenuList') + ')');
        //    var res = [];
        //    for (var i in obj)
        //        res.push(obj[i]);
        //    
        //    s.MenuList = res
        //    s.username   = localStorage.getItem("username")
        //    s.imgprofile = localStorage.getItem("imgprofile")
        //
        //}
        //else
        //{

            h.post("../Login/CheckSessionLogin").then(function (d) {
                if (d.data == "expire") {
                    location.href = "../Login/Index"
                }
                else if (d.data == "active") {
                    s.session_var = d.data;
                    h.post("../Menu/GetMenuList").then(function (d) {
                    
                        s.MenuList = d.data.data
                    
                        s.username = d.data.username
                        var photo = d.data.photo
                    
                        if (d.data.photo != "data:image/png;base64,")
                        {
                            s.imgprofile = photo;
                        }
                        else {
                            s.imgprofile = "/ResourcesImages/upload_profile.png";
                        }

                        $('#imgprofile').attr('src', s.imgprofile)


                        // **************************
                        //localStorage.clear();
                        //var menu_lst = JSON.stringify(s.MenuList)
                        //JSON.stringify(localStorage.setItem("MenuList", menu_lst))
                        //localStorage.setItem("username", s.username);
                        //localStorage.setItem("imgprofile", s.imgprofile);
                        // **************************

                    
                        if (d.data.expanded != 0) {
                            angular.forEach(s.MenuList, function (value) {
                                if (value.url_name == null || value.url_name == "") value.hasUrl = 0
                                else value.hasUrl = 1
                                var exp = d.data.expanded.filter(function (d) {
                                    return d == value.id.toString()
                                })
                                if (exp == value.id.toString()) {
                                    value.isOpen = 1
                                    group.push(value.id);
                                }
                            })

                        }
                        else {
                            angular.forEach(s.MenuList, function (value) {
                                if (value.url_name == null || value.url_name == "") value.hasUrl = 0
                                else value.hasUrl = 1
                                value.isOpen = 0;
                            })
                        }
                    })

                    //h.post("../Login/Current_Value").then(function (d) {
                    //    //console.log(d.data.session_time)
                    //    $('#hideMsg1 span').text(d.data.session_time);
                    //    var sec = d.data.session_time * 60000;
                    //    var timer = setInterval(function () {
                    //        $('#hideMsg span').text(sec--);
                    //        if (sec == -1) {
                    //            $('#hideMsg').fadeOut('fast');
                    //            clearInterval(timer);
                    //        }
                    //    }, 1000);
                    //});
                
                }
            })
        //}

    }
    //**************************************//
    //    Download Manual for Each Page
    //**************************************// 
    s.dl_manual = function () {
        h.post("../Menu/DL_manual").then(function (d) {
            var current_url = d.data.current_page;
            var value = current_url.substring(current_url.lastIndexOf('/') + 1);
            var value2 = value.split('?')[0]
            var title = value.split("title=").pop();
            var type = value.split("eType=").pop();
            //console.log(value2);
            //console.log(title);
            //console.log(type);

            h.post("../Login/SetHistoryPage").then(function (d) {
                if (d.data.path != "") {
                    var downloadPath = "";
                    var win_flag = "";
                    switch (value2) {
                        case "cCashAdv":                                                       //Cash Advance Manual
                            downloadPath = 'ManualDoc/CashAdvanceforPayroll.pdf'
                            break;
                        case "cTransPostPay":                                                  //Transmittal Header Manual
                            downloadPath = 'ManualDoc/PostPayrollVoucher.pdf'
                            break;
                        case "cTransPostPayDetails/":                                           //Transmittal Details Manual
                            downloadPath = 'ManualDoc/PostPayrollDetails.pdf'
                            break;
                        case "cRemitAutoGen":                                                  //Remittance Auto Generation Manual
                            downloadPath = 'ManualDoc/RemittanceGeneration.pdf'
                            break;
                        case "cRemitLedger":                                                   //Remittance Ledger Manual
                            downloadPath = 'ManualDoc/RemittanceLedger.pdf'
                            break;
                        case "cRemitLedgerGSIS":                                               //Remittance GSIS Manual
                            downloadPath = 'ManualDoc/RemittanceLedgerGSIS.pdf'
                            break;
                        case "cRemitLedgerHDMF":                                               //Remittance HDMF Manual
                            downloadPath = 'ManualDoc/RemittanceLedgerHDMF.pdf'
                            break;
                        case "cRemitLedgerPHIC":                                               //Remittance PHIC Manual
                            downloadPath = 'ManualDoc/RemittanceLedgerPHIC.pdf'
                            break;
                        case "cRemitLedgerSSS":                                                //Remittance SSS Manual
                            downloadPath = 'ManualDoc/RemittanceLedgerSSS.pdf'
                            break;
                        case "cRemitLedgerOthers":                                             //Remittance Other Manual
                            if (title == "NICO" || title == "CCMPC") {
                                downloadPath = 'ManualDoc/RemittanceLedgerCCMPC-NICO.pdf'
                            }
                            else if (title == "ONE NETWORK BANK" || title == "PHILAM LIFE" || title == "NHMFC") {
                                downloadPath = 'ManualDoc/RemittanceLedgerPHILAMLIFE-ONENETWORKBANK-NHMFC.pdf'
                            }
                            break;
                        default:                                                                //Default Manual
                            win_flag = "no";
                            swal("For this page at this moment!", { icon: "warning", title: "No Manual Available", });
                            break;
                    }

                    if (win_flag == "") {
                        window.open(downloadPath, '_blank', '');
                    }

                }
            })
        })
    }
    //***********************Functions end*************************************************************//

    //**************************************//
    //************GET NOTIFICATION*********//
    //**************************************// 

    function get_notification()
    {
        h.post("../Menu/GetNotification").then(function (d) {
            if (d.data.message == "success") {
                s.NotifList = d.data.notif_list;
                s.InfoList = d.data.info_list;
                s.notifLst_length = d.data.notif_list.length;
                
            }
        });

        if (s.notifLst_length > 0) {
            s.show_no_alerts = false;
            s.show_spinner = true;

            setTimeout(function () {
                s.show_spinner = false;
            }, 300);
        }
        else {
            s.show_no_alerts = true;
            s.show_spinner = false;
        }
        
    }

    //**************************************//
    //************GET NOTIFICATION*********//
    //**************************************// 
    s.get_notification_index = function() {
        get_notification();
    }

    s.notif_int_values = function (lst) {
        if (lst == "2") {
            return s.for_approval_leaveapp;
        }
        else if (lst == "201") {
            return s.unposted_leave;
        }
        else if (lst == "202") {
            return s.for_approval_ledger;
        }
        else {
            return 0;
        }
    }
    
    s.format_notif_short_msg = function (lst) {
        
        return lst.replace('->','');
    }

    s.label_class = function (lst) {
        if (lst == "2" || lst == "202") {
            return "label-success";
        }
        else {
            return "label-primary";
        }
    }

    s.btn_redirect_to_page = function (lst) {
        if (lst == "2") {
            swal("Approval for Leave Application is on Self-Service!", { icon: "warning", title: "Login to Self-Service", });
        }
        else if (lst == "201") {
            location.href = "../cLeaveLedger/";
        }
        else if (lst == "202") {
            location.href = "../cLeaveLedgerAppr/";
        }
        else {
            swal("Contact Developer!", { icon: "warning", title: "Somethings Wrong", });
        }
    }

    s.btn_redirect_posting = function (lst) {
        h.post("../Menu/RedirectParam", {
            par_empl_id: lst.empl_id
            , par_leave_ctrlno: lst.leave_ctrlno
        }).then(function (d) {
            if (d.data == "success") {
                location.href = lst.url_name;
            }

        });
    }

    s.show_date_label = function (lst) {
        if (lst == "Y") {
            return true;
        }
        else {
            return false;
        }
    }
    
    //s.convert_img = function (lst) {
    //    h.post("../Menu/ConvertImage", {
    //        par_empl_id: lst
    //    }).then(function (d) {
    //        if (d.data == "success") {
    //            var photo = d.data.imgDataURL

    //            if (d.data.photo != "data:image/png;base64,") {
    //                //s.imgprofile = photo;
    //                return photo;
    //            }
    //            else {
    //                //s.imgprofile = "/ResourcesImages/upload_profile.png";
    //                return "/ResourcesImages/upload_profile.png";
    //            }

    //        }
    //    });
    //}
    
})