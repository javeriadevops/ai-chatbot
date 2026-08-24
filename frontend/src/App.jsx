import { useEffect, useRef, useState } from "react";

export default function App() {
  // The whole conversation, sent with every request
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState("loading");
  const bottomRef = useRef(null);

  // Read backend info once when the app opens
  useEffect(() => {
    fetch("/health")
      .then((res) => res.json())
      .then((data) => setModel(data.model))
      .catch(() => setModel("offline"));
  }, []);

  // Scroll down whenever a new message arrives
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;

    const next = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessages([...next, { role: "error", content: data.detail }]);
      } else {
        setMessages([...next, { role: "assistant", content: data.reply }]);
      }
    } catch {
      setMessages([...next, { role: "error", content: "Network error." }]);
    }

    setLoading(false);
  }

  function handleKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      send();
    }
  }

  return (
    <div className="flex h-screen flex-col bg-[#131a24] text-[#e3e9f1]">
      <header className="mx-auto flex w-full max-w-3xl items-center gap-3 border-b border-[#2a3644] px-5 py-4 font-mono text-xs">
        <span
          className={`h-2 w-2 rounded-full ${
            loading ? "bg-[#e0a458]" : "bg-[#5fb3a1]"
          }`}
        />
        <span className="font-semibold">ai-chatbot</span>
        <span className="ml-auto text-[#8695a8]">{model}</span>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 overflow-y-auto px-5 py-7">
        {messages.length === 0 && (
          <p className="m-auto font-mono text-[#8695a8]">
            Ask the model something.
          </p>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            className={
              m.role === "user"
                ? "max-w-[78%] self-end whitespace-pre-wrap rounded border-r-2 border-[#e0a458] px-4 py-3 font-mono text-sm"
                : m.role === "error"
                  ? "max-w-[78%] self-start whitespace-pre-wrap rounded border-l-2 border-[#d1615d] bg-[#d1615d]/10 px-4 py-3 font-mono text-sm"
                  : "max-w-[78%] self-start whitespace-pre-wrap rounded border-l-2 border-[#5fb3a1] bg-[#1b2431] px-4 py-3"
            }
          >
            {m.content}
          </div>
        ))}

        {loading && (
          <p className="self-start font-mono text-sm text-[#8695a8]">
            thinking...
          </p>
        )}

        <div ref={bottomRef} />
      </main>

      <footer className="mx-auto flex w-full max-w-3xl gap-3 border-t border-[#2a3644] px-5 py-4">
        <textarea
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message"
          className="flex-1 resize-none rounded border border-[#2a3644] bg-[#1b2431] px-4 py-3 font-mono text-sm outline-none focus:border-[#e0a458]"
        />
        <button
          onClick={send}
          disabled={loading}
          className="rounded bg-[#e0a458] px-5 font-semibold text-[#1a1206] disabled:opacity-40"
        >
          Send
        </button>
      </footer>
    </div>
  );
}