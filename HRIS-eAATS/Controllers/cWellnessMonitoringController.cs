using HRIS_eAATS.Models;
using System;
using System.Collections.Generic;
using System.Data.Entity.Validation;
using System.Linq;
using System.Text;
using System.Web;
using System.Web.Mvc;

using System.IO;
using CrystalDecisions.CrystalReports.Engine;
using CrystalDecisions.Shared;
using iTextSharp.text;
using iTextSharp.text.pdf;


namespace HRIS_eAATS.Controllers
{
    public class cWellnessMonitoringController : Controller
    {
        HRIS_DEVEntities db     = new HRIS_DEVEntities();
        HRIS_ATSEntities db_ats = new HRIS_ATSEntities();
        User_Menu um            = new User_Menu();
        // GET: cLeaveLedger
        public ActionResult Index()
        {
            try
            {
                if (um != null || um.ToString() != "")
                {
                    GetAllowAccess();
                }
                return View(um);
            }
            catch (Exception)
            {

                return RedirectToAction("Index", "Login");
            }
        }
        private User_Menu GetAllowAccess()
        {
            um.allow_add            = Session["allow_add"] == null ? 0 : (int)Session["allow_add"];
            um.allow_delete         = Session["allow_delete"] == null ? 0 : (int)Session["allow_delete"];
            um.allow_edit           = Session["allow_edit"] == null ? 0 : (int)Session["allow_edit"];
            um.allow_edit_history   = Session["allow_edit_history"] == null ? 0 : (int)Session["allow_edit_history"];
            um.allow_print          = Session["allow_print"] == null ? 0 : (int)Session["allow_print"];
            um.allow_view           = Session["allow_view"] == null ? 0 : (int)Session["allow_view"];
            um.url_name             = Session["url_name"] == null ? "cLeaveLedger" : Session["url_name"].ToString();
            um.id                   = Session["id"] == null ? 2118 : (int)Session["id"];
            um.menu_name            = Session["menu_name"] == null ? "Ledger Posting/Adjustment" : Session["menu_name"].ToString();
            um.page_title           = Session["page_title"] == null ? "Ledger Posting/Adjustment" : Session["page_title"].ToString();
            um.user_id              = Session["user_id"].ToString();
            return um;
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


        //*********************************************************************//
        // Created By   : JOSEPH JR. M. TOMBO
        // Created Date : 22/02/2026
        // Description  : Initialized during pageload
        //*********************************************************************//
        public ActionResult InitializeData()
        {
            try
            {
                db_ats.Database.CommandTimeout  = int.MaxValue;
                string[] redirect_data          = null;
                var log_empl_id                 = Session["empl_id"].ToString();
                var log_user_id                 = Session["user_id"].ToString();
                var cLV_Ledger_employee_name    = "";
                
                if (Session["cLV_Ledger_employee_name"].ToString() != string.Empty || Session["cLV_Ledger_employee_name"].ToString() != "")
                {
                    cLV_Ledger_employee_name = Session["cLV_Ledger_employee_name"].ToString();
                }

                GetAllowAccess();
                
                var lv_admin_dept_list  = db_ats.vw_leaveadmin_tbl_list.Where(a=> a.empl_id == log_empl_id).OrderBy(a => a.department_code);
                var leave_type_lst      = db_ats.sp_leavetype_tbl_list().ToList();

                return JSON(new { message = "success"
                    , um
                    , lv_admin_dept_list
                    , log_user_id
                    , leave_type_lst
                    , redirect_data
                    , cLV_Ledger_employee_name
                }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message.ToString();
                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
        }

        //*********************************************************************//
        // Created By   : JOSEPH JR. M. TOMBO
        // Created Date : 22/02/2026
        // Description  : Initialized during pageload
        //*********************************************************************//
        public ActionResult GetMonitoringList(string department_code, string employment_type, string show_only, int year)
        {
            try
            {
                db_ats.Database.CommandTimeout  = int.MaxValue;
                if(Session["empl_id"] == null)
                {
                    return RedirectToAction("Index", "Login");

                }
                var monitoring_list = db_ats.sp_wellness_monitoring_list(year,department_code, employment_type, show_only).ToList();

                return JSON(new { message = "success", monitoring_list }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message.ToString();
                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
        }

        //*********************************************************************//
        // Created By   : JOSEPH JR. M. TOMBO
        // Created Date : 22/02/2026
        // Description  : Initialized during pageload
        //*********************************************************************//
        public ActionResult GetForApprovalList()
        {
            try
            {
                db_ats.Database.CommandTimeout  = int.MaxValue;
                if(Session["empl_id"] == null)
                {
                    return RedirectToAction("Index", "Login");

                }

                var empl_id = Session["empl_id"].ToString();
                var for_approval_list = db_ats.sp_wellness_dayoff_for_approval_list(empl_id).ToList();

                return JSON(new { message = "success", for_approval_list }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message.ToString();
                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
        }

        //*********************************************************************//
        // Created By   : Joseph M. Tombo Jr. 
        // Created Date : 03/02/2020
        // Description  : Filter Page Grid
        //*********************************************************************//
        public ActionResult ReviewApprovedAction(authorization_slipt_hdr_tbl data, authorization_slipt_dtl_tbl data2)
        {
            try
            {
                var application_nbr = data.application_nbr;
                var approval_id     = data.approval_id;
                string status_comment = string.Empty;

               
                data.detail_remarks = data.detail_remarks == null ? "" : data.detail_remarks;
                if (data.approval_status.ToString().Trim() == "R" &&
                   data.detail_remarks.Trim() == "")
                {
                    data.detail_remarks = "Reviewed";
                }
                else if (data.approval_status.ToString().Trim() == "F" &&
                    data.detail_remarks.Trim() == "")
                {
                    data.detail_remarks = "Final Approved";
                }
                else if (data.approval_status.ToString().Trim() == "C" &&
                    data.detail_remarks.Trim() == "")
                {
                    data.detail_remarks = "Cancel Pending";
                }
                else if (data.approval_status.ToString().Trim() == "D" &&
                     data.detail_remarks.Trim() == "")
                {
                    data.detail_remarks = "Disapproved";
                }
                else if (data.approval_status.ToString().Trim() != "" &&
                    data.detail_remarks.Trim() == "")
                {
                    data.detail_remarks = "Level "+ data.approval_status+" Approved";
                }

                var query = db_ats.authorization_slipt_hdr_tbl.Where(a => a.application_nbr == application_nbr
                                && a.approval_id == approval_id
                                ).FirstOrDefault();
                var query2 = db_ats.authorization_slipt_dtl_tbl.Where(a => a.application_nbr == application_nbr).ToList();
                var query3 = db_ats.authorization_wellness_dtl_tbl.Where(a => a.application_nbr == application_nbr).ToList();
              
                if (query != null)
                {
                    query.approval_status = data.approval_status;
                    query.detail_remarks  = data.detail_remarks;
                    query.updated_by_user = Session["user_id"].ToString();
                    query.updated_dttm    = DateTime.Now;
                    query2.ForEach(a => a.rcrd_status = data.approval_status);
                    query3.ForEach(a => a.approval_status = data.approval_status);
                    db.sp_update_transaction_in_approvalworkflow_tbl(query.approval_id, Session["user_id"].ToString(), data.approval_status, data.detail_remarks);
                }

                db_ats.SaveChangesAsync();
                return JSON(new { message = "success" }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                string message = DbEntityValidationExceptionError(e);
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }

        //*********************************************************************//
        // Created By   : Joseph M. Tombo Jr. 
        // Created Date : 03/02/2020
        // Description  : Filter Page Grid
        //*********************************************************************//
        public ActionResult GetDetailsData(string p_application_nbr)
        {
            try
            {

                var flpDtlLst           = db_ats.sp_authorization_slip_dtl_tbl_list(p_application_nbr).ToList();
                string empl_id          = flpDtlLst[0].empl_id;
                DateTime applied_date   = DateTime.Parse(flpDtlLst[0].as_dtr_date);
                var breakdown           = db_ats.sp_wellness_breakdown_applied(empl_id, applied_date, 1).ToList();
                var wellness_list       = db_ats.sp_authorization_wellness_dayoff_tbl(empl_id, applied_date).ToList();
                return JSON(new { message = "success", flpDtlLst, breakdown, wellness_list }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                string message = DbEntityValidationExceptionError(e);
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }

        public String DbEntityValidationExceptionError(DbEntityValidationException e)
        {
            string message = "";
            foreach (var eve in e.EntityValidationErrors)
            {
                Console.WriteLine("Entity of type \"{0}\" in state \"{1}\" has the following validation errors:", eve.Entry.Entity.GetType().Name, eve.Entry.State);

                foreach (var ve in eve.ValidationErrors)
                {
                    message = "- Property: \"{0}\", Error: \"{1}\"" + ve.PropertyName + "  :  " + ve.ErrorMessage;
                    Console.WriteLine("- Property: \"{0}\", Error: \"{1}\"",
                        ve.PropertyName, ve.ErrorMessage);
                }
            }
            return message;
        }

    }
}