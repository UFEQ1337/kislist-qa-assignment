import path from 'node:path';

export type UserKey = 'piotr' | 'anna' | 'marcin' | 'michalina' | 'klient';

export interface TestUser {
  key: UserKey;
  name: string;
  role: 'team' | 'client';
  email: string;
  password: string;
  storageState: string;
}

const AUTH_DIR = path.join(__dirname, '..', '..', '.auth');

const definitions: Array<Pick<TestUser, 'key' | 'name' | 'role'>> = [
  { key: 'piotr', name: 'Piotr', role: 'team' },
  { key: 'anna', name: 'Anna', role: 'team' },
  { key: 'marcin', name: 'Marcin', role: 'team' },
  { key: 'michalina', name: 'Michalina', role: 'team' },
  { key: 'klient', name: 'Klient', role: 'client' },
];

export const users: Record<UserKey, TestUser> = Object.fromEntries(
  definitions.map((d) => {
    const prefix = d.key.toUpperCase();
    return [
      d.key,
      {
        ...d,
        email: process.env[`${prefix}_EMAIL`] ?? '',
        password: process.env[`${prefix}_PASSWORD`] ?? '',
        storageState: path.join(AUTH_DIR, `${d.key}.json`),
      },
    ];
  }),
) as Record<UserKey, TestUser>;

export const teamMembers = Object.values(users).filter((u) => u.role === 'team');

export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Brak zmiennej ${name} w .env (wzór w .env.example)`);
  }
  return value;
}
