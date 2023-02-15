using CrystalDecisions.CrystalReports.Engine;
using CrystalDecisions.Shared;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Web;
using System.Web.Mvc;


namespace HRIS_eAATS.Controllers
{
    public class ReportsController : Controller
    {
        // GET: Reports
        public ActionResult Index()
        {

            Session["ReportName"]   = Request.QueryString["ReportName"].Trim();
            Session["SaveName"]     = Request.QueryString["SaveName"].Trim();
            Session["ReportType"]   = Request.QueryString["ReportType"].Trim();
            Session["ReportPath"]   = Request.QueryString["ReportPath"].Trim();
            Session["Sp"]           = Request.QueryString["Sp"].Trim();
            
            return View();
        }
        public ActionResult toCrystalData()
        {
            var ReportName = Session["ReportName"];
            var SaveName = Session["SaveName"];
            var ReportType = Session["ReportType"];
            var ReportPath = Session["ReportPath"];
            var Sp = Session["Sp"];
            var isUserLogin = Session["user_id"];
            return Json(new
            {
                ReportName = ReportName,
                SaveName = SaveName,
                ReportType = ReportType,
                ReportPath = ReportPath,
                Sp = Sp,
                isUserLogin = isUserLogin
            }, JsonRequestBehavior.AllowGet);
        }


        public ActionResult SessionRemove()
        {
            Session.Remove("ReportName");
            Session.Remove("SaveName");
            Session.Remove("ReportType");
            Session.Remove("ReportPath");
            Session.Remove("Sp");
            return Json("success", JsonRequestBehavior.AllowGet);
        }

        public ActionResult PrintMe()
        {
            string message = "success";
           
            return Json(new
            {
                message
            }, JsonRequestBehavior.AllowGet);
        }
    }
}