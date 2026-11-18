# The Silent Voice

Turns hand signs into readable text **and speech** in real time, in **English, Hindi, Bengali and Tamil**.
Built for people who are deaf or cannot speak: a calm, minimal interface, large type, and a one-tap emergency alert.

## Two ways to communicate

| Mode | For whom | How |
|---|---|---|
| **Everyday signs** | anyone, no training | 16 simple one-hand signs (fist = Yes, open palm = Hello, thumb up/down, 3-finger = Emergency, ...). Hold for ~1 second. **Two hands at once** = a combined message: 40+ curated pairs (e.g. Help + Water = "Please help me, I need water"), any other pair joins both sentences. |
| **ASL alphabet** | people who know ASL | Fingerspell letter by letter into a composer with word suggestions. **Second hand = remote**: open palm = space, thumb down = delete, thumb up = speak (left-handed switch included). Optional **personal calibration** adapts the recogniser to your own hand. |

Plus a **phrase library** (36 phrases in 5 categories) and a **sentence builder** (3 starters x 16 words, grammar-correct in 4 languages).

## How it works

```
Webcam -> MediaPipe HandLandmarker (WASM, in-browser, up to 2 hands) -> 21 landmarks per hand
   |- Everyday: rule-based classifier (which fingers are extended); two signs -> combination table
   '- ASL:      neural net (63 -> 192 -> 96 -> 24 letters) + smoothing + optional personal calibration
          -> stabiliser (sign must be held steady) -> text + Web Speech API voice
          -> history saved to MongoDB through the Express API
```

### ASL model: data and honest accuracy
Trained on three public datasets: Hugging Face `Marxulia/asl_sign_languages_alphabets_v03` and `_v02` (single-signer photos,
landmarks extracted with the same MediaPipe model) and `sid220/asl-now-fingerspelling` (multi-signer webcam landmarks from the
ASLNow! app). Augmented with mirroring, 3D tilt, scale and noise.

* Accuracy on **held-out frames of the same sources: ~96%** (optimistic: same signers/cameras).
* A model trained on the photo set alone scored **~77% on independent webcam data**, which is why the webcam data and the
  personal-calibration feature were added. Real-world accuracy depends on your lighting, camera and signing style: use
  **Calibrate** (ASL tab) to record ~12 samples of any letter that is misread.
* Static letters only: **J and Z need motion and are not supported.** Indian Sign Language (two-handed alphabet) is not implemented.

## Run locally

```bash
cd Backend  && npm install && npm run dev      # http://localhost:3000   (needs Backend/.env, see .env.example)
cd Frontend && npm install && npm run dev      # http://localhost:5173   (proxies /api to :3000)
```

Single-host mode: `cd Frontend && npm run build`, then start the backend. Express serves `Frontend/dist` and the API on one port.
Browsers only allow the camera on **HTTPS** or `localhost`, so deploy behind HTTPS.

## API

| Method | Route | Auth | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | none | create account, returns JWT |
| POST | `/api/auth/login` | none | returns JWT |
| GET | `/api/auth/me` | JWT | current user |
| GET / POST | `/api/history` | JWT | list / add entry |
| DELETE | `/api/history/:id` · `/api/history` | JWT | delete one / clear all |
| GET | `/api/health` | none | liveness + DB state |

## Environment (Backend/.env)

`PORT`, `MONGO_URI`, `JWT_SECRET`, optional `CLIENT_URL` (comma-separated origins for CORS in a split deploy).
