# Script de la page d'accueil, www.havesomecode.io

> Pour le builder : un écran = une section de la page, dans cet ordre. Les textes entre « » sont ceux à afficher tels quels. Les blocs « Visuel » décrivent ce qu'il faut construire en HTML/CSS (aucune fausse capture de produit). Les scènes sont racontées comme des histoires, sans étiquette « Exemple », « Illustration » ni mention « fictif » à l'écran (décision de Zacaria, 21/11). Aucun tarif, aucun témoignage, aucun chiffre : les visuels n'affichent aucun montant lisible (barres et libellés seulement).

**Cible (validée par Zacaria le 21/11) :** le dirigeant d'une PME locale, dans les métiers de devis, de commandes et de facturation. L'indépendant qui jongle avec ses outils est la cible secondaire (écran 6).

**Ligne directrice :** le lecteur est un dirigeant de PME qui n'a jamais touché à l'IA. Chaque scène suit le même fil : une personne avec un prénom, un jour et un moment de la journée, ce que ça coûte aujourd'hui, ce qui se passe avec un agent, puis l'objection la plus probable. La scène centrale (écran 3) est racontée du point de vue du dirigeant, avec la personne qui fait le travail à ses côtés.

---

## Écran 1. Hero

**Surtitre :** « Zacaria Chtatar · HaveSomeCode »

**Titre :** « Développeur, j'aide les entreprises à mettre l'IA au travail. »

**Texte :** « Bienvenue sur mon site. Vous y trouvez mon accompagnement pour les entreprises qui veulent y voir clair sur l'IA, mais aussi des guides pour apprendre, mes notes de travail et mes projets personnels. »

**Ligne de conditions :** « Accompagnement : 30 minutes pour en parler, sans engagement. Je ne vends pas de logiciel. »

**Bouton principal :** « Voir ce qu'on trouve ici » (défile jusqu'à l'écran 2)

**Lien secondaire :** « Discutons de votre projet » (mène à l'écran Contact)

**Visuel :** Fond sobre aux couleurs HaveSomeCode. À droite, la même carte que sur la maquette actuelle, mais avec quatre lignes qui servent de plan du site. Chaque ligne a un nom, une phrase, et un lien vers sa section :
- « Conseil IA » : « Mettre un assistant au travail dans votre entreprise » (vers l'écran 2)
- « Guides » : « Go, GitOps, Kubernetes, mémoire des agents : comprendre pas à pas » (vers la section Projets, entrées HaveSome)
- « Notes » : « Ce que j'apprends en construisant, noté au fil de l'eau » (vers Dernières notes)
- « Projets » : « Des outils que je construis pour moi : Kibana MCP, Pathfinding, Float » (vers Projets personnels)

Retirer l'ancienne pile « Message à recopier / Prix à mettre à jour / Facture à relancer » : les tâches qu'elle montrait sont racontées dans les scènes des écrans 3 à 6.

---

## Écran 2. Un agent, c'est quoi ?

**Titre :** « Un agent, c'est un assistant qui fait le travail à côté de vous »

**Texte :** « Vous lui expliquez une tâche, comme à un nouveau collègue : "quand un client demande un devis, regarde si la demande est complète, prépare la réponse". Il utilise alors vos outils habituels (messagerie, tableur, logiciel de facturation) et prépare le travail. Pour tout ce qui engage l'entreprise, il demande avant d'agir. »

**Visuel :** Trois pastilles reliées par des flèches : « Vous écrivez la consigne » → « L'agent prépare la tâche dans vos outils » → « Vous validez l'envoi ». Chaque pastille a une icône simple (stylo, engrenage, coche).

---

## Écran 3. Scène centrale, le tri des demandes et des devis

**Titre :** « Lundi matin, les demandes de devis attendent dans la boîte mail »

**Texte :** « Éric dirige une imprimerie. Chaque jour, des demandes de devis arrivent sur l'adresse de l'entreprise, mélangées à des réclamations, des relances de fournisseurs et des publicités. Sandrine, à l'administration des ventes, les ouvre une à une : celle-ci est complète, celle-là n'indique ni quantité ni délai, cette autre est urgente mais enfouie sous le reste. Lundi, huit heures et demie, Éric passe la tête dans son bureau et demande : "On a répondu à tout le monde ?" Sandrine ne peut pas le dire. Un client écrit depuis jeudi. Éric ne sait pas ce que ça lui a coûté, mais il sait qu'un devis qui arrive tard est un devis qu'on perd souvent. »

**Avec un agent :** « L'agent lit chaque nouvelle demande et la range dans l'une de trois piles : prête à chiffrer, à compléter, urgente. Pour chacune, il remplit une fiche (client, produit, quantité, délai) et prépare un brouillon de réponse : un accusé de réception, ou la liste de ce qui manque pour établir le prix. Sandrine relit, corrige si besoin, et c'est elle qui envoie. Éric, son café à la main, regarde une seule liste : ce qui a reçu une réponse, ce qui attend une information du client, ce qui presse. »

**Les objections :** « Éric vous dira : "et si l'assistant répond n'importe quoi à mes clients ?" Rien ne part sans Sandrine : l'agent prépare, elle valide chaque message. Sandrine, elle, se demandera si on cherche à la remplacer. Non : elle garde son métier, le jugement sur le prix, la relation avec le client, et elle perd la partie qui l'use, le tri et la recopie. Elle est associée dès le premier jour, parce que c'est elle qui sait ce qu'est une demande bien faite. »

**Visuel :** Avant / après en deux colonnes. Avant : une boîte de réception en vrac (demandes, réclamations, publicités mélangées, une ligne surlignée « urgent » perdue au milieu), Sandrine au centre, Éric qui demande « On a répondu à tout le monde ? ». Après : trois colonnes nettes, « Prêtes à chiffrer », « À compléter », « Urgentes », avec sous chaque demande un brouillon de réponse et un bouton « Relire et envoyer ». En haut, une seule ligne pour Éric : « Répondu / En attente du client / À traiter maintenant », sans montant ni statistique affichés.

---

## Écran 4. Scène 2, contacts et prix à jour

**Titre :** « Le devis est parti avec l'ancien prix »

**Texte :** « Hélène dirige une petite entreprise qui pose des cuisines. Ses fournisseurs lui envoient leurs nouveaux tarifs par mail, en PDF. Jeudi, en fin d'après-midi : un client demande un devis, et personne ne sait si la liste de prix du tableur est la dernière. Un devis au mauvais prix, c'est soit une marge perdue, soit un client à rappeler pour s'excuser. »

**Avec un agent :** « Quand un fournisseur envoie un nouveau tarif, l'agent lit le document, prépare la mise à jour de la liste de prix et signale à Hélène ce qui a changé : "plusieurs références ont augmenté". Même chose pour les coordonnées : si un contact change de numéro dans un mail, la fiche est proposée à la correction. »

**L'objection :** « Vous allez me dire : "et s'il se trompe de ligne ?" Chaque changement est listé avec l'ancien et le nouveau prix, et Hélène valide avant qu'il serve dans un devis. Un agent peut se tromper, c'est pour cela que vous gardez la dernière main. »

**Visuel :** Un mail avec une pièce jointe « tarif-fournisseur.pdf » qui devient un petit tableau : trois lignes de produits, colonnes « Ancien prix » (barre grise) et « Nouveau prix » (barre colorée), bouton « Valider » en bout de ligne. Aucun montant lisible.

---

## Écran 5. Scène 3, encaissements et trésorerie

**Titre :** « Où en est la trésorerie ? Je regarde quel fichier est le bon »

**Texte :** « Patrick dirige un bureau d'études. Pour savoir où en est l'entreprise, il doit ouvrir l'outil de facturation, la banque, et un tableur qu'une collègue met à jour quand elle a le temps. En fin de mois, tôt le matin, il hésite à valider une dépense, parce qu'il ne sait pas si deux factures en retard ont été payées. »

**Avec un agent :** « L'agent rassemble les factures, les paiements reçus et les dépenses prévues, et prépare chaque matin une page simple : ce qui est rentré ce mois-ci, ce qui est en retard, les relances à faire. Plus de tableur à ouvrir ni de collègue à déranger. Patrick lit un écran, pas des lignes. »

**L'objection :** « Vous allez me dire : "mes chiffres sont confidentiels". Ils le restent : l'agent lit seulement ce que vous lui ouvrez, et vous décidez où les données sont stockées. On en parle avant de commencer, pas après. »

**Visuel :** Un tableau de bord simplifié : trois grands blocs (« Encaissé ce mois-ci », « En retard », « Relances à faire ») avec une jauge ou une barre chacun, sans montant ni courbe chiffrée.

---

## Écran 6. Scène 4, pour l'indépendant : la prospection

**Titre :** « Mélanie passe sa semaine à recopier des fiches »

**Texte :** « Mélanie est indépendante en développement commercial. Pour trouver des clients, elle ne fait pas que téléphoner : elle cherche des entreprises dans Apollo, les range dans Notion, suit les échanges dans HubSpot, et demande à Claude et ChatGPT de rédiger ses messages. Tout en versions gratuites, donc cinq outils qui ne se parlent pas. Mardi, neuf heures du soir : elle recopie encore des noms d'un outil à l'autre. Ce temps-là, elle ne le passe pas avec un prospect. »

**Avec un agent :** « Cinq outils qui ne se parlent pas ? Un seul endroit où voir qui rappeler. L'agent prépare la liste du jour et un brouillon de message par contact. Mélanie lit, corrige, et c'est elle qui envoie. Le lendemain, elle ouvre un seul outil et sait qui rappeler. »

**L'objection :** « Vous allez me dire : "mes prospects ne veulent pas de messages automatiques". Ils n'en reçoivent pas. L'agent prépare, Mélanie relit et signe chaque message. Le téléphone reste son meilleur outil, l'agent s'occupe de ce qui l'entoure. »

**Visuel :** Avant / après en deux colonnes. Avant : cinq rectangles nommés (Notion, Apollo, HubSpot, Claude, ChatGPT) reliés par des flèches qui partent dans tous les sens, une silhouette au milieu, « mardi soir » en haut. Après : un seul rectangle « Liste du jour » avec trois prospects, un brouillon à côté de chacun, et un bouton « Valider ».

---

## Écran 7. Comment ça se passe

**Titre :** « On commence par parler, pas par installer »

**Texte :** « Trois étapes, et vous pouvez vous arrêter après chacune. Moins de saisie et de relances dans votre équipe, sans changer d'outil pour le plaisir. »

1. **« Une demi-heure au téléphone. »** « Vous me décrivez une tâche qui vous fait perdre du temps. Je pose des questions, je ne vends rien. Il est possible que ma réponse soit : ne changez rien. »
2. **« Un diagnostic. »** « Je regarde comment la tâche se fait vraiment, avec la personne qui la fait. Je vous remets une page : la plus petite amélioration utile, et comment la mettre en place. Parfois, un réglage dans votre logiciel actuel suffit. »
3. **« Un essai sur une seule tâche. »** « Une personne de votre équipe l'utilise, nous regardons ce qui change, et vous décidez de continuer ou d'arrêter. L'assistant prépare, elle relit, elle envoie. Rien de ce qui engage l'entreprise ne part sans l'accord d'une personne de chez vous. »

**Ligne de bas :** « Un devis écrit avant tout engagement. »

**Visuel :** Frise horizontale en trois étapes avec une porte de sortie « Je m'arrête ici » sous chacune. Mobile : frise verticale.

---

## Écran 8. Qui je suis

**Titre :** « Zacaria Chtatar, développeur »

**Texte :** « Je construis des logiciels depuis plus de dix ans, et je dirige des équipes techniques depuis plusieurs années. Je suis aujourd'hui lead développeur chez Club Med, sur la plateforme qui alimente leurs applications, où j'ai mis en production trois agents pour des tâches de diagnostic et de développement. Je suis indépendant et je travaille depuis la France. »

**Visuel :** Photo de Zacaria si disponible (sinon initiales sur fond uni). À côté, une ligne de repères : « Développeur », « Lead technique », « Club Med ».

---

## Écran 9. Contact

**Titre :** « Parlons de votre tâche qui prend trop de temps »

**Texte :** « Écrivez-moi en deux lignes ce qui vous fait perdre du temps. Je vous réponds pour fixer un appel d'une demi-heure. »

**Bouton :** « Discutons de votre projet » (ouvre un mail vers z@havesomecode.io, ou le formulaire existant)

**Visuel :** Bloc centré, grand bouton, l'adresse z@havesomecode.io en clair en dessous.

---

## Pied de page

Garder tel quel : CV, guides, blog, liste d'intérêt conseil IA existante. Aucun changement de texte demandé.

---

## Notes privées pour Zacaria (à ne pas afficher)

- **Ce qui a changé (22/11) :** la scène centrale est maintenant le tri des demandes et des devis (écran 3), racontée du côté du dirigeant avec la personne de l'administration des ventes à ses côtés. La prospection passe en scène secondaire pour l'indépendant (écran 6). Les phrases de valeur de CIBLE-PERSONAS-VALEUR.md sont reprises : dirigeant (écrans 3 et 7), personne qui fait le travail (objection de l'écran 3, étape 3 de l'écran 7), indépendant (écran 6).
- **Contrôle des mots :** « agent » est expliqué à l'écran 2 avant tout autre emploi. Les trois mots bannis n'apparaissent nulle part ; « MCP » seulement dans le nom du projet Kibana MCP, au plan du site du hero. Aucun chiffre, tarif ni témoignage : les durées sont écrites en lettres, les années de carrière retirées, les montants des visuels remplacés par des barres.
- **Inventé, sans étiquette à l'écran :** les quatre personnes, leurs entreprises et les moments de la journée. Aucune durée gagnée, aucun pourcentage, aucun client.
- **À vérifier de ton côté :** (1) la scène de tri décrit une tâche que tu n'as pas encore fait tourner pour une PME : à démontrer sur un exemple réel avant de la promettre ; (2) la phrase « trois agents en production chez Club Med » reprend ton texte d'offre ; (3) l'écran 6 suppose qu'un agent peut utiliser Apollo, Notion et HubSpot en versions gratuites, sinon reformuler en « vos outils actuels » ; (4) l'écran 5 suppose l'accès à la banque : à garder seulement si tu sais le faire proprement, sinon « factures et encaissements ».
- **Volontairement absent :** tarif, délai promis, gain de temps chiffré, logos de clients.
