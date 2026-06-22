import type { OrganizationRole } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { canManageEvents, canRunCheckIn, canViewAnalytics } from "./permissions";

export type CurrentOrganizationContext = {
  user: {
    id: string;
    name: string | null;
    email: string;
  };
  organization: {
    id: string;
    name: string;
    slug: string;
  };
  role: OrganizationRole;
  permissions: {
    canManageEvents: boolean;
    canRunCheckIn: boolean;
    canViewAnalytics: boolean;
  };
  events: Array<{
    id: string;
    name: string;
    slug: string;
    status: string;
    startsAt: Date;
    attendeeCount: number;
    checkInCount: number;
  }>;
};

export async function getCurrentOrganizationContext(
  email: string,
): Promise<CurrentOrganizationContext | null> {
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      organizationMembers: {
        take: 1,
        orderBy: { createdAt: "asc" },
        select: {
          role: true,
          organization: {
            select: {
              id: true,
              name: true,
              slug: true,
              events: {
                orderBy: { startsAt: "desc" },
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  status: true,
                  startsAt: true,
                  _count: {
                    select: {
                      attendees: true,
                      checkIns: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  const membership = user?.organizationMembers[0];

  if (!user || !membership) {
    return null;
  }

  const role = membership.role;

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
    organization: {
      id: membership.organization.id,
      name: membership.organization.name,
      slug: membership.organization.slug,
    },
    role,
    permissions: {
      canManageEvents: canManageEvents(role),
      canRunCheckIn: canRunCheckIn(role),
      canViewAnalytics: canViewAnalytics(role),
    },
    events: membership.organization.events.map((event) => ({
      id: event.id,
      name: event.name,
      slug: event.slug,
      status: event.status,
      startsAt: event.startsAt,
      attendeeCount: event._count.attendees,
      checkInCount: event._count.checkIns,
    })),
  };
}
