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
                var um = GetAllowAccess();
                var log_empl_id         = Session["empl_id"].ToString();
                //var leaveType           = db_ats.sp_leavetype_tbl_list().ToList();
                //var leaveSubType        = db_ats.sp_leavesubtype_tbl_list("").ToList();
                var lv_admin_dept_list  = db_ats.vw_leaveadmin_tbl_list.Where(a => a.empl_id == log_empl_id).OrderBy(a => a.department_code);

                //var ledgerposting_for_approval_list = db_ats.sp_ledgerposting_for_approval_list(Session["user_id"].ToString(), "N").ToList();

                var data = db_ats.sp_transmittal_leave_hdr_tbl_list().Where(a => DateTime.Parse(a.created_dttm.ToString()).Year == DateTime.Now.Year && DateTime.Parse(a.created_dttm.ToString()).Month == DateTime.Now.Month && a.route_nbr != "06").ToList();
                return JSON(new { message = "success", um
                    //, leaveType, leaveSubType
                    // , ledgerposting_for_approval_list
                    , lv_admin_dept_list
                    ,data
                }, JsonRequestBehavior.AllowGet);
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
        public ActionResult RetrieveTransmittal_HDR(int created_year, int created_month, string daily_monthly)
        {
            try
            {
                var data = db_ats.sp_transmittal_leave_hdr_tbl_list().Where(a => DateTime.Parse(a.created_dttm.ToString()).Year == created_year && DateTime.Parse(a.created_dttm.ToString()).Month == created_month).ToList();

                if (daily_monthly == "daily")
                {
                    data = db_ats.sp_transmittal_leave_hdr_tbl_list().Where(a => DateTime.Parse(a.created_dttm.ToString()).Year == created_year && DateTime.Parse(a.created_dttm.ToString()).Month == created_month && a.route_nbr != "06").ToList();
                }
                else if (daily_monthly == "monthly")
                {
                    data = db_ats.sp_transmittal_leave_hdr_tbl_list().Where(a => DateTime.Parse(a.created_dttm.ToString()).Year == created_year && DateTime.Parse(a.created_dttm.ToString()).Month == created_month && a.route_nbr == "06").ToList();
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
        public ActionResult RetrieveTransmittal_DTL(string par_doc_ctrl_nbr, DateTime par_approved_period_from, DateTime par_approved_period_to, string par_department_code, string par_employment_type, string par_view_mode)
        {
            try
            {
                var hdr = db_ats.transmittal_leave_hdr_tbl.Where(a => a.doc_ctrl_nbr == par_doc_ctrl_nbr && (a.doc_status == "N" || a.doc_status == "T")).ToList().FirstOrDefault();

                if (hdr != null)
                {
                    //if (par_department_code.ToString().Trim() == "" || par_department_code == null)
                    //{
                    var data = db_ats.sp_transmittal_leave_dtl_tbl_list(par_doc_ctrl_nbr, par_approved_period_from, par_approved_period_to, par_department_code, par_employment_type, par_view_mode).ToList().OrderByDescending(a => a.transmitted_flag);
                    return JSON(new { message = "success", data }, JsonRequestBehavior.AllowGet);
                    //}
                    //else
                    //{
                    //    var data = db_ats.sp_transmittal_leave_dtl_tbl_list(par_doc_ctrl_nbr, par_approved_period_from, par_approved_period_to).Where(a => a.department_code == par_department_code).ToList().OrderByDescending(a => a.transmitted_flag);
                    //    return JSON(new { message = "success", data }, JsonRequestBehavior.AllowGet);
                    //}

                }
                else
                {
                    var data = db_ats.sp_transmittal_leave_dtl_tbl_list(par_doc_ctrl_nbr, par_approved_period_from, par_approved_period_to, par_department_code, par_employment_type, par_view_mode).Where(a => a.transmitted_flag == "Y").ToList().OrderByDescending(a => a.transmitted_flag);
                    return JSON(new { message = "success", data }, JsonRequestBehavior.AllowGet);
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
                List<transmittal_leave_dtl_tbl> data_dtl = new List<transmittal_leave_dtl_tbl>();

                var nxt_ctrl_nbr = db_ats.sp_generate_key("transmittal_leave_hdr_tbl", "doc_ctrl_nbr", 12).ToList().FirstOrDefault();
                data.doc_ctrl_nbr = "LV-" + nxt_ctrl_nbr.key_value.ToString();
                data.approved_period_from = data.approved_period_from;
                data.approved_period_to = data.approved_period_to;
                data.created_by = Session["user_id"].ToString();
                data.created_dttm = DateTime.Now;
                data.department_code = data.department_code;
                data.employment_tyep = data.employment_tyep;
                data.view_mode = data.view_mode;
                db_ats.transmittal_leave_hdr_tbl.Add(data);

                var data_dtl_insert = db_ats.sp_transmittal_leave_dtl_tbl_list("", data.approved_period_from, data.approved_period_to, data.department_code, data.employment_tyep, data.view_mode).ToList();
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
                        db_ats.sp_lv_ledger_history_insert(data_dtl_insert[i].ledger_ctrl_no.ToString().Trim(), data_dtl_insert[i].leave_ctrlno.ToString().Trim(), appl_status, "", Session["user_id"].ToString());
                        // *************************************************************
                        // **** VJA - 2023-06-01 -- Insert Leave Ledger History ********
                        // *************************************************************

                    }
                }
                db_ats.transmittal_leave_dtl_tbl.AddRange(data_dtl);
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
        // Created Date : 01/13/2020
        // Description  : Edit existing record from leave sub-type table
        //*********************************************************************//
        public ActionResult SaveEdit(transmittal_leave_hdr_tbl data)
        {
            try
            {
                var od = db_ats.transmittal_leave_hdr_tbl.Where(a => a.doc_ctrl_nbr == data.doc_ctrl_nbr).FirstOrDefault();

                od.transmittal_descr = data.transmittal_descr;
                od.approved_period_from = data.approved_period_from;
                od.approved_period_to = data.approved_period_to;
                od.updated_by = Session["user_id"].ToString();
                od.updated_dttm = DateTime.Now;
                od.doc_status = data.doc_status;
                od.route_nbr = data.route_nbr;
                od.department_code = data.department_code;
                od.employment_tyep = data.employment_tyep;
                od.view_mode = data.view_mode;

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
        public ActionResult Save_dtl(transmittal_leave_dtl_tbl data, string par_transmitted_flag, string leave_ctrlno)
        {
            try
            {
                if (par_transmitted_flag == "N")
                {
                    db_ats.transmittal_leave_dtl_tbl.Add(data);
                    data.created_by = Session["user_id"].ToString();
                    data.created_dttm = DateTime.Now;
                    data.route_nbr = data.route_nbr;
                    data.leave_ctrlno = data.leave_ctrlno;
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
                db_ats.sp_lv_ledger_history_insert(data.ledger_ctrl_no.ToString().Trim(), leave_ctrlno, appl_status, "", Session["user_id"].ToString());
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

        public ActionResult RetriveTransmittalInfo(string par_doc_ctrl_nbr)
        {
            try
            {
                if (par_doc_ctrl_nbr.Length >= 15)
                {
                    var data = db_ats.sp_transmittal_leave_hdr_tbl_list().Where(a => a.doc_ctrl_nbr == par_doc_ctrl_nbr).ToList().FirstOrDefault();
                    var data_dtl = db_ats.sp_transmittal_leave_dtl_tbl_list(par_doc_ctrl_nbr, data.approved_period_from, data.approved_period_to, "", "", "").Where(a => a.doc_ctrl_nbr == par_doc_ctrl_nbr && a.transmitted_flag == "Y").ToList();
                    var data_history = db_trk.sp_edocument_trk_tbl_history(par_doc_ctrl_nbr, "LV").ToList();

                    return Json(new
                    {
                        data_dtl,
                        data,
                        data_history,
                        message = "success"
                    }, JsonRequestBehavior.AllowGet);
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
                        db_ats.sp_lv_ledger_history_insert(upd_dtl[i].ledger_ctrl_no.ToString().Trim(), upd_dtl[i].leave_ctrlno.ToString().Trim(), appl_status, "", Session["user_id"].ToString());
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
                        var appl_status = "Transmitted for Signature (Released)";
                        db_ats.sp_lv_ledger_history_insert(upd_dtl[i].ledger_ctrl_no.ToString().Trim(), upd_dtl[i].leave_ctrlno.ToString().Trim(), appl_status, "", Session["user_id"].ToString());
                        // *************************************************************
                        // **** VJA - 2023-06-01 -- Insert Leave Ledger History ********
                        // *************************************************************
                    }

                    message_descr = "Successfully Released!";
                    message_descr1 = "This Record is Successfully Released!";
                }
                //else if (data.document_status == "T")
                //{
                //    message_descr = "Successfully Receive Return!";
                //    message_descr1 = "This Record is Successfully Return!";
                //}

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
        //public ActionResult CheckAll(transmittal_leave_dtl_tbl data)
        //{
        //    try
        //    {
        //        db_ats.transmittal_leave_dtl_tbl.Add(data);
        //        data.created_by     = Session["user_id"].ToString();
        //        data.created_dttm   = DateTime.Now;
        //        data.route_nbr      = data.route_nbr;
        //        data.leave_ctrlno      = data.leave_ctrlno;
        //        db_ats.SaveChangesAsync();

        //        return Json(new { message = "success" }, JsonRequestBehavior.AllowGet);
        //    }
        //    catch (Exception e)
        //    {
        //        string message = e.Message.ToString();
        //        return Json(new { message }, JsonRequestBehavior.AllowGet);
        //    }
        //}
        //*********************************************************************//
        // Created By   : Vincent Jade H. Alivio 
        // Created Date : 01/13/2020
        // Description  : Add new record to leave sub-type table
        //*********************************************************************//
        //public ActionResult DeleteAll(string par_doc_ctrl_nbr)
        //{
        //    try
        //    {
        //        var od2 = db_ats.transmittal_leave_dtl_tbl.Where(a => a.doc_ctrl_nbr == par_doc_ctrl_nbr).ToList();
        //        if (od2 != null)
        //        {
        //            db_ats.transmittal_leave_dtl_tbl.RemoveRange(od2);
        //        }
        //        db_ats.SaveChanges();
        //        return Json(new { message = "success" }, JsonRequestBehavior.AllowGet);
        //    }
        //    catch (Exception e)
        //    {
        //        string message = e.Message.ToString();
        //        return Json(new { message }, JsonRequestBehavior.AllowGet);
        //    }
        //}
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