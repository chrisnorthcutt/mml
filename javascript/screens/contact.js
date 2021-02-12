
function contactScreen(){
  var self = this;

  self.screenTitle = "Contact";
  self.associatedNavItem = "navAboutMe";

  self.updateContact = function(xmlDoc) {
    document.getElementById('address').value = $(xmlDoc).find('address').text();
    document.getElementById('zip').value = $(xmlDoc).find('zip').text();
    document.getElementById('home').value = $(xmlDoc).find('home').text();
    document.getElementById('cell').value = $(xmlDoc).find('cell').text();
    document.getElementById('work').value = $(xmlDoc).find('work').text();

    $spans.each(function() {
      var $this = $(this);
      $this.text($this.siblings("input").val());
    });
  }

  self.resetFields = function(xmlDoc){
    $inputs.each(function() {
      var $this = $(this);
      $this.hide().siblings("span").text($this.val()).show();
    });

    common.buttonDataUpdated('saveContactButton');

    self.loadData();
  }

  self.saveContact = function(){

    var errorFlag = {'error': false};

    var address = document.getElementById('address').value;
    var zip = document.getElementById('zip').value;
    var home = common.validatePhoneField('home', 'homeError', errorFlag, true);
    var cell = common.validatePhoneField('cell', 'cellError', errorFlag, true);
    var work = common.validatePhoneField('work', 'workError', errorFlag, true);

    if(!errorFlag.error){
      common.saveButton('saveContactButton');
      xmlQuery(xml.create('iSalusExternal.SaveContact')(address, zip, home, cell, work), self.resetFields);
    }
  }

  self.loadData = function(){
    currentScreen = contact;
    xmlQuery(xml.create('iSalusExternal.GetContact'), self.updateContact);
  }
}