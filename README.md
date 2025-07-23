# "Dragoner Curves"

This repository contains code for an experimental iteration of UW PLSE's classic [Dragon Curves outreach activity](https://uwplse.org/2024/01/22/Dragon-Curves.html). Some notable changes compared to past iterations are:

- **adding an audio interpretation of L-Systems**
- adding many more L-Systems (renditions of a Hilbert curve, Sierpinksi triangles, and a fern)
- exposing the underlying L-System (both its axiom/rules and the generated string)
- incrementally animating the creation of the curve alongside the corresponding character in the alphabet

We first used this for a Summer 2025 workshop with [Changemakers in Computing (CiC)](https://cic.cs.washington.edu/).

## Development Notes

### Setup and Build

This project is written in TypeScript and was bootstraped with `@preact/preset-vite` ([`preact`](https://preactjs.com/) is a simple alternative to React that has an almost identical API). It was developed with Node 22.

Running the app locally is similar to most Node-based projects:

```
$ git clone https://github.com/uwplse/dragoner-curves.git
$ cd dragoner-curves
$ npm install
$ npm run dev
```

`npm run dev` starts a dev server at http://localhost:5173/.

This project is automatically deployed to GitHub Pages via GitHub Actions. See `.github/workflows` for more information, and `npm run build` generate a production build at `dist/`.

### Misc Notes

Coming soon :)

## Acknowledgements

This project builds on:

- prior iterations of the UW PLSE Dragon Curves activity. Many people were involved; thank-yous are in order for:
    - past PLSE outreach chairs Audrey Seo, Oliver Flatt, and CSE Outreach Committee Lead Hannah Potter for their significant work in supporting this activity
    - PLSE members for their feedback and support in running past events, including Gilbert Bernstein (who originally suggested adding audio to the demo), John Leo, Kirsten Graham, Ben Wang, Amy Zhu, Elliot Zackrone, and many others!
    - [Changemakers in Computing (CiC)](https://cic.cs.washington.edu/) mentors who provided feedback on the activity!
- prior work that Oliver Flatt worked on at the [University of Utah](https://www.utah.edu/) and as part of the [GREAT Summer Camp](https://users.cs.utah.edu/~dejohnso/GREAT/index.shtml)

In addition, the following resources were helpful in creating the demo:

- the Wikipedia pages on [L-Systems](https://en.wikipedia.org/wiki/L-system), [Dragon curves](https://en.wikipedia.org/wiki/Dragon_curve), the [Barnsley fern](https://en.wikipedia.org/wiki/Barnsley_fern), the [Hilbert curve](https://en.wikipedia.org/wiki/Hilbert_curve), and [Twinkle Twinkle Little Star](https://en.wikipedia.org/wiki/Twinkle,_Twinkle,_Little_Star)
- Harrison Milbradt's [blog post on implementing Panning and Zooming in HTML Canvas](https://harrisonmilbradt.com/blog/canvas-panning-and-zooming), which was modified for this app's pan and zoom feature
- [p5.js](https://p5js.org/) and [Processing](https://processing.org/), which were used to create prior versions of this demo
- Rico Trebeljahr's [Fractal Garden](https://www.fractal.garden/) project, which was helpful inspiration (even though no code was used)

This project is written in [Typescript](typescriptlang.org) and uses the following MIT-licensed libraries:

- [Preact](https://preactjs.com/) (as a bite-sized UI framework)
- [Tone.js](https://tonejs.github.io/) (for high-level audio manipulation)
- [Vite](https://vite.dev/) (as a JS build and tooling system)

All mistakes should be attributed to Matt Wang :)
