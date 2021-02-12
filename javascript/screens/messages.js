
function messagesScreen(){
  var self = this;

  self.screenTitle = "Messages";
  self.associatedNavItem = "navAboutMe";

  self.databaseKey = '';
  self.data = [];
  self.providerInfo = [];
  self.unread = 0;
  self.databases = [];

  self.updateMessages = function(xmlDoc) {
    var html = '';
    var template_old = '<p>{0}, {1}, {2}, {3}, {4}, {5}, {6}, {7}, {8}, {9}, {10}, {11}</p>';
    var template = '<a href="#" onclick="event.preventDefault();messages.selectMessage(\'{5}\')"><div id="message-{5}" class="bxshdw message message-read--{4}">'+
    '<div class="clearfix"><p class="text-size--small message-location fl">{0}</p><p class="text-size--small message-date fr">{1}</p></div><p class="text-weight--bold message-topic">{2}</p>'+
    '<p class="message-preview text-size--small">{3}</p></div></a>';
    self.data = [];

    var xmlString = new XMLSerializer().serializeToString(xmlDoc.documentElement);
    xmlString = xmlString.replace(/\{CR\}/g, "\n");
    xmlDoc = $.parseXML(xmlString);

    $(xmlDoc).find('list_item').each(function(){
      var mmlMessageId = $(this).find('mml_message_id').text();
      var accountId = $(this).find('account_id').text();
      var readInd = $(this).find('read_ind').text();
      var accountName = $(this).find('account_name').text();
      var requestedDate = $(this).find('requested_date').text();
      var status = $(this).find('status').text();
      var location = $(this).find('location').text();
      var message = $(this).find('message').text();
      var responseDate = $(this).find('response_date').text();
      var responseMessage = $(this).find('response_message').text();
      var messageTypeId = $(this).find('message_type_id').text();
      var messageTypeDesc = $(this).find('message_type_desc').text();
      var providerId = $(this).find('provider_id').text();
      var database = $(this).find('database_key').text();

      var summary = message;
      if(summary != ''){
        summary += '<br/>'
      }
      summary += responseMessage;

      self.data.push([mmlMessageId, accountId, readInd, accountName, requestedDate, status, location, message, responseDate, responseMessage, messageTypeId, messageTypeDesc, providerId, database]);
      html += template.format(location, responseDate == '' ? requestedDate : responseDate, messageTypeDesc, summary, readInd, mmlMessageId);
    });

    if(html == ''){
      document.getElementById('messageList').innerHTML = '<div class="no-messages">No messages to view.</div>';
    } else {
      document.getElementById('messageList').innerHTML = html;
    }
  }

  self.selectMessage = function(which){
    var dataBox = document.getElementById('messageData');
    var template = 'Message:<br/><p>{0}</p>Response:<br/><p>{1}</p>';
    var header = '<div class="clearfix"><h5 class="mt--none text--medium-grey fl">{0}</h5>'+
      '<p class="text-size--small text-color--medium-grey fr">Date Requested: {1}</p></div><h3 class="mt--none text-weight--bold text-color--primary">{2}</h3><br/><br/>';
    var response = '<div class="clearfix"><p class="text-weight--bold fl">{0}</p><p class="text-size--small text-color--medium-grey fr">'+
      'Received: {1}</p></div><p>{2}</p><div class="clearfix"></div><br/><br/>';
    var message = '<div class="clearfix"><p class="text-weight--bold fl">Me</p><p class="text-size--small text-color--medium-grey fr">Sent: {0}</p></div><p>{1}</p><br/><br/>';
    var replyButton = '<a href="#" class="btn--primary btn--icon mt--20" onclick="event.preventDefault();messages.reply(\'{0}\');">Reply</a>';

    var heading = /(.*)\((\d\d\/\d\d\/\d\d\d\d.*\d?\d:\d\d..)\)/;
    var formatted = '';

    for(var i = 0; i < self.data.length; i++){
      $('#message-'+self.data[i][0]).removeClass('message-selected');

      if(self.data[i][0] == which){
        dataBox.innerHTML = header.format(self.data[i][6], self.data[i][4], self.data[i][11]);
        
        if(self.data[i][9] != ''){
          dataBox.innerHTML += response.format(self.data[i][6], self.data[i][8], self.data[i][9]);
        }

        if(self.data[i][11] != 'Message from Practice'){
          formatted = self.data[i][7];
          while(formatted.match(heading)){
            formatted = formatted.replace(heading, "<div class='message-quote'>$1 - $2");
            formatted += "</div>";
          }
          formatted = formatted.replace(/\n/g, "<br/>");

          dataBox.innerHTML += message.format(self.data[i][4], formatted);
        }

        dataBox.innerHTML += replyButton.format(self.data[i][0]);

        $('#message-'+self.data[i][0]).addClass('message-selected');

        if(self.data[i][2] == 'N'){
          $('#message-'+self.data[i][0]).removeClass('message-read--N');
          xmlQuery(xml.create('iSalusExternal.SaveMessageRead')(which), function(){});
          self.unread -= 1;
          self.updateInboxCount();
        }
      }
    }
  }

  self.selectCategory = function(kind){
    var kinds = ['S', 'R'];

    for(var i = 0; i < 2; i++){
      if(kinds[i] == kind){
        $('#message-category-'+kinds[i]).addClass('tab--active');
        $('#message-category-'+kinds[i]).removeClass('tab--inactive');
      } else {
        $('#message-category-'+kinds[i]).addClass('tab--inactive');
        $('#message-category-'+kinds[i]).removeClass('tab--active');
      }
    }
    xmlQuery(xml.create('iSalusExternal.GetMessages')(kind, '2'), self.updateMessages);
  }

  self.resetCursor = function(txtElement) { 
    if (txtElement.setSelectionRange) { 
      txtElement.focus(); 
      txtElement.setSelectionRange(0, 0); 
    } else if (txtElement.createTextRange) { 
      var range = txtElement.createTextRange();  
      range.moveStart('character', 0); 
      range.select(); 
    }
    txtElement.scrollTop = 0;
  }

  self.reply = function(which){
    for(var i = 0; i < self.data.length; i++){

      if(self.data[i][0] == which){
        document.getElementById('popupReply').style.display = 'inherit';
        document.getElementById('cover').style.display = 'inherit';

        var formatted = self.data[i][7];
        if(formatted != ''){
          formatted = '\n\n\n' + self.data[i][11] + ' (' + self.data[i][4] + ')\n' + formatted;
        }

        if(self.data[i][9] != ''){
          formatted = '\n\n\nResponse (' + self.data[i][8] + ')\n' + self.data[i][9] + formatted;
        }

        document.getElementById('replyContentType').value = self.data[i][10];
        document.getElementById('replyQuoted').value = formatted;
        document.getElementById('replyProvider').value = self.data[i][12];
        document.getElementById('replyDatabase').value = self.data[i][13];

        self.resetCursor(document.getElementById('replyContent'));

        break;
      }
    }
  }

  self.newMessage = function(){
    if(self.databaseKey != ''){
      document.getElementById('popup').style.display = 'inherit';
      document.getElementById('cover').style.display = 'inherit';

      document.getElementById('contentTypeId').value = '1';
      document.getElementById('content').value = '';
      document.getElementById('phone').value = '';
      document.getElementById('other').value = '';
    } else {
      self.showDatabaseSelect();
    }
  }

  self.showPracticeMessage = function(xmlDoc){
    self.resetKey();
    common.closeModals();

    var messageResponse = $(xmlDoc).find('message_response').text() || 'Your message has been received.';

    document.getElementById('popupPracticeMessage').style.display = 'inherit';
    document.getElementById('cover').style.display = 'inherit';

    document.getElementById('practiceMessageContent').innerHTML = messageResponse;
  }

  self.sendMessage = function(){
    var contentTypeId = document.getElementById('contentTypeId').value;
    var content = document.getElementById('content').value;
    var phone = document.getElementById('phone').value;
    var other = document.getElementById('other').value;
    var providerId = document.getElementById('providerId').value;

    xmlQuery(xml.create('iSalusExternal.SendMessage')(contentTypeId, content, phone, other, self.databaseKey, providerId), self.showPracticeMessage);
  }

  self.sendReply = function(){
    var contentTypeId = document.getElementById('replyContentType').value;
    var content = document.getElementById('replyContent').value + document.getElementById('replyQuoted').value;
    var providerId = document.getElementById('replyProvider').value;
    var database = document.getElementById('replyDatabase').value;

    xmlQuery(xml.create('iSalusExternal.SendMessage')(contentTypeId, content, '', '', database, providerId), common.refresh);
  }

  self.updateInboxCount = function(){
    if(self.unread > 0){
      document.getElementById('inboxCount').innerText = self.unread;
    } else {
      document.getElementById('inboxCount').innerText = '';
    }
  }

  self.updateUnreadCount = function(xmlDoc){
    self.unread = parseInt($(xmlDoc).find('count').first().text());
    self.updateInboxCount();
  }

  self.renderProviderDropdown = function(){
    var html = '';
    var template = '<option value="{0}">{1}</option>';

    for(var i = 0; i < self.providerInfo.length; i++) {
        html += template.format(self.providerInfo[i][1], self.providerInfo[i][0]);
    }

    var elem = document.getElementById('providerId');
    elem.innerHTML = html;
    elem.selectedIndex = 0;
  }

  self.getProviderInfo = function(openModal) {
    return function(xmlDoc){
      self.providerInfo = [];

      $(xmlDoc).find('list_item').each(function(){
        var name = $(this).find('ProviderName').text();
        var id = $(this).find('ProviderId').text();

        self.providerInfo.push([name, id]);
      });

      self.renderProviderDropdown();

      if(openModal){
        common.closeModals();
        self.newMessage();
      }
    }
  }

  self.selectDatabase = function(number){
    self.databaseKey = self.databases[number][0];

    xmlQuery(xml.create('iSalusExternal.GetProviders')(self.databaseKey), self.getProviderInfo(true));
  }

  self.showDatabaseSelect = function(){
    var html = '';
    var template = '<a class="text-weight--bold popup__list-item" href="" onclick="event.preventDefault();messages.selectDatabase({0})"><div class="col-12">{1}</div></a>';

    for(var i = 0; i < self.databases.length; i++){
      html += template.format(i, self.databases[i][1]);
    }

    document.getElementById('popupDatabaseList').innerHTML = html;
    document.getElementById('popupDatabase').style.display = 'inherit';
    document.getElementById('cover').style.display = 'inherit';
  }

  self.resetKey = function(){
    if(self.databases.length != 1){
      self.databaseKey = '';
    }
  }

  self.getDatabaseKey = function(xmlDoc) {
    self.databaseKey = '';
    self.databases = [];

    $(xmlDoc).find('list_item').each(function(){
      if($(this).find('account_id').text() == account){
        self.databases.push([$(this).find('database_key').text(), $(this).find('client_name').text()]);
      }
    });

    if(self.databases.length == 1){
      self.databaseKey = self.databases[0][0];

      xmlQuery(xml.create('iSalusExternal.GetProviders')(self.databaseKey), self.getProviderInfo(false));
    }

    if(self.databases.length > 0){
      document.getElementById('noPractices').style.display = 'none';
      document.getElementById('messagesContainer').style.display = 'inherit';
    } else {
      document.getElementById('noPractices').style.display = 'inherit';
      document.getElementById('messagesContainer').style.display = 'none';
    }
  }

  self.loadData = function(){
    currentScreen = messages;

    document.getElementById('messageData').innerHTML = '<h2 class="mt--none mb--none text--bold text--primary">No Message Selected</h2><hr class="light-grey"><p>Select a message from the list to view it.</p>';

    self.selectCategory('R');
    xmlQuery(xml.create('iSalusExternal.GetMessagesCounts'), self.updateUnreadCount);
    common.getConnection(self.getDatabaseKey);
  }
}