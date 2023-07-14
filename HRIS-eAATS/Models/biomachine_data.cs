using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace HRIS_eAATS.Models
{
    public class biomachine_data
    {

        public int MachineNumber { get; set; }
        public int IndRegID { get; set; }
        public string DateTimeRecord { get; set; }
        public int VerifyMode { get; set; }
        public int InOutMode { get; set; }
        public int WorkCode { get; set; }
        
      

        public String DateOnlyRecord
        {
            get { return DateTime.Parse(DateTimeRecord).ToString("yyyy-MM-dd"); }
            set { }
        }
        public String TimeOnlyRecord
        {
            get { return DateTime.Parse(DateTimeRecord).ToString("hh:mm:ss tt"); }
            set { }
        }
    }
}