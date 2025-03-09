
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
    dark: [0, 0, 0],
    light: [200, 200, 200]
  }
};

// Line width configurations
export const LINE_WIDTH = {
  thick: 0.5,
  thin: 0.1
};

// Table layout configurations
export const TABLE_CONFIG = {
  header: {
    y: 80, // Y position of table header
  },
  columns: {
    description: {
      width: CONTENT_WIDTH * 0.5,
      x: PAGE_CONFIG.margin.left
    },
    price: {
      x: PAGE_CONFIG.width - PAGE_CONFIG.margin.right - 80
    },
    quantity: {
      x: PAGE_CONFIG.width - PAGE_CONFIG.margin.right - 45
    },
    amount: {
      x: PAGE_CONFIG.width - PAGE_CONFIG.margin.right
    }
  }
};
