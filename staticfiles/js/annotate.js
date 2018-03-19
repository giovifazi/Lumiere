/*var app = new annotator.App();
app.include(annotator.ui.main);
app.include(annotator.storage.http, {
   prefix: '/annotator'
});
app.include(function() {
   return {
      beforeAnnotationCreated: function (annotation) {
         annotation.uri = window.location.href;

      }

   }

});
app.start().then(function () {
   app.annotations.load({
      uri: window.location.href

   });

});*/
var displayNameExtension = function (viewer) {
    function updateViewer(field, annotation) {
        field = $(field);
        if(annotation.user){
            field.html("By: <span style='color: teal; font-weight: bold;'>"+annotation.user+"</span>");
        }
        else{
            field.remove();
        }
    }
    viewer.addField({
        load: updateViewer
    });
};


var pageId = 'test'
var pageRevisionId = 'test'
var pageTitle = 'test'
var user = 'test'
var app = new annotator.App();
//annotated element
app.include(annotator.ui.main, {element: $("#wikiFather")[0], viewerExtensions: [displayNameExtension, annotator.ui.markdown.viewerExtension]});
//external storage
app.include(annotator.storage.http, { prefix: "/annotator"});
//set the callbacks
app.include(function () {
    return {
        beforeAnnotationCreated: function (ann) {
            //add the page id, revision id and page title to the freshly created annotation, before sending it
            ann.page_id = pageId;
            ann.revision_id = pageRevisionId;
            ann.page_title = pageTitle;
        }
    }
});
//start annotator and load the annotations
app.start().then(function(){
    app.annotations.load({page_id: pageId, revision_id: pageRevisionId});
    app.ident.identity = user.trim();
});
