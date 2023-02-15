using HRIS_eAATS.Models;
using System;
using System.Collections.Generic;
using System.Data.Entity.Validation;
using System.Globalization;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Runtime.InteropServices;
using Excel = Microsoft.Office.Interop.Excel;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using System.Drawing;

namespace HRIS_eAATS.Controllers
{
    public class cExtractToExcelController : Controller
    {
        HRIS_DEVEntities db = new HRIS_DEVEntities();
        HRIS_ATSEntities db_ats = new HRIS_ATSEntities();

        public string url_name = "cExtractToExcel";
        User_Menu um = new User_Menu();

        // GET: cExtractToExcel
        public ActionResult Index()
        {
            //ScriptManager scriptManager = ScriptManager.GetCurrent(this.Page);
            //scriptManager.RegisterPostBackControl(this.btn_create_generate);
            
            if (um != null || um.ToString() != "")
            {
                um.allow_add                    = (int)Session["allow_add"];
                um.allow_delete                 = (int)Session["allow_delete"];
                um.allow_edit                   = (int)Session["allow_edit"];
                um.allow_edit_history           = (int)Session["allow_edit_history"];
                um.allow_print                  = (int)Session["allow_print"];
                um.allow_view                   = (int)Session["allow_view"];
                um.url_name                     = Session["url_name"].ToString();
                um.id                           = (int)Session["id"];
                um.menu_name                    = Session["menu_name"].ToString();
                um.page_title                   = Session["page_title"].ToString();
                
            }
            return View(um);
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
        // Created By   : Lorraine I. Ale 
        // Created Date : 03/05/2020
        // Description  : Initialized during pageload
        //*********************************************************************//
        public ActionResult InitializeData()
        {
            try
            {
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
                var dep_lst = db.vw_departments_tbl_list.ToList().OrderBy(a=> a.department_code);
                var data = db_ats.sp_exc_inc_empl_attendance_tbl_list("01").ToList();

                return JSON(new { empl_names, message = "success", um, dep_lst, data }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message;
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }


        public ActionResult ExtractExcel(
              string par_extract_type
            , DateTime p_leave_date_from
            , DateTime p_leave_date_to
            , string p_department_code
            , string p_empl_id
            , string p_lv_posting_status
            , string p_cancel_status
            ,string par_extract_type_descr
            ,string par_employment_type
            )
        {
            db_ats.Database.CommandTimeout = int.MaxValue;

            var message = "";
            var filePath = "";
            var user_id = Session["user_id"].ToString().Trim();
            var date_extract = DateTime.Now.ToString("yyyy_MM_dd_HHmm");

            try
            {
                if (par_extract_type == "HISTORY"      || // Approved Leave application and Posting History
                    par_extract_type == "CANCEL_LEAVE" || // Leave Application Cancel Pending or Disapprove
                    par_extract_type == "CANCEL_POST")    // Leave Posting Pending or Disapprove
                {
                    Excel.Application xlApp     = new Excel.Application();

                    Excel.Workbook xlWorkBook   = xlApp.Workbooks.Open(Server.MapPath("~/TemplateExcelFile/Extract_Tracking_History_of_Leave_Application.xlsx"));
                    Excel.Worksheet xlWorkSheet = (Excel.Worksheet)xlWorkBook.Worksheets.get_Item(1);
                    object misValue             = System.Reflection.Missing.Value;

                    Excel.Range xlRange         = xlWorkSheet.UsedRange;
                    int totalRows               = xlRange.Rows.Count;
                    int totalColumns            = xlRange.Columns.Count;

                    // ************************************************************
                    // ************************************************************
                    //       @p_cancel_status
                    //      		1 - Leave Application Cancel Pending or Disapprove 
                    //      		2 - Leave Posting Pending or Disapprove 
                    if (par_extract_type == "CANCEL_LEAVE")
                    {
                        p_cancel_status = "1";
                    }
                    else if (par_extract_type == "CANCEL_POST")
                    {
                        p_cancel_status = "2";
                    }
                    else
                    {
                        p_cancel_status = "";
                    }
                    // ************************************************************
                    // ************************************************************

                    var data_extract            = db_ats.sp_extract_trk_leave_appl(p_leave_date_from, p_leave_date_to, p_department_code, p_empl_id, p_lv_posting_status, p_cancel_status, par_employment_type).ToList();
                    
                    if (data_extract.Count > 0)
                    {
                        int start_row = 3;
                        for (int x = 1; x <= data_extract.Count; x++)
                        {
                            xlWorkSheet.Cells[start_row, 1] = data_extract[x - 1].department_short_name             ;
                            xlWorkSheet.Cells[start_row, 2] = data_extract[x - 1].empl_id                           ;
                            xlWorkSheet.Cells[start_row, 3] = data_extract[x - 1].employee_name                     ;
                            xlWorkSheet.Cells[start_row, 4] = data_extract[x - 1].position_long_title               ;
                            xlWorkSheet.Cells[start_row, 5] = data_extract[x - 1].leave_ctrlno                      ;
                            xlWorkSheet.Cells[start_row, 6] = data_extract[x - 1].date_applied                      ;
                            xlWorkSheet.Cells[start_row, 7] = data_extract[x - 1].leaveledger_date                  ;
                            xlWorkSheet.Cells[start_row, 8] = data_extract[x - 1].leave_comments                    ;
                            xlWorkSheet.Cells[start_row, 9] = data_extract[x - 1].leavetype_descr                   ;
                            xlWorkSheet.Cells[start_row, 10] = data_extract[x - 1].leavesubtype_descr                ;
                            xlWorkSheet.Cells[start_row, 11] = data_extract[x - 1].number_of_days                    ;
                            xlWorkSheet.Cells[start_row, 12] = data_extract[x - 1].leave_dates                       ;
                            xlWorkSheet.Cells[start_row, 13] = data_extract[x - 1].details_remarks                   ;
                            xlWorkSheet.Cells[start_row, 14] = data_extract[x - 1].approval_status                   ;
                            xlWorkSheet.Cells[start_row, 15] = data_extract[x - 1].posting_status                    ;
                            xlWorkSheet.Cells[start_row, 16] = data_extract[x - 1].leave_transaction_descr           ;
                            xlWorkSheet.Cells[start_row, 17] = data_extract[x - 1].leave_approval_id                 ;
                            xlWorkSheet.Cells[start_row, 18] = data_extract[x - 1].leave_employee_name_creator       ;
                            xlWorkSheet.Cells[start_row, 19] = data_extract[x - 1].leave_created_dttm                ;
                            xlWorkSheet.Cells[start_row, 20] = data_extract[x - 1].leave_employee_name_reviewer      ;
                            xlWorkSheet.Cells[start_row, 21] = data_extract[x - 1].leave_reviewed_date               ;
                            xlWorkSheet.Cells[start_row, 22] = data_extract[x - 1].leave_employee_name_final_approver;
                            xlWorkSheet.Cells[start_row, 23] = data_extract[x - 1].leave_final_approval_date         ;
                            xlWorkSheet.Cells[start_row, 24] = data_extract[x - 1].leave_disapproval_comment         ;
                            xlWorkSheet.Cells[start_row, 25] = data_extract[x - 1].leave_employee_name_disapprover   ;
                            xlWorkSheet.Cells[start_row, 26] = data_extract[x - 1].leave_disapproval_date            ;
                            xlWorkSheet.Cells[start_row, 27] = data_extract[x - 1].leave_cancel_pending_comment      ;
                            xlWorkSheet.Cells[start_row, 28] = data_extract[x - 1].leave_user_id_cancel_pending      ;
                            xlWorkSheet.Cells[start_row, 29] = data_extract[x - 1].leave_cancel_pending_date         ;
                            xlWorkSheet.Cells[start_row, 30] = data_extract[x - 1].leave_cancelled_comment           ;
                            xlWorkSheet.Cells[start_row, 31] = data_extract[x - 1].leave_cancelled_date              ;
                            xlWorkSheet.Cells[start_row, 32] = data_extract[x - 1].post_transaction_descr            ;
                            xlWorkSheet.Cells[start_row, 33] = data_extract[x - 1].post_approval_id                  ;
                            xlWorkSheet.Cells[start_row, 34] = data_extract[x - 1].post_employee_name_creator        ;
                            xlWorkSheet.Cells[start_row, 35] = data_extract[x - 1].post_leave_created_dttm           ;
                            xlWorkSheet.Cells[start_row, 36] = data_extract[x - 1].post_employee_name_final_approver ;
                            xlWorkSheet.Cells[start_row, 37] = data_extract[x - 1].post_final_approval_date          ;
                            xlWorkSheet.Cells[start_row, 38] = data_extract[x - 1].post_disapproval_comment          ;
                            xlWorkSheet.Cells[start_row, 39] = data_extract[x - 1].post_employee_name_disapprover    ;
                            xlWorkSheet.Cells[start_row, 40] = data_extract[x - 1].post_disapproval_date             ;
                            xlWorkSheet.Cells[start_row, 41] = data_extract[x - 1].post_cancel_pending_comment       ;
                            xlWorkSheet.Cells[start_row, 42] = data_extract[x - 1].post_user_id_cancel_pending       ;
                            xlWorkSheet.Cells[start_row, 43] = data_extract[x - 1].post_cancel_pending_date          ;
                            xlWorkSheet.Cells[start_row, 44] = data_extract[x - 1].post_cancelled_comment            ;
                            xlWorkSheet.Cells[start_row, 45] = data_extract[x - 1].post_cancelled_date               ;

                            start_row = start_row + 1;
                        }
                        Marshal.ReleaseComObject(xlWorkSheet);
                        string filename = "";

                        filename = par_extract_type_descr + "-" + p_leave_date_from.ToString("yyyy_MM_dd") + "-" + p_leave_date_to.ToString("yyyy_MM_dd") + "-" + user_id + "_" + date_extract + ".xlsx";
                        xlWorkBook.SaveAs(Server.MapPath("~/UploadedFile/" + filename), Excel.XlFileFormat.xlOpenXMLWorkbook,
                            Missing.Value, Missing.Value, Missing.Value, Missing.Value, Excel.XlSaveAsAccessMode.xlNoChange,
                            Excel.XlSaveConflictResolution.xlLocalSessionChanges, Missing.Value, Missing.Value,
                            Missing.Value, Missing.Value);
                    
                        xlWorkBook.Close();
                        xlApp.Quit();

                        Marshal.ReleaseComObject(xlWorkBook);
                        Marshal.ReleaseComObject(xlApp);

                        filePath = "/UploadedFile/" + filename;
                        message = "success";
                    }
                    else
                    {
                        message = "no-data-found";
                    }
                }
                else if (par_extract_type == "HISTORY-SPENT-TIME")  // Approved Leave application and Posting History by Date Applied with Spent Time
                {
                    Excel.Application xlApp     = new Excel.Application();

                    Excel.Workbook xlWorkBook   = xlApp.Workbooks.Open(Server.MapPath("~/TemplateExcelFile/Extract_Tracking_History_of_Leave_Application_w_spenttime.xlsx"));
                    Excel.Worksheet xlWorkSheet = (Excel.Worksheet)xlWorkBook.Worksheets.get_Item(1);
                    object misValue             = System.Reflection.Missing.Value;

                    Excel.Range xlRange         = xlWorkSheet.UsedRange;
                    int totalRows               = xlRange.Rows.Count;
                    int totalColumns            = xlRange.Columns.Count;

                    var data_extract            = db_ats.sp_extract_trk_leave_appl_lvl1_final_appr(p_leave_date_from, p_leave_date_to, p_department_code, p_empl_id, p_lv_posting_status, p_cancel_status, par_employment_type).ToList();
                    
                    if (data_extract.Count > 0)
                    {
                        int start_row = 3;
                        for (int x = 1; x <= data_extract.Count; x++)
                        {
                            xlWorkSheet.Cells[start_row, 1] = data_extract[x - 1].department_short_name             ;
                            xlWorkSheet.Cells[start_row, 2] = data_extract[x - 1].empl_id                           ;
                            xlWorkSheet.Cells[start_row, 3] = data_extract[x - 1].employee_name                     ;
                            xlWorkSheet.Cells[start_row, 4] = data_extract[x - 1].position_long_title               ;
                            xlWorkSheet.Cells[start_row, 5] = data_extract[x - 1].leave_ctrlno                      ;
                            xlWorkSheet.Cells[start_row, 6] = data_extract[x - 1].date_applied                      ;
                            xlWorkSheet.Cells[start_row, 7] = data_extract[x - 1].leaveledger_date                  ;
                            xlWorkSheet.Cells[start_row, 8] = data_extract[x - 1].leave_comments                    ;
                            xlWorkSheet.Cells[start_row, 9] = data_extract[x - 1].leavetype_descr                   ;
                            xlWorkSheet.Cells[start_row, 10] = data_extract[x - 1].leavesubtype_descr                ;
                            xlWorkSheet.Cells[start_row, 11] = data_extract[x - 1].number_of_days                    ;
                            xlWorkSheet.Cells[start_row, 12] = data_extract[x - 1].leave_dates                       ;
                            xlWorkSheet.Cells[start_row, 13] = data_extract[x - 1].details_remarks                   ;
                            xlWorkSheet.Cells[start_row, 14] = data_extract[x - 1].approval_status                   ;
                            xlWorkSheet.Cells[start_row, 15] = data_extract[x - 1].posting_status                    ;
                            xlWorkSheet.Cells[start_row, 16] = data_extract[x - 1].leave_transaction_descr           ;
                            xlWorkSheet.Cells[start_row, 17] = data_extract[x - 1].leave_approval_id                 ;
                            xlWorkSheet.Cells[start_row, 18] = data_extract[x - 1].leave_employee_name_creator       ;
                            xlWorkSheet.Cells[start_row, 19] = data_extract[x - 1].leave_created_dttm                ;
                            xlWorkSheet.Cells[start_row, 20] = data_extract[x - 1].leave_employee_name_reviewer      ;
                            xlWorkSheet.Cells[start_row, 21] = data_extract[x - 1].leave_reviewed_date               ;
                            xlWorkSheet.Cells[start_row, 22] = data_extract[x - 1].leave_employee_name_final_approver;
                            xlWorkSheet.Cells[start_row, 23] = data_extract[x - 1].leave_final_approval_date         ;
                            xlWorkSheet.Cells[start_row, 24] = data_extract[x - 1].leave_disapproval_comment         ;
                            xlWorkSheet.Cells[start_row, 25] = data_extract[x - 1].leave_employee_name_disapprover   ;
                            xlWorkSheet.Cells[start_row, 26] = data_extract[x - 1].leave_disapproval_date            ;
                            xlWorkSheet.Cells[start_row, 27] = data_extract[x - 1].leave_cancel_pending_comment      ;
                            xlWorkSheet.Cells[start_row, 28] = data_extract[x - 1].leave_user_id_cancel_pending      ;
                            xlWorkSheet.Cells[start_row, 29] = data_extract[x - 1].leave_cancel_pending_date         ;
                            xlWorkSheet.Cells[start_row, 30] = data_extract[x - 1].leave_cancelled_comment           ;
                            xlWorkSheet.Cells[start_row, 31] = data_extract[x - 1].leave_cancelled_date              ;
                            xlWorkSheet.Cells[start_row, 32] = data_extract[x - 1].post_transaction_descr            ;
                            xlWorkSheet.Cells[start_row, 33] = data_extract[x - 1].post_approval_id                  ;
                            xlWorkSheet.Cells[start_row, 34] = data_extract[x - 1].post_employee_name_creator        ;
                            xlWorkSheet.Cells[start_row, 35] = data_extract[x - 1].post_leave_created_dttm           ;
                            xlWorkSheet.Cells[start_row, 36] = data_extract[x - 1].post_employee_name_final_approver ;
                            xlWorkSheet.Cells[start_row, 37] = data_extract[x - 1].post_final_approval_date          ;
                            xlWorkSheet.Cells[start_row, 38] = data_extract[x - 1].post_disapproval_comment          ;
                            xlWorkSheet.Cells[start_row, 39] = data_extract[x - 1].post_employee_name_disapprover    ;
                            xlWorkSheet.Cells[start_row, 40] = data_extract[x - 1].post_disapproval_date             ;
                            xlWorkSheet.Cells[start_row, 41] = data_extract[x - 1].post_cancel_pending_comment       ;
                            xlWorkSheet.Cells[start_row, 42] = data_extract[x - 1].post_user_id_cancel_pending       ;
                            xlWorkSheet.Cells[start_row, 43] = data_extract[x - 1].post_cancel_pending_date          ;
                            xlWorkSheet.Cells[start_row, 44] = data_extract[x - 1].post_cancelled_comment            ;
                            xlWorkSheet.Cells[start_row, 45] = data_extract[x - 1].post_cancelled_date               ;
                            xlWorkSheet.Cells[start_row, 46] = data_extract[x - 1].spent_time               ;

                            start_row = start_row + 1;
                        }
                        Marshal.ReleaseComObject(xlWorkSheet);
                        string filename = "";

                        filename = par_extract_type_descr + "-" + p_leave_date_from.ToString("yyyy_MM_dd") + "-" + p_leave_date_to.ToString("yyyy_MM_dd") + "-" + user_id + "_" + date_extract + ".xlsx";
                        xlWorkBook.SaveAs(Server.MapPath("~/UploadedFile/" + filename), Excel.XlFileFormat.xlOpenXMLWorkbook,
                            Missing.Value, Missing.Value, Missing.Value, Missing.Value, Excel.XlSaveAsAccessMode.xlNoChange,
                            Excel.XlSaveConflictResolution.xlLocalSessionChanges, Missing.Value, Missing.Value,
                            Missing.Value, Missing.Value);
                    
                        xlWorkBook.Close();
                        xlApp.Quit();

                        Marshal.ReleaseComObject(xlWorkBook);
                        Marshal.ReleaseComObject(xlApp);

                        filePath = "/UploadedFile/" + filename;
                        message = "success";
                    }
                    else
                    {
                        message = "no-data-found";
                    }
                }
            }
            catch (Exception e)
            {
                message = e.Message.ToString();
            }
                    
            return JSON(new { message, filePath }, JsonRequestBehavior.AllowGet);
            
        }
        //*********************************************************************//
        // Created By   : Lorraine I. Ale 
        // Created Date : 03/05/2020
        // Description  : Initialized during pageload
        //*********************************************************************//
        public ActionResult RetrieveIncludeExclude(string ddl_option_type)
        {
            try
            {var data = db_ats.sp_exc_inc_empl_attendance_tbl_list(ddl_option_type).ToList();

                return JSON(new { message = "success", um, data }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message;
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }

        //*********************************************************************//
        // Created By   : Lorraine I. Ale 
        // Created Date : 01/14/2020
        // Description  : Add new record 
        //*********************************************************************//
        public ActionResult Save_Update(string action_mode,exc_inc_empl_attendance_tbl data)
        {
            try
            {

                string message = "";
                string message_descr = "";
                if (action_mode == "ADD")
                {
                    data.created_by = Session["user_id"].ToString();
                    data.created_dttm = DateTime.Now;
                    data.updated_by = "";
                    data.updated_dttm = DateTime.Now;
                    db_ats.exc_inc_empl_attendance_tbl.Add(data);
                    db_ats.SaveChangesAsync();
                    message = "success";
                    message_descr = "Successfully Added!";
                }
                else if (action_mode == "EDIT")
                {
                    var od = db_ats.exc_inc_empl_attendance_tbl.Where(a => a.empl_id == data.empl_id).FirstOrDefault();
                    od.remarks_1 = data.remarks_1;
                    od.remarks_2 = data.remarks_2;
                    data.updated_by = Session["user_id"].ToString();
                    data.updated_dttm = DateTime.Now;
                    db_ats.SaveChanges();
                    message = "success";
                    message_descr = "Successfully Updated!";
                }
                
                else
                {
                    message = "there-something-wrong";
                    message_descr = "There something wrong";
                }

                return Json(new { message, message_descr }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message.ToString();
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }
        //*********************************************************************//
        // Created By   : Lorraine I. Ale 
        // Created Date : 12/12/2019
        // Description  : delete from travel type table
        //*********************************************************************//
        public ActionResult Delete(string empl_id)
        {
            try
            {
                string message = "";
                string message_descr = "";
                var od = db_ats.exc_inc_empl_attendance_tbl.Where(a => a.empl_id == empl_id).FirstOrDefault();
                if (od != null)
                {
                    db_ats.exc_inc_empl_attendance_tbl.Remove(od);
                    db_ats.SaveChanges();
                    message = "success";
                    message_descr = "Successfully Delete!";
                }
                else
                {
                    message = "";
                }
                return Json(new { message, message_descr }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message.ToString();

                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }

        //*********************************************************************//
        // Created By   : Lorraine I. Ale 
        // Created Date : 03/05/2020
        // Description  : Initialized during pageload
        //*********************************************************************//
        public ActionResult RetrieveReports(string ddl_option_type
                                           ,DateTime p_period_from
                                           ,DateTime p_period_to
                                           ,string p_department_code
                                           ,string p_employment_type
                                           ,string p_empl_id
        )
        {
            try
            {
                var message = "";
                var data = db_ats.sp_extract_best_attendance(p_period_from, p_period_to, p_department_code, p_employment_type, p_empl_id).ToList();
                if (data == null || data.Count <= 0)
                {
                    message = "no-quali";
                }
                return JSON(new { message, data }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message;
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }

    }
}