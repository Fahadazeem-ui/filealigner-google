export interface BadgeTheme {
  bg: string;
  fg: string;
  border: string;
}

export interface ThemeColors {
  label: string;
  name: string;
  key: 'aurora_night' | 'aurora_warm' | 'aurora_cool';
  // Atmospheric Canvas
  canvasBg: string;
  canvasGradients: string;
  bloomOrb1: string;
  bloomOrb2: string;
  bloomOrb3: string;
  // Main Window Glass
  windowBg: string;
  windowBorder: string;
  windowShadow: string;
  windowHighlight: string;
  // Sidebar & Panes
  sidebarBg: string;
  sidebarBorder: string;
  panelBg: string;
  panelBg2: string;
  panelBorder: string;
  cardBg: string;
  cardBgHover: string;
  cardBorder: string;
  // Typography
  fg: string;
  fg_muted: string;
  fg_subtle: string;
  // Interactive Accents & Glowing Pills
  accent: string;
  accentGradient: string;
  accent_fg: string;
  accentGlow: string;
  pillActiveBg: string;
  pillActiveFg: string;
  pillActiveGlow: string;
  buttonBg: string;
  buttonBgHover: string;
  entryBg: string;
  entryBorder: string;
  // Storage Bar Gradient
  storageGradient: string;
  // Status & Verdicts
  ok: string;          // Sure
  progress: string;
  review: string;      // Review
  warn: string;        // Probably
  unsure: string;      // Unsure
  error: string;
  // File Category Badges
  badges: {
    folder: BadgeTheme;
    pdf: BadgeTheme;
    image: BadgeTheme;
    document: BadgeTheme;
    archive: BadgeTheme;
    code: BadgeTheme;
    media: BadgeTheme;
    other: BadgeTheme;
  };
}

export const AURORA_NIGHT: ThemeColors = {
  label: "Aurora Night",
  name: "Aurora Night (Midnight Slate & Indigo)",
  key: "aurora_night",
  canvasBg: "#0b0f19",
  canvasGradients: "radial-gradient(ellipse at 25% 20%, rgba(99, 102, 241, 0.22) 0%, transparent 60%), radial-gradient(ellipse at 75% 75%, rgba(139, 92, 246, 0.2) 0%, transparent 60%), radial-gradient(ellipse at 60% 30%, rgba(56, 189, 248, 0.15) 0%, transparent 50%), #0b0f19",
  bloomOrb1: "rgba(129, 140, 248, 0.25)",
  bloomOrb2: "rgba(167, 139, 250, 0.2)",
  bloomOrb3: "rgba(56, 189, 248, 0.18)",
  windowBg: "rgba(18, 23, 38, 0.72)",
  windowBorder: "rgba(255, 255, 255, 0.12)",
  windowShadow: "0 30px 90px -20px rgba(0, 0, 0, 0.7), 0 0 1px 1px rgba(255, 255, 255, 0.08)",
  windowHighlight: "inset 0 1px 1px 0 rgba(255, 255, 255, 0.15)",
  sidebarBg: "rgba(14, 18, 30, 0.55)",
  sidebarBorder: "rgba(255, 255, 255, 0.08)",
  panelBg: "rgba(22, 28, 46, 0.65)",
  panelBg2: "rgba(28, 35, 58, 0.55)",
  panelBorder: "rgba(255, 255, 255, 0.09)",
  cardBg: "rgba(30, 38, 64, 0.45)",
  cardBgHover: "rgba(42, 53, 88, 0.6)",
  cardBorder: "rgba(255, 255, 255, 0.08)",
  fg: "#e8edf8",
  fg_muted: "#94a3b8",
  fg_subtle: "#64748b",
  accent: "#818cf8",
  accentGradient: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)",
  accent_fg: "#ffffff",
  accentGlow: "0 8px 24px -4px rgba(99, 102, 241, 0.5)",
  pillActiveBg: "linear-gradient(135deg, rgba(129, 140, 248, 0.35) 0%, rgba(99, 102, 241, 0.25) 100%)",
  pillActiveFg: "#ffffff",
  pillActiveGlow: "0 4px 18px rgba(99, 102, 241, 0.45)",
  buttonBg: "rgba(255, 255, 255, 0.07)",
  buttonBgHover: "rgba(255, 255, 255, 0.14)",
  entryBg: "rgba(13, 17, 28, 0.7)",
  entryBorder: "rgba(255, 255, 255, 0.12)",
  storageGradient: "linear-gradient(90deg, #818cf8 0%, #a78bfa 50%, #38bdf8 100%)",
  ok: "#34d399",
  progress: "#818cf8",
  review: "#fbbf24",
  warn: "#fb923c",
  unsure: "#f87171",
  error: "#ef4444",
  badges: {
    folder: { bg: "rgba(167, 139, 250, 0.18)", fg: "#c4b5fd", border: "rgba(167, 139, 250, 0.3)" },
    pdf: { bg: "rgba(244, 63, 94, 0.18)", fg: "#fb7185", border: "rgba(244, 63, 94, 0.3)" },
    image: { bg: "rgba(56, 189, 248, 0.18)", fg: "#7dd3fc", border: "rgba(56, 189, 248, 0.3)" },
    document: { bg: "rgba(99, 102, 241, 0.18)", fg: "#a5b4fc", border: "rgba(99, 102, 241, 0.3)" },
    archive: { bg: "rgba(192, 132, 252, 0.18)", fg: "#e9d5ff", border: "rgba(192, 132, 252, 0.3)" },
    code: { bg: "rgba(52, 211, 153, 0.18)", fg: "#6ee7b7", border: "rgba(52, 211, 153, 0.3)" },
    media: { bg: "rgba(251, 191, 36, 0.18)", fg: "#fde68a", border: "rgba(251, 191, 36, 0.3)" },
    other: { bg: "rgba(148, 163, 184, 0.18)", fg: "#cbd5e1", border: "rgba(148, 163, 184, 0.3)" },
  }
};

export const AURORA_COOL: ThemeColors = {
  label: "Aurora Cool",
  name: "Aurora Cool (Soft Mint, Sky & Lavender)",
  key: "aurora_cool",
  canvasBg: "#eef4f8",
  canvasGradients: "radial-gradient(ellipse at 15% 15%, rgba(199, 210, 254, 0.7) 0%, transparent 60%), radial-gradient(ellipse at 85% 25%, rgba(167, 243, 208, 0.55) 0%, transparent 60%), radial-gradient(ellipse at 50% 85%, rgba(224, 231, 255, 0.6) 0%, transparent 60%), #eef4f8",
  bloomOrb1: "rgba(165, 180, 252, 0.4)",
  bloomOrb2: "rgba(110, 231, 183, 0.35)",
  bloomOrb3: "rgba(196, 181, 253, 0.35)",
  windowBg: "rgba(255, 255, 255, 0.72)",
  windowBorder: "rgba(255, 255, 255, 0.85)",
  windowShadow: "0 30px 80px -15px rgba(148, 163, 184, 0.45), 0 0 1px 1px rgba(255, 255, 255, 0.9)",
  windowHighlight: "inset 0 1px 2px 0 rgba(255, 255, 255, 0.95)",
  sidebarBg: "rgba(255, 255, 255, 0.5)",
  sidebarBorder: "rgba(255, 255, 255, 0.7)",
  panelBg: "rgba(255, 255, 255, 0.6)",
  panelBg2: "rgba(241, 245, 253, 0.65)",
  panelBorder: "rgba(226, 232, 240, 0.6)",
  cardBg: "rgba(255, 255, 255, 0.75)",
  cardBgHover: "rgba(255, 255, 255, 0.95)",
  cardBorder: "rgba(255, 255, 255, 0.8)",
  fg: "#1e293b",
  fg_muted: "#64748b",
  fg_subtle: "#94a3b8",
  accent: "#6366f1",
  accentGradient: "linear-gradient(135deg, #818cf8 0%, #6ee7b7 100%)",
  accent_fg: "#ffffff",
  accentGlow: "0 8px 24px -4px rgba(99, 102, 241, 0.35)",
  pillActiveBg: "linear-gradient(135deg, rgba(199, 210, 254, 0.85) 0%, rgba(224, 231, 255, 0.95) 100%)",
  pillActiveFg: "#4338ca",
  pillActiveGlow: "0 4px 18px rgba(165, 180, 252, 0.4)",
  buttonBg: "rgba(255, 255, 255, 0.8)",
  buttonBgHover: "rgba(255, 255, 255, 0.98)",
  entryBg: "rgba(255, 255, 255, 0.85)",
  entryBorder: "rgba(203, 213, 225, 0.7)",
  storageGradient: "linear-gradient(90deg, #818cf8 0%, #6ee7b7 100%)",
  ok: "#10b981",
  progress: "#6366f1",
  review: "#f59e0b",
  warn: "#f97316",
  unsure: "#ef4444",
  error: "#dc2626",
  badges: {
    folder: { bg: "rgba(196, 181, 253, 0.3)", fg: "#6d28d9", border: "rgba(196, 181, 253, 0.5)" },
    pdf: { bg: "rgba(254, 205, 211, 0.4)", fg: "#e11d48", border: "rgba(254, 205, 211, 0.6)" },
    image: { bg: "rgba(186, 230, 253, 0.4)", fg: "#0284c7", border: "rgba(186, 230, 253, 0.6)" },
    document: { bg: "rgba(199, 210, 254, 0.4)", fg: "#4338ca", border: "rgba(199, 210, 254, 0.6)" },
    archive: { bg: "rgba(233, 213, 255, 0.4)", fg: "#7e22ce", border: "rgba(233, 213, 255, 0.6)" },
    code: { bg: "rgba(167, 243, 208, 0.4)", fg: "#047857", border: "rgba(167, 243, 208, 0.6)" },
    media: { bg: "rgba(254, 240, 138, 0.4)", fg: "#b45309", border: "rgba(254, 240, 138, 0.6)" },
    other: { bg: "rgba(226, 232, 240, 0.4)", fg: "#475569", border: "rgba(226, 232, 240, 0.6)" },
  }
};

export const AURORA_WARM: ThemeColors = {
  label: "Aurora Warm",
  name: "Aurora Warm (Blush Peach, Coral & Lilac)",
  key: "aurora_warm",
  canvasBg: "#fbf6f3",
  canvasGradients: "radial-gradient(ellipse at 15% 15%, rgba(254, 205, 211, 0.7) 0%, transparent 60%), radial-gradient(ellipse at 85% 25%, rgba(254, 215, 170, 0.6) 0%, transparent 60%), radial-gradient(ellipse at 50% 85%, rgba(233, 213, 255, 0.55) 0%, transparent 60%), #fbf6f3",
  bloomOrb1: "rgba(251, 146, 160, 0.4)",
  bloomOrb2: "rgba(251, 191, 146, 0.35)",
  bloomOrb3: "rgba(216, 180, 254, 0.35)",
  windowBg: "rgba(255, 255, 255, 0.75)",
  windowBorder: "rgba(255, 255, 255, 0.88)",
  windowShadow: "0 30px 80px -15px rgba(244, 162, 176, 0.4), 0 0 1px 1px rgba(255, 255, 255, 0.95)",
  windowHighlight: "inset 0 1px 2px 0 rgba(255, 255, 255, 0.95)",
  sidebarBg: "rgba(255, 255, 255, 0.55)",
  sidebarBorder: "rgba(255, 255, 255, 0.75)",
  panelBg: "rgba(255, 255, 255, 0.62)",
  panelBg2: "rgba(254, 247, 245, 0.7)",
  panelBorder: "rgba(244, 226, 224, 0.7)",
  cardBg: "rgba(255, 255, 255, 0.8)",
  cardBgHover: "rgba(255, 255, 255, 0.98)",
  cardBorder: "rgba(255, 255, 255, 0.85)",
  fg: "#29201d",
  fg_muted: "#786560",
  fg_subtle: "#a8948f",
  accent: "#fb7185",
  accentGradient: "linear-gradient(135deg, #fda4af 0%, #fb7185 50%, #c084fc 100%)",
  accent_fg: "#ffffff",
  accentGlow: "0 8px 24px -4px rgba(251, 113, 133, 0.4)",
  pillActiveBg: "linear-gradient(135deg, #fecdd3 0%, #fed7aa 100%)",
  pillActiveFg: "#9f1239",
  pillActiveGlow: "0 4px 18px rgba(251, 113, 133, 0.35)",
  buttonBg: "rgba(255, 255, 255, 0.85)",
  buttonBgHover: "rgba(255, 255, 255, 0.98)",
  entryBg: "rgba(255, 255, 255, 0.85)",
  entryBorder: "rgba(244, 205, 200, 0.7)",
  storageGradient: "linear-gradient(90deg, #fda4af 0%, #c084fc 100%)",
  ok: "#059669",
  progress: "#fb7185",
  review: "#d97706",
  warn: "#ea580c",
  unsure: "#e11d48",
  error: "#be123c",
  badges: {
    folder: { bg: "rgba(254, 205, 211, 0.35)", fg: "#be123c", border: "rgba(254, 205, 211, 0.6)" },
    pdf: { bg: "rgba(254, 205, 211, 0.45)", fg: "#e11d48", border: "rgba(254, 205, 211, 0.7)" },
    image: { bg: "rgba(199, 210, 254, 0.4)", fg: "#4f46e5", border: "rgba(199, 210, 254, 0.6)" },
    document: { bg: "rgba(233, 213, 255, 0.4)", fg: "#7e22ce", border: "rgba(233, 213, 255, 0.6)" },
    archive: { bg: "rgba(254, 215, 170, 0.45)", fg: "#c2410c", border: "rgba(254, 215, 170, 0.6)" },
    code: { bg: "rgba(167, 243, 208, 0.4)", fg: "#047857", border: "rgba(167, 243, 208, 0.6)" },
    media: { bg: "rgba(254, 240, 138, 0.45)", fg: "#b45309", border: "rgba(254, 240, 138, 0.6)" },
    other: { bg: "rgba(231, 229, 228, 0.45)", fg: "#57534e", border: "rgba(231, 229, 228, 0.6)" },
  }
};

export const THEMES: Record<string, ThemeColors> = {
  aurora_night: AURORA_NIGHT,
  aurora_warm: AURORA_WARM,
  aurora_cool: AURORA_COOL,
};

export function getTheme(key: string = "aurora_night"): ThemeColors {
  return THEMES[key] || AURORA_NIGHT;
}
