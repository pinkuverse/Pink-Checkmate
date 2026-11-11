
const game = new Chess();

const boardElement = document.getElementById("chessboard");
const statusElement = document.getElementById("gameStatus");
const historyElement = document.getElementById("moveHistory");
const moveCountElement = document.getElementById("moveCount");

const settingsModal = document.getElementById("settingsModal");
const promotionModal = document.getElementById("promotionModal");

let selectedSquare = null;
let legalMoves = [];
let pendingPromotion = null;
let lastMove = null;

let currentSkin = localStorage.getItem("blushSkin") || "classic";
let selectedSkin = currentSkin;

const skins = {
  classic: {
    w: {
      k: "♔", q: "♕", r: "♖",
      b: "♗", n: "♘", p: "♙"
    },
    b: {
      k: "♚", q: "♛", r: "♜",
      b: "♝", n: "♞", p: "♟"
    }
  },

  cat: {
    w: {
      k: "😺", q: "😸", r: "🐱",
      b: "😻", n: "😹", p: "🐾"
    },
    b: {
      k: "😼", q: "😿", r: "🐈‍⬛",
      b: "🙀", n: "😾", p: "🐾"
    }
  },

  bunny: {
    w: {
      k: "🐰", q: "🐇", r: "🐰",
      b: "🐇", n: "🐰", p: "🥕"
    },
    b: {
      k: "🐇", q: "🐰", r: "🐇",
      b: "🐰", n: "🐇", p: "🥕"
    }
  }
};

function getPieceSymbol(piece) {
  if (!piece) return "";

  return skins[currentSkin][piece.color][piece.type];
}

function renderBoard() {
  boardElement.innerHTML = "";

  const board = game.board();

  board.forEach((row, rowIndex) => {
    row.forEach((piece, colIndex) => {

      const square = document.createElement("button");

      const file = "abcdefgh"[colIndex];
      const rank = 8 - rowIndex;
      const squareName = file + rank;

      square.className = "square " +
        ((rowIndex + colIndex) % 2 === 0 ? "light" : "dark");

      square.dataset.square = squareName;
      square.setAttribute("aria-label", squareName);

      if (selectedSquare === squareName) {
        square.classList.add("selected");
      }

      if (
        lastMove &&
        (lastMove.from === squareName ||
         lastMove.to === squareName)
      ) {
        square.classList.add("last-move");
      }

      const possibleMove = legalMoves.find(
        move => move.to === squareName
      );

      if (possibleMove) {
        square.classList.add("legal");

        if (possibleMove.captured) {
          square.classList.add("capture");
        }
      }

      if (piece) {
        const pieceElement = document.createElement("span");

        pieceElement.className = "piece";
        pieceElement.textContent = getPieceSymbol(piece);

        square.appendChild(pieceElement);
      }

      square.addEventListener("click", () => {
        handleSquareClick(squareName);
      });

      boardElement.appendChild(square);
    });
  });

  updateGameInfo();
}

function handleSquareClick(squareName) {
  if (pendingPromotion || game.game_over()) return;

  const piece = game.get(squareName);

  // Select your own piece
  if (piece && piece.color === game.turn()) {
    selectedSquare = squareName;

    legalMoves = game.moves({
      square: squareName,
      verbose: true
    });

    renderBoard();
    return;
  }

  // Try moving to a selected square
  if (selectedSquare) {

    const matchingMoves = legalMoves.filter(
      move => move.to === squareName
    );

    if (matchingMoves.length === 0) {
      selectedSquare = null;
      legalMoves = [];
      renderBoard();
      return;
    }

    // Handle pawn promotion
    const promotionMoves = matchingMoves.filter(
      move => move.promotion
    );

    if (promotionMoves.length > 0) {
      pendingPromotion = {
        from: selectedSquare,
        to: squareName
      };

      showPromotionChoices();
      return;
    }

    makeMove({
      from: selectedSquare,
      to: squareName
    });
  }
}

function makeMove(move) {
  try {
    const result = game.move(move);

    if (!result) return;

    lastMove = {
      from: result.from,
      to: result.to
    };

    selectedSquare = null;
    legalMoves = [];
    pendingPromotion = null;

    promotionModal.classList.remove("show");

    renderBoard();

  } catch (error) {
    console.error("Move error:", error);
  }
}

// PAWN PROMOTION

function showPromotionChoices() {
  const choices = document.getElementById("promotionChoices");

  choices.innerHTML = "";

  ["q", "r", "b", "n"].forEach(type => {

    const button = document.createElement("button");

    button.className = "promotion-choice";

    const color = game.turn();

    button.textContent = getPieceSymbol({
      type: type,
      color: color
    });

    button.title = {
      q: "Queen",
      r: "Rook",
      b: "Bishop",
      n: "Knight"
    }[type];

    button.addEventListener("click", () => {
      makeMove({
        from: pendingPromotion.from,
        to: pendingPromotion.to,
        promotion: type
      });
    });

    choices.appendChild(button);
  });

  promotionModal.classList.add("show");
}

// GAME INFORMATION

function updateGameInfo() {

  const history = game.history();
  const turn = game.turn();

  moveCountElement.textContent = history.length;

  document.getElementById("currentSkin").textContent = {
    classic: "Classic",
    cat: "Cat collection 🐱",
    bunny: "Bunny collection 🐰"
  }[currentSkin];

  document.getElementById("whiteTurn")
    .classList.toggle("active", turn === "w");

  document.getElementById("blackTurn")
    .classList.toggle("active", turn === "b");

  if (game.in_checkmate()) {
    statusElement.textContent =
      "Checkmate! " +
      (turn === "w" ? "Black" : "White") +
      " wins! ♡";

  } else if (game.in_stalemate()) {
    statusElement.textContent = "Draw! Stalemate ♡";

  } else if (game.in_draw()) {
    statusElement.textContent = "It's a draw! ♡";

  } else if (game.in_check()) {
    statusElement.textContent =
      (turn === "w" ? "White" : "Black") +
      " is in check!";

  } else {
    statusElement.textContent =
      (turn === "w" ? "White" : "Black") +
      "'s turn ♡";
  }

  renderHistory(history);
}

function renderHistory(history) {
  historyElement.innerHTML = "";

  if (history.length === 0) {
    historyElement.innerHTML =
      '<p class="empty-history">Your story starts here...</p>';
    return;
  }

  for (let i = 0; i < history.length; i += 2) {

    const row = document.createElement("div");
    row.className = "move-item";

    const number = document.createElement("span");
    number.className = "move-number";
    number.textContent = (Math.floor(i / 2) + 1) + ".";

    const whiteMove = document.createElement("span");
    whiteMove.textContent = history[i];

    row.appendChild(number);
    row.appendChild(whiteMove);

    if (history[i + 1]) {
      const blackMove = document.createElement("span");
      blackMove.textContent = " " + history[i + 1];
      row.appendChild(blackMove);
    }

    historyElement.appendChild(row);
  }

  historyElement.scrollTop = historyElement.scrollHeight;
}

// UNDO

document.getElementById("undoBtn").addEventListener("click", () => {

  if (game.history().length === 0) return;

  game.undo();

  selectedSquare = null;
  legalMoves = [];
  pendingPromotion = null;

  const history = game.history({ verbose: true });

  lastMove = history.length
    ? {
        from: history[history.length - 1].from,
        to: history[history.length - 1].to
      }
    : null;

  promotionModal.classList.remove("show");

  renderBoard();
});

// RESTART

document.getElementById("restartBtn").addEventListener("click", () => {

  const confirmRestart = confirm(
    "Start a new chess game? ♡"
  );

  if (!confirmRestart) return;

  game.reset();

  selectedSquare = null;
  legalMoves = [];
  pendingPromotion = null;
  lastMove = null;

  promotionModal.classList.remove("show");

  renderBoard();
});

// SETTINGS MODAL

document.getElementById("settingsBtn").addEventListener("click", () => {
  selectedSkin = currentSkin;
  updateSkinSelection();
  settingsModal.classList.add("show");
});

document.getElementById("closeSettings").addEventListener("click", () => {
  settingsModal.classList.remove("show");
});

document.getElementById("saveSettings").addEventListener("click", () => {

  currentSkin = selectedSkin;

  localStorage.setItem("blushSkin", currentSkin);

  settingsModal.classList.remove("show");

  renderBoard();
});

document.querySelectorAll(".skin-option").forEach(button => {

  button.addEventListener("click", () => {

    selectedSkin = button.dataset.skin;

    updateSkinSelection();
  });
});

function updateSkinSelection() {

  document.querySelectorAll(".skin-option").forEach(button => {

    button.classList.toggle(
      "active",
      button.dataset.skin === selectedSkin
    );
  });
}

// CLOSE MODAL WHEN CLICKING OUTSIDE

settingsModal.addEventListener("click", event => {
  if (event.target === settingsModal) {
    settingsModal.classList.remove("show");
  }
});

// INITIALIZE

renderBoard();
