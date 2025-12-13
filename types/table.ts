export type Table = {
  id: string;
  name: string;
  isOpen: boolean;
  openedAt: Date;
  closedAt?: Date | null;
  customerName?: string | null;
  roomId?: string | null;
  gridX?: number | null;
  gridY?: number | null;
  isTakeAway: boolean;
  deletedAt?: Date | null;
};