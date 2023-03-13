import { initializeApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { doc, setDoc } from 'firebase/firestore';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';

//Initialize express
const app = express();

//Parse .env file and retrieve secret keys
const env = dotenv.config().parsed;

//Store each seccret key in firebaseConfig
const firebaseConfig = {
  apiKey: env.FIREBASE_API_KEY,
  authDomain: env.FIREBASE_AUTH_DOMAIN,
  projectId: env.FIREBASE_PROJECT_ID,
  storageBucket: env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.FIREBASE_MESSAGING_SENDER_ID,
  appId: env.FIREBASE_APP_ID,
};

// Initialize Firebase
const firebase = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore(firebase);

app.use(cors());
app.use(
  cors({
    origin: '*',
    optionsSuccessStatus: 200,
  })
);
app.use(bodyParser.json());

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*'); // Replace * with the origin URL that should be allowed
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  res.header('Access-Control-Allow-Credentials', true);
  next();
});

app.get('/', function (req, res) {
  res.send('Hello World');
});

app.post('/createuser', async (req, res) => {
  console.log(req.body);
  if (
    !req.body ||
    !req.body.email ||
    !req.body.password ||
    !req.body.name ||
    !req.body.teodatZehut
  ) {
    return res
      .status(400)
      .send({ error: { message: 'invalid request, missing parameters' } });
  }
  let email = req.body.email;
  let password = req.body.password;
  let name = req.body.name;
  let teodatZehut = req.body.teodatZehut;
  if (
    email == null ||
    password == null ||
    name == null ||
    teodatZehut == null
  ) {
    return res
      .status(400)
      .send({ error: { message: 'invalid request, null fields received' } });
  }
  createUserWithEmailAndPassword(auth, email, password)
    .then(async (userCredential) => {
      res.status(200).send(userCredential);
      let uid = userCredential.user.uid;
      await addToDatabase(name, teodatZehut, uid);
    })
    .catch((error) => {
      res.status(401).send({ code: error.code });
    });
  return res.status(200);
});

const addToDatabase = async (name, teodatZehut, userId) => {
  await setDoc(doc(db, 'user_information', userId), {
    name: name,
    teodatZehut: parseInt(teodatZehut),
  });
};

app.post('/loginuser', async (req, res) => {
  console.log(req.body);
  if (!req.body || !req.body.email || !req.body.password) {
    return res
      .status(400)
      .send({ error: { message: 'invalid request, missing parameters' } });
  }
  let email = req.body.email;
  let password = req.body.password;
  if (email == null || password == null) {
    return res
      .status(400)
      .send({ error: { message: 'invalid request, null fields received' } });
  }
  signInWithEmailAndPassword(auth, email, password)
    .then(async (userCredential) => {
      res.status(200).send(userCredential);
    })
    .catch((error) => {
      res.status(401).send({ code: error.code });
    });
  return res.status(200);
});

app.listen(3000);
