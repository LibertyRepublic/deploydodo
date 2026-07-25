import { createLazyRoute } from "@tanstack/react-router";
import { Pending } from "@/pages/Pending/Pending";
import { SelectServer } from "@/pages/Setup/SelectServer";

export const SetupRoute = createLazyRoute('setup')({
  pendingComponent: Pending,
  component: SelectServer,
})
