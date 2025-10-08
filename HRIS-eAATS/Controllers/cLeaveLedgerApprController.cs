using HRIS_eAATS.Models;
using System;
using System.Collections.Generic;
using System.Data.Entity.Validation;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;

namespace HRIS_eAATS.Controllers
{
    public class cLeaveLedgerApprController : Controller
    {
        HRIS_DEVEntities db         = new HRIS_DEVEntities();
        HRIS_ATSEntities db_ats     = new HRIS_ATSEntities();
        HRIS_TRKEntities db_trk     = new HRIS_TRKEntities();
        User_Menu um                = new User_Menu();
        // GET: cLeaveLedgerAppr
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
            um.allow_add            = 1;
            um.allow_delete         = 1;
            um.allow_edit           = 1;
            um.allow_edit_history   = 1;
            um.allow_print          = 1;
            um.allow_view           = 1;
            um.id                   = 0;
            um.menu_name            = "Leave Review/Approval";
            um.page_title           = "";
            um.url_name             = "";
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
                var um = GetAllowAccess();
                var log_empl_id = Session["empl_id"].ToString();
                var leaveType                       = db_ats.sp_leavetype_tbl_list().ToList();
                var leaveSubType                    = db_ats.sp_leavesubtype_tbl_list("").ToList();
                var lv_admin_dept_list              = db_ats.vw_leaveadmin_tbl_list.Where(a => a.empl_id == log_empl_id && a.approver == true).OrderBy(a => a.department_code);

                var admin_names                     = from a in db_ats.vw_leaveadmin_tbl_list.Where(a=>a.approver == true).ToList()
                                                      join b in db_ats.vw_personnelnames_tbl_HRIS_ATS
                                                      on a.empl_id equals b.empl_id
                                                      select new
                                                      {
                                                          b
                                                      };
                admin_names = admin_names.Distinct();

                var ledgerposting_for_approval_list1 = from t1 in db_ats.sp_ledgerposting_for_approval_list(Session["user_id"].ToString(), "N", DateTime.Now, DateTime.Now).ToList()
                                   where (from t2 in lv_admin_dept_list.ToList()
                                          where t2.empl_id == log_empl_id
                                          select t2.department_code).Contains(t1.department_code)
                                   select t1;

                var info_list2_chart = from s in ledgerposting_for_approval_list1.ToList()
                                       orderby s.evaluated_dttm
                                       group s by s.evaluated_dttm.Date into g
                                       select new
                                       {
                                           Label = (from l in g select l.evaluated_dttm).Distinct(),
                                           Count = (from l in g select l.evaluated_dttm).Count()
                                       };

                var ledgerposting_for_approval_list = from a in ledgerposting_for_approval_list1.ToList()
                                                join b in db_ats.leave_application_mone_tbl
                                                on new { a.empl_id, a.leave_ctrlno } equals new { b.empl_id, b.leave_ctrlno } into temp
                                                from b in temp.DefaultIfEmpty()
                                                select new
                                                {
                                                     a.ledger_ctrl_no
                                                    ,a.empl_id
                                                    ,a.employee_name
                                                    ,a.leavetype_code
                                                    ,a.leavetype_descr
                                                    ,a.leaveledger_date
                                                    ,a.leaveledger_period
                                                    ,a.leaveledger_particulars
                                                    ,a.leaveledger_entry_type
                                                    ,a.leaveledger_entry_type_desc
                                                    ,a.details_remarks
                                                    ,a.approval_status
                                                    ,a.approval_status_descr
                                                    ,a.approval_id
                                                    ,a.cancel_pending_comment
                                                    ,a.cancelled_comment
                                                    ,a.disapproval_comment
                                                    ,a.reviewed_comment
                                                    ,a.level1_approval_comment
                                                    ,a.level2_approval_comment
                                                    ,a.final_approval_comment
                                                    ,a.empl_id_creator
                                                    ,a.creator_name
                                                    ,a.user_id_creator
                                                    ,a.worklist_status
                                                    ,a.worklist_action
                                                    ,a.next_status
                                                    ,a.leavesubtype_code
                                                    ,a.date_applied
                                                    ,a.leave_ctrlno
                                                    ,a.evaluated_dttm
                                                    ,a.inclusive_dates
                                                    ,a.justification_flag
                                                    ,a.cancellation_flag
                                                    ,a.department_code
                                                    ,a.department_short_name
                                                    ,a.evaluated_by
                                                    ,mone = b
                                                };
                return JSON(new { message = "success", um , leaveType, leaveSubType, ledgerposting_for_approval_list, lv_admin_dept_list, info_list2_chart, admin_names, log_empl_id }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message.ToString();
                return Json(new {  message }, JsonRequestBehavior.AllowGet);
            }
        }
        //*********************************************************************//
        // Created By   : Vincent Jade H. Alivio 
        // Created Date : 04/03/2020
        // Description  : Filter Page Grid
        //*********************************************************************//
        public ActionResult FilterPageGrid(string par_show_history,string par_rep_mode,DateTime? date_fr_grid,DateTime? date_to_grid,string empl_id,string department_code)
        {
            try
            {
                var log_empl_id = Session["empl_id"].ToString();
                var log_user_id = "U" + empl_id;
                var lv_admin_dept_list = db_ats.vw_leaveadmin_tbl_list.Where(a => a.empl_id == empl_id && a.approver == true).OrderBy(a => a.department_code);
                bool is_same = false;
                var filteredGrid1 = db_ats.sp_ledgerposting_for_approval_list(log_user_id, par_show_history, date_fr_grid, date_to_grid).ToList();

                if (par_show_history == "Y")
                {
                    filteredGrid1 = filteredGrid1.Where(a => a.evaluated_by == "U"+ empl_id).ToList();
                }
                else
                {
                    var filteredGrid_v2 = from t1 in db_ats.sp_ledgerposting_for_approval_list(log_user_id, par_show_history, date_fr_grid, date_to_grid).ToList()
                    where (from t2 in lv_admin_dept_list.ToList()
                           where t2.empl_id == empl_id
                           select t2.department_code).Contains(t1.department_code)
                    select t1;

                    filteredGrid1 = filteredGrid_v2.ToList();
                }

                if (department_code.ToString() != "")
                {
                    filteredGrid1 = filteredGrid1.Where(a => a.department_code == department_code).ToList();
                }
                

                if (par_rep_mode == "2") // Leave 
                {
                    filteredGrid1 = filteredGrid1.Where(a => a.leavetype_code != "CTO").ToList();

                }
                else if (par_rep_mode == "3") // CTO 
                {
                    filteredGrid1 = filteredGrid1.Where(a => a.leavetype_code == "CTO").ToList();
                }
                if (par_show_history == "Y" && date_fr_grid != null & date_to_grid != null)
                {
                    filteredGrid1 = filteredGrid1.Where(a=> a.evaluated_dttm.Date >= date_fr_grid.Value.Date && a.evaluated_dttm.Date <= date_to_grid.Value.Date).ToList();
                }
                var info_list2_chart = from s in filteredGrid1.ToList()
                                       orderby s.evaluated_dttm
                                       group s by s.evaluated_dttm.ToString("MMM dd, yyyy") into g
                                       select new
                                       {
                                           Label = (from l in g select l.evaluated_dttm.ToString("MMM dd, yyyy")).Distinct(),
                                           Count = (from l in g select l.evaluated_dttm).Count()
                                       };

                var donut_chart     = from s in filteredGrid1.ToList()
                                       orderby s.leavetype_descr
                                       group s by s.leavetype_descr into g
                                       select new
                                       {
                                           Label = (from l in g select l.leavetype_descr).Distinct(),
                                           Count = (from l in g select l.leavetype_descr).Count()
                                       };

                var line_chart = from s in filteredGrid1.ToList()
                                 orderby s.evaluated_dttm
                                 group s by s.evaluated_dttm.ToString("yyyy-MM") into g
                                 select new
                                 {
                                      data      = g.ToList(),
                                      y         = (from l in g select l.evaluated_dttm.ToString("yyyy-MM")).Distinct(),
                                      a         = (from l in g select l.evaluated_dttm).Count(),
                                      b         = g.ToList().Where(a => a.justification_flag == true).Count(),
                                      c         = g.ToList().Where(a => a.cancellation_flag  != "").Count(),
                                 };
                if(date_fr_grid.Value.ToString("yyyy-MM") == date_to_grid.Value.ToString("yyyy-MM"))
                {
                    is_same    = true;
                    line_chart = from s in filteredGrid1.ToList()
                                 orderby s.evaluated_dttm
                                 group s by s.evaluated_dttm.ToString("yyyy-MM-dd") into g
                                 select new
                                 {
                                      data      = g.ToList(),
                                      y         = (from l in g select l.evaluated_dttm.ToString("yyyy-MM-dd")).Distinct(),
                                      a         = (from l in g select l.evaluated_dttm).Count(),
                                      b         = g.ToList().Where(a => a.justification_flag == true).Count(),
                                      c         = g.ToList().Where(a => a.cancellation_flag  != "").Count(),
                                 };
                }
                var filteredGrid = from a in filteredGrid1.ToList()
                                                join b in db_ats.leave_application_mone_tbl
                                                on new { a.empl_id, a.leave_ctrlno } equals new { b.empl_id, b.leave_ctrlno } into temp
                                                from b in temp.DefaultIfEmpty()
                                                select new
                                                {
                                                     a.ledger_ctrl_no
                                                    ,a.empl_id
                                                    ,a.employee_name
                                                    ,a.leavetype_code
                                                    ,a.leavetype_descr
                                                    ,a.leaveledger_date
                                                    ,a.leaveledger_period
                                                    ,a.leaveledger_particulars
                                                    ,a.leaveledger_entry_type
                                                    ,a.leaveledger_entry_type_desc
                                                    ,a.details_remarks
                                                    ,a.approval_status
                                                    ,a.approval_status_descr
                                                    ,a.approval_id
                                                    ,a.cancel_pending_comment
                                                    ,a.cancelled_comment
                                                    ,a.disapproval_comment
                                                    ,a.reviewed_comment
                                                    ,a.level1_approval_comment
                                                    ,a.level2_approval_comment
                                                    ,a.final_approval_comment
                                                    ,a.empl_id_creator
                                                    ,a.creator_name
                                                    ,a.user_id_creator
                                                    ,a.worklist_status
                                                    ,a.worklist_action
                                                    ,a.next_status
                                                    ,a.leavesubtype_code
                                                    ,a.date_applied
                                                    ,a.leave_ctrlno
                                                    ,a.evaluated_dttm
                                                    ,a.inclusive_dates
                                                    ,a.justification_flag
                                                    ,a.cancellation_flag
                                                    ,a.department_code
                                                    ,a.department_short_name
                                                    ,a.evaluated_by
                                                    ,mone = b
                                                };

                return JSON(new { message = "success", filteredGrid, info_list2_chart, donut_chart , line_chart ,lv_admin_dept_list , log_empl_id , is_same }, JsonRequestBehavior.AllowGet);
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
        public ActionResult ApprReviewerAction(lv_ledger_hdr_tbl data)
        {
            try
            {
                var transac_apprvr = db.sp_update_transaction_in_approvalworkflow_tbl(data.approval_id, Session["user_id"].ToString(), data.approval_status, data.details_remarks);

                var query               = db_ats.lv_ledger_hdr_tbl.Where(a => a.ledger_ctrl_no == data.ledger_ctrl_no).FirstOrDefault();
                query.approval_status   = data.approval_status;
                query.details_remarks   = data.details_remarks;
                
                if ((query.leave_ctrlno != null && query.leave_ctrlno != "") && data.approval_status == "F")
                {
                    var od3 = db_ats.leave_application_hdr_tbl.Where(a => a.leave_ctrlno == query.leave_ctrlno).FirstOrDefault();
                    od3.posting_status = true;

                    // *************************************************************
                    // **** VJA - 2023-06-01 -- Insert Leave Ledger History ********
                    // *************************************************************
                    var appl_status = "Evaluated";
                    db_ats.sp_lv_ledger_history_insert(data.ledger_ctrl_no, data.leave_ctrlno, query.empl_id, appl_status, data.details_remarks, Session["user_id"].ToString());
                    // *************************************************************
                    // **** VJA - 2023-06-01 -- Insert Leave Ledger History ********
                    // *************************************************************

                }
                //Update leave_application_hdr_tbl change posting status to 0 (false) and details will be Cancelled or Disapporved
                if (data.approval_status == "C" || data.approval_status == "D")
                {
                    var od3 = db_ats.leave_application_hdr_tbl.Where(a => a.leave_ctrlno == query.leave_ctrlno).FirstOrDefault();
                    od3.posting_status = false;

                    // *************************************************************
                    // **** VJA - 2023-06-01 -- Insert Leave Ledger History ********
                    // *************************************************************
                    var appl_status = (data.approval_status == "C" ? "(Cancel Pending)" : "(Disapproved)") + " from Evaluation";
                    db_ats.sp_lv_ledger_history_insert(data.ledger_ctrl_no, data.leave_ctrlno, query.empl_id, appl_status, data.details_remarks, Session["user_id"].ToString());
                    // *************************************************************
                    // **** VJA - 2023-06-01 -- Insert Leave Ledger History ********
                    // *************************************************************
                }
                
                db.SaveChanges();
                db_ats.SaveChanges();
                return JSON(new { message = "success" }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message.ToString();
                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
        }
        
        
        //*********************************************************************//
        // Created By   : Vincent Jade H. Alivio 
        // Created Date : 05/05/2021
        // Description  : Initialized during pageload
        //*********************************************************************//
        public ActionResult GetLedgerDetails(string par_ledger_ctrl_no)
        {
            try
            {
                var lv_ledger_dtl_tbl_list = db_ats.sp_lv_ledger_dtl_tbl_list(par_ledger_ctrl_no).ToList();
                return JSON(new{message = "success", lv_ledger_dtl_tbl_list}, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message;
                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
        }
        //*********************************************************************//
        // Created By   : Vincent Jade H. Alivio
        // Created Date : 05/05/2021
        // Description  : Initialized during pageload
        //*********************************************************************//
        public ActionResult GetSumofLeaveDetails(string par_ledger_ctrl_no, string par_leavetype_code)
        {
            try
            {
                decimal sum_wp_and_wop  = 0; 
                var dtl_value           = db_ats.lv_ledger_dtl_tbl.Where(a=> a.ledger_ctrl_no == par_ledger_ctrl_no && a.leavetype_code == par_leavetype_code).FirstOrDefault();
                sum_wp_and_wop          = Convert.ToDecimal(dtl_value.leaveledger_abs_und_wp) + Convert.ToDecimal(dtl_value.leaveledger_abs_und_wop);
                return JSON(new{message = "success",dtl_value,sum_wp_and_wop}, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message;
                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
        }
        
        //*********************************************************************//
        // Created By   : Vincent Jade H. Alivio
        // Created Date : 2022-05-24
        // Description  : Initialized during pageload
        //*********************************************************************//
        public ActionResult RetrieveNextNbr()
        {
            try
            {
                var nxt_ctrl_nbr = db_ats.sp_generate_key("transmittal_leave_hdr_tbl", "doc_ctrl_nbr", 12).ToList().FirstOrDefault();
                return JSON(new { message = "success", nxt_ctrl_nbr }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message;
                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
        }
        
        public ActionResult RetrieveRePrint(string ledger_ctrl_no, string empl_id)
        {
            try
            {
                var data = db_ats.lv_ledger_hdr_reprint_tbl.Where(a => a.ledger_ctrl_no == ledger_ctrl_no && a.empl_id == empl_id).OrderByDescending(a => a.id).FirstOrDefault();
                return Json(new { message= "success",data }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message.ToString();
                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }

        }
        public ActionResult UpdateRePrint(string ledger_ctrl_no, string empl_id)
        {
            try
            {
                var data_upd = db_ats.lv_ledger_hdr_reprint_tbl.Where(a => a.ledger_ctrl_no == ledger_ctrl_no && a.empl_id == empl_id).OrderByDescending(a => a.id).FirstOrDefault();
                data_upd.approved_by        = Session["user_id"].ToString();
                data_upd.approved_dttm      = DateTime.Now;
                data_upd.reprint_status     = "REQUEST-APPROVED";
                db_ats.SaveChanges();
                return Json(new { message = "success" }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message.ToString();
                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }

        }
    }
}