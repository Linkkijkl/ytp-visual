# ytp-visual

ATK-YTP 24 visual stuff
by Vili Kärkkäinen (viljokass)
monitor texture by Jami Virtanen


To run, you need [node.js](https://nodejs.org/en/download/package-manager).

Also you'll need three.js and vite, install them using npm like this:

```
npm install --save three

npm install --save-dev vite
```

Then run

```
npx vite
```

If it starts complaining about OBJLoader import problems, check for the solution from main.js.
The problem's probably caused by package-lock.json changing now that I think about it.

Performance wise, currently it should be okay. Only minimal stutter on my at least a decade old business laptop.
Mobile devices have not been tested.
