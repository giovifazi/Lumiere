$(document).ready(function() 
{

  $('#loading').hide();

  var mini = (window.location.pathname).replace("/search","");
  

  if (mini.slice(-1) == "/")
  {
	TOKEN = mini.slice(1,-1);
  }

  else
  {
	TOKEN = mini.slice(1);
  }


  $("#output").remove();
  $('#loading').show();
                    
  getResults(TOKEN);

 	
$("#search").click(function()
{
   $("#output").remove();
	$('#loading').show();
      
           
	var searchTerm = $("#searchTerm").val();

	getResults(searchTerm);
   
});

$("#outputFather").on("click",'#cat', function()
{

   $("#output").remove();

   host = window.location.host;
      
   $('#loading').show();
   var str = $(this).text();
        
   stringa = str.substring(1);
        
   stringURL = "http://"+host+"/visualize/"+encodeURIComponent(stringa); 
   
   window.location.href = stringURL;
   
});
   
    
   
});

function getResults(searchTerm)
{

  var url = "https://en.wikipedia.org/w/api.php?action=opensearch&search="+searchTerm+"&format=json&callback=?";

	$.ajax
	({
		type : "GET",
		url : url,
		async : false,
		dataType : "json",

		success : function(data)
		{
			$('#outputFather').prepend("<ul class = jumbotron id = output></ul>");

			for ( var i = data[1].length; i > 0; i --)
			{
				$('#output').prepend("<li> <h3 id = cat> "+data[1][i-1]+"</h3><h4><small>"+data[2][i-1]+"</small></h4></li>");
			}

			if (data[1].length == 0)
			{
				$('#output').prepend("<i>Nothing found...</i>");
			}


			$('#loading').hide();
		},

		error : function()
		{
			alert("errore");
			$('#loading').hide();
		}
	});
}
