"use client";

import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Users } from "lucide-react";

interface UserSelectorProps {
  members: { id: string; name: string | null }[];
  currentViewId: string;
  loggedInUserId: string;
}

export function UserSelector({ members, currentViewId, loggedInUserId }: UserSelectorProps) {
  const router = useRouter();

  const handleValueChange = (userId: string) => {
    // Navigera till den nya URL:en när man väljer en användare
    router.push(`/?user=${userId}`);
  };

  return (
    <div className="flex items-center gap-2">
      <Users className="h-4 w-4 text-muted-foreground" />
      <Select defaultValue={currentViewId} onValueChange={handleValueChange}>
        <SelectTrigger className="w-[200px] bg-white">
          <SelectValue placeholder="Byt medlem" />
        </SelectTrigger>
        <SelectContent>
          {members.map((member) => (
            <SelectItem key={member.id} value={member.id}>
              {member.name} {member.id === loggedInUserId ? "(Jag)" : ""}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}