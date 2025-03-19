
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
    main: "helvetica"
  },
  style: {
    normal: "normal",
    bold: "bold",
  },
  size: {
    title: 27,
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

// Element positions for direct positioning similar to the example code
export const POSITIONS = {
  // Invoice title and number
  invoice: {
    title: { x: 68, y: 40 },
    numberLabel: { x: 541, y: 38 },
    numberValue: { x: 543, y: 56 }
  },
  
  // Client section
  client: {
    billToLabel: { x: 50, y: 144 },
    name: { x: 70, y: 174 },
    address: { x: 83, y: 195 }
  },
  
  // Dates section
  dates: {
    issuedLabel: { x: 538, y: 140 },
    issuedValue: { x: 522, y: 157 },
    dueLabel: { x: 530, y: 186 },
    dueValue: { x: 522, y: 202 }
  },
  
  // Table headers
  tableHeader: {
    services: { x: 49, y: 272 },
    qty: { x: 290, y: 273 },
    price: { x: 408, y: 273 },
    subtotal: { x: 538, y: 273 }
  },
  
  // Item positions (y values for the first item)
  item: {
    description: { x: 44, y: 306 },
    quantity: { x: 291, y: 306 },
    price: { x: 407, y: 305 },
    amount: { x: 544, y: 304 }
  },
  
  // Totals section
  totals: {
    subtotalLabel: { x: 399, y: 507 },
    subtotalValue: { x: 539, y: 505 },
    discountLabel: { x: 402, y: 534 },
    discountValue: { x: 555, y: 533 },
    taxLabel: { x: 388, y: 564 },
    taxValue: { x: 555, y: 561 },
    totalLabel: { x: 389, y: 599 },
    totalValue: { x: 533, y: 599 },
    totalBox: { x: 466, y: 598, width: 200, height: 33 }
  },
  
  // Footer section
  footer: {
    companyBox: { x: 52, y: 672, width: 48, height: 42 },
    companyName: { x: 90, y: 713 },
    companyWebsite: { x: 77, y: 738 },
    companyEmail: { x: 89, y: 751 },
    notesTitle: { x: 275, y: 711 },
    notesContent: { x: 306, y: 751 },
    termsTitle: { x: 444, y: 711 },
    termsContent: { x: 438, y: 751 }
  },
  
  // Blue background rectangle
  blueRectangle: {
    x: 297,
    y: 125,
    width: 585,
    height: 241
  }
};

// Table configuration
export const TABLE_CONFIG = {
  columns: {
    description: { x: 49, y: 0 },
    quantity: { x: 290, y: 0 },
    price: { x: 408, y: 0 },
    amount: { x: 538, y: 0 }
  },
  row: {
    height: 46
  }
};

// Invoice blocks configuration for renderers
export const INVOICE_BLOCKS = {
  invoice: {
    title: { x: 68, y: 40 },
    number: {
      label: { x: 541, y: 38 },
      value: { x: 543, y: 56 }
    },
    date: {
      label: { x: 538, y: 140 },
      value: { x: 522, y: 157 }
    },
    due: {
      label: { x: 530, y: 186 },
      value: { x: 522, y: 202 }
    }
  },
  client: {
    label: { x: 50, y: 144 },
    name: { x: 70, y: 174 },
    address: { x: 83, y: 195 }
  },
  logo: { x: 52, y: 672, width: 48, height: 42 },
  footer: {
    company: {
      name: { x: 90, y: 713 },
      website: { x: 77, y: 738 },
      email: { x: 89, y: 751 }
    },
    notes: {
      title: { x: 275, y: 711 },
      content: { x: 306, y: 751 }
    },
    terms: {
      title: { x: 444, y: 711 },
      content: { x: 438, y: 751 }
    }
  },
  totals: {
    subtotal: {
      label: { x: 399, y: 507 },
      value: { x: 539, y: 505 }
    },
    discount: {
      label: { x: 402, y: 534 },
      value: { x: 555, y: 533 }
    },
    tax: {
      label: { x: 388, y: 564 },
      value: { x: 555, y: 561 }
    },
    total: {
      label: { x: 389, y: 599 },
      value: { x: 533, y: 599 },
      box: { x: 466, y: 598, width: 200, height: 33 }
    }
  }
};
