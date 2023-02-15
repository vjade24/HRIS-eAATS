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
    public class cTravelTypeController : Controller
    {
        HRIS_DEVEntities db = new HRIS_DEVEntities();
        HRIS_ATSEntities db_ats = new HRIS_ATSEntities();
        // GET: cTravelType
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
        // Created Date : 12/11/2019
        // Description  : Initialized during ttravel type pageload
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
                
                var travelTypeLst = db_ats.sp_traveltype_tbl_list().ToList();

                return JSON(new { message = "success", travelTypeLst, allowAdd, allowDelete, allowEdit, allowPrint, allowView }, JsonRequestBehavior.AllowGet);
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
        // Description  : Initialized during ttravel type pageload
        //*********************************************************************//
        public ActionResult GetTravelTypeList()
        {
            try
            {
                var travelTypeLst2 = db_ats.sp_traveltype_tbl_list().ToList();

                return JSON(new { message = "success", travelTypeLst2 }, JsonRequestBehavior.AllowGet);
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
        // Description  : Initialized during ttravel type pageload
        //*********************************************************************//
        public ActionResult GetLasCode()
        {
            try
            {
                var ids = db_ats.sp_traveltype_tbl_list().Select(a => int.Parse(a.travel_type_code));

                return JSON(new { message = "success", ids }, JsonRequestBehavior.AllowGet);
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
        // Description  : Initialized during ttravel type pageload
        //*********************************************************************//
        public ActionResult CheckExist(string travel_type_code)
        {
            try
            {
                string message = "";
                var od = db_ats.traveltype_tbl.Where(a =>
                   a.travel_type_code == travel_type_code).FirstOrDefault();
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
        // Created Date : 12/12/2019
        // Description  : Initialized during ttravel type pageload
        //*********************************************************************//
        public ActionResult CheckExist2(string travel_type_code)
        {
            try
            {
                string message = "";
                var od = db_ats.traveltype_tbl.Where(a =>
                   a.travel_type_code == travel_type_code).FirstOrDefault();
                if (od != null)
                {
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
        //*********************************************************************//
        // Created By   : Lorraine I. Ale 
        // Created Date : 12/12/2019
        // Description  : Add new record to travel type table
        //*********************************************************************//
        public ActionResult SaveTravelType(traveltype_tbl data)
        {
            try
            {
                db_ats.traveltype_tbl.Add(data);
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
        // Description  : Edit existing record from travel type table
        //*********************************************************************//
        public ActionResult SaveEditTravelType(traveltype_tbl data)
        {
            try
            {
                var od = db_ats.traveltype_tbl.Where(a =>
                   a.travel_type_code == data.travel_type_code ).FirstOrDefault();
                od.travel_type_abbrv = data.travel_type_abbrv;
                od.travel_type_descr = data.travel_type_descr;
                od.travel_type_hazard = data.travel_type_hazard;

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
        public ActionResult DeleteRemitCert(string travel_type_code)
        {
            try
            {
                string message = "";
                var od = db_ats.traveltype_tbl.Where(a =>
                   a.travel_type_code == travel_type_code).FirstOrDefault();
                if (od != null)
                {
                    db_ats.traveltype_tbl.Remove(od);
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