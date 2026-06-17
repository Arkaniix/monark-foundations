import { createFileRoute } from "@tanstack/react-router";
import VerifyEmail from "@/pages/VerifyEmail";

export const Route = createFileRoute("/auth_/verify-email")({
  component: VerifyEmail,
});