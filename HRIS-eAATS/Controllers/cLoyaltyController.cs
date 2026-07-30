using HRIS_eAATS.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Web;
using System.Web.Mvc;

namespace HRIS_eAATS.Controllers
{
    public class cLoyaltyController : Controller
    {
        HRIS_DEVEntities db     = new HRIS_DEVEntities();
        HRIS_ATSEntities db_ats = new HRIS_ATSEntities();
        User_Menu um            = new User_Menu();
        // GET: cLoyalty
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
            um.allow_add            = Session["allow_add"]          == null ? 0 : (int)Session["allow_add"];
            um.allow_delete         = Session["allow_delete"]       == null ? 0 : (int)Session["allow_delete"];
            um.allow_edit           = Session["allow_edit"]         == null ? 0 : (int)Session["allow_edit"];
            um.allow_edit_history   = Session["allow_edit_history"] == null ? 0 : (int)Session["allow_edit_history"];
            um.allow_print          = Session["allow_print"]        == null ? 0 : (int)Session["allow_print"];
            um.allow_view           = Session["allow_view"]         == null ? 0 : (int)Session["allow_view"];
            um.url_name             = Session["url_name"]           == null ? "cLeaveLedger" : Session["url_name"].ToString();
            um.id                   = Session["id"]                 == null ? 2118 : (int)Session["id"];
            um.menu_name            = Session["menu_name"]          == null ? "Ledger Posting/Adjustment" : Session["menu_name"].ToString();
            um.page_title           = Session["page_title"]         == null ? "Ledger Posting/Adjustment" : Session["page_title"].ToString();
            um.user_id              = Session["user_id"].ToString();
            return um;
        }

        protected JsonResult JSON(object data, JsonRequestBehavior behavior)
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
                var departments = db.departments_tbl.OrderBy(a=> a.sort_order_dept).ToList();
                if (um != null || um.ToString() != "")
                {
                  
                }
                return JSON(new {departments}, JsonRequestBehavior.AllowGet);
            }
            catch (Exception)
            {

                return RedirectToAction("Index", "Login");
            }
        }

        public ActionResult LoadRekonLedger(string department_code,int rt_year, string rec_status )
        {
            try
            {
                var loyaltyToTrack = db.sp_loyalty_reckon_ledger(department_code, rt_year, rec_status).ToList();
                var load_status = db.sp_loyalty_tracking_status(rt_year, "").FirstOrDefault();
                if (um != null || um.ToString() != "")
                {
                }

                return JSON(new { loyaltyToTrack, load_status }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception)
            {

                return RedirectToAction("Index", "Login");
            }
        }

        public ActionResult SaveRecord(loyalty_reckon_tbl loyalty_rec, string action)
        {
            try
            {
                db.Database.CommandTimeout = Int32.MaxValue;
                loyalty_rec.created_by     = Session["user_id"].ToString();
                loyalty_rec.created_dttm   = DateTime.Now;

                var newLoyalty     = db.loyalty_reckon_tbl.Where(a => a.empl_id == loyalty_rec.empl_id && a.original_date == loyalty_rec.original_date && a.empl_id == loyalty_rec.empl_id).FirstOrDefault();
                if (action == "ADD")
                {
                    if (newLoyalty == null)
                    {
                        db.loyalty_reckon_tbl.Add(loyalty_rec);
                        db.SaveChanges();
                    }

                }
                else if (action == "DELETE")
                {
                    var existing_rec = db.loyalty_reckon_tbl.Where(a => a.id == loyalty_rec.id).FirstOrDefault();
                    if (existing_rec != null)
                    {
                        db.loyalty_reckon_tbl.Remove(existing_rec);
                        db.SaveChanges();
                        return JSON(new { message = "success" }, JsonRequestBehavior.AllowGet);
                    }
                    else
                    {
                        return JSON(new { message = "No records Found to be delete!" }, JsonRequestBehavior.AllowGet);
                    }
                }
                

                
                return JSON(new { message = "success" }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {

                return JSON(new { message =e.Message }, JsonRequestBehavior.AllowGet);
            }
        }
    }
}