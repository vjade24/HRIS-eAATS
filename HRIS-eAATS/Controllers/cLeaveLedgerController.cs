using HRIS_eAATS.Models;
using System;
using System.Collections.Generic;
using System.Data.Entity.Validation;
using System.Linq;
using System.Text;
using System.Web;
using System.Web.Mvc;

using System.IO;
using CrystalDecisions.CrystalReports.Engine;
using CrystalDecisions.Shared;
using iTextSharp.text;
using iTextSharp.text.pdf;

namespace HRIS_eAATS.Controllers
{
    public class cLeaveLedgerController : Controller
    {
        HRIS_DEVEntities db     = new HRIS_DEVEntities();
        HRIS_ATSEntities db_ats = new HRIS_ATSEntities();
        User_Menu um            = new User_Menu();
        // GET: cLeaveLedger
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
            um.allow_add            = Session["allow_add"] == null ? 0 : (int)Session["allow_add"];
            um.allow_delete         = Session["allow_delete"] == null ? 0 : (int)Session["allow_delete"];
            um.allow_edit           = Session["allow_edit"] == null ? 0 : (int)Session["allow_edit"];
            um.allow_edit_history   = Session["allow_edit_history"] == null ? 0 : (int)Session["allow_edit_history"];
            um.allow_print          = Session["allow_print"] == null ? 0 : (int)Session["allow_print"];
            um.allow_view           = Session["allow_view"] == null ? 0 : (int)Session["allow_view"];
            um.url_name             = Session["url_name"] == null ? "cLeaveLedger" : Session["url_name"].ToString();
            um.id                   = Session["id"] == null ? 2118 : (int)Session["id"];
            um.menu_name            = Session["menu_name"] == null ? "Ledger Posting/Adjustment" : Session["menu_name"].ToString();
            um.page_title           = Session["page_title"] == null ? "Ledger Posting/Adjustment" : Session["page_title"].ToString();
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
        // Created Date : 05/05/2021
        // Description  : Initialized during pageload
        //*********************************************************************//
        public ActionResult InitializeData()
        {
            try
            {
                db_ats.Database.CommandTimeout = int.MaxValue;
                string[] redirect_data = null;
                var log_empl_id = Session["empl_id"].ToString();
                var log_user_id = Session["user_id"].ToString();
                var cLV_Ledger_employee_name = "";
                
                if (Session["cLV_Ledger_employee_name"].ToString() != string.Empty || Session["cLV_Ledger_employee_name"].ToString() != "")
                {
                    cLV_Ledger_employee_name = Session["cLV_Ledger_employee_name"].ToString();
                }

                GetAllowAccess();
                
                var lv_admin_dept_list  = db_ats.vw_leaveadmin_tbl_list.Where(a=> a.empl_id == log_empl_id).OrderBy(a => a.department_code);
                var leave_type_lst      = db_ats.sp_leavetype_tbl_list().ToList();
                
                List<sp_lv_ledger_posted_unposted_Result> lv_unposted1 = new List<sp_lv_ledger_posted_unposted_Result>();
                List<sp_leaveledger_report_Result> lv_ledger_report = new List<sp_leaveledger_report_Result>();

                if (Session["redirect_par"].ToString() != string.Empty)
                {
                    redirect_data = Session["redirect_par"].ToString().Split(new char[] { ',' });

                    // ********************************************************************
                    // ****** Filter the View mode if Leave, CTO and Both Leave and CTO ***
                    // ********************************************************************
                    if (redirect_data[7].ToString() == "2")        // Leave 
                    {
                        lv_unposted1 = db_ats.sp_lv_ledger_posted_unposted(redirect_data[1].ToString(), "0").Where(a => a.leave_type_code != "CTO").ToList();
                    }
                    else if (redirect_data[7].ToString() == "3")  // CTO
                    {
                        lv_unposted1 = db_ats.sp_lv_ledger_posted_unposted(redirect_data[1].ToString(), "0").Where(a => a.leave_type_code == "CTO").ToList();
                    }
                    else                       // Both Leave and CTO
                    {
                        lv_unposted1 = db_ats.sp_lv_ledger_posted_unposted(redirect_data[1].ToString(), "0").ToList();
                    }
                    // ********************************************************************
                    // ********************************************************************
                    
                    var rep_mode = redirect_data[7];
                    lv_ledger_report = db_ats.sp_leaveledger_report(redirect_data[1].ToString(), DateTime.Parse("2021-01-01"), DateTime.Parse(DateTime.Now.Year.ToString() + "-12-31"), Convert.ToInt16(rep_mode)).ToList();
                }
                var lv_unposted  = from a in lv_unposted1.ToList()
                                join b in db_ats.leave_application_mone_tbl
                                on new { a.empl_id, a.leave_ctrlno } equals new { b.empl_id, b.leave_ctrlno } into temp
                                from b in temp.DefaultIfEmpty()
                                select new
                                {
                                    a.ledger_ctrl_no   
                                    ,a.leave_ctrlno    
                                    ,a.empl_id 
                                    ,a.employee_name   
                                    ,a.department_code 
                                    ,a.date_applied    
                                    ,a.inclusive_dates 
                                    ,a.leave_type_code 
                                    ,a.leavetype_descr 
                                    ,a.leave_subtype_code  
                                    ,a.leavesubtype_descr  
                                    ,a.posting_status  
                                    ,a.created_date_only   
                                    ,a.created_by_user 
                                    ,a.number_of_days  
                                    ,a.leaveledger_entry_type  
                                    ,a.justification_flag  
                                    ,a.leave_class 
                                    ,a.leave_descr 
                                    ,a.disapproved_remakrs
                                    ,mone = b
                                };

                return JSON(new { message = "success"
                    , um
                    , lv_admin_dept_list
                    , log_user_id
                    , leave_type_lst
                    , redirect_data
                    , cLV_Ledger_employee_name
                    , lv_unposted
                    ,lv_ledger_report
                }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message.ToString();
                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
        }

        //*********************************************************************//
        // Created By   : Lorraine I. Ale 
        // Created Date : 05/05/2021
        // Description  : Initialized during pageload
        //*********************************************************************//
        public ActionResult GetEmployeeList(string par_department_code, string par_employment_type, string par_year, string par_month)
        {
            try
            {
                db_ats.Database.CommandTimeout = int.MaxValue;

                var lv_empl_lst_wout_jo = db_ats.sp_lv_empl_lst_wout_jo_yr_mt(par_department_code, par_employment_type,  par_year,  par_month).ToList();
                return JSON(new {
                    message = "success"
                    , lv_empl_lst_wout_jo }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message.ToString();
                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
        }

        //*********************************************************************//
        // Created By   : Lorraine I. Ale 
        // Created Date : 05/05/2021
        // Description  : Initialized during pageload
        //*********************************************************************//
        public ActionResult GetLeaveType(string par_leavetype_code)
        {
            try
            {
                db_ats.Database.CommandTimeout = int.MaxValue;

                var leave_subType_lst = db_ats.sp_leavesubtype_tbl_list(par_leavetype_code).ToList();
                var leavetype_lst     = db_ats.leavetype_tbl.Where(a=>a.leavetype_code== par_leavetype_code).FirstOrDefault();
                return JSON(new { message = "success", leave_subType_lst , leavetype_lst }, JsonRequestBehavior.AllowGet);
            }
            catch(Exception e)
            {
                return JSON(new { message = e.Message.ToString() }, JsonRequestBehavior.AllowGet);
            }
        }

        //*********************************************************************//
        // Created By   : Lorraine I. Ale 
        // Created Date : 05/05/2021
        // Description  : Initialized during pageload
        //*********************************************************************//
        public ActionResult FilterPageGrid(
                              string par_empl_id
                            , string par_year
                            , string par_month
                            , string par_department_code
                            , string par_employment_type
                            , string p_date_fr
                            , string p_date_to
                            , int    p_rep_mode
                            )
        {
            try
            {
                db_ats.Database.CommandTimeout = int.MaxValue;
                par_empl_id = par_empl_id == null ? "" : par_empl_id;
                var lv_ledger_report    = db_ats.sp_leaveledger_report(par_empl_id, DateTime.Parse(p_date_fr), DateTime.Parse(p_date_to), p_rep_mode).ToList();
                var total_undertime     = db_ats.sp_leaveledger_empl_undertime(par_empl_id, par_month, par_year).ToList();
                var leavetype_balances  = db_ats.sp_leavetype_current_bal(par_empl_id).ToList();

                // ********************************************************************
                // ****** Filter the View mode if Leave, CTO and Both Leave and CTO ***
                // ********************************************************************
                List<sp_lv_ledger_posted_unposted_Result> lv_unposted1 = new List<sp_lv_ledger_posted_unposted_Result>();
                List<sp_lv_ledger_posted_unposted_Result> lv_posted   = new List<sp_lv_ledger_posted_unposted_Result>();

                if (p_rep_mode == 2)        // Leave 
                {
                    lv_unposted1 = db_ats.sp_lv_ledger_posted_unposted(par_empl_id, "0").Where(a => a.leave_type_code != "CTO").ToList();
                }
                else if (p_rep_mode == 3)  // CTO
                {
                    lv_unposted1 = db_ats.sp_lv_ledger_posted_unposted(par_empl_id, "0").Where(a => a.leave_type_code == "CTO").ToList();
                }
                else                       // Both Leave and CTO
                {
                    lv_unposted1 = db_ats.sp_lv_ledger_posted_unposted(par_empl_id, "0").ToList();
                }
                //*********************************************************************//
                //*********************************************************************//
                var lv_unposted  = from a in lv_unposted1.ToList()
                                join b in db_ats.leave_application_mone_tbl
                                on new { a.empl_id, a.leave_ctrlno } equals new { b.empl_id, b.leave_ctrlno } into temp
                                from b in temp.DefaultIfEmpty()
                                select new
                                {
                                    a.ledger_ctrl_no   
                                    ,a.leave_ctrlno    
                                    ,a.empl_id 
                                    ,a.employee_name   
                                    ,a.department_code 
                                    ,a.date_applied    
                                    ,a.inclusive_dates 
                                    ,a.leave_type_code 
                                    ,a.leavetype_descr 
                                    ,a.leave_subtype_code  
                                    ,a.leavesubtype_descr  
                                    ,a.posting_status  
                                    ,a.created_date_only   
                                    ,a.created_by_user 
                                    ,a.number_of_days  
                                    ,a.leaveledger_entry_type  
                                    ,a.justification_flag  
                                    ,a.leave_class 
                                    ,a.leave_descr 
                                    ,a.disapproved_remakrs
                                    ,mone = b
                                };

                return JSON(new
                {
                    message = "success"
                    ,lv_ledger_report
                    ,lv_unposted
                    ,lv_posted
                    ,total_undertime
                    ,leavetype_balances
                }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message.ToString();
                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
        }
        
        //*********************************************************************//
        // Created By   : Lorraine I. Ale 
        // Created Date : 05/05/2021
        // Description  : Initialized during pageload
        //*********************************************************************//
        public ActionResult GetLedgerDetails(string par_ledger_ctrl_no)
        {
            try
            {
                db_ats.Database.CommandTimeout = int.MaxValue;
                var lv_ledger_dtl_tbl_list = db_ats.sp_lv_ledger_dtl_tbl_list(par_ledger_ctrl_no).ToList();
                return JSON(new{message = "success", lv_ledger_dtl_tbl_list}, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message.ToString();
                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
        }
        //*********************************************************************//
        // Created By   : Lorraine I. Ale 
        // Created Date : 06/24/2020
        // Description  : Add new record to travel type table
        //*********************************************************************//
        public ActionResult CheckData(lv_ledger_hdr_tbl data)
        {
            try
            {
                db_ats.Database.CommandTimeout = int.MaxValue;

                var query = db_ats.lv_ledger_hdr_tbl.Where(a => a.empl_id == data.empl_id &&
                                                                a.leaveledger_period == data.leaveledger_period &&
                                                                a.leaveledger_particulars == data.leaveledger_particulars &&
                                                                a.leaveledger_entry_type == data.leaveledger_entry_type &&
                                                                a.leavetype_code == data.leavetype_code
                                                           ).FirstOrDefault();

                var message = "";
                if (query != null)
                {
                    message = "Data already exist!";
                }
                else
                {
                    message = "";
                }
                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message.ToString();
                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
        }
        //*********************************************************************//
        // Created By   : Lorraine I. Ale 
        // Created Date : 06/24/2020
        // Description  : Add new record to travel type table
        //*********************************************************************//
        public ActionResult Update(lv_ledger_hdr_tbl data,lv_ledger_dtl_tbl data2)
        {
            try
            {
                db_ats.Database.CommandTimeout = int.MaxValue;

                var query                       = db_ats.lv_ledger_hdr_tbl.Where(a => a.ledger_ctrl_no == data.ledger_ctrl_no).FirstOrDefault();
                query.updated_dttm              = DateTime.Now;
                query.updated_by_user           = Session["user_id"].ToString();
                query.leaveledger_period        = data.leaveledger_period;
                query.leaveledger_entry_type    = data.leaveledger_entry_type;
                query.leaveledger_particulars   = data.leaveledger_particulars;
                query.leaveledger_date          = data.leaveledger_date;
                query.date_applied              = data.date_applied;
                query.details_remarks           = data.details_remarks;
                query.sig_name3_ovrd            = data.sig_name3_ovrd;
                query.sig_pos3_ovrd             = data.sig_pos3_ovrd;
                query.lv_nodays                 = data.lv_nodays;
                query.leavesubtype_code         = data.leavesubtype_code;
                query.leave_ctrlno              = data.leave_ctrlno;
                query.approval_id               = data.approval_id;
                query.lwop_date                 = data.lwop_date;
                query.lwop_body_1               = data.lwop_body_1;
                query.lwop_body_2               = data.lwop_body_2;

                var query2                      = db_ats.lv_ledger_dtl_tbl.Where(a => a.ledger_ctrl_no == data.ledger_ctrl_no && a.leavetype_code == data.leavetype_code).FirstOrDefault();
                query2.leavesubtype_code        = data.leavesubtype_code;
                db_ats.SaveChanges();

                // **************************************************************
                // **** Description  : Update on Details ************************
                // **** Date Updated : 2021-05-25 *******************************
                // **************************************************************
                if (data.leaveledger_entry_type == "2" || data.leaveledger_entry_type == "1") // Leave Application
                {
                }
                else
                {
                    var query_dtl = db_ats.lv_ledger_dtl_tbl.Where(a => a.ledger_ctrl_no == data2.ledger_ctrl_no && a.leavetype_code == data2.leavetype_code).FirstOrDefault();
                    query_dtl.leaveledger_balance_as_of  = data2.leaveledger_balance_as_of  ;
                    query_dtl.leaveledger_restore_deduct = data2.leaveledger_restore_deduct ;
                    query_dtl.leaveledger_abs_und_wp     = data2.leaveledger_abs_und_wp     ;
                    query_dtl.leaveledger_abs_und_wop    = data2.leaveledger_abs_und_wop    ;
                    db_ats.SaveChanges();
                }
                
                return Json(new { message = "success" }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message.ToString();
                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
        }

        //*********************************************************************//
        // Created By   : Lorraine I. Ale 
        // Created Date : 06/24/2020
        // Description  : delete from travel type table
        //*********************************************************************//
        public ActionResult Delete(lv_ledger_hdr_tbl data)
        {
            try
            {
                db_ats.Database.CommandTimeout = int.MaxValue;

                // *************************************************************
                // **** VJA - 2023-06-01 -- Insert Leave Ledger History ********
                // *************************************************************
                var appl_status = "Deleted on Ledger";
                db_ats.sp_lv_ledger_history_insert(data.ledger_ctrl_no, data.leave_ctrlno,data.empl_id, appl_status, data.details_remarks, Session["user_id"].ToString());
                // *************************************************************
                // **** VJA - 2023-06-01 -- Insert Leave Ledger History ********
                // *************************************************************

                var od  = db_ats.lv_ledger_hdr_tbl.Where(a => a.ledger_ctrl_no == data.ledger_ctrl_no).FirstOrDefault();
                var od2 = db_ats.lv_ledger_dtl_tbl.Where(a => a.ledger_ctrl_no == data.ledger_ctrl_no).ToList();

                if (od.leave_ctrlno != null && od.leave_ctrlno.ToString().Trim() != "")
                {
                    var lv_hdr = db_ats.leave_application_hdr_tbl.Where(a => a.leave_ctrlno == od.leave_ctrlno.ToString().Trim()).FirstOrDefault();
                    lv_hdr.posting_status = false;
                    db_ats.SaveChanges();
                }
                
                db_ats.lv_ledger_hdr_tbl.Remove(od);
                db_ats.lv_ledger_dtl_tbl.RemoveRange(od2);
                db_ats.SaveChangesAsync();

                
                return Json(new { message = "success" }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message.ToString();

                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
        }

        //*********************************************************************//
        // Created By   : Vincent Jade H. Alivio 
        // Created Date : 2021-05-25
        // Description  : Save Record with New Logic created by Sir Ariel
        //*********************************************************************//
        public ActionResult Save_NewLogic(lv_ledger_hdr_tbl data
            ,lv_ledger_dtl_tbl  data2
            , lv_ledger_dtl_tbl data_auto_vl
            , lv_ledger_dtl_tbl data_auto_sl
            , lv_ledger_dtl_tbl data_auto_mz_tl
            , List<lv_ledger_dtl_tbl> lv_dtl
            )
        {
            try
            {
                db_ats.Database.CommandTimeout = int.MaxValue;

                var new_appl_nbr        = db_ats.sp_generate_appl_nbr("lv_ledger_hdr_tbl", 10, "ledger_ctrl_no").ToList();
                data.ledger_ctrl_no     = new_appl_nbr[0];
                data.sig_name3_ovrd     = data.sig_name3_ovrd   == "" || data.sig_name3_ovrd    == null ? string.Empty : data.sig_name3_ovrd;
                data.sig_pos3_ovrd      = data.sig_pos3_ovrd    == "" || data.sig_pos3_ovrd     == null ? string.Empty : data.sig_pos3_ovrd;
                data.details_remarks    = data.details_remarks  == "" || data.details_remarks   == null ? string.Empty : data.details_remarks;
                data.approval_id        = data.approval_id      == "" || data.approval_id       == null ? string.Empty : data.approval_id;
                data.leave_ctrlno       = data.leave_ctrlno     == "" || data.leave_ctrlno      == null ? string.Empty : data.leave_ctrlno;
                data.updated_by_user    = string.Empty;
                data.updated_dttm       = Convert.ToDateTime("1900-01-01");
                data.created_by_user    = Session["user_id"].ToString();
                data.created_dttm       = DateTime.Now;
                data.leavetype_code     = data.leavetype_code    == "" || data.leavetype_code    == null ? "" : data.leavetype_code;
                data.leavesubtype_code  = data.leavesubtype_code == "" || data.leavesubtype_code == null ? "" : data.leavesubtype_code;
                data.lv_nodays          = data.lv_nodays;
                data.lwop_date          = data.lwop_date   ;
                data.lwop_body_1        = data.lwop_body_1 ;
                data.lwop_body_2        = data.lwop_body_2 ;

                db_ats.lv_ledger_hdr_tbl.Add(data);
                db_ats.SaveChanges();

                // **************************************************************
                // **** Description  : Saving on Details ************************
                // **** Date Updated : 2021-05-25 *******************************
                // **************************************************************
                if (data.leaveledger_entry_type == "2") // Leave Application - for Monetization and Terminal Leave
                {
                    if (data.leavetype_code == "MZ" || data.leavetype_code == "TL")
                    {
                        data_auto_mz_tl.ledger_ctrl_no                = new_appl_nbr[0];
                        data_auto_mz_tl.leavetype_code                = data_auto_mz_tl.leavetype_code              ;
                        data_auto_mz_tl.leavesubtype_code             = data_auto_mz_tl.leavesubtype_code           ;
                        data_auto_mz_tl.leaveledger_balance_as_of     = data_auto_mz_tl.leaveledger_balance_as_of   ;
                        data_auto_mz_tl.leaveledger_restore_deduct    = data_auto_mz_tl.leaveledger_restore_deduct  ;
                        data_auto_mz_tl.leaveledger_abs_und_wp        = data_auto_mz_tl.leaveledger_abs_und_wp      ;
                        data_auto_mz_tl.leaveledger_abs_und_wop       = data_auto_mz_tl.leaveledger_abs_und_wop     ;
                        db_ats.lv_ledger_dtl_tbl.Add(data_auto_mz_tl);
                        db_ats.SaveChanges();

                        if (data_auto_sl.leaveledger_abs_und_wp != 0)
                        {
                            data_auto_sl.ledger_ctrl_no                = new_appl_nbr[0];
                            data_auto_sl.leavetype_code                = data_auto_sl.leavetype_code              ;
                            data_auto_sl.leavesubtype_code             = data_auto_sl.leavesubtype_code           ;
                            data_auto_sl.leaveledger_balance_as_of     = data_auto_sl.leaveledger_balance_as_of   ;
                            data_auto_sl.leaveledger_restore_deduct    = data_auto_sl.leaveledger_restore_deduct  ;
                            data_auto_sl.leaveledger_abs_und_wp        = data_auto_sl.leaveledger_abs_und_wp      ;
                            data_auto_sl.leaveledger_abs_und_wop       = data_auto_sl.leaveledger_abs_und_wop     ;

                            db_ats.lv_ledger_dtl_tbl.Add(data_auto_sl);
                            db_ats.SaveChanges();
                        }

                        // NOTE: Do not save the Data if the WP is equal to zero (0)
                        if (data_auto_vl.leaveledger_abs_und_wp != 0)
                        {
                            data_auto_vl.ledger_ctrl_no                = new_appl_nbr[0];
                            data_auto_vl.leavetype_code                = data_auto_vl.leavetype_code              ;
                            data_auto_vl.leavesubtype_code             = data_auto_vl.leavesubtype_code           ;
                            data_auto_vl.leaveledger_balance_as_of     = data_auto_vl.leaveledger_balance_as_of   ;
                            data_auto_vl.leaveledger_restore_deduct    = data_auto_vl.leaveledger_restore_deduct  ;
                            data_auto_vl.leaveledger_abs_und_wp        = data_auto_vl.leaveledger_abs_und_wp      ;
                            data_auto_vl.leaveledger_abs_und_wop       = data_auto_vl.leaveledger_abs_und_wop     ;

                            db_ats.lv_ledger_dtl_tbl.Add(data_auto_vl);
                            db_ats.SaveChanges();
                        }
                        // *************************************************************
                        // **** VJA - 2023-06-01 -- Insert Leave Ledger History ********
                        // *************************************************************
                        var appl_status_mz = "Evaluated";
                        var appl_remarks   = "Evaluate the Status for Printing";
                        db_ats.sp_lv_ledger_history_insert(new_appl_nbr[0], "", data.empl_id, appl_status_mz, appl_remarks, Session["user_id"].ToString());
                        // *************************************************************
                        // **** VJA - 2023-06-01 -- Insert Leave Ledger History ********
                        // *************************************************************
                    }
                }
                else if (data.leaveledger_entry_type == "1" || data.leaveledger_entry_type == "5") // Automated Leave & Erroneous entry
                {
                    if (data.leavetype_code == "CTO")
                    {
                        data2.ledger_ctrl_no                = new_appl_nbr[0];
                        data2.leavetype_code                = data2.leavetype_code              ;
                        data2.leavesubtype_code             = data2.leavesubtype_code           ;
                        data2.leaveledger_balance_as_of     = data2.leaveledger_balance_as_of   ;
                        data2.leaveledger_restore_deduct    = data2.leaveledger_restore_deduct  ;
                        data2.leaveledger_abs_und_wp        = data2.leaveledger_abs_und_wp      ;
                        data2.leaveledger_abs_und_wop       = data2.leaveledger_abs_und_wop     ;

                        db_ats.lv_ledger_dtl_tbl.Add(data2);
                        db_ats.SaveChanges();
                    }
                    else
                    {
                        data_auto_sl.ledger_ctrl_no                = new_appl_nbr[0];
                        data_auto_sl.leavetype_code                = data_auto_sl.leavetype_code              ;
                        data_auto_sl.leavesubtype_code             = data_auto_sl.leavesubtype_code           ;
                        data_auto_sl.leaveledger_balance_as_of     = data_auto_sl.leaveledger_balance_as_of   ;
                        data_auto_sl.leaveledger_restore_deduct    = data_auto_sl.leaveledger_restore_deduct  ;
                        data_auto_sl.leaveledger_abs_und_wp        = data_auto_sl.leaveledger_abs_und_wp      ;
                        data_auto_sl.leaveledger_abs_und_wop       = data_auto_sl.leaveledger_abs_und_wop     ;

                        db_ats.lv_ledger_dtl_tbl.Add(data_auto_sl);
                        db_ats.SaveChanges();

                        data_auto_vl.ledger_ctrl_no                = new_appl_nbr[0];
                        data_auto_vl.leavetype_code                = data_auto_vl.leavetype_code              ;
                        data_auto_vl.leavesubtype_code             = data_auto_vl.leavesubtype_code           ;
                        data_auto_vl.leaveledger_balance_as_of     = data_auto_vl.leaveledger_balance_as_of   ;
                        data_auto_vl.leaveledger_restore_deduct    = data_auto_vl.leaveledger_restore_deduct  ;
                        data_auto_vl.leaveledger_abs_und_wp        = data_auto_vl.leaveledger_abs_und_wp      ;
                        data_auto_vl.leaveledger_abs_und_wop       = data_auto_vl.leaveledger_abs_und_wop     ;

                        db_ats.lv_ledger_dtl_tbl.Add(data_auto_vl);
                        db_ats.SaveChanges();
                    }
                }
                else if (data.leaveledger_entry_type == "4") // Suspension
                {
                        data_auto_sl.ledger_ctrl_no                = new_appl_nbr[0];
                        data_auto_sl.leavetype_code                = data_auto_sl.leavetype_code              ;
                        data_auto_sl.leavesubtype_code             = data_auto_sl.leavesubtype_code           ;
                        data_auto_sl.leaveledger_balance_as_of     = data_auto_sl.leaveledger_balance_as_of   ;
                        data_auto_sl.leaveledger_restore_deduct    = data_auto_sl.leaveledger_restore_deduct  ;
                        data_auto_sl.leaveledger_abs_und_wp        = data_auto_sl.leaveledger_abs_und_wp      ;
                        data_auto_sl.leaveledger_abs_und_wop       = data_auto_sl.leaveledger_abs_und_wop     ;

                        db_ats.lv_ledger_dtl_tbl.Add(data_auto_sl);
                        db_ats.SaveChanges();
                    
                        data_auto_vl.ledger_ctrl_no                = new_appl_nbr[0];
                        data_auto_vl.leavetype_code                = data_auto_vl.leavetype_code              ;
                        data_auto_vl.leavesubtype_code             = data_auto_vl.leavesubtype_code           ;
                        data_auto_vl.leaveledger_balance_as_of     = data_auto_vl.leaveledger_balance_as_of   ;
                        data_auto_vl.leaveledger_restore_deduct    = data_auto_vl.leaveledger_restore_deduct  ;
                        data_auto_vl.leaveledger_abs_und_wp        = data_auto_vl.leaveledger_abs_und_wp      ;
                        data_auto_vl.leaveledger_abs_und_wop       = data_auto_vl.leaveledger_abs_und_wop     ;

                        db_ats.lv_ledger_dtl_tbl.Add(data_auto_vl);
                        db_ats.SaveChanges();
                }
                else if (data.leaveledger_entry_type == "6" )
                {
                    foreach (var item in lv_dtl)
                    {
                        if (item.leaveledger_abs_und_wp != null)
                        {
                            item.ledger_ctrl_no                = new_appl_nbr[0];
                            db_ats.lv_ledger_dtl_tbl.Add(item);
                            db_ats.SaveChanges();
                        }
                    }
                }
                else if (data.leaveledger_entry_type == "7" )
                {
                    foreach (var item in lv_dtl)
                    {
                        if (item.leaveledger_balance_as_of != 0)
                        {
                            item.ledger_ctrl_no                = new_appl_nbr[0];
                            db_ats.lv_ledger_dtl_tbl.Add(item);
                            db_ats.SaveChanges();
                        }
                    }
                }
                else
                {
                    data2.ledger_ctrl_no                = new_appl_nbr[0];
                    data2.leavetype_code                = data2.leavetype_code              ;
                    data2.leavesubtype_code             = data2.leavesubtype_code           ;
                    data2.leaveledger_balance_as_of     = data2.leaveledger_balance_as_of   ;
                    data2.leaveledger_restore_deduct    = data2.leaveledger_restore_deduct  ;
                    data2.leaveledger_abs_und_wp        = data2.leaveledger_abs_und_wp      ;
                    data2.leaveledger_abs_und_wop       = data2.leaveledger_abs_und_wop     ;

                    db_ats.lv_ledger_dtl_tbl.Add(data2);
                    db_ats.SaveChanges();
                }
                
                return Json(new { message = "success" }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message.ToString();
                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
        }
        //*********************************************************************//
        // Created By   : Vincent Jade H. Alivio 
        // Created Date : 2021-05-25
        // Description  : Save Record with New Logic created by Sir Ariel
        //*********************************************************************//
        public ActionResult Post_Leave_App(lv_ledger_hdr_tbl data
            , lv_ledger_dtl_tbl data2
            , lv_ledger_dtl_tbl data_auto_vl
            , lv_ledger_dtl_tbl data_auto_sl
            , string p_empl_id
            , string p_leavetype_code
            , string p_leavesubtype_code
            , DateTime p_leaveledger_date
            , decimal p_lv_nodays
            , lv_ledger_dtl_tbl data_auto_mz_tl
            )
        {
            try
            {
                db_ats.Database.CommandTimeout = int.MaxValue;

                var new_appl_nbr        = db_ats.sp_generate_appl_nbr("lv_ledger_hdr_tbl", 10, "ledger_ctrl_no").ToList();
                data.ledger_ctrl_no     = new_appl_nbr[0];
                data.sig_name3_ovrd     = data.sig_name3_ovrd   == "" || data.sig_name3_ovrd  == null ? string.Empty : data.sig_name3_ovrd;
                data.sig_pos3_ovrd      = data.sig_pos3_ovrd    == "" || data.sig_pos3_ovrd   == null ? string.Empty : data.sig_pos3_ovrd;
                data.details_remarks    = data.details_remarks  == "" || data.details_remarks == null ? string.Empty : data.details_remarks;
                data.approval_id        = data.approval_id      == "" || data.approval_id     == null ? string.Empty : data.approval_id;
                data.leave_ctrlno       = data.leave_ctrlno     == "" || data.leave_ctrlno    == null ? string.Empty : data.leave_ctrlno;
                data.updated_by_user    = string.Empty;
                data.updated_dttm       = Convert.ToDateTime("1900-01-01");
                data.created_by_user    = Session["user_id"].ToString();
                data.created_dttm       = DateTime.Now;
                data.leavetype_code     = data.leavetype_code    == "" || data.leavetype_code    == null ? "" : data.leavetype_code;
                data.leavesubtype_code  = data.leavesubtype_code == "" || data.leavesubtype_code == null ? "" : data.leavesubtype_code;
                data.lv_nodays          = data.lv_nodays;
                
                data.lwop_date          = data.lwop_date   ;
                data.lwop_body_1        = data.lwop_body_1 ;
                data.lwop_body_2        = data.lwop_body_2 ;

                var app_id = db.sp_insert_transaction_to_approvalworkflow_tbl(Session["user_id"].ToString(), data.empl_id.ToString(), "111").ToList();
                data.approval_id = app_id[0].ToString();
                
                // **************************************************************
                // **** Description  : Saving on Details ************************
                // **** Date Updated : 2021-05-25 *******************************
                // **************************************************************
                if (data.leaveledger_entry_type == "2") // Leave Application
                {
                    if (data.leavetype_code == "MZ" || data.leavetype_code == "TL")
                    {
                        data_auto_mz_tl.ledger_ctrl_no                = new_appl_nbr[0];
                        data_auto_mz_tl.leavetype_code                = data_auto_mz_tl.leavetype_code              ;
                        data_auto_mz_tl.leavesubtype_code             = data_auto_mz_tl.leavesubtype_code           ;
                        data_auto_mz_tl.leaveledger_balance_as_of     = data_auto_mz_tl.leaveledger_balance_as_of   ;
                        data_auto_mz_tl.leaveledger_restore_deduct    = data_auto_mz_tl.leaveledger_restore_deduct  ;
                        data_auto_mz_tl.leaveledger_abs_und_wp        = data_auto_mz_tl.leaveledger_abs_und_wp      ;
                        data_auto_mz_tl.leaveledger_abs_und_wop       = data_auto_mz_tl.leaveledger_abs_und_wop     ;

                        db_ats.lv_ledger_dtl_tbl.Add(data_auto_mz_tl);
                        db_ats.SaveChanges();

                        // NOTE: Do not save the Data if the WP is equal to zero (0)
                        if (data_auto_sl.leaveledger_abs_und_wp != 0)
                        {
                            data_auto_sl.ledger_ctrl_no                = new_appl_nbr[0];
                            data_auto_sl.leavetype_code                = data_auto_sl.leavetype_code              ;
                            data_auto_sl.leavesubtype_code             = data_auto_sl.leavesubtype_code           ;
                            data_auto_sl.leaveledger_balance_as_of     = data_auto_sl.leaveledger_balance_as_of   ;
                            data_auto_sl.leaveledger_restore_deduct    = data_auto_sl.leaveledger_restore_deduct  ;
                            data_auto_sl.leaveledger_abs_und_wp        = data_auto_sl.leaveledger_abs_und_wp      ;
                            data_auto_sl.leaveledger_abs_und_wop       = data_auto_sl.leaveledger_abs_und_wop     ;

                            db_ats.lv_ledger_dtl_tbl.Add(data_auto_sl);
                            db_ats.SaveChanges();
                        }

                        // NOTE: Do not save the Data if the WP is equal to zero (0)
                        if (data_auto_vl.leaveledger_abs_und_wp != 0)
                        {
                            data_auto_vl.ledger_ctrl_no                = new_appl_nbr[0];
                            data_auto_vl.leavetype_code                = data_auto_vl.leavetype_code              ;
                            data_auto_vl.leavesubtype_code             = data_auto_vl.leavesubtype_code           ;
                            data_auto_vl.leaveledger_balance_as_of     = data_auto_vl.leaveledger_balance_as_of   ;
                            data_auto_vl.leaveledger_restore_deduct    = data_auto_vl.leaveledger_restore_deduct  ;
                            data_auto_vl.leaveledger_abs_und_wp        = data_auto_vl.leaveledger_abs_und_wp      ;
                            data_auto_vl.leaveledger_abs_und_wop       = data_auto_vl.leaveledger_abs_und_wop     ;

                            db_ats.lv_ledger_dtl_tbl.Add(data_auto_vl);
                            db_ats.SaveChanges();
                        }
                        
                    }
                }
                //Update leave_application_hdr_tbl change posting status to 1 (true)
                if (data.leave_ctrlno != null && data.leave_ctrlno != "")
                {
                    var od3 = db_ats.leave_application_hdr_tbl.Where(a => a.leave_ctrlno == data.leave_ctrlno).FirstOrDefault();
                    od3.posting_status = true;
                }
                db_ats.lv_ledger_hdr_tbl.Add(data);

                // *************************************************************
                // **** VJA - 2023-06-01 -- Insert Leave Ledger History ********
                // *************************************************************
                var appl_status = "Reviewed & Posted to Ledger";
                db_ats.sp_lv_ledger_history_insert(new_appl_nbr[0], data.leave_ctrlno, data.empl_id, appl_status, data.details_remarks, Session["user_id"].ToString());
                // *************************************************************
                // **** VJA - 2023-06-01 -- Insert Leave Ledger History ********
                // *************************************************************

                db_ats.SaveChanges();
                
                return Json(new { message = "success" }, JsonRequestBehavior.AllowGet);
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
        public ActionResult GetSumofLeaveDetails(string par_ledger_ctrl_no, string par_leavetype_code, string par_empl_id, string par_year, string par_leave_ctrlno)
        {
            try
            {
                db_ats.Database.CommandTimeout = int.MaxValue;

                decimal sum_wp_and_wop = 0; 
                var dtl_value          = db_ats.lv_ledger_dtl_tbl.Where(a=> a.ledger_ctrl_no == par_ledger_ctrl_no && a.leavetype_code == par_leavetype_code).FirstOrDefault();
                sum_wp_and_wop         = dtl_value == null ? 0 : Convert.ToDecimal(dtl_value.leaveledger_abs_und_wp) + Convert.ToDecimal(dtl_value.leaveledger_abs_und_wop);
                var data               = db_ats.sp_leaveledger_curr_bal(par_empl_id, par_year, par_leavetype_code).FirstOrDefault();
                var data_waiver        = db.sp_leave_application_mone_waiver_rep(par_leave_ctrlno, par_empl_id, "").Where(a => a.approval_status_waiver != "APPROVED").ToList();

                return JSON(new { message = "success" ,dtl_value ,sum_wp_and_wop, data, data_waiver }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                var data            = db_ats.sp_leaveledger_curr_bal(par_empl_id, par_year, par_leavetype_code).FirstOrDefault();
                var data_waiver     = db.sp_leave_application_mone_waiver_rep(par_leave_ctrlno, par_empl_id, "").Where(a => a.approval_status_waiver != "APPROVED").ToList();
                string message      = e.Message.ToString();
                return Json(new { message, data, data_waiver }, JsonRequestBehavior.AllowGet);
            }
        }
        //*********************************************************************//
        // Created By   : Lorraine I. Ale 
        // Created Date : 05/05/2021
        // Description  : Initialized during pageload
        //*********************************************************************//
        public ActionResult GetLedgerConrtolNumber(string par_empl_id, string par_month, string par_year)
        {
            try
            {
                db_ats.Database.CommandTimeout = int.MaxValue;
                var new_appl_nbr = db_ats.sp_generate_appl_nbr("lv_ledger_hdr_tbl", 10, "ledger_ctrl_no").ToList();
                var total_undertime = db_ats.sp_leaveledger_empl_undertime(par_empl_id, par_month, par_year).ToList();
                return JSON(new{ message = "success",new_appl_nbr, total_undertime }, JsonRequestBehavior.AllowGet);
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
        public ActionResult CheckApprovalStatus(string par_ledger_ctrl_no)
        {
            try
            {
                db_ats.Database.CommandTimeout = int.MaxValue;

                var approval_status = db_ats.lv_ledger_hdr_tbl.Where(a => a.ledger_ctrl_no == par_ledger_ctrl_no).FirstOrDefault().approval_status;
                return JSON(new { message = "success", approval_status }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message.ToString();
                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
        }

        //*********************************************************************//
        // Created By   : Lorraine I. Ale 
        // Created Date : 06/24/2020
        // Description  : Add new record to travel type table
        //*********************************************************************//
        public ActionResult UpdateBal(lv_ledger_dtl_tbl data)
        {
            try
            {
                db_ats.Database.CommandTimeout = int.MaxValue;

                var query                           = db_ats.lv_ledger_dtl_tbl.Where(a => a.ledger_ctrl_no == data.ledger_ctrl_no && a.leavetype_code == data.leavetype_code).FirstOrDefault();
                query.leaveledger_balance_as_of     = data.leaveledger_balance_as_of == null ? 0 : data.leaveledger_balance_as_of;
                query.leaveledger_restore_deduct    = data.leaveledger_restore_deduct == null ? 0 : data.leaveledger_restore_deduct;
                query.leaveledger_abs_und_wp        = data.leaveledger_abs_und_wp == null ? 0 : data.leaveledger_abs_und_wp    ;
                query.leaveledger_abs_und_wop       = data.leaveledger_abs_und_wop == null ? 0 : data.leaveledger_abs_und_wop;
                db_ats.SaveChanges();
                return Json(new { message = "success" }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message.ToString();
                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
        }
        //*********************************************************************//
        // Created By   : Lorraine I. Ale 
        // Created Date : 06/24/2020
        // Description  : delete from travel type table
        //*********************************************************************//
        public ActionResult Delete_dtl(lv_ledger_dtl_tbl data)
        {
            try
            {
                db_ats.Database.CommandTimeout = int.MaxValue;

                var data_del        = db_ats.lv_ledger_dtl_tbl.Where(a => a.ledger_ctrl_no == data.ledger_ctrl_no && a.leavetype_code == data.leavetype_code).FirstOrDefault();
                db_ats.lv_ledger_dtl_tbl.Remove(data_del);
                db_ats.SaveChangesAsync();
                return Json(new { message = "success" }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message.ToString();

                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
        }
        //*********************************************************************//
        // Created By   : Lorraine I. Ale 
        // Created Date : 06/24/2020
        // Description  : Add new record to travel type table
        //*********************************************************************//
        public ActionResult Save_Details(lv_ledger_dtl_tbl data)
        {
            try
            {
                db_ats.Database.CommandTimeout = int.MaxValue;

                data.ledger_ctrl_no                = data.ledger_ctrl_no;
                data.leavetype_code                = data.leavetype_code;
                data.leavesubtype_code             = data.leavesubtype_code;
                data.leaveledger_balance_as_of     = data.leaveledger_balance_as_of;
                data.leaveledger_restore_deduct    = data.leaveledger_restore_deduct;
                data.leaveledger_abs_und_wp        = data.leaveledger_abs_und_wp;
                data.leaveledger_abs_und_wop       = data.leaveledger_abs_und_wop;
                db_ats.lv_ledger_dtl_tbl.Add(data);
                db_ats.SaveChanges();
                return Json(new { message = "success" }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message.ToString();
                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
        }
        //*********************************************************************//
        // Created By   : Lorraine I. Ale 
        // Created Date : 05/05/2021
        // Description  : Initialized during pageload
        //*********************************************************************//
        public ActionResult LedgerInfoCurr(string par_empl_id, string par_leavetype_code, string par_month, string par_year, string par_leave_ctrlno)
        {
            db_ats.Database.CommandTimeout = int.MaxValue;

            // ******************************************************
            // ******************************************************
            if (par_leavetype_code == "")
            {
                par_leavetype_code = "MZ"; // Default Para dle ma NULL
            }
            // ******************************************************
            // ******************************************************

            decimal bal_as_of    = 0;
            decimal bal_as_of_sl = 0;
            decimal bal_as_of_vl = 0;
            try
            {
                var total_undertime = db_ats.sp_leaveledger_empl_undertime(par_empl_id, par_month, par_year).FirstOrDefault();
                var data    = db_ats.sp_leaveledger_curr_bal(par_empl_id,par_year, par_leavetype_code).FirstOrDefault();
                var data_sl = db_ats.sp_leaveledger_curr_bal(par_empl_id, par_year, "SL").FirstOrDefault();
                var data_vl = db_ats.sp_leaveledger_curr_bal(par_empl_id, par_year, "VL").FirstOrDefault();

                // ******************************************************
                // ****** Current Balance for Specific ******************
                // ******************************************************
                if (data == null)
                {
                    var curr_bal_null = db_ats.leavetype_tbl.Where(a => a.leavetype_code == par_leavetype_code).FirstOrDefault().leavetype_maxperyear;
                    bal_as_of = Convert.ToDecimal(curr_bal_null);
                }
                else
                {
                    bal_as_of    = Convert.ToDecimal(data.leaveledger_balance_current);
                }
                // ******************************************************
                // ****** Current Balance for Sick Leave ****************
                // ******************************************************

                if (data_sl == null)
                {
                    var curr_bal_sl_null = db_ats.leavetype_tbl.Where(a => a.leavetype_code == "SL").FirstOrDefault().leavetype_maxperyear;
                    bal_as_of_sl = Convert.ToDecimal(curr_bal_sl_null);
                }
                else
                {
                    bal_as_of_sl = Convert.ToDecimal(data_sl.leaveledger_balance_current);
                }
                // ******************************************************
                // ****** Current Balance for Vacation Leave ************
                // ******************************************************
                if (data_vl == null)
                {
                    var curr_bal_vl_null = db_ats.leavetype_tbl.Where(a => a.leavetype_code == "VL").FirstOrDefault().leavetype_maxperyear;
                    bal_as_of_vl = Convert.ToDecimal(curr_bal_vl_null);
                }
                else
                {
                    bal_as_of_vl = Convert.ToDecimal(data_vl.leaveledger_balance_current);
                }

                var mone = db_ats.leave_application_mone_tbl.Where(a => a.empl_id == par_empl_id && a.leave_ctrlno == par_leave_ctrlno).FirstOrDefault(); 
                
                return JSON(new { message = "success",  bal_as_of ,bal_as_of_sl ,bal_as_of_vl, total_undertime, mone }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                return JSON(new { message = e.Message.ToString(), bal_as_of, bal_as_of_sl, bal_as_of_vl }, JsonRequestBehavior.AllowGet);
            }
        }
        //*********************************************************************//
        // Created By   : Lorraine I. Ale 
        // Created Date : 06/24/2020
        // Description  : delete from travel type table
        //*********************************************************************//
        public ActionResult sp_generateDTR(string dtr_year, string dtr_month, string empl_id, string employment_type, string department_code, string user_id, string par_print_generate)
        {
            var icn = "";
            var message = "";
            try
            {
                
                var par_view_type   = "0";
                var session_user_id = Session["user_id"].ToString();
                icn                 = "success";
                db_ats.Database.CommandTimeout = int.MaxValue;

                var checkShiftFlag = db_ats.sp_check_shiftsched(dtr_year, dtr_month, empl_id).ToList();
                var dtr_gen = new object();

                if (checkShiftFlag[0].transmit_flag != "0")
                {
                    if (checkShiftFlag[0].shift_flag == "1")
                    {
                        dtr_gen = db_ats.sp_generate_empl_dtr(dtr_year, dtr_month, empl_id, par_view_type, department_code, employment_type, session_user_id).ToList();
                    }
                    else if (checkShiftFlag[0].shift_flag == "2")
                    {
                        dtr_gen = db_ats.sp_generate_empl_dtr_shift(dtr_year, dtr_month, empl_id, par_view_type, department_code, employment_type, session_user_id).ToList();
                    }
                }

                return JSON(new { message, icon = icn , dtr_gen , checkShiftFlag }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                 icn = "error";
                 message = e.Message.ToString();

                return Json(new { message, icon = icn }, JsonRequestBehavior.AllowGet);
            }
        }
        
        //*********************************************************************//
        // Created By   : Vincent Jade H. Alivio
        // Created Date : 2021-08-17
        // Description  : Particulars
        //*********************************************************************//
        public ActionResult CheckLeaveApplicationDetails(lv_ledger_hdr_tbl data)
        {
            try
            {
                db_ats.Database.CommandTimeout = int.MaxValue;

                var date_applied_year   = DateTime.Parse(data.date_applied.ToString()).Year;
                var message_descr       = "";
                var message_descr_1     = "";
                var leave_appl_dtl      = db_ats.leave_application_dtl_tbl.Where(a=> a.empl_id == data.empl_id && a.leave_ctrlno == data.leave_ctrlno).ToList();
                
                if (data.leavetype_code == "SL")   // Sick Leave
                {
                    if (leave_appl_dtl != null)
                    {
                        for (int i = 0; i < leave_appl_dtl.Count; i++)
                        {
                            if (leave_appl_dtl[i].leave_date_from > data.date_applied ||
                                leave_appl_dtl[i].leave_date_to > data.date_applied)
                            {
                                message_descr   = "Date Applied: " + DateTime.Parse(data.date_applied.ToString()).ToString("MMMM d, yyyy") + "\n Application Nbr.: " + leave_appl_dtl[i].leave_ctrlno + "\n Date Application from :" + leave_appl_dtl[i].leave_date_from.ToString("MMMM d, yyyy") + "\n Date Application to: " + leave_appl_dtl[i].leave_date_to.ToString("MMMM d, yyyy");
                                message_descr_1 = " Application Date Applied is beyond date of Filing!";
                            }
                        }
                    }
                }
                // *************************************************
                // ** 2023-08-01 - Check if Travel Order Approved **
                // *************************************************
                if (data.leavetype_code != "ML" && data.leavetype_code != "RH")
                {
                    // ********************************************************************************
                    // **** 2024-09-03 - VJA - Query to Check the Existing Travel Order Application ***
                    // ********************************************************************************
                    var chk_travel = from a in db_ats.travelorder_hdr_tbl
                                 join b in db_ats.travelorder_dates_dtl_tbl
                                 on a.travel_order_no equals b.travel_order_no
                                 join c in db_ats.travelorder_empl_dtl_tbl
                                 on a.travel_order_no equals c.travel_order_no
                                 join d in db_ats.leave_application_dtl_tbl
                                 on c.empl_id equals d.empl_id
                                 where a.approval_status == "F"
                                    && c.empl_id      == data.empl_id
                                    && d.leave_ctrlno == data.leave_ctrlno
                                    && (
                                           (d.leave_date_from >= b.travel_date && d.leave_date_from <= b.travel_date_to)
                                        || (d.leave_date_to   >= b.travel_date && d.leave_date_to   <= b.travel_date_to)
                                       )
                                 select new
                                 {
                                     c.empl_id,
                                     b.travel_date,
                                     b.travel_date_to,
                                     a.travel_purpose
                                 };

                    if (chk_travel.ToList().Count > 0)
                    {
                        for (int x = 0; x < chk_travel.ToList().Count; x++)
                        {
                            message_descr  += DateTime.Parse(chk_travel.ToList()[x].travel_date.ToString()).ToString("MMMM d, yyyy") + (chk_travel.ToList()[x].travel_date == chk_travel.ToList()[x].travel_date_to ? "" : " - " + DateTime.Parse(chk_travel.ToList()[x].travel_date_to.ToString()).ToString("MMMM d, yyyy")) + "\n Travel Purpose: " + chk_travel.ToList()[x].travel_purpose + "\n";
                            message_descr_1 = " - There is Travel Order Approved!";
                        }
                    }
                    // ********************************************************************************
                    // **** 2024-09-03 - VJA - Query to Check the Existing Travel Order Application ***
                    // ********************************************************************************
                }
                return JSON(new {leave_appl_dtl, message_descr, message_descr_1 }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message.ToString();
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }
        
        //*********************************************************************//
        // Created By   : Lorraine I. Ale 
        // Created Date : 04/03/2020
        // Description  : Filter Page Grid
        //*********************************************************************//
        public ActionResult ApprReviewerAction(leave_application_hdr_tbl data,string ledger_ctrl_no)
        {
            try
            {
                db_ats.Database.CommandTimeout = int.MaxValue;
                var data_leave = db_ats.leave_application_hdr_tbl.Where(a => a.empl_id == data.empl_id && a.leave_ctrlno == data.leave_ctrlno).FirstOrDefault();
                var transac_apprvr = db.sp_update_transaction_in_approvalworkflow_tbl(data_leave.approval_id, Session["user_id"].ToString(), data.approval_status, data.details_remarks);
                var query = db_ats.leave_application_hdr_tbl.Where(a => a.leave_ctrlno  == data.leave_ctrlno).FirstOrDefault();
                query.approval_status   = data.approval_status;
                query.details_remarks   = data.details_remarks;
                query.updated_by_user   = Session["user_id"].ToString();
                query.updated_dttm      = DateTime.Now;
                var query2 = db_ats.leave_application_dtl_tbl.Where(a => a.leave_ctrlno == data.leave_ctrlno).ToList();
                query2.ForEach(a => a.rcrd_status = data.approval_status);

                // *************************************************************
                // **** VJA - 2023-06-01 -- Insert Leave Ledger History ********
                // *************************************************************
                var appl_status = (data.approval_status == "C" ? "(Cancel Pending)" : "(Disapproved)") + " from Review";
                db_ats.sp_lv_ledger_history_insert(ledger_ctrl_no, data.leave_ctrlno,data.empl_id, appl_status, data.details_remarks, Session["user_id"].ToString());
                // *************************************************************
                // **** VJA - 2023-06-01 -- Insert Leave Ledger History ********
                // *************************************************************

                db_ats.SaveChangesAsync();
                return JSON(new { message_descr = "success" }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message.ToString();
                return Json(new { message_descr = message }, JsonRequestBehavior.AllowGet);
            }
        }
        //*********************************************************************//
        // Created By   : Lorraine I. Ale 
        // Created Date : 06/24/2020
        // Description  : Add new record to travel type table
        //*********************************************************************//
        public ActionResult RePost(lv_ledger_hdr_tbl data,lv_ledger_dtl_tbl data2)
        {
            try
            {
                db_ats.Database.CommandTimeout = int.MaxValue;
                var transac_apprvr = db.sp_update_transaction_in_approvalworkflow_tbl(data.approval_id, Session["user_id"].ToString(), "S", "Repost by " + Session["user_id"].ToString());
                var query                       = db_ats.lv_ledger_hdr_tbl.Where(a => a.ledger_ctrl_no == data.ledger_ctrl_no).FirstOrDefault();
                query.updated_dttm              = DateTime.Now;
                query.updated_by_user           = Session["user_id"].ToString();
                query.leaveledger_period        = data.leaveledger_period;
                query.leaveledger_entry_type    = data.leaveledger_entry_type;
                query.leaveledger_particulars   = data.leaveledger_particulars;
                query.leaveledger_date          = data.leaveledger_date;
                query.date_applied              = data.date_applied;
                query.details_remarks           = data.details_remarks;
                query.sig_name3_ovrd            = data.sig_name3_ovrd;
                query.sig_pos3_ovrd             = data.sig_pos3_ovrd;
                query.lv_nodays                 = data.lv_nodays;
                query.leavesubtype_code         = data.leavesubtype_code;
                query.leave_ctrlno              = data.leave_ctrlno;
                query.approval_id               = data.approval_id;
                query.lwop_date                 = data.lwop_date;
                query.lwop_body_1               = data.lwop_body_1;
                query.lwop_body_2               = data.lwop_body_2;
                query.approval_status           = "S";
                
                var query2 = db_ats.lv_ledger_dtl_tbl.Where(a => a.ledger_ctrl_no == data.ledger_ctrl_no &&  a.leavetype_code == data.leavetype_code).FirstOrDefault();
                query2.leavesubtype_code = data.leavesubtype_code;

                db_ats.SaveChanges();

                // **************************************************************
                // **** Description  : Update on Details ************************
                // **** Date Updated : 2021-05-25 *******************************
                // **************************************************************
                if (data.leaveledger_entry_type == "2" || data.leaveledger_entry_type == "1") // Leave Application
                {
                }
                else
                {
                    var query_dtl = db_ats.lv_ledger_dtl_tbl.Where(a => a.ledger_ctrl_no == data2.ledger_ctrl_no && a.leavetype_code == data2.leavetype_code).FirstOrDefault();
                    query_dtl.leaveledger_balance_as_of  = data2.leaveledger_balance_as_of  ;
                    query_dtl.leaveledger_restore_deduct = data2.leaveledger_restore_deduct ;
                    query_dtl.leaveledger_abs_und_wp     = data2.leaveledger_abs_und_wp     ;
                    query_dtl.leaveledger_abs_und_wop    = data2.leaveledger_abs_und_wop    ;
                    db_ats.SaveChanges();
                }

                // *************************************************************
                // **** VJA - 2023-06-01 -- Insert Leave Ledger History ********
                // *************************************************************
                var appl_status = "Reviewed & Posted to Ledger (Repost)";
                db_ats.sp_lv_ledger_history_insert(data.ledger_ctrl_no, data.leave_ctrlno,data.empl_id, appl_status, data.details_remarks, Session["user_id"].ToString());
                // *************************************************************
                // **** VJA - 2023-06-01 -- Insert Leave Ledger History ********
                // *************************************************************

                return Json(new { message = "success" }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message.ToString();
                return Json(new { message }, JsonRequestBehavior.AllowGet);
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
                db_ats.Database.CommandTimeout = int.MaxValue;
                var data = db_ats.sp_time_schedule_empl_hdr_tbl1(par_empl_id, par_tse_year).ToList();
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
        public ActionResult TimeSked_DTL(string par_empl_id ,string par_month ,string par_year ,DateTime par_effective_date )
        {
            try
            {
                db_ats.Database.CommandTimeout = int.MaxValue;
                var data = db_ats.sp_time_schedule_empl_tbl1(par_empl_id, par_month, par_year, par_effective_date).ToList();
                return Json(new { message = "success", data }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                return Json(new { message = e.Message.ToString() }, JsonRequestBehavior.AllowGet);
            }
        }
        public ActionResult Retrieve_LeaveHistory(string leave_ctrlno, string empl_id)
        {
            try
            {
                if (leave_ctrlno == null || leave_ctrlno == "")
                {
                    var data = "";
                    return Json(new { message = "no data found!", data }, JsonRequestBehavior.AllowGet);
                }
                else
                {
                    var data = db_ats.func_lv_ledger_history_notif(leave_ctrlno,empl_id).OrderByDescending(a=>a.created_dttm).ToList();
                    return Json(new { message = "success", data }, JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception e)
            {
                string message = e.Message.ToString();
                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
        }
        public ActionResult Retrieve_Justification(string leave_ctrlno, string empl_id)
        {
            try
            {
                var data = db_ats.leave_application_hdr_justi_tbl.Where(a => a.leave_ctrlno == leave_ctrlno && a.empl_id == empl_id).OrderByDescending(a => a.id).FirstOrDefault();
                return Json(new { message = "success", data}, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message.ToString();
                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
        }

        public ActionResult SaveReprint(lv_ledger_hdr_reprint_tbl data)
        {
            try
            {
                db_ats.Database.CommandTimeout = int.MaxValue;
                var data_chk = db_ats.lv_ledger_hdr_reprint_tbl.Where(a => a.ledger_ctrl_no == data.ledger_ctrl_no && a.empl_id == data.empl_id).FirstOrDefault();
                if (data_chk == null || data_chk.reprint_reason  != data.reprint_reason)
                {
                    data.created_by     = Session["user_id"].ToString();
                    data.created_dttm   = DateTime.Now;
                    data.reprint_status = "REQUEST";
                    db_ats.lv_ledger_hdr_reprint_tbl.Add(data);
                }
                else
                {
                    data_chk.reprint_reason    = data.reprint_reason    ;
                    data_chk.reprint_date_from = data.reprint_date_from ;
                    data_chk.reprint_date_to   = data.reprint_date_to   ;
                    data_chk.approved_by       = Session["user_id"].ToString();
                    data_chk.approved_dttm     = DateTime.Now;
                }
                db_ats.SaveChanges();

                return Json(new { message = "success", data }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message.ToString();
                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
        }
        public ActionResult RetrieveReprint(string par_ledger_ctrl_no, string par_empl_id)
        {
            try
            {
                var data = db_ats.lv_ledger_hdr_reprint_tbl.Where(a => a.ledger_ctrl_no == par_ledger_ctrl_no && a.empl_id == par_empl_id).OrderByDescending(a=> a.id).FirstOrDefault();
                return Json(new { message = "success", data}, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message.ToString();
                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
        }
        public ActionResult checkShiftFlag(string dtr_year, string dtr_month, string empl_id)
        {
            try
            {
                var checkShiftFlag = db_ats.sp_check_shiftsched(dtr_year, dtr_month, empl_id).ToList();
                return Json(new { message = "success", checkShiftFlag }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message.ToString();
                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
        }
        public ActionResult reloadPosted( string par_empl_id , int p_rep_mode)
        {
            try
            {
                List<sp_lv_ledger_posted_unposted_Result> lv_posted1 = new List<sp_lv_ledger_posted_unposted_Result>();
                if (p_rep_mode == 2)        // Leave 
                {
                    lv_posted1   = db_ats.sp_lv_ledger_posted_unposted(par_empl_id, "1").Where(a => a.leave_type_code != "CTO").ToList();
                }
                else if (p_rep_mode == 3)  // CTO
                {
                    lv_posted1   = db_ats.sp_lv_ledger_posted_unposted(par_empl_id, "1").Where(a => a.leave_type_code == "CTO").ToList();
                }
                else                       // Both Leave and CTO
                {
                    lv_posted1   = db_ats.sp_lv_ledger_posted_unposted(par_empl_id, "1").ToList();
                }
                var lv_posted  = from a in lv_posted1.ToList()
                                join b in db_ats.leave_application_mone_tbl
                                on new { a.empl_id, a.leave_ctrlno } equals new { b.empl_id, b.leave_ctrlno } into temp
                                from b in temp.DefaultIfEmpty()
                                select new
                                {
                                    a.ledger_ctrl_no   
                                    ,a.leave_ctrlno    
                                    ,a.empl_id 
                                    ,a.employee_name   
                                    ,a.department_code 
                                    ,a.date_applied    
                                    ,a.inclusive_dates 
                                    ,a.leave_type_code 
                                    ,a.leavetype_descr 
                                    ,a.leave_subtype_code  
                                    ,a.leavesubtype_descr  
                                    ,a.posting_status  
                                    ,a.created_date_only   
                                    ,a.created_by_user 
                                    ,a.number_of_days  
                                    ,a.leaveledger_entry_type  
                                    ,a.justification_flag  
                                    ,a.leave_class 
                                    ,a.leave_descr 
                                    ,a.disapproved_remakrs
                                    ,mone = b
                                };
                return Json(new { message = "success", lv_posted }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message.ToString();
                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
        }
        public ActionResult ReloadBalances(string par_empl_id)
        {
            try
            {
                List<sp_leaveledger_curr_bal2_Result> data_all_bal = new List<sp_leaveledger_curr_bal2_Result>();
                var leavetype = db_ats.leavetype_tbl.Where(a => a.leavetype_code != "PL" &&   //PL = Paternity Leave
                                                                a.leavetype_code != "PS" &&   // PS = Parental Leave (Solo Parent)
                                                                a.leavetype_code != "ML" &&   // ML = Maternity Leave
                                                                a.leavetype_code != "MZ" &&   // MZ = Monetization Leave
                                                                a.leavetype_code != "TL" &&   // TL	Terminal Leave
                                                                a.leavetype_code != "QT" &&   // TL	Terminal Leave
                                                                a.leavetype_code != "MC"      // MC	Magna Carta
                                                          ).ToList();
                for (int x = 0; x < leavetype.Count; x++)
                {
                    sp_leaveledger_curr_bal2_Result data2 = new sp_leaveledger_curr_bal2_Result();
                    data2 = db_ats.sp_leaveledger_curr_bal2(par_empl_id, DateTime.Now.Year.ToString(), leavetype[x].leavetype_code).FirstOrDefault();
                    data_all_bal.Add(data2);
                }
                data_all_bal = data_all_bal.OrderByDescending(a => a.leaveledger_balance_current).ToList();
                return Json(new { message = "success", data_all_bal }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                return Json(new { message = e.Message.ToString()}, JsonRequestBehavior.AllowGet);
                throw;
            }
        }

        public ActionResult LatesUndertime(int minutes)
        {
            try
            {
                var lates = db_ats.sp_get_undertime_equi(minutes).FirstOrDefault();
                return Json(new { message = "success", lates }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                return Json(new { message = e.Message.ToString() }, JsonRequestBehavior.AllowGet);
            }
        }
        public ActionResult ShowSyncBalance(string par_empl_id,string par_leavetype_code, string par_ledger_ctrl_no)
        {
            try
            {
                var data = from a in db_ats.lv_ledger_dtl_tbl
                                       join b in db_ats.lv_ledger_hdr_tbl
                                       on a.ledger_ctrl_no equals b.ledger_ctrl_no
                                       where b.empl_id == par_empl_id
                                        && a.leavetype_code == par_leavetype_code
                                        && string.Compare(b.ledger_ctrl_no, par_ledger_ctrl_no) >= 0
                                       orderby b.created_dttm ascending
                                       select new {  a,b };
                return Json(new { message = "success", data }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                return Json(new { message = e.Message.ToString() }, JsonRequestBehavior.AllowGet);
            }
        }
        public ActionResult SaveSync(List<lv_ledger_dtl_tbl> data, string leavetype_code)
        {
            try
            {
                foreach (var item in data)
                {
                    var record = db_ats.lv_ledger_dtl_tbl.FirstOrDefault(a => a.ledger_ctrl_no == item.ledger_ctrl_no && a.leavetype_code == leavetype_code);
                    if (record != null)
                    {
                        record.leaveledger_balance_as_of    = item.leaveledger_balance_as_of + item.leaveledger_abs_und_wp - item.leaveledger_restore_deduct;
                        record.leaveledger_abs_und_wp       = item.leaveledger_abs_und_wp;
                        record.leaveledger_restore_deduct   = item.leaveledger_restore_deduct;
                        db_ats.SaveChanges();
                    }
                }
                if (data.Count > 0)
                {
                    var ledger_ctrl_no = data[0].ledger_ctrl_no;
                    var record_hdr = db_ats.lv_ledger_hdr_tbl.FirstOrDefault(a => a.ledger_ctrl_no == ledger_ctrl_no);
                    record_hdr.updated_dttm = DateTime.Now;
                    record_hdr.updated_by_user = Session["user_id"].ToString();
                    db_ats.SaveChanges();
                }
                return Json(new { message = "success"}, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                return Json(new { message = e.Message.ToString() }, JsonRequestBehavior.AllowGet);
            }
        }

        //*********************************************************************//
        // Created Date : Auto-generated
        // Description  : Get Discrepancy Summary Report for Leave Ledger
        //                Only for VL (Vacation Leave) and SL (Sick Leave)
        //*********************************************************************//
        public ActionResult GetDiscrepancySummaryReport(
            string par_empl_id,
            string par_date_from,
            string par_date_to,
            int par_view_mode
        )
        {
            try
            {
                db_ats.Database.CommandTimeout = int.MaxValue;

                // Parse dates
                DateTime? dateFrom = null;
                DateTime? dateTo = null;
                if (!string.IsNullOrEmpty(par_date_from))
                    dateFrom = DateTime.Parse(par_date_from);
                if (!string.IsNullOrEmpty(par_date_to))
                    dateTo = DateTime.Parse(par_date_to);

                // Get leave ledger data for the employee
                var lv_ledger_report = db_ats.sp_leaveledger_report(par_empl_id, dateFrom, dateTo, par_view_mode).ToList();

                // Filter for VL and SL only - check if leave type is VL or SL, or if there's VL/SL activity
                var filteredReport = lv_ledger_report.Where(item =>
                {
                    string leaveType = item.leavetype_code?.Trim().ToUpper() ?? "";

                    // Include if leave type is VL or SL
                    if (leaveType == "VL" || leaveType == "SL")
                        return true;

                    // Also include if there's any VL or SL balance activity (earned, deducted, or balance)
                    decimal vl_earned = 0, vl_wp = 0, vl_bal = 0;
                    decimal sl_earned = 0, sl_wp = 0, sl_bal = 0;

                    decimal.TryParse(item.vl_earned, out vl_earned);
                    decimal.TryParse(item.vl_wp, out vl_wp);
                    decimal.TryParse(item.vl_bal, out vl_bal);
                    decimal.TryParse(item.sl_earned, out sl_earned);
                    decimal.TryParse(item.sl_wp, out sl_wp);
                    decimal.TryParse(item.sl_bal, out sl_bal);

                    // Include if there's any VL or SL activity
                    bool hasVLActivity = vl_earned != 0 || vl_wp != 0 || vl_bal != 0;
                    bool hasSLActivity = sl_earned != 0 || sl_wp != 0 || sl_bal != 0;

                    return hasVLActivity || hasSLActivity;
                }).ToList();

                // Get employee info
                var employeeInfo = db_ats.vw_personnelnames_tbl_HRIS_ATS.FirstOrDefault(e => e.empl_id == par_empl_id);
                string employee_name = employeeInfo != null ? employeeInfo.employee_name : "";

                // Calculate discrepancies - running totals for VL and SL only
                // Formula: Running Total = Previous Running Total + Earned - Deducted
                // Discrepancy = |Running Total - Database Balance| > 1.25
                var summaryData = new List<object>();
                int discrepancy_count = 0;

                // Calculated running totals (cumulative, always correct)
                decimal running_total_vl = 0;
                decimal running_total_sl = 0;
                bool isFirstRow = true;

                foreach (var item in filteredReport)
                {
                    // VL calculations - parse from string fields
                    decimal vl_earned = 0;
                    decimal vl_abs_und_wp = 0;
                    decimal vl_db_balance = 0;  // Database balance
                    decimal.TryParse(item.vl_earned, out vl_earned);
                    decimal.TryParse(item.vl_wp, out vl_abs_und_wp);
                    decimal.TryParse(item.vl_bal, out vl_db_balance);

                    // SL calculations - parse from string fields
                    decimal sl_earned = 0;
                    decimal sl_abs_und_wp = 0;
                    decimal sl_db_balance = 0;  // Database balance
                    decimal.TryParse(item.sl_earned, out sl_earned);
                    decimal.TryParse(item.sl_wp, out sl_abs_und_wp);
                    decimal.TryParse(item.sl_bal, out sl_db_balance);

                    // Store previous running total for display (OLD column)
                    decimal old_running_vl = running_total_vl;
                    decimal old_running_sl = running_total_sl;

                    // Calculate new running total: Previous Running Total + Earned - Deducted
                    // For first row, use the database balance as the starting point
                    if (isFirstRow)
                    {
                        running_total_vl = vl_db_balance;
                        running_total_sl = sl_db_balance;
                    }
                    else
                    {
                        running_total_vl = running_total_vl + vl_earned - vl_abs_und_wp;
                        running_total_sl = running_total_sl + sl_earned - sl_abs_und_wp;
                    }

                    // Calculate discrepancy: |Calculated Running Total - Database Balance|
                    // This shows where the database value diverges from what it SHOULD be
                    decimal disc_vl = Math.Abs(running_total_vl - vl_db_balance);
                    decimal disc_sl = Math.Abs(running_total_sl - sl_db_balance);

                    // Check if there's actual VL/SL activity on this row
                    bool hasVLActivity = vl_earned != 0 || vl_abs_und_wp != 0 || vl_db_balance != 0;
                    bool hasSLActivity = sl_earned != 0 || sl_abs_und_wp != 0 || sl_db_balance != 0;

                    // Flag as discrepancy ONLY if:
                    // 1. Not the first row (skip starting point)
                    // 2. There's actual VL/SL activity on this row
                    // 3. The difference exceeds threshold (1.25)
                    bool has_vl_discrepancy = !isFirstRow && hasVLActivity && disc_vl > 1.25m;
                    bool has_sl_discrepancy = !isFirstRow && hasSLActivity && disc_sl > 1.25m;
                    bool has_discrepancy = has_vl_discrepancy || has_sl_discrepancy;

                    if (has_discrepancy)
                    {
                        discrepancy_count++;
                    }

                    summaryData.Add(new
                    {
                        ledger_ctrl_no = item.ledger_ctrl_no,
                        period = item.leaveledger_period,
                        leave_type = item.leavetype_str,
                        // VL columns
                        old_balance_vl = old_running_vl,             // Previous running total (before this row)
                        earned_vl = vl_earned,                       // Earned this period
                        abs_und_wp_vl = vl_abs_und_wp,              // Deducted this period
                        expected_balance_vl = running_total_vl,      // Calculated running total (what DB should be)
                        curr_balance_vl = vl_db_balance,             // Actual database balance
                        discrepancy_vl = disc_vl,                    // |Running Total - DB Balance|
                        running_total_vl = running_total_vl,
                        has_vl_discrepancy,
                        // SL columns
                        old_balance_sl = old_running_sl,             // Previous running total (before this row)
                        earned_sl = sl_earned,
                        abs_und_wp_sl = sl_abs_und_wp,
                        expected_balance_sl = running_total_sl,      // Calculated running total (what DB should be)
                        curr_balance_sl = sl_db_balance,             // Actual database balance
                        discrepancy_sl = disc_sl,                    // |Running Total - DB Balance|
                        running_total_sl = running_total_sl,
                        has_sl_discrepancy,
                        has_discrepancy,
                        created_dttm = item.created_dttm
                    });

                    isFirstRow = false;
                }

                int total_count = summaryData.Count;

                var summary = new
                {
                    total_count,
                    discrepancy_count,
                    employee_name,
                    empl_id = par_empl_id,
                    date_from = par_date_from,
                    date_to = par_date_to,
                    // Final running totals
                    final_running_total_vl = running_total_vl,
                    final_running_total_sl = running_total_sl,
                    data = summaryData
                };

                return JSON(new { message = "success", summary }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message.ToString();
                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
        }

        public ActionResult reloadExtract(string empl_id,string year, int nbr_quarter)
        {
            try
            {
                var extract_from = db_ats.lv_lv_ledger_extract.Where(a => a.year_extracted == year && a.nbr_quarter == nbr_quarter && a.empl_id == empl_id).OrderBy(a => a.created_dttm).FirstOrDefault().created_dttm;
                var extract_to   = db_ats.lv_lv_ledger_extract.Where(a => a.year_extracted == year && a.nbr_quarter == nbr_quarter && a.empl_id == empl_id).OrderByDescending(a => a.created_dttm).FirstOrDefault().created_dttm;
                return Json(new { message = "success", extract_from, extract_to }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                return Json(new { message = e.Message.ToString() }, JsonRequestBehavior.AllowGet);
            }
        }
        public ActionResult export_and_merge(
            string par_department_code,
            string par_employment_type,
            string par_year,
            string par_month)
            {
                try
                {

                //Database credentials
                string dbServer     = "192.168.80.49\\HRIS";
                string dbName       = "HRIS_ATS";
                string dbUser       = "sa";
                string dbPassword   = "SystemAdmin_PRD123";
                db_ats.Database.CommandTimeout = int.MaxValue;

                    var data = db_ats
                        .sp_lv_empl_lst_wout_jo_yr_mt(
                            par_department_code,
                            par_employment_type,
                            par_year,
                            par_month)
                        .Take(5)
                        .ToList();

                    string basePath = AppDomain.CurrentDomain.BaseDirectory;
                    string reportPath = Path.Combine(basePath, @"Reports\cryLeaveLedger\cryLeaveLedger.rpt");
                    string exportFolder = Path.Combine(basePath, "ExportedFiles");

                    if (!Directory.Exists(exportFolder))
                        Directory.CreateDirectory(exportFolder);

                    DateTime dateFrom = new DateTime(2021, 1, 1);
                    DateTime dateTo = new DateTime(2025, 12, 31);

                    // 🔹 collect exported files
                    List<string> pdfFiles = new List<string>();

                    foreach (var item in data)
                    {
                        using (ReportDocument report = new ReportDocument())
                        {
                            report.Load(reportPath);
                            report.SetDatabaseLogon(dbUser, dbPassword, dbServer, dbName);

                            report.SetParameterValue("@p_empl_id", item.empl_id);
                            report.SetParameterValue("@p_date_fr", dateFrom);
                            report.SetParameterValue("@p_date_to", dateTo);
                            report.SetParameterValue("@p_rep_mode", "2");

                            string fileName = $"LeaveLedger_{item.empl_id}.pdf";
                            string exportPath = Path.Combine(exportFolder, fileName);

                            report.ExportToDisk(ExportFormatType.PortableDocFormat,exportPath);

                            pdfFiles.Add(exportPath);
                        }
                    }

                    string dep_name         = db.departments_tbl.Where(a => a.department_code == par_department_code).FirstOrDefault().department_short_name;
                    string mergedFileName   = $"LeaveLedger_Merged_{dep_name.Replace(" ","")}_{DateTime.Now:yyyyMMddHHmmss}.pdf";
                    string mergedPath       = Path.Combine(exportFolder, mergedFileName);

                    using (FileStream stream = new FileStream(mergedPath, FileMode.Create))
                    using (Document document = new Document())
                    using (PdfCopy pdf = new PdfCopy(document, stream))
                    {
                        document.Open();

                        foreach (string file in pdfFiles)
                        {
                            using (PdfReader reader = new PdfReader(file))
                            {
                                for (int i = 1; i <= reader.NumberOfPages; i++)
                                {
                                    pdf.AddPage(pdf.GetImportedPage(reader, i));
                                }
                            }
                        }
                    }

                    // 🔹 optional cleanup
                    foreach (string file in pdfFiles)
                    {
                        if (System.IO.File.Exists(file))
                            System.IO.File.Delete(file);
                    }

                    // 🔹 DOWNLOAD to client
                    return File(
                        mergedPath,
                        "application/pdf",
                        mergedFileName
                    );
                }
                catch (Exception ex)
                {
                    return Json(new { message = ex.Message }, JsonRequestBehavior.AllowGet);
                }
            }


}

}