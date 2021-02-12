
function demographicsScreen(){
  var self = this;

  self.screenTitle = "Demographics";
  self.associatedNavItem = "navAboutMe";

  self.updateDemographics = function(xmlDoc) {
    document.getElementById('firstName').value = $(xmlDoc).find('first_name').text();
    document.getElementById('lastName').value = $(xmlDoc).find('last_name').text();
    document.getElementById('birthDate').value = $(xmlDoc).find('birth_date').text();
    $('#genderCode').val([$(xmlDoc).find('gender_code').text()]);
    document.getElementById('maritalCode').value = $(xmlDoc).find('marital_code').text();
    document.getElementById('bloodTypeCode').value = $(xmlDoc).find('blood_type_code').text();
    document.getElementById('ethnicityCode').value = $(xmlDoc).find('ethnicity_code').text();
    document.getElementById('eyeColorCode').value = $(xmlDoc).find('eye_color_code').text();
    document.getElementById('hairColorCode').value = $(xmlDoc).find('hair_color_code').text();
    document.getElementById('birthmarksScars').value = $(xmlDoc).find('birthmarks_scars').text();
    document.getElementById('specialConditions').value = $(xmlDoc).find('special_conditions').text();

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

  self.resetFields = function(xmlDoc){
    $inputs.each(function() {
      var $this = $(this);
      $this.hide().siblings("span").show();
    });

    common.buttonDataUpdated('saveDemographicsButton');

    common.hasRendered = false;
    xmlQuery(xml.create('iSalusExternal.GetAccount'), common.showProfile, logOut);
  }

  self.saveDemographics = function(){

    var errorFlag = {'error': false};

    var firstName = common.validateNameField('firstName', 'firstNameError', errorFlag);
    var lastName = common.validateNameField('lastName', 'lastNameError', errorFlag);
    var birthDate = common.validateDateField('birthDate', 'birthDateError', errorFlag, false, '01/01/1900');
    var genderCode = document.getElementById('genderCode').value;
    var ssn = '';
    var maritalCode = document.getElementById('maritalCode').value;
    var bloodTypeCode = document.getElementById('bloodTypeCode').value;
    var ethnicityCode = document.getElementById('ethnicityCode').value;
    var eyeColorCode = document.getElementById('eyeColorCode').value;
    var hairColorCode = document.getElementById('hairColorCode').value;
    var birthmarksScars = document.getElementById('birthmarksScars').value;
    var specialConditions = document.getElementById('specialConditions').value;

    if(!errorFlag.error){
      common.saveButton('saveDemographicsButton');
      xmlQuery(xml.create('iSalusExternal.SaveDemographics')(firstName, lastName, birthDate, genderCode, ssn, maritalCode, bloodTypeCode, ethnicityCode, eyeColorCode, hairColorCode, birthmarksScars, specialConditions), self.resetFields);
    }
  }

  self.loadData = function(){
    currentScreen = demographics;
    xmlQuery(xml.create('iSalusExternal.GetDemographics'), self.updateDemographics);
  }
}