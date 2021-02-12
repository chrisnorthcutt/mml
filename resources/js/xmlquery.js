
///////////////////////////////////////////////////////////////////////////////
// Create an object from GET parameters
///////////////////////////////////////////////////////////////////////////////

var $_GET = {};
if(document.location.toString().indexOf('?') !== -1) {
    var query = document.location
                   .toString()
                   // get the query string
                   .replace(/^.*?\?/, '')
                   // and remove any existing hash string (thanks, @vrijdenker)
                   .replace(/#.*$/, '')
                   .split('&');

    for(var i=0, l=query.length; i<l; i++) {
       var aux = decodeURIComponent(query[i]).split('=');
       $_GET[aux[0]] = aux[1];
    }
}

///////////////////////////////////////////////////////////////////////////////
// Functions to handle cookies
///////////////////////////////////////////////////////////////////////////////

function createCookie(name,value,days) {
	var expires = "";
	if (days) {
		var date = new Date();
		date.setTime(date.getTime() + (days*24*60*60*1000));
		expires = "; expires=" + date.toUTCString();
	}
	document.cookie = name + "=" + value + expires + "; path=/";
}

function readCookie(name) {
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for(var i=0;i < ca.length;i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
	}
	return null;
}

function eraseCookie(name) {
	createCookie(name,"",-1);
}

String.prototype.format = function() {
	var args = arguments;
	return this.replace(/{(\d+)}/g, function(match, number) { 
		return typeof args[number] != 'undefined'
			? args[number]
			: match
		;
	});
};

///////////////////////////////////////////////////////////////////////////////
// XmlCreator class generates Xml requests
///////////////////////////////////////////////////////////////////////////////

function XmlCreator(key){
	this.key = key || '';
	this.baseXml = 
		'<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">'+
			'<soap:Body>'+
				'<{0} xmlns="http://www.isalushealthcare.webservices/">'+
					'<xml_request>'+
						'<request>'+
							'<security>'+
								'<key>'+key+'</key>'+
								'<version>1.0</version>'+
								'<userid></userid>'+
								'<account>A5A0B598-99B3-43F7-BE5D-013A170442FB</account>'+
							'</security>'+
							'{1}'+
						'</request>'+
					'</xml_request>'+
				'</{0}>'+
			'</soap:Body>'+
		'</soap:Envelope>';
}

XmlCreator.prototype.setAccount = function(accountId){
	this.baseXml = 
		'<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">'+
			'<soap:Body>'+
				'<{0} xmlns="http://www.isalushealthcare.webservices/">'+
					'<xml_request>'+
						'<request>'+
							'<security>'+
								'<key>'+this.key+'</key>'+
								'<version>1.0</version>'+
								'<userid></userid>'+
								'<account>A5A0B598-99B3-43F7-BE5D-013A170442FB</account>'+
							'</security>'+
							'<account_id>'+accountId+'</account_id>'+
							'{1}'+
						'</request>'+
					'</xml_request>'+
				'</{0}>'+
			'</soap:Body>'+
		'</soap:Envelope>';
}

XmlCreator.prototype.setSystem = function(system){
	this.baseXml = 
		'<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">'+
			'<soap:Body>'+
				'<{0} xmlns="http://www.isalushealthcare.webservices/">'+
					'<xml_request>'+
						'<request>'+
							'<security>'+
								'<key>'+this.key+'</key>'+
								'<version>1.0</version>'+
								'<userid></userid>'+
								'<account>A5A0B598-99B3-43F7-BE5D-013A170442FB</account>'+
							'</security>'+
							system+
							'{1}'+
						'</request>'+
					'</xml_request>'+
				'</{0}>'+
			'</soap:Body>'+
		'</soap:Envelope>';
}

XmlCreator.prototype.create = function(apiService){
	var separated = apiService.split(".");
	var method  = separated[1];
	var service = separated[0];
	var self = this;

	switch(apiService){
		case "iSalusExternal.AddFamilyMember":
			return function(firstName, lastName, birthDate, relationshipCode){
				var xmlString = '';
				xmlString += '<first_name>'+firstName+'</first_name>';
				xmlString += '<last_name>'+lastName+'</last_name>';
				xmlString += '<dob>'+birthDate+'</dob>';
				xmlString += '<relationship_code>'+relationshipCode+'</relationship_code>';
				return {service: service, method: method, data: self.baseXml.format(method, xmlString)};
			}

		case "iSalusExternal.BookAppointment":
			return function(databaseKey, appointmentTypeId, serviceLocationId, resourceId, placeholderId, placeholderInd, scheduleDate, startTime, endTime){
				var xmlString = '';
				xmlString += '<database_key>'+databaseKey+'</database_key>';
				xmlString += '<appointment_type_id>'+appointmentTypeId+'</appointment_type_id>';
				xmlString += '<service_location_id>'+serviceLocationId+'</service_location_id>';
				xmlString += '<resource_id>'+resourceId+'</resource_id>';
				xmlString += '<placeholder_id>'+placeholderId+'</placeholder_id>';
				xmlString += '<placeholder_ind>'+placeholderInd+'</placeholder_ind>';
				xmlString += '<schedule_date>'+scheduleDate+'</schedule_date>';
				xmlString += '<start_time>'+startTime+'</start_time>';
				xmlString += '<end_time>'+endTime+'</end_time>';
				return {service: service, method: method, data: self.baseXml.format(method, xmlString)};
			}

		case "iSalusExternal.CancelAppointment":
			return function(accountId, databaseKey, appointmentId){
				var xmlString = '';
				xmlString += '<account_id>'+accountId+'</account_id>';
				xmlString += '<database_key>'+databaseKey+'</database_key>';
				xmlString += '<appointment_id>'+appointmentId+'</appointment_id>';
				return {service: service, method: method, data: self.baseXml.format(method, xmlString)};
			}

		case "iSalusExternal.Connect":
			return function(lastName, birthDate, ssn, zip, phone, registrationCode){
				var xmlString = '';
				xmlString += '<last_name>'+lastName+'</last_name>';
				xmlString += '<birth_date>'+birthDate+'</birth_date>';
				xmlString += '<ssn>'+ssn+'</ssn>';
				xmlString += '<zip>'+zip+'</zip>';
				xmlString += '<phone>'+phone+'</phone>';
				xmlString += '<registration_code>'+registrationCode+'</registration_code>';
				return {service: service, method: method, data: self.baseXml.format(method, xmlString)};
			}

		case "iSalusExternal.Disconnect": // This is not a real webservice. It exists to distinguish disconnecting from connecting in the iSalusExternal.Connect method.
			return function(databaseKey){
				var xmlString = '';
				xmlString += '<database_key>'+databaseKey+'</database_key>';
				return {service: service, method: method, data: self.baseXml.format(method, xmlString)};
			}

		case "iSalusExternal.FamilyMemberCreateLogin":
			return function(accountId, registerEmail1, registerEmail2, registerQuestion, registerAnswer){
				var xmlString = '';
				xmlString += '<account_id>'+accountId+'</account_id>';
				xmlString += '<register_email1>'+registerEmail1+'</register_email1>';
				xmlString += '<register_email2>'+registerEmail2+'</register_email2>';
				xmlString += '<register_question>'+registerQuestion+'</register_question>';
				xmlString += '<register_answer>'+registerAnswer+'</register_answer>';
				return {service: service, method: method, data: self.baseXml.format(method, xmlString)};
			}

		case "iSalusExternal.FamilyMemberCreateLoginEx":
			return function(accountId, registerEmail, registerPhone, registerQuestion, registerAnswer){
				var xmlString = '';
				xmlString += '<account_id>'+accountId+'</account_id>';
				xmlString += '<register_email>'+registerEmail+'</register_email>';
				xmlString += '<register_phone>'+registerPhone+'</register_phone>';
				xmlString += '<register_question>'+registerQuestion+'</register_question>';
				xmlString += '<register_answer>'+registerAnswer+'</register_answer>';
				return {service: service, method: method, data: self.baseXml.format(method, xmlString)};
			}

		case "iSalusExternal.FamilyMemberCreateLoginExContinued":
			return function(accountId, resetId, resetToken, resetPassword){
				var xmlString = '';
				xmlString += '<account_id>'+accountId+'</account_id>';
				xmlString += '<reset_id>'+resetId+'</reset_id>';
				xmlString += '<reset_token>'+resetToken+'</reset_token>';
				xmlString += '<reset_password>'+resetPassword+'</reset_password>';
				return {service: service, method: method, data: self.baseXml.format(method, xmlString)};
			}

		case "iSalusExternal.FindMedication":
			return function(drugName, drugLevel){
				return {service: service, method: method, data: self.baseXml.format(method, '<drug_name>'+drugName+'</drug_name><drug_level>'+drugLevel+'</drug_level>')};
			}

		case "iSalusExternal.GetAllergenList":
			return function(allergenTypeCode){
				return {service: service, method: method, data: self.baseXml.format(method, '<allergen_type_code>'+allergenTypeCode+'</allergen_type_code>')};
			}

		case "iSalusExternal.GetAllergy":
			return function(allergyId){
				return {service: service, method: method, data: self.baseXml.format(method, '<allergy_id>'+allergyId+'</allergy_id>')};
			}

		case "iSalusExternal.GetAppointmentCreate":
			return function(databaseKey){
				return {service: service, method: method, data: self.baseXml.format(method, '<database_key>'+databaseKey+'</database_key>')};
			}

		case "iSalusExternal.GetAppointments":
			return function(searchType){
				return {service: service, method: method, data: self.baseXml.format(method, '<search_type>'+searchType+'</search_type>')};
			}

		case "iSalusExternal.GetAppointmentSearch":
			return function(databaseKey, appointmentTypeId, serviceLocationId, resourceIdentifier, timeframe, adjustWeek){
				var xmlString = '';
				xmlString += '<database_key>'+databaseKey+'</database_key>';
				xmlString += '<appointment_type_id>'+appointmentTypeId+'</appointment_type_id>';
				xmlString += '<service_location_id>'+serviceLocationId+'</service_location_id>';
				xmlString += '<resource_identifier>'+resourceIdentifier+'</resource_identifier>';
				xmlString += '<timeframe>'+timeframe+'</timeframe>';
				xmlString += '<adjust_week>'+adjustWeek+'</adjust_week>';
				return {service: service, method: method, data: self.baseXml.format(method, xmlString)};
			}

		case "iSalusExternal.GetClaimReport":
			return function(databaseKey){
				return {service: service, method: method, data: self.baseXml.format(method, '<database_key>'+databaseKey+'</database_key>')};
			};

		case "iSalusExternal.GetCondition":
			return function(medicalConditionId){
				return {service: service, method: method, data: self.baseXml.format(method, '<medical_condition_id>'+medicalConditionId+'</medical_condition_id>')};
			};

		case "iSalusExternal.GetConditionItems":
			return function(conditionTypeCode){
				return {service: service, method: method, data: self.baseXml.format(method, '<condition_type_code>'+conditionTypeCode+'</condition_type_code>')};
			};

		case "iSalusExternal.GetConnectionSearch":
			return function(searchData){
				return {service: service, method: method, data: self.baseXml.format(method, '<search_data>'+searchData+'</search_data>')};
			};

		case "iSalusExternal.GetDocument":
			return function(patientImageId){
				return {service: service, method: method, data: self.baseXml.format(method, '<patient_image_id>'+patientImageId+'</patient_image_id>')};
			};

		case "iSalusExternal.GetFamilyHistory":
			return function(historyId){
				return {service: service, method: method, data: self.baseXml.format(method, '<history_id>'+historyId+'</history_id>')};
			};

		case "iSalusExternal.GetImage":
			return function(imageId){
				return {service: service, method: method, data: self.baseXml.format(method, '<image_id>'+imageId+'</image_id>')};
			};

		case "iSalusExternal.GetJournalBP":
		case "iSalusExternal.GetJournalBS":
		case "iSalusExternal.GetJournalGoal":
		case "iSalusExternal.GetJournalHeight":
		case "iSalusExternal.GetJournalSpO2":
		case "iSalusExternal.GetJournalWeight":
			return function(accountId){
				return {service: service, method: method, data: self.baseXml.format(method, '<account_id>'+accountId+'</account_id>')};
			};

		case "iSalusExternal.GetLabResult":
			return function(databaseKey, labRequisitionId, recordId, returnPdf){
				var xmlString = '';
				xmlString += '<database_key>'+databaseKey+'</database_key>';
				xmlString += '<lab_requisition_id>'+labRequisitionId+'</lab_requisition_id>';
				xmlString += '<record_id>'+recordId+'</record_id>';
				xmlString += '<return_pdf>'+returnPdf+'</return_pdf>';
				return {service: service, method: method, data: self.baseXml.format(method, xmlString)};
			};

		case "iSalusExternal.GetLabResultItem":
			return function(databaseKey, labRequisitionId, resultId, returnPdf){
				var xmlString = '';
				xmlString += '<database_key>'+databaseKey+'</database_key>';
				xmlString += '<lab_requisition_id>'+labRequisitionId+'</lab_requisition_id>';
				xmlString += '<result_id>'+resultId+'</result_id>';
				xmlString += '<return_pdf>'+returnPdf+'</return_pdf>';
				return {service: service, method: method, data: self.baseXml.format(method, xmlString)};
			};

		case "iSalusExternal.GetLabResults":
			return function(accountId){
				return {service: service, method: method, data: self.baseXml.format(method, '<account_id>'+accountId+'</account_id>')};
			};

		case "iSalusExternal.GetLifestyle":
			return function(section){
				return {service: service, method: method, data: self.baseXml.format(method, '<section>'+section+'</section>')};
			};

		case "iSalusExternal.GetMedication":
			return function(medicationId){
				return {service: service, method: method, data: self.baseXml.format(method, '<medication_id>'+medicationId+'</medication_id>')};
			}

		case "iSalusExternal.GetMessages":
			return function(messageType, ageType){
				var xmlString = '';
				xmlString += '<message_type>'+messageType+'</message_type>';
				xmlString += '<age_type>'+ageType+'</age_type>';
				return {service: service, method: method, data: self.baseXml.format(method, xmlString)};
			}

		case "iSalusExternal.GetProviders":
			return function(databaseKey){
				return {service: service, method: method, data: self.baseXml.format(method, '<database_key>'+databaseKey+'</database_key>')};
			};

		case "iSalusExternal.GetRegistration":
			return function(connectionKey){
				return {service: service, method: method, data: self.baseXml.format(method, '<connection_key>'+connectionKey+'</connection_key>')};
			};

		case "iSalusExternal.GetSecurityLogList":
			return function(type){
				return {service: service, method: method, data: self.baseXml.format(method, '<type>'+type+'</type>')};
			}

		case "iSalusExternal.GetStatement":
			return function(databaseKey, statementNumber){
				var xmlString = '';
				xmlString += '<database_key>'+databaseKey+'</database_key>';
				xmlString += '<statement_number>'+statementNumber+'</statement_number>';
				return {service: service, method: method, data: self.baseXml.format(method, xmlString)};
			}

		case "iSalusExternal.GetStatements":
			return function(databaseKey, startDays, endDays){
				var xmlString = '';
				xmlString += '<database_key>'+databaseKey+'</database_key>';
				xmlString += '<start_days>'+startDays+'</start_days>';
				xmlString += '<end_days>'+endDays+'</end_days>';
				return {service: service, method: method, data: self.baseXml.format(method, xmlString)};
			}

		case "iSalusExternal.MyChartData":
			return function(mychartType, recordId){
				return {service: service, method: method, data: self.baseXml.format(method, '<mychart_type>'+mychartType+'</mychart_type><record_id>'+recordId+'</record_id>')};
			}

		case "iSalusExternal.MyChartList":
			return function(mychartType){
				return {service: service, method: method, data: self.baseXml.format(method, '<mychart_type>'+mychartType+'</mychart_type>')};
			}

		case "iSalusExternal.PasswordReset":
			return function(oldPassword, password1, password2){
				var xmlString = '';
				xmlString += '<old_password>'+oldPassword+'</old_password>';
				xmlString += '<password1>'+password1+'</password1>';
				xmlString += '<password2>'+password2+'</password2>';
				return {service: service, method: method, data: self.baseXml.format(method, xmlString)};
			}

		case "iSalusExternal.PharmacyChains":
			return function(databaseKey, state, city, zip){
				var xmlString = '';
				xmlString += '<database_key>'+databaseKey+'</database_key>';
				xmlString += '<state>'+state+'</state>';
				xmlString += '<city>'+city+'</city>';
				xmlString += '<zip>'+zip+'</zip>';
				return {service: service, method: method, data: self.baseXml.format(method, xmlString)};
			}

		case "iSalusExternal.PullClinicalSummary":
			return function(databaseKey){
				return {service: service, method: method, data: self.baseXml.format(method, '<database_key>'+databaseKey+'</database_key>')};
			};

		case "iSalusExternal.SaveAllergy":
			return function(allergyId, allergenTypeCode, allergenId, treatment, reaction, removedFlag){
				var xmlString = '';
				xmlString += '<allergy_id>'+allergyId+'</allergy_id>';
				xmlString += '<allergen_type_code>'+allergenTypeCode+'</allergen_type_code>';
				xmlString += '<allergen_id>'+allergenId+'</allergen_id>';
				xmlString += '<treatment>'+treatment+'</treatment>';
				xmlString += '<reaction>'+reaction+'</reaction>';
				xmlString += '<removed_flag>'+removedFlag+'</removed_flag>';
				return {service: service, method: method, data: self.baseXml.format(method, xmlString)};
			};

		case "iSalusExternal.SaveCondition":
			return function(medicalConditionId, conditionTypeCode, conditionId, occurredType, occurredValue, removedFlag, note, results, hospital){
				var xmlString = '';
				xmlString += '<medical_condition_id>'+medicalConditionId+'</medical_condition_id>';
				xmlString += '<condition_type_code>'+conditionTypeCode+'</condition_type_code>';
				xmlString += '<condition_id>'+conditionId+'</condition_id>';
				xmlString += '<occurred_type>'+occurredType+'</occurred_type>';
				xmlString += '<occurred_value>'+occurredValue+'</occurred_value>';
				xmlString += '<removed_flag>'+removedFlag+'</removed_flag>';
				xmlString += '<note>'+note+'</note>';
				xmlString += '<results>'+results+'</results>';
				xmlString += '<hospital>'+hospital+'</hospital>';
				return {service: service, method: method, data: self.baseXml.format(method, xmlString)};
			};

		case "iSalusExternal.SaveContact":
			return function(address, zip, home, cell, work){
				var xmlString = '';
				xmlString += '<address>'+address+'</address>';
				xmlString += '<zip>'+zip+'</zip>';
				xmlString += '<home>'+home+'</home>';
				xmlString += '<cell>'+cell+'</cell>';
				xmlString += '<work>'+work+'</work>';
				return {service: service, method: method, data: self.baseXml.format(method, xmlString)};
			};

		case "iSalusExternal.SaveDemographics":
			return function(firstName, lastName, birthDate, genderCode, ssn, maritalCode, bloodTypeCode, ethnicityCode, eyeColorCode, hairColorCode, birthmarksScars, specialConditions){
				var xmlString = '';
				xmlString += '<first_name>'+firstName+'</first_name>';
				xmlString += '<last_name>'+lastName+'</last_name>';
				xmlString += '<birth_date>'+birthDate+'</birth_date>';
				xmlString += '<gender_code>'+genderCode+'</gender_code>';
				xmlString += '<ssn>'+ssn+'</ssn>';
				xmlString += '<marital_code>'+maritalCode+'</marital_code>';
				xmlString += '<blood_type_code>'+bloodTypeCode+'</blood_type_code>';
				xmlString += '<ethnicity_code>'+ethnicityCode+'</ethnicity_code>';
				xmlString += '<eye_color_code>'+eyeColorCode+'</eye_color_code>';
				xmlString += '<hair_color_code>'+hairColorCode+'</hair_color_code>';
				xmlString += '<birthmarks_scars>'+birthmarksScars+'</birthmarks_scars>';
				xmlString += '<special_conditions>'+specialConditions+'</special_conditions>';
				return {service: service, method: method, data: self.baseXml.format(method, xmlString)};
			};

		case "iSalusExternal.SaveDocument":
			return function(patientImageId, documentTypeCode, imageId, imageName, imageDescription, documentDate, removedFlag){
				var xmlString = '';
				xmlString += '<patient_image_id>'+patientImageId+'</patient_image_id>';
				xmlString += '<document_type_code>'+documentTypeCode+'</document_type_code>';
				xmlString += '<image_id>'+imageId+'</image_id>';
				xmlString += '<image_name>'+imageName+'</image_name>';
				xmlString += '<image_description>'+imageDescription+'</image_description>';
				xmlString += '<document_date>'+documentDate+'</document_date>';
				xmlString += '<removed_flag>'+removedFlag+'</removed_flag>';
				return {service: service, method: method, data: self.baseXml.format(method, xmlString)};
			};

		case "iSalusExternal.SaveEmergency":
			return function(primaryName, primaryRelationshipCode, primaryHome, primaryCell, primaryWork, secondaryName, secondaryRelationshipCode, secondaryHome, secondaryCell, secondaryWork){
				var xmlString = '';
				xmlString += '<primary>';
				xmlString += '<name>'+primaryName+'</name>';
				xmlString += '<relationship_code>'+primaryRelationshipCode+'</relationship_code>';
				xmlString += '<home>'+primaryHome+'</home>';
				xmlString += '<cell>'+primaryCell+'</cell>';
				xmlString += '<work>'+primaryWork+'</work>';
				xmlString += '</primary>';
				xmlString += '<secondary>';
				xmlString += '<name>'+secondaryName+'</name>';
				xmlString += '<relationship_code>'+secondaryRelationshipCode+'</relationship_code>';
				xmlString += '<home>'+secondaryHome+'</home>';
				xmlString += '<cell>'+secondaryCell+'</cell>';
				xmlString += '<work>'+secondaryWork+'</work>';
				xmlString += '</secondary>';
				return {service: service, method: method, data: self.baseXml.format(method, xmlString)};
			};

		case "iSalusExternal.SaveEmployer":
			return function(occupation, employerName, address, zip, work, fax){
				var xmlString = '';
				xmlString += '<occupation>'+occupation+'</occupation>';
				xmlString += '<employer_name>'+employerName+'</employer_name>';
				xmlString += '<address>'+address+'</address>';
				xmlString += '<zip>'+zip+'</zip>';
				xmlString += '<work>'+work+'</work>';
				xmlString += '<fax>'+fax+'</fax>';
				return {service: service, method: method, data: self.baseXml.format(method, xmlString)};
			};

		case "iSalusExternal.SaveFamilyHistory":
			return function(historyId, relationshipCode, familyHistoryId, note, removedFlag){
				var xmlString = '';
				xmlString += '<history_id>'+historyId+'</history_id>';
				xmlString += '<relationship_code>'+relationshipCode+'</relationship_code>';
				xmlString += '<family_history_id>'+familyHistoryId+'</family_history_id>';
				xmlString += '<note>'+note+'</note>';
				xmlString += '<removed_flag>'+removedFlag+'</removed_flag>';
				return {service: service, method: method, data: self.baseXml.format(method, xmlString)};
			};

		case "iSalusExternal.SaveHeadshot":
			return function(contentFileName, imageType, base64){
				var xmlString = '';
				xmlString += '<document_type_code>2</document_type_code>';
				xmlString += '<content_file_name>'+contentFileName+'</content_file_name>';
				xmlString += '<image_type>'+imageType+'</image_type>';
				xmlString += '<base64>'+base64+'</base64>';
				return {service: service, method: method, data: self.baseXml.format(method, xmlString)};
			};

		case "iSalusExternal.SaveJournalBP":
			return function(accountId, journalId, systolic, diastolic, pulse, note, encounterDateTime, removedFlag){
				var xmlString = '';
				xmlString += '<account_id>'+accountId+'</account_id>';
				xmlString += '<journal_id>'+journalId+'</journal_id>';
				xmlString += '<systolic>'+systolic+'</systolic>';
				xmlString += '<diastolic>'+diastolic+'</diastolic>';
				xmlString += '<pulse>'+pulse+'</pulse>';
				xmlString += '<note>'+note+'</note>';
				xmlString += '<encounter_date_time>'+encounterDateTime+'</encounter_date_time>';
				xmlString += '<removed_flag>'+removedFlag+'</removed_flag>';
				return {service: service, method: method, data: self.baseXml.format(method, xmlString)};
			};

		case "iSalusExternal.SaveJournalBS":
			return function(accountId, journalId, bloodSugar, eventCode, note, encounterDateTime, removedFlag){
				var xmlString = '';
				xmlString += '<account_id>'+accountId+'</account_id>';
				xmlString += '<journal_id>'+journalId+'</journal_id>';
				xmlString += '<blood_sugar>'+bloodSugar+'</blood_sugar>';
				xmlString += '<event_code>'+eventCode+'</event_code>';
				xmlString += '<note>'+note+'</note>';
				xmlString += '<encounter_date_time>'+encounterDateTime+'</encounter_date_time>';
				xmlString += '<removed_flag>'+removedFlag+'</removed_flag>';
				return {service: service, method: method, data: self.baseXml.format(method, xmlString)};
			};

		case "iSalusExternal.SaveJournalGoal":
			return function(accountId, journalId, goal, goalMetInd, note, encounterDateTime, removedFlag){
				var xmlString = '';
				xmlString += '<account_id>'+accountId+'</account_id>';
				xmlString += '<journal_id>'+journalId+'</journal_id>';
				xmlString += '<goal>'+goal+'</goal>';
				xmlString += '<goal_met_ind>'+goalMetInd+'</goal_met_ind>';
				xmlString += '<note>'+note+'</note>';
				xmlString += '<encounter_date_time>'+encounterDateTime+'</encounter_date_time>';
				xmlString += '<removed_flag>'+removedFlag+'</removed_flag>';
				return {service: service, method: method, data: self.baseXml.format(method, xmlString)};
			};

		case "iSalusExternal.SaveJournalHeight":
			return function(accountId, journalId, heightFt, heightIn, note, encounterDateTime, removedFlag){
				var xmlString = '';
				xmlString += '<account_id>'+accountId+'</account_id>';
				xmlString += '<journal_id>'+journalId+'</journal_id>';
				xmlString += '<height_ft>'+heightFt+'</height_ft>';
				xmlString += '<height_in>'+heightIn+'</height_in>';
				xmlString += '<note>'+note+'</note>';
				xmlString += '<encounter_date_time>'+encounterDateTime+'</encounter_date_time>';
				xmlString += '<removed_flag>'+removedFlag+'</removed_flag>';
				return {service: service, method: method, data: self.baseXml.format(method, xmlString)};
			};

		case "iSalusExternal.SaveJournalSpO2":
			return function(accountId, journalId, spo2, note, encounterDateTime, removedFlag){
				var xmlString = '';
				xmlString += '<account_id>'+accountId+'</account_id>';
				xmlString += '<journal_id>'+journalId+'</journal_id>';
				xmlString += '<spo2>'+spo2+'</spo2>';
				xmlString += '<note>'+note+'</note>';
				xmlString += '<encounter_date_time>'+encounterDateTime+'</encounter_date_time>';
				xmlString += '<removed_flag>'+removedFlag+'</removed_flag>';
				return {service: service, method: method, data: self.baseXml.format(method, xmlString)};
			};

		case "iSalusExternal.SaveJournalWeight":
			return function(accountId, journalId, weightLbs, note, encounterDateTime, removedFlag){
				var xmlString = '';
				xmlString += '<account_id>'+accountId+'</account_id>';
				xmlString += '<journal_id>'+journalId+'</journal_id>';
				xmlString += '<weight_lbs>'+weightLbs+'</weight_lbs>';
				xmlString += '<note>'+note+'</note>';
				xmlString += '<encounter_date_time>'+encounterDateTime+'</encounter_date_time>';
				xmlString += '<removed_flag>'+removedFlag+'</removed_flag>';
				return {service: service, method: method, data: self.baseXml.format(method, xmlString)};
			};

		case "iSalusExternal.SaveLifestyle":
			return function(section){

				var xmlString = '<section>'+section+'</section>';

				switch(section){
					case "tobacco":
						return function(noTobaccoInd, smokeInd, smokePacksPerDay, smokeYears, cigarInd, cigarPerDay, cigarYears, dipInd, dipCanPerDay, dipYears){
							xmlString += '<no_tobacco_ind>'+noTobaccoInd+'</no_tobacco_ind>';
							xmlString += '<smoke_ind>'+smokeInd+'</smoke_ind>';
							xmlString += '<smoke_packs_per_day>'+smokePacksPerDay+'</smoke_packs_per_day>';
							xmlString += '<smoke_years>'+smokeYears+'</smoke_years>';
							xmlString += '<cigar_ind>'+cigarInd+'</cigar_ind>';
							xmlString += '<cigar_per_day>'+cigarPerDay+'</cigar_per_day>';
							xmlString += '<cigar_years>'+cigarYears+'</cigar_years>';
							xmlString += '<dip_ind>'+dipInd+'</dip_ind>';
							xmlString += '<dip_can_per_day>'+dipCanPerDay+'</dip_can_per_day>';
							xmlString += '<dip_years>'+dipYears+'</dip_years>';
							return {service: service, method: method, data: self.baseXml.format(method, xmlString)}
						}

					case "alcohol":
						return function(noAlcoholInd, alcoholInd, drinksPerWeek, drinkYears){
							xmlString += '<no_alcohol_ind>'+noAlcoholInd+'</no_alcohol_ind>';
							xmlString += '<alcohol_ind>'+alcoholInd+'</alcohol_ind>';
							xmlString += '<drink_per_week>'+drinksPerWeek+'</drink_per_week>';
							xmlString += '<drink_years>'+drinkYears+'</drink_years>';
							return {service: service, method: method, data: self.baseXml.format(method, xmlString)}
						}

					case "caffeine":
						return function(coffeeInd, coffeeCupsPerDay, colaInd, colaCansPerDay, teaInd, teaCupsPerDay){
							xmlString += '<coffee_ind>'+coffeeInd+'</coffee_ind>';
							xmlString += '<coffee_cups_per_day>'+coffeeCupsPerDay+'</coffee_cups_per_day>';
							xmlString += '<cola_ind>'+colaInd+'</cola_ind>';
							xmlString += '<cola_cans_per_day>'+colaCansPerDay+'</cola_cans_per_day>';
							xmlString += '<tea_ind>'+teaInd+'</tea_ind>';
							xmlString += '<tea_cups_per_day>'+teaCupsPerDay+'</tea_cups_per_day>';
							return {service: service, method: method, data: self.baseXml.format(method, xmlString)}
						}

					case "excercise": //Yes, I know it's spelled wrong. It has to be.
						return function(exercise1, exercise1Times, exercise2, exercise2Times, exercise3, exercise3Times){
							xmlString += '<excercise_1>'+exercise1+'</excercise_1>';
							xmlString += '<excercise_1_times>'+exercise1Times+'</excercise_1_times>';
							xmlString += '<excercise_2>'+exercise2+'</excercise_2>';
							xmlString += '<excercise_2_times>'+exercise2Times+'</excercise_2_times>';
							xmlString += '<excercise_3>'+exercise3+'</excercise_3>';
							xmlString += '<excercise_3_times>'+exercise3Times+'</excercise_3_times>';
							return {service: service, method: method, data: self.baseXml.format(method, xmlString)}
						}

					case "recreational drugs":
						return function(noDrugsInd, cocaineInd, heroinInd, marijuanaInd, steroidInd, painKillerInd, ecstasyInd, otherInd, otherDrugs){
							xmlString += '<no_drugs_ind>'+noDrugsInd+'</no_drugs_ind>';
							xmlString += '<cocaine_ind>'+cocaineInd+'</cocaine_ind>';
							xmlString += '<heroin_ind>'+heroinInd+'</heroin_ind>';
							xmlString += '<marijuana_ind>'+marijuanaInd+'</marijuana_ind>';
							xmlString += '<steroid_ind>'+steroidInd+'</steroid_ind>';
							xmlString += '<pain_killer_ind>'+painKillerInd+'</pain_killer_ind>';
							xmlString += '<ectasy_ind>'+ecstasyInd+'</ectasy_ind>'; // the webservice spells this wrong
							xmlString += '<other_ind>'+otherInd+'</other_ind>';
							xmlString += '<other_drugs>'+otherDrugs+'</other_drugs>';
							return {service: service, method: method, data: self.baseXml.format(method, xmlString)}
						}

					default:
						console.warn("Unrecognized section name in iSalusExternal.SaveLifestyle. - "+section);
				}
			};

		case "iSalusExternal.SaveMedication":
			return function(medicationId, medName, doseQuantity, frequencyCode, startedType, startedValue, stoppedType, stoppedValue, removedFlag){
				var xmlString = '';
				xmlString += '<medication_id>'+medicationId+'</medication_id>';
				xmlString += '<med_name>'+medName+'</med_name>';
				xmlString += '<dose_quantity>'+doseQuantity+'</dose_quantity>';
				xmlString += '<frequency_code>'+frequencyCode+'</frequency_code>';
				xmlString += '<started_type>'+startedType+'</started_type>';
				xmlString += '<started_value>'+startedValue+'</started_value>';
				xmlString += '<stopped_type>'+stoppedType+'</stopped_type>';
				xmlString += '<stopped_value>'+stoppedValue+'</stopped_value>';
				xmlString += '<removed_flag>'+removedFlag+'</removed_flag>';
				return {service: service, method: method, data: self.baseXml.format(method, xmlString)};
			};

		case "iSalusExternal.SaveMessageRead":
			return function(mmlMessageId){
				return {service: service, method: method, data: self.baseXml.format(method, '<mml_message_id>'+mmlMessageId+'</mml_message_id>')};
			};

		case "iSalusExternal.SaveSecurity":
			return function(password, userAlias, emailAddress, securityQuestion, securityAnswer, phone){
				var xmlString = '';
				xmlString += '<password>'+password+'</password>';
				xmlString += '<user_alias>'+userAlias+'</user_alias>';
				xmlString += '<email_address>'+emailAddress+'</email_address>';
				xmlString += '<security_question>'+securityQuestion+'</security_question>';
				xmlString += '<security_answer>'+securityAnswer+'</security_answer>';
				xmlString += '<phone>'+phone+'</phone>';
				return {service: service, method: method, data: self.baseXml.format(method, xmlString)};
			};

		case "iSalusExternal.SaveStripe":
			return function(stripeUserId){
				return {service: service, method: method, data: self.baseXml.format(method, '<stripe_user_id>'+stripeUserId+'</stripe_user_id>')};
			};

		case "iSalusExternal.SendAppointmentRequest":
			return function(phone, other, databaseKey, provider, reason, timeframe, monday, tuesday, wednesday, thursday, friday, saturday, sunday, prefTime, important){
				var xmlString = '';
				xmlString += '<phone>'+phone+'</phone>';
				xmlString += '<other>'+other+'</other>';
				xmlString += '<database_key>'+databaseKey+'</database_key>';
				xmlString += '<provider>'+provider+'</provider>';
				xmlString += '<reason>'+reason+'</reason>';
				xmlString += '<timeframe>'+timeframe+'</timeframe>';
				xmlString += '<monday>'+monday+'</monday>';
				xmlString += '<tuesday>'+tuesday+'</tuesday>';
				xmlString += '<wednesday>'+wednesday+'</wednesday>';
				xmlString += '<thursday>'+thursday+'</thursday>';
				xmlString += '<friday>'+friday+'</friday>';
				xmlString += '<saturday>'+saturday+'</saturday>';
				xmlString += '<sunday>'+sunday+'</sunday>';
				xmlString += '<pref_time>'+prefTime+'</pref_time>';
				xmlString += '<important>'+important+'</important>';
				return {service: service, method: method, data: self.baseXml.format(method, xmlString)};
			};

		case "iSalusExternal.SendMessage":
			return function(contentTypeId, content, phone, other, databaseKey, providerId){
				var xmlString = '';
				xmlString += '<content_type_id>'+contentTypeId+'</content_type_id>';
				xmlString += '<content>'+content+'</content>';
				xmlString += '<phone>'+phone+'</phone>';
				xmlString += '<other>'+other+'</other>';
				xmlString += '<database_key>'+databaseKey+'</database_key>';
				xmlString += '<provider_id>'+providerId+'</provider_id>';
				return {service: service, method: method, data: self.baseXml.format(method, xmlString)};
			};

		case "iSalusExternal.ShareSummary":
			return function(databaseKey, demographicsInd, employerInd, insuranceInd, medicationInd, allergiesInd, medicalInd, lifestyleInd, familyInd, hwInd, bpInd, bsInd, goalInd){
				var xmlString = '';
				xmlString += '<database_key>'+databaseKey+'</database_key>';
				xmlString += '<demographics_ind>'+demographicsInd+'</demographics_ind>';
				xmlString += '<employer_ind>'+employerInd+'</employer_ind>';
				xmlString += '<insurance_ind>'+insuranceInd+'</insurance_ind>';
				xmlString += '<medication_ind>'+medicationInd+'</medication_ind>';
				xmlString += '<allergies_ind>'+allergiesInd+'</allergies_ind>';
				xmlString += '<medical_ind>'+medicalInd+'</medical_ind>';
				xmlString += '<lifestyle_ind>'+lifestyleInd+'</lifestyle_ind>';
				xmlString += '<family_ind>'+familyInd+'</family_ind>';
				xmlString += '<hw_ind>'+hwInd+'</hw_ind>';
				xmlString += '<bp_ind>'+bpInd+'</bp_ind>';
				xmlString += '<bs_ind>'+bsInd+'</bs_ind>';
				xmlString += '<goal_ind>'+goalInd+'</goal_ind>';
				return {service: service, method: method, data: self.baseXml.format(method, xmlString)};
			};

		case "iSalusExternal.Sync":
			return function(syncTypes){
				var xmlString = '<sync_list>';
				for(var i = 0; i < syncTypes.length; i++){
					xmlString += '<sync_type>'+syncTypes[i]+'</sync_type>';
				}
				xmlString += '</sync_list>';
				return {service: service, method: method, data: self.baseXml.format(method, xmlString)};
			};

		case "iSalusExternal.UploadDocument": //This isn't a real webservice call, it exists as a distinction between saving an existing document and uploading a new one.
			return function(patientImageId, documentTypeCode, imageId, imageName, imageDescription, contentFileName, imageType, base64, documentDate, removedFlag){
				var xmlString = '';
				xmlString += '<patient_image_id>'+patientImageId+'</patient_image_id>';
				xmlString += '<document_type_code>'+documentTypeCode+'</document_type_code>';
				xmlString += '<image_id>'+imageId+'</image_id>';
				xmlString += '<image_name>'+imageName+'</image_name>';
				xmlString += '<image_description>'+imageDescription+'</image_description>';
				xmlString += '<content_file_name>'+contentFileName+'</content_file_name>';
				xmlString += '<image_type>'+imageType+'</image_type>';
				xmlString += '<base64>'+base64+'</base64>';
				xmlString += '<document_date>'+documentDate+'</document_date>';
				xmlString += '<removed_flag>'+removedFlag+'</removed_flag>';
				return {service: service, method: 'SaveDocument', data: self.baseXml.format('SaveDocument', xmlString)};
			};

		case "iSalusSecurity.CompleteRegistration": //This isn't a real webservice call, it exists as a distinction between LoginSetup and completing the registration.
			return function(keyCode, firstName, lastName, dob, password1, password2) {
				var xmlString = '';
				xmlString += '<action>complete_registration</action>';
				xmlString += '<key_code>'+keyCode+'</key_code>';
				xmlString += '<register_first_name>'+firstName+'</register_first_name>';
				xmlString += '<register_last_name>'+lastName+'</register_last_name>';
				xmlString += '<register_dob>'+dob+'</register_dob>';
				xmlString += '<register_password1>'+password1+'</register_password1>';
				xmlString += '<register_password2>'+password2+'</register_password2>';
				return {service: service, method: 'LoginSetup', data: self.baseXml.format('LoginSetup', xmlString)};
			};

		case "iSalusSecurity.CompleteRegistrationWithKey": //This isn't a real webservice call, it exists as a distinction between LoginSetup and completing the registration with a key.
			return function(keyCode, firstName, lastName, dob, ssn, zip, phone, password1, password2, connectionKey) {
				var xmlString = '';
				xmlString += '<action>complete_registration</action>';
				xmlString += '<key_code>'+keyCode+'</key_code>';
				xmlString += '<register_first_name>'+firstName+'</register_first_name>';
				xmlString += '<register_last_name>'+lastName+'</register_last_name>';
				xmlString += '<register_dob>'+dob+'</register_dob>';
				xmlString += '<register_ssn>'+ssn+'</register_ssn>';
				xmlString += '<register_zip>'+zip+'</register_zip>';
				xmlString += '<register_phone>'+phone+'</register_phone>';
				xmlString += '<register_password1>'+password1+'</register_password1>';
				xmlString += '<register_password2>'+password2+'</register_password2>';
				xmlString += '<connection_key>'+connectionKey+'</connection_key>';
				return {service: service, method: 'LoginSetup', data: self.baseXml.format('LoginSetup', xmlString)};
			};

		case "iSalusSecurity.ConnectionSetup":
			return function(connectionKey){
				var xmlString = '';
				xmlString += '<action>connection_setup</action>';
				xmlString += '<connection_key>'+connectionKey+'</connection_key>';
				return {service: service, method: 'LoginSetup', data: self.baseXml.format('LoginSetup', xmlString)};
			}

		case "iSalusSecurity.CreateAccount": //This isn't a real webservice call, it exists as a distinction between LoginSetup and creating an account.
			return function(email, phone, recaptcha) {
				var xmlString = '';
				xmlString += '<action>create_account</action>';
				xmlString += '<email>'+email+'</email>';
				xmlString += '<phone>'+phone+'</phone>';

				if (typeof recaptcha !== 'undefined') {
					xmlString += '<g_recaptcha_response>'+recaptcha+'</g_recaptcha_response>';
				}

				return {service: service, method: 'LoginSetup', data: self.baseXml.format('LoginSetup', xmlString)};
			};

		case "iSalusSecurity.GetRegistration": //This isn't a real webservice call, it exists as a distinction between LoginSetup and getting the registration information.
			return function(keyCode, connectionKey) {
				var xmlString = '';
				xmlString += '<action>get_registration</action>';
				xmlString += '<key_code>'+keyCode+'</key_code>';

				if (typeof connectionKey !== 'undefined') {
					xmlString += '<connection_key>'+connectionKey+'</connection_key>';
				}

				return {service: service, method: 'LoginSetup', data: self.baseXml.format('LoginSetup', xmlString)};
			};

		case "iSalusSecurity.LoginStartup": //This isn't a real webservice call, it exists as a distinction between LoginSetup and seeing whether maintenance and captcha are on
			var xmlString = '';
			xmlString += '<action>login_startup</action>';
			return {service: service, method: 'LoginSetup', data: self.baseXml.format('LoginSetup', xmlString)};

		case "iSalusSecurity.PasswordPolicy": //This isn't a real webservice call, it exists as a distinction between LoginSetup and retrieving the password policy.
			var xmlString = '';
			xmlString += '<action>password_policy</action>';
			return {service: service, method: 'LoginSetup', data: self.baseXml.format('LoginSetup', xmlString)};

		case "iSalusWindow.GetList":
			return function(name){
				return {service: service, method: method, data: self.baseXml.format(method, '<list><list_item><name>'+name+'</name></list_item></list>')};
			};

		case "iSalusWindow.Initialize":
			return function(nameAndMethod){

				var separated = nameAndMethod.split('.');
				var screenName = separated[0];
				var screenMethod = separated[1];

				var containerXml = '<initialize><screen_name>{0}</screen_name><screen_method>{1}</screen_method><screen_input>{2}</screen_input></initialize>';

				switch(nameAndMethod){
					case "medication.medication_edit":
						return function(accountId, medicationId){
							var xmlString = '<account_id>'+accountId+'</account_id>';
							xmlString += '<medication_id>'+medicationId+'</medication_id>';
							return {service: service, method: method, data: self.baseXml.format(method, containerXml.format(screenName, screenMethod, xmlString))};
						}

					case "medication.pharmacy_search_city":
						return function(state, city){
							var xmlString = '<state>'+state+'</state>';
							xmlString += '<city>'+city+'</city>';
							return {service: service, method: method, data: self.baseXml.format(method, containerXml.format(screenName, screenMethod, xmlString))};
						}

					case "medication.pharmacy_search_initialize":
						return function(accountId){
							var xmlString = '<account_id>'+accountId+'</account_id>';
							return {service: service, method: method, data: self.baseXml.format(method, containerXml.format(screenName, screenMethod, xmlString))};
						}

					case "medication.pharmacy_search_state":
						return function(state){
							var xmlString = '<state>'+state+'</state>';
							return {service: service, method: method, data: self.baseXml.format(method, containerXml.format(screenName, screenMethod, xmlString))};
						}

					// case "MML.pharmacy_chains":
					// 	return function(accountId){
					// 		var xmlString = '<account_id>'+accountId+'</account_id>';
					// 		return {service: service, method: method, data: self.baseXml.format(method, containerXml.format(screenName, screenMethod, xmlString))};
					// 	}

					default:
						console.warn("Unrecognized method and screen name in iSalusWindow.Initialize. - "+nameAndMethod);
				}
			};

		case "iSalusWindow.InitializeEMR":
			return function(nameAndMethod){

				var separated = nameAndMethod.split('.');
				var screenName = separated[0];
				var screenMethod = separated[1];

				var containerXml = '<initialize><screen_name>{0}</screen_name><screen_method>{1}</screen_method><screen_input>{2}</screen_input></initialize>';

				switch(nameAndMethod){
					case "MML.message_send_refill":
						return function(accountId, userName, databaseKey, prescriptionId, medName, pharmacyDescription, pharmacyId, note, phone, other){
							var xmlString = '<member_account_id>'+accountId+'</member_account_id>';
							xmlString += '<member_name>'+userName+'</member_name>';
							xmlString += '<user_account_id>'+accountId+'</user_account_id>';
							xmlString += '<user_name>'+userName+'</user_name>';
							xmlString += '<database_key>'+databaseKey+'</database_key>';
							xmlString += '<prescription_id>'+prescriptionId+'</prescription_id>';
							xmlString += '<med_name>'+medName+'</med_name>';
							xmlString += '<pharmacy_description>'+pharmacyDescription+'</pharmacy_description>';
							xmlString += '<pharmacy_id>'+pharmacyId+'</pharmacy_id>';
							xmlString += '<note>'+note+'</note>';
							xmlString += '<phone>'+phone+'</phone>';
							xmlString += '<other>'+other+'</other>';
							return {service: service, method: method, data: self.baseXml.format(method, containerXml.format(screenName, screenMethod, xmlString))};
						}

					case "MML.pharmacy_search":
						return function(accountId, userName, databaseKey, state, city, zip, chain){
							var xmlString = '<member_account_id>'+accountId+'</member_account_id>';
							xmlString += '<member_name>'+userName+'</member_name>';
							xmlString += '<user_account_id>'+accountId+'</user_account_id>';
							xmlString += '<user_name>'+userName+'</user_name>';
							xmlString += '<database_key>'+databaseKey+'</database_key>';
							xmlString += '<state>'+state+'</state>';
							xmlString += '<city>'+city+'</city>';
							xmlString += '<zip>'+zip+'</zip>';
							xmlString += '<chain>'+chain+'</chain>';
							return {service: service, method: method, data: self.baseXml.format(method, containerXml.format(screenName, screenMethod, xmlString))};
						}

					default:
						console.warn("Unrecognized method and screen name in iSalusWindow.InitializeEMR. - "+nameAndMethod);
				}
			};

		case "iSalusExternal.GetAccount":
		case "iSalusExternal.GetAllergyList":
		case "iSalusExternal.GetAnnouncements":
		case "iSalusExternal.GetBalance":
		case "iSalusExternal.GetConditionList":
		case "iSalusExternal.GetConnection":
		case "iSalusExternal.GetContact":
		case "iSalusExternal.GetDemographics":
		case "iSalusExternal.GetDocumentList":
		case "iSalusExternal.GetEmergency":
		case "iSalusExternal.GetEmployer":
		case "iSalusExternal.GetFamilyHistoryItems":
		case "iSalusExternal.GetFamilyHistoryList":
		case "iSalusExternal.GetJournal":
		case "iSalusExternal.GetMedicationAge":
		case "iSalusExternal.GetMedicationList":
		case "iSalusExternal.GetMessagesCounts":
		case "iSalusExternal.GetPracticeGoals":
		case "iSalusExternal.GetSecurity":
		case "iSalusExternal.GetSelfSchedule":
		case "iSalusExternal.GetSummary":
		case "iSalusSecurity.GetKey":
			return {service: service, method: method, data: self.baseXml.format(method, '')};

		default:
			console.warn("Did not recognize that API call. - "+apiService);
	}
}

XmlCreator.prototype.custom = function(apiService){
	var separated = apiService.split(".");
	var method  = separated[1];
	var service = separated[0];
	var self = this;

	return function(xml){
		return {service: service, method: method, data: self.baseXml.format(method, xml)}
	}
}

var xmlRequests = [];
function xmlQuery(request, callback, errorCallback){

	var hostname = window.location.hostname;
	var protocol = window.location.protocol;

	var serviceUrl = protocol+"//"+hostname+"/MMLServices/"+request.service+"Service.asmx";

	var xmlHttp = new XMLHttpRequest();
	xmlHttp.open('POST', serviceUrl, true);

	xmlHttp.onreadystatechange = function(){
		if(xmlHttp.readyState == 4){
			if(xmlHttp.status == 200){
				if($(xmlHttp.responseXML).find('error').length == 0){
					callback(xmlHttp.responseXML);
				} else {
					if($(xmlHttp.responseXML).find('code').text() == '3' || $(xmlHttp.responseXML).find('code').text() == '4'){ // If the user's key is no longer valid, log them out
						eraseCookie("isalus_key");
						window.location.replace("./login.html");
					}else if(typeof errorCallback !== "undefined"){
						errorCallback(xmlHttp.responseXML);
					}
					console.warn('Error in '+request.service+'.'+request.method+' call.');
				}
			} else {
				console.warn('Server responded with '+xmlHttp.status+' for '+request.service+'.'+request.method+'.');
			}

			var index = xmlRequests.indexOf(xmlHttp);
			if(index >= 0){
				xmlRequests.splice(index);
			}
		}
	}

	xmlHttp.setRequestHeader('Content-Type', 'text/xml');
	xmlHttp.setRequestHeader("SOAPAction", "http://www.isalushealthcare.webservices/" + request.method);
	xmlHttp.send(request.data);

	if(request.hasOwnProperty('persist')){
		xmlHttp.persist = true;
	}

	xmlRequests.push(xmlHttp);
}