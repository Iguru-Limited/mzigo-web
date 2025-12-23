import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      phone?: string;
      image?: string | null;
      rights?: string[];
    };
    rolesObject?: Array<{
      name: string;
      app_title: string;
      icon_name: string;
    }>;
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpiresAt?: number;
    role?: {
      id: string;
      name: string;
      rank: string;
    };
    branch?: {
      id: string;
      name: string;
      county_code: string;
    };
  }

  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    phone?: string;
    image?: string | null;
    rights?: string[];
    rolesObject?: Array<{
      name: string;
      app_title: string;
      icon_name: string;
    }>;
    accessToken?: string;
    refreshToken?: string;
    role?: {
      id: string;
      name: string;
      rank: string;
    };
    branch?: {
      id: string;
      name: string;
      county_code: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpiresAt?: number;
    refreshTokenExpiresAt?: number;
    phone?: string;
    rights?: string[];
    rolesObject?: Array<{
      name: string;
      app_title: string;
      icon_name: string;
    }>;
    role?: {
      id: string;
      name: string;
      rank: string;
    };
    branch?: {
      id: string;
      name: string;
      county_code: string;
    };
  }
}
