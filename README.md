# pi-header

A [pi](https://pi.dev) coding agent extension that displays a styled ASCII art header at the top of every new session, along with model info and timestamp — all rendered in your active theme colors.

## Features

- **Pixel-art π symbol** — A hand-crafted Unicode block-character art style
- **Classic text art** — Traditional `#`-based "PI" lettering (default)
- **Theme-aware** — Header colors adapt to your active pi theme
- **Auto-show** — Automatically appears on every new session
- **Customizable** — Switch between art styles on the fly

## Installation

```bash
pi install npm:pi-header
```

## Usage

### Commands

| Command | Description |
|---------|-------------|
| `/header style <name>` | Switch art style (`classic` or `symbol`) |
| `/header clear` | Hide the header |
| `/header show` | Show the header again |

### Available Styles

- **`classic`** — Classic "PI" text art using `#` characters (default)
- **`symbol`** — Pixel-art π symbol

## License

MIT
