
function heightScreen(){
  var self = this;

  self.screenTitle = "Contact";
  self.associatedNavItem = "navAboutMe";

  self.data = [];

  self.updateHeight = function(xmlDoc) {
    var html = "";
    var template = '<div class="table-row flex flex-align--center"><div class="col-2"><h4 class="table-data-point">{0}</h4></div>' +
      '<div class="col-2"><h4 class="table-data-point">{1}</h4></div><div class="col-3"><h4 class="table-data-point">{2}</h4></div><div class="col-3">' +
      '<h4 class="table-data-point">{3}</h4></div><div class="col-2">' +
      '<div class="icon-bg--edit fr" onclick="journalHeight.editHeight(\'{4}\')"></div><div class="icon-bg--delete fr" onclick="journalHeight.deleteConfirmation(\'{4}\')"></div></div></div></div>';

    updateChart(xmlDoc);

    $(xmlDoc).find('list_item').each(function () {
      var date = $(this).find('height_date').text();
      var time = $(this).find('encounter_date_time').text();
      var height = $(this).find('height_data').text();
      var heightFt = $(this).find('height_ft').text();
      var heightIn = $(this).find('height_in').text();
      var from = $(this).find('self_reported').text();
      var journalId = $(this).find('journal_id').text();
      var note = $(this).find('note').text();
      var databaseTitle = $(this).find('database_title').text();
      var reported = from == 'Y' ? 'Self-Reported' : databaseTitle;
      self.data.push([journalId, time.split(' ')[0], heightFt, heightIn, note]);
      html += template.format(date, height, note, reported, journalId);
    });

    if(html == ''){
      document.getElementById('noHeight').style.display = 'inherit';
      document.getElementById('tableHeader').style.display = 'none';
      document.getElementById('heightChartContainer').style.display = 'none';
    } else {
      document.getElementById('noHeight').style.display = 'none';
      document.getElementById('tableHeader').style.display = 'inherit';
      document.getElementById('heightChartContainer').style.display = 'inherit';
    }

    document.getElementById('height-table').innerHTML = html;
  }

  self.editHeight = function(journalId){
    document.getElementById('popup').style.display = 'inherit';
    document.getElementById('cover').style.display = 'inherit';
    
    for(var i = 0; i < self.data.length; i++){
      if(self.data[i][0] == journalId){
        document.getElementById('journalId').value = self.data[i][0];
        document.getElementById('heightFt').value = self.data[i][2];
        document.getElementById('heightIn').value = self.data[i][3];
        document.getElementById('note').value = self.data[i][4];
        document.getElementById('encounterDateTime').value = self.data[i][1];
        break;
      }
    }
  }

  self.newHeight = function(){
    document.getElementById('popup').style.display = 'inherit';
    document.getElementById('cover').style.display = 'inherit';
    document.getElementById('journalId').value = '';
    document.getElementById('heightFt').value = '';
    document.getElementById('heightIn').value = '';
    document.getElementById('note').value = '';
    document.getElementById('encounterDateTime').value = common.getDateString();
  }

  self.deleteHeight = function(){
    var journalId = document.getElementById('deleteJournalId').value;

    for(var i = 0; i < self.data.length; i++){
      if(self.data[i][0] == journalId){
        var encounterDate = self.data[i][1];
        break;
      }
    }

    xmlQuery(xml.create('iSalusExternal.SaveJournalHeight')(account, journalId, '1', '1', '', encounterDate, 'Y'), common.refresh);
  }

  self.deleteConfirmation = function(id){
    document.getElementById('deleteJournalId').value = id;
    document.getElementById('popup-confirmation').style.display = 'inherit';
    document.getElementById('cover').style.display = 'inherit';
  }

  self.saveHeight = function(){

    var errorFlag = {'error': false};

    var journalId = document.getElementById('journalId').value;
    var heightFt = common.validateCustomField('heightFt', 'heightFtError', errorFlag, function(x){return x <= 9 && x >= 0}, 'Not a valid height.');
    var heightIn = common.validateCustomField('heightIn', 'heightInError', errorFlag, function(x){return x < 12 && x >= 0}, 'Not a valid height.');
    var note = document.getElementById('note').value;
    var encounterDateTime = common.validateDateField('encounterDateTime', 'encounterDateTimeError', errorFlag);

    if(!errorFlag.error){
      xmlQuery(xml.create('iSalusExternal.SaveJournalHeight')(account, journalId, Math.floor(heightFt), Math.floor(heightIn), note, encounterDateTime, 'N'), common.refresh)
    }
  }

  self.loadData = function(){
    currentScreen = journalHeight;
    self.data = [];

    if(account == ''){
      setTimeout(self.loadData, 200);
    }else{
      xmlQuery(xml.create('iSalusExternal.GetJournalHeight')(account), self.updateHeight);
    }
  }
}