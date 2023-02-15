using HRIS_eAATS.Models;
using System;
using System.Collections.Generic;
using System.Data.Entity.Validation;
using System.Linq;
using System.Text;
using System.Web;
using System.Web.Mvc;

namespace HRIS_eAATS.Controllers
{
    public class cLeaveTypeController : Controller
    {
        HRIS_DEVEntities db = new HRIS_DEVEntities();
        HRIS_ATSEntities db_ats = new HRIS_ATSEntities();
        // GET: cLeaveType
        public ActionResult Index()
        {
            User_Menu um = new User_Menu();

            if (um != null || um.ToString() != "")
            {
                um.allow_add = (int)Session["allow_add"];
                um.allow_delete = (int)Session["allow_delete"];
                um.allow_edit = (int)Session["allow_edit"];
                um.allow_edit_history = (int)Session["allow_edit_history"];
                um.allow_print = (int)Session["allow_print"];
                um.allow_view = (int)Session["allow_view"];
                um.url_name = Session["url_name"].ToString();
                um.id = (int)Session["id"];
                um.menu_name = Session["menu_name"].ToString();
                um.page_title = Session["page_title"].ToString();
            }
            return View(um);
        }
        public ActionResult UserAccessOnPage(int id)
        {
            Session["user_menu_id"] = id;
            return Json("success", JsonRequestBehavior.AllowGet);
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
        // Created By   : Lorraine I. Ale 
        // Created Date : 01/09/2019
        // Description  : Initialized during leave type pageload
        //*********************************************************************//
        public ActionResult initializeData()
        {
            try
            {
                string userid       = Session["user_id"].ToString();
                string allowAdd     = Session["allow_add"].ToString();
                string allowDelete  = Session["allow_delete"].ToString();
                string allowEdit    = Session["allow_edit"].ToString();
                string allowPrint   = Session["allow_print"].ToString();
                string allowView    = Session["allow_view"].ToString();


                var leaveTypeLst = db_ats.sp_leavetype_tbl_list().ToList();

                return JSON(new { message = "success", leaveTypeLst, allowAdd, allowDelete, allowEdit, allowPrint, allowView }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                string message = DbEntityValidationExceptionError(e);
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }
        //*********************************************************************//
        // Created By   : Lorraine I. Ale 
        // Created Date : 12/12/2019
        // Description  : Check if leave type code already exist in table before saving
        //*********************************************************************//
        public ActionResult CheckExist(string leavetype_code)
        {
            try
            {
                string message = "";
                var od = db_ats.leavetype_tbl.Where(a =>
                   a.leavetype_code == leavetype_code).FirstOrDefault();
                if (od != null)
                {
                    message = "";
                }
                else
                {
                    message = "success";
                }

                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                string message = DbEntityValidationExceptionError(e);
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }
        //*********************************************************************//
        // Created By   : Lorraine I. Ale 
        // Created Date : 01/06/2020
        // Description  : Get data by code
        //*********************************************************************//
        public ActionResult GetData(string leavetype_code)
        {
            try
            {
                var getData = db_ats.sp_leavetype_tbl_list().Where(a =>
                   a.leavetype_code == leavetype_code).ToList();

                return JSON(new { message = "success", getData }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                string message = DbEntityValidationExceptionError(e);
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }
        //*********************************************************************//
        // Created By   : Lorraine I. Ale 
        // Created Date : 01/10/2020
        // Description  : Add new record to leave type table
        //*********************************************************************//
        public ActionResult Save(leavetype_tbl data)
        {
            try
            {
                db_ats.leavetype_tbl.Add(data);
                db_ats.SaveChangesAsync();
                return Json(new { message = "success" }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                string message = DbEntityValidationExceptionError(e);
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }
        //*********************************************************************//
        // Created By   : Lorraine I. Ale 
        // Created Date : 12/12/2019
        // Description  : Edit existing record from leave type table
        //*********************************************************************//
        public ActionResult SaveEdit(leavetype_tbl data)
        {
            try
            {
                var od = db_ats.leavetype_tbl.Where(a =>
                   a.leavetype_code == data.leavetype_code).FirstOrDefault();
                od.leavetype_descr                  = data.leavetype_descr;
                od.leavetype_maxperyear             = data.leavetype_maxperyear;
                od.leave_earn_balance               = data.leave_earn_balance;
                od.leave_earn_occurence             = data.leave_earn_occurence;
                od.leave_earn_schedule              = data.leave_earn_schedule;
                od.leave_earn_carryoverbalance_flag = data.leave_earn_carryoverbalance_flag;
                od.leave_carryover_maxbalance       = data.leave_carryover_maxbalance;
                od.leavetype_monetized_flag         = data.leavetype_monetized_flag;
                od.leave_earn_daycover              = data.leave_earn_daycover;
                od.leave_earn                       = data.leave_earn;

                db_ats.SaveChanges();

                return Json(new { message = "success" }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                string message = DbEntityValidationExceptionError(e);
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }
        //*********************************************************************//
        // Created By   : Lorraine I. Ale 
        // Created Date : 12/12/2019
        // Description  : delete from travel type table
        //*********************************************************************//
        public ActionResult Delete(string leavetype_code)
        {
            try
            {
                string message = "";
                var od = db_ats.leavetype_tbl.Where(a =>
                   a.leavetype_code == leavetype_code).FirstOrDefault();
                if (od != null)
                {
                    db_ats.leavetype_tbl.Remove(od);
                    db_ats.SaveChanges();
                    message = "success";
                }
                else
                {
                    message = "";
                }

                return Json(new { message }, JsonRequestBehavior.AllowGet);
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