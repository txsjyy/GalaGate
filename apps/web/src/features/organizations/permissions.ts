import type { OrganizationRole } from "@prisma/client";

const roleRank: Record<OrganizationRole, number> = {
  VIEWER: 0,
  STAFF: 1,
  ADMIN: 2,
  OWNER: 3,
};

export function hasOrganizationRole(role: OrganizationRole, minimumRole: OrganizationRole) {
  return roleRank[role] >= roleRank[minimumRole];
}

export function canManageEvents(role: OrganizationRole) {
  return hasOrganizationRole(role, "ADMIN");
}

export function canRunCheckIn(role: OrganizationRole) {
  return hasOrganizationRole(role, "STAFF");
}

export function canViewAnalytics(role: OrganizationRole) {
  return hasOrganizationRole(role, "VIEWER");
}
