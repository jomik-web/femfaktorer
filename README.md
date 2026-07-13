# FemFaktorer -- førsteutkast

Kildegrunnlag: dokumentbiblioteket i `Dokumentbibliotek/V 0.1/FemFaktorer v1.0 - Grunnlag for koding/`
(spesielt Grunnlagsdokumentet v1.7 og Dokument 03 v1.1).

## Status (13.07.2026)

Bygget, men **ikke kjørt eller testet** i denne økten -- sandkassen som bygde dette har bare
nettverkstilgang til `api.anthropic.com`, ikke til npm sitt pakkeregister. Det betyr `npm install`
er aldri kjørt her. Første reelle test skjer når dette lastes opp til Netlify (som gjør sin egen
`npm install` og bygg i skyen) eller når noen kjører `npm install` med vanlig internettilgang.

### Ferdig i dette utkastet
- Prosjektoppsett (Next.js App Router, TypeScript, Tailwind)
- Design-tokens fra Dokument 02 (farger, mørk modus, typografi, avstander, radius)
- De 30 spørsmålene + skåringsmotor (ren funksjon, med automatiserte tester i `src/lib/scoring.test.ts`)
- Testflyt: ett spørsmål om gangen, autolagring lokalt, tilbakeblaing, hopp til ubesvart
- Resultatside: horisontale skalaer, tolkningstekst, ikke-diagnostisk-merknad
- FEM: samtykke-gate, API-rute mot Claude Haiku 4.5, Response Validator mot absolutte ord
- Admin-panel: passkey-registrering/innlogging (WebAuthn), AI av/på, vedlikeholdsmodus, spørsmålstak

### Bevisst IKKE ferdig -- kjente hull
1. **Tolkningstekstene i `src/data/interpretations.ts` er mitt eget førsteutkast**, ikke hentet
   ordrett fra Dokument 04 (fulltekstversjonen var ikke tilgjengelig i denne økten). Må samkjøres
   med Dokument 04 og gjennom faglig kvalitetssikring (Dokument 01 §21 punkt 14) før lansering.
2. **Admin-panelets lagring (`src/lib/admin/store.ts`) er en JSON-fil**, ikke en ekte database.
   Fungerer til testing, men Netlifys produksjonsmiljø har ikke et vedvarende filsystem mellom
   kalde starter -- må byttes til f.eks. Netlify Blobs før reell drift.
3. **AI-spørsmålstaket per økt er klientrapportert**, ikke serverhåndhevet (se kommentar i
   `src/app/api/fem/route.ts`). Fungerer som anti-misbruk-brems, ikke som en vanntett økonomisk
   sperre. Et ekte globalt tak trenger en backend-teller.
4. **@simplewebauthn/server sin nøyaktige API-form** (`registrationInfo`-strukturen) er skrevet
   etter beste hukommelse uten mulighet til å sjekke dokumentasjon i denne økten. Første `npm
   install` + bygg vil vise som TypeScript-feil dersom noe avviker.
5. Admin-dashbord (besøkstall, AI-kostnad) er ikke bygget -- bare de tekniske bryterne.
6. Norsk oversettelse av de 30 spørsmålene er en arbeidsoversettelse, ikke språklig kvalitetssikret.
7. Persentiler/normdata: bruker en ren lineær 0-100-omregning (se Dokument 03 §10.4), ikke ekte
   normer -- besluttet fremtidig datasett er Johnsons IPIP-NEO-120 via OSF (osf.io/tbmh5).

## Kom i gang lokalt

```bash
npm install
cp .env.example .env.local   # fyll inn ANTHROPIC_API_KEY og ADMIN_SESSION_SECRET
npm run dev
```

Åpne http://localhost:3000. Generer en sesjonshemmelighet med:

```bash
openssl rand -hex 32
```

## Kjøre tester

```bash
npm test
```

## Deploy til Netlify

Se `netlify.toml`. Bruk "Upload your project files" / "choose a folder" i Netlify sitt
dashbord (vi bruker ikke Git-integrasjon i denne runden). Husk å legge inn alle variablene fra
`.env.example` som miljøvariabler i Netlifys prosjektinnstillinger -- `.env.local` følger ikke
med i opplastingen (det er bevisst, se `.gitignore`).
