﻿using HRIS_eAATS.Models;
using System;
using System.Collections.Generic;
using System.Data.Entity.Validation;
using System.Linq;
using System.Text;
using System.Web;
using System.Web.Mvc;

namespace HRIS_eAATS.Controllers
{
    public class cLeavePrintingController : Controller
    {
        HRIS_DEVEntities db     = new HRIS_DEVEntities();
        HRIS_ATSEntities db_ats = new HRIS_ATSEntities();
        User_Menu um            = new User_Menu();
        // GET: cLeaveTracking
       // GET: cLeaveLedgerAppr
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
            um.allow_add            = 1;
            um.allow_delete         = 1;
            um.allow_edit           = 1;
            um.allow_edit_history   = 1;
            um.allow_print          = 1;
            um.allow_view           = 1;
            um.id                   = 0;
            um.menu_name            = Session["menu_name"].ToString();
            um.page_title           = Session["page_title"].ToString();
            um.url_name             = Session["url_name"].ToString();
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
        // Created By   : Joseph Jr. M. Tombo 
        // Created Date : 05/31/2023
        // Description  : Initialized during leave type pageload
        //*********************************************************************//
        public ActionResult InitializeData()
        {
            try
            {
                db_ats.Database.CommandTimeout = int.MaxValue;
                var um                  = GetAllowAccess();
                var log_empl_id         = Session["empl_id"].ToString();
                var log_user_id         = Session["user_id"].ToString();
                var data                = db_ats.sp_leave_printing_list(null, null, "", log_user_id,"N").ToList();
                var lv_admin_dept_list  = db_ats.vw_leaveadmin_tbl_list.Where(a => a.empl_id == log_empl_id).OrderBy(a => a.department_code);
              
                return JSON(new { message = "success", um, data , lv_admin_dept_list }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message.ToString();
                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
        }
        //*********************************************************************//
        // Created By   : Joseph Jr. M. Tombo 
        // Created Date : 05/31/20231
        // Description  : Filter Page Grid
        //*********************************************************************//
        public ActionResult FilterPageGrid(DateTime? evaluated_date_from, DateTime? evaluated_date_to, string par_department_code, string par_show_printed)
        {
            try
            {
                db_ats.Database.CommandTimeout = int.MaxValue;
                var log_user_id = Session["user_id"].ToString();
                if (evaluated_date_from != null && evaluated_date_to != null)
                {
                    var data = db_ats.sp_leave_printing_list(evaluated_date_from, evaluated_date_to, par_department_code, log_user_id, par_show_printed).ToList();
                    return JSON(new { message = "success", data }, JsonRequestBehavior.AllowGet);
                }
                else
                {
                    var data = db_ats.sp_leave_printing_list(null, null, par_department_code, log_user_id, par_show_printed).ToList();
                    return JSON(new { message = "success", data }, JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception e)
            {
                string message = e.Message.ToString();
                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
        }

        ////*********************************************************************//
        //// Created By   : Joseph Jr. M. Tombo 
        //// Created Date : 05/31/20231
        //// Description  : Get Uploading Details
        ////*********************************************************************//
        //public ActionResult GetUploadingDetails(string par_doc_ctrl_nbr)
        //{
        //    try
        //    {
        //        db_ats.Database.CommandTimeout  = int.MaxValue;
        //        var data                        = db_ats.sp_get_leave_transmittal_for_uploading_dtl_list(par_doc_ctrl_nbr).ToList();

        //        return JSON(new { message = "success", data }, JsonRequestBehavior.AllowGet);
        //    }
        //    catch (Exception e)
        //    {
        //        string message = e.Message.ToString();
        //        return Json(new { message }, JsonRequestBehavior.AllowGet);
        //    }
        //}

        ////*********************************************************************//
        //// Created By   : Joseph Jr. M. Tombo 
        //// Created Date : 05/31/20231
        //// Description  : Get Uploading Details
        ////*********************************************************************//
        //public ActionResult UploadAll(string par_doc_ctrl_nbr)
        //{
        //    try
        //    {
        //        db_ats.Database.CommandTimeout = int.MaxValue;
        //        var data = db_ats.sp_get_leave_transmittal_for_uploading_dtl_list(par_doc_ctrl_nbr).Where(a=> a.check_defualt == true).ToList();

        //        List<lv_ledger_history_tbl> ledger_history = new List<lv_ledger_history_tbl>();
        //        if (data.Count > 0)
        //        {
        //            for (int i = 0; i < data.Count; i++)
        //            {
        //                lv_ledger_history_tbl table = new lv_ledger_history_tbl();
        //                table.appl_remarks      = "";
        //                table.appl_status       = "Uploaded";
        //                table.created_by        = Session["user_id"].ToString();
        //                table.created_dttm      = DateTime.Now;
        //                table.leave_ctrlno      = data[i].leave_ctrlno;
        //                table.ledger_ctrl_no    = data[i].ledger_ctrl_no;
        //                table.empl_id           = data[i].empl_id;
        //                ledger_history.Add(table);
        //            }

        //            db_ats.lv_ledger_history_tbl.AddRange(ledger_history);

                    
        //        }
        //        var data_update = db_ats.transmittal_leave_hdr_tbl.Where(a => a.doc_ctrl_nbr == par_doc_ctrl_nbr).FirstOrDefault();
        //        data_update.doc_status = "U";
        //        db_ats.SaveChangesAsync();
        //        return JSON(new { message = "success", data, ledger_history }, JsonRequestBehavior.AllowGet);
        //    }
        //    catch (Exception e)
        //    {
        //        string message = e.Message.ToString();
        //        return Json(new { message }, JsonRequestBehavior.AllowGet);
        //    }
        //}

        ////*********************************************************************//
        //// Created By   : Joseph Jr. M. Tombo 
        //// Created Date : 05/31/20231
        //// Description  : Get Uploading Details
        ////*********************************************************************//
        //public ActionResult SubmitOverride(string par_doc_ctrl_nbr, string par_ledger_ctrl_no, string par_remarks,string par_leave_ctrlno)
        //{
        //    try
        //    {
        //        db_ats.Database.CommandTimeout = int.MaxValue;

        //        var data = db_ats.transmittal_leave_dtl_tbl.Where(a => a.doc_ctrl_nbr == par_doc_ctrl_nbr && a.ledger_ctrl_no == par_ledger_ctrl_no).FirstOrDefault();
        //        data.doc_remarks = par_remarks;

        //        lv_ledger_history_tbl table = new lv_ledger_history_tbl();
        //        table.appl_remarks          = par_remarks;
        //        table.appl_status           = "Remarks Override";
        //        table.created_by            = Session["user_id"].ToString();
        //        table.created_dttm          = DateTime.Now;
        //        table.leave_ctrlno          = par_leave_ctrlno;
        //        table.ledger_ctrl_no        = par_ledger_ctrl_no;
        //        db_ats.lv_ledger_history_tbl.Add(table);
        //        db_ats.SaveChangesAsync();

        //        return JSON(new { message = "success", data }, JsonRequestBehavior.AllowGet);
        //    }
        //    catch (Exception e)
        //    {
        //        string message = e.Message.ToString();
        //        return Json(new { message }, JsonRequestBehavior.AllowGet);
        //    }
        //}

        ////*********************************************************************//
        //// Created By   : Joseph Jr. M. Tombo 
        //// Created Date : 05/31/20231
        //// Description  : Get Uploading Details
        ////*********************************************************************//
        //public ActionResult SubmitUpload(string par_doc_ctrl_nbr, string par_ledger_ctrl_no, string par_leave_ctrlno,string par_empl_id)
        //{
        //    try
        //    {
        //        db_ats.Database.CommandTimeout = int.MaxValue;

               

        //        lv_ledger_history_tbl table  = new lv_ledger_history_tbl();
        //        table.appl_remarks           = "";
        //        table.appl_status            = "Uploaded";
        //        table.created_by             = Session["user_id"].ToString();
        //        table.created_dttm           = DateTime.Now;
        //        table.leave_ctrlno           = par_leave_ctrlno;
        //        table.ledger_ctrl_no         = par_ledger_ctrl_no;
        //        table.empl_id                = par_empl_id;
        //        db_ats.lv_ledger_history_tbl.Add(table);
        //        db_ats.SaveChangesAsync();

        //        return JSON(new { message = "success" }, JsonRequestBehavior.AllowGet);
        //    }
        //    catch (Exception e)
        //    {
        //        string message = e.Message.ToString();
        //        return Json(new { message }, JsonRequestBehavior.AllowGet);
        //    }
        //}
    }
}