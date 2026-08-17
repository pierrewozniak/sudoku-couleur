export function isValidate(grille, ligne, colonne, valeur) {

    if(grille[ligne].includes(valeur)) return false

     if (grille.map(ligne => ligne[colonne]).includes(valeur)) return false

    const debutLigne = Math.floor(ligne / 3) * 3
    const debutColonne = Math.floor(colonne / 3) * 3
     for (let i =0; i < 3; i++) { 
        for (let j = 0; j < 3; j++){
            if (grille[debutLigne + i][debutColonne + j] === valeur ) return false
        }
    }
    return true
}

export function newGrille () {
const grille = Array(9).fill(null).map(() => Array(9).fill(null)) 
  return grille

}

export function remplirGrille(grille) {
    for (let ligne = 0; ligne < 9; ligne++) {
        for (let colonne = 0; colonne < 9; colonne++) {
            if (grille[ligne][colonne] === null) {
                for (let valeur = 0; valeur < 9; valeur++) {
                    if (isValidate(grille, ligne, colonne, valeur)){
                        grille[ligne][colonne] = valeur 
                    if (remplirGrille(grille)) return true 

                    grille[ligne][colonne] = null
                    }
                }
                return false 
                // si ça ne marche pas → remet null et return false
            }
        }
    }
    return true
}

export function generateGrille() {
    const grille = newGrille()
        remplirGrille(grille)
        return grille 
}

export function masquerCellules(grille, nombreACacher) {
    const copie = grille.map(ligne => [... ligne])
    
    for (let i = 0; i < nombreACacher; i++){
    const ligne = Math.floor(Math.random() * 9)
    const colonne = Math.floor(Math.random() * 9)

        copie[ligne][colonne] = null; 

    }
    return copie
}

export function verifierSolution(grille) {
    for (let ligne = 0; ligne < 9; ligne++) {
        for (let colonne = 0; colonne < 9; colonne++) {
            if (grille[ligne][colonne] === null) return false
            const valeur = grille[ligne][colonne]
            grille[ligne][colonne] = null 
            if (!isValidate(grille, ligne, colonne, valeur)) return false
            grille[ligne][colonne] = valeur 
        }
    }
    return true
}

function seededRandom(seed) {
  let x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

function dateEnSeed() {
  const aujourdhui = new Date()
  return aujourdhui.getFullYear() * 10000 + 
         (aujourdhui.getMonth() + 1) * 100 + 
         aujourdhui.getDate()
}

export function genererGrilleQuotidienne() {
  const seed = dateEnSeed()
    const grille = newGrille()
    remplirGrille(grille)

    const ordre = [0, 1, 2, 3, 4, 5, 6, 7, 8]
        for( let i = 8; i > 0; i--){
            const j = Math.floor(seededRandom(seed + i ) * (i + 1))
            const temp = ordre[i]
            ordre[i] = ordre[j]
            ordre[j] = temp
        } 
    return grille.map(ligne => ligne.map(cellule => ordre[cellule]))
}