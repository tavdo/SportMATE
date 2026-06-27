import type { SportType } from "./types";

export interface SeedVenue {
  id: string;
  name: string;
  lat: number;
  lng: number;
  sports: SportType[];
  district: string;
  surface: string;
  is_indoor: boolean;
  is_free: boolean;
  note: string;
}

export const SEED_VENUES: SeedVenue[] = [
  {
    id: "venue-boulevard-stadium",
    name: "Boulevard Stadium",
    lat: 41.6432429,
    lng: 41.6140491,
    sports: ["football"],
    district: "ცენტრი",
    surface: "grass",
    is_indoor: false,
    is_free: true,
    note: "უფასო, საჯარო. იდეალური pickup ფეხბურთისთვის.",
  },
  {
    id: "venue-batumi-mini-football",
    name: "Batumi Mini Football Field",
    lat: 41.6326667,
    lng: 41.6347255,
    sports: ["football"],
    district: "ცენტრი",
    surface: "turf",
    is_indoor: false,
    is_free: true,
    note: "24/7 ღია, ცენტრში.",
  },
  {
    id: "venue-boulevard-mini-football",
    name: "Boulevard Mini Football Courts",
    lat: 41.6535192,
    lng: 41.6307354,
    sports: ["football"],
    district: "ბულვარი",
    surface: "turf",
    is_indoor: false,
    is_free: true,
    note: "24/7, ბულვართან. ზედაპირი დაზიანებულია — სიფრთხილით.",
  },
  {
    id: "venue-tornike-basketball",
    name: "Tornike's Basketball Court",
    lat: 41.619637,
    lng: 41.606973,
    sports: ["basketball"],
    district: "ხიმშიაშვილი",
    surface: "rubber",
    is_indoor: false,
    is_free: true,
    note: "24/7, განათებული. აქტიური community #BBALLBATUMI.",
  },
  {
    id: "venue-alik-stadium",
    name: "Alik Stadium",
    lat: 41.6492063,
    lng: 41.6317091,
    sports: ["basketball"],
    district: "ნოვი ბულვარი",
    surface: "rubber",
    is_indoor: false,
    is_free: true,
    note: "24/7, უფასო.",
  },
  {
    id: "venue-rustaveli-basketball",
    name: "Basketball Court (Rustaveli)",
    lat: 41.641023,
    lng: 41.638434,
    sports: ["basketball"],
    district: "რუსთაველი",
    surface: "asphalt",
    is_indoor: false,
    is_free: true,
    note: "საჯარო, ცენტრთან ახლოს.",
  },
  {
    id: "venue-boulevard-volleyball",
    name: "Boulevard Volleyball Court",
    lat: 41.6534068,
    lng: 41.6304482,
    sports: ["volleyball"],
    district: "ბულვარი",
    surface: "sand",
    is_indoor: false,
    is_free: true,
    note: "ბულვარზე. ხშირად გამოცდილი მოთამაშეები — skill ფილტრი მნიშვნელოვანია.",
  },
  {
    id: "venue-rocknblock-volleyball",
    name: "Rock'n'block Beach Volleyball",
    lat: 41.5743017,
    lng: 41.6269933,
    sports: ["volleyball"],
    district: "სანაპირო",
    surface: "sand",
    is_indoor: false,
    is_free: true,
    note: "2 მოედანი, სამხრეთით. სამხრეთ ბათუმი.",
  },
  {
    id: "venue-sports-complex",
    name: "Batumi Sports Complex",
    lat: 41.6262285,
    lng: 41.6263564,
    sports: ["football", "basketball", "volleyball"],
    district: "ცენტრი",
    surface: "mixed",
    is_indoor: true,
    is_free: false,
    note: "მრავალსპორტი — დახურული. შესაძლოა ფასიანი/ჯავშნით.",
  },
];
