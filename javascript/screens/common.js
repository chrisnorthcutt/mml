
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

