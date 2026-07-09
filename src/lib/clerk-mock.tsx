import React, { createContext, useContext, useState } from 'react';

interface MockUser {
  fullName: string | null;
  firstName: string | null;
  primaryEmailAddress: { emailAddress: string } | null;
  primaryPhoneNumber: { phoneNumber: string } | null;
  imageUrl: string;
}

interface AuthContextType {
  isSignedIn: boolean;
  user: MockUser | null;
  signIn: (email: string, name?: string) => void;
  signUp: (email: string, name: string) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const dark = {};

export function ClerkProvider({ children }: { children: React.ReactNode; publishableKey?: string; afterSignOutUrl?: string; appearance?: any }) {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [user, setUser] = useState<MockUser | null>(null);

  const signIn = (email: string, name?: string) => {
    setIsSignedIn(true);
    const displayName = name || email.split('@')[0];
    setUser({
      fullName: displayName,
      firstName: displayName.split(' ')[0],
      primaryEmailAddress: { emailAddress: email },
      primaryPhoneNumber: { phoneNumber: '+91 99999 88888' },
      imageUrl: `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(displayName)}&backgroundColor=f8f9fa`,
    });
  };

  const signUp = (email: string, name: string) => {
    setIsSignedIn(true);
    setUser({
      fullName: name,
      firstName: name.split(' ')[0],
      primaryEmailAddress: { emailAddress: email },
      primaryPhoneNumber: { phoneNumber: '+91 99999 88888' },
      imageUrl: `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(name)}&backgroundColor=f8f9fa`,
    });
  };

  const signOut = () => {
    setIsSignedIn(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isSignedIn, user, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useUser() {
  const context = useContext(AuthContext);
  if (!context) {
    return { isSignedIn: false, user: null };
  }
  return { isSignedIn: context.isSignedIn, user: context.user };
}

export function useClerk() {
  const context = useContext(AuthContext);
  if (!context) {
    return { signOut: () => {} };
  }
  return { signOut: context.signOut };
}

export function SignIn(_props: any) {
  const context = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (!context) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      context.signIn(email);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4 text-left">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-bold text-ink-secondary">Email address</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="e.g. email@example.com"
          className="bg-canvas-200/50 border border-white/5 !shadow-none !outline-none text-ink-primary !rounded-xl px-4 py-3 focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/50 transition-all text-sm"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-bold text-ink-secondary">Password</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="bg-canvas-200/50 border border-white/5 !shadow-none !outline-none text-ink-primary !rounded-xl px-4 py-3 focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/50 transition-all text-sm"
        />
      </div>
      <button
        type="submit"
        className="w-full mt-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold text-sm py-3 !rounded-xl !border-none !shadow-none hover:!shadow-ag-glow-primary transition-all active:scale-[0.98]"
      >
        Sign In
      </button>
    </form>
  );
}

export function SignUp(_props: any) {
  const context = useContext(AuthContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (!context) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && name) {
      context.signUp(email, name);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4 text-left">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-bold text-ink-secondary">Full Name</label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Atharva Mishra"
          className="bg-canvas-200/50 border border-white/5 !shadow-none !outline-none text-ink-primary !rounded-xl px-4 py-3 focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/50 transition-all text-sm"
          name="firstName"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-bold text-ink-secondary">Email address</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="e.g. email@example.com"
          className="bg-canvas-200/50 border border-white/5 !shadow-none !outline-none text-ink-primary !rounded-xl px-4 py-3 focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/50 transition-all text-sm"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-bold text-ink-secondary">Password</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="bg-canvas-200/50 border border-white/5 !shadow-none !outline-none text-ink-primary !rounded-xl px-4 py-3 focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/50 transition-all text-sm"
        />
      </div>
      <button
        type="submit"
        className="w-full mt-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold text-sm py-3 !rounded-xl !border-none !shadow-none hover:!shadow-ag-glow-primary transition-all active:scale-[0.98]"
      >
        Sign Up
      </button>
    </form>
  );
}
