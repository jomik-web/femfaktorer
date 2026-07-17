# Oppgaver før/under bygging av første utkast

Sist oppdatert: 17.07.2026

## Nytt: fremdriftslinje med "rask start, sakte slutt" + rettet leseretning på underkategorier + tre språkfeil (v2.23, 17.07.2026)

Fire mindre, men merkbare endringer etter dagens tilbakemeldinger:

- **Fremdriftslinjen i spørreskjemaet** følger nå en kurve i stedet for en rett linje: den fylles raskt i starten og bremser mot slutten (f.eks. viser ~65 % når du reelt er halvveis). Selve teksten under linjen ("Spørsmål X av Y") er fortsatt ekte og ærlig -- det er kun den visuelle følelsen av fremgang som er justert for å holde motivasjonen oppe gjennom et langt skjema.
- **Underkategori-resultatene** ("Bekymring / ro", "Nedstemthet / motstandskraft" osv.) viste tidligere en løsrevet "Svært høyt/lavt" ved siden av navnet -- lett å mistolke, siden det første ordet i navnet er det negative (man leser fort "svært høy bekymring" når det faktisk betyr svært høy ro). Viser nå eksplisitt hvilket ord skåren gjelder, f.eks. "Svært høy grad av ro", uten at man må lese forklaringsteksten under for å forstå det riktig.
- **To setninger med språkfeil er rettet**: "Hodet ditt holder kaldt" -> "Du holder hodet kaldt" (riktig norsk uttrykk), og "solid bunn å stå på" -> "solid grunn å stå på" (riktig ord). Én automatisk generert setning i den avsluttende oppsummeringen er også omskrevet til å lyde mer naturlig.
- **Ny kort veiledning før testen starter**: samme skjerm som aldersbekreftelsen forklarer nå kort hvordan man bør svare (første innskytelse, ikke tenke for lenge, svare ut fra hvordan man vanligvis er på tvers av situasjoner) -- omtrent det en psykolog ville sagt før en administrerte en test.

Ingen handling kreves fra deg -- husk bare `git push` som vanlig.

**Ikke avgjort ennå**: skal den avsluttende oppsummeringen også antyde utviklingsmuligheter der potensial avdekkes, og i så fall hvor direkte (kun refleksjonsspørsmål vs. konkrete tips)? Ligger som et åpent spørsmål til deg -- se selve samtalen.

## Nytt: kortere setninger og en helt redesignet avslutning (v2.22, 17.07.2026)

Tre ting etter tilbakemelding: (1) alle 15 lange analysetekstene for hovedkategoriene er skrevet om til kortere, mer presise setninger -- samme innhold, mindre "kommastress". (2) N6 (sårbarhet under press) har fått samme behandling. (3) "Hva betyr dette for deg" er flyttet fra å gjentas under hver hovedkategori-fane til et eget, avsluttende ark til slutt i gjennomgangen, med en ny fane i navigasjonen ("Oppsummering"). Innholdet der er også helt omskrevet: det ser nå på tvers av ALLE kategoriene samlet, forklarer hvorfor bestemte kombinasjoner av høye/lave skårer henger sammen, og vever inn jobb/relasjoner der det er naturlig -- uten å gjenta noe ordrett fra resten av rapporten. Ingen handling kreves -- husk `git push`.

## Fikset: to reelle feil i tolkningsdataene + gjentakende Spir-feilmelding (v2.20-v2.21, 17.07.2026)

Etter din tilbakemelding om at Spir beskrev en høy score (92/100) på "Bekymring / ro" som "svært sensitiv for bekymring" -- motsatt av riktig betydning. Roten var at Spir fikk det engelske IPIP-fasettnavnet ("Anxiety") sammen med det allerede snudde tallet, og dermed la til grunn feil retning. Rettet i selve systemprompten, pluss en eksplisitt regel som ber Spir se bort fra egen bakgrunnskunnskap om vanlig skala-retning. Jeg gjennomgikk deretter ALLE 29 fasettekster og alle kombinasjonstekster for samme type feil -- fant og rettet én til (en kombinasjonstekst om åpenhet og bekymring/ro hadde riktig tekst, men feil merkelapp). Samtidig rettet jeg den gjentakende feilmeldingen i fri Spir-samtale ("jeg klarte ikke å formulere et svar") -- den skyldtes at tonesjekken feiltolket vanlige, forsiktige uttrykk som "det er ikke alltid lett" som bastante påstander. Ingen handling kreves -- husk `git push`.

## Nytt: guidet, personlig gjennomgang med Spir -- underkategori for underkategori (v2.19, 17.07.2026)

Etter ditt ønske om at Spir skal kunne gi et ekte personlig svar i stedet for kun standardtekstene: `/spir` spør nå først hvordan du vil snakke med Spir. "Fri samtale" er som før. Det nye alternativet, "Gå gjennom resultatet steg for steg", går sammen med deg gjennom alle de 29 underkategoriene, én om gangen, i samme rekkefølge som i selve rapporten (domene for domene). For hver underkategori åpner Spir med en kort, personlig tolkning av akkurat DITT tall der -- ikke en gjenbrukt standardsetning -- og stiller 1-2 utdypende spørsmål. Du svarer, kan stille flere spørsmål tilbake til analysen, og går videre til neste underkategori med en egen knapp når du selv er klar (Spir hopper aldri videre selv). Etter siste underkategori kan du enten gå tilbake til resultatsiden eller fortsette i fri samtale, med hele gjennomgangen som Spir fortsatt husker.

Noen ting du bør vite:
- Rekkefølgen og fremdriften styres av nettsiden, ikke av KI-en -- det samme "aldri en stille gjetning"-prinsippet som resten av løsningen. Spir kan derfor ikke finne på å hoppe over eller bytte rekkefølge på underkategorier.
- Tonereglene (aldri bastant, aldri diagnose, alltid vis både styrker og utfordringer, osv.) gjelder identisk i begge samtaleformer -- de ligger nå i én delt tekstblokk i koden, nettopp for at de to formene aldri skal kunne gli fra hverandre over tid.
- Dette er ren tillegg, ikke en erstatning -- den statiske rapporten på `/resultat` er uendret. Guidet gjennomgang er et alternativt, dypere lag oppå den, akkurat slik vi ble enige om.
- Ingen handling kreves fra deg for at dette skal virke -- husk bare `git push` som vanlig for at Netlify skal bygge den nye versjonen.

## Nytt: synlige svarsett-knapper for betatestere + kontolagring på pause (v2.16, 15.07.2026)

Etter ditt ønske: resultatsiden har nå to synlige knapper -- "Last ned svarene som CSV" og "Last opp et svarsett" -- tilgjengelig for alle betatestere, ikke bare deg. Tanken er at betatestere slipper å svare på alle 290 spørsmålene på nytt hver gang testen oppdateres: de laster ned svarene sine én gang, og laster dem opp igjen etter en oppdatering for å se resultatet med det samme. Knappene vises både når resultatet er ferdig, og på "ingen fullført test funnet"-siden. Alt styres fra én fil (`src/lib/featureFlags.ts`) -- når betatestingen er over, fjerner dere hele funksjonen ved å sette `BETA_ANSWER_SET_TOOLS_ENABLED = false` der (koden ligger fortsatt igjen til dere evt. vil bruke den senere).

Samtidig er kontolagring (innlogging med e-postkode, "lagre resultatet mitt", `/logg-inn`) satt PÅ PAUSE -- etter ditt ønske, siden dere nå primært jobber med språk og tilbakemeldinger, ikke kontofunksjonen. Lenken til innlogging er fjernet fra bunnteksten, lagre-seksjonen er skjult på resultatsiden, og selve `/logg-inn`-siden viser en forklarende melding i stedet for skjemaet (i tilfelle noen har den bokmerket). Ingen data er slettet, og ingenting er fjernet fra koden -- reaktiver ved å sette `ACCOUNT_SAVE_ENABLED = true` i samme fil når dere vil ta den i bruk igjen. Merk: noen tekster på f.eks. `/hjelp` og `/personvern` nevner fortsatt innlogging -- ikke rettet i denne runden, siden det er ren tekst og ikke en funksjon som faktisk kan brukes akkurat nå.

## Fikset: Spir svarte alltid det samme (v2.14, 15.07.2026)

Den tekniske tonesjekken for Spir sine svar (som skal hindre bastante/kategoriske påstander) hadde et mønster (`du er X`) som var altfor bredt og traff nesten alle ekte svar -- derfor viste Spir fallback-meldingen uansett hva du spurte om. Innsnevret til den grammatiske formen som faktisk er en identitetspåstand ("du er en/et X"), og styrket systemprompten med samme regel. Testet mot flere realistiske setninger. Ingen handling kreves fra deg -- husk bare å `git push` som vanlig.

## Nytt: last ned/last opp et fast svarsett til testing (v2.15, 15.07.2026)

Egen, skjult verktøyside på `/verktoy/svardata` (ikke lenket noe sted i menyen) der du kan laste ned alle svarene du har gitt akkurat nå som en CSV-fil, og laste den samme (eller en du har redigert for hånd i Excel) inn igjen senere -- du sendes da rett til resultatsiden, som om testen nettopp var fullført. Tanken er at du kan bygge deg faste svarsett (f.eks. "typisk høy N-profil") og bruke dem til å teste rapporttekst og Spir-samtale mot et kjent, uforandret svarsett mens resten av tjenesten fortsatt endrer seg under utviklingen. Filen åpnes direkte i norsk-språklig Excel (semikolon-skilt, riktig æøå). Ingen handling kreves fra deg nå -- bruk siden når du vil lage et testsett.

## Utvidet versjon (290 spørsmål) er nå koblet inn (v2.11, 14.07.2026)

Tredje testtrapp er ferdig bygget og koblet inn i hele appen: sjekkpunkt etter 120 spørsmål tilbyr "Utvidet versjon" (alle 290, 10 spørsmål/fasett), resultatsiden viser den på samme måte som fullversjonen (pluss en egen presiseringstekst), Spir og PDF-nedlasting fungerer for begge, og kontolagring viser nå hvilken versjon resultatet er basert på ved gjeninnlogging. Normtall for utvidet versjon samles i en egen, separat pott (ikke blandet med 120-testens), siden skårene er statistisk mer pålitelige. Ingen handling kreves fra deg -- dette er rent kode/produktarbeid.

## Prisbeslutning (v2.8, notert 14.07.2026 -- ingen kode involvert ennå)

Når betalingsløsning bygges (fortsatt utenfor omfang, se Dokument 07 §9): 120- og 300-spørsmålsversjonen skal koste det samme. Kun testlengde/presisjon skiller dem, ikke pris.

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
- [ ] **Fyll inn organisasjonsnummer** på `/personvern` så snart enkeltpersonforetaket er registrert (se oppgaven over).

## Nytt (v2.7) -- automatisk sletting av lagrede kontoresultater (12 måneder)

Lagrede kontoresultater slettes nå automatisk 12 måneder etter siste lagring, med e-postpåminnelse cirka 30 dager før. Dette kjøres av en egen planlagt («scheduled») Netlify-funksjon (`netlify/functions/account-retention.mts`) som går automatisk hver natt — krever ingen manuell kjøring fra deg.

- [ ] **Samme domenebegrensning som innloggingskoder gjelder påminnelses-e-posten**: uten et verifisert domene i Resend sendes påminnelsen kun til e-postadressen registrert på selve Resend-kontoen din. Løses av samme oppgave som over ("vurder domenenavn" / domeneverifisering i Resend).
- [ ] **Ingen handling kreves for at slettefunksjonen skal virke** — den bruker samme miljøvariabler som allerede er satt opp (`RESEND_API_KEY`, `RESEND_FROM_ADDRESS`, `NEXT_PUBLIC_SITE_URL`). Sjekk gjerne etter første par ukers drift at planlagt kjøring faktisk skjer (Netlify → Functions-fanen → `account-retention` → kjøringslogg).

## Kan vente

- [ ] Plausible-konto (analyse) — sett opp nærmere lansering.
- [ ] Fagperson (psykolog) til kvalitetssikring av tolkningstekster — dere har allerede besluttet å vente med dette til en testversjon er live (se Dokument 01 §21 pkt. 14).
- [x] **Node.js lokalt — avklart 13.07.2026: hoppes over for nå.** Ikke nødvendig: jeg bygger og tester alt i min egen sandkasse, og du ser resultatet via en privat Netlify-forhåndsvisning i vanlig nettleser. Installer selv senere (nodejs.org) bare hvis du vil kjøre koden direkte på egen maskin.
- [x] **Git/GitHub — avklart 13.07.2026: Git settes opp lokalt av meg, GitHub hoppes over for nå.** Git gir oss historikk/angre-mulighet uten at det krever noe fra deg. GitHub (nettbasert backup/auto-publisering) er valgfritt og kan legges til senere — Netlify krever det ikke.

## Om denne mappen

Denne mappen ligger i Dropbox. Det fungerer, men når prosjektet får en `node_modules`-mappe (titusenvis av småfiler som npm installerer) og en `.next`-build-mappe, vil Dropbox prøve å synkronisere alt sammen kontinuerlig — det kan gjøre Dropbox tregt og i verste fall skape synk-konflikter. Jeg legger inn en `.gitignore` og markerer disse mappene som "ignorert" av Dropbox (macOS-kommando, kjøres én gang) når jeg setter opp prosjektet, så resten av mappen (kildekode, dokumentasjon) fortsatt synkes normalt.

## Datasett for fremtidige normer (avklart 13.07.2026)

Når normbaserte skårer skal bygges (fase 2/senere), brukes Dr. John A. Johnsons offentlige IPIP-NEO-120-datasett (OSF, osf.io/tbmh5) — det eneste åpne datasettet på spørsmålsnivå som faktisk inneholder responser på FemFaktorers 30 spørsmål. Se Dokument 03 §10.4 og Dokument 06 (begge v1.1) for detaljer.
