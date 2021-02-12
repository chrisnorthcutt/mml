
function goalsScreen(){
  var self = this;

  self.screenTitle = "Goals";
  self.associatedNavItem = "navAboutMe";

  self.data = [];

  self.updateGoals = function(xmlDoc) {
    var html = "";
    var template = '<div class="table-row flex flex-align--center"><div class="col-2"><h4 class="table-data-point">{0}</h4></div>' +
      '<div class="col-2"><h4 class="table-data-point">{1}</h4></div><div class="col-3"><h4 class="table-data-point">{2}</h4></div><div class="col-3">' +
      '<h4 class="table-data-point">{3}</h4></div><div class="col-2"><div class="icon-bg--edit fr" onclick="goals.editGoal(\'{4}\')"></div>' +
      '<div class="icon-bg--delete fr" onclick="goals.deleteConfirmation(\'{4}\')"></div></div></div></div>';

    $(xmlDoc).find('list_item').each(function () {
      var date = $(this).find('encounter_date_time').text();
      var prettyDate = $(this).find('goal_date').text();
      var goal = $(this).find('goal_data').text();
      var goalMet = $(this).find('goal_met_ind').text();
      var from = $(this).find('self_reported').text();
      var journalId = $(this).find('journal_id').text();
      var note = $(this).find('note').text();
      self.data.push([journalId, date.split(' ')[0], goal, goalMet, from, note]);
      html += template.format(goal, goalMet == 'Y' ? 'Yes' : 'No', from == 'Y' ? 'Yes' : 'No', prettyDate, journalId);
    });

    if(html == ''){
      document.getElementById('noGoals').style.display = 'inherit';
      document.getElementById('noPracticeGoals').style.display = 'none';
      document.getElementById('tableHeader').style.display = 'none';
    } else {
      document.getElementById('noGoals').style.display = 'none';
      document.getElementById('noPracticeGoals').style.display = 'none';
      document.getElementById('tableHeader').style.display = 'inherit';
    }
    document.getElementById('goal-table').innerHTML = html;
    document.getElementById('myGoals').style.display = 'inherit';
    document.getElementById('practiceGoals').style.display = 'none';
  }

  self.updatePracticeGoals = function(xmlDoc) {
    var html = '';
    var longTermTemplate = '<div class="col-6"><div class="white p-goal"><div class="clearfix p-goal__main">' +
      '<h3 class="text-color--primary text-weight--bold mt--none fl">{0}</h3><div class="clearfix fr"><p class="fl mr--20 text-color--primary-dark">Active</p>' +
      '<p class="fl text-color--primary-dark">Created: {1}</p></div></div><hr class="light-grey mt--10 mb--10"><div class="p-goal__associated">' +
      '<p class="mb--10 pd--lr20 text-color--primary-dark">Associated Short Term Goals</p><div class="associated-goals__list">{2}</div></div></div></div>';
    var shortTermTemplate = '<div class="associated-goals__item clearfix"><p class="text-color--primary fl">{0}</p><p class="fr text-color--primary-dark">{1}</p></div>';
    var shortTermTopLevelTemplate = '<div class="col-6"><div class="white"><div class="clearfix pd--20"><h3 title="{0}" class="text-color--primary text-weight--bold mt--none fl">'+
      '{0}</h3><div class="clearfix fr"><p class="fl mr--20 text-color--primary-dark">Active</p><p class="fl text-color--primary-dark">Created: {1}</p></div></div></div></div>';

    var goalList = $(xmlDoc).find('goal_list');
    var goalData = [];

    $(goalList).children('list_item').each(function () {
      var goalTerm = $(this).find('goal_term').text();
      var topLevel = $(this).find('top_level').text();
      if(goalTerm == 'Long Term'){
        goalData.push(['Long', $(this).find('goal_name').text(), $(this).find('created').text(), []]);
      }else{
        if(topLevel == '0'){
          goalData[goalData.length - 1][3].push(['Short', $(this).find('goal_name').text(), $(this).find('created').text()]);
        }else{
          goalData.push(['Short', $(this).find('goal_name').text(), $(this).find('created').text()]);
        }
      }
    });

    var longHtml = [];
    var shortHtml = [];
    for(var i = 0; i < goalData.length; i++){
      if(goalData[i][0] == 'Long'){
        var tempHtml = '';
        for(var j = 0; j < goalData[i][3].length; j++){
          tempHtml += shortTermTemplate.format(goalData[i][3][j][1], goalData[i][3][j][2]);
        }
        if(tempHtml == ''){
          tempHtml = 'No associated short term goals.';
        }
        longHtml.push(longTermTemplate.format(goalData[i][1], goalData[i][2], tempHtml));
      }else{
        shortHtml.push(shortTermTopLevelTemplate.format(goalData[i][1], goalData[i][2]));
      }
    }

    if(longHtml.length > 0){
      html += '<h4 class="table-head-title ml--20">Long Term Goals</h4>';
    }

    while(longHtml.length > 0){
      var a = longHtml.shift() || '';
      var b = longHtml.shift() || '';
      html += '<div class="row">{0}{1}</div>'.format(a,b);
    }

    if(shortHtml.length > 0){
      html += '<h4 class="table-head-title ml--20">Short Term Goals</h4>';
    }

    while(shortHtml.length > 0){
      var a = shortHtml.shift() || '';
      var b = shortHtml.shift() || '';
      html += '<div class="row">{0}{1}</div>'.format(a,b);
    }

    if(goalData.length == 0){
      document.getElementById('noGoals').style.display = 'none';
      document.getElementById('noPracticeGoals').style.display = 'inherit';
      document.getElementById('tableHeader').style.display = 'none';
    } else {
      document.getElementById('noGoals').style.display = 'none';
      document.getElementById('noPracticeGoals').style.display = 'none';
      document.getElementById('tableHeader').style.display = 'inherit';
    }
    document.getElementById('practiceGoals').innerHTML = html;
    document.getElementById('myGoals').style.display = 'none';
    document.getElementById('practiceGoals').style.display = 'inherit';
  }

  self.showGoal = function(journalId){
    document.getElementById('popup').style.display = 'inherit';
    document.getElementById('cover').style.display = 'inherit';
    
    for(var i = 0; i < self.data.length; i++){
      if(self.data[i][0] == journalId){
        document.getElementById('goalId').value = self.data[i][0];
        document.getElementById('goal').value = self.data[i][2];
        document.getElementById('goalMet').value = self.data[i][3];
        document.getElementById('goalNotes').value = self.data[i][5];
        document.getElementById('goalDate').value = self.data[i][1];
        break;
      }
    }
  }

  self.newGoal = function(){
    document.getElementById('popup').style.display = 'inherit';
    document.getElementById('cover').style.display = 'inherit';
    document.getElementById('goalId').value = '';
    document.getElementById('goal').value = '';
    document.getElementById('goalMet').value = '';
    document.getElementById('goalNotes').value = '';
    document.getElementById('goalDate').value = common.getDateString();
  }

  self.deleteGoal = function(){
    var journalId = document.getElementById('deleteGoalId').value;

    for(var i = 0; i < self.data.length; i++){
      if(self.data[i][0] == journalId){
        var encounterDate = document.getElementById('goalDate').value = self.data[i][1];
        break;
      }
    }

    xmlQuery(xml.create('iSalusExternal.SaveJournalGoal')(account, journalId, '', 'N', '', encounterDate, 'Y'), common.refresh);
  }

  self.deleteConfirmation = function(id){
    document.getElementById('deleteGoalId').value = id;
    document.getElementById('popup-confirmation').style.display = 'inherit';
    document.getElementById('cover').style.display = 'inherit';
  }

  self.saveGoal = function(){
    var journalId = document.getElementById('goalId').value;
    var goal = document.getElementById('goal').value;
    var goalMetInd = document.getElementById('goalMet').value;
    var note = document.getElementById('goalNotes').value;
    var encounterDateTime = document.getElementById('goalDate').value;

    xmlQuery(xml.create('iSalusExternal.SaveJournalGoal')(account, journalId, goal, goalMetInd, note, encounterDateTime, 'N'), common.refresh)
  }

  self.editGoal = function(id){
    self.showGoal(id);
  }

  self.getMyGoals = function(){
    $('#tab-my-goals').addClass('text-tab-item--active');
    $('#tab-practice-goals').removeClass('text-tab-item--active');
    xmlQuery(xml.create('iSalusExternal.GetJournalGoal')(account), self.updateGoals);
  }

  self.getPracticeGoals = function(){
    $('#tab-my-goals').removeClass('text-tab-item--active');
    $('#tab-practice-goals').addClass('text-tab-item--active');
    xmlQuery(xml.create('iSalusExternal.GetPracticeGoals'), self.updatePracticeGoals);
  }

  self.loadData = function(){
    currentScreen = goals;
    self.data = [];

    if(account == ''){
      setTimeout(self.loadData, 200);
    }else{
      self.getMyGoals();
    }
  }
}