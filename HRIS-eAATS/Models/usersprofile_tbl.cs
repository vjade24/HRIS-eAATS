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
    
    public partial class usersprofile_tbl
    {
        public string user_id { get; set; }
        public string user_password { get; set; }
        public string empl_id { get; set; }
        public Nullable<bool> allow_edit_history { get; set; }
        public Nullable<bool> status { get; set; }
        public Nullable<bool> locked_account { get; set; }
        public Nullable<bool> change_password { get; set; }
        public Nullable<System.DateTime> created_date { get; set; }
        public string created_by { get; set; }
        public Nullable<System.DateTime> last_updated_date { get; set; }
        public string last_updated_by { get; set; }
        public string user_accesslevel { get; set; }
    }
}