# Dine Fasetter -- nettsted

Next.js (App Router) + TypeScript + Tailwind. Personlighetstest basert på
femfaktormodellen, med AI-følgesvennen Spir.

Merk: prosjektet het tidligere **FemFaktorer**. Produktnavnet er nå **Dine Fasetter**.
GitHub-repoet heter fortsatt `femfaktorer`, og lagringsnøkler, informasjonskapsler og
Netlify Blobs-navn bruker fortsatt prefikset `femfaktorer`. Det er **med vilje** -- endres
de, mister eksisterende brukere kontoer, passkeys og lagrede resultater. Ikke gi dem nye navn.

## Hvor ting ligger

| Hva | Hvor |
| --- | --- |
| Denne kodemappa | `01 Guldager Digital/Dine Fasetter/02 Nettside/dine-fasetter-web/` |
| Dokumentbibliotek | `01 Guldager Digital/Dine Fasetter/01 Dokumentbibliotek/` |
| Kodegrunnlag | Grunnlagsdokumentet v1.7 og Dokument 03 v1.1, begge i dokumentbiblioteket |
| GitHub | `jomik-web/femfaktorer` |
| Aktive oppgaver og beslutningslogg | `OPPGAVER-FOR-PRODUKTEIER.md` i denne mappa |

## Kom i gang lokalt

```bash
npm install
cp .env.example .env.local   # fyll inn ANTHROPIC_API_KEY og ADMIN_SESSION_SECRET
npm run dev
```

Åpne http://localhost:3000. Generer en sesjonshemmelighet med `openssl rand -hex 32`.

Kjør tester med `npm test`.

## Publisering

Netlify bygger automatisk fra GitHub. Produksjonsgrenen er **`main`** -- et vanlig
`git push` til `main` utløser ny publisering. Grenen `beta` er utdatert og brukes ikke.

Alle variabler i `.env.example` må ligge som miljøvariabler i Netlifys prosjektinnstillinger.
`.env.local` følger aldri med i git (se `.gitignore`).

Byggkonfigurasjon står i `netlify.toml`.

## Kjente hull

Ført videre fra førsteutkastet 13.07.2026. Sjekk `OPPGAVER-FOR-PRODUKTEIER.md` for hva som
er lukket siden da -- den fila er den oppdaterte kilden.

1. **Tolkningstekstene i `src/data/interpretations.ts`** stammer fra et førsteutkast, ikke
   ordrett fra Dokument 04. Må samkjøres med Dokument 04 og gjennom faglig kvalitetssikring
   (Dokument 01 §21 punkt 14) før lansering.
2. **AI-spørsmålstaket per økt er klientrapportert**, ikke serverhåndhevet (se kommentar i
   `src/app/api/fem/route.ts`). Fungerer som anti-misbruk-brems, ikke som en vanntett
   økonomisk sperre. Et ekte globalt tak trenger en backend-teller.
3. **Norsk oversettelse av de 30 spørsmålene** er en arbeidsoversettelse, ikke språklig
   kvalitetssikret.
4. **Persentiler/normdata**: ren lineær 0-100-omregning (se Dokument 03 §10.4), ikke ekte
   normer. Besluttet fremtidig datasett er Johnsons IPIP-NEO-120 via OSF (osf.io/tbmh5).
