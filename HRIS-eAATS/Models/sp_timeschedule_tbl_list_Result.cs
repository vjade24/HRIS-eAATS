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
    
    public partial class sp_timeschedule_tbl_list_Result
    {
        public string ts_code { get; set; }
        public string ts_descr { get; set; }
        public string ts_am_in { get; set; }
        public string pre_time_in_hrs { get; set; }
        public string ts_am_out { get; set; }
        public string ts_pm_in { get; set; }
        public string ts_pm_out { get; set; }
        public string post_time_out_hrs { get; set; }
        public int ts_add_days { get; set; }
        public bool ts_mid_break { get; set; }
        public double ts_day_equivalent { get; set; }
    }
}
