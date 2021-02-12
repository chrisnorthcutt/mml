<%@ Language=javascript %>
<%Response.Expires = 0%>
<%
	var obj = Server.CreateObject("MMLDocument.clsDocument");
	Response.BinaryWrite(obj.GetImage());
%>