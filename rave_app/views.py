from django.shortcuts import render

from django.http import HttpResponse
from django.http import HttpResponseRedirect
from django.template import loader
import json, os, random, requests
from rave_app.forms import *
from django.shortcuts import render_to_response

# enhancer twitter
from TwitterSearch import *
import urllib

def getRandPreview():
    # In order to get a preview of some 18th century philosopher, we store the
    # wikipedia's page IDs in a file, we take 20 random entry and the first 
    # 200 char per article, to show a preview

    with open('/home/web/site1748/html/staticfiles/rave_proj/suggLinks', 'r') as fpage_ids:
        linksList = [line.strip() for line in fpage_ids]

    linksList = random.sample(linksList, 20)

    # In order to retrieve 200 char per article, we need to create a wikimedia 
    # url that will make a request
    idsString = ""

    for entry in linksList:
        idsString += (str(entry) + '%7C')

    # deletes exceding %7C at the end
    idsString = idsString[:-3]

    req = requests.get("https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&pageids={}&utf8=1&exchars=300&exlimit=20&exintro=1&explaintext=1&exsectionformat=plain".format(idsString))

    # filter some useless data in the json
    req = req.json()['query']['pages'].values()
    return req



# HomePage request
def index(request):
    req = getRandPreview()
    context = { 'suggLinks': req }
    template = loader.get_template('index.html')
    return HttpResponse(template.render(context, request))

def err_404(request):
    return HttpResponse("404.html")

def login(request):
    return HttpResponse("login.html")

def logout(request):
    return HttpResponse("logout.html")

def register(request):
    if (request.method == 'POST'):
        form = RegistrationForm(request.POST)

        if (form.is_valid()):
            user = User.objects.create_user(username = form.cleaned_data['username'], password = form.cleaned_data['password1'])
            return HttpResponseRedirect('/accounts/login')
    else:
        form = RegistrationForm()

    context = { 'form': form }
    template = loader.get_template('registration/register.html')

    return HttpResponse(template.render(context, request))

def about(request):
    return render(request, 'about.html')

def nullSearch(request, *args, **kwargs):
    return render(request, 'searchpage.html')

def searchPage(request, *args, **kwargs):
    return render(request, 'searchpage.html')

def visualizePage(request, *args, **kwargs):
    tweets = enhanceTwitter(request.path.rsplit('/')[-1])
    template = loader.get_template('visualizer.html')
    return HttpResponse(template.render(tweets, request))

def enhanceTwitter(searchTerm):
    """Prepares latest tweets on argument and return a dict with them"""
    try:
        tso = TwitterSearchOrder() 
        tso.set_keywords([searchTerm, '#' + searchTerm]) 
        tso.set_language('en') 
        tso.set_include_entities(False)
        tso.set_count(10) # guess it is bugged, it doesnt return 10 tweets...

        ts = TwitterSearch(
            consumer_key = 'YlzQrPI2UGOZmpMFcOHKUpx2d',
            consumer_secret = '4oXWIspSq7mEwsA8vc4PlPjH1wFYo4bNh9z9AVN6210H7QWdho',
            access_token = '779834338485661696-vShfNP9vXAZgtxXxluBEHipwirjNV5m',
            access_token_secret = '3fzJEFGX2Pf0y47mI4VvqBUY23p6g2iXnxRUpgnIFrzJj'
        )

        tweetDict = {}
        nTweets = 0 # since set_count() is broken, take 15 at best

        # converting text because of url encoding
        for t in ts.search_tweets_iterable(tso):
            tweetDict[t['user']['screen_name']] = t['text']
            
            nTweets += 1
            if (nTweets >= 15):
                break


    except TwitterSearchException:
        tweetDict = None
    finally:
        context = { 'tweets': tweetDict }
    return context
