<%@ Import Namespace="System.Net.Mail" %>
<%@ Import Namespace="System.Diagnostics" %>
<%@ Import Namespace="System.Data.SqlClient" %>
<%@ Import Namespace="System.Data" %>
<%@ Page Language="C#" %>
<HTML>
<HEAD>
<SCRIPT LANGUAGE=javascript>
<%
	try 
	{
		SqlConnection	Sqlconn;
		SqlCommand		Sqlcmd;
		string	emailID = Request["ID"];
		string	dbConnection = ConfigurationManager.AppSettings["GlobalConnect"];;
		string	results = "";

		Sqlconn = new SqlConnection(dbConnection);
		Sqlcmd = new SqlCommand("isp_get_email_by_id", Sqlconn);
		Sqlcmd.CommandType = CommandType.StoredProcedure;
		Sqlcmd.Parameters.AddWithValue("@email_id",emailID);
		Sqlconn.Open();
		results = (String)Sqlcmd.ExecuteScalar();
		Sqlconn.Close();
		
		if (results != null)
		{
			string[] arr_results = results.Split('~');
		
			MailMessage message = new MailMessage();
		 	message.From = new MailAddress(arr_results[0]);
			string toList = arr_results[1];
			string toBcc = arr_results[2];
			string[] toItems = toList.Split('|');
			foreach(string item in toItems)
			{
				message.To.Add(item);
			}
			if (!string.IsNullOrEmpty(toBcc))
				message.Bcc.Add(toBcc);
			message.Subject = arr_results[3];
			message.IsBodyHtml = true;
			string strBody = arr_results[4];
			strBody = strBody.Replace("&lt;","<");
			strBody = strBody.Replace("&gt;",">");
			strBody = strBody.Replace("{_}"," ");
			strBody = strBody.Replace("{-}","&nbsp;");
			strBody = strBody.Replace("{amp}","&");
			strBody = strBody.Replace("{CR}","<br/>");
			message.Body = strBody;
			
			SmtpClient smtp = new SmtpClient("127.0.0.1");
			smtp.Send(message);	
			Response.Write("try{parent.email_sent();} catch(e){}");
		}
		else
			Response.Write("try{parent.email_failed('No Email Information');} catch(e){}");
	}
	catch (Exception Ex)
	{
		string strException = Ex.ToString();

		EventLog myLog = new EventLog();
		myLog.Source = "Application";
		myLog.WriteEntry(strException, EventLogEntryType.Error);

		strException = strException.Replace((string)Environment.NewLine, "");
		strException = strException.Replace("'","");
		Response.Write("try{parent.email_failed('" + strException + "');} catch(e){}");
	}
%>
</SCRIPT>
</HEAD>
<BODY>
</BODY>
</HTML>
