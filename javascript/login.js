var currentStep = 0;
var xml = new XmlCreator('');
var screens = ['loginMain', 'loginPassword', 'loginPractice', 'loginRegister', 'loginRegister2', 'connectionSuccess', 'passwordResetSuccess', 'tokenEntry', 'passwordOutOfPolicy'];
var guid = '';
var system = system || '';
var recaptchaOn = false;

function nextStep() {
  if (currentStep == 0) {
    getSecurity();
  } else if (currentStep == 1) {
    attemptReset();
  }
}

function showReset(xmlDoc) {
  var error = $(xmlDoc).find('error').text();

  if (error != '') {
    document.getElementById('passwordResetError').innerHTML = error;
  } else {
    document.getElementById('passwordResetError').innerHTML = '';
    showScreen('passwordResetSuccess');
  }
}

function showError(id) {
  return function (xmlDoc) {
    console.log(xmlDoc);
    var message = $(xmlDoc).find('error').text();
    document.getElementById(id).innerHTML = message;
  }
}

function attemptReset() {
  var userId = document.getElementById("user-email").value;
  var token = document.getElementById("user-answer").value;
  var password = document.getElementById("createPasswordField").value;
  var confirmPassword = document.getElementById("confirmPasswordField").value;

  var email = '';
  var phone = '';

  if (validateEmail(userId)) {
    email = userId;
  } else if (validatePhone(userId)) {
    phone = userId;
  }

  if (password == confirmPassword) {
    document.getElementById('tokenEntryError').innerHTML = '';
    var query = xml.custom('iSalusSecurity.LoginSetup')("<action>reset_password_with_token</action><email>" + email + "</email><phone>" + phone + "</phone><reset_id>" + guid + "</reset_id><reset_token>" + token + "</reset_token><reset_password>" + password + "</reset_password>" + system);

    xmlQuery(query, showReset, showError('tokenEntryError'));
  } else {
    document.getElementById('tokenEntryError').innerHTML = 'The passwords do not match.';
  }
}

function showSecurity(xmlDoc) {
  guid = $(xmlDoc).find('reset_id').text();

  showScreen('tokenEntry');
  document.getElementById("user-email").disabled = true;

  currentStep = 1;
}

function registrationResponse(xmlDoc) {
  if ($(xmlDoc).find('error_message').length > 0) {
    document.getElementById('registrationError').innerHTML = $(xmlDoc).find('error_message').text();
  } else {
    document.getElementById('registrationError').innerHTML = '';
    showScreen('loginRegister2');
  }
}

function sendRegistration() {
  var firstName = $('#registerFirstName').val();
  var lastName = $('#registerLastName').val();
  var registerDob = $('#registerBirthDate').val();
  var registerEmail1 = $('#registerEmail').val();
  var registerEmail2 = $('#registerConfirmEmail').val();

  var xmlString = '';
  xmlString += '<register_first_name>' + firstName + '</register_first_name>';
  xmlString += '<register_last_name>' + lastName + '</register_last_name>';
  xmlString += '<register_dob>' + registerDob + '</register_dob>';
  xmlString += '<register_email1>' + registerEmail1 + '</register_email1>';
  xmlString += '<register_email2>' + registerEmail2 + '</register_email2>';

  var query = xml.custom('iSalusSecurity.LoginSetup')("<action>register_token</action><register>" + xmlString + "</register>" + system);

  xmlQuery(query, registrationResponse);
}

function loginAfterRegister(xmlDoc) {
  var authString = document.getElementById("registerEmail").value + '~' + document.getElementById("registerPassword").value + '~mml';
  var query = new XmlCreator(authString).create('iSalusSecurity.GetKey');

  xmlQuery(query, pageRedirect, loginError);
  console.log(xmlDoc);
}

function webserviceError(id) {
  return function (xmlDoc) {
    // var message = $(xmlDoc).find('description').text() || $(xmlDoc).find('message').text();
    document.getElementById(id).innerHTML = 'We couldn\'t create your account. Ensure the token matches the one sent to your email.';
  }
}

function createAccount() {
  var firstName = $('#registerFirstName').val();
  var lastName = $('#registerLastName').val();
  var registerDob = $('#registerBirthDate').val();
  var registerEmail1 = $('#registerEmail').val();
  var registerEmail2 = $('#registerConfirmEmail').val();
  var registerToken = $('#registerToken').val();
  var registerQuestion = $('#registerSecurityQuestion').val();
  var registerAnswer = $('#registerSecurityAnswer').val();
  var registerPassword1 = $('#registerPassword').val();
  var registerPassword2 = $('#registerConfirmPassword').val();

  var xmlString = '';
  xmlString += '<register_first_name>' + firstName + '</register_first_name>';
  xmlString += '<register_last_name>' + lastName + '</register_last_name>';
  xmlString += '<register_dob>' + registerDob + '</register_dob>';
  xmlString += '<register_email1>' + registerEmail1 + '</register_email1>';
  xmlString += '<register_email2>' + registerEmail2 + '</register_email2>';
  xmlString += '<register_token>' + registerToken + '</register_token>';
  xmlString += '<register_question>' + registerQuestion + '</register_question>';
  xmlString += '<register_answer>' + registerAnswer + '</register_answer>';
  xmlString += '<register_password1>' + registerPassword1 + '</register_password1>';
  xmlString += '<register_password2>' + registerPassword2 + '</register_password2>';

  var query = xml.custom('iSalusSecurity.LoginSetup')("<action>register</action><register>" + xmlString + "</register>" + system);

  xmlQuery(query, loginAfterRegister, webserviceError('registration2Error'));
}

function finishRegistration() {
  var correct = true;
  if ($('#registerPassword').val() == $('#registerConfirmPassword').val()) {
    $('#registerPasswordNotMatched').css('display', 'none');
  }
  if ($('#registerPassword').val() == '') {
    $('#registerPasswordInvalid').css('display', 'inherit');
    correct = false;
  } else {
    $('#registerPasswordInvalid').css('display', 'none');

    if ($('#registerPassword').val() != $('#registerConfirmPassword').val()) {
      $('#registerPasswordNotMatched').css('display', 'inherit');
      $('#registerConfirmPassword').val('');
      $('#registerPassword').val('');
      correct = false;
    }
  }
  if ($('#registerToken').val() == '') {
    $('#registerTokenInvalid').css('display', 'inherit');
    correct = false;
  } else {
    $('#registerTokenInvalid').css('display', 'none');
  }
  if ($('#registerSecurityQuestion').val() == '') {
    $('#registerSecurityQuestionInvalid').css('display', 'inherit');
    correct = false;
  } else {
    $('#registerSecurityQuestionInvalid').css('display', 'none');
  }
  if ($('#registerSecurityAnswer').val() == '') {
    $('#registerSecurityAnswerInvalid').css('display', 'inherit');
    correct = false;
  } else {
    $('#registerSecurityAnswerInvalid').css('display', 'none');
  }
  if (correct) {
    createAccount();
  }
}

function getSecurity() {
  var userId = document.getElementById("user-email").value;

  var email = '';
  var phone = '';
  var recaptcha = '';

  if (validateEmail(userId)) {
    email = userId;
  } else if (validatePhone(userId)) {
    phone = userId;
  } else {
    $("#passwordResetError").html('You must enter an email address or a phone number.');
  }

  if (recaptchaOn) {
    var response = document.getElementById("g-recaptcha-response").value;
    recaptcha = '<g_recaptcha_response>' + response + '</g_recaptcha_response>';
  }

  var query = xml.custom('iSalusSecurity.LoginSetup')("<action>reset_password_send_token</action><email>" + email + "</email><phone>" + phone + "</phone>" + recaptcha + system);

  xmlQuery(query, showSecurity, webserviceError('passwordResetError'));
}

function showScreen(name) {
  if (name == 'loginMain') {
    currentStep = 0;
    document.getElementById("user-email").value = '';
    document.getElementById("user-answer").value = '';
    document.getElementById("createPasswordField").value = '';
    document.getElementById("confirmPasswordField").value = '';
    document.getElementById("user-email").disabled = false;
    document.getElementById("passwordResetError").innerHTML = '';
  }

  for (var i = 0; i < screens.length; i++) {
    if (screens[i] == name) {
      document.getElementById(screens[i]).className = "page visible";
    } else {
      document.getElementById(screens[i]).className = "page";
    }
  }
}

function loginError() {
  document.getElementById("badLogin").style.display = "block";
}

function updatePassword() {
  xmlQuery((new XmlCreator(readCookie('isalus_key')))
      .create('iSalusExternal.PasswordReset')
        ($('#password').val(), $('#newPasswordField').val(), $('#confirmNewPasswordField').val()),
    function (xmlDoc) {
      performRedirect();
    },
    showError('passwordPolicyError')
  );
}

function performRedirect() {
  if ($_GET['h']) {
    window.location.href = "./#!/?h=" + $_GET['h'];
  } else {
    if (typeof (redirectDestination) === 'string')
      window.location.href = redirectDestination;
    else {
      window.location.href = "./";
    }
  }
}

function pageRedirect(xmlDoc) {
  createCookie("isalus_key", $(xmlDoc).find('key').text(), 1);

  if ($(xmlDoc).find('password_reset_ind').text() === 'Y') {
    showScreen('passwordOutOfPolicy');
  } else {
    performRedirect();
  }
}

function attemptLogin() {
  var authString = document.getElementById("user-id").value + '~' + document.getElementById("password").value + '~mml';
  var query = new XmlCreator(authString).create('iSalusSecurity.GetKey');

  xmlQuery(query, pageRedirect, loginError);
}

function keypress(e, field) {
  if (e.keyCode == 13) {
    if (field == 'pass') {
      attemptLogin();
    } else if (field == 'email') {
      getSecurity();
    } else if (field == 'question') {
      attemptReset();
    }
  }
}

function registerAccount() {
  var correct = true;
  if ($('#registerEmail').val() == $('#registerConfirmEmail').val()) {
    $('#registerEmailNotMatched').css('display', 'none');
  } else {
    $('#registerEmailNotMatched').css('display', 'inherit');
    $('#registerConfirmEmail').val('');
    correct = false;
  }
  if (validateEmail($('#registerEmail').val())) {
    $('#registerEmailInvalid').css('display', 'none');
  } else {
    $('#registerEmailInvalid').css('display', 'inherit');
    correct = false;
  }
  if ($('#registerFirstName').val() == '') {
    $('#registerFirstNameInvalid').css('display', 'inherit');
    correct = false;
  } else {
    $('#registerFirstNameInvalid').css('display', 'none');
  }
  if ($('#registerLastName').val() == '') {
    $('#registerLastNameInvalid').css('display', 'inherit');
    correct = false;
  } else {
    $('#registerLastNameInvalid').css('display', 'none');
  }
  if (correct) {
    sendRegistration();
  }
}

function saveAccount() {
  var correct = true;
  if ($('#practice-password').val() == $('#practice-confirm').val()) {
    $('#practice-passwords-unmatched').css('display', 'none');
  } else {
    $('#practice-passwords-unmatched').css('display', 'inherit');
    $('#practice-password').val('');
    $('#practice-confirm').val('');
    $('#saveAccount').attr('disabled', 'disabled');
    correct = false;
  }
  if (validateEmail($('#practice-email').val())) {
    $('#practice-email-invalid').css('display', 'none');
  } else {
    $('#practice-email-invalid').css('display', 'inherit');
    correct = false;
  }
  if ($('#temp-pass').val() != 'password1') {
    correct = false;
  }
  if (correct) {
    showScreen('connectionSuccess');
  }
}

$('#practiceForm input').keyup(function () {
  var empty = false;
  $('#practiceForm input').each(function () {
    if ($(this).val() == '') {
      empty = true;
    }
  });

  if (empty) {
    $('#saveAccount').attr('disabled', 'disabled'); // updated according to http://stackoverflow.com/questions/7637790/how-to-remove-disabled-attribute-with-jquery-ie
  } else {
    $('#saveAccount').removeAttr('disabled'); // updated according to http://stackoverflow.com/questions/7637790/how-to-remove-disabled-attribute-with-jquery-ie
  }
});

$("#registerBirthDate").datepicker();
$("#registerBirthDate").datepicker('option', {
  showButtonPanel: true,
  changeMonth: true,
  changeYear: true,
  showOtherMonths: true,
  selectOtherMonths: true,
  yearRange: "-100:+0",
  changeMonth: true,
}).mask('00/00/0000');

if ($_GET['connect']) {
  showScreen('loginPractice');
}

if ($_GET['u']) {
  document.getElementById('user-id').value = $_GET['u'];
}

xmlQuery(xml.create('iSalusSecurity.LoginStartup'), function (xmlDoc) {
  recaptchaOn = xmlTagValue(xmlDoc, 'recaptcha_ind') === 'Y';
  $('#recaptchaContainer').show();
});

xmlQuery(xml.create('iSalusSecurity.PasswordPolicy'), function (xmlDoc) {
  var state  = passwordPolicy.initializePasswordPolicy(xmlDoc);
  var state2 = passwordPolicy.initializePasswordPolicy(xmlDoc, {
    policyListContainer: 'newPasswordPolicies',
    createPasswordField: 'newPasswordField',
    confirmPasswordField: 'confirmNewPasswordField',
    passwordMatches: 'confirm-new-password-matches'
  });
});

//Show Ad for Mobile

function close_app_ad() {
  $("#divLoginTitle").css("display", "inherit");
  $("#divHeader").css("display", "inherit");
  // $("#divFooter").css("display", "inherit");
  $("#divLogin").css("display", "inherit");
  $("#imgSecure").css("display", "inherit");
  $("#divSecure").css("display", "inherit");
  $("#divContact").css("display", "inherit");
  $("#imgGetiPhoneApp").css("display", "inline-block");
  $("#imgGetAndroidApp").css("display", "inline-block");
  $("#mobileWarning").css("display", "inherit");
  $("#imgAppStore").remove();
  $("#appAdCloseButton").css("display", "none");
}

m_browser_info = i_browser_get_info();

if ($_GET['forgot']) {
  showScreen('loginPassword');
} else if (m_browser_info.device == "iphone" || m_browser_info.device == "android") {
  $('body').css('overflow', 'hidden').css('height', '100%').css('width', '100%');
  $("#imgGetiPhoneApp").css("display", m_browser_info.device == "iphone" ? "inherit" : "none");
  $("#imgGetAndroidApp").css("display", m_browser_info.device == "iphone" ? "none" : "inherit");

  $("#imgAppStore").addClass((m_browser_info.device == "iphone" || m_browser_info.device == "ipad") ?
    "iphone-ad" :
    "android-ad");

  $('#imgAppStore').bind("click", "", function () {
    mml_launch_app();
  });
  $('#appAdCloseButton').bind("click", "", close_app_ad);
}

$('#imgGetiPhoneApp').bind("click", "", function () {
  mml_launch_app();
});
$('#imgGetAndroidApp').bind("click", "", function () {
  mml_launch_app();
});

function mml_launch_app() {
  deeplink.setup({
    delay: 3000,
    iOS: {
      appName: "mymedicallocker",
      appId: "1203372091"
    },
    android: {
      appId: "com.isalus.mymedicallocker"
    }
  });
  var h = $_GET['h'];
  var operating_system = getMobileOperatingSystem();
  try {
    if (operating_system == "iOS"){
      deeplink.open("mymedicallocker://Login/" + h);
    } else if (operating_system == "Android"){
      deeplink.open('https://login.mymedicallocker.com/' + h);
    }
      
  } catch (e) {
    alert(e);
  }
}

function getMobileOperatingSystem() {
  var userAgent = navigator.userAgent || navigator.vendor || window.opera;

  // Windows Phone must come first because its UA also contains "Android"
  if (/windows phone/i.test(userAgent)) {
    return "Windows Phone";
  }

  if (/android/i.test(userAgent)) {
    return "Android";
  }

  // iOS detection from: http://stackoverflow.com/a/9039885/177710
  if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
    return "iOS";
  }

  return "unknown";
}

// Open the app on either iOS or Android if user has it installed

// deeplink.setup({
//   delay: 3000,
//   iOS: {
//     appName: "mymedicallocker",
//     appId: "1203372091",
//   },
//   android: {
//     appId: "com.isalus.mymedicallocker"
//   }
// });

// function window_onload() {
//   var operating_system = getMobileOperatingSystem();
//   try {
//     if (operating_system == "iOS")
//       deeplink.open("mymedicallocker://Login/" + h);
//     else if (operating_system == "Android")
//       deeplink.open('https://login.mymedicallocker.com/' + h);
//   } catch (e) {
//     alert(e);
//   }
// }

