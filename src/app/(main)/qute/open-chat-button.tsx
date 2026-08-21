import { openConversation } from "./actions";
import { Button } from "@/components/ui/Button";

type OpenChatButtonProps = {
  matchId: string;
};

export function OpenChatButton({ matchId }: OpenChatButtonProps) {
  return (
    <form action={openConversation.bind(null, matchId)}>
      <Button type="submit" label="Envoyer un message" />
    </form>
  );
}
