# Adding real codes & pictures

This site currently ships with 3 demo codes (`jashdkjas9348`, `demo-code-2`, `demo-code-3`) pointing at placeholder SVGs in this folder. To add the real graduates:

1. **Drop the photo files into this `images/` folder.**
   - Any web format works: `.jpg`, `.png`, `.webp`. Portrait orientation looks best (the reveal frame is roughly 4:5).
   - Keep files reasonably sized (under ~1–2 MB each) so the page stays fast, especially on phones.
   - Suggested naming: `student-<something-unique>.jpg` (e.g. `student-jane-doe.jpg`) so files are easy to match to entries.

2. **Add one entry per person to [`data/codes.json`](../data/codes.json).**
   The file is a simple JSON object: `"code": { "image": "images/filename.jpg", "name": "Display Name" }`

   ```json
   {
     "jashdkjas9348": { "image": "images/placeholder-1.svg", "name": "Jane Doe" },
     "9x7k2q": { "image": "images/student-alex-tan.jpg", "name": "Alex Tan" },
     "grad-2026-042": { "image": "images/student-priya-shah.jpg", "name": "Priya Shah" }
   }
   ```
   - Codes are matched **case-insensitively** and with whitespace trimmed, so `ABC123` and `abc123` both work.
   - `name` is optional — leave it out (or set to `""`) and the reveal will just say "CONGRATULATIONS!" with no name.
   - You can have anywhere from a handful up to a few hundred entries; there's no special limit for this setup.

3. **Remove the demo entries** (`jashdkjas9348`, `demo-code-2`, `demo-code-3`) and the `placeholder-*.svg` files once you don't need them anymore, or just leave them — they won't hurt anything.

4. **Redeploy** — if you're using the Vercel CLI, run `vercel --prod` from the project folder. If it's connected to a Git repo, just commit and push these changes and Vercel will redeploy automatically.

## Note on privacy

Because this is a static site, the entire `data/codes.json` file (all codes, names, and image paths) is downloaded by anyone who visits the page — codes are not verified secretly on a server. Don't rely on this for anything sensitive; it's meant for a fun, low-stakes reveal (e.g. handing out codes at a graduation event), not for protecting private information from a determined visitor who reads the page source.
