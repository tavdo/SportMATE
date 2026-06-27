import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const VENUES = [
  ["venue-boulevard-stadium", "Boulevard Stadium", 41.6432429, 41.6140491, ["football"], "ცენტრი", "grass", false, true, "უფასო, საჯარო. იდეალური pickup ფეხბურთისთვის."],
  ["venue-batumi-mini-football", "Batumi Mini Football Field", 41.6326667, 41.6347255, ["football"], "ცენტრი", "turf", false, true, "24/7 ღია, ცენტრში."],
  ["venue-boulevard-mini-football", "Boulevard Mini Football Courts", 41.6535192, 41.6307354, ["football"], "ბულვარი", "turf", false, true, "24/7, ბულვართან. ზედაპირი დაზიანებულია — სიფრთხილით."],
  ["venue-tornike-basketball", "Tornike's Basketball Court", 41.619637, 41.606973, ["basketball"], "ხიმშიაშვილი", "rubber", false, true, "24/7, განათებული. აქტიური community #BBALLBATUMI."],
  ["venue-alik-stadium", "Alik Stadium", 41.6492063, 41.6317091, ["basketball"], "ნოვი ბულვარი", "rubber", false, true, "24/7, უფასო."],
  ["venue-rustaveli-basketball", "Basketball Court (Rustaveli)", 41.641023, 41.638434, ["basketball"], "რუსთაველი", "asphalt", false, true, "საჯარო, ცენტრთან ახლოს."],
  ["venue-boulevard-volleyball", "Boulevard Volleyball Court", 41.6534068, 41.6304482, ["volleyball"], "ბულვარი", "sand", false, true, "ბულვარზე. ხშირად გამოცდილი მოთამაშეები — skill ფილტრი მნიშვნელოვანია."],
  ["venue-rocknblock-volleyball", "Rock'n'block Beach Volleyball", 41.5743017, 41.6269933, ["volleyball"], "სანაპირო", "sand", false, true, "2 მოედანი, სამხრეთით. სამხრეთ ბათუმი."],
  ["venue-sports-complex", "Batumi Sports Complex", 41.6262285, 41.6263564, ["football", "basketball", "volleyball"], "ცენტრი", "mixed", true, false, "მრავალსპორტი — დახურული. შესაძლოა ფასიანი/ჯავშნით."],
];

const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
const filePath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH ?? "firebase-service-account.json";

let credential;
if (json) {
  credential = cert(JSON.parse(json));
} else {
  const { readFileSync, existsSync } = await import("fs");
  if (!existsSync(filePath)) {
    console.error("Set FIREBASE_SERVICE_ACCOUNT_JSON or add firebase-service-account.json");
    process.exit(1);
  }
  credential = cert(JSON.parse(readFileSync(filePath, "utf8")));
}

initializeApp({ credential });
const db = getFirestore();
const batch = db.batch();

for (const [id, name, lat, lng, sports, district, surface, is_indoor, is_free, note] of VENUES) {
  batch.set(db.collection("venues").doc(id), {
    name, lat, lng, sports, district, surface, is_indoor, is_free, note, photo_url: null,
  });
}

await batch.commit();
console.log(`Seeded ${VENUES.length} venues`);
