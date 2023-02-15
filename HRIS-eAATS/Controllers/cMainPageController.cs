using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace HRIS_eAATS.Controllers
{
    public class cMainPageController : Controller
    {
        // GET: cMainPage
        public ActionResult Index()
        {
            return View();
        }
    }
}