import { useEffect } from "react";
import { useTenant } from "@/lib/tenant";

function getParentOrigin(): string | null {
  try {
    const ref = document.referrer;
    if (!ref) return null;
    return new URL(ref).origin;
  } catch {
    return null;
  }
}

export function EmbedAutoResize() {
  const { tenant } = useTenant();

  useEffect(() => {
    if (window.parent === window) return;

    const targetOrigin = getParentOrigin() || "*";

    const postSize = () => {
      const height =
        Math.max(
          document.documentElement.scrollHeight,
          document.body?.scrollHeight ?? 0,
        ) || 0;

      window.parent.postMessage(
        {
          type: "truckonomics:resize",
          height,
          tenant: tenant.id,
        },
        targetOrigin,
      );
    };

    postSize();

    const ro = new ResizeObserver(() => postSize());
    ro.observe(document.documentElement);
    if (document.body) ro.observe(document.body);

    const onLoad = () => postSize();
    window.addEventListener("load", onLoad);

    return () => {
      window.removeEventListener("load", onLoad);
      ro.disconnect();
    };
  }, [tenant.id]);

  return null;
}

