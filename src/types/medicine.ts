export interface MedicineItem {
  id: string;
  nameKey: string; // i18n key for medicine name
  icon: string;
  effects: {
    health: number;
    happiness: number;
  };
  price: number; // Price in 'glo'
}

export const MEDICINE_ITEMS: MedicineItem[] = [
  {
    id: 'pill',
    nameKey: 'medicine.items.pill',
    icon: '💊',
    effects: {
      health: 25,
      happiness: -5,
    },
    price: 50,
  },
  {
    id: 'syringe',
    nameKey: 'medicine.items.syringe',
    icon: '💉',
    effects: {
      health: 60,
      happiness: -15,
    },
    price: 150,
  },
];
