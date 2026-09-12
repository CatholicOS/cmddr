import { describe, it, expect, vi } from 'vitest';
import { toDocument } from '../src/harvest/toDocument.js';
import type { HarvestItem } from '../src/types.js';

const item = (over: Partial<HarvestItem>): HarvestItem => ({
  title: 'Rerum Novarum', incipit: 'Rerum Novarum', date: '1891-05-15', sourceGenreLabel: 'encyclicals',
  url: 'https://www.vatican.va/x.html', languages: ['IT'], shelf: 'encyclicals',
  pageSlug: 'leo-xiii', ...over,
});

describe('toDocument', () => {
  it('builds a minted papal record', () => {
    const d = toDocument(item({}), '2026-09-07');
    expect(d.id).toBe('mag:leo-xiii/rerum-novarum-1891');
    expect(d.issuerId).toBe('rp:leo-xiii');
    expect(d.issuerType).toBe('pope');
    expect(d.genre).toBe('encyclical');
    expect(d.idStatus).toBe('minted');
    expect(d.incipit).toBe('Rerum Novarum');
    expect(d.source!.retrieved).toBe('2026-09-07');
    // sourceGenreLabel is preserved even when genre is non-null (spec §4.1).
    expect(d.sourceGenreLabel).toBe('encyclicals');
  });

  it('reassigns conciliar documents to their council', () => {
    const d = toDocument(item({
      title: 'Pastor Aeternus', incipit: 'Pastor Aeternus', date: '1870-07-18',
      sourceGenreLabel: 'Constitutio dogmatica', shelf: null, pageSlug: 'pius-ix',
    }), '2026-09-07');
    expect(d.id).toBe('mag:vatican-i/pastor-aeternus-1870');
    expect(d.issuerId).toBe('oec:vatican-i');
    expect(d.issuerType).toBe('ecumenical-council');
    expect(d.promulgatedBy).toBe('rp:pius-ix');
    expect(d.genre).toBe('constitution');
    expect(d.descriptiveTitle).toBe('dogmatic');
  });

  it('maps an apostolic constitution to papal-bull with a characteristic', () => {
    const d = toDocument(item({
      title: 'Conditae a Christo', incipit: 'Conditae a Christo', date: '1900-12-08',
      sourceGenreLabel: 'apost_constitutions', shelf: 'apost_constitutions',
    }), '2026-09-07');
    expect(d.genre).toBe('papal-bull');
    expect(d.characteristics).toEqual(['apostolic-constitution']);
  });

  it('maps the motu_proprio shelf to apostolic-letter with the motu-proprio characteristic (#10)', () => {
    const d = toDocument(item({
      title: 'Summorum Pontificum', incipit: 'Summorum Pontificum', date: '2007-07-07',
      sourceGenreLabel: 'motu_proprio', shelf: 'motu_proprio', pageSlug: 'benedict-xvi',
    }), '2026-09-11');
    expect(d.genre).toBe('apostolic-letter');
    expect(d.characteristics).toEqual(['motu-proprio']);
    expect(d.sourceGenreLabel).toBe('motu_proprio');
    expect(d.id).toBe('mag:benedict-xvi/summorum-pontificum-2007');
  });

  it('adds the motu-proprio characteristic when the second shelf was motu_proprio (#10)', () => {
    // Socialium Scientiarum is filed on both apost_letters and motu_proprio; the merge keeps
    // apost_letters (SHELF_SPECIFICITY) and records the other filing only in alsoShelvedAs,
    // so the characteristic must be read from there or the motu proprio fact is lost.
    const d = toDocument(item({
      title: 'Socialium Scientiarum', incipit: 'Socialium Scientiarum', date: '1994-01-01',
      sourceGenreLabel: 'apost_letters', shelf: 'apost_letters', alsoShelvedAs: ['motu_proprio'],
      pageSlug: 'john-paul-ii',
    }), '2026-09-11');
    expect(d.genre).toBe('apostolic-letter');
    expect(d.characteristics).toEqual(['motu-proprio']);
    expect(d.source!.alsoShelvedAs).toEqual(['motu_proprio']);
  });

  it('does not add the characteristic for any other second shelf, and never duplicates it', () => {
    const plain = toDocument(item({
      title: 'Socialium Scientiarum', incipit: 'Socialium Scientiarum', date: '1994-01-01',
      sourceGenreLabel: 'apost_letters', shelf: 'apost_letters', alsoShelvedAs: ['letters'],
      pageSlug: 'john-paul-ii',
    }), '2026-09-11');
    expect(plain.characteristics).toBeUndefined();
    // The kept record is itself from motu_proprio and the dropped one was too (a pass-3
    // duplicate on one shelf): the characteristic appears once.
    const twice = toDocument(item({
      title: 'Summorum Pontificum', incipit: 'Summorum Pontificum', date: '2007-07-07',
      sourceGenreLabel: 'motu_proprio', shelf: 'motu_proprio', alsoShelvedAs: ['motu_proprio'],
      pageSlug: 'benedict-xvi',
    }), '2026-09-11');
    expect(twice.characteristics).toEqual(['motu-proprio']);
  });

  it('marks a circumscription-keyworded item as a governance act, derived from the keyword (#15)', () => {
    const d = toDocument(item({
      title: '"Spei accensa lucerna". Il Santo Padre ha eretto la nuova Diocesi di Caazapá (Paraguay)',
      incipit: 'Spei accensa lucerna', date: '2025-03-22',
      sourceGenreLabel: 'apost_constitutions', shelf: 'apost_constitutions', pageSlug: 'francesco',
    }), '2026-09-07');
    expect(d.keywords).toEqual(['circumscription-erection']);
    expect(d.actKind).toBe('governance');
  });

  it('gives a plain item no actKind at all: absent means teaching', () => {
    const d = toDocument(item({}), '2026-09-07');
    expect(d.keywords).toBeUndefined();
    expect('actKind' in d).toBe(false);
  });

  describe('medium, read from the heading\'s own word (#27)', () => {
    it('gives a plain item no medium at all: absent means the ordinary text', () => {
      const d = toDocument(item({}), '2026-09-12');
      expect('medium' in d).toBe(false);
    });

    it('reads a Radiomessaggio as radio, keeping its genre and actKind', () => {
      // Easter Sunday 1960 on John XXIII's urbi_et_orbi shelf: a feast-day Urbi et Orbi
      // delivered by radio. The medium describes delivery, not the act.
      const d = toDocument(item({
        title: 'Radiomessaggio nella Solennità di Pasqua,', incipit: null, date: '1960-04-17',
        sourceGenreLabel: 'messages/urbi_et_orbi', shelf: 'messages/urbi_et_orbi', pageSlug: 'john-xxiii',
      }), '2026-09-12');
      expect(d.id).toBe('mag:john-xxiii/urbi-et-orbi-easter-1960');
      expect(d.genre).toBe('urbi-et-orbi');
      expect(d.actKind).toBe('liturgical');
      expect(d.series).toEqual({ id: 'urbi-et-orbi-easter', year: 1960 });
      expect(d.medium).toBe('radio');
    });

    it('reads an excluded radio message on the same shelf as radio too', () => {
      const d = toDocument(item({
        title: 'Radiomessaggio ai fedeli e ai popoli del mondo intero, 22 dicembre 1960', incipit: null,
        date: '1960-12-22', sourceGenreLabel: 'messages/urbi_et_orbi', shelf: 'messages/urbi_et_orbi',
        pageSlug: 'john-xxiii',
      }), '2026-09-12');
      expect(d.id).toBe('mag:john-xxiii/message-1960-12-22');
      expect(d.genre).toBe('message');
      expect(d.actKind).toBeUndefined();
      expect(d.medium).toBe('radio');
    });

    it('reads a Videomessaggio as video, wherever in the title the word stands', () => {
      const d = toDocument(item({
        title: 'Videomessaggio di Papa Leone XIV per la Giornata Missionaria Mondiale 2025', incipit: null,
        date: '2025-10-13', sourceGenreLabel: 'messages/mission', shelf: 'messages/mission', pageSlug: 'leo-xiv',
      }), '2026-09-12');
      expect(d.id).toBe('mag:leo-xiv/world-mission-day-2025');
      expect(d.medium).toBe('video');
      const mid = toDocument(item({ title: 'Inizio della Quaresima, Radiomessaggio di Giovanni XXIII, 27 febbraio 1963' }), '2026-09-12');
      expect(mid.medium).toBe('radio');
    });

    it('reads the compound noun case-insensitively, but never the bare word', () => {
      expect(toDocument(item({ title: 'RADIOMESSAGGIO ai fedeli' }), '2026-09-12').medium).toBe('radio');
      expect(toDocument(item({ title: 'videomessaggio ai giovani' }), '2026-09-12').medium).toBe('video');
      // A commission for cinema, radio and television is a topic, not a delivery medium
      // (Boni Pastoris, 1959); so are videocassettes (Communications Day 1993).
      for (const title of [
        'Lettera Apostolica «Motu proprio» Boni Pastoris che erige la Pontificia Commissione per la Cinematografia, la Radio e la Televisione',
        'XXVII Giornata Mondiale delle Comunicazioni Sociali, 1993 -Videocassette e audiocassette nella formazione della cultura',
        'La stampa, la radiotelevisione e il cinema per il progresso dei popoli',
      ]) {
        expect('medium' in toDocument(item({ title }), '2026-09-12'), title).toBe(false);
      }
    });

    it('refuses a heading that names both media rather than choosing one', () => {
      expect(() => toDocument(item({ title: 'Radiomessaggio e videomessaggio' }), '2026-09-12'))
        .toThrow(/both a radio and a video/);
    });
  });

  it('keeps an unmapped genre null and preserves the raw label', () => {
    const d = toDocument(item({
      title: 'La Serie', incipit: 'La Serie', date: '1849-02-14', sourceGenreLabel: 'Protesta',
      shelf: null, pageSlug: 'pius-ix',
    }), '2026-09-07');
    expect(d.genre).toBeNull();
    expect(d.sourceGenreLabel).toBe('Protesta');
    expect(d.id).toBe('mag:pius-ix/la-serie-1849');
  });

  it('keeps the id slug round-trippable from the incipit', () => {
    const d = toDocument(item({
      title: "Dall'alto dell'Apostolico Seggio", incipit: "Dall'alto dell'Apostolico Seggio", date: '1890-10-15',
    }), '2026-09-07');
    expect(d.id).toBe('mag:leo-xiii/dall-alto-dell-apostolico-seggio-1890');
  });

  it('throws on an unknown pope slug rather than guessing', () => {
    // 'francesco' (Francis, Task 18) is now a real, mapped pope slug -- a genuinely
    // unmapped one is needed to exercise this guard.
    expect(() => toDocument(item({ pageSlug: 'nonexistent-pope' }), '2026-09-07'))
      .toThrow(/nonexistent-pope/);
  });

  const conciliarItem = (over: Partial<HarvestItem>): HarvestItem => item({
    title: 'Lumen Gentium', incipit: 'Lumen Gentium', date: '1964-11-21',
    sourceGenreLabel: 'Costituzione dogmatica', shelf: null,
    pageSlug: 'ii_vatican_council', url: 'https://www.vatican.va/x.html', ...over,
  });

  it('builds a Vatican II constitution', () => {
    const d = toDocument(conciliarItem({}), '2026-09-08');
    expect(d.id).toBe('mag:vatican-ii/lumen-gentium-1964');
    expect(d.issuerId).toBe('oec:vatican-ii');
    expect(d.issuerType).toBe('ecumenical-council');
    expect(d.genre).toBe('constitution');
    expect(d.descriptiveTitle).toBe('dogmatic');
    expect(d.idStatus).toBe('minted');
    expect(d.sourceGenreLabel).toBe('Costituzione dogmatica');
  });

  it('records Paul VI as the promulgator of every Vatican II document', () => {
    expect(toDocument(conciliarItem({}), '2026-09-08').promulgatedBy).toBe('rp:paul-vi');
    expect(toDocument(conciliarItem({
      title: 'Inter Mirifica', incipit: 'Inter Mirifica', date: '1963-12-04',
      sourceGenreLabel: 'Decreto',
    }), '2026-09-08').promulgatedBy).toBe('rp:paul-vi');
  });

  it('maps a conciliar decree to the decree genre', () => {
    const d = toDocument(conciliarItem({
      title: 'Ad Gentes', incipit: 'Ad Gentes', date: '1965-12-07',
      sourceGenreLabel: 'Decreto',
    }), '2026-09-08');
    expect(d.id).toBe('mag:vatican-ii/ad-gentes-1965');
    expect(d.genre).toBe('decree');
    expect(d.descriptiveTitle).toBeUndefined();
  });

  it('maps a conciliar declaration to the declaration genre', () => {
    const d = toDocument(conciliarItem({
      title: 'Nostra Aetate', incipit: 'Nostra Aetate', date: '1965-10-28',
      sourceGenreLabel: 'Dichiarazione',
    }), '2026-09-08');
    expect(d.genre).toBe('declaration');
  });

  it('gives an unqualified conciliar constitution no descriptiveTitle', () => {
    const d = toDocument(conciliarItem({
      title: 'Sacrosanctum Concilium', incipit: 'Sacrosanctum Concilium',
      date: '1963-12-04', sourceGenreLabel: 'Costituzione',
    }), '2026-09-08');
    expect(d.genre).toBe('constitution');
    expect(d.descriptiveTitle).toBeUndefined();
  });

  it('leaves a papal decreto mapped to no genre', () => {
    // Pius IX's flat page prints papal decrees, for which the Genre Registry has no
    // row. 'decree' is issuerTypes: ['ecumenical-council'], so mapping this to it
    // would fail invariant 17.
    const d = toDocument(item({
      title: 'Quod aliquantulum', incipit: 'Quod aliquantulum', date: '1847-03-01',
      sourceGenreLabel: 'Decreto', shelf: null, pageSlug: 'pius-ix',
    }), '2026-09-08');
    expect(d.issuerType).toBe('pope');
    expect(d.genre).toBeNull();
    expect(d.sourceGenreLabel).toBe('Decreto');
  });

  it('keeps Vatican I on its reassignment route, promulgated by Pius IX', () => {
    const d = toDocument(item({
      title: 'Dei Filius', incipit: 'Dei Filius', date: '1870-04-24',
      sourceGenreLabel: 'Costituzione dogmatica', shelf: null, pageSlug: 'pius-ix',
    }), '2026-09-08');
    expect(d.id).toBe('mag:vatican-i/dei-filius-1870');
    expect(d.promulgatedBy).toBe('rp:pius-ix');
    expect(d.descriptiveTitle).toBe('dogmatic');
  });
});

// The brief's own draft of these two describe blocks used pageSlug 'pius-xii'/'pius-xi',
// which are not (yet) in VATICAN_SLUG_TO_ISSUER -- only benedict-xiv, pius-ix, leo-xiii
// and pius-x are harvested as of this task -- so toDocument would throw before reaching
// the code under test. Rewritten against 'pius-x', which is already mapped, keeping the
// same shapes and intent.
describe('toDocument on a heading with no recoverable incipit', () => {
  const heading: HarvestItem = {
    title: 'Lettera Apostolica (breve) che proclama Santa Chiara Patrona Celeste della Televisione',
    incipit: null,
    date: '1958-02-14', sourceGenreLabel: 'apost_letters', url: null,
    languages: ['IT'], shelf: 'apost_letters', pageSlug: 'pius-x',
  };

  it('mints a provisional id from the genre and the full date', () => {
    const d = toDocument(heading, '2026-09-07');
    expect(d.idStatus).toBe('provisional');
    expect(d.id).toBe('mag:pius-x/apostolic-letter-1958-02-14');
  });

  it('keeps the full heading as the title and omits the incipit entirely', () => {
    const d = toDocument(heading, '2026-09-07');
    expect(d.title).toBe(heading.title);
    expect('incipit' in d).toBe(false);
  });

  it('falls back to the source label when the genre is unmapped', () => {
    const d = toDocument({ ...heading, sourceGenreLabel: 'Proclama' }, '2026-09-07');
    expect(d.id).toBe('mag:pius-x/proclama-1958-02-14');
  });

  it('mints a motu_proprio-shelf provisional id under apostolic-letter (#10)', () => {
    // The provisional id follows the genre, so demoting motu proprio to a characteristic
    // re-mints these ids; provisional ids are re-mintable by design (spec §3.5).
    const d = toDocument({ ...heading, sourceGenreLabel: 'motu_proprio', shelf: 'motu_proprio' }, '2026-09-07');
    expect(d.id).toBe('mag:pius-x/apostolic-letter-1958-02-14');
    expect(d.characteristics).toEqual(['motu-proprio']);
  });
});

describe('toDocument on a heading with an incipit', () => {
  it('still mints from the incipit and records the title separately', () => {
    const d = toDocument({
      title: 'Mirabilis Deus, col quale il Pontefice attribuisce a Don Giovanni Bosco',
      incipit: 'Mirabilis Deus',
      date: '1934-04-01', sourceGenreLabel: 'briefs', url: null,
      languages: ['IT'], shelf: 'briefs', pageSlug: 'pius-x',
    }, '2026-09-07');
    expect(d.idStatus).toBe('minted');
    expect(d.id).toBe('mag:pius-x/mirabilis-deus-1934');
    expect(d.incipit).toBe('Mirabilis Deus');
    expect(d.title).toBe('Mirabilis Deus, col quale il Pontefice attribuisce a Don Giovanni Bosco');
  });
});

describe('toDocument on the Messaggi series shelves (messages spec §5.2)', () => {
  const msg = (over: Partial<HarvestItem>): HarvestItem => ({
    title: 'LVIII Giornata Mondiale della Pace 2025 - “Rimetti a noi i nostri debiti, concedici la tua pace”',
    incipit: null, date: '2024-12-08', sourceGenreLabel: 'messages/peace',
    url: 'https://www.vatican.va/content/francesco/it/messages/peace/documents/20241208-messaggio-58giornatamondiale-pace2025.html',
    languages: ['IT'], shelf: 'messages/peace', pageSlug: 'francesco', ...over,
  });

  it('mints a Peace message by occasion: series id, year and ordinal from the title, id from those', () => {
    const d = toDocument(msg({}), '2026-09-12');
    expect(d.id).toBe('mag:francis-i/world-day-of-peace-2025');
    expect(d.idStatus).toBe('minted');
    expect(d.genre).toBe('message');
    expect(d.series).toEqual({ id: 'world-day-of-peace', year: 2025, ordinal: 58 });
    // The signing date stays what it is: the year in the id is the occasion's, not date's.
    expect(d.date).toBe('2024-12-08');
    expect('incipit' in d).toBe(false);
    expect('actKind' in d).toBe(false);
    expect(d.characteristics).toBeUndefined();
    expect(d.sourceGenreLabel).toBe('messages/peace');
    expect(d.source!.shelf).toBe('messages/peace');
  });

  it('gives a Lent message no ordinal, since the title prints none', () => {
    const d = toDocument(msg({
      title: 'Quaresima 2015: Rinfrancate i vostri cuori (Gc 5,8)', date: '2014-10-04',
      sourceGenreLabel: 'messages/lent', shelf: 'messages/lent',
    }), '2026-09-12');
    expect(d.id).toBe('mag:francis-i/lent-2015');
    expect(d.series).toEqual({ id: 'lent', year: 2015 });
  });

  it('reads an Arabic ordinal with its suffix', () => {
    const d = toDocument(msg({
      title: 'Messaggio per la 110ª Giornata Mondiale del Migrante e del Rifugiato 2024', date: '2024-05-24',
      sourceGenreLabel: 'messages/migration', shelf: 'messages/migration',
    }), '2026-09-12');
    expect(d.series).toEqual({ id: 'world-day-of-migrants-and-refugees', year: 2024, ordinal: 110 });
  });

  it("resolves Leo XIV's renamed mission shelf to the same series as Francis's missions shelf", () => {
    const leo = toDocument(msg({
      title: 'Videomessaggio di Papa Leone XIV per la Giornata Missionaria Mondiale 2025', date: '2025-10-13',
      sourceGenreLabel: 'messages/mission', shelf: 'messages/mission', pageSlug: 'leo-xiv',
    }), '2026-09-12');
    const francis = toDocument(msg({
      title: 'Messaggio per la Giornata Missionaria Mondiale 2025', date: '2025-01-25',
      sourceGenreLabel: 'messages/missions', shelf: 'messages/missions',
    }), '2026-09-12');
    expect(leo.series!.id).toBe('world-mission-day');
    expect(francis.series!.id).toBe('world-mission-day');
    expect(leo.id).toBe('mag:leo-xiv/world-mission-day-2025');
    expect(francis.id).toBe('mag:francis-i/world-mission-day-2025');
    expect(leo.sourceGenreLabel).toBe('messages/mission');
  });

  it('fails, naming the item, when the title prints no occasion year and no curated row supplies one', () => {
    expect(() => toDocument(msg({
      title: 'Messaggio per la Giornata Mondiale del Turismo', date: '1999-09-27',
      sourceGenreLabel: 'messages/tourism', shelf: 'messages/tourism', pageSlug: 'john-paul-ii',
    }), '2026-09-12')).toThrow(/No occasion year for 'Messaggio per la Giornata Mondiale del Turismo'/);
  });

  it('fails likewise when the title prints two different years', () => {
    expect(() => toDocument(msg({
      title: 'XXXIX Giornata Mondiale della Gioventù, 2024-2025', date: '2024-08-29',
      sourceGenreLabel: 'messages/youth', shelf: 'messages/youth',
    }), '2026-09-12')).toThrow(/more than one year \(2024, 2025\)/);
  });

  it('takes a curated occasion year and ordinal where the table has a row', () => {
    const d = toDocument(msg({
      title: 'XXXIIII Giornata Mondiale del Malato, 2025', date: '2025-01-14',
      sourceGenreLabel: 'messages/sick', shelf: 'messages/sick',
    }), '2026-09-12');
    expect(d.series).toEqual({ id: 'world-day-of-the-sick', year: 2025, ordinal: 33 });
    const t = toDocument(msg({
      title: 'Messaggio per la Giornata Mondiale del Turismo', date: '2004-05-30',
      sourceGenreLabel: 'messages/tourism', shelf: 'messages/tourism', pageSlug: 'john-paul-ii',
    }), '2026-09-12');
    expect(t.series).toEqual({ id: 'world-tourism-day', year: 2004 });
  });

  it('records an unreadable ordinal as absent, with a warning, when no curated row exists', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      const d = toDocument(msg({ title: 'XXXX Giornata Mondiale della Pace 2007' }), '2026-09-12');
      expect(d.series).toEqual({ id: 'world-day-of-peace', year: 2007 });
      expect(warnSpy.mock.calls.some(([m]) => String(m).includes("Unreadable ordinal 'XXXX'"))).toBe(true);
    } finally {
      warnSpy.mockRestore();
    }
  });

  it('excludes a curated non-member of the series: genre message, no series, provisional id', () => {
    const d = toDocument(msg({
      title: 'Giornata Mondiale del Malato - 1975', date: '1975-09-16', pageSlug: 'paul-vi',
      sourceGenreLabel: 'messages/sick', shelf: 'messages/sick',
      url: 'https://www.vatican.va/content/paul-vi/it/messages/sick/documents/hf_p-vi_mes_19750916_world-day-of-the-sick-1975.html',
    }), '2026-09-12');
    expect(d.id).toBe('mag:paul-vi/message-1975-09-16');
    expect(d.idStatus).toBe('provisional');
    expect(d.genre).toBe('message');
    expect(d.series).toBeUndefined();
    expect(d.sourceGenreLabel).toBe('messages/sick');
  });

  it('files a homily given on the day as a homily in the series: membership, not genre, triggers the id rule', () => {
    const d = toDocument(msg({
      title: 'XXIX Giornata Mondiale della Vita Consacrata - Festa della Presentazione del Signore', date: '2025-02-01',
      sourceGenreLabel: 'messages/consecrated_life', shelf: 'messages/consecrated_life',
      url: 'https://www.vatican.va/content/francesco/it/messages/consecrated_life/documents/20250201-omelia-presentazione-del-signore.html',
    }), '2026-09-12');
    expect(d.genre).toBe('homily');
    expect(d.id).toBe('mag:francis-i/world-day-for-consecrated-life-2025');
    expect(d.series).toEqual({ id: 'world-day-for-consecrated-life', year: 2025, ordinal: 29 });
    expect(d.sourceGenreLabel).toBe('messages/consecrated_life');
  });

  it('throws for a messages sub-shelf no series row claims', () => {
    expect(() => toDocument(msg({ sourceGenreLabel: 'messages/travels', shelf: 'messages/travels' }), '2026-09-12'))
      .toThrow(/claimed by no row/);
  });
});

describe('toDocument on the Urbi et Orbi shelf (messages spec §2.4, §3.2.7)', () => {
  const urbi = (over: Partial<HarvestItem>): HarvestItem => ({
    title: '"Urbi et Orbi" - Natale 2024', incipit: null, date: '2024-12-25',
    sourceGenreLabel: 'messages/urbi', url: 'https://www.vatican.va/x.html', languages: ['IT'],
    shelf: 'messages/urbi', pageSlug: 'francesco', ...over,
  });

  it('files a 25 December item in the Christmas series, minted and liturgical', () => {
    const d = toDocument(urbi({}), '2026-09-12');
    expect(d.id).toBe('mag:francis-i/urbi-et-orbi-christmas-2024');
    expect(d.idStatus).toBe('minted');
    expect(d.genre).toBe('urbi-et-orbi');
    expect(d.actKind).toBe('liturgical');
    expect(d.series).toEqual({ id: 'urbi-et-orbi-christmas', year: 2024 });
    expect('incipit' in d).toBe(false);
  });

  it('files an Easter Sunday item in the Easter series by the computus, whatever the title says', () => {
    const d = toDocument(urbi({ title: 'Messaggio Urbi et Orbi - 1975', date: '2005-03-27', pageSlug: 'john-paul-ii' }), '2026-09-12');
    expect(d.id).toBe('mag:john-paul-ii/urbi-et-orbi-easter-2005');
    expect(d.series).toEqual({ id: 'urbi-et-orbi-easter', year: 2005 });
    expect(d.actKind).toBe('liturgical');
  });

  it('gives any other date no series and a provisional id, still liturgical', () => {
    const d = toDocument(urbi({
      title: '"Urbi et Orbi" - Momento straordinario di preghiera presieduto dal Santo Padre', date: '2020-03-27',
    }), '2026-09-12');
    expect(d.id).toBe('mag:francis-i/urbi-et-orbi-2020-03-27');
    expect(d.idStatus).toBe('provisional');
    expect(d.genre).toBe('urbi-et-orbi');
    expect(d.series).toBeUndefined();
    expect(d.actKind).toBe('liturgical');
  });

  it('lets a curated row name the occasion where the act bears another date (SERIES_URBI_OCCASIONS)', () => {
    // John XXIII's 'Santo Natale (25 dicembre 1962)' is the radio message of Saturday 22
    // December; the shelf holds no 25 December item for 1962, so it is the Christmas 1962 entry.
    const d = toDocument(urbi({
      title: 'Santo Natale', date: '1962-12-22', pageSlug: 'john-xxiii',
      sourceGenreLabel: 'messages/urbi_et_orbi', shelf: 'messages/urbi_et_orbi',
    }), '2026-09-12');
    expect(d.id).toBe('mag:john-xxiii/urbi-et-orbi-christmas-1962');
    expect(d.idStatus).toBe('minted');
    expect(d.date).toBe('1962-12-22');
    expect(d.series).toEqual({ id: 'urbi-et-orbi-christmas', year: 1962 });
    expect(d.actKind).toBe('liturgical');
  });

  it('files an excluded item on the urbi shelf as a message, not a blessing (SERIES_EXCLUSIONS)', () => {
    const d = toDocument(urbi({
      title: 'Radiomessaggio ai fedeli e ai popoli del mondo intero, 22 dicembre 1960', date: '1960-12-22',
      pageSlug: 'john-xxiii', sourceGenreLabel: 'messages/urbi_et_orbi', shelf: 'messages/urbi_et_orbi',
    }), '2026-09-12');
    expect(d.id).toBe('mag:john-xxiii/message-1960-12-22');
    expect(d.idStatus).toBe('provisional');
    expect(d.genre).toBe('message');
    expect(d.series).toBeUndefined();
    expect(d.actKind).toBeUndefined();
    expect(d.sourceGenreLabel).toBe('messages/urbi_et_orbi');
  });

  it('reads the urbi_et_orbi spelling of the older pages the same way', () => {
    const d = toDocument(urbi({
      title: 'Urbi et Orbi - Pasqua 1978', date: '1978-03-26', pageSlug: 'paul-vi',
      sourceGenreLabel: 'messages/urbi_et_orbi', shelf: 'messages/urbi_et_orbi',
    }), '2026-09-12');
    expect(d.id).toBe('mag:paul-vi/urbi-et-orbi-easter-1978');
    expect(d.sourceGenreLabel).toBe('messages/urbi_et_orbi');
  });
});
