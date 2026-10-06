import { useConversations } from "../../hooks/useConversations";

export const ConversationList = () => {
  const { data, isLoading, error } = useConversations();

  console.log("Conversations:", data);

  if (isLoading) {
    return <div>Loading conversations...</div>;
  }

  if (error) {
    return <div>Failed to load conversations</div>;
  }

  return (
    <div>
      <h2>Conversations</h2>

      {data?.map((conversation) => (
        <div key={conversation.id}>
          {conversation.title}
        </div>
      ))}
    </div>
  );
};

export default ConversationList;