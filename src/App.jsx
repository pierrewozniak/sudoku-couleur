import { useState, useEffect } from 'react'
import { generateGrille, masquerCellules, genererGrilleQuotidienne } from './sudoku.js'
import { sauvegarderScore, chargerScores, sauvegarderPartie, chargerPartie, supprimerPartie, sauvegarderDernierePartie, chargerDernieresParties, mettreAJourStreak, chargerStatistiques, sauvegarderStatistiques } from './storage.js'
import { Analytics } from "@vercel/analytics/react"
import { translations } from './translations.js'
import parametres from './assets/parametres.png'
import { auth, db } from './firebase.js'
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { sauvegarderScoreFirestore, chargerClassementMondial } from './firestore.js'

const COULEURS = [
  '#E74C3C',
  '#3498DB',
  '#2ecc3b',
  '#F1C40F',
  '#9B59B6',
  '#E67E22',
  '#1ABC9C',
  '#795548',
  '#2C3E50',
]


const COULEURS_DALTONIEN = [
  '#000000',
  '#E69F00',
  '#56B4E9',
  '#009E73',
  '#F0E442',
  '#0072B2', 
  '#D55E00', 
  '#CC79A7', 
  '#A0A0A0', 
]

const STYLE_PAGE = {
  minHeight :'100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: "'Segoe UI', Arial, sans-serif",
  padding: '16px',
  paddingBottom: '80px',
  boxSizing: 'border-box',
}

const STYLE_CARTE = {
  backgroundColor: 'white',
  borderRadius: '20px',
  padding: '40px',
  boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
  textAlign: 'center',
  width: '100%',
  maxWidth: '480px',
  boxSizing: 'border-box',
  paddingBottom: '80px',
}



function Cellule({ couleur, onClick, borderRight, borderBottom, enErreur}) {
  const estVide = couleur === null
  return (
    <button
      onClick={onClick}
      className={enErreur ? 'cellule-erreur' : ''}
      style={{
        width: 'min(calc((100vw - 32px) / 9), 60px)',
        height: 'min(calc((100vw - 32px) / 9), 60px)',
        backgroundColor: estVide ? '#f0f0f0' : couleur,
        border: '1px solid #ddd',
        borderRight: borderRight ? '3px solid #2C3E50' : '1px solid #ddd',
        borderBottom: borderBottom ? '3px solid #2C3E50' : '1px solid #ddd',
        cursor: 'pointer',
        boxSizing: 'border-box',
        padding: 0,
        display: 'block',
      }}
    />
  )
}

function PageAccueil({ niveau, setNiveau, lancerPartie, partieSauvegardee, reprendrePartie, dernieresParties, streak = 0, t, setParametresOuverts, lancerDefi}) {
  const niveaux = [
  { id: 'facile', label: t.facile, description: t.casesF },
  { id: 'moyen', label: t.moyen, description: t.casesM },
  { id: 'difficile', label: t.difficile, description: t.casesD },
  ]


return (
  <div style={{ ...STYLE_PAGE, background: 'linear-gradient(135deg, #f0f8ff, #0066ff, #00ccff)' }}>
    <div style={STYLE_CARTE}>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <h1 style={{ color: '#1a56db', fontSize: '36px', margin: 0, letterSpacing: '-1px' }}>
          🎨 Sudoku Couleur
        </h1>
    <button 
      onClick={() => setParametresOuverts(true)} 
      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
    >
      <img src={parametres} alt="paramètres" style={{ width: '30px', height: '30px' , marginLeft:'55px'}} />
    </button>
      </div>

      {streak > 0 && (
        <p style={{ color: '#1a56db', fontWeight: 'bold', fontSize: '14px', marginBottom: '16px' }}>
          {t.serieEnCours} : {streak} {streak > 1 ? t.jours : t.jour}
        </p>
      )}
      
      <button
        onClick={lancerDefi}
        style={{
          width: '100%',
          padding: '16px',
          background: 'linear-gradient(135deg, #bfdefa, #0066ff, #00ccff)',
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          fontSize: '18px',
          fontWeight: 'bold',
          cursor: 'pointer',
          marginBottom: '16px',
          boxShadow: '0 4px 12px rgba(0, 102, 255, 0.3)',
        }}
      >
        {t.defiDuJour} ✦
      </button>

      <p style={{ color: '#666', marginBottom: '32px' }}>{t.choisisDifficulte}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
        {niveaux.map(n => (
          <button
            key={n.id}
            onClick={() => setNiveau(n.id)}
            style={{
              padding: '14px 24px',
              borderRadius: '12px',
              border: niveau === n.id ? '2px solid #1a56db' : '2px solid #e5e7eb',
              backgroundColor: niveau === n.id ? '#eff6ff' : 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              transition: 'all 0.15s',
            }}
          >
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 'bold', color: niveau === n.id ? '#1a56db' : '#333' }}>{n.label}</div>
              <div style={{ fontSize: '12px', color: '#888' }}>{n.description}</div>
            </div>
            {dernieresParties && dernieresParties[n.id] && (
              <div style={{ textAlign: 'right', fontSize: '12px', color: '#1a56db' }}>
                <div style={{ fontWeight: 'bold' }}>{t.dernierePartie}</div>
                <div>{dernieresParties[n.id].score} pts / {dernieresParties[n.id].temps}s</div>
              </div>
            )}
          </button>
        ))}
      </div>

      {niveau && (
        <button
          onClick={lancerPartie}
          style={{
            width: '100%',
            padding: '16px',
            backgroundColor: '#1a56db',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '18px',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          {t.lancerPartie}
        </button>
      )}

      {partieSauvegardee && (
        <button onClick={reprendrePartie} style={{
          width: '100%',
          padding: '16px',
          backgroundColor: '#7C3AED',
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          fontSize: '18px',
          fontWeight: 'bold',
          cursor: 'pointer',
          marginTop: '12px',
        }}>
          {t.reprendrePartie}
        </button>
      )}

    </div>
  </div>
)
}

function Parametres({ setParametresOuverts, modeDaltonisme, setModeDaltonisme, langue, setLangue, t, utilisateur, seConnecter, seDeconnecter, pseudoJoueur }) {
  return (
    <div 
      onClick={() => setParametresOuverts(false)}
      style={{
        position: 'fixed',
        top: 0, left: 0,
        width: '100%', height: '100%',
        backgroundColor: 'rgba(0,0,0,0.3)',
        zIndex: 1000,
      }}
    >
      <div 
        onClick={e => e.stopPropagation()}
        style={{
          position: 'absolute',
          top: '60px',
          right: '16px',
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '16px',
          width: '220px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
        }}
      >
        {/* Langue */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
          <span style={{ fontSize: '14px', color: '#333', fontWeight: 'bold' }}>{t.langue}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', color: langue === 'fr' ? '#1a56db' : '#999', fontWeight: 'bold' }}>FR</span>
            <div
              onClick={() => setLangue(langue === 'fr' ? 'en' : 'fr')}
              style={{
                width: '40px', height: '22px',
                backgroundColor: langue === 'en' ? '#1a56db' : '#e5e7eb',
                borderRadius: '11px', cursor: 'pointer',
                position: 'relative', transition: 'background-color 0.2s',
              }}
            >
              <div style={{
                width: '18px', height: '18px',
                backgroundColor: 'white', borderRadius: '50%',
                position: 'absolute', top: '2px',
                left: langue === 'en' ? '20px' : '2px',
                transition: 'left 0.2s',
                boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
              }}/>
            </div>
            <span style={{ fontSize: '12px', color: langue === 'en' ? '#1a56db' : '#999', fontWeight: 'bold' }}>EN</span>
          </div>
        </div>

      
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
          <span style={{ fontSize: '14px', color: '#333', fontWeight: 'bold' }}>{t.modeDaltonisme}</span>
          <div
            onClick={() => setModeDaltonisme(!modeDaltonisme)}
            style={{
              width: '40px', height: '22px',
              backgroundColor: modeDaltonisme ? '#1a56db' : '#e5e7eb',
              borderRadius: '11px', cursor: 'pointer',
              position: 'relative', transition: 'background-color 0.2s',
            }}
          >
            <div style={{
              width: '18px', height: '18px',
              backgroundColor: 'white', borderRadius: '50%',
              position: 'absolute', top: '2px',
              left: modeDaltonisme ? '20px' : '2px',
              transition: 'left 0.2s',
              boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
            }}/>
          </div>
        </div>
          <div style={{ padding: '8px 0', borderTop: '1px solid #f0f0f0', marginTop: '8px' }}>
            {utilisateur ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: '#333' }}>{pseudoJoueur}</span>
                <button onClick={seDeconnecter} style={{ fontSize: '12px', color: '#E74C3C', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
                  {t.deconnexion}
                </button>
              </div>
            ) : (
              <button onClick={seConnecter} style={{ 
                width: '100%', padding: '10px', backgroundColor: '#1a56db', 
                color: 'white', border: 'none', borderRadius: '8px', 
                fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' 
              }}>
                {t.connexion}
              </button>
            )}
          </div>  
      </div>
    </div>
   
  )
}

function PageJeu({ grille, couleurSelectionnee, setCouleurSelectionnee, handleCelluleClic, erreurs, couleursCompletes, temps, setChronoActif, setEcran, setPartieSauvegardee, celluleErreur, utiliserAide, aides, t, couleursActives, estMobile }) {
  function formaterTemps(secondes) {
    const minutes = Math.floor(secondes / 60)
    const secs = secondes % 60
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  return (
    <div style={{ 
      ...STYLE_PAGE,
      backgroundColor: 'transparent', 
      flexDirection: estMobile ? 'column' : 'row',
      gap: estMobile ? '20px' : '40px',
      padding: estMobile ? '16px' : '40px',
      alignItems: estMobile ? 'center' : 'flex-start',
    }}>

    
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
        
        <h1 style={{ color: '#1a56db', fontSize: '28px', margin: 0 }}>🎨 Sudoku Couleur</h1>

        <div style={{
          backgroundColor: 'white', borderRadius: '12px',
          padding: '12px 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          display: 'flex', alignItems: 'center', gap: '8px',
        }}>
          <span style={{ fontSize: '20px' }}>❌</span>
          <span style={{ fontWeight: 'bold', fontSize: '18px', color: erreurs > 0 ? '#E74C3C' : '#333' }}>
            {t.erreurs} : {erreurs} / 3
          </span>
          <span>{formaterTemps(temps)}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={() => { setChronoActif(false); setPartieSauvegardee(chargerPartie()); setEcran('accueil') }}
            style={{ padding: '8px 16px', backgroundColor: 'white', color: '#1a56db', border: '2px solid #1a56db', borderRadius: '10px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            {t.accueil}
          </button>
          <button
            onClick={utiliserAide}
            disabled={aides <= 0}
            style={{ padding: '8px 16px', backgroundColor: aides > 0 ? '#F1C40F' : '#e5e7eb', color: aides > 0 ? '#333' : '#999', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 'bold', cursor: aides > 0 ? 'pointer' : 'not-allowed' }}
          >
            {t.aide} ({aides})
          </button>
        </div>

        <div style={{
          border: '3px solid #2C3E50', borderRadius: '8px',
          overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
        }}>
          {grille.map((ligne, ligneIndex) => (
            <div key={ligneIndex} style={{ display: 'flex' }}>
              {ligne.map((celluleIndex, colIndex) => (
                <Cellule
                  key={colIndex}
                  couleur={celluleIndex === null ? null : couleursActives[celluleIndex]}
                  onClick={() => handleCelluleClic(ligneIndex, colIndex)}
                  borderRight={colIndex === 2 || colIndex === 5}
                  borderBottom={ligneIndex === 2 || ligneIndex === 5}
                  enErreur={celluleErreur?.ligne === ligneIndex && celluleErreur?.col === colIndex}
                />
              ))}
            </div>
          ))}
        </div>
      </div>


      <div style={{ 
  display: 'flex', 
  flexDirection: 'column', 
  gap: '20px', 
  alignItems: 'center',
  justifyContent: 'center',  // ← centre verticalement
  alignSelf: 'stretch',      // ← prend toute la hauteur
}}>
        
        <div style={{
          backgroundColor: 'white', borderRadius: '16px',
          padding: '16px', boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
          display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center',
          maxWidth: estMobile ? '100%' : '200px',
        }}>
          {couleursActives.map((couleur, index) => (
            <button
              key={index}
              onClick={() => setCouleurSelectionnee(index)}
              style={{
                width: '42px', height: '42px',
                backgroundColor: couleur, borderRadius: '10px',
                border: index === couleurSelectionnee ? '3px solid #1a56db' : '2px solid #e5e7eb',
                cursor: 'pointer',
                transform: index === couleurSelectionnee ? 'scale(1.2)' : 'scale(1)',
                transition: 'all 0.15s',
                boxShadow: index === couleurSelectionnee ? '0 2px 8px rgba(26,86,219,0.3)' : 'none',
                opacity: couleursCompletes.includes(index) ? 0.3 : 1,
                pointerEvents: couleursCompletes.includes(index) ? 'none' : 'auto',
                padding: 0,
              }}
            />
          ))}
        </div>

      </div>

    </div>
  )
}

function Popup({ titre, message, lancerPartie, setEcran, t }) {
  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0,
      width: '100%', height: '100%',
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backdropFilter: 'blur(4px)',
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '24px',
        padding: '48px 40px',
        textAlign: 'center',
        boxShadow: '0 8px 40px rgba(0,0,0,0.2)',
        minWidth: '300px',
      }}>
        <h2 style={{ color: '#1a56db', fontSize: '28px', margin: '0 0 8px' }}>{titre}</h2>
        <p style={{ color: '#666', marginBottom: '32px' }}>{message}</p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            onClick={lancerPartie}
            style={{
              padding: '12px 24px',
              backgroundColor: '#1a56db',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            {t.rejouer}
          </button>
          <button
            onClick={() => setEcran('accueil')}
            style={{
              padding: '12px 24px',
              backgroundColor: 'white',
              color: '#1a56db',
              border: '2px solid #1a56db',
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
             {t.accueil}
          </button>
        </div>
      </div>
    </div>
  )
}

function PageClassement({ classement, t, niveauClassement, chargerClassement }) {
  const niveaux = ['facile', 'moyen', 'difficile']

  return (
    <div style={{ ...STYLE_PAGE, background: 'linear-gradient(135deg, #f0f8ff, #0066ff, #00ccff)' }}>
      <div style={STYLE_CARTE}>
        <h2 style={{ color: '#1a56db', marginBottom: '16px' }}>{t.classement}</h2>

        {/* Onglets niveaux */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          {niveaux.map(n => (
            <button
              key={n}
              onClick={() => chargerClassement(n)}
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: niveauClassement === n ? '#1a56db' : '#e5e7eb',
                color: niveauClassement === n ? 'white' : '#666',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '13px',
                textTransform: 'capitalize',
              }}
            >
              {t[n]}
            </button>
          ))}
        </div>

        {/* Liste classement */}
        {classement.length === 0 ? (
          <p style={{ color: '#666' }}>{t.aucunScore}</p>
        ) : (
          classement.map((joueur, index) => (
            <div key={joueur.id} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px',
              backgroundColor: index === 0 ? '#fffbeb' : index % 2 === 0 ? '#f9f9f9' : 'white',
              borderRadius: '8px',
              marginBottom: '8px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ 
                  fontWeight: 'bold', 
                  color: index === 0 ? '#F1C40F' : index === 1 ? '#999' : index === 2 ? '#E67E22' : '#1a56db',
                  fontSize: '18px'
                }}>
                  #{index + 1}
                </span>
                <span style={{ fontWeight: index === 0 ? 'bold' : 'normal' }}>{joueur.pseudo}</span>
              </div>
              <div style={{ textAlign: 'right', fontSize: '13px' }}>
                <div style={{ fontWeight: 'bold', color: '#1a56db' }}>{joueur.score} pts</div>
                <div style={{ color: '#999' }}>{joueur.temps}s</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function PopupPseudo({ setPseudoManquant, utilisateur, t }) {
  const [pseudo, setPseudo] = useState('')
  const [erreur, setErreur] = useState('')

    async function validerPseudo() {
      if (pseudo.trim() === '') {
        setErreur(t.pseudoVide)
        return
      }
      
      await setDoc(doc(db, 'scores', utilisateur.uid), {
        pseudo: pseudo,
        email: utilisateur.email,
      }, { merge: true })
      
      setPseudoManquant(false)
    }

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0,
      width: '100%', height: '100%',
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '20px',
        padding: '32px',
        width: '85%',
        maxWidth: '320px',
        textAlign: 'center',
      }}>
        <h2 style={{ color: '#1a56db' }}>{t.choisirPseudo}</h2>
        <input 
          type="text"
          value={pseudo}
          onChange={e => setPseudo(e.target.value)}
          placeholder="Ton pseudo..."
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '8px',
            border: '2px solid #e5e7eb',
            fontSize: '16px',
            marginTop: '16px',
            boxSizing: 'border-box',
          }}
        />
        {erreur && <p style={{ color: '#E74C3C', fontSize: '13px' }}>{erreur}</p>}
        <button onClick={validerPseudo} style={{
          width: '100%',
          padding: '12px',
          backgroundColor: '#1a56db',
          color: 'white',
          border: 'none',
          borderRadius: '10px',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: 'pointer',
          marginTop: '16px',
        }}>
          {t.valider}
        </button>
      </div>
    </div>
  )
}

function NavBar({ ecran, setEcran, chargerClassement, t }) {
  const items = [
    { id: 'accueil', label: t.accueil, icon: '⌂', action: () => setEcran('accueil') },
    { id: 'classement', label: t.classement, icon: '◎', action: () => chargerClassement('facile')},
    { id: 'stats', label: 'Stats', icon: '∷', action: () => setEcran('stats') },
  ]

  return (
    <div style={{
  backgroundColor: 'white',
  boxShadow: '0 -4px 20px rgba(0,0,0,0.08)',
  display: 'flex',
  justifyContent: 'space-around',
  alignItems: 'center',
  height: '65px',
  width: '100%',
  flexShrink: 0,
}}>
      {items.map(item => (
        <button
          key={item.id}
          onClick={item.action}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            padding: '8px 20px',
            borderRadius: '20px',
            backgroundColor: ecran === item.id ? '#eff6ff' : 'transparent',
            transition: 'all 0.2s',
          }}
        >
          <span style={{ 
            fontSize: '22px',
            color: ecran === item.id ? '#1a56db' : '#999',
          }}>
            {item.icon}
          </span>
          <span style={{ 
            fontSize: '11px',
            fontWeight: ecran === item.id ? 'bold' : 'normal',
            color: ecran === item.id ? '#1a56db' : '#999',
          }}>
            {item.label}
          </span>
        </button>
      ))}
    </div>
  )
}

function PageStats({ t, statistiques, meilleursScores, dernieresParties, streak }) {
  const [niveauStats, setNiveauStats] = useState('facile')
  return (
    <div style={{ ...STYLE_PAGE, background: 'linear-gradient(135deg, #f0f8ff, #0066ff, #00ccff)' }}>
      <div style={STYLE_CARTE}>
        <h2 style={{ color: '#1a56db', marginBottom: '24px' }}>∷ Stats</h2>

        {/* Streak */}
        <div style={{ padding: '12px', backgroundColor: '#eff6ff', borderRadius: '12px', marginBottom: '16px' }}>
          <p style={{ color: '#1a56db', fontWeight: 'bold', fontSize: '18px', margin: 0 }}>
            {streak} {streak > 1 ? t.jours : t.jour} {t.serieEnCours}
          </p>
        </div>

        {/* Parties jouées */}
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
          <span style={{ color: '#666' }}>{t.partiesJouees}</span>
          <span style={{ fontWeight: 'bold' }}>{statistiques.partiesJouees}</span>
        </div>

        {/* Erreurs totales */}
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0', marginBottom: '16px' }}>
          <span style={{ color: '#666' }}>{t.erreursTotal}</span>
          <span style={{ fontWeight: 'bold', color: '#E74C3C' }}>{statistiques.erreursTotal}</span>
        </div>

        {/* Onglets niveaux */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          {['facile', 'moyen', 'difficile'].map(n => (
            <button
              key={n}
              onClick={() => setNiveauStats(n)}
              style={{
                flex: 1, padding: '8px', borderRadius: '8px', border: 'none',
                backgroundColor: niveauStats === n ? '#1a56db' : '#e5e7eb',
                color: niveauStats === n ? 'white' : '#666',
                fontWeight: 'bold', cursor: 'pointer', fontSize: '13px',
              }}
            >
              {t[n]}
            </button>
          ))}
        </div>

        {/* Meilleur score du niveau */}
        <h3 style={{ color: '#1a56db', marginTop: '8px', marginBottom: '8px' }}>{t.meilleursScores}</h3>
        {meilleursScores[niveauStats] ? (
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
            <span style={{ color: '#666' }}>{t[niveauStats]}</span>
            <span style={{ fontWeight: 'bold' }}>{meilleursScores[niveauStats].score} pts / {meilleursScores[niveauStats].temps}s</span>
          </div>
        ) : (
          <p style={{ color: '#999', fontSize: '13px' }}>{t.aucunScore}</p>
        )}

        {/* Dernière partie du niveau */}
        <h3 style={{ color: '#1a56db', marginTop: '16px', marginBottom: '8px' }}>{t.dernieresParties}</h3>
        {dernieresParties[niveauStats] ? (
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
            <span style={{ color: '#666' }}>{t[niveauStats]}</span>
            <span style={{ fontWeight: 'bold' }}>{dernieresParties[niveauStats].score} pts / {dernieresParties[niveauStats].temps}s</span>
          </div>
        ) : (
          <p style={{ color: '#999', fontSize: '13px' }}>{t.aucunScore}</p>
        )}

      </div>
    </div>
  )
}

function App() {
  const [langue, setLangue] = useState(navigator.language.startsWith('fr') ? 'fr' : 'en')
  const t = translations[langue]
  const [estMobile, setEstMobile] = useState(window.innerWidth < 768)
  const [ecran, setEcran] = useState('accueil')
  const [niveau, setNiveau] = useState(null)
  const [grille, setGrille] = useState(masquerCellules(generateGrille(), 40))
  const [couleurSelectionnee, setCouleurSelectionnee] = useState(0)
  const [solution, setSolution] = useState(null)
  const [erreurs, setErreurs] = useState(0)
  const [statut, setStatut] = useState(null)
  const [couleursCompletes, setCouleursCompletes] = useState([])
  const [temps, setTemps] = useState(0)
  const [chronoActif, setChronoActif] = useState(false)
  const [partieSauvegardee, setPartieSauvegardee] = useState(chargerPartie())
  const [celluleErreur, setCelluleErreur] = useState(null)
  const [meilleursScores, setMeilleursScores] = useState(chargerScores() || {})
  const [dernieresParties, setDernieresParties] = useState(chargerDernieresParties() || {})
  const [aides, setAides] = useState(3)
  const [casesAide, setCasesAide] = useState(0)
  const [streak, setStreak] = useState(() => mettreAJourStreak())
  const [parametresOuverts, setParametresOuverts] = useState(false)
  const [modeDaltonisme, setModeDaltonisme] = useState(false)
  const couleursActives = modeDaltonisme ? COULEURS_DALTONIEN : COULEURS
  const [utilisateur, setUtilisateur] = useState(null)
  const [pseudoManquant, setPseudoManquant] = useState(false)
  const [classement, setClassement] = useState([])
  const [statistiques, setStatistiques] = useState(chargerStatistiques())
  const [niveauClassement, setNiveauClassement] = useState('facile')
  const [pseudoJoueur, setPseudoJoueur] = useState(null)

  const [defiDuJour] = useState(() => {
    const grille = genererGrilleQuotidienne()
    return {
      solution: grille,
      grilleInitiale: masquerCellules(grille, 45)
    }
  })




  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async  (user) => {

      setUtilisateur(user)
      if(user) {
        const docRef = doc(db, 'scores', user.uid)
        const docSnap = await getDoc(docRef)
        if(!docSnap.exists() || !docSnap.data().pseudo) {
          setPseudoManquant(true)
        }else {
          setPseudoJoueur(docSnap.data().pseudo)
        }
      }
    })
    return () => unsubscribe()
  }, [])



  useEffect(() => {
  const handleResize = () => setEstMobile(window.innerWidth < 768)
  window.addEventListener('resize', handleResize)
  return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (!chronoActif) return
    const interval = setInterval(() => {
      setTemps(t => t + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [chronoActif])

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        setStreak(mettreAJourStreak())
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [])

async function chargerClassement(niveau = 'facile') {
  const data = await chargerClassementMondial(niveau)
  setClassement(data)
  setNiveauClassement(niveau)
  setEcran('classement')
}

  async function seConnecter() {
    const provider = new GoogleAuthProvider()
      await signInWithPopup(auth, provider) 
  }

  async function seDeconnecter() {
    await signOut(auth)
  }

function lancerPartie() {
  const nbCachees = niveau === 'facile' ? 40 : niveau === 'moyen' ? 55 : 65
  const grilleComplete = generateGrille()
  const grilleInitiale = masquerCellules(grilleComplete, nbCachees)

  const couleursDejaCompletes = []
  couleursActives.forEach((_, index) => {
    const nb = grilleInitiale.flat().filter(c => c === index).length
    if (nb === 9) couleursDejaCompletes.push(index)
  })

  setSolution(grilleComplete)
  setGrille(grilleInitiale)
  setEcran('jeu')
  setErreurs(0)
  setStatut(null)
  setCouleursCompletes(couleursDejaCompletes)
  setTemps(0)
  setChronoActif(true)
  setAides(3)
  setCasesAide(0)
}

async function lancerDefi() {
  const couleursDejaCompletes = []
  couleursActives.forEach((_, index) => {
    const nb = defiDuJour.grilleInitiale.flat().filter(c => c === index).length
    if (nb === 9) couleursDejaCompletes.push(index)
  })

  setSolution(defiDuJour.solution)
  setGrille(defiDuJour.grilleInitiale)
  setNiveau('defi')
  setEcran('jeu')
  setErreurs(0)
  setStatut(null)
  setCouleursCompletes(couleursDejaCompletes)
  setTemps(0)
  setChronoActif(true)
  setAides(0)
  setCasesAide(0)
}

function utiliserAide() {
    if (aides <= 0) return
    const casesVides = []
    grille.forEach((ligne, li) => {
      ligne.forEach((cellule, ci) => {
        if (cellule === null) casesVides.push({ li, ci })
      })
    })
    
    if (casesVides.length === 0) return
    const { li, ci } = casesVides[Math.floor(Math.random() * casesVides.length)]
    
  
    const nouvelleGrille = grille.map((ligne, l) =>
      ligne.map((cellule, c) =>
        l === li && c === ci ? solution[li][ci] : cellule
      )
    )
    
    setGrille(nouvelleGrille)
    const nbOccurrences = nouvelleGrille
        .flat()
        .filter(c => c === solution[li][ci])
        .length
    if (nbOccurrences === 9) {
      setCouleursCompletes(prev => [...prev, solution[li][ci]])
    }
    setAides(aides - 1)
    setCasesAide(casesAide + 1)
    const estTerminee = nouvelleGrille.every(ligne => ligne.every(cellule => cellule !== null))
    if (estTerminee) {
      setChronoActif(false)
      setStatut('victoire')
      sauvegarderScore(niveau, calculerScore(), temps)
      sauvegarderDernierePartie(niveau, calculerScore(), temps)
      setDernieresParties(chargerDernieresParties())
      setMeilleursScores(chargerScores())
      supprimerPartie()
    }
  }

function calculerScore() {
  const pointsBase = niveau === 'facile' ? 1000 : niveau === 'moyen' ? 2000 : niveau === 'difficile' ? 3000 : 2500
  
  const multiplicateurPrecision = erreurs === 0 ? 1.5 : erreurs === 1 ? 1.2 : erreurs === 2 ? 1.0 : 0.5
  
  const bonusTemps = temps < 120 ? 500 : temps < 300 ? 200 : temps < 600 ? 100 : 0
  
  const malusAides = casesAide * 150
  
  return Math.max(0, Math.round(pointsBase * multiplicateurPrecision) + bonusTemps - malusAides)
}

  function handleCelluleClic(ligneIndex, colIndex) {
    if (erreurs >= 3) {
      setStatut('gameover')
      return
    }
    if (grille[ligneIndex][colIndex] !== null) return
    if (couleurSelectionnee === solution[ligneIndex][colIndex]) {
      const nouvelleGrille = grille.map((ligne, li) =>
        ligne.map((cellule, ci) =>
          li === ligneIndex && ci === colIndex ? couleurSelectionnee : cellule
        )
      )
      setGrille(nouvelleGrille)
      sauvegarderPartie({
        grille: nouvelleGrille,
        solution,
        erreurs,
        temps,
        niveau,
        couleursCompletes,
      })
        const nbOccurrences = nouvelleGrille
          .flat()
          .filter(c => c === couleurSelectionnee)
          .length

          if (nbOccurrences === 9) {
            setCouleursCompletes([...couleursCompletes, couleurSelectionnee])
          }
      const estTerminee = nouvelleGrille.every(ligne => ligne.every(cellule => cellule !== null))
      if (estTerminee) {setChronoActif(false)
          setStatut('victoire')
          sauvegarderScore(niveau, calculerScore(), temps)
          sauvegarderDernierePartie(niveau, calculerScore(), temps)
          setDernieresParties(chargerDernieresParties())
          setMeilleursScores(chargerScores())
          supprimerPartie()
          sauvegarderStatistiques(erreurs)
          setStatistiques(chargerStatistiques())
          if (utilisateur) { 
          sauvegarderScoreFirestore(utilisateur, niveau, calculerScore(), temps)
      }
          
  }
        
    } else {
      const nouvellesErreurs = erreurs + 1
      setErreurs(nouvellesErreurs)
      setCelluleErreur({ ligne : ligneIndex, col : colIndex})
      setTimeout(() => setCelluleErreur(null), 400)
      if (nouvellesErreurs >= 3) {setStatut('gameover')
         setChronoActif(false)
        supprimerPartie()
        sauvegarderStatistiques(nouvellesErreurs)
        setStatistiques(chargerStatistiques())
      }
    }
  }

  function reprendrePartie() {
    const partie = chargerPartie()
    if (!partie) return
    setGrille(partie.grille)
    setSolution(partie.solution)
    setErreurs(partie.erreurs)
    setTemps(partie.temps)
    setNiveau(partie.niveau)
    setCouleursCompletes(partie.couleursCompletes)
    setEcran('jeu')
    setStatut(null)
    setChronoActif(true)
  }
    return (
    <div style={{ 
      height: '100dvh',
      width: '100%',
      minHeight: '0',
      background: 'linear-gradient(135deg, #f0f8ff, #0066ff, #00ccff)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <Analytics />
      
      <div style={{ flex: 1, minHeight : 0, overflowY: 'auto', overflowX: 'hidden' }}> 
        {ecran === 'accueil'
          ? <PageAccueil niveau={niveau} setNiveau={setNiveau} lancerPartie={lancerPartie} partieSauvegardee={partieSauvegardee} reprendrePartie={reprendrePartie} meilleursScores={meilleursScores} dernieresParties={dernieresParties} streak={streak} t={t} modeDaltonisme={modeDaltonisme} setModeDaltonisme={setModeDaltonisme} setParametresOuverts={setParametresOuverts} estMobile={estMobile} lancerDefi={lancerDefi} chargerClassement={chargerClassement}/>
          : ecran === 'classement'
            ? <PageClassement classement={classement} t={t} niveauClassement={niveauClassement} chargerClassement={chargerClassement}/>
            : ecran === 'stats'
            ? <PageStats t={t} statistiques={statistiques} meilleursScores={meilleursScores} dernieresParties={dernieresParties} streak={streak} />
            : <div style={{ position: 'relative' }}>
                <PageJeu grille={grille} couleurSelectionnee={couleurSelectionnee} setCouleurSelectionnee={setCouleurSelectionnee} handleCelluleClic={handleCelluleClic} erreurs={erreurs} couleursCompletes={couleursCompletes} temps={temps} setChronoActif={setChronoActif} setEcran={setEcran} setPartieSauvegardee={setPartieSauvegardee} celluleErreur={celluleErreur} utiliserAide={utiliserAide} aides={aides} t={t} couleursActives={couleursActives} estMobile={estMobile}/>
                {statut === 'gameover' && <Popup titre={t.finDePartie} message={t.messagePerte} lancerPartie={lancerPartie} setEcran={setEcran} t={t}/>}
                {statut === 'victoire' && <Popup titre={t.bravo} message={`${t.score} : ${calculerScore()} pts — ${t.temps} : ${temps}s`} lancerPartie={lancerPartie} setEcran={setEcran} t={t}/>}
              </div>
        }
      </div>

      {ecran !== 'jeu' && <NavBar ecran={ecran} setEcran={setEcran} chargerClassement={chargerClassement} t={t}/>}
      
      {parametresOuverts && <Parametres setParametresOuverts={setParametresOuverts} modeDaltonisme={modeDaltonisme} setModeDaltonisme={setModeDaltonisme} t={t} langue={langue} setLangue={setLangue} utilisateur={utilisateur} seConnecter={seConnecter} seDeconnecter={seDeconnecter} pseudoJoueur={pseudoJoueur}/>}
      {pseudoManquant && <PopupPseudo setPseudoManquant={setPseudoManquant} utilisateur={utilisateur} t={t} />}
    </div>
  )
}

export default App