
function appointmentsScreen(){
  var self = this;

  self.screenTitle = "Appointments";
  self.associatedNavItem = "navMyAppointments";

  self.databaseKey = '';
  self.employerBased = false;
  self.appointmentTypeList = [];
  self.locationList = [];
  self.resourceList = [];
  self.providerInfo = {};
  self.appointmentList = [];
  self.weekOffset = 0;
  self.filterList = [];
  self.searchResults = [];
  self.selectedAppointment = '';
  self.times = [];
  self.canBook = false;
  self.selectedCategory = 0;
  self.clientList = {};
  self.databases = [];

  self.updateList = function(kind){
    return function(xmlDoc) {
      var html = '';
      var template = '<a href="#" onclick="event.preventDefault();appointments.showAppointment(\'{6}\')"><div class="table-row flex flex-align--center"><div class="col-1"><div class="pp"><img class="ppi" src="{5}"/></div></div><div class="col-4"><h4 class="table-data-point">{0}<br/><i>{4}</i></h4></div><div class="col-3"><h4 class="table-data-point">{1}</h4>'+
        '</div><div class="col-2"><h4 class="table-data-point">{2}</h4></div><div class="col-2"><h4 class="table-data-point">{3}</h4></div></div></a>';
      var template2 = '<a href="#" onclick="event.preventDefault();appointments.showAppointmentRequest({4});"><div class="table-row flex flex-align--center">'+
        '<div class="col-5"><h4 class="table-data-point">{0}</h4></div><div class="col-3"><h4 class="table-data-point">{1}</h4>'+
        '</div><div class="col-2"><h4 class="table-data-point">{2}</h4></div><div class="col-2"><h4 class="table-data-point">{3}</h4></div></div></a>';
      self.appointmentList = [];

      var index = 0;
      $(xmlDoc).find('list_item').each(function(){
        var appointmentId = $(this).find('appointment_id').text();
        var date = $(this).find('appointment_time').text();
        var name = $(this).find('account_name').text();
        var duration = $(this).find('duration').text();
        var location = $(this).find('location').text();
        var locationAddress = $(this).find('location_address').text();
        var provider = $(this).find('scheduled_with').text();
        var reason = $(this).find('appointment_type').text();
        var requestedDate = $(this).find('requested_date').text();
        var status = $(this).find('status').text();
        var accountName = $(this).find('account_name').text();
        var message = $(this).find('message').text();
        var responseMessage = $(this).find('response_message').text();
        var databaseKey = $(this).find('database_key').text();

        var found = false;
        if(self.providerInfo.hasOwnProperty(databaseKey)){
          for(var i = 0; i < self.providerInfo[databaseKey].length; i++){
            if(provider == self.providerInfo[databaseKey][i][0]){
              if(kind == '3'){
                html += template2.format(provider, reason, duration, date, self.appointmentList.length);
              } else {
                var providerImg = self.providerInfo[databaseKey][i][1] ? 'data:image/jpeg;base64,'+self.providerInfo[databaseKey][i][1] : './resources/images/icon/icon-provider.svg';
                html += template.format(provider, reason, duration, date, location, providerImg, self.appointmentList.length);
              }
              found = true;
              break;
            }
          }
        }

        if(!found){
          if(kind == '3'){
            html += template2.format(location, accountName, status, requestedDate, self.appointmentList.length);
          } else {
            html += template.format(provider, reason, duration, date, location, './resources/images/icon/icon-provider.svg', self.appointmentList.length);
          }
        }

        self.appointmentList.push([appointmentId, date, name, duration, location, locationAddress, provider, reason, message, responseMessage, databaseKey]);
      });

      if(html == ''){
        self.setPlaceholder(self.selectedCategory);
        document.getElementById('noAppointments').style.display = 'inherit';
        document.getElementById('tableHeader').style.display = 'none';
      } else {
        document.getElementById('noAppointments').style.display = 'none';
        document.getElementById('tableHeader').style.display = 'inherit';
      }
      document.getElementById('appointmentList').innerHTML = html;
    }
  }

  self.showAppointmentRequest = function(which){
    document.getElementById('popupRequest').style.display = 'inherit';
    document.getElementById('cover').style.display = 'inherit';
    document.getElementById('patientRequest').innerText = self.appointmentList[which][8].replace(/\{CR\}/g, "\n");
    document.getElementById('patientRequest').scrollTop = 0;
    document.getElementById('physicianResponse').innerText = self.appointmentList[which][9].replace(/\{CR\}/g, "\n");
    document.getElementById('physicianResponse').scrollTop = 0;
  }

  self.showAppointment = function(which){
    var template = '<p>{0}, {1}, {2}, {3}, {4}, {5}, {6}, {7}</p>';

    if (self.selectedCategory === '0') {
      $('#appointmentCancelButton').show();
    } else {
      $('#appointmentCancelButton').hide();
    }

    document.getElementById('popup-appointment-info').style.display = 'inherit';
    document.getElementById('cover').style.display = 'inherit';
    document.getElementById('infoDate').innerText = self.appointmentList[which][1];
    document.getElementById('infoAddress').innerHTML = self.appointmentList[which][5].replace('~', '<br>');
    document.getElementById('infoProvider').innerText = self.appointmentList[which][6];
    document.getElementById('infoLocation').innerText = self.appointmentList[which][4];
    document.getElementById('infoReason').innerText = self.appointmentList[which][7];
    document.getElementById('providerImage').src = './resources/images/icon/icon-provider.svg';

    document.getElementById('cancelAppointmentId').value = self.appointmentList[which][0];
    document.getElementById('cancelAppointmentKey').value = self.appointmentList[which][10];

    var databaseKey = self.appointmentList[which][10];

    if(self.providerInfo.hasOwnProperty(databaseKey)){
      for(var j = 0; j < self.providerInfo[databaseKey].length; j++){
        if(self.appointmentList[which][6] == self.providerInfo[databaseKey][j][0]){
          if(self.providerInfo[databaseKey][j][1]){
            document.getElementById('providerImage').src = 'data:image/jpeg;base64,'+self.providerInfo[databaseKey][j][1];
          }
          break;
        }
      }
    }
  }

  self.confirmAppointmentCancel = function() {
    document.getElementById('popup-confirmation').style.display = 'inherit';
    document.getElementById('cover').style.display = 'inherit';
  }

  self.cancelAppointment = function() {
    var id = document.getElementById('cancelAppointmentId').value;
    var key = document.getElementById('cancelAppointmentKey').value;

    xmlQuery(xml.create('iSalusExternal.CancelAppointment')(account, key, id), self.afterCancel);
  }

  self.afterCancel = function(xmlDoc) {
    common.refresh();
    var passed = $(xmlDoc).find('passed').text() == 'Y';
    document.getElementById('cancelAppointmentStatus').innerHTML = passed ? 'You have successfully cancelled the appointment.' : 'The appointment could not be cancelled.';
    document.getElementById('popup-after-cancel').style.display = 'inherit';
    document.getElementById('cover').style.display = 'inherit';
  }

  self.closeModals = function(){
    $('.popup').each(function(){
      this.style.display = 'none';
    });
    document.getElementById('cover').style.display = 'none';
  }

  self.setHeader = function(number){
    var template = '<div class="col-{0}"><h4 class="table-head-title">{1}</h4></div>'
    var html = '';
    var list = [];

    if(parseInt(number) < 3){
      list = [[5, 'Provider'], [3, 'Reason'], [2, 'Duration'], [2, 'Date']];
    } else {
      list = [[5, 'Location'], [3, 'For'], [2, 'Status'], [2, 'Requested Date']];
    }

    for(var i = 0; i < list.length; i++){
      html += template.format(list[i][0], list[i][1]);
    }

    document.getElementById('tableHeader').innerHTML = html;
  }

  self.setPlaceholder = function(number){
    var options = ['Upcoming Appointments', 'Previous Appointments', 'Cancelled Appointments', 'Appointment Requests'];

    document.getElementById('placeholderText').innerText = options[number];
  }

  self.selectAppointments = function(number){
    for(var i = 0; i < 4; i++){
      if(i+'' === number){
        $('#appointment-category-'+i).addClass('text-tab-item--active');
      } else {
        $('#appointment-category-'+i).removeClass('text-tab-item--active');
      }
    }
    self.setHeader(number);
    self.selectedCategory = number;
    xmlQuery(xml.create('iSalusExternal.GetAppointments')(number), self.updateList(number));
  }

  self.changeFilter = function(){
    var boxes = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
    var elem = null;
    self.filterList = [];

    for(var i = 0; i < boxes.length; i++){
      elem = document.getElementById('employer-checkbox-'+boxes[i]);
      if(!elem.checked){
        self.filterList.push(elem.value);
      }
    }

    self.getAppointmentSearch();
  }

  self.changeWeek = function(number){
    self.weekOffset += number;
    self.getAppointmentSearch();
  }

  self.pickAppointment = function(id){
    self.selectedAppointment = id;
    $('#bookButton').removeClass('btn--disabled');
    self.canBook = true;

    for(var i = 0; i < self.searchResults.length; i++){
      if(id == self.searchResults[i]){
        $('#appointment-tile-'+self.searchResults[i]).addClass('appointment-selected');
      } else {
        $('#appointment-tile-'+self.searchResults[i]).removeClass('appointment-selected');
      }
    }
  }

  self.showTimes = function(xmlDoc){
    self.times = [];
    var template = '<a href="#" onclick="event.preventDefault();appointments.pickAppointment(\'{1}\')"><div id="appointment-tile-{1}" class="col-2 text-align--center">'+
      '<div class="col-12 text-size--small bg--light-blue-grey text-color--primary-dark"><p>{0}</p></div></div></a>';
    var weekTemplate = '<div class="week-selector text-align--center"><a class="week-selector__arrow previous" href="#" onclick="event.preventDefault();appointments.changeWeek(-1);"></a> <p class="text-color--grey text-weight--bold">Week of {0}</p> <a class="week-selector__arrow next" href="#" onclick="event.preventDefault();appointments.changeWeek(1);"></a></div>';
    var html = '';
    var header = '';

    header += weekTemplate.format($(xmlDoc).find('week_of').text());

    self.searchResults = [];

    $(xmlDoc).find('date_item').each(function(){
      var date = $(this).find('schedule_date').text();

      var day = $(this).find('long_date').text().split(',')[0];
      if(self.filterList.indexOf(day) > -1){
        return 'continue';
      }

      html += '<p class="text-weight--bold">' + $(this).find('long_date').text() + '</p><br/><div class="row">';

      var slots = {};
      var appointmentTypeId = document.getElementById('employerReason').value;

      $(this).find('resource_item').each(function(){
        var resourceName = $(this).find('resource_name').text();
        var resourceId = $(this).find('resource_id').text();

        $(this).find('service_item').each(function(){
          var serviceLocation = $(this).find('service_location').text();
          var serviceLocationId = $(this).find('service_location_id').text();

          $(this).find('appt_item').each(function(){
            var startTime = $(this).find('start_time').text();
            var endTime = $(this).find('end_time').text();
            var placeholderId = $(this).find('placeholder_id').text();
            var placeholderInd = $(this).find('placeholder_ind').text();
            //var appointmentTypeId = $(this).find('appointment_type_id').text();

            self.times.push([date, resourceName, resourceId, serviceLocation, startTime, endTime, placeholderId, placeholderInd, appointmentTypeId, serviceLocationId]);

            if(slots.hasOwnProperty(startTime)){
              slots[startTime][0] += 1;
            } else {
              slots[startTime] = [1, placeholderId];
            }
          });
        });
      });

      for(var i in slots){
        if(i != undefined){
          html += template.format(i + " slots: " + slots[i][0], slots[i][1]);
          self.searchResults.push(slots[i][1]);
        }
      }

      html += '</div>';
    });

    document.querySelector('#employerClinicTimes').innerHTML = header + (html || '<i>No results found for those criteria.</i>');
  }

  self.getAppointmentSearch = function(){

    var errorFlag = {'error': false};

    var timeframe = common.validateNotEmpty('employerTimeframe', 'employerTimeframeError', errorFlag);
    var appointmentType = common.validateNotEmpty('employerReason', 'employerReasonError', errorFlag);
    var location = common.validateNotEmpty('employerLocation', 'employerLocationError', errorFlag);

    if(!errorFlag.error){
      xmlQuery(xml.create('iSalusExternal.GetAppointmentSearch')(self.databaseKey, appointmentType, location, '', timeframe, self.weekOffset.toString()), self.showTimes);
    }
  }

  self.showPracticeMessage = function(message){
    return function(xmlDoc){
      self.resetKey();
      common.closeModals();

      if ( $(xmlDoc).find('passed').text() == 'Y' ) {
        var messageResponse = $(xmlDoc).find('message_response').text() || message;
        document.getElementById('practiceMessageContent').innerHTML = messageResponse || 'Your message has been received.';
      } else {
        document.getElementById('practiceMessageContent').innerHTML = $(xmlDoc).find('message').text();
      }

      document.getElementById('popupPracticeMessage').style.display = 'inherit';
      document.getElementById('cover').style.display = 'inherit';

      common.refreshState = true;
    }
  }

  self.bookAgain = function(xmlDoc){
    common.closeModals();

    var messageResponse = $(xmlDoc).find('message_response').text();

    if ( $(xmlDoc).find('passed').text() == 'Y' ) {
      document.getElementById('popupBookAgain').style.display = 'inherit';
    } else {
      document.getElementById('bookingFailedMessage').innerHTML = $(xmlDoc).find('message').text();
      document.getElementById('popupBookingFailed').style.display = 'inherit';
    }
    document.getElementById('cover').style.display = 'inherit';

    common.refreshState = true;
  }

  self.bookAppointment = function(){
    if(self.canBook){
      for(var i = 0; i < self.times.length; i++){
        if(self.times[i][6] == self.selectedAppointment){
          var appointmentTypeId = self.times[i][8];
          var serviceLocationId = self.times[i][9];
          var resourceId = self.times[i][2];
          var placeholderId = self.times[i][6];
          var placeholderInd = self.times[i][7];
          var scheduleDate = self.times[i][0];
          var startTime = self.times[i][4];
          var endTime = self.times[i][5];

          if(typeof(isNeurocore) !== 'undefined'){
            var accountId = document.getElementById('employerClient').value;
            var xml2 = new XmlCreator(key);
            xml2.setAccount(accountId);
            xmlQuery(xml2.create('iSalusExternal.BookAppointment')(self.databaseKey, appointmentTypeId, serviceLocationId, resourceId, placeholderId, placeholderInd, scheduleDate, startTime, endTime), self.bookAgain);
          }else{
            xmlQuery(xml.create('iSalusExternal.BookAppointment')(self.databaseKey, appointmentTypeId, serviceLocationId, resourceId, placeholderId, placeholderInd, scheduleDate, startTime, endTime), self.showPracticeMessage('Your appointment has been booked.'));
          }
          break;
        }
      }
    }
  }

  self.sendAppointmentRequest = function(){
    var phone = document.getElementById('phone').value;
    var other = document.getElementById('other').value;
    var provider = document.getElementById('provider').value;
    var reason = document.getElementById('reason').value;
    var timeframe = document.getElementById('timeframe').value;
    var preferred = document.getElementById('preferredTime').value;
    var important = document.getElementById('mostImportant').value;

    var days = [];
    days.push(document.getElementById('checkbox-Mon').checked);
    days.push(document.getElementById('checkbox-Tue').checked);
    days.push(document.getElementById('checkbox-Wed').checked);
    days.push(document.getElementById('checkbox-Thu').checked);
    days.push(document.getElementById('checkbox-Fri').checked);
    days.push(document.getElementById('checkbox-Sat').checked);
    days.push(document.getElementById('checkbox-Sun').checked);

    for(var i = 0; i < days.length; i++){
      if(days[i]){
        days[i] = 'Y';
      }else{
        days[i] = 'N';
      }
    }

    xmlQuery(xml.create('iSalusExternal.SendAppointmentRequest')(phone, other, self.databaseKey, provider, reason, timeframe, days[0], days[1], days[2], days[3], days[4], days[5], days[6], preferred, important), self.showPracticeMessage('Your request has been received.'));
  }

  self.getCreateInfo = function(openModal) {
    return function(xmlDoc){
      var appointmentXml = $(xmlDoc).find('appointment_type_list');
      var tempAppointment = [['', '']];

      $(appointmentXml).find('list_item').each(function(){
        tempAppointment.push([$(this).find('encode').text(), $(this).find('decode').text()]);
      });

      var locationXml = $(xmlDoc).find('location_list');
      var tempLocation = [['', '']];

      $(locationXml).find('list_item').each(function(){
        tempLocation.push([$(this).find('encode').text(), $(this).find('decode').text()]);
      });

      var resourceXml = $(xmlDoc).find('resource_list');
      var tempResource = [['', '']];

      $(resourceXml).find('list_item').each(function(){
        if($(this).find('h').text() != '1'){
          tempResource.push([$(this).find('encode').text(), $(this).find('decode').text()]);
        }
      });

      self.appointmentTypeList = tempAppointment;
      self.locationList = tempLocation.sort(function(a,b){return a[1].toLowerCase().localeCompare(b[1].toLowerCase());});
      self.resourceList = tempResource;

      self.createSelect('employerLocation', self.locationList);
      self.createSelect('employerReason', self.appointmentTypeList);
      self.createSelect('employerProvider', self.resourceList);

      if(openModal){
        common.closeModals();

        self.newAppointment();
      }
    }
  }

  self.createSelect = function(id, list){
    if(typeof(list) !== 'undefined'){
      var html = '';
      var template = '<option value="{0}">{1}</option>';

      for(var i = 0; i < list.length; i++){
        html += template.format(list[i][0], list[i][1]);
      }

      var elem = document.getElementById(id);
      elem.innerHTML = html;
      elem.selectedIndex = 0;
    }
  }

  self.renderProviderDropdown = function(databaseKey){
    var html = '';
    var template = '<option value="{0}">{0}</option>';

    for(var i = 0; i < self.providerInfo[databaseKey].length; i++) {
      html += template.format(self.providerInfo[databaseKey][i][0]);
    }

    var elem = document.getElementById('provider');
    elem.innerHTML = html;
    elem.selectedIndex = 0;
  }

  self.getProviderInfo = function(databaseKey){
    return function(xmlDoc) {
      var tempList = [];

      $(xmlDoc).find('list_item').each(function(){
        var name = $(this).find('ProviderName').text();
        var headshot = $(this).find('base64').text();

        tempList.push([name, headshot]);
      });

      self.providerInfo[databaseKey] = tempList;

      self.selectAppointments('0');
    }
  }

  self.selectDatabase = function(number, employerBased){
    self.databaseKey = self.databases[number][0];
    self.employerBased = employerBased == '1';

    self.createSelect('employerClient', self.clientList[self.databaseKey]);
    self.renderProviderDropdown(self.databaseKey);

    xmlQuery(xml.create('iSalusExternal.GetAppointmentCreate')(self.databaseKey), self.getCreateInfo(true));
  }

  self.showDatabaseSelect = function(){
    var html = '';
    var template = '<a class="text-weight--bold popup__list-item" href="" onclick="event.preventDefault();appointments.selectDatabase({0}, {2})"><div class="col-12">{1}</div></a>';

    for(var i = 0; i < self.databases.length; i++){
      html += template.format(i, self.databases[i][1], self.databases[i][2]);
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

    self.saveClientList(xmlDoc);

    $(xmlDoc).find('list_item').each(function(){
      if($(this).find('account_id').text() == account){
        self.databases.push([$(this).find('database_key').text(), $(this).find('client_name').text(), $(this).find('employer_module_active').text()]);
      }
    });

    if(self.databases.length == 1){
      self.databaseKey = self.databases[0][0];
      self.employerBased = self.databases[0][2] == '1';

      self.createSelect('employerClient', self.clientList[self.databaseKey]);

      xmlQuery(xml.create('iSalusExternal.GetAppointmentCreate')(self.databaseKey), self.getCreateInfo(false));
    }

    if(self.databases.length > 0){
      document.getElementById('noPractices').style.display = 'none';
      document.getElementById('appointmentList').style.display = 'inherit';
      document.getElementById('tableHeader').style.display = 'inherit';
      document.getElementById('mainHeader').style.display = 'inherit';

      self.providerInfo = {};
      for(var i = 0; i < self.databases.length; i++){
        xmlQuery(xml.create('iSalusExternal.GetProviders')(self.databases[i][0]), self.getProviderInfo(self.databases[i][0]));
      }
    } else {
      document.getElementById('noPractices').style.display = 'inherit';
      document.getElementById('appointmentList').style.display = 'none';
      document.getElementById('noAppointments').style.display = 'none';
      document.getElementById('tableHeader').style.display = 'none';
      document.getElementById('mainHeader').style.display = 'none';
    }
  }

  self.newAppointment = function(){
    self.filterList = [];

    if(self.databaseKey != ''){
      if(self.employerBased){
        document.getElementById('popup-employer').style.display = 'inherit';
        document.getElementById('cover').style.display = 'inherit';
        document.getElementById('employer-checkbox-mon').checked = true;
        document.getElementById('employer-checkbox-tue').checked = true;
        document.getElementById('employer-checkbox-wed').checked = true;
        document.getElementById('employer-checkbox-thu').checked = true;
        document.getElementById('employer-checkbox-fri').checked = true;
        document.getElementById('employer-checkbox-sat').checked = true;
        document.getElementById('employer-checkbox-sun').checked = true;
        document.getElementById('employerClinicTimes').innerHTML = '';
        $('#bookButton').addClass('btn--disabled');
        self.canBook = false;
        self.times = [];
        self.selectedAppointment = '';
        self.weekOffset = 0;
      } else {
        if(self.databases.length == 1){
          self.renderProviderDropdown(self.databaseKey);
        }
        document.getElementById('popup').style.display = 'inherit';
        document.getElementById('cover').style.display = 'inherit';
        document.getElementById('checkbox-Mon').checked = false;
        document.getElementById('checkbox-Tue').checked = false;
        document.getElementById('checkbox-Wed').checked = false;
        document.getElementById('checkbox-Thu').checked = false;
        document.getElementById('checkbox-Fri').checked = false;
        document.getElementById('checkbox-Sat').checked = false;
        document.getElementById('checkbox-Sun').checked = false;
      }
    } else {
      if(self.databases.length > 1){
        self.showDatabaseSelect();
      }
    }
  }

  self.saveClientList = function(xmlDoc){
    self.clientList = {};

    $(xmlDoc).find('list_item').each(function(){
      var thisKey = $(this).find('database_key').text();

      if(!self.clientList.hasOwnProperty(thisKey)){
        self.clientList[thisKey] = [];
      }

      self.clientList[thisKey].push([$(this).find('account_id').text(), $(this).find('account_name').text()]);
    });
  }

  self.loadData = function(){
    currentScreen = appointments;

    if(typeof(isNeurocore) !== 'undefined'){
      document.getElementById('appointment-category-3').style.display = 'none';
      document.getElementById('employerClientSection').style.display = 'inherit';
      document.getElementById('employerProviderSection').style.display = 'none';
      document.getElementById('employerSundayBox').style.display = 'none';

      $('.checkboxContainer').each(function(){
        $(this).addClass('col-2')
      });
    }

    xmlQuery(xml.create('iSalusWindow.GetList')('preferred_time'), common.renderDropdown('preferredTime', '', true));
    xmlQuery(xml.create('iSalusWindow.GetList')('time_important'), common.renderDropdown('mostImportant', '', true));

    xmlQuery(xml.create('iSalusExternal.Sync')(['Appointments']),
      function(){
        common.getConnection(self.getDatabaseKey);
      }
    );
  }
}
