from django.db import models
from django.urls import reverse


class Ask(models.Model):
    name = models.CharField(max_length=128, null=True, blank=True)
    question = models.TextField()
    answer = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def get_absolute_url(self):
        return reverse("ask-detail", kwargs={"pk": self.pk})
