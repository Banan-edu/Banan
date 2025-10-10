
import { db } from '@server/db';
import { activityLog } from '@shared/schema';

export type EntityType = 'school' | 'class' | 'course' | 'lesson' | 'student' | 'instructor' | 'test' | 'badge';
export type ActionType = 'create' | 'update' | 'delete' | 'assign' | 'unassign' | 'complete';

interface LogActivityParams {
  userId: number;
  entityType: EntityType;
  entityId: number;
  action: ActionType;
  description: string;
}

export async function logActivity({
  userId,
  entityType,
  entityId,
  action,
  description,
}: LogActivityParams) {
  try {
    await db.insert(activityLog).values({
      userId,
      entityType,
      entityId,
      action,
      description,
    });
  } catch (error) {
    console.error('Error logging activity:', error);
    // Don't throw - logging should not break the main operation
  }
}

// Helper functions for common actions
export const ActivityLogger = {
  create: (userId: number, entityType: EntityType, entityId: number, entityName: string) =>
    logActivity({
      userId,
      entityType,
      entityId,
      action: 'create',
      description: `Created ${entityType}: ${entityName}`,
    }),

  update: (userId: number, entityType: EntityType, entityId: number, entityName: string) =>
    logActivity({
      userId,
      entityType,
      entityId,
      action: 'update',
      description: `Updated ${entityType}: ${entityName}`,
    }),

  delete: (userId: number, entityType: EntityType, entityId: number, entityName: string) =>
    logActivity({
      userId,
      entityType,
      entityId,
      action: 'delete',
      description: `Deleted ${entityType}: ${entityName}`,
    }),

  assign: (userId: number, entityType: EntityType, entityId: number, targetName: string, targetType: string) =>
    logActivity({
      userId,
      entityType,
      entityId,
      action: 'assign',
      description: `Assigned ${targetType} to ${entityType}: ${targetName}`,
    }),

  unassign: (userId: number, entityType: EntityType, entityId: number, targetName: string, targetType: string) =>
    logActivity({
      userId,
      entityType,
      entityId,
      action: 'unassign',
      description: `Unassigned ${targetType} from ${entityType}: ${targetName}`,
    }),
};
