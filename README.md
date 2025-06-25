# 🔐 ForgeID

A scalable, secure, and verifiable unique ID generator for Node.js.  
Designed to evolve with time and prevent collisions for decades — even millennia.

[![NPM Version](https://img.shields.io/npm/v/forgeid.svg)](https://www.npmjs.com/package/forgeid)
[![License](https://img.shields.io/npm/l/forgeid)](LICENSE)
[![Build](https://img.shields.io/badge/build-webpack-blue)](webpack.config.js)

---

## ✨ Features

- ✅ Cryptographic uniqueness with HMAC verification
- 📈 ID length increases with time (configurable growth)
- 💻 Host fingerprinting support (MAC + hostname)
- 🔍 Collision-tested with millions of keys
- 🧪 Built-in verification & stress test
- 🪶 Lightweight and dependency-free (only uses `crypto` and `os`)

---

## 🚀 Installation

```bash
npm install forgeid
```

---

## 🔧 Usage

```js
const ForgeID = require('forgeid')
const forge = new ForgeID('your-secret')

const id = forge.generate()
console.log('ID:', id)

const isValid = forge.verify(id)
console.log('Verified:', isValid)
```

---

## 📀 ID Format

Each ID includes:
- Entropy (from `crypto.randomBytes`)
- Host fingerprint (MAC + hostname hash)
- Timestamp (base36)
- HMAC (SHA-256, last 10 chars)

🧱 **Length** is dynamic:  
`length = baseLength + floor((currentYear - startYear) / intervalYears)`

Example:
```
kfjd9m28txv4ydnnsn20
```

---

## 🥪 Stress Testing

```js
const forge = new ForgeID('your-secret')
forge.stressTest(1e6) // generates 1,000,000 IDs, checks for duplicates & HMAC
```

---

## 📆 Build

```bash
npm run build
```

Produces:
- `dist/forgeid.min.js` → optimized bundle
- `dist/forgeid.d.ts` → TypeScript typings

---

## 🥉 Type Support

If you're using TypeScript or editor IntelliSense:

```ts
import ForgeID from 'forgeid'

const forge = new ForgeID('secret')
const id: string = forge.generate()
const valid: boolean = forge.verify(id)
```

---

## 📄 License

MIT © [NeaByteLab](https://github.com/NeaByteLab)