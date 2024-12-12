//*********************************************************************//
// Created By   : JOSEPH JR. M TOMBO
// Created Date : 20-02-2024
// Description  : Step Increment Tracking
//*********************************************************************//
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
    public class cStepIncrementController : Controller
    {
        HRIS_ATSEntities db_ats = new HRIS_ATSEntities();
        HRIS_DEVEntities db     = new HRIS_DEVEntities();
        User_Menu um            = new User_Menu();
        // GET: cStepIncrement
        public ActionResult Index()
        {
            if (um != null || um.ToString() != "")
            {
                GetAllowAccess();
            }
            else
            {
                return RedirectToAction("Index", "cMainPage");
            }
            return View(um);
        }

        //*********************************************************************//
        // Created By   : JOSEPH JR. M. TOMBO
        // Created Date : 20/02/2024
        // Description  : Initialized during pageload
        //*********************************************************************//
        public ActionResult InitializeData(string department_code, string date_from, string date_to)
        {
            try
            {
                GetAllowAccess();
                DateTime from = (date_from == "" ? DateTime.Now : DateTime.Parse(date_from)); 
                DateTime to = (date_to == "" ? DateTime.Now : DateTime.Parse(date_to)); 
                var stepIncrementData = db.sp_stepincrement_rekon_list(department_code, from, to, "").ToList();
                var departments = db.departments_tbl.ToList().OrderBy(a => a.sort_order_dept);

                return JSON(new { message = "success", um, stepIncrementData, departments }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message;
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }


        //*********************************************************************//
        // Created By   : JOSEPH JR. M. TOMBO
        // Created Date : 20/02/2024
        // Description  : Initialized during pageload
        //*********************************************************************//
        public ActionResult LoadRekonLedger(string department_code, string date_from, string date_to)
        {
            try
            {
                DateTime from = (date_from == "" ? DateTime.Now : DateTime.Parse(date_from));
                DateTime to = (date_to == "" ? DateTime.Now : DateTime.Parse(date_to));
                var stepIncrementData = db.sp_stepincrement_rekon_list(department_code, from, to, "").ToList();
                return JSON(new { message = "success", stepIncrementData }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message;
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }

        private User_Menu GetAllowAccess()
        {
            try
            {
                um.allow_add            = (int)Session["allow_add"];
                um.allow_delete         = (int)Session["allow_delete"];
                um.allow_edit           = (int)Session["allow_edit"];
                um.allow_edit_history   = (int)Session["allow_edit_history"];
                um.allow_print          = (int)Session["allow_print"];
                um.allow_view           = (int)Session["allow_view"];
                um.url_name             = Session["url_name"].ToString();
                um.id                   = (int)Session["id"];
                um.menu_name            = Session["menu_name"].ToString();
                um.page_title           = Session["page_title"].ToString();
                um.user_id              = Session["user_id"].ToString();

                return um;
            }
            catch (Exception e)
            {
                string message = e.Message;
                return um;
            }

        }

        public ActionResult SaveRecord(step_reckoning_tbl tbl, string t_action)
        {
            try
            {
                db.Database.CommandTimeout = Int32.MaxValue;

                if (t_action == "ADD")
                {
                    int id              = db.step_reckoning_tbl.Max(item => (int?)item.id) ?? 0;
                    tbl.id              = (id + 1);
                    tbl.created_by      = Session["user_id"].ToString();
                    tbl.created_dttm    = DateTime.Now;
                    tbl.updated_by      = "";
                    tbl.updated_dttm    = Convert.ToDateTime("1900-01-01");
                    db.step_reckoning_tbl.Add(tbl);
                    db.SaveChanges();
                }
                else {
                }
               
                return JSON(new { message = "success"}, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message;
                return JSON(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }

        public ActionResult DeleteRecord(int record_id)
        {
            try
            {
                db.Database.CommandTimeout = Int32.MaxValue;

                var data = db.step_reckoning_tbl.Where(a => a.id == record_id).FirstOrDefault();

                db.step_reckoning_tbl.Remove(data);
                db.SaveChanges();

                return JSON(new { message = "success" }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message;
                return JSON(new { message = message }, JsonRequestBehavior.AllowGet);
            }
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
    }
}