using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data.SqlClient;
using System.IO;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Web;

namespace HRIS_eHRD.Common_Code
{
    public class HRIS_Common
    {
        const string connectstring = "cnHRIS_HRD";
        public string CONST_WORDENCRYPTOR = "userprofile";
       
        private const string initVector = "pemgail9uzpgzl88";
        private const int keysize = 256;
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
    }
   
      
}