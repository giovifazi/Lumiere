from django.db import models
import json
import datetime

# Create your models here.

class Page(models.Model):
    """Each page has multiple annotations, pages have also multiple versions"""
    pageId = models.CharField(max_length=40)
    title = models.TextField()
    revId = models.CharField(max_length=50)


class Annotation(models.Model):
    """Each annotation has the default fields from annotatorJs and a Page field
    which refers to"""
    annId = models.CharField(max_length=128, unique=True, editable=False)
    created = models.DateTimeField(auto_now_add=True, db_index=True)
    updated = models.DateTimeField(auto_now=True, db_index=True)
    text = models.TextField()
    quote = models.TextField()
    ranges = models.TextField()
    
    #custom
    permissions = models.TextField() 
    user = models.CharField(max_length=150, db_index=True)
    page = models.ForeignKey(Page, related_name="annotatedPage", db_index=True)

    def asDict(self):
        return {
                'id':self.annId, 'ranges':json.loads(self.ranges),
                'quote':self.quote, 'text':self.text,
                'user':self.user, 'permissions':json.loads(self.permissions)
                }

    def update_from_json(self, data):
        self.ranges = json.dumps(data["ranges"])
        self.quote = data["quote"]
        self.text = data["text"]
        self.updated = datetime.datetime.now()
        self.permissions = json.dumps(data["permissions"])
