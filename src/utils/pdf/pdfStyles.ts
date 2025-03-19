
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
    title: 28,
    subtitle: 18, 
    heading: 17,
    subheading: 13,
    body: 12,
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
    body: [121, 137, 150] as [number, number, number], // #798996
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
export const POSITIONS = {
  // Header section
  header: {
    x: PAGE_CONFIG.margin.left,
    y: PAGE_CONFIG.margin.top + 40,
    width: CONTENT_WIDTH,
    height: 200
  },
  
  // Invoice title and info
  invoice: {
    title: { x: PAGE_CONFIG.margin.left, y: PAGE_CONFIG.margin.top + 40 },
    number: { 
      label: { x: PAGE_CONFIG.width - PAGE_CONFIG.margin.right - 80, y: PAGE_CONFIG.margin.top + 75 },
      value: { x: PAGE_CONFIG.width - PAGE_CONFIG.margin.right, y: PAGE_CONFIG.margin.top + 100 }
    }
  },
  
  // Client section
  client: {
    label: { x: PAGE_CONFIG.margin.left, y: PAGE_CONFIG.margin.top + 120 },
    name: { x: PAGE_CONFIG.margin.left, y: PAGE_CONFIG.margin.top + 150 },
    address: { x: PAGE_CONFIG.margin.left, y: PAGE_CONFIG.margin.top + 170 }
  },
  
  // Date info positions
  dates: {
    issued: { 
      label: { x: PAGE_CONFIG.width - PAGE_CONFIG.margin.right - 100, y: PAGE_CONFIG.margin.top + 130 },
      value: { x: PAGE_CONFIG.width - PAGE_CONFIG.margin.right, y: PAGE_CONFIG.margin.top + 150 }
    },
    due: { 
      label: { x: PAGE_CONFIG.width - PAGE_CONFIG.margin.right - 100, y: PAGE_CONFIG.margin.top + 180 },
      value: { x: PAGE_CONFIG.width - PAGE_CONFIG.margin.right, y: PAGE_CONFIG.margin.top + 200 }
    }
  },
  
  // Table positions
  table: {
    startY: PAGE_CONFIG.margin.top + 240,
    headers: {
      service: { x: PAGE_CONFIG.margin.left, y: 0 },
      quantity: { x: 300, y: 0 },
      price: { x: 400, y: 0 },
      amount: { x: PAGE_CONFIG.width - PAGE_CONFIG.margin.right - 10, y: 0 }
    },
    row: {
      height: 40
    }
  },
  
  // Totals section
  totals: {
    startY: 650,
    subtotal: { 
      label: { x: 400, y: 0 },
      value: { x: PAGE_CONFIG.width - PAGE_CONFIG.margin.right, y: 0 }
    },
    discount: {
      label: { x: 400, y: 30 },
      value: { x: PAGE_CONFIG.width - PAGE_CONFIG.margin.right, y: 30 }
    },
    tax: {
      label: { x: 400, y: 60 },
      value: { x: PAGE_CONFIG.width - PAGE_CONFIG.margin.right, y: 60 }
    },
    total: {
      label: { x: 400, y: 100 },
      value: { x: PAGE_CONFIG.width - PAGE_CONFIG.margin.right, y: 100 },
      box: { 
        x: 380, 
        y: 85, 
        width: 165, 
        height: 30 
      }
    }
  },
  
  // Footer section
  footer: {
    startY: 750,
    company: {
      box: { x: PAGE_CONFIG.margin.left, y: 0, width: 60, height: 60 },
      name: { x: PAGE_CONFIG.margin.left, y: 70 },
      website: { x: PAGE_CONFIG.margin.left, y: 85 },
      email: { x: PAGE_CONFIG.margin.left, y: 100 }
    },
    notes: {
      title: { x: 240, y: 70 },
      content: { x: 240, y: 85 }
    },
    terms: {
      title: { x: 400, y: 70 },
      content: { x: 400, y: 85 }
    }
  }
};

// Table configuration 
export const TABLE_CONFIG = {
  columns: {
    description: { x: PAGE_CONFIG.margin.left, y: 0 },
    quantity: { x: 300, y: 0 },
    price: { x: 400, y: 0 },
    amount: { x: PAGE_CONFIG.width - PAGE_CONFIG.margin.right - 10, y: 0 }
  },
  row: {
    height: 40
  }
};

// Invoice blocks for renderers
export const INVOICE_BLOCKS = {
  header: {
    x: PAGE_CONFIG.margin.left,
    y: PAGE_CONFIG.margin.top,
    width: CONTENT_WIDTH,
    height: 200,
  },
  invoice: {
    title: { x: PAGE_CONFIG.margin.left, y: PAGE_CONFIG.margin.top + 40 },
    number: {
      label: { x: PAGE_CONFIG.width - PAGE_CONFIG.margin.right - 80, y: PAGE_CONFIG.margin.top + 75 },
      value: { x: PAGE_CONFIG.width - PAGE_CONFIG.margin.right, y: PAGE_CONFIG.margin.top + 100 }
    },
    date: {
      label: { x: PAGE_CONFIG.width - PAGE_CONFIG.margin.right - 100, y: PAGE_CONFIG.margin.top + 130 },
      value: { x: PAGE_CONFIG.width - PAGE_CONFIG.margin.right, y: PAGE_CONFIG.margin.top + 150 }
    },
    due: {
      label: { x: PAGE_CONFIG.width - PAGE_CONFIG.margin.right - 100, y: PAGE_CONFIG.margin.top + 180 },
      value: { x: PAGE_CONFIG.width - PAGE_CONFIG.margin.right, y: PAGE_CONFIG.margin.top + 200 }
    }
  },
  client: {
    label: { x: PAGE_CONFIG.margin.left, y: PAGE_CONFIG.margin.top + 120 },
    name: { x: PAGE_CONFIG.margin.left, y: PAGE_CONFIG.margin.top + 150 },
    address: { x: PAGE_CONFIG.margin.left, y: PAGE_CONFIG.margin.top + 170 }
  },
  logo: { 
    x: PAGE_CONFIG.margin.left, 
    y: 750, 
    width: 60, 
    height: 60 
  },
  footer: {
    company: {
      name: { x: PAGE_CONFIG.margin.left, y: 820 },
      website: { x: PAGE_CONFIG.margin.left, y: 835 },
      email: { x: PAGE_CONFIG.margin.left, y: 850 }
    },
    notes: {
      title: { x: 240, y: 820 },
      content: { x: 240, y: 835 }
    },
    terms: {
      title: { x: 400, y: 820 },
      content: { x: 400, y: 835 }
    }
  },
  totals: {
    subtotal: {
      label: { x: 400, y: 650 },
      value: { x: PAGE_CONFIG.width - PAGE_CONFIG.margin.right, y: 650 }
    },
    discount: {
      label: { x: 400, y: 680 },
      value: { x: PAGE_CONFIG.width - PAGE_CONFIG.margin.right, y: 680 }
    },
    tax: {
      label: { x: 400, y: 710 },
      value: { x: PAGE_CONFIG.width - PAGE_CONFIG.margin.right, y: 710 }
    },
    total: {
      label: { x: 400, y: 750 },
      value: { x: PAGE_CONFIG.width - PAGE_CONFIG.margin.right, y: 750 },
      box: { 
        x: 380, 
        y: 735, 
        width: 165, 
        height: 30 
      }
    }
  }
};
