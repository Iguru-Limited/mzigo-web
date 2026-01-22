import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getApiUrl, API_ENDPOINTS } from "@/lib/constants";
import type { LoginResponse, RefreshResponse } from "@/types/auth/auth";

// Token expiration times (in milliseconds)
const ACCESS_TOKEN_EXPIRY = 60 * 60 * 1000; // 1 hour
const REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Check if access token is expired or about to expire (within 5 minutes)
 */
const isAccessTokenExpired = (expiryTime: number): boolean => {
  const now = Date.now();
  const bufferTime = 5 * 60 * 1000; // 5 minutes buffer
  return now >= expiryTime - bufferTime;
};

/**
 * Refresh the access token using the refresh token
 */
const refreshAccessToken = async (refreshToken: string): Promise<{
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}> => {
  try {
    const refreshUrl = getApiUrl(API_ENDPOINTS.AUTH.REFRESH);
    
    const response = await fetch(refreshUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to refresh token");
    }

    const data: RefreshResponse = await response.json();
    
    if (!data.access_token) {
      throw new Error("No access token in refresh response");
    }
    
    // The refresh endpoint only returns a new access_token, not a new refresh_token
    // So we keep the existing refresh_token
    return {
      accessToken: data.access_token,
      refreshToken: refreshToken, // Keep the existing refresh token
      expiresAt: Date.now() + ACCESS_TOKEN_EXPIRY,
    };
  } catch (error) {
    console.error("Error refreshing token:", error);
    throw error;
  }
};

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        id_number: { label: "ID Number", type: "text" },
        pass_phrase: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.id_number || !credentials?.pass_phrase) {
          throw new Error("ID number and password are required");
        }

        try {
          const loginUrl = getApiUrl(API_ENDPOINTS.AUTH.LOGIN);
          
          const response = await fetch(loginUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              id_number: credentials.id_number,
              pass_phrase: credentials.pass_phrase,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || "Invalid credentials");
          }

          const data: LoginResponse = await response.json();

          if (data.access_token && data.user) {
            const now = Date.now();
            const loginCounter = Number.isFinite(Number(data.user.counter))
              ? Number(data.user.counter)
              : 1;
            return {
              id: data.user.id,
              name: data.user.name,
              email: data.user.name + "@mzigo.local",
              phone: credentials.id_number,
              accessToken: data.access_token,
              refreshToken: data.refresh_token,
              accessTokenExpiresAt: now + ACCESS_TOKEN_EXPIRY,
              refreshTokenExpiresAt: now + REFRESH_TOKEN_EXPIRY,
              userLevel: data.user.user_level,
              printerName: data.user.printer_name,
              counter: loginCounter,
              company: data.user.company,
              office: data.user.office,
              rights: data.user.roles.map((role) => role.name),
              rolesObject: data.user.roles,
            };
          }

          return null;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Authentication failed";
          console.error("Authentication error:", errorMessage);
          throw new Error(errorMessage);
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      // Initial sign in
      if (user) {
        const counter = Number.isFinite((user as any).counter)
          ? Number((user as any).counter)
          : 1;
        token.accessToken = (user as any).accessToken;
        token.refreshToken = (user as any).refreshToken;
        token.accessTokenExpiresAt = (user as any).accessTokenExpiresAt;
        token.refreshTokenExpiresAt = (user as any).refreshTokenExpiresAt;
        token.phone = (user as any).phone;
        token.userLevel = (user as any).userLevel;
        token.printer_name = (user as any).printerName;
        token.counter = counter;
        token.company = (user as any).company;
        token.office = (user as any).office;
        token.rights = (user as any).rights;
        token.rolesObject = (user as any).rolesObject;
        return token;
      }

      // Check if access token needs to be refreshed
      const accessTokenExpiresAt = token.accessTokenExpiresAt as number;
      if (accessTokenExpiresAt && isAccessTokenExpired(accessTokenExpiresAt)) {
        const refreshToken = token.refreshToken as string;
        const refreshTokenExpiresAt = token.refreshTokenExpiresAt as number;

        // Check if refresh token is still valid
        if (refreshToken && refreshTokenExpiresAt && Date.now() < refreshTokenExpiresAt) {
          try {
            const refreshed = await refreshAccessToken(refreshToken);
            token.accessToken = refreshed.accessToken;
            token.refreshToken = refreshed.refreshToken; // Keep existing refresh token
            token.accessTokenExpiresAt = refreshed.expiresAt;
            // Refresh token expiry remains the same since backend doesn't issue a new one
          } catch (error) {
            // If refresh fails, clear tokens to force re-login
            console.error("Token refresh failed:", error);
            token.accessToken = undefined;
            token.refreshToken = undefined;
            token.accessTokenExpiresAt = undefined;
            token.refreshTokenExpiresAt = undefined;
          }
        } else {
          // Refresh token expired, clear tokens
          token.accessToken = undefined;
          token.refreshToken = undefined;
          token.accessTokenExpiresAt = undefined;
          token.refreshTokenExpiresAt = undefined;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        const counter = Number.isFinite(token.counter as number)
          ? Number(token.counter)
          : 1;
        session.user.id = token.sub || "";
        session.user.phone = token.phone as string;
        session.user.rights = token.rights as string[];
        session.user.user_level = token.userLevel as string;
        session.user.printer_name = token.printer_name as string;
        session.user.counter = counter;
        (session as any).counter = counter;
        (session as any).rolesObject = token.rolesObject;
        (session as any).company = token.company;
        (session as any).office = token.office;
        (session as any).accessToken = token.accessToken;
        (session as any).refreshToken = token.refreshToken;
        (session as any).userLevel = token.userLevel;
        (session as any).accessTokenExpiresAt = token.accessTokenExpiresAt;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60, // 1 hour in seconds
  },
  secret: process.env.NEXTAUTH_SECRET || "your-secret-key-change-in-production",
};
