


var _TopDiv;
var _BotDiv;

var _MainTitle;

var _NewPlayerDiv;
var _Moniker;
var _MonikerButton;
var _MonikerLabel;

var _ControlPanelOne;
var _ThisPlayersButtons;
var _LeaderBoardButtons;


var _ControlPanelTwo;


var _ControlsSpan;
var _GameButtonsSpan;
var _TopLettersSpan;
var _Blocker;
var _Blocker2;

var _CompleteValue;
var _LayoutValue;
var _SpellingValue;

var _RemainingLetterCount = 144;


var _TimeIntervals = [];
var _ThisInterval;


var _ButtonsByLocation = new Object();
var _ButtonsByLetterNum = [];

var _SelectedButton;

var _MaxCol = 0;
var _MaxRow = 0;

var _NoSelect = true;

var _CurrentGame;
var _Letters = new Object();

var _PlayerGame;

function body_onload() {

    _TopDiv = document.getElementById("TopDiv");
    _BotDiv = document.getElementById("BotDiv");

    _MainTitle = document.getElementById("MainTitle");

    _ControlPanelOne = document.getElementById("ControlPanelOne");
    _ThisPlayersButtons = document.getElementById("ThisPlayersButtons");
    _LeaderBoardButtons = document.getElementById("LeaderBoardButtons");

    _ControlPanelTwo = document.getElementById("ControlPanelTwo");
    _GameButtonsSpan = document.getElementById("GameButtonsSpan");
    _TopLettersSpan = document.getElementById("TopLettersSpan");
    _Blocker = document.getElementById("Blocker");
    _Blocker2 = document.getElementById("Blocker2");
    _NewPlayerDiv = document.getElementById("NewPlayerDiv");
    _Moniker = document.getElementById("Moniker");
    _MonikerButton = document.getElementById("MonikerButton");
    _MonikerLabel = document.getElementById("MonikerLabel");

    _CompleteValue = document.getElementById("CompleteValue");
    _LayoutValue = document.getElementById("LayoutValue");
    _SpellingValue = document.getElementById("SpellingValue");



    if (_PlayerGuid == "*NEW") {
        // Get Player Moniker
        _NewPlayerDiv.style.display = "block";

    }

    else {
        createLetterButtons();
        createGameButtons();
        getPlayerAndGames();
    }

}

function getPlayerAndGames() {

    var fnSuccess = function (pag) {

        // Update Main Title
        _MainTitle.innerHTML = pag.Player.Moniker;

        _PlayerGame = pag;

        //TODO: If GameID > 10 and Player has not paid we need
        // to change the "Next Game" button to "Unlock $4.99" and if
        // pressed will go to PayPal.


        //Add recent games buttons
        for (var i = 0; i < 10; i++) {
            var btn = _ThisPlayersButtons.children[i + 1];
            if (btn) {
                btn.clear();
                var game = _PlayerGame.RecentGames[i];
                if (game) {
                    btn.setGame(game.PersonalGame);
                    btn.leaderboard = game.LeaderBoard;
                }
            }
        }

        _ControlPanelOne.style.display = "inline";


    }

    var fnError = function (err) {
        alert("getPlayer Failure: " + err);
    };

    PageMethods.GetPlayerAndGames(_PlayerGuid, fnSuccess, fnError);

}

function gameOver(boardXML) {

    var clearMessagesInterval = 4000;

    var fnSucess = function (leaderBoard) {
        location.reload(true);
    };

    var fnError = function (err) {
        _Blocker2.style.display = "none";
        alert("gameOver Failure: " + err);
    };

    var gameTime = 0;
    var interval = _TimeIntervals.pop();
    var elapsed = interval ? interval.elapsed : 0;

    while (elapsed > 0) {
        gameTime += elapsed;
        interval = _TimeIntervals.pop();
        elapsed = interval ? interval.elapsed : 0;
    }

    PageMethods.GameOver(_PlayerGame.Player.GameID, _PlayerGame.Player.PlayerID, gameTime, boardXML, fnSucess, fnError);

}

function startGame() {

    clearCurrentGame();

    // Update Main Title
    _MainTitle.innerHTML = _PlayerGame.Player.Moniker + " | Game " + _PlayerGame.Player.GameID;

    // Display 21 Letters
    for (var i = 0; i < 21; ++i) {
        var ltr = _PlayerGame.Player.Letters.substr(i, 1);
        var location = FirstBlankTopLocation();
        var btn = _ButtonsByLocation[location];
        btn.setValues(i, ltr);
        _RemainingLetterCount--;
    }


    _ControlPanelOne.style.display = "none";
    _ControlPanelTwo.style.display = "block";

    _NoSelect = false;

    _ThisInterval = new Object();
    _ThisInterval.begTime = new Date();
}

function buttonSelected() {

    if (_NoSelect) return;

    if ((!this.isTop) && (this.row == 0 || this.col == 0)) {
        makeMoreRoom(this);
        return;
    }

    if (_SelectedButton) {

        if (_SelectedButton != this) {

            var html = this.innerHTML;
            var id = this.letterNum;

            this.setValues(_SelectedButton.letterNum, _SelectedButton.innerHTML);
            _SelectedButton.setValues(id, html);


            compressTop();

        }

        _SelectedButton.classList.remove("Selected");
        _SelectedButton = null;

        //var test = isIslands(this.letterNum);
        //var debug = true;

    }

    else {
        _SelectedButton = this;
        _SelectedButton.classList.add("Selected");
    }
}

function swap() {

    if (_SelectedButton && _RemainingLetterCount > 0) {


        var pull = _RemainingLetterCount >= 3 ? 3 : _RemainingLetterCount;
        var beg = (144 - _RemainingLetterCount);
        var end = beg + pull;

        for (var i = beg; i < end; ++i) {
            var ltr = _PlayerGame.Player.Letters.substr(i, 1);
            var location = FirstBlankTopLocation();
            var btn = _ButtonsByLocation[location];
            btn.setValues(i, ltr);
            _RemainingLetterCount--;
        }


        _ButtonsByLetterNum[_SelectedButton.letterNum] = null;
        _SelectedButton.clear();
        _SelectedButton = null;

        compressTop();

    }
}

function verify() {

    var clearMessagesInterval = 4000;

    var fnSucess = function (result) {

        var isGoodSpelling = result[0] == "*VERIFIED";

        if (isGoodSpelling && isComplete && isGoodLayout) {
            gameOver(boardXML);
            return;
        }

        _SpellingValue.innerHTML = isGoodSpelling ? "GOOD" : result[0] + "?";


    }

    var fnError = function (err) {
        _Blocker2.style.display = "none";
        alert("CheckForWin Failure: " + err);
    };


    _CompleteValue.innerHTML = "?";
    _LayoutValue.innerHTML = "?";
    _SpellingValue.innerHTML = "?";


    _Blocker2.style.display = "block";

    _ThisInterval.endTime = new Date();
    _ThisInterval.elapsed = _ThisInterval.endTime - _ThisInterval.begTime;
    _TimeIntervals.push(_ThisInterval);


    var boardXML = getBoardAsXML();

    if (boardXML == "<Board></Board>")
    {
        _SpellingValue.innerHTML = "GOOD";
    }

    else PageMethods.Verify(boardXML, fnSucess, fnError);

    var isComplete = allTilesAreInPlay();
    var isGoodLayout = !thereAreWordIslands();
    _LayoutValue.innerHTML = isGoodLayout ? "GOOD" : "BAD";
    _CompleteValue.innerHTML = isComplete ? "YES" : "NO";

}

function verify_complete() {
    _Blocker2.style.display = "none";
    _ThisInterval = new Object();
    _ThisInterval.begTime = new Date();
}


function AddPlayer() {
    
    var fnSucess = function (result) {
        if (result.trim() == "*TAKEN") {
            _MonikerLabel.innerHTML = "Taken. Try again...";
            _Moniker.select();
            _MonikerButton.style.display = "block";
            return false;
        }

        else {
            window.location.href = "default.aspx?id=" + result;
        }

    }

    var fnError = function (err) {
        _Blocker2.style.display = "none";
        alert("Add Player Failure: " + err);
    };

    PageMethods.AddPlayer(_Moniker.value, fnSucess, fnError);
    _MonikerButton.style.display = "none";

}

function createGameButtons() {

    var rankingText = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th"]

    for (var i = 0; i < 20; i++) {
        var btn;
        var blank = "&nbsp;";

        btn = document.createElement("button");
        btn.type = "button";
        btn.className = "Control";
        btn.innerHTML = blank;
        btn.leaderboard;
        btn.isTopRow = (i < 10);

        btn.onclick = showGame;


        btn.clear = function () {
            this.style.display = "none";
            this.gameID = 0;
            this.gamePlayerID = 0;
            this.gameTimeMilli = 0;
            this.ranking = 0;
            this.innerHTML = "";
        }

        btn.setGame = function (game) {
            this.gameID = game.GameID;
            this.gamePlayerID = game.GamePlayerID;
            this.gameTimeMilli = game.GameTimeMilli;
            this.Moniker = game.Moniker;
            this.ranking = game.Ranking;
            if (this.isTopRow) {
                //this.innerHTML = game.Moniker + " " + game.GameID;
                this.innerHTML = "Game " + game.GameID;
            }
            else {
                //this.innerHTML = game.Moniker + " " + rankingText[game.Ranking - 1];
                this.innerHTML = rankingText[game.Ranking - 1] + " Place";
            }
            this.style.display = "inline";
        }


        btn.clear();
        if (i < 10) _ThisPlayersButtons.appendChild(btn);
        else _LeaderBoardButtons.appendChild(btn);

    }
}

function createLetterButtons() {

    var btn;
    var location;

    var idBase = "R{0}C{1}";

    //Bot
    for (var row = 0; row < 100; row++) {

        var rowDiv = document.createElement("div");
        rowDiv.className = "RowDiv";
        _BotDiv.appendChild(rowDiv);

        for (var col = 0; col < 100; col++) {

            var strRow = (row < 10) ? "0" + row.toString() : row.toString();
            var strCol = (col < 10) ? "0" + col.toString() : col.toString();
            location = idBase.replace("{0}", strRow).replace("{1}", strCol);

            btn = createButton(location);

            rowDiv.appendChild(btn);

        }

    }

    //Top
    for (var pos = 0; pos < 144; pos++) {
        location = getTopLocation(pos);
        btn = createButton(location);
        _TopLettersSpan.appendChild(btn);
    }
}

function createButton(location) {

    var btn;
    var blank = "&nbsp;";

    btn = document.createElement("button");
    btn.type = "button";
    btn.innerHTML = blank;
    btn.onclick = buttonSelected;

    btn.letterNum = -1;
    btn.location = location;

    btn.row = Number(location.substr(1, 2));
    btn.col = Number(location.substr(4, 2));

    btn.isTop = location.substr(0, 3) == "TOP";

    btn.className = btn.isTop ? "Top_Off" : "Bot_Off";

    btn.isBlank = function () {
        return this.innerHTML == blank;
    }

    btn.clear = function () {
        this.setValues(-1, blank);
    }

    btn.setValues = function (letterNum, letter) {

        this.innerHTML = letter;
        this.letterNum = letterNum;

        this.className = (this.isTop
               ? this.isBlank() ? "Top_Off" : "Top_On"
               : this.isBlank() ? "Bot_Off" : "Bot_On"
            )

        _ButtonsByLetterNum[letterNum] = this;

        if ((!this.isTop) && letter != blank) {
            if (this.row > _MaxRow) {
                _MaxRow = this.row;
            }
            if (this.col > _MaxCol) {
                _MaxCol = this.col;
            }
        }

    }

    _ButtonsByLocation[location] = btn;

    btn.testForIslands = function () {
        if (this.isTested) return;
        this.isTested = true;
        if (this.lsib && !this.lsib.isBlank()) {
            this.isIsland = false;
            this.lsib.testForIslands();
        }
        if (this.tsib && !this.tsib.isBlank()) {
            this.isIsland = false;
            this.tsib.testForIslands();
        }
        if (this.rsib && !this.rsib.isBlank()) {
            this.isIsland = false;
            this.rsib.testForIslands();
        }
        if (this.bsib && !this.bsib.isBlank()) {
            this.isIsland = false;
            this.bsib.testForIslands();
        }
    }



    if (!btn.isTop) {

        var loc;

        if (btn.row > 0) {
            loc = getBotLocation(btn.row - 1, btn.col);
            if (_ButtonsByLocation[loc]) {
                btn.tsib = _ButtonsByLocation[loc];
                btn.tsib.bsib = btn;
            }
        }

        if (btn.col > 0) {
            loc = getBotLocation(btn.row, btn.col - 1);
            if (_ButtonsByLocation[loc]) {
                btn.lsib = _ButtonsByLocation[loc];
                btn.lsib.rsib = btn;
            }
        }


    }

    return btn;

}

function showGame() {

    clearCurrentGame();
    _CurrentGame = this;

    var fnSucess = function (result) {
        _Letters[_CurrentGame.gamePlayerID] = result;
        showGame2();
    };

    var fnError = function (err) {
        _Blocker.style.display = "none";
        alert("showGame Failure: " + err);
    };


    _Blocker.style.display = "block";
    _NoSelect = true;


    //Update leaderboard buttons
    if (_CurrentGame.leaderboard) {
        for (var i = 0; i < 10; i++) {
            var btn = _LeaderBoardButtons.children[i + 1];
            if (btn) {
                btn.clear();
                var lbgame = _CurrentGame.leaderboard[i];
                if (lbgame) {
                    btn.setGame(lbgame);
                }
            }
        }
    }


    if (_Letters[_CurrentGame.gamePlayerID]) {
        showGame2();
    }
    else {
        PageMethods.GetBoard(_CurrentGame.gamePlayerID, fnSucess, fnError);
    }


}

function clearCurrentGame() {

    if (_CurrentGame) {

        var letters = _Letters[_CurrentGame.gamePlayerID];

        for (var i = 0; i < letters.length; i++) {
            _ButtonsByLetterNum[i] = null;
            var btn = _ButtonsByLocation[letters[i].Loc];
            btn.clear();

        }

    }
}

function showGame2() {

    _Blocker.style.display = "none";

    // Update Main Title
    _MainTitle.innerHTML = _CurrentGame.Moniker + " | " + _CurrentGame.innerHTML + " | " + msToTime(_CurrentGame.gameTimeMilli);

    var letters = _Letters[_CurrentGame.gamePlayerID];

    for (var i = 0; i < letters.length; i++) {
        var btn = _ButtonsByLocation[letters[i].Loc];
        btn.setValues(i, letters[i].Letter);
    }

}

function msToTime(milli) {

    var second = 1000; //milliseconds
    var minute = second * 60;
    var hour = minute * 60;
    var returnVal = "";
    
    var hours = Math.floor(milli / hour);
    milli -= hours * hour;
    
    var minutes = Math.floor(milli / minute);
    milli -= minutes * minute;

    var seconds = Math.floor(milli / second);
    milli -= seconds * second;
    
    var text_hours = (hours < 10) ? "0" + hours.toString() : hours.toString();
    var text_minutes = (minutes < 10) ? "0" + minutes.toString() : minutes.toString();
    var text_seconds = (seconds < 10) ? "0" + seconds.toString() : seconds.toString();

    var text_milli = (milli < 100) ? "0" + milli.toString()
                : (milli < 10) ? "00" + milli.toString()
                : (milli < 1) ? "000" + milli.toString()
                : milli.toString()

    if (hours > 0) returnVal = text_hours;
    
    if (minutes > 0 || returnVal > ""){
        if (returnVal > "") returnVal += ":";
        returnVal += text_minutes;
    }
    if (seconds > 0 || returnVal > "") {
        if (returnVal > "") returnVal += ":";
        returnVal += text_seconds;
    }

    if (milli > 0 || returnVal > "") {
        if (returnVal > "") returnVal += ".";
        returnVal += text_milli;
    }
    
    return returnVal;
}

function clearAllLetterButtons() {
    for (var letterNum = 0; letterNum < 144 ; ++letterNum) {
        if (_ButtonsByLetterNum[letterNum]) {
            var btn = _ButtonsByLetterNum[letterNum];
            if (btn) btn.clear();
        }
    }
}

function FirstBlankTopLocation() {

    var location;

    for (var pos = 0; pos < 144; pos++) {
        location = getTopLocation(pos);
        var btn = _ButtonsByLocation[location];
        if (btn.isBlank()) {
            return location;
        }
    }


}

function getTopLocation(position) {

    var location = "TOP" + (
        (position < 10)
        ? "00" + position.toString()
        : "0" + position.toString()
    );

    return location;
}

function getBotLocation(row, col) {

    var location = "R" + (
        (row < 10)
        ? "0" + row.toString()
        : row.toString()
    );

    location += "C" + (
        (col < 10)
        ? "0" + col.toString()
        : col.toString()
    );

    return location;
}

function allTilesAreInPlay() {

    for (var pos = 0; pos < 144; pos++) {
        var location = getTopLocation(pos);
        var btn = _ButtonsByLocation[location];
        if (!btn.isBlank()) return false;
    }

    return true;
}

function thereAreWordIslands() {

    var firstLetterNum = 0;

    //reset isTested flags
    for (var letterNum = 0; letterNum < 144 ; ++letterNum) {
        if (_ButtonsByLetterNum[letterNum]) {
            var btn = _ButtonsByLetterNum[letterNum];
            if (!btn.isTop) {
                btn.isTested = false;
                btn.isIsland = true;
                if (firstLetterNum == 0) firstLetterNum = letterNum;
            }
        }
    }


    //recursively set isIsland flags
    var btn = _ButtonsByLetterNum[firstLetterNum];
    btn.testForIslands();


    //check for remaining isIsland flags
    for (var letterNum = 0; letterNum < 144 ; ++letterNum) {
        if (_ButtonsByLetterNum[letterNum]) {
            var btn = _ButtonsByLetterNum[letterNum];
            if (!btn.isTop && btn.isIsland) {
                return true;
            }
        }
    }

    return false;
}

function getBoardAsXML() {

    var xml = "<Board>";

    //convert all letters to xml
    for (var letterNum = 0; letterNum < 144 ; ++letterNum) {

        if (_ButtonsByLetterNum[letterNum]) {
            var btn = _ButtonsByLetterNum[letterNum];
            if (!btn.isTop) {
                xml += "<LetLoc>";
                xml += "<Let>" + btn.innerHTML + '</Let>';
                xml += "<Loc>" + btn.location + '</Loc>';
                xml += "</LetLoc>";
            }
        }
    }

    xml += '</Board>';

    return xml;

}

function compressTop() {
    var shifted = true;
    while (shifted) {
        shifted = false;
        for (var pos = 1; pos < 144; pos++) {
            var location1 = getTopLocation(pos - 1);
            var location2 = getTopLocation(pos);
            var btn1 = _ButtonsByLocation[location1];
            var btn2 = _ButtonsByLocation[location2];
            if (btn1.isBlank() && !btn2.isBlank()) {
                btn1.setValues(btn2.letterNum, btn2.innerHTML)
                btn2.clear();
                shifted = true;
            }
        }
    }

}

function makeMoreRoom(btn) {

    if (btn.isTop) return;

    var row = 0;
    var col = 0;
    var colOffset = 0;
    var rowOffset = 0;
    var from;
    var to;
    var fbtn;
    var tbtn;

    if (btn.row > 0 && btn.col > 0) return;

    if (btn.row == 0) colOffset = 1;
    if (btn.col == 0) rowOffset = 1;

    for (var row = _MaxRow + 1; row > btn.row; --row) {
        for (var col = _MaxCol + 1; col > btn.col; --col) {

            from = getBotLocation(row - rowOffset, col - colOffset);
            to = getBotLocation(row, col);
            fbtn = _ButtonsByLocation[from];
            tbtn = _ButtonsByLocation[to];
            tbtn.setValues(fbtn.letterNum, fbtn.innerHTML);
            fbtn.clear();
            var debug = true;
        }
    }
}

function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
}

function drop(ev) {
    ev.preventDefault();
    var id = ev.dataTransfer.getData("text");
    var obj = document.getElementById(id);
    ev.target.src = obj.src;
    obj.src = "/images/transparent.png";
}

