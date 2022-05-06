// eslint-disable-next-line @typescript-eslint/no-unused-vars

declare module "express-session" {
  interface Session {
    user: {
      uid: string;
      username: string;
    };
  }
}
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface User {
      uid: string;
      username: string;
    }
  }
}

export interface IImage {
  account_id?: number;
  ad_type?: number;
  ad_url?: string;
  animated?: boolean;
  bandwidth?: number;
  datetime?: number;
  deletehash: string;
  description?: string;
  edited?: string;
  favorite?: boolean;
  has_sound?: boolean;
  height: number;
  id: string;
  is_ad?: boolean;
  link: string;
  name: string;
  size: number;
  tags?: [];
  title?: string;
  type?: string;
  views?: number;
  width: number;
}
