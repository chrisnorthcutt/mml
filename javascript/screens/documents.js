
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