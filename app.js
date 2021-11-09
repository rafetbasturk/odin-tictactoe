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
      board.forEach((element, i) => {
        element === sign ? combination = [...combination, i] : null
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
    changePlayer: () => {
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
    form: ".form-player-names",
    formAI: ".form-ai",
    turn: ".turn",
    back: ".back"
  }

  return {
    getSelectors: () => selectors,
    showWinner: (name) => {
      document.querySelector(selectors.gameover).style.display = "flex"
      document.querySelector(selectors.declare).textContent = `"${name}" wins!`
      document.querySelector(selectors.turn).textContent = `Game Over!`
    },
    showTie: () => {
      document.querySelector(selectors.gameover).style.display = "flex"
      document.querySelector(selectors.declare).textContent = `Tie!`
      document.querySelector(selectors.turn).textContent = `Game Over!`
    },
    closeResult: () => document.querySelector(selectors.gameover).style.display = "none",
    showTurn: (name) => document.querySelector(selectors.turn).textContent = `${name}'s turn`,
    openModal: () => document.querySelector(selectors.modal).style.display = "flex",
    closeModal: () => document.querySelector(selectors.modal).style.display = "none",
    openForm: () => document.querySelector(selectors.form).style.display = "flex",
    clearForm: () => Array.from(document.querySelector(selectors.form)).forEach(el => el.value = ""),
    closeForm: () => document.querySelector(selectors.form).style.display = "none",
    openFormAI: () => document.querySelector(selectors.formAI).style.display = "flex",
    closeFormAI: () => document.querySelector(selectors.formAI).style.display = "none"
  }
})()

const App = ((game, ui, player) => {
  const selectors = ui.getSelectors()
  const cells = Array.from(document.querySelectorAll(selectors.cells))
  const form = document.querySelector(selectors.form)
  const formAI = document.querySelector(selectors.formAI)

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

  const showResults = (result, combination) => {
    if (result) ui.showWinner(player.getName())
    player.changePlayer()
    if (!result) ui.showTurn(player.getName())
    if (!result && combination.length === 5) ui.showTie()
  }

  const emptyIndexes = (board) => {
    return board.reduce((prev, cur, i) => cur === null ? prev.concat(i) : prev, [])
  }

  const aiMove = (board) => {
    const sign = player.getSign()
    const availableIndexes = emptyIndexes(board)
    const randomIndex = availableIndexes[Math.floor(Math.random() * availableIndexes.length)]
    availableIndexes.length !== 0 ? game.setBoard(randomIndex, sign) : null
    const newBoard = game.getBoard()
    loadBoard(newBoard)
    const { result, combination } = game.checkResult(newBoard, sign)
    cells.forEach(cell => {
      cell.innerHTML !== "" ? cell.removeEventListener("click", markSelection) : null
    });
    showResults(result, combination)
    if (result) return
  }

  const markSelection = (e) => {
    const cellNumber = e.target.dataset.cell
    const sign = player.getSign()
    game.setBoard(cellNumber, sign)
    const newBoard = game.getBoard()
    loadBoard(newBoard)
    const { result, combination } = game.checkResult(newBoard, sign)
    showResults(result, combination)
    if (result) return

    if (player.getName() === "Computer") {
      aiMove(newBoard)
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
    ui.clearForm()
    ui.closeForm()
    ui.openModal()
    ui.openFormAI()
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

  const backToSetPlayers = (e) => {
    e.preventDefault()
    ui.closeForm()
    ui.openFormAI()
  }

  const setAIGame = (e) => {
    e.preventDefault()
    formAI.elements.opponent.forEach(item => {
      if (item.id === "ai" && item.checked) {
        player.setPlayer1("Player", "X")
        player.setPlayer2("Computer", "O")
        player.setPlayer()
        ui.showTurn(player.getName())
        ui.closeModal()
      }
      else if (item.id === "players" && item.checked) {
        ui.openForm()
        ui.closeFormAI()
      }
    })
  }

  const loadEventListeners = () => {
    cells.forEach(cell => {
      cell.addEventListener("click", markSelection, { once: true })
    })
    document.querySelector(selectors.reset).addEventListener("click", resetGame)
    document.querySelector(selectors.back).addEventListener("click", backToSetPlayers)
    form.addEventListener("submit", setGame)
    formAI.addEventListener("submit", setAIGame)
  }

  return {
    init: () => {
      loadEventListeners()
    }
  }
})(GameController, UIController, PlayerController)

App.init()