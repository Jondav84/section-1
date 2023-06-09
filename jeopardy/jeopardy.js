/** @format */

const API_BASE_URL = "http://jservice.io/api/";
const NUM_OF_IDS = 28163;
const $jeopardy = $("#jeopardy");
let categories = [];
let gameOver = false;

async function getCategoryIds() {
  const catIds = [];
  while (catIds.length < 6) {
    const randNum = Math.floor(Math.random() * NUM_OF_IDS);
    const res = await axios({
      method: "get",
      url: `${API_BASE_URL}categories`,
      params: {
        count: 1,
        offset: randNum,
      },
    });
    if (catIds.includes(res.data[0].id)) {
      continue;
    }
    catIds.push(res.data[0].id);
  }
  return catIds;
}

async function getCategory(catIds) {
  for (const catId of catIds) {
    const res = await axios({
      method: "get",
      url: `${API_BASE_URL}category`,
      params: { id: catId },
    });
    const filteredClues = res.data.clues.filter(
      (clue) =>
        clue.answer.trim() !== "" &&
        clue.question.trim() !== "=" &&
        clue.question.trim() !== ""
    );
    const shuffled_clues = _.shuffle(filteredClues);
    const clues = shuffled_clues.slice(0, 2);
    clues.forEach((clue) => {
      const fixedAnswer = clue.answer
        .replace(/<\/?[^>']+(>|$)/g, "")
        .replace(/[^\w\s']/g, "");
      const fixedQuestion = clue.question
        .replace(/<\/?[^>']+(>|$)/g, "")
        .replace(/[^\w\s']/g, "");
      categories.push({
        category: res.data.title,
        question: fixedQuestion,
        answer: fixedAnswer,
      });
    });
  }
}

async function fillCard() {
  showGameArea();
  const $card = $("<div>").addClass("card");
  $card.appendTo($jeopardy);
  const $cardTop = $("<div>")
    .addClass("card-top")
    .attr("id", "top")
    .text(categories[0].category);
  const $cardBody = $("<div>")
    .addClass("card-body")
    .attr("id", "body")
    .text(categories[0].question);
  const $cardBottom = $("<div>")
    .addClass("card-bottom")
    .attr("id", "bottom")
    .text("?");
  $card.append($cardTop);
  $card.append($cardBody);
  $card.append($cardBottom);
}
function showGameArea() {
  $jeopardy.show();
}

function hideGameArea() {
  $jeopardy.hide();
}

function hideHeader() {
  $("header").hide();
}
function showHeader() {
  $("header").show();
}

function handleClick() {
  const top = $("#top");
  const body = $("#body");
  const bottom = $("#bottom");

  if (bottom.text() === "?") {
    bottom.text(categories[0].answer).css("color", "red");
  } else if (bottom.text() === categories[0].answer) {
    categories.shift();
    if (categories.length === 0) {
      $jeopardy.empty();
      alert("Game Over! Please start a new game");
      showHeader();
      gameOver = true;
      $(document).off("click", ".card", handleClick); // Unbind click event
    } else {
      top.text(categories[0].category);
      body.text(categories[0].question);
      bottom.text("?").css("color", "white");
    }
  }
}

function showLoadingView() {
  $("#spin-container").appendTo("body").show();
}

function hideLoadingView() {
  $("#spin-container").hide();
}

async function setupAndStart() {
  showLoadingView();
  categories.length = 0;
  const catIds = await getCategoryIds();
  await getCategory(catIds);
  categories = _.shuffle(categories);
  hideLoadingView();
  gameOver = false;
  $(document).on("click", ".card", handleClick); // Bind click event
  fillCard();
}

$("#start").on("click", () => {
  hideHeader();
  setupAndStart();
});

$(document).ready(function () {
  hideLoadingView();
  hideGameArea();
});
