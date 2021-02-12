
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