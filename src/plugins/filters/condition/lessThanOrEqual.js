import {registerCondition} from './../conditionRegisterer';

export const CONDITION_NAME = 'lte';

export function condition(dataRow, [value] = inputValues) {
  if (dataRow.meta.type === 'numeric') {
    value = parseFloat(value, 10);
  }

  return dataRow.value <= value;
}

registerCondition(CONDITION_NAME, condition, {
  name: 'Less than or equal to',
  inputsCount: 1,
  showOperators: true
});
