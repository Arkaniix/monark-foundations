import { createFileRoute } from "@tanstack/react-router";
import Confidentialite from "../pages/Confidentialite";

export const Route = createFileRoute("/confidentialite")({
  head: () => ({
    meta: [{ title: "Politique de confidentialité — Monark" }],
  }),
  component: Confidentialite,
});