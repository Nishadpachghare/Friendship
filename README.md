# Our Story — a private two-person memory site

A React + Tailwind website for the two of you: login-protected, black/white/gold
themed, with a timeline, a memory scrapbook, inside jokes, a "first fight" story,
three mini-games, stats, and a "what if we never met" / future memories closing.
Either of the two logged-in people can add new memories, timeline moments and
inside jokes right from the site — no code required for that part.

## 1. Personalize it (required)

Open `src/config/users.js` and set the two usernames/passwords/display names.
That's the login for the whole site — only these two accounts can get in.

Open `src/data/seedData.js` and replace the placeholder dates, captions and
story text with your real ones. Leave `image: ''` empty for anything you don't
have a photo for yet — you can also add photos later from inside the app
(Memories page → "Add memory", which lets you upload a photo from your device).

## 2. Run it

You need Node.js 18+ installed. Then, in this folder:

```
npm install
npm run dev
```

Open the printed local URL (usually http://localhost:5173) in your browser.

## 3. How data is saved

Everything you add inside the app (memories, photos, timeline events, inside
jokes, checked-off future memories, unlocked games) is saved in the browser's
local storage on the device you're using. That means:

- Both of you can log in and add things from the *same* browser/device and
  see each other's additions.
- If you each open the site on your *own* separate device, you'll each have
  your own local copy — you won't automatically see what the other person
  added on their device, since this version has no shared server database.

If you want true real-time sync across two separate devices/phones, the next
step would be to add a small backend (e.g. Firebase or a Node/Express +
MongoDB API, matching the original MERN idea) — the whole `DataContext.jsx`
file is written so that swapping localStorage calls for API calls is the only
thing that would need to change; every page already reads from `useData()`.

## 4. Project structure

```
src/
  config/users.js         <- the two logins (EDIT THIS)
  data/seedData.js        <- starting content (EDIT THIS)
  context/AuthContext.jsx <- login/logout/session
  context/DataContext.jsx <- memories/timeline/jokes storage + actions
  components/             <- Navbar, cards, modals, divider
  pages/                  <- one file per section of the site
  pages/games/            <- the three mini-games
```

## 5. Deploying so she/he can open it from a link

Easiest free option: `npm run build`, then drag the generated `dist/` folder
into Netlify Drop (netlify.com/drop), or connect the project to Vercel. Both
give you a shareable https link in under a minute.
