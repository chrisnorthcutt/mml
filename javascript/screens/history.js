
function historyScreen(){
  var self = this;

  self.screenTitle = "Family History";
  self.associatedNavItem = "navAboutMe";

  self.updateHistory = function(xmlDoc) {
    var html = "";
    var template = '<div class="table-row flex flex-align--center"><div class="col-2"><h4 class="table-data-point">{0}</h4></div>' +
      '<div class="col-3"><h4 class="table-data-point"><a class="icon-bg--info" href="./info?n={3}&a={4}" target="_blank"></a> {1}</h4></div><div class="col-5"><h4 class="table-data-point">{2}</h4></div>' +
      '<div class="col-2"><div class="icon-bg--edit fr" onclick="familyHistory.editHistory(\'{3}\')"></div>' +
      '<div class="icon-bg--delete fr" onclick="familyHistory.deleteConfirmation(\'{3}\')"></div></div></div></div>';

    $(xmlDoc).find('list_item').each(function () {
      html += template.format($(this).find('relationship_desc').text(), $(this).find('condition_desc').text(), $(this).find('note').text(), $(this).find('history_id').text(), account);
    });

    if(html == ''){
      document.getElementById('noHistory').style.display = 'inherit';
      document.getElementById('tableHeader').style.display = 'none';
    } else {
      document.getElementById('noHistory').style.display = 'none';
      document.getElementById('tableHeader').style.display = 'inherit';
    }
    document.getElementById('history-table').innerHTML = html;
  }

  self.showHistory = function(xmlDoc){
    document.getElementById('popup').style.display = 'inherit';
    document.getElementById('cover').style.display = 'inherit';
    var code = $(xmlDoc).find('relationship_code').text();
    var select = document.getElementById('relationshipCode');
    for(var i = 0; i < select.length; i++){
      var option = select.options[i];
      if(code == option.value){
        select.selectedIndex = i;
        break;
      }
    }
    var id = $(xmlDoc).find('family_history_id').text();
    var select = document.getElementById('conditionDropdown');
    for(var i = 0; i < select.length; i++){
      var option = select.options[i];
      if(id == option.value){
        select.selectedIndex = i;
        break;
      }
    }

    document.getElementById('historyId').value = $(xmlDoc).find('history_id').text();
    document.getElementById('note').value = $(xmlDoc).find('note').text();
  }

  self.newHistory = function(){
    document.getElementById('popup').style.display = 'inherit';
    document.getElementById('cover').style.display = 'inherit';
    document.getElementById('historyId').value = '';
    document.getElementById('note').value = '';
    document.getElementById("relationshipCode").selectedIndex = 0;
    document.getElementById("conditionDropdown").selectedIndex = 0;
  }

  self.removeFromDatabase = function(xmlDoc){
    var historyId = $(xmlDoc).find('history_id').text();
    var relationshipCode = $(xmlDoc).find('relationship_code').text();
    var familyHistoryId = $(xmlDoc).find('family_history_id').text();

    xmlQuery(xml.create('iSalusExternal.SaveFamilyHistory')(historyId, relationshipCode, familyHistoryId, '', 'Y'), common.refresh);
  }

  self.deleteHistory = function(){
    var id = document.getElementById('deleteHistoryId').value;
    xmlQuery(xml.create('iSalusExternal.GetFamilyHistory')(id), self.removeFromDatabase);
  }

  self.deleteConfirmation = function(id){
    document.getElementById('deleteHistoryId').value = id;
    document.getElementById('popup-confirmation').style.display = 'inherit';
    document.getElementById('cover').style.display = 'inherit';
  }

  self.saveHistory = function(){
    var historyId = document.getElementById('historyId').value;
    var relationshipCode = $("#relationshipCode").val();
    var familyHistoryId = $("#conditionDropdown").val();
    var note = document.getElementById('note').value;

    xmlQuery(xml.create('iSalusExternal.SaveFamilyHistory')(historyId, relationshipCode, familyHistoryId, note, 'N'), common.refresh)
  }

  self.editHistory = function(id){
    xmlQuery(xml.create('iSalusExternal.GetFamilyHistory')(id), self.showHistory);
  }

  self.loadData = function(){
    currentScreen = familyHistory;
    xmlQuery(xml.create('iSalusExternal.GetFamilyHistoryList'), self.updateHistory);
    xmlQuery(xml.create('iSalusExternal.GetFamilyHistoryItems'), common.renderDropdown('conditionDropdown'));
  }
}