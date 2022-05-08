# [Server of a Twitter clone](https://github.com/zhenyuefu/technoweb-twitter-server)

**Projet de l’UE LU3IN017 TechnoWeb de Sorbonne Universite**

Lien pour le [`client`](https://github.com/zhenyuefu/technoweb-twitter)

Lien pour [`Api Document`](https://documenter.getpostman.com/view/19358559/UyxdLVAZ ) host sur postman

Le code du serveur est maintenant hébergé sur heroku 

```
https://apitw.fuzy.tech
```

##### Architecture du code 

```
src/
├── db                         // model de database
│   ├── db.ts
│   └── models
│       ├── comment.models.ts
│       ├── post.models.ts
│       └── user.models.ts
├── middleware                 // chargement de tous les middleware
│   └── index.ts
├── routes                     // route api
│   ├── auth.jwt.bak
│   ├── auth.ts
│   ├── index.ts
│   ├── post.ts
│   ├── search.ts
│   └── user.ts
├── server.ts                  // entrée du serveur
└── types
    └── index.ts               // définitions des types
```

##### Packages utilisés

```
"bcrypt" Utilisé pour crypter les mots de passe
"cors"
"dotenv" Lire les variables d'environnement
"express"
"express-session"
"mongoose"
"mongoose-unique-validator" Veillez à ce que les noms d'utilisateur et les adresses électroniques soient uniques et insensibles à la casse.
"passport"
"passport-local" Utilisé pour gérer les sessions de connexion
```

##### Schéma de la base de données

Si votre éditeur n'affiche pas le diagramme ci-dessous, vous pouvez cliquer sur [ce lien](https://github.com/zhenyuefu/technoweb-twitter-server#schéma-de-la-base-de-données) pour aller sur github et le visualiser en ligne.

```mermaid
classDiagram
direction BT
class posts {
   objectid _id
   int32 __v
   objectid author
   string content
   list imagePath
   list comments
   isodate createAt
   list likes
   int32 countLikes
   int32 countReTweet
   boolean isDelete
   ------comment------
   objectid comments._id
   objectid comments.author
   list comments.comments
   string comments.content
   ------imagePath-----
   string imagePath.deletehash
   string imagePath.id
   string imagePath.link
   ......
}
class users {
   objectid _id
   int32 __v
   string username
   string firstName
   string lastName
   string email
   string password
   string avatar
   string bgPicture
   string introduction
   isodate createAt
   isodate updatedAt
   list followers
   list following
   list likes
}
```

