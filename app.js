const GameController = (() => {
  let board = Array.from({ length: 9 }, () => null);

  const winConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ]

  return {
    getBoard: () => {
      return board
    },
    resetBoard: () => {
      board = Array.from({ length: 9 }, () => null)
    },
    setBoard: (cellNumber, playerSign) => {
      board.splice(cellNumber, 1, playerSign)
    },
    checkResult: (board, sign) => {
      let combination = []
      board.map((element, i) => {
        element === sign ? combination = [...combination, i] : null
        return combination
      })

      let result;
      if (combination.length >= 3) {
        result = winConditions.some(condition => condition.every(item => combination.includes(item)))
      }
      return { result, combination }
    }
  }
})()

const PlayerController = (() => {
  let player, player1, player2;

  const Player = (name, sign) => {
    name = name.charAt(0).toUpperCase() + name.toLowerCase().slice(1)
    const getName = () => name
    const getSign = () => sign
    return { getName, getSign }
  }

  return {
    setPlayer: () => {
      player = player1
    },
    setPlayer1: (name, sign) => {
      player1 = Player(name, sign)
    },
    setPlayer2: (name, sign) => {
      player2 = Player(name, sign)
    },
    setTurn: () => {
      player === player1 ? player = player2 : player = player1
    },
    getSign: () => player.getSign(),
    getName: () => player.getName(),
  }
})()

const UIController = (() => {
  const selectors = {
    cells: ".cell",
    gameover: ".gameover",
    declare: ".declare",
    reset: ".reset",
    modal: ".modal",
    form: ".form",
    turn: ".turn"
  }

  return {
    getSelectors: () => selectors,
    showResult: (name) => {
      document.querySelector(selectors.gameover).style.display = "flex"
      document.querySelector(selectors.declare).textContent = `"${name}" wins!`
      document.querySelector(selectors.turn).textContent = `Game Over!`
    },
    tieResult: () => {
      document.querySelector(selectors.gameover).style.display = "flex"
      document.querySelector(selectors.declare).textContent = `Tie!`
      document.querySelector(selectors.turn).textContent = `Game Over!`
    },
    closeResult: () => document.querySelector(selectors.gameover).style.display = "none",
    openModal: () => document.querySelector(selectors.modal).style.display = "flex",
    closeModal: () => document.querySelector(selectors.modal).style.display = "none",
    showTurn: (name) => document.querySelector(selectors.turn).textContent = `${name}'s turn`,
    clearForm: () => Array.from(document.querySelector(selectors.form)).forEach(el => el.value = "")

  }
})()

const App = ((game, ui, player) => {
  const selectors = ui.getSelectors()
  const cells = Array.from(document.querySelectorAll(selectors.cells))
  const form = document.querySelector(selectors.form)

  const loadBoard = (board) => {
    cells.forEach((cell, i) => {
      if (board[i] !== null) {
        const html =
          `<div>
            ${board[i]}
          </div>`
        cell.innerHTML = html
      }
    })
  }

  const checkMatch = (board, sign) => {
    const { result, combination } = game.checkResult(board, sign)
    if (result) ui.showResult(player.getName())
    if (!result && combination.length === 5) ui.tieResult()
    return {result, combination}
  }

  const markSelection = (e) => {
    const cellNumber = e.target.dataset.cell
    const sign = player.getSign()
    game.setBoard(cellNumber, sign)
    const newBoard = game.getBoard()
    loadBoard(newBoard)
    const {result, combination} = checkMatch(newBoard, sign)
    player.setTurn()
    if (!result) {
      ui.showTurn(player.getName())
      if (combination.length === 5) {
        ui.tieResult()
      }
    }
  }

  const resetGame = () => {
    cells.forEach(cell => cell.innerHTML = "")
    game.resetBoard()
    player.setPlayer()
    cells.forEach(cell => {
      cell.addEventListener("click", markSelection, { once: true })
    })
    ui.closeResult()
    ui.openModal()
    ui.clearForm()
  }

  const setGame = (e) => {
    e.preventDefault()
    const name1 = form.elements["player1"].value
    const name2 = form.elements["player2"].value
    player.setPlayer1(name1, "X")
    player.setPlayer2(name2, "O")
    player.setPlayer()
    ui.showTurn(player.getName())
    ui.closeModal()
  }

  const loadEventListeners = () => {
    cells.forEach(cell => {
      cell.addEventListener("click", markSelection, { once: true })
    })
    document.querySelector(selectors.reset).addEventListener("click", resetGame)
    form.addEventListener("submit", setGame)
  }

  return {
    init: () => {
      loadEventListeners()
    }
  }
})(GameController, UIController, PlayerController)

App.init()