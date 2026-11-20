"use strict";

const rules = new Map([
  ["single", "BW2シングル"], ["double", "BW2ダブル"], ["christmas", "クリスマスカップ"],
]);

function element(tag, className, value) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (value !== undefined) node.textContent = value;
  return node;
}

function link(label, href, className) {
  const node = element("a", className, label);
  node.href = href;
  return node;
}

function eventDate(date) {
  const [year, month, day] = date.split("-").map(Number);
  const node = element("time", "date", year + "年" + month + "月" + day + "日");
  node.dateTime = date;
  return node;
}

function renderList(container) {
  const selected = document.querySelector('input[name="rule"]:checked').value;
  const matching = tournaments.filter(event => selected === "all" || event.rule === selected)
    .sort((a, b) => b.date.localeCompare(a.date));
  document.querySelector("#count").textContent = matching.length + " 件";
  container.replaceChildren();
  if (!matching.length) {
    container.append(element("p", "empty", "このルールの掲載大会はまだありません。"));
    return;
  }

  for (const event of matching) {
    const card = link("", "./tournament.html?id=" + encodeURIComponent(event.id), "event-card");
    const info = element("div");
    const meta = element("div", "meta");
    meta.append(eventDate(event.date), element("span", "rule", rules.get(event.rule)));
    info.append(meta, element("h3", "", event.name));
    card.append(info, element("span", "card-action", "大会結果を見る"));
    container.append(card);
  }
}

function partyKkp(team, counts) {
  return team.reduce((total, pokemon) => total + counts.get(pokemon), 0);
}

function renderParty(player, team, kkp, article, rank) {
  const item = element("li", "party");
  const heading = element(rank ? "h3" : "h2", "party-heading");
  if (rank) heading.append(element("span", "rank", rank), element("span", "", player));
  else heading.textContent = player;

  const slots = element("ul", "slots");
  for (const name of team) slots.append(element("li", "", name));

  const extras = element("div", "party-extras");
  extras.append(element("strong", "kkp", "KKP " + (Number.isFinite(kkp) ? kkp : "—")));
  if (typeof article === "string") extras.append(link("構築記事を読む", article));
  else if (article) extras.append(link(article.title, article.url));
  else extras.append(element("span", "", "構築記事：未掲載"));
  item.append(heading, slots, extras);
  return item;
}

function renderDetail(container, event) {
  if (!event) {
    container.append(element("h1", "", "大会が見つかりません"), link("大会一覧を見る", "./index.html#tournaments", "cta"));
    return;
  }
  document.title = event.name + " | 第五世代対戦アーカイブ";
  const hero = element("section", "hero detail-hero");
  const canvas = element("canvas");
  canvas.width = 480;
  canvas.height = 205;
  canvas.setAttribute("aria-hidden", "true");
  const copy = element("div", "hero-copy");
  const meta = element("div", "meta");
  meta.append(eventDate(event.date), element("span", "rule", rules.get(event.rule)));
  copy.append(element("p", "eyebrow", "WHITE FOREST / GEN V"), element("h1", "", event.name), meta,
    link("出典：大会結果報告", event.source, "source"));
  hero.append(canvas, copy);

  const jump = element("nav", "jump");
  jump.setAttribute("aria-label", "大会データ");
  jump.append(link("ポケモン別KP", "#kp"), link("上位入賞パーティ", "#parties"));

  const kp = element("section", "detail-section");
  kp.id = "kp";
  kp.append(element("h2", "", "ポケモン別KP"), element("p", "section-note", "登録パーティでの採用数。フォルムごとに集計。"));
  const table = element("table", "kp-table");
  const head = table.createTHead().insertRow();
  for (const label of ["ポケモン", "採用数"]) {
    const header = element("th", "", label);
    header.scope = "col";
    head.append(header);
  }
  const body = table.createTBody();
  for (const [name, count] of [...event.kp].sort((a, b) => b[1] - a[1])) {
    const row = body.insertRow();
    const header = element("th", "", name);
    header.scope = "row";
    row.append(header, element("td", "", count));
  }
  kp.append(table);

  const parties = element("section", "detail-section");
  parties.id = "parties";
  parties.append(element("h2", "", "上位入賞パーティ"));
  const counts = new Map(event.kp);
  const list = element("ul", "parties");
  for (const [rank, player, team] of event.parties) {
    list.append(renderParty(player, team, partyKkp(team, counts), event.articles?.[player], rank));
  }
  parties.append(list);
  container.append(hero, jump, parties, kp);
  drawLandscape(canvas);
}

function drawLandscape(canvas) {
  const context = canvas.getContext("2d");
  if (!context) return;
  const rect = (color, x, y, width, height) => {
    context.fillStyle = color;
    context.fillRect(x, y, width, height);
  };
  rect("#dcebd2", 0, 0, 480, 205);
  rect("#e9f1d8", 210, 33, 270, 29);
  rect("#f6f7d9", 360, 23, 47, 44);
  rect("#b8d4aa", 0, 125, 480, 80);
  rect("#93b996", 250, 146, 230, 59);
  rect("#a4c5a5", 254, 166, 226, 30);
  rect("#cbe0be", 279, 168, 37, 3);
  rect("#cbe0be", 423, 178, 34, 3);
  // Square highlights and tufts give the clearing a visible pixel grid.
  for (let x = 235; x < 477; x += 11) {
    const y = 155 + (x * 13 % 46);
    rect("#b6d1ab", x, y, 5, 2);
    rect("#b6d1ab", x + 2, y - 2, 2, 2);
  }
  function tree(x, y, scale, light, dark) {
    rect("#7a805f", x - 2 * scale, y - 21 * scale, 4 * scale, 21 * scale);
    rect(dark, x - 12 * scale, y - 23 * scale, 24 * scale, 9 * scale);
    rect(dark, x - 9 * scale, y - 31 * scale, 18 * scale, 12 * scale);
    rect(light, x - 5 * scale, y - 38 * scale, 10 * scale, 11 * scale);
    rect(light, x - 8 * scale, y - 30 * scale, 11 * scale, 7 * scale);
    rect(light, x - 11 * scale, y - 23 * scale, 14 * scale, 5 * scale);
  }
  for (let x = 210; x < 490; x += 14) tree(x, 148 - (x % 11), 1.2, "#a8c59c", "#8eae90");
  tree(321, 174, 2.3, "#91b48a", "#648b73");
  tree(450, 178, 3.7, "#709677", "#456f60");
  tree(410, 191, 2.1, "#8bb08a", "#537d65");
  tree(475, 207, 2.8, "#7c9c75", "#3e685a");
  for (let x = 261; x < 477; x += 19) rect("#f0e7a9", x, 171 + (x * 7 % 31), 3, 2);
}

const events = document.querySelector("#events");
if (events) {
  renderList(events);
  document.querySelector(".filters").addEventListener("change", () => renderList(events));
  drawLandscape(document.querySelector("#landscape"));
}

const detail = document.querySelector("#detail");
if (detail) {
  const id = new URLSearchParams(location.search).get("id");
  renderDetail(detail, tournaments.find(event => event.id === id));
}
