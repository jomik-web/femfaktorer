# Oppgaver før/under bygging av første utkast

Sist oppdatert: 31.07.2026

## Gjenstår -- oversikt (oppdateres fortløpende, se datert changelog under for detaljer)

Dette punktet holdes alltid oppdatert øverst i dokumentet, slik at "hva gjenstår?" alltid kan besvares herfra uten å lete gjennom hele loggen.

- **Partner-/vennekobling** (alle tre nivåvarianter -- skjermbilde for gratis, delbar lenke for Standard, e-postbekreftet + Spir-samtale for Premium). Ikke startet.
- **Delbare bilder/kort til sosiale medier er FERDIG og live** (v2.37, 25.07.2026) -- delbart Spir-motiv-kort til slutt på rapporten, alle tre nivåer, tre skreddersydde formater. Se changelog under.
- **PDF-nedlasting (`src/lib/pdfReport.ts`/jsPDF) er FERDIG og live**, ikke ubesluttet arbeid som tidligere logget her -- denne oversikten var kommet ute av synk med kodestatus (funnet i kvalitetsrevisjonen 24.07.2026). Kun kodesplittet i denne runden slik at avhengigheten ikke lastes for besøkende som ikke bruker den.
- **SEO er bevisst utsatt** (metadata per side, sitemap.xml, robots.txt, Open Graph-tagger) til domene er valgt -- se kvalitetsrevisjonen 24.07.2026, kategori 7.
- **CSP, DPA/DPIA, jurist-gjennomgang, org.nr.** -- fortsatt bevisst utsatt, krever din oppfølging (uendret fra tidligere oppføringer).
- **Premium-nivåets detaljerte innhold** utover det som allerede er bygget (fasettnivå, utvikling over tid) -- fortsatt ikke spesifisert, se prismodell-dokumentets del 8.
- **Vurdert, ikke gjort: bytte meme-kort-forhåndsvisningen til `next/image`** (kvalitetsrevisjon 31.07.2026, kap. 6, funn 5, lav alvorlighet) -- se begrunnelse i changelog-oppføringen for v2.46. Din avgjørelse om dette skal gjøres nå eller stå som er.
- **Vurdert, ikke gjort: engangs-fullførelsestoken for anonyme forskningsinnsendinger** (kvalitetsrevisjon 31.07.2026, kap. 8, funn #1, høy alvorlighet -- kun halvparten av funnet er rettet, se v2.47). Krever ny arkitektur (tokenutstedelse, signeringshemmelighet, engangs-sporing, klientendring i testflyten) -- flagget som en egen, større oppfølging fremfor å bygges inn nå.

## Nytt: rettet kvalitetsrevisjonens kapittel 7-11 (v2.47, 31.07.2026)

Siste del av kvalitetsrevisjonen 31.07.2026 -- SEO/feilsider, personvern og sikkerhet, innhold, psykologisk kvalitet og konvertering.

- **Kap. 7 (SEO/feilsider), middels: `not-found.tsx` og `error.tsx`.** Next.js sine engelske, stilløse standardsider for ukjent URL og uventet feil er erstattet med to nye filer (`src/app/not-found.tsx`, `src/app/error.tsx`) i samme visuelle språk som resten av siden (`PageBackground`, samme knappestiler), begge på norsk, begge med lenke til forsiden. `error.tsx` har i tillegg en "Prøv igjen"-knapp og logger feilen til nettleserkonsollen (kun til feilsøking -- ingen personopplysninger). Selve SEO-pakken (metadata, sitemap, Open Graph) er fortsatt bevisst utsatt til domenevalg, uendret fra tidligere.
- **Kap. 8 (personvern og sikkerhet), høy: ingen rate-limiting på innsending av anonym forskningsdata (`/api/stats/submit-norm`).** Bygget en delt per-IP rate limiter (`src/lib/rateLimit.ts`, Netlify Blobs, samme les->øk->skriv-mønster som `aiUsage.ts`/`otp.ts` -- bevisst IKKE atomisk, kun ment å stoppe grovt misbruk). `submit-norm` er nå begrenset til 20 innsendinger/time per IP. Vurderte revisjonens forslag om et engangs-fullførelsestoken i tillegg, men det er en vesentlig større arkitekturendring -- se egen "Vurdert, ikke gjort"-bullet over.
- **Kap. 8, middels: samme mangel på `/api/account/request-code`.** Samme rate limiter, brukt med revisjonens egne foreslåtte tall: 5 forespørsler/10 min per IP. Kommer i TILLEGG til den eksisterende per-e-post-bremsen i `otp.ts` (uendret).
- **Kap. 8, øvrige funn (#3 CSP, #4 Blobs-atomicitet, #5 CSRF): bevisst urørt**, alle tre er allerede eksplisitt akseptert/utsatt i revisjonens egen tekst (samme "beste innsats"-filosofi som resten av Blobs-bruken i kodebasen, CSP krever egen gjennomgang av alle eksterne script-kilder, CSRF vurdert lav risiko for et anonymt/state-lett API). Ingen kodehandling.
- **Kap. 9 og 10: ingen kodehandling.** Begge kapitlene sine funn er enten innholds-/assetproduksjon (utenfor kodebasen) eller eksplisitt "ikke nå" i revisjonsteksten selv.
- **Kap. 11 (konvertering), middels: delbart SVG-fallback-kort manglet domenet.** De ferdigproduserte meme-kortene har allerede en "dinefasetter.no"-footer malt inn i selve bildet fra produksjonen -- `ShareCard.tsx` sitt SVG-genererte reservekort (brukt når fasett-/domenenivå-kort ikke finnes ennå) hadde det ikke. Lagt til som ren tekst i bunnteksten, samme sted som eksisterer i `pdfReport.ts`.
- **Kap. 11, lav: ingen lenke fulgte med når kortet ble delt via mobilens deleark.** `shareImageFile` (`lib/shareCard.ts`) tar nå imot en valgfri `url`, som fylles med `window.location.origin` fra `ShareCard.tsx` -- native deleark (Meldinger, e-post m.fl.) viser da en klikkbar lenke tilbake til siden ved siden av bildet. Bevisst IKKE en hardkodet URL her (i motsetning til bunntekst-teksten over) -- en feil lenke i et delt bilde er verre enn ingen lenke, mens `window.location.origin` alltid er korrekt for stedet som faktisk kjører.

**Testet:** `npx tsc --noEmit` kjører uten feil etter alle fem endringene. Kan ikke visuelt bekrefte 404/feilside-utseendet eller at delearket faktisk viser lenken i en ekte mobilnettleser fra sandkassen -- verifiser gjerne selv på localhost (prøv en ugyldig URL, og prøv "Del bildet" på mobil).

## Nytt: rettet kvalitetsrevisjonens kapittel 6, Ytelse (v2.46)

Fem funn -- to var allerede løst som en direkte SIDEEFFEKT av gårsdagens kapittel 4-arbeid, to er nye kodefiks, og ett er bevisst latt urørt til du har tatt stilling:

- **Kritisk (allerede løst): 64 MB bilder i `public/meme-kort/`.** Dette ER nøyaktig samme funn som kapittel 4 sin "høy"-vurdering (8 MB på mobil) -- løst samtidig: alle 34 bilder er WebP (63,9 MB -> 4,5 MB), pluss egne 480px-thumbs (1,2 MB) til kandidat-velgeren. Ingen ny handling her, kun stadfestet at revisjonens kritiske funn faktisk er dekket.
- **Høy (allerede løst): kandidatbildene manglet `loading="lazy"`, `width`/`height`.** Lagt til i samme kapittel 4-runde (`ShareCard.tsx`) -- også bekreftet her, ingen ny handling.
- **Middels: PDF-generering rasteriserte de 5 domenemotivene sekvensielt.** `pdfReport.ts` gjorde ett `await loadFactorHeroDataUrl(...)` per faktor INNI selve tegneløkken. Alle fem hentes nå PARALLELT med `Promise.all` før løkken starter -- selve tegningen (sideskift, tekst, grafer) skjer fortsatt i riktig rekkefølge etterpå, kun nettverks-/rasteriseringsarbeidet er parallellisert.
- **Middels: `/api/spir` gjorde to Netlify Blobs-lesinger (admininnstillinger + global teller, begge `consistency: "strong"`) før HVERT Anthropic-kall.** Begge er nå cachet i minne med 30 sekunders levetid -- adminendringer (nødstopp, tak, modellvalg) tåler fint den forsinkelsen, det er ikke tidskritisk logikk. Teller-cachen oppdateres i tillegg proaktivt rett etter hvert Anthropic-kall, så den ligger sjelden mer enn ett kall bak den ekte verdien.
- **Lav (bevisst IKKE gjort -- din avgjørelse): bytte fra `<img>` til `next/image` for meme-kortene.** Revisjonen selv rammer dette som noe å "revurdere når bildene uansett skal reprosesseres" -- det er de nå. MEN: `<img>`-en her ble bevisst valgt bort fra `next/image` tidligere (se `eslint-disable`-kommentaren i `ShareCard.tsx`), og selve bytte krever ekte nettleser-verifisering (Next sin Image-komponent har egne antagelser om layout/lasting som jeg ikke kan visuelt bekrefte i sandkassen) på en komponent som er sentral i delefunksjonen. Siden funnet selv kun sier "vurder" og er lav alvorlighet, har jeg latt den stå som `<img>` -- si ifra om du vil at jeg skal gjøre bytte likevel.

**Testet:** `npx tsc --noEmit` kjører uten feil etter begge kodefiksene (PDF-parallellisering + Spir-caching). Selve ytelsesgevinsten (raskere PDF-generering, raskere Spir-svar) er IKKE tidsmålt av meg -- **kjenn selv etter om PDF-nedlastingen og Spir-samtalen føles raskere** enn før, siden dette er nettopp den typen endring som er vanskelig å bekrefte uten en ekte, varm produksjonsinstans.

## Nytt: bedre feilmeldinger for passkey (v2.48-2.49, 31.07.2026)

Passkey virket ikke ved første forsøk, og feilsøkingen tok lengre tid enn den skulle. Årsaken var ikke koden, men **hvilken adresse siden ble åpnet fra**.

### Hva som faktisk var galt

Adressen som ble brukt var en Netlify-**permalink**:

```
https://6a6cbdef368d0a000831c447--legendary-travesseiro-4b8f65.netlify.app/
```

Prefikset foran de to bindestrekene gjør dette til et **helt annet domene** i nettleserens øyne. Passkey er kryptografisk bundet til `legendary-travesseiro-4b8f65.netlify.app`, så nettleseren avviste registreringen. Med hovedadressen virket alt umiddelbart.

**Regel å ta med videre:** permalinken peker på én bestemt utrulling og er nyttig når du vil se en gammel versjon. Men den oppfører seg som et fremmed domene for alt som har med innlogging og identitet å gjøre. Send den aldri til betatestere -- bruk alltid hovedadressen uten prefiks.

### To rettelser så dette ikke kan skje ubemerket igjen

- **v2.48: feilmeldingene sier nå hva som er galt.** Den første versjonen skrev "Registreringen ble avbrutt" for alt uventet -- altså ble en ekte feil presentert som om du selv hadde trykket avbryt. Ny `src/lib/account/passkeyErrors.ts` oversetter nettleserens feil til noe man kan handle på, og sier hva neste steg er. Serveren sier også fra hvis `NEXT_PUBLIC_SITE_URL` mangler, i stedet for stille å gjette på localhost.
- **v2.49: siden advarer FØR du trykker.** Står du på feil adresse, vises en gul boks som sier hvilket domene passkey er bundet til, hvilket du står på, og med en lenke rett til riktig sted. `/api/flags` returnerer nå `passkeyRpID` til dette formålet -- det er nettstedets eget domene, ingen hemmelighet.

### Lærdom for lokal testing

`.env.local` gjelder **bare maskinen din** og følger verken med til GitHub eller Netlify. Alt som skal gjelde den publiserte siden må legges inn separat under Site configuration → Environment variables i Netlify.

To ting som fortsatt står åpne fra denne runden:

- **Innlogging virker ikke på localhost** med vanlig `npm run dev`, fordi Netlify Blobs ikke har kontakt der. Bruk `netlify dev` i stedet, eller test på den publiserte adressen.
- **`RESEND_FROM_ADDRESS` er satt til en @gmail.com-adresse.** Resend krever et domene du selv har verifisert hos dem. Det virker for deg som kontoeier, men vil ikke virke for andre brukere før et eget domene er verifisert.

## Nytt: passkey -- logg inn uten kode på e-post (v2.47, 31.07.2026)

Du kan nå logge inn med Face ID, fingeravtrykk, PIN eller en fysisk nøkkel (YubiKey) i stedet for å vente på engangskode.

### Slik tar du det i bruk

1. Logg inn som vanlig med e-post og kode.
2. På «Min konto» dukker det opp en boks: **«Logg inn uten kode»**. Trykk «Registrer denne enheten».
3. Enheten spør om Face ID / fingeravtrykk / PIN. Bekreft.
4. Neste gang står det **«Logg inn med passkey»** øverst på innloggingssiden. Ett trykk, så er du inne.

Gjenta punkt 1–3 på hver enhet du vil bruke. Registrerte enheter listes opp med navn og dato, og kan fjernes enkeltvis.

### Hvorfor dette er trygt nå, når det ikke var det før

Passkey-innlogging fantes tidligere og ble fjernet i v2.28 fordi registreringen var **helt åpen** -- hvem som helst kunne registrert seg som admin før du rakk det selv.

Denne gangen er registreringen bare mulig **fra en økt du allerede er innlogget i**, og passkeyen knyttes til nøyaktig den e-postadressen økten tilhører. Adressen leses fra økten, aldri fra forespørselen. Det finnes altså ingen vei inn som ikke går gjennom e-postbekreftelse minst én gang. Hullet er lukket ved konstruksjon, ikke ved en ekstra sjekk som kan glemmes.

En passkey gir heller ikke admin-tilgang i seg selv -- den logger deg inn som en e-postadresse, og om den adressen er admin avgjøres som før av rollelista.

### Fire ting du bør vite

- **E-postkoden forsvinner ikke.** Den er reserveveien hvis du mister enhetene dine. Ikke be meg fjerne den.
- **Passkeys er bundet til nettadressen.** De du registrerer på `legendary-travesseiro-4b8f65.netlify.app` vil **ikke** virke når du går over til eget domene. Da må alle registrere enhetene på nytt. Dette kan ikke omgås -- det er nettopp denne bindingen som gjør passkeys motstandsdyktige mot phishing. **Vurder derfor å vente med å be betatestere registrere passkeys til domenet er på plass.**
- **Krever at `NEXT_PUBLIC_SITE_URL` er riktig satt i Netlify.** Peker den et annet sted enn adressen folk faktisk bruker, feiler registreringen med en kryptisk melding. Drift-fanen viser nå hvilket domene passkeys er bundet til -- sjekk den først hvis noe ikke virker.
- **Ingen biometri sendes til oss.** Fingeravtrykk og ansikt håndteres i sin helhet av enheten din. Vi lagrer en offentlig nøkkel, en tilfeldig id og et enhetsnavn -- den private nøkkelen forlater aldri enheten.

### Teknisk

Nye filer: `src/lib/account/passkeys.ts` (lagring, omvendt indeks, kortlevde utfordringer), fire ruter under `src/app/api/account/passkey/`, samt `PasskeyPanel.tsx` og `PasskeyLoginButton.tsx`. `@simplewebauthn/server` og `@simplewebauthn/browser` er lagt inn igjen -- de ble fjernet i v2.46 sammen med den gamle koden, og er nå tilbake i en riktig oppsatt form.

Innlogging skjer uten at du skriver e-postadresse: nettleseren finner selv passkeyene for nettstedet. Det krever at legitimasjonen lagres på enheten (`residentKey: "required"`), og en omvendt indeks fra legitimasjons-id til konto. Endepunktet som starter innlogging røper bevisst ikke hvilke kontoer som har passkeys.

Personvernerklæringen er utvidet med et punkt om hva som lagres.

## Nytt: adminpanel, bruksstatistikk og anonym forskningsdata (v2.46, 31.07.2026)

Den største enkeltrunden så langt. Bakgrunnen er dokumentet `Adminpanel_Forslag_2026-07-31.md` i prosjektmappa -- les det først hvis noe her er uklart, det forklarer hvorfor hvert punkt finnes.

### Det du merker først

- **Adminpanelet er bygget om fra én side med seks brytere til fem faner:** Oversikt, Tilbakemeldinger, Innstillinger, Tilganger og Drift. Du kommer inn på samme måte som før -- vanlig innlogging med e-post og engangskode, så `/admin`.
- **Du kan nå skru funksjoner av og på uten ny utrulling.** De tre bryterne som fram til nå bare fantes som linjer i koden (innlogging/konto, "lagre resultatet på konto", CSV-verktøyet) ligger under Innstillinger og virker med én gang. Dette var den enkeltendringen som kostet deg mest tid i det daglige.
- **Du kan gi og fjerne admin-tilgang selv**, under Tilganger. Din egen adresse står låst og kan ikke fjernes -- verken av deg eller noen andre.
- **Drift-fanen svarer på "er det meg eller er det en tjeneste som er nede?"** Grønt eller rødt per avhengighet (Netlify Blobs, Anthropic, Resend, Plausible), med hva som mangler når noe er rødt.

### Bruksstatistikk

- **Trakt gjennom testen:** startet → spørsmål 50 → spørsmål 120 → fullført → leste resultatet → åpnet Spir → ga tilbakemelding. Frafallspunktene er det klareste produktsignalet som finnes.
- **Median tidsbruk** per nivå, og **fullføringsandel**.
- **Plausible er koblet på** for besøkstall og trafikkilder -- cookiefritt, ingen samtykkebanner, EU-hosting. **Krever at du setter `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` i Netlify** (se "Hva du må gjøre selv" under). Uten den samles ingenting.
- Alle tellere er anonyme. Vi kan se at 100 startet og 60 fullførte, men ikke hvem av de 100 som var blant de 60 -- ekte kohortanalyse er bevisst ikke mulig.

### Tilbakemeldinger -- flyttet fra Google Forms

Skjemaet ligger nå på nettstedet selv, nederst på resultatsiden, og testeren blir værende på siden i stedet for å sendes til en ny fane. Versjon, enhet og tidsbruk følger automatisk med. Tilbakemeldingene leses under fanen Tilbakemeldinger, filtrerbart på kategori. Fortsatt anonymt -- **du kan altså ikke svare den som melder fra.**

### Anonym forskningsdata (grunnlaget for leddanalyse senere)

Dette er det punktet som krever mest av deg å forstå, så det er verdt å lese nøye.

- På skjermen før testen starter er det lagt til en avkrysning, **huket av på forhånd**, om å bidra med anonyme svar.
- Lar testeren haken stå, sendes hele svarsettet inn ved fullført 120 eller 290 -- svaret på hvert enkelt spørsmål, pluss hvor lang tid hvert spørsmål tok.
- **Ingen e-post, ingen IP, ingen økt-id. Tidspunkt lagres bare som ukenummer.** Lagres i en helt egen lagringsplass uten felles nøkkel med kontoene, slik at koblingen mellom svarsett og person ikke bare er forbudt, men fysisk fraværende.
- **Hvorfor:** uten svar på enkeltspørsmål er det umulig å oppdage at et spørsmål er dårlig oversatt eller ikke måler det samme som de andre i sin gruppe. Dette er data du bare kan samle fremover i tid, aldri bakover -- derfor startet vi nå.
- **Selve analysen er ikke bygget.** Det var et bevisst valg: den bør vente til det er nok data til at tallene betyr noe (rundt 200 fullførte per nivå).

**Én ting som berører eksisterende betatestere:** veiledningsskjermen "Før du starter" vises én gang til for alle, også for dem som har sett den før. Det er med vilje -- ellers ville vi samlet inn data fra folk som aldri fikk se spørsmålet.

### Sikkerhetsopprydding

De gamle passkey-endepunktene (`/api/admin/login/*`, `/api/admin/register/*`, `/api/admin/logout`) og `lib/admin/session.ts` er **slettet**, ikke bare deaktivert. De to `@simplewebauthn`-pakkene er fjernet fra `package.json`. Dette lukker restene etter "først til mølla"-hullet fra før v2.28 for godt.

### Personvernerklæringen

To nye seksjoner ("Anonyme svarsett til kvalitetsarbeid" og "Hvis du gir tilbakemelding"), og avsnittet om analyseverktøy er endret fra "ingen er aktivert, hvis vi en gang..." til å beskrive Plausible som noe vi faktisk bruker. **Fortsatt ikke juristgjennomgått** -- uendret fra før, men listen over hva som må gjennomgås er nå lengre.

### Hva du må gjøre selv

1. **Opprett Plausible-konto** (ca. 9 USD/mnd) og legg til nettstedet ditt der.
2. **I Netlify:** Site configuration → Environment variables → legg til `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` med domenet du registrerte i Plausible. Uten dette samles ingen besøksstatistikk -- Drift-fanen viser rødt til det er gjort.
3. **Google Forms-skjemaet kan pensjoneres.** Ikke slett de svarene du allerede har fått -- de flyttes ikke over automatisk.
4. **Test flyten selv** før du sender ut til testerne: start testen (se at avkrysningen dukker opp), fullfør et nivå, gå til `/admin` og sjekk at tallene beveger seg.

### Ikke testet ende-til-ende

`npx tsc --noEmit` kjører rent. Selve innsamlingen, tellerne og adminsidene er **ikke** kjørt mot en ekte Netlify Blobs-instans herfra -- det krever et deployet miljø. Følg punkt 4 over før du stoler på tallene.

## Nytt: rettet kvalitetsrevisjonens kapittel 5, Teknisk kvalitet (v2.45)

Tre funn, alle uten atferdsendring for besøkende -- ren opprydding:

- **Middels: `resultat/page.tsx` var 989 linjer og voksende.** Trukket ut i seks nye filer under `src/components/resultat/`: `FreeTierResult.tsx` (gratisnivåets visning), `DetailedResult.tsx` (full/extended-visningen -- den klart største biten), `ClosingSummarySection.tsx` ("Hva betyr dette for deg?"-fanen), `GrowthSection.tsx`, `HistoryTable.tsx` ("Utvikling over tid") og `TierUpgradeCta.tsx` (de fire "fortsett til neste nivå"-oppfordringene). `page.tsx` selv er nå 492 linjer -- kun state, datainnhenting/-klargjøring og selve side-oppsettet igjen. Ingen JSX er endret, kun flyttet -- samme prinsipp som revisjonen selv ba om.
- **Middels: dokumentasjonsdrift i denne fila.** Det siste punktet i "Gjenstår"-listen sa fortsatt at `pdfReport.ts`/jsPDF "ikke er i git og ikke ferdigstilt" -- direkte selvmotsigende med punktet rett over, som riktig sier PDF-en er ferdig og live. Fjernet den utdaterte linjen. **Rutinen fremover:** jeg oppdaterer "Gjenstår"-lista i samme økt som jeg gjør endringer, ikke som et eget etterskudd -- nettopp denne typen drift er nå påpekt i to påfølgende revisjoner.
- **Lav: `SPIR_MASCOT_SVG` var duplisert som en hardkodet streng i `pdfReport.ts`.** Ville drifte fra selve maskoten (`SpirMascot.tsx`) neste gang uttrykket endres. Løst ved å trekke ut en ny, hook-fri `SpirMascotContent`-komponent i `SpirMascot.tsx` (samme mønster som `FactorHeroContent` i `FactorHero.tsx` allerede bruker for domenemotivene) -- `pdfReport.ts` gjenbruker den nå via `renderToStaticMarkup` i stedet for en egen kopi.
- **Lav (ingen handling, som revisjonen selv anbefaler): testpakken kunne ikke kjøres i revisjonsmiljøet** pga. plattform-mismatch i `node_modules` (samme kjente sandkasse-begrensning som er dokumentert flere steder i denne loggen) -- ikke en kodefeil. `npx tsc --noEmit` kjører rent.

**Testet:** `npx tsc --noEmit` kjører uten feil etter alle fire punktene. Selve omstruktureringen av resultatsiden er IKKE visuelt verifisert i en ekte nettleser (kun typesjekket) -- **test gjerne alle tre nivåene (gratis/Standard/Utvidet) selv på localhost** før du stoler fullt på at ingenting flyttet seg visuelt.

## Nytt: Verktøy-meny -- kontolagring flyttet ut av rapporten (v2.44, 31.07.2026)

"Lagre resultatet ditt" lå midt inne i rapporten på /resultat og brukte mye plass på å forklare en funksjon som er avslått under betatestingen (`RESULT_ACCOUNT_SAVE_ENABLED = false`). Den er nå flyttet dit den hører hjemme.

- **Nytt menypunkt "Verktøy"** i toppmenyen, med nedtrekksmeny etter samme mønster som Resultat. Undervalgene er alltid klikkbare -- i motsetning til rapportvalgene, som krever et fullført nivå.
- **Ny landingsside `/verktoy`** som lister verktøyene med hver sin forklaring.
- **Ny side `/verktoy/lagre-resultat`** med hele kontolagringen. Selve flyten ligger i den nye komponenten `AccountSavePanel`, slik at siden bare er innramming -- samme oppbygging som `/verktoy/svardata` har mot `AnswerSetCsvPanel`.
- **`/verktoy/svardata` er uendret**, men nå synlig i menyen i stedet for å være en skjult URL.
- **På /resultat står det igjen en kort henvisning** ("Ta vare på resultatet") som peker til Verktøy, slik at de som leter etter funksjonen finner veien. Rapporten er tilsvarende kortere.

**Én reell atferdsendring, ikke bare flytting:** `persistCurrentResult` hentet tidligere inn oppdatert historikk med én gang etter lagring, slik at "Utvikling over tid"-tabellen på resultatsiden viste det nettopp lagrede punktet uten omlasting (v2.27). Nå som lagringen skjer på en annen side, finnes ikke den tabellen på skjermen i det øyeblikket -- den oppdateres i stedet ved neste besøk på /resultat. Ingen data går tapt, men det er verdt å vite når kontolagringen slås på igjen.

**Panelet er selvstendig:** `AccountSavePanel` laster svarene og regner ut resultatet på nytt selv, i stedet for å få det inn som props. Det er hele poenget med flyttingen -- panelet må fungere uten at brukeren står på /resultat først. Den velger automatisk det høyeste fullførte nivået (290 foran 120), og sier fra dersom ingen detaljert rapport finnes.

**Testet:** `npx tsc --noEmit` kjører uten feil, også med `--noUnusedLocals` for å fange død kode etter flyttingen (syv tilstandsvariabler, fire funksjoner og to importer ble ryddet bort fra `resultat/page.tsx`).

**IKKE TESTET -- viktig:** selve lagringsflyten (e-post → engangskode → lagre) er uendret kode, men er ikke kjørt ende-til-ende etter flyttingen, fordi flagget er av og flyten krever e-postutsending. Når du slår på `RESULT_ACCOUNT_SAVE_ENABLED` igjen, test i denne rekkefølgen: (1) send kode, (2) bekreft kode, (3) at resultatet faktisk lagres, (4) at "Lagre / oppdater" virker for en allerede innlogget bruker, (5) logg ut. Samme liste står i doc-kommentaren i `AccountSavePanel.tsx`.

**Merk:** `TOOLS` i `app/verktoy/page.tsx` og `VERKTOY_OPTIONS` i `components/SiteNav.tsx` må holdes i synk manuelt når du legger til et nytt verktøy.

## Nytt: rettet kvalitetsrevisjonens kapittel 4, Mobilopplevelse (v2.44)

Kapittel 4 hadde to funn -- det ene var stort nok til å gjøre i dag, det andre trenger ingen handling:

- **Høy alvorlighet: opptil ~8 MB bildenedlasting på mobil, umiddelbart.** Delekortet kunne vise 3 kandidatbilder samtidig, og alle 34 bildene i `public/meme-kort/` lå som PNG (63,9 MB totalt, enkeltfiler opptil 2,9 MB) -- lastet i full 1080px-oppløsning selv i den vesle kandidat-velgeren. Revisjonen pekte selv videre til kategori 6 (Ytelse) sitt kritiske funn #1 for løsningen, så jeg rettet begge i samme slag:
  - Alle 34 bilder er konvertert til WebP (kvalitet ~82, samme oppløsning som før) -- **63,9 MB -> 4,5 MB**, uten synlig kvalitetstap (kontrollert visuelt på flere kort).
  - I tillegg er det generert egne, enda mindre "thumbs" (480px bredde, ~1,2 MB totalt) KUN til bruk i kandidat-velgeren -- selve del-/nedlastingsbildet bruker fortsatt full oppløsning når du faktisk deler eller laster ned.
  - Kandidatbildene har nå `loading="lazy"`, `decoding="async"` og eksplisitt `width`/`height` (kategori 6 sitt funn #2 -- unngår layout-hopp/CLS).
  - Delingen bruker nå bildets EGEN MIME-type i stedet for en hardkodet "image/png" -- nødvendig siden meme-kortene nå faktisk er WebP.
  - **Kan IKKE fullføres av meg: de 34 gamle PNG-filene ligger fortsatt fysisk i `public/meme-kort/`** -- sandkassen kunne ikke slette dem (samme iCloud-synk-begrensning som git-lock-filene er dokumentert med andre steder). **Slett `public/meme-kort/*.png` selv** når du har sett at WebP-versjonene fungerer i nettleseren -- de er ikke lenger referert noe sted i koden.
- **Lav alvorlighet: mobilmenyens rapportvalg-underliste vises alltid utfoldet.** Revisjonen sin egen vurdering var "akseptabelt nå, vurder sammenslåing hvis menyen får flere punkter" -- ingen kodeendring gjort, som anbefalt.

**Testet:** `npx tsc --noEmit` kjører uten feil. Selve bildekvaliteten er sjekket visuelt (rendret WebP-filer og sammenlignet med originalene), men **test gjerne selv på en ekte mobil** at delekortet fortsatt ser skarpt nok ut og at "Del bildet"/"Last ned bildet" fungerer med de nye filnavnene (.webp). Husk `git push` -- og å slette de gamle PNG-ene selv, se over.

## Nytt: rettet elleve funn fra kvalitetsrevisjonen 31.07.2026, kapittel 1-3 (v2.42-2.43)

Etter dagens kvalitetsrevisjon (`Kvalitetsrevisjon_DineFasetter_2026-07-31.docx`) ba du meg gå gjennom kapittel 1 (Universell utforming), 2 (UX og informasjonsarkitektur) og 3 (Visuelt design) ett kapittel om gangen. Følgende er rettet:

**Kapittel 1 -- Universell utforming:**
- **Roving tastaturnavigasjon i ShareCard sine tre `role="radio"`-grupper** (format- og kortvelgerne) -- piltaster/Home/End flytter nå både fokus og valg, i tråd med WAI-ARIA-mønsteret. Ny delt hook (`useRovingRadioGroup`) i `ShareCard.tsx`.
- **Spørsmål og svarskala er nå koblet med `aria-labelledby`** i stedet for en generisk `aria-label` (`AnswerScale.tsx`, `test/page.tsx`) -- skjermlesere leser nå selve spørsmålsteksten før svaralternativene, ikke bare "Svaralternativer". Dette var et ført-registrert, uendret funn fra forrige revisjon.
- **Mobilmenyen flytter nå fokus** til første lenke når den åpnes, og tilbake til hamburgerknappen ved lukking/Escape (`SiteNav.tsx`).
- (Meme-kortenes tekst-i-bilde ble vurdert i revisjonen selv som akseptabelt for delingsgrafikk -- ingen handling.)

**Kapittel 2 -- UX og informasjonsarkitektur:**
- **Resultatsiden er kortet ned.** Den synlige, dupliserte CSV-seksjonen ("Betatest: ta vare på svarene dine") er fjernet fra `/resultat` -- den dekket akkurat det samme som den allerede eksisterende, skjulte verktøysiden `/verktoy/svardata`, som nå er oppdatert til å tjene begge formål (din egen testing OG betatesteres ønske om å ta vare på svar). Referansene på resultatsiden peker nå dit i stedet.
- **Format-standarden er samkjørt**: `DomainShareCard` brukte "square" som standardvalg mens `MemeShareCard` brukte "story" -- begge er nå "story".
- (PDF-nedlastingens manglende fremdriftsindikator ble i revisjonen selv hengt på en betinget "vurder ved brukertesting" -- ingen handling ennå.)

**Kapittel 3 -- Visuelt design:**
- **Meme-kortenes bildehøyder er normalisert.** `A3-high-square.png` var 1080x1190 (110px ekstra pga. en tidligere footer-kollisjonsfiks) mens de andre 32 bildene allerede var nøyaktig 1080x1080/1080x1920 -- rettet med en marginal (~9%), ikke-uniform skalering i høyden. Alt innhold (inkludert footer-baren) er bevart, ingenting beskåret.
- **Versjonsnummer-drift (funn #3)**: allerede rettet av deg selv i en tidligere commit (`APP_VERSION` sto korrekt da jeg sjekket) -- ingen handling nødvendig fra min side.
- **Fontene i delekortet (SVG-fallback) og PDF-en er rettet -- Bricolage Grotesque, ikke lenger Arial/Helvetica.** Du sendte `Bricolage_Grotesque.zip` (kun denne fonten, ikke Inter ennå) -- base64-kodet Bold + Regular ligger nå i en egen, kun-dynamisk-importert fil (`src/lib/fonts/bricolageGrotesque.ts`, ~240 KB til sammen, lastes KUN når noen faktisk trykker "Last ned som PDF"/"Del bildet"/"Last ned bildet", ikke i sidebunten). **PDF-en**: alle overskrifter, tall og annen uthevet ("bold") tekst bruker nå Bricolage Grotesque via jsPDF sin `addFont()` -- selve brødteksten (`paragraph()`-hjelperen) står fortsatt i Helvetica, siden Bricolage er en bevisst display-/overskriftsfont, ikke ment for lange leseflater (samme fordeling som nettsiden selv bruker, se layout.tsx). Visuelt kontrollert ved å rendre en test-PDF til bilde i sandkassen -- fonten vises tydelig, ikke en fallback. **Delekortet (SVG-fallback)**: fonten er embeddet direkte i selve SVG-en som en selvbærende `@font-face` (base64 `data:`-URL) rett før den rasteriseres til PNG -- nødvendig fordi en frittstående SVG lastet via `Image()`/canvas ikke arver sidens egne fonter. **Denne delen kunne jeg IKKE visuelt kontrollere i sandkassen** (mangler en nettleser/SVG-rendrer med fontstøtte her) -- testteknikken er standard og godt dokumentert, men **sjekk selv i nettleseren at teksten faktisk ser riktig ut** før du stoler fullt på den. Legg gjerne inn en Inter-fil senere for brødteksten også, hvis du vil fullføre resten av funnet.

**Om versjonsnummeret:** `APP_VERSION`-konstanten viser nå 2.44 (din egen, parallelle `/verktoy`-omlegging) -- jeg har bevisst IKKE rørt selve tallet, siden du åpenbart var midt i eget arbeid på den samtidig. Denne loggoppføringen bruker derfor 2.42-2.43 som et intervall for mine rettelser i dag, ikke ett eksakt tall -- rydd gjerne opp i selve rekkefølgen når du uansett oppdaterer changeloggen for din egen v2.44/v2.45.

**Testet:** `npx tsc --noEmit` kjører uten feil etter alle endringene over. Husk `git push`.

## Nytt: tilbakemeldingsknapp for betatesting + rettet versjonsnummer (v2.41, 31.07.2026)

Betatestingen starter blant familie og venner, og resultatsiden trengte en vei fra "jeg har en mening om dette" til et svar du faktisk kan lese samlet.

- **`FeedbackPrompt`-komponenten** er lagt inn nederst på resultatsiden, rett over "Slett mine data" -- bevisst ETTER at brukeren har lest profilen sin, ikke i bunnmenyen. Engasjementet er på topp i det øyeblikket de er ferdige med å lese, og faller bratt så snart de navigerer videre.
- **Knappen åpner et anonymt Google Forms-skjema** (7 spørsmål, ca. 1 minutt) i ny fane. Svarene samles i et Google-regneark.
- **Skjult teknisk felt** følger med lenken på formatet `enhet|versjon|tidsbruk` (f.eks. `mobil|2.41|412`), forhåndsutfylt via URL-parameter. Uten dette er en tilbakemelding umulig å tolke etter noen deployer -- gjaldt klagen en feil som allerede er rettet, eller står den fortsatt? Ingen av verdiene identifiserer brukeren, og ingenting sendes med mindre brukeren selv trykker på knappen.
- **Tidsbruk måles i `sessionStorage`** (`markTestStarted`/`loadTestDurationSeconds` i `storage.ts`), ikke `localStorage`. Bevisst valg: en som starter mandag og fullfører torsdag skal ikke rapportere tre døgns tidsbruk. Prisen er at tidsbruk blir "ukjent" hvis fanen lukkes underveis -- en manglende måling er bedre enn en feilaktig.
- **Knappen husker at den er brukt** (per versjon), og bytter til en dempet "Legg til mer"-variant. Bumpes versjonen, spør den på nytt.

**Versjonsnummeret var kommet ut av synk.** `APP_VERSION` sto på 2.37 mens commitene hadde gått videre til v2.40 -- altså viste toppmenyen feil versjon for besøkende, og tilbakemeldingene ville blitt merket med feil versjon. Samme drift gjaldt denne changeloggen, som manglet oppføringer for v2.38-v2.40 (vekstbue, PDF-sideskift, meme-kort, domene-illustrasjoner -- se git-loggen for detaljer). Satt til **2.41** nå, som dekker både disse endringene og tilbakemeldingsknappen.

**Merk for fremtiden:** rutinen med å bumpe `APP_VERSION` sammen med hver changelog-oppføring er lett å glemme midt i kodingen. Vurder om nummeret heller bør leses automatisk fra git, slik at det ikke kan skli fra hverandre igjen.

**Testet:** `npx tsc --noEmit` kjører uten feil. Selve knappen er ikke visuelt verifisert av meg -- sandkassen kan ikke kjøre en ekte Next.js-bygg (kjent SWC-begrensning). **Ta testen på mobil og bekreft at teknisk info-kolonnen i regnearket faktisk får en verdi** -- det er det eneste som ikke kan repareres i etterkant.

**Skal fjernes ved lansering:** hele `FeedbackPrompt.tsx`, `<FeedbackPrompt />` i `resultat/page.tsx`, `markTestStarted`/`resetTestStarted`-kallene i `test/page.tsx` og tidsbrukshjelperne i `storage.ts`.

## Nytt: delbart Spir-motiv-kort til slutt på rapporten (v2.37, 25.07.2026)

Du ba om at kortet med det Spir-motivet som passer brukeren best skal vises i liggende, full bredde til slutt på rapporten, og at brukeren skal kunne dele det på sosiale medier med minst mulig egeninnsats -- uten å laste opp innlogging eller annen personlig informasjon om sine kontoer, og med riktig format per plattform. Løsningen er bygget helt uten server-opplasting:

- **`ShareCard`-komponenten** viser det motivet som er mest utpreget for brukeren (den faktoren med størst avstand fra midtpunktet 50, ikke nødvendigvis høyest skår -- samme prinsipp som brukes i avslutningsteksten), sammen med en kort, positiv "tagline" (`shareTagline` i `interpretations.ts`, én per faktor/nivå, 15 nye tekster).
- **Tre skreddersydde bildeformater** genereres direkte i nettleseren (SVG → canvas → PNG), ett per hovedbruksområde -- ikke bare én størrelse skalert opp/ned:
  - *Kvadrat* (1080×1080) -- Instagram-feed, Facebook-innlegg.
  - *Story* (1080×1920) -- Instagram/Snapchat/Facebook Story, bildet fyller hele høyden med en mykt fargelagt glød bak teksten.
  - *Lenkeforhåndsvisning* (1200×630) -- standard OG-bildeformat for e-post/lenkedeling, med gradert bunnfelt for lesbar tekst.
- **Deling skjer på brukerens egen enhet.** På mobil med støtte for Web Share API (nyere iOS/Android) åpnes den innebygde delemenyen med selve bildet vedlagt -- brukeren velger app selv, ingen innlogging involvert. Der det ikke støttes (typisk desktop), lastes bildet ned lokalt, og brukeren kan i tillegg åpne en ferdigutfylt delelenke for X, Facebook, WhatsApp, LinkedIn eller e-post -- disse lenkene bruker en generisk tekst (ikke den personlige taglinen), slik at ingen spesifikk personlighetsegenskap limes inn som rå tekst uten bildet ved siden av.
- **Gjelder alle tre nivåer** (gratis, Standard, Premium), som besluttet.
- **Ingen sosiale mediekontoer, tokens eller personlig informasjon håndteres** noe sted i løsningen -- verken av nettsiden eller av meg.

**Testet:** `npx tsc --noEmit` kjører uten feil. Selve bildekomposisjonen (særlig story-formatet) er visuelt verifisert ved å bygge frittstående SVG-testfiler med ekte farge-/bane-data og rendre dem til PNG via LibreOffice, siden sandkassen ikke kan kjøre en ekte Next.js-bygg (samme kjente SWC/esbuild-begrensning som er dokumentert tidligere). Husk `git push`.

**Oppdatert samme dag, etter din tilbakemelding fra localhost:** Det liggende lenkeformatet (1200×630) hadde en synlig feil -- kant-til-kant-beskjæringen kuttet Spir-motivet på en måte som så ødelagt/tilfeldig ut, i stedet for det pene, buede motivet som brukes ellers i rapporten. I stedet for å bare rette beskjæringen, tok jeg et steg tilbake og undersøkte hvordan Spotify Wrapped, Duolingo og andre løser akkurat denne delingsflyten:

- Rekker med plattformikoner (X/Facebook/WhatsApp/LinkedIn/e-post) er i praksis nesten aldri i bruk -- flere kilder viser under 0,3 % av trafikken, og en leserundersøkelse fra CSS-Tricks fant at 60 % aldri klikker på dem. De delte dessuten feil ting hos oss (en lenke til testen, ikke selve bildet). Fjernet.
- Spotify Wrapped og Duolingo satser i stedet alt på ett ferdig, vakkert bilde + én tydelig del-knapp -- Duolingo fikk 5–10x mer deling bare av å gjøre selve kortet finere. Vi følger samme mønster nå: kun **Del bildet** (native deleark) og **Last ned bildet** (reserve for desktop).
- **Lenkeformatet (1200×630) er fjernet fra kortet** -- det fantes primært for lenkedelingen som nå er borte. Igjen står **Firkant** og **Story**, som allerede brukte det pene, buede motivet uendret, ikke den brutte beskjæringen.
- **Forklaringsteksten er kuttet** fra to setninger til én kort linje.

## Nytt: rettet seks funn fra kvalitetsrevisjonen 24.07.2026 (v2.36, 24.07.2026)

Etter kvalitetsrevisjonen i dag (`Kvalitetsrevisjon_DineFasetter_2026-07-24.docx`) ba du meg gjøre det jeg mente var best for opplevelsen på funn #1, og gjennomføre #2, #3, #5 og #7 som foreslått i revisjonen, samt legge til testene fra #6 selv. SEO (#4) venter til senere, som avtalt. Følgende er gjort:

- **Toppmenyen (`SiteNav.tsx`) er nå responsiv.** Hadde tidligere null breakpoints -- risiko for sammenklemt/ødelagt navigasjon på smale skjermer. Under `md`-breakpunktet er den vanlige lenkelisten nå skjult til fordel for en hamburgerknapp (med `aria-expanded`/`aria-controls`, lukkes ved sidebytte eller Escape) som åpner et enkelt, stablet mobilpanel med de samme lenkene, inkludert rapportvalgene (50/120/290) inline.
- **Kontrastbruddet (WCAG 1.4.3) er rettet ved roten, ikke punktvis.** `bg-holo-sky` + `text-white` (~2,04:1 kontrast, under 4,5:1-kravet) fantes i 12+ ad hoc-knapper i `slik-fungerer`, `logg-inn`, `spir` og `AnswerSetCsvPanel` -- nøyaktig samme feilklasse som ble "rettet" i forrige revisjon (19.07.2026) og deretter kom tilbake i ny form. Denne gangen er alle disse knappene enten byttet til det delte `<Button>`-komponentet, eller (der det måtte være en `<Link>`) til en ny, eksportert `buttonClassNames()`-byggerfunksjon i `Button.tsx` som garanterer identisk styling. To eksisterende, lokalt dupliserte kopier av akkurat denne knappestilen (`page.tsx`, `resultat/page.tsx`) er samtidig slått sammen til samme kilde.
- **Krisevarselet og ikke-diagnostisk-forbeholdet er nå alltid synlige på resultatsiden**, ikke skjult bak en lukket boks som måtte klikkes opp. Kun det mindre kritiske, nivåspesifikke fotnote-innholdet ("basert på 50/120/290 spørsmål") er fortsatt bak klikk.
- **jsPDF lastes nå kun ved klikk** på "Last ned som PDF" (dynamisk import), i stedet for i resultatsidens initiale bunt for alle besøkende uansett bruk.
- **Fokusindikatoren bruker nå `holo-skyText` i stedet for `holo-sky`** overalt (global `:focus-visible`, `Button`, `AnswerScale`, `Input`) -- samme WCAG 1.4.11-fiks som kontrastbruddet over, siden fokusringen tidligere arvet den samme utilstrekkelige fargen.
- **Lagt til to nye testfiler** (`src/lib/spir/responseValidator.test.ts`, `src/lib/account/otp.test.ts`) som låser de to tidligere, udokumenterte produksjonsbugsene i Spir-validatoren (v2.14, v2.20-v2.21) og dekker hele OTP-flyten (kode, utløp, forsøksgrense, engangsbruk, resend-sperre).

**Testet:** `npx tsc --noEmit` kjører uten feil. `npx vitest run` kunne derimot IKKE kjøres i denne økten -- sandkassen mangler en Linux-kompatibel native `rollup`-binærfil (kun `rollup-darwin-arm64` finnes i `node_modules`, samme kjente begrensning som er dokumentert tidligere i denne loggen for SWC). Testlogikken er i stedet verifisert manuelt ved å kjøre begge filenes assertions direkte via Nodes innebygde TypeScript-støtte (alle 19 sjekker besto) -- men selve vitest-kommandoen bør kjøres lokalt eller i Netlifys bygg før du stoler fullt på dem. SEO (funn #4 i revisjonen) er bevisst IKKE gjort denne runden, som avtalt. Husk `git push`.

## Nytt: grafisk pris-/sammenligningsside (/priser) + prisrettelse (v2.35, 20.07.2026)

Etter ditt ønske om en side som viser de tre nivåene grafisk, med overskriftsrad per nivå og funksjonsrader med avkrysning:

- **Ny side: `/priser`**, lenket fra bunnteksten ("Nivåer og priser"). Viser Gratis (0 kr) / Standard (19 kr inkl. mva -- endret fra 20 kr etter din beskjed) / Premium (99 kr inkl. mva) side ved side, med en funksjonstabell under (avkryssede runde punkter for inkludert/ikke inkludert, tekstverdier der det ikke er binært, f.eks. antall spørsmål).
- **Kun funksjoner som faktisk er bygget og live er tatt med i selve sammenligningen**: antall spørsmål, analysedybde, fasettnivå-analyse (kun Premium), Spir-samtale, PDF-nedlasting, skylagring, utvikling over tid (kun Premium). Partner-/vennekobling og delbare sosiale medie-kort er IKKE med i selve tabellen siden de ikke er bygget ennå -- nevnt i en egen boks under tabellen i stedet, så siden ikke lover noe som ikke finnes.
- **Siden sier tydelig at ingen betalingssperre finnes ennå** -- alle tre nivåene er gratis å prøve under betaperioden, uansett hva prisene i tabellen sier. Dette var ditt eksplisitte krav fra i går (18.07.2026).
- **Prisrettelsen (20 kr -> 19 kr)** er også oppdatert i `FemFaktorer_Forretnings-og-prismodell_v1.3.docx` (ny versjon lagt i dokumentbiblioteket) -- alle tre stedene prisen nevnes i dokumentet (tabellen, konkurrentanalysen, endringsloggen) er rettet.
- I samme økt: ryddet opp en rekke midlertidige `.fuse_hidden*`-filer som ved en feil havnet i git mens prosjektmappen lå på iCloud (nå flyttet ut av iCloud) -- ingen faktisk kildekode berørt, kun støy fjernet.

Testet: `npx tsc --noEmit` kjører uten feil (ingen faktisk `next build` er mulig i dette utviklingsmiljøet -- se tidligere notater i denne loggen om manglende SWC-binærfil for arm64). Husk `git push`.

## Nytt: fikset hover-meny-bug + betaversjon i toppmenyen + rød beta-varsel (v2.34, 19.07.2026)

- **Rettet feilen du meldte fra om:** rapportvalg-menyen under "Resultat" lukket seg selv i det du beveget musepekeren nedover fra "Resultat" og inn i selve valgene. Årsak: et reelt "dødt" område mellom menyknappen og valgene (en margin-avstand som ikke telte som en del av menyen for museavstanden). Rettet ved å gjøre selve avstanden til en del av det hoverbare området i stedet, pluss en kort forsinkelse før menyen faktisk lukkes -- den tåler nå at pekeren beveger seg litt fram og tilbake uten å forsvinne.
- **"Beta v2.34" vises nå ved siden av "Dine Fasetter"** i toppmenyen (i en liten avrundet boks). Tallet følger nummereringen i denne loggen -- jeg oppdaterer det i `src/lib/version.ts` for hver ny oppføring her, så du alltid kan se hvilken versjon som faktisk er i drift.
- **Lagt til en tydelig, rød advarsel** rett under overskriften "Lagre resultatet ditt" på resultatsiden: at kontolagring ikke er i bruk mens vi betatester, og at CSV-verktøyet lenger opp på siden er den fungerende måten å ta vare på svar på i mellomtiden. (Antar du mente denne seksjonen -- si ifra hvis det var et annet sted du tenkte på, f.eks. innloggingssiden.)

Testet: `npx tsc --noEmit` kjører uten feil. Husk `git push`.

## Nytt: rapportvalg (50/120/290) + differensiert rapportdybde per nivå (v2.33, 19.07.2026)

Etter ditt ønske om at man skal kunne velge rapport og at de tre nivåene skal oppleves tydelig forskjellige:

- **Rapportvalg-meny i toppmenyen.** Hold musen over (eller trykk pil-knappen ved siden av) "Resultat" -- en undermeny viser 50/120/290 spørsmål som egne valg. Nivåer du faktisk har fullført er klikkbare og lenker til `/resultat?tier=...`; nivåer du ikke har fullført vises gråtonet og er ikke klikkbare. Siden svarene dine er kumulative (120-settet inneholder de samme svarene som 50-settet, osv.), kan alle fullførte nivåer vises uavhengig av hvor langt du faktisk kom i testen.
- **Gratis (50 spm):** uendret innhold per hovedkategori, men nå med kort kategoribeskrivelse øverst (som de to andre nivåene alltid har hatt) og en ny, kort **"Samlet sett"**-oppsummering nederst på siden -- din forespurte "overordnede analyse... og en samlet".
- **Standard (120 spm):** viser **ikke lenger underkategorier eller samspill-kort** (var en inkurie at de vistes før -- 120-spørsmålsdataene ga egentlig for tynt grunnlag per underkategori uansett). Viser i stedet en penere, mer sammenhengende analysetekst enn gratisnivået, PLUSS jobb- og kjærlighets-notatene og en oppsummeringsfane på tvers av alle fem kategoriene -- det er "de ekstra momentene" som skiller Standard fra gratis.
- **Utvidet (290 spm):** uendret struktur -- underkategorier med egen graf, fasett-samspill, kryss-kategori-samspill ("Spennende samspill") og den mest utfyllende oppsummeringen. Dette er fortsatt det tydelige premium-nivået.
- **Oppsummeringstekstene (både per hovedkategori og til slutt) kan nå vises i flere avsnitt** -- delt automatisk ved naturlige setningsgrenser der teksten er lang nok til at det gir bedre lesbarhet, uten at noen av de eksisterende tekstene måtte skrives om for hånd.
- Har du allerede fullført et høyere nivå, bytter "fortsett testen"-boksen nederst ut til en lenke til det andre resultatet i stedet for en oppfordring som ikke lenger gir mening.

Testet: `npx tsc --noEmit` kjører uten feil. Husk `git push`.

## Nytt: humor i resultatet + quiz-illustrasjon på spørsmålene (v2.32, 19.07.2026)

Etter ditt ønske om å lette opp stemningen litt og gjøre testen mer folkelig:

- **Fun fact-boks under hver av de fem hovedkategoriene på resultatsiden.** En lekent avmerket boks (😄-ikon, stiplet kant, tydelig atskilt fra selve tolkningsteksten) med et kort, gjenkjennelig "kjenner du deg igjen?"-eksempel knyttet til akkurat den kategorien og skåren din -- 15 tekster totalt (5 kategorier x lav/middels/høy). Bevisst IKKE en del av selve den faglige tolkningen, kun ment som en kort spøk å flire litt av. Holdt unna sårbare temaer -- f.eks. bruker lav emosjonell stabilitet en helt triviell, gjenkjennelig ting (å overtenke en SMS), ikke angst eller uro generelt.
- **Ny illustrasjon over aller første spørsmål i testen** (`src/components/SpirQuizScene.tsx`): Spir som en quizvert med spørsmålskort i hevet hånd, foran tre "slektninger" av Spir bak hver sin pult med buzzer -- én av dem rekker opp hånda. Samme bølgekant-stil som de andre heltegrafikkene, og de tre figurene er bygget fra Spir sine egne, gjenbrukte kroppsdeler (kun i andre fargekombinasjoner) for å beholde den visuelle familien. Vises KUN over det aller første spørsmålet, ikke ved hvert av de 290 -- for å sette stemningen uten å ta fast plass gjennom hele testen (samme avveining som ble gjort med Spir-grafikken på /spir i går). Si ifra om du heller vil ha den synlig oftere.

Testet: `npx tsc --noEmit` kjører uten feil. Husk `git push`.

## Nytt: 18-årsgrensen fjernet (v2.31, 19.07.2026)

Etter din beskjed: aldersverifikasjonen ("Ja, jeg er 18 år eller eldre" / "Nei, jeg er under 18") er fjernet, mot min anbefaling fra i går (v2.30) om å beholde den -- ditt valg, notert.

- **`/test`**: "Før du starter"-skjermen vises fortsatt (én gang per enhet), men uten aldersspørsmål eller de to knappene. Teksten om hvordan du bør svare ("bruk det første som faller deg inn...") står uendret. Én knapp ("Jeg er klar -- start testen") fører rett videre inn i testen. Avvisningsskjermen ("Dine Fasetter er foreløpig for voksne") er fjernet, siden det ikke lenger finnes noe "nei"-valg.
- **Personvernsiden** ("Aldersgrense"-avsnittet): setningen om at du selv må bekrefte alder er fjernet siden mekanismen ikke lenger finnes. Står igjen: testen er ment for voksne og ikke tilpasset mindreårige (språklig, innholdsmessig og samtykkemessig) -- altså fortsatt en forklaring på hvem testen passer for, slik du ønsket som alternativ.
- Teknisk: lagringsfunksjonene i `src/lib/storage.ts` er omdøpt fra alderbekreftelse til "intro sett" (`loadIntroSeen`/`saveIntroSeen`) -- samme lagringsmekanikk, nytt formål.

Testet: `npx tsc --noEmit` kjører uten feil. Husk `git push`.

## Nytt: Spir-illustrasjon + maskot på resultatsiden (v2.30, 19.07.2026)

Etter ditt ønske:

- **Ny grafikk øverst på /spir** (`src/components/SpirHero.tsx`): et landskaps-motiv i samme visuelle språk som FactorHero på resultatsiden (håndtegnet bølgekant, samme bølgekontur som "Oppsummering"-motivet). Viser en talebobbel (brukerens side av samtalen) og Spir -- speilvendt, i "tenkende" uttrykk med tankeprikkene trekkende mot bobla -- på den andre siden, bokstavelig "på andre siden av dialogen" slik du ba om. Vises øverst på både "ikke låst opp ennå"-skjermen og "Før du starter"-skjermen (ikke i selve chatten, for å spare plass til meldingene).
- **Spir er satt inn i "Vil du utforske resultatet videre?"-kortet** på resultatsiden, ved siden av teksten (oppmuntrende uttrykk).
- Teknisk: Spir sine bygge-blokker (kropp, armer, briller, ansiktsuttrykk) i `SpirMascot.tsx` er gjort gjenbrukbare slik at den nye illustrasjonen alltid er 100 % visuelt identisk med maskoten ellers -- ingen dupliserte, potensielt avvikende tegninger.
- Grafikken er bygget og visuelt kontrollert (rendret til bilde og sett gjennom) før den ble satt inn, men en rask titt i faktisk nettleser (spesielt på mobil) anbefales likevel.

**Om aldersgrensen (18+-bekreftelsen)**: du spurte om denne er viktig -- se svaret i chatten. Kort oppsummert: jeg anbefaler å beholde den, blant annet fordi testen viser krisehjelp-informasjon, deler data med en tredjepart (Spir/Anthropic) og etter hvert skal ta betalt -- alt sammen ting som gjør en enkel, selvdeklarert voksenbekreftelse mer forsvarlig enn på en helt vanlig, gratis personlighetstest. Ingen kodeendring gjort på dette punktet. Personvernsidens "Aldersgrense"-avsnitt dekker allerede "hvem testen passer for"-forklaringen du nevnte som alternativ, så det trengs uansett ikke noe nytt der.

Testet: `npx tsc --noEmit` kjører uten feil. Husk `git push`.

## Nytt: kortere lagre-tekst, kontolagring satt på pause igjen, personvernrettelser (v2.29, 19.07.2026)

Etter din tilbakemelding på "Lagre resultatet ditt"-kortet på resultatsiden:

- **Teksten er kraftig forkortet** -- to lange avsnitt er nå tre setninger, med lenke til den fullstendige forklaringen i personvernerklæringen (`/personvern#konto`) i stedet for å gjenta alt i kortet.
- **Selve lagre-knappen er deaktivert igjen under betatesting**, atskilt fra selve innloggingen: nytt flagg `RESULT_ACCOUNT_SAVE_ENABLED = false` i `src/lib/featureFlags.ts`. CSV-verktøyet lenger opp på siden er dermed igjen den ene, fungerende måten å ta vare på svar på under betatesting -- akkurat som ønsket. Innlogging i seg selv (`ACCOUNT_SAVE_ENABLED`) er IKKE slått av, siden den fortsatt trengs til admin-tilgang (se v2.28 under).
- **Personvernsiden er rettet på to punkter**: en gjenglemt lenke i innholdsfortegnelsen pekte til en seksjon ("Den valgfrie tilleggsseksjonen") som ikke lenger finnes på siden -- fjernet. Setningen om admin-innlogging var fortsatt skrevet som om admin hadde en egen cookie (fra før v2.28) -- rettet til å beskrive at admin nå bruker samme innlogging som alle andre. Lagt til en eksplisitt linje om at kontolagring skjer på grunnlag av samtykke, og at samtykket når som helst kan trekkes tilbake ved sletting.

Testet: `npx tsc --noEmit` kjører uten feil. Husk `git push`.

## Nytt: rettet tre kritiske funn fra kvalitetsrevisjonen + innlogging i menyen (v2.28, 19.07.2026)

Etter en full kvalitetsrevisjon (se `Kvalitetsrevisjon_DineFasetter_2026-07-19.docx`) ba du om at de kritiske funnene skulle rettes først, og at det som krever oppfølging med firma/formelle avtaler (DPA, DPIA, jurist, org.nr.) kunne vente. Følgende er gjort:

- **Admin-passkeyen er avviklet -- lukker et kritisk sikkerhetshull.** Den gamle WebAuthn-registreringen var "først til mølla": hvem som helst kunne i teorien registrere seg som admin før du gjorde det selv. Admin-tilgang styres nå i stedet av HVILKEN E-POST som logger inn via den vanlige e-post/kode-innloggingen -- `jomik.guldager@gmail.com` er alltid admin (hardkodet i koden, kan aldri "mistes"), og du kan som admin gi flere kontoer admin-rolle (`src/lib/admin/roles.ts` + et enkelt API, `/api/admin/roles` -- ikke koblet til noe grensesnitt ennå, se eget punkt om admin-UI under). De gamle passkey-endepunktene svarer nå bare med en forklarende feilmelding.
- **Innlogging er lagt i toppmenyen**, ikke bare i bunnteksten -- samme innlogging brukes både til å hente fram et lagret resultat OG som eneste vei inn i adminpanelet. `/logg-inn` viser nå kontostatus når du er innlogget (hent lagret resultat, snarvei til adminpanelet hvis du er admin, logg ut). **Kontolagring er derfor reaktivert** (`ACCOUNT_SAVE_ENABLED = true` i `src/lib/featureFlags.ts`) -- den var satt på pause i går (v2.27) av hensyn til betatestfokus, men trengs nå for at innlogging/admin skal fungere i det hele tatt.
- **Kontrastfeilen på holo-sky som tekstfarge er rettet.** Den lyse himmelblåe fargen ga bare 2,04:1 kontrast som tekst (WCAG-krav 4,5:1) -- brukt bl.a. på forsidens undertittel, aktiv meny-lenke og flere knapper/lenker. Lagt til en ny, mørkere tekst-variant (`holo.skyText`, 5,03:1 kontrast) og byttet ca. 20 forekomster til denne -- selve bakgrunnsfargen (knapper, glød-effekter) er uendret.
- **Det globale AI-spørsmålstaket håndheves nå faktisk.** Innstillingen fantes i adminpanelet, men ble aldri sjekket i selve `/api/spir`-ruten -- et reelt, uovervåket kostnadshull. Det finnes nå en enkel, serverlagret teller (`src/lib/admin/aiUsage.ts`) som stopper Spir når det globale taket er nådd.
- **Admin-innstillinger flyttet fra en lokal fil til Netlify Blobs.** Filbasert lagring (`.data/admin-store.json`) fungerer ikke pålitelig i Netlifys produksjonsmiljø (delt ikke filsystem mellom kalde starter) -- innstillingene dine (av/på-brytere, AI-tak) kunne i praksis forsvinne. Nødvendig for at rettelsen over faktisk skal virke i drift, ikke bare lokalt.

**Ikke gjort i denne runden (bevisst, etter din beskjed):** DPA-signering, DPIA, juristgjennomgang av personvernteksten, organisasjonsnummer -- disse krever din oppfølging med formelle avtaler/firma og venter til du tar dem opp igjen. Heller ikke betalingsflyten (stort, eget arbeid) eller de øvrige, ikke-kritiske funnene fra revisjonsrapporten (SEO-metadata, ARIA-forbedringer i testflyten, m.m.) -- si ifra om du vil at jeg skal ta fatt på noen av dem.

**Trenger fortsatt oppfølging fra deg:**
- [ ] Adminpanelets brukergrensesnitt for å administrere HVEM som har admin-rolle (legge til/fjerne) er ikke bygget -- kommer i egen runde når du har sett an hvordan du vil at det skal se ut, som avtalt.
- [ ] Domeneverifisering i Resend er fortsatt ikke på plass -- innloggingskoder når derfor i praksis kun din egen registrerte adresse ennå (se tidligere punkt i denne loggen).

Testet: `npx tsc --noEmit` kjører uten feil. `npm run lint`/`npx vitest` kunne ikke kjøres i denne økten (sandkassen mangler riktige native binærfiler for SWC/Rollup og har ikke nettverkstilgang til å laste dem ned) -- kjør disse selv (eller la Netlify sitt bygg gjøre det) før du stoler fullt på endringen. Husk `git push`.

## Nytt: "Utvikling over tid" for Premium-nivå (v2.27, 18.07.2026)

Første av de tre gjenstående, større funksjonene fra 3-nivåmodellen (partnerkobling og delbare sosiale-medie-kort kommer som egne saker senere, én om gangen etter ditt ønske).

- **Kontolagringen bygger nå opp en historikk i stedet for å bare huske det siste resultatet.** Tar du Utvidet versjon (290 spm, Premium-nivået) flere ganger og lagrer hver gang mens du er logget inn på samme e-post, beholdes tidligere resultater (inntil 24 lagringer) i stedet for at det forrige blir overskrevet. Tar du i stedet 120-spørsmålsversjonen (Standard), oppfører kontoen seg som før: kun ett lagret resultat om gangen, ingen historikk.
- **Ny seksjon på resultatsiden: "Utvikling over tid."** Vises for deg som er logget inn med et Utvidet-nivå-resultat og har minst to lagrede resultater på kontoen. Viser dato og skår for hver av de fem hovedfaktorene per lagring, med endringstall i parentes fra forrige gang (f.eks. "68 (+5)"). Bevisst nøytralt -- ingen farger eller "bedre/verre"-språk, i tråd med den tidligere avgjørelsen om at nettsiden ikke skal gi utviklingsvurderinger (se punktet fra 17.07.2026 lenger ned).
- **12-månederssletting og påminnelses-e-post gjelder nå per lagret resultat, ikke per konto.** Den planlagte slettejobben (`netlify/functions/account-retention.mts`) er oppdatert til å behandle hvert lagrede resultat i historikken uavhengig -- et resultat fra januar slettes 12 måneder etter januar, selv om du har lagret nyere resultater i mellomtiden. Kontoen (hele e-postoppføringen) slettes først når alle lagrede resultater på den er utløpt.
- Rettet en liten feil i forrige changelog-oppføring (v2.26): innloggingskoden er 6 sifre, ikke 8 som det sto der.

Testet med egne script (append/kutt ved 24, full-nivå nullstiller historikken, individuell utløpsberegning per oppføring) -- ingen ekte Netlify-miljø tilgjengelig i utviklingssandkassen til å teste selve Blobs-lagringen live, så hold litt ekstra øye med dette etter at det er i produksjon. Ingen handling kreves fra deg utover det -- husk `git push`.

## Nytt: 3-nivåmodellen er nå live -- helt uten betalingssperre (v2.26, 18.07.2026)

Etter dine svar på oppfølgingsspørsmålene (Spir flyttes til Standard/Premium, gjenbruk eksisterende innlogging, "mellomting"-partnerdeling på Standard, og konkret innhold for Standard) og din siste beskjed om at du vil kunne prøve alt selv før du bestemmer deg for betaling, er følgende gjort:

- **Kontolagring er gjenaktivert.** `ACCOUNT_SAVE_ENABLED` er satt til `true` i `src/lib/featureFlags.ts` -- innlogging med e-post + 6-sifret engangskode, og "Lagre resultatet mitt" på resultatsiden, virker igjen. Dette var satt på pause under betatesting (v2.16); nå er det en del av den vedtatte prismodellen (skylagring på Standard/Premium, se `FemFaktorer_Forretnings-og-prismodell_v1.2.docx` del 6.1).
- **Ingen betalingssperre er lagt inn noe sted.** Jeg sjekket hele kodebasen for pris-/betalingstekst -- det finnes ingen i dag. Nivåene (gratis/Standard/Premium) styres allerede kun av hvor mange spørsmål som er besvart, ikke av betaling, så "prøv alt selv"-ønsket ditt er i praksis allerede oppfylt for testlengde, Spir-tilgang, PDF-nedlasting og analysedybde. Når dere faktisk vil ta betalt, er neste steg å legge til en ekte betalingsflyt foran de riktige knappene -- ikke å bygge om noe av det som er gjort nå.
- **Nytt innhold: "Jobb" og "Kjærlighet" på gratisnivået.** Resultatsiden viser nå, under hver hovedkategori på gratisnivået, en kort "Jobb"-seksjon (styrker/utfordringer å kjenne til i jobbsammenheng) og en "Kjærlighet"-seksjon (samme for relasjoner, pluss et nytt avsnitt om hvilke typer personer som ofte er en god match -- alltid formulert som "ofte"/"som regel", aldri en garanti eller en fasit). Dette gjenbruker delvis tekst som allerede fantes i koden (`careerNote`, `relationshipNote`), pluss 15 helt nye tekster (`partnerNote`, én per hovedkategori × nivå).

**Viktig -- én ting mangler ennå, og krever en Resend-innstilling fra din side før det virker for andre enn deg:** innloggings-e-postene sendes i dag kun til din egen registrerte Resend-adresse, siden domenet ikke er verifisert ennå. Dette er dokumentert tidligere i denne fila og er ikke noe jeg kan løse fra kodesiden alene.

**Ikke bygget ennå (større arbeid, kommer som egen sak):** delbare bilder/kort for sosiale medier, partner-/venn-kobling (alle tre nivåvarianter), og "utvikling over tid"-visningen for flere lagrede tester. Disse er substansielle, ubygde funksjoner -- jeg legger fram et forslag til rekkefølge/omfang for dette som eget punkt, i stedet for å bygge alt uten en prioritering fra deg først.

Ingen handling kreves fra deg for det som er gjort -- husk `git push`.

## Nytt: bekreftelse før du havner rett i resultatet igjen (v2.25, 18.07.2026)

Fikset etter din tilbakemelding: hvis du allerede hadde fullført testen (høyeste nivå + den valgfrie tilleggsseksjonen) og trykket "test" eller "start testen" igjen, ble du sendt rett til resultatsiden uten noe mellomsteg. Nå får du i stedet en tydelig skjerm: "Du har allerede et resultat -- mente du å ta testen på nytt, eller vil du se resultatet du allerede har?", med to knapper. De to eksisterende sjekkpunktskjermene (etter 50 og etter 120 spørsmål) har også fått en liten ekstra lenke ("Trykket du hit ved en feiltakelse? Start testen helt på nytt"), i tilfelle noen har svart delvis og lurer på hvordan de starter helt på nytt.

Velger du å starte på nytt, blir det forrige svarsettet ditt arkivert lokalt i nettleseren (siste 5 forsøk) FØR det nullstilles -- det forsvinner altså ikke stille. Det finnes ikke en egen visning av dette arkivet ennå (det henger sammen med planen om flere lagrede testresultater over tid i høyere nivåer, se punktet under) -- foreløpig er det bare en trygg sikkerhetsnett i bakgrunnen.

Ingen handling kreves -- husk `git push`.

## Avgjort: tre nivåer, tre priser, og konkurrentanalyse (18.07.2026, se v2.26 over)

Den fremtidige 3-nivå prismodellen (gratis/20 kr/99 kr) er nå ferdig utredet og dokumentert i `FemFaktorer_Forretnings-og-prismodell_v1.2.docx`, inkludert konkurrentanalyse og løsning på alle åpne spørsmål (Spir-plassering, innlogging, partnerdeling, Standard-innhold). Merk: dette representerer en endring fra en tidligere logget beslutning i denne fila ("Prisbeslutning", v2.8) om at 120- og 300-spørsmålsnivået skulle koste det samme -- den beslutningen er nå erstattet av 3-nivå-modellen.

## Nytt: tydelig henvisning til hjelp ved vanskelige tanker (v2.24, 18.07.2026)

Etter ditt ønske: FemFaktorer henviste tidligere kun vagt til "nødtjenester eller helsepersonell" ved akutt behov (på hjelp-siden), uten konkrete numre eller lavterskeltilbud -- og ingenting av dette fantes på selve resultatsiden eller i Spir. Lagt til tre steder, med numre verifisert mot Helsenorges offisielle sider:

- **Resultatsiden**: en kort, lavmælt linje rett ved den eksisterende "ikke en diagnose"-teksten, som alltid vises (uansett skår) -- Hjelpetelefonen (116 123, gratis/døgnåpen) og nødnummer 113.
- **Hjelp-siden**: den tidligere vage "ved akutt behov"-boksen er skrevet om til en konkret seksjon ("Trenger du å snakke med noen?") med Hjelpetelefonen, legevakt (116 117) og nødnummer (113), samt at fastlegen kan henvise videre.
- **Spir**: en ny regel i de delte toneregler (gjelder både fri samtale og guidet gjennomgang) -- dersom brukeren gir uttrykk for sterk nød eller tanker om å skade seg selv, legger Spir personlighetsanalysen til side, viser omsorg med få ord, og viser videre til Hjelpetelefonen/nødnummer. Spir er tydelig på at den selv ikke er en krisetjeneste.

Verifisert at de delte tonereglene fortsatt er ord-for-ord like i begge Spir-samtaleformene etter endringen (samme sjekk som ved v2.19). Ingen handling kreves -- husk `git push`.

## Nytt: fremdriftslinje med "rask start, sakte slutt" + rettet leseretning på underkategorier + tre språkfeil (v2.23, 17.07.2026)

Fire mindre, men merkbare endringer etter dagens tilbakemeldinger:

- **Fremdriftslinjen i spørreskjemaet** følger nå en kurve i stedet for en rett linje: den fylles raskt i starten og bremser mot slutten (f.eks. viser ~65 % når du reelt er halvveis). Selve teksten under linjen ("Spørsmål X av Y") er fortsatt ekte og ærlig -- det er kun den visuelle følelsen av fremgang som er justert for å holde motivasjonen oppe gjennom et langt skjema.
- **Underkategori-resultatene** ("Bekymring / ro", "Nedstemthet / motstandskraft" osv.) viste tidligere en løsrevet "Svært høyt/lavt" ved siden av navnet -- lett å mistolke, siden det første ordet i navnet er det negative (man leser fort "svært høy bekymring" når det faktisk betyr svært høy ro). Viser nå eksplisitt hvilket ord skåren gjelder, f.eks. "Svært høy grad av ro", uten at man må lese forklaringsteksten under for å forstå det riktig.
- **To setninger med språkfeil er rettet**: "Hodet ditt holder kaldt" -> "Du holder hodet kaldt" (riktig norsk uttrykk), og "solid bunn å stå på" -> "solid grunn å stå på" (riktig ord). Én automatisk generert setning i den avsluttende oppsummeringen er også omskrevet til å lyde mer naturlig.
- **Ny kort veiledning før testen starter**: samme skjerm som aldersbekreftelsen forklarer nå kort hvordan man bør svare (første innskytelse, ikke tenke for lenge, svare ut fra hvordan man vanligvis er på tvers av situasjoner) -- omtrent det en psykolog ville sagt før en administrerte en test.

Ingen handling kreves fra deg -- husk bare `git push` som vanlig.

**Avgjort (17.07.2026)**: den avsluttende oppsummeringen forblir som i dag -- forklarer mønstre og "hvorfor", men gir ingen utviklingsråd eller refleksjonsspørsmål utover det som allerede ligger i de eksisterende `closingHook`-tekstene. Ingen kodeendring gjort.

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
