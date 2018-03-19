from django.shortcuts import render
from django.http import JsonResponse, HttpResponseBadRequest, HttpResponse
from datetime import datetime
from django.core.exceptions import ObjectDoesNotExist

from annotator.models import Annotation, Page

import json
import uuid

# Create your views here.

from django.template import loader


def getroot(request):
    """API root, response with an object containing store metedata as well as hypermedia
    links to the rest of the API"""
    return JsonResponse(
            {"message": "Annotator Store API", 
                "links": {
                    "annotation": {
                        "create": {
                            "desc": "Create a new annotation",
                            "method": "POST",
                            "url": "/annotator/annotations"
                            },
                        "delete": {
                            "desc": "Delete an annotation",
                            "method": "DELETE",
                            "url": "/annotator/annotations/:id"
                            },
                        "read": {
                            "desc": "Get an existing annotation",
                            "method": "GET",
                            "url": "/annotator/annotations/:id"
                            },
                        "update": {
                            "desc": "Update an existing annotation",
                            "method": "PUT",
                            "url": "/annotator/annotations/:id"
                            }
                        },
                    "search": {
                        "desc": "Search API",
                        "method": "GET",
                        "url": "/annotator/search"
                        }
                    }
                })

def search(request):
    """Search the database of annotations, Searh for fields using query string params"""
    if (('page_id' in request.GET) and ('revision_id' in request.GET)):
        pageId = str(request.GET['page_id'])
        revId = str(request.GET['revision_id'])

        # retrieve a group of annotation in a specific page
        annGroup = Annotation.objects.filter(page__pageId=pageId)


        # collects annotation to respond with, according to the permissions
        ok2send = []
        #import pdb;pdb.set_trace()
        for ann in annGroup:
            if (str(ann.page.revId) != revId):
                continue
            found = {
                    'id':ann.annId,
                    'ranges':json.loads(ann.ranges),
                    'quote': ann.quote,
                    'text': ann.text,
                    'user': ann.user,
                    'permissions': json.loads(ann.permissions)
                    }

            if (('read' in found['permissions']) and ((not request.user.is_authenticated()) or (request.user.username != ann.user))):
                continue

            ok2send.append(found)

        response = {'total': len(ok2send), 'rows': ok2send}
    else:
        response = {}
    return JsonResponse(response)

def apiEntry(request, annotation_id=""):
    # read
    if (request.method == 'GET'):
        if (len(annotation_id) > 0):
            return JsonResponse(apiRead(annotation_id))
        else:
            return HttpResponseBadRequest("Bad Request")
    # create
    elif (request.method == 'POST'):
        response = apiCreate(request)
        if (type(response) is dict):
            return JsonResponse(response)
        else:
            return HttpResponseBadRequest('Bad Request ' + response)
    # update
    elif (request.method == 'PUT'):
        if (len(annotation_id) > 0):
            response = apiUpdate(request, annotation_id)
            if (response != {}):
                return JsonResponse(response)
            else:
                return HttpResponse(status=response['stauts'])
        else:
            return HttpResponseBadRequest('Bad Request')
    # delete
    elif (request.method == 'DELETE'):
        if (len(annotation_id) > 0):
            cause = apiDelete(request, annotation_id)
            return HttpResponse(status=cause)
        else:
            return HttpResponseBadRequest('Bad Request')

def apiDelete(req, aId):
    """deletes an existing annotation if found"""
    try:
        ann2delete = Annotation.objects.get(annId=aId)

        if (req.user.is_authenticated() and ann2delete.user == req.user.username):
            ann2delete.delete()
            return(204)
        else:
            # forbidden
            return(403)
    except Annotation.DoesNotExist:
        return(404)


def apiUpdate(req, aId):
    """updates existing annotations on a valid request"""
    reqBody = json.loads(req.body.decode('utf-8'))
    
    if (isValid(reqBody, req.user, mode="update")):
        try:
            annot = Annotation.objects.get(annId=aId)

            if (req.user.is_authenticated() and annot.user == req.user.username):
                annot.text = str(reqBody['text'])
                annot.quote = str(reqBody['quote'])
                annot.ranges = json.dumps(reqBody['ranges'])
                annot.permissions = json.dumps(reqBody['permissions'])
                annot.updated = datetime.now()

                annot.save()

                return(annot.asDict())
            else:
                return({'status':403})
        except Annotation.DoesNotExist:
            return({'status':404})
    else:
        return({'status':400})


def apiCreate(req):
    """creates a new annotation"""
    reqBody = json.loads(req.body.decode('utf-8'))

    if (isValid(reqBody, req.user)):
        page = None
        try:
            #import pdb
            #pdb.set_trace()
            # check if current page has already been annotated
            page = Page.objects.filter(pageId=reqBody["page_id"]).get(revId=reqBody["revision_id"])
        except Page.DoesNotExist:
            # save a new instance of a page
            page = Page()
            page.pageId = str(reqBody['page_id'])
            page.title = str(reqBody['page_title'])
            page.revId = str(reqBody['revision_id'])
            page.save()
        finally:
            # save the new annotation
            if (int(page.revId) == reqBody['revision_id']):
                newAnnot = Annotation()
                newAnnot.annId = str(uuid.uuid4()) #random id
                newAnnot.text = str(reqBody['text'])
                newAnnot.quote = str(reqBody['quote'])
                newAnnot.ranges = json.dumps(reqBody['ranges'])
                newAnnot.permissions = json.dumps(reqBody['permissions'])
                newAnnot.user = str(req.user.username)
                newAnnot.page = page
                newAnnot.save()

                return(newAnnot.asDict())
                
            else:
                return("stored page id doesn not match requests id")
    else:
        return("Request not valid (bad fields)")

        

def isValid(reqData, user, mode='create'):
    """checks if request for create/update is valid"""
    if (reqData is None):
        return False

    if (not user.is_authenticated()):
        return False

    if (("text" not in reqData) or ("quote" not in reqData) or ("permissions" not in reqData)):
        return False

    if (mode == 'create'):
        if (("page_id" not in reqData) or ("revision_id" not in reqData) or ("page_title" not in reqData)):
            return False
        
    return True


def apiRead(aId):
    """returns the json version of the requested annotation (if found)"""
    annotation = Annotator.object.filter(annId=aId)
    if (annotation):
        return(annotation.asDict())
    else:
        return({})

    
