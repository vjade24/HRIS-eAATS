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
    
    public partial class leavetype_tbl
    {
        public string leavetype_code { get; set; }
        public string leavetype_descr { get; set; }
        public Nullable<double> leavetype_maxperyear { get; set; }
        public Nullable<bool> leave_earn_balance { get; set; }
        public string leave_earn_occurence { get; set; }
        public string leave_earn_schedule { get; set; }
        public Nullable<bool> leave_earn_carryoverbalance_flag { get; set; }
        public Nullable<double> leave_carryover_maxbalance { get; set; }
        public Nullable<bool> leavetype_monetized_flag { get; set; }
        public string leave_earn_daycover { get; set; }
        public Nullable<double> leave_earn { get; set; }
        public Nullable<double> leavetype_minperyear { get; set; }
        public Nullable<System.DateTime> period_from { get; set; }
        public Nullable<System.DateTime> period_to { get; set; }
    }
}
