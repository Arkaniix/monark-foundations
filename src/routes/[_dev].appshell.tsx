import { createFileRoute } from "@tanstack/react-router";
import _DevAppShellPreview from "../pages/_DevAppShellPreview";

export const Route = createFileRoute("/_dev/appshell")({
  component: _DevAppShellPreview,
});
