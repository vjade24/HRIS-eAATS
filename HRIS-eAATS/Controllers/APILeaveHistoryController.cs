using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.Description;
using HRIS_Common;
using HRIS_eAATS.Models;

namespace HRIS_eAATS.Controllers
{
    public class APILeaveHistoryController : ApiController
    {
        private HRIS_ATSEntities db = new HRIS_ATSEntities();
        private HRIS_DEVEntities db_pay = new HRIS_DEVEntities();
        CommonDB Cmn = new CommonDB();

        // GET: api/APILeaveHistory
        //public IQueryable<lv_ledger_history_tbl> Getlv_ledger_history_tbl()
        //{
        //    return db.lv_ledger_history_tbl;
        //}

        [Route("api/APILeaveHistory/Info")]
        public HttpResponseMessage Getlv_ledger_history_tbl(string leave_ctrlno)
        {
            var model = db.lv_ledger_history_tbl.Where(a => a.leave_ctrlno == leave_ctrlno).FirstOrDefault();
            return Request.CreateResponse(HttpStatusCode.OK, model, Configuration.Formatters.JsonFormatter);
        }

        [Route("api/APILeaveHistory/List")]
        public HttpResponseMessage Getlv_ledger_history_tblList(string leave_ctrlno)
        {
            var empl_id = db.leave_application_hdr_tbl.Where(a => a.leave_ctrlno == leave_ctrlno).FirstOrDefault().empl_id;
            var model = db.func_lv_ledger_history_notif(leave_ctrlno, empl_id).ToList();
            return Request.CreateResponse(HttpStatusCode.OK, model, Configuration.Formatters.JsonFormatter);
        }
        
        [Route("api/APIUser/Info")]
        public HttpResponseMessage GetHRISLogin(string username, string password)
        {
            var password1 = Cmn.EncryptString(password.Trim(), Cmn.CONST_WORDENCRYPTOR);
            var model = from s in db_pay.usersprofile_tbl.Where(s=> s.user_id == username && s.user_password == password1)
                        join r in db_pay.vw_personnelnames_tbl
                         on s.empl_id equals r.empl_id
                        select new
                        {
                             r.empl_id
                            ,r.employee_name
                            ,r.employee_name_format2
                            ,s.user_id
                            ,s.user_password
                            ,s.allow_edit_history
                            ,s.status
                            ,s.locked_account
                            ,s.change_password
                            ,s.created_date
                            ,s.created_by
                            ,s.last_updated_date
                            ,s.last_updated_by
                            ,s.user_accesslevel

                        };
            return Request.CreateResponse(HttpStatusCode.OK, model.FirstOrDefault(), Configuration.Formatters.JsonFormatter);
        }

        //// GET: api/APILeaveHistory/5
        //[ResponseType(typeof(lv_ledger_history_tbl))]
        //public async Task<IHttpActionResult> Getlv_ledger_history_tbl(int id)
        //{
        //    lv_ledger_history_tbl lv_ledger_history_tbl = await db.lv_ledger_history_tbl.FindAsync(id);
        //    if (lv_ledger_history_tbl == null)
        //    {
        //        return NotFound();
        //    }

        //    return Ok(lv_ledger_history_tbl);
        //}

        //// PUT: api/APILeaveHistory/5
        //[ResponseType(typeof(void))]
        //public async Task<IHttpActionResult> Putlv_ledger_history_tbl(int id, lv_ledger_history_tbl lv_ledger_history_tbl)
        //{
        //    if (!ModelState.IsValid)
        //    {
        //        return BadRequest(ModelState);
        //    }

        //    if (id != lv_ledger_history_tbl.id)
        //    {
        //        return BadRequest();
        //    }

        //    db.Entry(lv_ledger_history_tbl).State = EntityState.Modified;

        //    try
        //    {
        //        await db.SaveChangesAsync();
        //    }
        //    catch (DbUpdateConcurrencyException)
        //    {
        //        if (!lv_ledger_history_tblExists(id))
        //        {
        //            return NotFound();
        //        }
        //        else
        //        {
        //            throw;
        //        }
        //    }

        //    return StatusCode(HttpStatusCode.NoContent);
        //}

        //// POST: api/APILeaveHistory
        //[ResponseType(typeof(lv_ledger_history_tbl))]
        //public async Task<IHttpActionResult> Postlv_ledger_history_tbl(lv_ledger_history_tbl lv_ledger_history_tbl)
        //{
        //    if (!ModelState.IsValid)
        //    {
        //        return BadRequest(ModelState);
        //    }

        //    db.lv_ledger_history_tbl.Add(lv_ledger_history_tbl);
        //    await db.SaveChangesAsync();

        //    return CreatedAtRoute("DefaultApi", new { id = lv_ledger_history_tbl.id }, lv_ledger_history_tbl);
        //}

        //// DELETE: api/APILeaveHistory/5
        //[ResponseType(typeof(lv_ledger_history_tbl))]
        //public async Task<IHttpActionResult> Deletelv_ledger_history_tbl(int id)
        //{
        //    lv_ledger_history_tbl lv_ledger_history_tbl = await db.lv_ledger_history_tbl.FindAsync(id);
        //    if (lv_ledger_history_tbl == null)
        //    {
        //        return NotFound();
        //    }

        //    db.lv_ledger_history_tbl.Remove(lv_ledger_history_tbl);
        //    await db.SaveChangesAsync();

        //    return Ok(lv_ledger_history_tbl);
        //}

        //protected override void Dispose(bool disposing)
        //{
        //    if (disposing)
        //    {
        //        db.Dispose();
        //    }
        //    base.Dispose(disposing);
        //}

        //private bool lv_ledger_history_tblExists(int id)
        //{
        //    return db.lv_ledger_history_tbl.Count(e => e.id == id) > 0;
        //}
    }
}