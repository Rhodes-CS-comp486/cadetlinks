const EVENT_MAKING_PERMISSION = "Event Making";
const FILE_UPLOADING_PERMISSION = "File Uploading";
const ATTENDANCE_EDITING_PERMISSION = "Attendance Editing";
const ADMIN_PERMISSIONS = "Admin";

export const DEFAULT_PERMISSIONS_MAP = new Map<string, boolean>([
    [EVENT_MAKING_PERMISSION, false],
    [FILE_UPLOADING_PERMISSION, false],
    [ATTENDANCE_EDITING_PERMISSION, false],
    [ADMIN_PERMISSIONS, false]
]);

export const PERMISSIONS = {
    EVENT_MAKING: EVENT_MAKING_PERMISSION,
    FILE_UPLOADING: FILE_UPLOADING_PERMISSION,
    ATTENDANCE_EDITING: ATTENDANCE_EDITING_PERMISSION,
    ADMIN: ADMIN_PERMISSIONS // Includes account making, announcement making, file uploading, attendance editing, and event making permissions
}
    
