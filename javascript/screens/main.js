
function mainScreen(){
  var self = this;

  self.screenTitle = "Dashboard";
  self.associatedNavItem = "navDashboard";

  self.showFamily = false;
  self.accountCreateId = '';

  self.databaseKey = '';
  self.databases = [];
  self.totalBalance = 0;

  self.addFamilyMember = function(){

    var errorFlag = {'error': false};

    var firstName = common.validateNameField('firstName', 'firstNameError', errorFlag);
    var lastName = common.validateNameField('lastName', 'lastNameError', errorFlag);
    var birthDate = common.validateDateField('birthDate', 'birthDateError', errorFlag);
    var relationshipCode = $('#relationshipCode').val();

    if($('#familyMemberCreateLogin').prop('checked')){
      if(self.accountCreateId == ''){
        if(!errorFlag.error){

          validateEmail = function (email) {
            var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(email);
          }

          validatePhone = function (phone) {
            var re = /^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;
            return re.test(phone);
          }

          var email = '';
          var phone = '';

          var userId = $('#registrationEmail').val();

          if (validateEmail(userId)) {
            email = userId;
          } else if (validatePhone(userId)) {
            phone = userId;
          } else {
            $("#registrationEmailError").html('You must enter an email address or a phone number.');
            errorFlag.error = true;
          }

          if(!errorFlag.error){
            xmlQuery(xml.create('iSalusExternal.AddFamilyMember')(firstName, lastName, birthDate, relationshipCode), self.createFamilyLogin);
          }
        }
      } else {
        self.createFamilyLogin(false, self.accountCreateId);
      }
    } else {
      if(!errorFlag.error){
        common.hasRendered = false;
        xmlQuery(xml.create('iSalusExternal.AddFamilyMember')(firstName, lastName, birthDate, relationshipCode), self.handleFamilyMember);
      }
    }
  }

  self.handleFamilyMember = function(xmlDoc){
    self.switchUser($(xmlDoc).find('account_id').text());
  }

  self.createFamilyLogin = function(xmlDoc, id){
    var accountId = $(xmlDoc).find('account_id').text() || id;

    self.accountCreateId = accountId;

    if(accountId != ''){
      var xml2 = new XmlCreator(key);

      var email = '';
      var phone = '';

      var userId = $('#registrationEmail').val();

      if (validateEmail(userId)) {
        email = userId;
      } else if (validatePhone(userId)) {
        phone = userId;
      } else {
        $("#registrationEmailError").html('You must enter an email address or a phone number.');
      }

      common.hasRendered = false;
      xmlQuery(xml2.create('iSalusExternal.FamilyMemberCreateLoginEx')(accountId, email, phone, '', ''), securityscreen.loginCreateSuccess, common.webserviceError('familyMemberWebserviceError'));
    }
  }

  self.familyInfoToggle = function(){
    if($('#familyMemberCreateLogin').prop('checked')){
      $('#familyMemberExtraInfo').css('display', 'inherit');
    } else {
      $('#familyMemberExtraInfo').css('display', 'none');
    }
  }

  self.showFamilyModal = function() {
    self.accountCreateId = '';
    $('#popup').css('display', 'inherit');
    $('#cover').css('display', 'inherit');
    $('#firstName').val('');
    $('#lastName').val('');
    $('#birthDate').val('');
    $('#familyMemberCreateLogin').prop('checked', false);
    self.familyInfoToggle();
    document.getElementById('relationshipCode').selectedIndex = 0;
  }

  self.updateData = function(xmlDoc) {
    var listTemplate = '<li class="tile-list-data-point" onclick="main.switchUser({0})">{1} {2}</li>';
    var listString = listTemplate.format(mainUser.accountId, mainUser.firstName, mainUser.lastName);

    $(xmlDoc).find('list_item').each(function () {
      var accountId = $(this).find('account_id').text();
      var firstName = $(this).find('first_name').text();
      var lastName  = $(this).find('last_name').text();
      listString += listTemplate.format(accountId, firstName, lastName);
    });

    $('#familyList').html( listString );
  }

  self.switchUser = function(accountId) {
    account = accountId;
    xml.setAccount(account);
    xmlQuery(xml.create('iSalusExternal.GetAccount'), common.showProfile, logOut);
  }

  self.updateList = function(listId, tagName) {
    return function (xmlDoc) {
      var listString = "";

      $(xmlDoc).find('list_item').each(function () {
        listString += '<li class="tile-list-data-point">' + $(this).find(tagName).text() + '</li>';
      });

      $('#'+listId).html( listString );
    }
  }

  self.updateMedicationsList = function(listId, tagName) {
    return function (xmlDoc) {
      var listString = "";

      $(xmlDoc).find('list_item').each(function () {
        if($(this).find('stopped_ind').text() == 'N'){
          listString += '<li class="tile-list-data-point">' + $(this).find(tagName).text() + '</li>';
        }
      });

      $('#'+listId).html( listString );
    }
  }

  self.getChart = function(xmlDoc) {
    var accountId = $(xmlDoc).find('account_id').first().text();
    if(typeof updateChart === "function" && typeof updateBloodChart === "function"){
      xmlQuery(xml.create('iSalusExternal.GetJournalWeight')(accountId), updateChart);
      xmlQuery(xml.create('iSalusExternal.GetJournalBP')(accountId), updateBloodChart);
    }
  }

  self.updateBalanceDisplay = function(key, name) {
    return function(xmlDoc) {
      if ($(xmlDoc).find('patient_balance').length > 0) {
        var balance = $(xmlDoc).find('patient_balance').first().text();
        self.totalBalance += parseFloat(balance);
      }

      $('#accountBalance').text( '$'+self.totalBalance );
    }
  }

  self.updateBalance = function(xmlDoc) {
    self.totalBalance = 0;
    self.databaseKey = '';
    self.databases = [];

    $(xmlDoc).find('list_item').each(function(){
      if($(this).find('account_id').text() == account){
        var databaseKey = $(this).find('database_key').text();
        var databaseName = $(this).find('client_name').text()

        self.databases.push([databaseKey, databaseName]);
      }
    });

    if(self.databases.length > 0){
      $.each(self.databases, function(index, value){
        xmlQuery(xml.create('iSalusExternal.GetClaimReport')(value[0]), self.updateBalanceDisplay(value[0], value[1]));
      });
    } else {
      $('#accountBalance').text( "No Balance" );
    }

    $('#balanceDate').html( 'as of '+common.getDateString() );
  }

  self.updateBalanceError = function(xmlDoc) {
    $('#accountBalance').text( "No Balance" );

    $('#balanceDate').html( 'as of '+common.getDateString() );
  }

  self.updateMessages = function(xmlDoc) {
    var changed = false;

    $(xmlDoc).find('list_item').each(function(){
      if($(this).find('account_id').text() == account){
        changed = true;

        var count = $(this).find('count').text();
        $('#messageCount').text( count );

        if(count == 1){
          $('#newMessages').text( 'New Message' );
        }else{
          $('#newMessages').text( 'New Messages' );
        }
      }
    });

    if(!changed){
      $('#messageCount').text( '0' );
      $('#newMessages').text( 'New Messages' );
    }

    $('#messageDate').html( 'as of '+common.getDateString() );
  }

  self.getDatabaseKey = function(xmlDoc) {
    if ($(xmlDoc).find('list_item').length > 0) {
      var databaseKey = $(xmlDoc).find('database_key').first().text();
      xmlQuery(xml.create('iSalusExternal.GetClaimReport')(databaseKey), self.updateBalance, self.updateBalanceError);
    } else {
      self.updateBalanceError();
    }
  }

  self.updateMyChart = function(xmlDoc) {
    var unread = 0;
    var newest = '';

    $(xmlDoc).find('list_item').each(function () {
      if (newest == '') {
        newest = $(this).find('post_date_time').text();
      }
      if ($(this).find('read_ind').text() == 'N') {
        unread += 1;
      }
    });

    $('#myChartUnread').text( unread );

    if(unread == 1){
      $('#newItems').text( 'New Item' );
    }else{
      $('#newItems').text( 'New Items' );
    }

    if (newest == ''){
      $('#chartText').text( 'as of' );
      $('#chartDate').text( common.getDateString() );
    } else {
      $('#chartText').html( 'newest: ' );
      $('#chartDate').text( newest );
    }
  }

  self.updateAppointments = function(xmlDoc) {
    if ($(xmlDoc).find('list_item').length > 0) {
      var elem = $(xmlDoc).find('list_item').first();
      $('#appointmentPractice').text( $(elem).find('location').text() );
      $('#appointmentTime').text( $(elem).find('start_time').text() );
      $('#appointmentDate').text( $(elem).find('long_date').text() );
      $('#appointmentDateTime').css( 'visibility', 'inherit' );
    } else {
      $('#appointmentPractice').text( 'No Scheduled Appointments' );
      $('#appointmentDateTime').css ( 'visibility', 'hidden' );
    }
  }

  self.finishSync = function(xmlDoc){
    xmlQuery(xml.create('iSalusExternal.GetMessagesCounts'), self.updateMessages);
    xmlQuery(xml.create('iSalusExternal.MyChartList')(''), self.updateMyChart);
    xmlQuery(xml.create('iSalusExternal.GetAppointments')('0'), self.updateAppointments);
  }

  self.loadData = function() {
    currentScreen = main;
    xmlQuery(xml.create('iSalusExternal.GetAccount'), self.updateData, logOut);
    xmlQuery(xml.create('iSalusExternal.Sync')(['Messages', 'Appointments', 'ClinicalSummary', 'PatientEducation', 'CCMCarePlan', 'Vitals', 'Medications', 'Goals', 'PatientBalance', 'LabResults']), self.finishSync);
    xmlQuery(xml.create('iSalusExternal.GetAllergyList'), self.updateList('allergyList', 'allergy_desc'));
    xmlQuery(xml.create('iSalusExternal.GetConditionList'), self.updateList('conditionList', 'condition_desc'));
    xmlQuery(xml.create('iSalusExternal.GetMedicationList'), self.updateMedicationsList('medicationList', 'med_name'));
    xmlQuery(xml.create('iSalusExternal.GetJournal'), self.getChart);
    common.getConnection(self.updateBalance);

    if(self.showFamily){
      self.showFamilyModal();
      self.showFamily = false;
    }
  }
}