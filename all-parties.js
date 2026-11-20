"use strict";

const eventId = new URLSearchParams(location.search).get("id");
const registeredParties = allPartiesByEvent.get(eventId);
const eventRecord = tournaments.find(event => event.id === eventId);
const detailUrl = "./tournament.html?id=" + encodeURIComponent(eventId);

const detailNavigation = document.querySelector("#detail .jump");
if (detailNavigation && registeredParties) {
  detailNavigation.append(link("全登録パーティ", "./parties.html?id=" + encodeURIComponent(eventId)));
}

const allPartiesPage = document.querySelector("#all-parties");
if (allPartiesPage) {
  allPartiesPage.append(link("大会詳細に戻る", eventRecord ? detailUrl : "./index.html#tournaments", "back"));
  if (!eventRecord || !registeredParties) {
    allPartiesPage.append(element("h1", "", "登録パーティが見つかりません"));
  } else {
    document.title = "全登録パーティ | " + eventRecord.name + " | 第五世代対戦アーカイブ";
    const section = element("section", "detail-section");
    const hero = element("header", "hero parties-hero");
    const canvas = element("canvas");
    canvas.width = 480;
    canvas.height = 205;
    canvas.setAttribute("aria-hidden", "true");
    const copy = element("div", "hero-copy");
    copy.append(element("p", "eyebrow", eventRecord.name), element("h1", "", "全登録パーティ"));
    const meta = element("div", "meta");
    meta.append(eventDate(eventRecord.date), element("span", "rule", rules.get(eventRecord.rule)));
    copy.append(meta, element("p", "section-note", registeredParties.length + "件（KKPが多い順）"));
    hero.append(canvas, copy);
    allPartiesPage.append(hero);
    drawLandscape(canvas);
    const counts = new Map(eventRecord.kp);
    const sortedParties = registeredParties
      .map(([player, team]) => ({ player, team, kkp: partyKkp(team, counts) }))
      .sort((a, b) => (Number.isFinite(b.kkp) ? b.kkp : -1) - (Number.isFinite(a.kkp) ? a.kkp : -1));
    const list = element("ul", "parties");
    for (const { player, team, kkp } of sortedParties) {
      list.append(renderParty(player, team, kkp, eventRecord.articles?.[player]));
    }
    section.append(list, link("出典：大会結果報告", eventRecord.source, "source"));
    allPartiesPage.append(section);
  }
}
