//*********************************************************************//
// Created By   : Lorraine I. Ale 
// Created Date : 04/07/2020
// Description  : Leave Application Controller
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
    public class cLeaveAdminController : Controller
    {
        HRIS_ATSEntities db_ats = new HRIS_ATSEntities();
        User_Menu um = new User_Menu();
        // GET: cLeaveAdmin
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
        // Created Date : 03/05/2020
        // Description  : Initialized during pageload
        //*********************************************************************//
        public ActionResult InitializeData()
        {
            try
            {
                GetAllowAccess();

                var adminUser_lst = db_ats.vw_leaveadmin_user_list.ToList().OrderBy(a=>a.employee_name);
                var adminDept_lst = db_ats.vw_leaveadmin_dept_list.Where(a => a.empl_id == "").ToList();
                //var adminUser_lst = "";
                //var adminDept_lst = "";
                var adminTbl_lst = db_ats.vw_leaveadmin_tbl_list.Where(a => a.empl_id == "").ToList();

                return JSON(new { message = "success", um, adminUser_lst , adminDept_lst, adminTbl_lst }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message;
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }
        //*********************************************************************//
        // Created By   : Lorraine I. Ale 
        // Created Date : 05/05/2020
        // Description  : Filter Page Grid
        //*********************************************************************//
        public ActionResult FilterPageGrid(string par_empl_id)
        {
            try
            {
                var filteredGrid = db_ats.vw_leaveadmin_tbl_list.Where(a => a.empl_id == par_empl_id).ToList();
                var adminDept_lst = db_ats.vw_leaveadmin_dept_list.Where(a => a.empl_id == par_empl_id).ToList();

                return JSON(new { message = "success", filteredGrid, adminDept_lst }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                string message = DbEntityValidationExceptionError(e);
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }
        //*********************************************************************//
        // Created By   : Lorraine I. Ale 
        // Created Date : 03/02/2020
        // Description  : Filter Page Grid
        //*********************************************************************//
        public ActionResult CheckExist(string empl_id, string department_code)
        {
            try
            {
                var message = "";
                var od = db_ats.leaveadmin_tbl.Where(a =>
                    a.empl_id == empl_id &&
                    a.department_code == department_code).FirstOrDefault();
                if (od != null)
                {
                    message = "success";
                }

                return JSON(new { message }, JsonRequestBehavior.AllowGet);
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
        public ActionResult Save(leaveadmin_tbl data)
        {
            try
            {
                db_ats.leaveadmin_tbl.Add(data);
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
        public ActionResult SaveEdit(leaveadmin_tbl data)
        {
            try
            {
                var od = db_ats.leaveadmin_tbl.Where(a =>
                   a.empl_id == data.empl_id &&
                   a.department_code == data.department_code).FirstOrDefault();
                od.department_code = data.department_code;
                od.rcrd_status = data.rcrd_status;
                od.approver = data.approver;

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
        public ActionResult Delete(string empl_id,string department_code)
        {
            try
            {
                string message = "";
                var od = db_ats.leaveadmin_tbl.Where(a =>
                   a.empl_id == empl_id && 
                   a.department_code == department_code).FirstOrDefault();
                if (od != null)
                {
                    db_ats.leaveadmin_tbl.Remove(od);
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