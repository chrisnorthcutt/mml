
function conditionsScreen(){
  var self = this;

  self.updateConditions = function(xmlDoc) {
    var html = "";
    var template = '<div class="table-row flex flex-align--center"><div class="col-4"><h4 class="table-data-point">{0}</h4></div>' +
      '<div class="col-3"><h4 class="table-data-point">{1}</h4></div><div class="col-3"><h4 class="table-data-point">{2}</h4></div>' +
      '<div class="col-2"><div class="icon-bg--edit fr" onclick="conditions.editCondition(\'{3}\')"></div>' +
      '<div class="icon-bg--delete fr" onclick="conditions.deleteConfirmation(\'{3}\')"></div></div></div></div>';

    $(xmlDoc).find('list_item').each(function () {
      html += template.format($(this).find('condition_type_desc').text(), $(this).find('condition_desc').text(), $(this).find('occurred_value').text(), $(this).find('medical_condition_id').text());
    });

    if(html == ''){
      document.getElementById('noConditions').style.display = 'inherit';
      document.getElementById('tableHeader').style.display = 'none';
    } else {
      document.getElementById('noConditions').style.display = 'none';
      document.getElementById('tableHeader').style.display = 'inherit';
    }
    document.getElementById('conditions-table').innerHTML = html;
  }

  self.showCondition = function(xmlDoc){
    document.getElementById('popup').style.display = 'inherit';
    document.getElementById('cover').style.display = 'inherit';
    var type = $(xmlDoc).find('condition_type_code').text();
    var id = $(xmlDoc).find('condition_id').text();

    var occurredType = $(xmlDoc).find('occurred_type').text();
    if(occurredType == 'A'){
      var select = document.getElementById('Aoccurred');
      var occurredValue = $(xmlDoc).find('occurred_value').text();
      for(var i = 0; i < select.length; i++){
        var option = select.options[i];
        if(occurredValue == option.value){
          select.selectedIndex = i;
          break;
        }
      }
    }else{
      document.getElementById(occurredType+'occurred').value = $(xmlDoc).find('occurred_value').text();
    }
    common.showField(occurredType, 'occurred');
    $("input[name=occurredType]").val([occurredType]);

    document.getElementById('conditionId').value = $(xmlDoc).find('medical_condition_id').text();
    document.getElementById('notes').value = $(xmlDoc).find('note').text();
    document.getElementById('result').value = $(xmlDoc).find('results').text();
    document.getElementById('hospital').value = $(xmlDoc).find('hospital').text();

    xmlQuery(xml.create('iSalusExternal.GetConditionItems')(type), common.renderDropdown('conditionDropdown', id));
    document.getElementById("conditionType").selectedIndex = parseInt(type) - 1;
  }

  self.newCondition = function(){
    document.getElementById('popup').style.display = 'inherit';
    document.getElementById('cover').style.display = 'inherit';
    $("input[name=occurredType]").val(['Y']);
    common.showField('Y', 'occurred');
    document.getElementById('Aoccurred').selectedIndex = 0;
    document.getElementById('Doccurred').value = '';
    document.getElementById('Yoccurred').selectedIndex = 0;
    document.getElementById('conditionId').value = '';
    document.getElementById('notes').value = '';
    document.getElementById('result').value = '';
    document.getElementById('hospital').value = '';
    document.getElementById("conditionType").selectedIndex = 1;

    xmlQuery(xml.create('iSalusExternal.GetConditionItems')('2'), common.renderDropdown('conditionDropdown'));
  }

  self.removeFromDatabase = function(xmlDoc){
    var type = $(xmlDoc).find('condition_type_code').text();
    var id = $(xmlDoc).find('medical_condition_id').text();
    var condition = $(xmlDoc).find('condition_id').text();

    xmlQuery(xml.create('iSalusExternal.SaveCondition')(id, type, condition, '', '', 'Y', '', '', ''), common.refresh);
  }

  self.deleteCondition = function(){
    var id = document.getElementById('deleteConditionId').value;
    xmlQuery(xml.create('iSalusExternal.GetCondition')(id), self.removeFromDatabase);
  }

  self.deleteConfirmation = function(id){
    document.getElementById('deleteConditionId').value = id;
    document.getElementById('popup-confirmation').style.display = 'inherit';
    document.getElementById('cover').style.display = 'inherit';
  }

  self.saveCondition = function(){
    var conditionId = document.getElementById('conditionId').value;
    var conditionTypeCode = $("#conditionType").val();
    var conditionNum = $("#conditionDropdown").val();
    var occurredType = $("input[name=occurredType]:checked").val()
    var occurredValue = document.getElementById(occurredType+'occurred').value;
    var note = document.getElementById('notes').value;
    var results = document.getElementById('result').value;
    var hospital = document.getElementById('hospital').value;

    xmlQuery(xml.create('iSalusExternal.SaveCondition')(conditionId, conditionTypeCode, conditionNum, occurredType, occurredValue, 'N', note, results, hospital), common.refresh);
  }

  self.editCondition = function(id){
    xmlQuery(xml.create('iSalusExternal.GetCondition')(id), self.showCondition);
  }

  self.yearDropdown = function(xmlDoc){
    var birthDate = currentUser.birthDate.split('/');
    var birthYear = parseInt(birthDate[2]);

    var template = '<option value="{0}">{0}</option>';
    var listHtml = "";

    for(var i = new Date().getFullYear(); i >= birthYear; i--){
      listHtml += template.format(i);
    }

    document.getElementById('Yoccurred').innerHTML = listHtml;
  }

  self.loadData = function(){
    currentScreen = conditions;
    self.yearDropdown();

    xmlQuery(xml.create('iSalusExternal.GetConditionList'), self.updateConditions);
    xmlQuery(xml.create("iSalusExternal.GetMedicationAge"), common.renderDropdown('Aoccurred', '0'));
  }
}