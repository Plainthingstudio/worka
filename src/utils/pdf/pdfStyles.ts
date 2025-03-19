
// PDF styling constants and configurations for consistency

// Page dimensions and margins (reduced margins to match reference)
export const PAGE_CONFIG = {
  width: 595, // A4 width in points (72dpi)
  height: 842, // A4 height in points
  margin: {
    left: 40,
    right: 40,
    top: 30,
    bottom: 40
  },
};

// Calculate content width based on margins
export const CONTENT_WIDTH = PAGE_CONFIG.width - (PAGE_CONFIG.margin.left + PAGE_CONFIG.margin.right);

// Font configurations (adjusted sizes to match reference)
export const FONTS = {
  family: {
    main: "helvetica",
  },
  style: {
    normal: "normal",
    bold: "bold",
  },
  size: {
    title: 28,       // Increased for invoice title
    subtitle: 16,    
    heading: 14,
    subheading: 12,
    body: 11,
    small: 10,
  }
};

// Color configurations (lighter blue to match reference)
export const COLORS = {
  background: {
    highlight: [240, 248, 255] as [number, number, number], // Lighter blue #f0f8ff
    light: [255, 255, 255] as [number, number, number],
  },
  text: {
    dark: [25, 34, 41] as [number, number, number], // #192229
    body: [120, 120, 120] as [number, number, number], // Lighter gray for body text
    muted: [150, 150, 150] as [number, number, number], // Lighter muted text
    black: [0, 0, 0] as [number, number, number],
  },
  accent: {
    blue: [59, 130, 246] as [number, number, number], // #3b82f6
    lightGray: [240, 240, 240] as [number, number, number] // Lighter gray #f0f0f0
  },
  line: {
    light: [240, 240, 240] as [number, number, number], // Lighter lines #f0f0f0
    dark: [220, 220, 220] as [number, number, number], // #dcdcdc
  }
};

// Line width configurations
export const LINE_WIDTH = {
  thin: 0.2,
  regular: 0.5,
  thick: 1
};

// Table configuration (adjusted positions to match reference)
export const TABLE_CONFIG = {
  startY: 210, // Reduced to bring table up
  columns: {
    description: { x: PAGE_CONFIG.margin.left, y: 0 },
    quantity: { x: 350, y: 0 },
    price: { x: 450, y: 0 },
    amount: { x: PAGE_CONFIG.width - PAGE_CONFIG.margin.right, y: 0 }
  },
  row: {
    height: 30
  }
};

// Invoice blocks for renderers (adjusted positions to reduce spacing)
export const INVOICE_BLOCKS = {
  header: {
    x: PAGE_CONFIG.margin.left,
    y: PAGE_CONFIG.margin.top,
    width: CONTENT_WIDTH,
    height: 150, // Reduced header height
  },
  invoice: {
    title: { x: PAGE_CONFIG.margin.left, y: PAGE_CONFIG.margin.top + 30 },
    number: {
      label: { x: PAGE_CONFIG.width - PAGE_CONFIG.margin.right - 80, y: PAGE_CONFIG.margin.top + 40 },
      value: { x: PAGE_CONFIG.width - PAGE_CONFIG.margin.right, y: PAGE_CONFIG.margin.top + 60 }
    },
    date: {
      label: { x: PAGE_CONFIG.width - PAGE_CONFIG.margin.right - 100, y: PAGE_CONFIG.margin.top + 90 },
      value: { x: PAGE_CONFIG.width - PAGE_CONFIG.margin.right, y: PAGE_CONFIG.margin.top + 110 }
    },
    due: {
      label: { x: PAGE_CONFIG.width - PAGE_CONFIG.margin.right - 100, y: PAGE_CONFIG.margin.top + 130 },
      value: { x: PAGE_CONFIG.width - PAGE_CONFIG.margin.right, y: PAGE_CONFIG.margin.top + 150 }
    }
  },
  client: {
    label: { x: PAGE_CONFIG.margin.left, y: PAGE_CONFIG.margin.top + 90 },
    name: { x: PAGE_CONFIG.margin.left, y: PAGE_CONFIG.margin.top + 110 },
    address: { x: PAGE_CONFIG.margin.left, y: PAGE_CONFIG.margin.top + 130 }
  },
  totals: {
    subtotal: {
      label: { x: 430, y: 0 },
      value: { x: PAGE_CONFIG.width - PAGE_CONFIG.margin.right, y: 0 }
    },
    discount: {
      label: { x: 430, y: 0 },
      value: { x: PAGE_CONFIG.width - PAGE_CONFIG.margin.right, y: 0 }
    },
    tax: {
      label: { x: 430, y: 0 },
      value: { x: PAGE_CONFIG.width - PAGE_CONFIG.margin.right, y: 0 }
    },
    total: {
      label: { x: 430, y: 0 },
      value: { x: PAGE_CONFIG.width - PAGE_CONFIG.margin.right, y: 0 },
      box: { 
        x: 350, 
        y: 0, 
        width: 205, 
        height: 30 
      }
    }
  },
  logo: { 
    x: PAGE_CONFIG.margin.left, 
    y: 700, 
    width: 60, 
    height: 60 
  },
  footer: {
    company: {
      name: { x: PAGE_CONFIG.margin.left, y: 780 },
      website: { x: PAGE_CONFIG.margin.left, y: 795 },
      email: { x: PAGE_CONFIG.margin.left, y: 810 }
    },
    notes: {
      title: { x: 200, y: 730 },
      content: { x: 200, y: 750 }
    },
    terms: {
      title: { x: 400, y: 730 },
      content: { x: 400, y: 750 }
    }
  }
};
