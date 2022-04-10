// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Session } from "express-session";

declare module "express-session" {
  interface Session {
    user: {
      id: string;
      username: string;
    };
  }
}
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface User {
      id: string;
      username: string;
    }
  }
}
