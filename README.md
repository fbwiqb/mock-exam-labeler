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

## Editable Workflow

Use PNG exports for PowerPoint or exam insertion. Use `.melp` project files when you need to edit labels later.

1. Open an image.
2. Add labels and leader lines.
3. Save the project as `.melp`.
4. Export the labeled and blank PNG pair.
5. Later, open the `.melp` file instead of the exported PNG to keep editing labels separately.

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
