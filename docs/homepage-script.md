# Page d’accueil : carnet de spécimens

Direction B choisie par Zacaria le 22/11 (maquette `~/Documents/lancements/site-v2/propositions/round-1.html`, onglet B). Style webdev.teknium.io : fond noir, ivoire, chartreuse, Instrument Serif pour les titres, Geist et Geist Mono pour le reste. Peu de texte : les démos animées montrent le travail. Le thème sombre est celui par défaut ; Clair et Auto restent disponibles en pied de page.

Les textes entre « » s’affichent tels quels. Les noms d’entreprises et de personnes des démos sont des scènes, sans étiquette « exemple » à l’écran. Aucun montant.

## Hero

- Surtitre mono : « Carnet · Vol. 1 » puis « Novembre 2026 » en chartreuse.
- Titre : « Quatre assistants. » / « *En marche, ici.* » (italique chartreuse).
- Trois chiffres : « 4 » démos en direct, « 2 » tournent chez moi, « 0 » envoi sans votre accord.
- Bouton : « Discutons de votre projet » (vers le contact).
- Conditions : « 30 minutes pour en parler, sans engagement. Je ne vends pas de logiciel. »

## Grille des assistants (`#assistants`)

Chaque carte : zone de démo noire avec « en direct » et « ⟲ rejouer », numéro, titre, une phrase, étiquettes (« tourne chez moi » en chartreuse).

1. **« Le tri des demandes »** : « Chaque mail est rangé, avec un brouillon de réponse prêt à relire. » Étiquettes : mails, tableur, validation humaine. Démo : six mails tombent dans Prêt / À compléter / Urgent. État final : 3 / 2 / 1.
2. **« Le point du matin »** : « À 9 h, un mail court : ce qui avance, ce qui attend, ce qui est en retard. » Étiquettes : tourne chez moi, google sheets, lecture seule. Démo : l’objet « Point du matin du 11/05 : 2 avancés, 3 à décider, 1 en retard » se tape, puis les lignes Ce qui a avancé / À votre décision / En retard apparaissent.
3. **« Les prix à jour »** : « Le tarif fournisseur arrive, chaque écart attend votre accord. » Étiquettes : pdf, catalogue, validation humaine. Démo : cinq lignes passent de « en attente » à « hausse · à valider » ou « baisse · à valider », puis « validé ✓ » ; une reste « inchangé ». Barres seulement.
4. **« Le rappel d’échéance »** : « À J-7 puis J-1, la bonne personne est prévenue. Rien de plus. » Étiquettes : tourne chez moi, agenda, message. Démo : le curseur avance vers l’échéance TVA ; « Rappel · TVA à déclarer dans 7 jours → Marc », puis « … demain → Marc ».

Sans JavaScript ou avec les animations réduites, chaque carte affiche son état final. Les démos tournent seulement quand la carte est visible.

**Ajouter une carte :** une entrée dans `specimens` (`scripts/render.mjs` : id, titre, phrase, étiquettes, description accessible, état final en HTML), une fonction du même id dans `client/assets/specimens.js`, puis mettre à jour le chiffre « démos en direct » et les tests.

## Sous la grille, en version courte

- **Qui je suis** (`#about`) : « Zacaria Chtatar, développeur » ; « Je construis des logiciels depuis plus de dix ans, et je dirige des équipes techniques depuis plusieurs années. Je suis aujourd’hui lead développeur chez Club Med. Je suis indépendant et je travaille depuis la France. » Portrait et liens de contact.
- **Contact** (`#contact`) : « Parlons de votre tâche qui prend trop de temps » ; « Écrivez-moi en deux lignes ce qui vous fait perdre du temps. Je vous réponds pour fixer un appel d’une demi-heure. »
- Liste d’intérêt (`#suivre`), inchangée.
- Projets personnels et guides HaveSome (`#projects`), conférences (`#speaking`), dernières notes (`#posts`).
