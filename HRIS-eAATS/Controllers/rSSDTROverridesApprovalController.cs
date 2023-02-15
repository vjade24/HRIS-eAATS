//*****************************************************
//Created BY        : Joseph M. Tombo Jr
//Created Date      : 06/11/2021
//Created Purpose   : Page for Approval DTR Override
//*****************************************************
using HRIS_eAATS.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Web;
using System.Web.Mvc;

namespace HRIS_eAATS.Controllers
{
    public class rSSDTROverridesApprovalController : Controller
    {
        HRIS_DEVEntities db_dev = new HRIS_DEVEntities();
        HRIS_ATSEntities db_ats = new HRIS_ATSEntities();
        HRIS_DTREntities db_dtr = new HRIS_DTREntities();
        User_Menu um            = new User_Menu();
        // GET: rSSDTROverridesApproval
        private User_Menu GetAllowAccess()
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

        public ActionResult Index()
        {
            if(Session["user_id"] == null)
            {
                return RedirectToAction("../");
            }
            if (um != null || um.ToString() != "")
            {
                GetAllowAccess();
            }
            return View(um);
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
        // Created By   : Joseph M. Tombo Jr.
        // Created Date : 03/05/2020
        // Description  : Initialized during pageload
        //*********************************************************************//
        public ActionResult InitializeData()
        {
            try
            {
                GetAllowAccess();

                var empl_id     = Session["empl_id"].ToString();
                var dept_code   = Session["department_code"].ToString();
                var user_id     = Session["user_id"].ToString();

                var dtr_val     = db_ats.sp_dtr_override_approval_list(DateTime.Now.Year.ToString(), DateTime.Now.Month.ToString(), empl_id, "0", dept_code, user_id,"1");
                string p_year   = DateTime.Now.Year.ToString();
                string p_month  = DateTime.Now.Month.ToString();
                var empl_name   = db_ats.sp_employee_dtr_override_approval_list(dept_code,p_year,p_month,"1").ToList();
                var dept_list   = db_ats.sp_department_list_override_approval(p_year, p_month).ToList();

                return JSON(new { message = "success", um, dtr_val, empl_name, dept_list, dept_code }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message;
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }

        //*********************************************************************//
        // Created By   : Joseph M. Tombo Jr.
        // Created Date : 02/03/2021
        // Description  : Filter Page Grid
        //*********************************************************************//
        public ActionResult FilterPageGrid(
            string p_dept_code
            , string p_empl_id
            , string p_year
            , string p_month
            , string p_view_type
            , string p_showoption)
        {
            try
            {
                var empl_id     = p_empl_id;
                //var dept_code   = Session["department_code"].ToString();
                var user_id     = Session["user_id"].ToString();

                var empl_name       = db_ats.sp_employee_dtr_override_approval_list(p_dept_code,p_year,p_month, p_showoption).ToList();
                var filteredGrid    = db_ats.sp_dtr_override_approval_list(p_year, p_month, p_empl_id, p_view_type, p_dept_code, user_id, p_showoption);
                
                return JSON(new { message = "success", filteredGrid, empl_name }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message.ToString();
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }


         //*********************************************************************//
        // Created By   : Joseph M. Tombo Jr.
        // Created Date : 02/03/2021
        // Description  : Filter Page Grid
        //*********************************************************************//
        public ActionResult ApproveAll(
              string p_empl_id
            , string p_year
            , string p_month)
        {
            try
            {
                var empl_id     = p_empl_id;
                var user_id     = Session["user_id"].ToString();

                var empl_name       = db_ats.sp_dtr_override_approved_all(p_year,p_month, p_empl_id,user_id,"F");
                return JSON(new { message = "success" }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message.ToString();
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }
        //*********************************************************************//
        // Created By   : Joseph M. Tombo Jr.
        // Created Date : 02/03/2021
        // Description  : Filter Page Grid
        //*********************************************************************//
        public ActionResult CancelAll(
              string p_empl_id
            , string p_year
            , string p_month)
        {
            try
            {
                var empl_id = p_empl_id;
                var user_id = Session["user_id"].ToString();

                var empl_name = db_ats.sp_dtr_override_approved_all(p_year, p_month, p_empl_id, user_id, "C");
                return JSON(new { message = "success" }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message.ToString();
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }

        //*********************************************************************//
        // Created By   : Joseph M. Tombo Jr.
        // Created Date : 02/03/2021
        // Description  : Filter Page Grid
        //*********************************************************************//
        public ActionResult DepartmentFilter(string p_year,string p_month, string p_dept_code, string p_showoption)
        {
            try
            {
                var empl_name = db_ats.sp_employee_dtr_override_approval_list(p_dept_code,p_year,p_month, p_showoption).ToList();
               
                return JSON(new { message = "success", empl_name }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message.ToString();
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }

        //*********************************************************************//
        // Created By   : Joseph M. Tombo Jr.
        // Created Date : 06/18/2021
        // Description  : Get Departments
        //*********************************************************************//
        public ActionResult GetDepartments(string p_year, string p_month)
        {
            try
            {
                var dept_list = db_ats.sp_department_list_override_approval(p_year, p_month).ToList();

                return JSON(new { message = "success", dept_list }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message.ToString();
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }

        //*********************************************************************//
        // Created By   : Joseph M. Tombo Jr.
        // Created Date : 06/11/2021
        // Description  : Add new record to table with status as New
        //*********************************************************************//
        public ActionResult Save(dtr_overrides_tbl data)
        {
            try
            {
                string message = "";
                var check_exist = db_ats.dtr_overrides_tbl.Where(a => a.dtr_order_no == data.dtr_order_no && a.empl_id == data.empl_id && a.dtr_date == data.dtr_date).FirstOrDefault();

                if (check_exist == null)
                {
                    message = "Override Transaction Not Found In database!";
                }
                else
                {
                    
                    check_exist.updated_by_user     = Session["user_id"].ToString();
                    check_exist.updated_dttm        = DateTime.Now;
                    check_exist.approval_status     = data.approval_status == null ? "" : data.approval_status;
                    check_exist.approved_by         = Session["user_id"].ToString();
                    check_exist.approved_dttm       = DateTime.Now;
                    db_ats.SaveChangesAsync();
                    message = "success";
                }
                
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message.ToString();
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }


        //*********************************************************************//
        // Created By   : Joseph M. Tombo Jr.
        // Created Date : 06/11/2021
        // Description  : Function for Cancel Pening
        //*********************************************************************//
        public ActionResult CancelPending(dtr_overrides_tbl data)
        {
            try
            {
                string message = "";
                var check_exist = db_ats.dtr_overrides_tbl.Where(a => a.dtr_order_no == data.dtr_order_no && a.empl_id == data.empl_id && a.dtr_date == data.dtr_date).FirstOrDefault();

                if (check_exist == null)
                {
                    message = "Override Transaction Not Found In database!";
                }
                else
                {

                    check_exist.updated_by_user = Session["user_id"].ToString();
                    check_exist.updated_dttm    = DateTime.Now;
                    check_exist.approval_status = data.approval_status == null ? "" : data.approval_status;
                    db_ats.SaveChangesAsync();
                    message = "success";
                }

                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message.ToString();
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }

        //*********************************************************************//
        // Created By   : Joseph M. Tombo Jr.
        // Created Date : 06/11/2021
        // Description  : Function For Disapproved
        //*********************************************************************//
        public ActionResult Disapproved(dtr_overrides_tbl data)
        {
            try
            {
                string message = "";
                var check_exist = db_ats.dtr_overrides_tbl.Where(a => a.dtr_order_no == data.dtr_order_no && a.empl_id == data.empl_id && a.dtr_date == data.dtr_date).FirstOrDefault();

                if (check_exist == null)
                {
                    message = "Override Transaction Not Found In database!";
                }
                else
                {

                    check_exist.updated_by_user = Session["user_id"].ToString();
                    check_exist.updated_dttm    = DateTime.Now;
                    check_exist.approval_status = data.approval_status == null ? "" : data.approval_status;
                    db_ats.SaveChangesAsync();
                    message = "success";
                }

                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message.ToString();
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }

        public ActionResult PreviousValuesOnPage_rSSDTROverrides ()
        {
            Session["history_page"] = Request.UrlReferrer.ToString();
            
            return Json(new { message = "success" }, JsonRequestBehavior.AllowGet);
        }
    }
}