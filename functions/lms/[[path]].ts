import { handle, type Env } from '../../lib/lms';

// Every /lms request lands here; lib/lms.ts holds the routes.
export const onRequest = ({ request, env }: { request: Request; env: Env }) => handle(request, env);
