﻿using System;
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

        [Route("api/APIcBestInAttendance")]
        public HttpResponseMessage Get_BestInAttendance(string transmittal_nbr)
        {
            var data = from a in db.best_in_attendance_hdr_tbl
                       join b in db.best_in_attendance_dtl_tbl
                       on a.transmittal_nbr equals b.transmittal_nbr into gp
                       from b in gp.DefaultIfEmpty()
                       where a.transmittal_nbr == transmittal_nbr
                       && a.received_dttm == null
                       group b by new { a, b.transmittal_nbr } into g
                       select new
                       {
                           hdr = g.Key.a,
                           dtl = g.ToList().OrderBy(a => a.department_code)
                       };
            return Request.CreateResponse(HttpStatusCode.OK, data, Configuration.Formatters.JsonFormatter);
        }
        [Route("api/APIcBestInAttendance_Update")]
        public HttpResponseMessage Put_BestInAttendance(best_in_attendance_hdr_tbl data)
        {
            var message = "";
            try
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