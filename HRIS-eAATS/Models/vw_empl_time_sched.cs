//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated from a template.
//
//     Manual changes to this file may cause unexpected behavior in your application.
//     Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace HRIS_eAATS.Models
{
    using System;
    using System.Collections.Generic;
    
    public partial class vw_empl_time_sched
    {
        public string empl_id { get; set; }
        public System.DateTime tse_date { get; set; }
        public string tse_day_parent { get; set; }
        public string tse_in_am { get; set; }
        public string pre_time_in_hrs { get; set; }
        public string tse_out_am { get; set; }
        public string tse_in_pm { get; set; }
        public string tse_out_pm { get; set; }
        public string post_time_out_hrs { get; set; }
        public string tse_month { get; set; }
        public string tse_year { get; set; }
        public string ts_code { get; set; }
        public string tse_dtl_id { get; set; }
        public int ts_add_days { get; set; }
        public bool ts_mid_break { get; set; }
        public double ts_day_equivalent { get; set; }
        public string shift_flag { get; set; }
    }
}