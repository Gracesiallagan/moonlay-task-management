"""
AI Chatbot service.

Cara kerja (dijelaskan juga di README):
1. Semua task user diambil dari database dan diringkas menjadi konteks (JSON) yang
   terkait dengan pertanyaan.
2. Jika OPENAI_API_KEY diisi di .env -> pertanyaan + konteks task dikirim ke LLM
   (OpenAI Chat Completion) supaya jawaban lebih natural dan bisa memahami
   variasi kalimat bebas.
3. Jika OPENAI_API_KEY kosong -> sistem otomatis fallback ke mode "rule-based"
   (intent matching sederhana berbasis keyword) sehingga fitur chatbot tetap
   berjalan tanpa perlu API key eksternal saat proses review.

Ini membuat fitur chatbot tetap bisa dicoba end-to-end oleh reviewer tanpa
harus punya API key, tapi juga menunjukkan cara mengintegrasikan LLM
sungguhan (OpenAI/Gemini/model open-source) sesuai poin bonus di soal test.
"""
import re
from datetime import datetime, date
from typing import List

from sqlalchemy.orm import Session, joinedload

from app.config import settings
from app.models import Task, TaskStatus


def _serialize_tasks(tasks: List[Task]) -> list[dict]:
    return [
        {
            "title": t.title,
            "status": t.status.value if hasattr(t.status, "value") else t.status,
            "deadline": t.deadline.isoformat() if t.deadline else None,
            "assignee": t.assignee.name if t.assignee else "Belum ada assignee",
        }
        for t in tasks
    ]


def _rule_based_answer(message: str, tasks: List[Task]) -> str:
    msg = message.lower()

    # "berapa jumlah task yang sudah selesai"
    if re.search(r"berapa.*(selesai|done)", msg):
        count = sum(1 for t in tasks if t.status == TaskStatus.done)
        return f"Ada {count} task dengan status Done."

    # "tampilkan semua task yang statusnya belum selesai"
    if re.search(r"(belum selesai|todo|in progress|belum done)", msg):
        pending = [t for t in tasks if t.status != TaskStatus.done]
        if not pending:
            return "Semua task sudah selesai (Done)."
        lines = [f"- {t.title} ({t.status.value})" for t in pending]
        return "Task yang belum selesai:\n" + "\n".join(lines)

    # "tugas apa saja yang deadlinenya hari ini"
    if re.search(r"deadline.*hari ini|hari ini.*deadline", msg):
        today = date.today()
        due_today = [t for t in tasks if t.deadline and t.deadline.date() == today]
        if not due_today:
            return "Tidak ada task dengan deadline hari ini."
        lines = [f"- {t.title} (assignee: {t.assignee.name if t.assignee else '-'})" for t in due_today]
        return "Task dengan deadline hari ini:\n" + "\n".join(lines)

    # "siapa assignee dari task [judul]"
    match = re.search(r"assignee.*task\s+(.*)", msg) or re.search(r"siapa.*mengerjakan\s+(.*)", msg)
    if match:
        query_title = match.group(1).strip(" ?\"'")
        found = next((t for t in tasks if query_title in t.title.lower()), None)
        if found:
            assignee = found.assignee.name if found.assignee else "belum ada assignee"
            return f"Assignee dari task '{found.title}' adalah {assignee}."
        return f"Task dengan judul mengandung '{query_title}' tidak ditemukan."

    # fallback list semua task
    if re.search(r"(semua task|daftar task|list task)", msg):
        if not tasks:
            return "Belum ada task yang tercatat."
        lines = [f"- {t.title} ({t.status.value})" for t in tasks]
        return "Berikut seluruh task:\n" + "\n".join(lines)

    return (
        "Maaf, saya belum memahami pertanyaan itu. Coba tanyakan misalnya:\n"
        "- 'Tampilkan semua task yang statusnya belum selesai'\n"
        "- 'Berapa jumlah task yang sudah selesai?'\n"
        "- 'Tugas apa saja yang deadlinenya hari ini?'\n"
        "- 'Siapa assignee dari task <judul task>?'"
    )


def _llm_answer(message: str, tasks: List[Task]) -> str:
    from openai import OpenAI

    client = OpenAI(api_key=settings.openai_api_key)
    context = _serialize_tasks(tasks)

    system_prompt = (
        "Kamu adalah asisten Task Management yang cerdas dan profesional.\n"
        "TUGAS UTAMA:\n"
        "- Jawab pertanyaan user HANYA berdasarkan Data Task yang diberikan di bawah ini.\n"
        "- Jika informasi yang ditanyakan tidak ditemukan dalam data, katakan dengan sopan: 'Maaf, saya tidak menemukan informasi tersebut pada knowledge base yang tersedia.'\n"
        "- Jangan mencoba untuk menjawab di luar konteks data task.\n"
        "- Gunakan format Markdown yang bersih (tabel atau bullet points) agar mudah dibaca.\n\n"
        "Data Task:\n" + str(context)
    )

    response = client.chat.completions.create(
        model=settings.openai_model,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": message},
        ],
        max_tokens=400,
    )
    return response.choices[0].message.content.strip()


def answer_question(db: Session, message: str) -> str:
    tasks = db.query(Task).options(joinedload(Task.assignee)).all()

    if settings.openai_api_key:
        try:
            return _llm_answer(message, tasks)
        except Exception:
            # Jika panggilan LLM gagal (mis. quota/network), fallback ke rule-based
            # supaya fitur tetap berfungsi.
            return _rule_based_answer(message, tasks)

    return _rule_based_answer(message, tasks)
