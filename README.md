# Lumiere
Web technologies course project

Authors: 
  Giovanni Fazi (annotator, Google books api, Twitter api, landing page, wikiquote api, django setup)
  Vairo di Pasquale (visualizer, Google maps (dbpedia) api, D3.js, search page)
  
Lumiere is a sophisticated Resource Annotator, Visualizer and Enhancer.
It is a Mashup web application divided in three main components:

Visualizer -> Retrieves data from Wikipedia and if the topic belongs to the 18th century philosophers category, retrieves inherent publications using Crosserf's API
Annotator -> It allows users to take annotations on the text. Annotations are wikipedia page version dependant and can also be public or private
Enhacer -> Integrates multiple external sources in order to enrich data visualization, we chose five API (wikiquote citations, google books, twitter, d3.js, google maps (with dbpedia))
