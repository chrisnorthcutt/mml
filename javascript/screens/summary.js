
function summaryScreen(){
  var self = this;

  self.screenTitle = "Summary";
  self.associatedNavItem = "navAboutMe";

  self.databaseKey = '';
  self.databases = [];

  self.updateSummary = function(xmlDoc) {
    var patientSummary = $(xmlDoc).find('patient_summary');
    var employerSummary = $(xmlDoc).find('employer_summary');
    var emergencyList = $(xmlDoc).find('emergency_list');
    var allergiesList = $(xmlDoc).find('allergies_list');
    var medicationList = $(xmlDoc).find('medication_list');
    var familyHistoryList = $(xmlDoc).find('family_history_list');
    var lifestyleList = $(xmlDoc).find('lifestyle_list');
    var journalHwList = $(xmlDoc).find('journal_hw_list');
    var journalBpList = $(xmlDoc).find('journal_bp_list');
    var journalBsList = $(xmlDoc).find('journal_bs_list');
    var journalGoalList = $(xmlDoc).find('journal_goal_list');
    var conditionList = $(xmlDoc).find('condition_list');

    document.getElementById('patientSummary-firstName').innerText = $(patientSummary).find('first_name').text();
    document.getElementById('patientSummary-lastName').innerText = $(patientSummary).find('last_name').text();
    document.getElementById('patientSummary-birthDate').innerText = $(patientSummary).find('birth_date').text();
    document.getElementById('patientSummary-age').innerText = $(patientSummary).find('age').text().split('|').join(' ');
    document.getElementById('patientSummary-gender').innerText = $(patientSummary).find('gender').text();
    document.getElementById('patientSummary-maritalStatus').innerText = $(patientSummary).find('marital_status').text();
    document.getElementById('patientSummary-ethnicity').innerText = $(patientSummary).find('ethnicity').text();
    document.getElementById('patientSummary-bloodType').innerText = $(patientSummary).find('blood_type').text();
    document.getElementById('patientSummary-eyeColor').innerText = $(patientSummary).find('eye_color').text();
    document.getElementById('patientSummary-hairColor').innerText = $(patientSummary).find('hair_color').text();
    document.getElementById('patientSummary-birthmarksScars').innerText = $(patientSummary).find('birthmarks_scars').text();
    document.getElementById('patientSummary-specialConditions').innerText = $(patientSummary).find('special_conditions').text();
    document.getElementById('patientSummary-ssn').innerText = $(patientSummary).find('ssn').text();
    document.getElementById('patientSummary-address').innerText = $(patientSummary).find('address').text();
    document.getElementById('patientSummary-city').innerText = $(patientSummary).find('city').text();
    document.getElementById('patientSummary-state').innerText = $(patientSummary).find('state').text();
    document.getElementById('patientSummary-zip').innerText = $(patientSummary).find('zip').text();
    document.getElementById('patientSummary-myHome').innerText = $(patientSummary).find('my_home').text();
    document.getElementById('patientSummary-myCell').innerText = $(patientSummary).find('my_cell').text();
    document.getElementById('patientSummary-myWork').innerText = $(patientSummary).find('my_work').text();
    document.getElementById('employerSummary-occupation').innerText = $(employerSummary).find('occupation').text();
    document.getElementById('employerSummary-employerName').innerText = $(employerSummary).find('employer_name').text();
    document.getElementById('employerSummary-work').innerText = $(employerSummary).find('work').text();
    document.getElementById('employerSummary-fax').innerText = $(employerSummary).find('fax').text();
    document.getElementById('employerSummary-address').innerText = $(employerSummary).find('address').text();
    document.getElementById('employerSummary-city').innerText = $(employerSummary).find('city').text();
    document.getElementById('employerSummary-state').innerText = $(employerSummary).find('state').text();
    document.getElementById('employerSummary-zip').innerText = $(employerSummary).find('zip').text();

    var emergencyHtml = "";
    var emergencyTemplate = "<p>{0} Contact:</p><p>Contact Name: <span>{1}</span></p><p>Home Phone: <span>{2}</span></p><p>Cell Phone: <span>{3}</span></p><p>Work Phone: <span>{4}</span></p><p>Relationship: <span>{5}</span></p>";

    $(emergencyList).find('list_item').each(function(){
      var contactName = $(this).find('contact_name').text();
      var homePhone = $(this).find('home').text();
      var cellPhone = $(this).find('cell').text();
      var workPhone = $(this).find('work').text();
      var relationship = $(this).find('relationship').text();
      var contactType = $(this).find('contact_type').text();
      emergencyHtml += emergencyTemplate.format(contactType, contactName, homePhone, cellPhone, workPhone, relationship);
    });

    var allergyHtml = "";
    var allergyTemplate = "<p>{0}</p>";

    $(allergiesList).find('list_item').each(function(){
      var allergenDesc = $(this).find('allergen_desc').text();
      allergyHtml += allergyTemplate.format(allergenDesc);
    });

    var medicationHtml = "";
    var medicationTemplate = "<p>{0}</p>";

    $(medicationList).find('list_item').each(function(){
      var medName = $(this).find('med_name').text();
      medicationHtml += medicationTemplate.format(medName);
    });

    var familyHistoryHtml = "";
    var familyHistoryTemplate = "<p>{0} - {1}</p>";

    $(familyHistoryList).find('list_item').each(function(){
      var relationshipDesc = $(this).find('relationship_desc').text();
      var conditionDesc = $(this).find('condition_desc').text();
      familyHistoryHtml += familyHistoryTemplate.format(relationshipDesc, conditionDesc);
    });

    var lifestyleHtml = "";
    var lifestyleTemplate = "<p>{0}</p>";

    $(lifestyleList).find('list_item').each(function(){
      var lifestyleDesc = $(this).find('lifestyle_desc').text();
      lifestyleHtml += lifestyleTemplate.format(lifestyleDesc);
    });

    var journalHwHtml = "";
    var journalHwTemplate = "<p>{0}</p>";

    $(journalHwList).find('list_item').each(function(){
      var journalHwDesc = $(this).find('hw_desc').text();
      journalHwHtml += journalHwTemplate.format(journalHwDesc);
    });

    var journalBpHtml = "";
    var journalBpTemplate = "<p>{0}</p>";

    $(journalBpList).find('list_item').each(function(){
      var journalBpDesc = $(this).find('bp_desc').text();
      journalBpHtml += journalBpTemplate.format(journalBpDesc);
    });

    var journalBsHtml = "";
    var journalBsTemplate = "<p>{0}</p>";

    $(journalBsList).find('list_item').each(function(){
      var journalBsDesc = $(this).find('bs_desc').text();
      journalBsHtml += journalHwTemplate.format(journalBsDesc);
    });

    var journalGoalHtml = "";
    var journalGoalTemplate = "<p>{0}</p>";

    $(journalGoalList).find('list_item').each(function(){
      var journalGoalDesc = $(this).find('goal_desc').text();
      journalGoalHtml += journalGoalTemplate.format(journalGoalDesc);
    });

    var medicalConditionHtml = "";
    var medicalConditionTemplate = "<p>{0} - {1}</p>";

    $(conditionList).find('list_item').each(function(){
      var conditionTypeDesc = $(this).find('condition_type_desc').text();
      var conditionDesc = $(this).find('condition_desc').text();
      medicalConditionHtml += medicalConditionTemplate.format(conditionTypeDesc, conditionDesc);
    });

    document.getElementById('emergencyContacts').innerHTML = emergencyHtml;
    document.getElementById('allergiesList').innerHTML = allergyHtml;
    document.getElementById('medicationList').innerHTML = medicationHtml;
    document.getElementById('familyHistoryList').innerHTML = familyHistoryHtml;
    document.getElementById('lifestyleList').innerHTML = lifestyleHtml;
    document.getElementById('journalHwList').innerHTML = journalHwHtml;
    document.getElementById('journalBpList').innerHTML = journalBpHtml;
    document.getElementById('journalBsList').innerHTML = journalBsHtml;
    document.getElementById('journalGoalList').innerHTML = journalGoalHtml;
    document.getElementById('conditionsList').innerHTML = medicalConditionHtml;
  }

  self.resetKey = function(){
    if(self.databases.length != 1){
      self.databaseKey = '';
    }
  }

  self.getDatabaseKey = function(xmlDoc) {
    self.databaseKey = '';
    self.databases = [];

    $(xmlDoc).find('list_item').each(function(){
      if($(this).find('account_id').text() == account){
        self.databases.push([$(this).find('database_key').text(), $(this).find('client_name').text()]);
      }
    });

    if(self.databases.length == 1){
      self.databaseKey = self.databases[0][0];
    }

    if(self.databases.length < 1){
      $('#shareSummaryButton').addClass('btn--disabled');
    } else {
      $('#shareSummaryButton').removeClass('btn--disabled');
    }
  }

  self.selectDatabase = function(number){
    self.databaseKey = self.databases[number][0];

    common.closeModals();

    self.share();
  }

  self.share = function(){
    if(self.databaseKey != ''){
      document.getElementById('cover').style.display = 'inherit';
      document.getElementById('popup').style.display = 'inherit';
      document.getElementById('demographicsInd').checked = true;
      document.getElementById('employerInd').checked = true;
      document.getElementById('insuranceInd').checked = true;
      document.getElementById('medicationInd').checked = true;
      document.getElementById('allergiesInd').checked = true;
      document.getElementById('medicalInd').checked = true;
      document.getElementById('lifestyleInd').checked = true;
      document.getElementById('familyInd').checked = true;
      document.getElementById('hwInd').checked = true;
      document.getElementById('bpInd').checked = true;
      document.getElementById('bsInd').checked = true;
      document.getElementById('goalInd').checked = true;
    } else {
      self.showDatabaseSelect();
    }
  }

  self.showDatabaseSelect = function(){
    var html = '';
    var template = '<a class="text-weight--bold popup__list-item" href="" onclick="event.preventDefault();summary.selectDatabase({0})"><div class="col-12">{1}</div></a>';

    for(var i = 0; i < self.databases.length; i++){
      html += template.format(i, self.databases[i][1]);
    }

    document.getElementById('popupDatabaseList').innerHTML = html;
    document.getElementById('popupDatabase').style.display = 'inherit';
    document.getElementById('cover').style.display = 'inherit';
  }

  self.shareSummary = function(){
    var demographicsInd = document.getElementById('demographicsInd').checked ? 'Y' : 'N';
    var employerInd = document.getElementById('employerInd').checked ? 'Y' : 'N';
    var insuranceInd = document.getElementById('insuranceInd').checked ? 'Y' : 'N';
    var medicationInd = document.getElementById('medicationInd').checked ? 'Y' : 'N';
    var allergiesInd = document.getElementById('allergiesInd').checked ? 'Y' : 'N';
    var medicalInd = document.getElementById('medicalInd').checked ? 'Y' : 'N';
    var lifestyleInd = document.getElementById('lifestyleInd').checked ? 'Y' : 'N';
    var familyInd = document.getElementById('familyInd').checked ? 'Y' : 'N';
    var hwInd = document.getElementById('hwInd').checked ? 'Y' : 'N';
    var bpInd = document.getElementById('bpInd').checked ? 'Y' : 'N';
    var bsInd = document.getElementById('bsInd').checked ? 'Y' : 'N';
    var goalInd = document.getElementById('goalInd').checked ? 'Y' : 'N';

    xmlQuery(xml.create('iSalusExternal.ShareSummary')(self.databaseKey, demographicsInd, employerInd, insuranceInd, medicationInd, allergiesInd, medicalInd, lifestyleInd, familyInd, hwInd, bpInd, bsInd, goalInd), common.closeModals);
   
    self.resetKey();
  }

  self.loadData = function(){
    currentScreen = summary;
    xmlQuery(xml.create('iSalusExternal.GetConnection'), self.getDatabaseKey);
    xmlQuery(xml.create('iSalusExternal.GetSummary'), self.updateSummary);
  }
}
