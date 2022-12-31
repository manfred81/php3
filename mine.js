document.addEventListener('DOMContentLoaded', () => {
    var BOARDWIDTH = 20;
    var BOARDHEIGHT = 10;
    var BOMBSAMOUNT = 40;

    var gameFinished = false;

    var boardElement = document.getElementById('board');
    boardElement.style.width = 40*BOARDWIDTH+'px';
    boardElement.style.height = 40*BOARDHEIGHT+'px';

    var gameBoard = {
        cells: [],
        flagsNum: 0,
        closedCellsNum: 0,
    };

    // Вывод текстовых полей с состоянием игры
    var bombsElement = document.getElementById('bombs');
    var flagsElement = document.getElementById('flags');
    function renderCounters() {
        bombsElement.innerHTML = 'Всего бомб на поле: '+BOMBSAMOUNT;
        flagsElement.innerHTML = 'Осталось флагов: '+(BOMBSAMOUNT-gameBoard.flagsNum);
    }

    // Функция возвращающая всех соседей для заданной клетки
    function getCellNeighbours(x, y) {
        var result = [];
        if (x>0) {
            if (y>0) {
                result.push(gameBoard.cells[y-1][x-1])
            }
            result.push(gameBoard.cells[y][x-1]);
            if (y<BOARDHEIGHT-1) {
                result.push(gameBoard.cells[y+1][x-1]);
            }
        }
        if (y>0) {
            result.push(gameBoard.cells[y-1][x]);
        }
        if (y<BOARDHEIGHT-1) {
            result.push(gameBoard.cells[y+1][x]);
        }
        if (x<BOARDWIDTH-1) {
            if (y>0) {
                result.push(gameBoard.cells[y-1][x+1])
            }
            result.push(gameBoard.cells[y][x+1]);
            if (y<BOARDHEIGHT-1) {
                result.push(gameBoard.cells[y+1][x+1]);
            }
        }
        return result;
    }

    // Функция завершения игры
    function gameOver(isWin) {
        if (isWin) {
            console.log('Отлично, вы нашли все бомбы!');
            boardElement.style.borderColor = 'green';
        } else {
            console.log('Взрыв! Вы проиграли!');
            boardElement.style.borderColor = 'red';
        }
        gameFinished = true;
        for (var i = 0; i<BOARDHEIGHT; i++) {
            for (var j = 0; j<BOARDWIDTH; j++) {
                if (gameBoard.cells[i][j].haveBomb) {
                    gameBoard.cells[i][j].element.classList.add('open');
                    gameBoard.cells[i][j].element.innerHTML = '&#128163';
                }
            }
        }
    }

    // Функция открывающая ячейку на поле
    function openCell(cell) {
        cell.element.classList.remove('closed');
        cell.element.classList.add('opened');
        if (!cell.haveBomb) {        
            if (cell.bombsAround>0) {
                cell.element.innerText = cell.bombsAround;
                cell.element.setAttribute('bombsAround', cell.bombsAround);
            };
            cell.isOpened = true;
            gameBoard.closedCellsNum--;
            if (gameBoard.closedCellsNum == BOMBSAMOUNT) {
                gameOver(true);
            }
        }
    }

    // Функция обработки нажатия левой кнопки мыши на поле
    function clickHandler(event) {
        if (gameFinished) return;

        var cellClicked = gameBoard.cells[event.target.getAttribute('data-y')][event.target.getAttribute('data-x')];

        if (cellClicked.isOpened) return;

        openCell(cellClicked);
        if (cellClicked.haveBomb) {
            gameOver(false);
        } else if (cellClicked.bombsAround == 0) {
            var cellsToCheck = [...getCellNeighbours(cellClicked.x, cellClicked.y)];
            while (cellsToCheck.length>0) {
                var cell = cellsToCheck.pop();
                if (!cell.isOpened) {
                    openCell(cell);
                    if (cell.bombsAround == 0) {
                        getCellNeighbours(cell.x, cell.y)
                            .forEach((cell) => cellsToCheck.push(cell));
                    }
                }
            }
        }
    }

    // Функция выставления, снятия флага
    function makeFlagHandler(event) {
        if (gameFinished) return;

        var cellClicked = gameBoard.cells[event.target.getAttribute('data-y')][event.target.getAttribute('data-x')];

        event.preventDefault();

        if (cellClicked.isOpened) return;

        if (cellClicked.isFlaged) {
            cellClicked.element.innerHTML = '';
            cellClicked.element.classList.remove('flag');
            cellClicked.isFlaged = false;
            gameBoard.flagsNum--;
        } else if (gameBoard.flagsNum<BOMBSAMOUNT) {
            cellClicked.element.innerHTML = '&#128681';
            cellClicked.element.classList.add('flag');
            cellClicked.isFlaged = true;
            gameBoard.flagsNum++;
        };

        renderCounters();
    }

    function initBoard() {
        // Очищаем поле на странице
        boardElement.innerHTML = '';

        // Создаем поле
        gameBoard.cells = []
        for (var i = 0; i < BOARDHEIGHT; i++) {
            gameBoard.cells[i] = [];
            for (var j = 0; j < BOARDWIDTH; j++) {
                const cell = document.createElement('div');

                cell.setAttribute('data-x', j);
                cell.setAttribute('data-y', i);
                cell.classList.add('closed');
                gameBoard.closedCellsNum++;

                boardElement.appendChild(cell);

                gameBoard.cells[i][j] = { element: cell, x: j, y: i, isOpened: false, isFlaged: false };

                cell.addEventListener('click', clickHandler);
                cell.addEventListener('contextmenu', makeFlagHandler);
            }
        }

        // Расставляем бомбы
        Array(BOMBSAMOUNT)
            .fill('bomb')
            .concat(Array(BOARDHEIGHT*BOARDWIDTH-BOMBSAMOUNT)
                .fill('empty'))
            .sort(() => Math.random() - 0.5)
            .forEach((value, index) => {
                gameBoard.cells[Math.floor(index/BOARDWIDTH)][index%BOARDWIDTH].haveBomb = (value == 'bomb');
                gameBoard.cells[Math.floor(index/BOARDWIDTH)][index%BOARDWIDTH].element.classList.add(value);
            })

        // Вычисляем количество соседей для ячеек
        for (var i = 0; i < BOARDHEIGHT; i++) {
            for (var j = 0; j < BOARDWIDTH; j++) {
                gameBoard.cells[i][j].bombsAround = 0;
                getCellNeighbours(j, i)
                    .forEach((n) => {
                        gameBoard.cells[i][j].bombsAround += n.haveBomb ? 1 : 0;
                    });
            }
        }

        // Выводим счетчики
        renderCounters();
    }

    initBoard();
})