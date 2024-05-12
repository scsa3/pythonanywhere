from django.db import models


class Tarot(models.Model):
    name = models.CharField(max_length=100, blank=True, null=True)
    question = models.CharField(max_length=1000, blank=True, null=True)
    answer = models.CharField(max_length=1000, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
