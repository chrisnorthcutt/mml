
function connectScreen(){
  var self = this;

  self.screenTitle = "Connect";
  self.associatedNavItem = "navMyPractices";

  self.enabled = false;

  self.connectionDialog = function(){
    if(self.enabled){
      document.getElementById('popup').style.display = 'inherit';
      document.getElementById('cover').style.display = 'inherit';
      document.getElementById('lastName').value = '';
      document.getElementById('birthDate').value = '';
      document.getElementById('registrationCode').value = '';
    }
  }

  self.showList = function(xmlDoc){
    var html = '';
    var template = '<div class="table-row"><p>{0} <span class="icon-bg--delete fr" onclick="connect.confirmDisconnect(\'{1}\', \'{2}\', \'{0}\');"></span></p></div>';

    $(xmlDoc).find('list_item').each(function () {
      if($(this).find('account_id').text() == account){
        html += template.format($(this).find('client_name').text(), $(this).find('database_key').text(), $(this).find('account_name').text());
      }
    });

    if (html === '') {
      $('#noPractices').show();
      $('#practiceContainer').hide();
    } else {
      $('#noPractices').hide();
      $('#practiceContainer').show();
    }

    document.getElementById('connectedPracticeList').innerHTML = html;
  }

  self.confirmDisconnect = function(databaseKey, name, practiceName){
    var template = "Are you sure you want to disconnect {0} from {1}?";

    document.getElementById('disconnectConfirmation').innerHTML = template.format(name, practiceName);
    document.getElementById('disconnectDatabaseKey').value = databaseKey;

    document.getElementById('cover').style.display = 'inherit';
    document.getElementById('popup-confirmation').style.display = 'inherit';
  }

  self.connectionSuccess = function(){
    common.clearConnectionCache();
    common.refresh();
  }

  self.disconnect = function(){
    var databaseKey = document.getElementById('disconnectDatabaseKey').value;

    xmlQuery(xml.create('iSalusExternal.Disconnect')(databaseKey), self.connectionSuccess);
  }

  self.connectionError = function(xmlDoc){
    document.getElementById('registrationFailure').innerHTML = $(xmlDoc).find('description').text();
  }

  self.connect = function(){
    var lastName = $('#registrationLastName').val();
    var birthDate = $('#registrationDob').val();
    var ssn = $('#registrationSsn').val();
    var zip = $('#registrationZip').val();
    var phone = $('#registrationPhone').val();
    var registrationCode = self.getAccessCode();

    xmlQuery(xml.create('iSalusExternal.Connect')(lastName, birthDate, ssn, zip, phone, registrationCode), self.connectionSuccess, common.webserviceError('registrationFailure'));
  }

  self.hashConnect = function(){
    var lastName = document.getElementById('hashLastName').value;
    var birthDate = document.getElementById('hashBirthDate').value;
    var ssn = '';
    var h = document.getElementById('hash').value;
    var accountId = document.getElementById('hashAccount').value;
    var xml2 = new XmlCreator(key);
    xml2.setAccount(accountId);
    // var userEmailAddress = document.getElementById('userEmailAddress').value;

    xmlQuery(xml2.create('iSalusExternal.Connect')('', lastName, birthDate, ssn, undefined, h, currentUser.emailAddress), self.connectionSuccess, common.webserviceError('hashFailure'));
  }

  self.createSelect = function(id, list){
    var html = '';
    var template = '<option value="{0}">{1}</option>';

    for(var i = 0; i < list.length; i++){
      html += template.format(list[i][0], list[i][1]);
    }

    var elem = document.getElementById(id);
    elem.innerHTML = html;
    elem.selectedIndex = 0;
  }

  self.updateFamilyMemberDropdown = function(xmlDoc){
    var main = $(xmlDoc).find('main');
    var familyMembers = [[$(main).find('account_id').text(), $(main).find('first_name').text()]];

    $(xmlDoc).find('list_item').each(function(){
      familyMembers.push([$(this).find('account_id').text(), $(this).find('first_name').text()]);
    });

    self.createSelect('hashAccount', familyMembers);
  }

  self.getFamilyMembers = function(){
    xmlQuery(xml.create('iSalusExternal.GetAccount'), self.updateFamilyMemberDropdown);
  }

  self.openAccessCodeModal = function () {
    $('#accessCode').show();
    $('#cover').show();
  }

  self.getAccessCode = function () {
    return $('#code0').val() + ' ' + $('#code1').val() + ' ' + $('#code2').val();
  }

  self.fetchConnectionFields = function () {
    var accessCode = self.getAccessCode();

    $('#codeEntryFailure').html('');

    xmlQuery(xml.create('iSalusExternal.GetRegistration')(accessCode), function (xmlDoc) {
      var practiceTitle = $(xmlDoc).find('practice_title').text();
      var practicePhone = $(xmlDoc).find('practice_phone').text();
      var practiceLogo = $(xmlDoc).find('practice_logo').text();

      xmlQuery(xml.create('iSalusSecurity.ConnectionSetup')(accessCode), function (xmlDoc) {
        console.log(xmlDoc);

        var toggleInput = function (id, xmlDoc, tagName) {
          if ($(xmlDoc).find(tagName).text() === 'Y') {
            return $('#' + id).show();
          }
          return $('#' + id).hide();
        }

        $('#practiceLogo').attr('src', 'data:img/png;base64,'+practiceLogo);
        $('#practiceTitle').text(practiceTitle);

        toggleInput('registrationZipGroup', xmlDoc, 'zip_ind');
        toggleInput('registrationSsnGroup', xmlDoc, 'ssn_ind');
        toggleInput('registrationPhoneGroup', xmlDoc, 'phone_ind');

        common.closeModals();
        $('#verifyConnectionInfo input').val('');
        $('#verifyConnectionInfo').show();
        $('#cover').show();
      }, common.webserviceError('codeEntryFailure'));
    }, common.webserviceError('codeEntryFailure'));
  }

  self.loadData = function(){
    currentScreen = connect;

    common.getConnection(self.showList);

    self.getFamilyMembers();
  }
}