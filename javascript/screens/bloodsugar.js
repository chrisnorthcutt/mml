
function bloodSugarScreen(){
  var self = this;

  self.screenTitle = "Blood Sugar";
  self.associatedNavItem = "navMyVitals";

  self.data = [];

  self.makePretty = function(string) {
    var x = string.indexOf('mg/dL');

    if(x > 0){
      return string.slice(0, x) + ' ' + string.slice(x);
    }

    return string;
  }

  self.updateBloodSugar = function(xmlDoc) {
    var html = "";
    var template = '<div class="table-row flex flex-align--center"><div class="col-2"><h4 class="table-data-point">{0}</h4></div>' +
      '<div class="col-2"><h4 class="table-data-point">{1}</h4></div><div class="col-2"><h4 class="table-data-point">{2}</h4></div><div class="col-2">' +
      '<h4 class="table-data-point">{3}</h4></div><div class="col-2"><h4 class="table-data-point">{4}</h4></div><div class="col-2">' +
      '<div class="icon-bg--edit fr" onclick="bloodsugar.editBloodSugar(\'{5}\')"></div><div class="icon-bg--delete fr" onclick="bloodsugar.deleteConfirmation(\'{5}\')"></div></div></div></div>';

    updateChart(xmlDoc);

    $(xmlDoc).find('list_item').each(function () {
      var date = $(this).find('bs_date').text();
      var time = $(this).find('encounter_date_time').text();
      var reading = $(this).find('bs_data').text();
      var bloodSugar = $(this).find('blood_sugar').text();
      var eventCode = $(this).find('event_code').text();
      var eventDesc = $(this).find('event_desc').text();
      var from = $(this).find('self_reported').text();
      var journalId = $(this).find('journal_id').text();
      var note = $(this).find('note').text();
      var databaseTitle = $(this).find('database_title').text();
      var reported = from == 'Y' ? 'Self-Reported' : databaseTitle;
      self.data.push([journalId, time.split(' ')[0], bloodSugar, eventCode, note]);
      html += template.format(date, self.makePretty(reading), eventDesc, note, reported, journalId);
    });

    if(html == ''){
      document.getElementById('noBloodSugar').style.display = 'inherit';
      document.getElementById('tableHeader').style.display = 'none';
      document.getElementById('bloodSugarChartContainer').style.display = 'none';
      document.getElementById('bloodSugarChartContainer').style.visibility = 'hidden';
    } else {
      document.getElementById('noBloodSugar').style.display = 'none';
      document.getElementById('tableHeader').style.display = 'inherit';
      document.getElementById('bloodSugarChartContainer').style.display = 'inherit';
      document.getElementById('bloodSugarChartContainer').style.visibility = 'inherit';
    }

    document.getElementById('height-table').innerHTML = html;
  }

  self.editBloodSugar = function(journalId){
    document.getElementById('popup').style.display = 'inherit';
    document.getElementById('cover').style.display = 'inherit';
    
    for(var i = 0; i < self.data.length; i++){
      if(self.data[i][0] == journalId){
        document.getElementById('journalId').value = self.data[i][0];
        document.getElementById('bloodSugar').value = self.data[i][2];
        document.getElementById('eventCode').value = self.data[i][3];
        document.getElementById('note').value = self.data[i][4];
        document.getElementById('encounterDateTime').value = self.data[i][1];
        break;
      }
    }
  }

  self.newBloodSugar = function(){
    document.getElementById('popup').style.display = 'inherit';
    document.getElementById('cover').style.display = 'inherit';
    document.getElementById('journalId').value = '';
    document.getElementById('bloodSugar').value = '';
    document.getElementById('eventCode').value = '';
    document.getElementById('note').value = '';
    document.getElementById('encounterDateTime').value = common.getDateString();
  }

  self.deleteBloodSugar = function(){
    var journalId = document.getElementById('deleteJournalId').value;

    for(var i = 0; i < self.data.length; i++){
      if(self.data[i][0] == journalId){
        var encounterDate = self.data[i][1];
        break;
      }
    }

    xmlQuery(xml.create('iSalusExternal.SaveJournalBS')(account, journalId, '1', '1', '', encounterDate, 'Y'), common.refresh);
  }

  self.deleteConfirmation = function(id){
    document.getElementById('deleteJournalId').value = id;
    document.getElementById('popup-confirmation').style.display = 'inherit';
    document.getElementById('cover').style.display = 'inherit';
  }

  self.saveBloodSugar = function(){

    var errorFlag = {'error': false};

    var journalId = document.getElementById('journalId').value;
    var bloodSugar = common.validateCustomField('bloodSugar', 'bloodSugarError', errorFlag, function(x){return x < 3000 && x > 0}, 'Not a valid reading.');
    var eventCode = document.getElementById('eventCode').value;
    var note = document.getElementById('note').value;
    var encounterDateTime = common.validateDateField('encounterDateTime', 'encounterDateTimeError', errorFlag);

    if(!errorFlag.error){
      xmlQuery(xml.create('iSalusExternal.SaveJournalBS')(account, journalId, bloodSugar, eventCode, note, encounterDateTime, 'N'), common.refresh)
    }
  }

  self.loadData = function(){
    currentScreen = bloodsugar;
    self.data = [];

    if(account == ''){
      setTimeout(self.loadData, 200);
    }else{
      xmlQuery(xml.create('iSalusExternal.GetJournalBS')(account), self.updateBloodSugar);
    }
  }
}