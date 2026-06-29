import { useState, useRef, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Bot, ChevronDown, Loader2 } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { generateTaqdeerResponse, type TaqdeerMessage } from '../lib/taqdeerEngine';

import { useDashboardStore } from '../../dashboard/store/dashboardStore';

// ─────────────────────────────────────────────────────────────────────────────
//  QUICK SUGGESTION CHIPS
// ─────────────────────────────────────────────────────────────────────────────

const QUICK_SUGGESTIONS = [
  'Which card for Zomato?',
  'Best card for travel?',
  'How to improve CIBIL?',
  'Best card for Amazon?',
  'My wallet health',
  'Card for fuel?',
];

// ─────────────────────────────────────────────────────────────────────────────
//  MESSAGE BUBBLE
// ─────────────────────────────────────────────────────────────────────────────

const MessageBubble = memo(function MessageBubble({ msg }: { msg: TaqdeerMessage }) {
  const isAi = msg.role === 'ai';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={cn('flex gap-2.5', isAi ? 'items-start' : 'items-start flex-row-reverse')}
    >
      {/* Avatar */}
      {isAi && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-steel-500 flex items-center justify-center shadow-ag-base">
          <Bot size={14} className="text-white" />
        </div>
      )}

      {/* Bubble */}
      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap',
          isAi
            ? 'bg-surface/90 dark:bg-surface-raised/50 border border-canvas-200/40 dark:border-white/[0.03] shadow-ag-base text-ink-primary rounded-tl-sm'
            : 'bg-brand-500 text-white rounded-tr-sm',
        )}
        style={{ overflowWrap: 'anywhere' }}
        // Render **bold** markdown
        dangerouslySetInnerHTML={{
          __html: msg.content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br/>'),
        }}
      />
    </motion.div>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
//  TYPING INDICATOR
// ─────────────────────────────────────────────────────────────────────────────

const TypingIndicator = () => (
  <motion.div
    initial={{ opacity: 0, y: 6 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -4 }}
    className="flex items-center gap-2.5"
  >
    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-steel-500 flex items-center justify-center">
      <Bot size={14} className="text-white" />
    </div>
    <div className="bg-surface/90 dark:bg-surface-raised/50 border border-canvas-200/40 dark:border-white/[0.03] shadow-ag-base rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
          className="w-1.5 h-1.5 rounded-full bg-ink-tertiary"
        />
      ))}
    </div>
  </motion.div>
);

// ─────────────────────────────────────────────────────────────────────────────
//  MAIN PANEL
// ─────────────────────────────────────────────────────────────────────────────

export function TaqdeerPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<TaqdeerMessage[]>([
    {
      id: 'welcome',
      role: 'ai',
      content: "Hey! I'm Taqdeer, your AI credit card advisor 🤖\n\nAsk me which card to use at any merchant, how to maximize rewards, or which new card to get!",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMsg: TaqdeerMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: trimmed,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate AI thinking delay (400–900ms)
    const delay = 400 + Math.random() * 500;
    setTimeout(() => {
      const userCards = useDashboardStore.getState().userCards;
      const { content } = generateTaqdeerResponse(trimmed, userCards);
      const aiMsg: TaqdeerMessage = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, delay);
  }


  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  return (
    <>
      {/* ── Floating Button ────────────────────────────────────────────── */}
      <motion.button
        id="taqdeer-chat-button"
        aria-label="Open Taqdeer AI chat"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className={cn(
          'fixed bottom-24 right-5 z-40',
          'w-14 h-14 rounded-full shadow-ag-float',
          'bg-gradient-to-br from-brand-500 to-steel-500',
          'flex items-center justify-center text-white',
          'transition-all duration-200',
          isOpen && 'opacity-0 pointer-events-none',
        )}
      >
        <Bot size={22} />
        {/* Pulse ring */}
        <motion.div
          className="absolute inset-0 rounded-full bg-brand-400 -z-10"
          animate={{ scale: [1, 1.25, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.button>

      {/* ── Chat Panel ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="taqdeer-panel"
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className={cn(
              'fixed bottom-24 right-5 z-50',
              'w-[360px] max-w-[calc(100vw-2rem)]',
              'bg-canvas-50/95 dark:bg-canvas-200/90 backdrop-blur-xl rounded-3xl shadow-ag-modal',
              'flex flex-col overflow-hidden',
              'border border-canvas-200/60 dark:border-white/[0.04]',
            )}
            style={{ height: '520px' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-brand-500 to-steel-500 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                  <Bot size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Taqdeer AI</p>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-300 animate-pulse" />
                    <p className="text-xs text-white/70">Always available</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  aria-label="Minimize chat"
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/15 transition-colors"
                >
                  <ChevronDown size={16} />
                </button>
                <button
                  aria-label="Close chat"
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/15 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">
              {messages.map((msg) => (
                <MessageBubble key={msg.id} msg={msg} />
              ))}
              <AnimatePresence>{isTyping && <TypingIndicator />}</AnimatePresence>
              <div ref={bottomRef} />
            </div>

            {/* Quick suggestions */}
            {messages.length <= 1 && (
              <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                {QUICK_SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => sendMessage(s)}
                    className="text-xs font-semibold text-brand-500 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10 hover:bg-brand-100 dark:hover:bg-brand-500/20 px-3 py-1.5 rounded-full transition-colors border border-brand-100 dark:border-brand-500/20"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <form
              onSubmit={handleSubmit}
              className="px-4 py-3 flex items-center gap-2 border-t border-canvas-200/60 dark:border-white/[0.04] bg-surface/80 dark:bg-surface-muted/30 flex-shrink-0"
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about cards, rewards..."
                aria-label="Message Taqdeer AI"
                disabled={isTyping}
                className="flex-1 input-premium text-sm"
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                aria-label="Send message"
                className={cn(
                  'w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0',
                  'transition-all duration-150',
                  input.trim() && !isTyping
                    ? 'bg-brand-500 text-white hover:bg-brand-600 shadow-ag-glow-primary active:scale-95'
                    : 'bg-canvas-200 dark:bg-white/[0.03] text-ink-disabled',
                )}
              >
                {isTyping ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default TaqdeerPanel;
