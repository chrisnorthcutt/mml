
function emergencyScreen(){
  var self = this;

  self.screenTitle = "Emergency Contact";
  self.associatedNavItem = "navAboutMe";

  self.updateEmergency = function(xmlDoc) {
    var primary = $(xmlDoc).find('primary');
    var secondary = $(xmlDoc).find('secondary');

    document.getElementById('primaryName').value = $(primary).find('name').text();
    document.getElementById('primaryRelationshipCode').value = $(primary).find('relationship_code').text();
    document.getElementById('primaryHome').value = $(primary).find('home').text();
    document.getElementById('primaryCell').value = $(primary).find('cell').text();
    document.getElementById('primaryWork').value = $(primary).find('work').text();
    document.getElementById('secondaryName').value = $(secondary).find('name').text();
    document.getElementById('secondaryRelationshipCode').value = $(secondary).find('relationship_code').text();
    document.getElementById('secondaryHome').value = $(secondary).find('home').text();
    document.getElementById('secondaryCell').value = $(secondary).find('cell').text();
    document.getElementById('secondaryWork').value = $(secondary).find('work').text();

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

    common.buttonDataUpdated('saveEmergencyButton');

    self.loadData();
  }

  self.saveEmergency = function(){

    var errorFlag = {'error': false};

    var primaryName = document.getElementById('primaryName').value;
    var primaryRelationshipCode = document.getElementById('primaryRelationshipCode').value;
    var primaryHome = common.validatePhoneField('primaryHome', 'primaryHomeError', errorFlag, true);
    var primaryCell = common.validatePhoneField('primaryCell', 'primaryCellError', errorFlag, true);
    var primaryWork = common.validatePhoneField('primaryWork', 'primaryWorkError', errorFlag, true);
    var secondaryName = document.getElementById('secondaryName').value;
    var secondaryRelationshipCode = document.getElementById('secondaryRelationshipCode').value;
    var secondaryHome = common.validatePhoneField('secondaryHome', 'secondaryHomeError', errorFlag, true);
    var secondaryCell = common.validatePhoneField('secondaryCell', 'secondaryCellError', errorFlag, true);
    var secondaryWork = common.validatePhoneField('secondaryWork', 'secondaryWorkError', errorFlag, true);

    if(!errorFlag.error){
      common.saveButton('saveEmergencyButton');
      xmlQuery(xml.create('iSalusExternal.SaveEmergency')(primaryName, primaryRelationshipCode, primaryHome, primaryCell, primaryWork, secondaryName, secondaryRelationshipCode, secondaryHome, secondaryCell, secondaryWork), self.resetFields);
    }
  }

  self.loadData = function(){
    currentScreen = emergency;

    $('.field-error').each(function(){
      $(this).html('');
    });

    xmlQuery(xml.create('iSalusExternal.GetEmergency'), self.updateEmergency);
  }
}