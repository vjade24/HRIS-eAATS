
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
    public class cLeaveHistoryController : Controller
    {
        HRIS_DEVEntities db = new HRIS_DEVEntities();
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
                var data = db_ats.vw_leave_appl_posting_indv_history.Where(a=> a.empl_id == "").GroupBy(
                                                                            p => p.leave_ctrlno,
                                                                            p => p,
                                                                            (key, g) => new { leave_ctrlno = key, Grouped = g.ToList() });
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
                return JSON(new { message = "success", um, data , empl_names }, JsonRequestBehavior.AllowGet);
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
        public ActionResult FilterPageGrid(string par_empl_id)
        {
            try
            {
                db_ats.Database.CommandTimeout = int.MaxValue;
                var data = db_ats.vw_leave_appl_posting_indv_history.Where(a => a.empl_id == par_empl_id).GroupBy(
                                                                            p => p.leave_ctrlno,
                                                                            p => p,
                                                                            (key, g) => new
                                                                            {leave_ctrlno        = g.FirstOrDefault().leave_ctrlno         
                                                                            ,ledger_ctrl_no      = g.FirstOrDefault().ledger_ctrl_no       
                                                                            ,empl_id             = g.FirstOrDefault().empl_id              
                                                                            ,employee_name       = g.FirstOrDefault().employee_name        
                                                                            ,leavetype_descr     = g.FirstOrDefault().leavetype_descr      
                                                                            ,leavesubtype_descr  = g.FirstOrDefault().leavesubtype_descr   
                                                                            ,leave_dates         = g.FirstOrDefault().leave_dates
                                                                            ,action_remarks      = g.FirstOrDefault().action_remarks
                                                                            ,Grouped                                 = g.ToList() }).OrderByDescending(a=> a.leave_ctrlno);
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