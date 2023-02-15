using HRIS_Common;
using HRIS_eAATS.Models;
using System;
using System.Collections.Generic;
using System.Data.Entity.Validation;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace HRIS_eAATS.Controllers
{
    public class LoginController : Controller
    {

        // GET: Login
        HRIS_DEVEntities db     = new HRIS_DEVEntities();
        HRIS_ATSEntities db_ats = new HRIS_ATSEntities();
        CommonDB Cmn = new CommonDB();
        Dev_Version_Name dvn = new Dev_Version_Name();

        // GET: Login
        public ActionResult Index()
        {
            Session["history_page"] = "";
            dvn.DVName = "(" + db.Database.Connection.DataSource.ToString().Split('\\')[db.Database.Connection.DataSource.ToString().Split('\\').Length - 1] + ")";
            if (Session["user_id"] != null)
            {   
                return RedirectToAction("Index", "cMainPage");
            }
            else
            {

                return View(dvn);
            }

        }
        public ActionResult GetUserIsLogin()
        {

            if (Session["user_id"] != null)
            {
                return Json(new { data = Session["user_id"], success = 1 }, JsonRequestBehavior.AllowGet);
            }
            else
            {
                return Json(new { data = 0, success = 0 }, JsonRequestBehavior.AllowGet);
            }


        }
        public ActionResult isUserLogin()
        {
            if (Session["user_id"] != null)
            {
                var user = Session["user_id"];
                return Json(new { user = user, isLogin = 1 }, JsonRequestBehavior.AllowGet);
            }
            else
            {
                return Json(new { user = "", isLogin = 0 }, JsonRequestBehavior.AllowGet);
            }
        }
        public ActionResult Login_Validation(string username, string password)
        {

            try
            {
                var data = db.sp_user_login_ATS(username.Trim(), Cmn.EncryptString(password.Trim(), Cmn.CONST_WORDENCRYPTOR)).FirstOrDefault();
                if (data.log_in_flag == "Y")
                {
                    Session["user_id"]          = data.user_id;
                    Session["user_profile"]     = data.empl_photo;
                    Session["empl_id"]          = data.empl_id;
                    Session["employee_name"]    = data.employee_name;
                    Session["first_name"]       = data.first_name;
                    Session["last_name"]        = data.last_name;
                    Session["middle_name"]      = data.middle_name;
                    Session["suffix_name"]      = data.suffix_name;
                    Session["photo"]            = data.empl_photo;
                    Session["owner_fullname"]   = data.employee_name;
                    Session["budget_code"]      = data.budget_code;
                    Session["department_code"]  = data.department_code;
                    Session["employment_type"]  = data.employment_type;
                }
               

                //var log_in_flag = data.log_in_flag;
                //var log_in_flag_descr = data.log_in_flag_descr;

                return Json(new { data = data, success = 1 }, JsonRequestBehavior.AllowGet);


            }
            catch (Exception ex)
            {
                return Json(new { data = ex.Message, success = 0 }, JsonRequestBehavior.AllowGet);

            }

        }
        public ActionResult logout()
        {
            Session.Abandon();
            return Json("expire", JsonRequestBehavior.AllowGet);
            //Session.Clear();
            //if (Session["user_id"] == null)
            //{
            //    return Json(new { session = 0, success = 1 }, JsonRequestBehavior.AllowGet);
            //}
            //else
            //{
            //    return Json(new { session = 1, success = 0 }, JsonRequestBehavior.AllowGet);
            //}
        }
        public ActionResult CheckSessionLogin()
        {
            if (Session["user_id"] == null)
            {
                return Json("expire", JsonRequestBehavior.AllowGet);
            }
            else
            {
                return Json("active", JsonRequestBehavior.AllowGet);
            }
        }
        public ActionResult Current_Value()
        {
            var session_time = Session.Timeout;

            return Json(new { session_time }, JsonRequestBehavior.AllowGet);
        }
        public ActionResult DestroySession()
        {
            Session.Abandon();
            return Json(new { msg = "success" }, JsonRequestBehavior.AllowGet);
        }
        //public ActionResult SetHistoryPage()
        //{
        //    try
        //    {
        //        Session["history_page"] = Request.UrlReferrer.ToString();

        //        return Json(new { message = "success" }, JsonRequestBehavior.AllowGet);
        //    }
        //    catch (DbEntityValidationException e)
        //    {
        //        string message = e.Message;
        //        return Json(new { message = message }, JsonRequestBehavior.AllowGet);
        //    }
        //}

    }
}