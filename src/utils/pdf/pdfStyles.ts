
// PDF styling constants and configurations for consistency

// Page dimensions and margins
export const PAGE_CONFIG = {
  width: 595, // A4 width in points (72dpi)
  height: 842, // A4 height in points
  margin: {
    left: 50,
    right: 50,
    top: 40,
    bottom: 40
  },
};

// Calculate content width based on margins
export const CONTENT_WIDTH = PAGE_CONFIG.width - (PAGE_CONFIG.margin.left + PAGE_CONFIG.margin.right);

// Font configurations
export const FONTS = {
  family: {
    main: "helvetica",
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
  background: {
    highlight: [240, 247, 255] as [number, number, number], // Light blue #f0f7ff
    light: [255, 255, 255] as [number, number, number],
  },
  text: {
    dark: [25, 34, 41] as [number, number, number], // #192229
    body: [100, 110, 120] as [number, number, number], // #646e78
    muted: [130, 135, 140] as [number, number, number], // #82878c
    black: [0, 0, 0] as [number, number, number],
  },
  accent: {
    blue: [59, 130, 246] as [number, number, number], // #3b82f6
    lightGray: [230, 230, 230] as [number, number, number] // #e6e6e6
  },
  line: {
    light: [230, 230, 230] as [number, number, number], // #e6e6e6
    dark: [200, 200, 200] as [number, number, number], // #c8c8c8
  }
};

// Line width configurations
export const LINE_WIDTH = {
  thin: 0.2,
  regular: 0.5,
  thick: 1
};

// Fixed positions for invoice elements - simplified for clean design
export const TABLE_CONFIG = {
  startY: 250,
  columns: {
    description: { x: PAGE_CONFIG.margin.left, y: 0 },
    quantity: { x: 350, y: 0 },
    price: { x: 420, y: 0 },
    amount: { x: PAGE_CONFIG.width - PAGE_CONFIG.margin.right, y: 0 }
  },
  row: {
    height: 30
  }
};

// Invoice blocks for renderers
export const INVOICE_BLOCKS = {
  header: {
    x: PAGE_CONFIG.margin.left,
    y: PAGE_CONFIG.margin.top,
    width: CONTENT_WIDTH,
    height: 160,
  },
  invoice: {
    title: { x: PAGE_CONFIG.margin.left, y: PAGE_CONFIG.margin.top + 30 },
    number: {
      label: { x: PAGE_CONFIG.width - PAGE_CONFIG.margin.right - 80, y: PAGE_CONFIG.margin.top + 60 },
      value: { x: PAGE_CONFIG.width - PAGE_CONFIG.margin.right, y: PAGE_CONFIG.margin.top + 80 }
    },
    date: {
      label: { x: PAGE_CONFIG.width - PAGE_CONFIG.margin.right - 100, y: PAGE_CONFIG.margin.top + 110 },
      value: { x: PAGE_CONFIG.width - PAGE_CONFIG.margin.right, y: PAGE_CONFIG.margin.top + 130 }
    },
    due: {
      label: { x: PAGE_CONFIG.width - PAGE_CONFIG.margin.right - 100, y: PAGE_CONFIG.margin.top + 150 },
      value: { x: PAGE_CONFIG.width - PAGE_CONFIG.margin.right, y: PAGE_CONFIG.margin.top + 170 }
    }
  },
  client: {
    label: { x: PAGE_CONFIG.margin.left, y: PAGE_CONFIG.margin.top + 100 },
    name: { x: PAGE_CONFIG.margin.left, y: PAGE_CONFIG.margin.top + 120 },
    address: { x: PAGE_CONFIG.margin.left, y: PAGE_CONFIG.margin.top + 140 }
  },
  logo: { 
    x: PAGE_CONFIG.margin.left, 
    y: 680, 
    width: 60, 
    height: 60 
  },
  footer: {
    company: {
      name: { x: PAGE_CONFIG.margin.left, y: 750 },
      website: { x: PAGE_CONFIG.margin.left, y: 770 },
      email: { x: PAGE_CONFIG.margin.left, y: 790 }
    },
    notes: {
      title: { x: 210, y: 750 },
      content: { x: 210, y: 770 }
    },
    terms: {
      title: { x: 370, y: 750 },
      content: { x: 370, y: 770 }
    }
  },
  totals: {
    subtotal: {
      label: { x: 400, y: 0 },
      value: { x: PAGE_CONFIG.width - PAGE_CONFIG.margin.right, y: 0 }
    },
    discount: {
      label: { x: 400, y: 0 },
      value: { x: PAGE_CONFIG.width - PAGE_CONFIG.margin.right, y: 0 }
    },
    tax: {
      label: { x: 400, y: 0 },
      value: { x: PAGE_CONFIG.width - PAGE_CONFIG.margin.right, y: 0 }
    },
    total: {
      label: { x: 400, y: 0 },
      value: { x: PAGE_CONFIG.width - PAGE_CONFIG.margin.right, y: 0 },
      box: { 
        x: 380, 
        y: 0, 
        width: 165, 
        height: 26 
      }
    }
  }
};
