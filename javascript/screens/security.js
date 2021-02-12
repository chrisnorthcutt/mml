
function securityScreen(){
  var self = this;

  self.screenTitle = "Account Security";
  self.associatedNavItem = "navMyAccount";

  self.newAccount = '';
  self.resetId = '';

  self.accountPopup = function(){
    document.getElementById('cover').style.display = 'inherit';
    document.getElementById('popup').style.display = 'inherit';
  }

  self.loginCreateSuccess2 = function(xmlDoc){
    common.closeModals();

    document.getElementById('cover').style.display = 'inherit';
    document.getElementById('accountCreationFinish2').style.display = 'inherit';
  }

  self.loginCreateSuccess = function(xmlDoc){
    common.closeModals();

    self.newAccount = $(xmlDoc).find('account_id').text();
    self.resetId = $(xmlDoc).find('reset_id').text();

    document.getElementById('cover').style.display = 'inherit';
    document.getElementById('accountCreationFinish').style.display = 'inherit';
  }

  self.finishCreateLogin = function(){

    var errorFlag = {'error': false};

    var registerPassword = common.validateNotEmpty('securityPassword', 'securityPasswordError', errorFlag);
    var registerPassword2 = common.validateMatchingField('retypePassword', 'retypePasswordError', errorFlag, registerPassword, "Does not match the above.");
    var token = common.validateNotEmpty('registrationToken', 'registrationTokenError', errorFlag);

    if(!errorFlag.error){
      xmlQuery(xml.create('iSalusExternal.FamilyMemberCreateLoginExContinued')(self.newAccount, self.resetId, token, registerPassword2), self.loginCreateSuccess2);
    }
  }

  self.createLogin = function(){

    var errorFlag = {'error': false};

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
      return false;
    }

    var registerQuestion = '';
    var registerAnswer = '';

    if(!errorFlag.error){
      xmlQuery(xml.create('iSalusExternal.FamilyMemberCreateLoginEx')(account, email, phone, registerQuestion, registerAnswer), self.loginCreateSuccess, common.webserviceError('familyMemberCreateError'));
    }
  }

  self.updateSecurity = function(xmlDoc) {
    var emailAddress = $(xmlDoc).find('email_address').text();
    var phoneNumber = $(xmlDoc).find('phone').text();

    if(account != mainUser.accountId && emailAddress == mainUser.emailAddress){
      document.getElementById('noAccount').style.display = 'inherit';
      document.getElementById('mainContainer').style.display = 'none';
    } else {
      document.getElementById('noAccount').style.display = 'none';
      document.getElementById('mainContainer').style.display = 'inherit';
    }

    document.getElementById('password').value = '';
    document.getElementById('userAlias').value = $(xmlDoc).find('user_alias').text();
    document.getElementById('emailAddress').value = emailAddress;
    document.getElementById('phoneNumber').value = phoneNumber;

    $spans.each(function() {
      var $this = $(this);
      $sibling = $this.siblings(".toggleable");
      if($sibling[0].tagName == "INPUT"){
        $this.text($sibling.val());
      }else{
        $this.text($sibling.find(":selected").text());
      }
    });
  }

  self.saveSecurity = function(){

    var errorFlag = {'error': false};

    var password = document.getElementById('password').value;
    var userAlias = common.validateNotEmpty('userAlias', 'userAliasError', errorFlag);
    var emailAddress = common.validateNotEmpty('emailAddress', 'emailAddressError', errorFlag);
    var phone = common.validateNotEmpty('phoneNumber', 'phoneNumberError', errorFlag);
    var securityQuestion = '';
    var securityAnswer = '';

    if(!errorFlag.error){
      $inputs.each(function() {
        var $this = $(this);
        $this.hide().siblings("span").show();
      });

      common.saveButton('saveSecurityButton');
      document.getElementById('securityWebserviceError').innerHTML = '';
      xmlQuery(xml.create('iSalusExternal.SaveSecurity')(password, userAlias, emailAddress, securityQuestion, securityAnswer, phone), self.dataUpdated, common.webserviceError('securityWebserviceError'));
    }
  }

  self.dataUpdated = function(xmlDoc){
    common.buttonDataUpdated('saveSecurityButton');
    document.getElementById('securityWebserviceError').innerHTML = '';
    self.loadData();
  }

  self.loadData = function(){
    currentScreen = securityscreen;
    xmlQuery(xml.create('iSalusExternal.GetSecurity'), self.updateSecurity);
  }
}