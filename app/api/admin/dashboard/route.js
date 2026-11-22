export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/auth/guard";
import { getAnalyticsOverview } from "@/lib/analytics";
import { AnalyticsRepository } from "@/lib/repositories/analytics.repository";
import { ContactRepository } from "@/lib/repositories/contact.repository";
import { LeadRepository } from "@/lib/repositories/lead.repository";
import { MeetingRepository } from "@/lib/repositories/meeting.repository";
import { ProjectRepository } from "@/lib/repositories/project.repository";
import { AdminRepository } from "@/lib/repositories/admin.repository";
import { NotificationRepository } from "@/lib/repositories/notification.repository";

async function safeLoad(name, callback, fallback) {
	try {
		return await callback();
	} catch (error) {
		console.warn(`[Dashboard] ${name} unavailable:`, error.message);
		return fallback;
	}
}

export async function GET(req) {
	return withAdminAuth(req, "overview", async () => {
		try {
			const { searchParams } = new URL(req.url);
			const range = searchParams.get("range") || "30d";

			const [overview, visitorsResult, contactsResult, leadsResult, meetingsResult, projectsResult, activitiesResult, notificationsResult] = await Promise.all([
				safeLoad("Analytics overview", () => getAnalyticsOverview(range), {}),
				safeLoad("Visitors", () => AnalyticsRepository.listVisitors({ limit: 5 }), { visitors: [] }),
				safeLoad("Contacts", () => ContactRepository.list({ limit: 5 }), { contacts: [] }),
				safeLoad("Leads", () => LeadRepository.list({ limit: 5 }), { leads: [] }),
				safeLoad("Meetings", () => MeetingRepository.list({ status: "confirmed", limit: 5 }), { meetings: [] }),
				safeLoad("Projects", () => ProjectRepository.list({ limit: 4 }), { projects: [] }),
				safeLoad("Audit logs", () => AdminRepository.listAuditLogs({ limit: 8 }), { logs: [] }),
				safeLoad("Notifications", () => NotificationRepository.list({ limit: 5 }), { notifications: [] }),
			]);

			return NextResponse.json({
				success: true,
				data: {
					...overview,
					recentVisitors: visitorsResult.visitors || [],
					recentInquiries: contactsResult.contacts || [],
					recentLeads: leadsResult.leads || [],
					upcomingMeetings: meetingsResult.meetings || [],
					recentProjects: projectsResult.projects || [],
					recentActivities: activitiesResult.logs || [],
					systemNotifications: notificationsResult.notifications || [],
				},
			});
		} catch (err) {
			console.error("Dashboard overview error:", err);

			return NextResponse.json({ success: false, error: "Failed to load dashboard data." }, { status: 500 });
		}
	});
}

