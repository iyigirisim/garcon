# Sale Components

This directory contains a comprehensive set of React components for managing sales transactions in the restaurant/cafe management system.

## Component Structure

```
/components/sale/
├── SaleForm.tsx                → Main wrapper component that orchestrates the entire sale flow
├── TableSelector.tsx          → Component for selecting or creating tables
├── ProductSelector.tsx        → Component for browsing and adding products
├── SaleItemsList.tsx          → Component for displaying and editing selected items
├── CustomerSelector.tsx       → Component for managing customer information
├── PaymentSection.tsx         → Component for handling payment details
├── SaleSubmitButton.tsx       → Component for submitting and completing sales
└── index.ts                   → Export file for all components
```

## Usage

### Basic Usage

```tsx
import { SaleForm } from "@/components/sale";

function SalesPage() {
  const handleSaleComplete = (sale: Sale) => {
    console.log("Sale completed:", sale);
    // Handle successful sale completion
  };

  return (
    <SaleForm onSaleComplete={handleSaleComplete} />
  );
}
```

### With Initial Tables

```tsx
import { SaleForm } from "@/components/sale";
import { getAllTables } from "@/server/table";

function SalesPage() {
  const [tables, setTables] = useState([]);

  useEffect(() => {
    getAllTables().then(setTables);
  }, []);

  return (
    <SaleForm 
      initialTables={tables}
      onSaleComplete={(sale) => {
        // Handle completion
      }}
    />
  );
}
```

## Component Details

### SaleForm
Main container component that manages the overall sale state and coordinates between all child components.

**Props:**
- `initialTables?: Table[]` - Pre-loaded tables to display
- `onSaleComplete?: (sale: Sale) => void` - Callback when sale is completed

### TableSelector
Allows users to select existing tables or create new ones.

**Features:**
- Display active and closed tables
- Create new tables with optional customer names
- Real-time table status updates

### ProductSelector
Provides product browsing and selection functionality.

**Features:**
- Search products by name or description
- Filter by category
- Quantity selection
- Real-time product addition

### SaleItemsList
Shows selected products with editing capabilities.

**Features:**
- Display all selected items
- Edit quantities inline
- Remove items
- Real-time total calculation

### CustomerSelector
Simple customer name management.

**Features:**
- Add/edit customer names
- Optional customer assignment
- Quick remove functionality

### PaymentSection
Handles payment details and calculations.

**Features:**
- Multiple payment types (Cash, Card, Food Ticket, Other)
- Credit/pay-later option
- Amount calculation with change
- Payment validation
- Optional notes

### SaleSubmitButton
Final submission with validation and processing.

**Features:**
- Comprehensive validation
- Sale summary display
- Loading states
- Error handling

## Types

The components use the following main types:

```tsx
export interface SaleFormData {
  table: Table | null;
  saleItems: SaleItem[];
  customerName?: string;
  paymentType: PaymentType;
  paidAmount?: number;
  isOnCredit: boolean;
  note?: string;
}
```

## Styling

All components use Tailwind CSS with a consistent design system:
- Primary color: Emerald (emerald-600, emerald-700, etc.)
- Consistent spacing and typography
- Responsive design
- Accessible form controls

## Integration

These components integrate with:
- `/server/table.ts` - Table and sale management functions
- `/server/product.ts` - Product data
- `/types/` - TypeScript type definitions
- Prisma database through server functions

## Future Enhancements

Potential improvements:
- Barcode scanning for products
- Receipt printing
- Tax calculations
- Discount applications
- Split payments
- Customer history
- Analytics integration 