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
        _currentDropElement;

    function init() {
        if (document.getElementById(rootElId).length == 0) {
            console.log("Element with " + rootElId + "ID does not exist");
            throw new Error("Element with " + rootElId + "ID does not exist");
        }
        else {
            _rootElId = rootElId;

            _img = new Image();
            _img.addEventListener('load', createPuzzle, false);
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

    function createPuzzle(e) {
        // TO-DO: add timer and original image only
        initPuzzleBoardBasedOnImage(4, 4);
        createFrame();
        initCanvas();
        initPuzzle();
        createElements(); // TO-DO: support for touch events


        //addTimer("1", 3);
        window.setTimeout(function () {
            createProgressBar();
            startGame();
        }, 1000);
    }

    function initPuzzleBoardBasedOnImage(rowCount, colCount) {
        var puzzleWidth = _img.width,
            puzzleHeight = _img.height;
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
        brickContainer.appendChild(brick);

        // counter
        pElelement.innerHTML = "12";
        pElelement.style.font = "25px arial";
        pElelement.style.width = barWidth + "px";
        pElelement.style.position = "absolute";
        pElelement.style.bottom = 0;
        pElelement.style.margin = "0px";
        pElelement.style.color = "white";
        pElelement.style.textAlign = "center";
        brickContainer.appendChild(pElelement);

        var height = brickHeight - brickMarginTop,
            newHeight,
            newMarginTop,
            durationAnimation = 21000,
            counter = 12;

        brick.onclick = function () {
            animate({
                duration: durationAnimation,
                timing: function (timeFraction) {
                    return Math.pow(timeFraction, 2);
                },
                draw: function (progress) {
                    newHeight = height - (progress * 50);
                    height = (newHeight > 0) ? newHeight : 0;
                    newMarginTop = (barHeight - height) + brickMarginTop - animBrickMarginTop;

                    brick.style.marginTop = newMarginTop + 'px';
                    brick.style.height = height + 'px';

                    // TO-DO: add counter
                    //    pElelement.innerHTML = counter--;
                }
            });
        };

    }
    function animate(_ref) {
        var timing = _ref.timing,
            draw = _ref.draw,
            duration = _ref.duration;

        var start = performance.now();
        requestAnimationFrame(function animate(time) {
            var timeFraction = (time - start) / duration;

            if (timeFraction > 1) timeFraction = 1;

            var progress = timing(timeFraction);

            draw(progress);
            if (timeFraction < 1) {
                requestAnimationFrame(animate);
            }
        });
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

    function createElements() {
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

    function addTimer(text, speed) {
        var step = 20, steps = 200;

        window.requestAnimationFrame(function () { drawTimer(text, speed) });

        var drawTimer = function (text, speed) {
            step = step + 1;

            _canvasCtx.globalCompositeOperation = 'destination-over';
            _canvasCtx.clearRect(0, 0, _puzzleWidth, _puzzleHeight); // clear canvas

            _canvasCtx.fillStyle = 'white';
            _canvasCtx.textAlign = "center";
            _canvasCtx.save();
            _canvasCtx.translate(_canvas.width / 2, _canvas.height / 2);

            if (step < steps) {
                _canvasCtx.save();
                _canvasCtx.font = step + "pt Helvetica";
                _canvasCtx.fillText(text, 0, 0);
                _canvasCtx.restore();
            }

            _canvasCtx.restore();

            _canvasCtx.drawImage(_img, 0, 0, _puzzleWidth, _puzzleHeight, 0, 0, _puzzleWidth, _puzzleHeight);

            if (step < steps)
                window.requestAnimationFrame(function () { drawTimer(text, speed) })
            else
                return 1;
        }
    }

    function startGame() {
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
        document.addEventListener('mousedown', onPuzzleClick);
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

            document.addEventListener('mousemove', updatePuzzle);
            document.addEventListener('mouseup', elementDropped);
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
        document.removeEventListener('mousemove', updatePuzzle);
        document.removeEventListener('mouseup', elementDropped);

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
        document.removeEventListener('mousemove', updatePuzzle);
        document.removeEventListener('mouseup', elementDropped);
        document.removeEventListener('mouseup', elementDropped);

        initPuzzle();
    }

    function shuffleArray(arr) {
        for (var j, x, i = arr.length; i; j = parseInt(Math.random() * i), x = arr[--i], arr[i] = arr[j], arr[j] = x);
        return arr;
    }

    init();
}