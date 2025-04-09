export interface SortingStep {
  array: number[];
  comparing: [number, number] | null;
  swapped: boolean;
}

export type VisualizationType = 'bars' | 'circles' | 'squares';