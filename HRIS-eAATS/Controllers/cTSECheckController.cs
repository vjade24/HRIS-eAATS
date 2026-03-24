using HRIS_eAATS.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Web;
using System.Web.Mvc;

namespace HRIS_eAATS.Controllers
{
    public class cTSECheckController : Controller
    {
        HRIS_DEVEntities db     = new HRIS_DEVEntities();
        HRIS_ATSEntities db_ats = new HRIS_ATSEntities();
        User_Menu um            = new User_Menu();
        // GET: cTSECheck
        public ActionResult Index()
        {
            try
            {
                if (Session["user_id"].ToString() != "")
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
            try
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
                um.user_id              = Session["user_id"].ToString();
                return um;
            }
            catch (Exception e)
            {
                string message = e.Message;
                return um;
            }
        }
        protected JsonResult JSON(object data, JsonRequestBehavior behavior)
        {
            return new JsonResult()
            {
                Data                = data,
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
                var tse_list  = db_ats.tse_check_tbl.OrderByDescending(a => a.created_dttm).ToList();
                var empl_ids  = tse_list.Select(a => a.empl_id).Distinct().ToList();
                var empl_list = db.vw_personnelnames_tbl.Where(a => empl_ids.Contains(a.empl_id)).ToList();

                var data = (from a in tse_list
                            join b in empl_list
                            on a.empl_id equals b.empl_id into grp
                            from b in grp.DefaultIfEmpty()
                            select new
                            {
                                a.empl_id,
                                employee_name = b != null ? b.employee_name : "",
                                a.tse_period_from,
                                a.tse_period_to,
                                a.created_by,
                                a.created_dttm
                            }).ToList();
                var message = "success";
                return JSON(new { message, data }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message.ToString();
                return JSON(new { message }, JsonRequestBehavior.AllowGet);
            }
        }
        public ActionResult Save(string[] empl_ids, string tse_period_from, string tse_period_to)
        {
            try
            {
                var message = "success";
                var user_id = Session["user_id"].ToString();

                if (empl_ids == null || empl_ids.Length == 0)
                {
                    message = "No employees selected.";
                    return JSON(new { message }, JsonRequestBehavior.AllowGet);
                }

                DateTime period_from = DateTime.Parse(tse_period_from);
                DateTime period_to   = DateTime.Parse(tse_period_to);

                foreach (var empl_id in empl_ids)
                {
                    var existing = db_ats.tse_check_tbl.FirstOrDefault(a => a.empl_id == empl_id
                        && a.tse_period_from == period_from
                        && a.tse_period_to == period_to);

                    if (existing == null)
                    {
                        tse_check_tbl data = new tse_check_tbl();
                        data.empl_id          = empl_id;
                        data.tse_period_from  = period_from;
                        data.tse_period_to    = period_to;
                        data.created_by       = user_id;
                        data.created_dttm     = DateTime.Now;
                        db_ats.tse_check_tbl.Add(data);
                    }
                }

                db_ats.SaveChanges();
                return JSON(new { message }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message.ToString();
                return JSON(new { message }, JsonRequestBehavior.AllowGet);
            }
        }
        public ActionResult Delete(string empl_id, string tse_period_from, string tse_period_to)
        {
            try
            {
                DateTime period_from = DateTime.Parse(tse_period_from);
                DateTime period_to   = DateTime.Parse(tse_period_to);

                var delete = db_ats.tse_check_tbl.FirstOrDefault(a => a.empl_id == empl_id
                    && a.tse_period_from == period_from
                    && a.tse_period_to == period_to);

                if (delete != null)
                {
                    db_ats.tse_check_tbl.Remove(delete);
                    db_ats.SaveChanges();
                }

                var message = "success";
                return JSON(new { message }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message.ToString();
                return JSON(new { message }, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpGet]
        [Route("search")]
        public ActionResult Search(string term)
        {
            if (!string.IsNullOrEmpty(term))
            {
                var data = from a in db.vw_personnelnames_tbl
                           join b in db.personnel_tbl
                           on a.empl_id equals b.empl_id
                           join c in db.vw_payrollemployeemaster_hdr_pos_tbl
                           on a.empl_id equals c.empl_id
                           join d in db.departments_tbl
                           on c.department_code equals d.department_code
                           where (a.employee_name.Contains(term) || a.empl_id.Contains(term) || d.department_short_name.Contains(term))
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
                           };

                return Json(new { data }, JsonRequestBehavior.AllowGet);
            }
            else
            {
                return Json(new { data = "" }, JsonRequestBehavior.AllowGet);
            }
        }
    }
}
