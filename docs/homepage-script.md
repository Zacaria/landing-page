# Page d’accueil : carnet de spécimens

Direction B choisie par Zacaria le 22/11 (maquette `~/Documents/lancements/site-v2/propositions/round-1.html`, onglet B). Style webdev.teknium.io : fond noir, ivoire, chartreuse, Instrument Serif pour les titres, Geist et Geist Mono pour le reste. Peu de texte : les démos animées montrent le travail. Le thème sombre est celui par défaut ; Clair et Auto restent disponibles en pied de page.

Les textes entre « » s’affichent tels quels. Les noms d’entreprises et de personnes des démos sont des scènes, sans étiquette « exemple » à l’écran. Aucun montant.

## Hero

Direction A choisie par Zacaria le 22/11 après un grill : la question qu’il pose en face à face, et un champ pour y répondre tout de suite. Maquette : `docs/maquettes/hero-v2-2026-11-22.html` (bloc A).

- Surtitre mono : « HaveSomeCode » puis « Zacaria Chtatar » en chartreuse.
- Titre : « Qu’est-ce qui vous coûte *le plus de temps* chaque jour ? » (italique chartreuse sur « le plus de temps »).
- Sous-titre : « Je fais communiquer vos outils entre eux pour réduire les tâches sans valeur ajoutée. Vous gardez la main sur chaque action finale. »
- À droite (dessous sous 760 px) : petit libellé mono « Racontez-moi », champ multi-ligne étiqueté « Ce qui me prend le plus de temps, c’est… », bouton « Envoyer à Zacaria → ». Le bouton ouvre `mailto:z@havesomecode.io` avec le texte saisi en corps ; champ vide, le même mail sans corps. Rien n’est stocké côté serveur. Sans JavaScript, le formulaire `mailto:` en GET fait la même chose.
- Ligne sous le hero : « Je vous réponds moi-même. 30 minutes pour en parler, sans engagement. »
- Pas un mot sur l’autonomie dans le hero (décision de Zacaria).
- Aucun nombre d’assistants, nulle part (hero, meta, JSON-LD, llms.txt) : décision de Zacaria du 22/11.

## Grille des assistants (`#assistants`)

Chaque carte : zone de démo noire avec « en direct » et « ⟲ rejouer », numéro, titre, une phrase, étiquettes.

1. **« Le tri des demandes »** : « Chaque mail est rangé, avec un brouillon de réponse prêt à relire. » Étiquettes : mails, tableur, validation humaine. Démo : six mails tombent dans Prêt / À compléter / Urgent. État final : 3 / 2 / 1.
2. **« Le point du matin »** : « À 9 h, un mail court : ce qui avance, ce qui attend, ce qui est en retard. » Étiquettes : google sheets, lecture seule. Démo : l’objet « Point du matin du 11/05 : 2 avancés, 3 à décider, 1 en retard » se tape, puis les lignes Ce qui a avancé / À votre décision / En retard apparaissent.
3. **« Les prix à jour »** : « Le tarif fournisseur arrive, chaque écart attend votre accord. » Étiquettes : pdf, catalogue, validation humaine. Démo : cinq lignes passent de « en attente » à « hausse · à valider » ou « baisse · à valider », puis « validé ✓ » ; une reste « inchangé ». Barres seulement.
4. **« Le rappel d’échéance »** : « À J-7 puis J-1, la bonne personne est prévenue. Rien de plus. » Étiquettes : agenda, message. Démo : le curseur avance vers l’échéance TVA ; « Rappel · TVA à déclarer dans 7 jours → Marc », puis « … demain → Marc ».

5. **« Veille missions »** : « Chaque lundi à 8 h, au plus cinq missions classées, avec le lien pour les lire. » Étiquettes : sources publiques, lecture seule. Démo : dix annonces, quatre classées avec source et lien.
6. **« Tri des mails »** : « À 7 h 30, ma boîte est rangée en quatre piles, avec un brouillon pour chaque mail qui attend une réponse. » Étiquettes : gmail, rien n’est envoyé. Démo : six mails étiquetés puis un brouillon se tape.

Sous la grille : « Voir les quatre offres → » vers `/offres`. La navigation inclut « Offres ».

Sans JavaScript ou avec les animations réduites, chaque carte affiche son état final. Les démos tournent seulement quand la carte est visible.

**Ajouter une carte :** une entrée dans `specimens` (`scripts/render.mjs` : id, titre, phrase, étiquettes, description accessible, état final en HTML), une fonction du même id dans `client/assets/specimens.js`, puis mettre à jour les tests.

## Sous la grille, en version courte

- **Qui je suis** (`#about`) : « Zacaria Chtatar, développeur » ; « Je construis des logiciels depuis plus de dix ans, et je dirige des équipes techniques depuis plusieurs années. Je suis aujourd’hui lead développeur chez Club Med. Je suis indépendant et je travaille depuis la France. » Portrait et liens de contact.
- **Contact** (`#contact`) : « Parlons de votre tâche qui prend trop de temps » ; « Écrivez-moi en deux lignes ce qui vous fait perdre du temps. Je vous réponds pour fixer un appel d’une demi-heure. »
- Liste d’intérêt (`#suivre`), inchangée.
- Projets personnels et guides HaveSome (`#projects`), conférences (`#speaking`), dernières notes (`#posts`).

## Pour les moteurs et les assistants IA

- Meta et og:description de l’accueil : « Des assistants IA pour les PME : tri des demandes, point du matin, rappel d’échéances. Chaque envoi reste soumis à votre accord. »
- L’accueil public porte un bloc JSON-LD (`structuredData` dans `scripts/render.mjs`) : `WebSite`, `Organization` + `ProfessionalService` HaveSomeCode avec les quatre offres de /offres en `Service`, `Person` Zacaria Chtatar (fondateur ; LinkedIn, GitHub, CV en `sameAs`), `WebApplication` Calmly publiée par HaveSomeCode. Calmly n’est pas en `sameAs` : ce n’est pas la même entité. Les aperçus privés et les autres pages n’en ont pas.
- `/llms.txt` est généré au build (`renderLlmsTxt`) : qui, pour qui, les offres, les pages clés, Calmly, les notes publiées et le llms.txt du CV.
- Phrases reprises du site uniquement : pas de client, de chiffre, de durée de mise en place ni d’avis.

## Page Offres (/offres)

Sept écrans : hero, tri des demandes, point du matin, rappel d’échéances, veille d’appels d’offres, conversation et contact. Source : `/home/hermes/Documents/AI consulting/OFFRES-PAGE.md`. Les durées « Mise en place » sont des hypothèses non validées à confirmer avec Zacaria avant production.
