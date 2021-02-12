
function announcementsScreen(){
  var self = this;

  self.screenTitle = "Announcements";
  self.associatedNavItem = "navMyAccount";

  self.updateAnnouncements = function(xmlDoc) {
    var html = '';
    var template = '<div><h4 class="text-color--primary">{0}</h4><p class="text-size--small text-color--medium-grey">{3}</p><h2>{1}</h2><p>{2}</p></div>';

    $(xmlDoc).find('list_item').each(function(){
      html+=template.format(
          $(this).find('client_name').text(),
          $(this).find('message_name').text(),
          $(this).find('message_html').text(),
          $(this).find('start_date').text()
        );
    });

    document.getElementById('announcementsList').innerHTML = html;

    if(html == ''){
      document.getElementById('noAnnouncements').style.display = 'inherit';
      document.getElementById('announcementContainer').style.display = 'none';
    } else {
      document.getElementById('noAnnouncements').style.display = 'none';
      document.getElementById('announcementContainer').style.display = 'inherit';
    }
  }

  self.loadData = function(){
    currentScreen = announcements;
    xmlQuery(xml.create('iSalusExternal.GetAnnouncements'), self.updateAnnouncements);
  }
}