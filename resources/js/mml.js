
function accountBalanceScreen(){
  var self = this;

  self.screenTitle = "Account Balance";
  self.associatedNavItem = "navMyAccount";

  self.databaseKey = '';
  self.databases = [];
  self.statements = [];

  self.balances = {};
  self.stripeCustomer = '';
  self.stripeSources = [];
  self.stripeDatabase = '';

  self.chargeAmount = '';
  self.chargeSource = '';
  self.paymentDisabled;

  self.paymentReady = false;

  self.updateBalance = function(databaseKey, databaseName, stripePk){
    return function(xmlDoc) {
      var connectedTemplate = '<div class="col-6"><div class="row"><div class="col-12 white text-align--center"><h4 class="mb--none text-weight--bold mt--10 text-color--primary-dark">'+
        '{1}</h4><h1 class="text-color--secondary mb--10 text-weight--bold mt--10" style="font-size: 72px">${2}</h1><a href="#" onclick="event.preventDefault();accountbalance.makePayment(\'{0}\');" class="btn--primary mb--10">Make a Payment</a>'+
        '</div></div><a href="#" onclick="event.preventDefault();accountbalance.getStripePayments(\'{0}\');"><div class="row"><div class="col-12 white mt--10 pd--20"><p class="text-weight--bold text-color--primary-dark icon-bg--payment fl">Online Payments</p>'+
        '<img class="fr" src="./resources/images/icon/icon-arrow-dark.svg" alt=""></div></div></a><div class="row"><a href="#" onclick="event.preventDefault();accountbalance.statementHistory(\'{0}\');"><div class="col-12 white mt--10 pd--20">'+
        '<p class="text-weight--bold text-color--primary-dark icon-bg--statement fl">Statement History</p><img class="fr" src="./resources/images/icon/icon-arrow-dark.svg" alt="">'+
        '</div></div></a><a target="_blank" href="./viewreport?k={0}"><div class="row"><div class="col-12 white mt--10 pd--20"><p class="text-weight--bold text-color--primary-dark icon-bg--account fl">Account History</p>'+
        '<img class="fr" src="./resources/images/icon/icon-arrow-dark.svg" alt=""></div></div></a>';
      var notConnectedTemplate = '<div class="col-6"><div class="row"><div class="col-12 white text-align--center"><h4 class="mb--none text-weight--bold mt--10 text-color--primary-dark">'+
        '{1}</h4><h1 class="text-color--secondary mb--10 text-weight--bold mt--10" style="font-size: 72px">${2}</h1>'+
        '</div></div><a href="#" onclick="event.preventDefault();accountbalance.statementHistory(\'{0}\');"><div class="row"><div class="col-12 white mt--10 pd--20">'+
        '<p class="text-weight--bold text-color--primary-dark icon-bg--statement fl">Statement History</p><img class="fr" src="./resources/images/icon/icon-arrow-dark.svg" alt="">'+
        '</div></div></a><a target="_blank" href="./viewreport?k={0}"><div class="row"><div class="col-12 white mt--10 pd--20"><p class="text-weight--bold text-color--primary-dark icon-bg--account fl">Account History</p>'+
        '<img class="fr" src="./resources/images/icon/icon-arrow-dark.svg" alt=""></div></div></a>';

      var template = stripePk == '' ? notConnectedTemplate : connectedTemplate;

      if ($(xmlDoc).find('patient_balance').length > 0) {
        var balance = $(xmlDoc).find('patient_balance').first().text();
        document.getElementById('practiceList').innerHTML += template.format(databaseKey, databaseName, balance, common.getDateString());

        self.balances[databaseKey] = parseFloat(balance);
      } else {
        document.getElementById('practiceList').innerHTML += template.format(databaseKey, databaseName, 0, common.getDateString());

        self.balances[databaseKey] = 0;
      }

      $('#noPractices').css('display', 'none');   
      $('#practiceList').css('display', 'inherit');
    }
  }

  self.changePayment = function(){
    if ($('#paymentMethods').val() !== 'add') {
      self.updateDefaultSource(self.stripeSources[+$('#paymentMethods').val()].id);
    }
  }

  self.paymentMethodSelect = function(){
    if ($('#paymentMethods').val() == 'add') {
      $('#paymentMethods')[0].selectedIndex = 0;
      $('#paymentMethods').blur();
      self.addPaymentMethod();
    }
  }

  self.updatePaymentButton = function(){
    var amount = self.getPaymentAmount();

    if (self.stripeSources.length > 0 && amount >= 500) {
      $('#paymentButton').prop('disabled', false);
      self.paymentDisabled = false;
      self.paymentReady = true;
    } else {
      $('#paymentButton').prop('disabled', true);
      self.paymentDisabled = true;
      self.paymentReady = false;
    }
  }

  self.updatePaymentMethods = function(){
    var html = '';
    var template = '<option value="{0}">{1}</option>';

    for(var i = 0; i < self.stripeSources.length; i++){
      var item = self.stripeSources[i];

      if (item.object == "source") {
        item = item.card;
      }

      html += template.format(i, item.brand + '...' + item.last4);
    }

    html += template.format('add', 'Add a payment method...');

    $('#paymentMethods').html(html);

    self.updatePaymentButton();
  }

  self.stripeTokenHandler = function(token){
    
    var data = {
      key: key,
      dbKey: self.stripeDatabase,
      source: token.id
    };

    var callback = function(result){
      self.stripeSources.push(result);
      self.updatePaymentMethods();

      common.closeModals();

      $('#cover').css('display', 'inherit');
      $('#makePayment').css('display', 'inherit');
    };

    self.makeStripeCall('customer/createSource', data, callback);

  }

  self.updateDefaultSource = function(source){

    var data = {
      key: key,
      dbKey: self.stripeDatabase,
      default_source: source
    };

    self.paymentReady = false;

    var callback = function(result){
      self.paymentReady = true;
    }

    self.makeStripeCall('customer/update', data, callback);

  }

  self.getStripePayments = function(databaseKey){

    var data = {
      key: key,
      dbKey: databaseKey,
      customerId: self.customer,
      limit: 100
    };

    var callback = function(result){
      var template = '<div class="row clearfix mb--10"><div class="fl"><img src="./resources/images/icon/icon-{0}.svg" class="mr--10" alt="{0}">'+
        '</div><div class="fl"><p>{2}...{3}</p><p class="text-size--small text-color--medium-grey">{5}</p></div><div class="fr">'+
        '<p class="text-color--secondary text-align--right">${1}</p><p class="text-size--small text-color--medium-grey">{4}</p></div></div>';

      var html = '';

      $.each(result.data, function (index, charge) {
        var date = new Date(charge.created * 1000);
        var dateString = common.withZero(date.getMonth()+1) + '/' + common.withZero(date.getDate()) + '/' + date.getFullYear();

        if (charge.source.object == 'source' && charge.source.type == 'card') {
          html += template.format(charge.source.card.brand.replace(/ /g, '-'), (charge.amount / 100).toFixed(2), charge.source.card.brand, charge.source.card.last4, dateString, charge.metadata.mml_source);
        } else {
          html += template.format(charge.source.brand.replace(/ /g, '-'), (charge.amount / 100).toFixed(2), charge.source.brand, charge.source.last4, dateString, charge.metadata.mml_source);
        }
      });
      
      $('#paymentHistoryList').html(html);
      $('#cover').css('display', 'inherit');
      $('#paymentHistory').css('display', 'inherit');
    }

    self.makeStripeCall('charge/getByCustomer', data, callback);

  }

  self.stripeGetCustomer = function(){

    var data = {
      key: key,
      dbKey: self.stripeDatabase
    };

    var callback = function(result){
      self.stripeCustomer = result.id;
      self.stripeSources = result.sources.data;
      self.updatePaymentMethods();
    };

    self.makeStripeCall('customer/get', data, callback);

  }

  self.finishPayment = function(){

    var databaseName = '';
    
    for (var i = 0; i < self.databases.length; i++) {
      if (self.databases[i][0] == self.stripeDatabase) {
        databaseName = self.databases[i][1];
        break;
      }
    }

    var data = {
      key: key,
      dbKey: self.stripeDatabase,
      amount: self.chargeAmount,
      currency: 'usd',
      cardToken: self.chargeSource,
      mml_account_id: account,
      mml_source: 'MML Desktop',
      description: 'MML Payment Made to ' + databaseName,
      statement_descriptor: 'MML ' + databaseName
    };

    $("#confirmPayment").prop('disabled', true).html("<span class='loading'></span>");
    $("#confirmBack").prop('disabled', true);

    var callback = function(result){
      $("#confirmPayment").prop('disabled', false).html("Confirm Payment");
      $("#confirmBack").prop('disabled', false);

      if (result.hasOwnProperty('type') && result.type === 'StripeInvalidRequestError' || result.type === 'StripeCardError') {
        $('#stripePaymentErrorMessage').html(result.message);
        console.warn('There has been an error with the stripe payment.');
      } else {
        common.closeModals();

        $('#paymentAmountThanks').html((result.amount / 100).toFixed(2));

        $('#cover').css('display', 'inherit');
        $('#thankYou').css('display', 'inherit');
      }
    };

    self.makeStripeCall('charge/add', data, callback, "POST");

  }

  self.stripeCreateCustomer = function(){

    var data = {
      key: key,
      dbKey: self.stripeDatabase,
      description: mainUser.firstName + ' ' + mainUser.lastName,
      email: mainUser.emailAddress
    };

    var callback = function(result){
      self.stripeCustomer = result.id;
      xmlQuery(xml.create('iSalusExternal.SaveStripe')(result.id), console.log);
      common.clearConnectionCache();
    };

    self.makeStripeCall('customer/add', data, callback);

  }

  self.makeStripeCall = function(method, data, callback, type) {
    var nodeUrl = 'https://signal.officemd.net:9252/'+method;
    var type = type || "GET";

    if (type == "POST") {
      data = JSON.stringify(data);
    }

    $.ajax({
        type: type,
        url: nodeUrl,
        contentType: "application/json; charset=utf-8",
        data: data,
        dataType: "json",
        success: callback,
        error: function (jqXHR, exception) {
          console.log(jqXHR);
        }
    });
  }

  self.chooseAmount = function(isNormal){
    document.getElementById('otherAmountInput').disabled = isNormal;

    if (isNormal) {
      $('#paymentButton').prop('value', 'Pay $'+$('#balanceAmount').html());
    } else {
      $('#paymentButton').prop('value', 'Pay $'+$('#otherAmountInput').val());
    }

    self.updatePaymentButton();
  }

  self.updateAmount = function(event){
    var amount = +($('#otherAmountInput').cleanVal());
    var str = amount+'';

    if (amount < 100) {
      while (str.length < 3) {
        str = '0' + str;
      }
    }
    
    $('#otherAmountInput').val( $('#otherAmountInput').masked( str ) );
    $('#paymentButton').prop('value', 'Pay $'+$('#otherAmountInput').val());

    self.updatePaymentButton();
  }

  self.makePayment = function(databaseKey){
    self.stripeDatabase = databaseKey;

    var balance = self.balances[databaseKey].toFixed(2);
    $('#balanceAmount').html(balance);
    $('#paymentButton').prop('value', 'Pay $'+balance);
    $('#databaseToPay').val(databaseKey);

    $('#accountBalance').click();
    self.updatePaymentMethods();

    $('#cover').css('display', 'inherit');
    $('#makePayment').css('display', 'inherit');
  }

  self.getPaymentAmount = function(){
    var database = $('#databaseToPay').val();

    if ($('input:radio[name="startDateType"]:checked').val() == 'balance') {
      return Math.floor(self.balances[database] * 100);
    } else {
      return +$('#otherAmountInput').cleanVal();
    }
  }

  self.confirmPayment = function(){
    if (!self.paymentDisabled) {
      common.closeModals();
      var database = $('#databaseToPay').val();
      var databaseName = '';
      var amount = self.getPaymentAmount();

      for (var i = 0; i < self.databases.length; i++) {
        if (self.databases[i][0] == database) {
          databaseName = self.databases[i][1];
          break;
        }
      }

      self.chargeAmount = amount+'';
      self.chargeSource = self.stripeSources[+$('#paymentMethods').val()].id;
      
      $('#paymentAmount').html('$'+(amount/100).toFixed(2));
      $('#databaseName').html(databaseName);
      $('#databaseNameThanks').html(databaseName);

      $('#cover').css('display', 'inherit');
      $('#paymentConfirmation').css('display', 'inherit');
    }
  }

  self.addPaymentMethod = function(){
    common.closeModals();

    $('#cover').css('display', 'inherit');
    $('#addPayment').css('display', 'inherit');
  }
  
  self.getStatementData = function(index){
    return function(xmlDoc){
      common.closeModals();

      var statement = self.statements[index];
      var template = "<p class='text-size--lg'><b>Submitted date:</b> {0}</p><p class='text-size--lg'><b>Due date:</b> {1}</p><p class='text-size--lg'><b>Statement balance:</b> ${2}</p><p class='text-size--lg'><b>From:</b> {3}</p>";
      var html = template.format(statement.submitted, statement.due, statement.balance, statement.title);

      var filename = "MyMedicalLocker Statement "+statement.submitted.replace(/\//g, '-')+".pdf";

      html += '<p><a class="btn--primary width--100 mt--10" download="'+filename+'" href="data:application/pdf;base64,'+$(xmlDoc).find('statement_pdf').text()+'">Download Full Statement PDF ';
      html += '<img class="save va--middle mr--10" src="resources/images/icon/icon-save.svg" alt=""></p>';

      $('#statementDetails').html(html);

      $('#cover').css('display', 'inherit');
      $('#statementDetailView').css('display', 'inherit');
    }
  }

  self.showStatementDetails = function(index){
    var statement = self.statements[index];

    xmlQuery(xml.create('iSalusExternal.GetStatement')(statement.key, statement.number), self.getStatementData(index));
  }

  self.statementHistoryModal = function(){
    $('#cover').css('display', 'inherit');
    $('#statementHistory').css('display', 'inherit');
  }

  self.showStatementHistory = function(xmlDoc){
    var template = '<a href="#" onclick="event.preventDefault();accountbalance.showStatementDetails({2})"><div class="row clearfix"><div class="fl"><p class="text-color--primary text-weight--bold">${1}</p><p>{0}</p></div><p class="text-color--primary fr">View Details</p></div></a>';
    var html = '';
    self.statements = [];

    $(xmlDoc).find('list_item').each(function(){
      var statement = {
        submitted: $(this).find('statement_submitted').text(),
        balance: $(this).find('statement_balance').text(),
        key: $(this).find('database_key').text(),
        title: $(this).find('database_title').text(),
        number: $(this).find('statement_number').text(),
        due: $(this).find('statement_due').text()
      };

      html += template.format(statement.submitted, statement.balance, self.statements.length);

      self.statements.push(statement);
    });

    $('#statementList').html(html);

    self.statementHistoryModal();
  }

  self.statementHistory = function(databaseKey){
    xmlQuery(xml.create('iSalusExternal.GetStatements')(databaseKey, '', ''), self.showStatementHistory);
  }

  self.getOrCreateStripeCustomer = function(){
    if(mainUser.stripeInd !== ''){
      if (mainUser.stripeInd == 'Y') {
        self.stripeGetCustomer();
      } else {
        self.stripeCreateCustomer();
      }
    } else {
      console.warn('there has been a stripe error.')
    }
  }

  self.getDatabaseKey = function(xmlDoc){
    self.databaseKey = '';
    self.databases = [];

    $(xmlDoc).find('list_item').each(function(){
      if($(this).find('account_id').text() == account){
        var stripePk = $(this).find('stripe_pk').text();
        var databaseKey = $(this).find('database_key').text();
        var databaseName = $(this).find('client_name').text()

        self.databases.push([databaseKey, databaseName, stripePk]);

        if (stripePk !== '') {
          self.stripeDatabase = databaseKey;
        }
      }
    });

    $('#practiceList').html('');

    if(self.databases.length > 0){
      $.each(self.databases, function(index, value){
        xmlQuery(xml.create('iSalusExternal.GetClaimReport')(value[0]), self.updateBalance(value[0], value[1], value[2]));
      });

      self.getOrCreateStripeCustomer();
    } else {
      $('#noPractices').css('display', 'inherit');
      $('#practiceList').css('display', 'none');
    }
  }

  self.loadData = function(){
    currentScreen = accountbalance;

    common.getConnection(self.getDatabaseKey);
  }
}

function allergyScreen(){
  var self = this;

  self.screenTitle = "Allergies";
  self.associatedNavItem = "navAboutMe";

  self.updateAllergies = function(xmlDoc) {
    var html = "";
    var template = '<div class="table-row flex flex-align--center"><div class="col-2"><h4 class="table-data-point">{0}</h4></div>' +
      '<div class="col-2"><h4 class="table-data-point">{1}</h4></div><div class="col-3"><h4 class="table-data-point">{2}</h4></div><div class="col-3">' +
      '<h4 class="table-data-point">{3}</h4></div><div class="col-2"><div class="icon-bg--edit fr" onclick="allergy.editAllergy(\'{4}\')"></div>' +
      '<div class="icon-bg--delete fr" onclick="allergy.deleteConfirmation(\'{4}\')"></div></div></div></div>';

    $(xmlDoc).find('list_item').each(function () {
      var reactionTreatment = $(this).find('reaction_treatment').text().split('/');
      
      if (reactionTreatment.length > 1) {
        var reaction = reactionTreatment[0];
        var treatment = reactionTreatment[1];
        if (treatment.length > 50) {
          treatment = treatment.substring(0, 50) + '...';
        }
      } else {
        var reaction = reactionTreatment[0];
        var treatment = '';
      }

      html += template.format($(this).find('allergy_desc').text(), $(this).find('allergy_type_desc').text(), reaction, treatment, $(this).find('allergy_id').text());
    });

    if(html == ''){
      document.getElementById('noAllergies').style.display = 'inherit';
      document.getElementById('tableHeader').style.display = 'none';
    } else {
      document.getElementById('noAllergies').style.display = 'none';
      document.getElementById('tableHeader').style.display = 'inherit';
    }
    document.getElementById('allergy-table').innerHTML = html;
  }

  self.showAllergy = function(xmlDoc){
    document.getElementById('popup').style.display = 'inherit';
    document.getElementById('cover').style.display = 'inherit';
    document.getElementById('treatment').value = $(xmlDoc).find('treatment').text();
    document.getElementById('reaction').value = $(xmlDoc).find('reaction').text();
    var type = $(xmlDoc).find('allergen_type_code').text();
    var id = $(xmlDoc).find('allergen_id').text();

    document.getElementById('allergyId').value = $(xmlDoc).find('allergy_id').text();

    xmlQuery(xml.create('iSalusExternal.GetAllergenList')(type), common.renderDropdown('allergenDropdown', id));
    document.getElementById("allergenType").selectedIndex = parseInt(type) - 1;
  }

  self.newAllergy = function(){
    document.getElementById('popup').style.display = 'inherit';
    document.getElementById('cover').style.display = 'inherit';
    document.getElementById('allergyId').value = '';
    document.getElementById('treatment').value = '';
    document.getElementById('reaction').value = '';
    document.getElementById("allergenType").selectedIndex = 0;
    xmlQuery(xml.create('iSalusExternal.GetAllergenList')('1'), common.renderDropdown('allergenDropdown'));
  }

  self.removeFromDatabase = function(xmlDoc){
    var type = $(xmlDoc).find('allergen_type_code').text();
    var id = $(xmlDoc).find('allergen_id').text();
    var allergy = $(xmlDoc).find('allergy_id').text();

    xmlQuery(xml.create('iSalusExternal.SaveAllergy')(allergy, type, id, '', '', 'Y'), common.refresh);
  }

  self.deleteAllergy = function(){
    var id = document.getElementById('deleteAllergyId').value;
    xmlQuery(xml.create('iSalusExternal.GetAllergy')(id), self.removeFromDatabase);
  }

  self.deleteConfirmation = function(id){
    document.getElementById('deleteAllergyId').value = id;
    document.getElementById('popup-confirmation').style.display = 'inherit';
    document.getElementById('cover').style.display = 'inherit';
  }

  self.saveAllergy = function(){
    var allergyId = document.getElementById('allergyId').value;
    var allergenTypeCode = $("#allergenType").val();
    var allergenId = $("#allergenDropdown").val();
    var treatment = document.getElementById('treatment').value;
    var reaction = document.getElementById('reaction').value;

    xmlQuery(xml.create('iSalusExternal.SaveAllergy')(allergyId, allergenTypeCode, allergenId, treatment, reaction, 'N'), common.refresh)
  }

  self.editAllergy = function(id){
    xmlQuery(xml.create('iSalusExternal.GetAllergy')(id), self.showAllergy);
  }

  self.loadData = function(){
    currentScreen = allergy;

    xmlQuery(xml.create('iSalusExternal.GetAllergyList'), self.updateAllergies);
  }
}

function announcementsScreen(){
  var self = this;

  self.screenTitle = "Announcements";
  self.associatedNavItem = "navMyAccount";

  self.updateAnnouncements = function(xmlDoc) {
    var html = '';
    var template = '<div><h4 class="text-color--primary">{0}</h4><p class="text-size--small text-color--medium-grey">{3}</p><h2>{1}</h2><p>{2}</p></div>';

    $(xmlDoc).find('list_item').each(function(){
      html+=template.format(
          $(this).find('client_name').text(),
          $(this).find('message_name').text(),
          $(this).find('message_html').text(),
          $(this).find('start_date').text()
        );
    });

    document.getElementById('announcementsList').innerHTML = html;

    if(html == ''){
      document.getElementById('noAnnouncements').style.display = 'inherit';
      document.getElementById('announcementContainer').style.display = 'none';
    } else {
      document.getElementById('noAnnouncements').style.display = 'none';
      document.getElementById('announcementContainer').style.display = 'inherit';
    }
  }

  self.loadData = function(){
    currentScreen = announcements;
    xmlQuery(xml.create('iSalusExternal.GetAnnouncements'), self.updateAnnouncements);
  }
}

function appointmentsScreen(){
  var self = this;

  self.screenTitle = "Appointments";
  self.associatedNavItem = "navMyAppointments";

  self.databaseKey = '';
  self.employerBased = false;
  self.appointmentTypeList = [];
  self.locationList = [];
  self.resourceList = [];
  self.providerInfo = {};
  self.appointmentList = [];
  self.weekOffset = 0;
  self.filterList = [];
  self.searchResults = [];
  self.selectedAppointment = '';
  self.times = [];
  self.canBook = false;
  self.selectedCategory = 0;
  self.clientList = {};
  self.databases = [];

  self.updateList = function(kind){
    return function(xmlDoc) {
      var html = '';
      var template = '<a href="#" onclick="event.preventDefault();appointments.showAppointment(\'{6}\')"><div class="table-row flex flex-align--center"><div class="col-1"><div class="pp"><img class="ppi" src="{5}"/></div></div><div class="col-4"><h4 class="table-data-point">{0}<br/><i>{4}</i></h4></div><div class="col-3"><h4 class="table-data-point">{1}</h4>'+
        '</div><div class="col-2"><h4 class="table-data-point">{2}</h4></div><div class="col-2"><h4 class="table-data-point">{3}</h4></div></div></a>';
      var template2 = '<a href="#" onclick="event.preventDefault();appointments.showAppointmentRequest({4});"><div class="table-row flex flex-align--center">'+
        '<div class="col-5"><h4 class="table-data-point">{0}</h4></div><div class="col-3"><h4 class="table-data-point">{1}</h4>'+
        '</div><div class="col-2"><h4 class="table-data-point">{2}</h4></div><div class="col-2"><h4 class="table-data-point">{3}</h4></div></div></a>';
      self.appointmentList = [];

      var index = 0;
      $(xmlDoc).find('list_item').each(function(){
        var appointmentId = $(this).find('appointment_id').text();
        var date = $(this).find('appointment_time').text();
        var name = $(this).find('account_name').text();
        var duration = $(this).find('duration').text();
        var location = $(this).find('location').text();
        var locationAddress = $(this).find('location_address').text();
        var provider = $(this).find('scheduled_with').text();
        var reason = $(this).find('appointment_type').text();
        var requestedDate = $(this).find('requested_date').text();
        var status = $(this).find('status').text();
        var accountName = $(this).find('account_name').text();
        var message = $(this).find('message').text();
        var responseMessage = $(this).find('response_message').text();
        var databaseKey = $(this).find('database_key').text();

        var found = false;
        if(self.providerInfo.hasOwnProperty(databaseKey)){
          for(var i = 0; i < self.providerInfo[databaseKey].length; i++){
            if(provider == self.providerInfo[databaseKey][i][0]){
              if(kind == '3'){
                html += template2.format(provider, reason, duration, date, self.appointmentList.length);
              } else {
                var providerImg = self.providerInfo[databaseKey][i][1] ? 'data:image/jpeg;base64,'+self.providerInfo[databaseKey][i][1] : './resources/images/icon/icon-provider.svg';
                html += template.format(provider, reason, duration, date, location, providerImg, self.appointmentList.length);
              }
              found = true;
              break;
            }
          }
        }

        if(!found){
          if(kind == '3'){
            html += template2.format(location, accountName, status, requestedDate, self.appointmentList.length);
          } else {
            html += template.format(provider, reason, duration, date, location, './resources/images/icon/icon-provider.svg', self.appointmentList.length);
          }
        }

        self.appointmentList.push([appointmentId, date, name, duration, location, locationAddress, provider, reason, message, responseMessage, databaseKey]);
      });

      if(html == ''){
        self.setPlaceholder(self.selectedCategory);
        document.getElementById('noAppointments').style.display = 'inherit';
        document.getElementById('tableHeader').style.display = 'none';
      } else {
        document.getElementById('noAppointments').style.display = 'none';
        document.getElementById('tableHeader').style.display = 'inherit';
      }
      document.getElementById('appointmentList').innerHTML = html;
    }
  }

  self.showAppointmentRequest = function(which){
    document.getElementById('popupRequest').style.display = 'inherit';
    document.getElementById('cover').style.display = 'inherit';
    document.getElementById('patientRequest').innerText = self.appointmentList[which][8].replace(/\{CR\}/g, "\n");
    document.getElementById('patientRequest').scrollTop = 0;
    document.getElementById('physicianResponse').innerText = self.appointmentList[which][9].replace(/\{CR\}/g, "\n");
    document.getElementById('physicianResponse').scrollTop = 0;
  }

  self.showAppointment = function(which){
    var template = '<p>{0}, {1}, {2}, {3}, {4}, {5}, {6}, {7}</p>';

    if (self.selectedCategory === '0') {
      $('#appointmentCancelButton').show();
    } else {
      $('#appointmentCancelButton').hide();
    }

    document.getElementById('popup-appointment-info').style.display = 'inherit';
    document.getElementById('cover').style.display = 'inherit';
    document.getElementById('infoDate').innerText = self.appointmentList[which][1];
    document.getElementById('infoAddress').innerHTML = self.appointmentList[which][5].replace('~', '<br>');
    document.getElementById('infoProvider').innerText = self.appointmentList[which][6];
    document.getElementById('infoLocation').innerText = self.appointmentList[which][4];
    document.getElementById('infoReason').innerText = self.appointmentList[which][7];
    document.getElementById('providerImage').src = './resources/images/icon/icon-provider.svg';

    document.getElementById('cancelAppointmentId').value = self.appointmentList[which][0];
    document.getElementById('cancelAppointmentKey').value = self.appointmentList[which][10];

    var databaseKey = self.appointmentList[which][10];

    if(self.providerInfo.hasOwnProperty(databaseKey)){
      for(var j = 0; j < self.providerInfo[databaseKey].length; j++){
        if(self.appointmentList[which][6] == self.providerInfo[databaseKey][j][0]){
          if(self.providerInfo[databaseKey][j][1]){
            document.getElementById('providerImage').src = 'data:image/jpeg;base64,'+self.providerInfo[databaseKey][j][1];
          }
          break;
        }
      }
    }
  }

  self.confirmAppointmentCancel = function() {
    document.getElementById('popup-confirmation').style.display = 'inherit';
    document.getElementById('cover').style.display = 'inherit';
  }

  self.cancelAppointment = function() {
    var id = document.getElementById('cancelAppointmentId').value;
    var key = document.getElementById('cancelAppointmentKey').value;

    xmlQuery(xml.create('iSalusExternal.CancelAppointment')(account, key, id), self.afterCancel);
  }

  self.afterCancel = function(xmlDoc) {
    common.refresh();
    var passed = $(xmlDoc).find('passed').text() == 'Y';
    document.getElementById('cancelAppointmentStatus').innerHTML = passed ? 'You have successfully cancelled the appointment.' : 'The appointment could not be cancelled.';
    document.getElementById('popup-after-cancel').style.display = 'inherit';
    document.getElementById('cover').style.display = 'inherit';
  }

  self.closeModals = function(){
    $('.popup').each(function(){
      this.style.display = 'none';
    });
    document.getElementById('cover').style.display = 'none';
  }

  self.setHeader = function(number){
    var template = '<div class="col-{0}"><h4 class="table-head-title">{1}</h4></div>'
    var html = '';
    var list = [];

    if(parseInt(number) < 3){
      list = [[5, 'Provider'], [3, 'Reason'], [2, 'Duration'], [2, 'Date']];
    } else {
      list = [[5, 'Location'], [3, 'For'], [2, 'Status'], [2, 'Requested Date']];
    }

    for(var i = 0; i < list.length; i++){
      html += template.format(list[i][0], list[i][1]);
    }

    document.getElementById('tableHeader').innerHTML = html;
  }

  self.setPlaceholder = function(number){
    var options = ['Upcoming Appointments', 'Previous Appointments', 'Cancelled Appointments', 'Appointment Requests'];

    document.getElementById('placeholderText').innerText = options[number];
  }

  self.selectAppointments = function(number){
    for(var i = 0; i < 4; i++){
      if(i+'' === number){
        $('#appointment-category-'+i).addClass('text-tab-item--active');
      } else {
        $('#appointment-category-'+i).removeClass('text-tab-item--active');
      }
    }
    self.setHeader(number);
    self.selectedCategory = number;
    xmlQuery(xml.create('iSalusExternal.GetAppointments')(number), self.updateList(number));
  }

  self.changeFilter = function(){
    var boxes = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
    var elem = null;
    self.filterList = [];

    for(var i = 0; i < boxes.length; i++){
      elem = document.getElementById('employer-checkbox-'+boxes[i]);
      if(!elem.checked){
        self.filterList.push(elem.value);
      }
    }

    self.getAppointmentSearch();
  }

  self.changeWeek = function(number){
    self.weekOffset += number;
    self.getAppointmentSearch();
  }

  self.pickAppointment = function(id){
    self.selectedAppointment = id;
    $('#bookButton').removeClass('btn--disabled');
    self.canBook = true;

    for(var i = 0; i < self.searchResults.length; i++){
      if(id == self.searchResults[i]){
        $('#appointment-tile-'+self.searchResults[i]).addClass('appointment-selected');
      } else {
        $('#appointment-tile-'+self.searchResults[i]).removeClass('appointment-selected');
      }
    }
  }

  self.showTimes = function(xmlDoc){
    self.times = [];
    var template = '<a href="#" onclick="event.preventDefault();appointments.pickAppointment(\'{1}\')"><div id="appointment-tile-{1}" class="col-2 text-align--center">'+
      '<div class="col-12 text-size--small bg--light-blue-grey text-color--primary-dark"><p>{0}</p></div></div></a>';
    var weekTemplate = '<div class="week-selector text-align--center"><a class="week-selector__arrow previous" href="#" onclick="event.preventDefault();appointments.changeWeek(-1);"></a> <p class="text-color--grey text-weight--bold">Week of {0}</p> <a class="week-selector__arrow next" href="#" onclick="event.preventDefault();appointments.changeWeek(1);"></a></div>';
    var html = '';
    var header = '';

    header += weekTemplate.format($(xmlDoc).find('week_of').text());

    self.searchResults = [];

    $(xmlDoc).find('date_item').each(function(){
      var date = $(this).find('schedule_date').text();

      var day = $(this).find('long_date').text().split(',')[0];
      if(self.filterList.indexOf(day) > -1){
        return 'continue';
      }

      html += '<p class="text-weight--bold">' + $(this).find('long_date').text() + '</p><br/><div class="row">';

      var slots = {};
      var appointmentTypeId = document.getElementById('employerReason').value;

      $(this).find('resource_item').each(function(){
        var resourceName = $(this).find('resource_name').text();
        var resourceId = $(this).find('resource_id').text();

        $(this).find('service_item').each(function(){
          var serviceLocation = $(this).find('service_location').text();
          var serviceLocationId = $(this).find('service_location_id').text();

          $(this).find('appt_item').each(function(){
            var startTime = $(this).find('start_time').text();
            var endTime = $(this).find('end_time').text();
            var placeholderId = $(this).find('placeholder_id').text();
            var placeholderInd = $(this).find('placeholder_ind').text();
            //var appointmentTypeId = $(this).find('appointment_type_id').text();

            self.times.push([date, resourceName, resourceId, serviceLocation, startTime, endTime, placeholderId, placeholderInd, appointmentTypeId, serviceLocationId]);

            if(slots.hasOwnProperty(startTime)){
              slots[startTime][0] += 1;
            } else {
              slots[startTime] = [1, placeholderId];
            }
          });
        });
      });

      for(var i in slots){
        if(i != undefined){
          html += template.format(i + " slots: " + slots[i][0], slots[i][1]);
          self.searchResults.push(slots[i][1]);
        }
      }

      html += '</div>';
    });

    document.querySelector('#employerClinicTimes').innerHTML = header + (html || '<i>No results found for those criteria.</i>');
  }

  self.getAppointmentSearch = function(){

    var errorFlag = {'error': false};

    var timeframe = common.validateNotEmpty('employerTimeframe', 'employerTimeframeError', errorFlag);
    var appointmentType = common.validateNotEmpty('employerReason', 'employerReasonError', errorFlag);
    var location = common.validateNotEmpty('employerLocation', 'employerLocationError', errorFlag);

    if(!errorFlag.error){
      xmlQuery(xml.create('iSalusExternal.GetAppointmentSearch')(self.databaseKey, appointmentType, location, '', timeframe, self.weekOffset.toString()), self.showTimes);
    }
  }

  self.showPracticeMessage = function(message){
    return function(xmlDoc){
      self.resetKey();
      common.closeModals();

      if ( $(xmlDoc).find('passed').text() == 'Y' ) {
        var messageResponse = $(xmlDoc).find('message_response').text() || message;
        document.getElementById('practiceMessageContent').innerHTML = messageResponse || 'Your message has been received.';
      } else {
        document.getElementById('practiceMessageContent').innerHTML = $(xmlDoc).find('message').text();
      }

      document.getElementById('popupPracticeMessage').style.display = 'inherit';
      document.getElementById('cover').style.display = 'inherit';

      common.refreshState = true;
    }
  }

  self.bookAgain = function(xmlDoc){
    common.closeModals();

    var messageResponse = $(xmlDoc).find('message_response').text();

    if ( $(xmlDoc).find('passed').text() == 'Y' ) {
      document.getElementById('popupBookAgain').style.display = 'inherit';
    } else {
      document.getElementById('bookingFailedMessage').innerHTML = $(xmlDoc).find('message').text();
      document.getElementById('popupBookingFailed').style.display = 'inherit';
    }
    document.getElementById('cover').style.display = 'inherit';

    common.refreshState = true;
  }

  self.bookAppointment = function(){
    if(self.canBook){
      for(var i = 0; i < self.times.length; i++){
        if(self.times[i][6] == self.selectedAppointment){
          var appointmentTypeId = self.times[i][8];
          var serviceLocationId = self.times[i][9];
          var resourceId = self.times[i][2];
          var placeholderId = self.times[i][6];
          var placeholderInd = self.times[i][7];
          var scheduleDate = self.times[i][0];
          var startTime = self.times[i][4];
          var endTime = self.times[i][5];

          if(typeof(isNeurocore) !== 'undefined'){
            var accountId = document.getElementById('employerClient').value;
            var xml2 = new XmlCreator(key);
            xml2.setAccount(accountId);
            xmlQuery(xml2.create('iSalusExternal.BookAppointment')(self.databaseKey, appointmentTypeId, serviceLocationId, resourceId, placeholderId, placeholderInd, scheduleDate, startTime, endTime), self.bookAgain);
          }else{
            xmlQuery(xml.create('iSalusExternal.BookAppointment')(self.databaseKey, appointmentTypeId, serviceLocationId, resourceId, placeholderId, placeholderInd, scheduleDate, startTime, endTime), self.showPracticeMessage('Your appointment has been booked.'));
          }
          break;
        }
      }
    }
  }

  self.sendAppointmentRequest = function(){
    var phone = document.getElementById('phone').value;
    var other = document.getElementById('other').value;
    var provider = document.getElementById('provider').value;
    var reason = document.getElementById('reason').value;
    var timeframe = document.getElementById('timeframe').value;
    var preferred = document.getElementById('preferredTime').value;
    var important = document.getElementById('mostImportant').value;

    var days = [];
    days.push(document.getElementById('checkbox-Mon').checked);
    days.push(document.getElementById('checkbox-Tue').checked);
    days.push(document.getElementById('checkbox-Wed').checked);
    days.push(document.getElementById('checkbox-Thu').checked);
    days.push(document.getElementById('checkbox-Fri').checked);
    days.push(document.getElementById('checkbox-Sat').checked);
    days.push(document.getElementById('checkbox-Sun').checked);

    for(var i = 0; i < days.length; i++){
      if(days[i]){
        days[i] = 'Y';
      }else{
        days[i] = 'N';
      }
    }

    xmlQuery(xml.create('iSalusExternal.SendAppointmentRequest')(phone, other, self.databaseKey, provider, reason, timeframe, days[0], days[1], days[2], days[3], days[4], days[5], days[6], preferred, important), self.showPracticeMessage('Your request has been received.'));
  }

  self.getCreateInfo = function(openModal) {
    return function(xmlDoc){
      var appointmentXml = $(xmlDoc).find('appointment_type_list');
      var tempAppointment = [['', '']];

      $(appointmentXml).find('list_item').each(function(){
        tempAppointment.push([$(this).find('encode').text(), $(this).find('decode').text()]);
      });

      var locationXml = $(xmlDoc).find('location_list');
      var tempLocation = [['', '']];

      $(locationXml).find('list_item').each(function(){
        tempLocation.push([$(this).find('encode').text(), $(this).find('decode').text()]);
      });

      var resourceXml = $(xmlDoc).find('resource_list');
      var tempResource = [['', '']];

      $(resourceXml).find('list_item').each(function(){
        if($(this).find('h').text() != '1'){
          tempResource.push([$(this).find('encode').text(), $(this).find('decode').text()]);
        }
      });

      self.appointmentTypeList = tempAppointment;
      self.locationList = tempLocation.sort(function(a,b){return a[1].toLowerCase().localeCompare(b[1].toLowerCase());});
      self.resourceList = tempResource;

      self.createSelect('employerLocation', self.locationList);
      self.createSelect('employerReason', self.appointmentTypeList);
      self.createSelect('employerProvider', self.resourceList);

      if(openModal){
        common.closeModals();

        self.newAppointment();
      }
    }
  }

  self.createSelect = function(id, list){
    if(typeof(list) !== 'undefined'){
      var html = '';
      var template = '<option value="{0}">{1}</option>';

      for(var i = 0; i < list.length; i++){
        html += template.format(list[i][0], list[i][1]);
      }

      var elem = document.getElementById(id);
      elem.innerHTML = html;
      elem.selectedIndex = 0;
    }
  }

  self.renderProviderDropdown = function(databaseKey){
    var html = '';
    var template = '<option value="{0}">{0}</option>';

    for(var i = 0; i < self.providerInfo[databaseKey].length; i++) {
      html += template.format(self.providerInfo[databaseKey][i][0]);
    }

    var elem = document.getElementById('provider');
    elem.innerHTML = html;
    elem.selectedIndex = 0;
  }

  self.getProviderInfo = function(databaseKey){
    return function(xmlDoc) {
      var tempList = [];

      $(xmlDoc).find('list_item').each(function(){
        var name = $(this).find('ProviderName').text();
        var headshot = $(this).find('base64').text();

        tempList.push([name, headshot]);
      });

      self.providerInfo[databaseKey] = tempList;

      self.selectAppointments('0');
    }
  }

  self.selectDatabase = function(number, employerBased){
    self.databaseKey = self.databases[number][0];
    self.employerBased = employerBased == '1';

    self.createSelect('employerClient', self.clientList[self.databaseKey]);
    self.renderProviderDropdown(self.databaseKey);

    xmlQuery(xml.create('iSalusExternal.GetAppointmentCreate')(self.databaseKey), self.getCreateInfo(true));
  }

  self.showDatabaseSelect = function(){
    var html = '';
    var template = '<a class="text-weight--bold popup__list-item" href="" onclick="event.preventDefault();appointments.selectDatabase({0}, {2})"><div class="col-12">{1}</div></a>';

    for(var i = 0; i < self.databases.length; i++){
      html += template.format(i, self.databases[i][1], self.databases[i][2]);
    }

    document.getElementById('popupDatabaseList').innerHTML = html;
    document.getElementById('popupDatabase').style.display = 'inherit';
    document.getElementById('cover').style.display = 'inherit';
  }

  self.resetKey = function(){
    if(self.databases.length != 1){
      self.databaseKey = '';
    }
  }

  self.getDatabaseKey = function(xmlDoc) {
    self.databaseKey = '';
    self.databases = [];

    self.saveClientList(xmlDoc);

    $(xmlDoc).find('list_item').each(function(){
      if($(this).find('account_id').text() == account){
        self.databases.push([$(this).find('database_key').text(), $(this).find('client_name').text(), $(this).find('employer_module_active').text()]);
      }
    });

    if(self.databases.length == 1){
      self.databaseKey = self.databases[0][0];
      self.employerBased = self.databases[0][2] == '1';

      self.createSelect('employerClient', self.clientList[self.databaseKey]);

      xmlQuery(xml.create('iSalusExternal.GetAppointmentCreate')(self.databaseKey), self.getCreateInfo(false));
    }

    if(self.databases.length > 0){
      document.getElementById('noPractices').style.display = 'none';
      document.getElementById('appointmentList').style.display = 'inherit';
      document.getElementById('tableHeader').style.display = 'inherit';
      document.getElementById('mainHeader').style.display = 'inherit';

      self.providerInfo = {};
      for(var i = 0; i < self.databases.length; i++){
        xmlQuery(xml.create('iSalusExternal.GetProviders')(self.databases[i][0]), self.getProviderInfo(self.databases[i][0]));
      }
    } else {
      document.getElementById('noPractices').style.display = 'inherit';
      document.getElementById('appointmentList').style.display = 'none';
      document.getElementById('noAppointments').style.display = 'none';
      document.getElementById('tableHeader').style.display = 'none';
      document.getElementById('mainHeader').style.display = 'none';
    }
  }

  self.newAppointment = function(){
    self.filterList = [];

    if(self.databaseKey != ''){
      if(self.employerBased){
        document.getElementById('popup-employer').style.display = 'inherit';
        document.getElementById('cover').style.display = 'inherit';
        document.getElementById('employer-checkbox-mon').checked = true;
        document.getElementById('employer-checkbox-tue').checked = true;
        document.getElementById('employer-checkbox-wed').checked = true;
        document.getElementById('employer-checkbox-thu').checked = true;
        document.getElementById('employer-checkbox-fri').checked = true;
        document.getElementById('employer-checkbox-sat').checked = true;
        document.getElementById('employer-checkbox-sun').checked = true;
        document.getElementById('employerClinicTimes').innerHTML = '';
        $('#bookButton').addClass('btn--disabled');
        self.canBook = false;
        self.times = [];
        self.selectedAppointment = '';
        self.weekOffset = 0;
      } else {
        if(self.databases.length == 1){
          self.renderProviderDropdown(self.databaseKey);
        }
        document.getElementById('popup').style.display = 'inherit';
        document.getElementById('cover').style.display = 'inherit';
        document.getElementById('checkbox-Mon').checked = false;
        document.getElementById('checkbox-Tue').checked = false;
        document.getElementById('checkbox-Wed').checked = false;
        document.getElementById('checkbox-Thu').checked = false;
        document.getElementById('checkbox-Fri').checked = false;
        document.getElementById('checkbox-Sat').checked = false;
        document.getElementById('checkbox-Sun').checked = false;
      }
    } else {
      if(self.databases.length > 1){
        self.showDatabaseSelect();
      }
    }
  }

  self.saveClientList = function(xmlDoc){
    self.clientList = {};

    $(xmlDoc).find('list_item').each(function(){
      var thisKey = $(this).find('database_key').text();

      if(!self.clientList.hasOwnProperty(thisKey)){
        self.clientList[thisKey] = [];
      }

      self.clientList[thisKey].push([$(this).find('account_id').text(), $(this).find('account_name').text()]);
    });
  }

  self.loadData = function(){
    currentScreen = appointments;

    if(typeof(isNeurocore) !== 'undefined'){
      document.getElementById('appointment-category-3').style.display = 'none';
      document.getElementById('employerClientSection').style.display = 'inherit';
      document.getElementById('employerProviderSection').style.display = 'none';
      document.getElementById('employerSundayBox').style.display = 'none';

      $('.checkboxContainer').each(function(){
        $(this).addClass('col-2')
      });
    }

    xmlQuery(xml.create('iSalusWindow.GetList')('preferred_time'), common.renderDropdown('preferredTime', '', true));
    xmlQuery(xml.create('iSalusWindow.GetList')('time_important'), common.renderDropdown('mostImportant', '', true));

    xmlQuery(xml.create('iSalusExternal.Sync')(['Appointments']),
      function(){
        common.getConnection(self.getDatabaseKey);
      }
    );
  }
}


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

function commonFunctions(){
	var self = this;
  self.refreshState = false;

  self.datepickerOptions = {
    showButtonPanel: true,
    changeMonth: true,
    changeYear: true,
    showOtherMonths: true,
    selectOtherMonths: true,
    yearRange: "-100:+0",
    changeMonth: true,
  };

  self.skipModalClosing = false;
  self.firstLoad = true;

  self.specialCharacterMask = {
    translation: {
      'Q': {pattern: /[0-9a-zA-Z ,;:!@.(){}\[\]/?-]/, recursive: true}
    }
  };

  self.cachedConnectionResponse = '';

	self.showField = function(value, kind){
    var values = ['A', 'Y', 'D'];

    for(var i = 0; i < values.length; i++){
      if(value == values[i]){
        document.getElementById(values[i] + kind).style.display = 'inherit';
      }else{
        document.getElementById(values[i] + kind).style.display = 'none';
      }
    }
  }

  self.withZero = function(n) {
    var s = n.toString();
    if(s.length == 1){
      return '0'+s;
    }else{
      return s;
    }
  }

  self.getDateString = function(offset, separator) {
    var offset = offset || 0;
    var separator = separator || '/';
    var date = new Date();
    date.setDate(date.getDate()+offset);
    return self.withZero(date.getMonth()+1) + separator + self.withZero(date.getDate()) + separator + date.getFullYear();
  }

  self.closeModals = function(){
    $('.popup').each(function(){
      $(this).css('display', 'none');
    });

    $('#cover').css('display', 'none');

    $('.field-error').each(function(){
      $(this).html('');
    });

    $('.failure-state').each(function(){
      $(this).html('');
    });

    if(self.refreshState){
      currentScreen.loadData();
      self.refreshState = false;
    }
  }

  self.refresh = function(xmlDoc){
    self.closeModals();
    currentScreen.loadData();
  }
  
  self.renderDropdown = function(listId, def, emptyVal){
    var def = def || null;
    var emptyVal = emptyVal || false;

    return function(xmlDoc){

      var html = '';
      var template = '<option value="{0}"{2}>{1}</option>';

      if(emptyVal){
        html += template.format('','','');
      }

      $(xmlDoc).find('list_item').each(function () {
        if($(this).find('h').text() == '0'){
          html += template.format($(this).find('encode').text(), $(this).find('decode').text(), '');
        }else{
          html += template.format($(this).find('encode').text(), $(this).find('decode').text(), ' disabled');
        }
      });

      document.getElementById(listId).innerHTML = html;

      if(def != null){
        var select = document.getElementById(listId);
        for(var i = 0; i < select.length; i++){
          var option = select.options[i];
          if(def == option.value){
            select.selectedIndex = i;
            break;
          }
        }
      }
    }
  }

  self.seed = 1;
  self.colors = ["#F05452", "#F0396F", "#99C13D", "#2D6270"];
  self.hasRendered = false;

  self.pseudoRandom = function(){
    var x = Math.sin(self.seed++) * 10000;
    return x - Math.floor(x);
  }

  self.updateProfileImage = function(accountInfo){
    if(accountInfo[1] != ''){
      xmlQuery(xml.create('iSalusExternal.GetImage')(accountInfo[1]), self.updateSmallImage(accountInfo[0]));
    } else {
      self.updateSmallPlaceholder(accountInfo[0], (accountInfo[2].charAt(0)+accountInfo[3].charAt(0)).toUpperCase());
    }
  }

  self.updateImage = function(xmlDoc) {
    var imageType = $(xmlDoc).find('image_type').text().toLowerCase();
    var base64encoded = 'data:image/' + imageType + ';base64,' + $(xmlDoc).find('base64').text();
    document.getElementById("patientImgData").setAttribute('src', base64encoded);
    document.getElementById("patientPlaceholder").style.display = "none";
  }

  self.updateSmallImage = function(target){
    return function(xmlDoc) {
      var imageType = $(xmlDoc).find('image_type').text().toLowerCase();
      var base64encoded = 'data:image/' + imageType + ';base64,' + $(xmlDoc).find('base64').text();
      document.getElementById('profileImage-'+target).setAttribute('src', base64encoded);
      document.getElementById("profileImage-"+target).style.display = "inherit";
      document.getElementById('placeholder-'+target).style.display = "none";
    }
  }


  self.createPlaceholder = function(target, initials){
    return function () {
      self.seed = parseInt(target);
      var index = Math.floor(self.pseudoRandom() * self.colors.length);
      document.getElementById("patientPlaceholder").style.backgroundColor = self.colors[index];
      document.getElementById("patientPlaceholder").style.display = "inherit";
      document.getElementById("patientPlaceholder").innerText = initials;
      document.getElementById("patientImgData").setAttribute('src', '');
    }
  }

  self.updateSmallPlaceholder = function(target, initials){
    self.seed = parseInt(target);
    var index = Math.floor(self.pseudoRandom() * self.colors.length);
    document.getElementById("placeholder-"+target).style.backgroundColor = self.colors[index];
    document.getElementById("placeholder-"+target).style.display = "inherit";
    document.getElementById("placeholder-"+target).innerText = initials;
    document.getElementById("profileImage-"+target).setAttribute('src', '');
    document.getElementById("profileImage-"+target).style.display = "none";
  }

  self.showProfile = function(xmlDoc){
    var elem = null;
    var gender = "";

    if (account == "" || account == mainUser.accountId) {
      elem = $(xmlDoc).find("main");
      account = $(elem).find("account_id").text();
      mainUser.accountId = account;
      mainUser.firstName = $(elem).find("first_name").text();
      mainUser.emailAddress = $(elem).find("email_address").text();
      mainUser.lastName = $(elem).find("last_name").text();
      mainUser.imageId = $(elem).find("image_id").text();
      mainUser.stripeInd = $(elem).find("stripe_user_ind").text();
    } else {
      $(xmlDoc).find('list_item').each(function () {
        if ($(this).find('account_id').text() == account) {
          elem = this;
        }
      });
    }

    currentUser.accountId = $(elem).find("account_id").text();
    currentUser.firstName = $(elem).find("first_name").text();
    currentUser.lastName = $(elem).find("last_name").text();
    currentUser.birthDate = $(elem).find("birth_date").text();
    currentUser.genderCode = $(elem).find("gender_code").text();
    currentUser.emailAddress = $(elem).find("email_address").text();
    currentUser.userAlias = $(elem).find("user_alias").text();
    currentUser.imageId = $(elem).find("image_id").text();
    currentUser.stripeInd = $(elem).find("stripe_user_ind").text();

    emailAddress = $(elem).find("email_address").text();

    var patientName = $(elem).find("first_name").text() + " " + $(elem).find("last_name").text();
    var initials = $(elem).find("first_name").text().charAt(0) + $(elem).find("last_name").text().charAt(0);
    document.getElementById("patientName").innerText = patientName;

    if ($(elem).find("gender_code").text() == "M") {
      gender = "Male, ";
    } else if ($(elem).find("gender_code").text() == "F") {
      gender = "Female, ";
    }

    document.getElementById("patientDetails").innerText = gender + $(elem).find("birth_date").text();

    if(!self.hasRendered){
      var profileTemplate = '<div class="user-image" onclick="main.switchUser({0})"><img id="profileImage-{0}" src="./resources/images/icon/icon-patient.svg" height="29" width="29"/><div class="smallPlaceholder" id="placeholder-{0}"></div></div>';
      var profiles = profileTemplate.format(mainUser.accountId);

      var accountImages = [[mainUser.accountId, mainUser.imageId, mainUser.firstName, mainUser.lastName]];

      $(xmlDoc).find('list_item').each(function () {
        var accountId = $(this).find('account_id').text();
        var firstName = $(this).find('first_name').text();
        var lastName = $(this).find('last_name').text();
        accountImages.push([accountId, $(this).find('image_id').text(), firstName, lastName]);
        profiles += profileTemplate.format(accountId);
      });

      document.getElementById('userSwitch').innerHTML = profiles;

      for(var i = 0; i < accountImages.length; i++){
        self.updateProfileImage(accountImages[i]);
      }

      self.hasRendered = true;
    }

    var imageId = $(elem).find("image_id").text();

    if(imageId != ''){
      xmlQuery(xml.create('iSalusExternal.GetImage')(imageId), self.updateImage, self.createPlaceholder(account, initials));
    } else {
      self.createPlaceholder(account, initials)();
    }

    if(!self.skipModalClosing){
      self.closeModals();
    } else {
      self.skipModalClosing = false;
    }
    if(!self.firstLoad){
      currentScreen.loadData();
    } else {
      self.firstLoad = false;
    }
  }

  self.resetButton = function(id){
    var selector = '#'+id;
    $(selector+" > span").html("Save Changes");
    $(selector+' > .save').attr('src',"resources/images/icon/icon-save.svg");
    $(selector).removeClass('dataDone');
    $(selector).removeClass('timedOut');
  }

  self.saveButton = function(id){
    var selector = '#'+id;
    $(selector+" > span").html("Saving...");
    $(selector+" > .save").addClass("saving");
    $(selector).removeClass('dataDone');
    $(selector).removeClass('timedOut');

    setTimeout(function(){
      if($(selector).hasClass('dataDone')){
        $(selector+" > span").html("Changes Saved");
        $(selector+' > .save').removeClass("saving");
        $(selector+' > .save').attr('src',"resources/images/icon/icon-check.svg");
      }
      $(selector).addClass('timedOut');
    }, 2000);
  }

  self.buttonDataUpdated = function(id){
    var selector = '#'+id;
    
    if($(selector).hasClass('timedOut')){
      $(selector+" > span").html("Changes Saved");
      $(selector+' > .save').removeClass("saving");
      $(selector+' > .save').attr('src',"resources/images/icon/icon-check.svg");
    }
    $(selector).addClass('dataDone');
  }

  self.webserviceError = function(id){
    return function(xmlDoc){

      $('.save-button').each(function(){
        $(this).find('.save').first().removeClass('saving');
        $(this).find('span').first().html('Save Changes');
        $(this).removeClass('timedOut');
        $(this).removeClass('dataDone');
      });

      if(typeof($spans) !== 'undefined'){
        $spans.each(function() {
          var $this = $(this);
          $sibling = $this.siblings(".toggleable");
          if($sibling[0].tagName == "INPUT"){
            $sibling.val($this.text());
          }
        });
      }

      var message = $(xmlDoc).find('description').text() || $(xmlDoc).find('message').text();
      document.getElementById(id).innerHTML = message;
    }
  }

  self.validatePhoneField = function(inputId, errorId, errorObj, optional){
    var phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;
    var inputValue = document.getElementById(inputId).value;
    var optional = optional || false;

    if(phoneRegex.test(inputValue) || (optional && inputValue == '')){
      document.getElementById(errorId).innerHTML = '';
      return inputValue;
    } else {
      document.getElementById(errorId).innerHTML = 'Not a valid phone number.';
      errorObj.error = true;
      return '';
    }
  }

  self.validateDateField = function(inputId, errorId, errorObj, optional, earliest){
    var dateRegex = /^[0-9]{2}\/[0-9]{2}\/[0-9]{4}$/;
    var inputValue = document.getElementById(inputId).value;
    var optional = optional || false;
    var earliest = earliest || '01/01/1800';

    if(dateRegex.test(inputValue) || (optional && inputValue == '')){
      if(new Date(inputValue) > new Date(earliest)){
        document.getElementById(errorId).innerHTML = '';
        return inputValue;
      } else {
        document.getElementById(errorId).innerHTML = 'Invalid date, earliest possible is '+earliest+'.';
        errorObj.error = true;
        return '';
      }
    } else {
      document.getElementById(errorId).innerHTML = 'Not a valid date.';
      errorObj.error = true;
      return '';
    }
  }

  self.validateEmailField = function(inputId, errorId, errorObj){
    var emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    var inputValue = document.getElementById(inputId).value;

    if(emailRegex.test(inputValue)){
      document.getElementById(errorId).innerHTML = '';
      return inputValue;
    } else {
      document.getElementById(errorId).innerHTML = 'Not a valid email.';
      errorObj.error = true;
      return '';
    }
  }

  self.validateNameField = function(inputId, errorId, errorObj){
    var nameRegex = /^[a-z ,.'-]+$/i;
    var inputValue = document.getElementById(inputId).value;

    if(nameRegex.test(inputValue)){
      document.getElementById(errorId).innerHTML = '';
      return inputValue;
    } else {
      document.getElementById(errorId).innerHTML = 'Not a valid name.';
      errorObj.error = true;
      return '';
    }
  }

  self.validateNotEmpty = function(inputId, errorId, errorObj){
    var inputValue = document.getElementById(inputId).value;

    if(inputValue != ''){
      document.getElementById(errorId).innerHTML = '';
      return inputValue;
    } else {
      document.getElementById(errorId).innerHTML = 'This field cannot be empty.';
      errorObj.error = true;
      return '';
    }
  }

  self.validateMatchingField = function(inputId, errorId, errorObj, comparison, errorString){
    var inputValue = document.getElementById(inputId).value;
    var valid = inputValue == comparison;

    if(valid){
      document.getElementById(errorId).innerHTML = '';
      return inputValue;
    } else {
      document.getElementById(errorId).innerHTML = errorString;
      errorObj.error = true;
      return '';
    }
  }

  self.validateCustomField = function(inputId, errorId, errorObj, validationFunction, errorString){
    var inputValue = document.getElementById(inputId).value;
    var valid = validationFunction(inputValue);

    if(valid){
      document.getElementById(errorId).innerHTML = '';
      return inputValue;
    } else {
      document.getElementById(errorId).innerHTML = errorString;
      errorObj.error = true;
      return '';
    }
  }

  self.abortXmlQueries = function(){
    for(var i = 0; i < xmlRequests.length; i++){
      if(!xmlRequests[i].hasOwnProperty('persist')){
        xmlRequests[i].abort();
        xmlRequests.splice(i);
      }
    }
  }

  self.setTitle = function(title){
    document.getElementById('screenTitle').innerText = title;
  }

  self.selectNavItem = function(id){
    var items = ['navDashboard', 'navAboutMe', 'navMyPractices', 'navMyVitals', 'navMyAccount', 'navMyAppointments'];

    for(var i = 0; i < items.length; i++){
      if(items[i] == id){
        $('#'+items[i]).addClass('highlight');
      } else {
        $('#'+items[i]).removeClass('highlight');
      }
    }
  }

  self.switchScreen = function(screen){
    self.abortXmlQueries();

    self.setTitle(screen.screenTitle);
    self.selectNavItem(screen.associatedNavItem);

    screen.loadData();
  }

  self.clearConnectionCache = function(){
    self.cachedConnectionResponse = '';
  }

  self.cacheConnectionRequest = function(callback){
    return function(xmlDoc){
      self.cachedConnectionResponse = xmlDoc;
      callback(xmlDoc);
    }
  }

  self.getConnection = function(callback){
    if (self.cachedConnectionResponse == ''){
      xmlQuery(xml.create('iSalusExternal.GetConnection'), self.cacheConnectionRequest(callback));
    } else {
      callback(self.cachedConnectionResponse);
    }
  }

  self.filterChar = function(e) {
    if (e.charCode == 60 || e.charCode == 62 || e.charCode == 38) {
      e.preventDefault();
    }
  }
}



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

function connectScreen(){
  var self = this;

  self.screenTitle = "Connect";
  self.associatedNavItem = "navMyPractices";

  self.enabled = false;

  self.connectionDialog = function(){
    if(self.enabled){
      document.getElementById('popup').style.display = 'inherit';
      document.getElementById('cover').style.display = 'inherit';
      document.getElementById('lastName').value = '';
      document.getElementById('birthDate').value = '';
      document.getElementById('registrationCode').value = '';
    }
  }

  self.showList = function(xmlDoc){
    var html = '';
    var template = '<div class="table-row"><p>{0} <span class="icon-bg--delete fr" onclick="connect.confirmDisconnect(\'{1}\', \'{2}\', \'{0}\');"></span></p></div>';

    $(xmlDoc).find('list_item').each(function () {
      if($(this).find('account_id').text() == account){
        html += template.format($(this).find('client_name').text(), $(this).find('database_key').text(), $(this).find('account_name').text());
      }
    });

    if (html === '') {
      $('#noPractices').show();
      $('#practiceContainer').hide();
    } else {
      $('#noPractices').hide();
      $('#practiceContainer').show();
    }

    document.getElementById('connectedPracticeList').innerHTML = html;
  }

  self.confirmDisconnect = function(databaseKey, name, practiceName){
    var template = "Are you sure you want to disconnect {0} from {1}?";

    document.getElementById('disconnectConfirmation').innerHTML = template.format(name, practiceName);
    document.getElementById('disconnectDatabaseKey').value = databaseKey;

    document.getElementById('cover').style.display = 'inherit';
    document.getElementById('popup-confirmation').style.display = 'inherit';
  }

  self.connectionSuccess = function(){
    common.clearConnectionCache();
    common.refresh();
  }

  self.disconnect = function(){
    var databaseKey = document.getElementById('disconnectDatabaseKey').value;

    xmlQuery(xml.create('iSalusExternal.Disconnect')(databaseKey), self.connectionSuccess);
  }

  self.connectionError = function(xmlDoc){
    document.getElementById('registrationFailure').innerHTML = $(xmlDoc).find('description').text();
  }

  self.connect = function(){
    var lastName = $('#registrationLastName').val();
    var birthDate = $('#registrationDob').val();
    var ssn = $('#registrationSsn').val();
    var zip = $('#registrationZip').val();
    var phone = $('#registrationPhone').val();
    var registrationCode = self.getAccessCode();

    xmlQuery(xml.create('iSalusExternal.Connect')(lastName, birthDate, ssn, zip, phone, registrationCode), self.connectionSuccess, common.webserviceError('registrationFailure'));
  }

  self.hashConnect = function(){
    var lastName = document.getElementById('hashLastName').value;
    var birthDate = document.getElementById('hashBirthDate').value;
    var ssn = '';
    var h = document.getElementById('hash').value;
    var accountId = document.getElementById('hashAccount').value;
    var xml2 = new XmlCreator(key);
    xml2.setAccount(accountId);
    // var userEmailAddress = document.getElementById('userEmailAddress').value;

    xmlQuery(xml2.create('iSalusExternal.Connect')('', lastName, birthDate, ssn, undefined, h, currentUser.emailAddress), self.connectionSuccess, common.webserviceError('hashFailure'));
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

  self.updateFamilyMemberDropdown = function(xmlDoc){
    var main = $(xmlDoc).find('main');
    var familyMembers = [[$(main).find('account_id').text(), $(main).find('first_name').text()]];

    $(xmlDoc).find('list_item').each(function(){
      familyMembers.push([$(this).find('account_id').text(), $(this).find('first_name').text()]);
    });

    self.createSelect('hashAccount', familyMembers);
  }

  self.getFamilyMembers = function(){
    xmlQuery(xml.create('iSalusExternal.GetAccount'), self.updateFamilyMemberDropdown);
  }

  self.openAccessCodeModal = function () {
    $('#accessCode').show();
    $('#cover').show();
  }

  self.getAccessCode = function () {
    return $('#code0').val() + ' ' + $('#code1').val() + ' ' + $('#code2').val();
  }

  self.fetchConnectionFields = function () {
    var accessCode = self.getAccessCode();

    $('#codeEntryFailure').html('');

    xmlQuery(xml.create('iSalusExternal.GetRegistration')(accessCode), function (xmlDoc) {
      var practiceTitle = $(xmlDoc).find('practice_title').text();
      var practicePhone = $(xmlDoc).find('practice_phone').text();
      var practiceLogo = $(xmlDoc).find('practice_logo').text();

      xmlQuery(xml.create('iSalusSecurity.ConnectionSetup')(accessCode), function (xmlDoc) {
        console.log(xmlDoc);

        var toggleInput = function (id, xmlDoc, tagName) {
          if ($(xmlDoc).find(tagName).text() === 'Y') {
            return $('#' + id).show();
          }
          return $('#' + id).hide();
        }

        $('#practiceLogo').attr('src', 'data:img/png;base64,'+practiceLogo);
        $('#practiceTitle').text(practiceTitle);

        toggleInput('registrationZipGroup', xmlDoc, 'zip_ind');
        toggleInput('registrationSsnGroup', xmlDoc, 'ssn_ind');
        toggleInput('registrationPhoneGroup', xmlDoc, 'phone_ind');

        common.closeModals();
        $('#verifyConnectionInfo input').val('');
        $('#verifyConnectionInfo').show();
        $('#cover').show();
      }, common.webserviceError('codeEntryFailure'));
    }, common.webserviceError('codeEntryFailure'));
  }

  self.loadData = function(){
    currentScreen = connect;

    common.getConnection(self.showList);

    self.getFamilyMembers();
  }
}

function contactScreen(){
  var self = this;

  self.screenTitle = "Contact";
  self.associatedNavItem = "navAboutMe";

  self.updateContact = function(xmlDoc) {
    document.getElementById('address').value = $(xmlDoc).find('address').text();
    document.getElementById('zip').value = $(xmlDoc).find('zip').text();
    document.getElementById('home').value = $(xmlDoc).find('home').text();
    document.getElementById('cell').value = $(xmlDoc).find('cell').text();
    document.getElementById('work').value = $(xmlDoc).find('work').text();

    $spans.each(function() {
      var $this = $(this);
      $this.text($this.siblings("input").val());
    });
  }

  self.resetFields = function(xmlDoc){
    $inputs.each(function() {
      var $this = $(this);
      $this.hide().siblings("span").text($this.val()).show();
    });

    common.buttonDataUpdated('saveContactButton');

    self.loadData();
  }

  self.saveContact = function(){

    var errorFlag = {'error': false};

    var address = document.getElementById('address').value;
    var zip = document.getElementById('zip').value;
    var home = common.validatePhoneField('home', 'homeError', errorFlag, true);
    var cell = common.validatePhoneField('cell', 'cellError', errorFlag, true);
    var work = common.validatePhoneField('work', 'workError', errorFlag, true);

    if(!errorFlag.error){
      common.saveButton('saveContactButton');
      xmlQuery(xml.create('iSalusExternal.SaveContact')(address, zip, home, cell, work), self.resetFields);
    }
  }

  self.loadData = function(){
    currentScreen = contact;
    xmlQuery(xml.create('iSalusExternal.GetContact'), self.updateContact);
  }
}

function demographicsScreen(){
  var self = this;

  self.screenTitle = "Demographics";
  self.associatedNavItem = "navAboutMe";

  self.updateDemographics = function(xmlDoc) {
    document.getElementById('firstName').value = $(xmlDoc).find('first_name').text();
    document.getElementById('lastName').value = $(xmlDoc).find('last_name').text();
    document.getElementById('birthDate').value = $(xmlDoc).find('birth_date').text();
    $('#genderCode').val([$(xmlDoc).find('gender_code').text()]);
    document.getElementById('maritalCode').value = $(xmlDoc).find('marital_code').text();
    document.getElementById('bloodTypeCode').value = $(xmlDoc).find('blood_type_code').text();
    document.getElementById('ethnicityCode').value = $(xmlDoc).find('ethnicity_code').text();
    document.getElementById('eyeColorCode').value = $(xmlDoc).find('eye_color_code').text();
    document.getElementById('hairColorCode').value = $(xmlDoc).find('hair_color_code').text();
    document.getElementById('birthmarksScars').value = $(xmlDoc).find('birthmarks_scars').text();
    document.getElementById('specialConditions').value = $(xmlDoc).find('special_conditions').text();

    $spans.each(function() {
      var $this = $(this);
      $sibling = $this.siblings(".toggleable");
      if($sibling[0].tagName == "INPUT"){
        $this.text($sibling.val());
      }else{
        $this.text($sibling.find(":selected").text());
      }
    });
  }

  self.resetFields = function(xmlDoc){
    $inputs.each(function() {
      var $this = $(this);
      $this.hide().siblings("span").show();
    });

    common.buttonDataUpdated('saveDemographicsButton');

    common.hasRendered = false;
    xmlQuery(xml.create('iSalusExternal.GetAccount'), common.showProfile, logOut);
  }

  self.saveDemographics = function(){

    var errorFlag = {'error': false};

    var firstName = common.validateNameField('firstName', 'firstNameError', errorFlag);
    var lastName = common.validateNameField('lastName', 'lastNameError', errorFlag);
    var birthDate = common.validateDateField('birthDate', 'birthDateError', errorFlag, false, '01/01/1900');
    var genderCode = document.getElementById('genderCode').value;
    var ssn = '';
    var maritalCode = document.getElementById('maritalCode').value;
    var bloodTypeCode = document.getElementById('bloodTypeCode').value;
    var ethnicityCode = document.getElementById('ethnicityCode').value;
    var eyeColorCode = document.getElementById('eyeColorCode').value;
    var hairColorCode = document.getElementById('hairColorCode').value;
    var birthmarksScars = document.getElementById('birthmarksScars').value;
    var specialConditions = document.getElementById('specialConditions').value;

    if(!errorFlag.error){
      common.saveButton('saveDemographicsButton');
      xmlQuery(xml.create('iSalusExternal.SaveDemographics')(firstName, lastName, birthDate, genderCode, ssn, maritalCode, bloodTypeCode, ethnicityCode, eyeColorCode, hairColorCode, birthmarksScars, specialConditions), self.resetFields);
    }
  }

  self.loadData = function(){
    currentScreen = demographics;
    xmlQuery(xml.create('iSalusExternal.GetDemographics'), self.updateDemographics);
  }
}

function documentsScreen(){
  var self = this;

  self.screenTitle = "Documents";
  self.associatedNavItem = "navAboutMe";

  var mode = 0; //0 = update, 1 = create

  self.updateDocuments = function(xmlDoc) {
    var html = "";
    var template = '<div class="table-row flex flex-align--center"><div class="col-2"><h4 class="table-data-point"><a class="text-color--primary text-weight--bold" href="{5}" target="_blank">{0}</a></h4></div>' +
      '<div class="col-2"><h4 class="table-data-point">{1}</h4></div><div class="col-3"><h4 class="table-data-point">{2}</h4></div><div class="col-3">' +
      '<h4 class="table-data-point">{3}</h4></div><div class="col-2"><div class="icon-bg--view fr"></div><div class="icon-bg--edit fr" onclick="documents.editDocument(\'{4}\')"></div>' +
      '<div class="icon-bg--delete fr" onclick="documents.deleteConfirmation(\'{4}\')"></div></div></div>';

    $(xmlDoc).find('type_item').each(function () {
      var docType = $(this).find('document_type_desc').text();
      var docCode = $(this).find('document_type_code').text();
      $(this).find('list_item').each(function () {
        var id = $(this).find('patient_image_id').text();
        var timestamp = new Date().getTime();
        var url = './datapages/MMLDocumentGet.asp?gv='+key+'&ii=PD.'+mainUser.accountId+'.'+id+'.'+docCode+'&ts'+timestamp;
        html += template.format($(this).find('image_name').text(), docType, $(this).find('document_name').text(), $(this).find('document_date_long').text(), id, url);
      });
    });

    if(html == ''){
      document.getElementById('noDocuments').style.display = 'inherit';
      document.getElementById('tableHeader').style.display = 'none';
    } else {
      document.getElementById('noDocuments').style.display = 'none';
      document.getElementById('tableHeader').style.display = 'inherit';
    }
    document.getElementById('document-table').innerHTML = html;
  }

  self.showDocument = function(xmlDoc){
    self.mode = 0;
    document.getElementById('fileUploadSection').style.display = 'none';
    document.getElementById('popup').style.display = 'inherit';
    document.getElementById('cover').style.display = 'inherit';
    document.getElementById('imageName').value = $(xmlDoc).find('image_name').text();
    document.getElementById('documentDate').value = $(xmlDoc).find('document_date').text();
    document.getElementById('imageDescription').value = $(xmlDoc).find('image_description').text();
    document.getElementById('documentTypeCode').value = $(xmlDoc).find('document_type_code').text();
    document.getElementById('patientImageId').value = $(xmlDoc).find('patient_image_id').text();
    document.getElementById('imageId').value = $(xmlDoc).find('image_id').text();
  }

  self.newDocument = function(){
    self.mode = 1;
    document.getElementById('fileUploadSection').style.display = 'inherit';
    document.getElementById('popup').style.display = 'inherit';
    document.getElementById('cover').style.display = 'inherit';
    document.getElementById('imageName').value = '';
    document.getElementById('documentDate').value = common.getDateString();
    document.getElementById('imageDescription').value = '';
    document.getElementById('documentTypeCode').selectedIndex = 0;
    document.getElementById('patientImageId').value = '';
    document.getElementById('imageId').value = '';
  }

  self.removeFromDatabase = function(xmlDoc){
    var documentDate = $(xmlDoc).find('document_date').text();
    var documentTypeCode = $(xmlDoc).find('document_type_code').text();
    var patientImageId = $(xmlDoc).find('patient_image_id').text();
    var imageId = $(xmlDoc).find('image_id').text();

    xmlQuery(xml.create('iSalusExternal.SaveDocument')(patientImageId, documentTypeCode, imageId, '', '', documentDate, 'Y'), common.refresh);
  }

  self.deleteDocument = function(){
    var id = document.getElementById('deletePatientImageId').value;
    xmlQuery(xml.create('iSalusExternal.GetDocument')(id), self.removeFromDatabase);
  }

  self.deleteConfirmation = function(id){
    document.getElementById('deletePatientImageId').value = id;
    document.getElementById('popup-confirmation').style.display = 'inherit';
    document.getElementById('cover').style.display = 'inherit';
  }

  self.getDocumentName = function(elem){
    document.getElementById('imageName').value = elem.files[0].name;
  }

  self.saveDocument = function(){
    if(self.mode == 0){
      var imageId = document.getElementById('imageId').value;
      var patientImageId = document.getElementById('patientImageId').value;
      var documentTypeCode = document.getElementById('documentTypeCode').value;
      var imageName = document.getElementById('imageName').value;
      var documentDate = document.getElementById('documentDate').value;
      var imageDescription = document.getElementById('imageDescription').value;
      xmlQuery(xml.create('iSalusExternal.SaveDocument')(patientImageId, documentTypeCode, imageId, imageName, imageDescription, documentDate, 'N'), common.refresh);
    }else{
      var file = document.getElementById('fileUpload').files[0];
      self.getBase64(file);
    }
  }

  self.documentUpload = function(dataUrl){
    var imageId = document.getElementById('imageId').value;
    var patientImageId = document.getElementById('patientImageId').value;
    var documentTypeCode = document.getElementById('documentTypeCode').value;
    var imageName = document.getElementById('imageName').value;
    var documentDate = document.getElementById('documentDate').value;
    var imageDescription = document.getElementById('imageDescription').value;
    var fileName = document.getElementById('fileUpload').files[0].name;
    var split = dataUrl.split(',');
    var base64 = split[1];
    var imageType = split[0].split('/')[1].split(';')[0];
    xmlQuery(xml.create('iSalusExternal.UploadDocument')(patientImageId, documentTypeCode, imageId, imageName, imageDescription, fileName, imageType, base64, documentDate, 'N'), common.refresh);
  }

  self.editDocument = function(id){
    xmlQuery(xml.create('iSalusExternal.GetDocument')(id), self.showDocument);
  }

  self.getBase64 = function(file) {
     var reader = new FileReader();
     reader.readAsDataURL(file);
     reader.onload = function () {
       self.documentUpload(reader.result);
     };
     reader.onerror = function (error) {
       console.log('Error: ', error);
     };
  }

  self.loadData = function(){
    currentScreen = documents;
    xmlQuery(xml.create('iSalusExternal.GetDocumentList'), self.updateDocuments);
  }
}

function emergencyScreen(){
  var self = this;

  self.screenTitle = "Emergency Contact";
  self.associatedNavItem = "navAboutMe";

  self.updateEmergency = function(xmlDoc) {
    var primary = $(xmlDoc).find('primary');
    var secondary = $(xmlDoc).find('secondary');

    document.getElementById('primaryName').value = $(primary).find('name').text();
    document.getElementById('primaryRelationshipCode').value = $(primary).find('relationship_code').text();
    document.getElementById('primaryHome').value = $(primary).find('home').text();
    document.getElementById('primaryCell').value = $(primary).find('cell').text();
    document.getElementById('primaryWork').value = $(primary).find('work').text();
    document.getElementById('secondaryName').value = $(secondary).find('name').text();
    document.getElementById('secondaryRelationshipCode').value = $(secondary).find('relationship_code').text();
    document.getElementById('secondaryHome').value = $(secondary).find('home').text();
    document.getElementById('secondaryCell').value = $(secondary).find('cell').text();
    document.getElementById('secondaryWork').value = $(secondary).find('work').text();

    $spans.each(function() {
      var $this = $(this);
      $sibling = $this.siblings(".toggleable");
      if($sibling[0].tagName == "INPUT"){
        $this.text($sibling.val());
      }else{
        $this.text($sibling.find(":selected").text());
      }
    });
  }

  self.resetFields = function(xmlDoc){
    $inputs.each(function() {
      var $this = $(this);
      $this.hide().siblings("span").show();
    });

    common.buttonDataUpdated('saveEmergencyButton');

    self.loadData();
  }

  self.saveEmergency = function(){

    var errorFlag = {'error': false};

    var primaryName = document.getElementById('primaryName').value;
    var primaryRelationshipCode = document.getElementById('primaryRelationshipCode').value;
    var primaryHome = common.validatePhoneField('primaryHome', 'primaryHomeError', errorFlag, true);
    var primaryCell = common.validatePhoneField('primaryCell', 'primaryCellError', errorFlag, true);
    var primaryWork = common.validatePhoneField('primaryWork', 'primaryWorkError', errorFlag, true);
    var secondaryName = document.getElementById('secondaryName').value;
    var secondaryRelationshipCode = document.getElementById('secondaryRelationshipCode').value;
    var secondaryHome = common.validatePhoneField('secondaryHome', 'secondaryHomeError', errorFlag, true);
    var secondaryCell = common.validatePhoneField('secondaryCell', 'secondaryCellError', errorFlag, true);
    var secondaryWork = common.validatePhoneField('secondaryWork', 'secondaryWorkError', errorFlag, true);

    if(!errorFlag.error){
      common.saveButton('saveEmergencyButton');
      xmlQuery(xml.create('iSalusExternal.SaveEmergency')(primaryName, primaryRelationshipCode, primaryHome, primaryCell, primaryWork, secondaryName, secondaryRelationshipCode, secondaryHome, secondaryCell, secondaryWork), self.resetFields);
    }
  }

  self.loadData = function(){
    currentScreen = emergency;

    $('.field-error').each(function(){
      $(this).html('');
    });

    xmlQuery(xml.create('iSalusExternal.GetEmergency'), self.updateEmergency);
  }
}

function employerScreen(){
  var self = this;

  self.screenTitle = "Employer";
  self.associatedNavItem = "navAboutMe";

  self.updateEmployer = function(xmlDoc) {
    document.getElementById('occupation').value = $(xmlDoc).find('occupation').text();
    document.getElementById('employer-name').value = $(xmlDoc).find('employer_name').text();
    document.getElementById('address').value = $(xmlDoc).find('address').text();
    document.getElementById('zip').value = $(xmlDoc).find('zip').text();
    document.getElementById('work').value = $(xmlDoc).find('work').text();
    document.getElementById('fax').value = $(xmlDoc).find('fax').text();

    $spans.each(function() {
      var $this = $(this);
      $this.text($this.siblings("input").val());
    });
  }

  self.resetFields = function(xmlDoc){
    $inputs.each(function() {
      var $this = $(this);
      $this.hide().siblings("span").text($this.val()).show();
    });

    common.buttonDataUpdated('saveEmployerButton');

    self.loadData();
  }

  self.saveEmployer = function(){

    var errorFlag = {'error': false};

    var occupation = document.getElementById('occupation').value;
    var employerName = document.getElementById('employer-name').value;
    var address = document.getElementById('address').value;
    var zip = document.getElementById('zip').value;
    var work = common.validatePhoneField('work', 'workError', errorFlag, true);
    var fax = common.validatePhoneField('fax', 'faxError', errorFlag, true);

    if(!errorFlag.error){
      common.saveButton('saveEmployerButton');
      xmlQuery(xml.create('iSalusExternal.SaveEmployer')(occupation, employerName, address, zip, work, fax), self.resetFields);
    }
  }

  self.loadData = function(){
    currentScreen = employer;
    xmlQuery(xml.create('iSalusExternal.GetEmployer'), self.updateEmployer);
  }
}

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

function headshotScreen(){
  var self = this;

  self.screenTitle = "Upload Headshot";
  self.associatedNavItem = "navAboutMe";

  self.uploadHeadshot = function(){
    $.when($uploadCrop.croppie('result',{
      type: 'base64',
      size: {width: 200, height: 200},
      circle: false
    }))
    .done(
      function(data){
        if(document.getElementById('fileUpload').files.length > 0){
          var fileName = document.getElementById('fileUpload').files[0].name;
        } else {
          var fileName = 'none';
        }
        var base64 = data.substring(22);
        var imageType = 'png';
        xmlQuery(xml.create('iSalusExternal.SaveHeadshot')(fileName, imageType, base64), self.refreshAfterUpload);
      }
    );
  }

  self.refreshAfterUpload = function(xmlDoc){
    common.hasRendered = false;
    common.buttonDataUpdated('saveHeadshotButton');
    xmlQuery(xml.create('iSalusExternal.GetAccount'), common.showProfile);
  }

  self.updateImage = function(xmlDoc) {
    var imageType = $(xmlDoc).find('image_type').text().toLowerCase();
    var base64encoded = 'data:image/' + imageType + ';base64,' + $(xmlDoc).find('base64').text();
    $.when($('#croppieContainer').croppie('bind', {
      url: base64encoded
    })).done(function(){
      $('#croppieContainer').croppie('setZoom', 0);
    });
  }

  self.showImage = function(xmlDoc){
    if(currentUser.imageId != ''){
      xmlQuery(xml.create('iSalusExternal.GetImage')(currentUser.imageId), self.updateImage);
    } else {
      $.when($('#croppieContainer').croppie('bind', {
        url: './resources/images/200.png'
      })).done(function(){
        $('#croppieContainer').croppie('setZoom', 0);
      });
    }
  }

  self.loadData = function(){
    currentScreen = headshot;

    self.showImage();
  }
}

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

function historyScreen(){
  var self = this;

  self.screenTitle = "Family History";
  self.associatedNavItem = "navAboutMe";

  self.updateHistory = function(xmlDoc) {
    var html = "";
    var template = '<div class="table-row flex flex-align--center"><div class="col-2"><h4 class="table-data-point">{0}</h4></div>' +
      '<div class="col-3"><h4 class="table-data-point"><a class="icon-bg--info" href="./info?n={3}&a={4}" target="_blank"></a> {1}</h4></div><div class="col-5"><h4 class="table-data-point">{2}</h4></div>' +
      '<div class="col-2"><div class="icon-bg--edit fr" onclick="familyHistory.editHistory(\'{3}\')"></div>' +
      '<div class="icon-bg--delete fr" onclick="familyHistory.deleteConfirmation(\'{3}\')"></div></div></div></div>';

    $(xmlDoc).find('list_item').each(function () {
      html += template.format($(this).find('relationship_desc').text(), $(this).find('condition_desc').text(), $(this).find('note').text(), $(this).find('history_id').text(), account);
    });

    if(html == ''){
      document.getElementById('noHistory').style.display = 'inherit';
      document.getElementById('tableHeader').style.display = 'none';
    } else {
      document.getElementById('noHistory').style.display = 'none';
      document.getElementById('tableHeader').style.display = 'inherit';
    }
    document.getElementById('history-table').innerHTML = html;
  }

  self.showHistory = function(xmlDoc){
    document.getElementById('popup').style.display = 'inherit';
    document.getElementById('cover').style.display = 'inherit';
    var code = $(xmlDoc).find('relationship_code').text();
    var select = document.getElementById('relationshipCode');
    for(var i = 0; i < select.length; i++){
      var option = select.options[i];
      if(code == option.value){
        select.selectedIndex = i;
        break;
      }
    }
    var id = $(xmlDoc).find('family_history_id').text();
    var select = document.getElementById('conditionDropdown');
    for(var i = 0; i < select.length; i++){
      var option = select.options[i];
      if(id == option.value){
        select.selectedIndex = i;
        break;
      }
    }

    document.getElementById('historyId').value = $(xmlDoc).find('history_id').text();
    document.getElementById('note').value = $(xmlDoc).find('note').text();
  }

  self.newHistory = function(){
    document.getElementById('popup').style.display = 'inherit';
    document.getElementById('cover').style.display = 'inherit';
    document.getElementById('historyId').value = '';
    document.getElementById('note').value = '';
    document.getElementById("relationshipCode").selectedIndex = 0;
    document.getElementById("conditionDropdown").selectedIndex = 0;
  }

  self.removeFromDatabase = function(xmlDoc){
    var historyId = $(xmlDoc).find('history_id').text();
    var relationshipCode = $(xmlDoc).find('relationship_code').text();
    var familyHistoryId = $(xmlDoc).find('family_history_id').text();

    xmlQuery(xml.create('iSalusExternal.SaveFamilyHistory')(historyId, relationshipCode, familyHistoryId, '', 'Y'), common.refresh);
  }

  self.deleteHistory = function(){
    var id = document.getElementById('deleteHistoryId').value;
    xmlQuery(xml.create('iSalusExternal.GetFamilyHistory')(id), self.removeFromDatabase);
  }

  self.deleteConfirmation = function(id){
    document.getElementById('deleteHistoryId').value = id;
    document.getElementById('popup-confirmation').style.display = 'inherit';
    document.getElementById('cover').style.display = 'inherit';
  }

  self.saveHistory = function(){
    var historyId = document.getElementById('historyId').value;
    var relationshipCode = $("#relationshipCode").val();
    var familyHistoryId = $("#conditionDropdown").val();
    var note = document.getElementById('note').value;

    xmlQuery(xml.create('iSalusExternal.SaveFamilyHistory')(historyId, relationshipCode, familyHistoryId, note, 'N'), common.refresh)
  }

  self.editHistory = function(id){
    xmlQuery(xml.create('iSalusExternal.GetFamilyHistory')(id), self.showHistory);
  }

  self.loadData = function(){
    currentScreen = familyHistory;
    xmlQuery(xml.create('iSalusExternal.GetFamilyHistoryList'), self.updateHistory);
    xmlQuery(xml.create('iSalusExternal.GetFamilyHistoryItems'), common.renderDropdown('conditionDropdown'));
  }
}

function lifestyleScreen(){
  var self = this;

  self.screenTitle = "Lifestyle";
  self.associatedNavItem = "navAboutMe";

  self.count = 0;

  self.updateTobacco = function(xmlDoc){
    document.getElementById('noTobaccoInd').value = $(xmlDoc).find('no_tobacco_ind').text();
    document.getElementById('smokeInd').value = $(xmlDoc).find('smoke_ind').text();
    document.getElementById('smokePacksPerDay').value = $(xmlDoc).find('smoke_packs_per_day').text();
    document.getElementById('smokeYears').value = $(xmlDoc).find('smoke_years').text();
    document.getElementById('cigarInd').value = $(xmlDoc).find('cigar_ind').text();
    document.getElementById('cigarPerDay').value = $(xmlDoc).find('cigar_per_day').text();
    document.getElementById('cigarYears').value = $(xmlDoc).find('cigar_years').text();
    document.getElementById('dipInd').value = $(xmlDoc).find('dip_ind').text();
    document.getElementById('dipCanPerDay').value = $(xmlDoc).find('dip_can_per_day').text();
    document.getElementById('dipYears').value = $(xmlDoc).find('dip_years').text();

    self.updateSpans();
  }

  self.updateAlcohol = function(xmlDoc){
    document.getElementById('noAlcoholInd').value = $(xmlDoc).find('no_alcohol_ind').text();
    document.getElementById('drinksPerWeek').value = $(xmlDoc).find('drink_per_week').text();
    document.getElementById('drinkYears').value = $(xmlDoc).find('drink_years').text();

    self.updateSpans();
  }

  self.updateCaffeine = function(xmlDoc){
    document.getElementById('coffeeInd').value = $(xmlDoc).find('coffee_ind').text();
    document.getElementById('coffeeCupsPerDay').value = $(xmlDoc).find('coffee_cups_per_day').text();
    document.getElementById('colaInd').value = $(xmlDoc).find('cola_ind').text();
    document.getElementById('colaCansPerDay').value = $(xmlDoc).find('cola_cans_per_day').text();
    document.getElementById('teaInd').value = $(xmlDoc).find('tea_ind').text();
    document.getElementById('teaCupsPerDay').value = $(xmlDoc).find('tea_cups_per_day').text();

    self.updateSpans();
  }

  self.updateExercise = function(xmlDoc){
    document.getElementById('exercise1').value = $(xmlDoc).find('excercise_1').text();
    document.getElementById('exercise1Times').value = $(xmlDoc).find('excercise_1_times').text();
    document.getElementById('exercise2').value = $(xmlDoc).find('excercise_2').text();
    document.getElementById('exercise2Times').value = $(xmlDoc).find('excercise_2_times').text();
    document.getElementById('exercise3').value = $(xmlDoc).find('excercise_3').text();
    document.getElementById('exercise3Times').value = $(xmlDoc).find('excercise_3_times').text();

    self.updateSpans();
  }

  self.updateDrugs = function(xmlDoc){
    document.getElementById('noDrugsInd').value = $(xmlDoc).find('no_drugs_ind').text();
    document.getElementById('cocaineInd').value = $(xmlDoc).find('cocaine_ind').text();
    document.getElementById('heroinInd').value = $(xmlDoc).find('heroin_ind').text();
    document.getElementById('marijuanaInd').value = $(xmlDoc).find('marijuana_ind').text();
    document.getElementById('steroidInd').value = $(xmlDoc).find('steroid_ind').text();
    document.getElementById('painKillerInd').value = $(xmlDoc).find('pain_killer_ind').text();
    document.getElementById('ecstasyInd').value = $(xmlDoc).find('ectasy_ind').text();
    document.getElementById('otherInd').value = $(xmlDoc).find('other_ind').text();
    document.getElementById('otherDrugs').value = $(xmlDoc).find('other_drugs').text();

    self.updateSpans();
  }

  self.updateSpans = function(){
    $spans.each(function() {
      var $this = $(this);
      $sibling = $this.siblings(".toggleable");
      if($sibling[0].tagName == "INPUT"){
        $this.text($sibling.val());
      }else{
        $this.text($sibling.find(":selected").text());
      }
    });
  }

  self.resetFields = function(xmlDoc){
    $inputs.each(function() {
      var $this = $(this);
      $this.hide().siblings("span").show();
    });

    self.loadData();
  }

  self.waitForReload = function(xmlDoc){
    if(self.count >= 4){
      self.count = 0;
      $inputs.each(function() {
        var $this = $(this);
        $this.hide().siblings("span").text($this.val()).show();
      });

      common.buttonDataUpdated('saveLifestyleButton');

      self.loadData();
    } else {
      self.count += 1;
    }
  }

  self.saveLifestyle = function(){
    var noTobaccoInd = document.getElementById('noTobaccoInd').value;
    var smokeInd = document.getElementById('smokeInd').value;
    var smokePacksPerDay = document.getElementById('smokePacksPerDay').value;
    var smokeYears = document.getElementById('smokeYears').value;
    var cigarInd = document.getElementById('cigarInd').value;
    var cigarPerDay = document.getElementById('cigarPerDay').value;
    var cigarYears = document.getElementById('cigarYears').value;
    var dipInd = document.getElementById('dipInd').value;
    var dipCanPerDay = document.getElementById('dipCanPerDay').value;
    var dipYears = document.getElementById('dipYears').value;

    var noAlcoholInd = document.getElementById('noAlcoholInd').value;
    var alcoholInd = noAlcoholInd == 'Y' ? 'N' : 'Y';
    var drinksPerWeek = document.getElementById('drinksPerWeek').value;
    var drinkYears = document.getElementById('drinkYears').value;

    var coffeeInd = document.getElementById('coffeeInd').value;
    var coffeeCupsPerDay = document.getElementById('coffeeCupsPerDay').value;
    var colaInd = document.getElementById('colaInd').value;
    var colaCansPerDay = document.getElementById('colaCansPerDay').value;
    var teaInd = document.getElementById('teaInd').value;
    var teaCupsPerDay = document.getElementById('teaCupsPerDay').value;

    var exercise1 = document.getElementById('exercise1').value;
    var exercise1Times = document.getElementById('exercise1Times').value;
    var exercise2 = document.getElementById('exercise2').value;
    var exercise2Times = document.getElementById('exercise2Times').value;
    var exercise3 = document.getElementById('exercise3').value;
    var exercise3Times = document.getElementById('exercise3Times').value;

    var noDrugsInd = document.getElementById('noDrugsInd').value;
    var cocaineInd = document.getElementById('cocaineInd').value;
    var heroinInd = document.getElementById('heroinInd').value;
    var marijuanaInd = document.getElementById('marijuanaInd').value;
    var steroidInd = document.getElementById('steroidInd').value;
    var painKillerInd = document.getElementById('painKillerInd').value;
    var ecstasyInd = document.getElementById('ecstasyInd').value;
    var otherInd = document.getElementById('otherInd').value;
    var otherDrugs = document.getElementById('otherDrugs').value;

    common.saveButton('saveLifestyleButton');

    xmlQuery(xml.create('iSalusExternal.SaveLifestyle')('tobacco')(noTobaccoInd, smokeInd, smokePacksPerDay, smokeYears, cigarInd, cigarPerDay, cigarYears, dipInd, dipCanPerDay, dipYears), self.waitForReload);
    xmlQuery(xml.create('iSalusExternal.SaveLifestyle')('alcohol')(noAlcoholInd, alcoholInd, drinksPerWeek, drinkYears), self.waitForReload);
    xmlQuery(xml.create('iSalusExternal.SaveLifestyle')('caffeine')(coffeeInd, coffeeCupsPerDay, colaInd, colaCansPerDay, teaInd, teaCupsPerDay), self.waitForReload);
    xmlQuery(xml.create('iSalusExternal.SaveLifestyle')('excercise')(exercise1, exercise1Times, exercise2, exercise2Times, exercise3, exercise3Times), self.waitForReload);
    xmlQuery(xml.create('iSalusExternal.SaveLifestyle')('recreational drugs')(noDrugsInd, cocaineInd, heroinInd, marijuanaInd, steroidInd, painKillerInd, ecstasyInd, otherInd, otherDrugs), self.waitForReload);
  }

  self.loadData = function(){
    currentScreen = lifestyle;
    xmlQuery(xml.create('iSalusExternal.GetLifestyle')('tobacco'), self.updateTobacco);
    xmlQuery(xml.create('iSalusExternal.GetLifestyle')('alcohol'), self.updateAlcohol);
    xmlQuery(xml.create('iSalusExternal.GetLifestyle')('caffeine'), self.updateCaffeine);
    xmlQuery(xml.create('iSalusExternal.GetLifestyle')('excercise'), self.updateExercise);
    xmlQuery(xml.create('iSalusExternal.GetLifestyle')('recreational drugs'), self.updateDrugs);
  }
}

function mainScreen(){
  var self = this;

  self.screenTitle = "Dashboard";
  self.associatedNavItem = "navDashboard";

  self.showFamily = false;
  self.accountCreateId = '';

  self.databaseKey = '';
  self.databases = [];
  self.totalBalance = 0;

  self.addFamilyMember = function(){

    var errorFlag = {'error': false};

    var firstName = common.validateNameField('firstName', 'firstNameError', errorFlag);
    var lastName = common.validateNameField('lastName', 'lastNameError', errorFlag);
    var birthDate = common.validateDateField('birthDate', 'birthDateError', errorFlag);
    var relationshipCode = $('#relationshipCode').val();

    if($('#familyMemberCreateLogin').prop('checked')){
      if(self.accountCreateId == ''){
        if(!errorFlag.error){

          validateEmail = function (email) {
            var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(email);
          }

          validatePhone = function (phone) {
            var re = /^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;
            return re.test(phone);
          }

          var email = '';
          var phone = '';

          var userId = $('#registrationEmail').val();

          if (validateEmail(userId)) {
            email = userId;
          } else if (validatePhone(userId)) {
            phone = userId;
          } else {
            $("#registrationEmailError").html('You must enter an email address or a phone number.');
            errorFlag.error = true;
          }

          if(!errorFlag.error){
            xmlQuery(xml.create('iSalusExternal.AddFamilyMember')(firstName, lastName, birthDate, relationshipCode), self.createFamilyLogin);
          }
        }
      } else {
        self.createFamilyLogin(false, self.accountCreateId);
      }
    } else {
      if(!errorFlag.error){
        common.hasRendered = false;
        xmlQuery(xml.create('iSalusExternal.AddFamilyMember')(firstName, lastName, birthDate, relationshipCode), self.handleFamilyMember);
      }
    }
  }

  self.handleFamilyMember = function(xmlDoc){
    self.switchUser($(xmlDoc).find('account_id').text());
  }

  self.createFamilyLogin = function(xmlDoc, id){
    var accountId = $(xmlDoc).find('account_id').text() || id;

    self.accountCreateId = accountId;

    if(accountId != ''){
      var xml2 = new XmlCreator(key);

      var email = '';
      var phone = '';

      var userId = $('#registrationEmail').val();

      if (validateEmail(userId)) {
        email = userId;
      } else if (validatePhone(userId)) {
        phone = userId;
      } else {
        $("#registrationEmailError").html('You must enter an email address or a phone number.');
      }

      common.hasRendered = false;
      xmlQuery(xml2.create('iSalusExternal.FamilyMemberCreateLoginEx')(accountId, email, phone, '', ''), securityscreen.loginCreateSuccess, common.webserviceError('familyMemberWebserviceError'));
    }
  }

  self.familyInfoToggle = function(){
    if($('#familyMemberCreateLogin').prop('checked')){
      $('#familyMemberExtraInfo').css('display', 'inherit');
    } else {
      $('#familyMemberExtraInfo').css('display', 'none');
    }
  }

  self.showFamilyModal = function() {
    self.accountCreateId = '';
    $('#popup').css('display', 'inherit');
    $('#cover').css('display', 'inherit');
    $('#firstName').val('');
    $('#lastName').val('');
    $('#birthDate').val('');
    $('#familyMemberCreateLogin').prop('checked', false);
    self.familyInfoToggle();
    document.getElementById('relationshipCode').selectedIndex = 0;
  }

  self.updateData = function(xmlDoc) {
    var listTemplate = '<li class="tile-list-data-point" onclick="main.switchUser({0})">{1} {2}</li>';
    var listString = listTemplate.format(mainUser.accountId, mainUser.firstName, mainUser.lastName);

    $(xmlDoc).find('list_item').each(function () {
      var accountId = $(this).find('account_id').text();
      var firstName = $(this).find('first_name').text();
      var lastName  = $(this).find('last_name').text();
      listString += listTemplate.format(accountId, firstName, lastName);
    });

    $('#familyList').html( listString );
  }

  self.switchUser = function(accountId) {
    account = accountId;
    xml.setAccount(account);
    xmlQuery(xml.create('iSalusExternal.GetAccount'), common.showProfile, logOut);
  }

  self.updateList = function(listId, tagName) {
    return function (xmlDoc) {
      var listString = "";

      $(xmlDoc).find('list_item').each(function () {
        listString += '<li class="tile-list-data-point">' + $(this).find(tagName).text() + '</li>';
      });

      $('#'+listId).html( listString );
    }
  }

  self.updateMedicationsList = function(listId, tagName) {
    return function (xmlDoc) {
      var listString = "";

      $(xmlDoc).find('list_item').each(function () {
        if($(this).find('stopped_ind').text() == 'N'){
          listString += '<li class="tile-list-data-point">' + $(this).find(tagName).text() + '</li>';
        }
      });

      $('#'+listId).html( listString );
    }
  }

  self.getChart = function(xmlDoc) {
    var accountId = $(xmlDoc).find('account_id').first().text();
    if(typeof updateChart === "function" && typeof updateBloodChart === "function"){
      xmlQuery(xml.create('iSalusExternal.GetJournalWeight')(accountId), updateChart);
      xmlQuery(xml.create('iSalusExternal.GetJournalBP')(accountId), updateBloodChart);
    }
  }

  self.updateBalanceDisplay = function(key, name) {
    return function(xmlDoc) {
      if ($(xmlDoc).find('patient_balance').length > 0) {
        var balance = $(xmlDoc).find('patient_balance').first().text();
        self.totalBalance += parseFloat(balance);
      }

      $('#accountBalance').text( '$'+self.totalBalance );
    }
  }

  self.updateBalance = function(xmlDoc) {
    self.totalBalance = 0;
    self.databaseKey = '';
    self.databases = [];

    $(xmlDoc).find('list_item').each(function(){
      if($(this).find('account_id').text() == account){
        var databaseKey = $(this).find('database_key').text();
        var databaseName = $(this).find('client_name').text()

        self.databases.push([databaseKey, databaseName]);
      }
    });

    if(self.databases.length > 0){
      $.each(self.databases, function(index, value){
        xmlQuery(xml.create('iSalusExternal.GetClaimReport')(value[0]), self.updateBalanceDisplay(value[0], value[1]));
      });
    } else {
      $('#accountBalance').text( "No Balance" );
    }

    $('#balanceDate').html( 'as of '+common.getDateString() );
  }

  self.updateBalanceError = function(xmlDoc) {
    $('#accountBalance').text( "No Balance" );

    $('#balanceDate').html( 'as of '+common.getDateString() );
  }

  self.updateMessages = function(xmlDoc) {
    var changed = false;

    $(xmlDoc).find('list_item').each(function(){
      if($(this).find('account_id').text() == account){
        changed = true;

        var count = $(this).find('count').text();
        $('#messageCount').text( count );

        if(count == 1){
          $('#newMessages').text( 'New Message' );
        }else{
          $('#newMessages').text( 'New Messages' );
        }
      }
    });

    if(!changed){
      $('#messageCount').text( '0' );
      $('#newMessages').text( 'New Messages' );
    }

    $('#messageDate').html( 'as of '+common.getDateString() );
  }

  self.getDatabaseKey = function(xmlDoc) {
    if ($(xmlDoc).find('list_item').length > 0) {
      var databaseKey = $(xmlDoc).find('database_key').first().text();
      xmlQuery(xml.create('iSalusExternal.GetClaimReport')(databaseKey), self.updateBalance, self.updateBalanceError);
    } else {
      self.updateBalanceError();
    }
  }

  self.updateMyChart = function(xmlDoc) {
    var unread = 0;
    var newest = '';

    $(xmlDoc).find('list_item').each(function () {
      if (newest == '') {
        newest = $(this).find('post_date_time').text();
      }
      if ($(this).find('read_ind').text() == 'N') {
        unread += 1;
      }
    });

    $('#myChartUnread').text( unread );

    if(unread == 1){
      $('#newItems').text( 'New Item' );
    }else{
      $('#newItems').text( 'New Items' );
    }

    if (newest == ''){
      $('#chartText').text( 'as of' );
      $('#chartDate').text( common.getDateString() );
    } else {
      $('#chartText').html( 'newest: ' );
      $('#chartDate').text( newest );
    }
  }

  self.updateAppointments = function(xmlDoc) {
    if ($(xmlDoc).find('list_item').length > 0) {
      var elem = $(xmlDoc).find('list_item').first();
      $('#appointmentPractice').text( $(elem).find('location').text() );
      $('#appointmentTime').text( $(elem).find('start_time').text() );
      $('#appointmentDate').text( $(elem).find('long_date').text() );
      $('#appointmentDateTime').css( 'visibility', 'inherit' );
    } else {
      $('#appointmentPractice').text( 'No Scheduled Appointments' );
      $('#appointmentDateTime').css ( 'visibility', 'hidden' );
    }
  }

  self.finishSync = function(xmlDoc){
    xmlQuery(xml.create('iSalusExternal.GetMessagesCounts'), self.updateMessages);
    xmlQuery(xml.create('iSalusExternal.MyChartList')(''), self.updateMyChart);
    xmlQuery(xml.create('iSalusExternal.GetAppointments')('0'), self.updateAppointments);
  }

  self.loadData = function() {
    currentScreen = main;
    xmlQuery(xml.create('iSalusExternal.GetAccount'), self.updateData, logOut);
    xmlQuery(xml.create('iSalusExternal.Sync')(['Messages', 'Appointments', 'ClinicalSummary', 'PatientEducation', 'CCMCarePlan', 'Vitals', 'Medications', 'Goals', 'PatientBalance', 'LabResults']), self.finishSync);
    xmlQuery(xml.create('iSalusExternal.GetAllergyList'), self.updateList('allergyList', 'allergy_desc'));
    xmlQuery(xml.create('iSalusExternal.GetConditionList'), self.updateList('conditionList', 'condition_desc'));
    xmlQuery(xml.create('iSalusExternal.GetMedicationList'), self.updateMedicationsList('medicationList', 'med_name'));
    xmlQuery(xml.create('iSalusExternal.GetJournal'), self.getChart);
    common.getConnection(self.updateBalance);

    if(self.showFamily){
      self.showFamilyModal();
      self.showFamily = false;
    }
  }
}

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

function messagesScreen(){
  var self = this;

  self.screenTitle = "Messages";
  self.associatedNavItem = "navAboutMe";

  self.databaseKey = '';
  self.data = [];
  self.providerInfo = [];
  self.unread = 0;
  self.databases = [];

  self.updateMessages = function(xmlDoc) {
    var html = '';
    var template_old = '<p>{0}, {1}, {2}, {3}, {4}, {5}, {6}, {7}, {8}, {9}, {10}, {11}</p>';
    var template = '<a href="#" onclick="event.preventDefault();messages.selectMessage(\'{5}\')"><div id="message-{5}" class="bxshdw message message-read--{4}">'+
    '<div class="clearfix"><p class="text-size--small message-location fl">{0}</p><p class="text-size--small message-date fr">{1}</p></div><p class="text-weight--bold message-topic">{2}</p>'+
    '<p class="message-preview text-size--small">{3}</p></div></a>';
    self.data = [];

    var xmlString = new XMLSerializer().serializeToString(xmlDoc.documentElement);
    xmlString = xmlString.replace(/\{CR\}/g, "\n");
    xmlDoc = $.parseXML(xmlString);

    $(xmlDoc).find('list_item').each(function(){
      var mmlMessageId = $(this).find('mml_message_id').text();
      var accountId = $(this).find('account_id').text();
      var readInd = $(this).find('read_ind').text();
      var accountName = $(this).find('account_name').text();
      var requestedDate = $(this).find('requested_date').text();
      var status = $(this).find('status').text();
      var location = $(this).find('location').text();
      var message = $(this).find('message').text();
      var responseDate = $(this).find('response_date').text();
      var responseMessage = $(this).find('response_message').text();
      var messageTypeId = $(this).find('message_type_id').text();
      var messageTypeDesc = $(this).find('message_type_desc').text();
      var providerId = $(this).find('provider_id').text();
      var database = $(this).find('database_key').text();

      var summary = message;
      if(summary != ''){
        summary += '<br/>'
      }
      summary += responseMessage;

      self.data.push([mmlMessageId, accountId, readInd, accountName, requestedDate, status, location, message, responseDate, responseMessage, messageTypeId, messageTypeDesc, providerId, database]);
      html += template.format(location, responseDate == '' ? requestedDate : responseDate, messageTypeDesc, summary, readInd, mmlMessageId);
    });

    if(html == ''){
      document.getElementById('messageList').innerHTML = '<div class="no-messages">No messages to view.</div>';
    } else {
      document.getElementById('messageList').innerHTML = html;
    }
  }

  self.selectMessage = function(which){
    var dataBox = document.getElementById('messageData');
    var template = 'Message:<br/><p>{0}</p>Response:<br/><p>{1}</p>';
    var header = '<div class="clearfix"><h5 class="mt--none text--medium-grey fl">{0}</h5>'+
      '<p class="text-size--small text-color--medium-grey fr">Date Requested: {1}</p></div><h3 class="mt--none text-weight--bold text-color--primary">{2}</h3><br/><br/>';
    var response = '<div class="clearfix"><p class="text-weight--bold fl">{0}</p><p class="text-size--small text-color--medium-grey fr">'+
      'Received: {1}</p></div><p>{2}</p><div class="clearfix"></div><br/><br/>';
    var message = '<div class="clearfix"><p class="text-weight--bold fl">Me</p><p class="text-size--small text-color--medium-grey fr">Sent: {0}</p></div><p>{1}</p><br/><br/>';
    var replyButton = '<a href="#" class="btn--primary btn--icon mt--20" onclick="event.preventDefault();messages.reply(\'{0}\');">Reply</a>';

    var heading = /(.*)\((\d\d\/\d\d\/\d\d\d\d.*\d?\d:\d\d..)\)/;
    var formatted = '';

    for(var i = 0; i < self.data.length; i++){
      $('#message-'+self.data[i][0]).removeClass('message-selected');

      if(self.data[i][0] == which){
        dataBox.innerHTML = header.format(self.data[i][6], self.data[i][4], self.data[i][11]);
        
        if(self.data[i][9] != ''){
          dataBox.innerHTML += response.format(self.data[i][6], self.data[i][8], self.data[i][9]);
        }

        if(self.data[i][11] != 'Message from Practice'){
          formatted = self.data[i][7];
          while(formatted.match(heading)){
            formatted = formatted.replace(heading, "<div class='message-quote'>$1 - $2");
            formatted += "</div>";
          }
          formatted = formatted.replace(/\n/g, "<br/>");

          dataBox.innerHTML += message.format(self.data[i][4], formatted);
        }

        dataBox.innerHTML += replyButton.format(self.data[i][0]);

        $('#message-'+self.data[i][0]).addClass('message-selected');

        if(self.data[i][2] == 'N'){
          $('#message-'+self.data[i][0]).removeClass('message-read--N');
          xmlQuery(xml.create('iSalusExternal.SaveMessageRead')(which), function(){});
          self.unread -= 1;
          self.updateInboxCount();
        }
      }
    }
  }

  self.selectCategory = function(kind){
    var kinds = ['S', 'R'];

    for(var i = 0; i < 2; i++){
      if(kinds[i] == kind){
        $('#message-category-'+kinds[i]).addClass('tab--active');
        $('#message-category-'+kinds[i]).removeClass('tab--inactive');
      } else {
        $('#message-category-'+kinds[i]).addClass('tab--inactive');
        $('#message-category-'+kinds[i]).removeClass('tab--active');
      }
    }
    xmlQuery(xml.create('iSalusExternal.GetMessages')(kind, '2'), self.updateMessages);
  }

  self.resetCursor = function(txtElement) { 
    if (txtElement.setSelectionRange) { 
      txtElement.focus(); 
      txtElement.setSelectionRange(0, 0); 
    } else if (txtElement.createTextRange) { 
      var range = txtElement.createTextRange();  
      range.moveStart('character', 0); 
      range.select(); 
    }
    txtElement.scrollTop = 0;
  }

  self.reply = function(which){
    for(var i = 0; i < self.data.length; i++){

      if(self.data[i][0] == which){
        document.getElementById('popupReply').style.display = 'inherit';
        document.getElementById('cover').style.display = 'inherit';

        var formatted = self.data[i][7];
        if(formatted != ''){
          formatted = '\n\n\n' + self.data[i][11] + ' (' + self.data[i][4] + ')\n' + formatted;
        }

        if(self.data[i][9] != ''){
          formatted = '\n\n\nResponse (' + self.data[i][8] + ')\n' + self.data[i][9] + formatted;
        }

        document.getElementById('replyContentType').value = self.data[i][10];
        document.getElementById('replyQuoted').value = formatted;
        document.getElementById('replyProvider').value = self.data[i][12];
        document.getElementById('replyDatabase').value = self.data[i][13];

        self.resetCursor(document.getElementById('replyContent'));

        break;
      }
    }
  }

  self.newMessage = function(){
    if(self.databaseKey != ''){
      document.getElementById('popup').style.display = 'inherit';
      document.getElementById('cover').style.display = 'inherit';

      document.getElementById('contentTypeId').value = '1';
      document.getElementById('content').value = '';
      document.getElementById('phone').value = '';
      document.getElementById('other').value = '';
    } else {
      self.showDatabaseSelect();
    }
  }

  self.showPracticeMessage = function(xmlDoc){
    self.resetKey();
    common.closeModals();

    var messageResponse = $(xmlDoc).find('message_response').text() || 'Your message has been received.';

    document.getElementById('popupPracticeMessage').style.display = 'inherit';
    document.getElementById('cover').style.display = 'inherit';

    document.getElementById('practiceMessageContent').innerHTML = messageResponse;
  }

  self.sendMessage = function(){
    var contentTypeId = document.getElementById('contentTypeId').value;
    var content = document.getElementById('content').value;
    var phone = document.getElementById('phone').value;
    var other = document.getElementById('other').value;
    var providerId = document.getElementById('providerId').value;

    xmlQuery(xml.create('iSalusExternal.SendMessage')(contentTypeId, content, phone, other, self.databaseKey, providerId), self.showPracticeMessage);
  }

  self.sendReply = function(){
    var contentTypeId = document.getElementById('replyContentType').value;
    var content = document.getElementById('replyContent').value + document.getElementById('replyQuoted').value;
    var providerId = document.getElementById('replyProvider').value;
    var database = document.getElementById('replyDatabase').value;

    xmlQuery(xml.create('iSalusExternal.SendMessage')(contentTypeId, content, '', '', database, providerId), common.refresh);
  }

  self.updateInboxCount = function(){
    if(self.unread > 0){
      document.getElementById('inboxCount').innerText = self.unread;
    } else {
      document.getElementById('inboxCount').innerText = '';
    }
  }

  self.updateUnreadCount = function(xmlDoc){
    self.unread = parseInt($(xmlDoc).find('count').first().text());
    self.updateInboxCount();
  }

  self.renderProviderDropdown = function(){
    var html = '';
    var template = '<option value="{0}">{1}</option>';

    for(var i = 0; i < self.providerInfo.length; i++) {
        html += template.format(self.providerInfo[i][1], self.providerInfo[i][0]);
    }

    var elem = document.getElementById('providerId');
    elem.innerHTML = html;
    elem.selectedIndex = 0;
  }

  self.getProviderInfo = function(openModal) {
    return function(xmlDoc){
      self.providerInfo = [];

      $(xmlDoc).find('list_item').each(function(){
        var name = $(this).find('ProviderName').text();
        var id = $(this).find('ProviderId').text();

        self.providerInfo.push([name, id]);
      });

      self.renderProviderDropdown();

      if(openModal){
        common.closeModals();
        self.newMessage();
      }
    }
  }

  self.selectDatabase = function(number){
    self.databaseKey = self.databases[number][0];

    xmlQuery(xml.create('iSalusExternal.GetProviders')(self.databaseKey), self.getProviderInfo(true));
  }

  self.showDatabaseSelect = function(){
    var html = '';
    var template = '<a class="text-weight--bold popup__list-item" href="" onclick="event.preventDefault();messages.selectDatabase({0})"><div class="col-12">{1}</div></a>';

    for(var i = 0; i < self.databases.length; i++){
      html += template.format(i, self.databases[i][1]);
    }

    document.getElementById('popupDatabaseList').innerHTML = html;
    document.getElementById('popupDatabase').style.display = 'inherit';
    document.getElementById('cover').style.display = 'inherit';
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

      xmlQuery(xml.create('iSalusExternal.GetProviders')(self.databaseKey), self.getProviderInfo(false));
    }

    if(self.databases.length > 0){
      document.getElementById('noPractices').style.display = 'none';
      document.getElementById('messagesContainer').style.display = 'inherit';
    } else {
      document.getElementById('noPractices').style.display = 'inherit';
      document.getElementById('messagesContainer').style.display = 'none';
    }
  }

  self.loadData = function(){
    currentScreen = messages;

    document.getElementById('messageData').innerHTML = '<h2 class="mt--none mb--none text--bold text--primary">No Message Selected</h2><hr class="light-grey"><p>Select a message from the list to view it.</p>';

    self.selectCategory('R');
    xmlQuery(xml.create('iSalusExternal.GetMessagesCounts'), self.updateUnreadCount);
    common.getConnection(self.getDatabaseKey);
  }
}

function passwordScreen(){
  var self = this;

  self.screenTitle = "Password";
  self.associatedNavItem = "navMyAccount";

  self.passwordReset = function(){
    var oldPassword = document.getElementById('oldPassword').value;
    var password1 = document.getElementById('password1').value;
    var password2 = document.getElementById('password2').value;

    common.saveButton('savePasswordButton');

    xmlQuery(xml.create('iSalusExternal.PasswordReset')(oldPassword, password1, password2), self.dataUpdated, common.webserviceError('passwordWebserviceError'));
  }

  self.dataUpdated = function(xmlDoc){
    common.buttonDataUpdated('savePasswordButton');
    self.loadData();
  }

  self.loadData = function(){
    document.getElementById('oldPassword').value = '';
    document.getElementById('password1').value = '';
    document.getElementById('password2').value = '';
    
    currentScreen = passwordReset;

    if(account != mainUser.accountId && currentUser.emailAddress == mainUser.emailAddress){
      document.getElementById('noAccount').style.display = 'inherit';
      document.getElementById('mainContainer').style.display = 'none';
    } else {
      document.getElementById('noAccount').style.display = 'none';
      document.getElementById('mainContainer').style.display = 'inherit';
    }
  }
}

function securityScreen(){
  var self = this;

  self.screenTitle = "Account Security";
  self.associatedNavItem = "navMyAccount";

  self.newAccount = '';
  self.resetId = '';

  self.accountPopup = function(){
    document.getElementById('cover').style.display = 'inherit';
    document.getElementById('popup').style.display = 'inherit';
  }

  self.loginCreateSuccess2 = function(xmlDoc){
    common.closeModals();

    document.getElementById('cover').style.display = 'inherit';
    document.getElementById('accountCreationFinish2').style.display = 'inherit';
  }

  self.loginCreateSuccess = function(xmlDoc){
    common.closeModals();

    self.newAccount = $(xmlDoc).find('account_id').text();
    self.resetId = $(xmlDoc).find('reset_id').text();

    document.getElementById('cover').style.display = 'inherit';
    document.getElementById('accountCreationFinish').style.display = 'inherit';
  }

  self.finishCreateLogin = function(){

    var errorFlag = {'error': false};

    var registerPassword = common.validateNotEmpty('securityPassword', 'securityPasswordError', errorFlag);
    var registerPassword2 = common.validateMatchingField('retypePassword', 'retypePasswordError', errorFlag, registerPassword, "Does not match the above.");
    var token = common.validateNotEmpty('registrationToken', 'registrationTokenError', errorFlag);

    if(!errorFlag.error){
      xmlQuery(xml.create('iSalusExternal.FamilyMemberCreateLoginExContinued')(self.newAccount, self.resetId, token, registerPassword2), self.loginCreateSuccess2);
    }
  }

  self.createLogin = function(){

    var errorFlag = {'error': false};

    validateEmail = function (email) {
      var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(email);
    }

    validatePhone = function (phone) {
      var re = /^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;
      return re.test(phone);
    }

    var email = '';
    var phone = '';

    var userId = $('#registrationEmail').val();

    if (validateEmail(userId)) {
      email = userId;
    } else if (validatePhone(userId)) {
      phone = userId;
    } else {
      $("#registrationEmailError").html('You must enter an email address or a phone number.');
      return false;
    }

    var registerQuestion = '';
    var registerAnswer = '';

    if(!errorFlag.error){
      xmlQuery(xml.create('iSalusExternal.FamilyMemberCreateLoginEx')(account, email, phone, registerQuestion, registerAnswer), self.loginCreateSuccess, common.webserviceError('familyMemberCreateError'));
    }
  }

  self.updateSecurity = function(xmlDoc) {
    var emailAddress = $(xmlDoc).find('email_address').text();
    var phoneNumber = $(xmlDoc).find('phone').text();

    if(account != mainUser.accountId && emailAddress == mainUser.emailAddress){
      document.getElementById('noAccount').style.display = 'inherit';
      document.getElementById('mainContainer').style.display = 'none';
    } else {
      document.getElementById('noAccount').style.display = 'none';
      document.getElementById('mainContainer').style.display = 'inherit';
    }

    document.getElementById('password').value = '';
    document.getElementById('userAlias').value = $(xmlDoc).find('user_alias').text();
    document.getElementById('emailAddress').value = emailAddress;
    document.getElementById('phoneNumber').value = phoneNumber;

    $spans.each(function() {
      var $this = $(this);
      $sibling = $this.siblings(".toggleable");
      if($sibling[0].tagName == "INPUT"){
        $this.text($sibling.val());
      }else{
        $this.text($sibling.find(":selected").text());
      }
    });
  }

  self.saveSecurity = function(){

    var errorFlag = {'error': false};

    var password = document.getElementById('password').value;
    var userAlias = common.validateNotEmpty('userAlias', 'userAliasError', errorFlag);
    var emailAddress = common.validateNotEmpty('emailAddress', 'emailAddressError', errorFlag);
    var phone = common.validateNotEmpty('phoneNumber', 'phoneNumberError', errorFlag);
    var securityQuestion = '';
    var securityAnswer = '';

    if(!errorFlag.error){
      $inputs.each(function() {
        var $this = $(this);
        $this.hide().siblings("span").show();
      });

      common.saveButton('saveSecurityButton');
      document.getElementById('securityWebserviceError').innerHTML = '';
      xmlQuery(xml.create('iSalusExternal.SaveSecurity')(password, userAlias, emailAddress, securityQuestion, securityAnswer, phone), self.dataUpdated, common.webserviceError('securityWebserviceError'));
    }
  }

  self.dataUpdated = function(xmlDoc){
    common.buttonDataUpdated('saveSecurityButton');
    document.getElementById('securityWebserviceError').innerHTML = '';
    self.loadData();
  }

  self.loadData = function(){
    currentScreen = securityscreen;
    xmlQuery(xml.create('iSalusExternal.GetSecurity'), self.updateSecurity);
  }
}

function securityLogScreen(){
  var self = this;

  self.screenTitle = "Security Log";
  self.associatedNavItem = "navMyAccount";

  self.updateList = function(xmlDoc) {
    var html = '';
    var template = '<div class="table-row flex flex-align--center"><div class="col-2"><h4 class="table-data-point">{0}</h4></div><div class="col-1"><h4 class="table-data-point">{1}</h4>'+
      '</div><div class="col-2"><h4 class="table-data-point">{2}</h4></div><div class="col-4"><h4 class="table-data-point">{3}</h4></div><div class="col-3"><h4 class="table-data-point">{4}</h4></div></div>';

    $(xmlDoc).find('list_item').each(function(){
      var date = $(this).find('log_date').text();
      var name = $(this).find('user_name').text();
      var action = $(this).find('action').text();
      var section = $(this).find('section').text();
      var owner = $(this).find('owner_name').text();

      html += template.format(name, action, section, owner, date);
    });

    if(html == ''){
      document.getElementById('noSecurityLog').style.display = 'inherit';
      document.getElementById('tableHeader').style.display = 'none';
    } else {
      document.getElementById('noSecurityLog').style.display = 'none';
      document.getElementById('tableHeader').style.display = 'inherit';
    }

    document.getElementById('securityLogList').innerHTML = html;
  }

  self.loadData = function(){
    currentScreen = securityLog;
    xmlQuery(xml.create('iSalusExternal.GetSecurityLogList')('0'), self.updateList);
  }
}

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


function testScreen(){
  var self = this;

  self.screenTitle = "Test";
  self.associatedNavItem = "navAboutMe";

  self.updateAllergies = function(xmlDoc) {
    var html = '';

    var template = '<li style="margin-bottom: 10px; border-bottom: 1px solid #f7f7f7;">{0} / <span style="color: #2D6270;">{1}</span><p>{2}</p></li>';

    $(xmlDoc).find('list_item').each(function() {
      html += template.format(
        //Fetch the Allergy Description
        $(this).find('allergy_id').text(),
        $(this).find('allergy_desc').text(), 
        $(this).find('allergy_type_desc').text(), 
        $(this).find('reaction_treatment').text()
      )
    });

    $('#allergyList').html(html);
  }

  self.loadData = function(){
    currentScreen = testscreen;

    xmlQuery(xml.create('iSalusExternal.GetAllergyList'), self.updateAllergies);
  }
}

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