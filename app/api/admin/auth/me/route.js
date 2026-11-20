
import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth/session";
import { NotificationRepository } from "@/lib/repositories/notification.repository";

export async function GET() {
  try {
    // Verify admin session
    const admin = await getCurrentAdmin();

    if (!admin) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }

    // Notifications are optional for the initial setup
    let unreadNotifications = 0;

    try {
      const result = await NotificationRepository.list({
        unreadOnly: true,
        limit: 1,
      });

      unreadNotifications = result.unreadCount || 0;
    } catch (notificationError) {
      console.warn(
        "Notifications unavailable:",
        notificationError.message
      );

      // Continue authentication without notifications
      unreadNotifications = 0;
    }

    return NextResponse.json({
      authenticated: true,
      user: admin,
      unreadNotifications,
    });

  } catch (err) {
    console.error("Auth me check error:", err);

    return NextResponse.json(
      { authenticated: false },
      { status: 500 }
    );
  }
}
