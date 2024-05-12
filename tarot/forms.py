from django import forms


class QuestionForm(forms.Form):
    name = forms.CharField(label='name', max_length=100)
    question = forms.CharField(label='question', max_length=1000, widget=forms.Textarea())


class TarotForm(forms.Form):
    name = forms.CharField(label='name', max_length=100, widget=forms.HiddenInput())
    question = forms.CharField(label='question', max_length=1000, widget=forms.HiddenInput())