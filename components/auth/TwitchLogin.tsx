'use client';

import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface TwitchLoginProps {
  onLogin: () => void;
  className?: string;
}

export function TwitchLogin({ onLogin, className }: TwitchLoginProps) {
  return (
    <div className={cn("text-center py-16 px-6", className)}>
      <div className="max-w-md mx-auto space-y-6">
        <h2 className="text-3xl font-bold text-[var(--text-primary)]">
          Sign in with Twitch to get started
        </h2>
        
        <p className="text-[var(--text-secondary)] text-lg">
          Connect your Twitch account to start running giveaways in your chat
        </p>

        <Button
          variant="primary"
          size="lg"
          onClick={onLogin}
          className="text-xl px-8 py-4 gap-3"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/>
          </svg>
          Sign in with Twitch
        </Button>
      </div>
    </div>
  );
}