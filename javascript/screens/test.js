
function testScreen(){
  var self = this;

  self.screenTitle = "Test";
  self.associatedNavItem = "navAboutMe";

  self.updateAllergies = function(xmlDoc) {
    var html = '';

    var template = '<li style="margin-bottom: 10px; border-bottom: 1px solid #f7f7f7;">{0} / <span style="color: #2D6270;">{1}</span><p>{2}</p></li>';

    $(xmlDoc).find('list_item').each(function() {
      html += template.format(
        //Fetch the Allergy Description
        $(this).find('allergy_id').text(),
        $(this).find('allergy_desc').text(), 
        $(this).find('allergy_type_desc').text(), 
        $(this).find('reaction_treatment').text()
      )
    });

    $('#allergyList').html(html);
  }

  self.loadData = function(){
    currentScreen = testscreen;

    xmlQuery(xml.create('iSalusExternal.GetAllergyList'), self.updateAllergies);
  }
}