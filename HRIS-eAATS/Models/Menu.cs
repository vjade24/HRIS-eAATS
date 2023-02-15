using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace HRIS_eAATS.Models
{
    public class User_Menu : sp_user_menu_access_role_list_ATS_Result
    {
        public string username { get; set; }
    }

}