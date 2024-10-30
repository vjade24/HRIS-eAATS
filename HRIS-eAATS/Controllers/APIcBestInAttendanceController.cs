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
using HRIS_eAATS.Models;

namespace HRIS_eAATS.Controllers
{
    public class APIcBestInAttendanceController : ApiController
    {
        private HRIS_ATSEntities db = new HRIS_ATSEntities();
        private HRIS_DEVEntities db_pay = new HRIS_DEVEntities();

        public partial class api_model
        {
            public string transmittal_nbr { get; set; }
            public string user_token { get; set; }
            public string received_by { get; set; }
        }

        [Route("api/APIcBestInAttendance")]
        public HttpResponseMessage Post_BestInAttendance_List(api_model data1)
        {
            var chk_token = db_pay.user_prime_token_tbl.Where(a => a.token == data1.user_token).FirstOrDefault();
            if (chk_token != null)
            {
                var data = from a in db.best_in_attendance_hdr_tbl
                           join b in db.best_in_attendance_dtl_tbl
                           on a.transmittal_nbr equals b.transmittal_nbr into gp
                           from b in gp.DefaultIfEmpty()
                           where a.transmittal_nbr == data1.transmittal_nbr
                           && a.received_dttm == null
                           && a.submitted_dttm != null
                           group b by new { a, b.transmittal_nbr } into g
                           select new
                           {
                               hdr = g.Key.a,
                               dtl = g.ToList().OrderBy(a => a.department_code)
                           };

                // Convert to a list and iterate using ForEach
                data.ToList().ForEach(item =>
                {
                    // Access header (hdr)
                    var header = item.hdr;

                    // Access details (dtl) and iterate through them
                    item.dtl.ToList().ForEach(detail =>
                    {
                        if (detail.employment_type == "REGULAR EMPLOYEES")
                        {
                            detail.employment_type = "RE";
                        }
                        else if (detail.employment_type == "CASUAL EMPLOYEES")
                        {
                            detail.employment_type = "CE";
                        }
                        else
                        {
                            detail.employment_type = "JO";
                        }
                    });
                });
                return Request.CreateResponse(HttpStatusCode.OK, data, Configuration.Formatters.JsonFormatter);
            }
            else
            {
                var data = "Token not Found!";
                return Request.CreateResponse(HttpStatusCode.OK, data, Configuration.Formatters.JsonFormatter);
            }
        }
        [Route("api/APIcBestInAttendance_Update")]
        public HttpResponseMessage Post_BestInAttendance(api_model data)
        {
            var message = "";
            try
            {
                var chk_token = db_pay.user_prime_token_tbl.Where(a => a.token == data.user_token).FirstOrDefault();
                if (chk_token != null)
                {
                    var update = db.best_in_attendance_hdr_tbl.Where(a => a.transmittal_nbr == data.transmittal_nbr && a.received_dttm == null).FirstOrDefault();
                    if (update != null)
                    {
                        update.received_by      = data.received_by;
                        update.received_dttm    = DateTime.Now;
                        db.SaveChangesAsync();
                        message = "success";
                    }
                    else
                    {
                        message = "no data found!";
                    }
                }
                else
                {
                    message = "Token not Found!";
                }
                return Request.CreateResponse(HttpStatusCode.OK, message, Configuration.Formatters.JsonFormatter);
            }
            catch (Exception e )
            {
                return Request.CreateResponse(HttpStatusCode.OK, message = e.InnerException.ToString(), Configuration.Formatters.JsonFormatter);
            }
        }
        //// GET: api/APIcBestInAttendance
        //public IQueryable<best_in_attendance_hdr_tbl> Getbest_in_attendance_hdr_tbl()
        //{
        //    return db.best_in_attendance_hdr_tbl;
        //}

        //// GET: api/APIcBestInAttendance/5
        //[ResponseType(typeof(best_in_attendance_hdr_tbl))]
        //public async Task<IHttpActionResult> Getbest_in_attendance_hdr_tbl(int id)
        //{
        //    best_in_attendance_hdr_tbl best_in_attendance_hdr_tbl = await db.best_in_attendance_hdr_tbl.FindAsync(id);
        //    if (best_in_attendance_hdr_tbl == null)
        //    {
        //        return NotFound();
        //    }

        //    return Ok(best_in_attendance_hdr_tbl);
        //}

        //// PUT: api/APIcBestInAttendance/5
        //[ResponseType(typeof(void))]
        //public async Task<IHttpActionResult> Putbest_in_attendance_hdr_tbl(int id, best_in_attendance_hdr_tbl best_in_attendance_hdr_tbl)
        //{
        //    if (!ModelState.IsValid)
        //    {
        //        return BadRequest(ModelState);
        //    }

        //    if (id != best_in_attendance_hdr_tbl.id)
        //    {
        //        return BadRequest();
        //    }

        //    db.Entry(best_in_attendance_hdr_tbl).State = EntityState.Modified;

        //    try
        //    {
        //        await db.SaveChangesAsync();
        //    }
        //    catch (DbUpdateConcurrencyException)
        //    {
        //        if (!best_in_attendance_hdr_tblExists(id))
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

        //// POST: api/APIcBestInAttendance
        //[ResponseType(typeof(best_in_attendance_hdr_tbl))]
        //public async Task<IHttpActionResult> Postbest_in_attendance_hdr_tbl(best_in_attendance_hdr_tbl best_in_attendance_hdr_tbl)
        //{
        //    if (!ModelState.IsValid)
        //    {
        //        return BadRequest(ModelState);
        //    }

        //    db.best_in_attendance_hdr_tbl.Add(best_in_attendance_hdr_tbl);
        //    await db.SaveChangesAsync();

        //    return CreatedAtRoute("DefaultApi", new { id = best_in_attendance_hdr_tbl.id }, best_in_attendance_hdr_tbl);
        //}

        //// DELETE: api/APIcBestInAttendance/5
        //[ResponseType(typeof(best_in_attendance_hdr_tbl))]
        //public async Task<IHttpActionResult> Deletebest_in_attendance_hdr_tbl(int id)
        //{
        //    best_in_attendance_hdr_tbl best_in_attendance_hdr_tbl = await db.best_in_attendance_hdr_tbl.FindAsync(id);
        //    if (best_in_attendance_hdr_tbl == null)
        //    {
        //        return NotFound();
        //    }

        //    db.best_in_attendance_hdr_tbl.Remove(best_in_attendance_hdr_tbl);
        //    await db.SaveChangesAsync();

        //    return Ok(best_in_attendance_hdr_tbl);
        //}

        //protected override void Dispose(bool disposing)
        //{
        //    if (disposing)
        //    {
        //        db.Dispose();
        //    }
        //    base.Dispose(disposing);
        //}

        //private bool best_in_attendance_hdr_tblExists(int id)
        //{
        //    return db.best_in_attendance_hdr_tbl.Count(e => e.id == id) > 0;
        //}
    }
}