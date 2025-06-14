import { useForm } from '../components/FormContext'
import FicheForm from './FicheForm'
import FicheLogement from './FicheLogement'
import FicheClefs from './FicheClefs'
import FicheAirbnb from './FicheAirbnb'
import FicheBooking from './FicheBooking'
import SidebarMenu from '../components/SidebarMenu'
import ProgressBar from '../components/ProgressBar'
import Button from '../components/Button'

// Composant placeholder pour les sections pas encore créées
function PlaceholderSection({ title }) {
  const { next, back, currentStep, totalSteps } = useForm()
  
  return (
    <div className="flex min-h-screen">
      <SidebarMenu />
      
      <div className="flex-1 flex flex-col">
        {/* Barre de progression en haut */}
        <ProgressBar />
        
        {/* Contenu principal */}
        <div className="flex-1 p-6 bg-gray-100">
          <h1 className="text-2xl font-bold mb-6">{title}</h1>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-600 mb-4">
              Cette section sera implémentée prochainement.
            </p>
            <p className="text-sm text-gray-500">
              Section {currentStep + 1} sur {totalSteps}
            </p>
          </div>
          
          {/* Boutons navigation */}
          <div className="mt-6 flex justify-between">
            <Button 
              variant="ghost" 
              onClick={back} 
              disabled={currentStep === 0}
            >
              Retour
            </Button>
            <Button 
              variant="primary" 
              onClick={next}
              disabled={currentStep === totalSteps - 1}
            >
              Suivant
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function FicheWizard() {
  const { currentStep, sections } = useForm()

  const steps = [
    <FicheForm key="proprietaire" />,
    <FicheLogement key="logement" />,
    <FicheClefs key="clefs" />,
    <FicheAirbnb key="airbnb" />,
    <FicheBooking key="booking" />,
    <PlaceholderSection key="reglementation" title="Réglementation" />,
    <PlaceholderSection key="exigences" title="Exigences" />,
    <PlaceholderSection key="avis" title="Gestion des Avis" />,
    <PlaceholderSection key="linge" title="Gestion Linge" />,
    <PlaceholderSection key="equipements" title="Équipements" />,
    <PlaceholderSection key="consommables" title="Consommables" />,
    <PlaceholderSection key="visite" title="Visite" />,
    <PlaceholderSection key="chambres" title="Chambres" />,
    <PlaceholderSection key="sdb" title="Salle De Bains" />,
    <PlaceholderSection key="cuisine1" title="Cuisine 1" />,
    <PlaceholderSection key="cuisine2" title="Cuisine 2" />,
    <PlaceholderSection key="salon" title="Salon / SAM" />,
    <PlaceholderSection key="exterieur" title="Équip. Spé. / Extérieur" />,
    <PlaceholderSection key="communs" title="Communs" />,
    <PlaceholderSection key="teletravail" title="Télétravail" />,
    <PlaceholderSection key="bebe" title="Bébé" />,
    <PlaceholderSection key="securite" title="Sécurité" />
  ]

  // Vérification de sécurité
  if (currentStep < 0 || currentStep >= steps.length) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-600">Étape invalide</h2>
          <p>Étape {currentStep} non trouvée</p>
        </div>
      </div>
    )
  }

  return steps[currentStep]
}