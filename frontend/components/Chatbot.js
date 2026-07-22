import { useState, useRef, useEffect } from "react";
import { api } from "../lib/api";

const SUGGESTIONS = [
  "Tampilkan semua task yang statusnya belum selesai",
  "Berapa jumlah task yang sudah selesai?",
  "Tugas apa saja yang deadlinenya hari ini?",
];

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "bot", text: "Halo! Tanyakan apa saja seputar data task Anda 👋" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  async function sendMessage(text) {
    const message = (text ?? input).trim();
    if (!message) return;

    setMessages((prev) => [...prev, { role: "user", text: message }]);
    setInput("");
    setLoading(true);

    try {
      const res = await api.askChatbot(message);
      setMessages((prev) => [...prev, { role: "bot", text: res.reply }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: "bot", text: `Terjadi error: ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {open && (
        <div className="chatbot-panel">
          <div className="chatbot-header">
            <div className="logo-mark" style={{ width: 24, height: 24, fontSize: 14, boxShadow: "none" }}>T</div>
            Task Assistant
          </div>
          <div className="chatbot-messages" ref={scrollRef}>
            {messages.map((m, i) => (
              <div key={i} className={`chatbot-msg ${m.role}`}>
                {m.text}
              </div>
            ))}
            {loading && <div className="chatbot-msg bot">Mengetik...</div>}
          </div>

          {messages.length <= 1 && (
            <div style={{ padding: "0 12px 8px", display: "flex", flexDirection: "column", gap: 6 }}>
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="btn btn-secondary"
                  style={{ fontSize: 12, textAlign: "left" }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <div className="chatbot-input">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Tulis pertanyaan..."
            />
            <button onClick={() => sendMessage()}>Kirim</button>
          </div>
        </div>
      )}

      <button className="chatbot-toggle" onClick={() => setOpen((o) => !o)} aria-label="Buka chatbot">
        {open ? "✕" : "💬"}
      </button>
    </>
  );
}
