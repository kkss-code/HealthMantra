import { Role } from '../types/domain';

// Stack.Protected's automatic "anchor route" redirect is ambiguous when
// several guards become true at once (e.g. right after sign-in, both the
// role's tab group AND a shared detail screen would become newly
// available). To avoid that, `report` and `patient-records` are nested
// inside each role's own stack (src/app/<role>/report.tsx etc.) rather than
// living as shared root-level routes.
export const ROLE_HOME_ROUTE: Record<Role, string> = {
  patient: '/patient',
  doctor: '/doctor',
  admin: '/admin',
};
