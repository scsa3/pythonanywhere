import os

from django.views.generic.detail import DetailView
from django.views.generic.edit import CreateView
from openai import OpenAI

from .models import Ask

LENORMAND_CARDS = [
    "Rider", "Clover", "Ship", "House", "Tree", "Clouds", "Snake",
    "Coffin", "Bouquet", "Scythe", "Whip", "Birds", "Child", "Fox",
    "Bear", "Stars", "Stork", "Dog", "Tower", "Garden", "Mountain",
    "Crossroads", "Mice", "Heart", "Ring", "Book", "Letter", "Man",
    "Woman", "Lily", "Sun", "Moon", "Key", "Fish", "Anchor", "Cross"
]


class AskDetailView(DetailView):
    model = Ask


class AskCreateView(CreateView):
    model = Ask
    fields = ['name', 'question']

    def form_valid(self, form):
        instance: Ask = form.save(commit=False)
        answer = get_answer(instance.question)
        instance.answer = answer
        instance.save()
        return super().form_valid(form)


def get_answer(question: str) -> str:
    client = OpenAI()
    completion = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system",
             "content": "你是一個雷諾曼占卜師，使用者會抽一張牌並由你來解釋"},
            {"role": "user", "content": question}
        ]
    )
    answer = completion.choices[0].message.content
    return answer
