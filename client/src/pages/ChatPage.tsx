import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getConversationDetail } from "../api/conversations";
import { useChat } from "../hooks/useChat";
import Sidebar from "../components/SideBar";

export default function ChatPage() {
  const { conversationId } = useParams<{ conversationId?: string }>();
  const navigate = useNavigate();
  const [input, setInput] = useState("");

  const { data: conversation } = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: () => getConversationDetail(conversationId!),
    enabled: !!conversationId,
  });

  const { sendMessage, streamingText, isStreaming, error } = useChat({
    conversationId,
    onConversationCreated: (id) => navigate(`/chat/${id}`, { replace: true }),
  });

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;

    setInput("");
    await sendMessage(text);
  };

  return (
    // inside the return:
    <div style={{ display: "flex" }}>
      <Sidebar activeId={conversationId} />
      <div style={{ flex: 1 }}>
        {/* existing chat content */}
        <div>
          <h1>Chat {conversationId ?? "(new)"}</h1>

          <div>
            {conversation?.messages.map((m) =>
  m.type === "CLARIFICATION_QUESTION" ? (
    <div key={m.id}>
      <p><strong>ASSISTANT:</strong> {m.content}</p>
      <div>
        {m.options?.map((option) => (
          <button
            key={option}
            type="button"
            disabled={isStreaming}
            onClick={() => sendMessage(option)}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  ) : (
    <p key={m.id}>
      <strong>{m.role}:</strong> {m.content}
    </p>
  ),
)}

            {isStreaming && (
              <p>
                <strong>ASSISTANT:</strong> {streamingText}
              </p>
            )}
          </div>

          {error && <p style={{ color: "red" }}>{error}</p>}

          <form onSubmit={handleSend}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message"
              disabled={isStreaming}
            />
            <button type="submit" disabled={isStreaming}>
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
