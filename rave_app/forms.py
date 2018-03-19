from django import forms
import re
from django.contrib.auth.models import User
from django.core.exceptions import ObjectDoesNotExist

class RegistrationForm(forms.Form):

    username = forms.CharField(label='', max_length=30, widget=forms.TextInput(attrs={'class' : 'form-control', 'placeholder':'Enter username'}))
    password1 = forms.CharField(label='', widget=forms.PasswordInput(attrs={'class' : 'form-control', 'placeholder' : 'Enter Password'}))
    password2 = forms.CharField(label='', widget=forms.PasswordInput(attrs={'class' : 'form-control', 'placeholder' : 'Confirm Password'}))

    def clean_password2(self):
        if ('password1' in self.cleaned_data):
            password1 = self.cleaned_data['password1']
            password2 = self.cleaned_data['password2']

            if (password1 == password2):
                return password2
        raise forms.ValidationError('Passwords do NOT match.')

    def clean_username(self):
        username = self.cleaned_data['username']
        if (not re.search(r'^\w+$', username)):
            raise forms.ValidationError('Username can only contain alphanumeric characters and the underscore.')
        try:
            User.objects.get(username=username)
        except ObjectDoesNotExist:
            return username
        raise forms.ValidationError('Username is already taken.')
