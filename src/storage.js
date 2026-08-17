
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

export function sauvegarderDernierePartie(niveau, score, temps) {
  const dernieres = chargerDernieresParties()
  dernieres[niveau] = { score, temps }
  localStorage.setItem('sudoku_dernieres', JSON.stringify(dernieres))
}

export function chargerDernieresParties() {
  const data = localStorage.getItem('sudoku_dernieres')
  return data ? JSON.parse(data) : {}
}

export function chargerStreak() {
  const data = localStorage.getItem('sudoku_streak')
  return data ? JSON.parse(data) : {streak: 0, derniereVisite: null }
}

export function mettreAJourStreak() {
  const { streak, derniereVisite } = chargerStreak()
  const aujourdhui = new Date().toDateString()
  const hier = new Date() 
  hier.setDate(hier.getDate() - 1)
  const hierString = hier.toDateString()

  console.log('derniereVisite:', derniereVisite)
  console.log('aujourdhui:', aujourdhui)
  console.log('hierString:', hierString)
  
  let nouveauStreak 
  if (derniereVisite === null) {
    nouveauStreak = 1
  } else if (derniereVisite === aujourdhui ) {
    return streak 
  } else if ( derniereVisite === hierString){
    nouveauStreak = streak +1 
  } else {
    nouveauStreak = 1
  }
  localStorage.setItem('sudoku_streak', JSON.stringify({ streak: nouveauStreak, derniereVisite: aujourdhui }))
return nouveauStreak
}