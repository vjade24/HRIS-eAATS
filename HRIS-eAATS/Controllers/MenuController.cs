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

                var emp_photo_byte_arr = db.personnel_tbl.Where(a => a.empl_id == empl_id).FirstOrDefault().empl_photo_img;

                string imreBase64Data = "";
                string imgDataURL = "";
                //***************convert byte array to image***********************************
                if (emp_photo_byte_arr != null)
                {
                    imreBase64Data = Convert.ToBase64String(emp_photo_byte_arr);
                    imgDataURL = string.Format("data:image/png;base64,{0}", imreBase64Data);
                }
                else
                {
                    imgDataURL = "../ResourcesImages/upload_profile.png";
                }
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

        public ActionResult GetNotification()
        {
            if (Session["user_id"] != null)
            {
                var user_id = Session["user_id"].ToString();
                
                var notif_list  = "";
                var info_list = "";
                
                return JSON(new { message = "success", notif_list, info_list }, JsonRequestBehavior.AllowGet);
            }
            else
            {
                return RedirectToAction("Index", "Login");
            }

        }

        public ActionResult GetLedgerInfo(string par_view_mode, string par_department_code)
        {
            Session["cLV_Ledger_employee_name"] = "";
            if (Session["user_id"] != null)
            {
                db_ats.Database.CommandTimeout = int.MaxValue;
                var log_empl_id = Session["empl_id"].ToString();

                var user_id             = Session["user_id"].ToString();
                var info_list           = db_ats.sp_lv_info(user_id).ToList();
                var info_list2          = db_ats.sp_lv_info2(user_id).ToList().OrderBy(a => a.url_name).ToList();
                var lv_admin_dept_list  = db_ats.vw_leaveadmin_tbl_list.Where(a => a.empl_id == log_empl_id).OrderBy(a => a.department_code);

                var info_list2_chart = from s in db_ats.sp_lv_info2(user_id).ToList()
                                       join r in db.vw_departments_tbl_list
                                        on s.department_code equals r.department_code
                                       orderby s.department_code
                                       group r by r.department_code into g
                                       select new
                                       {
                                           department_short_name = (from l in g select l.department_short_name).Distinct(),
                                         Count = (from l in g select l.department_short_name).Count()
                                       };
                var info_list2_donut_chart = db_ats.sp_ledgerposting_for_approval_list(Session["user_id"].ToString(), "N").ToList();


                if (par_department_code == "" && par_view_mode == "1")
                {
                    info_list2 = db_ats.sp_lv_info2(user_id).ToList().OrderBy(a => a.url_name).ToList();
                }
                else
                {
                    if (par_view_mode == "2")     // Leave
                    {
                        info_list2 = db_ats.sp_lv_info2(user_id).Where(a => a.leave_type_code != "CTO").ToList().OrderBy(a => a.url_name).ToList();
                        if (par_department_code != "")
                        {
                            info_list2 = db_ats.sp_lv_info2(user_id).Where(a => a.leave_type_code != "CTO" && a.department_code == par_department_code).ToList().OrderBy(a => a.url_name).ToList();
                        }
                    }
                    else if (par_view_mode == "3") // CTO
                    {
                        info_list2 = db_ats.sp_lv_info2(user_id).Where(a => a.leave_type_code == "CTO").ToList().OrderBy(a => a.url_name).ToList();
                        if (par_department_code != "")
                        {
                            info_list2 = db_ats.sp_lv_info2(user_id).Where(a => a.leave_type_code == "CTO" && a.department_code == par_department_code).ToList().OrderBy(a => a.url_name).ToList();
                        }
                    }
                    else                            // Both Leave and CTO 
                    {
                        info_list2 = db_ats.sp_lv_info2(user_id).ToList().OrderBy(a => a.url_name).ToList();
                        if (par_department_code != "")
                        {
                            info_list2 = db_ats.sp_lv_info2(user_id).Where(a => a.department_code == par_department_code).ToList().OrderBy(a => a.url_name).ToList();
                        }
                    }
                }
                
                
                return JSON(new { message = "success", info_list, info_list2, lv_admin_dept_list, info_list2_chart, info_list2_donut_chart }, JsonRequestBehavior.AllowGet);
            }
            else
            {
                return RedirectToAction("Index", "Login");
            }

        }

        public ActionResult ConvertImage(string empl_id)
        {
            try
            {
                var emp_photo_byte_arr = db.personnel_tbl.Where(a => a.empl_id == empl_id).FirstOrDefault().empl_photo_img;

                string imreBase64Data = "";
                string imgDataURL = "";
                //***************convert byte array to image***********************************
                if (emp_photo_byte_arr != null)
                {
                    imreBase64Data = Convert.ToBase64String(emp_photo_byte_arr);
                    imgDataURL = string.Format("data:image/png;base64,{0}", imreBase64Data);
                }
                else
                {
                    imgDataURL = "../ResourcesImages/upload_profile.png";
                }

                return JSON(new { photo = imgDataURL }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message;
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }

        public ActionResult getUserImageId()
        {
            var empl_id = Session["empl_id"].ToString();
            var emp_photo_byte_arr = db.personnel_tbl.Where(a => a.empl_id == empl_id).FirstOrDefault().empl_photo_img;

            return Json(emp_photo_byte_arr, JsonRequestBehavior.AllowGet);
        }
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
                if (chk_aprv != null)
                {
                    for (int i = 0; i < chk_aprv.Count; i++)
                    {
                        // Insert to Leave Application HDR if TRANSFER FORCE LEAVE (Type of Cancellation)
                        if ((chk_aprv[i].leave_cancel_type == "FL_TRNFR" || chk_aprv[i].leave_cancel_type == "HOL" || chk_aprv[i].leave_cancel_type == "WORK_SUS" || chk_aprv[i].leave_cancel_type == "CNCEL_ONLY") && chk_aprv[i].leave_transfer_date != null)
                        {
                            var lv_hdr      = db_ats.leave_application_hdr_tbl.Where(a => a.empl_id == p_empl_id && a.leave_ctrlno == p_leave_ctrlno).ToList().FirstOrDefault();
                            var lv_dtl      = db_ats.leave_application_dtl_tbl.Where(a => a.empl_id == p_empl_id && a.leave_ctrlno == p_leave_ctrlno).ToList();
                            var lv_dtl_cto  = db_ats.leave_application_dtl_cto_tbl.Where(a => a.leave_ctrlno == p_leave_ctrlno).ToList();

                            // Update Header and Details
                            lv_hdr.posting_status                 = false;
                            lv_hdr.approval_status                = "L";
                            lv_dtl.ForEach(a => a.rcrd_status     = "L");

                            // Insert Header and Details
                            leave_application_hdr_tbl       data_hdr_insert         = new leave_application_hdr_tbl();
                            leave_application_dtl_tbl       data_dtl_insert         = new leave_application_dtl_tbl();
                            leave_application_dtl_cto_tbl   data_dtl_cto_insert     = new leave_application_dtl_cto_tbl();

                            var new_appl_nbr = db_ats.sp_generate_appl_nbr("leave_application_hdr_tbl", 8, "leave_ctrlno").ToList();
                            data_hdr_insert.leave_ctrlno                  = new_appl_nbr[0].ToString();
                            data_hdr_insert.empl_id                       = lv_hdr.empl_id                       ;
                            data_hdr_insert.date_applied                  = lv_hdr.date_applied                  ;
                            data_hdr_insert.leave_comments                = lv_hdr.leave_comments                ;
                            data_hdr_insert.leave_type_code               = lv_hdr.leave_type_code               ;
                            data_hdr_insert.leave_subtype_code            = lv_hdr.leave_subtype_code            ;
                            data_hdr_insert.number_of_days                = lv_hdr.number_of_days                ;
                            data_hdr_insert.sl_restore_deduct             = lv_hdr.sl_restore_deduct             ;
                            data_hdr_insert.vl_restore_deduct             = lv_hdr.vl_restore_deduct             ;
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
                            data_hdr_insert.sp_restore_deduct             = lv_hdr.sp_restore_deduct             ;
                            data_hdr_insert.fl_restore_deduct             = lv_hdr.fl_restore_deduct             ;
                            
                            data_dtl_insert.leave_ctrlno                  = new_appl_nbr[0].ToString()  ;
                            data_dtl_insert.leave_date_from               = DateTime.Parse(chk_aprv[i].leave_transfer_date.ToString());
                            data_dtl_insert.leave_date_to                 = DateTime.Parse(chk_aprv[i].leave_transfer_date.ToString());
                            data_dtl_insert.date_num_day                  = lv_dtl[0].date_num_day         ;
                            data_dtl_insert.date_num_day_total            = lv_dtl[0].date_num_day_total   ;
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
                            var ovr_inst = db_ats.sp_approve_cancellation(p_empl_id, DateTime.Parse(chk_aprv[i].leave_cancel_date.ToString()).ToString("yyyy-MM-dd"), user_id);
                            message = "success";
                        }
                    }
                    if (message == "success")
                    {
                        // Update Leave Cancellation into Final Approve
                        chk_aprv.ForEach(a => a.leave_cancel_status = "F");
                        chk_aprv.ForEach(a => a.final_approved_user = user_id);
                        chk_aprv.ForEach(a => a.final_approved_dttm = DateTime.Now);

                        var lv_hdr      = db_ats.leave_application_hdr_tbl.Where(a => a.empl_id == p_empl_id && a.leave_ctrlno == p_leave_ctrlno).ToList();
                        var lv_dtl      = db_ats.leave_application_dtl_tbl.Where(a => a.empl_id == p_empl_id && a.leave_ctrlno == p_leave_ctrlno).ToList();
                        var lv_dtl_cto  = db_ats.leave_application_dtl_cto_tbl.Where(a => a.leave_ctrlno == p_leave_ctrlno).ToList();

                        // Update Header and Details
                        lv_hdr.ForEach(a => a.posting_status  = false);
                        lv_hdr.ForEach(a => a.approval_status = "L");
                        lv_dtl.ForEach(a => a.rcrd_status     = "L");

                        // *************************************************************
                        // **** VJA - 2023-06-01 -- Insert Leave Ledger History ********
                        // *************************************************************
                        var appl_status = "Cancellation Approved";
                        db_ats.sp_lv_ledger_history_insert("", p_leave_ctrlno, appl_status, "", Session["user_id"].ToString());
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

                var chk         = db_ats.lv_ledger_hdr_tbl.Where(a => a.empl_id == p_empl_id && a.leave_ctrlno == p_leave_ctrlno && a.approval_status == "F").OrderByDescending(a=> a.created_dttm).FirstOrDefault();
                var lv_appl     = db_ats.leave_application_hdr_tbl.Where(a => a.empl_id == p_empl_id && a.leave_ctrlno == p_leave_ctrlno).FirstOrDefault();

                if (chk != null)
                {
                    var data    = db_ats.sp_lv_ledger_cancel(chk.ledger_ctrl_no, chk.leaveledger_date.ToString(), user_id).FirstOrDefault();
                    if (data.result_flag == "Y")
                    {
                        var transac_apprvr = db.sp_update_transaction_in_approvalworkflow_tbl(lv_appl.approval_id, user_id, approval_status, "Ledger Post - Cancellation");
                        
                        var chk_aprv    = db_ats.leave_application_cancel_tbl.Where(a => a.empl_id == p_empl_id && a.leave_ctrlno == p_leave_ctrlno).ToList();
                        if (chk_aprv != null)
                        {
                            for (int i = 0; i < chk_aprv.Count; i++)
                            {
                                // Insert to Leave Application HDR if TRANSFER FORCE LEAVE (Type of Cancellation)
                                if ((chk_aprv[i].leave_cancel_type == "FL_TRNFR" || chk_aprv[i].leave_cancel_type == "HOL" || chk_aprv[i].leave_cancel_type == "WORK_SUS" || chk_aprv[i].leave_cancel_type == "CNCEL_ONLY") && chk_aprv[i].leave_transfer_date != null)
                                {
                                    var lv_hdr      = db_ats.leave_application_hdr_tbl.Where(a => a.empl_id == p_empl_id && a.leave_ctrlno == p_leave_ctrlno).ToList().FirstOrDefault();
                                    var lv_dtl      = db_ats.leave_application_dtl_tbl.Where(a => a.empl_id == p_empl_id && a.leave_ctrlno == p_leave_ctrlno).ToList();
                                    var lv_dtl_cto  = db_ats.leave_application_dtl_cto_tbl.Where(a => a.leave_ctrlno == p_leave_ctrlno).ToList();

                                    // Update Header and Details
                                    lv_hdr.posting_status                 = false;
                                    lv_hdr.approval_status                = "L";
                                    lv_dtl.ForEach(a => a.rcrd_status     = "L");

                                    // Insert Header and Details
                                    leave_application_hdr_tbl       data_hdr_insert         = new leave_application_hdr_tbl();
                                    leave_application_dtl_tbl       data_dtl_insert         = new leave_application_dtl_tbl();
                                    leave_application_dtl_cto_tbl   data_dtl_cto_insert     = new leave_application_dtl_cto_tbl();

                                    var new_appl_nbr = db_ats.sp_generate_appl_nbr("leave_application_hdr_tbl", 8, "leave_ctrlno").ToList();
                                    data_hdr_insert.leave_ctrlno                  = new_appl_nbr[0].ToString();
                                    data_hdr_insert.empl_id                       = lv_hdr.empl_id                       ;
                                    data_hdr_insert.date_applied                  = lv_hdr.date_applied                  ;
                                    data_hdr_insert.leave_comments                = lv_hdr.leave_comments                ;
                                    data_hdr_insert.leave_type_code               = lv_hdr.leave_type_code               ;
                                    data_hdr_insert.leave_subtype_code            = lv_hdr.leave_subtype_code            ;
                                    data_hdr_insert.number_of_days                = lv_hdr.number_of_days                ;
                                    data_hdr_insert.sl_restore_deduct             = lv_hdr.sl_restore_deduct             ;
                                    data_hdr_insert.vl_restore_deduct             = lv_hdr.vl_restore_deduct             ;
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
                                    data_hdr_insert.sp_restore_deduct             = lv_hdr.sp_restore_deduct             ;
                                    data_hdr_insert.fl_restore_deduct             = lv_hdr.fl_restore_deduct             ;
                            
                                    data_dtl_insert.leave_ctrlno                  = new_appl_nbr[0].ToString()  ;
                                    data_dtl_insert.leave_date_from               = DateTime.Parse(chk_aprv[i].leave_transfer_date.ToString());
                                    data_dtl_insert.leave_date_to                 = DateTime.Parse(chk_aprv[i].leave_transfer_date.ToString());
                                    data_dtl_insert.date_num_day                  = lv_dtl[0].date_num_day         ;
                                    data_dtl_insert.date_num_day_total            = lv_dtl[0].date_num_day_total   ;
                                    data_dtl_insert.empl_id                       = lv_dtl[0].empl_id              ;
                                    data_dtl_insert.rcrd_status                   = "N"          ;

                                    if (lv_dtl_cto.Count >0)
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
                                    var ovr_inst = db_ats.sp_approve_cancellation(p_empl_id, DateTime.Parse(chk_aprv[i].leave_cancel_date.ToString()).ToString("yyyy-MM-dd"), user_id);

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

                                // *************************************************************
                                // **** VJA - 2023-06-01 -- Insert Leave Ledger History ********
                                // *************************************************************
                                var appl_status = "Cancellation Approved & Balance Restored";
                                db_ats.sp_lv_ledger_history_insert(chk.ledger_ctrl_no, p_leave_ctrlno, appl_status, "", Session["user_id"].ToString());
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