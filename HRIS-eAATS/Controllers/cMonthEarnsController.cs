﻿
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
    public class cMonthEarnsController : Controller
    {
        HRIS_ATSEntities db_ats = new HRIS_ATSEntities();
        User_Menu um = new User_Menu();
        // GET: cLeaveLedgerAppr
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
            um.allow_add = 1;
            um.allow_delete = 1;
            um.allow_edit = 1;
            um.allow_edit_history = 1;
            um.allow_print = 1;
            um.allow_view = 1;
            um.id = 0;
            um.menu_name = Session["menu_name"].ToString();
            um.page_title = Session["page_title"].ToString();
            um.url_name = Session["url_name"].ToString();
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
        // Created By   : Vincent Jade H. Alivio 
        // Created Date : 01/20/2020
        // Description  : Initialized during leave type pageload
        //*********************************************************************//
        public ActionResult InitializeData()
        {
            try
            {
                db_ats.Database.CommandTimeout = int.MaxValue;
                var um                  = GetAllowAccess();
                var log_empl_id         = Session["empl_id"].ToString();
                var lv_admin_dept_list  = db_ats.vw_leaveadmin_tbl_list.Where(a => a.empl_id == log_empl_id).OrderBy(a => a.department_code);
                var data                = db_ats.sp_lv_ledger_earn_history_tbl_list(DateTime.Now.Year.ToString(),DateTime.Now.Month.ToString(),"","VL").ToList();

                return JSON(new { message = "success", um, lv_admin_dept_list, data }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message.ToString();
                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
        }
        //*********************************************************************//
        // Created By   : Vincent Jade H. Alivio 
        // Created Date : 04/03/2020
        // Description  : Filter Page Grid
        //*********************************************************************//
        public ActionResult FilterPageGrid(
            string par_year,
            string par_month,
            string par_department_code,
            string par_earning_type
        )
        {
            try
            {
                db_ats.Database.CommandTimeout = int.MaxValue;
                var data = db_ats.sp_lv_ledger_earn_history_tbl_list(par_year, par_month, par_department_code, par_earning_type).ToList();
                return JSON(new { message = "success", data }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message.ToString();
                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
        }
        //*********************************************************************//
        // Created By   : Vincent Jade H. Alivio 
        // Created Date : 04/03/2020
        // Description  : Filter Page Grid
        //*********************************************************************//
        public ActionResult GenerateEarn(
            string par_year,
            string par_month,
            string par_department_code,
            string par_empl_id,
            string par_earning_type
        )
        {
            try
            {
                db_ats.Database.CommandTimeout = int.MaxValue;
                var par_user_id = Session["user_id"].ToString();
                var data = db_ats.sp_lv_ledger_generate_earning(par_year, par_month, par_department_code, par_empl_id, par_user_id, par_earning_type).ToList().FirstOrDefault();
                return JSON(new { message = "success", data }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message.ToString();
                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
        }
    }
}