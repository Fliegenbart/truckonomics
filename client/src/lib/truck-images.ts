// Truck model images - using Unsplash for license-free images
// Note: For production, replace with official manufacturer images or licensed stock photos

export const truckImages: Record<string, string> = {
  // Diesel trucks
  "mercedes-actros": "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=400&h=250&fit=crop",
  "man-tgx": "https://images.unsplash.com/photo-1586191582056-fcd00f836c33?w=400&h=250&fit=crop",
  "scania-r-series": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=250&fit=crop",
  "volvo-fh": "https://images.unsplash.com/photo-1616432043562-3671ea2e5242?w=400&h=250&fit=crop",
  "daf-xg": "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=400&h=250&fit=crop",

  // Electric trucks - Mercedes
  "mercedes-eactros-600": "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=400&h=250&fit=crop",
  "mercedes-eactros-400": "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=400&h=250&fit=crop",
  "mercedes-eactros-300": "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=400&h=250&fit=crop",

  // Electric trucks - MAN
  "man-etgx": "https://images.unsplash.com/photo-1558618047-f4b511aae66b?w=400&h=250&fit=crop",

  // Electric trucks - Volvo
  "volvo-fh-electric": "https://images.unsplash.com/photo-1558618047-f4b511aae66b?w=400&h=250&fit=crop",
  "volvo-fh-aero-electric": "https://images.unsplash.com/photo-1558618047-f4b511aae66b?w=400&h=250&fit=crop",
  "volvo-fm-electric": "https://images.unsplash.com/photo-1558618047-f4b511aae66b?w=400&h=250&fit=crop",

  // Electric trucks - DAF
  "daf-xf-electric": "https://images.unsplash.com/photo-1558618047-f4b511aae66b?w=400&h=250&fit=crop",
  "daf-xd-electric": "https://images.unsplash.com/photo-1558618047-f4b511aae66b?w=400&h=250&fit=crop",

  // Electric trucks - Scania
  "scania-electric": "https://images.unsplash.com/photo-1558618047-f4b511aae66b?w=400&h=250&fit=crop",

  // Electric trucks - Renault
  "renault-e-tech-t-585": "https://images.unsplash.com/photo-1558618047-f4b511aae66b?w=400&h=250&fit=crop",
  "renault-e-tech-t-780": "https://images.unsplash.com/photo-1558618047-f4b511aae66b?w=400&h=250&fit=crop",

  // Electric trucks - Iveco
  "iveco-s-eway-bev": "https://images.unsplash.com/photo-1558618047-f4b511aae66b?w=400&h=250&fit=crop",

  // Electric trucks - BYD
  "byd-eth8": "https://images.unsplash.com/photo-1558618047-f4b511aae66b?w=400&h=250&fit=crop",
};

// Default images for diesel and electric trucks
export const defaultDieselImage = "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=400&h=250&fit=crop";
export const defaultElectricImage = "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=400&h=250&fit=crop";

export function getTruckImage(modelKey: string | undefined, truckType: "diesel" | "electric"): string {
  if (modelKey && truckImages[modelKey]) {
    return truckImages[modelKey];
  }
  return truckType === "diesel" ? defaultDieselImage : defaultElectricImage;
}
