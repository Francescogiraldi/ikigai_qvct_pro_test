# Fichier de test pour simuler un utilisateur

# Configuration des tests d'inscription
TEST_EMAIL="test_utilisateur_1745493151@example.com"
TEST_PASSWORD="TestPassword123\!"
TEST_USERNAME="TestUser1745493151"

# Configuration des tests d'onboarding
TEST_RESPONSE_PASSION="Créer, Voyager"
TEST_RESPONSE_MISSION="Education"
TEST_RESPONSE_VOCATION="Communication, Créativité"
TEST_RESPONSE_PROFESSION="Conseil, Enseignement"

echo "Configuration de test créée avec l'email: $TEST_EMAIL"

# Créer un fichier .env.test pour les valeurs d'environnement
echo "REACT_APP_TEST_EMAIL=$TEST_EMAIL" > .env.test
echo "REACT_APP_TEST_PASSWORD=$TEST_PASSWORD" >> .env.test
echo "REACT_APP_TEST_USERNAME=$TEST_USERNAME" >> .env.test

# Exportez ces variables pour utilisation dans d'autres scripts
export TEST_EMAIL
export TEST_PASSWORD
export TEST_USERNAME

