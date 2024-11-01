﻿using HRIS_eAATS.Models;
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
    public class cLeaveTransmittalController : Controller
    {
        HRIS_DEVEntities db = new HRIS_DEVEntities();
        HRIS_ATSEntities db_ats = new HRIS_ATSEntities();
        HRIS_TRKEntities db_trk = new HRIS_TRKEntities();
        User_Menu um = new User_Menu();
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
            um.menu_name            = Session["menu_name"].ToString();
            um.page_title           = Session["page_title"].ToString();
            um.url_name             = Session["url_name"].ToString();
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
                var log_empl_id                 = Session["empl_id"].ToString();
                var lv_admin_dept_list          = db_ats.vw_leaveadmin_tbl_list.Where(a => a.empl_id == log_empl_id).OrderBy(a => a.department_code);
                var leave_transmittal_type_tbl  = db_ats.leave_transmittal_type_tbl.ToList().OrderBy(a=> a.transmittal_type_descr);
                //var data                        = db_ats.sp_transmittal_leave_hdr_tbl_list(DateTime.Now.Year.ToString(), DateTime.Now.Month.ToString()).Where(a => a.route_nbr != "06" && a.doc_status_descr == "New").Where(a => a.created_by_empl_id.Replace("U", "") == log_empl_id).ToList();
                List<sp_transmittal_leave_hdr_tbl_list_Result> data = new List<sp_transmittal_leave_hdr_tbl_list_Result>();
                if (log_empl_id == "8314")
                {
                    data = db_ats.sp_transmittal_leave_hdr_tbl_list(DateTime.Now.Year.ToString(), DateTime.Now.Month.ToString()).Where(a => a.route_nbr != "06" && a.doc_status_descr == "New").ToList();
                }
                else
                {
                    data = db_ats.sp_transmittal_leave_hdr_tbl_list(DateTime.Now.Year.ToString(), DateTime.Now.Month.ToString()).Where(a => a.route_nbr != "06" && a.doc_status_descr == "New").Where(a => a.created_by_empl_id.Replace("U", "") == log_empl_id).ToList();
                }
                return JSON(new { message = "success", um,lv_admin_dept_list,data,leave_transmittal_type_tbl}, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message.ToString();
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }
        //*********************************************************************//
        // Created By   : Vincent Jade H. Alivio
        // Created Date : 2022-05-24
        // Description  : Initialized during pageload
        //*********************************************************************//
        public ActionResult RetrieveTransmittal_HDR(int created_year, int created_month, string daily_monthly, string doc_status_descr)
        {
            try
            {
                var log_empl_id = Session["empl_id"].ToString().Trim();
                //var data = db_ats.sp_transmittal_leave_hdr_tbl_list(created_year.ToString(), created_month.ToString()).Where(a=> a.created_by_empl_id.Replace("U","") == log_empl_id).ToList();
                List<sp_transmittal_leave_hdr_tbl_list_Result> data = new List<sp_transmittal_leave_hdr_tbl_list_Result>();
                if (log_empl_id == "8314")
                {
                    data = db_ats.sp_transmittal_leave_hdr_tbl_list(created_year.ToString(), created_month.ToString()).ToList();
                }
                else
                {
                    data = db_ats.sp_transmittal_leave_hdr_tbl_list(created_year.ToString(), created_month.ToString()).Where(a => a.created_by_empl_id.Replace("U", "") == log_empl_id).ToList();
                }

                if (daily_monthly == "daily")
                {
                    data = data.Where(a => a.route_nbr != "06").ToList();
                }
                else if (daily_monthly == "monthly")
                {
                    data = data.Where(a => a.route_nbr == "06").ToList();
                }

                if (doc_status_descr.ToString().Trim() != "All")
                {
                    data = data.Where(a=> a.doc_status_descr == doc_status_descr.ToString().Trim()).ToList();
                }

                return JSON(new { message = "success", data }, JsonRequestBehavior.AllowGet);
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
        public ActionResult RetrieveTransmittal_DTL(string par_doc_ctrl_nbr, DateTime par_approved_period_from, DateTime par_approved_period_to, string par_department_code, string par_employment_type, string par_view_mode, string transmittal_class)
        {
            try
            {
                var hdr = db_ats.transmittal_leave_hdr_tbl.Where(a => a.doc_ctrl_nbr == par_doc_ctrl_nbr && (a.doc_status == "N" || a.doc_status == "T")).ToList().FirstOrDefault();

                if (hdr != null)
                {
                    if (transmittal_class.ToString().Trim() == "daily" )
                    {
                        var data = db_ats.sp_transmittal_leave_dtl_tbl_list(par_doc_ctrl_nbr, par_approved_period_from, par_approved_period_to, par_department_code, par_employment_type, par_view_mode, Session["user_id"].ToString()).ToList().OrderByDescending(a => a.transmitted_flag);
                        return JSON(new { message = "success", data }, JsonRequestBehavior.AllowGet);
                    }
                    else
                    {
                        var data = db_ats.sp_transmittal_leave_dtl_monthly_tbl_list(par_doc_ctrl_nbr, par_approved_period_from, par_approved_period_to, par_department_code, par_employment_type, par_view_mode).ToList().OrderByDescending(a => a.transmitted_flag);
                        return JSON(new { message = "success", data }, JsonRequestBehavior.AllowGet);
                    }

                }
                else
                {
                    if (transmittal_class.ToString().Trim() == "daily")
                    {
                        var data = db_ats.sp_transmittal_leave_dtl_tbl_list(par_doc_ctrl_nbr, par_approved_period_from, par_approved_period_to, par_department_code, par_employment_type, par_view_mode, Session["user_id"].ToString()).Where(a => a.transmitted_flag == "Y").ToList().OrderByDescending(a => a.transmitted_flag);
                        return JSON(new { message = "success", data }, JsonRequestBehavior.AllowGet);
                    }
                    else
                    {
                        var data = db_ats.sp_transmittal_leave_dtl_monthly_tbl_list(par_doc_ctrl_nbr, par_approved_period_from, par_approved_period_to, par_department_code, par_employment_type, par_view_mode).Where(a => a.transmitted_flag == "Y").ToList().OrderByDescending(a => a.transmitted_flag);
                        return JSON(new { message = "success", data }, JsonRequestBehavior.AllowGet);
                    }
                }
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
        //*********************************************************************//
        // Created By   : Vincent Jade H. Alivio 
        // Created Date : 01/13/2020
        // Description  : Add new record to leave sub-type table
        //*********************************************************************//
        public ActionResult Save(transmittal_leave_hdr_tbl data)
        {
            try
            {
                var message = "";
                List<transmittal_leave_dtl_tbl> data_dtl = new List<transmittal_leave_dtl_tbl>();

                var nxt_ctrl_nbr            = db_ats.sp_generate_key("transmittal_leave_hdr_tbl", "doc_ctrl_nbr", 12).ToList().FirstOrDefault();
                data.doc_ctrl_nbr           = "LV-" + nxt_ctrl_nbr.key_value.ToString();
                data.approved_period_from   = data.approved_period_from;
                data.approved_period_to     = data.approved_period_to;
                data.created_by             = Session["user_id"].ToString();
                data.created_dttm           = DateTime.Now;
                data.department_code        = data.department_code;
                data.employment_tyep        = data.employment_tyep;
                data.view_mode              = data.view_mode;
                data.route_nbr              = data.route_nbr;
                data.is_legis               = data.is_legis;
                data.route_to_legis         = data.route_to_legis;

                if (data.route_nbr.ToString().Trim() != "06")
                {
                    var data_dtl_insert = db_ats.sp_transmittal_leave_dtl_tbl_list("", data.approved_period_from, data.approved_period_to, data.department_code, data.employment_tyep, data.view_mode, Session["user_id"].ToString()).ToList();
                    if (data_dtl_insert.Count > 0)
                    {
                        // ----- ROUTE NBRS
                        // 01 =  1-10  days
                        // 02 =  11-30 days
                        // 03 =  31-60 days
                        // 04 =  61 up and Other Types of Leave
                        // 05 =  All VGO Employees
                        // 06 =  Release to Payroll 
                        // 07 =  All SPO Employees
                        // 08 =  Terminal Leave
                        // 09 =  Study leave
                        // 10 =  Maternity Leave
                        // 11 =  Monetization Leave
                        // 12 =  Travel Abroad
                        // 13 =  Adoption Leave
                        // 14 =  Rehabilitation Privilege
                        // 15 =  Magna Carta for Women
                        // 16 =  10-Day VAWC Leave
                        // 17 =  Governor to DILG/PGO
                        // 18 =  Vice-Governor to Governor
                        // 19 =  Other (Special Case)

                        // ------ VIEW MODE
                        // 1 = Both Leave and CTO
                        // 2 = Leave Only
                        // 3 = CTO Only
                        
                        if (data.view_mode == "2")
                        {
                            if (data.route_nbr == "01")
                            {
                                data_dtl_insert = data_dtl_insert.Where(a=> a.lv_nodays <= 10 &&  (a.leavetype_code != "TL"
                                                                                                || a.leavetype_code != "STL"
                                                                                                || a.leavetype_code != "ML"
                                                                                                || a.leavetype_code != "MZ"
                                                                                                || a.leavetype_code != "AL"
                                                                                                || a.leavetype_code != "RH"
                                                                                                || a.leavetype_code != "MC"
                                                                                                || a.leavetype_code != "VWC"
                                                                                                  )).ToList();
                            }
                            else if (data.route_nbr == "02")
                            {
                                data_dtl_insert = data_dtl_insert.Where(a => a.lv_nodays > 10 && a.lv_nodays <=30).ToList();
                            }
                            else if (data.route_nbr == "03")
                            {
                                data_dtl_insert = data_dtl_insert.Where(a => a.lv_nodays >= 31 && a.lv_nodays <= 60).ToList();
                            }
                            else if (data.route_nbr == "04")
                            {
                                data_dtl_insert =  data_dtl_insert.Where(a => a.lv_nodays >= 61).ToList();
                            }
                            else if (data.route_nbr == "05")
                            {
                                data_dtl_insert = data_dtl_insert.Where(a => a.department_code == "18").ToList();
                            }
                            else if (data.route_nbr == "07")
                            {
                                data_dtl_insert = data_dtl_insert.Where(a => a.department_code == "19").ToList();
                            }
                            else if (data.route_nbr == "08")
                            {
                                data_dtl_insert = data_dtl_insert.Where(a => a.leavetype_code == "TL").ToList();
                            }
                            else if (data.route_nbr == "09")
                            {
                                data_dtl_insert = data_dtl_insert.Where(a => a.leavetype_code == "STL").ToList();
                            }
                            else if (data.route_nbr == "10")
                            {
                                data_dtl_insert = data_dtl_insert.Where(a => a.leavetype_code == "ML").ToList();
                            }
                            else if (data.route_nbr == "11")
                            {
                                // Monetization (50%)
                                data_dtl_insert = data_dtl_insert.Where(a => a.leavetype_code == "MZ" && a.mone_type == "50%").ToList();
                            }
                            else if (data.route_nbr == "20")
                            {
                                // Monetization (1-10 days)
                                data_dtl_insert = data_dtl_insert.Where(a => a.leavetype_code == "MZ" && a.mone_type != "50%" && a.nbr_mone >= 1 && a.nbr_mone <= 10).ToList();
                            }
                            else if (data.route_nbr == "21")
                            {
                                // Monetization (11-up days)
                                data_dtl_insert = data_dtl_insert.Where(a => a.leavetype_code == "MZ" && a.mone_type != "50%" && a.nbr_mone >= 11).ToList();
                            }
                            else if (data.route_nbr == "12")
                            {
                                data_dtl_insert = data_dtl_insert.Where(a => a.leave_class == 1).ToList();
                            }
                            else if (data.route_nbr == "13")
                            {
                                data_dtl_insert = data_dtl_insert.Where(a => a.leavetype_code == "AL").ToList();
                            }
                            else if (data.route_nbr == "14")
                            {
                                data_dtl_insert = data_dtl_insert.Where(a => a.leavetype_code == "RH").ToList();
                            }
                            else if (data.route_nbr == "15")
                            {
                                data_dtl_insert = data_dtl_insert.Where(a => a.leavetype_code == "MC").ToList();
                            }
                            else if (data.route_nbr == "16")
                            {
                                data_dtl_insert = data_dtl_insert.Where(a => a.leavetype_code == "VWC").ToList();
                            }
                            else if (data.route_nbr == "17")
                            {
                                var gov_empl_id = db.departments_tbl.Where(a=> a.department_code == "01").OrderByDescending(a=> a.effective_date).FirstOrDefault().empl_id;
                                data_dtl_insert = data_dtl_insert.Where(a => a.empl_id == gov_empl_id).ToList();
                            }
                            else if (data.route_nbr == "18")
                            {
                                var vice_gov_empl_id = db.departments_tbl.Where(a => a.department_code == "18").OrderByDescending(a => a.effective_date).FirstOrDefault().empl_id;
                                data_dtl_insert = data_dtl_insert.Where(a => a.empl_id == vice_gov_empl_id).ToList();
                            }
                            else if (data.route_nbr == "19")
                            {
                                data_dtl_insert = data_dtl_insert.ToList();
                            }
                        }

                        if (data_dtl_insert.Count > 0)
                        {
                            for (int i = 0; i < data_dtl_insert.Count; i++)
                            {
                                transmittal_leave_dtl_tbl dta1 = new transmittal_leave_dtl_tbl();

                                dta1.doc_ctrl_nbr       = "LV-" + nxt_ctrl_nbr.key_value.ToString();
                                dta1.ledger_ctrl_no     = data_dtl_insert[i].ledger_ctrl_no.ToString().Trim();
                                dta1.created_by         = Session["user_id"].ToString();
                                dta1.created_dttm       = DateTime.Now;
                                dta1.route_nbr          = data.route_nbr;
                                dta1.leave_ctrlno       = data_dtl_insert[i].leave_ctrlno.ToString().Trim();
                                data_dtl.Add(dta1);

                                // *************************************************************
                                // **** VJA - 2023-06-01 -- Insert Leave Ledger History ********
                                // *************************************************************
                                var appl_status = "Create Transmittal for Signature";
                                db_ats.sp_lv_ledger_history_insert(data_dtl_insert[i].ledger_ctrl_no.ToString().Trim(), data_dtl_insert[i].leave_ctrlno.ToString().Trim(), data_dtl_insert[i].empl_id.ToString().Trim(), appl_status, "", Session["user_id"].ToString());
                                // *************************************************************
                                // **** VJA - 2023-06-01 -- Insert Leave Ledger History ********
                                // *************************************************************

                            }
                            db_ats.transmittal_leave_hdr_tbl.Add(data);
                            db_ats.transmittal_leave_dtl_tbl.AddRange(data_dtl);
                            db_ats.SaveChangesAsync();
                            message = "success";
                        }
                        else
                        {
                            message = "No Data Found!";
                        }
                    }
                    else
                    {
                        message = "No Data Found!";
                    }
                }
                else
                {
                    var data_dtl_insert = db_ats.sp_transmittal_leave_dtl_monthly_tbl_list("", data.approved_period_from, data.approved_period_to, data.department_code, data.employment_tyep, data.view_mode).ToList();
                    if (data_dtl_insert.Count > 0)
                    {
                        for (int i = 0; i < data_dtl_insert.Count; i++)
                        {
                            transmittal_leave_dtl_tbl dta1 = new transmittal_leave_dtl_tbl();

                            dta1.doc_ctrl_nbr       = "LV-" + nxt_ctrl_nbr.key_value.ToString();
                            dta1.ledger_ctrl_no     = data_dtl_insert[i].ledger_ctrl_no.ToString().Trim();
                            dta1.created_by         = Session["user_id"].ToString();
                            dta1.created_dttm       = DateTime.Now;
                            dta1.route_nbr          = data.route_nbr;
                            dta1.leave_ctrlno       = data_dtl_insert[i].leave_ctrlno.ToString().Trim();
                            data_dtl.Add(dta1);

                            // *************************************************************
                            // **** VJA - 2023-06-01 -- Insert Leave Ledger History ********
                            // *************************************************************
                            var appl_status = "Create Monthly Transmittal for Payroll";
                            db_ats.sp_lv_ledger_history_insert(data_dtl_insert[i].ledger_ctrl_no.ToString().Trim(), data_dtl_insert[i].leave_ctrlno.ToString().Trim(), data_dtl_insert[i].empl_id.ToString().Trim(), appl_status, "", Session["user_id"].ToString());
                            // *************************************************************
                            // **** VJA - 2023-06-01 -- Insert Leave Ledger History ********
                            // *************************************************************

                        }
                        db_ats.transmittal_leave_hdr_tbl.Add(data);
                        db_ats.transmittal_leave_dtl_tbl.AddRange(data_dtl);
                        db_ats.SaveChangesAsync();
                        message = "success";
                    }
                    else
                    {
                        message = "No Data Found!";
                    }
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
        // Created By   : Vincent Jade H. Alivio 
        // Created Date : 01/13/2020
        // Description  : Edit existing record from leave sub-type table
        //*********************************************************************//
        public ActionResult SaveEdit(transmittal_leave_hdr_tbl data)
        {
            try
            {
                var od = db_ats.transmittal_leave_hdr_tbl.Where(a => a.doc_ctrl_nbr == data.doc_ctrl_nbr).FirstOrDefault();

                od.transmittal_descr        = data.transmittal_descr;
                od.approved_period_from     = data.approved_period_from;
                od.approved_period_to       = data.approved_period_to;
                od.updated_by               = Session["user_id"].ToString();
                od.updated_dttm             = DateTime.Now;
                od.doc_status               = data.doc_status;
                od.route_nbr                = data.route_nbr;
                od.department_code          = data.department_code;
                od.employment_tyep          = data.employment_tyep;
                od.view_mode                = data.view_mode;
                od.is_legis                 = data.is_legis;
                od.route_to_legis           = data.route_to_legis;

                var od_dtl = db_ats.transmittal_leave_dtl_tbl.Where(a => a.doc_ctrl_nbr == data.doc_ctrl_nbr).ToList();
                od_dtl.ForEach(a => a.route_nbr = data.route_nbr);

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
        // Created Date : 01/13/2020
        // Description  : delete from leave sub-type table
        //*********************************************************************//
        public ActionResult Delete(string par_doc_ctrl_nbr)
        {
            try
            {
                string message = "";
                var od = db_ats.transmittal_leave_hdr_tbl.Where(a => a.doc_ctrl_nbr == par_doc_ctrl_nbr).FirstOrDefault();
                var od2 = db_ats.transmittal_leave_dtl_tbl.Where(a => a.doc_ctrl_nbr == par_doc_ctrl_nbr).ToList();

                if (od != null)
                {
                    db_ats.transmittal_leave_hdr_tbl.Remove(od);

                    if (od2 != null)
                    {
                        db_ats.transmittal_leave_dtl_tbl.RemoveRange(od2);
                    }
                    db_ats.SaveChanges();
                    message = "success";
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
        // Created By   : Vincent Jade H. Alivio 
        // Created Date : 01/13/2020
        // Description  : Add new record to leave sub-type table
        //*********************************************************************//
        public ActionResult Save_dtl(transmittal_leave_dtl_tbl data, string par_transmitted_flag, string leave_ctrlno, string empl_id)
        {
            try
            {
                if (par_transmitted_flag == "N")
                {
                    db_ats.transmittal_leave_dtl_tbl.Add(data);
                    data.created_by         = Session["user_id"].ToString();
                    data.created_dttm       = DateTime.Now;
                    data.route_nbr          = data.route_nbr;
                    data.leave_ctrlno       =  data.leave_ctrlno;
                    db_ats.SaveChangesAsync();
                }
                else if (par_transmitted_flag == "Y")
                {
                    var od2 = db_ats.transmittal_leave_dtl_tbl.Where(a => a.doc_ctrl_nbr == data.doc_ctrl_nbr && a.ledger_ctrl_no == data.ledger_ctrl_no).FirstOrDefault();
                    if (od2 != null)
                    {
                        db_ats.transmittal_leave_dtl_tbl.Remove(od2);
                    }
                    db_ats.SaveChanges();
                }

                // *************************************************************
                // **** VJA - 2023-06-01 -- Insert Leave Ledger History ********
                // *************************************************************
                var appl_status = "Create Transmittal for Signature";
                db_ats.sp_lv_ledger_history_insert(data.ledger_ctrl_no.ToString().Trim(), leave_ctrlno, empl_id, appl_status, "", Session["user_id"].ToString());
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

        public ActionResult RetriveTransmittalInfo(string par_doc_ctrl_nbr, string route_nbr)
        {
            try
            {
                if (par_doc_ctrl_nbr.Length >= 15)
                {
                    if (route_nbr.ToString().Trim() != "06")
                    {
                        var data            = db_ats.transmittal_leave_hdr_tbl.Where(a => a.doc_ctrl_nbr == par_doc_ctrl_nbr).ToList().FirstOrDefault();
                        var data_dtl        = db_ats.sp_transmittal_leave_dtl_tbl_list(par_doc_ctrl_nbr, data.approved_period_from, data.approved_period_to, "", "", "", Session["user_id"].ToString()).Where(a => a.doc_ctrl_nbr == par_doc_ctrl_nbr && a.transmitted_flag == "Y").ToList();
                        var data_history    = db_trk.sp_edocument_trk_tbl_history(par_doc_ctrl_nbr, "LV").ToList();

                        return Json(new
                        {
                            data_dtl,
                            data,
                            data_history,
                            message = "success"
                        }, JsonRequestBehavior.AllowGet);

                    }
                    else
                    {
                        var data            = db_ats.transmittal_leave_hdr_tbl.Where(a => a.doc_ctrl_nbr == par_doc_ctrl_nbr).ToList().FirstOrDefault();
                        var data_dtl        = db_ats.sp_transmittal_leave_dtl_monthly_tbl_list(par_doc_ctrl_nbr, data.approved_period_from, data.approved_period_to, "", "", "").Where(a => a.doc_ctrl_nbr == par_doc_ctrl_nbr && a.transmitted_flag == "Y").ToList();
                        var data_history    = db_trk.sp_edocument_trk_tbl_history(par_doc_ctrl_nbr, "LV").ToList();

                        return Json(new
                        {
                            data_dtl,
                            data,
                            data_history,
                            message = "success"
                        }, JsonRequestBehavior.AllowGet);
                    }

                }
                return Json(new { message = "success" }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message.ToString();
                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
        }

        public ActionResult ReleaseReceive(edocument_trk_tbl data, transmittal_leave_hdr_tbl data_hdr)
        {
            try
            {
                var message = "";
                var message_descr = "";
                var message_descr1 = "";
                var nxt_route_seq = 0;

                var route_seq = db_trk.edocument_trk_tbl.Where(a => a.doc_ctrl_nbr == data.doc_ctrl_nbr).ToList().OrderByDescending(a => a.route_seq).FirstOrDefault();

                if (route_seq != null)
                {
                    nxt_route_seq = route_seq.route_seq + 1;
                }
                else
                {
                    nxt_route_seq = 1;
                }

                // **** UPDATE TRANSMITTAL HEADER
                var upd         = db_ats.transmittal_leave_hdr_tbl.Where(a => a.doc_ctrl_nbr == data.doc_ctrl_nbr).FirstOrDefault();
                upd.doc_status  = data_hdr.doc_status;

                var upd_dtl = db_ats.transmittal_leave_dtl_tbl.Where(a => a.doc_ctrl_nbr == data.doc_ctrl_nbr).ToList();
                if (data.document_status == "V")
                {
                    upd_dtl.ForEach(a => a.received_by      = Session["user_id"].ToString());
                    upd_dtl.ForEach(a => a.received_dttm    = DateTime.Now);

                    data.doc_ctrl_nbr       = data.doc_ctrl_nbr;
                    data.route_seq          = nxt_route_seq;
                    data.department_code    = "00";
                    data.vlt_dept_code      = "01";
                    data.doc_dttm           = DateTime.Now;
                    data.doc_remarks        = data.doc_remarks;
                    data.document_status    = data.document_status;
                    data.doc_user_id        = Session["user_id"].ToString();

                    db_trk.edocument_trk_tbl.Add(data);
                    db_trk.SaveChangesAsync();

                    for (int i = 0; i < upd_dtl.Count; i++)
                    {
                        // *************************************************************
                        // **** VJA - 2023-06-01 -- Insert Leave Ledger History ********
                        // *************************************************************
                        var appl_status = "Transmitted for Signature (Received)";
                        db_ats.sp_lv_ledger_history_insert(upd_dtl[i].ledger_ctrl_no.ToString().Trim(), upd_dtl[i].leave_ctrlno, "", appl_status, "", Session["user_id"].ToString());
                        // *************************************************************
                        // **** VJA - 2023-06-01 -- Insert Leave Ledger History ********
                        // *************************************************************
                    }

                    message_descr   = "Successfully Received!";
                    message_descr1  = "This Record is Successfully Received!";
                }
                else if (data.document_status == "L")
                {
                    data.doc_ctrl_nbr       = data.doc_ctrl_nbr;
                    data.route_seq          = nxt_route_seq;
                    data.department_code    = "00";
                    data.vlt_dept_code      = (data_hdr.route_nbr.ToString().Trim() == "06" ? "06" :"01");
                    data.doc_dttm           = DateTime.Now;
                    //data.doc_remarks        = data.doc_remarks;
                    data.doc_remarks        = (data_hdr.route_nbr.ToString().Trim() == "06" ? "Transmitted for Payroll" : "Transmitted for Signature (Released)");
                    data.document_status    = data.document_status;
                    data.doc_user_id        = Session["user_id"].ToString();

                    db_trk.edocument_trk_tbl.Add(data);
                    db_trk.SaveChangesAsync();
                    
                    for (int i = 0; i < upd_dtl.Count; i++)
                    {
                        // *************************************************************
                        // **** VJA - 2023-06-01 -- Insert Leave Ledger History ********
                        // *************************************************************
                        var appl_status = (data_hdr.route_nbr.ToString().Trim() == "06" ? "Transmitted for Payroll" : "Transmitted for Signature (Released)");
                        db_ats.sp_lv_ledger_history_insert(upd_dtl[i].ledger_ctrl_no.ToString().Trim(), upd_dtl[i].leave_ctrlno,"", appl_status, "", Session["user_id"].ToString());
                        // *************************************************************
                        // **** VJA - 2023-06-01 -- Insert Leave Ledger History ********
                        // *************************************************************
                    }

                    message_descr = "Successfully Released!";
                    message_descr1 = "This Record is Successfully Released!";
                }

                db_ats.SaveChangesAsync();
                message = "success";

                return Json(new { message, message_descr, message_descr1, data_hdr }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message.ToString();
                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
        }
        //*********************************************************************//
        // Created By   : Vincent Jade H. Alivio 
        // Created Date : 01/13/2020
        // Description  : Add new record to leave sub-type table
        //*********************************************************************//
        public ActionResult SaveDtlRemarks(transmittal_leave_dtl_tbl row)
        {
            try
            {
                var upd = db_ats.transmittal_leave_dtl_tbl.Where(a => a.doc_ctrl_nbr == row.doc_ctrl_nbr && a.ledger_ctrl_no == row.ledger_ctrl_no).FirstOrDefault();
                upd.doc_remarks = row.doc_remarks;
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