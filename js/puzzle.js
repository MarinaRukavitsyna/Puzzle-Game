var puzzle = function (rootElId, imgSrc, rowCount, colCount) {
    "use strict";
    var PUZZLE_HOVER_COLOR = 'lightgreen';

    var self = this,
        _canvas,
        _canvasCtx,
        _rootElId,
        _mouse,
        _img,
        _tiles,
        _rowCount,
        _colCount,
        _puzzleWidth,
        _puzzleHeight,
        _tileWidth,
        _tileHeight,
        _currentTile,
        _currentDropTile,
        _progressTextID,
        _progressBrickID;

    function init() {
        if (document.getElementById(rootElId).length === 0) {
            console.log("tile with " + rootElId + "ID does not exist");
            throw new Error("tile with " + rootElId + "ID does not exist");
        }
        else {
            _rootElId = rootElId;

            _img = new Image();
            _img.addEventListener('load', createPuzzleBoard, false);
            _img.src = imgSrc;
        }
    }

    self.setPuzzleBoardOptions = function (rowCount, colCount, puzzleWidth, puzzleHeight) {
        _rowCount = rowCount;
        _colCount = colCount;
        _puzzleWidth = puzzleWidth;
        _puzzleHeight = puzzleHeight;
        _tileWidth = Math.floor(puzzleWidth / colCount);
        _tileHeight = Math.floor(puzzleHeight / rowCount);
    }

    self.setPuzzleBoardDimention = function (rowCount, colCount) {
        _rowCount = rowCount;
        _colCount = colCount;
    }

    self.setPuzzleBoardSize = function (puzzleWidth, puzzleHeight) {
        _puzzleWidth = puzzleWidth;
        _puzzleHeight = puzzleHeight;
        _tileWidth = Math.floor(puzzleWidth / colCount);
        _tileHeight = Math.floor(puzzleHeight / rowCount);
    }

    function createPuzzleBoard(e) {
        document.getElementById(_rootElId).appendChild(_img);
        if ("ontouchstart" in document.documentElement) 
            initPuzzleBoardBasedOnMobileSize(4, 4);
        else
            initPuzzleBoardBasedOnImage(4, 4);

        createStartGameCounter();

        window.setTimeout(function () {
            createFrame();
            initCanvas();
            initPuzzle();
            initTiles(); // TO-DO: support MSPointer events for Win 

            createProgressBar();
            createPuzzleTiles();

            // TO-DO: start game by timer or when a user clicks a canvas
            window.setTimeout(function () {
                startGame(21000);
            }, 1500);
        }, 3500);
    }

    function startGame(durationAnimation) {
        var height = _puzzleHeight - 45, // animBrickMarginTop = 45
            newMarginTop = 3,
            counter = durationAnimation / 1000,
            pElelement = document.getElementById(_progressTextID),
            brick = document.getElementById(_progressBrickID);

        pElelement.innerHTML = counter;
        var timer = setInterval(function () {
            pElelement.innerHTML = counter--;
            if (counter === -1) {
                clearInterval(timer);
                gameOver(); // TO-DO: decide what should happen when a game is over
                return;
            }
        }, 1000);

        var start = Date.now(),
            fps = 24,
            progress = height / (durationAnimation / fps);

        var progressStep = setInterval(function () {
            var timePassed = Date.now() - start;

            if (timePassed >= durationAnimation + 100) {
                brick.style.height = '0px';
                clearInterval(progressStep);
                return;
            }
            drawProgress();
        }, fps);

        function drawProgress() {
            if (height <= 0) {
                brick.style.height = '0px';
                return;
            }

            height = height - progress;
            newMarginTop = newMarginTop + progress;

            brick.style.marginTop = newMarginTop + 'px';
            brick.style.height = height + 'px';
        }
    }

    function createStartGameCounter() {
        // hide a browser scroll bar in IE to fix the IE issue
        document.body.style.overflow = "hidden";

        var rootElement = document.getElementById(_rootElId);
        rootElement.style.position = "relative";
        rootElement.style.width = _puzzleWidth + "px";
        rootElement.style.height = _puzzleHeight + "px";

        var pElelement = document.createElement("p");
        pElelement.style.position = "absolute";
        pElelement.style.top = "50%";
        pElelement.style.left = "50%";
        pElelement.style.margin = "0px";
        pElelement.style.transform = "translate(-50%, -50%)";
        pElelement.style.color = "white";
        pElelement.style.textShadow = "5px 5px 6px #000000";

        document.getElementById(_rootElId).appendChild(pElelement);

        var startMSec = performance.now(),
            durationAnimation = 3000,
            progress = 0,
            fontSize1 = 0, fontSize2 = 0, fontSize3 = 0,
            opacity1 = 1, opacity2 = 1, opacity3 = 1;

        function counter(currentMSec) {
            progress = currentMSec - startMSec;

            if (progress >= 0 && progress <= 1000) {
                pElelement.innerHTML = 3;
                fontSize1 = fontSize1 + 10;
                pElelement.style.fontSize = fontSize1 + "px";
                opacity1 = (opacity1 > 0) ? opacity1 - 0.02 : 0,
                pElelement.style.opacity = opacity1;
            }
            else
                if (progress >= 1001 && progress <= 2000) {
                    pElelement.innerHTML = 2;
                    fontSize2 = fontSize2 + 10;
                    pElelement.style.fontSize = fontSize2 + "px";
                    opacity2 = (opacity2 > 0) ? opacity2 - 0.02 : 0,
                    pElelement.style.opacity = opacity2;
                }
                else {
                    pElelement.innerHTML = 1;
                    fontSize3 = fontSize3 + 10;
                    pElelement.style.fontSize = fontSize3 + "px";
                    opacity3 = (opacity3 > 0) ? opacity3 - 0.02 : 0,
                    pElelement.style.opacity = opacity3;
                }

            if (progress < durationAnimation) {
                requestAnimationFrame(counter);
            }
            else
                document.body.style.overflow = "initial";

        }

        requestAnimationFrame(counter);
    }

    function initPuzzleBoardBasedOnImage(rowCount, colCount) {
        var puzzleWidth = _img.offsetWidth,
            puzzleHeight = _img.offsetHeight;
        self.setPuzzleBoardOptions(rowCount, colCount, puzzleWidth, puzzleHeight);
    }

    function initPuzzleBoardBasedOnMobileSize(rowCount, colCount) {
        var ratio = Math.min(screen.width / _img.width, screen.height / _img.height);
        var puzzleWidth = _img.width * ratio,
            puzzleHeight = _img.height * ratio;

        _img.width = puzzleWidth;
        _img.height = puzzleHeight;
        self.setPuzzleBoardOptions(rowCount, colCount, puzzleWidth, puzzleHeight);
    }

    function createFrame() {
        var rootElement = document.getElementById(_rootElId);
        rootElement.style.overflow = "auto";
        rootElement.style.width = (_puzzleWidth + 100) + "px";
        rootElement.style.height = (_puzzleHeight + 50) + "px";

        var prefixes = ['-o-', '-ms-', '-moz-', '-webkit-', ''];
        for (var i = 0; i < prefixes.length; i++) {
            rootElement.style.background = prefixes[i] + 'linear-gradient(45deg,#DCDCDC, #DCDCDC 9%, #FDFDFD)';
        }
    }

    function createProgressBar() {
        var rootElement = document.getElementById(_rootElId),
            barContainer = document.createElement('div'),
            brickContainer = document.createElement('div'),
            img = document.createElement('img'),
            brick = document.createElement('div'),
            pElelement = document.createElement("p");

        var barMarginTop = 20,
            brickMarginTop = 3,
            animBrickMarginTop = 45,
            brickHeight = _puzzleHeight - animBrickMarginTop,
            barHeight = _puzzleHeight,
            barWidth = 40,
            imgSize = 35;

        _progressTextID = "progressTextID";
        _progressBrickID = "progressBrickID";

        // the progressBar container
        barContainer.style.width = barWidth + "px";
        barContainer.style.height = barHeight + "px";
        barContainer.style.marginTop = barMarginTop + "px";
        barContainer.style.marginRight = 20 + "px";
        barContainer.style.cssFloat = "right";
        rootElement.appendChild(barContainer);

        // the Close image
        img.src = "images/cancel_button.png";
        img.style.width = imgSize + "px";
        img.style.height = imgSize + "px";
        img.style.margin = "auto";
        img.style.display = "block";
        barContainer.appendChild(img);

        // the progress container
        brickContainer.style.width = barWidth + "px";
        brickContainer.style.height = brickHeight + (brickMarginTop * 2) + "px";
        brickContainer.style.marginRight = 20 + "px";
        brickContainer.style.marginTop = 10 + "px";
        brickContainer.style.border = "2px solid #b0c6ef";
        brickContainer.style.position = "relative";
        barContainer.appendChild(brickContainer);

        // the progress tile
        brick.style.width = barWidth - 6 + "px";
        brick.style.height = brickHeight + "px";
        brick.style.background = "#768ed4";
        brick.style.margin = "auto";
        brick.style.marginTop = brickMarginTop + "px";
        brick.id = _progressBrickID;
        brickContainer.appendChild(brick);

        // counter
        pElelement.style.font = "25px arial";
        pElelement.style.width = barWidth + "px";
        pElelement.style.position = "absolute";
        pElelement.style.bottom = 0;
        pElelement.style.margin = "0px 0px 10px 0px";
        pElelement.style.color = "white";
        pElelement.style.textAlign = "center";
        pElelement.id = _progressTextID;
        brickContainer.appendChild(pElelement);

    }

    function initCanvas() {
        _canvas = document.createElement('canvas');
        _canvasCtx = _canvas.getContext('2d');
        _canvas.width = _puzzleWidth;
        _canvas.height = _puzzleHeight;
        _canvas.style.border = "1px solid black";
        _canvas.style.margin = "20px auto auto 20px";

        var rootElement = document.getElementById(_rootElId);
        rootElement.innerHTML = "";
        rootElement.appendChild(_canvas);
    }

    function initPuzzle() {
        _tiles = [];
        _mouse = { x: 0, y: 0 };
        _currentTile = null;
        _currentDropTile = null;
        _canvasCtx.drawImage(_img, 0, 0, _puzzleWidth, _puzzleHeight, 0, 0, _puzzleWidth, _puzzleHeight);
    }

    function initTiles() {
        var i,
            tile,
            xPos = 0,
            yPos = 0;

        for (i = 0; i < 4 * 4; i++) {
            tile = {};
            tile.sx = xPos;
            tile.sy = yPos;
            _tiles.push(tile);
            xPos += _tileWidth;
            if (xPos >= _puzzleWidth) {
                xPos = 0;
                yPos += _tileHeight;
            }
        }
    }

    function createPuzzleTiles() {
        _tiles = shuffleArray(_tiles);
        _canvasCtx.clearRect(0, 0, _puzzleWidth, _puzzleHeight);

        var i,
           tile,
           xPos = 0,
           yPos = 0;

        for (i = 0; i < _tiles.length; i++) {
            tile = _tiles[i];
            tile.xPos = xPos;
            tile.yPos = yPos;
            _canvasCtx.drawImage(_img, tile.sx, tile.sy, _tileWidth, _tileHeight, xPos, yPos, _tileWidth, _tileHeight);
            _canvasCtx.strokeRect(xPos, yPos, _tileWidth, _tileHeight);
            xPos += _tileWidth;
            if (xPos >= _puzzleWidth) {
                xPos = 0;
                yPos += _tileHeight;
            }
        }
        if ("ontouchstart" in document.documentElement)
            _canvas.addEventListener('touchstart', onPuzzleClick);
        else
            _canvas.addEventListener('mousedown', onPuzzleClick);

    }

    function onPuzzleClick(e) {
        if (e.layerX || e.layerX === 0) {
            _mouse.x = e.layerX - _canvas.offsetLeft;
            _mouse.y = e.layerY - _canvas.offsetTop;
        }
        else if (e.offsetX || e.offsetX === 0) {
            _mouse.x = e.offsetX - _canvas.offsetLeft;
            _mouse.y = e.offsetY - _canvas.offsetTop;
        }
        _currentTile = checkClickedElement();
        if (_currentTile != null) {
            _canvasCtx.clearRect(_currentTile.xPos, _currentTile.yPos, _tileWidth, _tileHeight);
            _canvasCtx.save();
            _canvasCtx.globalAlpha = .9;
            _canvasCtx.drawImage(_img,
                _currentTile.sx,
                _currentTile.sy,
                _tileWidth,
                _tileHeight,
                _mouse.x - (_tileWidth / 2),
                _mouse.y - (_tileHeight / 2),
                _tileWidth, _tileHeight);
            _canvasCtx.restore();

            if ("ontouchstart" in document.documentElement) {
                _canvas.addEventListener('touchmove', updatePuzzle);
                _canvas.addEventListener('touchend', onTileDropped);
            }
            else {
                _canvas.addEventListener('mousemove', updatePuzzle);
                _canvas.addEventListener('mouseup', onTileDropped);
            }
        }
    }

    function checkClickedElement() {
        var i;
        var tile;
        for (i = 0; i < _tiles.length; i++) {
            tile = _tiles[i];
            if (_mouse.x < tile.xPos
                || _mouse.x > (tile.xPos + _tileWidth)
                || _mouse.y < tile.yPos
                || _mouse.y > (tile.yPos + _tileHeight)) {
                //tile does not fit
            }
            else {
                return tile;
            }
        }
        return null;
    }

    function updatePuzzle(e) {
        _currentDropTile = null;
        if (e.layerX || e.layerX === 0) {
            _mouse.x = e.layerX - _canvas.offsetLeft;
            _mouse.y = e.layerY - _canvas.offsetTop;
        }
        else if (e.offsetX || e.offsetX === 0) {
            _mouse.x = e.offsetX - _canvas.offsetLeft;
            _mouse.y = e.offsetY - _canvas.offsetTop;
        }
        _canvasCtx.clearRect(0, 0, _puzzleWidth, _puzzleHeight);
        var i;
        var tile;
        for (i = 0; i < _tiles.length; i++) {
            tile = _tiles[i];
            if (tile == _currentTile) {
                continue;
            }
            _canvasCtx.drawImage(_img,
                tile.sx,
                tile.sy,
                _tileWidth,
                _tileHeight,
                tile.xPos,
                tile.yPos,
                _tileWidth,
                _tileHeight);
            _canvasCtx.strokeRect(tile.xPos, tile.yPos, _tileWidth, _tileHeight);
            if (_currentDropTile == null) {
                if (_mouse.x < tile.xPos
                    || _mouse.x > (tile.xPos + _tileWidth)
                    || _mouse.y < tile.yPos
                    || _mouse.y > (tile.yPos + _tileHeight)) {
                    //tile does not fit
                }
                else {
                    _currentDropTile = tile;
                    _canvasCtx.save();
                    _canvasCtx.globalAlpha = .4;
                    _canvasCtx.fillStyle = PUZZLE_HOVER_COLOR;
                    _canvasCtx.fillRect(_currentDropTile.xPos, _currentDropTile.yPos, _tileWidth, _tileHeight);
                    _canvasCtx.restore();
                }
            }
        }
        _canvasCtx.save();
        _canvasCtx.globalAlpha = .6;
        _canvasCtx.drawImage(_img,
            _currentTile.sx,
            _currentTile.sy,
            _tileWidth,
            _tileHeight,
            _mouse.x - (_tileWidth / 2),
            _mouse.y - (_tileHeight / 2),
            _tileWidth,
            _tileHeight);
        _canvasCtx.restore();
        _canvasCtx.strokeRect(_mouse.x - (_tileWidth / 2), _mouse.y - (_tileHeight / 2), _tileWidth, _tileHeight);
    }

    function onTileDropped(e) {
        if ("ontouchstart" in document.documentElement) {
            _canvas.removeEventListener('touchmove', updatePuzzle);
            _canvas.removeEventListener('touchend', onTileDropped);
        }
        else {
            _canvas.removeEventListener('mousemove', updatePuzzle);
            _canvas.removeEventListener('mouseup', onTileDropped);
        }

        if (_currentDropTile != null) {
            var tmp = { xPos: _currentTile.xPos, yPos: _currentTile.yPos };
            _currentTile.xPos = _currentDropTile.xPos;
            _currentTile.yPos = _currentDropTile.yPos;
            _currentDropTile.xPos = tmp.xPos;
            _currentDropTile.yPos = tmp.yPos;
        }
        resetPuzzleAndCheckWin();
    }

    function resetPuzzleAndCheckWin() {
        _canvasCtx.clearRect(0, 0, _puzzleWidth, _puzzleHeight);
        var gameWin = true;
        var i;
        var tile;
        for (i = 0; i < _tiles.length; i++) {
            tile = _tiles[i];
            _canvasCtx.drawImage(_img,
                tile.sx,
                tile.sy,
                _tileWidth,
                _tileHeight,
                tile.xPos,
                tile.yPos,
                _tileWidth,
                _tileHeight);
            _canvasCtx.strokeRect(tile.xPos, tile.yPos, _tileWidth, _tileHeight);
            if (tile.xPos != tile.sx || tile.yPos != tile.sy) {
                gameWin = false;
            }
        }
        if (gameWin) {
            setTimeout(gameOver, 500);
        }
    }

    function gameOver() {
        if ("ontouchstart" in document.documentElement) {
            _canvas.removeEventListener('touchstart', updatePuzzle);
            _canvas.removeEventListener('touchmove', onTileDropped);
            _canvas.removeEventListener('touchend', onPuzzleClick);
        }
        else {
            _canvas.removeEventListener('mousemove', updatePuzzle);
            _canvas.removeEventListener('mouseup', onTileDropped);
            _canvas.removeEventListener('mousedown', onPuzzleClick);
        }

        initPuzzle();
    }

    function shuffleArray(arr) {
        for (var j, x, i = arr.length; i; j = parseInt(Math.random() * i), x = arr[--i], arr[i] = arr[j], arr[j] = x);
        return arr;
    }

    init();
}