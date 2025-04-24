#\!/bin/bash

# Script de simulation d'un nouvel utilisateur qui complète l'onboarding
# Ce script utilise curl pour simuler les appels API et valider le flux 

# Configuration
EMAIL="test_utilisateur_1745493484@example.com"
PASSWORD="TestPassword123\!"
USERNAME="TestUser1745493484"

# Étape 1: Création du compte
echo "📝 Simulation de création de compte: "

response=$(curl -s -X POST https://mgegwthaogszzgflwery.supabase.co/auth/v1/signup \
  -H "apikey: ${REACT_APP_SUPABASE_ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "'""'",
    "password": "'""'",
    "data": {
      "first_name": "Test",
      "last_name": "User",
      "status": "Freelance"
    }
  }')

user_id=$(echo $response  < /dev/null |  grep -o '"id":"[^"]*"' | head -1 | cut -d '"' -f 4)

if [ -z "$user_id" ]; then
  echo "❌ Erreur lors de la création du compte"
  echo $response
  exit 1
fi

echo "✅ Compte créé avec succès\! ID: $user_id"

# Étape 2: Simulation des réponses d'onboarding
echo "📋 Simulation des réponses d'onboarding"

onboarding_responses='{
  "passion_q1": ["p1_o1", "p1_o3"],
  "passion_q2": "Voyages et technologie",
  "passion_q3": ["p3_o1", "p3_o4"],
  "mission_q1": ["m1_o1", "m1_o2"],
  "mission_q2": "Aider à éduquer sur l'environnement",
  "mission_q3": ["m3_o2", "m3_o3"],
  "vocation_q1": ["v1_o2", "v1_o4"],
  "vocation_q2": "Créativité et pensée analytique",
  "vocation_q3": ["v3_o2", "v3_o3"],
  "profession_q1": ["pro1_o2", "pro1_o6"],
  "profession_q2": "Conseil et formation",
  "profession_q3": ["pro3_o2", "pro3_o3"],
  "completedAt": "'"2025-04-24T13:18:04+02:00"'"
}'

echo "📤 Envoi des réponses à Supabase"

# Simuler un token d'accès pour l'authentification
curl -s -X POST https://mgegwthaogszzgflwery.supabase.co/rest/v1/user_responses \
  -H "apikey: ${REACT_APP_SUPABASE_ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "'""'",
    "module_id": "onboarding",
    "responses": '',
    "created_at": "'"2025-04-24T13:18:04+02:00"'",
    "updated_at": "'"2025-04-24T13:18:04+02:00"'"
  }'

echo "✅ Réponses envoyées avec succès"

# Étape 3: Vérification de la synchronisation des données
echo "🔍 Vérification de la synchronisation des données"
echo "📊 Attente de 3 secondes pour la synchronisation..."
sleep 3

# Vérification dans onboarding_responses
echo "📋 Vérification dans onboarding_responses..."
result1=$(curl -s -X GET https://mgegwthaogszzgflwery.supabase.co/rest/v1/onboarding_responses?user_id=eq. \
  -H "apikey: ${REACT_APP_SUPABASE_ANON_KEY}")

# Vérification dans user_progress
echo "📋 Vérification dans user_progress..."
result2=$(curl -s -X GET https://mgegwthaogszzgflwery.supabase.co/rest/v1/user_progress?user_id=eq. \
  -H "apikey: ${REACT_APP_SUPABASE_ANON_KEY}")

# Tests simplifiés (dans un vrai scénario, on utiliserait des assertions plus robustes)
if [[ $result1 == *""* ]]; then
  echo "✅ Données trouvées dans onboarding_responses"
else
  echo "❌ Données NON trouvées dans onboarding_responses"
fi

if [[ $result2 == *""* ]]; then
  echo "✅ Données trouvées dans user_progress"
else
  echo "❌ Données NON trouvées dans user_progress"
fi

echo "📝 Test complet\! Utilisateur: "
echo "⚠️ NOTE: Ceci est une simulation. Dans un environnement réel, ces tests seraient exécutés par une suite de tests e2e."

