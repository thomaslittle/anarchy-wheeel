'use client';

import Image from 'next/image';
import type { TwitchUser } from '@/types';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface UserInfoProps {
  user: TwitchUser;
  onLogout: () => void;
  className?: string;
}

export function UserInfo({ user, onLogout, className }: UserInfoProps) {
  return (
    <div 
      className={cn(
        "flex items-center gap-4 p-4 rounded-xl",
        "bg-[var(--bg-tertiary)] border border-[var(--border-color)]",
        className
      )}
    >
      <Image
        src={user.profile_image_url}
        alt={`${user.display_name} avatar`}
        width={48}
        height={48}
        className="w-12 h-12 rounded-full border-2 border-[var(--accent-primary)]"
      />
      
      <div className="flex-1">
        <div className="font-bold text-[var(--text-primary)]">
          {user.display_name}
        </div>
        <div className="text-sm text-[var(--text-secondary)]">
          @{user.login}
        </div>
      </div>

      <Button
        variant="secondary"
        size="sm"
        onClick={onLogout}
        className="text-sm"
      >
        Logout
      </Button>
    </div>
  );
}