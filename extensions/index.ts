/**
 * ASCII Header Extension
 *
 * Displays a custom pi-themed ASCII art header at the top of every new session,
 * along with model info, session details, and timestamp — all styled with theme colors.
 *
 * Usage:
 *   /header style <name>  — switch art style (symbol | classic)
 *   /header clear         — hide the header
 *   /header show          — show the header again
 */

import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { type Component, type TUI, type Theme } from "@earendil-works/pi-tui";

// ─── ASCII Art Styles ────────────────────────────────────────────────────────────

interface ArtStyle {
  name: string;
  label: string;
  lines: string[];
}

function createArtStyles(): ArtStyle[] {
  return [
    // ── Symbol ──────────────────────────────────────────────────────────────────
    {
      name: "symbol",
      label: "Symbol",
      lines: [

        `                             `,
        `                             `,
        `                             `,
        `         ⠀⠀⠀⢀⣠⣤⣶⣶⣶⣶⣶⣶⣶⣶⣶⣶⣶⣶⣶⣶⣶⣶⣶⣶⣶⣶⣶⣶⣦⠀`,
        `     ⠀⠀⢀⣴⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠃`,
        `     ⠀⣴⣿⣿⣿⣿⣿⠿⢿⣿⣿⣿⣿⡟⠛⠛⠛⣿⣿⣿⣿⣿⠛⠛⠛⠛⠛⠁⠀`,
        `     ⠘⣿⣿⣿⣿⠟⠁⠀⢸⣿⣿⣿⣿⠀⠀⠀⠀⣿⣿⣿⣿⣿⠀⠀⠀⠀⠀⠀⠀⠀`,
        `     ⠀⠉⠛⠛⠁⠀⠀⠀⢸⣿⣿⣿⣿⠀⠀⠀⠀⣿⣿⣿⣿⣿⠀⠀⠀⠀⠀⠀⠀⠀`,
        `     ⠀⠀⠀⠀⠀⠀⠀⠀⣿⣿⣿⣿⡿⠀⠀⠀⠀⣿⣿⣿⣿⣿⠀⠀⠀⠀⠀⠀⠀⠀`,
        `     ⠀⠀⠀⠀⠀⠀⠀⢠⣿⣿⣿⣿⡇⠀⠀⠀⠀⣿⣿⣿⣿⣿⠀⠀⠀⠀⠀⠀⠀⠀`,
        `     ⠀⠀⠀⠀⠀⠀⠀⣸⣿⣿⣿⣿⠁⠀⠀⠀⠀⣿⣿⣿⣿⣿⠀⠀⠀⠀⠀⠀⠀⠀`,
        `     ⠀⠀⠀⠀⠀⠀⢠⣿⣿⣿⣿⡟⠀⠀⠀⠀⠀⣿⣿⣿⣿⣿⠀⠀⠀⢀⣤⣤⡀⠀`,
        `     ⠀⠀⠀⠀⠀⢀⣾⣿⣿⣿⣿⠁⠀⠀⠀⠀⠀⣿⣿⣿⣿⣿⠀⠀⢠⣿⣿⣿⣿⡄`,
        `     ⠀⠀⠀⠀⢠⣾⣿⣿⣿⣿⠇⠀⠀⠀⠀⠀⠀⢿⣿⣿⣿⣿⣤⣤⣾⣿⣿⣿⣿⠁`,
        `     ⠀⠀⠀⢰⣿⣿⣿⣿⣿⠋⠀⠀⠀⠀⠀⠀⠀⠘⢿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠃⠀`,
        `     ⠀⠀⠀⠀⠻⠿⠿⠟⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⠻⠿⠿⠿⠿⠟⠋⠀⠀⠀`,
      ],
    },

    // ── Classic (Pi text art) ───────────────────────────────────────────────────
    {
      name: "classic",
      label: "Classic",
      lines: [
        `                            `,
        `                            `,
        `                            `,
        `           ███████████   ███`,
        `           ▒▒███▒▒▒▒▒███▒███`,
        `            ▒███    ▒███▒███`,
        `            ▒██████████ ▒███`,
        `            ▒███▒▒▒▒▒▒  ▒███`,
        `            ▒███        ▒▒▒ `,
        `            █████        ███`,
        `           ▒▒▒▒▒        ▒▒▒ `,
        `                            `,
      ],
    },
  ];
}

// ─── Session Info ──────────────────────────────────────────────────────────────────

function getFormattedDate(): string {
  return new Date().toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── Header Component ──────────────────────────────────────────────────────────────

interface HeaderState {
  styleName: string;
  theme: Theme;
  modelName?: string;
  leafId?: string;
  sessionBasename?: string;
  cachedWidth?: number;
  cachedLines?: string[];
}

class AsciiHeader implements Component {
  private state: HeaderState;
  private cachedWidth?: number;
  private cachedLines?: string[];

  constructor(state: HeaderState) {
    this.state = state;
  }

  render(width: number): string[] {
    if (this.cachedLines && this.cachedWidth === width) {
      return this.cachedLines;
    }

    const lines: string[] = [];

    // Resolve style from name at render time (theme is fresh)
    const allStyles = createArtStyles();
    const artStyle = allStyles.find((s) => s.name === this.state.styleName) ?? allStyles[0];

    // Art lines — apply theme at render time
    for (const line of artStyle.lines) {
      lines.push(this.state.theme.fg("accent", line));
    }

    // Calculate max art width for consistent separators
    const artWidth = artStyle.lines.reduce((max, line) => Math.max(max, line.length), 0);
    const sepWidth = Math.max(artWidth, 40);

    // Top separator
    lines.push(this.state.theme.fg("dim", `  ${(new Array(sepWidth).fill("─")).join("")}`));

    // Session info
    const dateStr = getFormattedDate();
    const infoParts: string[] = [];
    if (this.state.modelName) infoParts.push(this.state.theme.fg("accent", this.state.modelName));
    const infoStr = infoParts.join("  │  ");
    if (infoStr) {
      lines.push(
        this.state.theme.fg(
          "muted",
          `  ${dateStr}  │  ${infoStr}`,
        ),
      );
    }

    // Bottom separator
    lines.push(this.state.theme.fg("dim", `  ${(new Array(sepWidth).fill("─")).join("")}`));

    this.cachedLines = lines;
    this.cachedWidth = width;
    return lines;
  }

  invalidate(): void {
    this.cachedWidth = undefined;
    this.cachedLines = undefined;
  }
}

// ─── Extension ─────────────────────────────────────────────────────────────────────

// Default style name
let currentStyleName = "symbol";
let activeHeader: { close: () => void; requestRender: () => void } | undefined;

export default function piHeaderExtension(pi: ExtensionAPI): void {
  // ── /header command ─────────────────────────────────────────────────────────
  pi.registerCommand("header", {
    description: "Manage header (style, show, clear)",
    handler: async (args: string, ctx: ExtensionContext) => {
      const parts = args.trim().split(/\s+/);
      const subcommand = parts[0]?.toLowerCase();
      const styleName = parts[1]?.toLowerCase();

      if (!subcommand || subcommand === "help") {
        ctx.ui.notify(
          "Usage:\n  /header style <name>  — switch art style\n  /header clear         — hide header\n  /header show          — show header",
          "info",
        );
        return;
      }

      if (subcommand === "style") {
        if (!styleName) {
          const available = getAvailableStyleNames();
          ctx.ui.notify(`Available styles: ${available.join(", ")}`, "info");
          return;
        }

        const allStyles = createArtStyles();
        const style = allStyles.find((s) => s.name === styleName);
        if (!style) {
          const available = getAvailableStyleNames();
          ctx.ui.notify(
            `Unknown style "${styleName}". Available: ${available.join(", ")}`,
            "warning",
          );
          return;
        }

        currentStyleName = styleName;
        showHeader(ctx, styleName);
        ctx.ui.notify(`Switched to "${style.label}" style`, "info");
        return;
      }

      if (subcommand === "clear") {
        activeHeader?.close();
        activeHeader = undefined;
        ctx.ui.setHeader(undefined);
        ctx.ui.notify("Header cleared", "info");
        return;
      }

      if (subcommand === "show") {
        showHeader(ctx, currentStyleName);
        ctx.ui.notify("Header shown", "info");
        return;
      }

      ctx.ui.notify(`Unknown subcommand: ${subcommand}. Try /header help`, "warning");
    },
  });

  // ── Show header on session start ────────────────────────────────────────────
  pi.on("session_start", async (_event, ctx) => {
    if (!ctx.hasUI) return;

    showHeader(ctx, currentStyleName);
  });
}

// ─── Helpers ───────────────────────────────────────────────────────────────────────

function showHeader(ctx: ExtensionContext, styleName: string): void {
  const modelName = ctx.model?.name;
  const leafId = ctx.sessionManager.getLeafId();
  const sessionFile = ctx.sessionManager.getSessionFile();
  const sessionBasename = sessionFile ? sessionFile.split("/").pop()?.slice(0, 24) : undefined;

  activeHeader?.close();

  ctx.ui.setHeader((_tui, theme) => {
    const s: HeaderState = {
      styleName,
      theme,
      modelName,
      leafId: leafId ? leafId.slice(-6) : undefined,
      sessionBasename,
    };
    return new AsciiHeader(s);
  });
}

function getAvailableStyleNames(): string[] {
  return createArtStyles().map((s) => s.name);
}
