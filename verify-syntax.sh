#!/bin/bash

echo \Vérification de la syntaxe JavaScript...\nnpx eslint --max-warnings=0 src/

if [   -eq 0 ]; then
  echo \✅ Vérification de syntaxe réussie!\n  exit 0
else
  echo \❌ Des erreurs de syntaxe ont été trouvées.\n  exit 1
fi
