using HRIS_eAATS.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Web;
using System.Web.Mvc;

namespace HRIS_eAATS.Controllers
{
   
    public class cStepIncrementController : Controller
    {
        HRIS_DEVEntities db     = new HRIS_DEVEntities();
        HRIS_ATSEntities db_ats = new HRIS_ATSEntities();
        User_Menu um            = new User_Menu();
        // GET: cStepIncrement
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
            um.allow_add            = Session["allow_add"]          == null ? 0 : (int)Session["allow_add"];
            um.allow_delete         = Session["allow_delete"]       == null ? 0 : (int)Session["allow_delete"];
            um.allow_edit           = Session["allow_edit"]         == null ? 0 : (int)Session["allow_edit"];
            um.allow_edit_history   = Session["allow_edit_history"] == null ? 0 : (int)Session["allow_edit_history"];
            um.allow_print          = Session["allow_print"]        == null ? 0 : (int)Session["allow_print"];
            um.allow_view           = Session["allow_view"]         == null ? 0 : (int)Session["allow_view"];
            um.url_name             = Session["url_name"]           == null ? "cLeaveLedger" : Session["url_name"].ToString();
            um.id                   = Session["id"]                 == null ? 2118 : (int)Session["id"];
            um.menu_name            = Session["menu_name"]          == null ? "Ledger Posting/Adjustment" : Session["menu_name"].ToString();
            um.page_title           = Session["page_title"]         == null ? "Ledger Posting/Adjustment" : Session["page_title"].ToString();
            um.user_id              = Session["user_id"].ToString();
            return um;
        }

        protected JsonResult JSON(object data, JsonRequestBehavior behavior)
        {
            return new JsonResult()
            {
                Data = data,
                ContentType         = "application/json",
                ContentEncoding     = Encoding.UTF8,
                JsonRequestBehavior = behavior,
                MaxJsonLength       = Int32.MaxValue
            };
        }


        public ActionResult InitializeData(string department_code, string date_from, string date_to)
        {
            try
            {
                var departments = db.departments_tbl.OrderBy(a=> a.sort_order_dept).ToList();
                if (um != null || um.ToString() != "")
                {
                  
                }
                return JSON(new {departments, }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception)
            {

                return RedirectToAction("Index", "Login");
            }
        }

        public ActionResult LoadStepsDetails(string empl_id)
        {
            try
            {
                var dtl_list = db.sp_employee_steps_dtl_list(empl_id).ToList();
                var lwop_list = db.sp_step_reckoning_overrid_tbl_lwop(empl_id).ToList();
                return JSON(new { dtl_list, lwop_list }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception)
            {

                return RedirectToAction("Index", "Login");
            }
        }

        public ActionResult LoadStats(string date_year)
        {
            try
            {
                var step_stats = db.sp_step_status_details(date_year).ToList();
                return JSON(new { step_stats, }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception)
            {

                return RedirectToAction("Index", "Login");
            }
        }


        public ActionResult LoadRekonLedger(string department_code, DateTime date_from, DateTime date_to )
        {
            try
            {
                var stepIncrementData = db.sp_stepincrement_rekon_list(department_code, date_from, date_to,"").ToList();
                if (um != null || um.ToString() != "")
                {

                }
                return JSON(new { stepIncrementData}, JsonRequestBehavior.AllowGet);
            }
            catch (Exception)
            {

                return RedirectToAction("Index", "Login");
            }
        }

        public ActionResult LoadStatisticsData(string filter_from)
        {
            try
            {
                var static_step = db.sp_step_record_status_list_tbl(filter_from).ToList();
                if (um != null || um.ToString() != "")
                {

                }
                return JSON(new { static_step }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception)
            {

                return RedirectToAction("Index", "Login");
            }
        }

        public ActionResult BtnSaveOverride(step_reckoning_overrid_tbl data, string action)
        {
            try
            {
                db.Database.CommandTimeout = Int32.MaxValue;
                data.created_by     = Session["user_id"].ToString();
                data.created_dttm   = DateTime.Now;

                if (action == "ADD")
                {
                    db.step_reckoning_overrid_tbl.Add(data);
                    newstepincrement_tbl tbl = new newstepincrement_tbl();
                    if (data.rekon_type == "GRADUATE")
                    {
                        var newstepdata     = db.newstepincrement_tbl.Where(a => a.empl_id == data.empl_id && a.date_of_effectivity == data.rekoning_date && a.step_increment_new == data.rekon_step).FirstOrDefault();
                        string budget_code  = DateTime.Now.Year.ToString() + "-2";
                        var plantilla       = db.plantilla_tbl.Where(a => a.empl_id == data.empl_id && a.employment_type == "RE" && a.budget_code == budget_code).FirstOrDefault();
                        if (newstepdata == null && plantilla != null)
                        {
                            tbl.empl_id             = data.empl_id;
                            tbl.date_generated      = DateTime.Now;
                            tbl.date_of_effectivity = data.rekoning_date;
                            tbl.item_no             = plantilla.item_no;
                            tbl.step_increment_new  = data.rekon_step;
                            tbl.approval_status     = "F";
                            tbl.posting_status      = false;
                            tbl.approval_id         = "";
                            tbl.budget_code         = plantilla.budget_code;
                            tbl.created_by_user     = Session["user_id"].ToString();
                            tbl.updated_by_user     = null;
                            tbl.created_dttm        = DateTime.Now;
                            tbl.updated_dttm        = null;
                            tbl.step_type           = "graduate";
                            db.newstepincrement_tbl.Add(tbl);
                        }
                        db.SaveChangesAsync();
                    }
                    else
                    {
                        db.SaveChangesAsync();
                    }
                }
                else if (action == "EDIT")
                {
                    var existing_data = db.step_reckoning_overrid_tbl.Where(a=> a.id == data.id).FirstOrDefault();
                    if (existing_data != null)
                    {
                        existing_data.empl_id		= data.empl_id;
                        existing_data.rekoning_date = data.rekoning_date;
	                    existing_data.rekon_step	= data.rekon_step;	
	                    existing_data.lwop_days	    = data.lwop_days;	
	                    existing_data.salary_grade  = data.salary_grade;
                        existing_data.rekon_type    = data.rekon_type;
                        existing_data.updated_by    = Session["user_id"].ToString();
                        existing_data.updated_dttm  = DateTime.Now;
                        db.SaveChanges();
                    }
                }
                else if (action == "DELETE")
                {
                    var datadel = db.step_reckoning_overrid_tbl.Where(a => a.id == data.id).FirstOrDefault();
                    db.step_reckoning_overrid_tbl.Remove(datadel);
                    db.SaveChangesAsync();
                }
                return JSON(new { message = "success" }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {

                return JSON(new { message =e.Message }, JsonRequestBehavior.AllowGet);
            }
        }


        public ActionResult BtnSaveRekon(step_reckoning_tbl data, string action)
        {
            try
            {
                db.Database.CommandTimeout  = Int32.MaxValue;
                data.created_by             = Session["user_id"].ToString();
                data.created_dttm           = DateTime.Now;

                if (action == "ADD")
                {
                    db.step_reckoning_tbl.Add(data);
                    db.SaveChanges();
                }
                else if (action == "EDIT")
                {
                    
                }
                else if (action == "DELETE")
                {
                   
                }
                return JSON(new { message = "success" }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {

                return JSON(new { message =e.Message }, JsonRequestBehavior.AllowGet);
            }
        }


        public ActionResult BtnGenerateNOSI(newstepincrement_tbl data, string action)
        {
            try
            {
                db.Database.CommandTimeout  = Int32.MaxValue;
                data.created_dttm           = DateTime.Now;

                if (action == "ADD")
                {
                    newstepincrement_tbl tbl = new newstepincrement_tbl();
                    var newstepdata     = db.newstepincrement_tbl.Where(a => a.empl_id == data.empl_id && a.date_of_effectivity == data.date_of_effectivity && a.step_increment_new == data.step_increment_new).FirstOrDefault();
                    string budget_code  = DateTime.Now.Year.ToString() + "-2";
                    var plantilla       = db.plantilla_tbl.Where(a => a.empl_id == data.empl_id && a.employment_type == "RE" && a.budget_code == budget_code).FirstOrDefault();
                    if (newstepdata == null && plantilla != null)
                    {
                        tbl.empl_id             = data.empl_id;
                        tbl.date_generated      = DateTime.Now;
                        tbl.date_of_effectivity = data.date_of_effectivity;
                        tbl.item_no             = plantilla.item_no;
                        tbl.step_increment_new  = data.step_increment_new;
                        tbl.approval_status     = "F";
                        tbl.posting_status      = false;
                        tbl.approval_id         = "";
                        tbl.budget_code         = plantilla.budget_code;
                        tbl.created_by_user     = Session["user_id"].ToString();
                        tbl.updated_by_user     = null;
                        tbl.created_dttm        = DateTime.Now;
                        tbl.updated_dttm        = null;
                        tbl.step_type           = "length";
                        db.newstepincrement_tbl.Add(tbl);
                    }
                    db.SaveChangesAsync();
                }
                else if (action == "DELETE")
                {
                    var datadel = db.newstepincrement_tbl.Where(a => a.empl_id == data.empl_id && a.date_generated == data.date_generated && a.date_of_effectivity == data.date_of_effectivity).FirstOrDefault();
                    db.newstepincrement_tbl.Remove(datadel);
                    db.SaveChangesAsync();
                }
                return JSON(new { message = "success" }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {

                return JSON(new { message =e.Message }, JsonRequestBehavior.AllowGet);
            }
        }


    }
}