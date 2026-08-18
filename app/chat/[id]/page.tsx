import Chat from "@/components/chat";
import { Metadata } from "next";

type ChatPageProps = {
  params: {
    id: string;
  };
}

export const generateMetadata = ({ params }: ChatPageProps): Metadata => {
  return {
    title: `Chat ${params.id}`,
  };
};
 
export default function ChatPage({ params }: ChatPageProps) {
  return <Chat chatId={params.id} />;
} 