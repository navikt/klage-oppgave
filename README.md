# KABAL

Appen kan nås i dev her:
https://kabal.dev.nav.no/

### Utvikling

Gå inn i de ulike prosjektene (/server, /api-mock-server, /frontend) og kjør `npm install`

Kjør så opp med docker-compose:

`docker-compose up --build`

og gå til http://localhost:8060 i nettleseren

### TEST OG COMMIT

For testing før commit:

```
cd frontend
npm t
```

_Ny branch_

```
git checkout main
git checkout -b newbranch
```

_Merge_

```
git checkout main
git pull
git checkout newbranch
git rebase main
git checkout main
git rebase newbranch
```
