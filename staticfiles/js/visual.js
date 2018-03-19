$(document).ready(function() 
{

	$('#loading').show();

	// searchbar utilities
 	$("#search").click(function() {
		// build search url
     	currentHost = window.location.host;
     	var searchTerm = $("#searchTerm").val();
     	currentHost += "/search/";
     	currentHost += encodeURIComponent(searchTerm);

     	modHost = "http://";
     	modHost += currentHost;

		// if empty searchterm
     	if (modHost == "http://jake.cs.unibo.it:8080/search/")
     	{
       		alert("Please enter a valid search term");
       		modHost = "http://jake.cs.unibo.it:8080/";
     	}

     	window.location.href = modHost; 

 	});

	// makes enter key work on search instead of mouseclick
 	$("#searchTerm").keydown(function(e){
     	if (e.keyCode == 13) {
         	$("#search").focus();
     	}
 	});




	  var mini = (window.location.pathname).replace("/visualize","");


	  if (mini.slice(-1) == "/")
	  {
		token = mini.slice(1,-1);
	  }

	  else
	  {
		token = mini.slice(1);
	  }
	  

  token = decodeURIComponent(token);
 
  var urlOutput = "https://en.wikipedia.org/w/api.php?action=parse&page="+token+"&format=json&callback=?&disabletoc=true";

  
   $.ajax
   ({
		type : "GET",
		url : urlOutput,
		async : false,
		dataType : "json",

		success : function(data)
		{
				$('#wikiFather').prepend("<div class = jumbotron id = wiki></div>");
                                            
				pageViewer(data,token, data.parse.pageid, data.parse.revid);
		},

		error : function()
		{
			alert("errore primo ajax");
		}
			
	});
})

function pageViewer(data, TITLE, ID, REVID)
{
	$('#loading').hide();

	var wikiContent = '<h1 id="title">'+ TITLE.capitalize()+'</h1>';
	wikiContent += data.parse.text["*"];
   
	$('#wiki').append(wikiContent);

	
	Clean();

       
   var links = document.getElementById("wiki").getElementsByTagName("a");
   
   currentHost = window.location.href;
     
    
   for (var i = 0; i < links.length; i++) 
   {
     var string = links[i].innerText;

     var finale = "http://" + window.location.host + "/visualize/" + encodeURIComponent(string);

     links[i].href = finale;
    }
    
    isInCategory(TITLE);

    
    $('#loading').hide();
	$('#article').show();
	$('#enhancer').show();
	


   // plugin to display wikipedia links found in the annotaion
   var displayWikiLinksExtension = function (viewer) {
      function updateViewer(field, annotation) {

         field = $(field); 
         words = annotation.text.split(" "); 
         links = "<p style='font-weight: bold'>Wikipedia links:</p><br>";

         for (i=0; i<words.length; i++){
            if (words[i].search("https://en.wikipedia.org/wiki/") != -1 && words[i].length > 31){
               content = words[i].substring(30, words[i].length); 
               links += '<a href="https://en.wikipedia.org/wiki/' + content + '">' + content + '</a><br>'; 
            }
         }
         
         field.html(links); 
      }

      viewer.addField({
         load: updateViewer
      })
   }
   
   // plugin to display annotation author
   var displayNameExtension = function (viewer) {
       function updateViewer(field, annotation) {
           field = $(field);
           if(annotation.user){
               field.html("author: <span style='color: teal; font-weight: bold;'>"+annotation.user+"</span>");
           }
           else{
               field.remove();
           }
       }
       viewer.addField({
           load: updateViewer
       });
   };

   var user = null;
   if (document.getElementById('hereusername'))
      user = document.getElementById('hereusername').innerHTML;

   var app = new annotator.App();
   var pageId = ID;
   var pageRevisionId = REVID;
   var pageTitle = TITLE;

   //annotated element
   app.include(annotator.ui.main, {
      element: $("#wikiFather")[0], 
      viewerExtensions: [
         displayWikiLinksExtension,
         displayNameExtension,
         annotatormeltdown.viewerExtension
      ],

      editorExtensions: [
         annotatormeltdown.getEditorExtension({min_width: '500px'}),
      ]
   });

   // storage
   //app.include(annotator.storage.http, { prefix: "http://site1748.web.cs.unibo.it/annotator"});
   app.include(annotator.storage.http, { prefix: "http://jake.cs.unibo.it:8080/annotator"});

   // callbacks
   app.include(function () {
      return {
         beforeAnnotationCreated: function (ann) {
            // adds storage fields
            ann.page_id = pageId;
            ann.revision_id = pageRevisionId;
            ann.page_title = pageTitle;
         }
      }
   });
   //start annotator and load the annotations
   app.start().then(function(){
      app.annotations.load({page_id: pageId, revision_id: pageRevisionId});

      if (user != null)
         app.ident.identity = user.trim();
   });

    // Remove "Allow anyone to edit" useless checkbox in annotator ui.main
    removeuseless = document.getElementById("annotator-field-2").parentNode;
    removeuseless.remove();

}

function parsePastVersion(param)
{
   cleanPage();

   urp = "https://en.wikipedia.org/w/api.php?action=parse&oldid="+param+"&format=json&callback=?";

   $.ajax
   ({
      type : "GET",
      url : urp,
      async : false,
      dataType : "json",

      success : function(data)
      {
         $('#wikiFather').prepend("<div class = jumbotron id = wiki></div>");
         pageViewer(data, token, data.parse.pageid ,param);
      },

      error : function()
      {
         alert("errore,parsePastVersion");
      }

   }); 
}



function getPastVersions(title)
{
   time = Date.now();
   urv = "https://en.wikipedia.org/w/api.php?action=query&prop=revisions&titles="+title+"&rvstart="+time+"&rvlimit=15&format=json&callback=?";

   $('#dropDownFather').prepend("<div class=jumbotron id=dropDown></div>");

   $('#dropDown').prepend("<p>Page revisions</p>");
   $('#dropDown').append("<ul id = drop></ul>");


   $.ajax
   ({
      type : "GET",
      url : urv,
      async : false,
      dataType : "json",

      success : function(data)
      {
         obj = Object.keys(data.query.pages);
         por = data.query.pages[obj[0]].revisions;
         var j=0;
         for ( var i = por.length; i>0; i --)
         { 
            j=por[i-1].revid;


            var dateR=((por[i-1].timestamp).replace(/-/g,' / ')).replace(/T|Z/g,' ');

            var dateS=((por[i-1].timestamp).replace(/T|Z/g,' '));



            var past = new Date(dateS.substring(0,10));
           
            var timeDiff = Math.abs(time - past);
            var diffDays = Math.ceil(timeDiff/(1000*3600*24));

           

            $('#drop').prepend("<li><button class=btn btn-success onclick=parsePastVersion("+j+") type=button><i>"+diffDays+"d ago...   </i>"+dateR+"</button></li>");
         }
      },

      error : function()
      {
         alert("error,past");
      }
   });
}



function isInCategory(title)
{  
   var urCategory = "https://en.wikipedia.org/w/api.php?action=query&prop=categories&titles="+title+"&format=json&callback=?";
   $.ajax
   ({
      type : "GET",
      url : urCategory,
      async : false,
      dataType : "json",

      success : function(data)
      {
         obj = Object.keys(data.query.pages);
         por = data.query.pages[obj[0]].categories;

		 var isCategory = false;
	
         for ( var i = por.length; i>0; i --)
         { 
            if (por[i-1].title == "Category:18th-century philosophers" ||
				por[i-1].title == "Category:David Hume" ||
				por[i-1].title == "Category:Adam Smith" ||
				por[i-1].title == "Category:George Berkeley" ||
				por[i-1].title == "Category:Gottfried Leibniz" ||
				por[i-1].title == "Category:Giambattista Vico" ||
				por[i-1].title == "Category:Voltaire")
            {
				
 			   isCategory = true;	
                 
            }

         }

		if (isCategory == true)
		{
           //$("#enhancer").show();	
		   getCrossref(title);
		   getGiovanni(title);
		   getGraph(title);	
	       getDBPEDIA(title);
		   getPastVersions(decodeURIComponent(title));
		}

		else
		{
			$('#enhancer').empty();
            document.getElementById("article").className = "w3-col m12 l12";
		}

      },

      error : function()
      {
         alert("error,category");
      }
   });

}




function getCrossref(title)
{
   $('#crossFather').prepend("<div class = jumbotron id = cross></div>");
   var urcr = "https://api.crossref.org/works?query.title="+title;

   console.log(urcr);

   $.ajax
   ({
      type : "GET",
      async : false,
      url : urcr,
      dataType : "json",

      success : function(data)
      {  
         crossViewer(data,title);
      },

      error : function()
      {
         alert("errore caricamento cross");
      }

      });
} 




function getMap(place)
{
   var urMap = "https://maps.googleapis.com/maps/api/geocode/json?address="+place+"&key=AIzaSyCmcBdHTJVGDgsl729o5cj8bYjkU7yEkHw";

   $.ajax
   ({
      type : "GET",
      async : false,
       url : urMap,
      dataType : "json",

      success : function(data)
      {
         var lat = data.results[0].geometry.location.lat;
         var lng = data.results[0].geometry.location.lng;

         $('#mapFather').prepend("<div class = jumbotron id = map></div>");  

            var styles = [
            {
               "featureType": "landscape",
               "elementType": "labels",
               "stylers": [
               {
                  "visibility": "off"
               }
               ]
            },
            {
               "featureType": "transit",
               "elementType": "labels",
               "stylers": [
               {
                  "visibility": "off"
               }
               ]
            },
               {
                  "featureType": "poi",
                  "elementType": "labels",
                  "stylers": [
                  {
                     "visibility": "off"
                  }
                  ]
               },
               {
                  "featureType": "water",
                  "elementType": "labels",
                  "stylers": [
                  {
                     "visibility": "off"
                  }
                  ]
               },
                  {
                     "featureType": "road",
                     "elementType": "labels.icon",
                     "stylers": [
                     {
                        "visibility": "off"
                     }
                     ]
                  },
                  {
                     "stylers": [
                     {
                        "hue": "#00aaff"
                     },
                     {
                        "saturation": -100
                     },
                        {
                           "gamma": 2.15
                        },
                        {
                           "lightness": 12
                        }
                     ]
                  },
                     {
                        "featureType": "road",
                        "elementType": "labels.text.fill",
                        "stylers": [
                        {
                           "visibility": "on"
                        },
                        {
                           "lightness": 24
                        }
                        ]
                     },
                     {
                        "featureType": "road",
                        "elementType": "geometry",
                        "stylers": [
                        {
                           "lightness": 57
                        }
                        ]
                     }
            ]

            initMap(place,styles,lat,lng);

         },

      error : function()
      {
         alert("errore map");
      }
   });
}




function crossViewer(data,title)
{
   var crossrefContent = "<h2>Related Publications</h2> <ul>";
   var articlesCount = 0;

   for(var i = 0; i < data.message.items.length; i++)
   {
      var article = data.message.items[i].title;

      var lowerTitle = decodeURIComponent(title).toLowerCase();

      

      if (article[0].indexOf(decodeURIComponent(title)) >=0 || 
            article[0].indexOf(lowerTitle) >=0)
      {
      	if (!!data.message.items[i].author)
      	{
         var urdoi = "https://doi.org/" + data.message.items[i].DOI;

         crossrefContent +=  '<li><a href="'+ urdoi +'" target="_blank">' + article + " by "+ data.message.items[i].author[0].family +" "+ data.message.items[i].author[0].given + '</a>';
         articlesCount++;
         }	
      }
   }

   crossrefContent += '</ul>';

   if (articlesCount == 0)
   {
      crossrefContent += "<h5> Nothing found </h5>";
   }

   $('#cross').prepend(crossrefContent);
}


function getGraph(title)
{
  currYear = (new Date()).getFullYear();
  month = ((new Date()).getMonth()) + 1; // +1 perche parte da 0
  
  passYear = currYear - 1;



  urGraph = "http://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/de.wikipedia/all-access/all-agents/"+title+"/monthly/"+passYear+"0"+month+"0100/"+currYear+"123100";

  $('#graphFather').prepend("<div class = jumbotron id = graph ></div>");
  var graphContent = "<h2>Past Months Statistics</h2>";

  
   $.ajax
   ({
      type : "GET",
      async : true,
      url : urGraph,
      dataType : "json",

      success : function(data)
      {
		 graphContent += "<canvas id = graphCanvas width=400 height=400></canvas>";
         $('#graph').prepend(graphContent);
         graphViewer(data,month);
      },

      error : function()
      {
         graphContent += "<h5> No statistics for this page</h5>";
         $('#graph').prepend(graphContent); 
      }

   });
  
  
}


function graphViewer(data,month)
{
	   var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
     
	   var mydata = [];
	   var myLabels = [];	
       
       var j = 0;

 	   
	   for(i in data.items)
			{
				mydata.push(data.items[i].views);
        
        index = ((month - 1) - Number(i));
        

        if (index >= 0)
        {
          myLabels[i] = monthNames[index];
        }
        
        else
        {
         myLabels[i] = monthNames[ 11 - j];
         j=j+1;
        } 
			}


	   var ctx = document.getElementById('graphCanvas').getContext('2d')
			var chart = new Chart(ctx, {
			   
			    type: 'bar',

			    data: {
			        labels: myLabels.reverse(),
					
			        datasets: [{
			            label: "Past months views",
			            backgroundColor: 'rgb(217,217,217)',
			            borderColor: 'rgb(77,74,70)',
			            data: mydata
			        }]
			    },

			    // Configuration options go here
			    options: {}
		});
	
}

function getDBPEDIA(TITLE)
{
	var underScoreName = TITLE;

    underScoreName = underScoreName.replace(/ /g,"_");

	var urppppp = "http://dbpedia.org/data/"+ underScoreName+".json";
	console.log(urppppp);

    $.ajax
   ({
      type : "GET",
      url : urppppp,
      async : false,
      dataType : "json",

      success : function(data)
      {
         console.log("success");

         var last = data["http://dbpedia.org/resource/"+ underScoreName]["http://dbpedia.org/ontology/birthPlace"].length;
       
         var birthplace = (data["http://dbpedia.org/resource/"+ underScoreName]["http://dbpedia.org/ontology/birthPlace"][last - 1].value).replace("http://dbpedia.org/resource/","");
         
         getMap(birthplace);
      },

      error : function()
      {
         console.log("error");
      }

   }); 
}


function getGiovanni(title) {


             // enable tooltips for onmouseover buttons
             $('[data-toggle="tooltip"]').tooltip();
             
             // queries a random quote
             WikiquoteApi.randq(title); 

             // add quote's author
             document.getElementById("quoteauthor").innerHTML = title + " (wikiquote)";

             // queries book search
             BooksearchApi.queryBooks(title);

             $("#anotherquote").click(function() {
                 WikiquoteApi.randq(title);
             });

             
		}
    

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}



function cleanPage()
{
   $("#output").remove();
   $("#wiki").remove();
   $("#cross").remove();
   $("#map").remove();
   $('#drop').remove();
   $('#dropDown').remove();
   $('#graph').remove();	
}

function Clean(){

   $('.mw-parser-output').find('h2').each(function () {
      if($(this).html().indexOf('External links') >= 0){
         $(this).attr('id', 'delete');
      }
   }); 
   
   $("span[id*='Notes\']").remove(); // <--- oro colato rimuove le note		
   $("sup[class*='reference\']").remove(); // rimuove i riferimenti sopra le cose
   $("div[class*='thumbcaption\']").remove();
   $("div[class*='gallerytext\']").remove();// rimuove le thumbcaption sotto le immagini
   $("li[class*='gallerybox\']").remove();
   $("span[id*='Citations\']").remove();
   $("span[id*='Gallery\']").remove();
   //$("table[class*='vertical-navbox nowraplinks hlist\']").remove(); //rimuove la navbox verticale
   //$("table[class*='wikitable\']").remove();

   $(".mw-parser-output").find('table').remove();
   
   $('#delete ~ ul').remove();
   $('#delete ~ p').remove();
   $('#delete ~ div').remove();
   $('#delete ~ table').remove();
   $('#delete ~ dl').remove();
   $('#delete').remove();
   $('.mw-editsection').remove();
   $('#External_links').remove();
   $('#References').remove();
   $('.references').remove();
   $(".References").remove();
   $("*[href='#References']").parent().remove();
   $(".External_links").remove();
   $("*[href='#External_links']").parent().remove();
   $('*[class="image"]').remove();
   $('*[class*="infobox"]').remove();


   $(".mw-editsection").remove();
   /*$(".reference").remove();*/
   $('*[role="navigation"]').remove();
   $('*[role="presentation"]').remove();
   $('*[rel="nofollow"]').remove();
   /*$("#References").remove();*/
   $(".nv-view").remove();
   $(".nv-talk").remove();
   $(".nv-edit").remove();
   $(".noprint").remove();

   $('.mw-parser-output').find('h2').each(function () {
      if($(this).html().indexOf('Bibliography') >= 0){
         $(this).attr('id', 'delete');
      }
   });
}
