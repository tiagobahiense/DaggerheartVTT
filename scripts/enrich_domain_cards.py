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
        "tipo_carta": "Feitiço",
        "tipo_dominio": "Arcano",
        "cor_dominio": "#7C3AED",
        "nivel_dominio": 4,
        "dominio": 4,
        "custo_troca": 2,
    },
    "constricao mortal": {
        "tipo_carta": "Feitiço",
        "tipo_dominio": "Sabedoria",
        "cor_dominio": "#16A34A",
        "nivel_dominio": 4,
        "dominio": 4,
        "custo_troca": 1,
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


def resolve_domain(dom_raw: str) -> tuple[str, str]:
    key = norm(dom_raw)
    for k, (domain, color) in DOMAIN_MAP.items():
        if key == norm(k) or key.startswith(norm(k)):
            return DOMAIN_DISPLAY[domain], color
    return dom_raw.title(), "#6B7280"


def parse_tipo_block(snippet: str) -> dict | None:
    tipo_m = TIPO_RE.search(snippet)
    alt_m = TIPO_ALT_RE.search(snippet) if not tipo_m else None
    if not tipo_m and not alt_m:
        return None

    custo_m = CUSTO_RE.search(snippet)
    meta: dict = {}

    if tipo_m:
        raw_tipo = tipo_m.group(1)
        if raw_tipo.lower().startswith("grim"):
            tipo_carta = "Grimório"
        elif raw_tipo.lower().startswith("feit"):
            tipo_carta = "Feitiço"
        else:
            tipo_carta = "Talento"

        dominio, cor = resolve_domain(tipo_m.group(2))
        nivel = int(tipo_m.group(3))
        meta = {
            "tipo_carta": tipo_carta,
            "tipo_dominio": dominio,
            "cor_dominio": cor,
            "nivel_dominio": nivel,
            "dominio": nivel,
        }
    else:
        assert alt_m is not None
        nivel = int(alt_m.group(1))
        dominio, cor = resolve_domain(alt_m.group(2))
        meta = {
            "tipo_carta": "Feitiço",
            "tipo_dominio": dominio,
            "cor_dominio": cor,
            "nivel_dominio": nivel,
            "dominio": nivel,
        }

    if custo_m:
        meta["custo_troca"] = int(custo_m.group(1))
    return meta


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


def extract_metadata(text: str, base: str) -> dict | None:
    base_norm = norm(base)
    manual = MANUAL_OVERRIDES.get(base_norm)
    if not manual and "constr" in base_norm and "mortal" in base_norm:
        manual = MANUAL_OVERRIDES["constricao mortal"]
    if manual:
        return dict(manual)

    search_titles = [base.upper()]
    search_titles.extend(SEARCH_ALIASES.get(norm(base), []))

    for title in search_titles:
        if title == "DEFENSIVO":
            continue
        for idx in find_title_positions(text, title):
            snippet = text[idx : idx + 450]
            if title == "IMPACTO" and "DEFENSIVO" not in snippet[:120]:
                continue
            if title == "PALAVRAS" and "TRANQUILIZANTES" not in snippet[:80]:
                continue
            meta = parse_tipo_block(snippet)
            if meta:
                return meta

    return None


def main() -> None:
    with pdfplumber.open(PDF_PATH) as pdf:
        text = "\n".join((pdf.pages[p].extract_text() or "") for p in range(329, 345))

    with JSON_PATH.open(encoding="utf-8") as f:
        cards = json.load(f)

    grimorio_cats = {"Feitiço", "Grimório", "Talento"}
    matched = 0
    not_found: list[str] = []

    for card in cards:
        if card["categoria"] not in grimorio_cats:
            continue

        card.pop("rank", None)

        base = strip_prefix(card["nome"])
        meta = extract_metadata(text, base)
        if not meta:
            not_found.append(card["nome"])
            continue

        matched += 1
        card.update(meta)

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
