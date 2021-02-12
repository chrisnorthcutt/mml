
function securityLogScreen(){
  var self = this;

  self.screenTitle = "Security Log";
  self.associatedNavItem = "navMyAccount";

  self.updateList = function(xmlDoc) {
    var html = '';
    var template = '<div class="table-row flex flex-align--center"><div class="col-2"><h4 class="table-data-point">{0}</h4></div><div class="col-1"><h4 class="table-data-point">{1}</h4>'+
      '</div><div class="col-2"><h4 class="table-data-point">{2}</h4></div><div class="col-4"><h4 class="table-data-point">{3}</h4></div><div class="col-3"><h4 class="table-data-point">{4}</h4></div></div>';

    $(xmlDoc).find('list_item').each(function(){
      var date = $(this).find('log_date').text();
      var name = $(this).find('user_name').text();
      var action = $(this).find('action').text();
      var section = $(this).find('section').text();
      var owner = $(this).find('owner_name').text();

      html += template.format(name, action, section, owner, date);
    });

    if(html == ''){
      document.getElementById('noSecurityLog').style.display = 'inherit';
      document.getElementById('tableHeader').style.display = 'none';
    } else {
      document.getElementById('noSecurityLog').style.display = 'none';
      document.getElementById('tableHeader').style.display = 'inherit';
    }

    document.getElementById('securityLogList').innerHTML = html;
  }

  self.loadData = function(){
    currentScreen = securityLog;
    xmlQuery(xml.create('iSalusExternal.GetSecurityLogList')('0'), self.updateList);
  }
}