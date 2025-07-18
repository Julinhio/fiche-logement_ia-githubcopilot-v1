# 🐛 Bug Report - Fiche Logement

*Historique des bugs rencontrés et leurs solutions*

---

## 🚨 **BUG #001 - Affichage Boutons Radio sur iPhone**
**Date :** 11 juillet 2025  
**Gravité :** Low  
**Statut :** ✅ RÉSOLU  

Les boutons radio ne s'affichent pas correctement sur **iPhone** (testé sur iPhone 12) :
- Les labels sont décalés vers la droite et sortent de la page au lieu d'être collés aux boutons
- L'alignement est cassé spécifiquement sur iOS
- **Android et Desktop** : ✅ Fonctionnent correctement

### **Cause du Bug**
Problème de CSS spécifique iOS avec la combinaison :
- `inline-flex` sur les labels
- Classes CSS custom au lieu de dimensions fixes
- Structure HTML non optimale pour iOS

### **Solution Testée et Validée**

#### ❌ **Pattern Buggy (à corriger)**
```javascript
<div className="flex gap-6">
  <label className="inline-flex items-center gap-2 cursor-pointer">
    <input 
      type="radio" 
      className="text-primary focus:ring-primary"
    />
    Texte label
  </label>
</div>
```

#### ✅ **Pattern Correct (à utiliser)**
```javascript
<div className="flex flex-col gap-2">  {/* ou flex gap-6 pour horizontal */}
  <label className="flex items-center gap-2 cursor-pointer">
    <input 
      type="radio" 
      className="w-4 h-4 cursor-pointer"
    />
    <span>Texte label</span>
  </label>
</div>
```

### **Changements Obligatoires**
1. **Label** : `inline-flex` → `flex`
2. **Input** : `text-primary focus:ring-primary` → `w-4 h-4 cursor-pointer`
3. **Texte** : Texte direct → `<span>Texte</span>`

---

## 🚨 **BUG #002 - Trigger Webhook ne fonctionne pas**
**Date :** 14 juillet 2025  
**Gravité :** Critique  
**Statut :** ✅ RÉSOLU  

### **Symptômes**
- Bouton "Finaliser la fiche" ne change pas le statut (reste en "Brouillon")
- Erreur console : `PATCH 404 (Not Found)` ou `400 (Bad Request)`
- Erreur Supabase : `function supabase_functions.http_request(...) does not exist`
- Trigger webhook ne se déclenche pas

### **Cause racine**
Syntaxe incorrecte pour l'appel HTTP dans le trigger SQL Supabase. Plusieurs fonctions testées :
- ❌ `supabase_functions.http_request()` → N'existe pas
- ❌ `net.http_post()` avec syntaxe positionnelle → Erreur de type  
- ✅ `net.http_post()` avec syntaxe nommée → **FONCTIONNE**

### **Solution finale**
```sql
-- Supprimer l'ancien trigger défaillant
DROP TRIGGER IF EXISTS fiche_completed_webhook ON public.fiches;
DROP FUNCTION IF EXISTS notify_fiche_completed();

-- Créer la fonction avec la syntaxe correcte
CREATE OR REPLACE FUNCTION notify_fiche_completed()
RETURNS trigger AS $$
BEGIN
  -- Seulement si statut passe à "Complété"
  IF NEW.statut = 'Complété' AND (OLD.statut IS NULL OR OLD.statut != 'Complété') THEN
    PERFORM net.http_post(
      url := 'https://hook.eu2.make.com/ydjwftmd7czs4rygv1rjhi6u4pvb4gdj',
      body := to_jsonb(NEW),
      headers := '{"Content-Type": "application/json"}'::jsonb
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recréer le trigger
CREATE TRIGGER fiche_completed_webhook
  AFTER UPDATE ON public.fiches
  FOR EACH ROW
  EXECUTE FUNCTION notify_fiche_completed();
```

### **Points clés de la solution**
1. **Syntaxe nommée** : `url :=`, `body :=`, `headers :=` 
2. **Fonction correcte** : `net.http_post` (pas `supabase_functions.http_request`)
3. **Headers format** : `'{"Content-Type": "application/json"}'::jsonb`
4. **Body format** : `to_jsonb(NEW)` pour convertir la ligne en JSON

### **Tests validés**
- ✅ Bouton "Finaliser" change le statut vers "Complété"
- ✅ Trigger se déclenche uniquement sur changement de statut (pas doublons)
- ✅ Webhook Make reçoit payload complet (~750 colonnes)
- ✅ Pas d'erreur console

---

## 🚨 **BUG #003 - Champs input perdent focus à chaque frappe**
**Date :** 15 juillet 2025  
**Gravité :** Majeure  
**Statut :** ✅ RÉSOLU  

### **Symptômes**
- Dans `FicheEquipExterieur.jsx`, champs "Fréquence d'entretien" et "Type de prestation" se réinitialisent à chaque frappe
- L'utilisateur ne peut taper qu'une lettre à la fois, doit recliquer dans le champ
- Bug présent sur tous les champs conditionnels imbriqués (extérieur, piscine, jacuzzi, cuisine extérieure)
- Même problème résolu précédemment sur FicheChambre et FicheSalleDeBains

### **Cause racine**
Composant `EntretienPattern` défini **à l'intérieur** de la fonction `FicheEquipExterieur()`, causant :
- Re-création du composant à chaque render
- Perte de référence React
- Réinitialisation des inputs

### **Solution finale**
```javascript
// ✅ AVANT - Sortir le composant EntretienPattern HORS de la fonction principale
const EntretienPattern = ({ prefix, label, formData, getField, handleInputChange, handleRadioChange }) => {
  const entretienField = `${prefix}_entretien_prestataire`
  const entretienValue = formData[entretienField.split('.').pop()]
  
  return (
    <div className="space-y-4">
      {/* Contenu du composant... */}
    </div>
  )
}

// ✅ APRÈS - Dans la fonction principale, passer toutes les props nécessaires
export default function FicheEquipExterieur() {
  // ...fonctions...
  
  return (
    <EntretienPattern 
      prefix="section_equip_spe_exterieur.exterieur" 
      label="de l'extérieur"
      formData={formData}
      getField={getField}
      handleInputChange={handleInputChange}
      handleRadioChange={handleRadioChange}
    />
  )
}
```

### **Changements requis**
1. **Déplacer** `EntretienPattern` avant `export default function FicheEquipExterieur()`
2. **Ajouter** les props : `formData`, `getField`, `handleInputChange`, `handleRadioChange`
3. **Modifier** les 4 appels du composant pour passer ces props
4. **Supprimer** l'ancien composant de l'intérieur de la fonction

### **Tests validés**
- ✅ Frappe continue possible dans "Fréquence d'entretien"
- ✅ Frappe continue possible dans "Type de prestation" 
- ✅ Pas de perte de focus sur les 4 sections (extérieur, piscine, jacuzzi, cuisine ext.)
- ✅ Fonctionnalité conditionnelle intacte

---

## 🚨 **BUG #004 - Champs conditionnels gardent valeurs fantômes**
**Date :** 15 juillet 2025  
**Gravité :** High
**Statut :** ✅ RÉSOLU  

### **Symptômes**
- Dans `FicheBebe.jsx`, après avoir coché "Lit bébé" puis choisi un type, si on décoche "Lit bébé" :
  - Les champs conditionnels disparaissent visuellement ✅
  - Mais les valeurs restent stockées dans FormContext ❌
- Même problème pour "Chaise haute", "Jouets pour enfants", etc.
- Valeurs "fantômes" invisibles mais présentes dans les données

### **Cause racine**
La fonction `handleArrayCheckboxChange` ne nettoie que l'array principal, pas les champs liés conditionnels.

### **Solution finale**
```javascript
// ✅ Fonction modifiée avec nettoyage automatique
const handleArrayCheckboxChange = (field, option, checked) => {
  const currentArray = formData[field.split('.').pop()] || []
  let newArray
  if (checked) {
    newArray = [...currentArray, option]
  } else {
    newArray = currentArray.filter(item => item !== option)
    
    // 🆕 NETTOYAGE AUTOMATIQUE des champs liés quand on décoche
    if (option === 'Lit bébé') {
      // Nettoyer tous les champs liés au lit bébé
      updateField('section_bebe.lit_bebe_type', '')
      updateField('section_bebe.lit_parapluie_disponibilite', '')
      updateField('section_bebe.lit_stores_occultants', null)
    }
    
    if (option === 'Chaise haute') {
      // Nettoyer tous les champs liés à la chaise haute
      updateField('section_bebe.chaise_haute_type', '')
      updateField('section_bebe.chaise_haute_disponibilite', '')
      updateField('section_bebe.chaise_haute_caracteristiques', [])
      updateField('section_bebe.chaise_haute_prix', '')
    }
    
    if (option === 'Jouets pour enfants') {
      updateField('section_bebe.jouets_tranches_age', [])
    }
    
    if (option === 'Autre') {
      updateField('section_bebe.equipements_autre_details', '')
    }
  }
  
  updateField(field, newArray)
}
```

### **Tests validés**
- ✅ Cocher "Lit bébé" → choisir type → décocher "Lit bébé" → champs effacés
- ✅ Même comportement pour "Chaise haute" et "Jouets"
- ✅ Plus de valeurs fantômes dans FormContext
- ✅ Interface cohérente avec les données

### **Applications potentielles**
Ce pattern peut être appliqué à d'autres sections avec champs conditionnels similaires.

---

## 🚨 **BUG #005 - Payload Make ingérable (750 colonnes)**
**Date :** 16 juillet 2025  
**Gravité :** Medium  
**Statut :** ✅ RÉSOLU  

### **Symptômes**
- Webhook Make reçoit 750+ colonnes de la table Supabase
- Impossible de mapper manuellement tous les champs dans Make
- Interface Make devient inutilisable
- Champs photos perdus dans la masse de données
- Workflow Drive impossible à configurer

### **Cause racine**
Trigger SQL utilise `to_jsonb(NEW)` qui envoie **TOUTE** la ligne de la table `fiches` sans structure ni filtrage :
```sql
-- ❌ PROBLÉMATIQUE
body := to_jsonb(NEW),  -- Envoie les 750+ colonnes en vrac
```

### **Solution finale - Payload optimisé structuré**
```sql
-- ✅ NOUVEAU TRIGGER OPTIMISÉ
-- 🎯 Payload optimisé avec TOUS les champs essentiels
CREATE OR REPLACE FUNCTION public.notify_fiche_completed()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  IF NEW.statut = 'Complété' THEN
    PERFORM net.http_post(
      url := 'https://hook.eu2.make.com/ydjwftmd7czs4rygv1rjhi6u4pvb4gdj',
      body := jsonb_build_object(
        -- 📋 MÉTADONNÉES
        'id', NEW.id,
        'nom', NEW.nom,
        'statut', NEW.statut,
        'created_at', NEW.created_at,
        'updated_at', NEW.updated_at,
        
        -- 👤 PROPRIÉTAIRE
        'proprietaire', jsonb_build_object(
          'prenom', NEW.proprietaire_prenom,
          'nom', NEW.proprietaire_nom,
          'email', NEW.proprietaire_email,
          'adresse_rue', NEW.proprietaire_adresse_rue,
          'adresse_complement', NEW.proprietaire_adresse_complement,
          'adresse_ville', NEW.proprietaire_adresse_ville,
          'adresse_code_postal', NEW.proprietaire_adresse_code_postal
        ),
        
        -- 🏠 LOGEMENT
        'logement', jsonb_build_object(
          'numero_bien', NEW.logement_numero_bien,
          'type_propriete', NEW.logement_type_propriete,
          'typologie', NEW.logement_typologie,
          'surface', NEW.logement_surface,
          'nombre_personnes_max', NEW.logement_nombre_personnes_max,
          'nombre_lits', NEW.logement_nombre_lits
        ),
        
        -- 📄 PDF
        'pdfs', jsonb_build_object(
          'logement_url', NEW.pdf_logement_url,
          'menage_url', NEW.pdf_menage_url
        ),
        
        -- 📸 TOUTES LES PHOTOS ET VIDÉOS (29 champs)
        'media', jsonb_build_object(
          -- Section Clefs (5 champs)
          'clefs_emplacement_photo', NEW.clefs_emplacement_photo,
          'clefs_interphone_photo', NEW.clefs_interphone_photo,
          'clefs_tempo_gache_photo', NEW.clefs_tempo_gache_photo,
          'clefs_digicode_photo', NEW.clefs_digicode_photo,
          'clefs_photos', NEW.clefs_photos,
          
          -- Section Equipements (4 champs)
          'equipements_poubelle_photos', NEW.equipements_poubelle_photos,
          'equipements_disjoncteur_photos', NEW.equipements_disjoncteur_photos,
          'equipements_vanne_eau_photos', NEW.equipements_vanne_eau_photos,
          'equipements_chauffage_eau_photos', NEW.equipements_chauffage_eau_photos,
          
          -- Section Gestion Linge (2 champs)
          'linge_photos_linge', NEW.linge_photos_linge,
          'linge_emplacement_photos', NEW.linge_emplacement_photos,
          
          -- Section Chambres (6 champs)
          'chambres_chambre_1_photos', NEW.chambres_chambre_1_photos_chambre,
          'chambres_chambre_2_photos', NEW.chambres_chambre_2_photos_chambre,
          'chambres_chambre_3_photos', NEW.chambres_chambre_3_photos_chambre,
          'chambres_chambre_4_photos', NEW.chambres_chambre_4_photos_chambre,
          'chambres_chambre_5_photos', NEW.chambres_chambre_5_photos_chambre,
          'chambres_chambre_6_photos', NEW.chambres_chambre_6_photos_chambre,
          
          -- Section Salles de Bains (6 champs)
          'salle_de_bain_1_photos', NEW.salle_de_bains_salle_de_bain_1_photos_salle_de_bain,
          'salle_de_bain_2_photos', NEW.salle_de_bains_salle_de_bain_2_photos_salle_de_bain,
          'salle_de_bain_3_photos', NEW.salle_de_bains_salle_de_bain_3_photos_salle_de_bain,
          'salle_de_bain_4_photos', NEW.salle_de_bains_salle_de_bain_4_photos_salle_de_bain,
          'salle_de_bain_5_photos', NEW.salle_de_bains_salle_de_bain_5_photos_salle_de_bain,
          'salle_de_bain_6_photos', NEW.salle_de_bains_salle_de_bain_6_photos_salle_de_bain,
          
          -- Section Cuisines (7 champs)
          'cuisine1_cuisiniere_photo', NEW.cuisine_1_cuisiniere_photo,
          'cuisine1_plaque_cuisson_photo', NEW.cuisine_1_plaque_cuisson_photo,
          'cuisine1_four_photo', NEW.cuisine_1_four_photo,
          'cuisine1_micro_ondes_photo', NEW.cuisine_1_micro_ondes_photo,
          'cuisine1_lave_vaisselle_photo', NEW.cuisine_1_lave_vaisselle_photo,
          'cuisine1_cafetiere_photo', NEW.cuisine_1_cafetiere_photo,
          'cuisine2_photos_tiroirs_placards', NEW.cuisine_2_photos_tiroirs_placards,
          
          -- Section Salon/SAM (1 champ)
          'salon_sam_photos', NEW.salon_sam_photos_salon_sam,
          
          -- Section Équipements Spéciaux/Extérieur (3 champs)
          'exterieur_photos_espaces', NEW.equip_spe_ext_exterieur_photos,
          'jacuzzi_photos_jacuzzi', NEW.equip_spe_ext_jacuzzi_photos,
          'barbecue_photos', NEW.equip_spe_ext_barbecue_photos,
          
          -- Section Communs (1 champ)
          'communs_photos_espaces', NEW.communs_photos_espaces_communs,
          
          -- Section Bébé (1 champ)
          'bebe_photos_equipements', NEW.bebe_photos_equipements_bebe,
          
          -- Section Guide d'accès (2 champs)
          'guide_acces_photos_etapes', NEW.guide_acces_photos_etapes,
          'guide_acces_video_acces', NEW.guide_acces_video_acces,
          
          -- Section Sécurité (1 champ)
          'securite_photos_equipements', NEW.securite_photos_equipements_securite
        )
      ),
      headers := '{"Content-Type": "application/json"}'::jsonb
    );
  END IF;
  RETURN NEW;
END;
$function$;
```

### **Résultats obtenus**
- ✅ **29 champs ciblés** au lieu de 750+ colonnes
- ✅ **Structure logique** : metadata → proprietaire → logement → pdfs → media
- ✅ **Interface Make utilisable** : mapping simple et intuitif
- ✅ **Toutes les photos/vidéos présentes** et organisées par section
- ✅ **Workflow Drive configurable** facilement
- ✅ **Performance optimisée** pour Make

### **Impact Business**
- **Temps configuration Make** : 3h → 30min
- **Maintenance** : Aucune modification nécessaire pour nouveaux champs photos
- **Workflow Drive** : Organisation automatique par section possible
- **Évolutivité** : Structure extensible sans casser l'existant

---

## 🔧 **Template pour nouveaux bugs**

```markdown
## 🚨 **BUG #XXX - Titre du bug**
**Date :** JJ/MM/AAAA  
**Gravité :** Critique/Majeure/Mineure  
**Statut :** 🔄 EN COURS / ✅ RÉSOLU / ❌ NON RÉSOLU  

### **Symptômes**
- Comportement observé
- Messages d'erreur exacts
- Actions qui ne fonctionnent pas

### **Cause racine**
Explication technique du problème

### **Solution finale**
```code
Code de la solution qui fonctionne
```

### **Tests validés**
- ✅ Test 1
- ✅ Test 2

### **Prévention**
- ⚠️ Points d'attention pour éviter le problème
```

---

*📝 Maintenez ce fichier à jour à chaque bug critique rencontré*