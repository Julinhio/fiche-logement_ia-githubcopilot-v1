import { createContext, useContext, useState } from 'react'
import { saveFiche, loadFiche } from '../lib/supabaseHelpers'

const FormContext = createContext()

// Structure initiale des données (compatible Supabase)
const initialFormData = {
  // Métadonnées
  id: null,
  user_id: null,
  created_at: null,
  updated_at: null,
  
  // Sections (mappées aux colonnes JSONB Supabase)
  section_proprietaire: {
    prenom: "",
    nom: "",
    email: "",
    adresse: {
      rue: "",
      complement: "",
      ville: "",
      codePostal: ""
    }
  },
  section_logement: {
    type: "",
    adresse: {
      rue: "",
      complement: "",
      ville: "",
      codePostal: "",
      batiment: "",
      etage: "",
      numeroPorte: ""
    },
    caracteristiques: {
      nombrePieces: "",
      nombreChambres: "",
      surface: ""
    },
    acces: ""
  },
  section_clefs: {
    interphone: null,
    interphoneDetails: "",
    interphonePhoto: null,
    tempoGache: null,
    tempoGacheDetails: "",
    tempoGachePhoto: null,
    digicode: null,
    digicodeDetails: "",
    digicodePhoto: null,
    clefs: {
      photos: [],
      precision: "",
      prestataire: null,
      details: ""
    }
  },
  section_airbnb: {
    preparation_guide: {
      video_complete: false,
      photos_etapes: false
    },
    annonce_active: null,           // true/false/null
    url_annonce: "",
    identifiants_obtenus: null,     // true/false/null  
    email_compte: "",
    mot_passe: "",
    explication_refus: ""
  },
  // Placeholder pour les autres sections
  section_booking: {
    annonce_active: null,           // true/false/null
    url_annonce: "",
    identifiants_obtenus: null,     // true/false/null  
    email_compte: "",
    mot_passe: "",
    explication_refus: ""
  },
  section_reglementation: {},
  section_exigences: {},
  section_avis: {},
  section_gestion_linge: {},
  section_equipements: {},
  section_consommables: {},
  section_visite: {},
  section_chambres: {},
  section_salle_de_bains: {},
  section_cuisine_1: {},
  section_cuisine_2: {},
  section_salon_sam: {},
  section_equip_spe_exterieur: {},
  section_communs: {},
  section_teletravail: {},
  section_bebe: {},
  section_securite: {}
}

export function FormProvider({ children }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState(initialFormData)
  const [saveStatus, setSaveStatus] = useState({ 
    saving: false, 
    saved: false, 
    error: null 
  })

  // Liste des sections pour mapper avec la sidebar
  const sections = [
    "Propriétaire", "Logement", "Clefs", "Airbnb", "Booking", "Réglementation",
    "Exigences", "Avis", "Gestion Linge", "Équipements", "Consommables", "Visite",
    "Chambres", "Salle De Bains", "Cuisine 1", "Cuisine 2", "Salon / SAM", "Équip. Spé. / Extérie",
    "Communs", "Télétravail", "Bébé", "Sécurité"
  ]

  const totalSteps = sections.length

  // Navigation
  const next = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const back = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const goTo = (step) => {
    if (step >= 0 && step < totalSteps) {
      setCurrentStep(step)
    }
  }

  const getCurrentSection = () => sections[currentStep]

  // Gestion des données avec protection contre les undefined
  const updateSection = (sectionName, newData) => {
    setFormData(prev => {
      // S'assurer que la section existe
      const currentSection = prev[sectionName] || {}
      
      return {
        ...prev,
        [sectionName]: {
          ...currentSection,
          ...newData
        },
        updated_at: new Date().toISOString()
      }
    })
  }

  const updateField = (fieldPath, value) => {
    setFormData(prev => {
      const newData = { ...prev }
      const keys = fieldPath.split('.')
      let current = newData
      
      // Navigate to the parent of the target field, creating objects if needed
      for (let i = 0; i < keys.length - 1; i++) {
        if (current[keys[i]] === undefined || current[keys[i]] === null) {
          current[keys[i]] = {}
        } else if (typeof current[keys[i]] !== 'object') {
          // If it's a primitive value, convert to object
          current[keys[i]] = {}
        } else {
          // Clone the object to avoid mutations
          current[keys[i]] = { ...current[keys[i]] }
        }
        current = current[keys[i]]
      }
      
      // Set the value
      current[keys[keys.length - 1]] = value
      
      // Update timestamp
      newData.updated_at = new Date().toISOString()
      
      return newData
    })
  }

  const getSection = (sectionName) => {
    return formData[sectionName] || {}
  }

  const getField = (fieldPath) => {
    const keys = fieldPath.split('.')
    let current = formData
    
    for (const key of keys) {
      if (current === null || current === undefined || typeof current !== 'object') {
        return ""
      }
      current = current[key]
    }
    
    return current || ""
  }

  const resetForm = () => {
    setFormData(initialFormData)
    setCurrentStep(0)
  }

  // 💾 Fonctions de sauvegarde Supabase
  const handleSave = async () => {
    setSaveStatus({ saving: true, saved: false, error: null })
    
    try {
      // TEST: Log pour debug
      console.log('Données à sauvegarder:', formData)
      
      // Pour les tests en local : utiliser NULL au lieu d'un faux UUID
      const userId = null // Pas d'auth pour l'instant
      
      const result = await saveFiche(formData, userId)
      
      console.log('Résultat sauvegarde:', result)
      
      if (result.success) {
        // Mettre à jour le formData avec les données retournées (notamment l'ID)
        setFormData(result.data)
        setSaveStatus({ saving: false, saved: true, error: null })
        
        // Masquer l'indicateur "sauvegardé" après 3 secondes
        setTimeout(() => {
          setSaveStatus(prev => ({ ...prev, saved: false }))
        }, 3000)
      } else {
        setSaveStatus({ saving: false, saved: false, error: result.message })
      }
    } catch (error) {
      console.error('Erreur complète:', error)
      setSaveStatus({ saving: false, saved: false, error: error.message || 'Erreur de connexion' })
    }
  }

  const handleLoad = async (ficheId) => {
    try {
      const result = await loadFiche(ficheId)
      
      if (result.success) {
        setFormData(result.data)
        setCurrentStep(0) // Revenir au début
        return { success: true }
      } else {
        return { success: false, error: result.message }
      }
    } catch (error) {
      return { success: false, error: 'Erreur de connexion' }
    }
  }

  // Debug helper
  const getFormDataPreview = () => {
    return {
      currentSection: getCurrentSection(),
      completedSections: Object.keys(formData).filter(key => 
        key.startsWith('section_') && 
        Object.values(formData[key]).some(val => val !== "" && val !== null)
      ),
      formData
    }
  }

  return (
    <FormContext.Provider value={{ 
      // Navigation
      currentStep, 
      totalSteps, 
      sections,
      next, 
      back, 
      goTo, 
      getCurrentSection,
      
      // Data management
      formData,
      updateSection,
      updateField,
      getSection,
      getField,
      resetForm,
      
      // Supabase operations
      handleSave,
      handleLoad,
      saveStatus,
      
      // Debug helper
      getFormDataPreview
    }}>
      {children}
    </FormContext.Provider>
  )
}

export function useForm() {
  const context = useContext(FormContext)
  if (!context) {
    throw new Error('useForm must be used within a FormProvider')
  }
  return context
}