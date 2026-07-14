import Link from "next/link";

/**
 * Fullstendig personvernoversikt. Innhold basert på Dokument 07
 * (Personvern, jus og etikk v1.0) og faktisk gjeldende funksjonalitet i
 * koden (localStorage, O6-tillegg, konto/Netlify Blobs v2.4, Spir/Anthropic,
 * Resend). Dokument 07 er selv merket "utkast -- ikke juridisk
 * kvalitetssikret"; denne siden arver samme forbehold, se avsnittet
 * "Status på denne siden" nederst.
 *
 * MERK: denne siden går lenger enn Dokument 07 v1.0 i omfang, fordi
 * kontofunksjonen (v2.4) og O6-tillegget ble bygget etter at dokumentet ble
 * skrevet. Innholdet her beskriver systemet slik det faktisk fungerer i
 * dag, ikke bare det opprinnelige MVP-omfanget.
 */

const SECTIONS = [
  { id: "kort-oppsummert", label: "Kort oppsummert" },
  { id: "behandlingsansvarlig", label: "Hvem er behandlingsansvarlig" },
  { id: "testsvar", label: "Testsvarene dine" },
  { id: "tilleggsseksjon", label: "Den valgfrie tilleggsseksjonen" },
  { id: "konto", label: "Hvis du lagrer resultatet ditt" },
  { id: "cookies", label: "Informasjonskapsler (cookies)" },
  { id: "spir", label: "Hvis du snakker med Spir" },
  { id: "tredjeparter", label: "Hvem har tilgang til opplysningene dine" },
  { id: "overforing", label: "Overføring utenfor EU/EØS" },
  { id: "lagringstid", label: "Hvor lenge lagres opplysningene" },
  { id: "aldersgrense", label: "Aldersgrense" },
  { id: "rettigheter", label: "Dine rettigheter" },
  { id: "status", label: "Status på denne siden" },
  { id: "kontakt", label: "Kontakt" },
];

export default function PersonvernPage() {
  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-10 px-6 py-16">
      <header className="flex flex-col gap-3">
        <h1 className="text-2xl font-semibold text-ink dark:text-white sm:text-3xl">
          Personvern hos FemFaktorer
        </h1>
        <p className="text-ink/80 dark:text-warmgray/80">
          Dette er den fullstendige oversikten over hvordan FemFaktorer behandler opplysninger om
          deg -- hva som skjer, og like viktig, hva som ikke skjer. Finner du ikke svar på det du
          lurer på her, kan du kontakte oss direkte (se nederst).
        </p>
      </header>

      <nav aria-label="Innhold på siden" className="rounded-lg bg-mint/50 p-5 dark:bg-white/5">
        <h2 className="mb-3 font-semibold text-ink dark:text-white">Innhold</h2>
        <ul className="flex flex-col gap-1.5 text-sm">
          {SECTIONS.map((s) => (
            <li key={s.id}>
              <a href={`#${s.id}`} className="text-teal underline underline-offset-2">
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <section id="kort-oppsummert" className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-ink dark:text-white">Kort oppsummert</h2>
        <ul className="flex flex-col gap-2 text-ink/80 dark:text-warmgray/80">
          <li>-- Du trenger ingen konto for å ta testen.</li>
          <li>
            -- Svarene dine forlater aldri nettleseren din, med mindre du selv aktivt velger å
            snakke med Spir eller lagre resultatet på en konto.
          </li>
          <li>-- Vi setter ingen sporings- eller annonsekapsler.</li>
          <li>-- Du kan slette alt du har lagret, når som helst, selv.</li>
          <li>
            -- Ingenting sendes til en tredjepart (AI-leverandøren eller kontolagringen) uten at du
            aktivt ber om det først.
          </li>
        </ul>
      </section>

      <section id="behandlingsansvarlig" className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-ink dark:text-white">
          Hvem er behandlingsansvarlig
        </h2>
        <p className="text-ink/80 dark:text-warmgray/80">
          FemFaktorer.no drives per nå av Jomik Guldager, som privatperson. Registrering av et
          enkeltpersonforetak er under arbeid; organisasjonsnummer og fullstendig
          firmainformasjon legges inn her så snart det er på plass. Du når oss uansett på
          e-postadressen under kontaktpunktet nederst på siden.
        </p>
      </section>

      <section id="testsvar" className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-ink dark:text-white">Testsvarene dine</h2>
        <p className="text-ink/80 dark:text-warmgray/80">
          Svarene du gir i testen -- både korttesten (50 spørsmål) og fullversjonen (120 spørsmål)
          -- lagres utelukkende lokalt i nettleseren din (såkalt <em>localStorage</em>). De sendes
          aldri til FemFaktorer sine servere som en del av selve testgjennomføringen.
        </p>
        <ul className="flex flex-col gap-2 text-ink/80 dark:text-warmgray/80">
          <li>
            -- Andre som har tilgang til samme enhet eller nettleser kan i prinsippet se disse
            dataene, på samme måte som med annen lokalt lagret nettleserdata.
          </li>
          <li>
            -- Du kan slette dataene dine når som helst med "Slett mine data" på resultatsiden,
            eller ved å tømme nettleserdata for siden.
          </li>
          <li>
            -- Sletting er permanent. FemFaktorer har ingen kopi å gjenopprette fra, med mindre du
            aktivt har lagret resultatet på en konto (se eget avsnitt under).
          </li>
        </ul>
      </section>

      <section id="tilleggsseksjon" className="flex flex-col gap-3 rounded-lg border border-coral/40 p-5">
        <h2 className="text-lg font-semibold text-ink dark:text-white">
          Den valgfrie tilleggsseksjonen (politiske og verdimessige holdninger)
        </h2>
        <p className="text-ink/80 dark:text-warmgray/80">
          Etter fullført 120-spørsmålstest kan du velge en helt separat, valgfri tilleggsseksjon om
          politiske og verdimessige holdninger. Dette regnes som en særlig kategori
          personopplysninger etter GDPR artikkel 9, og krever derfor et eget, uttrykkelig samtykke
          -- atskilt fra samtykket for resten av testen. Denne seksjonen teller ikke med i noen av
          de fem hovedfaktorene.
        </p>
        <p className="text-ink/80 dark:text-warmgray/80">
          Du kan trekke tilbake samtykket og slette bare denne dataen når som helst, uavhengig av
          resten av testresultatet ditt -- se "Slett bare denne dataen" på resultatsiden.
        </p>
        <p className="text-sm text-ink/60 dark:text-warmgray/60">
          Merk: hvis du både har svart på denne tilleggsseksjonen og velger å lagre resultatet ditt
          på en konto (se under), tas skåren fra denne seksjonen med i det som lagres server-side,
          på samme måte som de fem hovedfaktorene. Dette gjelder ikke hvis du ikke bruker
          kontofunksjonen.
        </p>
      </section>

      <section id="konto" className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-ink dark:text-white">
          Hvis du lagrer resultatet ditt (konto)
        </h2>
        <p className="text-ink/80 dark:text-warmgray/80">
          Hvis du har tatt fullversjonen (120 spørsmål), kan du velge å lagre resultatet ditt
          knyttet til e-postadressen din, slik at du slipper å ta testen på nytt for å se det igjen
          -- også fra en annen enhet. Denne funksjonen finnes ikke for korttesten.
        </p>
        <ul className="flex flex-col gap-2 text-ink/80 dark:text-warmgray/80">
          <li>
            -- Vi lagrer bare de <strong>ferdig beregnede skårene</strong> dine (de fem
            hovedfaktorene, fasettene, og ev. tilleggsseksjonen) -- aldri de 120 rå svarene du ga.
          </li>
          <li>
            -- Innlogging skjer med en engangskode sendt til e-posten din, ikke passord. Koden
            sendes via e-posttjenesten Resend.
          </li>
          <li>
            -- Dataene lagres i Netlify Blobs (en del av hostingplattformen vår) i inntil 12
            måneder fra siste lagring, og slettes deretter automatisk. Vi sender deg en
            e-postpåminnelse cirka 30 dager før dette skjer. Logger du inn og lagrer på nytt før
            fristen, starter en ny 12-månedersperiode.
          </li>
          <li>
            -- Vil du bevare resultatet lenger enn 12 måneder uten å logge inn på nytt, må du laste
            det ned som PDF fra resultatsiden før fristen -- vi kan ikke gjenopprette et slettet
            resultat.
          </li>
          <li>
            -- Du kan også slette det lagrede resultatet manuelt når som helst, enten fra
            resultatsiden eller ved å logge inn på nytt og velge sletting der.
          </li>
          <li>
            -- Innloggingsøkten din holdes ved like med en informasjonskapsel (cookie) -- se eget
            avsnitt om cookies under.
          </li>
        </ul>
      </section>

      <section id="cookies" className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-ink dark:text-white">
          Informasjonskapsler (cookies)
        </h2>
        <p className="text-ink/80 dark:text-warmgray/80">
          FemFaktorer setter ingen sporings- eller annonsekapsler, og ingen forhåndsavkryssede
          samtykker eller skjulte avvisningsknapper brukes noe sted.
        </p>
        <ul className="flex flex-col gap-2 text-ink/80 dark:text-warmgray/80">
          <li>
            -- Én strengt nødvendig, funksjonell informasjonskapsel settes KUN dersom du selv
            aktivt logger inn for å lagre eller hente fram et resultat (se avsnittet over). Den
            brukes utelukkende til å holde deg innlogget, og forsvinner når du logger ut eller
            økten utløper (30 dager).
          </li>
          <li>
            -- Nettstedets adminpanel (kun for oss som drifter siden) bruker en tilsvarende
            innloggingskapsel. Den berører ikke deg som vanlig besøkende.
          </li>
          <li>
            -- Ingen analyseverktøy er aktivert per i dag. Hvis vi på sikt tar i bruk
            besøksstatistikk, blir det et informasjonskapselfritt verktøy (Plausible) som ikke
            samler personopplysninger og derfor ikke krever samtykkebanner.
          </li>
        </ul>
      </section>

      <section id="spir" className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-ink dark:text-white">
          Hvis du snakker med Spir (AI-veilederen)
        </h2>
        <p className="text-ink/80 dark:text-warmgray/80">
          Spir er valgfri, og ingenting sendes til AI-leverandøren automatisk. Du må aktivt
          samtykke, med tydelig informasjon, hver gang du starter en samtale.
        </p>
        <ul className="flex flex-col gap-2 text-ink/80 dark:text-warmgray/80">
          <li>
            -- Når du starter en samtale, sendes det beregnede resultatet ditt -- de fem
            hovedfaktorene og de om lag 29 underfasettene (ikke den valgfrie tilleggsseksjonen) --
            til AI-leverandøren Anthropic, sammen med det du selv skriver i samtalen.
          </li>
          <li>
            -- Ikke del andre personopplysninger i meldingene dine enn det som trengs for
            samtalen.
          </li>
          <li>
            -- AI-leverandør: Anthropic (Claude). Anthropics kommersielle API-vilkår innebærer at
            innhold som sendes inn og ut aldri brukes til å trene modeller, og at data slettes
            automatisk etter kort tid (per i dag 7 dager) hos Anthropic.
          </li>
          <li>
            -- Anthropic er et amerikansk selskap. Overføringen dekkes av EUs
            standardpersonvernbestemmelser (SCC), som er innbakt i Anthropics kommersielle vilkår.
          </li>
          <li>
            -- Svar fra Spir kan være feil eller for generelle. Spir er ikke en erstatning for
            profesjonell rådgivning, og ikke en akuttjeneste.
          </li>
        </ul>
      </section>

      <section id="tredjeparter" className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-ink dark:text-white">
          Hvem har tilgang til opplysningene dine
        </h2>
        <p className="text-ink/80 dark:text-warmgray/80">
          Disse tjenestene er involvert i driften av FemFaktorer og kan i ulik grad komme i
          kontakt med opplysninger om deg. For hver av dem er det oppgitt hva slags opplysninger
          det gjelder, og hvilket rettslig grunnlag (behandlingsgrunnlag) behandlingen bygger på:
        </p>
        <div className="flex flex-col gap-3">
          <article className="rounded-lg bg-mint/50 p-4 dark:bg-white/5">
            <h3 className="font-semibold text-ink dark:text-white">Netlify -- hosting og drift</h3>
            <p className="text-sm text-ink/80 dark:text-warmgray/80">
              Serverer selve nettsiden og kjører de tekniske funksjonene bak den (bl.a. innlogging
              og kontolagring, via tjenesten Netlify Blobs). Genererer vanlige tekniske
              serverlogger (IP-adresse, tidspunkt) som en del av normal drift og sikkerhet.
            </p>
            <p className="mt-2 text-sm text-ink/60 dark:text-warmgray/60">
              Grunnlag: berettiget interesse (drift og sikkerhet). Se{" "}
              <a
                href="https://www.netlify.com/privacy/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal underline underline-offset-2"
              >
                Netlifys personvernerklæring
              </a>{" "}
              og{" "}
              <a
                href="https://www.netlify.com/legal/subprocessors/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal underline underline-offset-2"
              >
                deres liste over underleverandører
              </a>
              .
            </p>
          </article>
          <article className="rounded-lg bg-mint/50 p-4 dark:bg-white/5">
            <h3 className="font-semibold text-ink dark:text-white">Resend -- e-postutsending</h3>
            <p className="text-sm text-ink/80 dark:text-warmgray/80">
              Sender engangskoden på e-post når du logger inn for å lagre eller hente fram et
              resultat. Ser e-postadressen din og selve koden, ikke testresultatet ditt.
            </p>
            <p className="mt-2 text-sm text-ink/60 dark:text-warmgray/60">
              Grunnlag: samtykke -- brukes kun når du selv aktivt ber om å lagre resultatet ditt.
              Resend er sertifisert under EU-US Data Privacy Framework. Se{" "}
              <a
                href="https://resend.com/security/gdpr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal underline underline-offset-2"
              >
                Resends GDPR-side
              </a>
              .
            </p>
          </article>
          <article className="rounded-lg bg-mint/50 p-4 dark:bg-white/5">
            <h3 className="font-semibold text-ink dark:text-white">
              Anthropic -- AI-leverandør for Spir
            </h3>
            <p className="text-sm text-ink/80 dark:text-warmgray/80">
              Behandler testresultatet ditt og dine egne meldinger, men KUN når du selv aktivt
              starter en samtale med Spir. Se eget avsnitt over.
            </p>
            <p className="mt-2 text-sm text-ink/60 dark:text-warmgray/60">
              Grunnlag: uttrykkelig samtykke, gitt før hver samtale starter -- siden dette dreier
              seg om personlighetsrelatert informasjon.
            </p>
          </article>
          <article className="rounded-lg bg-mint/50 p-4 dark:bg-white/5">
            <h3 className="font-semibold text-ink dark:text-white">
              GitHub -- kodelager (ingen persondata)
            </h3>
            <p className="text-sm text-ink/80 dark:text-warmgray/80">
              Brukes til å lagre og utvikle kildekoden til nettsiden. Testsvar, resultater eller
              andre personopplysninger om deg går aldri gjennom GitHub -- det er utelukkende et
              utviklingsverktøy, og listes her kun for full åpenhet, ikke fordi det behandler data
              om deg.
            </p>
          </article>
        </div>
      </section>

      <section id="overforing" className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-ink dark:text-white">
          Overføring utenfor EU/EØS
        </h2>
        <p className="text-ink/80 dark:text-warmgray/80">
          Anthropic er et amerikansk selskap, og opplysninger som sendes til Spir behandles derfor
          delvis utenfor EU/EØS. GDPR krever ikke at all databehandling skjer innenfor EU/EØS, men
          krever et gyldig overføringsgrunnlag -- her EUs standardpersonvernbestemmelser (SCC), som
          inngår i Anthropics kommersielle vilkår. Dette gjelder kun hvis du aktivt velger å bruke
          Spir.
        </p>
        <p className="text-ink/80 dark:text-warmgray/80">
          Resend er sertifisert under EU-US Data Privacy Framework, en egen godkjent
          overføringsmekanisme. For Netlify, se lenkene i avsnittet over for informasjon om hvor
          data behandles og hvilket overføringsgrunnlag som gjelder.
        </p>
      </section>

      <section id="lagringstid" className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-ink dark:text-white">
          Hvor lenge lagres opplysningene
        </h2>
        <ul className="flex flex-col gap-2 text-ink/80 dark:text-warmgray/80">
          <li>
            -- Testsvar og resultat lokalt i nettleseren din: til du sletter dem selv, eller tømmer
            nettleserdata for siden. Ingen automatisk utløpsdato.
          </li>
          <li>
            -- Lagret kontoresultat (Netlify Blobs): i inntil 12 måneder fra siste lagring, deretter
            automatisk sletting. Du varsles på e-post cirka 30 dager før dette skjer.
          </li>
          <li>
            -- Innhold sendt til Spir (Anthropic): slettes automatisk hos Anthropic etter kort tid
            (per i dag 7 dager), og brukes aldri til modelltrening.
          </li>
          <li>
            -- Innloggingsøkten din (cookie): utløper automatisk etter 30 dager, eller når du
            logger ut.
          </li>
        </ul>
      </section>

      <section id="aldersgrense" className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-ink dark:text-white">Aldersgrense</h2>
        <p className="text-ink/80 dark:text-warmgray/80">
          FemFaktorer er i denne versjonen ment for personer over 18 år. Før testen starter, må du
          selv bekrefte at du er over 18 -- en enkel, selvdeklarert bekreftelse, ikke en teknisk
          alderskontroll. Testen er ikke tilpasset mindreårige, verken språklig eller når det
          gjelder samtykke.
        </p>
      </section>

      <section id="rettigheter" className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-ink dark:text-white">Dine rettigheter</h2>
        <p className="text-ink/80 dark:text-warmgray/80">
          Fordi testsvarene dine som hovedregel bare lagres lokalt hos deg, utøver du i praksis
          retten til innsyn og sletting direkte i nettleseren din -- det finnes ingen kopi hos oss
          å be om innsyn i.
        </p>
        <p className="text-ink/80 dark:text-warmgray/80">
          For opplysninger som faktisk behandles av oss eller våre leverandører -- lagret
          kontoresultat, Spir-samtaler hos Anthropic, eller tekniske serverlogger hos Netlify --
          har du de vanlige rettighetene etter personvernregelverket: innsyn, retting, sletting og
          begrensning. Du kan også klage til Datatilsynet dersom du mener vi ikke behandler
          opplysningene dine på lovlig vis.
        </p>
        <p className="text-ink/80 dark:text-warmgray/80">
          Ønsker du en kopi av resultatet ditt å ta med deg (dataportabilitet), kan du laste det
          ned som PDF direkte fra resultatsiden.
        </p>
        <p className="text-ink/80 dark:text-warmgray/80">
          Datatilsynet:{" "}
          <a
            href="https://www.datatilsynet.no"
            target="_blank"
            rel="noopener noreferrer"
            className="text-teal underline underline-offset-2"
          >
            datatilsynet.no
          </a>
        </p>
      </section>

      <section id="status" className="flex flex-col gap-3 rounded-lg bg-mint/50 p-5 dark:bg-white/5">
        <h2 className="text-lg font-semibold text-ink dark:text-white">Status på denne siden</h2>
        <p className="text-ink/80 dark:text-warmgray/80">
          Denne siden beskriver FemFaktorer slik løsningen faktisk fungerer i dag. Innholdet er
          foreløpig ikke kvalitetssikret av jurist, og vil bli gjennomgått og oppdatert før en
          eventuell bredere, offentlig lansering. Vi oppdaterer siden fortløpende når nye tjenester
          eller funksjoner tas i bruk. En personvernkonsekvensvurdering (DPIA) og signering av
          databehandleravtaler med leverandørene over er planlagt gjennomført sammen med
          juristgjennomgangen, siden testresultater og tilleggsseksjonen regnes som særlig sensitiv
          informasjon.
        </p>
        <p className="text-sm text-ink/60 dark:text-warmgray/60">Sist oppdatert: 14.07.2026.</p>
      </section>

      <section id="kontakt" className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-ink dark:text-white">Kontakt</h2>
        <p className="text-ink/80 dark:text-warmgray/80">
          Spørsmål om personvern, eller ønsker om innsyn/sletting utover det du kan gjøre selv? Ta
          kontakt på{" "}
          <a href="mailto:jomik.guldager@gmail.com" className="text-teal underline underline-offset-2">
            jomik.guldager@gmail.com
          </a>
          .
        </p>
      </section>

      <Link href="/slik-fungerer" className="self-start text-sm text-teal underline underline-offset-2">
        &larr; Tilbake til Om FemFaktorer
      </Link>
    </main>
  );
}
