# Mock Exam Labeler

Local Electron app for adding precise labels and leader lines to generated mock-exam illustrations.

## Features

- Open PNG, JPG, JPEG, and WebP images.
- Add draggable exam-style labels such as `(가)`, `(나)`, `A`, `B`, `㉠`, and `①`.
- Set font family, custom font name, size, padding, color, background, bold, italic, underline, and outline.
- Add per-label leader lines with straight or elbow shape, solid or dashed style, width, gap, and numeric start coordinates.
- Drag the leader-line endpoint with a pixel magnifier.
- Export labeled PNG, blank PNG, and labels-only PNG.
- Save and reopen project files as `.melp`.

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run dist
```

The Windows installer and portable executable are written to `release/`.
