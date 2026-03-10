"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronsUpDown, Users, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface UserSelectorProps {
  members: {
    id: string;
    name: string | null;
    groupNames?: string;
  }[];
  currentViewId: string;
  loggedInUserId: string;
}

export function UserSelector({ members, currentViewId, loggedInUserId }: UserSelectorProps) {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  const selectedUser = members.find((m) => m.id === currentViewId);

  const handleSelect = (userId: string) => {
    setOpen(false);
    if (userId === loggedInUserId) {
      router.push("/");
    } else {
      router.push(`/?user=${userId}`);
    }
  };

  // Funktion för att skapa initialer från namn
  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="flex items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[240px] md:w-[280px] justify-between bg-white shadow-sm border-slate-200 hover:bg-slate-50 transition-all active:scale-95 h-11 rounded-xl"
          >
            <div className="flex items-center gap-2 truncate">
              <div className={cn(
                "h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 shadow-sm",
                currentViewId === loggedInUserId ? "bg-primary" : "bg-blue-500"
              )}>
                {getInitials(selectedUser?.name || "J")}
              </div>
              <div className="flex flex-col items-start truncate leading-tight">
                <span className="truncate font-bold text-sm text-slate-900">
                  {selectedUser?.id === loggedInUserId
                    ? "Min Planering"
                    : selectedUser?.name || "Välj medlem"}
                </span>
                {selectedUser?.id !== loggedInUserId && selectedUser?.groupNames && (
                   <span className="text-[10px] text-slate-400 truncate max-w-[150px]">
                     {selectedUser.groupNames}
                   </span>
                )}
              </div>
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[320px] p-0 shadow-2xl border-slate-200 rounded-2xl overflow-hidden" align="end">
          <Command className="rounded-none">
            <CommandInput placeholder="Sök medlem eller grupp..." className="h-12" />
            <CommandList className="max-h-[450px] overflow-y-auto p-2">
              <CommandEmpty>Hittade ingen medlem.</CommandEmpty>

              {/* PERSONLIG SEKTION */}
              <CommandGroup heading="Personligt">
                <CommandItem
                  value={`mig själv ${loggedInUserId}`}
                  onSelect={() => handleSelect(loggedInUserId)}
                  className="cursor-pointer py-3 rounded-xl mb-1"
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-sm">
                      {getInitials(members.find(m => m.id === loggedInUserId)?.name || "J")}
                    </div>
                    <div className="flex flex-col flex-1 overflow-hidden">
                      <span className="font-bold text-sm text-slate-500">Min egen vy</span>
                      <span className="text-[10px] text-muted-foreground truncate italic font-medium">
                        Personlig kalender & post-its
                      </span>
                    </div>
                    {currentViewId === loggedInUserId && (
                      <Check className="h-4 w-4 text-primary shrink-0" />
                    )}
                  </div>
                </CommandItem>
              </CommandGroup>

              <CommandSeparator className="my-2" />

              {/* ANDRA MEDLEMMAR */}
              <CommandGroup heading="Gruppmedlemmar">
                {members
                  .filter(m => m.id !== loggedInUserId)
                  .map((member) => (
                    <CommandItem
                      key={member.id}
                      // Inkludera gruppnamn i value för att göra dem sökbara
                      value={`${member.name} ${member.groupNames}`}
                      onSelect={() => handleSelect(member.id)}
                      className="cursor-pointer py-3 rounded-xl mb-1 focus:bg-slate-50"
                    >
                      <div className="flex items-center gap-3 w-full">
                        <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600 shrink-0 uppercase shadow-sm">
                          {getInitials(member.name)}
                        </div>
                        <div className="flex flex-col flex-1 overflow-hidden">
                          <span className="truncate font-bold text-sm text-slate-500">{member.name}</span>
                          {member.groupNames && (
                            <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                              <Users className="h-2.5 w-2.5 text-blue-400" />
                              <span className="truncate italic">{member.groupNames}</span>
                            </div>
                          )}
                        </div>
                        {currentViewId === member.id && (
                          <Check className="h-4 w-4 text-primary shrink-0" />
                        )}
                      </div>
                    </CommandItem>
                  ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}