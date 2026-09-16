#!/usr/bin/env python3
"""
=============================================================================
EVALUADOR AUTOMÁTICO DE TRABAJOS PRÁCTICOS - CÁTEDRA LABORATORIO I
Universidad Católica de Santiago del Estero (UCSE) - DASS
Tecnicatura Universitaria en Automatización y Robótica / Informática
Ciclo Lectivo 2026 | JTP: Ing. Fabio D. Argañaraz
=============================================================================
Uso:
    python autograder_tp2.py [respuestas_tp2.json]
    python autograder_tp2.py respuestas_tp2.json --json
=============================================================================
"""

import sys
import os
import json
import hashlib
import argparse
from datetime import datetime

# Asegurar compatibilidad UTF-8 en consolas Windows
if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

RUBRIC_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "rubric_tp2.json")
CATEDRA_SALT = "LAB1_IA_2026_CatedraArganaraz_SecretSalt"

def compute_hash(ex_id, item_key, val):
    clean_val = str(val).strip().lower() if val is not None else ""
    raw = f"{ex_id}:{item_key}:{clean_val}:{CATEDRA_SALT}"
    return hashlib.sha256(raw.encode('utf-8')).hexdigest()

def load_json(filepath):
    if not os.path.exists(filepath):
        print(f"[ERROR] No se encontró el archivo: {filepath}", file=sys.stderr)
        sys.exit(1)
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"[ERROR] Error al leer JSON '{filepath}': {e}", file=sys.stderr)
        sys.exit(1)

def grade_submission(submission, rubric):
    student = submission.get("student", {})
    answers = submission.get("answers", {})
    exercises_rubric = rubric.get("exercises", {})
    
    total_score = 0
    max_total_score = rubric.get("max_score", 100)
    exercise_results = {}

    for ex_id, ex_spec in exercises_rubric.items():
        weight = ex_spec.get("weight", 10)
        feedback = ex_spec.get("feedback", "")
        biblio = ex_spec.get("biblio", "")
        student_ans = answers.get(ex_id)

        ex_score = 0
        details = []

        # Formato Seguro (Diccionario de Hashes SHA-256)
        if "hashes" in ex_spec:
            expected_hashes = ex_spec["hashes"]
            total_items = len(expected_hashes)

            for item_key, h_info in expected_hashes.items():
                if isinstance(h_info, dict):
                    exp_hash = h_info.get("hash")
                    item_weight = h_info.get("weight", weight / total_items)
                    item_desc = h_info.get("desc", item_key)
                else:
                    exp_hash = h_info
                    item_weight = weight / total_items
                    item_desc = item_key

                actual_val = student_ans.get(item_key) if isinstance(student_ans, dict) else None
                actual_hash = compute_hash(ex_id, item_key, actual_val)
                is_correct = (actual_hash == exp_hash)

                if is_correct:
                    ex_score += item_weight

                details.append({
                    "item": item_key,
                    "desc": item_desc,
                    "submitted": actual_val,
                    "is_correct": is_correct,
                    "weight": item_weight
                })

        # Formato Simple (Hash directo)
        elif "hash" in ex_spec:
            expected_hash = ex_spec["hash"]
            student_hash = compute_hash(ex_id, "root", student_ans)
            is_correct = (student_hash == expected_hash)
            if is_correct:
                ex_score = weight
            details.append({
                "item": "Respuesta",
                "desc": "Opción seleccionada",
                "submitted": student_ans,
                "is_correct": is_correct,
                "weight": weight
            })

        # Fallback Rúbrica Maestra Docente
        elif "items" in ex_spec:
            items_spec = ex_spec["items"]
            for item_key, item_info in items_spec.items():
                expected_val = item_info.get("expected")
                item_weight = item_info.get("weight", weight / len(items_spec))
                actual_val = student_ans.get(item_key) if isinstance(student_ans, dict) else None
                is_correct = (str(actual_val).strip().lower() == str(expected_val).strip().lower()) if actual_val is not None else False
                if is_correct:
                    ex_score += item_weight
                details.append({
                    "item": item_key,
                    "desc": item_info.get("desc", item_key),
                    "submitted": actual_val,
                    "is_correct": is_correct,
                    "weight": item_weight
                })

        ex_score = round(ex_score, 2)
        total_score += ex_score
        exercise_results[ex_id] = {
            "score": ex_score,
            "max_score": weight,
            "passed": ex_score == weight,
            "feedback": feedback,
            "biblio": biblio,
            "details": details
        }

    final_score = round(total_score, 2)
    normalized_10 = round((final_score / max_total_score) * 10, 2)

    return {
        "student": student,
        "total_score": final_score,
        "max_score": max_total_score,
        "grade_10": normalized_10,
        "is_approved": normalized_10 >= 4.0,
        "is_promoted": normalized_10 >= 7.0,
        "exercises": exercise_results,
        "graded_at": datetime.now().isoformat()
    }

def print_text_report(report):
    student = report["student"]
    print("=" * 78)
    print(" 🏛️  UNIVERSIDAD CATÓLICA DE SANTIAGO DEL ESTERO - DASS")
    print(" 🤖 Cátedra: Laboratorio I (IA y Agentes Racionales) - Ciclo 2026")
    print(" 👨‍🏫 JTP: Ing. Fabio D. Argañaraz")
    print("=" * 78)
    print(f" Estudiante : {student.get('name', 'N/A')}")
    print(f" DNI        : {student.get('dni', 'N/A')}")
    print(f" Email      : {student.get('email', 'N/A')}")
    print(f" Comisión   : {student.get('comision', 'N/A')}")
    print(f" GitHub     : {student.get('github_user', 'N/A')}")
    print("-" * 78)
    print(" DESGLOSE POR EJERCICIO:")
    print("-" * 78)

    for ex_id, res in report["exercises"].items():
        score = res["score"]
        max_s = res["max_score"]
        icon = "✅" if res["passed"] else ("⚠️" if score > 0 else "❌")
        
        # Barra gráfica ASCII
        progress_len = 10
        filled = int(round((score / max_s) * progress_len)) if max_s > 0 else 0
        bar = "■" * filled + "·" * (progress_len - filled)

        print(f" {icon} {ex_id:<36} [{bar}] {score:>5.1f} / {max_s:>4.1f} pts")

        if not res["passed"]:
            for d in res["details"]:
                if not d["is_correct"]:
                    print(f"    ↳ 🔍 Discrepancia en '{d['item']}': Valor recibido -> '{d['submitted']}'")
            if res.get("biblio"):
                print(f"    📖 Guía de estudio: {res['biblio']}")
            if res.get("feedback"):
                print(f"    💡 Consejo pedagógico: {res['feedback']}")

    print("=" * 78)
    final = report["total_score"]
    max_s = report["max_score"]
    grade_10 = report["grade_10"]

    print(f" 📊 PUNTAJE FINAL ACUMULADO : {final:5.1f} / {max_s:5.1f} puntos")
    print(f" 🎯 CALIFICACIÓN ACADÉMICA : {grade_10:5.1f} / 10.0")

    if grade_10 >= 7.0:
        print(" 🌟 ESTADO : ¡EXCELENTE! Aprobado con nivel de Promoción.")
    elif grade_10 >= 4.0:
        print(" 📘 ESTADO : APROBADO (Regular).")
    else:
        print(" ⚠️  ESTADO : NO ALCANZÓ EL PUNTAJE MÍNIMO (4.0). Revisa las sugerencias.")
    print("=" * 78)

def main():
    parser = argparse.ArgumentParser(description="Autoevaluador oficial de Laboratorio I - TP2 (UCSE DASS)")
    parser.add_argument("answers_file", nargs="?", default="respuestas_tp2.json", help="Ruta al archivo respuestas_tp2.json")
    parser.add_argument("--json", action="store_true", help="Imprimir salida exclusivamente en JSON para CI/CD")
    parser.add_argument("--rubric", default=RUBRIC_FILE, help="Ruta a la rúbrica de evaluación")
    args = parser.parse_args()

    submission = load_json(args.answers_file)
    rubric = load_json(args.rubric)

    report = grade_submission(submission, rubric)

    if args.json:
        print(json.dumps(report, indent=2, ensure_ascii=False))
    else:
        print_text_report(report)

if __name__ == "__main__":
    main()
