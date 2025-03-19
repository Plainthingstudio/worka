
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
    highlight: [240, 247, 255] as [number, number, number], // #f0f7ff
    light: [255, 255, 255] as [number, number, number],
  },
  text: {
    dark: [25, 34, 41] as [number, number, number], // #192229
    body: [121, 137, 150] as [number, number, number], // #798996
    muted: [130, 135, 140] as [number, number, number], // #82878c
    black: [0, 0, 0] as [number, number, number],
  },
  line: {
    dark: [59, 130, 246] as [number, number, number], // #3b82f6
    light: [200, 200, 200] as [number, number, number]
  }
};

// Line width configurations
export const LINE_WIDTH = {
  thick: 0.5,
  thin: 0.1
};

// Table layout configurations for improved spacing
export const TABLE_CONFIG = {
  header: {
    y: 270, // Header Y position
  },
  columns: {
    description: {
      x: PAGE_CONFIG.margin.left,
      width: CONTENT_WIDTH * 0.45,
    },
    quantity: {
      x: 290,
    },
    price: {
      x: 408,
    },
    amount: {
      x: 538,
    }
  },
  row: {
    height: 40,
  }
};

// Invoice content block positions
export const INVOICE_BLOCKS = {
  // Company logo and info
  logo: {
    x: 52,
    y: 672,
    width: 48,
    height: 42,
  },
  // Client info section
  client: {
    label: {
      x: 50,
      y: 144,
    },
    name: {
      x: 70,
      y: 174,
    },
    address: {
      x: 83,
      y: 195,
    }
  },
  // Invoice details section
  invoice: {
    title: {
      x: 68,
      y: 40,
    },
    number: {
      label: {
        x: 541, 
        y: 38,
      },
      value: {
        x: 543,
        y: 56,
      }
    },
    date: {
      label: {
        x: 538,
        y: 140,
      },
      value: {
        x: 522,
        y: 157,
      }
    },
    due: {
      label: {
        x: 530,
        y: 186,
      },
      value: {
        x: 522,
        y: 202,
      }
    }
  },
  // Totals section
  totals: {
    subtotal: {
      label: {
        x: 399,
        y: 507,
      },
      value: {
        x: 539,
        y: 505,
      }
    },
    discount: {
      label: {
        x: 402,
        y: 534,
      },
      value: {
        x: 555,
        y: 533,
      }
    },
    tax: {
      label: {
        x: 388,
        y: 564,
      },
      value: {
        x: 555,
        y: 561,
      }
    },
    total: {
      label: {
        x: 389,
        y: 599,
      },
      value: {
        x: 533,
        y: 599,
      },
      box: {
        x: 466,
        y: 598,
        width: 200,
        height: 33,
      }
    }
  },
  // Notes and terms section
  footer: {
    company: {
      name: {
        x: 90,
        y: 713,
      },
      website: {
        x: 77,
        y: 738,
      },
      email: {
        x: 89,
        y: 751,
      }
    },
    notes: {
      title: {
        x: 275,
        y: 711,
      },
      content: {
        x: 306,
        y: 751,
      }
    },
    terms: {
      title: {
        x: 444,
        y: 711,
      },
      content: {
        x: 438,
        y: 751,
      }
    }
  }
};
