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
    
    public partial class lv_lv_ledger_extract
    {
        public int id { get; set; }
        public string ledger_ctrl_no { get; set; }
        public string empl_id { get; set; }
        public string employee_name { get; set; }
        public string leaveledger_period { get; set; }
        public string leavetype_str { get; set; }
        public string leavetype_code { get; set; }
        public string leavesubtype_code { get; set; }
        public string leaveledger_particulars { get; set; }
        public Nullable<decimal> vl_earned { get; set; }
        public Nullable<decimal> vl_wp { get; set; }
        public Nullable<decimal> vl_bal { get; set; }
        public Nullable<decimal> vl_wop { get; set; }
        public Nullable<decimal> sl_earned { get; set; }
        public Nullable<decimal> sl_wp { get; set; }
        public Nullable<decimal> sl_bal { get; set; }
        public Nullable<decimal> sl_wop { get; set; }
        public Nullable<System.DateTime> leaveledger_date { get; set; }
        public Nullable<System.DateTime> leaveledger_period_actual { get; set; }
        public string leaveledger_entry_type { get; set; }
        public string approval_status { get; set; }
        public string leave_ctrlno { get; set; }
        public Nullable<System.DateTime> generated_dttm { get; set; }
        public string generated_by { get; set; }
        public Nullable<int> nbr_quarter { get; set; }
        public Nullable<System.DateTime> created_dttm { get; set; }
        public string year_extracted { get; set; }
    }
}
