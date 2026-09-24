import { shopifyFetch } from "@/lib/shopify";

export type HeroSliderData = {
  id: string;

  desktopVideo: string | null;

  mobileVideo: string | null;

  poster: string | null;

  active: boolean;
};

type ShopifyVideoSource = {
  url: string;
  mimeType: string;
  format: string;
  width: number;
  height: number;
};

type ShopifyImage = {
  url: string;
  altText: string | null;
};

type HeroField = {
  key: string;
  value: string | null;

  reference:
    | {
        __typename: "Video";
        sources: ShopifyVideoSource[];
      }
    | {
        __typename: "MediaImage";
        image: ShopifyImage;
      }
    | null;
};

type HeroMetaobject = {
  id: string;
  handle: string;
  fields: HeroField[];
};

type HeroQueryResponse = {
  metaobjects: {
    nodes: HeroMetaobject[];
  };
};

function getField(fields: HeroField[], key: string) {
  return fields.find((field) => field.key === key);
}

function getVideoUrl(fields: HeroField[], key: string): string | null {
  const field = getField(fields, key);

  if (!field?.reference || field.reference.__typename !== "Video") {
    return null;
  }

  const sources = field.reference.sources || [];

  if (!sources.length) {
    return null;
  }

  // Prefer MP4 for normal HTML video playback.
  const mp4Source = sources.find(
    (source) => source.format === "mp4" || source.mimeType === "video/mp4",
  );

  return mp4Source?.url || sources[0]?.url || null;
}

function getImageUrl(fields: HeroField[], key: string): string | null {
  const field = getField(fields, key);

  if (!field?.reference || field.reference.__typename !== "MediaImage") {
    return null;
  }

  return field.reference.image?.url || null;
}

export async function getHeroSlider(): Promise<HeroSliderData | null> {
  const query = `
    query GetHeroSlider {
      metaobjects(
        type: "home_hero_slider"
        first: 10
      ) {
        nodes {
          id
          handle

          fields {
            key
            value

            reference {
              __typename

              ... on Video {
                sources {
                  url
                  mimeType
                  format
                  width
                  height
                }
              }

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
  `;

  try {
    const data = await shopifyFetch<HeroQueryResponse>({
      query,
    });

    const entries = data.metaobjects.nodes || [];

    if (!entries.length) {
      return null;
    }

    /*
     * Find the first active hero entry.
     *
     * Your current Shopify setup has:
     * Active = true
     */
    const activeEntry =
      entries.find((entry) => {
        const activeField = getField(entry.fields, "active");

        return activeField?.value === "true";
      }) || entries[0];

    if (!activeEntry) {
      return null;
    }

    return {
      id: activeEntry.id,

      desktopVideo: getVideoUrl(activeEntry.fields, "desktop_video"),

      mobileVideo: getVideoUrl(activeEntry.fields, "mobile_video"),

      poster: getImageUrl(activeEntry.fields, "poster"),

      active: getField(activeEntry.fields, "active")?.value === "true",
    };
  } catch (error) {
    console.error("Hero slider Shopify error:", error);

    return null;
  }
}
