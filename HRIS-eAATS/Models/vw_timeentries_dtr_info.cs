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
    
    public partial class vw_timeentries_dtr_info
    {
        public string dtr_date { get; set; }
        public Nullable<int> dtr_year { get; set; }
        public Nullable<int> dtr_month { get; set; }
        public string empl_id { get; set; }
        public string time_in_am { get; set; }
        public string time_out_am { get; set; }
        public string time_in_pm { get; set; }
        public string time_out_pm { get; set; }
        public int under_Time { get; set; }
        public string remarks_details { get; set; }
        public string time_ot_hris { get; set; }
        public string remarks_details_hris { get; set; }
        public string time_ot_hris2 { get; set; }
        public string time_entry_status { get; set; }
        public decimal time_days_equi { get; set; }
        public decimal time_hours_equi { get; set; }
        public decimal time_ot_payable { get; set; }
        public int under_time_hris { get; set; }
    }
}