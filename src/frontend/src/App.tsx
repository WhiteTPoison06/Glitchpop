import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useContactInfo, useSendMessage } from "@/hooks/useQueries";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Phone,
  Search,
  Send,
  ShoppingBag,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { SiInstagram, SiLinkedin, SiTiktok, SiX } from "react-icons/si";

const queryClient = new QueryClient();

// ─── ChatBot ────────────────────────────────────────────────────────────────

interface ChatMsg {
  id: number;
  role: "user" | "bot";
  text: string;
}

function ChatBot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      id: 0,
      role: "bot",
      text: "Hello! Welcome to CHARMPOP ✦ How can I help you today?",
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const msgIdRef = useRef(1);
  const sendMessage = useSendMessage();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  });

  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    const uid = msgIdRef.current++;
    setMessages((prev) => [...prev, { id: uid, role: "user", text }]);
    setIsTyping(true);
    try {
      const reply = await sendMessage.mutateAsync(text);
      setMessages((prev) => [
        ...prev,
        { id: msgIdRef.current++, role: "bot", text: reply },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: msgIdRef.current++,
          role: "bot",
          text: "I'm having trouble connecting right now. Please try again shortly!",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      <motion.button
        data-ocid="chatbot.open_modal_button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg btn-gold-glow transition-all"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        style={{ display: open ? "none" : "flex" }}
        aria-label="Open chat"
      >
        <MessageCircle className="w-6 h-6" />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            data-ocid="chatbot.dialog"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-6 z-50 w-80 sm:w-96 flex flex-col rounded-2xl overflow-hidden shadow-2xl"
            style={{
              background: "oklch(0.11 0.008 285)",
              border: "1px solid oklch(0.22 0.01 285)",
              boxShadow:
                "0 25px 60px oklch(0 0 0 / 0.6), 0 0 40px oklch(0.78 0.13 80 / 0.1)",
            }}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="font-display text-sm font-semibold text-foreground">
                  CHARMPOP Assistant
                </span>
              </div>
              <button
                type="button"
                data-ocid="chatbot.close_button"
                onClick={() => setOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
              style={{ maxHeight: "320px" }}
            >
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] px-3 py-2 rounded-xl text-sm leading-relaxed ${msg.role === "user" ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-secondary text-secondary-foreground rounded-bl-sm"}`}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-secondary rounded-xl rounded-bl-sm px-3 py-3 flex gap-1 items-center">
                    <span className="typing-dot w-1.5 h-1.5 rounded-full bg-muted-foreground inline-block" />
                    <span className="typing-dot w-1.5 h-1.5 rounded-full bg-muted-foreground inline-block" />
                    <span className="typing-dot w-1.5 h-1.5 rounded-full bg-muted-foreground inline-block" />
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-2 p-3 border-t border-border">
              <Input
                data-ocid="chatbot.input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask me anything…"
                className="flex-1 text-sm bg-muted border-border focus-visible:ring-primary"
              />
              <Button
                data-ocid="chatbot.submit_button"
                size="icon"
                onClick={handleSend}
                disabled={!input.trim() || sendMessage.isPending}
                className="bg-primary text-primary-foreground hover:bg-primary/90 shrink-0 btn-gold-glow"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── AnnouncementBar ─────────────────────────────────────────────────────────

const announcements = [
  "New Collection Drop — Shop Now",
  "Free shipping on orders above ₹999",
];

function AnnouncementBar() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(
      () => setIdx((i) => (i + 1) % announcements.length),
      3500,
    );
    return () => clearInterval(t);
  }, []);

  return (
    <div className="announcement-bar relative overflow-hidden h-9 flex items-center justify-center text-xs font-semibold tracking-widest uppercase">
      <AnimatePresence mode="wait">
        <motion.span
          key={idx}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4 }}
          className="absolute text-primary"
        >
          {announcements[idx]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

// ─── Navbar ──────────────────────────────────────────────────────────────────

const NAV_LINKS = ["Collections", "Makeup", "Skincare", "Hair", "About"];

function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header
      className="sticky top-0 z-40 border-b border-border/40"
      style={{
        background: "oklch(0.07 0.005 285 / 0.92)",
        backdropFilter: "blur(20px)",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 grid grid-cols-3 items-center">
        {/* Left nav */}
        <nav className="hidden md:flex items-center gap-7">
          {NAV_LINKS.slice(0, 3).map((link) => (
            <a
              key={link}
              data-ocid="nav.link"
              href={`#${link.toLowerCase()}`}
              className="text-xs font-semibold text-muted-foreground hover:text-primary transition-colors tracking-widest uppercase"
            >
              {link}
            </a>
          ))}
        </nav>

        {/* Mobile left */}
        <button
          type="button"
          className="md:hidden text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Center logo */}
        <a href="#home" className="flex justify-center">
          <span className="font-display text-2xl font-bold tracking-widest text-white hover:text-primary transition-colors">
            CHARMPOP
          </span>
        </a>

        {/* Right nav + icons */}
        <div className="flex items-center justify-end gap-5">
          <div className="hidden md:flex items-center gap-7">
            {NAV_LINKS.slice(3).map((link) => (
              <a
                key={link}
                data-ocid="nav.link"
                href={`#${link.toLowerCase()}`}
                className="text-xs font-semibold text-muted-foreground hover:text-primary transition-colors tracking-widest uppercase"
              >
                {link}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              aria-label="Search"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              type="button"
              aria-label="Wishlist"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <Heart className="w-5 h-5" />
            </button>
            <button
              type="button"
              aria-label="Bag"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <ShoppingBag className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t border-border/40 overflow-hidden"
            style={{ background: "oklch(0.07 0.005 285 / 0.97)" }}
          >
            <div className="px-6 py-4 flex flex-col gap-3">
              {NAV_LINKS.map((link) => (
                <a
                  key={link}
                  data-ocid="nav.link"
                  href={`#${link.toLowerCase()}`}
                  onClick={() => setMobileOpen(false)}
                  className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors py-1 tracking-widest uppercase"
                >
                  {link}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

// ─── HeroBannerCarousel ───────────────────────────────────────────────────────

const SLIDES = [
  {
    label: "NEW COLLECTION",
    headline: ["THE BOLD", "LOOK"],
    sub: "Own every room with our statement collection.",
    cta: "SHOP NOW",
    bg: "linear-gradient(135deg, oklch(0.18 0.06 340) 0%, oklch(0.10 0.04 285) 50%, oklch(0.07 0.03 260) 100%)",
    accent: "oklch(0.75 0.18 340)",
  },
  {
    label: "BESTSELLER",
    headline: ["GLOW", "UNLIMITED"],
    sub: "Luminous finish for every skin tone.",
    cta: "EXPLORE",
    bg: "linear-gradient(135deg, oklch(0.16 0.08 70) 0%, oklch(0.10 0.05 50) 50%, oklch(0.08 0.02 285) 100%)",
    accent: "oklch(0.82 0.16 75)",
  },
  {
    label: "LIMITED EDITION",
    headline: ["THE", "WATTAMOMENT"],
    sub: "Pink yourself from head to toe.",
    cta: "GET YOURS",
    bg: "linear-gradient(135deg, oklch(0.22 0.09 355) 0%, oklch(0.14 0.06 320) 50%, oklch(0.09 0.03 285) 100%)",
    accent: "oklch(0.80 0.20 355)",
  },
];

function HeroBannerCarousel() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  const go = (next: number) => {
    setDirection(next > current ? 1 : -1);
    setCurrent((next + SLIDES.length) % SLIDES.length);
  };

  useEffect(() => {
    const t = setInterval(() => go((current + 1) % SLIDES.length), 5500);
    return () => clearInterval(t);
  });

  const slide = SLIDES[current];

  return (
    <section
      id="home"
      className="relative w-full overflow-hidden"
      style={{ height: "100svh", minHeight: "600px" }}
    >
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={current}
          custom={direction}
          variants={{
            enter: (d: number) => ({ x: d * 60, opacity: 0 }),
            center: { x: 0, opacity: 1 },
            exit: (d: number) => ({ x: d * -60, opacity: 0 }),
          }}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.7, ease: [0.32, 0, 0.67, 0] }}
          className="absolute inset-0"
          style={{ background: slide.bg }}
        >
          {/* Texture overlay */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")",
            }}
          />
          {/* Bottom gradient */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, oklch(0.07 0.005 285) 0%, transparent 45%)",
            }}
          />

          {/* Content — bottom left */}
          <div className="absolute bottom-0 left-0 right-0 px-8 md:px-16 pb-20 md:pb-24">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.6 }}
              className="max-w-2xl"
            >
              <span
                className="inline-block text-xs font-semibold tracking-[0.3em] uppercase mb-6"
                style={{ color: slide.accent }}
              >
                {slide.label}
              </span>
              <h1
                className="font-display font-bold leading-none mb-5"
                style={{
                  fontSize: "clamp(3.5rem, 10vw, 8rem)",
                  lineHeight: 0.9,
                }}
              >
                {slide.headline.map((line) => (
                  <span key={line} className="block text-white">
                    {line}
                  </span>
                ))}
              </h1>
              <p className="text-muted-foreground text-lg mb-8 max-w-md">
                {slide.sub}
              </p>
              <Button
                data-ocid="hero.primary_button"
                className="bg-foreground text-background hover:bg-foreground/90 font-bold tracking-widest text-sm px-10 py-6 rounded-none btn-hero"
              >
                {slide.cta}
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Arrows */}
      <button
        type="button"
        onClick={() => go(current - 1)}
        aria-label="Previous"
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-10 w-12 h-12 flex items-center justify-center border border-white/20 text-white/70 hover:text-white hover:border-white/60 transition-all"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        type="button"
        onClick={() => go(current + 1)}
        aria-label="Next"
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-10 w-12 h-12 flex items-center justify-center border border-white/20 text-white/70 hover:text-white hover:border-white/60 transition-all"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-8 right-8 md:right-16 flex gap-2 z-10">
        {SLIDES.map((s, i) => (
          <button
            key={s.label}
            type="button"
            onClick={() => go(i)}
            aria-label={`Slide ${i + 1}`}
            className={`transition-all duration-300 ${i === current ? "w-8 h-1 bg-primary" : "w-3 h-1 bg-white/30 hover:bg-white/60"}`}
          />
        ))}
      </div>
    </section>
  );
}

// ─── ProductScroll ────────────────────────────────────────────────────────────

const PRODUCTS = [
  {
    name: "Glow Serum",
    price: "₹1,200",
    badge: "NEW",
    gradient:
      "linear-gradient(135deg, oklch(0.35 0.12 340), oklch(0.20 0.08 300))",
  },
  {
    name: "Matte Foundation",
    price: "₹2,800",
    badge: "BESTSELLER",
    gradient:
      "linear-gradient(135deg, oklch(0.30 0.10 60), oklch(0.18 0.06 30))",
  },
  {
    name: "Gloss Bomb",
    price: "₹1,500",
    badge: "LIMITED EDITION",
    gradient:
      "linear-gradient(135deg, oklch(0.40 0.14 355), oklch(0.22 0.10 320))",
  },
  {
    name: "Lip Liner",
    price: "₹800",
    badge: "NEW",
    gradient:
      "linear-gradient(135deg, oklch(0.28 0.10 20), oklch(0.18 0.07 355))",
  },
  {
    name: "Highlighter",
    price: "₹2,200",
    badge: "VIRAL",
    gradient:
      "linear-gradient(135deg, oklch(0.55 0.14 80), oklch(0.30 0.10 60))",
  },
  {
    name: "Body Butter",
    price: "₹1,800",
    badge: "BESTSELLER",
    gradient:
      "linear-gradient(135deg, oklch(0.32 0.08 140), oklch(0.18 0.05 180))",
  },
];

function ProductScroll() {
  return (
    <section id="collections" className="py-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-8 mb-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight uppercase mb-2">
            Must-Haves for Every Mood
          </h2>
          <p className="text-muted-foreground">
            New arrivals + fan faves for every day.
          </p>
        </motion.div>
      </div>

      <div
        className="flex gap-5 px-6 md:px-8 overflow-x-auto pb-4"
        style={{ scrollSnapType: "x mandatory", scrollbarWidth: "none" }}
      >
        {PRODUCTS.map((p, i) => (
          <motion.div
            key={p.name}
            data-ocid={`products.item.${i + 1}`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.07, duration: 0.5 }}
            className="group shrink-0 w-56 md:w-64 cursor-pointer"
            style={{ scrollSnapAlign: "start" }}
          >
            {/* Image area */}
            <div className="relative w-full aspect-square mb-3 overflow-hidden">
              <div
                className="absolute inset-0 transition-transform duration-500 group-hover:scale-105"
                style={{ background: p.gradient }}
              />
              {/* Badge */}
              <span
                className="absolute top-3 left-3 text-[10px] font-bold tracking-widest uppercase px-2 py-1"
                style={{
                  background: "oklch(0.07 0.005 285 / 0.85)",
                  color: "oklch(var(--primary))",
                }}
              >
                {p.badge}
              </span>
              {/* Quick shop */}
              <div
                className="absolute inset-x-0 bottom-0 py-3 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: "oklch(0.07 0.005 285 / 0.9)" }}
              >
                <span className="text-xs font-bold tracking-widest uppercase text-foreground">
                  Quick Shop
                </span>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground mb-1">
                {p.name}
              </p>
              <p className="text-sm text-primary font-bold">{p.price}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ─── EditorialBanner ──────────────────────────────────────────────────────────

function EditorialBanner() {
  return (
    <section
      className="py-24 md:py-32 px-8 md:px-16 relative overflow-hidden"
      style={{
        background:
          "linear-gradient(120deg, oklch(0.12 0.04 60) 0%, oklch(0.08 0.02 285) 50%, oklch(0.10 0.03 80) 100%)",
      }}
    >
      {/* Decorative rings */}
      <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full border border-primary/10" />
      <div className="absolute -right-10 -top-10 w-60 h-60 rounded-full border border-primary/8" />

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-end md:items-center justify-between gap-12">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2
            className="font-display font-bold uppercase leading-none text-white"
            style={{
              fontSize: "clamp(3rem, 8vw, 7rem)",
            }}
          >
            GET THAT
            <br />
            GLOW
          </h2>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="md:max-w-xs flex flex-col gap-6 items-start"
        >
          <p className="text-muted-foreground text-lg leading-relaxed">
            Discover our radiance-first formulas crafted for every skin tone.
            Makeup that moves with you, always.
          </p>
          <Button
            data-ocid="editorial.primary_button"
            className="bg-primary text-primary-foreground hover:bg-primary/90 btn-gold-glow font-bold tracking-widest text-sm px-10 py-6 rounded-none"
          >
            SHOP NOW
          </Button>
        </motion.div>
      </div>
    </section>
  );
}

// ─── CategoryTiles ────────────────────────────────────────────────────────────

const CATEGORIES = [
  {
    name: "Makeup",
    tag: "For every mood",
    bg: "linear-gradient(160deg, oklch(0.35 0.14 355), oklch(0.15 0.07 320))",
  },
  {
    name: "Skincare",
    tag: "Glow daily",
    bg: "linear-gradient(160deg, oklch(0.30 0.08 280), oklch(0.15 0.05 260))",
  },
  {
    name: "Haircare",
    tag: "Shine all day",
    bg: "linear-gradient(160deg, oklch(0.28 0.10 180), oklch(0.14 0.06 200))",
  },
  {
    name: "Fragrance",
    tag: "Your signature",
    bg: "linear-gradient(160deg, oklch(0.40 0.13 70), oklch(0.20 0.08 50))",
  },
];

function CategoryTiles() {
  return (
    <section id="makeup" className="py-20 px-6 md:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold uppercase tracking-tight">
            Shop by Category
          </h2>
        </motion.div>
        <div
          className="flex gap-5 overflow-x-auto pb-2"
          style={{ scrollSnapType: "x mandatory", scrollbarWidth: "none" }}
        >
          {CATEGORIES.map((cat, i) => (
            <motion.div
              key={cat.name}
              data-ocid={`categories.item.${i + 1}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.55 }}
              className="group relative shrink-0 cursor-pointer overflow-hidden"
              style={{
                width: "clamp(220px, 22vw, 320px)",
                aspectRatio: "3/4",
                scrollSnapAlign: "start",
                background: cat.bg,
              }}
            >
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: "oklch(0 0 0 / 0.3)" }}
              />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <p className="font-display text-2xl font-bold text-foreground mb-1">
                  {cat.name}
                </p>
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-4">
                  {cat.tag}
                </p>
                <a
                  href={`#${cat.name.toLowerCase()}`}
                  data-ocid="categories.link"
                  className="text-xs font-bold tracking-widest uppercase text-primary border-b border-primary pb-0.5 hover:text-primary/80 transition-colors"
                >
                  SHOP NOW
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── BrandGrid ────────────────────────────────────────────────────────────────

const BRANDS = [
  {
    name: "charmpop face",
    bg: "linear-gradient(145deg, oklch(0.22 0.08 340), oklch(0.12 0.04 300))",
  },
  {
    name: "charmpop skin",
    bg: "linear-gradient(145deg, oklch(0.20 0.06 280), oklch(0.12 0.03 260))",
  },
  {
    name: "charmpop hair",
    bg: "linear-gradient(145deg, oklch(0.18 0.07 160), oklch(0.11 0.04 190))",
  },
  {
    name: "charmpop scents",
    bg: "linear-gradient(145deg, oklch(0.28 0.10 65), oklch(0.14 0.06 45))",
  },
];

function BrandGrid() {
  return (
    <section
      id="about"
      className="py-20 px-6 md:px-8"
      style={{ background: "oklch(0.09 0.006 285)" }}
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <h2 className="font-display text-3xl md:text-5xl font-bold uppercase tracking-tight text-white">
            The Charmpop Lineup
          </h2>
        </motion.div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {BRANDS.map((brand, i) => (
            <motion.div
              key={brand.name}
              data-ocid={`brands.item.${i + 1}`}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="group relative overflow-hidden cursor-pointer"
              style={{ aspectRatio: "3/4", background: brand.bg }}
            >
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: "oklch(0.78 0.13 80 / 0.08)" }}
              />
              <div className="absolute bottom-0 left-0 right-0 p-5 border-t border-white/10">
                <p className="text-sm font-bold uppercase tracking-widest text-foreground">
                  {brand.name}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── EmailSignup ──────────────────────────────────────────────────────────────

function EmailSignup() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (email.trim()) setSubmitted(true);
  };

  return (
    <section
      className="py-20 px-6"
      style={{ background: "oklch(0.07 0.005 285)" }}
    >
      <div className="max-w-2xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold uppercase tracking-tight mb-3 text-white">
            Stay in the Loop
          </h2>
          <p className="text-muted-foreground mb-8">
            Sign up for exclusive offers + new arrivals
          </p>

          {submitted ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              data-ocid="email-signup.success_state"
              className="text-primary font-semibold tracking-wide"
            >
              ✦ You're on the list!
            </motion.p>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input
                data-ocid="email-signup.input"
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                className="flex-1 bg-muted border-border focus-visible:ring-primary rounded-none"
              />
              <Button
                data-ocid="email-signup.submit_button"
                onClick={handleSubmit}
                className="bg-primary text-primary-foreground hover:bg-primary/90 btn-gold-glow font-bold tracking-widest text-xs px-8 rounded-none"
              >
                SUBSCRIBE
              </Button>
            </div>
          )}

          <p className="text-xs text-muted-foreground mt-4">
            We respect your privacy. Unsubscribe anytime.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Contact (simplified) ─────────────────────────────────────────────────────

const SOCIAL_LINKS = [
  {
    icon: SiInstagram,
    label: "Instagram",
    href: "https://instagram.com",
    color: "hover:text-pink-400",
  },
  {
    icon: SiX,
    label: "X / Twitter",
    href: "https://x.com",
    color: "hover:text-sky-400",
  },
  {
    icon: SiTiktok,
    label: "TikTok",
    href: "https://tiktok.com",
    color: "hover:text-white",
  },
  {
    icon: SiLinkedin,
    label: "LinkedIn",
    href: "https://linkedin.com",
    color: "hover:text-blue-400",
  },
];

function Contact() {
  const { data: contactInfo } = useContactInfo();
  const email = contactInfo?.email ?? "hello@charmpop.co";
  const phone = contactInfo?.phone ?? "8826917954";
  const location = "New Delhi, India";

  return (
    <section
      id="contact"
      data-ocid="contact.section"
      className="py-20 px-6"
      style={{ background: "oklch(0.09 0.006 285)" }}
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="font-display text-3xl md:text-5xl font-bold uppercase tracking-tight mb-3 text-white">
            Get in Touch
          </h2>
          <p className="text-muted-foreground">We'd love to hear from you.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row items-center justify-center gap-12 md:gap-20"
        >
          {[
            { icon: Mail, label: "Email", val: email, href: `mailto:${email}` },
            {
              icon: Phone,
              label: "Phone",
              val: phone,
              href: `tel:${phone.replace(/\s/g, "")}`,
            },
            {
              icon: MapPin,
              label: "Location",
              val: location,
              href: "#contact",
            },
          ].map(({ icon: Icon, label, val, href }) => (
            <a
              key={label}
              href={href}
              className="flex flex-col items-center gap-3 group text-center"
            >
              <div
                className="w-14 h-14 flex items-center justify-center border border-border group-hover:border-primary transition-all"
                style={{ background: "oklch(0.11 0.008 285)" }}
              >
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                  {label}
                </p>
                <p className="text-sm font-semibold text-white group-hover:text-primary transition-colors">
                  {val}
                </p>
              </div>
            </a>
          ))}
        </motion.div>

        {/* Socials */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="flex justify-center gap-4 mt-14"
        >
          {SOCIAL_LINKS.map(({ icon: Icon, label, href, color }) => (
            <motion.a
              key={label}
              data-ocid="social.link"
              href={href}
              target="_blank"
              rel="noreferrer"
              aria-label={label}
              whileHover={{ scale: 1.15, y: -3 }}
              className={`w-12 h-12 border border-border flex items-center justify-center text-muted-foreground ${color} transition-all hover:border-primary/40`}
              style={{ background: "oklch(0.11 0.008 285)" }}
            >
              <Icon className="w-5 h-5" />
            </motion.a>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  const currentYear = new Date().getFullYear();
  const hostname =
    typeof window !== "undefined" ? window.location.hostname : "";

  return (
    <footer
      className="border-t border-border py-16 px-6"
      style={{ background: "oklch(0.06 0.005 285)" }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Logo on mobile */}
        <div className="mb-12 md:hidden text-center">
          <span className="font-display text-2xl font-bold tracking-widest">
            CHARMPOP
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Logo on desktop */}
          <div className="hidden md:block">
            <a href="#home">
              <span className="font-display text-2xl font-bold tracking-widest text-white hover:text-primary transition-colors">
                CHARMPOP
              </span>
            </a>
            <p className="text-xs text-muted-foreground mt-4 max-w-xs leading-relaxed">
              Premium beauty for those who dare to stand out.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold tracking-widest uppercase text-foreground mb-5">
              Customer Service
            </h4>
            <ul className="space-y-3">
              {["Contact Us", "FAQ", "Returns", "Shipping"].map((item) => (
                <li key={item}>
                  <button
                    type="button"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors text-left"
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold tracking-widest uppercase text-foreground mb-5">
              About
            </h4>
            <ul className="space-y-3">
              {["Our Story", "Careers", "Press", "Sustainability"].map(
                (item) => (
                  <li key={item}>
                    <button
                      type="button"
                      className="text-sm text-muted-foreground hover:text-primary transition-colors text-left"
                    >
                      {item}
                    </button>
                  </li>
                ),
              )}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold tracking-widest uppercase text-foreground mb-5">
              Follow Us
            </h4>
            <div className="flex gap-3">
              {SOCIAL_LINKS.map(({ icon: Icon, label, href, color }) => (
                <motion.a
                  key={label}
                  data-ocid="social.link"
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  whileHover={{ scale: 1.1 }}
                  className={`w-9 h-9 border border-border flex items-center justify-center text-muted-foreground ${color} transition-all hover:border-primary/40`}
                >
                  <Icon className="w-4 h-4" />
                </motion.a>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-border/40 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <span className="text-white">
            © {currentYear} CHARMPOP. All rights reserved.
          </span>
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(hostname)}`}
            target="_blank"
            rel="noreferrer"
            className="hover:text-primary transition-colors"
          >
            Built with ♥ using caffeine.ai
          </a>
        </div>
      </div>
    </footer>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

function AppContent() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <AnnouncementBar />
      <Navbar />
      <main>
        <HeroBannerCarousel />
        <ProductScroll />
        <EditorialBanner />
        <CategoryTiles />
        <BrandGrid />
        <EmailSignup />
        <Contact />
      </main>
      <Footer />
      <ChatBot />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}
