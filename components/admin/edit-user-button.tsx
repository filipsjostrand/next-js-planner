"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { updateUserName } from "@/app/actions/admin";

export function EditUserButton({ id, currentName }: { id: string, currentName: string }) {
  const [isPending, setIsPending] = useState(false);

  const onEdit = async () => {
    const newName = prompt("Ange nytt namn:", currentName);

    if (!newName || newName === currentName) return;

    setIsPending(true);
    const result = await updateUserName(id, newName);
    if (result.error) alert(result.error);
    setIsPending(false);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onEdit}
      disabled={isPending}
      className="h-8 w-8 p-0"
    >
      <Pencil className="h-4 w-4 text-slate-500" />
    </Button>
  );
}