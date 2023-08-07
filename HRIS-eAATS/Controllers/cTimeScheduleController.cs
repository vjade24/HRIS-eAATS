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
    public class cTimeScheduleController : Controller
    {
        HRIS_DEVEntities db = new HRIS_DEVEntities();
        HRIS_ATSEntities db_ats = new HRIS_ATSEntities();
        User_Menu um = new User_Menu();
        // GET: cTimeSchedule
        public ActionResult Index()
        {

            if (um != null || um.ToString() != "")
            {
                GetAllowAccess();
            }
            return View(um);
        }
        private User_Menu GetAllowAccess()

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
            um.user_id = Session["user_id"].ToString();

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
        // Created By   : Lorraine I. Ale 
        // Created Date : 01/03/2019
        // Description  : Initialized during shift time schedule pageload
        //*********************************************************************//
        public ActionResult initializeData()
        {
            try
            {
                GetAllowAccess();

                var timeSchedLst = db_ats.sp_timeschedule_tbl_list().ToList();

                return JSON(new { message = "success", um, timeSchedLst }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                string message = DbEntityValidationExceptionError(e);
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }
        //*********************************************************************//
        // Created By   : Lorraine I. Ale 
        // Created Date : 04/03/2020
        // Description  : Filter Page Grid
        //*********************************************************************//
        public ActionResult FilterPageGrid()
        {
            try
            {
                var filteredGrid = db_ats.sp_timeschedule_tbl_list().ToList();

                return JSON(new { message = "success", filteredGrid }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                string message = DbEntityValidationExceptionError(e);
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }
        //*********************************************************************//
        // Created By   : Lorraine I. Ale 
        // Created Date : 01/04/2020
        // Description  : Initialized during ttravel type pageload
        //*********************************************************************//
        public ActionResult GetLasCode()
        {
            try
            {
                var new_appl_nbr = db_ats.sp_generate_appl_nbr("timeschedule_tbl", 2, "ts_code").ToList();
                var ids = new_appl_nbr[0].ToString();
                //var ids = db_ats.sp_timeschedule_tbl_list().Select(a => int.Parse(a.ts_code));

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
        // Created Date : 01/06/2020
        // Description  : Get data by code
        //*********************************************************************//
        public ActionResult GetData(string ts_code)
        {
            try
            {
                var getData = db_ats.sp_timeschedule_tbl_list().Where(a => a.ts_code == ts_code).ToList();

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
        // Created Date : 01/06/2020
        // Description  : Add new record to shift time schedule table
        //*********************************************************************//
        public ActionResult Save(timeschedule_tbl data)
        {
            try
            {
                data.created_by_user    = Session["user_id"].ToString();
                data.created_dttm       = DateTime.Now;
                db_ats.timeschedule_tbl.Add(data);
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
        public ActionResult SaveEdit(timeschedule_tbl data)
        {
            try
            {
                var od = db_ats.timeschedule_tbl.Where(a => a.ts_code == data.ts_code).FirstOrDefault();
                od.ts_descr             = data.ts_descr;
                od.ts_am_in             = data.ts_am_in;
                od.ts_am_out            = data.ts_am_out;
                od.ts_pm_in             = data.ts_pm_in;
                od.ts_pm_out            = data.ts_pm_out;
                od.ts_add_days          = data.ts_add_days;
                od.ts_mid_break         = data.ts_mid_break;
                od.ts_day_equivalent    = data.ts_day_equivalent;
                od.pre_time_in_hrs      = data.pre_time_in_hrs;
                od.post_time_out_hrs    = data.post_time_out_hrs;
                od.updated_by_user      = Session["user_id"].ToString();
                od.updated_dttm         = DateTime.Now;
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
        public ActionResult Delete(string ts_code)
        {
            try
            {
                string message = "";
                var od = db_ats.timeschedule_tbl.Where(a =>
                   a.ts_code == ts_code).FirstOrDefault();
                if (od != null)
                {
                    db_ats.timeschedule_tbl.Remove(od);
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