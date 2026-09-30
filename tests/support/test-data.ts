import { requireEnv } from './users';

export const listUrl = () => requireEnv('LIST_URL');

// produkty z projektu "PROJEKT REKRUTACJA", lista KOSZTORYS
export const products = {
  sofa: 'Narożnik rozkładany Botse',
  coffeeTable: 'Okrągły stolik kawowy',
  armchair: 'Fotel obrotowy Solla',
};

// po znaczniku szukamy powiadomienia z konkretnego przebiegu
export function uniqueTag(prefix: string) {
  const stamp = new Date().toISOString().slice(0, 19).replace(/[-:T]/g, '');
  return `[${prefix} ${stamp}]`;
}
