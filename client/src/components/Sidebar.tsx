import { Link } from "react-router-dom";
import { useConversations } from "../hooks/useConversations";

export default function Sidebar({ activeId }: { activeId?: string }) {
  const { data, isLoading, error } = useConversations();

  if (isLoading) return <p>Loading conversations...</p>;
  if (error) return <p style={{ color: "red" }}>Failed to load conversations.</p>;

  return (
    <aside>
      <Link to="/chat">+ New chat</Link>

      <ul>
        {data?.conversations.map((c) => (
          <li key={c.id}>
            <Link
              to={`/chat/${c.id}`}
              style={{ fontWeight: c.id === activeId ? "bold" : "normal" }}
            >
              {c.title}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}