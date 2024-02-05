//global variables to keep track of player score and games played
var careerScore = 0;
var totalGames = 0;
var gameScore = 0;

//count the questions to determine a full game
var cellsClicked = 0;
var cellsPerGame = 30;

// Function to update the display of player score and games played
function updateDisplay(data) {
  $('#scoreDisplay').text('Career Score: $' + careerScore);
  $('#gamesPlayedDisplay').text('Games Played: ' + totalGames);
  $('#gameScoreDisplay').text('Game Score: $' + gameScore);
}

$(document).ready(function() {
  $.ajax({
    url: '/get_user_data',
    method: 'GET',
    success: function(data) {
        if (data.error) {
            console.error('Error:', data.error);
        } else {
            // Update playerScore and totalGames with user data
            careerScore = data.money;
            totalGames = data.gamesplayed;
            // Update the display
            $('#scoreDisplay').text('Career Score: $' + careerScore);
            $('#gamesPlayedDisplay').text('Games Played: ' + totalGames);
        }
    },
    error: function(error) {
        console.error('Error:', error);
    }
});


  // Create gameboard with text, add event listners and overlay
  // Define the list of categories
  var categories = ['MUSIC', 'SPORT AND LEISURE', 'FILM AND TV', 'ARTS AND LITERATURE', 'HISTORY', 'SCIENCE'];

  // Create a table with 5 rows and 6 columns
  var table = buildTable(categories);

  // Append the table to the document body
  $('body').append(table);

  // Add a click event listener to the close button
  $('#overlay').on('click', '#closeButton', function() {
    // Hide the overlay when the close button is clicked
    $('#overlay').fadeOut();
  });

  // Add a click event listener to the cells
  $('td').on('click', function() {
    // Get the text content of the clicked cell
    var cellText = $(this).text();
    //extract the amount from the cell text
    var amount = parseInt(cellText.substring(1));
    // Get the cell ID
    var cellId = $(this).attr('id');

    // Make the AJAX request
    makeAjaxRequest(cellId, cellText);
  });
});


// Function to build the table
function buildTable(categories) {
  var table = $('<table>').addClass('game-table');

  // Create the header row with category names
  var headerRow = $('<tr>').addClass('game-tr-header');
  categories.forEach(function(category) {
    headerRow.append($('<th>').text(category));
  });
  table.append(headerRow);

  // Create 5 rows with 6 columns each
  for (var i = 0; i < 5; i++) {
    var row = $('<tr>').addClass('game-tr');
    for (var j = 0; j < 6; j++) {
      // Assign a unique ID to each cell using the pattern you described
      var cellId = (j * 10 + i).toString().padStart(2, '0');

      // Add data to the cell
      var cellValue = '$' + ((i + 1) * 100);
      var cell = $('<td>').text(cellValue).attr('id', cellId).addClass('game-td');
      row.append(cell);
    }
    table.append(row);
  }

  return table;
}

// Function to make AJAX request
function makeAjaxRequest(cellId, amount) {
  var { category, difficulty } = getCategoryAndDifficultyFromCellId(cellId);
  cellsClicked++;
  var ajaxSettings = {
    url: 'https://the-trivia-api.com/v2/questions',
    method: 'GET',
    data: {
      categories: category,
      limit: 1,
      difficulty: difficulty
    },
    success: function(data) {
      
      console.log('Question:', data);
      // Show the overlay with the cell text and a close button

      //take correct and incorrect answers and shuffle//
      var questionText = data[0].question.text;
      var incorrectAnswers = data[0].incorrectAnswers.map(answer => answer);
      var correctAnswer = data[0].correctAnswer;
      
      var allAnswers = incorrectAnswers.concat(correctAnswer);
      
      
      shuffleArray(allAnswers);

      var answerList = $('<ol>');
      allAnswers.forEach(answer => {
      var listItem = $('<li>').text(answer);
      listItem.on('click', function() {
      handleAnswerSelection(answer, correctAnswer, amount);
      });
      answerList.append(listItem);
      });

      // Remove text and click event from the clicked cell
      $('#' + cellId).text('').off('click');
      
      $('#overlay').html('<p>' + questionText + '</p><button id="closeButton">Close</button>').append(answerList).fadeIn();
    },

    error: function(error) {
      console.error('Error:', error);
    }
  };

  // Make the AJAX request
  $.ajax(ajaxSettings);
}

// Function to get category and difficulty from cell ID
function getCategoryAndDifficultyFromCellId(cellId) {
  // Extract the first and second digits from the cell ID
  var firstDigit = parseInt(cellId.charAt(0));
  var secondDigit = parseInt(cellId.charAt(1));

  // Map the first digit to a category
  var categoryMap = {
    0: 'music',
    1: 'sport_and_leisure',
    2: 'film_and_tv',
    3: 'arts_and_literature',
    4: 'history',
    5: 'science'
  };


  // Map the second digit to a difficulty
  var difficultyMap = {
    0: 'easy',
    1: 'easy',
    2: 'medium',
    3: 'medium',
    4: 'hard'
  };

  // Get the category and difficulty based on the mappings
  var category = categoryMap[firstDigit] || 'default';
  var difficulty = difficultyMap[secondDigit];
  
  return { category: category, difficulty: difficulty };
}

///shuffle array function for correct and incorrect answers///
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function handleAnswerSelection(selectedAnswer, correctAnswer, amount) {
  // Compare the selected answer to the correct answer
  if (selectedAnswer === correctAnswer) {
    alert('Correct!')
    careerScore += parseInt(amount.substring(1));
    gameScore += parseInt(amount.substring(1));
  } else {
    alert('Incorrect. The correct answer is: ' + correctAnswer)
    careerScore -= parseInt(amount.substring(1));
    gameScore -= parseInt(amount.substring(1));
  }
  updateDisplay();

  // Check if handleAnswerSelection has been called 30 times
  if (cellsClicked >= cellsPerGame) {
    // Update user info after the last question
    updateUserInfo(careerScore, totalGames, gameScore);

    // Reset cellsClicked, and gameScore for the next game
    cellsClicked = 0;
    gameScore = 0;

  }

  // updateDisplay();
  $('#overlay').fadeOut();
}


function updateUserInfo(careerScore, totalGames, gameScore) {
  $.ajax({
      url: '/update_user_data',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({
          careerScore: careerScore,
          totalGames: totalGames,
          gameScore: gameScore
      }),
      success: function(response) {
          console.log(response.message);
      },
      error: function(error) {
          console.error('Error updating user info:', error.responseText);
      }
  });
}




