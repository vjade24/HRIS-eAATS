using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Web;
using System.Web.Mvc;
using HRIS_eAATS.Models;

namespace HRIS_eAATS.Controllers
{
    public class cBestInAttendanceController : Controller
    {
        // GET: cBestInAttendance
        HRIS_DEVEntities db     = new HRIS_DEVEntities();
        HRIS_ATSEntities db_ats = new HRIS_ATSEntities();
        User_Menu um            = new User_Menu();
        public ActionResult Index()
        {
            try
            {
                if (um != null || um.ToString() != "")
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
                return View(um);
            }
            catch (Exception)
            {
                return RedirectToAction("Index", "Login");
            }
        }
        protected ActionResult JSON(object data, JsonRequestBehavior behavior)
        {
            return new JsonResult()
            {
                Data = data,
                ContentType         = "application/json",
                ContentEncoding     = Encoding.UTF8,
                JsonRequestBehavior = behavior,
                MaxJsonLength       = Int32.MaxValue
            };
        }
        public ActionResult InitializeData()
        {
            try
            {
                var data = from a in db_ats.best_in_attendance_hdr_tbl
                           join b in db_ats.best_in_attendance_dtl_tbl
                           on a.transmittal_nbr equals b.transmittal_nbr into gp
                           from b in gp.DefaultIfEmpty()
                           group b by new { a, b.transmittal_nbr } into g
                           select new
                           {
                               hdr = g.Key.a,
                               dtl = g.ToList().OrderBy(a => a.department_code)
                           };

                return JSON(new { data, message = "success"}, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message.ToString();
                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
        }
        public ActionResult FilterGrid()
        {
            try
            {
                var data = from a in db_ats.best_in_attendance_hdr_tbl
                           join b in db_ats.best_in_attendance_dtl_tbl
                           on a.transmittal_nbr equals b.transmittal_nbr into gp
                           from b in gp.DefaultIfEmpty()
                           group b by new { a, b.transmittal_nbr } into g
                           select new
                           {
                               hdr = g.Key.a,
                               dtl = g.ToList().OrderBy(a => a.department_code)
                           };
                
                return JSON(new { data, message = "success"}, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message.ToString();
                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
        }
        public ActionResult AddMode()
        {
            try
            {
                var empl_id     = Session["user_id"].ToString().Replace("U", "");
                var prepared    = db.vw_payrollemployeemaster_hdr_pos_tbl.Where(a=>a.empl_id == empl_id).FirstOrDefault();
                var noted       = db.vw_payrollemployeemaster_hdr_pos_tbl.Where(a=>a.empl_id == "0029").FirstOrDefault();
                var approved    = db.vw_payrollemployeemaster_hdr_pos_tbl.Where(a=>a.empl_id == "0027").FirstOrDefault();
                var nbr         = db_ats.sp_generate_key("best_in_attendance_hdr_tbl", "transmittal_nbr", 8).ToList().FirstOrDefault();
                return JSON(new { message = "success",prepared,noted,approved, nbr }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message.ToString();
                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
        }
        public ActionResult Generate(best_in_attendance_hdr_tbl data)
        {
            try
            {
                db_ats.Database.CommandTimeout = int.MaxValue;
                List<sp_extract_best_attendance_Result> dtl = new List<sp_extract_best_attendance_Result>();
                var message = "";
                var chk = db_ats.best_in_attendance_hdr_tbl.Where(a => (a.period_from >= data.period_from && a.period_from <= data.period_to) 
                                                                    || (a.period_to   >= data.period_from && a.period_to   <= data.period_to)
                                                                  ).FirstOrDefault();
                if (chk == null)
                {
                    var nbr                 = db_ats.sp_generate_key("best_in_attendance_hdr_tbl", "transmittal_nbr", 8).ToList().FirstOrDefault();
                    data.transmittal_nbr    = nbr.key_value;
                    data.created_dttm       = DateTime.Now;
                    data.created_by         = Session["user_id"].ToString();
                    db_ats.best_in_attendance_hdr_tbl.Add(data);

                    dtl = db_ats.sp_extract_best_attendance(data.period_from,data.period_to,"","","").ToList();
                    if (dtl.Count>0)
                    {
                        for (int i = 0; i < dtl.Count; i++)
                        {
                            best_in_attendance_dtl_tbl dtl_insert = new best_in_attendance_dtl_tbl();
                            dtl_insert.transmittal_nbr       = data.transmittal_nbr;
                            dtl_insert.empl_id               = dtl[i].empl_id;
                            dtl_insert.employee_name         = dtl[i].employee_name;
                            dtl_insert.department_code       = dtl[i].department_code;
                            dtl_insert.department_name1      = dtl[i].department_name1;
                            dtl_insert.department_short_name = dtl[i].department_short_name;
                            dtl_insert.position_long_title   = dtl[i].position_long_title;
                            dtl_insert.employment_type       = dtl[i].employment_type;
                            dtl_insert.remarks               = "";
                            dtl_insert.remarks_others        = "";
                            dtl_insert.years_in_service      = 0;
                            dtl_insert.created_by            = Session["user_id"].ToString();
                            dtl_insert.created_dttm          = DateTime.Now;
                            db_ats.best_in_attendance_dtl_tbl.Add(dtl_insert);
                        }
                        message = "success";
                        db_ats.SaveChangesAsync();
                    }
                    else
                    {
                        message = "no data found!";
                    }
                }
                else
                {
                    message = "already exists!";
                }
                return JSON(new { data, message , dtl }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message.ToString();
                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
        }
        public ActionResult HeaderAcion(string action, best_in_attendance_hdr_tbl data)
        {
            try
            {
                var message = "";
                if (action == "delete")
                {
                    var delete      = db_ats.best_in_attendance_hdr_tbl.Where(a => a.id == data.id && a.transmittal_nbr == data.transmittal_nbr).FirstOrDefault();
                    var delete_dtl  = db_ats.best_in_attendance_dtl_tbl.Where(a => a.transmittal_nbr == data.transmittal_nbr).ToList();
                    db_ats.best_in_attendance_hdr_tbl.Remove(delete);
                    db_ats.best_in_attendance_dtl_tbl.RemoveRange(delete_dtl);
                    db_ats.SaveChanges();
                    message = "success";
                }
                else if (action == "transmit")
                {
                    var update                  = db_ats.best_in_attendance_hdr_tbl.Where(a => a.transmittal_nbr == data.transmittal_nbr).FirstOrDefault();
                    update.submitted_by         = Session["user_id"].ToString();
                    update.submitted_dttm       = DateTime.Now;
                    db_ats.SaveChanges();
                    message = "success";
                }
                else if (action == "received_null")
                {
                    var update                  = db_ats.best_in_attendance_hdr_tbl.Where(a => a.transmittal_nbr == data.transmittal_nbr).FirstOrDefault();
                    update.received_by          = "";
                    update.received_dttm        = null;
                    db_ats.SaveChanges();
                    message = "success";
                }
                else
                {
                    var update                  = db_ats.best_in_attendance_hdr_tbl.Where(a => a.transmittal_nbr == data.transmittal_nbr).FirstOrDefault();
                    update.prepared_by          = data.prepared_by;
                    update.prepared_by_desig    = data.prepared_by_desig    ;
                    update.noted_by             = data.noted_by             ;
                    update.noted_by_desig       = data.noted_by_desig       ;
                    update.approved_by          = data.approved_by          ;
                    update.approved_by_desig    = data.approved_by_desig    ;
                    update.updated_by           = Session["user_id"].ToString();
                    update.updated_dttm         = DateTime.Now;
                    db_ats.SaveChanges();
                    message = "success";
                }
                return JSON(new { data, message}, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message.ToString();
                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
        }
        public ActionResult DetailAction(string action,best_in_attendance_dtl_tbl data)
        {
            try
            {
                var message = "";
                if (action == "delete")
                {
                    var delete = db_ats.best_in_attendance_dtl_tbl.Where(a => a.transmittal_nbr == data.transmittal_nbr && a.empl_id == data.empl_id).FirstOrDefault();
                    db_ats.best_in_attendance_dtl_tbl.Remove(delete);
                    db_ats.SaveChanges();
                    message = "success";
                }
                else
                {
                    var update = db_ats.best_in_attendance_dtl_tbl.Where(a => a.transmittal_nbr == data.transmittal_nbr && a.empl_id == data.empl_id).FirstOrDefault();
                    update.remarks          = data.remarks       ;
                    update.remarks_others   = data.remarks_others;
                    update.updated_by       = Session["user_id"].ToString();
                    update.updated_dttm     = DateTime.Now;
                    db_ats.SaveChanges();
                    message = "success";
                }
                return JSON(new { data, message}, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message.ToString();
                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
        }
    }
}