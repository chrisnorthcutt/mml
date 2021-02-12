
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