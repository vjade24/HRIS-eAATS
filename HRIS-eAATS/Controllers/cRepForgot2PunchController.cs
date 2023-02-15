using HRIS_eAATS.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Web;
using System.Web.Mvc;

namespace HRIS_eAATS.Controllers
{
    public class cRepForgot2PunchController : Controller
    {
        HRIS_DEVEntities db = new HRIS_DEVEntities();
        HRIS_ATSEntities db_ats = new HRIS_ATSEntities();
        // GET: cRepForgot2Punch

        public ActionResult Index()
        {
            User_Menu um = new User_Menu();
            if (Session["user_id"] == null || Session["user_id"].ToString().Trim() == "")
            {
                return RedirectToAction("Index", "Login");
            }
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

        public ActionResult InitializePage()
        {
            User_Menu um = new User_Menu();
            if (Session["user_id"] == null || Session["user_id"].ToString().Trim() == "")
            {
                return RedirectToAction("Index", "Login");
            }
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

            db.Database.CommandTimeout = int.MaxValue;
            var empl_names = from s in db.vw_personnelnames_tbl
                             join r in db.personnel_tbl
                             on s.empl_id equals r.empl_id
                             join t in db.vw_payrollemployeemaster_hdr_tbl
                             on s.empl_id equals t.empl_id
                             where r.emp_status == true
                             orderby s.last_name
                             select new
                             {
                                 s.empl_id,
                                 s.employee_name,
                                 s.last_name,
                                 s.first_name,
                                 s.middle_name,
                                 s.suffix_name,
                                 s.courtisy_title,
                                 s.postfix_name,
                                 s.employee_name_format2,
                                 t.department_code,
                                 t.employment_type,
                             };

            return JSON(new { message = "success", um, empl_names }, JsonRequestBehavior.AllowGet);
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
        public ActionResult checklist(string year, string month,string period_from, string period_to, string empl_id)
        {
            Session["history_page"] = Request.UrlReferrer.ToString();
            try
            {
                db_ats.Database.CommandTimeout = int.MaxValue;
                var period_from_date = Convert.ToDateTime(period_from);
                var period_to_date = Convert.ToDateTime(period_to);
                var checklist = db_ats.sp_forgot_punch_rep(year, month, period_from_date, period_to_date, empl_id).ToList();
                return JSON(new { icon="success",checklist }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { icon = "error",message=ex.Message}, JsonRequestBehavior.AllowGet);
            }
          
          
        }
    }
}