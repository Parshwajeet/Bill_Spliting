export interface RandomScenario {
  occasion: string;
  billAmount: number;
  peopleCount: number;
  tipPercentage: number;
  taxPercentage: number;
  sampleNames: string[];
}

export const SAMPLE_OCCASIONS = [
  'Friday Sushi & Sake Feast 🍣',
  'Taco Tuesday Fiesta 🌮',
  'Trattoria Pasta & Chianti Night 🍝',
  'Rooftop Tapas & Sangria 🍷',
  'Post-Work Ramen & Gyoza Bowl 🍜',
  'Sunday Brunch & Mimosa Flight 🥞',
  'Korean BBQ Grill & Soju 🥩',
  'Wood-Fired Pizza & Craft Beer 🍕',
  'Thai Green Curry & Pad Thai 🍛',
  'Mediterranean Mezze Platter 🫒',
  'Late-Night Burger & Milkshakes 🍔',
  'Dim Sum Steamer Basket Feast 🥟',
  'Steakhouse Birthday Dinner 🥩',
  'Indian Biryani & Naan Feast 🥘',
];

export const SAMPLE_FRIEND_NAMES = [
  ['Alex', 'Sam', 'Jordan', 'Taylor'],
  ['Chloe', 'Liam', 'Maya', 'Noah', 'Elena'],
  ['Marcus', 'Sophia', 'Lucas'],
  ['Emma', 'Oliver', 'Ava', 'Ethan', 'Isabella', 'Mason'],
  ['Devon', 'Kai', 'Avery', 'Riley', 'Morgan'],
  ['Hana', 'Kenji', 'Yuki', 'Ren'],
  ['Mateo', 'Camila', 'Santiago', 'Valentina'],
];

/**
 * Generates a realistic dinner occasion scenario with random occasion, bill, and friends.
 */
export function generateRandomScenario(): RandomScenario {
  const occasion =
    SAMPLE_OCCASIONS[Math.floor(Math.random() * SAMPLE_OCCASIONS.length)];
  const nameSet =
    SAMPLE_FRIEND_NAMES[Math.floor(Math.random() * SAMPLE_FRIEND_NAMES.length)];

  // People count between 2 and 8
  const peopleCount = Math.floor(Math.random() * 6) + 2;

  // Realistic per person spend between $18 and $65
  const perPersonSpend = Math.floor(Math.random() * 47) + 18;
  const cents = (Math.floor(Math.random() * 19) * 5) / 100; // .00, .05, .10 ... .95
  const baseTotal = peopleCount * perPersonSpend + cents;
  const billAmount = Math.round(baseTotal * 100) / 100;

  // Tip presets (15%, 18%, 20%)
  const tips = [15, 18, 20];
  const tipPercentage = tips[Math.floor(Math.random() * tips.length)];

  // Tax percentage (typically around 8.875% or 0% if included)
  const taxPercentage = 0;

  // Generate friend names matching count
  const names: string[] = [];
  for (let i = 0; i < peopleCount; i++) {
    if (i < nameSet.length) {
      names.push(nameSet[i]);
    } else {
      names.push(`Friend ${i + 1}`);
    }
  }

  return {
    occasion,
    billAmount,
    peopleCount,
    tipPercentage,
    taxPercentage,
    sampleNames: names,
  };
}
