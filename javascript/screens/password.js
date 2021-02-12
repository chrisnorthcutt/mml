
function passwordScreen(){
  var self = this;

  self.screenTitle = "Password";
  self.associatedNavItem = "navMyAccount";

  self.passwordReset = function(){
    var oldPassword = document.getElementById('oldPassword').value;
    var password1 = document.getElementById('password1').value;
    var password2 = document.getElementById('password2').value;

    common.saveButton('savePasswordButton');

    xmlQuery(xml.create('iSalusExternal.PasswordReset')(oldPassword, password1, password2), self.dataUpdated, common.webserviceError('passwordWebserviceError'));
  }

  self.dataUpdated = function(xmlDoc){
    common.buttonDataUpdated('savePasswordButton');
    self.loadData();
  }

  self.loadData = function(){
    document.getElementById('oldPassword').value = '';
    document.getElementById('password1').value = '';
    document.getElementById('password2').value = '';
    
    currentScreen = passwordReset;

    if(account != mainUser.accountId && currentUser.emailAddress == mainUser.emailAddress){
      document.getElementById('noAccount').style.display = 'inherit';
      document.getElementById('mainContainer').style.display = 'none';
    } else {
      document.getElementById('noAccount').style.display = 'none';
      document.getElementById('mainContainer').style.display = 'inherit';
    }
  }
}