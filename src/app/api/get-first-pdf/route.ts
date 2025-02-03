import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { NextResponse } from "next/server";

export async function GET( ) {
  try {
    // Get the first chat ID with proper ordering

    const result = await db
      .select({ id: chats.id })
      .from(chats)
      .orderBy(chats.createdAt) // Add timestamp ordering
      .limit(1);

    // Handle empty table case
    if (!result || result.length === 0) {
      return NextResponse.json(
        { success: false, message: "No PDFs found" },
        { status: 200 } // Keep 200 status but indicate no results
      );
    }

    // Return first ID with proper structure
    return NextResponse.json({
      success: true,
      data: { id: result[0].id }
    });

  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}