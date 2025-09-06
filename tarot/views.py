import datetime
import random
import uuid

from django.conf import settings
from django.shortcuts import render, redirect
from django.templatetags.static import static
from markdown import markdown

from tarot.apps import TarotConfig
from tarot.forms import TarotForm, QuestionForm

position_map = {
    'positive': '正位',
    'negative': '逆位',
}

image_map = {
    'maj00.jpg': '愚人',
    'maj01.jpg': '魔術師',
    'maj02.jpg': '女祭司',
    'maj03.jpg': '皇后',
    'maj04.jpg': '皇帝',
    'maj05.jpg': '教皇',
    'maj06.jpg': '戀人',
    'maj07.jpg': '戰車',
    'maj08.jpg': '力量',
    'maj09.jpg': '隱者',
    'maj10.jpg': '命運之輪',
    'maj11.jpg': '正義',
    'maj12.jpg': '吊人',
    'maj13.jpg': '死神',
    'maj14.jpg': '節制',
    'maj15.jpg': '惡魔',
    'maj16.jpg': '塔',
    'maj17.jpg': '星星',
    'maj18.jpg': '月亮',
    'maj19.jpg': '太陽',
    'maj20.jpg': '審判',
    'maj21.jpg': '世界',
    'cups01.jpg': '聖杯Ace',
    'cups02.jpg': '聖杯2',
    'cups03.jpg': '聖杯3',
    'cups04.jpg': '聖杯4',
    'cups05.jpg': '聖杯5',
    'cups06.jpg': '聖杯6',
    'cups07.jpg': '聖杯7',
    'cups08.jpg': '聖杯8',
    'cups09.jpg': '聖杯9',
    'cups10.jpg': '聖杯10',
    'cups11.jpg': '聖杯侍從',
    'cups12.jpg': '聖杯騎士',
    'cups13.jpg': '聖杯皇后',
    'cups14.jpg': '聖杯國王',
    'pents01.jpg': '金幣Ace',
    'pents02.jpg': '金幣2',
    'pents03.jpg': '金幣3',
    'pents04.jpg': '金幣4',
    'pents05.jpg': '金幣5',
    'pents06.jpg': '金幣6',
    'pents07.jpg': '金幣7',
    'pents08.jpg': '金幣8',
    'pents09.jpg': '金幣9',
    'pents10.jpg': '金幣10',
    'pents11.jpg': '金幣侍從',
    'pents12.jpg': '金幣騎士',
    'pents13.jpg': '金幣皇后',
    'pents14.jpg': '金幣國王',
    'swords01.jpg': '寶劍Ace',
    'swords02.jpg': '寶劍2',
    'swords03.jpg': '寶劍3',
    'swords04.jpg': '寶劍4',
    'swords05.jpg': '寶劍5',
    'swords06.jpg': '寶劍6',
    'swords07.jpg': '寶劍7',
    'swords08.jpg': '寶劍8',
    'swords09.jpg': '寶劍9',
    'swords10.jpg': '寶劍10',
    'swords11.jpg': '寶劍侍從',
    'swords12.jpg': '寶劍騎士',
    'swords13.jpg': '寶劍皇后',
    'swords14.jpg': '寶劍國王',
    'wands01.jpg': '權杖Ace',
    'wands02.jpg': '權杖2',
    'wands03.jpg': '權杖3',
    'wands04.jpg': '權杖4',
    'wands05.jpg': '權杖5',
    'wands06.jpg': '權杖6',
    'wands07.jpg': '權杖7',
    'wands08.jpg': '權杖8',
    'wands09.jpg': '權杖9',
    'wands10.jpg': '權杖10',
    'wands11.jpg': '權杖侍從',
    'wands12.jpg': '權杖騎士',
    'wands13.jpg': '權杖皇后',
    'wands14.jpg': '權杖國王',
}


def question_view(request):
    name = request.POST.get('name')
    if name:
        context = {
            'name': name,
        }
    else:
        context = {}
    return render(request, 'question.html', context)


def pick(request):
    if request.method == 'POST':
        form = QuestionForm(request.POST)
        if form.is_valid():
            cards = get_cards()
            random.shuffle(cards)
            tarot_form = TarotForm(request.POST)
            context = {
                'cards': cards,
                'css_version': str(uuid.uuid4()),
                'form': tarot_form,
            }
            return render(request, 'tarot.html', context)
    return redirect('tarot:index')


def answer_view(request):
    if request.method == "POST":
        form = TarotForm(request.POST)
        if form.is_valid():
            name = form.cleaned_data["name"]
            question = form.cleaned_data["question"]
            answer = get_answer(name, question)
            context = {
                'name': name,
                'question': question,
                'answer': answer,
                'datetime': datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            }
            return render(request, 'answer.html', context)
    return redirect('tarot:index')


def get_cards():
    cards = list()
    url_prefix = f'{TarotConfig.name}/cards/'
    for i, (k, v) in enumerate(image_map.items()):
        position = random.choice(list(position_map.keys()))
        url = f'{url_prefix}{k}'
        alt = f'{position_map[position]}{v}'
        card = {
            'src': static(url),
            'alt': alt,
            'class': f'front {position}',
        }
        cards.append(card)
    return cards


def get_answer(name: str, question: str) -> str:
    client = settings.OPENAI_CLIENT
    completion = client.responses.create(
        model="gpt-4o",
        instructions=(
            "我要抽三張塔羅牌，分別對應過去、現在、未來的牌陣，"
            "你是一位資深塔羅牌占卜師，你的回答要親切且富有人性化"
            "請以給我三個標題：過去、現在、未來，每段 200–240 字綜合敘述牌義、牌面主要色彩分析、時間長短的影響、牌上元素的內容，"
            "接著最後一個標題：摘要結論跟建議。"
            "用markdown格式顯示，標題用h2。"
        ),
        input=f"我的名字是{name}，{question}",
        temperature=0.7,
    )
    answer = completion.output_text
    html = markdown(answer)

    return html
