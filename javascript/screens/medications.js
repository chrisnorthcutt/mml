
function medicationsScreen(){
  var self = this;

  self.screenTitle = "Medications";
  self.associatedNavItem = "navAboutMe";

  self.hasInitialized = false;
  self.pharmacySearchInfo = {};
  self.waitingForData = false;
  self.pharmacyList = [];
  self.selectedPharmacy = -1;

  self.updateMedications = function(xmlDoc) {
    var html = "";
    var template = '<div class="table-row flex flex-align--center"><div class="col-4"><h4 class="table-data-point">{0}<br/><i>{5}</i></h4></div>' +
      '<div class="col-2"><h4 class="table-data-point">{1}</h4></div><div class="col-2"><h4 class="table-data-point">{2}</h4></div><div class="col-2">' +
      '<h4 class="table-data-point">{3}</h4></div><div class="col-2"><div class="icon-bg--edit fr" onclick="medications.editMedication(\'{6}\')"></div>' +
      '<div class="icon-bg--delete fr" onclick="medications.deleteConfirmation(\'{6}\')"></div></div></div></div>';

    $(xmlDoc).find('list_item').each(function () {
      html += template.format($(this).find('med_name').text(), 
            $(this).find('frequency_desc').text(), 
            $(this).find('started_value').text(), 
            $(this).find('stopped_value').text(), 
            $(this).find('rx_status').text(), 
            $(this).find('database_title').text(), 
            $(this).find('medication_id').text());
    });

    if(html == ''){
      document.getElementById('noMeds').style.display = 'inherit';
      document.getElementById('tableHeader').style.display = 'none';
    } else {
      document.getElementById('noMeds').style.display = 'none';
      document.getElementById('tableHeader').style.display = 'inherit';
    }
    document.getElementById('medications-table').innerHTML = html;
  }

  self.createSelect = function(id, list){
    var html = '';
    var template = '<option value="{0}">{1}</option>';

    for(var i = 0; i < list.length; i++){
      html += template.format(list[i][0], list[i][1]);
    }

    var elem = document.getElementById(id);
    elem.innerHTML = html;
    elem.selectedIndex = 0;
  }

  self.refillModal = function(){
    common.closeModals();
    self.disableElements();
    document.getElementById('cover').style.display = 'inherit';
    document.getElementById('medRefill').style.display = 'inherit';
  }

  self.disableElements = function(){
    $('#refillCity').prop('disabled', true);
    $('#refillZip').prop('disabled', true);
    $('#refillChain').prop('disabled', true);
    $('#refillSearch').prop('disabled', true);
  }

  self.searchModal = function(){
    if(self.hasInitialized){
      common.closeModals();
      self.createSelect('refillState', self.pharmacySearchInfo.stateList);
      $('#refillCity').autocomplete({
        source: self.pharmacySearchInfo.cityList,
        select: self.cityOnSelect
      });
      self.createSelect('refillZip', self.pharmacySearchInfo.zipList);
      document.getElementById('refillZip').value = self.pharmacySearchInfo.zip;
      document.getElementById('refillState').value = self.pharmacySearchInfo.state;
      document.getElementById('refillCity').value = self.pharmacySearchInfo.city;
      self.searchPharmacy();
      document.getElementById('medRefillSearch').style.display = 'inherit';
      document.getElementById('cover').style.display = 'inherit';
    } else {
      self.waitingForData = true;
    }
  }

  self.medicationModal = function(){
    common.closeModals();
    document.getElementById('popup').style.display = 'inherit';
    document.getElementById('cover').style.display = 'inherit';
  }

  self.savePharmacyData = function(xmlDoc){
    self.pharmacySearchInfo.city = $(xmlDoc).find('city').text();
    self.pharmacySearchInfo.state = $(xmlDoc).find('state').text();
    self.pharmacySearchInfo.zip = $(xmlDoc).find('zip').text();
    self.pharmacySearchInfo.zipList = [['', '']];
    self.pharmacySearchInfo.cityList = [];
    self.pharmacySearchInfo.stateList = [];

    var stateListElement = $(xmlDoc).find('state_list');
    var cityListElement = $(xmlDoc).find('city_list');
    var zipListElement = $(xmlDoc).find('zip_list');

    $(stateListElement).find('list_item').each(function(){
      self.pharmacySearchInfo.stateList.push([$(this).find('encode').text(), $(this).find('encode').text()]);
    });
    $(cityListElement).find('list_item').each(function(){
      self.pharmacySearchInfo.cityList.push($(this).find('encode').text());
    });
    $(zipListElement).find('list_item').each(function(){
      self.pharmacySearchInfo.zipList.push([$(this).find('encode').text(),$(this).find('encode').text()]);
    });

    self.hasInitialized = true;

    if(self.waitingForData){
      self.waitingForData = false;
      self.searchModal();
    }
  }

  self.initializePharmacySearch = function(){
    if(!self.hasInitialized){
      xmlQuery(xml.create('iSalusWindow.Initialize')('medication.pharmacy_search_initialize')(account), self.savePharmacyData);
    }
  }

  self.updatePharmacyList = function(list){
    var html = '';
    var template = '<div class="pharm-list__item clearfix" onclick="medications.selectPharmacy(this, {2});"><div class="fl"><p class="text-color--primary text-weight--bold text-size--large">'+
      '{0}</p><p class="text-size--small">{1}</p></div><a href="{3}" target="_blank" class="pharm-list__map icon-bg--map fr mt--10"></a></div>';

    for(var i = 0; i < list.length; i++){
      html += template.format(list[i][2], list[i][3], i, list[i][7]);
    }

    self.selectedPharmacy = -1;
    document.getElementById('pharmacyList').innerHTML = html;
  }

  self.pharmacySearch = function(){
    var regex = new RegExp(document.getElementById('refillSearch').value.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"), 'i');
    var results = [];

    for(var i = 0; i < self.pharmacyList.length; i++){
      if(self.pharmacyList[i][2].match(regex)){
        results.push(self.pharmacyList[i]);
      }
    }

    self.updatePharmacyList(results);
  }

  self.getPharmacyData = function(xmlDoc){
    self.pharmacyList = [];

    $(xmlDoc).find('list_item').each(function(){
      var pharmacyId = $(this).find('pharmacy_id').text();
      var sureScriptsPharmacy = $(this).find('sure_scripts_pharmacy').text();
      var pharmacyName = $(this).find('pharmacy_name').text();
      var address = $(this).find('address1').text() + ' ' + $(this).find('address2').text();
      var city = $(this).find('city').text();
      var state = $(this).find('state').text();
      var zipCode = $(this).find('zip_code').text();
      var googleMap = $(this).find('google_map').text();

      self.pharmacyList.push([pharmacyId, sureScriptsPharmacy, pharmacyName, address, city, state, zipCode, googleMap]);
    });

    self.updatePharmacyList(self.pharmacyList);
  }

  self.choosePharmacy = function(){
    document.getElementById('refillPharmacy').value = self.pharmacyList[self.selectedPharmacy][2];
    medications.refillModal();
  }

  self.selectPharmacy = function(elem, index){
    $('.pharm-list__item').each(function(){
      $(this).removeClass('active');
    })

    $(elem).addClass('active');

    self.selectedPharmacy = index;
  }

  self.searchPharmacy = function(){
    var state = document.getElementById('refillState').value;
    var city = document.getElementById('refillCity').value;
    var zip = document.getElementById('refillZip').value;
    var chain = document.getElementById('refillChain').value;
    var key = document.getElementById('refillDatabaseKey').value;

    if(state != ''){
      xmlQuery(xml.create('iSalusWindow.InitializeEMR')('MML.pharmacy_search')(account, currentUser.firstName + ' ' + currentUser.lastName, key, state, city, zip, chain), self.getPharmacyData);
    }
  }

  self.showRefillResponse = function(xmlDoc){
    common.closeModals();
    document.getElementById('refillRequestResponse').innerHTML = $(xmlDoc).find('message_response').text();
    document.getElementById('popupRefillResponse').style.display = 'inherit';
    document.getElementById('cover').style.display = 'inherit';
  }

  self.sendRefillRequest = function(){
    var key = document.getElementById('refillDatabaseKey').value;
    var name = currentUser.firstName + ' ' + currentUser.lastName;
    var prescriptionId = document.getElementById('refillPrescriptionId').value;
    var medName = document.getElementById('refillName').value;
    var pharmacyDescription = self.pharmacyList[self.selectedPharmacy][2];
    var pharmacyId = self.pharmacyList[self.selectedPharmacy][0];
    var note = document.getElementById('refillNote').value;
    var phone = document.getElementById('refillPhone').value;
    var other = document.getElementById('refillOther').value;

    xmlQuery(xml.create('iSalusWindow.InitializeEMR')('MML.message_send_refill')(account, name, key, prescriptionId, medName, pharmacyDescription, pharmacyId, note, phone, other), self.showRefillResponse);
  }

  self.cityOnSelect = function(event, ui){
    $('#refillSearch').prop('disabled', false);
    $('#refillChain').prop('disabled', false);
    $('#refillZip').prop('disabled', false);
    $('#refillZip').val('');
    $(this).val(ui.item.value);
    self.searchPharmacy();

    var key = document.getElementById('refillDatabaseKey').value;
    var state = $('#refillState').val();
    xmlQuery(xml.create('iSalusExternal.PharmacyChains')(key, state, ui.item.value, ''), self.updatePharmacyChains);
    xmlQuery(xml.create('iSalusWindow.Initialize')('medication.pharmacy_search_city')(state, ui.item.value), self.updateZipList);
  }

  self.updateCityList = function(xmlDoc){
    $('#refillCity').prop('disabled', false);

    var cityListElement = $(xmlDoc).find('city_list');
    var cityData = [];

    $('#refillCity').val('');

    $(cityListElement).find('list_item').each(function(){
      cityData.push($(this).find('encode').text());
    });

    $('#refillCity').autocomplete({
      source: cityData,
      select: self.cityOnSelect
    });
  }

  self.updateZipList = function(xmlDoc){
    var zipListElement = $(xmlDoc).find('zip_list');
    var zipData = [['','']];

    $(zipListElement).find('list_item').each(function(){
      zipData.push([$(this).find('encode').text(), $(this).find('encode').text()]);
    });

    self.createSelect('refillZip', zipData);
    document.getElementById('refillZip').selectedIndex = 0;
  }

  self.updatePharmacyChains = function(xmlDoc){
    var chainListElement = $(xmlDoc).find('chain_list');
    var chainData = [['','']];

    $(chainListElement).find('list_item').each(function(){
      chainData.push([$(this).find('encode').text(), $(this).find('decode').text()]);
    });

    self.createSelect('refillChain', chainData);
    document.getElementById('refillChain').selectedIndex = 0;
  }

  self.getCities = function(state){
    self.disableElements();
    $('#refillCity').val('')
    $('#refillZip').val('')
    xmlQuery(xml.create('iSalusWindow.Initialize')('medication.pharmacy_search_state')(state), self.updateCityList);
  }

  self.showMedication = function(xmlDoc){
    document.getElementById('medName').value = $(xmlDoc).find('med_name').text();
    document.getElementById('refillName').value = $(xmlDoc).find('med_name').text();
    document.getElementById('refillPractice').value = $(xmlDoc).find('database_title').text();
    document.getElementById('refillDatabaseKey').value = $(xmlDoc).find('database_key').text();
    document.getElementById('refillPrescriptionId').value = $(xmlDoc).find('prescription_id').text();
    document.getElementById('medDose').value = $(xmlDoc).find('dose_quantity').text();
    var startedType = $(xmlDoc).find('started_type').text();
    var stoppedType = $(xmlDoc).find('stopped_type').text();
    var prescriptionRxStatusCode = $(xmlDoc).find('prescription_rx_status_code').text();
    if(startedType == 'A'){
      var select = document.getElementById('Astarted');
      var startedValue = $(xmlDoc).find('started_value').text();
      for(var i = 0; i < select.length; i++){
        var option = select.options[i];
        if(startedValue == option.value){
          select.selectedIndex = i;
          break;
        }
      }
    }else{
      document.getElementById(startedType+'started').value = $(xmlDoc).find('started_value').text();
    }
    common.showField(startedType, 'started');
    if(stoppedType == 'A'){
      var select = document.getElementById('Astopped');
      var stoppedValue = $(xmlDoc).find('stopped_value').text()
      for(var i = 0; i < select.length; i++){
        var option = select.options[i];
        if(stoppedValue == option.value){
          select.selectedIndex = i;
          break;
        }
      }
    }else{
      document.getElementById(stoppedType+'stopped').value = $(xmlDoc).find('stopped_value').text();
    }
    common.showField(stoppedType, 'stopped');
    $("input[name=startDateType]").val([startedType]);
    $("input[name=stoppedDateType]").val([stoppedType]);
    var frequencyCode = $(xmlDoc).find('frequency_code').text();
    var select = document.getElementById('medFrequency');
    select.value = frequencyCode;

    if(prescriptionRxStatusCode == '2' || prescriptionRxStatusCode == '5'){
      self.initializePharmacySearch();
      self.toggleDisabledFields(true);
    } else {
      self.toggleDisabledFields(false);
    }

    document.getElementById('medicationId').value = $(xmlDoc).find('medication_id').text();
    document.getElementById('modalEditType').innerText = "Edit";
    self.medicationModal();
  }

  self.toggleDisabledFields = function(boolean){
    $('.disableable').each(function(){
      $(this).prop('disabled', boolean);
    });

    document.getElementById('refillButton').style.display = boolean ? 'inherit' : 'none';
  }

  self.newMedication = function(){
    document.getElementById('refillButton').style.display = 'none';
    document.getElementById('medicationId').value = '';
    document.getElementById('medName').value = '';
    document.getElementById('medDose').value = '';
    document.getElementById('medFrequency').selectedIndex = 0;
    $("input[name=startDateType]").val(['Y']);
    common.showField('Y', 'started');
    document.getElementById('Astarted').selectedIndex = 0;
    document.getElementById('Dstarted').value = '';
    document.getElementById('Ystarted').value = '';
    $("input[name=stoppedDateType]").val(['Y']);
    common.showField('Y', 'stopped');
    document.getElementById('Astopped').selectedIndex = 0;
    document.getElementById('Dstopped').value = '';
    document.getElementById('Ystopped').value = '';
    document.getElementById('modalEditType').innerText = "Add a";
    self.toggleDisabledFields(false);
    self.medicationModal();
  }

  self.removeFromDatabase = function(xmlDoc){
    var medicationId = $(xmlDoc).find('medication_id').text();
    var medName = $(xmlDoc).find('med_name').text();

    xmlQuery(xml.create('iSalusExternal.SaveMedication')(medicationId, medName, '', '', '', '', '', '', 'Y'), common.refresh);
  }

  self.deleteMedication = function(){
    var id = document.getElementById('deleteMedicationId').value;
    xmlQuery(xml.create('iSalusExternal.GetMedication')(id), self.removeFromDatabase);
  }

  self.deleteConfirmation = function(id){
    document.getElementById('deleteMedicationId').value = id;
    document.getElementById('popup-confirmation').style.display = 'inherit';
    document.getElementById('cover').style.display = 'inherit';
  }

  self.saveMedication = function(){

    var errorFlag = {'error': false};

    var medicationId = document.getElementById('medicationId').value;
    var medName = common.validateNotEmpty('medName', 'medNameError', errorFlag);
    var doseQuantity = document.getElementById('medDose').value;
    var frequencyCode = $('#medFrequency').val();
    var startedType = $("input[name=startDateType]:checked").val()
    var startedValue = document.getElementById(startedType+'started').value;
    var stoppedType = $("input[name=stoppedDateType]:checked").val();
    var stoppedValue = document.getElementById(stoppedType+'stopped').value;

    if(!errorFlag.error){
      xmlQuery(xml.create('iSalusExternal.SaveMedication')(medicationId, medName, doseQuantity, frequencyCode, startedType, startedValue, stoppedType, stoppedValue, 'N'), common.refresh)
    }
  }

  self.editMedication = function(id){
    xmlQuery(xml.create('iSalusWindow.Initialize')('medication.medication_edit')(account, id), self.showMedication);
  }

  self.yearDropdowns = function(){
    var birthDate = currentUser.birthDate.split('/');
    var birthYear = parseInt(birthDate[2]);

    var template = '<option value="{0}">{0}</option>';
    var listHtml = "";

    for(var i = new Date().getFullYear(); i >= birthYear; i--){
      listHtml += template.format(i);
    }

    document.getElementById('Ystarted').innerHTML = listHtml;
    document.getElementById('Ystopped').innerHTML = listHtml;
  }

  self.ageDropdowns = function(xmlDoc){
    common.renderDropdown('Astarted', '0')(xmlDoc);
    common.renderDropdown('Astopped', '0')(xmlDoc);
  }

  self.loadData = function(){
    currentScreen = medications;
    self.yearDropdowns();

    xmlQuery(xml.create('iSalusExternal.GetMedicationList'), self.updateMedications);
    xmlQuery(xml.create("iSalusWindow.GetList")("how_often"), common.renderDropdown('medFrequency', '1'));
    xmlQuery(xml.create("iSalusExternal.GetMedicationAge"), self.ageDropdowns);
  }
}