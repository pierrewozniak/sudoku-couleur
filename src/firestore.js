import { db } from './firebase.js'
import { doc, setDoc, getDoc, collection, getDocs, orderBy, query, limit } from 'firebase/firestore'

// Sauvegarder le score d'un utilisateur
export async function sauvegarderScoreFirestore(utilisateur, niveau, score, temps) {
  const docRef = doc(db, 'scores', utilisateur.uid)
  
  await setDoc(docRef, {
    pseudo: utilisateur.displayName,
    email: utilisateur.email,
    scores: {
      [niveau]: { score: score, temps: temps }
    }
  }, { merge: true })
}

// Récupérer le classement mondial
export async function chargerClassementMondial() {
  const querySnapshot = await getDocs(collection(db, 'scores'))
    const classement = []
        querySnapshot.forEach(doc => {
            classement.push({
                id: doc.id,
                ...doc.data()
                
            })
        })    
        return classement
}