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

        //*********************************************************************//
        // Description  : Retrieve COA Leave Summary Report
        //*********************************************************************//
        public ActionResult RetrieveCOAReport(DateTime p_leave_date_from, DateTime p_leave_date_to, string p_empl_id)
        {
            try
            {
                var data = db_ats.sp_leaveledger_report_extract(p_leave_date_from, p_leave_date_to, p_empl_id).ToList();
                if (data == null || data.Count == 0)
                    return JSON(new { message = "no-data-found" }, JsonRequestBehavior.AllowGet);

                return JSON(new { message = "success", data }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                return JSON(new { message = e.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        //*********************************************************************//
        // Description  : Extract COA Leave Summary Report to a formatted Excel
        //*********************************************************************//
        public ActionResult ExtractCOAExcel(DateTime p_leave_date_from, DateTime p_leave_date_to, string p_empl_id)
        {
            Excel.Application xlApp = null;
            Excel.Workbook xlWorkBook = null;
            Excel.Worksheet xlWorkSheet = null;

            try
            {
                db_ats.Database.CommandTimeout = int.MaxValue;
                var data = db_ats.sp_leaveledger_report_extract(p_leave_date_from, p_leave_date_to, p_empl_id).ToList();

                if (data == null || data.Count == 0)
                    return JSON(new { message = "no-data-found" }, JsonRequestBehavior.AllowGet);

                xlApp = new Excel.Application();
                xlWorkBook = xlApp.Workbooks.Add(Missing.Value);
                xlWorkSheet = (Excel.Worksheet)xlWorkBook.Worksheets.get_Item(1);
                xlWorkSheet.Name = "Leave Summary";

                string[] fixedHeaders = { "ID No", "Employee Name", "Office", "Status", "Employment Status", "Monthly Rate" };
                string[] leaveHeaders = { "Previous Balance", "Earned", "Restored", "Previous Balance + Earned + Restored", "Incurred", "Total Balance", "Total Amount" };

                for (int col = 1; col <= 6; col++)
                {
                    Excel.Range header = xlWorkSheet.Range[xlWorkSheet.Cells[1, col], xlWorkSheet.Cells[2, col]];
                    header.Merge();
                    header.Value2 = fixedHeaders[col - 1];
                    Marshal.ReleaseComObject(header);
                }

                Excel.Range vlGroup = xlWorkSheet.Range["G1", "M1"];
                vlGroup.Merge();
                vlGroup.Value2 = "VACATION LEAVE";

                Excel.Range slGroup = xlWorkSheet.Range["N1", "T1"];
                slGroup.Merge();
                slGroup.Value2 = "SICK LEAVE";

                Excel.Range remarksHeader = xlWorkSheet.Range["U1", "U2"];
                remarksHeader.Merge();
                remarksHeader.Value2 = "Remarks";

                for (int x = 0; x < leaveHeaders.Length; x++)
                {
                    xlWorkSheet.Cells[2, 7 + x] = leaveHeaders[x];
                    xlWorkSheet.Cells[2, 14 + x] = leaveHeaders[x];
                }

                int startRow = 3;
                for (int x = 0; x < data.Count; x++)
                {
                    var row = data[x];
                    int excelRow = startRow + x;

                    xlWorkSheet.Cells[excelRow, 1] = row.empl_id;
                    xlWorkSheet.Cells[excelRow, 2] = row.employee_name;
                    xlWorkSheet.Cells[excelRow, 3] = row.department_short_name;
                    xlWorkSheet.Cells[excelRow, 4] = row.status;
                    xlWorkSheet.Cells[excelRow, 5] = row.employment_type;
                    xlWorkSheet.Cells[excelRow, 6] = ToExcelNumber(row.monthly_rate);
                    xlWorkSheet.Cells[excelRow, 7] = row.vl_bal;
                    xlWorkSheet.Cells[excelRow, 8] = row.vl_earned;
                    xlWorkSheet.Cells[excelRow, 9] = row.vl_restored;
                    xlWorkSheet.Cells[excelRow, 10] = row.total_vl_earned;
                    xlWorkSheet.Cells[excelRow, 11] = row.vl_incurred;
                    xlWorkSheet.Cells[excelRow, 12] = row.total_vl;
                    xlWorkSheet.Cells[excelRow, 13] = ToExcelNumber(row.total_vl_amount);
                    xlWorkSheet.Cells[excelRow, 14] = row.sl_bal;
                    xlWorkSheet.Cells[excelRow, 15] = row.sl_earned;
                    xlWorkSheet.Cells[excelRow, 16] = row.sl_restored;
                    xlWorkSheet.Cells[excelRow, 17] = row.total_sl_earned;
                    xlWorkSheet.Cells[excelRow, 18] = row.sl_incurred;
                    xlWorkSheet.Cells[excelRow, 19] = row.total_sl;
                    xlWorkSheet.Cells[excelRow, 20] = ToExcelNumber(row.total_sl_amount);
                    xlWorkSheet.Cells[excelRow, 21] = row.remarks;
                }

                int lastRow = startRow + data.Count - 1;
                Excel.Range allRange = xlWorkSheet.Range["A1", "U" + lastRow];
                allRange.Font.Name = "Arial";
                allRange.Font.Size = 9;
                allRange.Borders.LineStyle = Excel.XlLineStyle.xlContinuous;
                allRange.Borders.Weight = Excel.XlBorderWeight.xlThin;
                allRange.VerticalAlignment = Excel.XlVAlign.xlVAlignCenter;

                Excel.Range mainHeaders = xlWorkSheet.Range["A1", "U2"];
                mainHeaders.Font.Bold = true;
                mainHeaders.HorizontalAlignment = Excel.XlHAlign.xlHAlignCenter;
                mainHeaders.WrapText = true;

                Excel.Range fixedHeaderRange = xlWorkSheet.Range["A1", "F2"];
                fixedHeaderRange.Interior.Color = ColorTranslator.ToOle(Color.FromArgb(255, 255, 255));
                Excel.Range remarksRange = xlWorkSheet.Range["U1", "U2"];
                remarksRange.Interior.Color = ColorTranslator.ToOle(Color.FromArgb(255, 255, 255));
                vlGroup.Interior.Color = ColorTranslator.ToOle(Color.FromArgb(248, 202, 171));
                slGroup.Interior.Color = ColorTranslator.ToOle(Color.FromArgb(198, 224, 180));

                Excel.Range numericRange = xlWorkSheet.Range["F3", "T" + lastRow];
                numericRange.HorizontalAlignment = Excel.XlHAlign.xlHAlignRight;
                numericRange.NumberFormat = "#,##0.000";
                xlWorkSheet.Range["F3", "F" + lastRow].NumberFormat = "#,##0.00";
                xlWorkSheet.Range["M3", "M" + lastRow].NumberFormat = "#,##0.00";
                xlWorkSheet.Range["T3", "T" + lastRow].NumberFormat = "#,##0.00";

                xlWorkSheet.Range["A3", "A" + lastRow].NumberFormat = "@";
                xlWorkSheet.Range["A3", "A" + lastRow].HorizontalAlignment = Excel.XlHAlign.xlHAlignCenter;
                xlWorkSheet.Range["C3", "E" + lastRow].HorizontalAlignment = Excel.XlHAlign.xlHAlignCenter;
                xlWorkSheet.Range["U3", "U" + lastRow].WrapText = true;

                xlWorkSheet.Columns[1].ColumnWidth = 10;
                xlWorkSheet.Columns[2].ColumnWidth = 32;
                xlWorkSheet.Columns[3].ColumnWidth = 16;
                xlWorkSheet.Columns[4].ColumnWidth = 12;
                xlWorkSheet.Columns[5].ColumnWidth = 14;
                xlWorkSheet.Columns[6].ColumnWidth = 14;
                for (int col = 7; col <= 20; col++)
                    xlWorkSheet.Columns[col].ColumnWidth = (col == 10 || col == 17) ? 17 : 12;
                xlWorkSheet.Columns[21].ColumnWidth = 34;
                xlWorkSheet.Rows[1].RowHeight = 25;
                xlWorkSheet.Rows[2].RowHeight = 48;

                Excel.Range filterRange = xlWorkSheet.Range["A2", "U" + lastRow];
                filterRange.AutoFilter(1);

                xlWorkSheet.Activate();
                xlApp.ActiveWindow.SplitRow = 2;
                xlApp.ActiveWindow.FreezePanes = true;

                string userId = Session["user_id"].ToString().Trim();
                string filename = "Leave Summary Report-" +
                    p_leave_date_from.ToString("yyyy_MM_dd") + "-" +
                    p_leave_date_to.ToString("yyyy_MM_dd") + "-" +
                    userId + "_" + DateTime.Now.ToString("yyyy_MM_dd_HHmm") + ".xlsx";
                string physicalPath = Server.MapPath("~/UploadedFile/" + filename);

                xlWorkBook.SaveAs(physicalPath, Excel.XlFileFormat.xlOpenXMLWorkbook,
                    Missing.Value, Missing.Value, Missing.Value, Missing.Value,
                    Excel.XlSaveAsAccessMode.xlNoChange,
                    Excel.XlSaveConflictResolution.xlLocalSessionChanges,
                    Missing.Value, Missing.Value, Missing.Value, Missing.Value);

                Marshal.ReleaseComObject(filterRange);
                Marshal.ReleaseComObject(numericRange);
                Marshal.ReleaseComObject(fixedHeaderRange);
                Marshal.ReleaseComObject(mainHeaders);
                Marshal.ReleaseComObject(allRange);
                Marshal.ReleaseComObject(remarksHeader);
                Marshal.ReleaseComObject(slGroup);
                Marshal.ReleaseComObject(vlGroup);

                return JSON(new { message = "success", filePath = "/UploadedFile/" + filename }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                return JSON(new { message = e.Message }, JsonRequestBehavior.AllowGet);
            }
            finally
            {
                if (xlWorkSheet != null)
                {
                    try { Marshal.ReleaseComObject(xlWorkSheet); }
                    catch { }
                }
                if (xlWorkBook != null)
                {
                    try { xlWorkBook.Close(false); }
                    catch { }
                    try { Marshal.ReleaseComObject(xlWorkBook); }
                    catch { }
                }
                if (xlApp != null)
                {
                    try { xlApp.Quit(); }
                    catch { }
                    try { Marshal.ReleaseComObject(xlApp); }
                    catch { }
                }
            }
        }

        private static object ToExcelNumber(string value)
        {
            if (String.IsNullOrWhiteSpace(value))
                return null;

            decimal number;
            string normalized = value.Replace(",", "").Trim();
            if (normalized.StartsWith("(") && normalized.EndsWith(")"))
                normalized = "-" + normalized.Substring(1, normalized.Length - 2);

            return Decimal.TryParse(normalized, NumberStyles.Any, CultureInfo.InvariantCulture, out number)
                ? (object)number
                : value;
        }

        public ActionResult RetrieveCOADetail(string p_empl_id, DateTime p_date_fr, DateTime p_date_to)
        {
            try
            {
                var data = db_ats.sp_leaveledger_report(p_empl_id, null, null, 2).Where(x=>x.created_dttm >= p_date_fr && x.created_dttm <= p_date_to).ToList();
                if (data == null || data.Count == 0)
                    return JSON(new { message = "no-data-found" }, JsonRequestBehavior.AllowGet);

                return JSON(new { message = "success", data = data.OrderBy(a=>a.created_dttm) }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                return JSON(new { message = e.Message }, JsonRequestBehavior.AllowGet);
            }
        }

    }
}
