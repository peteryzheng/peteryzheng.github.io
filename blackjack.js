const SUITS = ["S", "H", "D", "C"];
const RANKS = [
  { rank: "A", value: 11 },
  { rank: "2", value: 2 },
  { rank: "3", value: 3 },
  { rank: "4", value: 4 },
  { rank: "5", value: 5 },
  { rank: "6", value: 6 },
  { rank: "7", value: 7 },
  { rank: "8", value: 8 },
  { rank: "9", value: 9 },
  { rank: "10", value: 10 },
  { rank: "J", value: 10 },
  { rank: "Q", value: 10 },
  { rank: "K", value: 10 }
];

const STARTING_BALANCE = 500;
let balance = STARTING_BALANCE;
let currentBet = 0;
let playerHand = [];
let dealerHand = [];
let hideDealerHole = false;
let gameState = "idle";

const balanceEl = document.getElementById("balance");
const roundBetEl = document.getElementById("round-bet");
const statusEl = document.getElementById("status");
const dealerCardsEl = document.getElementById("dealer-cards");
const playerCardsEl = document.getElementById("player-cards");
const dealerTotalEl = document.getElementById("dealer-total");
const playerTotalEl = document.getElementById("player-total");
const betInputEl = document.getElementById("bet-input");
const dealBtn = document.getElementById("deal-btn");
const hitBtn = document.getElementById("hit-btn");
const standBtn = document.getElementById("stand-btn");
const restartBtn = document.getElementById("restart-btn");

function drawCard() {
  const rankMeta = RANKS[Math.floor(Math.random() * RANKS.length)];
  const suit = SUITS[Math.floor(Math.random() * SUITS.length)];
  return { ...rankMeta, suit };
}

function cardLabel(card) {
  const suitMap = { S: "♠", H: "♥", D: "♦", C: "♣" };
  return `${card.rank}${suitMap[card.suit] || ""}`;
}

function handValue(hand) {
  let total = 0;
  let aceCount = 0;

  hand.forEach((card) => {
    total += card.value;
    if (card.rank === "A") {
      aceCount += 1;
    }
  });

  while (total > 21 && aceCount > 0) {
    total -= 10;
    aceCount -= 1;
  }

  return total;
}

function isBlackjack(hand) {
  return hand.length === 2 && handValue(hand) === 21;
}

function currency(amount) {
  return `$${amount.toFixed(2).replace(/\\.00$/, "")}`;
}

function setStatus(message, tone = "") {
  statusEl.textContent = message;
  statusEl.className = `status${tone ? ` ${tone}` : ""}`;
}

function renderCards(container, hand, hideHoleCard) {
  container.innerHTML = "";
  hand.forEach((card, index) => {
    const cardEl = document.createElement("div");
    const isRed = card.suit === "H" || card.suit === "D";
    cardEl.className = `card${isRed ? " red" : ""}`;

    if (hideHoleCard && index === 1) {
      cardEl.className = "card back";
      cardEl.textContent = "X";
    } else {
      cardEl.textContent = cardLabel(card);
    }
    container.appendChild(cardEl);
  });
}

function updateControls() {
  const inRound = gameState === "player_turn";
  dealBtn.disabled = inRound || balance <= 0;
  hitBtn.disabled = !inRound;
  standBtn.disabled = !inRound;
  betInputEl.disabled = inRound;
}

function render() {
  balanceEl.textContent = currency(balance);
  roundBetEl.textContent = currency(currentBet);
  renderCards(dealerCardsEl, dealerHand, hideDealerHole);
  renderCards(playerCardsEl, playerHand, false);

  const dealerValue = hideDealerHole
    ? handValue(dealerHand.slice(0, 1))
    : handValue(dealerHand);
  dealerTotalEl.textContent = dealerHand.length ? `(${dealerValue})` : "";
  playerTotalEl.textContent = playerHand.length ? `(${handValue(playerHand)})` : "";

  updateControls();
}

function settleRound(result, message) {
  hideDealerHole = false;
  gameState = "round_over";

  if (result === "player_blackjack") {
    balance += currentBet * 2.5;
    setStatus(message, "win");
  } else if (result === "player_win") {
    balance += currentBet * 2;
    setStatus(message, "win");
  } else if (result === "push") {
    balance += currentBet;
    setStatus(message);
  } else {
    setStatus(message, "lose");
  }

  currentBet = 0;
  render();

  if (balance <= 0) {
    setStatus("You are out of chips. Press Restart Bank.", "lose");
  }
}

function dealerTurn() {
  hideDealerHole = false;

  while (handValue(dealerHand) < 17) {
    dealerHand.push(drawCard());
  }

  const dealerTotal = handValue(dealerHand);
  const playerTotal = handValue(playerHand);

  if (dealerTotal > 21) {
    settleRound("player_win", "Dealer busts. You win.");
    return;
  }
  if (dealerTotal > playerTotal) {
    settleRound("dealer_win", "Dealer wins.");
    return;
  }
  if (playerTotal > dealerTotal) {
    settleRound("player_win", "You win this round.");
    return;
  }
  settleRound("push", "Push.");
}

function startRound() {
  if (gameState === "player_turn") {
    return;
  }

  const bet = Number.parseInt(betInputEl.value, 10);
  if (!Number.isFinite(bet) || bet < 5) {
    setStatus("Minimum bet is $5.");
    return;
  }
  if (bet > balance) {
    setStatus("Bet exceeds your balance.");
    return;
  }

  currentBet = bet;
  balance -= currentBet;
  playerHand = [drawCard(), drawCard()];
  dealerHand = [drawCard(), drawCard()];
  hideDealerHole = true;
  gameState = "player_turn";

  if (isBlackjack(playerHand) && isBlackjack(dealerHand)) {
    settleRound("push", "Both have blackjack. Push.");
    return;
  }
  if (isBlackjack(playerHand)) {
    settleRound("player_blackjack", "Blackjack! Paid 3:2.");
    return;
  }
  if (isBlackjack(dealerHand)) {
    settleRound("dealer_win", "Dealer has blackjack.");
    return;
  }

  setStatus("Your move: hit or stand.");
  render();
}

function hit() {
  if (gameState !== "player_turn") {
    return;
  }

  playerHand.push(drawCard());
  const total = handValue(playerHand);

  if (total > 21) {
    settleRound("dealer_win", "Bust. Dealer wins.");
    return;
  }

  if (total === 21) {
    setStatus("21 reached. Dealer plays.");
    render();
    dealerTurn();
    return;
  }

  render();
}

function stand() {
  if (gameState !== "player_turn") {
    return;
  }
  setStatus("Dealer turn...");
  render();
  dealerTurn();
}

function restartBank() {
  balance = STARTING_BALANCE;
  currentBet = 0;
  playerHand = [];
  dealerHand = [];
  hideDealerHole = false;
  gameState = "idle";
  setStatus("Bank reset. Set your bet and deal.");
  render();
}

dealBtn.addEventListener("click", startRound);
hitBtn.addEventListener("click", hit);
standBtn.addEventListener("click", stand);
restartBtn.addEventListener("click", restartBank);

render();
