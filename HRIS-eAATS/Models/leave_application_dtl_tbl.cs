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
    
    public partial class leave_application_dtl_tbl
    {
        public string leave_ctrlno { get; set; }
        public System.DateTime leave_date_from { get; set; }
        public System.DateTime leave_date_to { get; set; }
        public Nullable<decimal> date_num_day { get; set; }
        public Nullable<decimal> date_num_day_total { get; set; }
        public string empl_id { get; set; }
        public string rcrd_status { get; set; }
    }
}