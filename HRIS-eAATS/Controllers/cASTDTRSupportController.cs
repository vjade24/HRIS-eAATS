//**********************************************************************************
// PROJECT NAME     :   HRIS - eComval
// VERSION/RELEASE  :   HRIS Release #1
// PURPOSE          :   Code Behind for PHIC Payroll Registry
//**********************************************************************************
// REVISION HISTORY
//**********************************************************************************
// AUTHOR                    DATE            PURPOSE
//----------------------------------------------------------------------------------
// JOSEPH M. TOMBO JR.       03/03/2020      Code Creation
//**********************************************************************************
using HRIS_eAATS.Models;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity.Infrastructure;
using System.Data.Entity.Validation;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Text;
using System.Drawing;
using System.IO;

using HRIS_Common;
using System.Threading.Tasks;
using System.Data.Entity;

namespace HRIS_eAATS.Controllers
{
    public class cASTDTRSupportController : Controller
    {
        // GET: cASTDTRSupport
        // GET: cSSCOCAppl
        HRIS_DEVEntities db = new HRIS_DEVEntities();
        HRIS_DTREntities db_dtr = new HRIS_DTREntities();
        HRIS_ATSEntities db_ats = new HRIS_ATSEntities();
        User_Menu um = new User_Menu();
        CommonDB cmn = new CommonDB();
        //*********************************************************************//
        // Created By : JMTJR - Created Date : 03/04/2020
        // Description: Get the User Role
        //*********************************************************************//
        public void GetAllowAccess()
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

        // GET: cSSPHICPayReg
        public ActionResult Index()
        {
            if (Session["id"] == null || Session["id"].ToString() == "")
            {
                return RedirectToAction("Index", "Login");
            }
            else return View();
        }

        //*********************************************************************//
        // Created By : JMTJR - Created Date : 03/04/2020
        // Description : DATA CONVERTION FOR JSON
        //*********************************************************************//
        protected ActionResult JSON(object data, JsonRequestBehavior behavior)
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
        // Created By : JMTJR - Created Date : 03/04/2020
        // Description: Initialize Page
        //*********************************************************************//
        public ActionResult InitializePage()
        {
            var message = "";
            try
            {
                GetAllowAccess();

                var p_empl_id = Session["empl_id"].ToString();

                //var empl_names = from s in db.vw_personnelnames_tbl
                //         join r in db.personnel_tbl 
                //         on s.empl_id equals r.empl_id
                //         join t in db.vw_payrollemployeemaster_hdr_tbl 
                //         on s.empl_id equals t.empl_id
                //        where r.emp_status == true
                //        orderby s.last_name

                //        select new
                //        {
                //            s.empl_id              ,
                //            s.employee_name        ,
                //            s.last_name            ,
                //            s.first_name           ,
                //            s.middle_name          ,
                //            s.suffix_name          ,
                //            s.courtisy_title       ,
                //            s.postfix_name         ,
                //            s.employee_name_format2,
                //            t.department_code      ,
                //            t.employment_type      ,
                //        };
                //var all_appl = db_ats.vw_all_applications.Where(a => a.empl_id == p_empl_id).ToList().OrderBy(a=> a.transaction_code);
                //var trans_lst = db_ats.vw_all_applications.Where(a => a.empl_id == p_empl_id).GroupBy(a => a.transaction_code).ToList();
                var biometrics_location = db_dtr.bio_machine_info_tbl.Where(a => a.bio_status == 1);
                var dept_list = db.vw_departments_tbl_list.ToList();
                var data        = db_dtr.sp_dtr_from_bio_tbl_list3("", DateTime.Now.Year.ToString(), DateTime.Now.Month.ToString()).ToList();
                message = "success";

                return JSON(new {  data, message, p_empl_id,  dept_list, biometrics_location }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                return JSON(new { message = e.Message }, JsonRequestBehavior.AllowGet);
            }

        }
        //*********************************************************************//
        // Created By : JMTJR - Created Date : 03/04/2020
        // Description: Initialize Page
        //*********************************************************************//
        public ActionResult FilterPageGrid(string p_empl_id,string p_year , string p_month)
        {
            var message = "";
            try
            {
                //var all_appl = db_ats.vw_all_applications.Where(a => a.empl_id == p_empl_id).ToList().OrderBy(a => a.transaction_code);
                //var trans_lst = db_ats.vw_all_applications.Where(a => a.empl_id == p_empl_id).GroupBy(a => a.transaction_code).ToList();
                var data = db_dtr.sp_dtr_from_bio_tbl_list3(p_empl_id, p_year, p_month).ToList();
                
                var trnsmt =  from a in db_ats.empl_dtr_hdr_tbl
                              join b in db_ats.vw_personnelnames_tbl_HRIS_ATS 
                                on a.frst_qcna_posted_by.Replace("U", "") equals b.empl_id into frstJoin
                            from b in frstJoin.DefaultIfEmpty()
                            join c in db_ats.vw_personnelnames_tbl_HRIS_ATS
                                on a.sec_qcna_posted_by.Replace("U", "") equals c.empl_id into secJoin
                            from c in secJoin.DefaultIfEmpty()
                            where a.empl_id == p_empl_id
                                && a.dtr_year == p_year
                                && a.dtr_month == p_month
                                && (!string.IsNullOrEmpty(a.frst_qcna_posted_by) || !string.IsNullOrEmpty(a.sec_qcna_posted_by))
                            select new 
                            {
                                 a.dtr_order_no
                                ,a.dtr_year
                                ,a.dtr_month
                                ,a.department_code
                                ,a.approval_status
                                ,a.approval_id
                                ,a.approved_date
                                ,a.remarks
                                ,a.empl_id
                                ,a.created_ddtm
                                ,a.created_by
                                ,a.updated_ddtm
                                ,a.updated_by

                                ,frst_employee_name = b.employee_name
                                ,a.frst_qcna_posted_ddtm
                                ,a.frst_qcna_posted_by

                                ,sec_employee_name = c.employee_name
                                ,a.sec_qcna_posted_ddtm
                                ,a.sec_qcna_posted_by
                                ,a.post_status

                            };

                var trnsmt_list = from a in db_ats.dtr_transmittal_hdr_tbl
                                  join d in db_ats.vw_approvalstatus_tbl
                                    on a.approval_status equals d.approval_status into status_descr
                                    from d in status_descr.DefaultIfEmpty()
                                  join b in db_ats.dtr_transmittal_dtl_tbl
                                      on a.transmittal_nbr equals b.transmittal_nbr
                                  join c in db_ats.vw_personnelnames_tbl_HRIS_ATS
                                      on a.created_by.Replace("U", "") equals c.empl_id into createdJoin
                                  from c in createdJoin.DefaultIfEmpty()
                                  where a.dtr_year == p_year
                                      && a.dtr_month == p_month
                                      && b.empl_id == p_empl_id
                                  select new
                                  {
                                      a.transmittal_nbr,
                                      a.approval_status,
                                      d.approval_status_descr,
                                      view_type_descr = a.view_type == "0" ? "Whole month" :
                                                        a.view_type == "1" ? "1st Quincena" :
                                                        a.view_type == "2" ? "2nd Quincena" : "--",
                                      transmittal_type = a.transmittal_type ?? "",
                                      transmittal_type_descr = (a.transmittal_type ?? "") == "H" ? "Other Purpose" :
                                                               (a.transmittal_type ?? "") == "O" ? "For Overtime" :
                                                               (a.transmittal_type ?? "") == "P" ? "For Payroll" :
                                                               (a.transmittal_type ?? "") == "R" ? "Salary Requirements" :
                                                               (a.transmittal_type ?? "") == "F" ? "Request for Refund Form" :
                                                               (a.transmittal_type ?? "") == "S" ? "For Hazard, Subsistence and Laundry" : "--",
                                      a.dtr_year,
                                      a.dtr_month,
                                      a.created_by,
                                      a.created_dttm,
                                      created_name = c.employee_name
                                  };

                //var peopleWithFullName = db.vw_personnelnames_tbl
                //                        .Select(p => new
                //                        {
                //                            Id = p.empl_id,
                //                            FullName = db_ats.func_get_date_applied_leave_application(p.empl_id)
                //                        })
                //                        .ToList();

                message = "success";
                return JSON(new { data ,message , trnsmt, trnsmt_list }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                return JSON(new { message = e.Message }, JsonRequestBehavior.AllowGet);
            }
            
        }
        //*********************************************************************//
        // Created By  : VJA - Created Date : 02/29/2020
        // Description :Save Edit Data to database
        //*********************************************************************//
        public class AssignmentHistoryRow
        {
            public bool? phic_share_flag { get; set; }
            public string employee_name { get; set; }
            public string position { get; set; }
            public string department { get; set; }
            public string employment_type { get; set; }
            public DateTime? period_from { get; set; }
            public DateTime? period_to { get; set; }
            public DateTime effective_date { get; set; }
            public string source { get; set; }
        }

        public class AssignmentSourceRow
        {
            public bool? phic_share_flag { get; set; }
            public string employment_type { get; set; }
            public DateTime effective_date { get; set; }
            public string department_code { get; set; }
        }

        [HttpPost]
        public ActionResult GetAssignments(string p_empl_id)
        {
            if (Session["id"] == null)
                return JSON(new { message = "Your session has expired. Please sign in again." }, JsonRequestBehavior.DenyGet);
            if (string.IsNullOrWhiteSpace(p_empl_id))
                return JSON(new { message = "Select an employee." }, JsonRequestBehavior.DenyGet);
            try
            {
                var headers = db.payrollemployeemaster_hdr_tbl.AsNoTracking().Where(a => a.empl_id == p_empl_id).ToList();
                // This HRIS table is not exposed as a DbSet in the generated context.
                var assignments = db.Database.SqlQuery<AssignmentSourceRow>(
                    "SELECT employment_type, effective_date, department_code, phic_flag AS phic_share_flag FROM dbo.payrollemployeemaster_asg_tbl WHERE empl_id = @p0", p_empl_id).ToList();
                var positions = (from a in db.payrollemployeemaster_pos_tbl
                                 join p in db.positions_tbl on new { a.position_code, a.employment_type } equals new { p.position_code, p.employment_type }
                                 where a.empl_id == p_empl_id
                                 select new { a.employment_type, a.effective_date, p.position_long_title }).ToList();
                var name = db.vw_personnelnames_tbl.Where(a => a.empl_id == p_empl_id).Select(a => a.employee_name).FirstOrDefault();
                var departments = db.vw_departments_tbl_list.ToList();
                var rows = new List<AssignmentHistoryRow>();
                foreach (var header in headers)
                {
                    rows.Add(new AssignmentHistoryRow {
                        employee_name = name, employment_type = header.employment_type,
                        position = positions.Where(p => p.employment_type == header.employment_type && p.effective_date <= header.effective_date)
                            .OrderByDescending(p => p.effective_date).Select(p => p.position_long_title).FirstOrDefault(),
                        department = departments.Where(d => d.department_code == header.department_code).Select(d => d.department_name1).FirstOrDefault() ?? header.department_code,
                        period_from = header.period_from, period_to = header.period_to,
                        effective_date = header.effective_date, source = "Payroll master"
                    });
                }
                foreach (var assignment in assignments)
                {
                    var header = headers.Where(h => h.employment_type == assignment.employment_type && h.effective_date <= assignment.effective_date)
                        .OrderByDescending(h => h.effective_date).FirstOrDefault();
                    var nextDate = assignments.Where(a => a.employment_type == assignment.employment_type && a.effective_date > assignment.effective_date)
                        .Select(a => (DateTime?)a.effective_date).Concat(headers.Where(h => h.employment_type == assignment.employment_type && h.effective_date > assignment.effective_date)
                        .Select(h => (DateTime?)h.effective_date)).OrderBy(d => d).FirstOrDefault();
                    DateTime? until = nextDate.HasValue ? nextDate.Value.Date.AddDays(-1) : (DateTime?)null;
                    if (header != null && header.period_to.HasValue && (!until.HasValue || header.period_to < until))
                        until = header.period_to;
                    rows.Add(new AssignmentHistoryRow {
                        employee_name = name, employment_type = assignment.employment_type, phic_share_flag = assignment.phic_share_flag,
                        position = positions.Where(p => p.employment_type == assignment.employment_type && p.effective_date <= assignment.effective_date)
                            .OrderByDescending(p => p.effective_date).Select(p => p.position_long_title).FirstOrDefault(),
                        department = departments.Where(d => d.department_code == assignment.department_code).Select(d => d.department_name1).FirstOrDefault() ?? assignment.department_code,
                        period_from = assignment.effective_date, period_to = until,
                        effective_date = assignment.effective_date, source = "Assignment history"
                    });
                }
                return JSON(new { message = "success", assignments = rows.OrderByDescending(r => r.period_from ?? r.effective_date).ThenBy(r => r.source) }, JsonRequestBehavior.DenyGet);
            }
            catch (Exception)
            {
                return JSON(new { message = "Unable to load assignment history. Please try again." }, JsonRequestBehavior.DenyGet);
            }
        }

        [HttpPost]
        public ActionResult GetApplications(string p_empl_id, string p_year, string p_month)
        {
            if (Session["id"] == null)
                return JSON(new { message = "Your session has expired. Please sign in again." }, JsonRequestBehavior.DenyGet);
            int year, month;
            if (string.IsNullOrWhiteSpace(p_empl_id) || !int.TryParse(p_year, out year) ||
                !int.TryParse(p_month, out month) || year < 1 || year > 9998 || month < 1 || month > 12)
                return JSON(new { message = "Select an employee and a valid DTR period." }, JsonRequestBehavior.DenyGet);
            try
            {
                var start = new DateTime(year, month, 1);
                var end = start.AddMonths(1);
                var statuses = db_ats.vw_approvalstatus_tbl.AsNoTracking().ToList();
                var leaveTypes = db_ats.leavetype_tbl.AsNoTracking().ToList();
                var slipTypes = db_ats.astype_tbl.AsNoTracking().ToList();
                var reasons = db.reasons_tbl.AsNoTracking().ToList();
                var travelTypes = db_ats.traveltype_tbl.AsNoTracking().ToList();
                var leaveDates = db_ats.leave_application_dtl_tbl.AsNoTracking()
                    .Where(d => d.empl_id == p_empl_id && d.leave_date_from < end && d.leave_date_to >= start).ToList();
                var leaveIds = leaveDates.Select(d => d.leave_ctrlno).Distinct().ToList();
                var leaves = db_ats.leave_application_hdr_tbl.AsNoTracking()
                    .Where(a => a.empl_id == p_empl_id && leaveIds.Contains(a.leave_ctrlno)).ToList()
                    .OrderByDescending(a => a.date_applied).Select(a => new {
                        number = a.leave_ctrlno, filed = a.date_applied, status_code = a.approval_status,
                        status = statuses.Where(t => t.approval_status == a.approval_status).Select(t => t.approval_status_descr).FirstOrDefault() ?? a.approval_status,
                        type = leaveTypes.Where(t => t.leavetype_code == a.leave_type_code).Select(t => t.leavetype_descr).FirstOrDefault() ?? a.leave_type_code,
                        days = a.number_of_days, description = a.leave_descr, remarks = a.details_remarks, comments = a.leave_comments,
                        dates = leaveDates.Where(d => d.leave_ctrlno == a.leave_ctrlno).OrderBy(d => d.leave_date_from)
                            .Select(d => new { from = d.leave_date_from, to = d.leave_date_to, days = d.date_num_day, status = d.rcrd_status })
                    }).ToList();
                var slipDates = db_ats.authorization_slipt_dtl_tbl.AsNoTracking()
                    .Where(d => d.empl_id == p_empl_id && d.as_dtr_date >= start && d.as_dtr_date < end).ToList();
                var slipIds = slipDates.Select(d => d.application_nbr).Distinct().ToList();
                var slips = db_ats.authorization_slipt_hdr_tbl.AsNoTracking()
                    .Where(a => a.empl_id == p_empl_id && slipIds.Contains(a.application_nbr)).ToList()
                    .OrderByDescending(a => a.date_applied).Select(a => new {
                        number = a.application_nbr, filed = a.date_applied, status_code = a.approval_status, remarks = a.detail_remarks,
                        status = statuses.Where(t => t.approval_status == a.approval_status).Select(t => t.approval_status_descr).FirstOrDefault() ?? a.approval_status,
                        dates = slipDates.Where(d => d.application_nbr == a.application_nbr).OrderBy(d => d.as_dtr_date).Select(d => new {
                            date = d.as_dtr_date, am_in = d.as_am_in, am_out = d.as_am_out, pm_in = d.as_pm_in, pm_out = d.as_pm_out,
                            type = slipTypes.Where(t => t.astype_code == d.astype_code).Select(t => t.astype_descr).FirstOrDefault() ?? d.astype_code,
                            reason = reasons.Where(t => t.reason_code == d.reason_code).Select(t => t.reason_descr).FirstOrDefault() ?? d.reason_code,
                            venue = d.as_venue, comments = d.as_comment, undertime = d.as_under_time, status = d.rcrd_status
                        })
                    }).ToList();
                var employeeTravelIds = db_ats.travelorder_empl_dtl_tbl.Where(d => d.empl_id == p_empl_id).Select(d => d.travel_order_no);
                var travelDates = db_ats.travelorder_dates_dtl_tbl.AsNoTracking()
                    .Where(d => employeeTravelIds.Contains(d.travel_order_no) && d.travel_date < end && (d.travel_date_to ?? d.travel_date) >= start).ToList();
                var travelIds = travelDates.Select(d => d.travel_order_no).Distinct().ToList();
                var travels = db_ats.travelorder_hdr_tbl.AsNoTracking().Where(a => travelIds.Contains(a.travel_order_no)).ToList()
                    .OrderByDescending(a => a.travel_datefiled).Select(a => new {
                        number = a.travel_order_no, filed = a.travel_datefiled, status_code = a.approval_status, destination = a.travel_place_visit,
                        purpose = a.travel_purpose, details = a.travel_details, justification = a.travel_justification,
                        claims = a.travel_with_claims,
                        type = travelTypes.Where(t => t.travel_type_code == a.travel_type_code).Select(t => t.travel_type_descr).FirstOrDefault() ?? a.travel_type_code,
                        status = statuses.Where(t => t.approval_status == a.approval_status).Select(t => t.approval_status_descr).FirstOrDefault() ?? a.approval_status,
                        dates = travelDates.Where(d => d.travel_order_no == a.travel_order_no).OrderBy(d => d.travel_date).Select(d => new {
                            from = d.travel_date, to = d.travel_date_to ?? d.travel_date,
                            start_time = (d.travel_starttime + " " + d.travel_starttime_ampm).Trim(),
                            end_time = (d.travel_endtime + " " + d.travel_endtime_ampm).Trim(), status = d.rcrd_status
                        })
                    }).ToList();
                return JSON(new { message = "success", leaves, slips, travels, statuses }, JsonRequestBehavior.DenyGet);
            }
            catch (Exception)
            {
                return JSON(new { message = "Unable to load applications. Please try again." }, JsonRequestBehavior.DenyGet);
            }
        }

        public ActionResult SaveUpdateFromDatabase(dtr_from_bio_tbl data)
        {
            try
            {
                var upd = db_dtr.dtr_from_bio_tbl.Where(a => a.empl_id == data.empl_id && a.dtr_date == data.dtr_date).FirstOrDefault();

                if (upd != null)
                {
                    upd.dtr_date           = data.dtr_date    ;     
                    upd.empl_id            = data.empl_id     ;     
                    upd.time_in_am         = data.time_in_am  == null ? "" : data.time_in_am  ;     
                    upd.time_out_am        = data.time_out_am == null ? "" : data.time_out_am ;     
                    upd.time_in_pm         = data.time_in_pm  == null ? "" : data.time_in_pm  ;     
                    upd.time_out_pm        = data.time_out_pm == null ? "" : data.time_out_pm ;     
                    upd.time_in_ot         = data.time_in_ot  == null ? "" : data.time_in_ot  ;     
                    upd.time_out_ot        = data.time_out_ot == null ? "" : data.time_out_ot ;
                    upd.dtr_status         = data.dtr_status  == null ? "" : data.dtr_status  ;     
                    upd.processed_by_user  = Session["user_id"].ToString();
                    upd.processed_dttm     = DateTime.Now;
                    upd.time_out_ot        = data.time_out_ot == null ? "" : data.time_out_ot;
                    upd.time_in_ot         = data.time_in_ot == null ? "" : data.time_in_ot;
                    db_dtr.SaveChanges();
                }
                else
                {
                    data.dtr_date           = data.dtr_date    ;     
                    data.empl_id            = data.empl_id     ;     
                    data.time_in_am         = data.time_in_am  == null ? "" : data.time_in_am  ;        
                    data.time_out_am        = data.time_out_am == null ? "" : data.time_out_am ;        
                    data.time_in_pm         = data.time_in_pm  == null ? "" : data.time_in_pm  ;        
                    data.time_out_pm        = data.time_out_pm == null ? "" : data.time_out_pm ;        
                    data.time_in_ot         = data.time_in_ot  == null ? "" : data.time_in_ot  ;        
                    data.time_out_ot        = data.time_out_ot == null ? "" : data.time_out_ot ;   
                    data.dtr_status         = data.dtr_status  == null ? "" : data.dtr_status; ;
                    data.processed_by_user  = Session["user_id"].ToString();
                    data.processed_dttm     = DateTime.Now;
                    data.time_out_ot        = data.time_out_ot == null ? "" : data.time_out_ot;
                    data.time_in_ot         = data.time_in_ot == null ? "" : data.time_in_ot;
                    db_dtr.dtr_from_bio_tbl.Add(data);
                    db_dtr.SaveChanges();
                }
                return Json(new { message = "success" }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message;
                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
        }

        //*********************************************************************//
        // Created By : JMTJR - Created Date : 03/04/2020
        // Description: Initialize Page
        //*********************************************************************//
        public ActionResult GetBioExtractDetails(string par_empl_id, string par_bio_date)
        {
            var message = "";
            try
            {
                var data            = db_dtr.sp_dtr_bio_extract_list(par_empl_id, par_bio_date).ToList();
                var lst_time_out   = db_dtr.sp_time_out_ot_list(par_empl_id, DateTime.Parse(par_bio_date).Date).ToList();
                message = "success";
                return JSON(new { data, message, lst_time_out }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                return JSON(new { message = e.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        //*********************************************************************//
        // Created By : MARVIN - Created Date : 03/04/2020
        // Description: re-run sp_process_biodata_2dtr_stg
        //*********************************************************************//
        public ActionResult rerunDTRprocess(int extracttype, long process_nbr, string bio_terminal)
        {
            
            db_dtr.Database.CommandTimeout = int.MaxValue;
            var message = "";
            var user_id = Session["user_id"].ToString();
            try
            {
                
                db_dtr.sp_process_biodata_2dtr_stg2(process_nbr, user_id).FirstOrDefault();
                message = "Succesfully re-run sp_process_biodata_2dtr_stg";
               

                return JSON(new { message = message, icon = "success" }, JsonRequestBehavior.AllowGet);

            }
            catch (Exception e)
            {
                var msg = e.Message.ToString();
                return JSON(new { message = msg, icon = "error" }, JsonRequestBehavior.AllowGet);
            }
        }
        //*********************************************************************//
        // Created By   : Lorraine I. Ale 
        // Created Date : 06/24/2020
        // Description  : delete from travel type table
        //*********************************************************************//
        public ActionResult sp_generateDTR(string dtr_year, string dtr_month, string empl_id)
        {
            var icn = "";
            var message = "";
            try
            {
                

                var employment_type = db_ats.sp_get_empl_employment_type(empl_id).ToList()[0].employment_type;
                var department_code = db_ats.sp_get_empl_employment_type(empl_id).ToList()[0].department_code;

                var par_view_type = "0";
                var session_user_id = Session["user_id"].ToString();
                icn = "success";
                db_ats.Database.CommandTimeout = int.MaxValue;

                var checkShiftFlag = db_ats.sp_check_shiftsched(dtr_year, dtr_month, empl_id).ToList();
                var dtr_gen = new object();

                if (checkShiftFlag[0].shift_flag == "1")
                {
                    dtr_gen = db_ats.sp_generate_empl_dtr(dtr_year, dtr_month, empl_id, par_view_type, department_code, employment_type, session_user_id).ToList();
                }
                else if (checkShiftFlag[0].shift_flag == "2")
                {
                    dtr_gen = db_ats.sp_generate_empl_dtr_shift(dtr_year, dtr_month, empl_id, par_view_type, department_code, employment_type, session_user_id).ToList();
                }

                return JSON(new { message, icon = icn , dtr_gen , employment_type, department_code, session_user_id, checkShiftFlag }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                 icn = "error";
                 message = e.Message.ToString();

                return Json(new { message = message, icon = icn }, JsonRequestBehavior.AllowGet);
            }
        }

        //*********************************************************************//
        // Created By : JMTJR - Created Date : 03/04/2020
        // Description: Initialize Page
        //*********************************************************************//
        //public ActionResult GetApplication(string p_empl_id, string p_transaction_code)
        //{
        //    var message = "";
        //    try
        //    {
        //        var all_appl     = db_ats.vw_all_applications.Where(a => a.empl_id == p_empl_id && a.transaction_code == p_transaction_code).ToList().OrderBy(a=> a.application_date).OrderByDescending(a => a.rcrd_status);
        //        var all_appl_cnt = db_ats.vw_all_applications.Where(a => a.empl_id == p_empl_id && a.transaction_code == p_transaction_code).ToList().GroupBy(a=> a.rcrd_status);
        //        message = "success";
        //        return JSON(new { message, all_appl , all_appl_cnt }, JsonRequestBehavior.AllowGet);
        //    }
        //    catch (Exception e)
        //    {
        //        return JSON(new { message = e.Message }, JsonRequestBehavior.AllowGet);
        //    }

        //}

        public ActionResult get_bioextract_empl_data(string empl_id, string dtr_date)
        {
           
            try
            {
                var empl_extract_data = db_dtr.sp_dtr_bio_extract_list(empl_id, dtr_date).ToList();
                return JSON(new { message="Success",icon = "icon", empl_extract_data}, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                return JSON(new { message = e.Message, icon = "error"}, JsonRequestBehavior.AllowGet);
            }

        }

        public ActionResult change_biotype_empl_data(string bio_type, sp_dtr_bio_extract_list_Result empl_data)
        {
            var userid = Session["user_id"].ToString();
            var dttm = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");
            try
            {
                var empl = db_dtr.sp_update_dtr_bio_extract_biotype(
                     empl_data.empl_id
                    ,empl_data.bio_date
                    ,empl_data.bio_time
                    ,empl_data.bio_terminal
                    ,empl_data.bio_etype
                    ,bio_type
                    ,dttm
                    ,userid
                ).FirstOrDefault();

                //object prc = new object();
                if (empl.extract_type == "1")
                {
                    if (empl.shift_flag == "1")
                        db_dtr.sp_process_biodata_2dtr_stg_perEmpl_id(Convert.ToInt64(empl.process_nbr),empl_data.empl_id, userid);
                    else if(empl.shift_flag == "2")
                        db_dtr.sp_process_biodata_2dtr_stg_shift_perEmpl_id(Convert.ToInt64(empl.process_nbr), empl_data.empl_id, userid);
                }   
                else if(empl.extract_type == "2")
                {
                   db_dtr.sp_process_biodata_2dtr_stg_in_perEmpl_id(Convert.ToInt64(empl.process_nbr), empl_data.empl_id, userid);
                }
                else if (empl.extract_type == "3")
                {
                    db_dtr.sp_process_biodata_2dtr_stg_out_perEmpl_id(Convert.ToInt64(empl.process_nbr), empl_data.empl_id, userid);
                }

                var empl_extract_data = db_dtr.sp_dtr_from_bio_tbl_list3(empl_data.empl_id, empl.year, empl.month).ToList();
                return JSON(new { message = "Bio type successfully updated", icon = "success", empl_extract_data }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                return JSON(new { message = e.Message, icon = "error" }, JsonRequestBehavior.AllowGet);
            }
        }

        //public String DbEntityValidationExceptionError(DbEntityValidationException e)
        //{
        //    string message = "";
        //    foreach (var eve in e.EntityValidationErrors)
        //    {
        //        Console.WriteLine("Entity of type \"{0}\" in state \"{1}\" has the following validation errors:",
        //            eve.Entry.Entity.GetType().Name, eve.Entry.State);
        //        foreach (var ve in eve.ValidationErrors)
        //        {
        //            message = "- Property: \"{0}\", Error: \"{1}\"" + ve.PropertyName + "  :  " + ve.ErrorMessage;
        //            Console.WriteLine("- Property: \"{0}\", Error: \"{1}\"",
        //                ve.PropertyName, ve.ErrorMessage);
        //        }
        //    }
        //    return message;
        //}

        //*********************************************************************//
        // Created By : JMTJR - Created Date : 03/04/2020
        // Description: Initialize Page
        //*********************************************************************//
        public ActionResult UpdateStatus(string par_status, 
            string par_empl_id, 
            string par_year,
            string par_month,
            string par_approve_status,
            string par_view_status,
            string par_effect_date
            )
        {
            var message = "";
            try
            {
                if (par_status == "1") { //OVERRIDES
                    var sp_approved_overrides = db_ats.sp_approved_overrides(par_empl_id, par_approve_status, par_year, par_month, par_view_status).ToList();

                    if (sp_approved_overrides.Count > 0)
                    {
                        message = "success";
                    }
                    else
                    {
                        message = "fail";
                    }
                }

                else if (par_status == "2")
                { //TRANSMITTAL

                    if (par_approve_status == "N") {
                        var sp_update_dtr_transmittal_remove = db_ats.sp_update_dtr_transmittal_remove(par_year, par_month, par_empl_id, par_view_status).ToList();

                        if (sp_update_dtr_transmittal_remove.Count > 0)
                        {
                            message = "success";
                        }
                        else
                        {
                            message = "fail";
                        }

                    }

                    else if (par_approve_status == "F") {
                        var sp_update_dtr_transmittal_add = db_ats.sp_update_dtr_transmittal_add(par_year, par_month, par_empl_id, par_view_status).ToList();

                        if (sp_update_dtr_transmittal_add.Count > 0)
                        {
                            message = "success";
                        }
                        else
                        {
                            message = "fail";
                        }
                    }

                }

                else if (par_status == "3") //TIMESCHEDULE
                {
                    var sp_approved_timeschedule = db_ats.sp_approved_timeschedule(par_empl_id, par_approve_status, par_year, par_month, par_view_status, par_effect_date).ToList();

                    if (sp_approved_timeschedule.Count > 0)
                    {
                        message = "success";
                    }
                    else
                    {
                        message = "fail";
                    }
                }
                return JSON(new { message }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                return JSON(new { message = e.Message }, JsonRequestBehavior.AllowGet);
            }

        }


        //*********************************************************************//
        // Created By   : Vincent Jade H. Alivio
        // Created Date : 2022-04-12
        // Description  : Retrieve Time Schedule List
        //*********************************************************************//
        public ActionResult TimeSked_HDR(string par_empl_id, string par_tse_year)
        {
            try
            {
                var data = db_ats.sp_time_schedule_empl_hdr_tbl(par_empl_id).Where(a=> a.tse_year == par_tse_year).ToList();
                return Json(new { message = "success", data }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                return Json(new { message = e.Message.ToString() }, JsonRequestBehavior.AllowGet);
            }
        }
        //*********************************************************************//
        // Created By   : Vincent Jade H. Alivio
        // Created Date : 2022-04-12
        // Description  : Retrieve Time Schedule List
        //*********************************************************************//
        public ActionResult TimeSked_DTL(string par_empl_id
                                        , string par_month
                                        , string par_year
                                        , DateTime par_effective_date
                                        )
        {
            try
            {
                var data = db_ats.sp_time_schedule_empl_tbl1(par_empl_id, par_month, par_year, par_effective_date).ToList();
                return Json(new { message = "success", data }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                return Json(new { message = e.Message.ToString() }, JsonRequestBehavior.AllowGet);
            }

        }
        
        [HttpGet]
        [Route("search")]
        public ActionResult Search(string term)
        {
            if (!string.IsNullOrEmpty(term))
            {
                //var data = db.vw_personnelnames_tbl.Where(a => a.employee_name.Contains(term) || a.empl_id.Contains(term)).ToList();
                var data = from a in db.vw_personnelnames_tbl
                           join b in db.personnel_tbl 
                           on a.empl_id equals b.empl_id
                           join c in db.vw_payrollemployeemaster_hdr_pos_tbl 
                           on a.empl_id equals c.empl_id into grp_master
                           from c in grp_master.DefaultIfEmpty()
                           join d in db.departments_tbl
                           on c.department_code equals d.department_code into grp_dep
                           from d in grp_dep.DefaultIfEmpty()
                           where a.employee_name.Contains(term) || a.empl_id.Contains(term) || d.department_short_name.Contains(term)
                           select new
                           {
                                 a.empl_id
                                ,a.employee_name
                                ,a.last_name
                                ,a.first_name
                                ,a.middle_name
                                ,a.suffix_name
                                ,a.courtisy_title
                                ,a.postfix_name
                                ,a.employee_name_format2
                                ,b.empl_photo
                                ,b.empl_photo_img
                                ,c.position_long_title
                                ,d.department_short_name
                                ,d.department_code
                                ,c.employment_type
                           };

                return Json(new { data }, JsonRequestBehavior.AllowGet);
            }
            else
            {
                return Json(new { data = ""}, JsonRequestBehavior.AllowGet);
            }
        }


    }
}
