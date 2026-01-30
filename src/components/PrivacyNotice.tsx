import { Shield, Lock } from 'lucide-react';

export const PrivacyNotice = () => {
  return (
    <div className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-accent border border-accent-foreground/10">
      <div className="flex items-center gap-1.5 text-accent-foreground">
        <Shield className="w-4 h-4" aria-hidden="true" />
        <Lock className="w-3.5 h-3.5" aria-hidden="true" />
      </div>
      <p className="text-sm text-accent-foreground">
        <strong>100% Private:</strong> All processing is performed locally in your browser. 
        No images are uploaded to any server.
      </p>
    </div>
  );
};
