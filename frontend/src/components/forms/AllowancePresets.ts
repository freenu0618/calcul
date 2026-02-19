/**
 * 수당 프리셋 데이터
 */
import type { Allowance } from '../../types/models';

export interface AllowancePreset {
  label: string;
  defaults: Omit<Allowance, 'amount'>;
}

export const ALLOWANCE_PRESETS: AllowancePreset[] = [
  {
    label: '식대 (비과세)',
    defaults: {
      name: '식대',
      is_taxable: false,
      is_included_in_regular_wage: false,
      is_includable_in_minimum_wage: false,
      is_fixed: true,
    },
  },
  {
    label: '교통비 (비과세)',
    defaults: {
      name: '교통비',
      is_taxable: false,
      is_included_in_regular_wage: false,
      is_includable_in_minimum_wage: false,
      is_fixed: true,
    },
  },
  {
    label: '직책수당 (과세, 통상임금)',
    defaults: {
      name: '직책수당',
      is_taxable: true,
      is_included_in_regular_wage: true,
      is_includable_in_minimum_wage: true,
      is_fixed: true,
    },
  },
  {
    label: '자격수당 (과세, 통상임금)',
    defaults: {
      name: '자격수당',
      is_taxable: true,
      is_included_in_regular_wage: true,
      is_includable_in_minimum_wage: true,
      is_fixed: true,
    },
  },
  {
    label: '성과급 (과세, 비정기)',
    defaults: {
      name: '성과급',
      is_taxable: true,
      is_included_in_regular_wage: false,
      is_includable_in_minimum_wage: false,
      is_fixed: false,
    },
  },
];
