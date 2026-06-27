import type { SportType, SkillLevel } from "@/lib/types";

export const ka = {
  appName: "SportMate Batumi",
  tagline: "იპოვე pickup თამაში ბათუმში",

  nav: {
    map: "რუკა",
    myGames: "ჩემი თამაშები",
    profile: "პროფილი",
  },

  onboarding: {
    title: "მოგესალმები!",
    subtitle: "აირჩიე ფსევდონიმი და სპორტი",
    nicknameLabel: "ფსევდონიმი",
    nicknamePlaceholder: "მაგ: ნიკა",
    sportsLabel: "სპორტი",
    colorLabel: "ფერი",
    submit: "დაწყება",
    nicknameRequired: "ფსევდონიმი სავალდებულოა",
    sportsRequired: "აირჩიე მინიმუმ ერთი სპორტი",
  },

  sports: {
    football: "ფეხბურთი",
    basketball: "კალათბურთი",
    volleyball: "ფრენბურთი",
  } satisfies Record<SportType, string>,

  skill: {
    any: "ნებისმიერი",
    beginner: "დამწყები",
    intermediate: "საშუალო",
    advanced: "გამოცდილი",
  } satisfies Record<SkillLevel, string>,

  map: {
    createGame: "თამაშის შექმნა",
    filters: "ფილტრები",
    today: "დღეს",
    tomorrow: "ხვალ",
    thisWeek: "ამ კვირაში",
    allSports: "ყველა",
    players: "კაცი",
    details: "დეტალურად",
    emptyFilter: "ამ ფილტრით თამაში არ არის — შექმენი პირველი!",
    loading: "იტვირთება...",
  },

  session: {
    join: "ჩავწერ თავს",
    leave: "გავდივარ",
    full: "ადგილი აღარ არის",
    cancel: "გააუქმე თამაში",
    host: "ორგანიზატორი",
    players: "მოთამაშეები",
    going: "მოდის",
    skillWarning: "შენი დონე განსხვავდება თამაშის დონისგან — მაინც შეგიძლია ჩაწერა.",
    cancelled: "გაუქმებული",
    done: "დასრულებული",
    markNoShow: "მონიშნე ვინ არ მოვიდა",
    noShowSaved: "განახლდა",
    venue: "მოედანი",
    dateTime: "დრო",
    note: "შენიშვნა",
  },

  create: {
    title: "ახალი თამაში",
    stepVenue: "მოედანი",
    stepSport: "სპორტი",
    stepTime: "დრო",
    stepDetails: "დეტალები",
    selectVenue: "აირჩიე მოედანი",
    selectSport: "აირჩიე სპორტი",
    date: "თარიღი",
    time: "საათი",
    maxPlayers: "მაქს. მოთამაშე",
    skill: "დონე",
    note: "შენიშვნა (არასავალდებულო)",
    notePlaceholder: "მაგ: ყველასთან ერთად ვთამაშობთ",
    submit: "შექმნა",
    next: "შემდეგი",
    back: "უკან",
    listView: "სია",
    mapView: "რუკა",
  },

  myGames: {
    title: "ჩემი თამაშები",
    upcoming: "მომავალი",
    past: "წარსული",
    hosted: "ორგანიზებული",
    joined: "ჩაწერილი",
    empty: "ჯერ არ გაქვს თამაში",
    emptyHint: "შექმენი ან ჩაეწერე თამაშში რუკიდან",
    reliability: "ნათამაშები",
    noShows: "გაცდენილი",
  },

  profile: {
    title: "პროფილი",
    nickname: "ფსევდონიმი",
    sports: "სპორტი",
    save: "შენახვა",
    saved: "შენახულია",
    verified: "დადასტურებული",
    notVerified: "დაუდასტურებელი",
    gamesPlayed: "ნათამაშები",
    noShows: "გაცდენილი",
    editProfile: "რედაქტირება",
  },

  common: {
    error: "შეცდომა",
    firebaseNotConfigured:
      "Firebase არ არის დაკავშირებული. Firebase Console → Service Accounts → დააგენერირე private key და ჩაწერე FIREBASE_SERVICE_ACCOUNT_JSON .env.local ფაილში.",
    retry: "თავიდან",
    cancel: "გაუქმება",
    loading: "იტვირთება...",
    back: "უკან",
  },

  status: {
    open: "ღია",
    full: "სავსე",
    cancelled: "გაუქმებული",
    done: "დასრულებული",
  },
} as const;

export type KaStrings = typeof ka;
