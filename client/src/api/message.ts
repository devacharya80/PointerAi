import { api } from "./axios";

export const sendMessage = async(content:string,conversationId?:string) => {
    if(conversationId){
        const response = await api.post(`/conversations/${conversationId}/messages`,content);
        return response.data
    }
    const response = await api.post(`/conversations/messages`,content);
    return response.data;
}