
function spo2Screen(){
  var self = this;

  self.screenTitle = "SpO2";
  self.associatedNavItem = "navMyVitals";

  self.data = [];

  self.updateSpo2 = function(xmlDoc) {
    var html = "";
    var template = '<div class="table-row flex flex-align--center"><div class="col-2"><h4 class="table-data-point">{0}</h4></div>' +
      '<div class="col-2"><h4 class="table-data-point">{1}</h4></div><div class="col-3"><h4 class="table-data-point">{2}</h4></div><div class="col-3">' +
      '<h4 class="table-data-point">{3}</h4></div><div class="col-2">' +
      '<div class="icon-bg--edit fr" onclick="spo2.editSpo2(\'{4}\')"></div><div class="icon-bg--delete fr" onclick="spo2.deleteConfirmation(\'{4}\')"></div></div></div></div>';

    updateChart(xmlDoc);

    $(xmlDoc).find('list_item').each(function () {
      var date = $(this).find('spo2_date').text();
      var time = $(this).find('encounter_date_time').text();
      var reading = $(this).find('spo2_data').text();
      var value = $(this).find('spo2').text();
      var from = $(this).find('self_reported').text();
      var journalId = $(this).find('journal_id').text();
      var note = $(this).find('note').text();
      var databaseTitle = $(this).find('database_title').text();
      var reported = from == 'Y' ? 'Self-Reported' : databaseTitle;
      self.data.push([journalId, time.split(' ')[0], value, note]);
      html += template.format(date, reading, note, reported, journalId);
    });

    if(html == ''){
      document.getElementById('noSpo2').style.display = 'inherit';
      document.getElementById('tableHeader').style.display = 'none';
      document.getElementById('spo2ChartContainer').style.display = 'none';
    } else {
      document.getElementById('noSpo2').style.display = 'none';
      document.getElementById('tableHeader').style.display = 'inherit';
      document.getElementById('spo2ChartContainer').style.display = 'inherit';
    }
    document.getElementById('spo2-table').innerHTML = html;
  }

  self.editSpo2 = function(journalId){
    document.getElementById('popup').style.display = 'inherit';
    document.getElementById('cover').style.display = 'inherit';
    
    for(var i = 0; i < self.data.length; i++){
      if(self.data[i][0] == journalId){
        document.getElementById('journalId').value = self.data[i][0];
        document.getElementById('spo2Value').value = self.data[i][2];
        document.getElementById('note').value = self.data[i][3];
        document.getElementById('encounterDateTime').value = self.data[i][1];
        break;
      }
    }
  }

  self.newSpo2 = function(){
    document.getElementById('popup').style.display = 'inherit';
    document.getElementById('cover').style.display = 'inherit';
    document.getElementById('journalId').value = '';
    document.getElementById('spo2Value').value = '';
    document.getElementById('note').value = '';
    document.getElementById('encounterDateTime').value = common.getDateString();
  }

  self.deleteSpo2 = function(){
    var journalId = document.getElementById('deleteJournalId').value;

    for(var i = 0; i < self.data.length; i++){
      if(self.data[i][0] == journalId){
        var encounterDate = self.data[i][1];
        break;
      }
    }

    xmlQuery(xml.create('iSalusExternal.SaveJournalSpO2')(account, journalId, '1', '', encounterDate, 'Y'), common.refresh);
  }

  self.deleteConfirmation = function(id){
    document.getElementById('deleteJournalId').value = id;
    document.getElementById('popup-confirmation').style.display = 'inherit';
    document.getElementById('cover').style.display = 'inherit';
  }

  self.saveSpo2 = function(){

    var errorFlag = {'error': false};

    var journalId = document.getElementById('journalId').value;
    var value = common.validateCustomField('spo2Value', 'spo2ValueError', errorFlag, function(x){return x <= 100 && x > 80}, 'Value out of valid range.');
    var note = document.getElementById('note').value;
    var encounterDateTime = common.validateDateField('encounterDateTime', 'encounterDateTimeError', errorFlag);

    if(!errorFlag.error){
      xmlQuery(xml.create('iSalusExternal.SaveJournalSpO2')(account, journalId, value, note, encounterDateTime, 'N'), common.refresh)
    }
  }

  self.loadData = function(){
    currentScreen = spo2;
    self.data = [];

    if(account == ''){
      setTimeout(self.loadData, 200);
    }else{
      xmlQuery(xml.create('iSalusExternal.GetJournalSpO2')(account), self.updateSpo2);
    }
  }
}