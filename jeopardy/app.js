/** @format */

// categories is the main data structure for the app; it looks like this:
// [
//   {
//     title: "Math",
//     clues: [
//       { question: "2+2", answer: 4, showing: null },
//       { question: "1+1", answer: 2, showing: null },
//       ...
//     ],
//   },
//   {
//     title: "Literature",
//     clues: [
//       { question: "Hamlet Author", answer: "Shakespeare", showing: null },
//       { question: "Bell Jar Author", answer: "Plath", showing: null },
//       ...
//     ],
//   },
//   ...
// ]

function getRandClues(clues, count) {
  const shuffledClues = _.shuffle(clues);
  return shuffledClues.slice(0, count).map((clue) => ({
    question: clue.question,
    answer: clue.answer,
    showing: null,
    value: clue.value,
  }));
}

let categories = [];
/** Get NUM_CATEGORIES random category from API.
 *
 * Returns array of category ids
 */
async function getCategoryIds() {
  const totalCats = 28163;
  const catIds = new Set();
  while (catIds.size < 6) {
    const offset = _.random(0, totalCats - 1);
    const response = await axios.get(
      `https://jservice.io/api/categories?count=100&offset=${offset}`
    );
    const newIds = response.data.map((category) => category.id);
    newIds.forEach((id) => catIds.add(id));
  }
  return Array.from(catIds).slice(0, 6);
}

/** Return object with data about a category:
 *
 *  Returns { title: "Math", clues: clue-array }
 *
 * Where clue-array is:
 *   [
 *      { question: "Hamlet Author", answer: "Shakespeare", showing: null },
 *      { question: "Bell Jar Author", answer: "Plath", showing: null },
 *      ...
 *   ]
 */
async function getCategory(catId) {
  const response = await axios.get(
    `https://jservice.io/api/category?id=${catId}`
  );
  const catData = response.data;
  const cat = {
    title: catData.title,
    clues: getRandClues(catData.clues, 5), // Change the number of clues to display here
  };
  return cat;
}

/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <th> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */
async function fillTable() {
  const $table = $("<table>");
  const $thead = $("<thead>");
  const $tbody = $("<tbody>");

  const $headerRow = $("<tr>");
  categories.forEach((category) => {
    $("<th>").text(category.title).appendTo($headerRow);
  });
  $headerRow.appendTo($thead);
  $thead.appendTo($table);

  for (let i = 0; i < 5; i++) {
    const $bodyRow = $("<tr>");
    categories.forEach((category, categoryIndex) => {
      const clue = category.clues[i];
      const value = clue.value || 100;
      const $bodyCell = $("<td>").text(value).appendTo($bodyRow);
      $bodyCell.on("click", () => handleClick(categoryIndex, i, $bodyCell));
    });
    $bodyRow.appendTo($tbody);
  }

  $tbody.appendTo($table);
  $("#jeopardy").empty().append($table);
}
/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 */
function handleClick(evt) {
  const $cell = $(evt.target);
  const categoryIndex = $cell.index();
  const clueIndex = $cell.closest("tr").index();
  const clue = categories[categoryIndex].clues[clueIndex];

  if (clue.showing === null) {
    // Show the question
    $cell.text(clue.question).css("font-size", "1em");
    clue.showing = "question";
  } else if (clue.showing === "question") {
    // Show the answer
    $cell.text(clue.answer).css("font-size", "1em");
    clue.showing = "answer";
  }
  // If the clue is already showing the answer, do nothing
}

/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */
function showLoadingView() {
  $("#jeopardy").empty();
  $("#spin-container").show();
  $("#start").prop("disabled", true);
}

/** Remove the loading spinner and update the button used to fetch data. */
function hideLoadingView() {
  $("#spin-container").hide();
  $("#start").prop("disabled", false);
}

/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 */
async function setupAndStart() {
  showLoadingView();

  try {
    const categoryIds = await getCategoryIds();
    categories = await Promise.all(categoryIds.map(getCategory));
    fillTable();
  } catch (error) {
    console.error(error);
  }

  hideLoadingView();
}
/** On click of start / restart button, set up game. */

$("#start").on("click", setupAndStart);

/** On page load, add event handler for clicking clues */
$(document).ready(function () {
  $("#jeopardy").on("click", "td", handleClick);
});
// TODO
