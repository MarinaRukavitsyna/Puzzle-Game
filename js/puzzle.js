var puzzle = function (rootElId, imgSrc, rowCount, colCount) {
    "use strict";
    var PUZZLE_HOVER_COLOR = 'lightgreen';

    var self = this,
        _canvas,
        _canvasCtx,
        _rootElId,
        _mouse,
        _img,
        _elements,
        _rowCount,
        _colCount,
        _puzzleWidth,
        _puzzleHeight,
        _elementWidth,
        _elementHeight,
        _currentElement,
        _currentDropElement,
        _progressTextID,
        _progressBrickID;

    function init() {
        if (document.getElementById(rootElId).length == 0) {
            console.log("Element with " + rootElId + "ID does not exist");
            throw new Error("Element with " + rootElId + "ID does not exist");
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
        _elementWidth = Math.floor(puzzleWidth / colCount);
        _elementHeight = Math.floor(puzzleHeight / rowCount);
    }

    self.setPuzzleBoardDimention = function (rowCount, colCount, puzzleWidth, puzzleHeight) {
        _rowCount = rowCount;
        _colCount = colCount;
        _elementWidth = Math.floor(puzzleWidth / colCount);
        _elementHeight = Math.floor(puzzleHeight / rowCount);
    }

    function createPuzzleBoard(e) {
        document.getElementById(_rootElId).appendChild(_img);
        initPuzzleBoardBasedOnImage(4, 4);
        createStartGameCounter(); // TO-DO: check scroll bar in IE

        window.setTimeout(function () {
            createFrame();
            initCanvas();
            initPuzzle();
            initElements(); // TO-DO: support for touch events

            createProgressBar(); // TO-DO: make progress smoother
            createPuzzleElements();

            window.setTimeout(function () {
                startGame();
            }, 1500);
        }, 3500);
    }

    function startGame() {
        var height = _puzzleHeight - 45, // animBrickMarginTop = 45
            newMarginTop = 3,
            durationAnimation = 21000,
            counter = durationAnimation / 1000,
            pElelement = document.getElementById(_progressTextID),
            brick = document.getElementById(_progressBrickID);

        pElelement.innerHTML = counter;
        var timer = setInterval(function () {
            pElelement.innerHTML = counter--;
            if (counter == 0) {
                clearInterval(timer);
                gameOver(); // add 'Game Over' text? 
                return;
            }
        }, 1000);

        var startMSec = performance.now(), progress = 0;
        function progressStep(currentMSec) {
            progress = currentMSec - startMSec;

            height = height - progress / durationAnimation * 1.5;
            newMarginTop = newMarginTop + progress / durationAnimation * 1.5;

            brick.style.marginTop = newMarginTop + 'px';
            brick.style.height = height + 'px';

            if (progress < durationAnimation && height > 40) {
                requestAnimationFrame(progressStep);
            }
        }
        requestAnimationFrame(progressStep);
    };

    function createStartGameCounter() {
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
        }

        requestAnimationFrame(counter);
    }

    function initPuzzleBoardBasedOnImage(rowCount, colCount) {
        var puzzleWidth = _img.offsetWidth,
            puzzleHeight = _img.offsetHeight;
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

        // the progress element
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

        //_canvas.addEventListener('click', startTimer);

     }

    function initCanvas() {
        _canvas = document.createElement('canvas');;
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
        _elements = [];
        _mouse = { x: 0, y: 0 };
        _currentElement = null;
        _currentDropElement = null;
        _canvasCtx.drawImage(_img, 0, 0, _puzzleWidth, _puzzleHeight, 0, 0, _puzzleWidth, _puzzleHeight);
    }

    function initElements() {
        var i,
            element,
            xPos = 0,
            yPos = 0;

        for (i = 0; i < 4 * 4; i++) {
            element = {};
            element.sx = xPos;
            element.sy = yPos;
            _elements.push(element);
            xPos += _elementWidth;
            if (xPos >= _puzzleWidth) {
                xPos = 0;
                yPos += _elementHeight;
            }
        }
    }

    function createPuzzleElements() {
        _elements = shuffleArray(_elements);
        _canvasCtx.clearRect(0, 0, _puzzleWidth, _puzzleHeight);

        var i,
           element,
           xPos = 0,
           yPos = 0;

        for (i = 0; i < _elements.length; i++) {
            element = _elements[i];
            element.xPos = xPos;
            element.yPos = yPos;
            _canvasCtx.drawImage(_img, element.sx, element.sy, _elementWidth, _elementHeight, xPos, yPos, _elementWidth, _elementHeight);
            _canvasCtx.strokeRect(xPos, yPos, _elementWidth, _elementHeight);
            xPos += _elementWidth;
            if (xPos >= _puzzleWidth) {
                xPos = 0;
                yPos += _elementHeight;
            }
        }
        _canvas.addEventListener('mousedown', onPuzzleClick);
    }

    function onPuzzleClick(e) {
        if (e.layerX || e.layerX == 0) {
            _mouse.x = e.layerX - _canvas.offsetLeft;
            _mouse.y = e.layerY - _canvas.offsetTop;
        }
        else if (e.offsetX || e.offsetX == 0) {
            _mouse.x = e.offsetX - _canvas.offsetLeft;
            _mouse.y = e.offsetY - _canvas.offsetTop;
        }
        _currentElement = checkClickedElement();
        if (_currentElement != null) {
            _canvasCtx.clearRect(_currentElement.xPos, _currentElement.yPos, _elementWidth, _elementHeight);
            _canvasCtx.save();
            _canvasCtx.globalAlpha = .9;
            _canvasCtx.drawImage(_img,
                _currentElement.sx,
                _currentElement.sy,
                _elementWidth,
                _elementHeight,
                _mouse.x - (_elementWidth / 2),
                _mouse.y - (_elementHeight / 2),
                _elementWidth, _elementHeight);
            _canvasCtx.restore();

            _canvas.addEventListener('mousemove', updatePuzzle);
            _canvas.addEventListener('mouseup', elementDropped);
        }
    }

    function checkClickedElement() {
        var i;
        var element;
        for (i = 0; i < _elements.length; i++) {
            element = _elements[i];
            if (_mouse.x < element.xPos
                || _mouse.x > (element.xPos + _elementWidth)
                || _mouse.y < element.yPos
                || _mouse.y > (element.yPos + _elementHeight)) {
                //element does not fit
            }
            else {
                return element;
            }
        }
        return null;
    }

    function updatePuzzle(e) {
        _currentDropElement = null;
        if (e.layerX || e.layerX == 0) {
            _mouse.x = e.layerX - _canvas.offsetLeft;
            _mouse.y = e.layerY - _canvas.offsetTop;
        }
        else if (e.offsetX || e.offsetX == 0) {
            _mouse.x = e.offsetX - _canvas.offsetLeft;
            _mouse.y = e.offsetY - _canvas.offsetTop;
        }
        _canvasCtx.clearRect(0, 0, _puzzleWidth, _puzzleHeight);
        var i;
        var element;
        for (i = 0; i < _elements.length; i++) {
            element = _elements[i];
            if (element == _currentElement) {
                continue;
            }
            _canvasCtx.drawImage(_img,
                element.sx,
                element.sy,
                _elementWidth,
                _elementHeight,
                element.xPos,
                element.yPos,
                _elementWidth,
                _elementHeight);
            _canvasCtx.strokeRect(element.xPos, element.yPos, _elementWidth, _elementHeight);
            if (_currentDropElement == null) {
                if (_mouse.x < element.xPos
                    || _mouse.x > (element.xPos + _elementWidth)
                    || _mouse.y < element.yPos
                    || _mouse.y > (element.yPos + _elementHeight)) {
                    //element does not fit
                }
                else {
                    _currentDropElement = element;
                    _canvasCtx.save();
                    _canvasCtx.globalAlpha = .4;
                    _canvasCtx.fillStyle = PUZZLE_HOVER_COLOR;
                    _canvasCtx.fillRect(_currentDropElement.xPos, _currentDropElement.yPos, _elementWidth, _elementHeight);
                    _canvasCtx.restore();
                }
            }
        }
        _canvasCtx.save();
        _canvasCtx.globalAlpha = .6;
        _canvasCtx.drawImage(_img,
            _currentElement.sx,
            _currentElement.sy,
            _elementWidth,
            _elementHeight,
            _mouse.x - (_elementWidth / 2),
            _mouse.y - (_elementHeight / 2),
            _elementWidth,
            _elementHeight);
        _canvasCtx.restore();
        _canvasCtx.strokeRect(_mouse.x - (_elementWidth / 2), _mouse.y - (_elementHeight / 2), _elementWidth, _elementHeight);
    }

    function elementDropped(e) {
        _canvas.removeEventListener('mousemove', updatePuzzle);
        _canvas.removeEventListener('mouseup', elementDropped);

        if (_currentDropElement != null) {
            var tmp = { xPos: _currentElement.xPos, yPos: _currentElement.yPos };
            _currentElement.xPos = _currentDropElement.xPos;
            _currentElement.yPos = _currentDropElement.yPos;
            _currentDropElement.xPos = tmp.xPos;
            _currentDropElement.yPos = tmp.yPos;
        }
        resetPuzzleAndCheckWin();
    }

    function resetPuzzleAndCheckWin() {
        _canvasCtx.clearRect(0, 0, _puzzleWidth, _puzzleHeight);
        var gameWin = true;
        var i;
        var element;
        for (i = 0; i < _elements.length; i++) {
            element = _elements[i];
            _canvasCtx.drawImage(_img,
                element.sx,
                element.sy,
                _elementWidth,
                _elementHeight,
                element.xPos,
                element.yPos,
                _elementWidth,
                _elementHeight);
            _canvasCtx.strokeRect(element.xPos, element.yPos, _elementWidth, _elementHeight);
            if (element.xPos != element.sx || element.yPos != element.sy) {
                gameWin = false;
            }
        }
        if (gameWin) {
            setTimeout(gameOver, 500);
        }
    }

    function gameOver() {
        _canvas.removeEventListener('mousemove', updatePuzzle);
        _canvas.removeEventListener('mouseup', elementDropped);
        _canvas.removeEventListener('mouseup', elementDropped);

        initPuzzle();
    }

    function shuffleArray(arr) {
        for (var j, x, i = arr.length; i; j = parseInt(Math.random() * i), x = arr[--i], arr[i] = arr[j], arr[j] = x);
        return arr;
    }

    init();
}