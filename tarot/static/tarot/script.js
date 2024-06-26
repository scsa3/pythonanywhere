let cardNumber = 100;
let deck = document.getElementById("cards-deck");
const spreadIds = ["past", "present", "future"];
const suits = [
    "maj",
    "cups",
    "pents",
    "swords",
    "wands",
]
const position = [
    "positive",
    "negative"
]
const details = createCardDetails();
main();


function main() {
    document.getElementById("id_submit").addEventListener("click", clickButton);
    // createCards();
    handleResize();
    window.addEventListener("resize", handleResize);
    document.getElementById("cards-deck").addEventListener('touchstart', handleTouchMove);
    document.getElementById("cards-deck").addEventListener('touchmove', handleTouchMove);
    // document.getElementById("cards-deck").addEventListener('touchend', handleTouchEnd);
}

function createCards() {
    for (let i = 0; i < details.length; i++) {
        let card = document.createElement("div");
        card.classList.add("card");
        card.addEventListener("click", clickCard);
        createBack(card);
        createFront(card, i);
        deck.appendChild(card);
    }
}

function createPosition(card, i) {
    let div = document.createElement("div");
    let position = details[i].position;
    div.classList.add(position);
    card.appendChild(div);
    return div;
}

function createBack(card) {
    let back = document.createElement("div");
    back.classList.add("back");
    card.appendChild(back);
}

function createFront(card, i) {
    let front = document.createElement("img");
    const detail = details[i];
    front.src = detail.src;
    front.classList.add("front");
    front.classList.add(detail.position);
    // front.addEventListener("click", clickCard);
    // front.addEventListener("touchend", clickCard);
    card.appendChild(front);
}

function handleResize() {
    let [y, rad, r] = getYRad();
    rad = rad * 0.9;
    let cards = document.getElementsByClassName("card");
    let radNumber = details.length + 1;
    let shiftRad = rad / radNumber;
    for (let i = 0; i < details.length; i++) {
        const thisRad = shiftRad * (i + 1) - rad / 2;
        let xPrefix;
        if (thisRad < 0) {
            xPrefix = -1;
        } else {
            xPrefix = 1;
        }
        const shiftX = r * Math.sin(thisRad);
        const shiftY = r * Math.cos(thisRad);
        const realY = r - shiftY;
        const realX = Math.round(deck.offsetWidth / 2 + shiftX);
        let rotate = shiftRad * (i + 1) - rad / 2;
        cards[i].style.left = `${Math.round(realX)}px`;
        cards[i].style.top = `${Math.round(realY)}px`;
        // cards[i].style.transform = `translateY(${y}px) rotate(${rotate}rad) translateY(${-y}px) rotate(${-rotate}rad)`;
    }
}

function getYRad() {
    const w = deck.offsetWidth;
    const h = deck.offsetHeight;
    let r = (h / 2) + (w ** 2 / 8 / h);
    let y = Math.round(r * 0.9);
    let rad = Math.asin(w / 2 / r) * 2;
    return [y, rad, r];
}

function clickCard(event) {
    if (event.target.classList.contains("back")) {
        return;
    }
    let cards = document.getElementsByClassName("card");
    cleanClass(cards, "chosen");
    let card = event.target;
    if (card.tagName === "IMG") {
        card = card.parentNode;
    }
    card.classList.add("chosen");
    card.classList.remove("on-spread");
    for (let id of spreadIds) {
        card.classList.remove(id);
    }
}

function handleTouchMove(event) {

    let cards = document.getElementsByClassName("card");
    cards = Array.from(cards);
    // cards = cards.reverse();
    let count = 0;
    let isAddChosen = true;
    for (let card of cards) {
        let rect = card.getBoundingClientRect();

        if (
            isTouchOnCard(rect, event) &&
            !card.classList.contains("on-spread") &&
            isAddChosen
        ) {
            event.preventDefault();
            card.classList.add("chosen");
            isAddChosen = false;
        } else {
            card.classList.remove("chosen");
        }
    }

}

function isTouchOnCard(rect, event) {
    let touchX = event.touches[0].clientX;
    let touchY = event.touches[0].clientY;
    return (
        touchX >= rect.left
        && touchX <= rect.left + rect.width / 2
        && touchY >= rect.top
        && touchY < rect.bottom
    )
}

function handleTouchEnd(event) {
    if (isTouchOnSpread(event)) {
        return;
    }
    let deck = document.getElementById("spread-deck");
    let chosenCard = getFirstElementByClass("chosen");
    let id = getFirstEmptySpreadId();
    if (chosenCard && id) {
        chosenCard.classList.remove("chosen");
        chosenCard.classList.add(id);
        chosenCard.classList.add("on-spread");
    }
    let spreadCards = document.getElementsByClassName("on-spread");
    if (spreadCards.length >= 3) {
    }
}


function clickButton(event) {
    document.getElementById("loadingOverlay").style.display = "flex";
    event.preventDefault();
    let questionPrefix = "我抽到";
    let past = document.querySelector(".past > img");
    questionPrefix += `過去${past.alt}`;
    let present = document.querySelector(".present > img");
    questionPrefix += `現在${present.alt}`;
    let future = document.querySelector(".future > img");
    questionPrefix += `未來${future.alt}。我想問`;
    let question = document.getElementById("id_question")
    question.value = `${questionPrefix}${question.value}`;
    console.log(question.value);
    console.log(document.getElementById("id_form"));
    document.getElementById("id_form").submit();
}

function isTouchOnSpread(event) {
    let touchY = event.changedTouches[0].clientY;
    let spreadDeck = document.getElementById("spread-deck");
    return touchY < spreadDeck.offsetHeight
}

function getFirstEmptySpreadId() {
    for (let id of spreadIds) {
        let card = getFirstElementByClass(id);
        if (!card) {
            return id;
        }
    }
}

function getFirstElementByClass(name) {
    const selector = `.${name}`;
    return document.querySelector(selector);
}

function clickSpread(spread) {
    let chosenCards = document.getElementsByClassName("chosen");
    for (let card of chosenCards) {
        card.classList.remove("chosen");
        card.classList.add(spread.id);
        card.classList.add("on-spread");
    }
}

function cleanClass(elements, name) {
    for (let e of elements) {
        e.classList.remove(name);
    }
}

function blink() {
    let spreads = document.getElementsByClassName("spread");
    for (let s of spreads) {
        if (s.classList.contains("have-card")) {
            continue;
        }
        s.classList.add("blink");
        setTimeout(() => {
            s.classList.remove("blink");
        }, 1000)
    }
}

class Detail {
    src;
    position;
}


function createCardDetails() {
    let srcs = [];
    let results = [];
    for (let suit of suits) {
        let start = 0;
        let end = 22;
        if (suit === "maj") {
            start = 0;
            end = 21;
        } else {
            start = 1;
            end = 14;
        }
        srcs = srcs.concat(getASuitSrcs(suit, start, end));
    }
    for (let src of srcs) {
        let result = {
            src: src,
            position: getRandomElement(position),
        }
        results.push(result);

    }
    return results;
}

function getASuitSrcs(suit, start, end) {
    let results = [];
    let srcPrefix = "/static/tarot/cards/";
    for (let i = start; i <= end; i++) {
        let number = i.toString().padStart(2, '0');
        let src = `${srcPrefix}${suit}${number}.jpg`
        results.push(src);
    }
    return results;
}

function getRandomElement(array) {
    const randomIndex = Math.floor(Math.random() * array.length);
    return array[randomIndex];
}

