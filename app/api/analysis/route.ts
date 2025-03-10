import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { result } = await request.json();

    const savedAnalysis = await prisma.videoAnalysis.create({
      data: {
        result: JSON.stringify(result),
      },
    });

    return NextResponse.json({ success: true, data: savedAnalysis });
  } catch (error) {
    console.error('Error saving video analysis:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save video analysis' },
      { status: 500 }
    );
  }
}