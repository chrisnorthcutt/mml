
function xmlTagValue (xmlDoc, tagName) {
  return $(xmlDoc).find(tagName).text();
}

function mergeObjects (def, obj) {
  var output = {};

  for (var i in def) {
    output[i] = obj.hasOwnProperty(i) ? obj[i] : def[i];
  }

  return output;
}

var passwordPolicy = {
  policies : {
    minLength : {
      create : function (length) {
        if (typeof length !== 'number') {
          throw new Error ("minLengthPolicy: length must be numeric.");
          return {};
        }

        return {
          validate : function (string) {
            if (string.length < length) {
              return false;
            }

            return true;
          },

          id : "min-length-policy",

          label : length + ' or more characters'
        }
      }
    },

    lowerCase : {
      create : function () {
        return {
          validate : function (string) {
            return !!string.match(/[a-z]/);
          },

          id : "lower-case-policy",

          label : 'At least 1 lowercase letter'
        }
      }
    },

    upperCase : {
      create : function () {
        return {
          validate : function (string) {
            return !!string.match(/[A-Z]/);
          },

          id : "upper-case-policy",

          label : 'At least 1 uppercase letter'
        }
      }
    },

    number : {
      create : function () {
        return {
          validate : function (string) {
            return !!string.match(/[0-9]/);
          },

          id : "number-policy",

          label : 'At least 1 number'
        }
      }
    },

    symbol : {
      create : function () {
        return {
          validate : function (string) {
            return !!string.match(/[^\s\w]/);
          },

          id : "symbol-policy",

          label : 'At least 1 symbol'
        }
      }
    }
  },

  parseActivePolicies : function (xmlDoc, callback) {
    var activePolicies = [];

    if (xmlTagValue(xmlDoc, 'min_length')) {
      activePolicies.push(
        this.policies.minLength.create(+xmlTagValue(xmlDoc, 'min_length'))
      );
    }

    if (xmlTagValue(xmlDoc, 'lower_case_ind') === 'Y') {
      activePolicies.push(this.policies.lowerCase.create());
    }

    if (xmlTagValue(xmlDoc, 'upper_case_ind') === 'Y') {
      activePolicies.push(this.policies.upperCase.create());
    }

    if (xmlTagValue(xmlDoc, 'number_ind') === 'Y') {
      activePolicies.push(this.policies.number.create());
    }

    if (xmlTagValue(xmlDoc, 'symbol_ind') === 'Y') {
      activePolicies.push(this.policies.symbol.create());
    }

    if (callback !== undefined) {
      callback(activePolicies);
    }

    return activePolicies;
  },

  renderActivePolicies : function (activePolicies, prefix) {
    var containerHtml = '';
    var template = '<li id="{0}" class="password-error">{1}</li>';

    prefix = prefix || '';

    for (var i = 0; i < activePolicies.length; i++) {
      containerHtml += template.format(prefix + activePolicies[i].id, activePolicies[i].label);
    }

    containerHtml = '<ul>' + containerHtml + '</ul>';
    return containerHtml;
  },

  initializePasswordPolicy : function (xmlDoc, fieldNames) {
    var defaultFieldNames = {
      policyListContainer: 'passwordPolicies',
      createPasswordField: 'createPasswordField',
      confirmPasswordField: 'confirmPasswordField',
      passwordMatches: 'confirm-password-matches'
    };

    fieldNames = fieldNames || {};
    fieldNames = mergeObjects(defaultFieldNames, fieldNames);

    var state = {
      activePolicies : passwordPolicy.parseActivePolicies(xmlDoc),
      policyListContainer : document.getElementById(fieldNames.policyListContainer),
      password : '',
      confirmPassword : '',
      testPasswordsMatch : function () {
        var equal = state.password !== '' && state.confirmPassword === state.password; 

        if (equal) {
          document.getElementById(fieldNames.passwordMatches).className = 'password-correct';
          confirmPasswordField.removeClass('invalid');
        } else {
          document.getElementById(fieldNames.passwordMatches).className = 'password-error';
          confirmPasswordField.addClass('invalid');
        }

        return equal;
      }
    };

    state.policyListContainer.innerHTML = passwordPolicy.renderActivePolicies(state.activePolicies, fieldNames.policyListContainer);

    var confirmPasswordField = $('#'+fieldNames.confirmPasswordField);

    $('#'+fieldNames.createPasswordField).on('change paste keyup', function () {
      state.password = $(this).val();

      for (var i = 0; i < state.activePolicies.length; i++) {
        if (state.activePolicies[i].validate(state.password)) {
          document.getElementById(fieldNames.policyListContainer + state.activePolicies[i].id).className = 'password-correct';
          $(this).removeClass('invalid');
        } else {
          document.getElementById(fieldNames.policyListContainer + state.activePolicies[i].id).className = 'password-error';
          $(this).addClass('invalid');
        }
      }

      state.testPasswordsMatch();
    });

    $('#'+fieldNames.confirmPasswordField).on('change paste keyup', function () {
      state.confirmPassword = $(this).val();

      state.testPasswordsMatch();
    });

    return state;
  }
};

function validateEmail (email) {
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

function validatePhone (phone) {
  var re = /^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;
  return re.test(phone);
}
