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
    
    public partial class sp_get_number_force_leave_plan_Result
    {
        public int appr_ctrl { get; set; }
        public string flp_year { get; set; }
        public string empl_id { get; set; }
        public Nullable<System.DateTime> flp_application_date { get; set; }
        public string approval_status { get; set; }
        public Nullable<bool> posting_status { get; set; }
        public string approval_id { get; set; }
        public string details_remarks { get; set; }
        public Nullable<double> leavetype_maxperyear { get; set; }
    }
}
