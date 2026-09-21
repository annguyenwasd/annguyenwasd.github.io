# An Nguyen’s personal site

This repository contains An Nguyen’s personal site and blog, published with Jekyll and GitHub Pages.

The site uses the [LightSpeed](https://github.com/tajacks/lightspeed) Jekyll theme, vendored from commit `d1aef2c573e4cb1a7d027936f20b881eb89db919`. LightSpeed is licensed under GPL-3.0; its license is included in [`COPYING`](COPYING). The original project license remains in [`LICENSE`](LICENSE).

## Local development

Install Ruby 3.3 and Bundler, then run:

```sh
bundle install
bundle exec jekyll serve --livereload
```

Open <http://127.0.0.1:4000> in a browser.

## Publishing

Pushes to `main` run [`.github/workflows/pages.yml`](.github/workflows/pages.yml), which builds the site and deploys it to GitHub Pages.
