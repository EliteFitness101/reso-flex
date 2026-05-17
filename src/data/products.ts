export type Product = {
  id: string;
  name: string;
  tagline: string;
  was: number;
  now: number;
  features: string[];
  popular?: boolean;
  icon: string;
};

export const NGN = (n: number) =>
  "₦" + n.toLocaleString("en-NG");

export const PRODUCTS: Product[] = [
  {
    id: "citysports-walk",
    name: "CitySports Under-Desk Walking Pad",
    tagline: "Silent productivity engine for executives",
    was: 450000,
    now: 351000,
    icon: "fa-person-walking",
    features: ["Whisper DC motor", "Slim under-desk profile", "Remote + app control", "Up to 6 km/h"],
  },
  {
    id: "reso-2hp",
    name: "ResoFlex 2.0HP PowerSaver",
    tagline: "Entry-luxury daily cardio companion",
    was: 650000,
    now: 507000,
    icon: "fa-bolt",
    features: ["PowerSaver inverter motor", "Foldable cushion deck", "12 preset programs", "Up to 14 km/h"],
  },
  {
    id: "reso-25hp",
    name: "ResoFlex 2.5HP Complete Body Transform",
    tagline: "The flagship transformation system",
    was: 780000,
    now: 608400,
    icon: "fa-crown",
    popular: true,
    features: ["2.5HP continuous duty", "Auto-incline + massage", "HD touchscreen console", "Bluetooth + entertainment"],
  },
  {
    id: "reso-3hp",
    name: "ResoFlex 3.0HP Heavy Duty EVA Belt",
    tagline: "Engineered for family-scale endurance",
    was: 950000,
    now: 741000,
    icon: "fa-shield-halved",
    features: ["Reinforced EVA running belt", "180kg user capacity", "Auto-lubrication system", "Up to 18 km/h"],
  },
  {
    id: "reso-35hp",
    name: "ResoFlex 3.5HP Smart-DC Line",
    tagline: "Smart-DC tech for athletes and clinics",
    was: 1200000,
    now: 936000,
    icon: "fa-microchip",
    features: ["Smart-DC silent motor", "Auto-incline 18 levels", "AI workout tracking", "Premium shock dampening"],
  },
  {
    id: "reso-4hp",
    name: "ResoFlex 4.0HP Commercial Beast",
    tagline: "Gym-grade. Built for institutions.",
    was: 1800000,
    now: 1404000,
    icon: "fa-dumbbell",
    features: ["4.0HP commercial motor", "Industrial steel frame", "200kg capacity", "24/7 duty-cycle rating"],
  },
  {
    id: "reso-spin",
    name: "ResoFlex Studio Precision Spin Bike",
    tagline: "Boutique studio energy at home",
    was: 450000,
    now: 351000,
    icon: "fa-bicycle",
    features: ["Magnetic flywheel resistance", "Studio-grade chassis", "LCD performance console", "Silent ride engine"],
  },
];
