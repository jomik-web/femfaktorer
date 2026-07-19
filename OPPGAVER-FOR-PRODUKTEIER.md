# Oppgaver før/under bygging av første utkast

Sist oppdatert: 19.07.2026

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
