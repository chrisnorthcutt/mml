
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
      return true;
    } else if (operating_system == "Android"){
      deeplink.open('https://login.mymedicallocker.com/' + h);
      return true;
    }
    
    return false;
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

function Flow (name, flow) {
  if (flow === undefined || typeof flow !== 'object') {
    throw new Error('Could not create flow from `'+flow+'`');
  }

  this.currentPosition = 0;
  this.flow = flow;

  this.getName = function () {
    return name;
  }

  this.next = function () {
    if (this.currentPosition < this.flow.length - 1) {
      this.currentPosition += 1;
    }

    return this.current();
  }

  this.current = function () {
    return this.flow[this.currentPosition];
  }

  this.prev = function () {
    if (this.currentPosition > 0) {
      this.currentPosition -= 1;
    }

    return this.current();
  }
}

var flows = {
  createAccount : new Flow('createAccount', ['setupAccount', 'confirmationSent']),
  checkForKey : new Flow('checkForKey', ['hasKey']),
  hasKey : new Flow('hasKey', ['hasKey', 'accessCode', 'practiceConnect', 'createPassword']),
  noKey : new Flow('noKey', ['hasKey', 'demographicInfo', 'createPassword']),
  expiredLink : new Flow('expiredLink', ['expiredLink', 'confirmationSent'])
};

function all (array) {
  for (var i = 0; i < array.length; i++) {
    if (!array[i]) {
      return false;
    }
  }

  return true;
}

function map (array, f) {
  var result = [];

  for (var i = 0; i < array.length; i++) {
    result.push(f(array[i]));
  }

  return result;
}

function showScreen (id) {
  $('.app-screen').hide();

  var selected = $('#'+id);
  if (selected.length > 0) {
    return selected.show();
  }

  throw new Error('Could not find element with id `'+id+'`.');
}

function AsyncTask (task) {
  var self = this;

  this.ready = false;
  this.value = undefined;
  this.callback = undefined;

  this.finish = function (value) {
    self.ready = true;

    if (typeof self.callback === 'undefined') {
      self.value = value;
    } else {
      self.callback(value);
    }
  }

  task(this);
}

function _await (obj, callback) {
  if (obj.ready) {
    callback(obj.value);
  } else {
    obj.callback = callback;
  }

  return obj;
}

function normalizeDate (string) {
  return moment(string).format('L');
}

window.onload = function () {
  var xmlCreator = new XmlCreator('');
  xmlCreator.setSystem(system);
  var keyCode = $_GET['k'] ? $_GET['k'] : '';
  var setupProcess = $_GET['p'] ? $_GET['p'] : '';
  var flowTask = null;
  var captchaTask = null;
  var flow = null;

  var validateNotEmpty = function (id, errorMessage) {
    var value = $('#'+id).val();
    $('#'+id+'Error').html(value === '' ? errorMessage : '');
    return value;
  };

  var getConnectionKey = function () {
    return map(['code0', 'code1', 'code2'], function (x) {
      return $('#'+x).val();
    }).join(' ');
  };

  $('#loginMethodField').on('change paste keyup', function () {
    $('#createAccountError').html('');
  });

  var handleAccountCreate = function (userField, errorField) {
    var userId = $(userField).val();
    var email = '';
    var phone = '';

    if (validateEmail(userId)) {
      email = userId;
    } else if (validatePhone(userId)) {
      phone = userId;
    } else {
      $(errorField).html('You must enter an email address or a phone number.');
      return false;
    }

    var recaptchaResponse = document.getElementById("g-recaptcha-response").value;

    xmlQuery(xmlCreator.create('iSalusSecurity.CreateAccount')(email, phone, recaptchaResponse), function (xmlDoc) {
      $('#connectionMethod').html(userId);
      showScreen(flow.next());
    }, function (errorXmlDoc) {
      $(errorField).html($(errorXmlDoc).find('message').text());
    });
  }

  $('#createAccountButton').on('click', function (event) {
    event.preventDefault();
    handleAccountCreate('#loginMethodField', '#createAccountError');
  });

  $('#returnToLoginButton').on('click', function (event) {
    event.preventDefault();
    window.location.href = './login.html';
  });

  $('#resendActivationLink').on('click', function (event) {
    event.preventDefault();
    handleAccountCreate('#resendActivationId', '#resendActivationLinkError');
  });

  flowTask = new AsyncTask (function (task) {
    flow = flows.hasOwnProperty(setupProcess) ? flows[setupProcess] : flows.createAccount;
    task.finish(flow);
  });

  captchaTask = new AsyncTask (function (task) {
    xmlQuery(xmlCreator.create('iSalusSecurity.LoginStartup'), function (xmlDoc) {
      task.finish(xmlTagValue(xmlDoc, 'recaptcha_ind') === 'Y');
    });
  });

  if (keyCode !== '') {
    flowTask = new AsyncTask (function (task) {
      xmlQuery(xmlCreator.create('iSalusSecurity.GetRegistration')(keyCode), function (xmlDoc) {
        $('#registerUserId').val(xmlTagValue(xmlDoc, 'email') || xmlTagValue(xmlDoc, 'phone'));
        flow = flows.checkForKey;
        task.finish(flow);
      }, function (errorXmlDoc) {
        flow = flows.expiredLink;
        task.finish(flow);
      });
    });
  }

  $('#hasKeyNo').on('click', function (event) {
    event.preventDefault();
    flow = flows.noKey;
    showScreen(flow.next());
  });

  $('#hasKeyYes').on('click', function (event) {
    event.preventDefault();
    flow = flows.hasKey;
    showScreen(flow.next());
  });

  $('#accessCodeBack').on('click', function (event) {
    event.preventDefault();
    showScreen(flow.prev());
  });

  $('#accessCodeNext').on('click', function (event) {
    event.preventDefault();

    var connectionKey = getConnectionKey();

    $('#accessCodeEntryError').html('');

    xmlQuery(xmlCreator.create('iSalusSecurity.ConnectionSetup')(connectionKey), function (connectXmlDoc) {
      xmlQuery(xmlCreator.create('iSalusSecurity.GetRegistration')(keyCode, connectionKey), function (xmlDoc) {

        $('#connectionMethodAfter').text(xmlTagValue(xmlDoc, 'email') || xmlTagValue(xmlDoc, 'phone'));
        $('#practiceLogo').attr('src', 'data:img/png;base64,'+xmlTagValue(xmlDoc, 'practice_logo'));
        $('#practiceTitle').text(xmlTagValue(xmlDoc, 'practice_title'));

        var toggleInput = function (id, xml, tagName) {
          if (xmlTagValue(xml, tagName) === 'Y') {
            return $('#' + id).show();
          }
          return $('#' + id).hide();
        }

        toggleInput('registrationZipGroup', connectXmlDoc, 'zip_ind');
        toggleInput('registrationSsnGroup', connectXmlDoc, 'ssn_ind');
        toggleInput('registrationPhoneGroup', connectXmlDoc, 'phone_ind');

        showScreen(flow.next());

      }, function (errorXmlDoc) {
        $('#accessCodeEntryError').html($(errorXmlDoc).find('message').text());
      });
    }, function (errorXmlDoc) {
      $('#accessCodeEntryError').html($(errorXmlDoc).find('message').text());
    });

  });

  $('#connectButton').on('click', function (event) {
    event.preventDefault();

    $('#connectAccountError').html('');

    var connectionKey = getConnectionKey();

    xmlQuery(xmlCreator.create('iSalusSecurity.CompleteRegistrationWithKey')(
        keyCode,
        $('#registrationFirstName').val(),
        $('#registrationLastName').val(),
        normalizeDate($('#registrationDob').val()),
        $('#registrationSsn').val(),
        $('#registrationZip').val(),
        $('#registrationPhone').val(),
        '',
        '',
        connectionKey
      ), function (xmlDoc) {
        showScreen(flow.next());
      }, function (errorXmlDoc) {
        $('#connectAccountError').html('We could not verify the connection information with your practice. Please verify and try again.');
      }
    );
  });

  $('#demographicInfoNext').on('click', function (event) {
    event.preventDefault();

    var message = 'This is a required field';

    var errorFlag = false;
    var fieldsAreValid = [
      validateNotEmpty('registerFirstName', message),
      validateNotEmpty('registerLastName', message),
      validateNotEmpty('registerDob', message)
    ];

    if (all(fieldsAreValid)) {
      showScreen(flow.next());
    }
  });

  $('#demographicInfoBack').on('click', function (event) {
    event.preventDefault();
    showScreen(flow.prev());
  });

  _await(captchaTask, function (captchaOn) {
    if (captchaOn) {
      $('#recaptchaContainer').show();
    }

    _await(flowTask, function (value) {
      showScreen(flow.current());
    });
  });

  xmlQuery(xmlCreator.create('iSalusSecurity.PasswordPolicy'), function (xmlDoc) {
    var state = passwordPolicy.initializePasswordPolicy(xmlDoc);

    $('#finishCreatePassword').on('click', function (event) {
      event.preventDefault();

      var valid = all(map(state.activePolicies, function (x) {
        return x.validate(state.password);
      })) && state.testPasswordsMatch();

      if (valid) {
        if (flow.getName() === 'noKey') {
          xmlQuery(xmlCreator.create('iSalusSecurity.CompleteRegistration')(
              keyCode,
              $('#registerFirstName').val(),
              $('#registerLastName').val(),
              normalizeDate($('#registerDob').val()),
              $('#createPasswordField').val(),
              $('#confirmPasswordField').val()
            ), function (xmlDoc) {
              if (!mml_launch_app()) {
                createCookie("isalus_key", xmlTagValue(xmlDoc, 'key'), 1);
                window.location.href = "./";
              }
            }
          );
        } else if (flow.getName() === 'hasKey') {
          var connectionKey = getConnectionKey();

          xmlQuery(xmlCreator.create('iSalusSecurity.CompleteRegistrationWithKey')(
              keyCode,
              $('#registrationFirstName').val(),
              $('#registrationLastName').val(),
              normalizeDate($('#registrationDob').val()),
              $('#registrationSsn').val(),
              $('#registrationZip').val(),
              $('#registrationPhone').val(),
              $('#createPasswordField').val(),
              $('#confirmPasswordField').val(),
              connectionKey
            ), function (xmlDoc) {
              if (!mml_launch_app()) {
                createCookie("isalus_key", xmlTagValue(xmlDoc, 'key'), 1);
                window.location.href = "./";
              }
            }
          );
        }
      }
    });
  });
}