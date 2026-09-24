import { shopifyFetch } from "@/lib/shopify";

export type DualBannerItem = {
  id: string;
  number: string;
  category: string;
  images: string[];
  alt: string;
  eyebrow: string;
  title: string[];
  description: string[];
  buttonText: string;
  buttonLink: string;
  theme: "dark" | "light";
};

type ShopifyImage = {
  url: string;
  altText: string | null;
};

type DualBannerField = {
  key: string;
  value: string | null;

  references?: {
    nodes: Array<{
      __typename?: string;
      image?: ShopifyImage | null;
    }>;
  } | null;
};

type DualBannerMetaobject = {
  id: string;
  handle: string;
  fields: DualBannerField[];
};

type DualBannerQueryResponse = {
  metaobjects: {
    nodes: DualBannerMetaobject[];
  };
};

function getField(
  fields: DualBannerField[],
  key: string,
): DualBannerField | undefined {
  return fields.find((field) => field.key === key);
}

function getTextField(fields: DualBannerField[], key: string): string {
  return getField(fields, key)?.value?.trim() || "";
}

function getImages(fields: DualBannerField[], key: string): string[] {
  const field = getField(fields, key);

  if (!field?.references?.nodes) {
    return [];
  }

  return field.references.nodes
    .map((node) => node.image?.url)
    .filter((url): url is string => Boolean(url));
}

export async function getDualBanners(): Promise<DualBannerItem[]> {
  const query = `
    query GetDualBanners {
      metaobjects(
        type: "dual_banner"
        first: 50
      ) {
        nodes {
          id
          handle

          fields {
            key
            value

            references(first: 10) {
              nodes {
                __typename

                ... on MediaImage {
                  image {
                    url
                    altText
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  try {
    const data = await shopifyFetch<DualBannerQueryResponse>({
      query,
    });

    const entries = data.metaobjects?.nodes || [];

    if (!entries.length) {
      return [];
    }

    const items: DualBannerItem[] = entries.map((entry) => {
      const fields = entry.fields;

      const number = getTextField(fields, "number");

      const category = getTextField(fields, "category");

      const images = getImages(fields, "images");

      const alt = getTextField(fields, "alt_text");

      const eyebrow = getTextField(fields, "eyebrow");

      const titleLine1 = getTextField(fields, "title_line_1");

      const titleLine2 = getTextField(fields, "title_line_2");

      const descriptionLine1 = getTextField(fields, "description_line_1");

      const descriptionLine2 = getTextField(fields, "description_line_2");

      const buttonText = getTextField(fields, "button_text");

      const buttonLink = getTextField(fields, "button_link");

      const theme =
        getTextField(fields, "theme") === "light" ? "light" : "dark";

      return {
        id: entry.id,

        number,

        category,

        images,

        alt: alt || category || "Dual Banner",

        eyebrow,

        title: [titleLine1, titleLine2].filter(Boolean),

        description: [descriptionLine1, descriptionLine2].filter(Boolean),

        buttonText,

        buttonLink: buttonLink || "#",

        theme,
      };
    });

    return items;
  } catch (error) {
    console.error("Dual Banner Shopify error:", error);

    return [];
  }
}
