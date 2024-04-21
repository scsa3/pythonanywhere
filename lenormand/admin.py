from django.contrib import admin

from lenormand.models import Ask


@admin.register(Ask)
class AskAdmin(admin.ModelAdmin):
    list_display = [
        'name',
        'question',
        'answer',
        'created_at',
    ]
