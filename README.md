# Firefly Animation

A gentle, looping firefly animation built with HTML, CSS and JavaScript — lightweight, easy to run and customise.

![Firefly Animation Screenshot](https://raw.githubusercontent.com/BinaryVortex/Firefly-Animation/main/Screenshot%202024-05-26%20234426.png)

## About

This project renders floating "fireflies" that glow and drift around the screen to create a calming animated background. It uses plain JavaScript for particle generation and animation, with CSS for basic styling and glow effects.

## Features

- Smooth, continuous animation using requestAnimationFrame
- Randomized positions, sizes, speeds and glow intensity for natural motion
- Easy to customize (number of fireflies, colors, speed)
- No build step or dependencies — just open index.html

## Files

- `index.html` — page shell and container
- `style.css` — basic layout and glow styling
- `script.js` — firefly generation and animation logic
- `Screenshot 2024-05-26 234426.png` — preview image used in this README

## Run locally

1. Clone the repo:

   git clone https://github.com/BinaryVortex/Firefly-Animation.git
2. Open `index.html` in your browser (double-click or right-click → Open with...)

Optional: run a local server (recommended if you use modules or want cleaner URLs):

- With Python 3: `python -m http.server 8000`
- With VS Code: install Live Server and click "Go Live"

Then visit http://localhost:8000 in your browser.

## Customize

Open `script.js` and look for the configuration values at the top (number of fireflies, color ranges, speed). Tweak them to change the look & feel.

Tips:
- Reduce the number of fireflies to improve performance on low-end devices
- Adjust blur/opacity in `style.css` to change glow intensity

## Contributing

Contributions, suggestions and improvements are welcome. Open an issue or submit a pull request.

## Credits

Built by BinaryVortex.

