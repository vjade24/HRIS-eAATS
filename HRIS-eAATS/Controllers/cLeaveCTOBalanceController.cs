using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Web;
using System.Web.Mvc;
using HRIS_eAATS.Models;

namespace HRIS_eAATS.Controllers
{
    public class cLeaveCTOBalanceController : Controller
    {
        HRIS_DEVEntities db     = new HRIS_DEVEntities();
        HRIS_ATSEntities db_ats = new HRIS_ATSEntities();
        User_Menu um            = new User_Menu();
        public ActionResult Index()
        {
            try
            {
                if (um != null || um.ToString() != "")
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
                }
                return View(um);
            }
            catch (Exception)
            {
                return RedirectToAction("Index", "Login");
            }
        }
        protected ActionResult JSON(object data, JsonRequestBehavior behavior)
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
        public ActionResult InitializeData()
        {
            try
            {
                var dep_code    = Session["department_code"].ToString();
                var log_empl_id = Session["empl_id"].ToString();
                var dep_lst     = db_ats.vw_leaveadmin_tbl_list.Where(a => a.empl_id == log_empl_id).OrderBy(a => a.department_code);
                var data        = db_ats.sp_leave_balances_rep(DateTime.Now.Year.ToString(), dep_code).ToList();
                return JSON(new { data, dep_lst, dep_code, message = "success" }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message.ToString();
                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
        }
        public ActionResult FilterGrid(string year,string dep_code)
        {
            try
            {
                var data        = db_ats.sp_leave_balances_rep(year, dep_code).ToList();
                return JSON(new { data, message = "success" }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message.ToString();
                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
        }
    }
}