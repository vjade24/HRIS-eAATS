using HRIS_eAATS.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;

namespace HRIS_eAATS.Controllers
{
    public class MenuController : Controller
    {
        HRIS_DEVEntities db = new HRIS_DEVEntities();
        HRIS_ATSEntities db_ats = new HRIS_ATSEntities();
        // GET: Menu
        public ActionResult Index()
        {
            return View();
        }
        protected JsonResult JSON(object data, JsonRequestBehavior behavior)
        {
            return new JsonResult()
            {
                Data = data,
                ContentType = "application/json",
                ContentEncoding = Encoding.UTF8,
                JsonRequestBehavior = behavior,
                MaxJsonLength = Int32.MaxValue
            };
        }
        public ActionResult GetMenuList()
        {
            Session["history_page"] = "";
            //menulst = (List<Object>)Session["menu"];
            if (Session["user_id"] != null)
            {
                var empl_id = Session["empl_id"].ToString();

                //var emp_photo_byte_arr = db.personnel_tbl.Where(a => a.empl_id == empl_id).FirstOrDefault().empl_photo_img;

                // string imreBase64Data = "";
                var url = Request.Url.Host;
                //string imgDataURL = (url == "hris.dvodeoro.ph" ? "http://122.53.120.18:8050/storage/images" + emp_photo_byte_arr : "http://192.168.5.218/storage/images" + emp_photo_byte_arr);
                var img_link = System.Configuration.ConfigurationManager.AppSettings["img_link_local"];
                if (Request.Url.Host == "hris.dvodeoro.ph")
                {
                    img_link = System.Configuration.ConfigurationManager.AppSettings["img_link_online"];
                }
                string imgDataURL = img_link + "/storage/images/photo/thumb/"  +empl_id;
                //***************convert byte array to image***********************************
                //if (emp_photo_byte_arr != null)
                //{
                //    imreBase64Data = Convert.ToBase64String(emp_photo_byte_arr);
                //    imgDataURL = string.Format("data:image/png;base64,{0}", imreBase64Data);
                //}
                //else
                //{
                //    imgDataURL = "../ResourcesImages/upload_profile.png";
                //}
                //*****************************************************************************

                var data = db.sp_user_menu_access_role_list_ATS(Session["user_id"].ToString()).ToList();
                
                var User_Name = Session["first_name"].ToString() + " " + Session["last_name"];
                if (Session["expanded"] != null) return JSON(new { data = data, expanded = Session["expanded"], photo = imgDataURL, success = 1, username = User_Name }, JsonRequestBehavior.AllowGet);
                else return JSON(new { data = data, expanded = 0, photo = imgDataURL, success = 1, username = User_Name }, JsonRequestBehavior.AllowGet);
            }
            else
            {
                return RedirectToAction("Index", "Login");
                //return Json(new { data = 0, success = 0 }, JsonRequestBehavior.AllowGet);
            }

        }

        //public ActionResult GetNotification()
        //{
        //    if (Session["user_id"] != null)
        //    {
        //        var user_id = Session["user_id"].ToString();
                
        //        var notif_list  = "";
        //        var info_list = "";
                
        //        return JSON(new { message = "success", notif_list, info_list }, JsonRequestBehavior.AllowGet);
        //    }
        //    else
        //    {
        //        return RedirectToAction("Index", "Login");
        //    }

        //}

        public ActionResult GetLedgerInfo(string par_view_mode, string par_department_code)
        {
            Session["cLV_Ledger_employee_name"] = "";
            if (Session["user_id"] != null)
            {
                db_ats.Database.CommandTimeout = int.MaxValue;
                var log_empl_id = Session["empl_id"].ToString();

                var user_id             = Session["user_id"].ToString();
                //var info_list           = db_ats.sp_lv_info(user_id).ToList();
                //var info_list2          = db_ats.sp_lv_info2(user_id).ToList().OrderBy(a => a.url_name).ToList();
                var info_list2           = from a in db_ats.sp_lv_info2(user_id).ToList()
                                           join b in db_ats.leave_application_mone_tbl 
                                           on new { a.empl_id,a.leave_ctrlno } equals new { b.empl_id,b.leave_ctrlno} into temp
                                           from b in temp.DefaultIfEmpty()
                                           select new
                                           {
                                             a.leave_ctrlno 
                                            ,a.empl_id 
                                            ,a.employee_name 
                                            ,a.department_code 
                                            ,a.leave_type_code 
                                            ,a.leavetype_descr 
                                            ,a.inclusive_dates 
                                            ,a.leave_subtype_code  
                                            ,a.leavesubtype_descr 
                                            ,a.date_applied    
                                            ,a.created_date_only 
                                            ,a.url_name    
                                            ,a.ledger_status 
                                            ,a.disapproved_remakrs
                                            ,mone = b
                                           };
                info_list2 = info_list2.OrderBy(a => a.url_name).ToList();
                var info_list2_no_filter = info_list2;
                var lv_admin_dept_list   = db_ats.vw_leaveadmin_tbl_list.Where(a => a.empl_id == log_empl_id).OrderBy(a => a.department_code);

                var info_list2_chart = from s in info_list2.ToList()
                                       join r in db.vw_departments_tbl_list
                                        on s.department_code equals r.department_code
                                       orderby s.department_code
                                       group r by r.department_code into g
                                       select new
                                       {
                                           department_short_name = (from l in g select l.department_short_name).Distinct(),
                                         Count = (from l in g select l.department_short_name).Count()
                                       };
                //var info_list2_donut_chart = db_ats.sp_ledgerposting_for_approval_list(Session["user_id"].ToString(), "N",DateTime.Now, DateTime.Now).ToList();
                var init_donut             = db_ats.sp_ledgerposting_for_approval_list(Session["user_id"].ToString(), "N", DateTime.Now, DateTime.Now).ToList();
                var info_list2_donut_chart = from t1 in init_donut
                                                      where (from t2 in lv_admin_dept_list.ToList()
                                                             where t2.empl_id == log_empl_id
                                                             && t2.approver   == true
                                                             select t2.department_code).Contains(t1.department_code)
                                                      select t1;

                if (par_department_code == "" && par_view_mode == "1")
                {
                    info_list2 = info_list2.ToList();
                }
                else
                {
                    if (par_view_mode == "2")     // Leave
                    {
                        info_list2 = info_list2.Where(a => a.leave_type_code != "CTO").ToList().OrderBy(a => a.url_name).ToList();
                        if (par_department_code != "")
                        {
                            info_list2 = info_list2.Where(a => a.leave_type_code != "CTO" && a.department_code == par_department_code).ToList().OrderBy(a => a.url_name).ToList();
                        }
                    }
                    else if (par_view_mode == "3") // CTO
                    {
                        info_list2 = info_list2.Where(a => a.leave_type_code == "CTO").ToList().OrderBy(a => a.url_name).ToList();
                        if (par_department_code != "")
                        {
                            info_list2 = info_list2.Where(a => a.leave_type_code == "CTO" && a.department_code == par_department_code).ToList().OrderBy(a => a.url_name).ToList();
                        }
                    }
                    else                            // Both Leave and CTO 
                    {
                        info_list2 = info_list2.ToList().OrderBy(a => a.url_name).ToList();
                        if (par_department_code != "")
                        {
                            info_list2 = info_list2.Where(a => a.department_code == par_department_code).ToList().OrderBy(a => a.url_name).ToList();
                        }
                    }
                }
                
                var total_leave_review        = info_list2_no_filter.Where(a => a.url_name == "../cLeaveLedger").ToList().Count;
                var total_leave_review_leave  = info_list2_no_filter.Where(a => a.url_name == "../cLeaveLedger" && a.leave_type_code != "CTO").ToList().Count;
                var total_leave_review_cto    = info_list2_no_filter.Where(a => a.url_name == "../cLeaveLedger" && a.leave_type_code == "CTO").ToList().Count;
                var total_leave_cancellation  = info_list2_no_filter.Where(a => a.url_name != "../cLeaveLedger").ToList().Count;
                var total_leave_printing      = 0; //db_ats.sp_leave_printing_list(null, null, "", user_id,"N").ToList().Count;
                var total_leave_transmittal   = db_ats.transmittal_leave_hdr_tbl.Where(a => a.created_by.Replace("U", "") == user_id.Replace("U","") && a.doc_status == "N" ).ToList().Count ;
                var total_leave_posted_cancellation  = info_list2_no_filter.Where(a => a.url_name == "").ToList().Count;

                return JSON(new { message = "success",  info_list2, lv_admin_dept_list, info_list2_chart
                    , total_leave_review
                    , total_leave_review_leave
                    , total_leave_review_cto
                    , total_leave_cancellation
                    , total_leave_printing 
                    , total_leave_transmittal 
                    , info_list2_donut_chart
                    , info_list2_no_filter
                    ,total_leave_posted_cancellation
                }, JsonRequestBehavior.AllowGet);
            }
            else
            {
                return RedirectToAction("Index", "Login");
            }

        }

        //public ActionResult ConvertImage(string empl_id)
        //{
        //    try
        //    {
        //        var emp_photo_byte_arr = db.personnel_tbl.Where(a => a.empl_id == empl_id).FirstOrDefault().empl_photo_img;

        //        string imreBase64Data = "";
        //        string imgDataURL = "";
        //        //***************convert byte array to image***********************************
        //        if (emp_photo_byte_arr != null)
        //        {
        //            imreBase64Data = Convert.ToBase64String(emp_photo_byte_arr);
        //            imgDataURL = string.Format("data:image/png;base64,{0}", imreBase64Data);
        //        }
        //        else
        //        {
        //            imgDataURL = "../ResourcesImages/upload_profile.png";
        //        }

        //        return JSON(new { photo = imgDataURL }, JsonRequestBehavior.AllowGet);
        //    }
        //    catch (Exception e)
        //    {
        //        string message = e.Message;
        //        return Json(new { message = message }, JsonRequestBehavior.AllowGet);
        //    }
        //}

        //public ActionResult getUserImageId()
        //{
        //    var empl_id = Session["empl_id"].ToString();
        //    var emp_photo_byte_arr = db.personnel_tbl.Where(a => a.empl_id == empl_id).FirstOrDefault().empl_photo_img;

        //    return Json(emp_photo_byte_arr, JsonRequestBehavior.AllowGet);
        //}
        public ActionResult expandedAdd(string id, int menulevel)
        {
            List<String> ls = new List<string>();
            List<String> ls2 = new List<string>();
            if (menulevel == 1) Session["expanded"] = null;
            if (Session["expanded"] != null)
            {
                ls = (List<String>)Session["expanded"];
                foreach (string l in ls)
                {
                    ls2.Add(l);
                }
                ls2.Add(id);
                Session["expanded"] = ls2;
            }
            else
            {
                ls2.Add(id);
                Session["expanded"] = ls2;

            }
            return Json(Session["expanded"], JsonRequestBehavior.AllowGet);

        }
        public ActionResult expandedRemove(string id)
        {
            List<String> ls = new List<string>();

            if (Session["expanded"] != null)
            {
                ls = (List<String>)Session["expanded"];
                ls.Remove(id);
                Session["expanded"] = ls;
            }
            return Json(Session["expanded"], JsonRequestBehavior.AllowGet);
        }
        public ActionResult returnSesion()
        {

            return Json(Session["expanded"], JsonRequestBehavior.AllowGet);

        }
        public ActionResult UserAccessOnPage(sp_user_menu_access_role_list_ATS_Result list)
        {
            Session["allow_add"]            = list.allow_add;
            Session["allow_delete"]         = list.allow_delete;
            Session["allow_edit"]           = list.allow_edit;
            Session["allow_edit_history"]   = list.allow_edit_history;
            Session["allow_print"]          = list.allow_print;
            Session["allow_view"]           = list.allow_view;
            Session["url_name"]             = list.url_name;
            Session["page_title"]           = list.page_title;
            Session["id"]                   = list.id;
            Session["menu_name"]            = list.menu_name;

            Session["redirect_par"] = "";

            return Json("success", JsonRequestBehavior.AllowGet);
        }

        public ActionResult RedirectParam(string par_empl_id, string par_department_code, string par_employee_name, string par_leavetype_code, string par_view_mode)
        {
            Session["redirect_par"] = "par_empl_id," + par_empl_id + ",par_department_code," + par_department_code + ",par_leavetype_code," + par_leavetype_code + ",par_view_mode," + par_view_mode;
            Session["cLV_Ledger_employee_name"] = par_employee_name;

            return Json("success", JsonRequestBehavior.AllowGet);
        }
        public ActionResult DL_manual()
        {
            var current_page = Request.UrlReferrer.ToString();

            return Json(new { current_page }, JsonRequestBehavior.AllowGet);
        }

        public async Task<ActionResult> ApproveCancellation(string p_leave_ctrlno, string p_empl_id)
        {
            try
            {
                var message     = "";
                var user_id     = Session["user_id"].ToString().Trim();
                var chk_aprv    = db_ats.leave_application_cancel_tbl.Where(a => a.empl_id == p_empl_id && a.leave_ctrlno == p_leave_ctrlno).ToList();

                var lv_hdr      = db_ats.leave_application_hdr_tbl.Where(a => a.empl_id == p_empl_id && a.leave_ctrlno == p_leave_ctrlno).ToList().FirstOrDefault();
                var lv_dtl      = db_ats.leave_application_dtl_tbl.Where(a => a.empl_id == p_empl_id && a.leave_ctrlno == p_leave_ctrlno).ToList();
                var lv_dtl_cto  = db_ats.leave_application_dtl_cto_tbl.Where(a => a.leave_ctrlno == p_leave_ctrlno).ToList();
                if (chk_aprv != null)
                {
                    for (int i = 0; i < chk_aprv.Count; i++)
                    {
                        // Insert to Leave Application HDR if TRANSFER FORCE LEAVE (Type of Cancellation)
                        if ((chk_aprv[i].leave_cancel_type == "FL_TRNFR" || chk_aprv[i].leave_cancel_type == "HOL" || chk_aprv[i].leave_cancel_type == "WORK_SUS" || chk_aprv[i].leave_cancel_type == "CNCEL_ONLY") && chk_aprv[i].leave_transfer_date != null)
                        {
                            // Insert Header and Details
                            leave_application_hdr_tbl       data_hdr_insert         = new leave_application_hdr_tbl();
                            leave_application_dtl_tbl       data_dtl_insert         = new leave_application_dtl_tbl();
                            leave_application_dtl_cto_tbl   data_dtl_cto_insert     = new leave_application_dtl_cto_tbl();

                            decimal date_num_day_total = 0;
                            if (lv_dtl[0].leave_date_from == lv_dtl[0].leave_date_to)
                            {
                                date_num_day_total = decimal.Parse(lv_dtl[0].date_num_day_total.ToString());
                            }
                            else
                            {
                                date_num_day_total = (lv_hdr.leave_type_code == "CTO" ? 8 : 1);
                            }

                            var new_appl_nbr = db_ats.sp_generate_appl_nbr("leave_application_hdr_tbl", 8, "leave_ctrlno").ToList();
                            data_hdr_insert.leave_ctrlno                  = new_appl_nbr[0].ToString();
                            data_hdr_insert.empl_id                       = lv_hdr.empl_id                       ;
                            data_hdr_insert.date_applied                  = lv_hdr.date_applied                  ;
                            data_hdr_insert.leave_comments                = lv_hdr.leave_comments                ;
                            data_hdr_insert.leave_type_code               = lv_hdr.leave_type_code               ;
                            data_hdr_insert.leave_subtype_code            = lv_hdr.leave_subtype_code            ;
                            data_hdr_insert.number_of_days                = date_num_day_total;
                            data_hdr_insert.sl_restore_deduct             = (lv_hdr.leave_type_code == "SL" ? date_num_day_total : 0) ;
                            data_hdr_insert.vl_restore_deduct             = (lv_hdr.leave_type_code == "VL" || lv_hdr.leave_type_code == "FL" ? date_num_day_total : 0) ;
                            data_hdr_insert.oth_restore_deduct            = lv_hdr.oth_restore_deduct            ;
                            data_hdr_insert.leave_class                   = lv_hdr.leave_class                   ;
                            data_hdr_insert.leave_descr                   = lv_hdr.leave_descr                   ;
                            data_hdr_insert.details_remarks               = "Tranfered Leave"                    ;
                            data_hdr_insert.approval_status               = "N"                                  ;
                            data_hdr_insert.posting_status                = false;
                            data_hdr_insert.approval_id                   = ""                                   ;
                            data_hdr_insert.justification_flag            = lv_hdr.justification_flag            ;
                            data_hdr_insert.commutation                   = lv_hdr.commutation                   ;
                            data_hdr_insert.created_dttm                  = lv_hdr.created_dttm                  ;
                            data_hdr_insert.created_by_user               = lv_hdr.created_by_user               ;
                            data_hdr_insert.updated_dttm                  = lv_hdr.updated_dttm                  ;
                            data_hdr_insert.updated_by_user               = lv_hdr.updated_by_user               ;
                            data_hdr_insert.leaveledger_date              = lv_hdr.leaveledger_date              ;
                            data_hdr_insert.leaveledger_balance_as_of_sl  = lv_hdr.leaveledger_balance_as_of_sl  ;
                            data_hdr_insert.leaveledger_balance_as_of_vl  = lv_hdr.leaveledger_balance_as_of_vl  ;
                            data_hdr_insert.leaveledger_balance_as_of_oth = lv_hdr.leaveledger_balance_as_of_oth ;
                            data_hdr_insert.leaveledger_balance_as_of_sp  = lv_hdr.leaveledger_balance_as_of_sp  ;
                            data_hdr_insert.leaveledger_balance_as_of_fl  = lv_hdr.leaveledger_balance_as_of_fl  ;
                            data_hdr_insert.sp_restore_deduct             = (lv_hdr.leave_type_code == "SP" ? date_num_day_total : 0);
                            data_hdr_insert.fl_restore_deduct             = (lv_hdr.leave_type_code == "FL" ? date_num_day_total : 0);
                            data_hdr_insert.first_name                    = lv_hdr.first_name                    ;
                            data_hdr_insert.last_name                     = lv_hdr.last_name                     ;
                            data_hdr_insert.middle_name                   = lv_hdr.middle_name                   ;
                            data_hdr_insert.employment_type               = lv_hdr.employment_type               ;
                            data_hdr_insert.department_code               = lv_hdr.department_code               ;
                            data_hdr_insert.department_short_name         = lv_hdr.department_short_name         ;
                            data_hdr_insert.position_long_title           = lv_hdr.position_long_title           ;
                            data_hdr_insert.monthly_rate                  = lv_hdr.monthly_rate                  ;
                            data_hdr_insert.suffix_name                   = lv_hdr.suffix_name                   ;
                            data_hdr_insert.courtisy_title                = lv_hdr.courtisy_title                ;
                            data_hdr_insert.postfix_name                  = lv_hdr.postfix_name                  ;
                            
                            data_dtl_insert.leave_ctrlno                  = new_appl_nbr[0].ToString()  ;
                            data_dtl_insert.leave_date_from               = DateTime.Parse(chk_aprv[i].leave_transfer_date.ToString());
                            data_dtl_insert.leave_date_to                 = DateTime.Parse(chk_aprv[i].leave_transfer_date.ToString());
                            data_dtl_insert.date_num_day                  = lv_dtl[0].date_num_day         ;
                            data_dtl_insert.date_num_day_total            = date_num_day_total;
                            data_dtl_insert.empl_id                       = lv_dtl[0].empl_id              ;
                            data_dtl_insert.rcrd_status                   = "N"          ;


                            if (lv_dtl_cto.Count > 0)
                            {
                                data_dtl_cto_insert.leave_ctrlno              = new_appl_nbr[0].ToString();
                                data_dtl_cto_insert.leave_date_from           = DateTime.Parse(chk_aprv[i].leave_transfer_date.ToString());
                                data_dtl_cto_insert.leave_date_to             = DateTime.Parse(chk_aprv[i].leave_transfer_date.ToString());
                                data_dtl_cto_insert.cto_remarks               = lv_dtl_cto[0].cto_remarks;
                                db_ats.leave_application_dtl_cto_tbl.Add(data_dtl_cto_insert);
                            }
                            
                            db_ats.leave_application_hdr_tbl.Add(data_hdr_insert);
                            db_ats.leave_application_dtl_tbl.Add(data_dtl_insert);
                            await db_ats.SaveChangesAsync();

                            message = "success";
                        }
                        else
                        {
                            // Insert to Override if HOLIDAY AND WORK SUSPENSION (Type of Cancellation)
                            //var ovr_inst = db_ats.sp_approve_cancellation(p_empl_id, DateTime.Parse(chk_aprv[i].leave_cancel_date.ToString()).ToString("yyyy-MM-dd"), user_id);
                            message = "success";
                        }
                    }
                    if (message == "success")
                    {
                        // Update Leave Cancellation into Final Approve
                        chk_aprv.ForEach(a => a.leave_cancel_status = "F");
                        chk_aprv.ForEach(a => a.final_approved_user = user_id);
                        chk_aprv.ForEach(a => a.final_approved_dttm = DateTime.Now);

                        double days_count = 0;
                        double hours_count = 0;
                        for (int i = 0; i < lv_dtl.Count; i++)
                        {
                            days_count += (lv_dtl[i].leave_date_to - lv_dtl[i].leave_date_from).TotalDays;
                            hours_count += double.Parse(lv_dtl[i].date_num_day_total.ToString());
                        }
                        if ((lv_hdr.leave_type_code != "CTO" && days_count <= 0) ||
                            (lv_hdr.leave_type_code == "CTO" && days_count <= 0 && hours_count <= 8))
                        {
                            lv_hdr.posting_status = false; ;
                            lv_hdr.approval_status = "L";
                            lv_dtl.ForEach(a => a.rcrd_status = "L");
                        }

                        // *************************************************************
                        // **** VJA - 2023-06-01 -- Insert Leave Ledger History ********
                        // *************************************************************
                        var appl_status = "Cancellation Approved";
                        db_ats.sp_lv_ledger_history_insert("", p_leave_ctrlno, p_empl_id, appl_status, "", Session["user_id"].ToString());
                        // *************************************************************
                        // **** VJA - 2023-06-01 -- Insert Leave Ledger History ********
                        // *************************************************************

                        await db_ats.SaveChangesAsync();
                    }
                }
                else
                {
                    message = "No data Found !";
                }
                
                return Json(new { message }, JsonRequestBehavior.AllowGet);

            }
            catch (Exception e)
            {
                return Json(new { message = e.InnerException.Message.ToString() }, JsonRequestBehavior.AllowGet);
            }
        }

        public ActionResult ReturnCancellation(string p_leave_ctrlno, string p_empl_id, string returned_remarks)
        {
            var lv_cancel = db_ats.leave_application_cancel_tbl.Where(a => a.empl_id == p_empl_id && a.leave_ctrlno == p_leave_ctrlno).ToList();
            if (returned_remarks.ToString().Trim() != "" || returned_remarks != null)
            {
                for (int i = 0; i < lv_cancel.Count; i++)
                {
                    lv_cancel[i].leave_cancel_status   = "C";
                    lv_cancel[i].returned_user         = Session["user_id"].ToString().Trim();
                    lv_cancel[i].returned_dttm         = DateTime.Now;
                    lv_cancel[i].returned_remarks      = returned_remarks;
                }
                db_ats.SaveChangesAsync();
                return Json(new { lv_cancel, message = "success" }, JsonRequestBehavior.AllowGet);
            }
            else
            {
                return Json(new { message = "no-remarks" }, JsonRequestBehavior.AllowGet);
            }
        }

        public ActionResult CheckIfPosted(string p_leave_ctrlno, string p_empl_id)
        {
            try
            {
                var data = db_ats.lv_ledger_hdr_tbl.Where(a => a.empl_id == p_empl_id && a.leave_ctrlno == p_leave_ctrlno && a.approval_status == "F").ToList();
                return Json(new { message = "success",data }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                return Json(new { message = e.Message.ToString() }, JsonRequestBehavior.AllowGet);
            }
        }

        //*********************************************************************//
        // Created By   : Vincent Jade H. Alivio
        // Created Date : 05/05/2021
        // Description  : Initialized during pageload
        //*********************************************************************//
        public async Task<ActionResult> CancelLederPosted(string p_leave_ctrlno, string p_empl_id, string p_details_remarks)
        {
            try
            {
                db_ats.Database.CommandTimeout = int.MaxValue;
                var message         = "";
                var approval_status = "L";
                var user_id         = Session["user_id"].ToString();

                var chk         = db_ats.lv_ledger_hdr_tbl.Where(a => a.empl_id == p_empl_id && a.leave_ctrlno == p_leave_ctrlno && (a.approval_status == "F" || a.approval_status == "S")).OrderByDescending(a=> a.created_dttm).FirstOrDefault();
                var lv_appl     = db_ats.leave_application_hdr_tbl.Where(a => a.empl_id == p_empl_id && a.leave_ctrlno == p_leave_ctrlno).FirstOrDefault();

                if (chk != null)
                {
                    DateTime leave_ledger_date = DateTime.Parse(chk.leaveledger_date.ToString());
                    var data = db_ats.sp_lv_ledger_cancel(chk.ledger_ctrl_no, leave_ledger_date.ToString("yyyy-MM-dd"), user_id).FirstOrDefault();
                    if (data.result_flag == "Y")
                    {
                        var transac_apprvr = db.sp_update_transaction_in_approvalworkflow_tbl(lv_appl.approval_id, user_id, approval_status, "Ledger Post - Cancellation");

                        var chk_aprv = db_ats.leave_application_cancel_tbl.Where(a => a.empl_id == p_empl_id && a.leave_ctrlno == p_leave_ctrlno).ToList();

                        var lv_hdr      = db_ats.leave_application_hdr_tbl.Where(a => a.empl_id == p_empl_id && a.leave_ctrlno == p_leave_ctrlno).ToList().FirstOrDefault();
                        var lv_dtl      = db_ats.leave_application_dtl_tbl.Where(a => a.empl_id == p_empl_id && a.leave_ctrlno == p_leave_ctrlno).ToList();
                        var lv_dtl_cto  = db_ats.leave_application_dtl_cto_tbl.Where(a => a.leave_ctrlno == p_leave_ctrlno).ToList();

                        if (chk_aprv != null)
                        {
                            for (int i = 0; i < chk_aprv.Count; i++)
                            {
                                // Insert to Leave Application HDR if TRANSFER FORCE LEAVE (Type of Cancellation)
                                if ((chk_aprv[i].leave_cancel_type == "FL_TRNFR" || chk_aprv[i].leave_cancel_type == "HOL" || chk_aprv[i].leave_cancel_type == "WORK_SUS" || chk_aprv[i].leave_cancel_type == "CNCEL_ONLY") && chk_aprv[i].leave_transfer_date != null)
                                {
                                    // Insert Header and Details
                                    leave_application_hdr_tbl       data_hdr_insert         = new leave_application_hdr_tbl();
                                    leave_application_dtl_tbl       data_dtl_insert         = new leave_application_dtl_tbl();
                                    leave_application_dtl_cto_tbl   data_dtl_cto_insert     = new leave_application_dtl_cto_tbl();

                                    decimal date_num_day_total = 0;
                                    if (lv_dtl[0].leave_date_from == lv_dtl[0].leave_date_to)
                                    {
                                        date_num_day_total = decimal.Parse(lv_dtl[0].date_num_day_total.ToString());
                                    }
                                    else
                                    {
                                        date_num_day_total = (lv_hdr.leave_type_code == "CTO" ? 8 : 1);
                                    }

                                    var new_appl_nbr = db_ats.sp_generate_appl_nbr("leave_application_hdr_tbl", 8, "leave_ctrlno").ToList();
                                    data_hdr_insert.leave_ctrlno                  = new_appl_nbr[0].ToString();
                                    data_hdr_insert.empl_id                       = lv_hdr.empl_id                       ;
                                    data_hdr_insert.date_applied                  = lv_hdr.date_applied                  ;
                                    data_hdr_insert.leave_comments                = lv_hdr.leave_comments                ;
                                    data_hdr_insert.leave_type_code               = lv_hdr.leave_type_code               ;
                                    data_hdr_insert.leave_subtype_code            = lv_hdr.leave_subtype_code            ;
                                    data_hdr_insert.number_of_days                = date_num_day_total;
                                    data_hdr_insert.sl_restore_deduct             = (lv_hdr.leave_type_code == "SL" ? date_num_day_total : 0) ;
                                    data_hdr_insert.vl_restore_deduct             = (lv_hdr.leave_type_code == "VL" || lv_hdr.leave_type_code == "FL" ? date_num_day_total : 0) ;
                                    data_hdr_insert.oth_restore_deduct            = lv_hdr.oth_restore_deduct            ;
                                    data_hdr_insert.leave_class                   = lv_hdr.leave_class                   ;
                                    data_hdr_insert.leave_descr                   = lv_hdr.leave_descr                   ;
                                    data_hdr_insert.details_remarks               = "Tranfered Leave"                    ;
                                    data_hdr_insert.approval_status               = "N"                                  ;
                                    data_hdr_insert.posting_status                = false;
                                    data_hdr_insert.approval_id                   = ""                                   ;
                                    data_hdr_insert.justification_flag            = lv_hdr.justification_flag            ;
                                    data_hdr_insert.commutation                   = lv_hdr.commutation                   ;
                                    data_hdr_insert.created_dttm                  = lv_hdr.created_dttm                  ;
                                    data_hdr_insert.created_by_user               = lv_hdr.created_by_user               ;
                                    data_hdr_insert.updated_dttm                  = lv_hdr.updated_dttm                  ;
                                    data_hdr_insert.updated_by_user               = lv_hdr.updated_by_user               ;
                                    data_hdr_insert.leaveledger_date              = lv_hdr.leaveledger_date              ;
                                    data_hdr_insert.leaveledger_balance_as_of_sl  = lv_hdr.leaveledger_balance_as_of_sl  ;
                                    data_hdr_insert.leaveledger_balance_as_of_vl  = lv_hdr.leaveledger_balance_as_of_vl  ;
                                    data_hdr_insert.leaveledger_balance_as_of_oth = lv_hdr.leaveledger_balance_as_of_oth ;
                                    data_hdr_insert.leaveledger_balance_as_of_sp  = lv_hdr.leaveledger_balance_as_of_sp  ;
                                    data_hdr_insert.leaveledger_balance_as_of_fl  = lv_hdr.leaveledger_balance_as_of_fl  ;
                                    data_hdr_insert.sp_restore_deduct             = (lv_hdr.leave_type_code == "SP" ? date_num_day_total : 0);
                                    data_hdr_insert.fl_restore_deduct             = (lv_hdr.leave_type_code == "FL" ? date_num_day_total : 0);
                                    data_hdr_insert.first_name                    = lv_hdr.first_name                    ;
                                    data_hdr_insert.last_name                     = lv_hdr.last_name                     ;
                                    data_hdr_insert.middle_name                   = lv_hdr.middle_name                   ;
                                    data_hdr_insert.employment_type               = lv_hdr.employment_type               ;
                                    data_hdr_insert.department_code               = lv_hdr.department_code               ;
                                    data_hdr_insert.department_short_name         = lv_hdr.department_short_name         ;
                                    data_hdr_insert.position_long_title           = lv_hdr.position_long_title           ;
                                    data_hdr_insert.monthly_rate                  = lv_hdr.monthly_rate                  ;
                                    data_hdr_insert.suffix_name                   = lv_hdr.suffix_name                   ;
                                    data_hdr_insert.courtisy_title                = lv_hdr.courtisy_title                ;
                                    data_hdr_insert.postfix_name                  = lv_hdr.postfix_name                  ;

                                    data_dtl_insert.leave_ctrlno                  = new_appl_nbr[0].ToString()  ;
                                    data_dtl_insert.leave_date_from               = DateTime.Parse(chk_aprv[i].leave_transfer_date.ToString());
                                    data_dtl_insert.leave_date_to                 = DateTime.Parse(chk_aprv[i].leave_transfer_date.ToString());
                                    data_dtl_insert.date_num_day                  = lv_dtl[0].date_num_day         ;
                                    data_dtl_insert.date_num_day_total            = date_num_day_total;
                                    data_dtl_insert.empl_id                       = lv_dtl[0].empl_id              ;
                                    data_dtl_insert.rcrd_status                   = "N"          ;

                                    if (lv_dtl_cto.Count > 0)
                                    {
                                        data_dtl_cto_insert.leave_ctrlno              = new_appl_nbr[0].ToString();
                                        data_dtl_cto_insert.leave_date_from           = DateTime.Parse(chk_aprv[i].leave_transfer_date.ToString());
                                        data_dtl_cto_insert.leave_date_to             = DateTime.Parse(chk_aprv[i].leave_transfer_date.ToString());
                                        data_dtl_cto_insert.cto_remarks               = lv_dtl_cto[0].cto_remarks;
                                        db_ats.leave_application_dtl_cto_tbl.Add(data_dtl_cto_insert);
                                    }
                            
                                    db_ats.leave_application_hdr_tbl.Add(data_hdr_insert);
                                    db_ats.leave_application_dtl_tbl.Add(data_dtl_insert);
                                    await db_ats.SaveChangesAsync();

                                    message = "success";
                                }
                                else
                                {
                                    // Insert to Override if HOLIDAY AND WORK SUSPENSION (Type of Cancellation)
                                    //var ovr_inst = db_ats.sp_approve_cancellation(p_empl_id, DateTime.Parse(chk_aprv[i].leave_cancel_date.ToString()).ToString("yyyy-MM-dd"), user_id);

                                    message = "success";
                                }
                            }
                            if (message == "success")
                            {
                                // Update Leave Cancellation into Final Approve
                                chk_aprv.ForEach(a => a.leave_cancel_status = "F");
                                chk_aprv.ForEach(a => a.final_approved_user = user_id);
                                chk_aprv.ForEach(a => a.final_approved_dttm = DateTime.Now);
                                chk.details_remarks = p_details_remarks;

                                double days_count = 0;
                                double hours_count =0;
                                for (int i = 0; i < lv_dtl.Count; i++)
                                {
                                    days_count  += (lv_dtl[i].leave_date_to - lv_dtl[i].leave_date_from).TotalDays;
                                    hours_count += double.Parse(lv_dtl[i].date_num_day_total.ToString());
                                }
                                if ((lv_hdr.leave_type_code != "CTO" && days_count <= 0) ||
                                    (lv_hdr.leave_type_code == "CTO" && days_count <= 0 && hours_count <= 8))
                                {
                                    lv_hdr.posting_status   = false; ;
                                    lv_hdr.approval_status  = "L";
                                    lv_dtl.ForEach(a => a.rcrd_status = "L");
                                }

                                // *************************************************************
                                // **** VJA - 2023-06-01 -- Insert Leave Ledger History ********
                                // *************************************************************
                                var appl_status = "Cancellation Approved & Balance Restored";
                                db_ats.sp_lv_ledger_history_insert(chk.ledger_ctrl_no, p_leave_ctrlno, p_empl_id, appl_status, "", Session["user_id"].ToString());
                                // *************************************************************
                                // **** VJA - 2023-06-01 -- Insert Leave Ledger History ********
                                // *************************************************************

                                await db_ats.SaveChangesAsync();
                            }
                        }
                        else
                        {
                            message = "No data Found !";
                        }
                    }
                    else
                    {
                        message = data.result_msg;
                    }

                }
                return JSON(new{message}, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message;
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }
        public ActionResult Getmonewaiver(string par_leave_ctrlno, string par_empl_id)
        {
            try
            {
                var data_waiver = db.sp_leave_application_mone_waiver_rep(par_leave_ctrlno, par_empl_id, "").ToList();
                return Json(new { message= "success", data_waiver }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message;
                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
        }

        //public class JqueryDatatableParam
        //{
        //    public string sEcho { get; set; }
        //    public string sSearch { get; set; }
        //    public int iDisplayLength { get; set; }
        //    public int iDisplayStart { get; set; }
        //    public int iColumns { get; set; }
        //    public int iSortCol_0 { get; set; }
        //    public string sSortDir_0 { get; set; }
        //    public int iSortingCols { get; set; }
        //    public string sColumns { get; set; }
        //}

        //public ActionResult GetData(JqueryDatatableParam param)
        //{
        //    var user_id = Session["user_id"].ToString();
        //    var employees = db_ats.sp_lv_info2(user_id).ToList().OrderBy(a => a.url_name).ToList();

        //    if (!string.IsNullOrEmpty(param.sSearch))
        //    {
        //        employees = employees.Where(x => x.employee_name.ToLower().Contains(param.sSearch.ToLower())).ToList();
        //    }

        //    var sortColumnIndex = Convert.ToInt32(HttpContext.Request.QueryString["iSortCol_0"]);
        //    var sortDirection = HttpContext.Request.QueryString["sSortDir_0"];
        //    //if (sortColumnIndex == 3)
        //    //{
        //    //    employees = sortDirection == "asc" ? employees.OrderBy(c => c.Age) : employees.OrderByDescending(c => c.Age);
        //    //}
        //    //else if (sortColumnIndex == 4)
        //    //{
        //    //    employees = sortDirection == "asc" ? employees.OrderBy(c => c.StartDate) : employees.OrderByDescending(c => c.StartDate);
        //    //}
        //    //else if (sortColumnIndex == 5)
        //    //{
        //    //    employees = sortDirection == "asc" ? employees.OrderBy(c => c.Salary) : employees.OrderByDescending(c => c.Salary);
        //    //}
        //    //else
        //    //{
        //    //    Func<Employee, string> orderingFunction = e => sortColumnIndex == 0 ? e.Name : sortColumnIndex == 1 ? e.Position : e.Location;
        //    //    employees = sortDirection == "asc" ? employees.OrderBy(orderingFunction) : employees.OrderByDescending(orderingFunction);
        //    //}

        //    var displayResult = employees.Skip(param.iDisplayStart)
        //       .Take(param.iDisplayLength).ToList();
        //    var totalRecords = employees.Count();

        //    return Json(new
        //    {
        //        param.sEcho,
        //        iTotalRecords = totalRecords,
        //        iTotalDisplayRecords = totalRecords,
        //        aaData = displayResult
        //    }, JsonRequestBehavior.AllowGet);

        //}
        public ActionResult CheckIfRunningLeaveApplication(string p_leave_ctrlno, string p_empl_id)
        {
            try
            {
                var data = db_ats.leave_application_hdr_tbl.Where(a => a.empl_id == p_empl_id && a.leave_ctrlno == p_leave_ctrlno && (a.approval_status == "S" || a.approval_status == "R" || (a.approval_status == "F" && a.posting_status == false))).ToList();
                return Json(new { message = "success", data }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                return Json(new { message = e.Message.ToString() }, JsonRequestBehavior.AllowGet);
            }
        }
    }
}