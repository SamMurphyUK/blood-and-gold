// Stage 3A: toRoman, moved verbatim out of App.tsx so the update systems can use it without importing App.

export function toRoman(num: number): string {
  if (!num || num <= 0 || isNaN(num)) return 'I';
  const lookup: [number, string][] = [
    [100, 'C'],
    [90, 'XC'],
    [50, 'L'],
    [40, 'XL'],
    [10, 'X'],
    [9, 'IX'],
    [5, 'V'],
    [4, 'IV'],
    [1, 'I'],
  ];
  let roman = '';
  let n = Math.floor(num);
  for (const [val, letter] of lookup) {
    while (n >= val) {
      roman += letter;
      n -= val;
    }
  }
  return roman || 'I';
}
