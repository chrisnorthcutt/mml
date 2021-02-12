
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