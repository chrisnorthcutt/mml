
function employerScreen(){
  var self = this;

  self.screenTitle = "Employer";
  self.associatedNavItem = "navAboutMe";

  self.updateEmployer = function(xmlDoc) {
    document.getElementById('occupation').value = $(xmlDoc).find('occupation').text();
    document.getElementById('employer-name').value = $(xmlDoc).find('employer_name').text();
    document.getElementById('address').value = $(xmlDoc).find('address').text();
    document.getElementById('zip').value = $(xmlDoc).find('zip').text();
    document.getElementById('work').value = $(xmlDoc).find('work').text();
    document.getElementById('fax').value = $(xmlDoc).find('fax').text();

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

    common.buttonDataUpdated('saveEmployerButton');

    self.loadData();
  }

  self.saveEmployer = function(){

    var errorFlag = {'error': false};

    var occupation = document.getElementById('occupation').value;
    var employerName = document.getElementById('employer-name').value;
    var address = document.getElementById('address').value;
    var zip = document.getElementById('zip').value;
    var work = common.validatePhoneField('work', 'workError', errorFlag, true);
    var fax = common.validatePhoneField('fax', 'faxError', errorFlag, true);

    if(!errorFlag.error){
      common.saveButton('saveEmployerButton');
      xmlQuery(xml.create('iSalusExternal.SaveEmployer')(occupation, employerName, address, zip, work, fax), self.resetFields);
    }
  }

  self.loadData = function(){
    currentScreen = employer;
    xmlQuery(xml.create('iSalusExternal.GetEmployer'), self.updateEmployer);
  }
}