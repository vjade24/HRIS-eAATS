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
    
    public partial class leave_application_cancel_tbl
    {
        public string leave_ctrlno { get; set; }
        public string empl_id { get; set; }
        public System.DateTime leave_cancel_date { get; set; }
        public Nullable<System.DateTime> leave_transfer_date { get; set; }
        public string reason { get; set; }
        public string leave_cancel_status { get; set; }
        public string leave_cancel_type { get; set; }
        public string approved_by { get; set; }
        public string approved_by_desig { get; set; }
        public Nullable<System.DateTime> created_dttm { get; set; }
        public string created_user { get; set; }
        public Nullable<System.DateTime> submitted_dttm { get; set; }
        public string submitted_user { get; set; }
        public Nullable<System.DateTime> final_approved_dttm { get; set; }
        public string final_approved_user { get; set; }
    }
}