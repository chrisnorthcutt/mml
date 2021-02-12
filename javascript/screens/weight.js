
function weightScreen(){
  var self = this;

  self.screenTitle = "Weight";
  self.associatedNavItem = "navMyVitals";

  self.data = [];

  self.updateWeight = function(xmlDoc) {
    var html = "";
    var template = '<div class="table-row flex flex-align--center"><div class="col-2"><h4 class="table-data-point">{0}</h4></div>' +
      '<div class="col-2"><h4 class="table-data-point">{1}</h4></div><div class="col-3"><h4 class="table-data-point">{2}</h4></div><div class="col-3">' +
      '<h4 class="table-data-point">{3}</h4></div><div class="col-2">' +
      '<div class="icon-bg--edit fr" onclick="weight.editWeight(\'{4}\')"></div><div class="icon-bg--delete fr" onclick="weight.deleteConfirmation(\'{4}\')"></div></div></div></div>';

    updateChart(xmlDoc);

    $(xmlDoc).find('list_item').each(function () {
      var date = $(this).find('weight_date').text();
      var time = $(this).find('encounter_date_time').text();
      var weight = $(this).find('weight_data').text();
      var weightLbs = $(this).find('weight_lbs').text();
      var from = $(this).find('self_reported').text();
      var journalId = $(this).find('journal_id').text();
      var note = $(this).find('note').text();
      var databaseTitle = $(this).find('database_title').text();
      var reported = from == 'Y' ? 'Self-Reported' : databaseTitle;
      self.data.push([journalId, time.split(' ')[0], weightLbs, note]);
      html += template.format(date, weight, note, reported, journalId);
    });

    if(html == ''){
      document.getElementById('noWeight').style.display = 'inherit';
      document.getElementById('tableHeader').style.display = 'none';
      document.getElementById('weightChartContainer').style.display = 'none';
      document.getElementById('weightChartContainer').style.visibility = 'hidden';
    } else {
      document.getElementById('noWeight').style.display = 'none';
      document.getElementById('tableHeader').style.display = 'inherit';
      document.getElementById('weightChartContainer').style.display = 'inherit';
      document.getElementById('weightChartContainer').style.visibility = 'inherit';
    }
    document.getElementById('weight-table').innerHTML = html;
  }

  self.editWeight = function(journalId){
    document.getElementById('popup').style.display = 'inherit';
    document.getElementById('cover').style.display = 'inherit';
    
    for(var i = 0; i < self.data.length; i++){
      if(self.data[i][0] == journalId){
        document.getElementById('journalId').value = self.data[i][0];
        document.getElementById('weightLbs').value = self.data[i][2];
        document.getElementById('note').value = self.data[i][3];
        document.getElementById('encounterDateTime').value = self.data[i][1];
        break;
      }
    }
  }

  self.newWeight = function(){
    document.getElementById('popup').style.display = 'inherit';
    document.getElementById('cover').style.display = 'inherit';
    document.getElementById('journalId').value = '';
    document.getElementById('weightLbs').value = '';
    document.getElementById('note').value = '';
    document.getElementById('encounterDateTime').value = common.getDateString();
  }

  self.deleteWeight = function(){
    var journalId = document.getElementById('deleteJournalId').value;

    for(var i = 0; i < self.data.length; i++){
      if(self.data[i][0] == journalId){
        var encounterDate = self.data[i][1];
        break;
      }
    }

    xmlQuery(xml.create('iSalusExternal.SaveJournalWeight')(account, journalId, '100', '', encounterDate, 'Y'), common.refresh);
  }

  self.deleteConfirmation = function(id){
    document.getElementById('deleteJournalId').value = id;
    document.getElementById('popup-confirmation').style.display = 'inherit';
    document.getElementById('cover').style.display = 'inherit';
  }

  self.saveWeight = function(){

    var errorFlag = {'error': false};

    var journalId = document.getElementById('journalId').value;
    var weightLbs = common.validateCustomField('weightLbs', 'weightLbsError', errorFlag, function(x){return x < 2000 && x > 0}, 'Not a valid weight.');
    var note = document.getElementById('note').value;
    var encounterDateTime = common.validateDateField('encounterDateTime', 'encounterDateTimeError', errorFlag);

    if(!errorFlag.error){
      xmlQuery(xml.create('iSalusExternal.SaveJournalWeight')(account, journalId, weightLbs, note, encounterDateTime, 'N'), common.refresh)
    }
  }

  self.loadData = function(){
    currentScreen = weight;
    self.data = [];

    if(account == ''){
      setTimeout(self.loadData, 200);
    }else{
      xmlQuery(xml.create('iSalusExternal.GetJournalWeight')(account), self.updateWeight);
    }
  }
}