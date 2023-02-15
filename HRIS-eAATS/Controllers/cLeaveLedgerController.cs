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
    public class cLeaveLedgerController : Controller
    {
        HRIS_DEVEntities db = new HRIS_DEVEntities();
        HRIS_ATSEntities db_ats = new HRIS_ATSEntities();
        User_Menu um = new User_Menu();

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

                // var lv_admin_dept_list  = db.vw_departments_tbl_list.OrderBy(a => a.department_code);
                var lv_admin_dept_list = db_ats.vw_leaveadmin_tbl_list.Where(a=> a.empl_id == log_empl_id).OrderBy(a => a.department_code);
                var leave_type_lst      = db_ats.sp_leavetype_tbl_list().ToList();
                var leave_subType_lst   = db_ats.sp_leavesubtype_tbl_list("").ToList();

                List<sp_lv_ledger_posted_unposted_Result> lv_unposted = new List<sp_lv_ledger_posted_unposted_Result>();
                List<sp_lv_ledger_posted_unposted_Result> lv_posted   = new List<sp_lv_ledger_posted_unposted_Result>();
                
                List<sp_leaveledger_curr_bal2_Result> data_all_bal = new List<sp_leaveledger_curr_bal2_Result>();

                List<sp_leaveledger_report_Result> lv_ledger_report = new List<sp_leaveledger_report_Result>();

                if (Session["redirect_par"].ToString() != string.Empty)
                {
                    redirect_data = Session["redirect_par"].ToString().Split(new char[] { ',' });

                    // ********************************************************************
                    // ****** Filter the View mode if Leave, CTO and Both Leave and CTO ***
                    // ********************************************************************
                    if (redirect_data[7].ToString() == "2")        // Leave 
                    {
                        lv_unposted = db_ats.sp_lv_ledger_posted_unposted(redirect_data[1].ToString(), "0").Where(a => a.leave_type_code != "CTO").ToList();
                        lv_posted   = db_ats.sp_lv_ledger_posted_unposted(redirect_data[1].ToString(), "1").Where(a => a.leave_type_code != "CTO").ToList();
                    }
                    else if (redirect_data[7].ToString() == "3")  // CTO
                    {
                        lv_unposted = db_ats.sp_lv_ledger_posted_unposted(redirect_data[1].ToString(), "0").Where(a => a.leave_type_code == "CTO").ToList();
                        lv_posted   = db_ats.sp_lv_ledger_posted_unposted(redirect_data[1].ToString(), "1").Where(a => a.leave_type_code == "CTO").ToList();
                    }
                    else                       // Both Leave and CTO
                    {
                        lv_unposted = db_ats.sp_lv_ledger_posted_unposted(redirect_data[1].ToString(), "0").ToList();
                        lv_posted   = db_ats.sp_lv_ledger_posted_unposted(redirect_data[1].ToString(), "1").ToList();
                    }
                    // ********************************************************************
                    // ********************************************************************

                    //*********************************************************************//
                    // Created By   : Vincent Jade H. Alivio
                    // Created Date : 2021-07-08
                    // Description  : Get the All Balance of Every Leave Type
                    //*********************************************************************//
                    var leavetype = db_ats.leavetype_tbl.Where(a=> a.leavetype_code != "PL" &&   //PL = Paternity Leave
                                                                   a.leavetype_code != "PS" &&   // PS = Parental Leave (Solo Parent)
                                                                   a.leavetype_code != "ML" &&   // ML = Maternity Leave
                                                                   a.leavetype_code != "MZ" &&   // MZ = Monetization Leave
                                                                   a.leavetype_code != "TL" &&   // TL	Terminal Leave
                                                                   a.leavetype_code != "MC"      // MC	Magna Carta
                                                              ).ToList();
                    for (int x = 0; x < leavetype.Count; x++)
                    {
                        sp_leaveledger_curr_bal2_Result data2 = new sp_leaveledger_curr_bal2_Result();
                        data2 = db_ats.sp_leaveledger_curr_bal2(redirect_data[1].ToString(), DateTime.Now.Year.ToString(), leavetype[x].leavetype_code).FirstOrDefault();
                        data_all_bal.Add(data2);
                    }
                    //*********************************************************************//
                    //*********************************************************************//
                    var rep_mode = redirect_data[7];
                    lv_ledger_report = db_ats.sp_leaveledger_report(redirect_data[1].ToString(), "2021-01-01", DateTime.Now.Year.ToString() + "-12-31", Convert.ToInt16(rep_mode)).ToList();
                }



                return JSON(new { message = "success"
                    , um
                    , lv_admin_dept_list
                    , log_user_id
                    , leave_type_lst
                    , leave_subType_lst
                    , redirect_data
                    , cLV_Ledger_employee_name
                    , lv_unposted
                    , lv_posted
                    ,data_all_bal
                    ,lv_ledger_report
                }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message;
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
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
                //var lv_empl_lst_wout_jo = db_ats.sp_lv_empl_lst_wout_jo(par_department_code, par_employment_type).ToList();

                return JSON(new {
                    message = "success"
                    , lv_empl_lst_wout_jo }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message;
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
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
                return JSON(new { message = "success", leave_subType_lst }, JsonRequestBehavior.AllowGet);
            }
            catch(Exception e)
            {
                return JSON(new { message = e.Message }, JsonRequestBehavior.AllowGet);
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
                var lv_ledger_report    = db_ats.sp_leaveledger_report(par_empl_id, p_date_fr, p_date_to, p_rep_mode).ToList();
                var total_undertime     = db_ats.sp_leaveledger_empl_undertime(par_empl_id, par_month, par_year).ToList();
                var leavetype_balances  = db_ats.sp_leavetype_current_bal(par_empl_id).ToList();

                // ********************************************************************
                // ****** Filter the View mode if Leave, CTO and Both Leave and CTO ***
                // ********************************************************************
                var lv_unposted = db_ats.sp_lv_ledger_posted_unposted(par_empl_id, "0").ToList();
                var lv_posted   = db_ats.sp_lv_ledger_posted_unposted(par_empl_id, "1").ToList();

                if (p_rep_mode == 2)        // Leave 
                {
                    lv_unposted = db_ats.sp_lv_ledger_posted_unposted(par_empl_id, "0").Where(a => a.leave_type_code != "CTO").ToList();
                    lv_posted   = db_ats.sp_lv_ledger_posted_unposted(par_empl_id, "1").Where(a => a.leave_type_code != "CTO").ToList();
                }
                else if (p_rep_mode == 3)  // CTO
                {
                    lv_unposted = db_ats.sp_lv_ledger_posted_unposted(par_empl_id, "0").Where(a => a.leave_type_code == "CTO").ToList();
                    lv_posted   = db_ats.sp_lv_ledger_posted_unposted(par_empl_id, "1").Where(a => a.leave_type_code == "CTO").ToList();
                }
                else                       // Both Leave and CTO
                {
                    lv_unposted = db_ats.sp_lv_ledger_posted_unposted(par_empl_id, "0").ToList();
                    lv_posted   = db_ats.sp_lv_ledger_posted_unposted(par_empl_id, "1").ToList();
                }
                // ********************************************************************
                // ********************************************************************

                //*********************************************************************//
                // Created By   : Vincent Jade H. Alivio
                // Created Date : 2021-07-08
                // Description  : Get the All Balance of Every Leave Type
                //*********************************************************************//
                var leavetype = db_ats.leavetype_tbl.Where(a => a.leavetype_code != "PL" &&   //PL = Paternity Leave
                                                                a.leavetype_code != "PS" &&   // PS = Parental Leave (Solo Parent)
                                                                a.leavetype_code != "ML" &&   // ML = Maternity Leave
                                                                a.leavetype_code != "MZ" &&   // MZ = Monetization Leave
                                                                a.leavetype_code != "TL" &&   // TL	Terminal Leave
                                                                a.leavetype_code != "MC"      // MC	Magna Carta
                                                            ).ToList();
                List<sp_leaveledger_curr_bal2_Result> data_all_bal = new List<sp_leaveledger_curr_bal2_Result>();

                for (int x = 0; x < leavetype.Count; x++)
                {
                    sp_leaveledger_curr_bal2_Result data2 = new sp_leaveledger_curr_bal2_Result();
                    data2 = db_ats.sp_leaveledger_curr_bal2(par_empl_id, par_year, leavetype[x].leavetype_code).FirstOrDefault();
                    data_all_bal.Add(data2);
                }
                //*********************************************************************//
                //*********************************************************************//

                return JSON(new
                {
                    message = "success"
                    ,lv_ledger_report
                    ,lv_unposted
                    ,lv_posted
                    //,info_empl_dept_code
                    ,total_undertime
                    ,leavetype_balances
                    ,data_all_bal
                }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message;
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
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

                return JSON(new
                {
                    message = "success"
                    , lv_ledger_dtl_tbl_list
                }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message;
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
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
                                                                //a.leaveledger_date == data.leaveledger_date &&
                                                                a.leaveledger_period == data.leaveledger_period &&
                                                                a.leaveledger_particulars == data.leaveledger_particulars &&
                                                                a.leaveledger_entry_type == data.leaveledger_entry_type &&
                                                                //a.date_applied == data.date_applied &&
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
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
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

                var query = db_ats.lv_ledger_hdr_tbl.Where(a => a.ledger_ctrl_no == data.ledger_ctrl_no).FirstOrDefault();
                query.updated_dttm = DateTime.Now;
                query.updated_by_user = Session["user_id"].ToString();
                
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
                
                var query2 = db_ats.lv_ledger_dtl_tbl.Where(a => a.ledger_ctrl_no == data.ledger_ctrl_no && 
                                                                a.leavetype_code == data.leavetype_code).FirstOrDefault();

                query2.leavesubtype_code = data.leavesubtype_code;

                db_ats.SaveChanges();

                // **************************************************************
                // **** Description  : Update on Details ************************
                // **** Date Updated : 2021-05-25 *******************************
                // **************************************************************
                if (data.leaveledger_entry_type == "2" || data.leaveledger_entry_type == "1") // Leave Application
                {
                    // var data_dtl = db_ats.sp_save_lv_ledger_dtl_tbl(new_appl_nbr[0], p_empl_id, p_leavetype_code, p_leavesubtype_code, p_leaveledger_date, p_lv_nodays).ToString();
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
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
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

                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
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
            , lv_ledger_dtl_tbl data_auto_mz_tl)
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
                    // var data_dtl = db_ats.sp_save_lv_ledger_dtl_tbl(new_appl_nbr[0], p_empl_id, p_leavetype_code, p_leavesubtype_code, p_leaveledger_date, p_lv_nodays).ToString();

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
                else if (data.leaveledger_entry_type == "1") // Automated Leave
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
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
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
                    // var data_dtl = db_ats.sp_save_lv_ledger_dtl_tbl(new_appl_nbr[0], p_empl_id, p_leavetype_code, p_leavesubtype_code, p_leaveledger_date, p_lv_nodays).ToString();
                    
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
                db_ats.SaveChanges();

                return Json(new { message = "success" }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message.ToString();
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }

        //*********************************************************************//
        // Created By   : Vincent Jade H. Alivio
        // Created Date : 05/05/2021
        // Description  : Initialized during pageload
        //*********************************************************************//
        public ActionResult GetSumofLeaveDetails(string par_ledger_ctrl_no, string par_leavetype_code, string par_empl_id, string par_year)
        {
            try
            {
                db_ats.Database.CommandTimeout = int.MaxValue;

                decimal sum_wp_and_wop = 0; 
                var dtl_value          = db_ats.lv_ledger_dtl_tbl.Where(a=> a.ledger_ctrl_no == par_ledger_ctrl_no && a.leavetype_code == par_leavetype_code).FirstOrDefault();
                sum_wp_and_wop         = dtl_value == null ? 0 : Convert.ToDecimal(dtl_value.leaveledger_abs_und_wp) + Convert.ToDecimal(dtl_value.leaveledger_abs_und_wop);

                // *******************************************************************
                // **** 2021-06-29 : Special Case for Maternity Casual ***************
                // **** Dapat ddtu kwaon sa Header ang Number of days  - Grace *******
                // *******************************************************************
                if (par_leavetype_code == "ML")
                {
                    sum_wp_and_wop = Convert.ToDecimal(db_ats.lv_ledger_hdr_tbl.Where(a=> a.ledger_ctrl_no == par_ledger_ctrl_no && a.leavetype_code == par_leavetype_code).FirstOrDefault().lv_nodays);
                }

                var data               = db_ats.sp_leaveledger_curr_bal(par_empl_id, par_year, par_leavetype_code).FirstOrDefault();
                return JSON(new
                {
                    message = "success"
                    ,dtl_value
                    ,sum_wp_and_wop,
                    data
                }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                var data = db_ats.sp_leaveledger_curr_bal(par_empl_id, par_year, par_leavetype_code).FirstOrDefault();
                string message = e.Message;
                return Json(new { message = message, data }, JsonRequestBehavior.AllowGet);
            }
        }
        //*********************************************************************//
        // Created By   : Lorraine I. Ale 
        // Created Date : 05/05/2021
        // Description  : Initialized during pageload
        //*********************************************************************//
        public ActionResult GetLedgerConrtolNumber()
        {
            try
            {
                db_ats.Database.CommandTimeout = int.MaxValue;

                var new_appl_nbr = db_ats.sp_generate_appl_nbr("lv_ledger_hdr_tbl", 10, "ledger_ctrl_no").ToList();

                return JSON(new
                {
                    message = "success",
                    new_appl_nbr
                }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message;
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }
        //*********************************************************************//
        // Created By   : Vincent Jade H. Alivio
        // Created Date : 05/05/2021
        // Description  : Initialized during pageload
        //*********************************************************************//
        public ActionResult CancelLederPosted(string par_ledger_ctrl_no, string par_leaveledger_date, string par_execute_mode, string par_leave_ctrlno, string par_approval_id)
        {
            try
            {
                db_ats.Database.CommandTimeout = int.MaxValue;

                var approval_status = "L";
                var user_id = Session["user_id"].ToString();
                var data = db_ats.sp_lv_ledger_cancel(par_ledger_ctrl_no, par_leaveledger_date, user_id).FirstOrDefault();

                if (par_execute_mode == "cancel_with_ss")
                {
                    var transac_apprvr = db.sp_update_transaction_in_approvalworkflow_tbl(par_approval_id, user_id, approval_status, "Ledger Post - Cancellation");
                    var apl_hdr = db_ats.leave_application_hdr_tbl.Where(a => a.leave_ctrlno == par_leave_ctrlno).FirstOrDefault();
                    var apl_dtl = db_ats.leave_application_dtl_tbl.Where(a => a.leave_ctrlno == par_leave_ctrlno).ToList();

                    if (apl_hdr != null)
                    {
                        apl_hdr.approval_status = approval_status;
                        apl_hdr.posting_status  = false;
                        db_ats.SaveChanges();
                    }

                    if (apl_dtl != null)
                    {
                        apl_dtl.ForEach(a => a.rcrd_status = approval_status);
                        db_ats.SaveChangesAsync();
                    }
                }
                
                return JSON(new{message = "success", data }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message;
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
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
                string message = e.Message;
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
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

                var query = db_ats.lv_ledger_dtl_tbl.Where(a => a.ledger_ctrl_no == data.ledger_ctrl_no &&
                                                                a.leavetype_code == data.leavetype_code).FirstOrDefault();
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
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
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

                var data_del = db_ats.lv_ledger_dtl_tbl.Where(a => a.ledger_ctrl_no == data.ledger_ctrl_no && a.leavetype_code == data.leavetype_code).FirstOrDefault();
                db_ats.lv_ledger_dtl_tbl.Remove(data_del);
                db_ats.SaveChangesAsync();
                return Json(new { message = "success" }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message.ToString();

                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
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

                data.ledger_ctrl_no                 = data.ledger_ctrl_no;
                data.leavetype_code                 = data.leavetype_code;
                data.leavesubtype_code              = data.leavesubtype_code;
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
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }
        //*********************************************************************//
        // Created By   : Lorraine I. Ale 
        // Created Date : 05/05/2021
        // Description  : Initialized during pageload
        //*********************************************************************//
        public ActionResult LedgerInfoCurr(string par_empl_id, string par_leavetype_code, string par_month, string par_year)
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

                // var data    = db_ats.vw_lv_ledger_info_curr.Where(a => a.empl_id == par_empl_id && a.leavetype_code == par_leavetype_code).FirstOrDefault();
                // var data_sl = db_ats.vw_lv_ledger_info_curr.Where(a => a.empl_id == par_empl_id && a.leavetype_code == "SL").FirstOrDefault();
                // var data_vl = db_ats.vw_lv_ledger_info_curr.Where(a => a.empl_id == par_empl_id && a.leavetype_code == "VL").FirstOrDefault();
                
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
                return JSON(new { message = "success",  bal_as_of ,bal_as_of_sl ,bal_as_of_vl, total_undertime }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                return JSON(new { message = e.Message, bal_as_of, bal_as_of_sl, bal_as_of_vl }, JsonRequestBehavior.AllowGet);
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

                // db_ats.Database.CommandTimeout = int.MaxValue;
                //int month_int   = Convert.ToInt32(dtr_month);
                //int year_int    = Convert.ToInt32(dtr_year);
                // object sp_report = new object();
                // object dtr_gen = new object();
                // var empl_dtr_hdr_tbl_check = db_ats.empl_dtr_dtl_tbl.Where(a => a.empl_id == empl_id && a.dtr_date.Month == month_int && a.dtr_date.Year == year_int).ToList();
                // 
                //icn = "success";
                // if (empl_dtr_hdr_tbl_check.Count <= 0 || par_print_generate == "Generate")
                // {
                //     dtr_gen = db_ats.sp_generate_empl_dtr(dtr_year, dtr_month, empl_id, "0", department_code, employment_type, user_id);
                //     // db_ats.SaveChanges();
                // }

                var par_view_type = "0";
                var session_user_id = Session["user_id"].ToString();
                icn = "success";
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

                return Json(new { message = message, icon = icn }, JsonRequestBehavior.AllowGet);
            }
        }
        //*********************************************************************//
        // Created By   : Vincent Jade H. Alivio
        // Created Date : 2021-08-04
        // Description  : Get the Approval ID on Applicaiton using Leave 
        //                Application Ctrl Number, purpose for saving
        //*********************************************************************//
        public ActionResult GetApproval_ID_Appl(string par_leave_ctrlno)
        {
            try
            {
                db_ats.Database.CommandTimeout = int.MaxValue;

                var approval_id = db_ats.leave_application_hdr_tbl.Where(a => a.leave_ctrlno == par_leave_ctrlno).FirstOrDefault().approval_id;
                return JSON(new { message = "success", approval_id }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message;
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }
        //*********************************************************************//
        // Created By   : Vincent Jade H. Alivio
        // Created Date : 2021-08-17
        // Description  : Particulars
        //*********************************************************************//
        public ActionResult RetrieveEmployeeUnderTime(string par_empl_id, string par_month, string par_year)
        {
            try
            {
                db_ats.Database.CommandTimeout = int.MaxValue;

                var total_undertime = db_ats.sp_leaveledger_empl_undertime(par_empl_id, par_month, par_year).ToList();
                return JSON(new { message = "success", total_undertime }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message;
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
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

                var message_descr = "";
                var leave_appl_dtl = db_ats.leave_application_dtl_tbl.Where(a=> a.empl_id == data.empl_id && a.leave_ctrlno == data.leave_ctrlno).ToList();

                if (data.leavetype_code == "SL")   // Sick Leave
                {
                    if (leave_appl_dtl != null)
                    {
                        for (int i = 0; i < leave_appl_dtl.Count; i++)
                        {
                            if (leave_appl_dtl[i].leave_date_from > data.date_applied ||
                                leave_appl_dtl[i].leave_date_to > data.date_applied)
                            {
                                message_descr = "Date Applied: " + data.date_applied.ToString() + "\n Application Nbr.: " + leave_appl_dtl[i].leave_ctrlno + "\n Date Application from :" + leave_appl_dtl[i].leave_date_from.ToString("yyyy-MM-dd") + "\n Date Application to: " + leave_appl_dtl[i].leave_date_to.ToString("yyyy-MM-dd");
                            }
                        }
                    }
                }
                return JSON(new {leave_appl_dtl, message_descr }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message;
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }

        //*********************************************************************//
        // Created By   : Vincent Jade H. Alivio
        // Created Date : 2021-08-17
        // Description  : Particulars
        //*********************************************************************//
        public ActionResult ApprovalHistory(string par_leave_ctlno)
        {
            //try
            //{
            //    db_ats.Database.CommandTimeout = int.MaxValue;

            //    var message_descr = "success";
            //    var leave_appl      = db_ats.leave_application_hdr_tbl.Where(a => a.leave_ctrlno == par_leave_ctlno).ToList().FirstOrDefault();
            //    var par_approval_id = leave_appl.approval_id;
            //    var data = db.vw_approvalworkflow_tbl.Where(a => a.transaction_code == "002" && a.approval_id == par_approval_id).FirstOrDefault();

            //    return JSON(new { data, message_descr, leave_appl }, JsonRequestBehavior.AllowGet);
            //}
            //catch (Exception e)
            //{
            //    string message = e.Message;
            //    return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            //}
            try
            {
                db_ats.Database.CommandTimeout = int.MaxValue;

                var message_descr = "success";

                leave_application_hdr_tbl leave_appl = new leave_application_hdr_tbl();
                vw_approvalworkflow_tbl data = new vw_approvalworkflow_tbl();
                leave_appl = db_ats.leave_application_hdr_tbl.Where(a => a.leave_ctrlno == par_leave_ctlno).ToList().FirstOrDefault();
                if (leave_appl != null) 
                {
                    var par_approval_id = leave_appl.approval_id;
                    data = db.vw_approvalworkflow_tbl.Where(a => a.transaction_code == "002" && a.approval_id == par_approval_id).FirstOrDefault();
                }

                lv_ledger_hdr_tbl lv_hdr = new lv_ledger_hdr_tbl();
                vw_approvalworkflow_tbl data_posting = new vw_approvalworkflow_tbl();

                lv_hdr = db_ats.lv_ledger_hdr_tbl.Where(b => b.leave_ctrlno == par_leave_ctlno).FirstOrDefault();
                if (lv_hdr != null) 
                { 
                    var par_approval_id_posting = lv_hdr.approval_id;
                    data_posting = db.vw_approvalworkflow_tbl.Where(a => a.approval_id == par_approval_id_posting).FirstOrDefault();
                }

                return JSON(new { data, message_descr, leave_appl, data_posting, lv_hdr }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message;
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }


        //*********************************************************************//
        // Created By   : Lorraine I. Ale 
        // Created Date : 04/03/2020
        // Description  : Filter Page Grid
        //*********************************************************************//
        public ActionResult ApprReviewerAction(leave_application_hdr_tbl data)
        {
            try
            {
                db_ats.Database.CommandTimeout = int.MaxValue;

                var transac_apprvr = db.sp_update_transaction_in_approvalworkflow_tbl(data.approval_id, Session["user_id"].ToString(), data.approval_status, data.details_remarks);

                var query = db_ats.leave_application_hdr_tbl.Where(a =>
                    a.leave_ctrlno          == data.leave_ctrlno).FirstOrDefault();
                    query.approval_status   = data.approval_status;
                    query.details_remarks   = data.details_remarks;
                    query.updated_by_user   = Session["user_id"].ToString();
                    query.updated_dttm      = DateTime.Now;

                var query2 = db_ats.leave_application_dtl_tbl.Where(a => a.leave_ctrlno == data.leave_ctrlno).ToList();
                query2.ForEach(a => a.rcrd_status = data.approval_status);

                db_ats.SaveChangesAsync();
                return JSON(new { message_descr = "success" }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message;
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

                var query = db_ats.lv_ledger_hdr_tbl.Where(a => a.ledger_ctrl_no == data.ledger_ctrl_no).FirstOrDefault();
                query.updated_dttm = DateTime.Now;
                query.updated_by_user = Session["user_id"].ToString();
                
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

                query.approval_status            = "S";
                
                var query2 = db_ats.lv_ledger_dtl_tbl.Where(a => a.ledger_ctrl_no == data.ledger_ctrl_no && 
                                                                a.leavetype_code == data.leavetype_code).FirstOrDefault();

                query2.leavesubtype_code = data.leavesubtype_code;

                db_ats.SaveChanges();

                // **************************************************************
                // **** Description  : Update on Details ************************
                // **** Date Updated : 2021-05-25 *******************************
                // **************************************************************
                if (data.leaveledger_entry_type == "2" || data.leaveledger_entry_type == "1") // Leave Application
                {
                    // var data_dtl = db_ats.sp_save_lv_ledger_dtl_tbl(new_appl_nbr[0], p_empl_id, p_leavetype_code, p_leavesubtype_code, p_leaveledger_date, p_lv_nodays).ToString();
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
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }

        //*********************************************************************//
        // Created By   : Vincent Jade H. Alivio
        // Created Date : 2022-04-12
        // Description  : Retrieve Time Schedule List
        //*********************************************************************//
        public ActionResult TimeSked_HDR(string par_empl_id)
        {
            try
            {
                db_ats.Database.CommandTimeout = int.MaxValue;

                var data = db_ats.sp_time_schedule_empl_hdr_tbl(par_empl_id).ToList();
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
                                        ,string par_month
                                        ,string par_year
                                        ,DateTime par_effective_date
                                        )
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
    }

}