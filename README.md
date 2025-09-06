# Backend README (Node + Express + Firebase Admin)
![Architecture Diagram](architecture_diagram.png)

## Overview
This backend is a **Node.js + Express** server that provides CRUD endpoints for users. It uses:
- **Firebase Admin SDK** (writes to RTDB, bypassing client restrictions)
- **OpenWeatherMap API** (to enrich latitude, longitude, timezone from ZIP code)
- **Zod** (input validation)
- **Axios** (HTTP requests)
- **CORS, dotenv** (environment and middleware utilities)

---

## Endpoints

### Health
- `GET /` -> returns `"API is ready to work!"`

### Users
- `GET /api/users` -> list all users  
- `GET /api/users/:id` -> fetch single user  
- `POST /api/users` -> create user (`name`, `zip`)  
  - Enriches `latitude`, `longitude`, `timezone` from OpenWeatherMap  
  - Persists `id` inside the record  
- `PATCH /api/users/:id` -> update user  
  - Re-fetches `latitude`, `longitude`, `timezone` if `zip` changed  
- `DELETE /api/users/:id` -> remove user

---

## Requirements Mapping
+ CRUD endpoints implemented  
+ Data stored in NoSQL (Firebase RTDB)  
+ User fields: `id, name, zip, latitude, longitude, timezone`  
+ On create: only `name` + `zip` input, enrichment handled on server  
+ On update: re-enrichment triggered if ZIP changes  
+ React frontend connected  
+ Extra creative features: caching, real-time reads, Google Maps visualization

---

## Tech Stack
- **Node.js 18+**
- **Express 5**
- **Firebase Admin SDK**
- **Axios**
- **Zod**
- **dotenv / cors / nodemon**

---

## Getting Started

### Prerequisites
- Node.js >= 18
- Firebase project with a **Service Account JSON** (Admin SDK key)
- OpenWeatherMap API key

### Setup
```bash
cd backend
npm install
```

Create `.env` file:
```env
PORT=8080
OWM_API_KEY=your-openweather-api-key
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_DB_URL=https://your-project-id.firebaseio.com
```

### Run
```bash
npm run dev
```

---

## Notes
- **Security**:  
  - RTDB rules are `.write: false` for clients; only backend (Admin SDK) can write.  
  - Reads are `.read: auth != null`; frontend signs in anonymously.

- **Error handling**:  
  - Invalid ZIPs return `502` errors.  
  - Validation errors return `400`.  
  - Not found returns `404`.

- **Extensibility**:  
  - Easily extend schema with more user fields.  
  - Could add LRU caching of ZIP→lat/lon/timezone to reduce OpenWeatherMap calls.  
  - Ready for deployment on Cloud Run or Firebase Functions.



## **License**
MIT License – free to use and modify.

---

## **Author**
Victor Manuel Suarez Torres - victormst@gmail.com.
