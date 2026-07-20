
export function sauvegarderScore(niveau, score, temps) {
  const scores = chargerScores()
  const actuel = scores[niveau]
  
  if (!actuel || score > actuel.score) {
    scores[niveau] = { score, temps }
    localStorage.setItem('sudoku_scores', JSON.stringify(scores))
  }
}


export function chargerScores() {
  const data = localStorage.getItem('sudoku_scores')
  return data ? JSON.parse(data) : {}
}


export function sauvegarderPartie(etat) {
  localStorage.setItem('sudoku_partie', JSON.stringify(etat))
}


export function chargerPartie() {
  const data = localStorage.getItem('sudoku_partie')
  return data ? JSON.parse(data) : null
}

export function supprimerPartie() {
  localStorage.removeItem('sudoku_partie')
}