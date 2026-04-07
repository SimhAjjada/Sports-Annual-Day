import { useState } from "react";
import API from "../api/api";

const Chat = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = input;

    try {
      const res = await API.post("/chat", {
        message: userMsg
      });

      setMessages((prev) => [
        ...prev,
        { user: userMsg },
        { bot: res.data.reply }
      ]);

      setInput("");

    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-5">
      <h1 className="text-2xl font-bold mb-4">AI Chat</h1>

      <div className="border p-3 h-80 overflow-y-auto mb-3 rounded">
        {messages.map((msg, i) => (
          <div key={i} className="mb-2">
            {msg.user && <p><b>You:</b> {msg.user}</p>}
            {msg.bot && (
              <p><b>Bot:</b> {msg.bot}</p>
            )}
          </div>
        ))}
      </div>

      <input
        className="border p-2 w-full mb-2 rounded"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ask something..."
      />

      <button
        onClick={sendMessage}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Send
      </button>
    </div>
  );
};

export default Chat;