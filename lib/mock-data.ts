/**
 * ============================================================
 * MOCK DATA
 * ============================================================
 *
 * Demo / placeholder data with the same shape as the
 * Shopify Storefront API response.
 *
 * Product images are loaded from:
 *
 * public/images/
 *
 * Browser path:
 * /images/filename.webp
 *
 * ============================================================
 */

/**
 * ============================================================
 * LOCAL PRODUCT IMAGES
 * ============================================================
 */

const productImages: Record<string, string> = {
  "1": "/images/elio-mens-polo-olive_480x.webp",
  "2": "/images/GAEL-OLIVE_480x.webp",
  "3": "/images/POST-P-OLIVE.webp",
  "4": "/images/RR283327-1_480x.webp",
  "5": "/images/RR283557-1_480x.webp",
  "6": "/images/RR291142_480x.webp",
  "7": "/images/ove2.png",
  "8": "/images/pro.png",
  "9": "/images/RR283557-1_480x.webp",
  "10": "/images/RR291044.webp",
  "11": "/images/RR291142_480x.webp",
};

/**
 * ============================================================
 * FALLBACK IMAGE
 * ============================================================
 */

const getProductImage = (id: string) => {
  return productImages[id] || "/images/RR291044.webp";
};

/**
 * ============================================================
 * SECTION IMAGES
 * ============================================================
 */

export const sectionImages = {
  heroSlides: [
    {
      eyebrow: "Premium Essentials",

      heading: "TIMELESS STYLE.\nMODERN EDGE.",

      subtext:
        "Polo T-Shirts and Oversized Graphic Tees, crafted for comfort, designed to stand out.",

      image: "/placeholders/hero-1.svg",

      primaryCta: {
        label: "Shop Polo T-Shirts",
        href: "/collections/elevated-capsule",
      },

      secondaryCta: {
        label: "Shop Graphic Tees",
        href: "/collections/graphic-tees",
      },
    },

    {
      eyebrow: "New Drop",

      heading: "LIMITED TO\n2,000 PIECES.",

      subtext:
        "11 designs. Once sold, never restocked. Own a piece of the collection.",

      image: "/placeholders/hero-2.svg",

      primaryCta: {
        label: "Shop New Arrivals",
        href: "/new-arrivals",
      },

      secondaryCta: {
        label: "Explore Collections",
        href: "/collections/elevated-capsule",
      },
    },

    {
      eyebrow: "Elevated Capsule",

      heading: "HERITAGE FIT.\nMODERN FABRIC.",

      subtext: "Our premium polo line — tailored for comfort, built to last.",

      image: "/placeholders/hero-3.svg",

      primaryCta: {
        label: "Shop Polos",
        href: "/collections/elevated-capsule",
      },

      secondaryCta: {
        label: "View Lookbook",
        href: "/about",
      },
    },
  ],

  dualBanner: {
    polo: "/placeholders/polo-banner.svg",
    oversized: "/placeholders/oversized-banner.svg",
  },

  about: "/placeholders/about.svg",

  instagram: [1, 2, 3, 4, 5].map((n) => `/placeholders/insta-${n}.svg`),
};

/**
 * ============================================================
 * PRODUCT TYPES
 * ============================================================
 */

type ProductColor = {
  name: string;
  value: string;
  image: string;
};

type ProductSize = {
  name: string;
  value: string;
  availableForSale: boolean;
};

/**
 * ============================================================
 * DEFAULT COLORS
 * ============================================================
 *
 * IMPORTANT:
 * Same product image is intentionally used for
 * every color.
 *
 * Later real color images add korte chaile sudhu
 * image path change korlei hobe.
 * ============================================================
 */

const getProductColors = (image: string): ProductColor[] => [
  {
    name: "White",
    value: "#F5F5F2",
    image,
  },

  {
    name: "Black",
    value: "#171717",
    image,
  },

  {
    name: "Olive",
    value: "#68705A",
    image,
  },

  {
    name: "Navy",
    value: "#26384D",
    image,
  },
];

/**
 * ============================================================
 * DEFAULT SIZES
 * ============================================================
 */

const productSizes: ProductSize[] = [
  {
    name: "Small",
    value: "S",
    availableForSale: true,
  },

  {
    name: "Medium",
    value: "M",
    availableForSale: true,
  },

  {
    name: "Large",
    value: "L",
    availableForSale: false,
  },
];

/**
 * ============================================================
 * PRODUCT CREATOR
 * ============================================================
 */

function makeProduct(id: string, title: string, price: string, type: string) {
  const image = getProductImage(id);

  /**
   * Same image diye multiple colors
   */
  const colors = getProductColors(image);

  /**
   * Create Color x Size variants
   *
   * Example:
   *
   * White / S
   * White / M
   * White / L
   *
   * Black / S
   * Black / M
   * Black / L
   *
   * Olive / S
   * Olive / M
   * Olive / L
   *
   * Navy / S
   * Navy / M
   * Navy / L
   */

  const variants = colors.flatMap((color, colorIndex) =>
    productSizes.map((size) => ({
      node: {
        id: `gid://mock/ProductVariant/${id}-${colorIndex + 1}-${size.value}`,

        title: `${color.name} / ${size.name}`,

        availableForSale: size.availableForSale,

        price: {
          amount: price,
          currencyCode: "INR",
        },

        selectedOptions: [
          {
            name: "Color",
            value: color.name,
          },

          {
            name: "Size",
            value: size.value,
          },
        ],

        image: {
          url: color.image,
          altText: `${title} - ${color.name}`,
        },
      },
    })),
  );

  return {
    /**
     * ========================================================
     * SHOPIFY-LIKE PRODUCT ID
     * ========================================================
     */

    id: `gid://mock/Product/${id}`,

    /**
     * ========================================================
     * PRODUCT TITLE
     * ========================================================
     */

    title,

    /**
     * ========================================================
     * PRODUCT URL HANDLE
     * ========================================================
     */

    handle: title.toLowerCase().replace(/\s+/g, "-"),

    /**
     * ========================================================
     * PRODUCT DESCRIPTION
     * ========================================================
     */

    description: `${title} — premium quality, limited edition piece from the Opulence collection.`,

    /**
     * ========================================================
     * HTML DESCRIPTION
     * ========================================================
     */

    descriptionHtml: `
      <p>
        ${title} — premium quality, limited edition piece
        from the Opulence collection.
        Crafted with 220+ GSM cotton for a heavyweight,
        structured feel.
      </p>
    `,

    /**
     * ========================================================
     * FEATURED IMAGE
     * ========================================================
     */

    featuredImage: {
      url: image,
      altText: title,
    },

    /**
     * ========================================================
     * COLOR OPTIONS
     * ========================================================
     *
     * ProductCard ei field use kore color swatches show korte
     * parbe.
     */

    colors,

    /**
     * ========================================================
     * PRICE
     * ========================================================
     */

    priceRange: {
      minVariantPrice: {
        amount: price,
        currencyCode: "INR",
      },
    },

    /**
     * ========================================================
     * PRODUCT IMAGE GALLERY
     * ========================================================
     *
     * Same image intentionally repeated because currently
     * all color variants use the same image.
     */

    images: {
      edges: colors.map((color) => ({
        node: {
          url: color.image,
          altText: `${title} - ${color.name}`,
        },
      })),
    },

    /**
     * ========================================================
     * PRODUCT VARIANTS
     * ========================================================
     */

    variants: {
      edges: variants,
    },

    /**
     * ========================================================
     * PRODUCT TYPE
     * ========================================================
     */

    productType: type,

    /**
     * ========================================================
     * MOCK INVENTORY
     * ========================================================
     */

    totalInventory: Math.floor(Math.random() * 40) + 5,
  };
}

/**
 * ============================================================
 * MOCK PRODUCTS
 * ============================================================
 */

export const mockProducts = [
  makeProduct("1", "Shadow Graphic Tee", "4200", "Tee"),

  makeProduct("2", "Onyx Oversized Tee", "4500", "Oversized Tee"),

  makeProduct("3", "Ivory Heritage Polo", "5200", "Polo"),

  makeProduct("4", "Midnight Crest Polo", "5400", "Polo"),

  makeProduct("5", "Ashwood Graphic Tee", "4200", "Tee"),

  makeProduct("6", "Noir Oversized Tee", "4600", "Oversized Tee"),

  makeProduct("7", "Slate Graphic Tee", "4300", "Tee"),

  makeProduct("8", "Charcoal Oversized Tee", "4700", "Oversized Tee"),

  makeProduct("9", "Regal Polo", "5300", "Polo"),

  makeProduct("10", "Ember Graphic Tee", "4200", "Tee"),

  makeProduct("11", "Storm Oversized Tee", "4550", "Oversized Tee"),
];

/**
 * ============================================================
 * MOCK COLLECTIONS
 * ============================================================
 */

export const mockCollections = [
  {
    id: "gid://mock/Collection/1",

    title: "Elevated Capsule",

    handle: "elevated-capsule",

    description: "Our premium polo line — heritage-inspired, elevated fit.",

    image: {
      url: "/placeholders/collection-1.svg",
      altText: "Elevated Capsule",
    },

    products: {
      edges: mockProducts
        .filter((p) => p.productType === "Polo")
        .map((p) => ({
          node: p,
        })),
    },
  },

  {
    id: "gid://mock/Collection/2",

    title: "Graphic Tees",

    handle: "graphic-tees",

    description: "Bold, statement graphic tees.",

    image: {
      url: "/placeholders/collection-2.svg",
      altText: "Graphic Tees",
    },

    products: {
      edges: mockProducts
        .filter((p) => p.productType === "Tee")
        .map((p) => ({
          node: p,
        })),
    },
  },

  {
    id: "gid://mock/Collection/3",

    title: "Oversized Fits",

    handle: "oversized-fits",

    description: "Relaxed, street-ready oversized tees.",

    image: {
      url: "/placeholders/collection-3.svg",
      altText: "Oversized Fits",
    },

    products: {
      edges: mockProducts
        .filter((p) => p.productType === "Oversized Tee")
        .map((p) => ({
          node: p,
        })),
    },
  },
];

/**
 * ============================================================
 * MOCK CUSTOMER
 * ============================================================
 */

export const mockCustomer = {
  id: "gid://mock/Customer/1",

  firstName: "Demo",

  lastName: "User",

  email: "demo@example.com",

  phone: null,

  defaultAddress: null,

  addresses: {
    edges: [],
  },

  orders: {
    edges: [
      {
        node: {
          id: "gid://mock/Order/1",

          orderNumber: 1001,

          processedAt: new Date().toISOString(),

          financialStatus: "PAID",

          fulfillmentStatus: "FULFILLED",

          currentTotalPrice: {
            amount: "4200",
            currencyCode: "INR",
          },

          lineItems: {
            edges: [
              {
                node: {
                  title: "Shadow Graphic Tee",
                  quantity: 1,
                },
              },
            ],
          },
        },
      },
    ],
  },
};

/**
 * ============================================================
 * MOCK CART
 * ============================================================
 */

export const mockCart = {
  id: "gid://mock/Cart/1",

  checkoutUrl: "#",

  totalQuantity: 0,

  cost: {
    totalAmount: {
      amount: "0",
      currencyCode: "INR",
    },
  },

  lines: {
    edges: [] as any[],
  },
};

/**
 * ============================================================
 * IN-MEMORY MOCK CART STORE
 * ============================================================
 *
 * Demo/session only.
 * Resets on page reload.
 *
 * Real Shopify connect korle eta use hobe na.
 */

export const mockCartStore: {
  lines: any[];
} = {
  lines: [],
};

/**
 * ============================================================
 * ADD LINE TO CART
 * ============================================================
 */

export function mockAddLineToCart(variantId: string, quantity: number) {
  /**
   * Find product
   */

  const product = mockProducts.find((p) =>
    p.variants.edges.some((v) => v.node.id === variantId),
  );

  /**
   * Find variant
   */

  const variant = product?.variants.edges.find(
    (v) => v.node.id === variantId,
  )?.node;

  /**
   * Product / variant not found
   */

  if (!product || !variant) {
    return {
      ...mockCart,
    };
  }

  /**
   * Check existing cart line
   */

  const existing = mockCartStore.lines.find(
    (l) => l.merchandise.id === variantId,
  );

  /**
   * Existing product
   */

  if (existing) {
    existing.quantity += quantity;
  } else {
    /**
     * New product
     */

    mockCartStore.lines.push({
      id: `line-${variantId}`,

      quantity,

      merchandise: {
        id: variantId,

        title: variant.title,

        product: {
          title: product.title,

          featuredImage: {
            url: variant.image?.url || product.featuredImage.url,

            altText: variant.image?.altText || product.featuredImage.altText,
          },
        },

        price: variant.price,

        selectedOptions: variant.selectedOptions,
      },
    });
  }

  /**
   * ========================================================
   * CALCULATE TOTAL QUANTITY
   * ========================================================
   */

  const totalQuantity = mockCartStore.lines.reduce(
    (sum, l) => sum + l.quantity,
    0,
  );

  /**
   * ========================================================
   * CALCULATE TOTAL AMOUNT
   * ========================================================
   */

  const totalAmount = mockCartStore.lines.reduce(
    (sum, l) => sum + Number(l.merchandise.price.amount) * l.quantity,
    0,
  );

  /**
   * ========================================================
   * RETURN CART
   * ========================================================
   */

  return {
    id: mockCart.id,

    checkoutUrl: "#",

    totalQuantity,

    cost: {
      totalAmount: {
        amount: String(totalAmount),

        currencyCode: "INR",
      },
    },

    lines: {
      edges: mockCartStore.lines.map((node) => ({
        node,
      })),
    },
  };
}

/**
 * ============================================================
 * GET CART
 * ============================================================
 */

export function mockGetCart() {
  /**
   * Calculate total quantity
   */

  const totalQuantity = mockCartStore.lines.reduce(
    (sum, l) => sum + l.quantity,
    0,
  );

  /**
   * Calculate total amount
   */

  const totalAmount = mockCartStore.lines.reduce(
    (sum, l) => sum + Number(l.merchandise.price.amount) * l.quantity,
    0,
  );

  /**
   * Return current cart
   */

  return {
    id: mockCart.id,

    checkoutUrl: "#",

    totalQuantity,

    cost: {
      totalAmount: {
        amount: String(totalAmount),

        currencyCode: "INR",
      },
    },

    lines: {
      edges: mockCartStore.lines.map((node) => ({
        node,
      })),
    },
  };
}
