# Adminpanel — kartlegging og forslag

**Dato:** 31.07.2026 · **Status:** Forslag til beslutning. Ingenting er bygget som følge av dette dokumentet.

---

## Del 1 — Hva som allerede finnes

Kort svar: **ja, det er satt opp tidligere — og det er allerede knyttet til jomik.guldager@gmail.com.** Men det som finnes er en tilgangsmekanisme med seks brytere, ikke et administrasjonspanel.

### Slik fungerer innloggingen i dag

Du går til `/logg-inn`, skriver inn e-postadressen din, får en engangskode på e-post, og limer den inn. Ingen passord. Er du logget inn med en adresse som har admin-rolle, dukker det opp en snarvei til `/admin`.

Adressen din er **hardkodet i selve koden** (`src/lib/admin/roles.ts`) som fast admin. Det betyr at du aldri kan bli låst ute, uansett hva som skjer med lagringen. Det ble gjort bevisst 19.07.2026, da et tidligere passkey-basert opplegg ble skrotet fordi det hadde et «først til mølla»-hull — hvem som helst kunne i teorien registrert seg som admin før deg.

Systemet støtter allerede at **flere e-postadresser kan gis admin-rolle**. Funksjonene og et API finnes (`/api/admin/roles`), men det er ingen skjerm der du kan bruke dem. Din egen adresse kan uansett aldri fjernes.

### Hva panelet på `/admin` faktisk inneholder i dag

Én side, seks innstillinger:

| Innstilling | Hva den gjør |
|---|---|
| Spir (AI-veileder) er på | Av/på-bryter for AI-samtalen |
| Vedlikeholdsmodus | Av/på |
| Vedlikeholdsmelding | Fritekst som vises i vedlikeholdsmodus |
| AI-modell | Hvilken Claude-modell Spir bruker |
| AI-tak per bruker/økt | Antall spørsmål én bruker kan stille |
| Globalt AI-tak | Kostnadssperre totalt |

Innstillingene lagres i Netlify Blobs, så de overlever nye utrullinger. Det globale AI-taket håndheves faktisk (det gjorde det ikke før 19.07). Koden sier det rett ut nederst på siden: *«Dashboard med besøkstall, gjennomførte tester, AI-kostnad og administrasjon av hvem som har admin-rolle er ikke bygget i dette utkastet.»*

### Det viktigste forbeholdet — og det du må ta stilling til først

**Nesten ingen av tallene du ønsker deg finnes i dag.** Ikke fordi noen har glemt det, men fordi systemet er bevisst designet for å ikke samle dem:

- **Normstatistikken** (`src/lib/stats/`) er rene histogrammer — antall personer per poengsum, per faktor og fasett. Ingen tidsstempler, ingen økt-ID, ingen IP. Ruten som tar imot dem leser ikke engang informasjonskapsler. Du kan altså se *fordelingen*, men ikke *utviklingen over tid*, og heller ikke hvor mange som startet uten å fullføre.
- **Kontolagring** lagrer bare ferdig beregnede skårer, aldri de rå svarene. Personvernerklæringen lover dette eksplisitt.
- **Tilbakemeldinger fra betatestere** går til et Google Forms-skjema utenfor nettstedet. De kan ikke vises i panelet uten at skjemaet byttes ut eller kobles på.
- **Besøksstatistikk finnes ikke i det hele tatt.** Personvernerklæringen sier at Plausible skal innføres, men det er ikke gjort.

Dette er ikke en feil å rette opp. Det er en reell avveining du må ta bevisst: **hvert tall du vil se i panelet, må først begynne å samles inn — og hver innsamling må tåle å stå i personvernerklæringen.**

---

## Del 2 — Hva forskningen sier om hva et slikt panel bør inneholde

### Prinsipp 1: Velg få tall, knyttet til et mål

Googles **HEART-rammeverk** (Rodden, Hutchinson & Fu, ACM CHI 2010) er den mest brukte modellen for å måle brukeropplevelse. Den deler måling i fem: *Happiness, Engagement, Adoption, Retention, Task Success* — og understreker at man skal **plukke de kategoriene som svarer til målet man har akkurat nå**, ikke måle alt. Metoden «Goals–Signals–Metrics» går ut på å først skrive ned målet, så hvilket observerbart signal som viser om målet nås, og først da hvilket tall som skal telles.

For deg nå, i beta, er de relevante kategoriene **Task Success** (klarer folk å fullføre testen?) og **Happiness** (er tilbakemeldingene gode?). Retention og Adoption blir først meningsfulle etter lansering.

### Prinsipp 2: Ett skjermbilde, viktigste øverst til venstre

Eye-tracking-forskningen fra Nielsen Norman Group viser at brukere skanner i et F-mønster og bruker mesteparten av tiden øverst og til venstre. Dashboardlitteraturen er samstemt om at kognitiv belastning er hovedfienden: for mye på én gang gjør at ingenting blir lest. Praktisk konsekvens: **maks 5–6 nøkkeltall på forsiden av panelet**, resten på undersider.

### Prinsipp 3: For en psykologisk test gjelder egne kvalitetskrav

**International Test Commission** har to sett retningslinjer som er direkte relevante: *Guidelines on Computer-Based and Internet-Delivered Testing* (vedtatt 2005) og *Guidelines on Quality Control in Scoring, Test Analysis and Reporting*. De deler kvalitetsarbeidet i fire: teknologi, kvalitet, kontroll og sikkerhet — og forutsetter at en testutgiver **løpende overvåker** at testen oppfører seg som den skal, ikke bare validerer én gang.

Konkret for en Big Five-test betyr det å følge med på:

- **Intern konsistens** per fasett og faktor (Cronbach's alfa; over 0,70 regnes som akseptabelt, over 0,80 som godt). Med 4–5 ledd per fasett i 120-versjonen vil noen fasetter naturlig ligge lavt — det er verdt å vite hvilke.
- **Ledd-total-korrelasjon** per spørsmål. Et spørsmål med svak korrelasjon mot sin egen fasett er en kandidat for omskriving.
- **Skjødesløs svargiving** (*careless responding*). Forskningen er ubehagelig tydelig: i én studie ble **33 %** av respondentene flagget som skjødesløse under normale forhold. Slik svargiving blåser opp itemvarians og trekker gjennomsnitt mot midten — altså direkte skadelig for normgrunnlaget ditt. De mest effektive markørene er **svartid per ledd**, personlig reliabilitet og psykometriske synonymer/antonymer; «long string» (samme svar mange ganger på rad) er lettest å regne ut, men fungerer dårligere alene.

**Her ligger den vanskeligste avveiningen i hele prosjektet:** all denne analysen krever **svar på enkeltspørsmål**. Systemet ditt kaster dem bevisst. Se Del 4.

### Prinsipp 4: Adminpanel er i seg selv en personvernrisiko

Datatilsynet knytter kravet om innebygd personvern (GDPR art. 25) og sikkerhetstiltak (art. 32) direkte til **tilgangsstyring og logging**. I avgjørelser mot helsesektoren har manglende logging av hvem som har sett hva vært et selvstendig avvik. Praktisk minimum for et panel som viser persondata: personlige adminkontoer (ikke delte), logging av innlogging og av oppslag på enkeltpersoner, og et bevisst forhold til hvor lenge loggen tas vare på.

For besøksstatistikk gir cookiefri måling (Plausible) lovlig innsamling **uten samtykkebanner**, fordi ingenting lagres på brukerens enhet og utdataene er rent aggregerte. Det er allerede det personvernerklæringen din varsler.

---

## Del 3 — Konkret forslag, i tre faser

### Fase 1 — Betapanelet (bygges nå, lav risiko)

Målet: du skal kunne svare på *«virker det, og hva sier testerne?»* uten å spørre meg.

1. **Forside med fem tall.** Tester fullført siste 7 dager · fordeling 120 vs. 290 · AI-kall brukt av globalt tak · antall lagrede kontoer · dagens versjonsnummer. Alt bortsett fra AI-tallet krever ny, aggregert telling — men bare tellere, ingen personopplysninger.
2. **Administrere admin-roller.** Skjerm for å legge til og fjerne e-postadresser. API-et finnes allerede; dette er ren UI-jobb og lukker et hull som er notert som åpent i oppgavelisten din.
3. **Samle alle brytere ett sted.** De tre funksjonsbryterne som i dag ligger hardkodet i `featureFlags.ts` (kontolagring, lagre-knapp på resultatsiden, CSV-verktøy) flyttes inn i panelet. I dag krever hver eneste av/på en ny utrulling — det er den enkeltendringen som vil spare deg mest tid.
4. **Driftsstatus.** Én linje per avhengighet: Resend (e-post), Anthropic (Spir), Netlify Blobs. Grønn/rød, med tidspunkt for siste vellykkede kall. Da ser du selv om «koden kommer ikke frem» skyldes deg eller en tjeneste som er nede.
5. **Sikkerhetsopprydding.** De gamle passkey-endepunktene (`/api/admin/login/*`, `/api/admin/register/*`) ligger fortsatt i koden og svarer med feilmeldinger. De bør slettes, ikke bare deaktiveres.

### Fase 2 — Bruks- og markedsføringstall (krever ny innsamling)

6. **Cookiefri besøksstatistikk (Plausible).** Gir deg besøkende, trafikkilder, hvilke sider som leses, og hvilke kampanjelenker som virker — altså det du trenger for markedsføring. Ingen samtykkebanner. Vises som et innebygd panel i admin, ikke som en egen tjeneste du må huske å logge inn på. **Dette er det enkeltgrepet som gir mest markedsføringsverdi for minst arbeid.**
7. **Trakt for testen.** Hvor mange starter, hvor mange kommer til spørsmål 50 / 120 / 290, hvor mange når resultatsiden. Frafallspunktene er det viktigste produktsignalet du kan få — de peker rett på hvor testen er for lang eller for kjedelig. Kan gjøres med rene, anonyme tellere per steg (ingen økt-ID nødvendig).
8. **Tidsbruk.** Median tid til fullført test, per nivå. Du måler dette allerede i tilbakemeldingsboksen — det bør bli et fast tall.
9. **Tilbakemeldinger i panelet.** Enten ved å bytte ut Google Forms med et eget skjema som skriver til Netlify Blobs, eller ved å hente inn skjemasvarene. Egen løsning anbefales: da følger versjonsnummer, enhet og tidsbruk automatisk med, og du slipper å ha testerdata hos Google.
10. **Nøkkeltall over tid.** Normstatistikken må få et *tidsstempel per bøtte-periode* (f.eks. per uke) for at «utvikling» skal være mulig i det hele tatt. Fortsatt aggregert, fortsatt anonymt.

### Fase 3 — Psykometrisk kvalitetsovervåking (krever en prinsippbeslutning)

11. **Ledd-statistikk.** Svarfordeling per spørsmål, ledd-total-korrelasjon, alfa per fasett og faktor — oppdatert løpende. Dette er ITC-anbefalt praksis og den eneste måten å oppdage at et spørsmål er dårlig formulert på norsk.
12. **Kvalitetsflagg på innsendinger.** Andel besvarelser med mistenkelig kort svartid eller lange serier av identiske svar, og mulighet til å holde disse utenfor normgrunnlaget. Uten dette risikerer normene dine å være systematisk skjeve.
13. **Innsyn og sletting.** Slå opp en e-postadresse, se hva som er lagret, eksporter det, slett det. Nødvendig for å håndtere GDPR-forespørsler i praksis. Må logges (se Del 4).

---

## Del 4 — Tre avgjørelser bare du kan ta

**A. Skal rå svar lagres anonymt?**
Fase 3 er umulig uten. Et mellomstandpunkt finnes: lagre svarsett **helt uten kobling til person** (ingen e-post, ingen IP, ingen økt-ID — nøyaktig samme prinsipp som normstatistikken bruker i dag), og be om samtykke i det ene skjermbildet før testen starter. Da får du psykometrisk kvalitetskontroll uten å behandle personopplysninger. Alternativet er å droppe punkt 11 og 12 og akseptere at du ikke kan kvalitetssikre enkeltspørsmål empirisk.

**B. Hvor mye skal panelet kunne se om enkeltpersoner?**
Anbefalingen min er å holde Fase 1 og 2 **helt fri for persondata** — bare tellere og aggregater. Da trenger panelet ingen adgangslogg, og risikoen ved at noen skulle komme seg inn er nær null. Først når punkt 13 bygges, innføres logging av oppslag.

**C. Hvor mye tid skal dette få?**
Fase 1 er en overkommelig runde og gir deg umiddelbar nytte. Fase 2 er den som gir markedsføringsverdi, men krever at Plausible settes opp og at telling bygges inn flere steder i testen. Fase 3 er et eget prosjekt — og bør vente til det er nok trafikk til at tallene betyr noe. Under ca. 200 fullførte tester per fasett er alfa-estimater for ustabile til å handle på.

---

## Kilder

- [Kerry Rodden — The HEART framework for UX metrics](https://kerryrodden.com/heart/) (originalforfatter, ACM CHI 2010)
- [ProductPlan — HEART Framework](https://www.productplan.com/glossary/heart-framework)
- [ITC — International Guidelines on Computer-Based and Internet-Delivered Testing (PDF)](https://www.intestcom.org/files/guideline_computer_based_testing.pdf)
- [ITC — Guidelines on Quality Control in Scoring, Test Analysis and Reporting (PDF)](https://www.intestcom.org/files/guideline_quality_control.pdf)
- [British Psychological Society — International Guidelines on Computer-Based and Internet Delivered Testing](https://www.bps.org.uk/guideline/international-guidelines-computer-based-and-internet-delivered-testing)
- [Ward & Meade — Dealing with Careless Responding in Survey Data, *Annual Review of Psychology*](https://www.annualreviews.org/content/journals/10.1146/annurev-psych-040422-045007)
- [Careless responding in questionnaire measures: Detection, impact, and remedies (*Human Resource Management Review*)](https://www.sciencedirect.com/science/article/abs/pii/S1048984320300114)
- [A Response-Time-Based Latent Response Mixture Model for Careless Responding, *Psychometrika*](https://link.springer.com/article/10.1007/s11336-021-09817-7)
- [Datatilsynet — Innebygd personvern og personvern som standard](https://www.datatilsynet.no/rettigheter-og-plikter/virksomhetenes-plikter/innebygd-personvern-og-personvern-som-standard/)
- [Datatilsynet — Programvareutvikling med innebygd personvern](https://www.datatilsynet.no/rettigheter-og-plikter/virksomhetenes-plikter/innebygd-personvern/programvareutvikling-med-innebygd-personvern/innebygd-personvern---hva-er-det/)
- [Lovdata — Nye avgjørelser fra Datatilsynet om tilgangsstyring og logging](https://lovdata.no/artikkel/nye_avgjorelser_fra_datatilsynet_om_tilgangsstyring_og_logging_i_helsesektoren/3709)
- [Plausible — GDPR-compliant web analytics without consent: a legal guide](https://plausible.io/blog/legal-assessment-gdpr-eprivacy)
- [Laerd Statistics — Cronbach's Alpha: tolkning og grenseverdier](https://statistics.laerd.com/spss-tutorials/cronbachs-alpha-using-spss-statistics.php)
- Intern kode og dokumentasjon: `src/lib/admin/`, `src/lib/stats/`, `src/lib/featureFlags.ts`, `src/app/personvern/page.tsx`, `OPPGAVER-FOR-PRODUKTEIER.md`
