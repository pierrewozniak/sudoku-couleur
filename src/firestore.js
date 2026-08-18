import { db } from './firebase.js'
import { doc, setDoc, collection, getDocs} from 'firebase/firestore'


export async function sauvegarderScoreFirestore(utilisateur, niveau, score, temps) {
  const docRef = doc(db, 'scores', utilisateur.uid)
  
  await setDoc(docRef, {
    email: utilisateur.email,
    scores: {
      [niveau]: { score: score, temps: temps }
    }
  }, { merge: true })
}


export async function chargerClassementMondial(niveau) {
  const querySnapshot = await getDocs(collection(db, 'scores'))
  const classement = []
  
  querySnapshot.forEach(doc => {
    const data = doc.data()
    if (data.scores?.[niveau]) { 
      classement.push({
        id: doc.id,
        pseudo: data.pseudo,
        score: data.scores[niveau].score,
        temps: data.scores[niveau].temps,
      })
    }
  })

  return classement.sort((a, b) => b.score - a.score)
}