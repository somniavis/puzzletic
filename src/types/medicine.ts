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
      health: 7,
      happiness: -5,
    },
    price: 20,
  },
  {
    id: 'syringe',
    nameKey: 'medicine.items.syringe',
    icon: '💉',
    effects: {
      health: 25,
      happiness: -15,
    },
    price: 50,
  },
];
