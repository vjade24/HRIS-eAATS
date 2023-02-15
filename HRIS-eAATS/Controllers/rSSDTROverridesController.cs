using HRIS_eAATS.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Web;
using System.Web.Mvc;

namespace HRIS_eAATS.Controllers
{
    public class rSSDTROverridesController : Controller
    {
        HRIS_DEVEntities db_dev = new HRIS_DEVEntities();
        HRIS_ATSEntities db_ats = new HRIS_ATSEntities();
        HRIS_DTREntities db_dtr = new HRIS_DTREntities();
        User_Menu um = new User_Menu();
        // GET: rSSDTROverrides
        public ActionResult Index()
        {
            User_Menu um = new User_Menu();
            if (Session["user_id"] == null)
            {
                return RedirectToAction("../");
            }
            if (um != null || um.ToString() != "")
            {
                GetAllowAccess();
            }
            return View(um);
        }
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

                var empl_id     = Session["empl_id"].ToString();
                var dept_code   = Session["department_code"].ToString();
                var user_id     = Session["user_id"].ToString();
                var p_month     = DateTime.Now.Month < 10 ? "0"+ DateTime.Now.Month.ToString(): DateTime.Now.Month.ToString();
                var dtr_val = db_ats.sp_dtr_override_list(DateTime.Now.Year.ToString(), p_month, empl_id, "0", dept_code, user_id);

                //var empl_name = db_dev.sp_employee_list_dept(empl_id).ToList();

                var empl_name = from s in db_dev.vw_personnelnames_tbl
                                join r in db_dev.personnel_tbl
                                on s.empl_id equals r.empl_id
                                join t in db_dev.vw_payrollemployeemaster_hdr_tbl
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

                var dept_list = db_dev.vw_departments_tbl_list.ToList();

                return JSON(new { message = "success", um, dtr_val, empl_name, dept_list, dept_code }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message;
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }

        //*********************************************************************//
        // Created By   : Lorraine I. Ale 
        // Created Date : 02/03/2021
        // Description  : Filter Page Grid
        //*********************************************************************//
        public ActionResult FilterPageGrid(
            string p_dept_code
            , string p_empl_id
            , string p_year
            , string p_month
            , string p_view_type)
        {
            try
            {
                var empl_id     = p_empl_id;
                //var dept_code   = Session["department_code"].ToString();
                var user_id     = Session["user_id"].ToString();

                var empl_name       = db_dev.sp_employee_list_dept(p_dept_code).ToList();
                    var filteredGrid    = db_ats.sp_dtr_override_list(p_year, p_month, p_empl_id, p_view_type, p_dept_code, user_id).ToList();
                
                return JSON(new { message = "success", filteredGrid, empl_name }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message.ToString();
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }

        //*********************************************************************//
        // Created By   : Lorraine I. Ale 
        // Created Date : 02/03/2021
        // Description  : Filter Page Grid
        //*********************************************************************//
        public ActionResult DepartmentFilter(string p_dept_code)
        {
            try
            {
                 var empl_name = from s in db_dev.vw_personnelnames_tbl
                         join r in db_dev.personnel_tbl 
                         on s.empl_id equals r.empl_id
                         join t in db_dev.vw_payrollemployeemaster_hdr_tbl 
                         on s.empl_id equals t.empl_id
                        where r.emp_status == true
                        orderby s.last_name
                        
                        select new
                        {
                            s.empl_id              ,
                            s.employee_name        ,
                            s.last_name            ,
                            s.first_name           ,
                            s.middle_name          ,
                            s.suffix_name          ,
                            s.courtisy_title       ,
                            s.postfix_name         ,
                            s.employee_name_format2,
                            t.department_code      ,
                            t.employment_type      ,
                        };
               
                return JSON(new { message = "success", empl_name }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message.ToString();
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }

        //*********************************************************************//
        // Created By   : Lorraine I. Ale 
        // Created Date : 05/15/2020
        // Description  : Add new record to table with status as New
        //*********************************************************************//
        public ActionResult Save(dtr_overrides_tbl data)
        {
            try
            {
                var check_exist = db_ats.dtr_overrides_tbl.Where(a => a.dtr_order_no == data.dtr_order_no && a.empl_id == data.empl_id && a.dtr_date == data.dtr_date).FirstOrDefault();

                if (check_exist == null)
                {
                    //var new_appl_nbr        = db_ats.sp_generate_appl_nbr("dtr_overrides_tbl", 10, "dtr_order_no").ToList();
                    //data.dtr_order_no       = new_appl_nbr[0].ToString();
                    
                    data.time_in_am  =   data.time_in_am     == "" || data.time_in_am == null ? string.Empty : data.time_in_am;
                    data.time_out_am =   data.time_out_am    == "" || data.time_out_am == null ? string.Empty : data.time_out_am;
                    data.time_in_pm  =   data.time_in_pm     == "" || data.time_in_pm == null ? string.Empty : data.time_in_pm;
                    data.time_out_pm =   data.time_out_pm     == "" || data.time_out_pm == null ? string.Empty : data.time_out_pm;
                    data.under_Time         =   data.under_Time         == null ? 0 : data.under_Time;
                    data.under_Time_remarks =   data.under_Time_remarks == "" || data.under_Time_remarks == null ? string.Empty : data.under_Time_remarks;
                    data.remarks_details    =   data.remarks_details    == "" || data.remarks_details == null ? string.Empty : data.remarks_details;
                    data.time_ot_hris       =   data.time_ot_hris       == "" || data.time_ot_hris == null ? string.Empty : data.time_ot_hris;
                    data.time_days_equi     =   data.time_days_equi     == null ? 0 : data.time_days_equi;
                    data.time_hours_equi    =   data.time_hours_equi    == null ? 0 : data.time_hours_equi;
                    data.time_ot_payable    =   data.time_ot_payable    == null ? 0 : data.time_ot_payable;
                    data.no_of_as           =   data.no_of_as           == null ? 0 : data.no_of_as;
                    data.no_of_ob           =   data.no_of_ob           == null ? 0 : data.no_of_ob;
                    data.no_of_lv           =   data.no_of_lv           == null ? 0 : data.no_of_lv;
                    data.remarks_override   = data.remarks_override     == null ? "" : data.remarks_override;
                    data.reason_override    = data.reason_override      == null ? "" : data.reason_override;
                    data.approval_status    = data.approval_status      == null ? "" : data.approval_status;


                    data.created_by_user    = Session["user_id"].ToString();
                    data.created_dttm       = DateTime.Now;

                    db_ats.dtr_overrides_tbl.Add(data);
                    
                    db_ats.SaveChangesAsync();
                }
                else
                {
                    
                    check_exist.updated_by_user     = Session["user_id"].ToString();
                    check_exist.updated_dttm        = DateTime.Now;
                    check_exist.time_in_am          = data.time_in_am == "" || data.time_in_am == null ? string.Empty : data.time_in_am;
                    check_exist.time_out_am         = data.time_out_am == "" || data.time_out_am == null ? string.Empty : data.time_out_am;
                    check_exist.time_in_pm          = data.time_in_pm == "" || data.time_in_pm == null ? string.Empty : data.time_in_pm;
                    check_exist.time_out_pm         = data.time_out_pm == "" || data.time_out_pm == null ? string.Empty : data.time_out_pm;
                    check_exist.ts_code             = data.ts_code;
                    check_exist.under_Time          = data.under_Time == null ? 0 : data.under_Time;
                    check_exist.under_Time_remarks  = data.under_Time_remarks == "" || data.under_Time_remarks == null ? string.Empty : data.under_Time_remarks;
                    check_exist.remarks_details     = data.remarks_details == "" || data.remarks_details == null ? string.Empty : data.remarks_details;
                    check_exist.time_ot_hris        = data.time_ot_hris == "" || data.time_ot_hris == null ? string.Empty : data.time_ot_hris;
                    check_exist.time_days_equi      = data.time_days_equi == null ? 0 : data.time_days_equi;
                    check_exist.time_hours_equi     = data.time_hours_equi == null ? 0 : data.time_hours_equi;
                    check_exist.time_ot_payable     = data.time_ot_payable == null ? 0 : data.time_ot_payable;
                    check_exist.no_of_as            = data.no_of_as == null ? 0 : data.no_of_as;
                    check_exist.no_of_ob            = data.no_of_ob == null ? 0 : data.no_of_ob;
                    check_exist.no_of_lv            = data.no_of_lv == null ? 0 : data.no_of_lv;
                    check_exist.remarks_override    = data.remarks_override == null ? "" : data.remarks_override;
                    check_exist.reason_override     = data.reason_override == null ? "" : data.reason_override;
                    check_exist.approval_status     = data.approval_status == null ? "" : data.approval_status;
                    db_ats.SaveChangesAsync();
                }
                
                return Json(new { message = "success" }, JsonRequestBehavior.AllowGet);
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