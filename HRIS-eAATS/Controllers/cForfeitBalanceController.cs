
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
    public class cForfeitBalanceController : Controller
    {
        HRIS_ATSEntities db_ats = new HRIS_ATSEntities();
        User_Menu um            = new User_Menu();
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
                db_ats.Database.CommandTimeout = int.MaxValue;
                var um                  = GetAllowAccess();
                var log_empl_id         = Session["empl_id"].ToString();
                var lv_admin_dept_list  = db_ats.vw_leaveadmin_tbl_list.Where(a => a.empl_id == log_empl_id).OrderBy(a => a.department_code);
                var data                = db_ats.sp_lv_ledger_forfeitbal_tbl_list(DateTime.Now.Year.ToString(),"","FL").ToList();
                var leavetype           = db_ats.leavetype_tbl.Where(a=>a.leavetype_code == "FL").ToList();

                return JSON(new { message = "success", um, lv_admin_dept_list, data , leavetype }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message.ToString();
                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
        }
        public ActionResult FilterPageGrid(string p_leave_year, string p_department_code, string p_leavetype_code)
        {
            try
            {
                db_ats.Database.CommandTimeout = int.MaxValue;
                var data                = db_ats.sp_lv_ledger_forfeitbal_tbl_list(p_leave_year, p_department_code, p_leavetype_code).ToList();
                return JSON(new { message = "success",data  }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message.ToString();
                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
        }
        public ActionResult GeneateForfeit(List<lv_ledger_forfeitbal_tbl> data, string forfeited_year, string leavetype_code)
        {
            try
            {
                var return_flag = "Y";
                var return_msg  = "Successfully Generated";
                db_ats.Database.CommandTimeout = int.MaxValue;
                if (data.Count > 0)
                {
                    for (int i = 0; i < data.Count; i++)
                    {
                        var val_empl_id = data[i].empl_id;
                        var chk = db_ats.lv_ledger_forfeitbal_tbl.Where(a => a.empl_id == val_empl_id && a.forfeited_year == forfeited_year && a.leavetype_code == leavetype_code).FirstOrDefault();
                        if (chk == null)
                        {
                            lv_ledger_forfeitbal_tbl insert = new lv_ledger_forfeitbal_tbl();
                            lv_ledger_hdr_tbl hdr   = new lv_ledger_hdr_tbl();
                            lv_ledger_dtl_tbl dtl   = new lv_ledger_dtl_tbl();
                            var new_appl_nbr             = db_ats.sp_generate_appl_nbr("lv_ledger_hdr_tbl", 10, "ledger_ctrl_no").ToList();
                            insert.forfeited_year        = forfeited_year                ;
                            insert.ledger_ctrl_no        = new_appl_nbr[0]               ;
                            insert.empl_id               = data[i].empl_id               ;
                            insert.employee_name         = data[i].employee_name         ;
                            insert.department_code       = data[i].department_code       ;
                            insert.department_short_name = data[i].department_short_name ;
                            insert.leavetype_code        = leavetype_code;
                            insert.fl_used               = data[i].fl_used               ;
                            insert.vl_used               = data[i].vl_used               ;
                            insert.vl_bal                = data[i].vl_bal                ;
                            insert.cto_used              = data[i].cto_used              ;
                            insert.cto_bal               = data[i].cto_bal               ;
                            insert.forfeited_bal         = (leavetype_code == "FL" ? (5 - data[i].fl_used) : 0) ;
                            insert.remarks               = return_msg                    ;
                            insert.created_dttm          = DateTime.Now                  ;
                            insert.created_by            = Session["user_id"].ToString() ;

                            hdr.ledger_ctrl_no           = new_appl_nbr[0];
                            hdr.empl_id                  = data[i].empl_id;
                            hdr.leaveledger_date         = DateTime.Now;
                            hdr.leaveledger_period       = "FL " + forfeited_year;
                            hdr.leavetype_code           = (leavetype_code == "FL" ? "VL" : leavetype_code);
                            hdr.leavesubtype_code        = "";
                            hdr.leaveledger_particulars  = (leavetype_code == "FL" ? (5 - data[i].fl_used).ToString() + "-0-0" : "");  ;
                            hdr.leaveledger_entry_type   = "3";
                            hdr.details_remarks          = forfeited_year + " FORFEITED";
                            hdr.approval_status          = "F";
                            hdr.approval_id              = "";
                            hdr.leave_ctrlno             = "";
                            hdr.date_applied             = DateTime.Now;
                            hdr.created_dttm             = DateTime.Now;
                            hdr.created_by_user          = Session["user_id"].ToString();
                            hdr.updated_dttm             = null;
                            hdr.updated_by_user          = "";
                            hdr.sig_name3_ovrd           = "";
                            hdr.sig_pos3_ovrd            = "";
                            hdr.lv_nodays                = 5 - data[i].fl_used;
                            hdr.lwop_date                = "";
                            hdr.lwop_body_1              = "";
                            hdr.lwop_body_2              = "";

                            dtl.ledger_ctrl_no              = new_appl_nbr[0];
                            dtl.leavetype_code              = (leavetype_code == "FL" ? "VL" : leavetype_code);
                            dtl.leavesubtype_code           = "";
                            dtl.leaveledger_balance_as_of   = data[i].vl_bal;
                            dtl.leaveledger_restore_deduct  = 0;
                            dtl.leaveledger_abs_und_wp      = (leavetype_code == "FL" ? (5 - data[i].fl_used) : 0);
                            dtl.leaveledger_abs_und_wop     = 0;

                            db_ats.lv_ledger_dtl_tbl.Add(dtl);
                            db_ats.lv_ledger_hdr_tbl.Add(hdr);
                            db_ats.lv_ledger_forfeitbal_tbl.Add(insert);
                            db_ats.SaveChanges();
                        }
                        else
                        {
                            return_flag = "N";
                            return_msg  = "No data Found!";
                        }
                    }
                }
                else
                {
                    return_flag = "N";
                    return_msg  = "Department Selected!";
                }
                return JSON(new { message = "success",data , return_flag, return_msg }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message.ToString();
                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
        }
    }
}