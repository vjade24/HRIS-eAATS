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
    public class cLeaveSubTypeController : Controller
    {
        HRIS_DEVEntities db = new HRIS_DEVEntities();
        HRIS_ATSEntities db_ats = new HRIS_ATSEntities();
        // GET: cLeaveSubType
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
        // Created Date : 01/13/2020
        // Description  : Initialized during leave sub-type pageload
        //*********************************************************************//
        public ActionResult initializeData(string leavetype_code)
        {
            try
            {
                string userid       = Session["user_id"].ToString();
                string allowAdd     = Session["allow_add"].ToString();
                string allowDelete  = Session["allow_delete"].ToString();
                string allowEdit    = Session["allow_edit"].ToString();
                string allowPrint   = Session["allow_print"].ToString();
                string allowView    = Session["allow_view"].ToString();


                var leaveSubTypeLst = db_ats.sp_leavesubtype_tbl_list(leavetype_code).ToList();

                return JSON(new { message = "success", leaveSubTypeLst, allowAdd, allowDelete, allowEdit, allowPrint, allowView }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                string message = DbEntityValidationExceptionError(e);
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }
        //*********************************************************************//
        // Created By   : Lorraine I. Ale 
        // Created Date : 01/13/2020
        // Description  : Leave type dropdown
        //*********************************************************************//
        public ActionResult GetLeaveType()
        {
            try
            {
                var leaveTypeLst = db_ats.sp_leavetype_tbl_list().ToList();

                return JSON(new { message = "success", leaveTypeLst }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                string message = DbEntityValidationExceptionError(e);
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }
        //*********************************************************************//
        // Created By   : Lorraine I. Ale 
        // Created Date : 01/13/2020
        // Description  : Check if leave sub-type code already exist in table before saving
        //*********************************************************************//
        public ActionResult CheckExist(string leavetype_code, string leavesubtype_code)
        {
            try
            {
                string message = "";
                var od = db_ats.leavesubtype_tbl.Where(a =>
                   a.leavetype_code == leavetype_code &&
                   a.leavesubtype_code == leavesubtype_code).FirstOrDefault();
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
        // Created Date : 01/13/2020
        // Description  : Get all data base on selected leave type
        //*********************************************************************//
        public ActionResult GetAllData(string leavetype_code)
        {
            try
            {
                var getAllData = db_ats.sp_leavesubtype_tbl_list(leavetype_code).ToList();

                return JSON(new { message = "success", getAllData }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                string message = DbEntityValidationExceptionError(e);
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }
        //*********************************************************************//
        // Created By   : Lorraine I. Ale 
        // Created Date : 01/13/2020
        // Description  : Get data by code
        //*********************************************************************//
        public ActionResult GetData(string leavetype_code, string leavesubtype_code)
        {
            try
            {
                var getData = db_ats.sp_leavesubtype_tbl_list(leavetype_code).Where(a =>
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
        // Created Date : 01/13/2020
        // Description  : Add new record to leave sub-type table
        //*********************************************************************//
        public ActionResult Save(leavesubtype_tbl data)
        {
            try
            {
                db_ats.leavesubtype_tbl.Add(data);
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
        // Created Date : 01/13/2020
        // Description  : Edit existing record from leave sub-type table
        //*********************************************************************//
        public ActionResult SaveEdit(leavesubtype_tbl data)
        {
            try
            {
                var od = db_ats.leavesubtype_tbl.Where(a =>
                   a.leavetype_code == data.leavetype_code &&
                   a.leavesubtype_code == data.leavesubtype_code).FirstOrDefault();
                od.leavesubtype_descr = data.leavesubtype_descr;
                
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
        // Created Date : 01/13/2020
        // Description  : delete from leave sub-type table
        //*********************************************************************//
        public ActionResult Delete(string leavetype_code, string leavesubtype_code)
        {
            try
            {
                string message = "";
                var od = db_ats.leavesubtype_tbl.Where(a =>
                   a.leavetype_code == leavetype_code &&
                   a.leavesubtype_code == leavesubtype_code).FirstOrDefault();
                if (od != null)
                {
                    db_ats.leavesubtype_tbl.Remove(od);
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