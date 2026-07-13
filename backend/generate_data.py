"""
One-time / re-runnable generator for the dashboard's mock CSVs.

Why a generator instead of hand-typed CSVs: the dashboard now supports real
year/month filtering, which means every dataset needs a row per (anio, mes)
combination. Hand-authoring that many rows invites arithmetic mistakes (e.g.
activadas + bloqueadas + pendientes + otros must equal enviadas). This script
derives every combo from the one real baseline (2026 / ABR, taken verbatim
from the source mockups) with a deterministic growth curve + seeded jitter,
so the numbers vary year to year but stay internally consistent.

Re-run any time with `python generate_data.py` to reshuffle the mock years;
the baseline combo (2026-ABR) is always reproduced exactly.
"""

import csv
import random
from datetime import date, timedelta
from pathlib import Path

DATA_DIR = Path(__file__).parent / "data"

MONTHS = ["ENE", "ABR", "JUL", "OCT"]
MONTH_NUM = {"ENE": 1, "ABR": 4, "JUL": 7, "OCT": 10}

# Chronological combos. 2026 stops at ABR: JUL/OCT 2026 are in the future
# relative to the dashboard's "today" (2026-07-13) and have no actuals yet.
COMBOS = (
    [(2024, m) for m in MONTHS]
    + [(2025, m) for m in MONTHS]
    + [(2026, "ENE"), (2026, "ABR")]
)
BASELINE = (2026, "ABR")
BASELINE_IDX = COMBOS.index(BASELINE)
N = len(COMBOS)


def growth_factor(i: int) -> float:
    """0.70 at the oldest combo, exactly 1.0 at the baseline combo."""
    return 0.70 + i * (1.0 - 0.70) / BASELINE_IDX


def month_end(year: int, month_code: str) -> date:
    m = MONTH_NUM[month_code]
    if m == 12:
        return date(year, 12, 31)
    return date(year, m + 1, 1) - timedelta(days=1)


def fecha_consulta(year: int, month_code: str) -> date:
    # Mirrors the source mockup's ~56-day lag: caducidad 30/04/2026 -> consulta 25/06/2026.
    return month_end(year, month_code) + timedelta(days=56)


def fmt(d: date) -> str:
    return d.strftime("%d/%m/%Y")


def write_csv(name, header, rows):
    path = DATA_DIR / f"{name}.csv"
    with path.open("w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(header)
        w.writerows(rows)
    print(f"  {name}.csv: {len(rows)} rows")


def rng_for(anio, mes, salt):
    return random.Random(f"{anio}-{mes}-{salt}")


def clip(v, lo, hi):
    return max(lo, min(hi, v))


# ---------------------------------------------------------------- combos.csv
def gen_combos():
    rows = []
    for i, (anio, mes) in enumerate(COMBOS):
        rows.append([anio, mes, i, fmt(fecha_consulta(anio, mes))])
    write_csv("combos", ["anio", "mes", "idx", "fecha_consulta"], rows)


# ------------------------------------------------------------ funnel_meta.csv
def gen_funnel_meta():
    rows = []
    for i, (anio, mes) in enumerate(COMBOS):
        gf = growth_factor(i)
        if (anio, mes) == BASELINE:
            total, excl, camb = 45681, 19.0, 1.0
        else:
            r = rng_for(anio, mes, "meta")
            total = round(45681 * gf)
            excl = clip(round(19 + r.uniform(-3, 3), 1), 14, 23)
            camb = clip(round(1 + r.uniform(-0.6, 0.6), 2), 0.2, 2.5)
        rows.append([anio, mes, total, excl, camb])
    write_csv("funnel_meta", ["anio", "mes", "total_tarjetas", "exclusiones_pct", "cambios_pct"], rows)


# --------------------------------------------------------------- desglose.csv
BASE_DESGLOSE = [
    ("EMPRESAS", "CREDITO", 2192, 1447, 257, 432, 56),
    ("EMPRESAS", "DEBITO", 2742, 1543, 475, 640, 84),
    ("PARTICULARES", "CREDITO", 9486, 6597, 2684, 44, 161),
    ("PARTICULARES", "DEBITO", 22496, 17747, 4520, 29, 200),
    ("PARTICULARES", "OTROS", 26, 14, 0, 12, 0),
]


def gen_desglose():
    rows = []
    for i, (anio, mes) in enumerate(COMBOS):
        gf = growth_factor(i)
        is_baseline = (anio, mes) == BASELINE
        r = rng_for(anio, mes, "desglose")
        for seg, tipo, enviadas0, act0, blo0, pen0, otr0 in BASE_DESGLOSE:
            if is_baseline:
                rows.append([anio, mes, seg, tipo, enviadas0, act0, blo0, pen0, otr0])
                continue
            enviadas = max(0, round(enviadas0 * gf * r.uniform(0.94, 1.06)))
            act_rate = clip(act0 / enviadas0 + r.uniform(-0.04, 0.04), 0.45, 0.85)
            blo_rate = clip(blo0 / enviadas0 + r.uniform(-0.03, 0.03), 0.05, 0.35)
            pen_rate = clip(pen0 / enviadas0 + r.uniform(-0.01, 0.01), 0, 0.1)
            activadas = round(enviadas * act_rate)
            bloqueadas = round(enviadas * blo_rate)
            pendientes = round(enviadas * pen_rate)
            otros = max(0, enviadas - activadas - bloqueadas - pendientes)
            rows.append([anio, mes, seg, tipo, enviadas, activadas, bloqueadas, pendientes, otros])
    write_csv(
        "desglose",
        ["anio", "mes", "segmento", "tipo", "enviadas", "activadas", "bloqueadas", "pendientes", "otros"],
        rows,
    )
    return rows


# -------------------------------------------------------- estampacion*.csv
def gen_estampacion(desglose_rows):
    totals = {}
    for anio, mes, seg, tipo, enviadas, *_ in desglose_rows:
        totals[(anio, mes)] = totals.get((anio, mes), 0) + int(enviadas)

    est_rows, lote_rows = [], []
    for i, (anio, mes) in enumerate(COMBOS):
        is_baseline = (anio, mes) == BASELINE
        total = totals[(anio, mes)]
        r = rng_for(anio, mes, "estampacion")
        envio1 = month_end(anio, mes).replace(day=1) - timedelta(days=16)
        envio2 = envio1 - timedelta(days=1)

        if is_baseline:
            e1, e2, p1, p2 = 16942, 20000, 16, 14
        else:
            split = clip(0.459 + r.uniform(-0.03, 0.03), 0.35, 0.6)
            e1 = round(total * split)
            e2 = total - e1
            p1 = clip(round(15 + r.uniform(-3, 3)), 10, 20)
            p2 = clip(round(14 + r.uniform(-3, 3)), 10, 20)

        for name, envio, enviadas, plazo, fecha_envio in (
            ("Estampador 1", envio1, e1, p1, envio1),
            ("Estampador 2", envio2, e2, p2, envio2),
        ):
            objetivo = 15
            vs = plazo - objetivo
            est_rows.append([anio, mes, name, fmt(fecha_envio), enviadas, 100, plazo, objetivo, vs])
            lote_num = 1 if name == "Estampador 1" else 2
            recepcion = fecha_envio + timedelta(days=plazo)
            lote_rows.append(
                [anio, mes, f"Lote {lote_num}", fmt(fecha_envio), fmt(recepcion), enviadas, enviadas, 0, plazo]
            )

    write_csv(
        "estampacion",
        ["anio", "mes", "estampador", "fecha_envio", "enviadas", "estampadas_pct", "plazo_dias", "objetivo_dias", "vs_objetivo_dias"],
        est_rows,
    )
    write_csv(
        "estampacion_lotes",
        ["anio", "mes", "lote", "fecha_envio", "fecha_recepcion", "enviadas", "recibidas", "no_estampadas", "plazo_dias"],
        lote_rows,
    )


# --------------------------------------------------- activacion_evolucion.csv
BASE_CURVE = [("D-30", 0), ("D-20", 20), ("D-10", 40), ("D-0", 69), ("D+15", 70), ("D+30", 71), ("D+45", 73)]


def gen_activacion(desglose_rows):
    act_total, env_total = {}, {}
    for anio, mes, seg, tipo, enviadas, activadas, *_ in desglose_rows:
        k = (anio, mes)
        act_total[k] = act_total.get(k, 0) + int(activadas)
        env_total[k] = env_total.get(k, 0) + int(enviadas)

    rows = []
    for anio, mes in COMBOS:
        final_pct = round(100 * act_total[(anio, mes)] / env_total[(anio, mes)])
        consulta_label = fmt(fecha_consulta(anio, mes))
        for punto, base_pct in BASE_CURVE:
            scaled = round(base_pct * final_pct / 74) if base_pct else 0
            rows.append([anio, mes, punto, scaled])
        rows.append([anio, mes, consulta_label, final_pct])
    write_csv("activacion_evolucion", ["anio", "mes", "punto", "pct"], rows)


# ---------------------------------------------------- gasto_comparativa.csv
BASE_GASTO = [
    ("<=-80%", 600), ("-80/-60%", 1200), ("-60/-40%", 2100), ("-40/-20%", 4200),
    ("-20/0%", 7500), ("0/+20%", 6300), ("+20/+40%", 4200), ("+40/+60%", 1800), (">=+60%", 600),
]


def gen_gasto():
    rows = []
    for i, (anio, mes) in enumerate(COMBOS):
        gf = growth_factor(i)
        r = rng_for(anio, mes, "gasto")
        for mes_rel in ["M0", "M1", "M2"]:
            for rango, valor0 in BASE_GASTO:
                is_baseline = (anio, mes) == BASELINE
                valor = valor0 if is_baseline else round(valor0 * gf * r.uniform(0.92, 1.08))
                rows.append([anio, mes, mes_rel, rango, valor])
        for rango, _ in BASE_GASTO:
            rows.append([anio, mes, "M3", rango, 0])
    write_csv("gasto_comparativa", ["anio", "mes", "mes_rel", "rango", "valor"], rows)


# ----------------------------------------------------- bloqueo_*.csv
def gen_bloqueo(desglose_rows):
    blo_total = {}
    for anio, mes, seg, tipo, enviadas, activadas, bloqueadas, *_ in desglose_rows:
        k = (anio, mes)
        blo_total[k] = blo_total.get(k, 0) + int(bloqueadas)

    motivos_rows, clientes_rows, segmento_rows, territorio_rows = [], [], [], []

    prev_total = None
    for anio, mes in COMBOS:
        total = blo_total[(anio, mes)]
        mom_dir = "up" if prev_total is not None and total >= prev_total else "down"
        prev_total = total
        is_baseline = (anio, mes) == BASELINE
        r = rng_for(anio, mes, "bloqueo")

        # motivos: perdida / robada / falsificada ratios from baseline (7534/399/3 of 7936)
        perdida = round(total * 7534 / 7936)
        robada = round(total * 399 / 7936)
        falsificada = max(0, total - perdida - robada)
        cliente = round(total * 2642 / 7936)
        automatico = total - cliente
        motivos_rows += [
            [anio, mes, "total", "Total", total, mom_dir],
            [anio, mes, "motivo", "Perdida", perdida, mom_dir],
            [anio, mes, "motivo", "Robada", robada, "down" if not is_baseline and r.random() < 0.5 else mom_dir],
            [anio, mes, "motivo", "Falsificada", falsificada, "down"],
            [anio, mes, "origen", "Cliente", cliente, mom_dir],
            [anio, mes, "origen", "Automatico", automatico, "down" if mom_dir == "up" else "up"],
        ]

        clientes_total = round(total * 7681 / 7936)
        con_otra = round(clientes_total * 0.69)
        con_otra_mismo = clientes_total - con_otra
        clientes_rows += [
            [anio, mes, "Total", clientes_total, "", mom_dir],
            [anio, mes, "Con otra tarjeta BS", con_otra, 69, mom_dir],
            [anio, mes, "Con otra tarjeta BS mismo tipo", con_otra_mismo, 31, "down" if mom_dir == "up" else "up"],
        ]

        particulares = round(clientes_total * 0.67)
        empresas = round(clientes_total * 0.20)
        banca = clientes_total - particulares - empresas
        segmento_rows += [
            [anio, mes, "Particulares", particulares, 67],
            [anio, mes, "Empresas", empresas, 20],
            [anio, mes, "Banca Privada", banca, 13],
        ]

        for codigo, territorio, valor0 in BASE_TERRITORIO:
            valor = valor0 if is_baseline else round(valor0 * (total / 7936) * r.uniform(0.9, 1.1))
            territorio_rows.append([anio, mes, codigo, territorio, valor])

    write_csv("bloqueo_motivos", ["anio", "mes", "categoria", "label", "valor", "mom_dir"], motivos_rows)
    write_csv("bloqueo_clientes", ["anio", "mes", "label", "valor", "pct", "mom_dir"], clientes_rows)
    write_csv("bloqueo_segmento", ["anio", "mes", "segmento", "valor", "pct"], segmento_rows)
    write_csv("bloqueo_territorio", ["anio", "mes", "codigo", "territorio", "valor"], territorio_rows)


BASE_TERRITORIO = [
    ("CT", "Cataluna", 2890), ("MD", "Comunidad de Madrid", 1740), ("VC", "Comunidad Valenciana", 1120),
    ("AN", "Andalucia", 890), ("PV", "Pais Vasco", 540), ("GA", "Galicia", 320), ("CL", "Castilla y Leon", 210),
    ("CM", "Castilla-La Mancha", 180), ("AR", "Aragon", 160), ("CN", "Canarias", 150),
    ("MC", "Region de Murcia", 140), ("IB", "Islas Baleares", 120), ("AS", "Asturias", 90),
    ("EX", "Extremadura", 80), ("NC", "Navarra", 70), ("CB", "Cantabria", 60), ("RI", "La Rioja", 40),
]


# ----------------------------------------------------- comunicaciones_*.csv
BASE_HITOS = [
    ("Bloqueo por inactividad", "D-120", 58240, 57110, 38, 9),
    ("Inicio de renovacion", "D-58", 196830, 193400, 44, 13),
    ("Aviso de envio", "D-30", 212470, 209900, 47, 15),
    ("Recordatorios de activacion", "D-25 / D-20 / D-17 / D-9", 252910, 247560, 40, 9),
]
BASE_CANALES = [("Email", 39, 9), ("SMS", 35, 8), ("Push", 54, 16)]


def gen_comunicaciones():
    kpi_rows, hito_rows, funnel_rows, canal_rows = [], [], [], []
    for i, (anio, mes) in enumerate(COMBOS):
        gf = growth_factor(i)
        is_baseline = (anio, mes) == BASELINE
        r = rng_for(anio, mes, "comms")

        enviadas_total = 720450 if is_baseline else round(720450 * gf * r.uniform(0.95, 1.05))
        apertura = 42 if is_baseline else clip(round(42 + r.uniform(-5, 5)), 25, 55)
        ctr = 11 if is_baseline else clip(round(11 + r.uniform(-3, 3)), 5, 18)
        canal_top = 54 if is_baseline else clip(round(54 + r.uniform(-6, 6)), 35, 65)

        kpi_rows += [
            [anio, mes, "enviadas", "Comunicaciones enviadas (Ene-Abr)", enviadas_total],
            [anio, mes, "apertura", "Tasa de apertura media", apertura],
            [anio, mes, "ctr", "Tasa de clic media (CTR)", ctr],
            [anio, mes, "canal_top", "Canal con mayor tasa de apertura", canal_top],
        ]

        hscale = enviadas_total / 720450
        for hito, momento, env0, ent0, ap0, cl0 in BASE_HITOS:
            enviados = round(env0 * hscale)
            entregados = round(ent0 * hscale)
            apx = ap0 if is_baseline else clip(round(ap0 + r.uniform(-4, 4)), 15, 60)
            clx = cl0 if is_baseline else clip(round(cl0 + r.uniform(-3, 3)), 3, 22)
            hito_rows.append([anio, mes, hito, momento, "SMS / Push / Email", enviados, entregados, apx, clx])

        entregados_pct = 98
        abiertos_pct = apertura
        clics_pct = ctr
        enviados_f = enviadas_total
        entregados_f = round(enviados_f * entregados_pct / 100)
        abiertos_f = round(enviados_f * abiertos_pct / 100)
        clics_f = round(enviados_f * clics_pct / 100)
        funnel_rows += [
            [anio, mes, "Enviados", enviados_f, 100],
            [anio, mes, "Entregados", entregados_f, entregados_pct],
            [anio, mes, "Abiertos", abiertos_f, abiertos_pct],
            [anio, mes, "Clics", clics_f, clics_pct],
        ]

        for canal, ap0, cl0 in BASE_CANALES:
            apx = ap0 if is_baseline else clip(round(ap0 + r.uniform(-5, 5)), 15, 65)
            clx = cl0 if is_baseline else clip(round(cl0 + r.uniform(-3, 3)), 2, 22)
            canal_rows.append([anio, mes, canal, apx, clx])

    write_csv("comunicaciones_kpis", ["anio", "mes", "key", "label", "valor"], kpi_rows)
    write_csv("comunicaciones_hitos", ["anio", "mes", "hito", "momento", "canales", "enviados", "entregados", "apertura", "clic"], hito_rows)
    write_csv("comunicaciones_funnel", ["anio", "mes", "etapa", "valor", "pct"], funnel_rows)
    write_csv("comunicaciones_canales", ["anio", "mes", "canal", "apertura", "clic"], canal_rows)


def main():
    print(f"Generating {N} anio/mes combos ({COMBOS[0]} .. {COMBOS[-1]}), baseline = {BASELINE}")
    gen_combos()
    gen_funnel_meta()
    desglose_rows = gen_desglose()
    gen_estampacion(desglose_rows)
    gen_activacion(desglose_rows)
    gen_gasto()
    gen_bloqueo(desglose_rows)
    gen_comunicaciones()
    print("Done.")


if __name__ == "__main__":
    main()
