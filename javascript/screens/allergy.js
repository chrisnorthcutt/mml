
function allergyScreen(){
  var self = this;

  self.screenTitle = "Allergies";
  self.associatedNavItem = "navAboutMe";

  self.updateAllergies = function(xmlDoc) {
    var html = "";
    var template = '<div class="table-row flex flex-align--center"><div class="col-2"><h4 class="table-data-point">{0}</h4></div>' +
      '<div class="col-2"><h4 class="table-data-point">{1}</h4></div><div class="col-3"><h4 class="table-data-point">{2}</h4></div><div class="col-3">' +
      '<h4 class="table-data-point">{3}</h4></div><div class="col-2"><div class="icon-bg--edit fr" onclick="allergy.editAllergy(\'{4}\')"></div>' +
      '<div class="icon-bg--delete fr" onclick="allergy.deleteConfirmation(\'{4}\')"></div></div></div></div>';

    $(xmlDoc).find('list_item').each(function () {
      var reactionTreatment = $(this).find('reaction_treatment').text().split('/');
      
      if (reactionTreatment.length > 1) {
        var reaction = reactionTreatment[0];
        var treatment = reactionTreatment[1];
        if (treatment.length > 50) {
          treatment = treatment.substring(0, 50) + '...';
        }
      } else {
        var reaction = reactionTreatment[0];
        var treatment = '';
      }

      html += template.format($(this).find('allergy_desc').text(), $(this).find('allergy_type_desc').text(), reaction, treatment, $(this).find('allergy_id').text());
    });

    if(html == ''){
      document.getElementById('noAllergies').style.display = 'inherit';
      document.getElementById('tableHeader').style.display = 'none';
    } else {
      document.getElementById('noAllergies').style.display = 'none';
      document.getElementById('tableHeader').style.display = 'inherit';
    }
    document.getElementById('allergy-table').innerHTML = html;
  }

  self.showAllergy = function(xmlDoc){
    document.getElementById('popup').style.display = 'inherit';
    document.getElementById('cover').style.display = 'inherit';
    document.getElementById('treatment').value = $(xmlDoc).find('treatment').text();
    document.getElementById('reaction').value = $(xmlDoc).find('reaction').text();
    var type = $(xmlDoc).find('allergen_type_code').text();
    var id = $(xmlDoc).find('allergen_id').text();

    document.getElementById('allergyId').value = $(xmlDoc).find('allergy_id').text();

    xmlQuery(xml.create('iSalusExternal.GetAllergenList')(type), common.renderDropdown('allergenDropdown', id));
    document.getElementById("allergenType").selectedIndex = parseInt(type) - 1;
  }

  self.newAllergy = function(){
    document.getElementById('popup').style.display = 'inherit';
    document.getElementById('cover').style.display = 'inherit';
    document.getElementById('allergyId').value = '';
    document.getElementById('treatment').value = '';
    document.getElementById('reaction').value = '';
    document.getElementById("allergenType").selectedIndex = 0;
    xmlQuery(xml.create('iSalusExternal.GetAllergenList')('1'), common.renderDropdown('allergenDropdown'));
  }

  self.removeFromDatabase = function(xmlDoc){
    var type = $(xmlDoc).find('allergen_type_code').text();
    var id = $(xmlDoc).find('allergen_id').text();
    var allergy = $(xmlDoc).find('allergy_id').text();

    xmlQuery(xml.create('iSalusExternal.SaveAllergy')(allergy, type, id, '', '', 'Y'), common.refresh);
  }

  self.deleteAllergy = function(){
    var id = document.getElementById('deleteAllergyId').value;
    xmlQuery(xml.create('iSalusExternal.GetAllergy')(id), self.removeFromDatabase);
  }

  self.deleteConfirmation = function(id){
    document.getElementById('deleteAllergyId').value = id;
    document.getElementById('popup-confirmation').style.display = 'inherit';
    document.getElementById('cover').style.display = 'inherit';
  }

  self.saveAllergy = function(){
    var allergyId = document.getElementById('allergyId').value;
    var allergenTypeCode = $("#allergenType").val();
    var allergenId = $("#allergenDropdown").val();
    var treatment = document.getElementById('treatment').value;
    var reaction = document.getElementById('reaction').value;

    xmlQuery(xml.create('iSalusExternal.SaveAllergy')(allergyId, allergenTypeCode, allergenId, treatment, reaction, 'N'), common.refresh)
  }

  self.editAllergy = function(id){
    xmlQuery(xml.create('iSalusExternal.GetAllergy')(id), self.showAllergy);
  }

  self.loadData = function(){
    currentScreen = allergy;

    xmlQuery(xml.create('iSalusExternal.GetAllergyList'), self.updateAllergies);
  }
}