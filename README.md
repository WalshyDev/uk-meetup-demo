# Cloudflare London Meetup (Pages + R2)

This demo is using Cloudflare Pages and R2 (using Worker bindings). Sadly I did not get around to adding R2 bindings for Functions but that will be supported in the future!

## Upload an image

To upload an image simply clone this repo and then run the `upload.sh` file if you're on Mac/Linux or the `upload.bat` file if you're on Windows.

```bash
./upload.sh assets/cloudflare-logo.png
# -- or --
./upload.bat assets/cloudflare-logo.png
```

## Setup
1. Clone the repo
2. Create the R2 bucket with [wrangler2](https://github.com/cloudflare/wrangler2)
   1. `wrangler r2 bucket create uk-meetup`
3. Deploy to [Cloudflare Pages](https://pages.dev)
4. Deploy the Worker
   1. Modify the `wranger.toml` to include your domain
   2. Publish! `wrangler publish`
5. Enjoy!