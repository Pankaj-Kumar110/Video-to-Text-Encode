# Text Video Player 🎬

A real-time video-to-ASCII converter that renders video entirely using text characters. Watch any video or your webcam feed transformed into a retro terminal aesthetic.

## Features

- **Video Upload**: Play any video file rendered as ASCII art
- **Webcam Support**: Real-time webcam to ASCII conversion
- **Multiple Character Sets**:
  - Standard ASCII (` .:-=+*#%@`)
  - Block characters (`░▒▓█`)
  - Braille (high resolution)
  - Minimal
- **Color Mode**: Preserve original video colors
- **Adjustable Resolution**: Control the detail level
- **Invert Mode**: Flip brightness values
- **Retro CRT Aesthetic**: Scanline effects and terminal styling

## How It Works

1. Video frames are drawn to a hidden canvas
2. Pixel data is extracted and brightness is calculated
3. Brightness values are mapped to characters (darker = denser characters)
4. Characters are rendered to a `<pre>` element at ~30 FPS
5. Optional color is applied via inline styles

## Usage

1. Open `index.html` in a modern browser
2. Upload a video file OR click "Use Webcam"
3. Adjust resolution and character set to your preference
4. Toggle color mode for colored ASCII output

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Local Development

No build tools required! Just serve the files:

```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve
```

Then open `http://localhost:8000`

## License

MIT
