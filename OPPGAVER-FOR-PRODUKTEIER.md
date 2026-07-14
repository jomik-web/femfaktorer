# Oppgaver før/under bygging av første utkast

Sist oppdatert: 13.07.2026

## Trengs snart (blokkerer at jeg kan begynne for fullt)

- [ ] **Anthropic-konto**: opprett konto på console.anthropic.com. Ikke nødvendig å legge inn betalingskort med én gang, men jeg trenger en API-nøkkel for å teste FEM. Lim aldri nøkkelen inn i chatten — legg den i en `.env.local`-fil i denne mappen (jeg lager en mal `.env.example` du kan kopiere), så leser jeg den derfra.
- [ ] **Netlify-konto**: opprett gratis konto på netlify.com. Trengs når vi er klare til å vise deg en testversjon i nettleseren uten at du må installere noe selv.

## Nytt (v2.4) -- kontofunksjon: lagre fullversjon-resultat med e-postinnlogging

Bygget etter ditt ønske om å slippe å ta testen på nytt hver gang, og kunne lagre resultatet for senere. Løsningen bruker Netlify Blobs (innebygd i Netlify -- krever normalt ingen egen oppsett fra deg) og Resend (e-postutsending av innloggingskoder). Følgende trengs fra deg før dette virker i praksis:

- [ ] **Resend-konto**: opprett gratis konto på resend.com. Gå til "API Keys" og lag en nøkkel -- legg den i `.env.local` som `RESEND_API_KEY` (aldri i chatten).
- [ ] **Avsenderadresse**: sett `RESEND_FROM_ADDRESS` i `.env.local`, f.eks. `FemFaktorer <innlogging@femfaktorer.no>`.
- [ ] **VIKTIG begrensning inntil videre**: uten et domene VERIFISERT i Resend (under "Domains" i Resend-dashbordet, krever noen DNS-oppføringer hos domeneleverandøren din) kan e-post med innloggingskode kun sendes til e-postadressen som selve Resend-kontoen din er registrert med. Det betyr at DU kan teste funksjonen fullt ut nå, men andre brukere kan ikke logge inn før et domene er verifisert. Dette er en god del av oppgaven "vurder domenenavn" lenger ned i denne lista.
- [ ] **Egen hemmelig nøkkel**: sett `ACCOUNT_OTP_PEPPER` i `.env.local` til en tilfeldig lang tekststreng (jeg kan generere en for deg om du vil, si ifra).
- [ ] Netlify Blobs krever normalt INGEN egen oppsett fra deg -- det er automatisk tilgjengelig for alle Netlify-nettsteder. Kun om noe ikke fungerer som forventet i produksjon, kan `NETLIFY_BLOBS_SITE_ID`/`NETLIFY_BLOBS_TOKEN` settes manuelt (se `.env.example`).

## Bør startes nå (lang ledetid, blokkerer ikke koding)

- [ ] **Registrer enkeltpersonforetak** (Altinn/Brønnøysundregistrene) — bør være i gang før dere signerer betalte avtaler med Netlify/Anthropic, og før behandlingsansvarlig navngis endelig i personvernteksten.
- [ ] **Finn en jurist** som kan kvalitetssikre personvern-/justeksten (Dokument 07) før reell lansering med ekte brukere. Blokkerer ikke bygging eller testing, bare offentlig lansering.
- [ ] **Vurder domenenavn** (f.eks. femfaktorer.no) og evt. reserver det hos en registrar.

## Nytt (v2.6) -- personvernside og GDPR-oppfølging

Ny, fullstendig personvernside (`/personvern`) er publisert, sammen med en enkel 18+-bekreftelse før testen starter. Følgende gjenstår og bør tas sammen med juristgjennomgangen over, ikke separat:

- [ ] **Databehandleravtaler (DPA)**: aksepter/signer DPA aktivt (ikke bare klikk gjennom) hos Netlify, Resend og Anthropic. Alle tre tilbyr dette som en del av sine kommersielle vilkår — se lenker i `/personvern`.
- [ ] **Personvernkonsekvensvurdering (DPIA)**: bør gjennomføres før bred, offentlig lansering, siden testresultater (og særlig tilleggsseksjonen om politiske/verdimessige holdninger) regnes som sensitiv/særlig kategori informasjon.
- [ ] **Vurder automatisk lagringsbegrensning** for lagrede kontoresultater (Netlify Blobs) — i dag slettes disse kun manuelt av brukeren selv, ingen utløpsdato. Bør vurderes som del av juristgjennomgangen.
- [ ] **Fyll inn organisasjonsnummer** på `/personvern` så snart enkeltpersonforetaket er registrert (se oppgaven over).

## Kan vente

- [ ] Plausible-konto (analyse) — sett opp nærmere lansering.
- [ ] Fagperson (psykolog) til kvalitetssikring av tolkningstekster — dere har allerede besluttet å vente med dette til en testversjon er live (se Dokument 01 §21 pkt. 14).
- [x] **Node.js lokalt — avklart 13.07.2026: hoppes over for nå.** Ikke nødvendig: jeg bygger og tester alt i min egen sandkasse, og du ser resultatet via en privat Netlify-forhåndsvisning i vanlig nettleser. Installer selv senere (nodejs.org) bare hvis du vil kjøre koden direkte på egen maskin.
- [x] **Git/GitHub — avklart 13.07.2026: Git settes opp lokalt av meg, GitHub hoppes over for nå.** Git gir oss historikk/angre-mulighet uten at det krever noe fra deg. GitHub (nettbasert backup/auto-publisering) er valgfritt og kan legges til senere — Netlify krever det ikke.

## Om denne mappen

Denne mappen ligger i Dropbox. Det fungerer, men når prosjektet får en `node_modules`-mappe (titusenvis av småfiler som npm installerer) og en `.next`-build-mappe, vil Dropbox prøve å synkronisere alt sammen kontinuerlig — det kan gjøre Dropbox tregt og i verste fall skape synk-konflikter. Jeg legger inn en `.gitignore` og markerer disse mappene som "ignorert" av Dropbox (macOS-kommando, kjøres én gang) når jeg setter opp prosjektet, så resten av mappen (kildekode, dokumentasjon) fortsatt synkes normalt.

## Datasett for fremtidige normer (avklart 13.07.2026)

Når normbaserte skårer skal bygges (fase 2/senere), brukes Dr. John A. Johnsons offentlige IPIP-NEO-120-datasett (OSF, osf.io/tbmh5) — det eneste åpne datasettet på spørsmålsnivå som faktisk inneholder responser på FemFaktorers 30 spørsmål. Se Dokument 03 §10.4 og Dokument 06 (begge v1.1) for detaljer.
