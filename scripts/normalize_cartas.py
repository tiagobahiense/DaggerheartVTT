"""Normalize cartas.json to the canonical domain card schema."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
JSON_PATH = ROOT / "src" / "data" / "cartas.json"

GRIMORIO_CATS = {"Feitiço", "Grimório", "Talento"}

# Correções manuais (livro básico, apêndice cartas de domínio)
MANUAL_FIXES: dict[str, dict] = {
    "Feitiço - Adivinhação": {
        "tipo_dominio": "Esplendor",
        "cor_dominio": "#CA8A04",
        "nivel_dominio": 4,
        "custo_troca": 1,
    },
    "Feitiço - da Natureza": {
        "tipo_dominio": "Sabedoria",
        "cor_dominio": "#16A34A",
        "nivel_dominio": 2,
        "custo_troca": 1,
    },
    "Feitiço - Dom Arcano": {
        "tipo_dominio": "Arcano",
        "cor_dominio": "#7C3AED",
        "nivel_dominio": 7,
        "custo_troca": 2,
    },
    "Feitiço - Lampejo Hipnótico": {
        "tipo_dominio": "Graça",
        "cor_dominio": "#DB2777",
        "nivel_dominio": 3,
        "custo_troca": 1,
    },
    "Feitiço - Muralha": {
        "tipo_dominio": "Códice",
        "cor_dominio": "#2563EB",
        "nivel_dominio": 5,
        "custo_troca": 2,
    },
    "Talento - Caçador Sombrio": {
        "tipo_dominio": "Meia-noite",
        "cor_dominio": "#374151",
        "nivel_dominio": 8,
        "custo_troca": 2,
    },
    "Talento - Dom da Graça": {
        "tipo_dominio": "Graça",
        "cor_dominio": "#DB2777",
        "nivel_dominio": 7,
        "custo_troca": 1,
    },
    "Talento - Dom do Códice": {
        "tipo_dominio": "Códice",
        "cor_dominio": "#2563EB",
        "nivel_dominio": 7,
        "custo_troca": 2,
    },
    "Talento - Dom do Esplendor": {
        "tipo_dominio": "Esplendor",
        "cor_dominio": "#CA8A04",
        "nivel_dominio": 7,
        "custo_troca": 2,
    },
    "Talento - Palavras Inspiradoras": {
        "tipo_dominio": "Graça",
        "cor_dominio": "#DB2777",
        "nivel_dominio": 1,
        "custo_troca": 1,
    },
    "Talento - Santuário Selvagem": {
        "tipo_dominio": "Sabedoria",
        "cor_dominio": "#16A34A",
        "nivel_dominio": 9,
        "custo_troca": 2,
    },
}


def normalize_domain_card(card: dict) -> None:
    card.pop("rank", None)
    card.pop("tipo_carta", None)

    if card["nome"] in MANUAL_FIXES:
        card.update(MANUAL_FIXES[card["nome"]])

    if "nivel_dominio" in card:
        card["dominio"] = card["nivel_dominio"]
    elif "dominio" in card and "nivel_dominio" not in card:
        card["nivel_dominio"] = card["dominio"]


def main() -> None:
    with JSON_PATH.open(encoding="utf-8") as f:
        cards = json.load(f)

    for card in cards:
        if card["categoria"] in GRIMORIO_CATS:
            normalize_domain_card(card)
        else:
            for stale in (
                "rank",
                "tipo_carta",
                "tipo_dominio",
                "cor_dominio",
                "nivel_dominio",
                "custo_troca",
            ):
                card.pop(stale, None)

    with JSON_PATH.open("w", encoding="utf-8") as f:
        json.dump(cards, f, ensure_ascii=False, indent=2)
        f.write("\n")

    grim = [c for c in cards if c["categoria"] in GRIMORIO_CATS]
    print(f"Normalized {len(grim)} domain cards")
    print(f"  tipo_dominio: {sum(1 for c in grim if c.get('tipo_dominio'))}")
    print(f"  nivel_dominio: {sum(1 for c in grim if c.get('nivel_dominio'))}")
    print(f"  custo_troca: {sum(1 for c in grim if c.get('custo_troca') is not None)}")
    print(f"  rank (stale): {sum(1 for c in grim if 'rank' in c)}")
    print(f"  tipo_carta (stale): {sum(1 for c in grim if 'tipo_carta' in c)}")


if __name__ == "__main__":
    main()
