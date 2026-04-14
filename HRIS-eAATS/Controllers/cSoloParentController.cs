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
    public class cSoloParentController : Controller
    {
        HRIS_DEVEntities db     = new HRIS_DEVEntities();
        HRIS_ATSEntities db_ats = new HRIS_ATSEntities();
        User_Menu um            = new User_Menu();
        // GET: cLeaveCard
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
                var data = db_ats.solo_parent_tbl.ToList();
                var message = "success";
                return JSON(new { message, data }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message.ToString();
                return JSON(new { message }, JsonRequestBehavior.AllowGet);
            }
        }
        public ActionResult Save(solo_parent_tbl data, string action)
        {
            try
            {
                var message = "success";
                if (action == "ADD")
                {
                    data.created_at = DateTime.Now;
                    data.created_by = Session["user_id"].ToString();
                    data.valid_year = data.valid_until.Value.Year;
                    db_ats.solo_parent_tbl.Add(data);
                    db_ats.SaveChanges();
                }
                else
                {
                    var upd = db_ats.solo_parent_tbl.Where(a => a.id == data.id).FirstOrDefault();
                    upd.empl_id               = data.empl_id                ;
                    upd.employee_name         = data.employee_name          ;
                    upd.department_code       = data.department_code        ;
                    upd.department_short_name = data.department_short_name  ;
                    upd.solo_parent_no        = data.solo_parent_no         ;
                    upd.valid_until           = data.valid_until            ;
                    upd.updated_at            = DateTime.Now;
                    upd.updated_by            = Session["user_id"].ToString();
                    upd.solo_parent_category  = data.solo_parent_category;
                    upd.qualification_code    = data.qualification_code;
                    upd.valid_year            = data.valid_until.Value.Year;
                    db_ats.SaveChanges();
                }
                return JSON(new { message, data }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message.ToString();
                return JSON(new { message }, JsonRequestBehavior.AllowGet);
            }
        }
        public ActionResult Delete(int id)
        {
            try
            {
                var delete = db_ats.solo_parent_tbl.Where(a=>a.id == id).FirstOrDefault();
                db_ats.solo_parent_tbl.Remove(delete);
                db_ats.SaveChanges();
                var message = "success";
                return JSON(new { message }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message.ToString();
                return JSON(new { message }, JsonRequestBehavior.AllowGet);
            }
        }
        public ActionResult RetrieveLeave(string empl_id)
        {
            try
            {
                var p_year = DateTime.Now.Year;
                var data = from a in db_ats.leave_application_hdr_tbl
                             join b in db_ats.leave_application_dtl_tbl
                             on new { a.empl_id, a.leave_ctrlno } equals new { b.empl_id, b.leave_ctrlno }
                             where a.leave_type_code == "PS"
                                && (b.leave_date_from.Year == p_year || b.leave_date_to.Year == p_year)
                                && a.empl_id == empl_id
                                && a.approval_status == "F"
                                && a.posting_status == true
                             orderby a.last_name
                             select new
                             {
                                 a.empl_id,
                                 a.last_name,
                                 a.first_name,
                                 a.middle_name,
                                 a.leave_ctrlno,
                                 b.leave_date_from,
                                 b.leave_date_to
                             };
                return JSON(new { data, message="success" }, JsonRequestBehavior.AllowGet);
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
                //var data = db.vw_personnelnames_tbl.Where(a => a.employee_name.Contains(term) || a.empl_id.Contains(term)).ToList();
                var data = from a in db.vw_personnelnames_tbl
                           join b in db.personnel_tbl 
                           on a.empl_id equals b.empl_id
                           //join bb in db.personnelstatutory_tbl
                           //on a.empl_id equals bb.empl_id
                           join c in db.vw_payrollemployeemaster_hdr_pos_tbl 
                           on a.empl_id equals c.empl_id //into grp_master
                           //from c in grp_master.DefaultIfEmpty()
                           join d in db.departments_tbl
                           on c.department_code equals d.department_code //into grp_dep
                           //from d in grp_dep.DefaultIfEmpty()
                           where (a.employee_name.Contains(term) || a.empl_id.Contains(term) || d.department_short_name.Contains(term))
                           //&& (bb.stat_ques40c == true || bb.stat_ques40a_dtl != "")
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
                return Json(new { data = ""}, JsonRequestBehavior.AllowGet);
            }
        }
    }
}