from django import forms

class UploadFileForm(forms.Form):
    upload_file  = forms.FileField()
    path  = forms.CharField()
