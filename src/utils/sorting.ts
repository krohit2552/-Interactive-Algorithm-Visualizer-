export function generateRandomArray(size: number = 20): number[] {
  return Array.from({ length: size }, () => Math.floor(Math.random() * 50) + 1);
}

export function* bubbleSort(arr: number[]): Generator<{
  array: number[];
  comparing: [number, number] | null;
  swapped: boolean;
}> {
  const numbers = [...arr];
  let swapped;
  
  do {
    swapped = false;
    for (let i = 0; i < numbers.length - 1; i++) {
      yield { array: [...numbers], comparing: [i, i + 1], swapped: false };
      
      if (numbers[i] > numbers[i + 1]) {
        [numbers[i], numbers[i + 1]] = [numbers[i + 1], numbers[i]];
        swapped = true;
        yield { array: [...numbers], comparing: [i, i + 1], swapped: true };
      }
    }
  } while (swapped);

  return { array: numbers, comparing: null, swapped: false };
}