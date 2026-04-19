import { iconForAction, useActionsLogic } from '../ActionsPage/ActionsLogic';

export { iconForAction };

export function useJobsLogic(): any {
  const logic = useActionsLogic() as any;
  return {
    ...logic,
    canMakeEvents: logic.cadetPermissionsMap?.get?.('Event Making') ?? false,
  };
}
