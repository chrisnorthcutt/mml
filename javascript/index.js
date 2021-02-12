var key = readCookie("isalus_key");
var xml = new XmlCreator(key);
var account = "";

var mainUser = {
  accountId: '',
  firstName: '',
  lastName: '',
  emailAddress: '',
  imageId: '',
  stripeInd: ''
};

var currentUser = {
  accountId: '',
  firstName: '',
  lastName: '',
  birthDate: '',
  genderCode: '',
  emailAddress: '',
  userAlias: '',
  imageId: '',
  stripeInd: ''
}

if($_GET['g'] && window.location.href.indexOf('#!/connect') == -1){
  window.location.replace('./#!connect?g='+$_GET['g']);
}else if($_GET['h'] && window.location.href.indexOf('#!/connect') == -1){
  window.location.replace('./#!connect?h='+$_GET['h']);
}

var main = new mainScreen();
var allergy = new allergyScreen();
var medications = new medicationsScreen();
var conditions = new conditionsScreen();
var familyHistory = new historyScreen();
var employer = new employerScreen();
var contact = new contactScreen();
var demographics = new demographicsScreen();
var emergency = new emergencyScreen();
var lifestyle = new lifestyleScreen();
var documents = new documentsScreen();
var summary = new summaryScreen();
var connect = new connectScreen();
var securityscreen = new securityScreen();
var securityLog = new securityLogScreen();
var passwordReset = new passwordScreen();
var announcements = new announcementsScreen();
var goals = new goalsScreen();
var weight = new weightScreen();
var journalHeight = new heightScreen();
var bloodpressure = new bloodPressureScreen();
var bloodsugar = new bloodSugarScreen();
var spo2 = new spo2Screen();
var messages = new messagesScreen();
var appointments = new appointmentsScreen();
var chart = new chartScreen();
var headshot = new headshotScreen();
var accountbalance = new accountBalanceScreen();
var testscreen = new testScreen();

var common = new commonFunctions();

var initialRequest = xml.create('iSalusExternal.GetAccount');
initialRequest.persist = true;

var currentScreen = {
  loadData: function(){
    xmlQuery(initialRequest, common.showProfile, logOut);
  }
};

function logOut() {
  eraseCookie("isalus_key");
  window.location.replace("./login.html");
}

function fixMenus(){
  var windowHeight = $(window).height();

  $(".subnav").each(function(){
    $(this).css("top", 0);

    var offset = $(this).offset();
    var height = $(this).outerHeight();
    var difference = windowHeight - (offset.top + height);

    if(difference < 0){
      $(this).css("top", difference);
    }
  });
}

window.onload = fixMenus;
window.onresize = fixMenus;

var app = angular.module("myApp", ["ngRoute"]);

app.config(function ($routeProvider) {
  $routeProvider.when("/", {templateUrl: "screens/main.html"}).when("/allergy", {templateUrl: "screens/allergy.html"}).when("/test", {templateUrl: "screens/test.html"}).when("/medications", {templateUrl: "screens/medications.html"}).when("/conditions", {templateUrl: "screens/conditions.html"}).when("/history", {templateUrl: "screens/history.html"}).when("/neurocore", {templateUrl: "screens/neurocore-dashboard.html"}).when("/employer", {templateUrl: "screens/employer.html"}).when("/contact", {templateUrl: "screens/contact.html"}).when("/demographics", {templateUrl: "screens/demographics.html"}).when("/emergency", {templateUrl: "screens/emergency.html"}).when("/lifestyle", {templateUrl: "screens/lifestyle.html"}).when("/documents", {templateUrl: "screens/documents.html"}).when("/summary", {templateUrl: "screens/summary.html"}).when("/connect", {templateUrl: "screens/connect.html"}).when("/security", {templateUrl: "screens/security.html"}).when("/securitylog", {templateUrl: "screens/securitylog.html"}).when("/password", {templateUrl: "screens/password.html"}).when("/announcements", {templateUrl: "screens/announcements.html"}).when("/goals", {templateUrl: "screens/goals.html"}).when("/weight", {templateUrl: "screens/weight.html"}).when("/height", {templateUrl: "screens/height.html"}).when("/bloodpressure", {templateUrl: "screens/bloodpressure.html"}).when("/bloodsugar", {templateUrl: "screens/bloodsugar.html"}).when("/spo2", {templateUrl: "screens/spo2.html"}).when("/messages", {templateUrl: "screens/messages.html"}).when("/appointments", {templateUrl: "screens/appointments.html"}).when("/chart", {templateUrl: "screens/chart.html"}).when("/headshot", {templateUrl: "screens/headshot.html"}).when("/accountbalance", {templateUrl: "screens/accountbalance.html"});
});

xmlQuery(initialRequest, common.showProfile, logOut);

$('.sync').on('click', function(){
    xmlQuery(xml.create('iSalusExternal.Sync')(['Messages', 'Appointments', 'ClinicalSummary', 'PatientEducation', 'CCMCarePlan', 'Vitals', 'Medications', 'Goals', 'PatientBalance']), function(){
      currentScreen.loadData();
    });
    $('.icon-bg--sync').addClass('active');
    $('.sync-text').html("Syncing...");
    setTimeout(function() {
      $('.icon-bg--sync').removeClass("active");
    }, 2000);
    setTimeout(function() {
      $('.sync-text').html("Sync Data");
    }, 1700);
});

//Sidenav for iPad events
var deviceAgent = navigator.userAgent.toLowerCase();
var agentID = deviceAgent.match(/(iPad|iPhone|iPod)/i);

if (agentID){
  window.addEventListener('DOMContentLoaded',function() {
  $(".nav-item").on("click", function(event){
    $(".subnav.open").removeClass("open");
    $(event.currentTarget).children(".subnav").addClass("open");
  });
  //Closes the subnav when click outside
  $("body").on("click", function(){
    $(".subnav.open").removeClass("open");
  });
});
}


// Change modals if UA is safari
$(document).ready(function () {
  var userAgent = navigator.userAgent.toLowerCase();
  if (userAgent.indexOf('safari') != -1 && userAgent.indexOf('chrome') == -1) {
    $("body").addClass("safari");
  }
})
