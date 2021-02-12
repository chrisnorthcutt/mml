<%@ Language=javascript %>
<%Response.Expires = 0%>
<%
	var obj = Server.CreateObject("MMLReport.clsReport");
	obj.pdf();
%>