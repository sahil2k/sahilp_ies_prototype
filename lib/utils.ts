import { createCn } from "cn/config"

// Teach class merging about our custom theme tokens (app/globals.css) so that,
// for example, `text-body` (a size) is not treated as clashing with `text-ink`
// (a colour) and dropped.
export const cn = createCn({
  extend: {
    classGroups: {
      "font-size": [
        { text: ["display", "h1", "h2", "h3", "body", "small", "badge", "code"] },
      ],
      rounded: [{ rounded: ["control", "panel", "dialog"] }],
      shadow: [{ shadow: ["float"] }],
    },
  },
})
