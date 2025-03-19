
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
    highlight: [245, 250, 255] as [number, number, number], // Lighter blue #f5faff
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
    light: [230, 230, 230] as [number, number, number] // #e6e6e6
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
    y: 350, // Header Y position
  },
  columns: {
    description: {
      x: PAGE_CONFIG.margin.left,
      width: CONTENT_WIDTH * 0.45,
    },
    quantity: {
      x: 375,
    },
    price: {
      x: 450,
    },
    amount: {
      x: 525,
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
    x: 50,
    y: 780,
    width: 50,
    height: 50,
  },
  // Client info section
  client: {
    label: {
      x: 50,
      y: 120,
    },
    name: {
      x: 50,
      y: 150,
    },
    address: {
      x: 50,
      y: 175,
    }
  },
  // Invoice details section
  invoice: {
    title: {
      x: 50,
      y: 40,
    },
    number: {
      label: {
        x: 500, 
        y: 40,
      },
      value: {
        x: 520,
        y: 63,
      }
    },
    date: {
      label: {
        x: 450,
        y: 120,
      },
      value: {
        x: 450,
        y: 140,
      }
    },
    due: {
      label: {
        x: 450,
        y: 170,
      },
      value: {
        x: 450,
        y: 190,
      }
    }
  },
  // Totals section
  totals: {
    subtotal: {
      label: {
        x: 450,
        y: 660,
      },
      value: {
        x: 545,
        y: 660,
      }
    },
    discount: {
      label: {
        x: 450,
        y: 690,
      },
      value: {
        x: 545,
        y: 690,
      }
    },
    tax: {
      label: {
        x: 450,
        y: 720,
      },
      value: {
        x: 545,
        y: 720,
      }
    },
    total: {
      label: {
        x: 450,
        y: 760,
      },
      value: {
        x: 545,
        y: 760,
      },
      box: {
        x: 450,
        y: 740,
        width: 95,
        height: 35,
      }
    }
  },
  // Notes and terms section
  footer: {
    company: {
      name: {
        x: 110,
        y: 780,
      },
      website: {
        x: 110,
        y: 800,
      },
      email: {
        x: 110,
        y: 815,
      }
    },
    notes: {
      title: {
        x: 230,
        y: 780,
      },
      content: {
        x: 230,
        y: 800,
      }
    },
    terms: {
      title: {
        x: 390,
        y: 780,
      },
      content: {
        x: 390,
        y: 800,
      }
    }
  }
};
