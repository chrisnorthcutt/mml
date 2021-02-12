
function bloodPressureScreen(){
  var self = this;

  self.screenTitle = "Blood Pressure";
  self.associatedNavItem = "navMyVitals";

  self.data = [];

  self.makePretty = function(string) {
    var x = string.indexOf('mmHg');

    if(x > 0){
      return string.slice(0, x) + ' ' + string.slice(x);
    }

    return string;
  }

  self.updateBloodPressure = function(xmlDoc) {
    var html = "";
    var template = '<div class="table-row flex flex-align--center"><div class="col-2"><h4 class="table-data-point">{0}</h4></div>' +
      '<div class="col-2"><h4 class="table-data-point">{1}</h4></div><div class="col-2"><h4 class="table-data-point">{2}</h4></div><div class="col-2">' +
      '<h4 class="table-data-point">{3}</h4></div><div class="col-2"><h4 class="table-data-point">{4}</h4></div><div class="col-2">' +
      '<div class="icon-bg--edit fr" onclick="bloodpressure.editBloodPressure(\'{5}\')"></div><div class="icon-bg--delete fr"' +
      ' onclick="bloodpressure.deleteConfirmation(\'{5}\')"></div></div></div></div>';

    updateChart(xmlDoc);

    $(xmlDoc).find('list_item').each(function () {
      var date = $(this).find('bp_date').text();
      var time = $(this).find('encounter_date_time').text();
      var pressure = $(this).find('bp_data').text();
      var systolic = $(this).find('systolic').text();
      var diastolic = $(this).find('diastolic').text();
      var pulse = $(this).find('pulse').text();
      var from = $(this).find('self_reported').text();
      var journalId = $(this).find('journal_id').text();
      var note = $(this).find('note').text();
      var databaseTitle = $(this).find('database_title').text();
      var reported = from == 'Y' ? 'Self-Reported' : databaseTitle;
      self.data.push([journalId, time.split(' ')[0], systolic, diastolic, pulse, note]);
      html += template.format(date, self.makePretty(pressure), pulse, note, reported, journalId);
    });

    if(html == ''){
      document.getElementById('noBloodPressure').style.display = 'inherit';
      document.getElementById('tableHeader').style.display = 'none';
      document.getElementById('bloodPressureChartContainer').style.display = 'none';
      document.getElementById('bloodPressureChartContainer').style.visibility = 'hidden';
    } else {
      document.getElementById('noBloodPressure').style.display = 'none';
      document.getElementById('tableHeader').style.display = 'inherit';
      document.getElementById('bloodPressureChartContainer').style.display = 'inherit';
      document.getElementById('bloodPressureChartContainer').style.visibility = 'inherit';
    }

    document.getElementById('bloodpressure-table').innerHTML = html;
  }

  self.editBloodPressure = function(journalId){
    document.getElementById('popup').style.display = 'inherit';
    document.getElementById('cover').style.display = 'inherit';
    
    for(var i = 0; i < self.data.length; i++){
      if(self.data[i][0] == journalId){
        document.getElementById('journalId').value = self.data[i][0];
        document.getElementById('systolic').value = self.data[i][2];
        document.getElementById('diastolic').value = self.data[i][3];
        document.getElementById('pulse').value = self.data[i][4];
        document.getElementById('note').value = self.data[i][5];
        document.getElementById('encounterDateTime').value = self.data[i][1];
        break;
      }
    }
  }

  self.newBloodPressure = function(){
    document.getElementById('popup').style.display = 'inherit';
    document.getElementById('cover').style.display = 'inherit';
    document.getElementById('journalId').value = '';
    document.getElementById('systolic').value = '';
    document.getElementById('diastolic').value = '';
    document.getElementById('pulse').value = '';
    document.getElementById('note').value = '';
    document.getElementById('encounterDateTime').value = common.getDateString();
  }

  self.deleteBloodPressure = function(){
    var journalId = document.getElementById('deleteJournalId').value;

    for(var i = 0; i < self.data.length; i++){
      if(self.data[i][0] == journalId){
        var encounterDate = self.data[i][1];
        break;
      }
    }

    xmlQuery(xml.create('iSalusExternal.SaveJournalBP')(account, journalId, '1', '1', '1', '', encounterDate, 'Y'), common.refresh);
  }

  self.deleteConfirmation = function(id){
    document.getElementById('deleteJournalId').value = id;
    document.getElementById('popup-confirmation').style.display = 'inherit';
    document.getElementById('cover').style.display = 'inherit';
  }

  self.saveBloodPressure = function(){

    var errorFlag = {'error': false};

    var journalId = document.getElementById('journalId').value;
    var diastolic = common.validateCustomField('diastolic', 'diastolicError', errorFlag, function(x){return x < 400 && x > 20}, 'Invalid reading.');
    var systolic = common.validateCustomField('systolic', 'systolicError', errorFlag, function(x){return x < 400 && x > 20}, 'Invalid reading.');
    var pulse = document.getElementById('pulse').value;
    var note = document.getElementById('note').value;
    var encounterDateTime = common.validateDateField('encounterDateTime', 'encounterDateTimeError', errorFlag);

    if(!errorFlag.error){
      xmlQuery(xml.create('iSalusExternal.SaveJournalBP')(account, journalId, systolic, diastolic, pulse, note, encounterDateTime, 'N'), common.refresh)
    }
  }

  self.loadData = function(){
    currentScreen = bloodpressure;
    self.data = [];

    if(account == ''){
      setTimeout(self.loadData, 200);
    }else{
      xmlQuery(xml.create('iSalusExternal.GetJournalBP')(account), self.updateBloodPressure);
    }
  }
}