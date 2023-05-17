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
                var dept_list = db.vw_departments_tbl_list.ToList();
                var data        = db_dtr.sp_dtr_from_bio_tbl_list3("", DateTime.Now.Year.ToString(), DateTime.Now.Month.ToString()).ToList();
                message = "success";

                return JSON(new {  data, message, p_empl_id,  dept_list }, JsonRequestBehavior.AllowGet);
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
                message = "success";
                return JSON(new { data ,message }, JsonRequestBehavior.AllowGet);
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
                var data = db_dtr.sp_dtr_bio_extract_list(par_empl_id, par_bio_date).ToList();
                message = "success";
                return JSON(new { data, message }, JsonRequestBehavior.AllowGet);
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
               
                if (extracttype == 1)
                {
                    if (bio_terminal == "114") // PASIAN
                    {
                        db_dtr.sp_process_biodata_2dtr_stg_shift_pagro_pasian(process_nbr, user_id).FirstOrDefault();
                    }
                    else
                    {
                        db_dtr.sp_process_biodata_2dtr_stg(process_nbr, user_id).FirstOrDefault();
                    }

                    db_dtr.sp_process_biodata_2dtr_stg_shift(process_nbr, user_id).FirstOrDefault();

                    message = "Succesfully re-run sp_process_biodata_2dtr_stg";
                }
                else if (extracttype == 2)
                {
                    db_dtr.sp_process_biodata_2dtr_stg_in(process_nbr, user_id).FirstOrDefault();
                    message = "Succesfully re-run sp_process_biodata_2dtr_stg_in";
                }
                else if (extracttype == 3)
                {
                    db_dtr.sp_process_biodata_2dtr_stg_out(process_nbr, user_id).FirstOrDefault();
                    message = "Succesfully re-run sp_process_biodata_2dtr_stg_out";
                }

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
                //var empl_names = from s in db.vw_personnelnames_tbl
                //                join r in db.personnel_tbl
                //                on s.empl_id equals r.empl_id
                //                join t in db.vw_payrollemployeemaster_hdr_tbl
                //                on s.empl_id equals t.empl_id
                //                where r.emp_status == true
                //                 where r.empl_id == empl_id
                //                 orderby s.last_name

                //                select new
                //                {
                //                    s.empl_id,
                //                    s.employee_name,
                //                    s.last_name,
                //                    s.first_name,
                //                    s.middle_name,
                //                    s.suffix_name,
                //                    s.courtisy_title,
                //                    s.postfix_name,
                //                    s.employee_name_format2,
                //                    t.department_code,
                //                    t.employment_type,
                //                };

                //var employment_type    = empl_names.FirstOrDefault().employment_type;
                //var department_code    = empl_names.FirstOrDefault().department_code;
                // var user_id            = "";
                // var par_print_generate = "";

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

                return JSON(new { message, icon = icn , dtr_gen , employment_type, department_code, session_user_id }, JsonRequestBehavior.AllowGet);
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
                var data = db.vw_personnelnames_tbl.Where(a => a.employee_name.Contains(term) || a.empl_id.Contains(term)).ToList();
                return Json(new { data }, JsonRequestBehavior.AllowGet);
            }
            else
            {
                return Json(new { data = ""}, JsonRequestBehavior.AllowGet);
            }
        }
        

    }
}