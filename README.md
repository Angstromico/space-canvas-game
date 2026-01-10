# Canvas Space Shooting Game

![Action Shot](https://raw.githubusercontent.com/Angstromico/space-canvas-game/master/canvas.png)

A fast-paced, arcade-style space shooter built with HTML5 Canvas and TypeScript. Survive as long as you can against waves of enemies!

[**Play the Demo**](https://manuel-morales-space-canvas-game.netlify.app/)

## Features

- **Intense Gameplay**: Dodge and shoot enemies that swarm you from all directions.
- **Power-ups & Particle Effects**: Satisfying explosions and visual effects using GSAP.
- **Score System**: Track your high scores.
- **Local Storage**: Saves your player name, scores, and settings (music/sound preferences) automatically.
- **Audio**: Immersive sound effects and background music with toggle controls.
- **Responsive UI**: Clean interface built with TailwindCSS.

## Tech Stack

This project has been modernized from vanilla JavaScript to a robust TypeScript setup:

- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Bundler**: [Vite](https://vitejs.dev/)
- **Graphics**: HTML5 Canvas API
- **Animations**: [GSAP](https://greensock.com/gsap/)
- **Styling**: [TailwindCSS](https://tailwindcss.com/) & [Bootstrap](https://getbootstrap.com/)
- **DOM Manipulation**: [jQuery](https://jquery.com/)

## Getting Started

### Prerequisites

- Node.js (v14 or higher recommended)
- npm

### Installation

1.  Clone the repository:

    ```bash
    git clone https://github.com/Angstromico/space-canvas-game.git
    cd space-canvas-game
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

### Usage

**Development Server**
Start the local development server with hot reload:

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

**Production Build**
Build the project for production:

```bash
npm run build
```

The output will be in the `dist/` directory.

**Preview Production Build**
Preview the built application locally:

```bash
npm run preview
```

## Controls

- **Move**: `W`, `A`, `S`, `D` or Arrow Keys
- **Shoot**: Mouse Click (shoots towards cursor)
- **Pause/Menu**: `Tab`, `Esc`, or `Space`

## Credits

Original game concept inspired by Chris Courses: [HTML5 Canvas Game Tutorial](https://www.youtube.com/watch?v=eI9idPTT0c4&t=5s).
Enhanced with TypeScript, additional game mechanics, local storage, and UI improvements by Manuel Morales.
