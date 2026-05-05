import { createFileRoute } from "@tanstack/react-router";
import _DevUiPreview from "../pages/_DevUiPreview";

export const Route = createFileRoute("/_dev/ui")({
  component: _DevUiPreview,
});