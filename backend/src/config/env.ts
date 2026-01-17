import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.resolve(process.cwd(), ".env")
});

export interface EnvConfig {
  PORT: number;
};

export const ENV: EnvConfig = {
  PORT: Number(process.env.PORT) ?? 3000,
}
