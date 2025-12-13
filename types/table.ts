export type Table = {
  id: string;
  name: string;
  isOpen: boolean;
  openedAt: Date;
  closedAt?: Date;
  customerName?: string;
  roomId?: string;
  gridX?: number;
  gridY?: number;
  isTakeAway: boolean;
  deletedAt?: Date;
};