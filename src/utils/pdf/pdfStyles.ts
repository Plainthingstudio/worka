
// PDF styling constants and configurations for consistency

// Page dimensions and margins
export const PAGE_CONFIG = {
  width: 210, // A4 width in mm
  height: 297, // A4 height in mm
  margin: {
    left: 20,
    right: 20,
    top: 20,
    bottom: 20
  },
};

// Calculate content width based on margins
export const CONTENT_WIDTH = PAGE_CONFIG.width - (PAGE_CONFIG.margin.left + PAGE_CONFIG.margin.right);

// Font configurations
export const FONTS = {
  family: {
    main: "helvetica"
  },
  style: {
    normal: "normal",
    bold: "bold",
  },
  size: {
    title: 24,
    subtitle: 16,
    heading: 14,
    subheading: 12,
    body: 11,
    small: 10,
  }
};

// Color configurations
export const COLORS = {
  line: {
    dark: [0, 0, 0] as [number, number, number],
    light: [200, 200, 200] as [number, number, number]
  }
};

// Line width configurations
export const LINE_WIDTH = {
  thick: 0.5,
  thin: 0.1
};

// Table layout configurations - UPDATED FOR BETTER SPACING
export const TABLE_CONFIG = {
  header: {
    y: 110, // Increased Y position to avoid overlap with client info
  },
  columns: {
    description: {
      width: CONTENT_WIDTH * 0.5,
      x: PAGE_CONFIG.margin.left
    },
    price: {
      x: PAGE_CONFIG.margin.left + (CONTENT_WIDTH * 0.6) // Adjusted position
    },
    quantity: {
      x: PAGE_CONFIG.margin.left + (CONTENT_WIDTH * 0.75) // Adjusted position
    },
    amount: {
      x: PAGE_CONFIG.width - PAGE_CONFIG.margin.right // Kept at right margin
    }
  }
};
