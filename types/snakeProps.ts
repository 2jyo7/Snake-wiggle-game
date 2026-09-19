import { DecadeConfig } from "./decadeConfig";

export interface SnakeHeadProps {
  color: string;
  reverse?: boolean;
}

export interface SnakeTailProps {
  color: string;
  reverse?: boolean;
}

export interface SnakeStripProps {
  decadeIdx: number;
  decade: DecadeConfig;
  boardState: (number | null)[];
  handleSlotClick: (index: number) => void;
  wiggleSlot: number | null;
}