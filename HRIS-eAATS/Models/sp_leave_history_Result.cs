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
    
    public partial class sp_leave_history_Result
    {
        public string leave_ctrlno { get; set; }
        public string empl_id { get; set; }
        public string employee_name { get; set; }
        public System.DateTime date_applied { get; set; }
        public string leave_dates { get; set; }
        public string leave_type_code { get; set; }
        public string leave_subtype_code { get; set; }
        public string leavetype_descr { get; set; }
        public string leavesubtype_descr { get; set; }
        public string appl_status { get; set; }
        public string appl_remarks { get; set; }
        public string approval_status { get; set; }
        public string approval_status_descr { get; set; }
        public bool posting_status { get; set; }
    }
}
