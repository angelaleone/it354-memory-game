$(document).ready(() => {
  $("#tabs").tabs({});
//test
  //container variables
  var cards = $("#cards");
  var numCards = $("#num_cards");
  var saveSettingsBtn = $("#save_settings");
  //for names
  var storedPlayerName = sessionStorage.getItem("playerName");
  if (storedPlayerName !== null && storedPlayerName !== "") {
    $("#player").text("Player: " + storedPlayerName);
    $("#player_name").val(storedPlayerName);
  }
  //for numCards
  var storedNumCards = parseInt(sessionStorage.getItem("numCards"));
  if (!isNaN(storedNumCards)) {
    $("#num_cards").val(storedNumCards);
  }

  //for high scorse
  var storedHighScore = parseFloat(sessionStorage.getItem("highScore"));
  if (!isNaN(storedHighScore)) {
    $("#high_score").text("High Score: " + storedHighScore.toFixed(1) + "%");
  }

  //settings logic
  saveSettingsBtn.click(function saveSettings() {
    var numCardsValue = parseInt(numCards.val());
    var playerName = $("#player_name").val();

    sessionStorage.setItem("playerName", playerName);
    sessionStorage.setItem("numCards", numCardsValue);
    console.log("this is the new number of cards: " + numCardsValue);
    console.log("this is the player's name: " + playerName);

    if (playerName !== null) {
      $("#player").text("Player: " + playerName);
    }

    location.reload();
  });

  //cards logic
  //generating the images array
  var imagesArray = [];
  var pairedCards = [];
  function generateImagesArray(numCards) {
    pairedCards = numCards / 2;
    for (var i = 1; i <= pairedCards; i++) {
      imagesArray.push("./images/card_" + i + ".png");
      imagesArray.push("./images/card_" + i + ".png");
    }
    shuffleArray(imagesArray);
    return imagesArray;
  }
  function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
  }

  //generating the cards array with the src attribute
  function generateCardsArray() {
    var currentDeck = []; //might not need this
    var numCards = parseInt(sessionStorage.getItem("numCards")) || 48;
    var cardImages = generateImagesArray(numCards);
    cards.empty();
    for (var i = 0; i < cardImages.length; i++) {
      var cardHTML =
        '<div class="card"><a class="card-id" id="' +
        cardImages[i] +
        '" href="#"> <img class="card-face" src="./images/back.png" alt=""></a></div>';
      cards.append(cardHTML);
      currentDeck.push(cardHTML);
    }
  }

  //clicking functionality
  var clickCounter = 0;
  var totalAttemptSelections = 0;
  var correctSelections = 0;
  var firstFlippedCard = null;

  $("#cards").on("click", ".card", function () {
    var clickedCard = $(this);
    $(this).addClass("flipped");
    clickCounter++;
    //check clickcounter
    if (clickCounter <= 2) {
      //if its less than 2
      var cardFace = clickedCard.find(".card-face");
      var newImageSrc = clickedCard.find("a").attr("id");
      cardFace.fadeOut(500, function () {
        cardFace.attr("src", newImageSrc);
        cardFace.fadeIn(500);
      });
      //1 click
      if (clickCounter === 1) {
        firstFlippedCard = clickedCard;
      }
      //2 clicks
      else if (clickCounter === 2) {
        totalAttemptSelections++;
        checkFlippedCards(clickedCard, firstFlippedCard);
        resetRound();
      }
    }
  });

  function checkFlippedCards(clickedCard, firstFlippedCard) {
    var clickedSrc = clickedCard.find(".card-id").attr("id");
    var firstSrc = firstFlippedCard.find(".card-id").attr("id");
    //match
    if (clickedSrc === firstSrc) {
      correctSelections++;
      console.log("correct selection count: " + correctSelections);
      setTimeout(function () {
        $(".card.flipped").each(function () {
          var flippedCard = $(this);
          flippedCard.find(".card-face").fadeOut(500, function () {
            flippedCard.find(".card-face").attr("src", "./images/blank.png");
            flippedCard.find(".card-face").slideDown(500, function () {
              flippedCard.removeClass("flipped");
            });
          });
        });
      }, 1000);
    }
    //no match
    else {
      setTimeout(function () {
        $(".card.flipped").each(function () {
          var flippedCard = $(this);
          flippedCard.find(".card-face").fadeOut(500, function () {
            flippedCard.find(".card-face").attr("src", "./images/back.png");
            flippedCard.find(".card-face").slideDown(500, function () {
              flippedCard.removeClass("flipped");
            });
          });
        });
      }, 1000);
    }
    checkForCompletion();
  }

  function resetRound() {
    clickCounter = 0;
    firstFlippedCard = null;
  }

  function checkForCompletion() {
    if (correctSelections >= parseInt(sessionStorage.getItem("numCards")) / 2) {
      var currentGameScore = (correctSelections / totalAttemptSelections) * 100;
      updateHighScore(currentGameScore);
    }
  }

  function updateHighScore(score) {
    var storedHighscore = parseFloat(sessionStorage.getItem("highScore"));
    if (isNaN(storedHighscore) || score > storedHighscore) {
      storedHighscore = score;
      sessionStorage.setItem("highScore", storedHighscore);
    }
    $("#high_score").text("High Score: " + storedHighscore.toFixed(1) + "%");
    sessionStorage.setItem("currentScore", score);
    $("#correct").text(
      "Percentage of Correct Selections: " + score.toFixed(1) + "%"
    );
  }

  function resetGame() {
    correctSelections = 0;
    totalAttemptSelections = 0;
    $(".card").removeClass("flipped");
    generateCardsArray();
  }

  $("#new_game").click(function () {
    resetGame();
  });

  generateCardsArray();
});
