import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/db/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sale = await prisma.sale.findUnique({
      where: { id: params.id },
      include: {
        saleItems: {
          include: {
            product: true,
          },
        },
        table: true,
      },
    });

    if (!sale) {
      return NextResponse.json({ error: "Sale not found" }, { status: 404 });
    }

    return NextResponse.json(sale);
  } catch (error) {
    console.error("Error fetching sale:", error);
    return NextResponse.json({ error: "Failed to fetch sale" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { isPaid, paidAt, paymentType, paidAmount, isOnCredit, note } = await request.json();

    const updateData: any = {};
    if (isPaid !== undefined) updateData.isPaid = isPaid;
    if (paidAt !== undefined) updateData.paidAt = paidAt ? new Date(paidAt) : null;
    if (paymentType !== undefined) updateData.paymentType = paymentType;
    if (paidAmount !== undefined) updateData.paidAmount = paidAmount;
    if (isOnCredit !== undefined) updateData.isOnCredit = isOnCredit;
    if (note !== undefined) updateData.note = note;

    // Set closedAt when payment is completed
    if (isPaid === true && !isOnCredit) {
      updateData.closedAt = paidAt ? new Date(paidAt) : new Date();
    }

    const sale = await prisma.sale.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json(sale);
  } catch (error) {
    console.error("Error updating sale:", error);
    return NextResponse.json({ error: "Failed to update sale" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Delete all sale items first
    await prisma.saleItem.deleteMany({
      where: { saleId: params.id },
    });

    // Delete the sale
    await prisma.sale.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting sale:", error);
    return NextResponse.json({ error: "Failed to delete sale" }, { status: 500 });
  }
}



