import type { StudentClass } from './students';
import type { ShorofBab } from './babs/types';
import { SHOROF_BABS_REGULER_1 } from './babs/reguler1';
import { SHOROF_BABS_REGULER_2 } from './babs/reguler2';

export * from './babs/types';
export { SHOROF_BABS_REGULER_1 } from './babs/reguler1';
export { SHOROF_BABS_REGULER_2 } from './babs/reguler2';

export const ALL_SHOROF_BABS: ShorofBab[] = Array.from(
  new Map([...SHOROF_BABS_REGULER_1, ...SHOROF_BABS_REGULER_2].map((b) => [b.id, b])).values()
);

export const SHOROF_BABS: ShorofBab[] = SHOROF_BABS_REGULER_1;

export function getBabsForClass(kelas: StudentClass): ShorofBab[] {
  return kelas === 'Reguler 1' ? SHOROF_BABS_REGULER_1 : SHOROF_BABS_REGULER_2;
}
