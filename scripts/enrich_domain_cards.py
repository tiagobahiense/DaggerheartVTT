"""Extract domain metadata from DH-Livro-Basico.pdf appendix and enrich cartas.json."""
import json
import re
import unicodedata
from pathlib import Path

import pdfplumber

ROOT = Path(__file__).resolve().parents[1]
PDF_PATH = ROOT / "public" / "doc" / "DH-Livro-Basico.pdf"
JSON_PATH = ROOT / "src" / "data" / "cartas.json"

DOMAIN_MAP = {
    "arcano": ("Arcano", "#7C3AED"),
    "codice": ("Codice", "#2563EB"),
    "esplendor": ("Esplendor", "#CA8A04"),
    "falange": ("Falange", "#9CA3AF"),
    "graca": ("Graca", "#DB2777"),
    "lamina": ("Lamina", "#DC2626"),
    "meia-noite": ("Meia-noite", "#374151"),
    "meia noite": ("Meia-noite", "#374151"),
    "sabedoria": ("Sabedoria", "#16A34A"),
    "valor": ("Valor", "#EA580C"),
}

DOMAIN_DISPLAY = {
    "Arcano": "Arcano",
    "Codice": "Códice",
    "Graca": "Graça",
    "Lamina": "Lâmina",
    "Esplendor": "Esplendor",
    "Meia-noite": "Meia-noite",
    "Falange": "Falange",
    "Sabedoria": "Sabedoria",
    "Valor": "Valor",
}

TIPO_RE = re.compile(
    r"(Feiti[cç]o|Talento|Grim[oó]rio)\s+(?:d[oa]\s+)?([\w\-]+(?:\s+[\w\-]+)?)\s+de\s+(\d+)[ºo°]\s+n[ií]vel",
    re.I,
)
TIPO_ALT_RE = re.compile(r"Feiti[cç]o\s+de\s+(\d+)[ºo°]\s+n[ií]vel\s+\((\w+)\)", re.I)
CUSTO_RE = re.compile(r"Custo de troca:\s*(\d+)", re.I)

SEARCH_ALIASES: dict[str, list[str]] = {
    "da natureza": ["FAMILIAR DA NATUREZA"],
    "livro de tryfar": ["LIVRO DE TYFAR"],
    "livro de tyfar": ["LIVRO DE TYFAR"],
    "constrisçpãelol mortal": ["CONSTRIÇÃO MORTAL"],
    "constricao mortal": ["CONSTRIÇÃO MORTAL"],
    "corrente de relâmpagos": ["CORRENTE DE RELÂMPAGOS"],
    "acuidade cruel": ["ACUIDADE CRUEL"],
    "voz da natureza": ["VOZ DA NATUREZA"],
    "caos liberto": ["CAOS LIBERTO"],
    "impacto defensivo": ["IMPACTO", "DEFENSIVO"],
    "palavras tranquilizantes": ["PALAVRAS", "TRANQUILIZANTES"],
}

MANUAL_OVERRIDES: dict[str, dict] = {
    "impacto defensivo": {
        "tipo_dominio": "Arcano",
        "cor_dominio": "#7C3AED",
        "nivel_dominio": 4,
        "custo_troca": 2,
    },
    "constricao mortal": {
        "tipo_dominio": "Sabedoria",
        "cor_dominio": "#16A34A",
        "nivel_dominio": 4,
        "custo_troca": 1,
    },
    "dom arcano": {
        "tipo_dominio": "Arcano",
        "cor_dominio": "#7C3AED",
        "nivel_dominio": 7,
        "custo_troca": 2,
    },
}


def norm(s: str) -> str:
    s = unicodedata.normalize("NFD", s)
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    return re.sub(r"[^a-z0-9 ]", "", s.lower()).strip()


def strip_prefix(nome: str) -> str:
    for p in (
        "Feitiço - ",
        "Feitico - ",
        "Grimório - ",
        "Grimorio - ",
        "Talento - ",
    ):
        if nome.startswith(p):
            return nome[len(p) :]
    return nome


def normalize_tipo(raw: str) -> str:
    if raw.lower().startswith("grim"):
        return "Grimório"
    if raw.lower().startswith("feit"):
        return "Feitiço"
    return "Talento"


def resolve_domain(dom_raw: str) -> tuple[str, str]:
    key = norm(dom_raw)
    for k, (domain, color) in DOMAIN_MAP.items():
        if key == norm(k) or key.startswith(norm(k)):
            return DOMAIN_DISPLAY[domain], color
    return dom_raw.title(), "#6B7280"


def parse_tipo_match(match: re.Match[str], snippet: str) -> dict:
    raw_tipo = match.group(1)
    tipo_carta = normalize_tipo(raw_tipo)
    dominio, cor = resolve_domain(match.group(2))
    nivel = int(match.group(3))
    after = snippet[match.end() : match.end() + 120]
    custo_m = CUSTO_RE.search(after)
    meta = {
        "tipo_carta": tipo_carta,
        "tipo_dominio": dominio,
        "cor_dominio": cor,
        "nivel_dominio": nivel,
    }
    if custo_m:
        meta["custo_troca"] = int(custo_m.group(1))
    return meta


def parse_all_tipos(snippet: str) -> list[dict]:
    matches: list[dict] = []
    for m in TIPO_RE.finditer(snippet):
        matches.append(parse_tipo_match(m, snippet))
    for m in TIPO_ALT_RE.finditer(snippet):
        nivel = int(m.group(1))
        dominio, cor = resolve_domain(m.group(2))
        after = snippet[m.end() : m.end() + 120]
        custo_m = CUSTO_RE.search(after)
        meta = {
            "tipo_carta": "Feitiço",
            "tipo_dominio": dominio,
            "cor_dominio": cor,
            "nivel_dominio": nivel,
        }
        if custo_m:
            meta["custo_troca"] = int(custo_m.group(1))
        matches.append(meta)
    return matches


def pick_tipo(matches: list[dict], categoria: str) -> dict | None:
    for m in matches:
        if m["tipo_carta"] == categoria:
            return m
    return matches[0] if matches else None


def find_title_positions(text: str, title: str) -> list[int]:
    positions: list[int] = []
    upper = text.upper()
    title_upper = title.upper()
    start = 0
    while True:
        idx = upper.find(title_upper, start)
        if idx < 0:
            break
        before = text[idx - 1] if idx > 0 else "\n"
        after_idx = idx + len(title_upper)
        after = text[after_idx] if after_idx < len(text) else "\n"
        if before.isalnum() or after.isalnum():
            start = idx + 1
            continue
        positions.append(idx)
        start = idx + 1
    return positions


def extract_metadata(text: str, base: str, categoria: str) -> dict | None:
    base_norm = norm(base)
    manual = MANUAL_OVERRIDES.get(base_norm)
    if not manual and "constr" in base_norm and "mortal" in base_norm:
        manual = MANUAL_OVERRIDES["constricao mortal"]
    if manual:
        return dict(manual)

    search_titles = [base.upper()]
    search_titles.extend(SEARCH_ALIASES.get(base_norm, []))

    for title in search_titles:
        if title == "DEFENSIVO":
            continue
        for idx in find_title_positions(text, title):
            snippet = text[idx : idx + 500]
            if title == "IMPACTO" and "DEFENSIVO" not in snippet[:120]:
                continue
            if title == "PALAVRAS" and "TRANQUILIZANTES" not in snippet[:80]:
                continue
            matches = parse_all_tipos(snippet)
            meta = pick_tipo(matches, categoria)
            if meta:
                return meta

    return None


def normalize_card(card: dict) -> None:
    """Apply canonical schema for domain cards."""
    card.pop("rank", None)
    card.pop("dominio", None)
    card.pop("tipo_carta", None)

    if "nivel_dominio" in card:
        card["dominio"] = card["nivel_dominio"]


def main() -> None:
    with pdfplumber.open(PDF_PATH) as pdf:
        text = "\n".join((pdf.pages[p].extract_text() or "") for p in range(329, 345))

    with JSON_PATH.open(encoding="utf-8") as f:
        cards = json.load(f)

    grimorio_cats = {"Feitiço", "Grimório", "Talento"}
    matched = 0
    not_found: list[str] = []
    mismatches: list[str] = []

    for card in cards:
        if card["categoria"] not in grimorio_cats:
            for stale in ("rank", "dominio", "tipo_carta", "tipo_dominio", "cor_dominio", "nivel_dominio", "custo_troca"):
                card.pop(stale, None)
            continue

        base = strip_prefix(card["nome"])
        meta = extract_metadata(text, base, card["categoria"])
        if not meta:
            not_found.append(card["nome"])
            continue

        matched += 1
        card.update(meta)
        normalize_card(card)

        if norm(base) in ("livro de tryfar", "livro de tyfar"):
            card["nome"] = "Grimório - Livro de Tyfar"
            card["caminho"] = "/cards/Grimório/Grimório - Livro de Tyfar.jpg"

        if "constr" in norm(base) and "mortal" in norm(base):
            card["nome"] = "Feitiço - Constrição Mortal"
            card["caminho"] = "/cards/Feitiço/Feitiço - Constrição Mortal.jpg"

    with JSON_PATH.open("w", encoding="utf-8") as f:
        json.dump(cards, f, ensure_ascii=False, indent=2)
        f.write("\n")

    print(f"Matched {matched} / {sum(1 for c in cards if c['categoria'] in grimorio_cats)}")
    if not_found:
        print("Not found:")
        for name in not_found:
            print(f"  - {name}")


if __name__ == "__main__":
    main()
