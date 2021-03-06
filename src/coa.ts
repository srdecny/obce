import axios from "axios";

/**
 * Extract just the page URL from a Wikipedia Open Search API response object
 *
 * For a sample of the API response see [here](https://cs.wikipedia.org/w/api.php?action=opensearch&search=Trutnov&limit=1&namespace=0&format=jsonfm).
 */
export function extractURLFromWikiAPIResponse(json: any): string | null {
  return Array.isArray(json) ? json[json.length - 1][0] : null;
}

/**
 * Build an HTTP request for the Wikipedia Open Search API
 *
 * When resolved, the promise returns the parsed JSON response.
 */
export async function buildOpenSearchRequest(query: string): Promise<any> {
  const response = await axios.get("https://cs.wikipedia.org/w/api.php", {
    params: {
      action: "opensearch",
      search: query,
      limit: 1,
      namespace: 0,
      format: "json"
    }
  });
  return response.data;
}

/**
 * Find all references to known coat-of-arms files in a string
 *
 * Returns an array of the full coat-of-arms URLs found mentioned in the input string.
 */
export function matchCOAList(content: string): string[] {
  var matches: string[] = [];
  for (const candidate of COA_LIST) {
    const basename = normalizeCOARecord(candidate);
    const matchIndex = content.indexOf(basename);
    if (matchIndex != -1) {
      matches.push(candidate);
    }
  }
  return matches;
}

/** Turn a full coat-of-arms image URL into just the file name */
export function normalizeCOARecord(record: string): string {
  const start = record.lastIndexOf(":");
  return start != -1 ? record.substr(start + 1) : "";
}

/** Guess Wikipedia page URL for a given municipality */
export async function guessMunicipalityWikiPage(
  municipalityName: string
): Promise<string | null> {
  return buildOpenSearchRequest(municipalityName).then(
    extractURLFromWikiAPIResponse
  );
}

/**
 * Guess a URL to the coat of arms of a given municipality
 *
 * The basic idea is that we guess the Wikipedia page for the municipality,
 * then download the page and search its source for known coat-of-arms file
 * names. Yes, it’s a hack – can we improve it?
 */
export async function guessMunicipalityCOA(
  municipalityName: string
): Promise<string | null> {
  const pageURL = await guessMunicipalityWikiPage(municipalityName);
  if (pageURL != null) {
    const response = await axios.get(pageURL);
    const matchedCOAs = matchCOAList(response.data);
    return matchedCOAs[0];
  } else {
    return null;
  }
}

/**
 * A static list of some of the coats of arms available on Wikimedia Commons.
 *
 * This is dumb, we should be able to get this list dynamically. Also, these
 * are only the SVG coats of arms we could find, which means we are missing many
 * more available as PNG or JPG.
 */
const COA_LIST = `
https://commons.wikimedia.org/wiki/File:%C4%8C%C3%AD%C5%BEkovice_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:%C4%8Celadn%C3%A1_CoA.svg
https://commons.wikimedia.org/wiki/File:%C4%8Cern%C3%BD_D%C5%AFl_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:%C4%8Cern%C4%9Bves_CoA.svg
https://commons.wikimedia.org/wiki/File:%C4%8Cernava_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:%C4%8Cesk%C3%A1_L%C3%ADpa_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:%C4%8Cesk%C3%BD_Dub_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:%C5%98%C3%AD%C4%8Dky_v_Orlick%C3%BDch_hor%C3%A1ch_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:%C5%A0%C5%A5%C3%A1hlavy_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:%C5%A0t%C4%9Bp%C3%A1nov_nad_Svratkou_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:%C5%BDamberk_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:%C5%BDelezn%C3%A1_Ruda_CoA.svg
https://commons.wikimedia.org/wiki/File:%C5%BDermanice_CoA.svg
https://commons.wikimedia.org/wiki/File:%C5%BDerot%C3%ADn_CoA_LN_CZ.svg
https://commons.wikimedia.org/wiki/File:%C5%BDerot%C3%ADn_CoA_OL_CZ.svg
https://commons.wikimedia.org/wiki/File:Abertamy_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Adamov_Blansko_CoA.svg
https://commons.wikimedia.org/wiki/File:Albrechtice_(Usti_nad_Orlici)_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:B%C3%ADl%C3%A1_CoA.svg
https://commons.wikimedia.org/wiki/File:B%C4%9Bl%C3%A1_nad_Svitavou_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:B%C4%9Bl%C3%A1_u_Jev%C3%AD%C4%8Dka_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:B%C5%99ezejc_CoA.svg
https://commons.wikimedia.org/wiki/File:B%C5%99ezina_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:B%C5%99ezn%C3%ADk_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:B%C5%99ezov%C3%A1_nad_Svitavou_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Ba%C5%A1ka_(FM)_CoA.svg
https://commons.wikimedia.org/wiki/File:Ban%C3%ADn_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Barto%C5%A1ovice_v_Orlick%C3%BDch_hor%C3%A1ch_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Batnovice_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Bedrichov_(Jablonec_nad_Nisou)_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Ben%C3%A1tky_(SV)_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Bene%C5%A1ov_u_Semil_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Benecko_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Benetice_TR_CoA.svg
https://commons.wikimedia.org/wiki/File:Bernartice_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Bila_Lhota_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Blansko_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Blatnice_CoA.svg
https://commons.wikimedia.org/wiki/File:Blatnicka_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Bocanovice_CoA.svg
https://commons.wikimedia.org/wiki/File:Bohumin_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Bojkovice_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Borotin_BK_CZ_CoA.svg
https://commons.wikimedia.org/wiki/File:Borovnice_CoA.svg
https://commons.wikimedia.org/wiki/File:Borovnice_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Boskovice_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Brezova_SO_CZ_CoA.svg
https://commons.wikimedia.org/wiki/File:Brn%C4%9Bnec_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Brnany_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Brniste_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Brozany_nad_Ohri_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Bru%C5%A1perk_CoA.svg
https://commons.wikimedia.org/wiki/File:Bruzovice_CoA.svg
https://commons.wikimedia.org/wiki/File:Bublava_CoA.svg
https://commons.wikimedia.org/wiki/File:Budi%C5%A1ov_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Budislav_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Bukovany_Sokolov_CoA.svg
https://commons.wikimedia.org/wiki/File:Bukovec_CoA.svg
https://commons.wikimedia.org/wiki/File:Bulovka_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Byst%C5%99ice_(FM)_CoA.svg
https://commons.wikimedia.org/wiki/File:Cerekvice_nad_Lou%C4%8Dnou_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Cernousy_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Cerveny_Kostelec_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Ceska_Skalice_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Chlum_Svate_Mari_CZ_CoA.svg
https://commons.wikimedia.org/wiki/File:Chlum_u_Trebone_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Chodov_DO_CZ_CoA.svg
https://commons.wikimedia.org/wiki/File:Chot%C4%9Bnov_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Chotovice_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Chrastava_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Chrastavec_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Chrudim_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Cihost_CZ_CoA.svg
https://commons.wikimedia.org/wiki/File:CoA-Kom%C5%88a.svg
https://commons.wikimedia.org/wiki/File:CoA_%C5%A0arovy.svg
https://commons.wikimedia.org/wiki/File:CoA_%C5%BDelechovice_nad_D%C5%99evnic%C3%AD.svg
https://commons.wikimedia.org/wiki/File:CoA_D%C4%9Bdice_TR.svg
https://commons.wikimedia.org/wiki/File:CoA_Lou%C4%8Dka.svg
https://commons.wikimedia.org/wiki/File:CoA_N%C3%A1vojn%C3%A1.svg
https://commons.wikimedia.org/wiki/File:CoA_N%C4%9Bm%C4%8Dice_(okres_Blansko).svg
https://commons.wikimedia.org/wiki/File:CoA_Neda%C5%A1ov.svg
https://commons.wikimedia.org/wiki/File:CoA_Neubuz.svg
https://commons.wikimedia.org/wiki/File:CoA_Petrovice_CZ.svg
https://commons.wikimedia.org/wiki/File:CoA_Podhrad%C3%AD.svg
https://commons.wikimedia.org/wiki/File:CoA_Podkopn%C3%A1_Lhota.svg
https://commons.wikimedia.org/wiki/File:CoA_Sehradice.svg
https://commons.wikimedia.org/wiki/File:CoA_Vl%C4%8Dkov%C3%A1.svg
https://commons.wikimedia.org/wiki/File:CoA_Vlachovice.svg
https://commons.wikimedia.org/wiki/File:CoA_Za%C5%A1ovice_TR.svg
https://commons.wikimedia.org/wiki/File:CoA_of_%C3%9Ajezd_u_Boskovic.svg
https://commons.wikimedia.org/wiki/File:CoA_of_%C4%8Cerno%C5%BEice.svg
https://commons.wikimedia.org/wiki/File:CoA_of_%C4%8Cesk%C3%A1_Kubice.svg
https://commons.wikimedia.org/wiki/File:CoA_of_%C5%A0aplava.svg
https://commons.wikimedia.org/wiki/File:CoA_of_%C5%A0pi%C4%8Dky.svg
https://commons.wikimedia.org/wiki/File:CoA_of_%C5%A0t%C3%ADtn%C3%A1_nad_Vl%C3%A1%C5%99%C3%AD-Popov.svg
https://commons.wikimedia.org/wiki/File:CoA_of_%C5%A0t%C4%9Bke%C5%88.svg
https://commons.wikimedia.org/wiki/File:CoA_of_%C5%A0tudlov.svg
https://commons.wikimedia.org/wiki/File:CoA_of_%C5%BDenklava.svg
https://commons.wikimedia.org/wiki/File:CoA_of_%C5%BDlutava.svg
https://commons.wikimedia.org/wiki/File:CoA_of_B%C3%ADlovec.svg
https://commons.wikimedia.org/wiki/File:CoA_of_B%C3%BD%C5%A1kovice.svg
https://commons.wikimedia.org/wiki/File:CoA_of_Ba%C4%8Dkov.svg
https://commons.wikimedia.org/wiki/File:CoA_of_Bene%C5%A1ovice.svg
https://commons.wikimedia.org/wiki/File:CoA_of_Biskupice_(okres_Svitavy).svg
https://commons.wikimedia.org/wiki/File:CoA_of_Blazice.svg
https://commons.wikimedia.org/wiki/File:CoA_of_Ble%C5%A1no.svg
https://commons.wikimedia.org/wiki/File:CoA_of_Bohu%C5%A1ov.svg
https://commons.wikimedia.org/wiki/File:CoA_of_Bolatice.svg
https://commons.wikimedia.org/wiki/File:CoA_of_Brod_nad_Tichou.svg
https://commons.wikimedia.org/wiki/File:CoA_of_Byst%C5%99any.svg
https://commons.wikimedia.org/wiki/File:CoA_of_Ch%C3%BD%C5%A1%C5%A5.svg
https://commons.wikimedia.org/wiki/File:CoA_of_Chlum%C4%9Bt%C3%ADn.svg
https://commons.wikimedia.org/wiki/File:CoA_of_Chlum_(Strakonice_District).svg
https://commons.wikimedia.org/wiki/File:CoA_of_Chlumec_nad_Cidlinou.svg
https://commons.wikimedia.org/wiki/File:CoA_of_Chval%C4%8Dov.svg
https://commons.wikimedia.org/wiki/File:CoA_of_D%C5%99ev%C4%9Bnice.svg
https://commons.wikimedia.org/wiki/File:CoA_of_Divec.svg
https://commons.wikimedia.org/wiki/File:CoA_of_Dlouh%C3%BD_%C3%9Ajezd.svg
https://commons.wikimedia.org/wiki/File:CoA_of_Dobroho%C5%A1%C5%A5.svg
https://commons.wikimedia.org/wiki/File:CoA_of_Doln%C3%AD_Ho%C5%99ice.svg
https://commons.wikimedia.org/wiki/File:CoA_of_Doln%C3%AD_Kaln%C3%A1.svg
https://commons.wikimedia.org/wiki/File:CoA_of_Drou%C5%BEetice.svg
https://commons.wikimedia.org/wiki/File:CoA_of_Fulnek.svg
https://commons.wikimedia.org/wiki/File:CoA_of_H%C5%AFrky_(okres_Rokycany).svg
https://commons.wikimedia.org/wiki/File:CoA_of_Hal%C5%BEe.svg
https://commons.wikimedia.org/wiki/File:CoA_of_Halenkovice.svg
https://commons.wikimedia.org/wiki/File:CoA_of_Haluzice.svg
https://commons.wikimedia.org/wiki/File:CoA_of_Hl%C3%A1snice.svg
https://commons.wikimedia.org/wiki/File:CoA_of_Ho%C5%99in%C4%9Bves.svg
https://commons.wikimedia.org/wiki/File:CoA_of_Horn%C3%AD_Kamenice_(okres_Doma%C5%BElice).svg
https://commons.wikimedia.org/wiki/File:CoA_of_Horn%C3%AD_Po%C5%99%C3%AD%C4%8D%C3%AD_(okres_Strakonice).svg
https://commons.wikimedia.org/wiki/File:CoA_of_Host%C4%9Bjov.svg
https://commons.wikimedia.org/wiki/File:CoA_of_Hostomice.svg
https://commons.wikimedia.org/wiki/File:CoA_of_Hr%C3%A1dek_(okres_Hradec_Kr%C3%A1lov%C3%A9).svg
https://commons.wikimedia.org/wiki/File:CoA_of_Hrabi%C5%A1%C3%ADn.svg
https://commons.wikimedia.org/wiki/File:CoA_of_Humburky.svg
https://commons.wikimedia.org/wiki/File:CoA_of_Jakubovice_(okres_%C5%A0umperk).svg
https://commons.wikimedia.org/wiki/File:CoA_of_Jansk%C3%A9_L%C3%A1zn%C4%9B.svg
https://commons.wikimedia.org/wiki/File:CoA_of_K%C5%99inice.svg
https://commons.wikimedia.org/wiki/File:CoA_of_Kaly.svg
https://commons.wikimedia.org/wiki/File:CoA_of_Kameni%C4%8Dky.svg
https://commons.wikimedia.org/wiki/File:CoA_of_Kazn%C4%9Bjov.svg
https://commons.wikimedia.org/wiki/File:CoA_of_Kladeruby.svg
https://commons.wikimedia.org/wiki/File:CoA_of_Klamo%C5%A1.svg
https://commons.wikimedia.org/wiki/File:CoA_of_Kluky_(okres_P%C3%ADsek).svg
https://commons.wikimedia.org/wiki/File:CoA_of_Kocelovice.svg
https://commons.wikimedia.org/wiki/File:CoA_of_Kosice.svg
https://commons.wikimedia.org/wiki/File:CoA_of_Kosteln%C3%AD_Myslov%C3%A1.svg
https://commons.wikimedia.org/wiki/File:CoA_of_Krajn%C3%AD%C4%8Dko.svg
https://commons.wikimedia.org/wiki/File:CoA_of_Kun%C5%BEak.svg
https://commons.wikimedia.org/wiki/File:CoA_of_Kyselovice.svg
https://commons.wikimedia.org/wiki/File:CoA_of_La%C5%BEany_(okres_Blansko).svg
https://commons.wikimedia.org/wiki/File:CoA_of_Lesn%C3%A1_(okres_Znojmo).svg
https://commons.wikimedia.org/wiki/File:CoA_of_Lhota_pod_Lib%C4%8Dany.svg
https://commons.wikimedia.org/wiki/File:CoA_of_Lib%C5%99ice.svg
https://commons.wikimedia.org/wiki/File:CoA_of_Libn%C3%ADkovice.svg
https://commons.wikimedia.org/wiki/File:CoA_of_Lochenice.svg
https://commons.wikimedia.org/wiki/File:CoA_of_Lomnice_JM.svg
https://commons.wikimedia.org/wiki/File:CoA_of_Lov%C4%8Dice_(okres_Hradec_Kr%C3%A1lov%C3%A9).svg
https://commons.wikimedia.org/wiki/File:CoA_of_Lu%C5%BEec_nad_Cidlinou.svg
https://commons.wikimedia.org/wiki/File:CoA_of_Ludkovice.svg
https://commons.wikimedia.org/wiki/File:CoA_of_M%C3%A1slojedy.svg
https://commons.wikimedia.org/wiki/File:CoA_of_M%C3%ADrov.svg
https://commons.wikimedia.org/wiki/File:CoA_of_M%C4%9Brunice.svg
https://commons.wikimedia.org/wiki/File:CoA_of_Mal%C5%A1ice.svg
https://commons.wikimedia.org/wiki/File:CoA_of_Mar%C5%A1ov_u_%C3%9Apice.svg
https://commons.wikimedia.org/wiki/File:CoA_of_Martinice_(okres_Krom%C4%9B%C5%99%C3%AD%C5%BE).svg
https://commons.wikimedia.org/wiki/File:CoA_of_Merboltice.svg
https://commons.wikimedia.org/wiki/File:CoA_of_Mist%C5%99ice.svg
https://commons.wikimedia.org/wiki/File:CoA_of_Mlad%C4%9Bjovice_(okres_Olomouc).svg
https://commons.wikimedia.org/wiki/File:CoA_of_Mnichov_(okres_Strakonice).svg
https://commons.wikimedia.org/wiki/File:CoA_of_Mokrovousy.svg
https://commons.wikimedia.org/wiki/File:CoA_of_Moraveck%C3%A9_Pavlovice.svg
https://commons.wikimedia.org/wiki/File:CoA_of_Moravsk%C3%BD_%C5%BDi%C5%BEkov.svg
https://commons.wikimedia.org/wiki/File:CoA_of_N%C4%9Bm%C4%8Dice_(okres_Pardubice).svg
https://commons.wikimedia.org/wiki/File:CoA_of_Naho%C5%A1ovice.svg
https://commons.wikimedia.org/wiki/File:CoA_of_Nepolisy.svg
https://commons.wikimedia.org/wiki/File:CoA_of_Nev%C4%9Bzice.svg
https://commons.wikimedia.org/wiki/File:CoA_of_Novosedly_nad_Ne%C5%BE%C3%A1rkou.svg
https://commons.wikimedia.org/wiki/File:CoA_of_O%C5%99echov.svg
https://commons.wikimedia.org/wiki/File:CoA_of_Ob%C4%9Bdovice.svg
https://commons.wikimedia.org/wiki/File:CoA_of_Old%C5%99ichovice.svg
https://commons.wikimedia.org/wiki/File:CoA_of_Osi%C4%8Dky.svg
https://commons.wikimedia.org/wiki/File:CoA_of_Ostrata.svg
https://commons.wikimedia.org/wiki/File:CoA_of_P%C3%ADsa%C5%99ov.svg
https://commons.wikimedia.org/wiki/File:CoA_of_P%C3%ADsek(okres_Hradec_Kr%C3%A1lov%C3%A9).svg
https://commons.wikimedia.org/wiki/File:CoA_of_P%C5%99ibyslavice(okres_Brno-venkov).svg
https://commons.wikimedia.org/wiki/File:CoA_of_Palon%C3%ADn.svg
https://commons.wikimedia.org/wiki/File:CoA_of_Plasy.svg
https://commons.wikimedia.org/wiki/File:CoA_of_Plavsko.svg
https://commons.wikimedia.org/wiki/File:CoA_of_Provodov.svg
https://commons.wikimedia.org/wiki/File:CoA_of_Rad%C5%88oves.svg
https://commons.wikimedia.org/wiki/File:CoA_of_Radostov.svg
https://commons.wikimedia.org/wiki/File:CoA_of_Rajnochovice.svg
https://commons.wikimedia.org/wiki/File:CoA_of_Roubanina.svg
https://commons.wikimedia.org/wiki/File:CoA_of_Roudnice.svg
https://commons.wikimedia.org/wiki/File:CoA_of_Rudice.svg
https://commons.wikimedia.org/wiki/File:CoA_of_Rudice_(okres_Uhersk%C3%A9_Hradi%C5%A1t%C4%9B).svg
https://commons.wikimedia.org/wiki/File:CoA_of_Sazovice.svg
https://commons.wikimedia.org/wiki/File:CoA_of_Sebranice_(okres_Blansko).svg
https://commons.wikimedia.org/wiki/File:CoA_of_Sedlnice.svg
https://commons.wikimedia.org/wiki/File:CoA_of_Semechnice.svg
https://commons.wikimedia.org/wiki/File:CoA_of_Sk%C5%99ivany.svg
https://commons.wikimedia.org/wiki/File:CoA_of_Skalice_nad_Svitavou.svg
https://commons.wikimedia.org/wiki/File:CoA_of_Skuhrov_nad_B%C4%9Blou.svg
https://commons.wikimedia.org/wiki/File:CoA_of_Slan%C3%ADk.svg
https://commons.wikimedia.org/wiki/File:CoA_of_Slavkov_pod_Host%C3%BDnem.svg
https://commons.wikimedia.org/wiki/File:CoA_of_Sov%C4%9Btice.svg
https://commons.wikimedia.org/wiki/File:CoA_of_St%C4%9B%C5%BEery.svg
https://commons.wikimedia.org/wiki/File:CoA_of_St%C5%99e%C5%BEetice.svg
https://commons.wikimedia.org/wiki/File:CoA_of_Star%C3%A1_Ves_(okres_P%C5%99erov).svg
https://commons.wikimedia.org/wiki/File:CoA_of_Star%C3%A9_Hradi%C5%A1t%C4%9B.svg
https://commons.wikimedia.org/wiki/File:CoA_of_Stebno.svg
https://commons.wikimedia.org/wiki/File:CoA_of_Sto%C5%A1%C3%ADkovice_na_Louce.svg
https://commons.wikimedia.org/wiki/File:CoA_of_Stojice.svg
https://commons.wikimedia.org/wiki/File:CoA_of_Str%C3%A1%C5%BE_nad_Ne%C5%BE%C3%A1rkou.svg
https://commons.wikimedia.org/wiki/File:CoA_of_Stra%C4%8Dov.svg
https://commons.wikimedia.org/wiki/File:CoA_of_Sudice_(Blansko_District).svg
https://commons.wikimedia.org/wiki/File:CoA_of_Sv%C4%9Bt%C3%AD.svg
https://commons.wikimedia.org/wiki/File:CoA_of_Syrov%C3%A1tka.svg
https://commons.wikimedia.org/wiki/File:CoA_of_T%C4%9Brlicko.svg
https://commons.wikimedia.org/wiki/File:CoA_of_T%C5%99ebechovice_pod_Orebem.svg
https://commons.wikimedia.org/wiki/File:CoA_of_T%C5%99ebnou%C5%A1eves.svg
https://commons.wikimedia.org/wiki/File:CoA_of_Trebic.svg
https://commons.wikimedia.org/wiki/File:CoA_of_Turovec.svg
https://commons.wikimedia.org/wiki/File:CoA_of_Uh%C5%99i%C4%8Dice.svg
https://commons.wikimedia.org/wiki/File:CoA_of_Uh%C5%99ice_(okres_Blansko).svg
https://commons.wikimedia.org/wiki/File:CoA_of_V%C3%BD%C5%A1ovice.svg
https://commons.wikimedia.org/wiki/File:CoA_of_V%C5%A1estary_(okres_Hradec_Kr%C3%A1lov%C3%A9).svg
https://commons.wikimedia.org/wiki/File:CoA_of_Vesel%C3%A1(okres_Pelh%C5%99imov).svg
https://commons.wikimedia.org/wiki/File:CoA_of_Vesel%C3%A1_(Zl%C3%ADn_District).svg
https://commons.wikimedia.org/wiki/File:CoA_of_Vojn%C5%AFv_M%C4%9Bstec.svg
https://commons.wikimedia.org/wiki/File:CoA_of_Vojt%C4%9Bchov_(okres_Chrudim).svg
https://commons.wikimedia.org/wiki/File:CoA_of_Vranov_(okres_Tachov).svg
https://commons.wikimedia.org/wiki/File:CoA_of_Vysok%C3%A1_Srbsk%C3%A1.svg
https://commons.wikimedia.org/wiki/File:CoA_of_Z%C3%A1dve%C5%99ice-Rakov%C3%A1.svg
https://commons.wikimedia.org/wiki/File:CoA_of_Z%C3%A1vist_(Blansko_District).svg
https://commons.wikimedia.org/wiki/File:CoA_of_Zbraslavec.svg
https://commons.wikimedia.org/wiki/File:CoA_of_Zub%C4%8Dice.svg
https://commons.wikimedia.org/wiki/File:Ctin%C4%9Bves_CZ_CoA.svg
https://commons.wikimedia.org/wiki/File:D%C4%9Bt%C5%99ichov_u_Moravsk%C3%A9_T%C5%99ebov%C3%A9_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Dale%C5%A1ice_(Jablonec_nad_Nisou)_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:De%C5%A1tn%C3%A9_v_Orl._hor%C3%A1ch_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Desn%C3%A1_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Divcice_CZ_CoA.svg
https://commons.wikimedia.org/wiki/File:Dlouh%C3%BD_Most_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Dob%C5%99%C3%AD%C5%88_CZ_CoA.svg
https://commons.wikimedia.org/wiki/File:Dobr%C3%A1_(FM)_CoA.svg
https://commons.wikimedia.org/wiki/File:Dobratice_CoA.svg
https://commons.wikimedia.org/wiki/File:Dobru%C5%A1ka_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Doksany_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Doln%C3%AD_%C3%9Ajezd_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Doln%C3%AD_Domaslavice_CoA.svg
https://commons.wikimedia.org/wiki/File:Doln%C3%AD_Dv%C5%AFr_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Doln%C3%AD_Lomn%C3%A1_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Doln%C3%AD_P%C5%99%C3%ADm_CoA.svg
https://commons.wikimedia.org/wiki/File:Dolni_Branna_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Dolni_Roven_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Drysice_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Du%C5%A1n%C3%ADky_CZ_CoA.svg
https://commons.wikimedia.org/wiki/File:Dubicne_CZ_CoA.svg
https://commons.wikimedia.org/wiki/File:Fr%C3%BDd%C5%A1tejn_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Fr%C3%BDdek_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Fr%C3%BDdek_M%C3%ADstek_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Fr%C3%BDdlant_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Fren%C5%A1t%C3%A1t_pod_Radho%C5%A1t%C4%9Bm_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Fry%C4%8Dovice_CoA.svg
https://commons.wikimedia.org/wiki/File:Frymburk_CoA.svg
https://commons.wikimedia.org/wiki/File:Grodek_CoA.svg
https://commons.wikimedia.org/wiki/File:Gruna_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:H%C5%99ibiny-Ledsk%C3%A1_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Habartice_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Hajnice_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Hartmanice_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Havlovice_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Hejnice_CoA_LB_CZ.svg
https://commons.wikimedia.org/wiki/File:Hermanova_Hut_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Hodkovice_nad_Mohelkou_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Hol%C5%A1tejn_CoA.svg
https://commons.wikimedia.org/wiki/File:Horka_u_Star%C3%A9_Paky_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Horn%C3%AD_%C3%9Ajezd_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Horn%C3%AD_Brann%C3%A1_CoA.svg
https://commons.wikimedia.org/wiki/File:Horn%C3%AD_Lomn%C3%A1_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Hornos%C3%ADn_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Horsice_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Hradec_Kralove_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Hradec_nad_Svitavou_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Hroznova_Lhota_CZ_CoA.svg
https://commons.wikimedia.org/wiki/File:Hrub%C3%A1_Sk%C3%A1la_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Hukvaldy_CoA.svg
https://commons.wikimedia.org/wiki/File:Janov_(Czech_Silesia)_CoA.svg
https://commons.wikimedia.org/wiki/File:Janovice_nad_%C3%9Ahlavou_CoA.svg
https://commons.wikimedia.org/wiki/File:Jaromerice_nR_CoA.svg
https://commons.wikimedia.org/wiki/File:Javorn%C3%ADk_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Javornik_CoA.svg
https://commons.wikimedia.org/wiki/File:Javornik_JE_CZ_CoA.svg
https://commons.wikimedia.org/wiki/File:Jedlov%C3%A1_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Jedovnice_CoA.svg
https://commons.wikimedia.org/wiki/File:Jeni%C5%A1ovice_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Jesen%C3%ADk_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Jev%C3%AD%C4%8Dko_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Jicin_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Jilemnice_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Jilovice_CB_CZ_CoA.svg
https://commons.wikimedia.org/wiki/File:K%C5%99es%C3%ADn_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Ka%C5%88ovice_(FM)_CoA.svg
https://commons.wikimedia.org/wiki/File:Kacanovy_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Kace%C5%99ov_(Sokolov_District)_CoA.svg
https://commons.wikimedia.org/wiki/File:Kamenec_u_poli%C4%8Dky_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Kamenick%C3%BD_%C5%A0enov_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Karle_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Kel%C4%8D_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Ko%C5%99enov_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Koberovy_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Kobyly_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Kocl%C3%AD%C5%99ov_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Kopidlno_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Kostelec_na_Han%C3%A9_CoA.svg
https://commons.wikimedia.org/wiki/File:Kramolna_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Krasna_CH_CZ_CoA.svg
https://commons.wikimedia.org/wiki/File:Krizany_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Krmel%C3%ADn_CoA.svg
https://commons.wikimedia.org/wiki/File:Krtiny_CZ_CoA.svg
https://commons.wikimedia.org/wiki/File:Kry%C5%A1tofovo_%C3%9Adol%C3%AD_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Ktov%C3%A1_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Kukle_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Kun%C4%8Dice_pod_Ond%C5%99ejn%C3%ADkem_CoA.svg
https://commons.wikimedia.org/wiki/File:Kunvald_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Kv%C4%9Btn%C3%A1_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Ladce_CoA_HK_CZ.svg
https://commons.wikimedia.org/wiki/File:Lazne_Libverda_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Lazne_Lipova_CoA.svg
https://commons.wikimedia.org/wiki/File:Ledenice_CZ_CoA.svg
https://commons.wikimedia.org/wiki/File:Lenora_CoA.svg
https://commons.wikimedia.org/wiki/File:Letohrad_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Lev%C3%ADnsk%C3%A1_Ole%C5%A1nice_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Lhotka_(FM)_CoA.svg
https://commons.wikimedia.org/wiki/File:Libavsk%C3%A9_%C3%9Adol%C3%AD_CoA.svg
https://commons.wikimedia.org/wiki/File:Litom%C4%9B%C5%99ice_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Litomy%C5%A1l_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Lomnice_(Sokolov_District)_CoA.svg
https://commons.wikimedia.org/wiki/File:Lou%C4%8Dky_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Lubn%C3%A1_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Lukavec_CoA_LT_CZ.svg
https://commons.wikimedia.org/wiki/File:M%C3%ADrov%C3%A1_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:M%C4%9Bste%C4%8Dko_Trn%C3%A1vka_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Makov_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Male_Svatonovice_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Male_Svatonovice_CoA_CZ_not_croped.svg
https://commons.wikimedia.org/wiki/File:Malenovice_(FM)_CoA.svg
https://commons.wikimedia.org/wiki/File:Martinice_v_Krkono%C5%A1%C3%ADch_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Metylovice_CoA.svg
https://commons.wikimedia.org/wiki/File:Mikule%C4%8D_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Milhostov_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Miroslavsk%C3%A9_Kn%C3%ADnice_CoA.svg
https://commons.wikimedia.org/wiki/File:Mod%C5%99i%C5%A1ice_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Modrice_CZ_CoA.svg
https://commons.wikimedia.org/wiki/File:Mohelnice_SU_CZ_CoA.svg
https://commons.wikimedia.org/wiki/File:Mora%C5%A1ice_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Moravsk%C3%A1_T%C5%99ebov%C3%A1_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Mostek_CoA_TU_CZ.svg
https://commons.wikimedia.org/wiki/File:N%C3%A1chod_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Nakri_CZ_CoA.svg
https://commons.wikimedia.org/wiki/File:Navsi_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Nezv%C4%9Bstice_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Ni%C5%BEn%C3%AD_Lhoty_CoA.svg
https://commons.wikimedia.org/wiki/File:Nov%C3%A1_Paka_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Nov%C3%A9_Hrady_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Nov%C3%A9_M%C4%9Bsto_nad_Metuj%C3%AD_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Nov%C3%BD_Bor_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Nove_Mesto_pod_Smrkem_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Noviny_pod_Ralskem_CZ_CoA.svg
https://commons.wikimedia.org/wiki/File:Nydek_CoA.svg
https://commons.wikimedia.org/wiki/File:Opatovec_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Opava_CoA.svg
https://commons.wikimedia.org/wiki/File:Opo%C4%8Dno_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Opocno_(Rychnov_nad_Kneznou)_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Os%C3%ADk_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Osek_CoA_TP_CZ.svg
https://commons.wikimedia.org/wiki/File:Osek_RO_CZ_CoA.svg
https://commons.wikimedia.org/wiki/File:Ostrava_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Ostrov_nad_Oslavou_CoA.svg
https://commons.wikimedia.org/wiki/File:P%C3%ADsek_CoA.svg
https://commons.wikimedia.org/wiki/File:P%C5%99epe%C5%99e_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Pace%C5%99ice_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Palkovice_CoA.svg
https://commons.wikimedia.org/wiki/File:Pardubice_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Paseky_nad_Jizerou_CoA.svg
https://commons.wikimedia.org/wiki/File:Pe%C5%99imov_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Pec_pod_Snezkou_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Pecka_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Per%C3%A1lec_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Petrovice_u_Karvin%C3%A9_CoA.svg
https://commons.wikimedia.org/wiki/File:Petrvald_(Karvina)_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Piln%C3%ADkov_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Po%C5%99%C3%AD%C4%8D%C3%AD_u_Litomy%C5%A1le_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Podhrad%C3%AD_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Pohledy_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Polevsko_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Poli%C4%8Dka_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Polna_CZ_CoA.svg
https://commons.wikimedia.org/wiki/File:Polom_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Pomez%C3%AD_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Ponikl%C3%A1_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Pot%C5%A1tejn_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Prague_11_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Prague_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Praha-01_CoA.svg
https://commons.wikimedia.org/wiki/File:Praha-03_CoA.svg
https://commons.wikimedia.org/wiki/File:Praha-04_CoA.svg
https://commons.wikimedia.org/wiki/File:Praha-07_CoA.svg
https://commons.wikimedia.org/wiki/File:Praha-08_CoA.svg
https://commons.wikimedia.org/wiki/File:Praha-09_CoA.svg
https://commons.wikimedia.org/wiki/File:Praha-12_CoA.svg
https://commons.wikimedia.org/wiki/File:Praha-13_CoA.svg
https://commons.wikimedia.org/wiki/File:Praha-14_CoA.svg
https://commons.wikimedia.org/wiki/File:Praha-15_CoA.svg
https://commons.wikimedia.org/wiki/File:Praha-16_CoA.svg
https://commons.wikimedia.org/wiki/File:Praha-18_CoA.svg
https://commons.wikimedia.org/wiki/File:Praha-21_CoA.svg
https://commons.wikimedia.org/wiki/File:Praha-B%C4%9Bchovice_CoA.svg
https://commons.wikimedia.org/wiki/File:Praha-Benice_CoA.svg
https://commons.wikimedia.org/wiki/File:Praha-Cakovice_CoA.svg
https://commons.wikimedia.org/wiki/File:Praha-Doln%C3%AD_Chabry_CoA.svg
https://commons.wikimedia.org/wiki/File:Praha-Dolni_Mecholupy_CoA.svg
https://commons.wikimedia.org/wiki/File:Praha-Klanovice_CoA.svg
https://commons.wikimedia.org/wiki/File:Praha-Kolodeje_CoA.svg
https://commons.wikimedia.org/wiki/File:Praha-Kralovice_CoA.svg
https://commons.wikimedia.org/wiki/File:Praha-Kreslice_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Praha-Lipence_CoA.svg
https://commons.wikimedia.org/wiki/File:Praha-Lochkov_CoA.svg
https://commons.wikimedia.org/wiki/File:Praha-Nebusice_CoA.svg
https://commons.wikimedia.org/wiki/File:Praha-Satalice_CoA.svg
https://commons.wikimedia.org/wiki/File:Praha-Slivenec_CoA.svg
https://commons.wikimedia.org/wiki/File:Praha-Sterboholy_CoA.svg
https://commons.wikimedia.org/wiki/File:Praha-Suchdol_CoA.svg
https://commons.wikimedia.org/wiki/File:Praha-Troja_CoA.svg
https://commons.wikimedia.org/wiki/File:Praha-Ujezd_CoA.svg
https://commons.wikimedia.org/wiki/File:Praha-Velka_Chuchle_CoA.svg
https://commons.wikimedia.org/wiki/File:Praha-Vinor_CoA.svg
https://commons.wikimedia.org/wiki/File:Praha_19_CoA.svg
https://commons.wikimedia.org/wiki/File:Praha_CoA_CZ_small.svg
https://commons.wikimedia.org/wiki/File:Prasek_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Praska%C4%8Dka_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Pribyslavice_TR_CoA.svg
https://commons.wikimedia.org/wiki/File:Prisovice_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Prose%C4%8D_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Pustina_CoA.svg
https://commons.wikimedia.org/wiki/File:Radimovice_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Radimovice_u_Zelce_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Radkov_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Radkovice_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Rajhrad_CZ_CoA.svg
https://commons.wikimedia.org/wiki/File:Raspenava_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Ropica_CoA.svg
https://commons.wikimedia.org/wiki/File:Rous%C3%ADnov_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Rovensko_pod_Troskami_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Rozhran%C3%AD_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Rtyne_v_Podkrkonosi_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Rudn%C3%A1_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Rudnik_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Rychvald_CoA.svg
https://commons.wikimedia.org/wiki/File:Rynoltice_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Rzeka_CoA.svg
https://commons.wikimedia.org/wiki/File:Sadov_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Sebranice_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Sedlec_CB_CZ_CoA.svg
https://commons.wikimedia.org/wiki/File:Sedlo%C5%88ov_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Sevetin_CZ_CoA.svg
https://commons.wikimedia.org/wiki/File:Sirejovice_CZ_CoA.svg
https://commons.wikimedia.org/wiki/File:Sklenn%C3%A9_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Skute%C4%8D_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Slan%C3%A1_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Slatina_SY_CZ_CoA.svg
https://commons.wikimedia.org/wiki/File:Slavetin_LN_CZ_CoA.svg
https://commons.wikimedia.org/wiki/File:Sloup_v_Cechach_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Sloupnice_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Sn%C4%9B%C5%BEn%C3%A9_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Sokolov_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Spindleruv_Mlyn_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Sta%C5%99%C3%AD%C4%8D_CoA.svg
https://commons.wikimedia.org/wiki/File:Sta%C5%A1ov_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Stankovice_LT_CZ_CoA.svg
https://commons.wikimedia.org/wiki/File:Star%C3%A1_Ves_nad_Ond%C5%99ejnic%C3%AD_CoA.svg
https://commons.wikimedia.org/wiki/File:Star%C3%A9_Smrkovice_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Stare_Hodejovice_CZ_CoA.svg
https://commons.wikimedia.org/wiki/File:Stare_Sedlo_SO_CZ_CoA.svg
https://commons.wikimedia.org/wiki/File:Sto%C5%BEec_CoA.svg
https://commons.wikimedia.org/wiki/File:Strakov_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Studenec_CoA.svg
https://commons.wikimedia.org/wiki/File:Suchdol_nad_Odrou_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Sulejovice_CZ_CoA.svg
https://commons.wikimedia.org/wiki/File:Svatava_SO_CZ_CoA.svg
https://commons.wikimedia.org/wiki/File:Sviadnov_CoA.svg
https://commons.wikimedia.org/wiki/File:Svijansk%C3%BD_%C3%9Ajezd_CoA.svg
https://commons.wikimedia.org/wiki/File:Svijany_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Svojanov_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Svojek_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Svor_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Sy%C5%99enov_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Sychrov_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Synkov-Slemeno_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:T%C4%9Bchlovice_CoA_HK_CZ.svg
https://commons.wikimedia.org/wiki/File:T%C5%99eb%C3%A1%C5%99ov_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:T%C5%99ebovice_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:T%C5%99inec_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Tanvald_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Telec%C3%AD_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Tepli%C4%8Dka_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Terez%C3%ADn_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Trebusin_CZ_CoA.svg
https://commons.wikimedia.org/wiki/File:Trnava_TR_CoA.svg
https://commons.wikimedia.org/wiki/File:Trst%C4%9Bnice_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Trutnov_CoA_CZ_old.svg
https://commons.wikimedia.org/wiki/File:Turnov_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Tynec_KT_CZ_CoA.svg
https://commons.wikimedia.org/wiki/File:Ujezd_u_Svateho_Krize_RO_CZ_CoA.svg
https://commons.wikimedia.org/wiki/File:Upice_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:V%C3%ADchov%C3%A1_nad_Jizerou_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:V%C3%ADt%C4%9Bjeves_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:V%C3%BDrava_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:V%C4%9Blopol%C3%AD_CoA.svg
https://commons.wikimedia.org/wiki/File:V%C5%A1e%C5%88_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Vacov_CZ_CoA.svg
https://commons.wikimedia.org/wiki/File:Vchynice_CZ_CoA.svg
https://commons.wikimedia.org/wiki/File:Vedrovice_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Velhartice_CoA.svg
https://commons.wikimedia.org/wiki/File:Velka_Kras_CZ_CoA.svg
https://commons.wikimedia.org/wiki/File:Velke_Hydcice_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Vendol%C3%AD_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Vidlat%C3%A1_se%C4%8D_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Vidov_CZ_CoA.svg
https://commons.wikimedia.org/wiki/File:Vintirov_SO_CZ_CoA.svg
https://commons.wikimedia.org/wiki/File:Visnova_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Vizovice_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Vladislav_CoA.svg
https://commons.wikimedia.org/wiki/File:Vlastibo%C5%99ice_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Voderady_(Rychnov_nad_Kneznou)_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Vr%C3%A1%C5%BEn%C3%A9_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Vranov%C3%A1_Lhota_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Vrchlab%C3%AD_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Vrutice_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Vycapy_CoA.svg
https://commons.wikimedia.org/wiki/File:Wedrynia_CoA.svg
https://commons.wikimedia.org/wiki/File:Z%C3%A1%C5%99%C3%AD%C4%8D%C3%AD_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Z%C3%A1ho%C5%99%C3%AD_CoA_SM_CZ.svg
https://commons.wikimedia.org/wiki/File:Z%C3%A1lu%C5%BE%C3%AD_CoA_LIT_CZ.svg
https://commons.wikimedia.org/wiki/File:Zarubice_CoA.svg
https://commons.wikimedia.org/wiki/File:Zderaz_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Zdirec_nad_Doubravou_CoA_CZ.svg
https://commons.wikimedia.org/wiki/File:Zulova_CZ_CoA.svg
`
  .split("\n")
  .filter(s => s !== "");
