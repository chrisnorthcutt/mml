
function chartScreen(){
  var self = this;

  self.screenTitle = "My Chart";
  self.associatedNavItem = "navAboutMe";

  self.databaseKey = '';
  self.databases = [];

  self.labResultList = {};

  self.updateList = function(xmlDoc) {
    var html = '';
    var template = '<a href="{3}" target="_blank"><div class="table-row flex flex-align--center chart-item--{4}" onclick="chart.toggleRead(this);"><div class="col-3">'+
      '<h4 class="table-data-point">{0}</h4></div><div class="col-6"><h4 class="table-data-point">{1}</h4>'+
      '</div><div class="col-2"><h4 class="table-data-point">{2}</h4></div><div class="col-1"><div class="icon-bg--view fr"></div></div></div></a>';

    $(xmlDoc).find('list_item').each(function(){
      var date = $(this).find('post_date_time').text();
      var action = $(this).find('mychart_desc').text();
      var section = $(this).find('database_title').text();
      var recordId = $(this).find('record_id').text();
      var type = $(this).find('mychart_type').text();
      var readInd = $(this).find('read_ind').text();

      var url = './viewchart?t={0}&i={1}&d={2}&a={3}'.format(type, recordId, encodeURIComponent(date), account);

      html += template.format(action, section, date, url, readInd == 'Y' ? 'read' : 'unread');
    });

    if(html == ''){
      document.getElementById('noChart').style.display = 'inherit';
      document.getElementById('tableHeader').style.display = 'none';
    } else {
      document.getElementById('noChart').style.display = 'none';
      document.getElementById('tableHeader').style.display = 'inherit';
    }

    document.getElementById('myChartList').innerHTML = html;
  }

  self.showChart = function(xmlDoc){
    var educationType = $(xmlDoc).find('education_type').text();

    if(educationType != ''){
      if(educationType == 'U'){
        window.open($(xmlDoc).find('data').text(), '_blank');
      } else {
        document.getElementById('popup').style.display = 'inherit';
        document.getElementById('cover').style.display = 'inherit';

        document.getElementById('myChartDataContainer').contentDocument.documentElement.innerHTML = $(xmlDoc).find('data').text();
      }
    }else{
      document.getElementById('popup').style.display = 'inherit';
      document.getElementById('cover').style.display = 'inherit';

      document.getElementById('myChartDataContainer').contentDocument.documentElement.innerHTML = $(xmlDoc).find('html_data').text();
    }
  }

  self.getChart = function(mychartType, recordId){
    xmlQuery(xml.create('iSalusExternal.MyChartData')(mychartType, recordId), self.showChart);
  }

  self.selectChartTab = function(kind) {
    var kinds = ['S', 'E', 'C', 'R'];

    for(var i = 0; i < kinds.length; i++){
      if(kinds[i] === kind){
        $('#chart-category-'+kinds[i]).addClass('text-tab-item--active');
      } else {
        $('#chart-category-'+kinds[i]).removeClass('text-tab-item--active');
      }
    }
  }

  self.updateEmptyState = function(kind) {
    var empty = {
      'S': "You Have No Chart Data",
      'E': "You Have No Education Material",
      'C': "You Have No CCM Plans",
      'R': "You Have No Lab Results"
    };
    var prefix = 'resources/images/icon/';
    var icons = {
      'S': "icon-empty-chart.svg",
      'E': "icon-empty-education.svg",
      'C': "icon-empty-ccm.svg",
      'R': "icon-empty-labs.svg"
    };

    document.getElementById('emptyStateName').innerText = empty[kind];
    document.getElementById('emptyIcon').src = prefix+icons[kind];
  }

  self.selectCategory = function(kind) {
    self.updateEmptyState(kind);

    if(kind == 'E' || kind == 'C'){
      document.getElementById('pullSummaryButton2').style.display = 'none';
    } else {
      document.getElementById('pullSummaryButton2').style.display = 'inline-block';
    }

    self.selectChartTab(kind);
    
    $('#tableHeader').show();
    $('#labTableHeader').hide();

    xmlQuery(xml.create('iSalusExternal.MyChartList')(kind), self.updateList);
  }

  self.showDownloadLink = function(xmlDoc) {
    $('#cover').show();
    $('#downloadLab').show();
    $('#downloadLabButton').attr("href", 'data:application/pdf;base64,'+$(xmlDoc).find('result_pdf').text());
  }

  self.viewLabResult = function(databaseKey, labRequisitionId, recordId) {
    xmlQuery(xml.create('iSalusExternal.GetLabResult')(databaseKey, labRequisitionId, recordId), self.showDownloadLink);
  }

  self.viewHistory = function(labRequisitionId) {
    var template = '<div class="row clearfix"><p class="fl">{0}</p> <a href="./viewlab?a={1}&k={2}&l={3}&r={4}" class="text-color--primary fr" target="_blank">View</a></div><br>';
    var html = '';

    for (var i = 0; i < self.labResultList[labRequisitionId].length; i++) {
      var item = self.labResultList[labRequisitionId][i];
      html += template.format(item.reviewedDate, account, item.databaseKey, item.labRequisitionId, item.recordId);
    }

    $('#resultsHistoryList').html(html);
    $('#popupResultsHistory').show();
    $('#cover').show();
  }

  self.processLabResults = function(xmlDoc) {
    var template = $('#labTemplate').html();
    var html = '';

    self.labResultList = {};

    $(xmlDoc).find('list_item').each(function() {
      var item = {
        databaseKey: $(this).find('database_key').text(),
        databaseTitle: $(this).find('database_title').text(),
        labRequisitionId: $(this).find('lab_requisition_id').text(),
        recordId: $(this).find('record_id').text(),
        patientComment: $(this).find('patient_comment').text(),
        orderList: $(this).find('order_list').text().split('|'),
        reviewedDate: $(this).find('reviewed_date').text(),
        readInd: $(this).find('read_ind').text()
      };

      var exists = self.labResultList.hasOwnProperty(item.labRequisitionId);

      if (!exists) {
        var orders = '';
        for (var i = 0; i < item.orderList.length; i++) {
          orders += '<p title="{0}" class="lab-name table-data-point">{0}</p>'.format(item.orderList[i]);
        }

        self.labResultList[item.labRequisitionId] = [];

        html += template.format(item.reviewedDate, item.databaseTitle, orders, item.patientComment, item.readInd == 'Y' ? 'read' : 'unread', item.databaseKey, item.labRequisitionId, item.recordId, account);
      }

      self.labResultList[item.labRequisitionId].push(item);
    });

    if(html == ''){
      document.getElementById('noChart').style.display = 'inherit';
      document.getElementById('labTableHeader').style.display = 'none';
    } else {
      document.getElementById('noChart').style.display = 'none';
      document.getElementById('labTableHeader').style.display = 'inherit';
    }

    $('#myChartList').html(html);
  }

  self.showLabResults = function() {
    self.selectChartTab('R');
    self.updateEmptyState('R');

    $('#tableHeader').hide();
    $('#labTableHeader').show();

    xmlQuery(xml.create('iSalusExternal.GetLabResults')(account), self.processLabResults);
  }

  self.selectDatabase = function(number) {
    self.databaseKey = self.databases[number][0];

    common.closeModals();

    self.pullClinicalSummary();
  }

  self.showDatabaseSelect = function() {
    var html = '';
    var template = '<a class="text-weight--bold popup__list-item" href="" onclick="event.preventDefault();chart.selectDatabase({0})"><div class="col-12">{1}</div></a>';

    for(var i = 0; i < self.databases.length; i++){
      html += template.format(i, self.databases[i][1]);
    }

    document.getElementById('popupDatabaseList').innerHTML = html;
    document.getElementById('popupDatabase').style.display = 'inherit';
    document.getElementById('cover').style.display = 'inherit';
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
      $('#pullSummaryButton').addClass('btn--disabled');
      $('#pullSummaryButton2').addClass('btn--disabled');
    } else {
      $('#pullSummaryButton').removeClass('btn--disabled');
      $('#pullSummaryButton2').removeClass('btn--disabled');
    }
  }

  self.syncAndRefresh = function() {
    self.buttonFinished();
    xmlQuery(xml.create('iSalusExternal.Sync')(['Messages', 'Appointments', 'ClinicalSummary', 'PatientEducation', 'CCMCarePlan', 'Vitals', 'Medications']), common.refresh);
  }

  self.pullButton = function() {
    var selector = '#pullSummaryButton';
    $(selector+" > span").html("Pulling...");
    $(selector+" > .save").addClass("saving");
    $(selector).removeClass('dataDone');
    $(selector).removeClass('timedOut');

    setTimeout(function() {
      if($(selector).hasClass('dataDone')){
        $(selector+" > span").html("Summary Pulled");
        $(selector+' > .save').removeClass("saving");
        $(selector+' > .save').attr('src',"resources/images/icon/icon-check.svg");
      }
      $(selector).addClass('timedOut');
    }, 2000);
  }

  self.buttonFinished = function() {
    var selector = '#pullSummaryButton';
    
    if($(selector).hasClass('timedOut')){
      $(selector+" > span").html("Summary Pulled");
      $(selector+' > .save').removeClass("saving");
      $(selector+' > .save').attr('src',"resources/images/icon/icon-check.svg");
    }
    $(selector).addClass('dataDone');
  }

  self.pullClinicalSummary = function() {
    if(self.databaseKey != ''){
      self.pullButton();
      xmlQuery(xml.create('iSalusExternal.PullClinicalSummary')(self.databaseKey), self.syncAndRefresh);
    } else {
      if(self.databases.length > 1){
        self.showDatabaseSelect();
      }
    }
  }

  self.toggleRead = function(elem) {
    $(elem).removeClass('chart-item--unread');
    $(elem).addClass('chart-item--read');
  }

  self.finishSync = function(xmlDoc) {
    console.log('Synced!');
  }

  self.loadData = function(){
    currentScreen = chart;
    
    xmlQuery(xml.create('iSalusExternal.Sync')(['LabResults']), self.finishSync);

    self.selectCategory('S');
    common.getConnection(self.getDatabaseKey);
  }
}