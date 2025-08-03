export type Table = {
  id: string;
  name: string;
  isOpen: boolean;
  openedAt: Date;
  closedAt?: Date;
  customerName?: string;
};