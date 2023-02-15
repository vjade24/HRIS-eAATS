//**********************************************************************************
// PROJECT NAME     :   HRIS - eComval
// VERSION/RELEASE  :   HRIS Release #1
// PURPOSE          :   Common Class/Method/Object for Database Operations
//**********************************************************************************
// REVISION HISTORY
//**********************************************************************************
// AUTHOR                    DATE            PURPOSE
//----------------------------------------------------------------------------------
// ARIEL CABUNGCAL (AEC)      09/07/2018      Code Creation
//**********************************************************************************

using System;
using System.Data;
using System.Web.UI.WebControls;
using System.Data.SqlClient;
using System.Configuration;
using System.Data.OleDb;

using System.Security.Cryptography;
using System.Text;
using System.IO;

namespace HRIS_Common
{
	//****************************************************************
	// Purpose      :   Create Class for all Database related methods
	// Created By   :   Ariel Cabungcal (AEC)
	// Date Created :   09/07/2018
	//****************************************************************
	class CommonDB
	{

		public CommonDB()
		{
		}

		//********************************************************************
		//  BEGIN - AEC- 09/07/2018 - Define the list of data type to be used
		//                      in creating insert, update and delete scripts
		//********************************************************************
		enum dbdtcolumntype
		{
			Boolean,
			Byte,
			Char,
			Date,
			DateTime,
			Decimal,
			Double,
			Int16,
			Int32,
			Int64,
			SByte,
			Single,
			String,
			TimeSpan,
			UInt16,
			UInt32,
			UInt64,
			image,
			Int,
			Float,
			Varchar,
			Nvarchar,
			VarcharMax,
			NvarcharMax,
			bigint

		}
		enum sqlactions
		{
			select,
			insert,
			update,
			delete
		}

        //********************************************************************
        //  END - AEC- 09/07/2018 
        //********************************************************************

        // Database Connection string variable
        const string connectstring = "cnHRIS";
        //const string connectstring_ePAccount = "cnHRIS_ePAccount";

		//********************************************************************
		// Purpose      :   Create Public Constant Variables
		// Method Name  :   {N/A}
		// Created By   :   Ariel Cabungcal (AEC)
		// Date Created :   09/18/2018
		//********************************************************************
		public string BODY_LINE = "";
		public string CONST_WORDENCRYPTOR = "userprofile";

		public string CONST_ADD = "ADD";
		public string CONST_EDIT = "EDIT";
		public string CONST_SORTASC = "ASC";
		public string CONST_SORTDESC = "DESC";
		public string CONST_NEWREC = "New Record Successfully Added";
		public string CONST_EDITREC = "Current Record Successfully Updated";
		public string CONST_RQDFLD = "required field";
		public string CONST_INVALID_NUMERIC = "Invalid Numeric Value";

		public string CONST_CURRENTROW
		{ get { return "C"; } set { CONST_CURRENTROW = value; } }

		public string CONST_HISTORICALROW
		{ get { return "H"; } set {CONST_HISTORICALROW = value;} }

		public string CONST_FUTUREROW 
		{ get { return "F"; } set { CONST_CURRENTROW = value; } }

		public const string CONST_APPR_STAT_NEW = "N";
		public const string CONST_APPR_STAT_SUBMITTED = "S";
		public const string CONST_APPR_STAT_PENDING = "C";
		public const string CONST_APPR_STAT_REVIEWED = "R";
		public const string CONST_APPR_STAT_APPROVED = "F";
		public const string CONST_APPR_STAT_LVL1APPROVED = "1";
		public const string CONST_APPR_STAT_LVL2APPROVED = "2";
		public const string CONST_APPR_STAT_DISAPPROVED = "D";
		public const string CONST_APPR_STAT_CANCELLED = "L";

		public string CONST_APPR_STAT_NEW_DESCR
		{ get { return "New"; } }

		public string CONST_APPR_STAT_PENDING_DESCR 
		{ get { return "Cancel Pending"; } }

		public string CONST_APPR_STAT_SUBMITTED_DESCR 
		{ get { return "Submitted"; } }

		public string CONST_APPR_STAT_VIEWING 
		{ get { return "X"; } }

		public string CONST_APPR_STAT_VIEWING_DESCR 
		{ get { return "NO_STATUS"; } }


		// This size of the IV (in bytes) must = (keysize / 8).  Default keysize is 256, so the IV must be
		// 32 bytes long.  Using a 16 character string here gives us 32 bytes when converted to a byte array.
		private const string initVector = "pemgail9uzpgzl88";
		// This constant is used to determine the keysize of the encryption algorithm
		private const int keysize = 256;
		//*********************************************************************************
		// Purpose      :   Create method to define Datatable based on SQL Select Parameter
		// Method Name  :   GetDatatable
		// Created By   :   Ariel Cabungcal (JMTJR)
		// Date Created :   10/18/2018
		//*********************************************************************************
		public string EncryptString(string plainText, string passPhrase)
		{
			byte[] initVectorBytes = Encoding.UTF8.GetBytes(initVector);
			byte[] plainTextBytes = Encoding.UTF8.GetBytes(plainText);
			PasswordDeriveBytes password = new PasswordDeriveBytes(passPhrase, null);
			byte[] keyBytes = password.GetBytes(keysize / 8);
			RijndaelManaged symmetricKey = new RijndaelManaged();
			symmetricKey.Mode = CipherMode.CBC;
			ICryptoTransform encryptor = symmetricKey.CreateEncryptor(keyBytes, initVectorBytes);
			MemoryStream memoryStream = new MemoryStream();
			CryptoStream cryptoStream = new CryptoStream(memoryStream, encryptor, CryptoStreamMode.Write);
			cryptoStream.Write(plainTextBytes, 0, plainTextBytes.Length);
			cryptoStream.FlushFinalBlock();
			byte[] cipherTextBytes = memoryStream.ToArray();
			memoryStream.Close();
			cryptoStream.Close();
			return Convert.ToBase64String(cipherTextBytes);
		}
		//Decrypt
		public string DecryptString(string cipherText, string passPhrase)
		{
			byte[] initVectorBytes = Encoding.UTF8.GetBytes(initVector);
			byte[] cipherTextBytes = Convert.FromBase64String(cipherText);
			PasswordDeriveBytes password = new PasswordDeriveBytes(passPhrase, null);
			byte[] keyBytes = password.GetBytes(keysize / 8);
			RijndaelManaged symmetricKey = new RijndaelManaged();
			symmetricKey.Mode = CipherMode.CBC;
			ICryptoTransform decryptor = symmetricKey.CreateDecryptor(keyBytes, initVectorBytes);
			MemoryStream memoryStream = new MemoryStream(cipherTextBytes);
			CryptoStream cryptoStream = new CryptoStream(memoryStream, decryptor, CryptoStreamMode.Read);
			byte[] plainTextBytes = new byte[cipherTextBytes.Length];
			int decryptedByteCount = cryptoStream.Read(plainTextBytes, 0, plainTextBytes.Length);
			memoryStream.Close();
			cryptoStream.Close();
			return Encoding.UTF8.GetString(plainTextBytes, 0, decryptedByteCount);
		}

		public void UpdatePersonnelUserAccess(string parmvalue1, string parmvalue2)
		//***********************************************************************************************************************
		// Purpose      :   Update Personnel Status in personnel_table and Update User Access
		// Method Name  :   UpdatePersonnelUserAccess
		// Created By   :   Ariel Cabungcal (AEC)
		// Date Created :   10/19/2018
		//***********************************************************************************************************************
		{
			SqlConnection conn = null;
			try
			{
				conn = ConnectDB();
				conn.Open();
				SqlCommand cmd = new SqlCommand("sp_update_status_personnel_tbl", conn);
				cmd.CommandType = CommandType.StoredProcedure;
				cmd.Parameters.Add("@par_empl_id", SqlDbType.VarChar).Value = parmvalue1;
				cmd.Parameters.Add("@par_status_detail", SqlDbType.VarChar).Value = parmvalue2;

				cmd.ExecuteNonQuery();

			}
			catch (Exception)
			{
			}
			finally
			{
				if (conn != null)
				{
					conn.Close();
				}
			}
		}

		//****************************************************************
		// Purpose      :   Create Connection Object
		// Method Name  :   ConnectDB
		// Created By   :   Ariel Cabungcal (AEC)
		// Date Created :   09/07/2018
		//****************************************************************
		public SqlConnection ConnectDB()
		{
			try
			{
				string ConnectString = ConfigurationManager.ConnectionStrings[connectstring].ConnectionString;
				SqlConnection conn;
				conn = new SqlConnection(ConnectString);
				return conn;
			}
			catch (Exception)
			{
				return null;
			}
		}
        //****************************************************************
        // Purpose      :   Create Connection Object
        // Method Name  :   ConnectDB
        // Created By   :   Ariel Cabungcal (AEC)
        // Date Created :   09/07/2018
        //****************************************************************
        public SqlConnection ConnectDB_ePAccount()
        {
            try
            {
                string ConnectString = ConfigurationManager.ConnectionStrings[connectstring].ConnectionString;
                SqlConnection conn;
                conn = new SqlConnection(ConnectString);
                return conn;
            }
            catch (Exception)
            {
                return null;
            }
        }
        //*********************************************************************************
        // Purpose      :   Create method to define Datatable based on SQL Select Parameter
        // Method Name  :   GetDatatable
        // Created By   :   Ariel Cabungcal (AEC)
        // Date Created :   09/07/2018
        //*********************************************************************************
        public DataTable GetDatatable(string selectstring)
		{
			SqlConnection con;
			DataTable dt = new DataTable();
			DataSet ds  = new DataSet();
			SqlDataAdapter sda;
			con = ConnectDB();
			sda = new SqlDataAdapter(selectstring, con);
			sda.Fill(ds);
			dt = ds.Tables[0];
			return dt;
		}

		//*********************************************************************************
		// Purpose      :   Create method to define Dataset based on SQL Select Parameter
		// Method Name  :   GetDatatable
		// Created By   :   Ariel Cabungcal (AEC)
		// Date Created :   09/07/2018
		//*********************************************************************************
		public DataSet GetDataSet(string selectstring)
		{
			try
			{
				SqlConnection con;
				DataSet ds = new DataSet();
				SqlDataAdapter sda;
				con = ConnectDB();
				sda = new SqlDataAdapter(selectstring, con);
				sda.Fill(ds);
				return ds;
			}

			catch (Exception)
			{
				return null;
			}
		}

		//***********************************************************************************************************************
		// Purpose      :   Create Overloaded Datatable object based SQL script (stored prodecure) with no parameters
		// Method Name  :   RetrieveData
		// Created By   :   Ariel Cabungcal (AEC)
		// Date Created :   09/07/2018
		//***********************************************************************************************************************
		public DataTable RetrieveData(string sp_script)
		{
			try
			{
				DataTable dt = new DataTable();
				string connStr = System.Configuration.ConfigurationManager.ConnectionStrings[connectstring].ConnectionString;
				using (SqlConnection cn = new SqlConnection(connStr))
				{
					SqlCommand cmd = new SqlCommand(sp_script, cn);
					cmd.CommandType = CommandType.StoredProcedure;
					SqlDataAdapter adp = new SqlDataAdapter(cmd);
					adp.Fill(dt);
				}
				return dt;
			}
			catch (Exception)
			{
				return null;
			}

		}
		//***********************************************************************************************************************
		// Purpose      :   Create Overloaded Datatable object based SQL script (stored prodecure) with two string parameters
		// Method Name  :   RetrieveData
		// Created By   :   Ariel Cabungcal (AEC)
		// Date Created :   09/07/2018
		//***********************************************************************************************************************
		public DataTable RetrieveData(string sp_script, string parmagr1, string parmvalue1)
		{
			//try
			//{
				DataTable dt = new DataTable();
				string connStr = System.Configuration.ConfigurationManager.ConnectionStrings[connectstring].ConnectionString;
				using (SqlConnection cn = new SqlConnection(connStr))
				{
					SqlCommand cmd = new SqlCommand(sp_script, cn);
					cmd.CommandType = CommandType.StoredProcedure;
					SqlDataAdapter adp = new SqlDataAdapter(cmd);
					cmd.Parameters.Add("@" + parmagr1, SqlDbType.VarChar).Value = parmvalue1;
					adp.Fill(dt);
				}
				return dt;
			//}
			//catch (Exception ex)
			//{
			//    return ex.Message;
			//}

		}
		//***********************************************************************************************************************
		// Purpose      :   Create Overloaded Datatable object based SQL script (stored prodecure) with one string parameter
		//                  and 1 decimal paramater
		// Method Name  :   RetrieveData
		// Created By   :   Ariel Cabungcal (AEC)
		// Date Created :   09/07/2018
		//***********************************************************************************************************************
		public DataTable RetrieveData(string sp_script, string parmagr1, decimal parmvalue1)
		{
			try
			{
				DataTable dt = new DataTable();
				string connStr = System.Configuration.ConfigurationManager.ConnectionStrings[connectstring].ConnectionString;
				using (SqlConnection cn = new SqlConnection(connStr))
				{
					SqlCommand cmd = new SqlCommand(sp_script, cn);
					cmd.CommandType = CommandType.StoredProcedure;
					SqlDataAdapter adp = new SqlDataAdapter(cmd);
					cmd.Parameters.Add("@" + parmagr1, SqlDbType.Decimal).Value = parmvalue1;
					adp.Fill(dt);
				}
				return dt;
			}
			catch (Exception)
			{
				return null;
			}

		}
		//***********************************************************************************************************************
		// Purpose      :   Create Overloaded Datatable object based SQL script (stored prodecure) with one string parameter
		//                  and 1 int paramater
		// Method Name  :   RetrieveData
		// Created By   :   Ariel Cabungcal (AEC)
		// Date Created :   09/07/2018
		//***********************************************************************************************************************
		public DataTable RetrieveData(string sp_script, string parmagr1, int parmvalue1)
		{
			try
			{
				DataTable dt = new DataTable();
				string connStr = System.Configuration.ConfigurationManager.ConnectionStrings[connectstring].ConnectionString;
				using (SqlConnection cn = new SqlConnection(connStr))
				{
					SqlCommand cmd = new SqlCommand(sp_script, cn);
					cmd.CommandType = CommandType.StoredProcedure;
					SqlDataAdapter adp = new SqlDataAdapter(cmd);
					cmd.Parameters.Add("@" + parmagr1, SqlDbType.Int).Value = parmvalue1;
					adp.Fill(dt);
				}
				return dt;
			}
			catch (Exception)
			{
				return null;
			}

		}
		//***********************************************************************************************************************
		// Purpose      :   Create Overloaded Datatable object based SQL script (stored prodecure) with one string parameter
		//                  and 1 int paramater
		// Method Name  :   RetrieveData
		// Created By   :   Ariel Cabungcal (AEC)
		// Date Created :   09/07/2018
		//***********************************************************************************************************************
		public DataTable RetrieveData(string sp_script, string parmagr1, string parmvalue1, string parmagr2, string parmvalue2)
		{
			try
			{
				DataTable dt = new DataTable();
				string connStr = System.Configuration.ConfigurationManager.ConnectionStrings[connectstring].ConnectionString;
				using (SqlConnection cn = new SqlConnection(connStr))
				{
					SqlCommand cmd = new SqlCommand(sp_script, cn);
					cmd.CommandType = CommandType.StoredProcedure;
					SqlDataAdapter adp = new SqlDataAdapter(cmd);
					cmd.Parameters.Add("@" + parmagr1, SqlDbType.VarChar).Value = parmvalue1;
					cmd.Parameters.Add("@" + parmagr2, SqlDbType.VarChar).Value = parmvalue2;
					adp.Fill(dt);
				}
				return dt;
			}
			catch (Exception)
			{
				return null;
			}

		}

		//***********************************************************************************************************************
		// Purpose      :   Create Overloaded Datatable object based SQL script (stored prodecure) with one string parameter
		//                  and 1 int paramater
		// Method Name  :   RetrieveData
		// Created By   :   Ariel Cabungcal (AEC)
		// Date Created :   09/07/2018
		//***********************************************************************************************************************
		public DataTable RetrieveData(string sp_script, string parmagr1, string parmvalue1, string parmagr2, int parmvalue2)
		{
			try
			{
				DataTable dt = new DataTable();
				string connStr = System.Configuration.ConfigurationManager.ConnectionStrings[connectstring].ConnectionString;
				using (SqlConnection cn = new SqlConnection(connStr))
				{
					SqlCommand cmd = new SqlCommand(sp_script, cn);
					cmd.CommandType = CommandType.StoredProcedure;
					SqlDataAdapter adp = new SqlDataAdapter(cmd);
					cmd.Parameters.Add("@" + parmagr1, SqlDbType.VarChar).Value = parmvalue1;
					cmd.Parameters.Add("@" + parmagr2, SqlDbType.Int).Value = parmvalue2;
					adp.Fill(dt);
				}
				return dt;
			}
			catch (Exception)
			{
				return null;
			}

		}

		//***********************************************************************************************************************
		// Purpose      :   Create Overloaded Datatable object based SQL script (stored prodecure) with one string parameter
		//                  and 1 int paramater
		// Method Name  :   RetrieveData
		// Created By   :   Ariel Cabungcal (AEC)
		// Date Created :   09/07/2018
		//***********************************************************************************************************************
		public DataTable RetrieveData(string sp_script, string parmagr1, int parmvalue1, string parmagr2, string parmvalue2)
		{
			try
			{
				DataTable dt = new DataTable();
				string connStr = System.Configuration.ConfigurationManager.ConnectionStrings[connectstring].ConnectionString;
				using (SqlConnection cn = new SqlConnection(connStr))
				{
					SqlCommand cmd = new SqlCommand(sp_script, cn);
					cmd.CommandType = CommandType.StoredProcedure;
					SqlDataAdapter adp = new SqlDataAdapter(cmd);
					cmd.Parameters.Add("@" + parmagr1, SqlDbType.Int).Value = parmvalue1;
					cmd.Parameters.Add("@" + parmagr2, SqlDbType.VarChar).Value = parmvalue2;
					adp.Fill(dt);
				}
				return dt;
			}
			catch (Exception)
			{
				return null;
			}
		}

		//***********************************************************************************************************************
		// Purpose      :   Create Overloaded Datatable object based SQL script (stored prodecure) with one string parameter
		//                  and 1 int paramater
		// Method Name  :   RetrieveData
		// Created By   :   Ariel Cabungcal (AEC)
		// Date Created :   09/07/2018
		//***********************************************************************************************************************
		public DataTable RetrieveData(string sp_script, string parmagr1, int parmvalue1, string parmagr2, int parmvalue2)
		{
			try
			{
				DataTable dt = new DataTable();
				string connStr = System.Configuration.ConfigurationManager.ConnectionStrings[connectstring].ConnectionString;
				using (SqlConnection cn = new SqlConnection(connStr))
				{
					SqlCommand cmd = new SqlCommand(sp_script, cn);
					cmd.CommandType = CommandType.StoredProcedure;
					SqlDataAdapter adp = new SqlDataAdapter(cmd);
					cmd.Parameters.Add("@" + parmagr1, SqlDbType.Int).Value = parmvalue1;
					cmd.Parameters.Add("@" + parmagr2, SqlDbType.Int).Value = parmvalue2;
					adp.Fill(dt);
				}
				return dt;
			}
			catch (Exception)
			{
				return null;
			}

		}

		//***********************************************************************************************************************
		// Purpose      :   Create Overloaded Datatable object based SQL script (stored prodecure) with one string parameter
		//                  and 1 int paramater
		// Method Name  :   RetrieveData
		// Created By   :   Ariel Cabungcal (AEC)
		// Date Created :   09/07/2018
		//***********************************************************************************************************************
		public DataTable RetrieveData(string sp_script, string parmagr1, string parmvalue1, string parmagr2, string parmvalue2, string parmagr3, string parmvalue3, string parmagr4, string parmvalue4)
		{
			try
			{
				DataTable dt = new DataTable();
				string connStr = System.Configuration.ConfigurationManager.ConnectionStrings[connectstring].ConnectionString;
				using (SqlConnection cn = new SqlConnection(connStr))
				{
					SqlCommand cmd = new SqlCommand(sp_script, cn);
					cmd.CommandType = CommandType.StoredProcedure;
					SqlDataAdapter adp = new SqlDataAdapter(cmd);
					cmd.Parameters.Add("@" + parmagr1, SqlDbType.VarChar).Value = parmvalue1;
					cmd.Parameters.Add("@" + parmagr2, SqlDbType.VarChar).Value = parmvalue2;
					cmd.Parameters.Add("@" + parmagr3, SqlDbType.VarChar).Value = parmvalue3;
					cmd.Parameters.Add("@" + parmagr4, SqlDbType.VarChar).Value = parmvalue4;
					adp.Fill(dt);
				}
				return dt;
			}
			catch (Exception)
			{
				return null;
			}

		}

		//***********************************************************************************************************************
		// Purpose      :   Create Overloaded Datatable object based SQL script (stored prodecure) with one string parameter
		//                  and 1 int paramater
		// Method Name  :   RetrieveData
		// Created By   :   Ariel Cabungcal (AEC)
		// Date Created :   09/07/2018
		//***********************************************************************************************************************
		public DataTable RetrieveData(string sp_script, string parmagr1, string parmvalue1, string parmagr2, string parmvalue2, string parmagr3, string parmvalue3)
		{
			try
			{
				DataTable dt = new DataTable();
				string connStr = System.Configuration.ConfigurationManager.ConnectionStrings[connectstring].ConnectionString;
				using (SqlConnection cn = new SqlConnection(connStr))
				{
					SqlCommand cmd = new SqlCommand(sp_script, cn);
					cmd.CommandType = CommandType.StoredProcedure;
					SqlDataAdapter adp = new SqlDataAdapter(cmd);
					cmd.Parameters.Add("@" + parmagr1, SqlDbType.VarChar).Value = parmvalue1;
					cmd.Parameters.Add("@" + parmagr2, SqlDbType.VarChar).Value = parmvalue2;
					cmd.Parameters.Add("@" + parmagr3, SqlDbType.VarChar).Value = parmvalue3;
					adp.Fill(dt);
				}
				return dt;
			}
			catch (Exception)
			{
				return null;
			}

		}
        //***********************************************************************************************************************
        // Purpose      :   Update Data to Back End Database
        // Method Name  :   UpdateTable
        // Created By   :   Ariel Cabungcal (AEC)
        // Date Created :   10/02/2018
        //***********************************************************************************************************************

        public string updatetable_for_image(string tablenamescript, string setparm, Byte[] update_img, string whereparm)
        {
            SqlConnection conn = null;
            string msg = "";
            try
            {
                try
                {
                    conn = ConnectDB();
                    conn.Open();
                    string cmd = "UPDATE " + tablenamescript + " SET " + setparm + " = @image " + whereparm;
                    SqlCommand deletecomd = new SqlCommand(cmd, conn);
                    SqlParameter imageParamenter = deletecomd.Parameters.Add("@image", SqlDbType.Binary);
                    imageParamenter.Value = update_img;
                    imageParamenter.Size = update_img.Length;

                    int retvalue = deletecomd.ExecuteNonQuery();
                    if (retvalue != 0)
                    {
                        msg = "0Updated Successfully...";
                    }
                }
                catch (Exception ex)
                {
                    return 'X' + ex.Message;
                }
            }
            finally
            {
                if (conn != null)
                {
                    conn.Close();
                }
            }
            return msg;
        }

        //***********************************************************************************************************************
        // Purpose      :   Create Overloaded Datatable object based SQL script (stored prodecure) with one string parameter
        //                  and 1 int paramater
        // Method Name  :   RetrieveData
        // Created By   :   Ariel Cabungcal (AEC)
        // Date Created :   09/07/2018
        //***********************************************************************************************************************
        public DataTable RetrieveData(string sp_script, string parmagr1, string parmvalue1, string parmagr2, string parmvalue2, string parmagr3, string parmvalue3, string parmagr4, string parmvalue4, string parmagr5, string parmvalue5, string parmagr6, string parmvalue6)
		{
			try
			{
				DataTable dt = new DataTable();
				string connStr = System.Configuration.ConfigurationManager.ConnectionStrings[connectstring].ConnectionString;
				using (SqlConnection cn = new SqlConnection(connStr))
				{
					SqlCommand cmd = new SqlCommand(sp_script, cn);
					cmd.CommandType = CommandType.StoredProcedure;
					SqlDataAdapter adp = new SqlDataAdapter(cmd);
					cmd.Parameters.Add("@" + parmagr1, SqlDbType.VarChar).Value = parmvalue1;
					cmd.Parameters.Add("@" + parmagr2, SqlDbType.VarChar).Value = parmvalue2;
					cmd.Parameters.Add("@" + parmagr3, SqlDbType.VarChar).Value = parmvalue3;
					cmd.Parameters.Add("@" + parmagr4, SqlDbType.VarChar).Value = parmvalue4;
					cmd.Parameters.Add("@" + parmagr5, SqlDbType.VarChar).Value = parmvalue5;
					cmd.Parameters.Add("@" + parmagr6, SqlDbType.VarChar).Value = parmvalue6;
					adp.Fill(dt);
				}
				return dt;
			}
			catch (Exception)
			{
				return null;
			}

		}

		//***********************************************************************************************************************
		// Purpose      :   Create Overloaded Datatable object based SQL script (stored prodecure) with one string parameter
		//                  and 1 int paramater
		// Method Name  :   RetrieveData
		// Created By   :   Ariel Cabungcal (AEC)
		// Date Created :   09/07/2018
		//***********************************************************************************************************************
		public DataTable RetrieveData(string sp_script, string parmagr1, string parmvalue1, string parmagr2, string parmvalue2, string parmagr3, string parmvalue3, string parmagr4, string parmvalue4, string parmagr5, string parmvalue5)
		{
			try
			{
				DataTable dt = new DataTable();
				string connStr = System.Configuration.ConfigurationManager.ConnectionStrings[connectstring].ConnectionString;
				using (SqlConnection cn = new SqlConnection(connStr))
				{
					SqlCommand cmd = new SqlCommand(sp_script, cn);
					cmd.CommandType = CommandType.StoredProcedure;
					SqlDataAdapter adp = new SqlDataAdapter(cmd);
					cmd.Parameters.Add("@" + parmagr1, SqlDbType.VarChar).Value = parmvalue1;
					cmd.Parameters.Add("@" + parmagr2, SqlDbType.VarChar).Value = parmvalue2;
					cmd.Parameters.Add("@" + parmagr3, SqlDbType.VarChar).Value = parmvalue3;
					cmd.Parameters.Add("@" + parmagr4, SqlDbType.VarChar).Value = parmvalue4;
					cmd.Parameters.Add("@" + parmagr5, SqlDbType.VarChar).Value = parmvalue5;
					adp.Fill(dt);
				}
				return dt;
			}
			catch (Exception)
			{
				return null;
			}

		}

        //***********************************************************************************************************************
        // Purpose      :   Create Overloaded Datatable object based SQL script (stored prodecure) with one string parameter
        //                  and 1 int paramater - FOR DTR PRINTING ATS
        // Method Name  :   RetrieveData
        // Created By   :   JORGE RUSTOM VILLANUEVA
        // Date Created :   09/15/2020
        //***********************************************************************************************************************
        public DataTable RetrieveDataATS(string sp_script, string parmagr1, string parmvalue1, string parmagr2, string parmvalue2, string parmagr3, string parmvalue3, string parmagr4, string parmvalue4, string parmagr5, string parmvalue5)
        {
            try
            {
                DataTable dt = new DataTable();
                string connStr = System.Configuration.ConfigurationManager.ConnectionStrings["cnHRISATS"].ConnectionString;
                using (SqlConnection cn = new SqlConnection(connStr))
                {
                    SqlCommand cmd = new SqlCommand(sp_script, cn);
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.CommandTimeout = Int32.MaxValue;
                    SqlDataAdapter adp = new SqlDataAdapter(cmd);
                    cmd.Parameters.Add("@" + parmagr1, SqlDbType.VarChar).Value = parmvalue1;
                    cmd.Parameters.Add("@" + parmagr2, SqlDbType.VarChar).Value = parmvalue2;
                    cmd.Parameters.Add("@" + parmagr3, SqlDbType.VarChar).Value = parmvalue3;
                    cmd.Parameters.Add("@" + parmagr4, SqlDbType.VarChar).Value = parmvalue4;
                    cmd.Parameters.Add("@" + parmagr5, SqlDbType.VarChar).Value = parmvalue5;
                    adp.Fill(dt);
                }
                return dt;
            }
            catch (Exception)
            {
                return null;
            }

        }
        //***********************************************************************************************************************
        // Purpose      :   Create Overloaded Datatable object based SQL script (stored prodecure) with one string parameter
        //                  and 1 int paramater - FOR DTR PRINTING ATS
        // Method Name  :   RetrieveData
        // Created By   :   JORGE RUSTOM VILLANUEVA
        // Date Created :   09/15/2020
        //***********************************************************************************************************************
        public DataTable RetrieveDataATS(string sp_script, string parmagr1, string parmvalue1, string parmagr2, string parmvalue2, string parmagr3, string parmvalue3, string parmagr4, string parmvalue4)
        {
            try
            {
                DataTable dt = new DataTable();
                string connStr = System.Configuration.ConfigurationManager.ConnectionStrings["cnHRISATS"].ConnectionString;
                using (SqlConnection cn = new SqlConnection(connStr))
                {
                    SqlCommand cmd = new SqlCommand(sp_script, cn);
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.CommandTimeout = Int32.MaxValue;
                    SqlDataAdapter adp = new SqlDataAdapter(cmd);
                    cmd.Parameters.Add("@" + parmagr1, SqlDbType.VarChar).Value = parmvalue1;
                    cmd.Parameters.Add("@" + parmagr2, SqlDbType.VarChar).Value = parmvalue2;
                    cmd.Parameters.Add("@" + parmagr3, SqlDbType.VarChar).Value = parmvalue3;
                    cmd.Parameters.Add("@" + parmagr4, SqlDbType.VarChar).Value = parmvalue4;
                    adp.Fill(dt);
                }
                return dt;
            }
            catch (Exception)
            {
                return null;
            }

        }
        //***********************************************************************************************************************
        // Purpose      :   Create Overloaded Datatable object based SQL script (stored prodecure) with one string parameter
        //                  and 1 int paramater - FOR DTR PRINTING ATS
        // Method Name  :   RetrieveData
        // Created By   :   JORGE RUSTOM VILLANUEVA
        // Date Created :   09/15/2020
        //***********************************************************************************************************************
        public DataTable RetrieveDataATS(string sp_script, string parmagr1, string parmvalue1, string parmagr2, string parmvalue2)
        {
            try
            {
                DataTable dt = new DataTable();
                string connStr = System.Configuration.ConfigurationManager.ConnectionStrings["cnHRISATS"].ConnectionString;
                using (SqlConnection cn = new SqlConnection(connStr))
                {
                    SqlCommand cmd = new SqlCommand(sp_script, cn);
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.CommandTimeout = Int32.MaxValue;
                    SqlDataAdapter adp = new SqlDataAdapter(cmd);
                    cmd.Parameters.Add("@" + parmagr1, SqlDbType.VarChar).Value = parmvalue1;
                    cmd.Parameters.Add("@" + parmagr2, SqlDbType.VarChar).Value = parmvalue2;
                    adp.Fill(dt);
                }
                return dt;
            }
            catch (Exception)
            {
                return null;
            }

        }

        //***********************************************************************************************************************
        // Purpose      :   Create Overloaded Datatable object based SQL script (stored prodecure) with two string parameters
        // Method Name  :   RetrieveData
        // Created By   :   Ariel Cabungcal (AEC)
        // Date Created :   09/07/2018
        //***********************************************************************************************************************
        public DataTable RetrieveDataATS(string sp_script, string parmagr1, string parmvalue1)
        {
            //try
            //{
            try
            {
                DataTable dt = new DataTable();
                string connStr = System.Configuration.ConfigurationManager.ConnectionStrings["cnHRISATS"].ConnectionString;
                using (SqlConnection cn = new SqlConnection(connStr))
                {
                    SqlCommand cmd = new SqlCommand(sp_script, cn);
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.CommandTimeout = Int32.MaxValue;
                    SqlDataAdapter adp = new SqlDataAdapter(cmd);
                    cmd.Parameters.Add("@" + parmagr1, SqlDbType.VarChar).Value = parmvalue1;
                    adp.Fill(dt);
                }
                return dt;
            }
            catch (Exception)
            {
                return null;
            }

        }

        //***********************************************************************************************************************
        // Purpose      :   Create Overloaded Datatable object based SQL script (stored prodecure) with one string parameter
        //                  and 1 int paramater - FOR DTR PRINTING ATS
        // Method Name  :   RetrieveData
        // Created By   :   JORGE RUSTOM VILLANUEVA
        // Date Created :   09/15/2020
        //***********************************************************************************************************************
        public DataTable RetrieveDataATS(string sp_script, string parmagr1, string parmvalue1, string parmagr2, string parmvalue2, string parmagr3, string parmvalue3)
        {
            try
            {
                DataTable dt = new DataTable();
                string connStr = System.Configuration.ConfigurationManager.ConnectionStrings["cnHRISATS"].ConnectionString;
                using (SqlConnection cn = new SqlConnection(connStr))
                {
                    SqlCommand cmd = new SqlCommand(sp_script, cn);
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.CommandTimeout = Int32.MaxValue;
                    SqlDataAdapter adp = new SqlDataAdapter(cmd);
                    cmd.Parameters.Add("@" + parmagr1, SqlDbType.VarChar).Value = parmvalue1;
                    cmd.Parameters.Add("@" + parmagr2, SqlDbType.VarChar).Value = parmvalue2;
                    cmd.Parameters.Add("@" + parmagr3, SqlDbType.VarChar).Value = parmvalue3;
                    adp.Fill(dt);
                }
                return dt;
            }
            catch (Exception)
            {
                return null;
            }

        }

        //***********************************************************************************************************************
        // Purpose      :   Create Overloaded Datatable object based SQL script (stored prodecure) with one string parameter
        //                  and 1 int paramater - FOR DTR PRINTING ATS
        // Method Name  :   RetrieveData
        // Created By   :   JORGE RUSTOM VILLANUEVA
        // Date Created :   09/15/2020
        //***********************************************************************************************************************
        public DataTable RetrieveDataATS(string sp_script, string parmagr1, string parmvalue1, string parmagr2, string parmvalue2, string parmagr3, string parmvalue3, string parmagr4, string parmvalue4, string parmagr5, string parmvalue5, string parmagr6, string parmvalue6)
        {
            try
            {
                DataTable dt = new DataTable();
                string connStr = System.Configuration.ConfigurationManager.ConnectionStrings["cnHRISATS"].ConnectionString;
                using (SqlConnection cn = new SqlConnection(connStr))
                {
                    SqlCommand cmd = new SqlCommand(sp_script, cn);
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.CommandTimeout = Int32.MaxValue;
                    SqlDataAdapter adp = new SqlDataAdapter(cmd);
                    cmd.Parameters.Add("@" + parmagr1, SqlDbType.VarChar).Value = parmvalue1;
                    cmd.Parameters.Add("@" + parmagr2, SqlDbType.VarChar).Value = parmvalue2;
                    cmd.Parameters.Add("@" + parmagr3, SqlDbType.VarChar).Value = parmvalue3;
                    cmd.Parameters.Add("@" + parmagr4, SqlDbType.VarChar).Value = parmvalue4;
                    cmd.Parameters.Add("@" + parmagr5, SqlDbType.VarChar).Value = parmvalue5;
                    cmd.Parameters.Add("@" + parmagr6, SqlDbType.VarChar).Value = parmvalue6;
                    adp.Fill(dt);
                }
                return dt;
            }
            catch (Exception)
            {
                return null;
            }

        }

        //***********************************************************************************************************************
        // Purpose      :   Create Overloaded Datatable object based SQL script (stored prodecure) with one string parameter
        //                  and 1 int paramater
        // Method Name  :   RetrieveData
        // Created By   :   Ariel Cabungcal (AEC)
        // Date Created :   09/07/2018
        //***********************************************************************************************************************
        public DataTable RetrieveData(string sp_script, string parmagr1, string parmvalue1, string parmagr2, string parmvalue2, string parmagr3, string parmvalue3, string parmagr4, string parmvalue4, string parmagr5, string parmvalue5, string parmagr6, string parmvalue6, string parmagr7, string parmvalue7)
		{
			try
			{
				DataTable dt = new DataTable();
				string connStr = System.Configuration.ConfigurationManager.ConnectionStrings[connectstring].ConnectionString;
				using (SqlConnection cn = new SqlConnection(connStr))
				{
					SqlCommand cmd = new SqlCommand(sp_script, cn);
					cmd.CommandType = CommandType.StoredProcedure;
                    cmd.CommandTimeout = Int32.MaxValue;
                    SqlDataAdapter adp = new SqlDataAdapter(cmd);
					cmd.Parameters.Add("@" + parmagr1, SqlDbType.VarChar).Value = parmvalue1;
					cmd.Parameters.Add("@" + parmagr2, SqlDbType.VarChar).Value = parmvalue2;
					cmd.Parameters.Add("@" + parmagr3, SqlDbType.VarChar).Value = parmvalue3;
					cmd.Parameters.Add("@" + parmagr4, SqlDbType.VarChar).Value = parmvalue4;
					cmd.Parameters.Add("@" + parmagr5, SqlDbType.VarChar).Value = parmvalue5;
					cmd.Parameters.Add("@" + parmagr6, SqlDbType.VarChar).Value = parmvalue6;
					cmd.Parameters.Add("@" + parmagr7, SqlDbType.VarChar).Value = parmvalue7;
					adp.Fill(dt);
                    
                }
				return dt;
			}
			catch (Exception)
			{
				return null;
			}

		}

		//***********************************************************************************************************************
		// Purpose      :   Create Overloaded Datatable with 8 parameters
		// Method Name  :   RetrieveData
		// Created By   :   Ariel Cabungcal (AEC)
		// Date Created :   01/05/2018
		//***********************************************************************************************************************
		public DataTable RetrieveData(string sp_script, string parmagr1, string parmvalue1, string parmagr2, string parmvalue2, string parmagr3, string parmvalue3, string parmagr4, string parmvalue4, string parmagr5, string parmvalue5, string parmagr6, string parmvalue6, string parmagr7, string parmvalue7, string parmagr8, int parmvalue8)
		{
			try
			{
				DataTable dt = new DataTable();
				string connStr = System.Configuration.ConfigurationManager.ConnectionStrings[connectstring].ConnectionString;
				using (SqlConnection cn = new SqlConnection(connStr))
				{
					SqlCommand cmd = new SqlCommand(sp_script, cn);
					cmd.CommandType = CommandType.StoredProcedure;
					SqlDataAdapter adp = new SqlDataAdapter(cmd);
					cmd.Parameters.Add("@" + parmagr1, SqlDbType.VarChar).Value = parmvalue1;
					cmd.Parameters.Add("@" + parmagr2, SqlDbType.VarChar).Value = parmvalue2;
					cmd.Parameters.Add("@" + parmagr3, SqlDbType.VarChar).Value = parmvalue3;
					cmd.Parameters.Add("@" + parmagr4, SqlDbType.VarChar).Value = parmvalue4;
					cmd.Parameters.Add("@" + parmagr5, SqlDbType.VarChar).Value = parmvalue5;
					cmd.Parameters.Add("@" + parmagr6, SqlDbType.VarChar).Value = parmvalue6;
					cmd.Parameters.Add("@" + parmagr7, SqlDbType.VarChar).Value = parmvalue7;
					cmd.Parameters.Add("@" + parmagr8, SqlDbType.VarChar).Value = parmvalue8;
					adp.Fill(dt);
				}
				return dt;
			}
			catch (Exception)
			{
				return null;
			}

		}
		//***********************************************************************************************************************
		// Purpose      :   Create Overloaded Datatable with 8 parameters
		// Method Name  :   RetrieveData
		// Created By   :   Ariel Cabungcal (AEC)
		// Date Created :   01/05/2018
		//***********************************************************************************************************************
		public DataTable RetrieveData(string sp_script, string parmagr1, string parmvalue1, string parmagr2, string parmvalue2, string parmagr3, string parmvalue3, string parmagr4, string parmvalue4, string parmagr5, string parmvalue5, string parmagr6, string parmvalue6, string parmagr7, string parmvalue7, string parmagr8, string parmvalue8, string parmagr9, string parmvalue9)
		{
			try
			{
				DataTable dt = new DataTable();
				string connStr = System.Configuration.ConfigurationManager.ConnectionStrings[connectstring].ConnectionString;
				using (SqlConnection cn = new SqlConnection(connStr))
				{
					SqlCommand cmd = new SqlCommand(sp_script, cn);
					cmd.CommandType = CommandType.StoredProcedure;
					SqlDataAdapter adp = new SqlDataAdapter(cmd);
					cmd.Parameters.Add("@" + parmagr1, SqlDbType.VarChar).Value = parmvalue1;
					cmd.Parameters.Add("@" + parmagr2, SqlDbType.VarChar).Value = parmvalue2;
					cmd.Parameters.Add("@" + parmagr3, SqlDbType.VarChar).Value = parmvalue3;
					cmd.Parameters.Add("@" + parmagr4, SqlDbType.VarChar).Value = parmvalue4;
					cmd.Parameters.Add("@" + parmagr5, SqlDbType.VarChar).Value = parmvalue5;
					cmd.Parameters.Add("@" + parmagr6, SqlDbType.VarChar).Value = parmvalue6;
					cmd.Parameters.Add("@" + parmagr7, SqlDbType.VarChar).Value = parmvalue7;
					cmd.Parameters.Add("@" + parmagr8, SqlDbType.VarChar).Value = parmvalue8;
					cmd.Parameters.Add("@" + parmagr9, SqlDbType.VarChar).Value = parmvalue9;
					adp.Fill(dt);
				}
				return dt;
			}
			catch (Exception)
			{
				return null;
			}

		}

		public bool IsRowofData(string sql_script, ref string[] retfields)
		//***********************************************************************************************************************
		// Purpose      :   Get specific Row in a given table, with maximum of 5 return string fields as byref 
		// Method Name  :   IsRowofData
		// Created By   :   Ariel Cabungcal (AEC)
		// Date Created :   10/02/2018
		//***********************************************************************************************************************
		{
			SqlConnection conn = null;
			bool isExist = false;
			try
			{
				conn = ConnectDB();
				conn.Open();
				SqlCommand cmd = new SqlCommand(sql_script, conn);
				SqlDataReader dtreader = cmd.ExecuteReader();
				int colcount = dtreader.FieldCount;
				isExist = dtreader.HasRows;
				if (isExist)
				{
					dtreader.Read();
					for (int loop1 = 0; loop1 < colcount; loop1++)
					{
						retfields[loop1] = dtreader.GetValue(loop1).ToString();
					}
				}
				return isExist;
			 }
			catch (Exception)
			{
				return false;
			}
		   finally
			{
				if (conn != null)
				{
					conn.Close();
				}
			}
		}

		public string GetLastRow_of_Table(string select_script)
		//***********************************************************************************************************************
		// Purpose      :   Get specific Last Row in a given table
		// Method Name  :   GetLastRow
		// Created By   :   Vincent Jade Alivio
		// Date Created :   10/26/2018
		//***********************************************************************************************************************
		{
			SqlConnection conn = null;
			bool isExist = false;
			string retrow = "";
			try
			{
				conn = ConnectDB();
				conn.Open();
				SqlCommand cmd = new SqlCommand(select_script, conn);
				SqlDataReader dtreader = cmd.ExecuteReader();
				int rowcount = dtreader.FieldCount;
				isExist = dtreader.HasRows;
				if (isExist)
				{
					dtreader.Read();
					retrow = dtreader.GetValue(0).ToString();
				}
				return retrow;
			}
			catch (Exception)
			{
				return "";
			}
			finally
			{
				if (conn != null)
				{
					conn.Close();
				}
			}
		}

		public string SaveGetApprovalWorkFlow(string parmvalue1, string parmvalue2, string parmvalue3)
		//***********************************************************************************************************************
		// Purpose      :   Save New Transaction for Approval and Return newly created Approval ID
		// Method Name  :   SaveGetApprovalWorkFlow
		// Created By   :   Ariel Cabungcal (AEC)
		// Date Created :   10/07/2018
		//***********************************************************************************************************************
		{
			SqlConnection conn = null;
			bool isExist = false;
			string retValue = "";

			try
			{
				conn = ConnectDB();
				conn.Open();
				SqlCommand cmd = new SqlCommand("sp_insert_transaction_to_approvalworkflow_tbl", conn);
				cmd.CommandType = CommandType.StoredProcedure;
				cmd.Parameters.Add("@par_user_id", SqlDbType.VarChar).Value = parmvalue1;
				cmd.Parameters.Add("@par_empl_id", SqlDbType.VarChar).Value = parmvalue2;
				cmd.Parameters.Add("@par_transaction_code", SqlDbType.VarChar).Value = parmvalue3;

				SqlDataReader dtreader = cmd.ExecuteReader();
				int colcount = dtreader.FieldCount;
				isExist = dtreader.HasRows;

				if (isExist)
				{
					dtreader.Read();
					retValue = dtreader.GetValue(0).ToString();
				}

				return retValue;
			}
			catch (Exception)
			{
				return retValue;
			}
			finally
			{
				if (conn != null)
				{
					conn.Close();
				}
			}
		}

		public void SaveUpdateApprovalWorkFlow(string parmvalue1, string parmvalue2, string parmvalue3, string parmvalue4)
		//***********************************************************************************************************************
		// Purpose      :   Update Transaction Approval Status
		// Method Name  :   SaveUpdateApprovalWorkFlow
		// Created By   :   Ariel Cabungcal (AEC)
		// Date Created :   10/07/2018
		//***********************************************************************************************************************
		{
			SqlConnection conn = null;
 
			try
			{
				conn = ConnectDB();
				conn.Open();
				SqlCommand cmd = new SqlCommand("sp_update_transaction_in_approvalworkflow_tbl", conn);
				cmd.CommandType = CommandType.StoredProcedure;
				cmd.Parameters.Add("@par_approval_id", SqlDbType.VarChar).Value = parmvalue1;
				cmd.Parameters.Add("@par_user_id", SqlDbType.VarChar).Value = parmvalue2;
				cmd.Parameters.Add("@par_approval_status", SqlDbType.VarChar).Value = parmvalue3;
				cmd.Parameters.Add("@par_comments", SqlDbType.VarChar).Value = parmvalue4;
				cmd.ExecuteNonQuery();
			}
			catch (Exception)
			{
			}
			finally
			{
				if (conn != null)
				{
					conn.Close();
				}
			}
		}

		public string PlantillaAutoCreation(string parmvalue1, string parmvalue2, string parmvalue3, string parmvalue4, string parmvalue5)
		//***********************************************************************************************************************
		// Purpose      :   Plantilla Auto Creation Process
		// Method Name  :   PlantillaAutoCreation
		// Created By   :   Ariel Cabungcal (AEC)
		// Date Created :   10/10/2018
		//***********************************************************************************************************************
		{
			SqlConnection conn = null;
			bool isExist = false;
			string retValue = "";

			try
			{
				conn = ConnectDB();
				conn.Open();
				SqlCommand cmd = new SqlCommand("sp_plantilla_auto_creation", conn);
				cmd.CommandType = CommandType.StoredProcedure;
				cmd.Parameters.Add("@par_budget_code1", SqlDbType.VarChar).Value = parmvalue1;
				cmd.Parameters.Add("@par_budget_code2", SqlDbType.VarChar).Value = parmvalue2;
				cmd.Parameters.Add("@par_employement_type", SqlDbType.VarChar).Value = parmvalue3;
				cmd.Parameters.Add("@par_effective_date_sg", SqlDbType.VarChar).Value = parmvalue4;
				cmd.Parameters.Add("@par_creation_action", SqlDbType.VarChar).Value = parmvalue5;

				SqlDataReader dtreader = cmd.ExecuteReader();
				isExist = dtreader.HasRows;

				if (isExist)
				{
					dtreader.Read();
					retValue = dtreader.GetValue(0).ToString();
				}

				return retValue;
			}
			catch (Exception)
			{
				return retValue;
			}
			finally
			{
				if (conn != null)
				{
					conn.Close();
				}
			}
		}
		public string AppointmentAutoCreation(string parmvalue1, string parmvalue2, string parmvalue3, string parmvalue4, string parmvalue5, string parmvalue6)
		//***********************************************************************************************************************
		// Purpose      :   Appointment Auto Creation Process
		// Method Name  :   AppointmentAutoCreation
		// Created By   :   Vincent Jade Alivio
		// Date Created :   11/08/2018
		//***********************************************************************************************************************
		{
			SqlConnection conn = null;
			bool isExist = false;
			string retValue = "";

			try
			{
				conn = ConnectDB();
				conn.Open();
				SqlCommand cmd = new SqlCommand("sp_appointment_auto_creation", conn);
				cmd.CommandType = CommandType.StoredProcedure;
				cmd.Parameters.Add("@par_budget_code1", SqlDbType.VarChar).Value = parmvalue1;
				cmd.Parameters.Add("@par_budget_code2", SqlDbType.VarChar).Value = parmvalue2;
				cmd.Parameters.Add("@par_employement_type", SqlDbType.VarChar).Value = parmvalue3;
				cmd.Parameters.Add("@par_appt_semester", SqlDbType.VarChar).Value = parmvalue4;
				cmd.Parameters.Add("@par_period_from", SqlDbType.VarChar).Value = parmvalue5;
				cmd.Parameters.Add("@par_period_to", SqlDbType.VarChar).Value = parmvalue6;

				SqlDataReader dtreader = cmd.ExecuteReader();
				isExist = dtreader.HasRows;

				if (isExist)
				{
					dtreader.Read();
					retValue = dtreader.GetValue(0).ToString();
				}

				return retValue;
			}
			catch (Exception)
			{
				return retValue;
			}
			finally
			{
				if (conn != null)
				{
					conn.Close();
				}
			}
		}

		//***********************************************************************************************************************
		// Purpose      :   Delete Row from Back End Database
		// Method Name  :   DeleteBackEndData
		// Created By   :   Ariel Cabungcal (AEC)
		// Date Created :   10/02/2018
		//***********************************************************************************************************************
		public string DeleteBackEndData(string tablenamescript, string whereclause)
		{
			string sdeletescript = "delete from " + tablenamescript + " " + whereclause;
			return connectandsetcommand(sdeletescript, "delete");
		}

		//***********************************************************************************************************************
		// Purpose      :   Update Data to Back End Database
		// Method Name  :   UpdateTable
		// Created By   :   Ariel Cabungcal (AEC)
		// Date Created :   10/02/2018
		//***********************************************************************************************************************
		public string UpdateTable(string tablenamescript, string setparm, string whereparm)
		{
			string sdeletescript = "update " + tablenamescript + " set " + setparm + "  " + whereparm;

			return connectandsetcommand(sdeletescript, "update");
		}


		public DataTable get_data(string sp_script, string parmarg1, int parmvalue1, string parmarg2, decimal parmvalue2)
		{
			try
			{
				DataTable dt = new DataTable();
				string connStr = System.Configuration.ConfigurationManager.ConnectionStrings[connectstring].ConnectionString;
				using (SqlConnection cn = new SqlConnection(connStr))
				{
					SqlCommand cmd = new SqlCommand(sp_script, cn);
					cmd.CommandType = CommandType.StoredProcedure;
					cmd.Parameters.Add("@" + parmarg1, SqlDbType.VarChar).Value = parmvalue1;
					cmd.Parameters.Add("@" + parmarg2, SqlDbType.Int).Value = parmvalue2;
					SqlDataAdapter adp = new SqlDataAdapter(cmd);
					adp.Fill(dt);
				}
				return dt;
			}
			catch (Exception)
			{
				return null;
			}
		}
  

		public DataTable get_data(string sp_script, string parmarg1, int parmvalue1, string parmarg2, int parmvalue2)
		{
			try
			{
				DataTable dt = new DataTable();
				string connStr = System.Configuration.ConfigurationManager.ConnectionStrings[connectstring].ConnectionString;
				using (SqlConnection cn = new SqlConnection(connStr))
				{
					SqlCommand cmd = new SqlCommand(sp_script, cn);
					cmd.CommandType = CommandType.StoredProcedure;
					//cmd.Parameters.Add("@comp_code", SqlDbType.VarChar).Value = ConfigurationManager.ConnectionStrings[comp_code].ConnectionString;
					//string ls_branch = ConfigurationManager.ConnectionStrings[branch_code].ConnectionString;
					//int ls_franchise = Convert.ToInt32(ConfigurationManager.ConnectionStrings[franchise].ConnectionString);

					//cmd.Parameters.Add("@branch_code", SqlDbType.VarChar).Value = ls_branch;
					//cmd.Parameters.Add("@franchise", SqlDbType.Int).Value = ls_franchise;
					cmd.Parameters.Add("@" + parmarg1, SqlDbType.Int).Value = parmvalue1;
					cmd.Parameters.Add("@" + parmarg2, SqlDbType.Int).Value = parmvalue2;

					SqlDataAdapter adp = new SqlDataAdapter(cmd);
					adp.Fill(dt);
				}
				return dt;
			}
			catch (Exception)
			{
				return null;
			}
		}
  
		public void norecordfound(DataTable source, ref GridView gv)
		{
			try
			{
				source.Rows.Add(source.NewRow()); // create a new blank row to the DataTable
				// Bind the DataTable which contain a blank row to the GridView
				gv.DataSource = source;
				gv.DataBind();
				// Get the total number of columns in the GridView to know what the Column Span should be
				int columnsCount = gv.Columns.Count;
				gv.Rows[0].Cells.Clear();// clear all the cells in the row
				gv.Rows[0].Cells.Add(new TableCell()); //add a new blank cell
				gv.Rows[0].Cells[0].ColumnSpan = columnsCount; //set the column span to the new added cell

				//You can set the styles here
				gv.Rows[0].Cells[0].HorizontalAlign = HorizontalAlign.Center;
				gv.Rows[0].Cells[0].ForeColor = System.Drawing.Color.Red;
				gv.Rows[0].Cells[0].Font.Bold = true;

				//set No Results found to the new added cell
				gv.Rows[0].Cells[0].Text = "NO RESULT FOUND!";
			}
			catch (Exception)
			{
			}
		}
 
		public string updatedata(DataTable dt, string tablenamescript, string whereparm)
		{
			SqlConnection conn = null;
			string msg = "";

			string updatevalue = "";
			string columsname = "";
			string columndbname = "";
			string updatescript = " Update " + tablenamescript + " set ";
			foreach (DataRow dtrow in dt.Rows)
			{
				foreach (DataColumn column in dt.Columns)
				{
					columsname = column.ColumnName;
					columndbname = column.DataType.Name.ToString();
					if (columsname.ToLower() != "rowstatus")
					{
						if (columndbname.ToString().ToLower() != "byte[]")
						{
							dbdtcolumntype l_columntype = (dbdtcolumntype)Enum.Parse(typeof(dbdtcolumntype), columndbname);
							string avalues = columsname + " = " + setinsertvalues(dtrow, "", columsname, l_columntype) + ",";
							updatevalue = updatevalue + avalues;
						}
					}

				}
			}
			updatevalue = updatevalue.Substring(0, updatevalue.Length - 1);

			updatescript = updatescript + updatevalue + " " + whereparm;
			try
			{
				try
				{
					conn = ConnectDB();
					conn.Open();

					SqlCommand updatecomd = new SqlCommand(updatescript, conn);

					int retvalue = updatecomd.ExecuteNonQuery();
					if (retvalue == 1)
					{
						msg = "0Record Created Successfully...";
					}
				}
				catch (Exception ex)
				{
					return 'X' + ex.Message;

				}
			}
			finally
			{
				if (conn != null)
				{
					conn.Close();
				}

			}
			return msg;

		}

		public string deletedatawihparm(string tablenamescript, string parm1, string parmvar1)
		{

			string sdeletescript = "delete from " + tablenamescript + " " + whereclauseaurgparm() + " and " + parm1 + "='" + parmvar1 + "'";
			return connectandsetcommand(sdeletescript, "delete");
		}

		public string deletedatawihparm(string tablenamescript)
		{
			string sdeletescript = "delete from " + tablenamescript + " " + whereclauseaurgparm();
			return connectandsetcommand(sdeletescript, "delete");
		}

		public string deletedata(string tablenamescript)
		{
			string sdeletescript = "delete from " + tablenamescript;
			return connectandsetcommand(sdeletescript, "delete");
		}

		public string deletedata(DataTable dt)
		{
			if (dt == null) return "";
			if (dt.Rows.Count <= 0) return "";

			//string sdeletescript = "delete from " + dt.TableName + " " + whereclause;

			string msg = "";
			string columsname = "";
			string columndbname = "";
			string insertscript = "";
			string wherevalues = "";
			string deletescript = "";
			DataColumn[] columns;
			columns = dt.PrimaryKey;
			foreach (DataRow dtrow in dt.Rows)
			{
				if (Convert.ToInt32(dtrow["action"].ToString()) == 3)
				{
					if (Convert.ToBoolean(dtrow["retrieve"].ToString()))
					{
						wherevalues = "";
						foreach (DataColumn column in dt.Columns)
						{
							columsname = column.ColumnName;
							columndbname = column.DataType.Name.ToString();
							for (int i = 0; i < columns.Length; i++)
							{
								if (columns[i] == column)
								{
									dbdtcolumntype l_columntype = (dbdtcolumntype)Enum.Parse(typeof(dbdtcolumntype), columndbname);
									string svalues = columsname + " = " + setinsertvalues(dtrow, insertscript, columsname, l_columntype);
									wherevalues += wherevalues == "" ? svalues : " and " + svalues;
								}
							}


						}
						string temp = "delete from " + dt.TableName + " where " + wherevalues;
						deletescript += deletescript == "" ? temp : ";" + temp;
					}
				}
			}
			msg = insertdata(deletescript);
			return msg;

		}

		public string deleted(DataTable dt)
		{
			if (dt.Rows.Count <= 0) return "";
			string msg = "";
			string columsname = "";
			string columndbname = "";
			string insertscript = "";
			string wherevalues = "";
			string deletescript = "";
			DataColumn[] columns;
			columns = dt.PrimaryKey;
			foreach (DataRow dtrow in dt.Rows)
			{
				bool retrieve = dtrow["retrieve"].ToString() == "" ? false : Convert.ToBoolean(dtrow["retrieve"].ToString());
				if (retrieve)
				{
					if (dtrow["action"].ToString() == "3")
					{
						wherevalues = "";
						foreach (DataColumn column in dt.Columns)
						{
							columsname = column.ColumnName;
							columndbname = column.DataType.Name.ToString();
							for (int i = 0; i < columns.Length; i++)
							{
								if (columns[i] == column)
								{
									dbdtcolumntype l_columntype = (dbdtcolumntype)Enum.Parse(typeof(dbdtcolumntype), columndbname);
									string svalues = columsname + " = " + setinsertvalues(dtrow, insertscript, columsname, l_columntype);
									wherevalues += wherevalues == "" ? svalues : " and " + svalues;
								}
							}


						}
						string temp = "delete from " + dt.TableName + " where " + wherevalues;
						deletescript += deletescript == "" ? temp : ";" + temp;
					}
				}
			}
			msg = insertdata(deletescript);
			return msg;

		}

		public string whereclauseaurgparm()
		{
			//string whereclause = "where comp_code ='" + GlobalVar.comp_code + "' ";
			//whereclause += " and branch_code = '" + GlobalVar.branch_code + "' ";
			//whereclause += " and franchise = " + GlobalVar.franchise;
			//  return whereclause;
			return "";
		}

		public string connectandsetcommand(string sparm, string actionparm)
		{
			SqlConnection conn = null;
			string msg = "";
			try
			{
				try
				{
					conn = ConnectDB();
					conn.Open();

					if (actionparm == "delete")
					{
						SqlCommand deletecomd = new SqlCommand(sparm, conn);
						int retvalue = deletecomd.ExecuteNonQuery();
						if (retvalue != 0)
						{
							msg = "0Deleted Successfully...";
						}
					}
					else
					{
						SqlCommand updatecomd = new SqlCommand(sparm, conn);
						int retvalue = updatecomd.ExecuteNonQuery();
						if (retvalue != 0)
						{
							msg = "0Update Successfully...";
						}
					}
				}
				catch (Exception ex)
				{
					return 'X' + ex.Message;
				}
			}
			finally
			{
				if (conn != null)
				{
					conn.Close();
				}
			}
			return msg;
		}

		public string insertdata(DataTable dt, string tablenamescript)
		{
			if (dt.Rows.Count <= 0) return "";

			string msg = "";
			string insertvalue = "";
			string columsname = "";
			string columndbname = "";
			string insertscript = "";
			string valuecontainerscript = "";
			foreach (DataRow dtrow in dt.Rows)
			{
				if (!Convert.ToBoolean(dtrow["retrieve"].ToString()))
				{
					insertscript = "insert into " + tablenamescript + "(";
					insertvalue = "(";
					foreach (DataColumn column in dt.Columns)
					{
						columsname = column.ColumnName;
						columndbname = column.DataType.Name.ToString();
						if (columsname.ToLower() == "rowstatus") continue;
						if (columsname.ToLower() == "action") continue;
						if (columsname.ToLower() == "retrieve") continue;
						if (columndbname.ToString().ToLower() == "byte[]") continue;
						dbdtcolumntype l_columntype = (dbdtcolumntype)Enum.Parse(typeof(dbdtcolumntype), columndbname);
						insertscript += columsname + ",";
						insertvalue += setinsertvalues(dtrow, insertscript, columsname, l_columntype) + ",";
					}
					insertscript = insertscript.Substring(0, insertscript.Length - 1) + ") values";
					insertvalue = insertvalue.Substring(0, insertvalue.Length - 1) + ") ";
					insertscript += insertvalue;
					valuecontainerscript += insertscript + "; ";
				}
			}
			if (valuecontainerscript == "") return "0";
			msg = insertdata(valuecontainerscript.Substring(0, valuecontainerscript.Length - 2));
			return msg;

		}

		public string insertdata(DataTable dt, string tablenamescript, string updatescript)
		{
			if (dt.Rows.Count <= 0) return "";

			string msg = "";
			string insertvalue = "";
			string columsname = "";
			string columndbname = "";
			string insertscript = "";
			string valuecontainerscript = "";
			foreach (DataRow dtrow in dt.Rows)
			{
				if (!Convert.ToBoolean(dtrow["retrieve"].ToString()))
				{
					insertscript = "insert into " + tablenamescript + "(";
					insertvalue = "(";
					foreach (DataColumn column in dt.Columns)
					{
						columsname = column.ColumnName;
						columndbname = column.DataType.Name.ToString();
						if (columsname.ToLower() == "rowstatus") continue;
						if (columsname.ToLower() == "action") continue;
						if (columsname.ToLower() == "retrieve") continue;
						if (columndbname.ToString().ToLower() == "byte[]") continue;
						dbdtcolumntype l_columntype = (dbdtcolumntype)Enum.Parse(typeof(dbdtcolumntype), columndbname);
						insertscript += columsname + ",";
						insertvalue += setinsertvalues(dtrow, insertscript, columsname, l_columntype) + ",";
					}
					insertscript = insertscript.Substring(0, insertscript.Length - 1) + ") values";
					insertvalue = insertvalue.Substring(0, insertvalue.Length - 1) + ") ";
					insertscript += insertvalue;
					valuecontainerscript += valuecontainerscript != "" ? ";" + insertscript : insertscript;
				}
			}
			if (updatescript != "" && valuecontainerscript != "")
			{
				valuecontainerscript += ";" + updatescript;
			}
			else if (updatescript != "" && valuecontainerscript == "")
			{
				valuecontainerscript += updatescript;
			}
			else if (updatescript == "" && valuecontainerscript == "")
			{
				return "0";
			}

			if (valuecontainerscript == "") return "0";
			msg = insertdata(valuecontainerscript);
			return msg;

		}

		public string get_insertscript(DataTable dt, string tablenamescript)
		{
			if (dt.Rows.Count <= 0) return "";
			string insertvalue = "";
			string columsname = "";
			string columndbname = "";
			string insertscript = "";
			string valuecontainerscript = "";
			foreach (DataRow dtrow in dt.Rows)
			{
				if (!Convert.ToBoolean(dtrow["retrieve"].ToString()))
				{
					insertscript = "insert into " + tablenamescript + "(";
					insertvalue = "(";
					foreach (DataColumn column in dt.Columns)
					{
						columsname = column.ColumnName;
						columndbname = column.DataType.Name.ToString();
						if (columsname.ToLower() == "rowstatus") continue;
						if (columsname.ToLower() == "action") continue;
						if (columsname.ToLower() == "retrieve") continue;
						if (columndbname.ToString().ToLower() == "byte[]") continue;
						dbdtcolumntype l_columntype = (dbdtcolumntype)Enum.Parse(typeof(dbdtcolumntype), columndbname);
						insertscript += columsname + ",";
						insertvalue += setinsertvalues(dtrow, insertscript, columsname, l_columntype) + ",";
					}
					insertscript = insertscript.Substring(0, insertscript.Length - 1) + ") values";
					insertvalue = insertvalue.Substring(0, insertvalue.Length - 1) + ") ";
					insertscript += insertvalue;
					valuecontainerscript += valuecontainerscript != "" ? ";" + insertscript : insertscript;
				}
			}
			return valuecontainerscript;
		}

		public string get_insertscript(DataTable dt)
		{
			if (dt.Rows.Count <= 0) return "";
			string insertvalue = "";
			string columsname = "";
			string columndbname = "";
			string insertscript = "";
			string valuecontainerscript = "";
			
			foreach (DataRow dtrow in dt.Rows)
			{
				if (dtrow["action"].ToString() == "0") continue;
				if (Convert.ToBoolean(dtrow["retrieve"].ToString())) continue;
				insertscript = "insert into " + dt.TableName + "(";
				insertvalue = "(";

				foreach (DataColumn column in dt.Columns)
				{
					columsname = column.ColumnName;
					columndbname = column.DataType.Name.ToString();
					if (columsname.ToLower() == "rowstatus") continue;
					if (columsname.ToLower() == "action") continue;
					if (columsname.ToLower() == "retrieve") continue;
					if (columndbname.ToString().ToLower() == "byte[]") continue;
					if (columndbname.ToString().ToLower() == "byte") continue;
					dbdtcolumntype l_columntype = (dbdtcolumntype)Enum.Parse(typeof(dbdtcolumntype), columndbname);
					insertscript += columsname + ",";
					insertvalue += setinsertvalues(dtrow, insertscript, columsname, l_columntype) + ",";
				}
				insertscript = insertscript.Substring(0, insertscript.Length - 1) + ") values";
				insertvalue = insertvalue.Substring(0, insertvalue.Length - 1) + ") ";
				insertscript += insertvalue;
				valuecontainerscript += valuecontainerscript != "" ? ";" + insertscript : insertscript;

			}
			return valuecontainerscript;
		}
 
		public string insertdata(string script)
		{
			SqlConnection conn = null;
			try
			{
				try
				{
					conn = ConnectDB();
					conn.Open();
					//insertscript = "SET IDENTITY_INSERT " + tablenamescript + " ON; " + insertscript + " ; SET IDENTITY_INSERT " + tablenamescript + " ON";
					SqlCommand insertcomd = new SqlCommand(script, conn);
					int retvalue = insertcomd.ExecuteNonQuery();
					if (retvalue >= 1)
					{
						return "0Record Created Successfully...";
					}
				}
				catch (Exception ex)
				{
					return 'X' + ex.Message;

				}
			}
			finally
			{
				if (conn != null)
				{
					conn.Close();
				}
			}
			return "";
		}

		private static string setinsertphotovalues(DataRow dtrow, string insertscript, string columsname)
		{
			string returnvalue = "";

			if (dtrow[columsname].ToString() == null || dtrow[columsname].ToString().Length == 0)
			{
				returnvalue = null;
			}
			else
			{
				returnvalue = "@columsname";
			}
			return returnvalue;
		}

		private static string setinsertvalues(DataRow dtrow, string insertvalue, string columname, dbdtcolumntype l_columntype)
		{
			string returnvalue = insertvalue;
			if (l_columntype == dbdtcolumntype.Boolean)
			{
				if (dtrow[columname].ToString() == null || dtrow[columname].ToString().Length == 0)
				{
					returnvalue = "0";
				}
				else
				{
					returnvalue = "0";
					if (dtrow[columname].ToString().ToLower() == "true")
					{
						returnvalue = "1";
					}

				}
				return returnvalue;
			}


			if (l_columntype == dbdtcolumntype.SByte)
			{
				if (dtrow[columname].ToString() == null || dtrow[columname].ToString().Length == 0)
				{
					returnvalue = "null";
				}
				else
				{
					returnvalue = dtrow[columname].ToString();
				}
				return returnvalue;
			}

			if (l_columntype == dbdtcolumntype.image)
			{

				return "null";


			}
			if (l_columntype == dbdtcolumntype.Char)
			{
				if (dtrow[columname].ToString() == null || dtrow[columname].ToString().Length == 0)
				{
					returnvalue = "''";
				}
				else
				{
					returnvalue = "'" + dtrow[columname].ToString() + "'";
				}
				return returnvalue;
			}

			if (l_columntype == dbdtcolumntype.String)
			{
				if (dtrow[columname].ToString() == null || dtrow[columname].ToString().Length == 0)
				{
					returnvalue = "''";
				}
				else
				{
					string values = dtrow[columname].ToString();
					if (values.Length > 3)
					{
						string choseva = values.Substring(0, 2);
						if (choseva == "@#")
						{
							values = values.Substring(2);
							return values;
						}
					}
					values = values.Replace("'", "''");
					returnvalue = "'" + values + "'";
				}
				return returnvalue;
			}
			if (l_columntype == dbdtcolumntype.DateTime)
			{
				if (dtrow[columname].ToString() == null || dtrow[columname].ToString().Length == 0)
				{
					returnvalue = "null";
				}
				else
				{
					returnvalue = "'" + dtrow[columname].ToString() + "'";
				}
				return returnvalue;
			}
			if (l_columntype == dbdtcolumntype.Decimal)
			{
				if (dtrow[columname].ToString() == null || dtrow[columname].ToString().Length == 0)
				{
					returnvalue = "0";
				}
				else
				{
					returnvalue = dtrow[columname].ToString();
				}
				return returnvalue;
			}
			if (l_columntype == dbdtcolumntype.Float)
			{
				if (dtrow[columname].ToString() == null || dtrow[columname].ToString().Length == 0)
				{
					returnvalue = "0";
				}

				else
				{
					returnvalue = dtrow[columname].ToString();
				}
				return returnvalue;
			}
			if (l_columntype == dbdtcolumntype.Int)
			{
				if (dtrow[columname].ToString() == null || dtrow[columname].ToString().Length == 0)
				{
					returnvalue = "0";
				}
				else
				{
					returnvalue = dtrow[columname].ToString();
				}
				return returnvalue;
			}
			if (l_columntype == dbdtcolumntype.Int32)
			{
				if (dtrow[columname].ToString() == null || dtrow[columname].ToString().Length == 0)
				{
					returnvalue = "0";
				}
				else
				{
					returnvalue = dtrow[columname].ToString();
				}
				return returnvalue;
			}
			if (l_columntype == dbdtcolumntype.Int16)
			{
				if (dtrow[columname].ToString() == null || dtrow[columname].ToString().Length == 0)
				{
					returnvalue = "0";
				}
				else
				{
					returnvalue = dtrow[columname].ToString();
				}
				return returnvalue;
			}
			if (l_columntype == dbdtcolumntype.Int64)
			{
				if (dtrow[columname].ToString() == null || dtrow[columname].ToString().Length == 0)
				{
					returnvalue = "0";
				}
				else
				{
					returnvalue = dtrow[columname].ToString();
				}
				return returnvalue;
			}
			if (l_columntype == dbdtcolumntype.bigint)
			{
				if (dtrow[columname].ToString() == null || dtrow[columname].ToString().Length == 0)
				{
					returnvalue = "0";
				}
				else
				{
					returnvalue = dtrow[columname].ToString();
				}
				return returnvalue;
			}
			if (l_columntype == dbdtcolumntype.Varchar)
			{
				if (dtrow[columname].ToString() == null || dtrow[columname].ToString().Length == 0)
				{
					returnvalue = "''";
				}
				else
				{
					returnvalue = "'" + dtrow[columname].ToString() + "'";
				}
				return returnvalue;
			}
			return returnvalue;
		}
		private static void setdbcommandparm(ref SqlCommand insertcomd, dbdtcolumntype l_columntype, DataRow dtrow, string columname)
		{


			if (l_columntype == dbdtcolumntype.Boolean)
			{
				insertcomd.Parameters.Add("@" + columname, SqlDbType.Bit).Value = Convert.ToBoolean(dtrow[columname].ToString());
			}


			if (l_columntype == dbdtcolumntype.SByte)
			{
				if (dtrow[columname].ToString() == null || dtrow[columname].ToString().Length == 0)
				{
					insertcomd.Parameters.Add("@" + columname, SqlDbType.Bit).Value = null;
				}
				else
				{
					insertcomd.Parameters.Add("@" + columname, SqlDbType.Bit).Value = Convert.ToByte(dtrow[columname].ToString());
				}
			}

			if (l_columntype == dbdtcolumntype.image)
			{
				if (dtrow[columname].ToString() == null || dtrow[columname].ToString().Length == 0)
				{
					insertcomd.Parameters.Add("@" + columname, SqlDbType.Image).Value = null;
				}
				else
				{
					insertcomd.Parameters.Add("@" + columname, SqlDbType.Image).Value = Convert.ToByte(dtrow[columname].ToString());
				}
			}
			if (l_columntype == dbdtcolumntype.Char)
			{
				insertcomd.Parameters.Add("@" + columname, SqlDbType.Char).Value = dtrow[columname].ToString();
			}
			if (l_columntype == dbdtcolumntype.Single)
			{
				insertcomd.Parameters.Add("@" + columname, SqlDbType.VarChar).Value = dtrow[columname].ToString();
			}
			if (l_columntype == dbdtcolumntype.String)
			{
				insertcomd.Parameters.Add("@" + columname, SqlDbType.VarChar).Value = dtrow[columname].ToString();
			}
			if (l_columntype == dbdtcolumntype.DateTime)
			{
				if (dtrow[columname].ToString() == null || dtrow[columname].ToString().Length == 0)
				{
					insertcomd.Parameters.Add("@" + columname, SqlDbType.DateTime).Value = null;
				}
				else
				{
					insertcomd.Parameters.Add("@" + columname, SqlDbType.DateTime).Value = Convert.ToDateTime(dtrow[columname].ToString());
				}
			}
			if (l_columntype == dbdtcolumntype.Decimal)
			{
				if (dtrow[columname].ToString() == null || dtrow[columname].ToString().Length == 0)
				{
					insertcomd.Parameters.Add("@" + columname, SqlDbType.Decimal).Value = null;
				}
				else
				{
					insertcomd.Parameters.Add("@" + columname, SqlDbType.Decimal).Value = Convert.ToDecimal(dtrow[columname].ToString());
				}
			}
			if (l_columntype == dbdtcolumntype.Float)
			{
				if (dtrow[columname].ToString() == null || dtrow[columname].ToString().Length == 0)
				{
					insertcomd.Parameters.Add("@" + columname, SqlDbType.Float).Value = null;
				}
				else
				{
					insertcomd.Parameters.Add("@" + columname, SqlDbType.Float).Value = Convert.ToDouble(dtrow[columname].ToString());
				}
			}
			if (l_columntype == dbdtcolumntype.Int)
			{
				insertcomd.Parameters.Add("@" + columname, SqlDbType.Int).Value = Convert.ToInt32(dtrow[columname].ToString());
			}
			if (l_columntype == dbdtcolumntype.Int16)
			{
				if (dtrow[columname].ToString() == null || dtrow[columname].ToString().Length == 0)
				{
					insertcomd.Parameters.Add("@" + columname, SqlDbType.SmallInt).Value = null;
				}
				else
				{
					insertcomd.Parameters.Add("@" + columname, SqlDbType.SmallInt).Value = Convert.ToInt32(dtrow[columname].ToString());
				}
			}
			if (l_columntype == dbdtcolumntype.Int32)
			{
				if (dtrow[columname].ToString() == null || dtrow[columname].ToString().Length == 0)
				{
					insertcomd.Parameters.Add("@" + columname, SqlDbType.Int).Value = null;
				}
				else
				{
					insertcomd.Parameters.Add("@" + columname, SqlDbType.Int).Value = Convert.ToInt32(dtrow[columname].ToString());
				}
			}
			if (l_columntype == dbdtcolumntype.Int64)
			{
				if (dtrow[columname].ToString() == null || dtrow[columname].ToString().Length == 0)
				{
					insertcomd.Parameters.Add("@" + columname, SqlDbType.BigInt).Value = null;
				}
				else
				{
					insertcomd.Parameters.Add("@" + columname, SqlDbType.BigInt).Value = Convert.ToInt32(dtrow[columname].ToString());
				}
			}
			if (l_columntype == dbdtcolumntype.Varchar)
			{
				insertcomd.Parameters.Add("@" + columname, SqlDbType.VarChar).Value = (dtrow[columname].ToString());
			}
			if (l_columntype == dbdtcolumntype.Nvarchar)
			{
				insertcomd.Parameters.Add("@" + columname, SqlDbType.NVarChar).Value = dtrow[columname].ToString();
			}
			//  insertcomd.Parameters.AddWithValue('@' + columname, dtrow[columname].ToString());
		}

   
		public string updatescript(DataTable dt, string tablename, string whereclause)
		{
			string updatescipts = "";
			string columsname = "";
			string columndbname = "";
			foreach (DataRow dtrow in dt.Rows)
			{

				string setcontain = "";
				//      if (dtrow["action"].ToString() != "2") continue;

				if (!Convert.ToBoolean(dtrow["retrieve"].ToString())) continue;

				foreach (DataColumn column in dt.Columns)
				{
					columsname = column.ColumnName;
					columndbname = column.DataType.Name.ToString();
					if (whereclause.Contains(columsname)) continue;

					if (columsname.ToLower() == "rowstatus") continue;
					if (columsname.ToLower() == "action") continue;
					if (columsname.ToLower() == "retrieve") continue;
					if (columndbname.ToString().ToLower() == "byte[]") continue;
					dbdtcolumntype l_columntype = (dbdtcolumntype)Enum.Parse(typeof(dbdtcolumntype), columndbname);
					string svalue = columsname + " = " + setinsertvalues(dtrow, " ", columsname, l_columntype);
					setcontain += setcontain == "" ? svalue : "," + svalue;
				}
				updatescipts += updatescipts == "" ? " update " + tablename + " set " + setcontain + whereclause : "; update " + tablename + " set " + setcontain + whereclause;
			}
			return updatescipts;
		}

		public string updatescript(DataTable dt, string whereclause)
		{
			string updatescipts = "";
			string columsname = "";
			string columndbname = "";
			foreach (DataRow dtrow in dt.Rows)
			{

				string setcontain = "";
				//      if (dtrow["action"].ToString() != "2") continue;

				if (!Convert.ToBoolean(dtrow["retrieve"].ToString())) continue;

				foreach (DataColumn column in dt.Columns)
				{
					columsname = column.ColumnName;
					columndbname = column.DataType.Name.ToString();
					if (whereclause.Contains(columsname)) continue;

					if (columsname.ToLower() == "rowstatus") continue;
					if (columsname.ToLower() == "action") continue;
					if (columsname.ToLower() == "retrieve") continue;
					if (columndbname.ToString().ToLower() == "byte[]") continue;
					dbdtcolumntype l_columntype = (dbdtcolumntype)Enum.Parse(typeof(dbdtcolumntype), columndbname);
					string svalue = columsname + " = " + setinsertvalues(dtrow, " ", columsname, l_columntype);
					setcontain += setcontain == "" ? svalue : "," + svalue;
				}
				updatescipts += updatescipts == "" ? " update " + dt.TableName + " set " + setcontain + whereclause : "; update " + dt.TableName + " set " + setcontain + whereclause;
			}
			return updatescipts;
		}

		public string updatescript(DataTable dt)
		{
			string updatescipts = "";
			string columsname = "";
			string columndbname = "";
			string wherevalues = "";
			DataColumn[] columns;
			columns = dt.PrimaryKey;
			foreach (DataRow dtrow in dt.Rows)
			{

				string setcontain = "";
				wherevalues = "";
				if (dtrow["action"].ToString() != "2") continue;

				if (!Convert.ToBoolean(dtrow["retrieve"].ToString())) continue;

				foreach (DataColumn column in dt.Columns)
				{
					columsname = column.ColumnName;
					columndbname = column.DataType.Name.ToString();
					bool premary = false;
					for (int i = 0; i < columns.Length; i++)
					{
						if (columns[i] == column)
						{
							dbdtcolumntype l_columntypes = (dbdtcolumntype)Enum.Parse(typeof(dbdtcolumntype), columndbname);
							string svalues = columsname + " = " + setinsertvalues(dtrow, " ", columsname, l_columntypes);
							wherevalues += wherevalues == "" ? svalues : " and " + svalues;
							premary = true;
							break;
						}
					}
					if (premary) continue;
					if (columsname.ToLower() == "rowstatus") continue;
					if (columsname.ToLower() == "action") continue;
					if (columsname.ToLower() == "retrieve") continue;
					if (columndbname.ToString().ToLower() == "byte[]") continue;
					dbdtcolumntype l_columntype = (dbdtcolumntype)Enum.Parse(typeof(dbdtcolumntype), columndbname);
					string svalue = columsname + " = " + setinsertvalues(dtrow, " ", columsname, l_columntype);
					setcontain += setcontain == "" ? svalue : "," + svalue;
				}
				string whereclauses = " where " + wherevalues;
				updatescipts += updatescipts == "" ? " update " + dt.TableName + " set " + setcontain + whereclauses : "; update " + dt.TableName + " set " + setcontain + whereclauses;
			}
			return updatescipts;
		}

		public string updatescripts(DataTable dt, string whereclause, string addwhereclause)
		{
			string updatescipts = "";
			string columsname = "";
			string columndbname = "";
			string checkwhareclause = whereclause;
			foreach (DataRow dtrow in dt.Rows)
			{

				string setcontain = "";
				//      if (dtrow["action"].ToString() != "2") continue;
				string wherevalue = "";
				if (!Convert.ToBoolean(dtrow["retrieve"].ToString())) continue;
				if (Convert.ToInt32(dtrow["action"].ToString()) == 1) continue;
				if (Convert.ToInt32(dtrow["action"].ToString()) == 0) continue;
				foreach (DataColumn column in dt.Columns)
				{
					columsname = column.ColumnName;
					columndbname = column.DataType.Name.ToString();
					if (checkwhareclause.Contains(columsname)) continue;
					if (columsname == addwhereclause)
					{
						dbdtcolumntype wherecolumntype = (dbdtcolumntype)Enum.Parse(typeof(dbdtcolumntype), columndbname);
						wherevalue = " and " + columsname + " = " + setinsertvalues(dtrow, " ", columsname, wherecolumntype);
						continue;
					}

					if (columsname.ToLower() == "rowstatus") continue;
					if (columsname.ToLower() == "action") continue;
					if (columsname.ToLower() == "retrieve") continue;
					if (columndbname.ToString().ToLower() == "byte[]") continue;
					dbdtcolumntype l_columntype = (dbdtcolumntype)Enum.Parse(typeof(dbdtcolumntype), columndbname);
					string svalue = columsname + " = " + setinsertvalues(dtrow, " ", columsname, l_columntype);
					setcontain += setcontain == "" ? svalue : "," + svalue;
				}
				whereclause = checkwhareclause + wherevalue;
				updatescipts += updatescipts == "" ? " update " + dt.TableName + " set " + setcontain + whereclause : "; update " + dt.TableName + " set " + setcontain + whereclause;
			}
			return updatescipts;
		}

		public string updatescripts(DataTable dt, string whereclause, string addwhereclause1, string addwhereclause2)
		{
			string updatescipts = "";
			string columsname = "";
			string columndbname = "";
			string checkwhareclause = whereclause;
			foreach (DataRow dtrow in dt.Rows)
			{

				string setcontain = "";
				//      if (dtrow["action"].ToString() != "2") continue;
				string wherevalue = "";
				if (!Convert.ToBoolean(dtrow["retrieve"].ToString())) continue;
				if (Convert.ToInt32(dtrow["action"].ToString()) == 1) continue;
				if (Convert.ToInt32(dtrow["action"].ToString()) == 0) continue;
				foreach (DataColumn column in dt.Columns)
				{
					columsname = column.ColumnName;
					columndbname = column.DataType.Name.ToString();
					if (checkwhareclause.Contains(columsname)) continue;
					if (columsname == addwhereclause1 || columsname == addwhereclause2)
					{
						dbdtcolumntype wherecolumntype = (dbdtcolumntype)Enum.Parse(typeof(dbdtcolumntype), columndbname);
						wherevalue = " and " + columsname + " = " + setinsertvalues(dtrow, " ", columsname, wherecolumntype);
						continue;
					}

					if (columsname.ToLower() == "rowstatus") continue;
					if (columsname.ToLower() == "action") continue;
					if (columsname.ToLower() == "retrieve") continue;
					if (columndbname.ToString().ToLower() == "byte[]") continue;
					dbdtcolumntype l_columntype = (dbdtcolumntype)Enum.Parse(typeof(dbdtcolumntype), columndbname);
					string svalue = columsname + " = " + setinsertvalues(dtrow, " ", columsname, l_columntype);
					setcontain += setcontain == "" ? svalue : "," + svalue;
				}
				whereclause = checkwhareclause + wherevalue;
				updatescipts += updatescipts == "" ? " update " + dt.TableName + " set " + setcontain + whereclause : "; update " + dt.TableName + " set " + setcontain + whereclause;
			}
			return updatescipts;
		}
		internal static string inserttabulardata(DataTable dtr, string p)
		{
			string msg = "";


			return msg;
		}
		public DataTable addprimarykey(DataTable dt)
		{
			DataColumn[] keys = new DataColumn[5];
			keys[0] = dt.Columns["cust_acct_no"];
			keys[1] = dt.Columns["countryid"];
			keys[2] = dt.Columns["comp_code"];
			keys[3] = dt.Columns["branch_code"];
			keys[4] = dt.Columns["franchise"];
			dt.PrimaryKey = keys;
			return dt;
		}
		public DataTable AddPrimaryKeys(DataTable dt, string[] columns)
		{
			DataColumn[] keys = new DataColumn[columns.Length];
			for (int i = 0; i < columns.Length; i++)
			{
				keys[i] = dt.Columns[columns[i]];
			}
			dt.PrimaryKey = keys;
			return dt;
		}

 
  
		public DataTable exportexcel_to_datatable(string filepath, string extension)
		{
			string constr = "";
			switch (extension)
			{
				case ".xls":
					constr = ConfigurationManager.ConnectionStrings["Excel03ConString"].ConnectionString;
					break;
				case ".xlsx":
					constr = ConfigurationManager.ConnectionStrings["Excel07ConString"].ConnectionString;
					break;
			}
			constr = string.Format(constr, filepath, "YES");
			OleDbConnection connExcel = new OleDbConnection(constr);
			OleDbCommand cmdexcel = new OleDbCommand();
			OleDbDataAdapter oda = new OleDbDataAdapter();
			DataTable dt = new DataTable();
			cmdexcel.Connection = connExcel;
			connExcel.Open();
			DataTable dtExcelSchema;
			dtExcelSchema = connExcel.GetOleDbSchemaTable(OleDbSchemaGuid.Tables, null);
			string SheetName = dtExcelSchema.Rows[0]["table_name"].ToString();

			connExcel.Close();

			connExcel.Open();
			cmdexcel.CommandText = "Select * from [" + SheetName + "]";

			oda.SelectCommand = cmdexcel;
			oda.Fill(dt);
			connExcel.Close();
			return dt;
		}
		public DataTable exportexcel_to_datatable(string filepath, string extension, int column)
		{
			string constr = "";
			switch (extension)
			{
				case ".xls":
					constr = ConfigurationManager.ConnectionStrings["Excel03ConString"].ConnectionString;
					break;
				case ".xlsx":
					constr = ConfigurationManager.ConnectionStrings["Excel07ConString"].ConnectionString;
					break;
			}
			constr = string.Format(constr, filepath, "YES");
			OleDbConnection connExcel = new OleDbConnection(constr);
			OleDbCommand cmdexcel = new OleDbCommand();
			OleDbDataAdapter oda = new OleDbDataAdapter();
			DataTable dt = new DataTable();
			cmdexcel.Connection = connExcel;
			connExcel.Open();
			DataTable dtExcelSchema;
			dtExcelSchema = connExcel.GetOleDbSchemaTable(OleDbSchemaGuid.Tables, null);
			string SheetName = dtExcelSchema.Rows[column]["table_name"].ToString();
			connExcel.Close();

			connExcel.Open();
			cmdexcel.CommandText = "Select * from [" + SheetName + "]";
			oda.SelectCommand = cmdexcel;
			oda.Fill(dt);
			connExcel.Close();
			return dt;
		}

		public string getmaxno(string p)
		{
			DataTable dtmaxno = GetDatatable(p);
			if (dtmaxno == null) return "";
			return dtmaxno.Rows[0][0].ToString();

		}

  
		public void Sort(GridView gv, DataTable dt, string columnsort, string direction)
		{
			if (dt == null) return;
			DataView dv;

			dv = new DataView(dt);
			dv.Sort = columnsort + " " + direction;
			gv.DataSource = dv;
			gv.DataBind();

		}
	   
	
	}
}