/** Feste Praxisdaten – Quelle: CMS-Seiten Kontakt, Impressum, Vita (content/site.json) */
export const PRAXIS = {
  name: "Zahnarztpraxis Ali Özdemir MSc",
  short: "Özdemir",
  street: "Kunzendorfer Straße 6",
  city: "31224 Peine-Essinghausen",
  phone: "05171 / 581 320",
  phoneHref: "tel:+495171581320",
  fax: "05171 / 581 322",
  email: "anmeldung@oezdemir-die-praxis.de",
  emailInfo: "info@oezdemir-die-praxis.de",
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=Zahnarzt+Ali+%C3%96zdemir+Kunzendorfer+Str.+6+31224+Peine",
  mapsEmbed:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2438.148984914827!2d10.258705951812608!3d52.3314432578385!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47affe8873797f73%3A0x7b48da5dd3eabc44!2sAli+%C3%96zdemir!5e0!3m2!1sde!2sde!4v1448535543120",
  zweitpraxis: {
    title: "Privatpraxis für mikroskopische Endodontie",
    sub: "Überweiserpraxis",
    street: "Campestraße 7",
    city: "38102 Braunschweig",
    phone: "0531 / 237 680 41",
    phoneHref: "tel:+4953123768041",
  },
} as const;

/** Sprechzeiten, Wochentag 1 = Montag (Date.getDay()) */
export const HOURS: { day: number; label: string; slots: [string, string][] }[] = [
  { day: 1, label: "Montag", slots: [["08:00", "17:00"]] },
  { day: 2, label: "Dienstag", slots: [["08:00", "13:00"], ["15:00", "19:00"]] },
  { day: 3, label: "Mittwoch", slots: [["08:00", "13:00"]] },
  { day: 4, label: "Donnerstag", slots: [["08:00", "13:00"], ["15:00", "19:00"]] },
  { day: 5, label: "Freitag", slots: [["08:00", "13:00"]] },
];

/** Leistungen: Bildauswahl + Kurztext fuer Karten (Texte aus den CMS-Seiten) */
export const SERVICES: Record<string, { image: string; teaser: string; icon: string }> = {
  "/leistungen/wurzelkanalbehandlung": {
    image: "/files/startseite/Teaser_LHA0317.jpg",
    teaser:
      "Mikroskopische Endodontie mit Kofferdam, Nickel-Titan-Feilen und thermoplastischer Fülltechnik – damit Ihr eigener Zahn bleibt.",
    icon: "root",
  },
  "/leistungen/konzeptioneller-zahnersatz": {
    image: "/files/startseite/_LHA04521.jpg",
    teaser: "Kronen, Teilkronen, Brücken und Prothetik – geplant als Gesamtkonzept für Funktion und Ästhetik.",
    icon: "crown",
  },
  "/leistungen/prophylaxe": {
    image: "/files/startseite/_LHA0277.jpg",
    teaser: "Professionelle Zahnreinigung für Kinder und Erwachsene – die Grundlage gesunder Zähne.",
    icon: "sparkle",
  },
  "/leistungen/parodontose": {
    image: "/files/header/_LHA0374.jpg",
    teaser: "Entzündungen des Zahnhalteapparats früh erkennen und gezielt behandeln, bevor Zähne verloren gehen.",
    icon: "gum",
  },
  "/leistungen/bleaching": {
    image: "/files/header/_LHA0355.jpg",
    teaser: "Schonende Zahnaufhellung für ein natürlich strahlendes Lächeln.",
    icon: "sun",
  },
  "/leistungen/fuellung": {
    image: "/files/header/_LHA0350.jpg",
    teaser: "Zahnfarbene, dentinadhäsive Mehrschichtfüllungen in nahezu Inlay-Qualität.",
    icon: "layers",
  },
  "/leistungen/implantate": {
    image: "/files/header/_LHA0410.jpg",
    teaser: "Wenn ein Zahn nicht zu retten ist: die ästhetische Alternative für festen Halt.",
    icon: "implant",
  },
};

/** Qualifikationen (Vita) – fuer Trust-Leiste */
export const CREDENTIALS = [
  "MSc Endodontie · Donau-Universität Krems",
  "Zertifikat University of Pennsylvania",
  "Microendodontics & Endodontic Microsurgery",
  "Gastvorträge an der University of Pennsylvania",
  "Eigene Praxis in Peine seit 2001",
  "Überweiserpraxis für Endodontie seit 2010",
];
