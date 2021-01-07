//variables and constants
var gridNumber;
var aiType;
var gridSize;
const gridElement = document.getElementsByClassName("grid")[0];
const sizeSelector = document.getElementsByClassName("size-selector")[0];
const aiSelector = document.getElementsByClassName("ai-selector")[0];
const startButton = document.getElementsByClassName("start-button")[0];
const wonText = document.getElementsByClassName("won")[0];
const tiedText = document.getElementsByClassName("tied")[0];
const lostText = document.getElementsByClassName("lost")[0];
var won = 0;
var tied = 0;
var lost = 0;
var start = "x";
var gameGrid = [];
var cellCanBeSelected = false;
var filledCells = 0;

//initialize
window.onload = function() {
	changeSize(3);
	changeAI("random");
};

function init() {
	startButton.style.setProperty("background", "gainsboro");
	start = (Math.random() > 0.5) ? "x" : "o";
	gameGrid = [];
	cellCanBeSelected = false;
	filledCells = 0;

	for(var i = 0; i < gridNumber; i++) {
		gameGrid.push([]);
		gameGrid[i].push(new Array(gridNumber));
		for(var j = 0; j < gridNumber; j++) {
			gameGrid[i][j] = "free";
			document.getElementById(`grid-cell-${i * gridNumber + j}`).innerHTML = "";
			document.getElementById(`grid-cell-${i * gridNumber + j}`).style.setProperty("color", "black");
		}
	}
}

function changeSize(n) {
	gridNumber = n;
	gridSize = (395 / gridNumber) - 5;
	updateSize(gridNumber);
	init();
	//update selector
	const active = document.getElementById(n);
	const coords = active.getBoundingClientRect();
	const directions = {
		height: coords.height,
		width: coords.width,
		top: coords.top,
		left: coords.left
	};

	sizeSelector.style.setProperty("left", `${directions.left}px`);
	sizeSelector.style.setProperty("width", `${directions.width}px`);
	sizeSelector.style.setProperty("height", `${directions.height}px`);
	sizeSelector.style.setProperty("top", `${directions.top}px`);
}

function updateSize(n) {
	gridElement.id = "grid" + gridNumber;

	//removing prev cells
	while(gridElement.firstChild) {
		gridElement.removeChild(gridElement.lastChild);
	}

	for(let i = 0; i < gridNumber * gridNumber; i++) {
		gridElement.innerHTML += 
		`<div id="grid-cell-${i}" 
		class="grid-cell" onclick="selectCell(${i})" 
		style="width: ${gridSize}px;
		height: ${gridSize}px; 
		background: white; 
		cursor: pointer; 
		display: flex; 
		justify-content: center; 
		align-items: center; 
		font-size: ${gridSize * 3 / 4}px; 
		color: black;"></div>`;
	}
}

function changeAI(s) {
	aiType = s;
	init();

	//update selector
	const active = document.getElementById(s);
	const coords = active.getBoundingClientRect();
	const directions = {
		height: coords.height,
		width: coords.width,
		top: coords.top,
		left: coords.left
	};

	aiSelector.style.setProperty("left", `${directions.left}px`);
	aiSelector.style.setProperty("width", `${directions.width}px`);
	aiSelector.style.setProperty("height", `${directions.height}px`);
	aiSelector.style.setProperty("top", `${directions.top}px`);
}

function startGame() {
	init();
	
	startButton.style.setProperty("background", "tomato");

	if(start == "x")
		cellCanBeSelected = true;
	else
		(aiType == "random") ? selectRandom() : selectMiniMax();
}

function selectCell(n) {
	if(cellCanBeSelected && gameGrid[Math.floor(n / gridNumber)][n % gridNumber] == "free") {
		document.getElementById(`grid-cell-${n}`).innerHTML += "✘";
		//update grid
		gameGrid[Math.floor(n / gridNumber)][n % gridNumber] = "X";
		cellCanBeSelected = false;
		filledCells++;
		if(checkWinner(gameGrid, true) != "none")
			return;
		if(filledCells < gridNumber * gridNumber) {
			(aiType == "random") ? selectRandom() : selectMiniMax();
		}
	}
}

function getRandom() {
	return Math.floor(Math.random() * gridNumber);
}

function selectRandom() {
	var rndRow = getRandom();
	var rndColumn = getRandom();

	while(gameGrid[rndRow][rndColumn] != "free") {
		rndRow = getRandom();
		rndColumn = getRandom();
	}

	document.getElementById(`grid-cell-${rndRow * gridNumber + rndColumn}`).innerHTML += "◯";
	//update grid
	gameGrid[rndRow][rndColumn] = "O";
	filledCells++;
	if(checkWinner(gameGrid, true) != "none")
		return;
	if(filledCells < gridNumber * gridNumber)
		cellCanBeSelected = true;
}

function selectMiniMax() {
	//looping through grid looking for best move with minimax
	let bestScore = -Infinity;
	let bestI;
	let bestJ;
	let score;
	for(var i = 0; i < gridNumber; i++) {
		for(var j = 0; j < gridNumber; j++) {
			if(gameGrid[i][j] == "free") {
				//getting the score
				gameGrid[i][j] = "O";
				score = miniMax(gameGrid, 0, false);
				gameGrid[i][j] = "free";
				//if best score found
				if(score > bestScore) {
					bestScore = score;
					bestI = i;
					bestJ = j;
				}
			}
		}
	}

	//selecting cell
	document.getElementById(`grid-cell-${bestI * gridNumber + bestJ}`).innerHTML += "◯";
	//update grid
	gameGrid[bestI][bestJ] = "O";
	filledCells++;
	if(checkWinner(gameGrid, true) != "none")
		return;
	if(filledCells < gridNumber * gridNumber) {
		cellCanBeSelected = true;
	}
}

let scoreTable = {
	X: -1,
	O: 1,
	tie: 0
};

function miniMax(board, depth, isMax) {
	let winner = checkWinner(board, false);
	if(winner != "none") {
		return scoreTable[winner];
	}

	//heuristic evaluation
	if(gridNumber > 3 && depth == 3) {
		return Math.random() * 100;
	}

	//console.log(depth);

	if(isMax) {
		let bestScore = -Infinity;
		let score;
		for(let i = 0; i < gridNumber; i++) {
			for(let j = 0; j < gridNumber; j++) {
				if(board[i][j] == "free") {
					//getting the score
					board[i][j] = "O";
					score = miniMax(board, depth + 1, false);
					board[i][j] = "free";
					bestScore = Math.max(score, bestScore);
				}
			}
		}
		return bestScore;
	}
	else {
		let bestScore = Infinity;
		let score;
		for(let i = 0; i < gridNumber; i++) {
			for(let j = 0; j < gridNumber; j++) {
				if(board[i][j] == "free") {
					//getting the score
					board[i][j] = "X";
					score = miniMax(board, depth + 1, true);
					board[i][j] = "free";
					bestScore = Math.min(score, bestScore);
				}
			}
		}
		return bestScore;
	}
}

function checkWinner(board, output) {
	//check horizontally
	for(let i = 0; i < gridNumber; i++) {
		let st = board[i][0];
		let temp = st != "free";
		for(let j = 1; j < gridNumber; j++) {
			temp = (temp && (st == board[i][j]));
		}
		if(temp) {
			if(output) {
				(st == "X") ? (won++) : (lost++);
				//change winner state color
				for(let j = 0; j < gridNumber; j++) {
					document.getElementById(`grid-cell-${i * gridNumber + j}`).style.setProperty("color", "tomato");
				}
				endGame();
			}
			return st;
		}
	}

	//check vertically
	for(let i = 0; i < gridNumber; i++) {
		let st = board[0][i];
		let temp = st != "free";
		for(let j = 1; j < gridNumber; j++) {
			temp = (temp && (st == board[j][i]));
		}
		if(temp) {
			if(output) {
				(st == "X") ? (won++) : (lost++);
				//change winner state color
				for(let j = 0; j < gridNumber; j++) {
					document.getElementById(`grid-cell-${j * gridNumber + i}`).style.setProperty("color", "tomato");
				}
				endGame();
			}
			return st;
		}
	}

	//check the two diagonals - 1
	let st = board[0][0];
	let temp = st != "free";
	for(let i = 1; i < gridNumber; i++) {
		temp = (temp && (st == board[i][i]));
	}
	if(temp) {
		if(output) {
			(st == "X") ? (won++) : (lost++);
			//change winner state color
			for(let i = 0; i < gridNumber; i++) {
				document.getElementById(`grid-cell-${i * gridNumber + i}`).style.setProperty("color", "tomato");
			}
			endGame();
		}
		return st;
	}

	//check the two diagonals - 2
	st = board[gridNumber - 1][0];
	temp = st != "free";
	for(let i = 1; i < gridNumber; i++) {
		temp = temp && (st == board[gridNumber - 1 - i][i]);
	}
	if(temp) {
		if(output) {
			(st == "X") ? (won++) : (lost++);
			//change winner state color
			for(let i = 0; i < gridNumber; i++) {
				document.getElementById(`grid-cell-${(gridNumber - 1) * (i + 1)}`).style.setProperty("color", "tomato");
			}
			endGame();
		}
		return st;
	}

	let filled = 0;
	for(let i = 0; i < gridNumber; i++){for(let j = 0; j < gridNumber; j++){if(board[i][j] != "free"){filled++;}}}
	if(filled == gridNumber * gridNumber) {
		if(output) {
			tied++;
			endGame();
		}
		return "tie";
	}
	return "none";
}

function endGame() {
	cellCanBeSelected = false;
	startButton.style.setProperty("background", "gainsboro");

	//update scores
	wonText.innerHTML = won;
	tiedText.innerHTML = tied;
	lostText.innerHTML = lost;
}